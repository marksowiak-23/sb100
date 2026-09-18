/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Rocket, 
  Sparkles, 
  User, 
  Bot, 
  Feather, 
  Send, 
  Users, 
  CheckCircle2, 
  Circle, 
  ChevronRight, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  PartyPopper,
  EyeOff,
  X
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { userManager } from '@/src/services/userManager';
import { taskApi } from '@/src/services/api';

interface SbGettingStartedCardProps {
  onNavigate?: (tab: string) => void;
  onClickAuthorPage?: (initialPrompt?: string) => void;
}

interface StepItem {
  id: number;
  title: string;
  tagline: string;
  description: string;
  actionLabel: string;
  targetTab: string;
  icon: React.ReactNode;
  badgeColor: string;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
  iconColor: string;
}

export default function SbGettingStartedCard({ onNavigate, onClickAuthorPage }: SbGettingStartedCardProps) {
  const [activeMbrId, setActiveMbrId] = useState<string | null>(() => {
    const mbr = userManager.getStoredMember();
    return mbr?.mbrId || null;
  });

  const [isHiddenByPref, setIsHiddenByPref] = useState<boolean>(() => {
    const mbr = userManager.getStoredMember();
    if (mbr?.mbrId) {
      try {
        const cached = sessionStorage.getItem(`sb_hide_getting_started_${mbr.mbrId}`);
        if (cached !== null) return JSON.parse(cached) === true;
      } catch {}
    }
    return false;
  });

  const [showHideConfirmDialog, setShowHideConfirmDialog] = useState<boolean>(false);
  const [isHidingCard, setIsHidingCard] = useState<boolean>(false);

  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [collapsedStepIds, setCollapsedStepIds] = useState<number[]>([]);
  const [activeStepHover, setActiveStepHover] = useState<number | null>(null);

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
        currentJsonObj.hideGettingStartedCard = true;

        const payload = {
          mbrId,
          chWriterId: currentPref?.chWriterId || null,
          mbrPrefTheme: currentPref?.mbrPrefTheme || 'System',
          mbrPrefNotificationsInd: currentPref?.mbrPrefNotificationsInd ?? true,
          mbrPrefAutoSaveInd: currentPref?.mbrPrefAutoSaveInd ?? true,
          mbrPrefJson: JSON.stringify(currentJsonObj)
        };

        sessionStorage.setItem(`sb_pref_json_${mbrId}`, JSON.stringify(currentJsonObj));
        sessionStorage.setItem(`sb_hide_getting_started_${mbrId}`, JSON.stringify(true));

        const isSandbox = !userManager.getToken();
        if (isSandbox) {
          sessionStorage.setItem('sandbox_mbr_preferences', JSON.stringify({ ...payload, mbrPrefId: currentPref?.mbrPrefId || 'sandbox-pref-id' }));
        } else {
          await taskApi.saveMemberPreferences(currentPref?.mbrPrefId || null, payload);
        }

        window.dispatchEvent(new CustomEvent('preferences-changed', {
          detail: {
            mbrId,
            hideGettingStartedCard: true
          }
        }));
      }

      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } catch (err) {
      console.error('Failed to hide getting started card:', err);
      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } finally {
      setIsHidingCard(false);
    }
  };

  // Sync completed steps to member-scoped localStorage
  useEffect(() => {
    if (!activeMbrId || isHiddenByPref) return;
    try {
      localStorage.setItem(`sb_getting_started_completed_${activeMbrId}`, JSON.stringify(completedSteps));
    } catch (e) {
      console.warn('Could not save getting started progress:', e);
    }
  }, [completedSteps, activeMbrId, isHiddenByPref]);

  // Sync collapsed state to member-scoped localStorage
  useEffect(() => {
    if (!activeMbrId || isHiddenByPref) return;
    try {
      localStorage.setItem(`sb_getting_started_collapsed_${activeMbrId}`, JSON.stringify(isCollapsed));
    } catch (e) {
      console.warn('Could not save collapsed state:', e);
    }
  }, [isCollapsed, activeMbrId, isHiddenByPref]);

  // Sync individual steps collapsed state to member-scoped localStorage
  useEffect(() => {
    if (!activeMbrId || isHiddenByPref) return;
    try {
      localStorage.setItem(`sb_getting_started_steps_collapsed_${activeMbrId}`, JSON.stringify(collapsedStepIds));
    } catch (e) {
      console.warn('Could not save collapsed steps state:', e);
    }
  }, [collapsedStepIds, activeMbrId, isHiddenByPref]);

  // Auto-detect completed steps based strictly on the logged-in member's actual data upon loading
  useEffect(() => {
    let isMounted = true;

    // Clean up any legacy un-scoped storage keys that leaked across members
    try {
      localStorage.removeItem('sb_getting_started_completed');
      localStorage.removeItem('sb_getting_started_collapsed');
      localStorage.removeItem('sb_getting_started_steps_collapsed');
    } catch {}

    const checkOnboardingProgress = async () => {
      try {
        // 1. Resolve active member
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
          } catch {
            // fallback
          }
        }

        if (!mbrId) {
          const sandbox = sessionStorage.getItem('sandbox_mbr');
          if (sandbox) {
            try {
              const parsed = JSON.parse(sandbox);
              mbr = parsed;
              mbrId = parsed.mbrId;
            } catch {
              // ignore
            }
          }
        }

        if (!mbrId) {
          if (isMounted) {
            setCompletedSteps([]);
            setCollapsedStepIds([]);
            setIsCollapsed(false);
          }
          return;
        }

        if (isMounted) {
          setActiveMbrId(mbrId);
        }

        // Check member preferences first - if user chose to hide getting started card, do not process or display
        let preferences: any = null;
        try {
          preferences = await taskApi.getMemberPreferences(mbrId);
        } catch {}

        let parsedPrefJson: any = {};
        if (preferences?.mbrPrefJson) {
          try {
            parsedPrefJson = typeof preferences.mbrPrefJson === 'string' ? JSON.parse(preferences.mbrPrefJson) : preferences.mbrPrefJson;
          } catch {}
        }

        const isHidden = Boolean(parsedPrefJson?.hideGettingStartedCard);
        sessionStorage.setItem(`sb_hide_getting_started_${mbrId}`, JSON.stringify(isHidden));

        if (isHidden) {
          if (isMounted) {
            setIsHiddenByPref(true);
          }
          return; // Do not query other endpoints or process onboarding steps
        }

        if (isMounted) {
          setIsHiddenByPref(false);
        }

        // 2. Query member profile, residences, stories, and connections in parallel
        const [
          profileRes,
          residencesRes,
          storiesRes,
          connectionsRes
        ] = await Promise.allSettled([
          taskApi.getMemberById(mbrId),
          taskApi.getResidences(mbrId),
          taskApi.getStories(mbrId),
          taskApi.getMemberConnections({ mbrId })
        ]);

        const fullMbr = profileRes.status === 'fulfilled' && profileRes.value ? profileRes.value : mbr;
        const residences = residencesRes.status === 'fulfilled' && Array.isArray(residencesRes.value) ? residencesRes.value : [];
        const stories = storiesRes.status === 'fulfilled' && Array.isArray(storiesRes.value) ? storiesRes.value : [];
        const connections = connectionsRes.status === 'fulfilled' && Array.isArray(connectionsRes.value) ? connectionsRes.value : [];

        const autoDone: number[] = [];

        // Step 1: Member has updated their profile (added an image, updated demographics, background, or places lived)
        // Note: Initial registration sets firstName, lastName, birthDate, and genderCd.
        // Completed profile requires adding a photo, updating demographics (relationship status, middle name),
        // adding background (intro, work, study, from city), or places lived (residences, current city).
        const hasImage = Boolean(fullMbr?.mbrProfilePic && fullMbr.mbrProfilePic.trim() !== '');
        const hasUpdatedDemographics = Boolean(
          (fullMbr?.mbrRelationshipStatusCd && fullMbr.mbrRelationshipStatusCd.trim() !== '') ||
          (fullMbr?.mbrMiddleName && fullMbr.mbrMiddleName.trim() !== '')
        );
        const hasBackground = Boolean(
          (fullMbr?.mbrIntroduction && fullMbr.mbrIntroduction.trim() !== '') ||
          (fullMbr?.mbrWorkAt && fullMbr.mbrWorkAt.trim() !== '') ||
          (fullMbr?.mbrStudiedAt && fullMbr.mbrStudiedAt.trim() !== '') ||
          (fullMbr?.mbrFromCityState && fullMbr.mbrFromCityState.trim() !== '')
        );
        const hasPlacesLived = Boolean(
          (residences && residences.length > 0) ||
          (fullMbr?.mbrLivesCityState && fullMbr.mbrLivesCityState.trim() !== '')
        );

        if (hasImage || hasUpdatedDemographics || hasBackground || hasPlacesLived) {
          autoDone.push(1);
        }

        // Step 2: Member has chosen a StoryMate persona
        // Default system preferences created at registration have identical created & updated timestamps.
        // A member has chosen a persona if they actively updated preferences or if member record explicitly sets one.
        const hasChosenPersona = Boolean(
          (preferences &&
            preferences.chWriterId &&
            preferences.mbrPrefUpdatedAt &&
            preferences.mbrPrefCreatedAt &&
            preferences.mbrPrefUpdatedAt !== preferences.mbrPrefCreatedAt) ||
          Boolean(fullMbr?.chWriterId)
        );
        if (hasChosenPersona) {
          autoDone.push(2);
        }

        // Step 3: Draft Your First Story
        // Look to see if they have any stories in draft or published mode
        const hasAnyStories = Boolean(stories && stories.length > 0);
        if (hasAnyStories) {
          autoDone.push(3);
        }

        // Step 4: Publish Your Story
        const hasPublishedStories = Boolean(stories && stories.some((s: any) =>
          s.mbrStoryPublishStatusCd?.toLowerCase() === 'published' ||
          s.mbrStoryPublishStatusCd?.toLowerCase() === 'publish'
        ));
        if (hasPublishedStories) {
          autoDone.push(4);
        }

        // Step 5: Member has made any connections
        if (connections && connections.length > 0) {
          autoDone.push(5);
        }

        if (isMounted) {
          // Load any member-specific manual checkmarks
          let manualSaved: number[] = [];
          try {
            const raw = localStorage.getItem(`sb_getting_started_completed_${mbrId}`);
            if (raw) manualSaved = JSON.parse(raw);
          } catch {}

          const finalCompleted = Array.from(new Set([...manualSaved, ...autoDone]));
          setCompletedSteps(finalCompleted);

          // Collapse any step that has been completed
          setCollapsedStepIds(finalCompleted);

          // Collapse the entire card if all steps are complete
          if (finalCompleted.length === 5) {
            setIsCollapsed(true);
          } else {
            // Check member-specific collapsed preference
            try {
              const savedCollapsed = localStorage.getItem(`sb_getting_started_collapsed_${mbrId}`);
              if (savedCollapsed !== null) {
                setIsCollapsed(JSON.parse(savedCollapsed));
              } else {
                setIsCollapsed(false);
              }
            } catch {
              setIsCollapsed(false);
            }
          }
        }
      } catch (err) {
        console.warn('Could not auto-check onboarding progress:', err);
      }
    };

    checkOnboardingProgress();

    const handleUserSwitched = () => {
      checkOnboardingProgress();
    };
    window.addEventListener('user-switched', handleUserSwitched);

    const handlePreferencesChanged = (e: any) => {
      const detailMbrId = e?.detail?.mbrId;
      if (!activeMbrId || !detailMbrId || detailMbrId === activeMbrId) {
        if (e?.detail?.hideGettingStartedCard !== undefined) {
          setIsHiddenByPref(Boolean(e.detail.hideGettingStartedCard));
          if (!e.detail.hideGettingStartedCard) {
            checkOnboardingProgress();
          }
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

  const toggleStepCompleted = (stepId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedSteps(prev => {
      const isNowDone = !prev.includes(stepId);
      const updated = isNowDone ? [...prev, stepId] : prev.filter(id => id !== stepId);
      if (isNowDone) {
        setCollapsedStepIds(curr => curr.includes(stepId) ? curr : [...curr, stepId]);
      }
      if (updated.length === 5) {
        setIsCollapsed(true);
      }
      if (activeMbrId) {
        try {
          localStorage.setItem(`sb_getting_started_completed_${activeMbrId}`, JSON.stringify(updated));
        } catch {}
      }
      return updated;
    });
  };

  const toggleStepCollapsed = (stepId: number) => {
    setCollapsedStepIds(prev =>
      prev.includes(stepId) ? prev.filter(id => id !== stepId) : [...prev, stepId]
    );
  };

  const handleExpandAllSteps = () => setCollapsedStepIds([]);
  const handleCollapseAllSteps = () => setCollapsedStepIds(steps.map(s => s.id));

  const handleResetChecklist = () => {
    setCompletedSteps([]);
    setCollapsedStepIds([]);
    setIsCollapsed(false);
    if (activeMbrId) {
      try {
        localStorage.removeItem(`sb_getting_started_completed_${activeMbrId}`);
        localStorage.removeItem(`sb_getting_started_collapsed_${activeMbrId}`);
        localStorage.removeItem(`sb_getting_started_steps_collapsed_${activeMbrId}`);
      } catch {}
    }
  };

  const handleActionClick = (targetTab: string) => {
    if (targetTab === 'mbrAuthorPage' && onClickAuthorPage) {
      onClickAuthorPage();
      return;
    }
    if (onNavigate) {
      onNavigate(targetTab);
    }
  };

  const steps: StepItem[] = [
    {
      id: 1,
      title: 'Complete Your Profile',
      tagline: 'Set your story foundation',
      description: 'Fill in your hometown, places you have lived, schools attended, and career milestones. These details empower StoryBook to weave rich nostalgic trivia and personalized story suggestions.',
      actionLabel: 'Update Profile',
      targetTab: 'mbrProfilePage',
      icon: <User className="w-4 h-4" />,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      bgGradient: 'from-emerald-50/50 to-transparent',
      borderColor: 'border-emerald-100 hover:border-emerald-300',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700'
    },
    {
      id: 2,
      title: 'Choose Your StoryMate AI',
      tagline: 'Meet your co-writing companion',
      description: 'Select your preferred AI co-writer persona (such as Everyday Eddie, Empathetic Cassie, or Poetic Oliver) and customize your storytelling style and tone.',
      actionLabel: 'My Preferences',
      targetTab: 'mbrPreferencesPage',
      icon: <Bot className="w-4 h-4" />,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      bgGradient: 'from-purple-50/50 to-transparent',
      borderColor: 'border-purple-100 hover:border-purple-300',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700'
    },
    {
      id: 3,
      title: 'Draft Your First Story',
      tagline: 'Turn memories into literature',
      description: 'Choose a topic (Family, Residencies, Education, Employment, or Achievements) and chat with your StoryMate to effortlessly transform quick memories into captivating story chapters.',
      actionLabel: 'Author Studio',
      targetTab: 'mbrAuthorPage',
      icon: <Feather className="w-4 h-4" />,
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      bgGradient: 'from-blue-50/50 to-transparent',
      borderColor: 'border-blue-100 hover:border-blue-300',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700'
    },
    {
      id: 4,
      title: 'Publish Your Story',
      tagline: 'Preserve your family legacy',
      description: 'Review your story drafts, attach cherished heirloom photos, set viewing privacy for topic groups, and publish your chapter to your personal StoryBook.',
      actionLabel: 'Author Studio',
      targetTab: 'mbrAuthorPage',
      icon: <Send className="w-4 h-4" />,
      badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
      bgGradient: 'from-amber-50/50 to-transparent',
      borderColor: 'border-amber-100 hover:border-amber-300',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-800'
    },
    {
      id: 5,
      title: 'Invite Family & Friends',
      tagline: 'Share and discover together',
      description: 'Build your private network by inviting friends and family. Organize connections into groups (Family, Friends, Colleagues) to share stories securely and read their published journeys.',
      actionLabel: 'My Connections',
      targetTab: 'mbrConnectionPage',
      icon: <Users className="w-4 h-4" />,
      badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
      bgGradient: 'from-rose-50/50 to-transparent',
      borderColor: 'border-rose-100 hover:border-rose-300',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700'
    }
  ];

  const progressPercent = Math.round((completedSteps.length / steps.length) * 100);
  const isAllCompleted = completedSteps.length === steps.length;

  if (isHiddenByPref) {
    return null;
  }

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top Signature Gold & Amber Gradient Accent */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

      <div className="p-5 md:p-6 space-y-5">
        {/* Card Header */}
        <div className="space-y-2">
          {/* Top Meta Row: Badge & Header Actions */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                <Rocket className="w-3.5 h-3.5 text-amber-600 animate-bounce" />
                Getting Started Guide
              </span>
              
              {isAllCompleted ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  <PartyPopper className="w-3.5 h-3.5 text-emerald-600" /> All 5 Done!
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500">
                  {completedSteps.length} of 5 Completed
                </span>
              )}
            </div>

            {/* Header Action Buttons: Hide Card & Collapse / Expand */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(true)}
                title="Hide Getting Started card from Home page"
                className="px-2.5 py-1 text-slate-500 hover:text-amber-800 hover:bg-amber-50/80 rounded-xl transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                <span>Hide Card</span>
              </button>

              <button
                type="button"
                onClick={() => setIsCollapsed(prev => !prev)}
                title={isCollapsed ? 'Expand Getting Started steps' : 'Collapse Getting Started steps'}
                className="p-1 sm:px-2.5 sm:py-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              >
                <span className="hidden sm:inline">{isCollapsed ? 'Show Steps' : 'Collapse Steps'}</span>
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Heading & Full-Width Subtitle */}
          <div className="space-y-1">
            <h3 className="font-serif text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
              Welcome to StoryBook! Let&apos;s Get You Started
            </h3>
            <p className="text-xs md:text-sm text-slate-600 font-serif leading-relaxed">
              Follow these five simple steps to bring your life story to life and start sharing cherished memories with the people you love.
            </p>
          </div>
        </div>

        {/* Visual Progress Bar & Accordion Quick Controls */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <span>Onboarding Progress</span>
              <span className="font-semibold text-slate-700">{progressPercent}%</span>
            </div>

            {!isCollapsed && (
              <div className="flex items-center gap-2 text-xs">
                {collapsedStepIds.length > 0 ? (
                  <button
                    type="button"
                    onClick={handleExpandAllSteps}
                    className="text-amber-700 hover:text-amber-900 font-medium hover:underline transition-colors"
                  >
                    Expand All Steps
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleCollapseAllSteps}
                    className="text-slate-500 hover:text-slate-700 font-medium hover:underline transition-colors"
                  >
                    Collapse All Steps
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 rounded-full ${
                isAllCompleted 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                  : 'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Steps List (Collapsible Accordion) */}
        {!isCollapsed && (
          <div className="space-y-2.5 pt-1">
            {steps.map((step) => {
              const isDone = completedSteps.includes(step.id);
              const isStepCollapsed = collapsedStepIds.includes(step.id);

              return (
                <div
                  key={step.id}
                  onMouseEnter={() => setActiveStepHover(step.id)}
                  onMouseLeave={() => setActiveStepHover(null)}
                  className={`group relative rounded-xl border transition-all duration-200 overflow-hidden ${
                    isDone 
                      ? 'bg-slate-50/80 border-slate-200/80 opacity-90' 
                      : `bg-gradient-to-r ${step.bgGradient} bg-white ${step.borderColor} shadow-xs hover:shadow-sm`
                  } ${isStepCollapsed ? 'p-3 md:p-3.5' : 'p-4'}`}
                >
                  {/* Step Accordion Header */}
                  <div className="flex items-center gap-3">
                    {/* Checkbox Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleStepCompleted(step.id, e)}
                      title={isDone ? 'Mark step as incomplete' : 'Mark step as completed'}
                      className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0 focus:outline-hidden"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-300 group-hover:text-slate-400" />
                      )}
                    </button>

                    {/* Clickable Header Trigger to Toggle Accordion (Shows Title) */}
                    <div
                      onClick={() => toggleStepCollapsed(step.id)}
                      className="flex-1 flex items-center justify-between gap-3 cursor-pointer select-none min-w-0"
                    >
                      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-nowrap flex-1">
                        <div className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md sm:rounded-lg flex items-center justify-center shrink-0 ${step.iconBg} ${step.iconColor}`}>
                          {step.icon}
                        </div>
                        <span className={`inline-flex items-center gap-1 px-1.5 sm:px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border shrink-0 ${step.badgeColor}`}>
                          Step {step.id}
                        </span>
                        <h4 className={`font-serif font-bold text-[13px] sm:text-sm md:text-base min-w-0 truncate sm:whitespace-normal ${isDone ? 'line-through text-slate-500' : 'text-slate-900 group-hover:text-amber-900'}`}>
                          {step.title}
                        </h4>
                        <span className="text-xs text-slate-400 font-serif hidden xl:inline truncate max-w-[220px]">
                          · {step.tagline}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          title={isStepCollapsed ? 'Expand step details' : 'Collapse step'}
                          className="p-1 rounded-lg text-slate-400 group-hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isStepCollapsed ? '' : 'rotate-180 text-slate-600'}`} />
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Accordion Collapsible Body */}
                  {!isStepCollapsed && (
                    <div className="mt-3 pt-3 border-t border-slate-100/90 flex items-start justify-between gap-4 flex-wrap sm:flex-nowrap pl-8 sm:pl-10 animate-fade-in">
                      <div className="space-y-1 min-w-0 flex-1">
                        <p className="text-xs md:text-sm text-slate-600 font-serif leading-relaxed">
                          {step.description}
                        </p>
                      </div>

                      <div className="shrink-0 self-center sm:self-start">
                        <button
                          type="button"
                          onClick={() => handleActionClick(step.targetTab)}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs transition-all ${
                            isDone
                              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                              : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-xs'
                          }`}
                        >
                          <span>{step.actionLabel}</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Quick Tip */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500 font-serif flex-wrap">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span><strong>Pro Tip:</strong> You can click any step button to jump directly to that page!</span>
          </div>
        </div>
      </div>

      <AdminComponentTag name="SbGettingStartedCard" />

      {/* Hide Card Confirmation Dialog Modal */}
      {showHideConfirmDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Hide Getting Started Card?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                    Remove this checklist from your Home page
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
              Are you sure you want to hide the <strong>Getting Started Guide</strong> from your Home page?
            </p>

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-serif">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> You can easily re-enable this card at any time from the <strong>My Preferences</strong> menu under <strong>My Workspace</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                disabled={isHidingCard}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
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
    </div>
  );
}
