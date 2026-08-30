/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { taskApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';
import { detectUserLocation, getCachedUserLocation, UserLocation } from '@/src/utils/userLocation';

interface SbPublicPageFeatureProps {
  setActiveTab: (tab: any) => void;
  onClickReadStory: (storyId: string) => void;
  onSelectLogonType?: (type: 'Google' | 'Apple') => void;
}

const PAGE_SIZE = 5;
const AUTO_SCROLL_LIMIT = 20;

export default function SbPublicPageFeature({ setActiveTab, onClickReadStory, onSelectLogonType }: SbPublicPageFeatureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(getCachedUserLocation());
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Detect user location on initial mount
  useEffect(() => {
    let isMounted = true;
    detectUserLocation().then((loc) => {
      if (isMounted && loc) {
        setUserLocation(loc);
      }
    });

    const handleLocUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<UserLocation | null>;
      if (isMounted) {
        setUserLocation(customEvent.detail || null);
      }
    };

    window.addEventListener('user_location:detected', handleLocUpdate);
    return () => {
      isMounted = false;
      window.removeEventListener('user_location:detected', handleLocUpdate);
    };
  }, []);

  const handleRefreshLocation = useCallback(async () => {
    const loc = await detectUserLocation(true);
    if (loc) {
      setUserLocation(loc);
    }
  }, []);

  // Fetch initial 5 members on load or when searchQuery / userLocation changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setHasMore(true);

    const timer = setTimeout(async () => {
      try {
        const queryTrimmed = searchQuery.trim();
        const result = await taskApi.getMembers({
          query: queryTrimmed || undefined,
          proximity: userLocation?.label || undefined,
          proximity_lat: userLocation?.latitude,
          proximity_lng: userLocation?.longitude,
          public_only: true,
          limit: PAGE_SIZE,
          skip: 0
        });

        if (!isCancelled) {
          const uniqueList = Array.from(new Map((result || []).map((m: any) => [m.mbrId || m.id, m])).values());
          setMembers(uniqueList);
          setHasMore((result || []).length === PAGE_SIZE);
        }
      } catch (err) {
        console.error("Failed to fetch members for public search:", err);
        if (!isCancelled) {
          setMembers([]);
          setHasMore(false);
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
  }, [searchQuery, userLocation]);

  // Handler to fetch another 5 members
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const queryTrimmed = searchQuery.trim();
      const currentSkip = members.length;
      const nextBatch = await taskApi.getMembers({
        query: queryTrimmed || undefined,
        proximity: userLocation?.label || undefined,
        proximity_lat: userLocation?.latitude,
        proximity_lng: userLocation?.longitude,
        public_only: true,
        limit: PAGE_SIZE,
        skip: currentSkip
      });

      if (nextBatch && nextBatch.length > 0) {
        setMembers((prev) => {
          const combined = [...prev, ...nextBatch];
          return Array.from(new Map(combined.map((m: any) => [m.mbrId || m.id, m])).values());
        });
        setHasMore(nextBatch.length === PAGE_SIZE);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more members:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, searchQuery, userLocation, members.length]);

  // Infinite scroll listener: auto-fetch another 5 members when scrolling to the bottom until 20 are loaded
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      if (members.length >= AUTO_SCROLL_LIMIT) return; // Stop auto-scrolling once 20 members are loaded

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;

      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore, loading, loadingMore, hasMore, members.length]);

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
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onClickReadStory={onClickReadStory}
            userLocation={userLocation}
            onRefreshLocation={handleRefreshLocation}
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
