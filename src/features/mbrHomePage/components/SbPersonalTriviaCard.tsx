/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Bookmark, BookmarkCheck, Feather, History, MapPin, GraduationCap, Briefcase, Award, Compass, Clock, X, ChevronRight } from 'lucide-react';
import { mbrPersonalTriviaApi, MbrPersonalTrivia } from '@/src/services/api';
import { userManager } from '@/src/services/userManager';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbPersonalTriviaCardProps {
  onClickAuthorPage?: (initialPrompt?: string) => void;
}

export default function SbPersonalTriviaCard({ onClickAuthorPage }: SbPersonalTriviaCardProps) {
  const [trivia, setTrivia] = useState<MbrPersonalTrivia | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [historyItems, setHistoryItems] = useState<MbrPersonalTrivia[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [activeMbrId, setActiveMbrId] = useState<string | null>(null);

  // Determine active member ID on mount
  useEffect(() => {
    const resolveMemberId = async () => {
      const storedMbr = userManager.getStoredMember();
      if (storedMbr?.mbrId) {
        setActiveMbrId(storedMbr.mbrId);
        return;
      }
      // Fallback: check session user
      try {
        const res = await userManager.getCurrentUser();
        if (res.success && res.member?.mbrId) {
          setActiveMbrId(res.member.mbrId);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }
    };

    resolveMemberId();
  }, []);

  // Load today's or latest daily trivia once activeMbrId is known
  useEffect(() => {
    if (!activeMbrId) return;

    let isMounted = true;
    const fetchTrivia = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await mbrPersonalTriviaApi.getDailyTrivia(activeMbrId);
        if (isMounted) {
          setTrivia(data);
        }
      } catch (err: any) {
        console.warn('Could not load daily trivia:', err);
        if (isMounted) {
          setError('Unable to load personalized trivia.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTrivia();
    return () => {
      isMounted = false;
    };
  }, [activeMbrId]);

  // Handle on-demand generation ("Surprise Me")
  const handleGenerateNew = async () => {
    if (!activeMbrId || generating) return;
    try {
      setGenerating(true);
      setError(null);
      const newTrivia = await mbrPersonalTriviaApi.generateNewTrivia(activeMbrId);
      setTrivia(newTrivia);
    } catch (err: any) {
      console.error('Failed to generate new trivia:', err);
      setError('Could not generate a new fact right now. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    if (!trivia) return;
    try {
      const updated = await mbrPersonalTriviaApi.toggleTriviaFavorite(trivia.mbrTriviaId);
      setTrivia(updated);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
    }
  };

  // Open history modal and fetch past trivia
  const handleOpenHistory = async () => {
    setShowHistoryModal(true);
    if (!activeMbrId) return;
    try {
      setLoadingHistory(true);
      const items = await mbrPersonalTriviaApi.getTriviaHistory(activeMbrId, { limit: 30 });
      setHistoryItems(items);
    } catch (err) {
      console.error('Failed to fetch trivia history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };


  const getTopicIcon = (topic?: string) => {
    switch ((topic || '').toUpperCase()) {
      case 'EDUCATION':
        return <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />;
      case 'RESIDENCE':
        return <MapPin className="w-3.5 h-3.5 text-emerald-500" />;
      case 'EMPLOYMENT':
        return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
      case 'ACHIEVEMENT':
        return <Award className="w-3.5 h-3.5 text-amber-500" />;
      case 'ACTIVITY':
        return <Compass className="w-3.5 h-3.5 text-purple-500" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-amber-500" />;
    }
  };

  const getTopicBadgeLabel = (topic?: string) => {
    switch ((topic || '').toUpperCase()) {
      case 'EDUCATION':
        return 'Campus Flashback';
      case 'RESIDENCE':
        return 'Hometown & Places';
      case 'EMPLOYMENT':
        return 'Career & Industry';
      case 'ACHIEVEMENT':
        return 'Milestone Spotlight';
      case 'ACTIVITY':
        return 'Life & Activities';
      default:
        return 'Era & Nostalgia';
    }
  };

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      {/* Top Accent Gradient Header Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500" />

      <div className="p-5 md:p-6 space-y-4">
        {/* Header Section with Badges and History Button */}
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/70">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              Did You Know?
            </span>

            {trivia && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                {getTopicIcon(trivia.anchorTopic)}
                {getTopicBadgeLabel(trivia.anchorTopic)}
              </span>
            )}

            {trivia?.anchorReference && (
              <span className="text-xs text-slate-500 font-medium truncate max-w-[200px] md:max-w-xs" title={trivia.anchorReference}>
                · {trivia.anchorReference}
              </span>
            )}
          </div>

          {/* Quick Action Icons: Favorite, History */}
          <div className="flex items-center gap-1">
            {trivia && (
              <button
                onClick={handleToggleFavorite}
                title={trivia.isFavorite ? 'Remove from Saved' : 'Save to Favorites'}
                className={`p-1.5 rounded-lg transition-colors ${
                  trivia.isFavorite
                    ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                }`}
              >
                {trivia.isFavorite ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
              </button>
            )}

            <button
              onClick={handleOpenHistory}
              title="Past Discoveries"
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
            >
              <History className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">History</span>
            </button>
          </div>
        </div>

        {/* Body Section */}
        {loading ? (
          <div className="py-8 space-y-3 animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-3/4"></div>
            <div className="h-4 bg-slate-100 rounded w-full"></div>
            <div className="h-4 bg-slate-100 rounded w-5/6"></div>
          </div>
        ) : error && !trivia ? (
          <div className="py-6 text-center space-y-2">
            <p className="text-sm text-slate-500">{error}</p>
            <button
              onClick={handleGenerateNew}
              disabled={generating}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
              Generate Fact
            </button>
          </div>
        ) : trivia ? (
          <div className="space-y-3.5">
            {/* Headline */}
            <h3 className="font-serif text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {trivia.headline}
            </h3>

            {/* Story Content */}
            <p className="font-serif text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {trivia.storyContent}
            </p>

            {/* Prompt Suggestion / Memory Hook */}
            {trivia.promptSuggestion && (
              <div className="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3.5 flex items-start gap-3">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-lg shrink-0 mt-0.5">
                  <Feather className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-semibold uppercase tracking-wider text-amber-900">
                    Story Spark
                  </div>
                  <p className="text-xs md:text-sm text-amber-950 font-serif leading-relaxed italic">
                    "{trivia.promptSuggestion}"
                  </p>
                </div>
              </div>
            )}
          </div>
        ) : null}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-3 flex-wrap">
          <button
            onClick={() => {
              if (onClickAuthorPage) {
                onClickAuthorPage(trivia?.promptSuggestion || trivia?.headline);
              }
            }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs md:text-sm font-medium shadow-sm transition-all hover:shadow"
          >
            <Feather className="w-3.5 h-3.5" />
            Write Story About This
          </button>

          <button
            onClick={handleGenerateNew}
            disabled={generating}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs md:text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Discovering...' : 'Surprise Me With Another'}
          </button>
        </div>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 md:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-amber-600" />
                <h4 className="font-serif font-bold text-lg text-slate-900">Your Story Sparks History</h4>
              </div>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 md:p-5 overflow-y-auto space-y-3.5 divide-y divide-slate-100">
              {loadingHistory ? (
                <div className="py-12 text-center text-sm text-slate-400">Loading history...</div>
              ) : historyItems.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-500 font-serif">
                  No previous trivia articles found yet. Generate new ones to build your personal almanac!
                </div>
              ) : (
                historyItems.map((item) => (
                  <div key={item.mbrTriviaId} className="pt-3.5 first:pt-0 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                        {getTopicIcon(item.anchorTopic)}
                        {getTopicBadgeLabel(item.anchorTopic)}
                      </span>
                      {item.isFavorite && (
                        <span className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                          <BookmarkCheck className="w-3.5 h-3.5" /> Favorite
                        </span>
                      )}
                    </div>

                    <h5 className="font-serif font-bold text-base text-slate-900 leading-snug">
                      {item.headline}
                    </h5>

                    <p className="text-xs md:text-sm text-slate-600 font-serif line-clamp-3 leading-relaxed">
                      {item.storyContent}
                    </p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-slate-400">
                        {new Date(item.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                      <button
                        onClick={() => {
                          setTrivia(item);
                          setShowHistoryModal(false);
                        }}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        View Full Card <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <AdminComponentTag name="SbPersonalTriviaCard" />
    </div>
  );
}
