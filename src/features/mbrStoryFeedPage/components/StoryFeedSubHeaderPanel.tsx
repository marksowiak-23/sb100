/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles, Users } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StoryFeedSubHeaderPanelProps {
  storiesCount?: number;
  title?: string;
  subtitle?: string;
  connectionsOnly?: boolean;
  setConnectionsOnly?: (val: boolean) => void;
  onToggleConnectionsOnly?: (val: boolean) => void;
  className?: string;
}

export default function StoryFeedSubHeaderPanel({
  storiesCount = 0,
  title = 'Member Stories',
  subtitle = 'Ordered chronologically by most recently published chapter',
  connectionsOnly = true,
  setConnectionsOnly,
  onToggleConnectionsOnly,
  className = ''
}: StoryFeedSubHeaderPanelProps) {
  const handleCheckboxChange = (checked: boolean) => {
    setConnectionsOnly?.(checked);
    onToggleConnectionsOnly?.(checked);
  };

  return (
    <div className={`hidden sm:block bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden group ${className}`}>
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{title}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {subtitle}
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full border border-slate-200/60 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>{storiesCount} Loaded</span>
        </div>
      </div>

      {/* Filter Row: My Connections Only */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={connectionsOnly}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 focus:ring-2 cursor-pointer transition-all accent-blue-600"
          />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              My Connections Only
            </span>
          </div>
        </label>

        {connectionsOnly && (
          <span className="text-[11px] font-sans font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Showing connected members only
          </span>
        )}
      </div>

      <AdminComponentTag name="StoryFeedSubHeaderPanel" />
    </div>
  );
}

export { StoryFeedSubHeaderPanel as storyFeedSubHeaderPanel, StoryFeedSubHeaderPanel as MbrStoryFeedSubHeaderPanel };
