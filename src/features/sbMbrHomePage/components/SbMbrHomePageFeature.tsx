/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { taskApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrHomePageFeatureProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: () => void;
}

export default function SbMbrHomePageFeature({ onClickReadStory, onClickAuthorPage }: SbMbrHomePageFeatureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch top 5 recent members on load, or search by query (name, location) on query change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);

    const timer = setTimeout(async () => {
      try {
        const queryTrimmed = searchQuery.trim();
        let result: any[] = [];
        if (queryTrimmed) {
          result = await taskApi.getMembers({ query: queryTrimmed });
        } else {
          result = await taskApi.getMembers({ limit: 5 });
        }
        if (!isCancelled) {
          setMembers(result || []);
        }
      } catch (err) {
        console.error("Failed to fetch members for member home page search:", err);
        if (!isCancelled) {
          setMembers([]);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }, 250);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery]);

  return (
    <div className="w-full relative">
      {/* 3-Column Responsive Grid Structure */}
      {/* lg:grid-cols-12 distributes proportions as 3/12 (Left), 6/12 (Center), and 3/12 (Right). */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section: Brand name, scrollable new connections, biography checklist status, and existing connections */}
        <div className="lg:col-span-3">
          <LeftColumn onClickAuthorPage={onClickAuthorPage} />
        </div>

        {/* Center Column Section: Main welcome hero, Search Bar box, and Dynamic Members feed */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            members={members}
            loading={loading}
            onClickReadStory={onClickReadStory}
          />
        </div>

        {/* Right Column Section: Recommended publishing sponsors and legal footer links */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
      <AdminComponentTag name="SbMbrHomePageFeature" />
    </div>
  );
}
