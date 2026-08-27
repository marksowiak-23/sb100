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
import PageSeo from '@/src/components/PageSeo';

interface SbPublicPageFeatureProps {
  setActiveTab: (tab: 'workspace' | 'settings' | 'account-settings' | 'sbPublicPage' | 'sbMbrHomePage' | 'sbMbrStoryPage' | 'sbMbrAuthorPage' | 'mbrProfile' | 'mbrPreferences' | 'sbMbrLogon' | 'db-admin' | 'adminCacheManagement' | 'adminMedia') => void;
  onClickReadStory: (storyId: string) => void;
  onSelectLogonType?: (type: 'Google' | 'Apple') => void;
}

export default function SbPublicPageFeature({ setActiveTab, onClickReadStory, onSelectLogonType }: SbPublicPageFeatureProps) {
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
          const uniqueList = Array.from(new Map((result || []).map((m: any) => [m.mbrId || m.id, m])).values());
          setMembers(uniqueList);
        }
      } catch (err) {
        console.error("Failed to fetch members for public search:", err);
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
      <PageSeo
        title="Explore Stories, Voices & Connections | StoryBook"
        description="Discover authentic stories, creative journeys, and personal adventures from people of all ages. Share your unique voice, inspire the community, and connect with others on StoryBook."
        keywords="explore stories, share your story, creative storytelling, real life experiences, personal journeys, story community, young creators, connect with friends, true stories, storytelling platform"
        ogType="website"
        ogTitle="Explore Stories, Voices & Connections | StoryBook"
        ogDescription="Discover real stories, adventures, and creative journeys from people of all ages. Share your voice on StoryBook."
        ogImage="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1200&h=630&fit=crop"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "name": "StoryBook Community Stories & Voices",
          "description": "Explore real stories, creative journeys, and personal adventures from people of all ages.",
          "url": "https://storybook.ai/explore",
          "provider": {
            "@type": "Organization",
            "name": "StoryBook",
            "url": "https://storybook.ai"
          }
        }}
      />
      {/* 3-Column Responsive Grid Structure */}
      {/* lg:grid-cols-12 distributes proportions as 3/12 (Left), 6/12 (Center), and 3/12 (Right). */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section: Brand branding, authentication, explainer facts, stats */}
        <div className="lg:col-span-3">
          <LeftColumn setActiveTab={setActiveTab} onSelectLogonType={onSelectLogonType} />
        </div>

        {/* Center Column Section: Main page stories feed, searches, filters */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            members={members}
            loading={loading}
            onClickReadStory={onClickReadStory}
          />
        </div>

        {/* Right Column Section: Memoir publishing programs, sponsors, legal details */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
      <AdminComponentTag name="SbPublicPageFeature" />
    </div>
  );
}

