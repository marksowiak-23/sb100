/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, Calendar, MapPin, Sparkles, ChevronRight, User, Users, Bookmark } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { resolveMediaUrl } from '@/src/services/api';

export interface FeedStoryItem {
  mbrStoryId: string;
  mbrStoryTitle: string;
  mbrStoryContent?: string;
  mbrStoryPublishStatusCd?: string;
  mbrStoryPublishedDate?: string;
  mbrStoryCreatedAt?: string;
  mbrStoryUpdatedAt?: string;
  mbrStoryTypeCd?: string;
  authorMbrId: string;
  authorName: string;
  authorLocation?: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  connectionGrpName?: string;
}

interface MbrStoryFeedStoryPanelProps {
  story: FeedStoryItem;
  onClickReadStory?: (memberId: string) => void;
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
  return typeCd.charAt(0).toUpperCase() + typeCd.slice(1);
};

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return 'Recently Published';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {}
  return dateStr;
};

export default function MbrStoryFeedStoryPanel({
  story,
  onClickReadStory
}: MbrStoryFeedStoryPanelProps) {
  const topicKey = (story.mbrStoryTypeCd || '').toLowerCase();
  const badgeStyle = topicBadgeColors[topicKey] || {
    bg: 'bg-slate-100 dark:bg-slate-800',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700'
  };

  const displayTopic = formatTopicName(story.mbrStoryTypeCd);
  const formattedDate = formatDate(story.mbrStoryPublishedDate || story.mbrStoryUpdatedAt || story.mbrStoryCreatedAt);

  return (
    <motion.article
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
    >
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header: Author Info & Connection Metadata */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3.5">
          {/* Author Avatar */}
          <button
            type="button"
            onClick={() => onClickReadStory?.(story.authorMbrId)}
            className="w-12 h-12 rounded-full overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center shrink-0 hover:ring-2 hover:ring-blue-500/50 transition-all focus:outline-none"
            title={`View ${story.authorName}'s storybook`}
          >
            {story.authorAvatarUrl ? (
              <img
                src={story.authorAvatarUrl}
                alt={story.authorName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <span className="font-serif font-bold text-sm text-slate-700 dark:text-slate-200">
                {story.authorInitials || 'SB'}
              </span>
            )}
          </button>

          {/* Author Details */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => onClickReadStory?.(story.authorMbrId)}
                className="font-serif text-base font-bold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 text-left transition-colors focus:outline-none"
              >
                {story.authorName}
              </button>

              {story.connectionGrpName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium tracking-wide bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40">
                  <Users className="w-2.5 h-2.5" />
                  {story.connectionGrpName}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {story.authorLocation && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {story.authorLocation}
                </span>
              )}
              {story.authorLocation && <span>•</span>}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formattedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Topic Badge */}
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border} shrink-0`}
        >
          <Bookmark className="w-3 h-3" />
          {displayTopic}
        </span>
      </div>

      {/* Story Title */}
      <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight leading-snug mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
        {story.mbrStoryTitle}
      </h2>

      {/* Story Content / Narrative Excerpt */}
      {story.mbrStoryContent && (
        <p className="text-slate-600 dark:text-slate-300 font-sans text-sm sm:text-[15px] leading-relaxed line-clamp-4 sm:line-clamp-5 mb-5 whitespace-pre-line font-normal">
          {story.mbrStoryContent}
        </p>
      )}

      {/* Card Action Footer */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-400 dark:text-slate-500 italic">
          Published chapter in {displayTopic}
        </span>

        <button
          type="button"
          onClick={() => onClickReadStory?.(story.authorMbrId)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 transition-colors focus:outline-none"
        >
          <span>Read Full Story</span>
          <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <AdminComponentTag name="mbrStoryFeedStoryPanel" />
    </motion.article>
  );
}

export { MbrStoryFeedStoryPanel as mbrStoryFeedStoryPanel };
