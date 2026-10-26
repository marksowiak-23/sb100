/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { ReadFilterMode } from './StoryFeedSubHeaderPanel';

export interface StoryFeedMobileSubHeaderPanelProps {
  storiesCount?: number;
  connectionsOnly?: boolean;
  setConnectionsOnly?: (val: boolean) => void;
  onToggleConnectionsOnly?: (val: boolean) => void;
  readFilterMode?: ReadFilterMode;
  onReadFilterModeChange?: (mode: ReadFilterMode) => void;
  hiddenReadCount?: number;
  totalReadCount?: number;
  className?: string;
}

export default function StoryFeedMobileSubHeaderPanel({
  storiesCount = 0,
  connectionsOnly = true,
  setConnectionsOnly,
  onToggleConnectionsOnly,
  className = ''
}: StoryFeedMobileSubHeaderPanelProps) {
  const handleCheckboxChange = (checked: boolean) => {
    setConnectionsOnly?.(checked);
    onToggleConnectionsOnly?.(checked);
  };

  return (
    <div className={`sm:hidden bg-transparent -mt-2 sm:mt-0 py-0.5 px-3 space-y-1.5 relative ${className}`}>
      {/* Mobile Filter & Status Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={connectionsOnly}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 rounded-md border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 focus:ring-2 cursor-pointer transition-all accent-blue-600"
          />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300">
              My Connections Only
            </span>
          </div>
        </label>
      </div>

      {connectionsOnly && (
        <div className="flex items-center pt-0.5">
          <span className="text-[10px] font-sans font-medium text-blue-600 dark:text-blue-400 bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/40 px-2 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Showing connected members only
          </span>
        </div>
      )}

      <AdminComponentTag name="StoryFeedMobileSubHeaderPanel" />
    </div>
  );
}

export { StoryFeedMobileSubHeaderPanel as storyFeedMobileSubHeaderPanel, StoryFeedMobileSubHeaderPanel as MbrStoryFeedMobileSubHeaderPanel };
