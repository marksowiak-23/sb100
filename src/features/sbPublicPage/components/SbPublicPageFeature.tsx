/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { MEMBER_STORIES } from '../constants/memberData';

export default function SbPublicPageFeature() {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic: Checks if query string exists inside username, location, or tags list.
  const filteredMembers = MEMBER_STORIES.filter((member) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;

    const nameMatch = member.name.toLowerCase().includes(query);
    const locationMatch = member.location.toLowerCase().includes(query);
    const tagsMatch = member.tags.some((tag) => tag.toLowerCase().includes(query));

    return nameMatch || locationMatch || tagsMatch;
  });

  return (
    <div className="w-full">
      {/* 3-Column Responsive Grid Structure */}
      {/* lg:grid-cols-12 distributes proportions as 3/12 (Left), 6/12 (Center), and 3/12 (Right). */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section: Brand branding, authentication, explainer facts, stats */}
        <div className="lg:col-span-3">
          <LeftColumn />
        </div>

        {/* Center Column Section: Main page stories feed, searches, filters */}
        <div className="lg:col-span-6 bg-slate-50/50 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            members={filteredMembers}
          />
        </div>

        {/* Right Column Section: Memoir publishing programs, sponsors, legal details */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
    </div>
  );
}
