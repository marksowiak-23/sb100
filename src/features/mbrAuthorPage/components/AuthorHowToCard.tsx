/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  ChevronRight, 
  BookOpen, 
  MapPin, 
  Feather, 
  Bot, 
  Send, 
  EyeOff,
  ArrowRight
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { userManager } from '@/src/services/userManager';
import { taskApi } from '@/src/services/api';

interface AuthorHowToCardProps {
  className?: string;
}

interface StepItem {
  number: number;
  title: string;
  description: string;
  example?: string;
  icon: React.ReactNode;
  badgeBg: string;
  badgeText: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
}

export default function AuthorHowToCard({ className = '' }: AuthorHowToCardProps) {
  const [activeMbrId, setActiveMbrId] = useState<string | null>(() => {
    const mbr = userManager.getStoredMember();
    return mbr?.mbrId || null;
  });

  const [isHiddenByPref, setIsHiddenByPref] = useState<boolean>(() => {
    const mbr = userManager.getStoredMember();
    if (mbr?.mbrId) {
      try {
        const cached = sessionStorage.getItem(`sb_hide_howto_author_${mbr.mbrId}`);
        if (cached !== null) return JSON.parse(cached) === true;
      } catch {}
    }
    return false;
  });

  const [isOpen, setIsOpen] = useState(false);
  const [showHideConfirmDialog, setShowHideConfirmDialog] = useState<boolean>(false);
  const [isHidingCard, setIsHidingCard] = useState<boolean>(false);

  // Close modal on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showHideConfirmDialog) {
          setShowHideConfirmDialog(false);
        } else if (isOpen) {
          setIsOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, showHideConfirmDialog]);

  // Check preference from member record & listen for preference changes
  useEffect(() => {
    let isMounted = true;

    const checkAuthorHowToPref = async () => {
      try {
        let mbr = userManager.getStoredMember();
        let mbrId = mbr?.mbrId;

        if (!mbrId) {
          try {
            const u = await userManager.getCurrentUser();
            if (u.success && u.member?.mbrId) {
              mbr = u.member;
              mbrId = u.member.mbrId;
            } else if (u.user?.user_id) {
              mbr = await taskApi.getMemberByUserId(u.user.user_id);
              mbrId = mbr?.mbrId;
            }
          } catch {}
        }

        if (!mbrId) {
          const sandbox = sessionStorage.getItem('sandbox_mbr');
          if (sandbox) {
            try {
              const parsed = JSON.parse(sandbox);
              mbr = parsed;
              mbrId = parsed.mbrId;
            } catch {}
          }
        }

        if (!mbrId) return;

        if (isMounted) {
          setActiveMbrId(mbrId);
        }

        let preferences: any = null;
        try {
          preferences = await taskApi.getMemberPreferences(mbrId);
        } catch {}

        let parsedPrefJson: any = {};
        if (preferences?.mbrPrefJson) {
          try {
            parsedPrefJson = typeof preferences.mbrPrefJson === 'string' 
              ? JSON.parse(preferences.mbrPrefJson) 
              : preferences.mbrPrefJson;
          } catch {}
        }

        const isHidden = Boolean(parsedPrefJson?.hideHowToAuthorCard);
        sessionStorage.setItem(`sb_hide_howto_author_${mbrId}`, JSON.stringify(isHidden));

        if (isMounted) {
          setIsHiddenByPref(isHidden);
        }
      } catch (err) {
        console.warn('Could not check author howto preference:', err);
      }
    };

    checkAuthorHowToPref();

    const handleUserSwitched = () => {
      checkAuthorHowToPref();
    };
    window.addEventListener('user-switched', handleUserSwitched);

    const handlePreferencesChanged = (e: any) => {
      const detailMbrId = e?.detail?.mbrId;
      if (!activeMbrId || !detailMbrId || detailMbrId === activeMbrId) {
        if (e?.detail?.hideHowToAuthorCard !== undefined) {
          setIsHiddenByPref(Boolean(e.detail.hideHowToAuthorCard));
        }
      }
    };
    window.addEventListener('preferences-changed', handlePreferencesChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('user-switched', handleUserSwitched);
      window.removeEventListener('preferences-changed', handlePreferencesChanged);
    };
  }, [activeMbrId]);

  // Handle hiding the How-To card and updating member preferences in database
  const handleConfirmHideCard = async () => {
    setIsHidingCard(true);
    try {
      const mbrId = activeMbrId;
      if (mbrId) {
        let currentPref: any = null;
        try {
          currentPref = await taskApi.getMemberPreferences(mbrId);
        } catch {}

        let currentJsonObj: any = {};
        if (currentPref?.mbrPrefJson) {
          try {
            currentJsonObj = typeof currentPref.mbrPrefJson === 'string'
              ? JSON.parse(currentPref.mbrPrefJson)
              : currentPref.mbrPrefJson;
          } catch {}
        }
        currentJsonObj.hideHowToAuthorCard = true;

        const payload = {
          mbrId,
          chWriterId: currentPref?.chWriterId || null,
          mbrPrefTheme: currentPref?.mbrPrefTheme || 'System',
          mbrPrefNotificationsInd: currentPref?.mbrPrefNotificationsInd ?? true,
          mbrPrefAutoSaveInd: currentPref?.mbrPrefAutoSaveInd ?? true,
          mbrPrefJson: JSON.stringify(currentJsonObj)
        };

        sessionStorage.setItem(`sb_pref_json_${mbrId}`, JSON.stringify(currentJsonObj));
        sessionStorage.setItem(`sb_hide_howto_author_${mbrId}`, JSON.stringify(true));

        const isSandbox = !userManager.getToken();
        if (isSandbox) {
          sessionStorage.setItem('sandbox_mbr_preferences', JSON.stringify({ ...payload, mbrPrefId: currentPref?.mbrPrefId || 'sandbox-pref-id' }));
        } else {
          await taskApi.saveMemberPreferences(currentPref?.mbrPrefId || null, payload);
        }

        window.dispatchEvent(new CustomEvent('preferences-changed', {
          detail: {
            mbrId,
            hideHowToAuthorCard: true
          }
        }));
      }

      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } catch (err) {
      console.error('Failed to hide author howto card:', err);
      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } finally {
      setIsHidingCard(false);
    }
  };

  const steps: StepItem[] = [
    {
      number: 1,
      title: 'Choose your Topic from the Story Index',
      description: 'Select a category from the left navigation menu such as Family, Residencies, Activities & Hobbies, Achievements, Education, or Employment.',
      icon: <BookOpen className="w-4 h-4" />,
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-800',
      iconBg: 'bg-amber-500',
      iconColor: 'text-white',
      borderColor: 'border-amber-200'
    },
    {
      number: 2,
      title: 'Enter Topic information if applicable',
      description: 'Record topic details to build the foundation of your memories.',
      example: 'For example, you can record one or more Residencies that you have lived at.',
      icon: <MapPin className="w-4 h-4" />,
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-800',
      iconBg: 'bg-emerald-500',
      iconColor: 'text-white',
      borderColor: 'border-emerald-200'
    },
    {
      number: 3,
      title: 'Look for the Add Story button to open the Story Editor',
      description: 'Click the blue "New Story" or "Add Story" button on the panel to launch the dedicated Story Editor.',
      icon: <Feather className="w-4 h-4" />,
      badgeBg: 'bg-blue-100',
      badgeText: 'text-blue-800',
      iconBg: 'bg-blue-600',
      iconColor: 'text-white',
      borderColor: 'border-blue-200'
    },
    {
      number: 4,
      title: 'Partner with your StoryMate AI assistant to make story writing easy',
      description: 'Collaborate with your AI co-writer to brainstorm ideas, flesh out details, and transform quick notes into captivating chapters.',
      icon: <Bot className="w-4 h-4" />,
      badgeBg: 'bg-purple-100',
      badgeText: 'text-purple-800',
      iconBg: 'bg-purple-600',
      iconColor: 'text-white',
      borderColor: 'border-purple-200'
    },
    {
      number: 5,
      title: 'Publish your story (only people in your privacy groups will see the story)',
      description: 'Once you are satisfied with your draft, publish your chapter securely. Only members in your designated privacy groups will be able to read it.',
      icon: <Send className="w-4 h-4" />,
      badgeBg: 'bg-rose-100',
      badgeText: 'text-rose-800',
      iconBg: 'bg-rose-500',
      iconColor: 'text-white',
      borderColor: 'border-rose-200'
    }
  ];

  if (isHiddenByPref) {
    return null;
  }

  return (
    <>
      {/* --- THIN INITIAL HOW-TO CARD BANNER --- */}
      <div 
        onClick={() => setIsOpen(true)}
        className={`relative group bg-gradient-to-r from-amber-50/90 via-amber-50/40 to-slate-50/80 hover:from-amber-100/90 hover:via-amber-50 hover:to-slate-100/80 border border-amber-200/80 hover:border-amber-300 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none ${className}`}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(true);
          }
        }}
        title="Click to view How-To authoring instructions"
      >
        <div className="flex items-center justify-between gap-3">
          {/* Left Icon & Text */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500/10 border border-amber-300/50 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
            </div>

            <div className="flex items-center gap-2 min-w-0 flex-wrap sm:flex-nowrap">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200/70 text-amber-900 border border-amber-300/60 uppercase tracking-wider shrink-0">
                How-To
              </span>
              <p className="text-xs font-serif font-medium text-slate-800 truncate">
                <span className="font-bold text-slate-900">New to writing?</span> Learn how to create &amp; publish your story in 5 easy steps
              </p>
            </div>
          </div>

          {/* Right Action Buttons: Hide Eye & View Guide */}
          <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHideConfirmDialog(true);
              }}
              title="Hide How-To card from Author page"
              className="p-1 sm:px-2.5 sm:py-1 text-slate-500 hover:text-amber-900 hover:bg-amber-100/70 rounded-xl transition-all flex items-center gap-1 text-xs font-medium cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
              <span className="hidden sm:inline">Hide Card</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(true);
              }}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600 hover:bg-amber-700 active:scale-95 text-white text-[11px] font-sans font-bold rounded-xl shadow-2xs transition-all cursor-pointer"
            >
              <span>View Guide</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <AdminComponentTag name="AuthorHowToCard" />
      </div>

      {/* --- HOW-TO INSTRUCTIONS MODAL DIALOG --- */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-5 sm:p-6 space-y-5 my-auto animate-scale-in relative text-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0 shadow-xs">
                  <BookOpen className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 leading-tight">
                      How to Write &amp; Publish Stories
                    </h3>
                  </div>
                  <p className="text-xs text-slate-500 font-serif mt-0.5">
                    A simple 5-step guide to authoring your life stories in StoryBook
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Close guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 5 Steps Instruction List */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {steps.map((step) => (
                <div 
                  key={step.number}
                  className={`p-3.5 rounded-2xl border ${step.borderColor} bg-slate-50/60 hover:bg-white transition-all space-y-1.5`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-6 h-6 rounded-lg ${step.iconBg} ${step.iconColor} flex items-center justify-center shrink-0 shadow-xs text-xs font-bold`}>
                      {step.number}
                    </div>
                    <h4 className="font-serif font-bold text-sm text-slate-900">
                      {step.title}
                    </h4>
                  </div>

                  <p className="text-xs text-slate-600 font-serif leading-relaxed pl-8.5">
                    {step.description}
                  </p>

                  {step.example && (
                    <div className="ml-8.5 mt-1 px-2.5 py-1.5 bg-amber-50/80 border border-amber-200/70 rounded-xl text-[11px] text-amber-900 font-serif">
                      <span className="font-semibold">Example:</span> {step.example}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap sm:flex-nowrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-serif">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Need extra help? StoryMate AI is ready on every topic panel!</span>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <span>Got It, Let&apos;s Write!</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- HIDE CARD CONFIRMATION DIALOG MODAL --- */}
      {showHideConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900">
                    Hide How-To Authoring Card?
                  </h3>
                  <p className="text-xs text-slate-500 font-serif">
                    Remove this guide banner from your Author page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 font-serif leading-relaxed">
              Are you sure you want to hide the <strong>How-To Authoring Guide</strong> from your Author page?
            </p>

            <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 font-serif">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> You can easily re-enable this card at any time from the <strong>My Workspace preferences</strong> page under <strong>Display &amp; Card Preferences</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                disabled={isHidingCard}
                className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmHideCard}
                disabled={isHidingCard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>{isHidingCard ? 'Hiding...' : 'Hide Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { AuthorHowToCard as SbAuthorHowToCard };
