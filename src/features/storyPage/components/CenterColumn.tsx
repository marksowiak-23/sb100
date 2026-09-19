/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Bookmark, Calendar, Clock, MapPin, Users, ArrowLeft, BookOpen, ShieldAlert, Sparkles } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  storyTitle?: string;
  storyContent?: string;
  storyTopic?: string;
  publishedDate?: string;
  authorName?: string;
  authorLocation?: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  connectionGrpName?: string;
  isLoading?: boolean;
  isRestricted?: boolean;
  onClickBack?: () => void;
  onClickViewAuthorStorybook?: () => void;
}

const topicBadgeColors: Record<string, { bg: string; text: string; border: string }> = {
  family: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
  sbmbrstryfamly: { bg: 'bg-rose-50 dark:bg-rose-950/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-800/40' },
  residencies: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40' },
  sbmbrstryresidence: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-800/40' },
  achievements: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40' },
  sbmbrstryachievement: { bg: 'bg-amber-50 dark:bg-amber-950/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-800/40' },
  education: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40' },
  sbmbrstryeducation: { bg: 'bg-blue-50 dark:bg-blue-950/30', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-200 dark:border-blue-800/40' },
  employment: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40' },
  sbmbrstryemployment: { bg: 'bg-purple-50 dark:bg-purple-950/30', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-200 dark:border-purple-800/40' },
  hobbies: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  activities: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  sbmbrstryactivity: { bg: 'bg-teal-50 dark:bg-teal-950/30', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800/40' },
  other: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
  custom: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
  sbmbrstrycustom: { bg: 'bg-indigo-50 dark:bg-indigo-950/30', text: 'text-indigo-700 dark:text-indigo-300', border: 'border-indigo-200 dark:border-indigo-800/40' },
};

const formatTopicName = (typeCd?: string): string => {
  if (!typeCd) return 'Story Chapter';
  const clean = typeCd.toLowerCase().replace('sbmbrstry', '').replace('mbrstry', '');
  if (clean === 'famly' || clean === 'family') return 'Family';
  if (clean === 'residence' || clean === 'residencies') return 'Residencies';
  if (clean === 'achievement' || clean === 'achievements') return 'Achievements';
  if (clean === 'education') return 'Education';
  if (clean === 'employment' || clean === 'career') return 'Employment';
  if (clean === 'activity' || clean === 'activities' || clean === 'hobbies') return 'Hobbies & Activities';
  if (clean === 'custom' || clean === 'other') return 'Custom Topic';
  return typeCd.charAt(0).toUpperCase() + typeCd.slice(1);
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recently Published';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {}
  return dateStr;
};

export default function CenterColumn({
  storyTitle = 'Untitled Story',
  storyContent = '',
  storyTopic,
  publishedDate,
  authorName = 'Author',
  authorLocation,
  authorAvatarUrl,
  authorInitials = 'SB',
  connectionGrpName,
  isLoading = false,
  isRestricted = false,
  onClickBack,
  onClickViewAuthorStorybook
}: CenterColumnProps) {
  const topicKey = (storyTopic || '').toLowerCase();
  const badgeStyle = topicBadgeColors[topicKey] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700'
  };

  const displayTopic = formatTopicName(storyTopic);
  const formattedDate = formatDate(publishedDate);

  // Calculate approximate reading time
  const wordCount = (storyContent || '').trim().split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  // Split into paragraphs for rich reading experience
  const paragraphs = (storyContent || '')
    .split(/\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  if (isLoading) {
    return (
      <div className="space-y-6 relative">
        {onClickBack && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onClickBack}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all">
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span>Back to Stories</span>
            </button>
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 shadow-sm animate-pulse space-y-6">
          <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded-full" />
          <div className="h-10 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
            <div className="h-4 w-5/6 bg-slate-200 dark:bg-slate-800 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (isRestricted) {
    return (
      <div className="space-y-6 relative">
        {onClickBack && (
          <div className="flex items-center">
            <button
              type="button"
              onClick={onClickBack}
              className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
            >
              <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all">
                <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <span>Back to Stories</span>
            </button>
          </div>
        )}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-8 sm:p-12 shadow-sm text-center relative overflow-hidden">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/40 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-5">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Access Restricted
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6 font-sans">
            The author has restricted viewing permissions for this story chapter. You do not currently belong to an authorized connection circle.
          </p>
          {onClickBack && (
            <button
              type="button"
              onClick={onClickBack}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Stories Feed</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 relative">
      {/* Top Back to Stories Navigation Button */}
      {onClickBack && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onClickBack}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <span>Back to Stories</span>
          </button>
        </div>
      )}

      <motion.article
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-10 shadow-sm relative overflow-hidden"
      >
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-90" />

        {/* Header Metadata */}
        <div className="flex items-center justify-between gap-4 flex-wrap mb-6 pb-5 border-b border-slate-100 dark:border-slate-800">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            {displayTopic}
          </span>

          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {readTimeMinutes} min read ({wordCount} words)
            </span>
          </div>
        </div>

        {/* Story Headline Title */}
        <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white tracking-tight leading-tight sm:leading-snug mb-6">
          {storyTitle}
        </h1>

        {/* Author Byline Bar */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-800 shadow-xs flex items-center justify-center shrink-0">
              {authorAvatarUrl ? (
                <img
                  src={authorAvatarUrl}
                  alt={authorName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : (
                <span className="font-serif font-bold text-xs text-slate-700 dark:text-slate-200">
                  {authorInitials}
                </span>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif text-sm font-bold text-slate-900 dark:text-white">
                  {authorName}
                </span>
                {connectionGrpName && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40">
                    <Users className="w-2.5 h-2.5" />
                    {connectionGrpName}
                  </span>
                )}
              </div>
              {authorLocation && (
                <span className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {authorLocation}
                </span>
              )}
            </div>
          </div>

          {onClickViewAuthorStorybook && (
            <button
              type="button"
              onClick={onClickViewAuthorStorybook}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 focus:outline-none cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Author's Storybook</span>
            </button>
          )}
        </div>

        {/* Story Body Text / Full Narrative */}
        <div className="prose prose-slate dark:prose-invert max-w-none">
          {paragraphs.length > 0 ? (
            paragraphs.map((para, index) => (
              <p
                key={index}
                className="font-serif text-base sm:text-lg text-slate-700 dark:text-slate-200 leading-relaxed mb-6 font-normal"
              >
                {para}
              </p>
            ))
          ) : (
            <p className="font-serif text-base text-slate-500 italic">
              No narrative content published for this chapter.
            </p>
          )}
        </div>

        {/* Story Footer Navigation */}
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Preserved with StoryBook</span>
          </div>

          <div className="flex items-center gap-3">
            {onClickBack && (
              <button
                type="button"
                onClick={onClickBack}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors focus:outline-none cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Stories</span>
              </button>
            )}
          </div>
        </div>

        <AdminComponentTag name="storyPageCenterColumn" />
      </motion.article>
    </div>
  );
}

export { CenterColumn as storyPageCenterColumn };
