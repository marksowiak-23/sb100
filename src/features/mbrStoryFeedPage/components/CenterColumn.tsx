/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MbrStoryFeedStoryPanel, { FeedStoryItem } from './MbrStoryFeedStoryPanel';
import StoryFeedSubHeaderPanel from './StoryFeedSubHeaderPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { BookOpen, Loader2, CheckCircle2, ArrowDown } from 'lucide-react';

interface CenterColumnProps {
  stories: FeedStoryItem[];
  loading: boolean;
  loadingMore: boolean;
  hasMore: boolean;
  readStoryIds?: Set<string>;
  connectionsOnly?: boolean;
  setConnectionsOnly?: (val: boolean) => void;
  onLoadMore?: () => void;
  onClickReadStory?: (storyId: string, memberId: string) => void;
  onClickViewAuthor?: (memberId: string) => void;
}

export default function CenterColumn({
  stories,
  loading,
  loadingMore,
  hasMore,
  readStoryIds,
  connectionsOnly = false,
  setConnectionsOnly,
  onLoadMore,
  onClickReadStory,
  onClickViewAuthor
}: CenterColumnProps) {
  return (
    <div className="space-y-6 relative">
      {/* Feed Sub-Header */}
      <StoryFeedSubHeaderPanel
        storiesCount={stories.length}
        connectionsOnly={connectionsOnly}
        setConnectionsOnly={setConnectionsOnly}
      />

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-6 shadow-sm animate-pulse space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-800" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                </div>
              </div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
              <div className="space-y-2">
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-full" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-5/6" />
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && stories.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-10 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto border border-blue-100 dark:border-blue-900/50">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-2">
            <h3 className="font-serif text-xl font-bold text-slate-900 dark:text-white">
              {connectionsOnly ? 'No Connected Stories Found' : 'No Published Stories Yet'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {connectionsOnly
                ? 'No published stories found from members in your connections. Uncheck "My Connections Only" to explore all available stories.'
                : 'When members in your connections publish new chapters and grant viewing privileges for your circle, their stories will appear here.'}
            </p>
          </div>
        </div>
      )}

      {/* Stories List */}
      {!loading && stories.length > 0 && (
        <div className="space-y-6">
          {stories.map((story) => (
            <MbrStoryFeedStoryPanel
              key={story.mbrStoryId}
              story={story}
              isRead={readStoryIds ? readStoryIds.has(story.mbrStoryId) : false}
              onClickReadStory={onClickReadStory}
              onClickViewAuthor={onClickViewAuthor}
            />
          ))}
        </div>
      )}

      {/* Loading More Indicator */}
      {loadingMore && (
        <div className="flex items-center justify-center gap-2 py-6 text-slate-500 dark:text-slate-400 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600 dark:text-blue-400" />
          <span>Loading more stories...</span>
        </div>
      )}

      {/* End of Feed / Caught Up */}
      {!loading && stories.length > 0 && !hasMore && (
        <div className="py-8 text-center space-y-1.5 border-t border-slate-200/60 dark:border-slate-800">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3.5 py-1.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>You're all caught up!</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            You have seen all published stories from your connected circle.
          </p>
        </div>
      )}

      {/* Manual Load More Button fallback if not triggered by scroll */}
      {!loading && !loadingMore && hasMore && stories.length > 0 && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={onLoadMore}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-sm transition-all focus:outline-none"
          >
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Load More Stories</span>
          </button>
        </div>
      )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
