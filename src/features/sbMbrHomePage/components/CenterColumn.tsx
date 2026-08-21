/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbHeroWelcomeCard from './SbHeroWelcomeCard';
import SbMbrSearchCard from './SbMbrSearchCard';
import SbMbrSearchResults from './SbMbrSearchResults';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: any[];
  loading?: boolean;
  onClickReadStory?: (memberId: string) => void;
}

export default function CenterColumn({
  searchQuery,
  setSearchQuery,
  members,
  loading = false,
  onClickReadStory
}: CenterColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      <SbHeroWelcomeCard />
      <SbMbrSearchCard searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      <SbMbrSearchResults
        searchQuery={searchQuery}
        members={members}
        loading={loading}
        onClickReadStory={onClickReadStory}
      />
      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
