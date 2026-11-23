/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Lightbulb,
  Sparkles,
  X,
  ChevronRight,
  EyeOff,
  Loader2,
  Feather,
  ArrowRight
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { userManager } from '@/src/services/userManager';
import { taskApi, topicSparkApi, eventApi, TopicSpark } from '@/src/services/api';

interface StorySparkCardProps {
  topicId: string;
  topicTitle: string;
  isSandbox?: boolean;
  className?: string;
  onSelectIdea: (ideaQuestion: string, spark?: TopicSpark) => void;
}

const FALLBACK_TOPIC_IDEAS: Record<string, string[]> = {
  family: [
    'What was your favorite childhood tradition with your grandparents?',
    'How did your parents meet and what stories did they tell about their early years?',
    'What family meal or recipe always brings back the warmest memories?',
    'Describe a holiday gathering that everyone in your family still talks about.',
    'What life lesson from a parent or sibling stayed with you forever?'
  ],
  relationships: [
    'Who was a lifelong friend who changed the direction of your life?',
    'Tell the story of the day you met your spouse or partner.',
    'Who was a mentor or neighbor whose kindness you will never forget?',
    'Describe a friendship that stood the test of time and distance.'
  ],
  residencies: [
    'What is the most vivid memory of your first childhood home or neighborhood?',
    'What was the biggest adventure or transition when moving into a new town or home?',
    'Describe your favorite room or hiding spot in the house where you grew up.',
    'What sounds, smells, or sights immediately remind you of your hometown?'
  ],
  trips: [
    'What family road trip or vacation turned into an unforgettable adventure?',
    'Describe a place you visited that took your breath away the first time you saw it.',
    'What travel mishap ended up becoming one of your funniest stories?'
  ],
  health: [
    'Describe a moment when you overcame a physical or personal challenge and grew stronger.',
    'What daily habit, sport, or outdoor activity has brought you the most energy and joy?'
  ],
  'special events': [
    'Tell the story of a wedding, anniversary, or celebration you will cherish forever.',
    'What surprise party or unexpected milestone caught you completely off guard?'
  ],
  activities: [
    'What hobby or pastime did you fall in love with, and how did you get started?',
    'Describe a Saturday afternoon spent doing what you loved most.'
  ],
  achievements: [
    'What proud accomplishment or milestone took the most persistence and courage?',
    'Describe a moment when hard work finally paid off in a way you will never forget.'
  ],
  education: [
    'Who was the teacher or professor who made the biggest impact on your life?',
    'What is your favorite memory from high school, college, or graduation day?'
  ],
  employment: [
    'What was your very first job, and what did it teach you about life?',
    'Describe a proud career moment or a coworker who became a lifelong friend.'
  ],
  childhood: [
    'What games did you and your neighborhood friends play until the streetlights came on?',
    'What was your most prized toy, bicycle, or treasure growing up?'
  ],
  'life reflections': [
    'What advice would you give to your 20-year-old self today?',
    'Looking back, what small decision ended up making the biggest difference in your life?'
  ]
};

function getFallbackIdeasForTopic(topicTitle: string, batchOffset = 0): TopicSpark[] {
  const key = (topicTitle || '').toLowerCase();
  let matchedList: string[] | undefined;

  for (const [k, list] of Object.entries(FALLBACK_TOPIC_IDEAS)) {
    if (key.includes(k) || k.includes(key)) {
      matchedList = list;
      break;
    }
  }

  const topicLabel = topicTitle && topicTitle !== 'Section' ? topicTitle : 'this chapter of life';
  const generalPool = [
    `What is your most unforgettable memory related to ${topicLabel}?`,
    `Who played the biggest role in your ${topicLabel} journey, and why?`,
    `What turning point or surprise stands out most when you think about ${topicLabel}?`,
    `What funny or unexpected moment happened during your ${topicLabel} years?`,
    `Describe a small everyday detail from ${topicLabel} that you never want to forget.`,
    `What challenge in ${topicLabel} taught you the most about yourself?`,
    `If you could relive one single day connected to ${topicLabel}, which day would it be?`,
    `What sights, sounds, or music immediately transport you back to ${topicLabel}?`,
    `What proudest moment or quiet victory stands out from ${topicLabel}?`,
    `What lesson or legacy from ${topicLabel} would you love future generations to know?`
  ];

  const combined = [...(matchedList || []), ...generalPool];
  const unique = Array.from(new Set(combined));
  const rotated =
    batchOffset > 0
      ? [...unique.slice((batchOffset * 3) % unique.length), ...unique.slice(0, (batchOffset * 3) % unique.length)]
      : unique;

  return rotated.slice(0, 9).map((q, idx) => ({
    sparkId: `fallback_${batchOffset}_${idx}_${key.replace(/\s+/g, '_')}`,
    topicId: key || 'general',
    sparkQuestion: q
  }));
}

export default function StorySparkCard({
  topicId,
  topicTitle,
  isSandbox = false,
  className = '',
  onSelectIdea
}: StorySparkCardProps) {
  const [activeMbrId, setActiveMbrId] = useState<string | null>(() => {
    const mbr = userManager.getStoredMember();
    return mbr?.mbrId || null;
  });

  const [isHiddenByPref, setIsHiddenByPref] = useState<boolean>(() => {
    const mbr = userManager.getStoredMember();
    if (mbr?.mbrId) {
      try {
        const cached = sessionStorage.getItem(`sb_hide_story_spark_${mbr.mbrId}`);
        if (cached !== null) return JSON.parse(cached) === true;
      } catch {}
    }
    return false;
  });

  const [isIdeasModalOpen, setIsIdeasModalOpen] = useState(false);
  const [showHideConfirmDialog, setShowHideConfirmDialog] = useState(false);
  const [isHidingCard, setIsHidingCard] = useState(false);

  const [sparks, setSparks] = useState<TopicSpark[]>([]);
  const [loadingSparks, setLoadingSparks] = useState(false);
  const loadedTopicKeyRef = useRef<string | null>(null);
  const sparksRef = useRef<TopicSpark[]>([]);
  sparksRef.current = sparks;

  // Close modals on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showHideConfirmDialog) {
          setShowHideConfirmDialog(false);
        } else if (isIdeasModalOpen) {
          setIsIdeasModalOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isIdeasModalOpen, showHideConfirmDialog]);

  // Check hideStorySparkCard preference from member record & listen for preference changes
  useEffect(() => {
    let isMounted = true;

    const checkStorySparkPref = async () => {
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
        if (isSandbox || !userManager.getToken()) {
          const saved = sessionStorage.getItem('sandbox_mbr_preferences');
          if (saved) {
            try {
              preferences = JSON.parse(saved);
            } catch {}
          }
        } else {
          try {
            preferences = await taskApi.getMemberPreferences(mbrId);
          } catch {}
        }

        let parsedPrefJson: any = {};
        if (preferences?.mbrPrefJson) {
          try {
            parsedPrefJson =
              typeof preferences.mbrPrefJson === 'string'
                ? JSON.parse(preferences.mbrPrefJson)
                : preferences.mbrPrefJson;
          } catch {}
        }

        const isHidden = Boolean(parsedPrefJson?.hideStorySparkCard);
        sessionStorage.setItem(`sb_hide_story_spark_${mbrId}`, JSON.stringify(isHidden));

        if (isMounted) {
          setIsHiddenByPref(isHidden);
        }
      } catch (err) {
        console.warn('Could not check story spark preference:', err);
      }
    };

    checkStorySparkPref();

    const handleUserSwitched = () => {
      checkStorySparkPref();
    };
    window.addEventListener('user-switched', handleUserSwitched);

    const handlePreferencesChanged = (e: any) => {
      const detailMbrId = e?.detail?.mbrId;
      if (!activeMbrId || !detailMbrId || detailMbrId === activeMbrId) {
        if (e?.detail?.hideStorySparkCard !== undefined) {
          setIsHiddenByPref(Boolean(e.detail.hideStorySparkCard));
        }
      }
    };
    window.addEventListener('preferences-changed', handlePreferencesChanged);

    return () => {
      isMounted = false;
      window.removeEventListener('user-switched', handleUserSwitched);
      window.removeEventListener('preferences-changed', handlePreferencesChanged);
    };
  }, [activeMbrId, isSandbox]);

  // Reset cached ideas whenever the topic changes
  useEffect(() => {
    const topicKey = `${topicId || ''}|${topicTitle || ''}`;
    if (loadedTopicKeyRef.current !== topicKey) {
      loadedTopicKeyRef.current = null;
      setSparks([]);
    }
  }, [topicId, topicTitle]);

  // Fetch story ideas from the topicSpark table when the ideas modal opens
  useEffect(() => {
    if (!isIdeasModalOpen) return;
    const topicKey = `${topicId || ''}|${topicTitle || ''}`;
    if (loadedTopicKeyRef.current === topicKey && sparksRef.current.length > 0) {
      return;
    }

    let isCancelled = false;
    const loadTopicSparks = async () => {
      const displayTitle = topicTitle && topicTitle !== 'Section' ? topicTitle : 'Personal Memories';
      setLoadingSparks(true);
      try {
        let fetched: TopicSpark[] = [];
        const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(topicId || '');

        if (!isSandbox && isUuid) {
          try {
            fetched = await topicSparkApi.getTopicSparksByTopic(topicId);
          } catch (err) {
            console.warn('Could not fetch topicSpark records by topicId:', err);
          }
        }

        if (!isCancelled) {
          if (Array.isArray(fetched) && fetched.length > 0) {
            setSparks(fetched);
          } else {
            setSparks(getFallbackIdeasForTopic(displayTitle, 0));
          }
          loadedTopicKeyRef.current = topicKey;
        }
      } finally {
        if (!isCancelled) {
          setLoadingSparks(false);
        }
      }
    };

    loadTopicSparks();
    return () => {
      isCancelled = true;
    };
  }, [isIdeasModalOpen, topicId, topicTitle, isSandbox]);

  const handleChooseIdea = (spark: TopicSpark) => {
    setIsIdeasModalOpen(false);
    if (!isSandbox) {
      const actorId = activeMbrId || userManager.getStoredMember()?.mbrId || undefined;
      eventApi
        .logEvent({
          eventSiteCd: 'SB',
          eventActorId: actorId,
          eventActorTypeCd: 'MBR',
          eventCd: 'STORY_SPARK_IDEA_SELECT',
          eventDetail: `Member chose Story Spark idea "${spark.sparkTitle || spark.sparkQuestion}" in topic '${displayTopic}'`,
          eventTagValue: {
            sparkId: spark.sparkId,
            sparkTitle: spark.sparkTitle || null,
            sparkQuestion: spark.sparkQuestion,
            topicId,
            topicTitle: displayTopic,
            source: 'storySparkIdea'
          }
        })
        .catch((err) => console.warn('Could not log STORY_SPARK_IDEA_SELECT event:', err));
    }
    onSelectIdea(spark.sparkQuestion, spark);
  };

  // Persist hideStorySparkCard = true into mbrPreferences.mbrPrefJson
  const handleConfirmHideCard = async () => {
    setIsHidingCard(true);
    try {
      const mbrId = activeMbrId;
      if (mbrId) {
        let currentPref: any = null;
        if (isSandbox || !userManager.getToken()) {
          const saved = sessionStorage.getItem('sandbox_mbr_preferences');
          if (saved) {
            try {
              currentPref = JSON.parse(saved);
            } catch {}
          }
        } else {
          try {
            currentPref = await taskApi.getMemberPreferences(mbrId);
          } catch {}
        }

        let currentJsonObj: any = {};
        if (currentPref?.mbrPrefJson) {
          try {
            currentJsonObj =
              typeof currentPref.mbrPrefJson === 'string'
                ? JSON.parse(currentPref.mbrPrefJson)
                : currentPref.mbrPrefJson;
          } catch {}
        } else {
          const cachedJson = sessionStorage.getItem(`sb_pref_json_${mbrId}`);
          if (cachedJson) {
            try {
              currentJsonObj = JSON.parse(cachedJson);
            } catch {}
          }
        }
        currentJsonObj.hideStorySparkCard = true;

        const payload = {
          mbrId,
          chWriterId: currentPref?.chWriterId || null,
          mbrPrefTheme: currentPref?.mbrPrefTheme || 'System',
          mbrPrefNotificationsInd: currentPref?.mbrPrefNotificationsInd ?? true,
          mbrPrefAutoSaveInd: currentPref?.mbrPrefAutoSaveInd ?? true,
          mbrPrefJson: JSON.stringify(currentJsonObj)
        };

        sessionStorage.setItem(`sb_pref_json_${mbrId}`, JSON.stringify(currentJsonObj));
        sessionStorage.setItem(`sb_hide_story_spark_${mbrId}`, JSON.stringify(true));

        if (isSandbox || !userManager.getToken()) {
          sessionStorage.setItem(
            'sandbox_mbr_preferences',
            JSON.stringify({ ...payload, mbrPrefId: currentPref?.mbrPrefId || 'sandbox-pref-id' })
          );
        } else {
          await taskApi.saveMemberPreferences(currentPref?.mbrPrefId || null, payload);
        }

        window.dispatchEvent(
          new CustomEvent('preferences-changed', {
            detail: {
              mbrId,
              hideStorySparkCard: true
            }
          })
        );
      }

      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } catch (err) {
      console.error('Failed to hide story spark card:', err);
      setIsHiddenByPref(true);
      setShowHideConfirmDialog(false);
    } finally {
      setIsHidingCard(false);
    }
  };

  if (isHiddenByPref) {
    return null;
  }

  const displayTopic = topicTitle && topicTitle !== 'Section' ? topicTitle : 'this topic';

  return (
    <>
      {/* --- COMPACT 1-2 LINE STORY SPARK CARD BANNER --- */}
      <div
        onClick={() => setIsIdeasModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsIdeasModalOpen(true);
          }
        }}
        title={`Browse Story Spark writing ideas for ${displayTopic}`}
        className={`relative group bg-gradient-to-r from-indigo-50/90 via-amber-50/60 to-amber-50/90 dark:from-indigo-950/40 dark:via-slate-900 dark:to-amber-950/30 hover:from-indigo-100/80 hover:via-amber-50 hover:to-amber-100/80 border border-indigo-200/80 dark:border-indigo-800/60 hover:border-indigo-300 rounded-2xl px-3.5 py-2 sm:px-4 sm:py-2.5 shadow-2xs hover:shadow-xs transition-all cursor-pointer select-none ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
          {/* Left Icon & 1-2 Line Prompt */}
          <div className="flex items-start sm:items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-300/60 dark:border-amber-700/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 mt-0.5 sm:mt-0 group-hover:scale-105 transition-transform">
              <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>

            <div className="min-w-0 flex flex-col items-start gap-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-700/60 uppercase tracking-wider shrink-0">
                <Sparkles className="w-2.5 h-2.5" />
                Story Spark
              </span>
              <p className="text-xs font-serif font-medium text-slate-700 dark:text-slate-200 leading-snug">
                <span className="font-bold text-slate-900 dark:text-white">Need a writing idea for {displayTopic}?</span>{' '}
                Pick a spark prompt to launch a new story draft.
              </p>
            </div>
          </div>

          {/* Right Action Buttons: Hide Card & Story Ideas */}
          <div className="shrink-0 flex items-center justify-end gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHideConfirmDialog(true);
              }}
              title="Hide Story Spark card"
              className="px-2 py-1 sm:px-2.5 text-slate-500 hover:text-indigo-900 dark:text-slate-400 dark:hover:text-indigo-200 hover:bg-indigo-100/60 dark:hover:bg-slate-800 rounded-xl transition-all flex items-center gap-1 text-xs font-medium cursor-pointer whitespace-nowrap"
            >
              <EyeOff className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300" />
              <span>Hide Card</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsIdeasModalOpen(true);
              }}
              className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-[11px] font-sans font-bold rounded-xl shadow-2xs transition-all cursor-pointer whitespace-nowrap"
            >
              <Lightbulb className="w-3 h-3" />
              <span>Story Ideas</span>
              <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>

        <AdminComponentTag name="storySparkCard" />
      </div>

      {/* --- STORY SPARK IDEA SELECTION DIALOG BOX --- */}
      {isIdeasModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto"
          onClick={() => setIsIdeasModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full p-5 sm:p-6 space-y-4 my-auto animate-scale-in relative text-slate-900 dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-100 to-indigo-100 dark:from-amber-900/40 dark:to-indigo-900/40 border border-amber-200/80 dark:border-indigo-700/60 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0 shadow-xs">
                  <Lightbulb className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                    Story Spark Ideas: {displayTopic}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-serif mt-0.5">
                    Select any prompt below to immediately start a new story draft in the Story Editor.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsIdeasModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Story Ideas List (Scrollable after ~5 rows) */}
            <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
              {loadingSparks ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                  <span className="text-xs font-serif">Loading story ideas for {displayTopic}...</span>
                </div>
              ) : sparks.length === 0 ? (
                <div className="py-10 text-center space-y-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    No story ideas available for this topic yet.
                  </p>
                </div>
              ) : (
                sparks.map((spark, index) => (
                  <button
                    key={spark.sparkId || index}
                    type="button"
                    onClick={() => handleChooseIdea(spark)}
                    className="w-full text-left group/idea p-3.5 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/30 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-start justify-between gap-3 cursor-pointer"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-100/80 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5 text-[11px] font-bold">
                        {index + 1}
                      </div>
                      <p className="font-serif text-xs sm:text-sm font-medium text-slate-800 dark:text-slate-100 group-hover/idea:text-indigo-900 dark:group-hover/idea:text-indigo-200 leading-relaxed">
                        {spark.sparkQuestion}
                      </p>
                    </div>

                    <span className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-700/60 group-hover/idea:bg-indigo-600 group-hover/idea:text-white group-hover/idea:border-indigo-600 transition-colors mt-0.5">
                      <Feather className="w-3 h-3" />
                      <span>Write</span>
                      <ArrowRight className="w-3 h-3" />
                    </span>
                  </button>
                ))
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400 font-serif">
                {sparks.length} {sparks.length === 1 ? 'idea' : 'ideas'} available for {displayTopic}
              </span>
              <button
                type="button"
                onClick={() => setIsIdeasModalOpen(false)}
                className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <AdminComponentTag name="storySparkIdea" />
          </div>
        </div>
      )}

      {/* --- HIDE CARD CONFIRMATION DIALOG MODAL --- */}
      {showHideConfirmDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowHideConfirmDialog(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 space-y-5 animate-scale-in relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white">
                    Hide Story Spark Card?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                    Remove this writing ideas banner above the Story Editor
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300 font-serif leading-relaxed">
              Are you sure you want to hide the <strong>Story Spark Card</strong> above the Story Editor?
            </p>

            <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-serif">
              <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Note:</strong> You can reactivate this card at any time via <strong>My Preferences</strong> (<code>mbrPreferences</code>) under <strong>Workspace &amp; UI Preferences → Display &amp; Card Preferences</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowHideConfirmDialog(false)}
                disabled={isHidingCard}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmHideCard}
                disabled={isHidingCard}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
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

export { StorySparkCard as storySparkCard };
