/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User, MapPin, Briefcase, GraduationCap, Users, BookOpen } from 'lucide-react';
import StoryPageHeaderPanel from './StoryPageHeaderPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  authorName?: string;
  authorLocation?: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  authorWorksAt?: string;
  authorStudiedAt?: string;
  authorIntroduction?: string;
  connectionGrpName?: string;
  topicName?: string;
  onClickBack?: () => void;
  onClickViewAuthorStorybook?: () => void;
}

export default function LeftColumn({
  authorName = 'Author',
  authorLocation,
  authorAvatarUrl,
  authorInitials = 'SB',
  authorWorksAt,
  authorStudiedAt,
  authorIntroduction,
  connectionGrpName,
  topicName,
  onClickBack,
  onClickViewAuthorStorybook
}: LeftColumnProps) {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      <StoryPageHeaderPanel onClickBack={onClickBack} topicName={topicName} />

      {/* Author Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-tr from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800 border-2 border-white dark:border-slate-800 shadow-sm flex items-center justify-center shrink-0">
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
              <span className="font-serif font-bold text-base text-slate-700 dark:text-slate-200">
                {authorInitials}
              </span>
            )}
          </div>

          <div>
            <h3 className="font-serif text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {authorName}
            </h3>
            {connectionGrpName && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 rounded-full text-[10px] font-medium tracking-wide bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-800/40">
                <Users className="w-2.5 h-2.5" />
                {connectionGrpName}
              </span>
            )}
          </div>
        </div>

        {/* Demographics / Details */}
        <div className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-slate-100 dark:border-slate-800">
          {authorLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>{authorLocation}</span>
            </div>
          )}
          {authorWorksAt && (
            <div className="flex items-center gap-2">
              <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Works at {authorWorksAt}</span>
            </div>
          )}
          {authorStudiedAt && (
            <div className="flex items-center gap-2">
              <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>Studied at {authorStudiedAt}</span>
            </div>
          )}
        </div>

        {authorIntroduction && (
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-3">
              "{authorIntroduction}"
            </p>
          </div>
        )}

        {onClickViewAuthorStorybook && (
          <button
            type="button"
            onClick={onClickViewAuthorStorybook}
            className="w-full mt-5 py-2 px-3 bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>View Author's Storybook</span>
          </button>
        )}

        <AdminComponentTag name="storyAuthorSummaryCard" />
      </div>

      <AdminComponentTag name="storyPageLeftColumn" />
    </aside>
  );
}

export { LeftColumn as storyPageLeftColumn };
