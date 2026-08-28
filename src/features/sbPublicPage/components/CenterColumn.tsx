/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HeroCarousel from './HeroCarousel';
import SbPublicSearchCard from './SbPublicSearchCard';
import SbMemberSearchResults from './SbMemberSearchResults';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: any[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onClickReadStory?: (memberId: string) => void;
}

export default function CenterColumn({
  searchQuery,
  setSearchQuery,
  members,
  loading = false,
  loadingMore = false,
  hasMore = true,
  onLoadMore,
  onClickReadStory
}: CenterColumnProps) {
  return (
    <div className="space-y-8 flex flex-col relative">
      {/* --- HERO CAROUSEL --- */}
      <HeroCarousel />

      {/* --- SEARCH BAR CARD --- */}
      <SbPublicSearchCard
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {/* --- SEARCH RESULTS & STORIES FEED --- */}
      <SbMemberSearchResults
        members={members}
        loading={loading}
        loadingMore={loadingMore}
        hasMore={hasMore}
        onLoadMore={onLoadMore}
        onClickReadStory={onClickReadStory}
      />

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
