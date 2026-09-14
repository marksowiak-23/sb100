/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, ArrowLeft } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface StoryPageHeaderPanelProps {
  onClickBack?: () => void;
  topicName?: string;
  className?: string;
}

export default function StoryPageHeaderPanel({
  onClickBack,
  topicName,
  className = ''
}: StoryPageHeaderPanelProps) {
  return (
    <div className={`hidden lg:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden mb-6 group ${className}`}>
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-80" />

      <div className="flex flex-col gap-3">
        {onClickBack && (
          <button
            type="button"
            onClick={onClickBack}
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors w-fit focus:outline-none cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Stories Feed</span>
          </button>
        )}

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900/50 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Story Reading Room
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-sans">
              Personal journeys, milestones, and life chapters
            </p>
          </div>
        </div>
      </div>

      <AdminComponentTag name="storyPageHeaderPanel" />
    </div>
  );
}

export { StoryPageHeaderPanel as storyPageHeaderPanel };
