/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Feather } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StoryFeedQuickInfoCardProps {
  totalStoriesCount?: number;
  connectionsCount?: number;
  onClickAuthorPage?: () => void;
}

export default function StoryFeedQuickInfoCard({
  totalStoriesCount = 0,
  connectionsCount = 0
}: StoryFeedQuickInfoCardProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative">
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

      <AdminComponentTag name="StoryFeedQuickInfoCard" />
    </div>
  );
}

export { StoryFeedQuickInfoCard as StoriesFeedQuickInfoCard };
