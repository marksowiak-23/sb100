import React from 'react';
import SbHeroWelcomeCard from './SbHeroWelcomeCard';
import SbMbrSearchCard from './SbMbrSearchCard';
import SbMbrSearchResults from './SbMbrSearchResults';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface CenterColumnProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: any[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  connectionsMap?: Map<string, { isConnected: boolean; grpName?: string }>;
  viewerMbrId?: string | null;
  onLoadMore?: () => void;
  onClickReadStory?: (memberId: string) => void;
  userLocation?: UserLocation | null;
  onRefreshLocation?: () => void;
}

export default function CenterColumn({
  searchQuery,
  setSearchQuery,
  members,
  loading = false,
  loadingMore = false,
  hasMore = false,
  connectionsMap,
  viewerMbrId,
  onLoadMore,
  onClickReadStory,
  userLocation,
  onRefreshLocation
}: CenterColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      <SbHeroWelcomeCard />
      <SbMbrSearchCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        userLocation={userLocation}
        onRefreshLocation={onRefreshLocation}
      />
      <SbMbrSearchResults
        searchQuery={searchQuery}
        members={members}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        connectionsMap={connectionsMap}
        viewerMbrId={viewerMbrId}
        onLoadMore={onLoadMore}
        onClickReadStory={onClickReadStory}
        userLocation={userLocation}
      />
      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
