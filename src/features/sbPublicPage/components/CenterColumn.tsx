/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MemberStory } from '../constants/memberData';
import HeroCarousel from './HeroCarousel';
import SbPublicSearchCard from './SbPublicSearchCard';
import SbMemberSearchResults from './SbMemberSearchResults';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: MemberStory[];
  onClickReadStory?: (memberId: string) => void;
}

export default function CenterColumn({
  searchQuery,
  setSearchQuery,
  members,
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
        onClickReadStory={onClickReadStory}
      />

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
