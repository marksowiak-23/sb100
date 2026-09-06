/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import StoriesPageHeaderPanel from './StoriesPageHeaderPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { BookOpen, Users, BookmarkCheck, Sparkles, Feather } from 'lucide-react';

interface LeftColumnProps {
  totalStoriesCount?: number;
  connectionsCount?: number;
  onClickAuthorPage?: () => void;
}

export default function LeftColumn({
  totalStoriesCount = 0,
  connectionsCount = 0,
  onClickAuthorPage
}: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      {/* --- PAGE HEADER --- */}
      <StoriesPageHeaderPanel />

      {/* --- STORIES FEED QUICK INFO CARD --- */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-slate-800 dark:text-white font-serif font-bold text-sm">
          <Feather className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>About Story Feed</span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          The Stories feed collects newly published chapters and memoirs from fellow members in your trusted circles.
        </p>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-lg font-serif font-bold text-slate-900 dark:text-white">
              {totalStoriesCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Stories in Feed
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
            <div className="text-lg font-serif font-bold text-blue-600 dark:text-blue-400">
              {connectionsCount}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Connected Circles
            </div>
          </div>
        </div>

        {onClickAuthorPage && (
          <button
            type="button"
            onClick={onClickAuthorPage}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all focus:outline-none"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Write Your Story</span>
          </button>
        )}
      </div>

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
