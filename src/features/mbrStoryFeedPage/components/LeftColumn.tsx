import React from 'react';
import StoriesPageHeaderPanel from './StoriesPageHeaderPanel';
import StoryFeedQuickInfoCard from './StoryFeedQuickInfoCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

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

      {/* --- STORIES FEED QUICK INFO CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <StoryFeedQuickInfoCard
          totalStoriesCount={totalStoriesCount}
          connectionsCount={connectionsCount}
        />
      </div>

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
