/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ShieldAlert } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import StoryPageStoryPanel from './StoryPageStoryPanel';

interface CenterColumnProps {
  storyId?: string | null;
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

export default function CenterColumn({
  storyId,
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

      {/* Main Story Narrative Panel */}
      <StoryPageStoryPanel
        storyId={storyId}
        storyTitle={storyTitle}
        storyContent={storyContent}
        storyTopic={storyTopic}
        publishedDate={publishedDate}
        authorName={authorName}
        authorLocation={authorLocation}
        authorAvatarUrl={authorAvatarUrl}
        authorInitials={authorInitials}
        connectionGrpName={connectionGrpName}
        onClickBack={onClickBack}
        onClickViewAuthorStorybook={onClickViewAuthorStorybook}
      />

      <AdminComponentTag name="storyPageCenterColumn" />
    </div>
  );
}

export { CenterColumn as storyPageCenterColumn };
