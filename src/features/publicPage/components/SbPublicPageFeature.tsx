/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { taskApi, sysConfigApi } from '@/src/services/api';
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
const DEFAULT_MAX_MEMBER_PROFILES = 80;

export default function SbPublicPageFeature({ setActiveTab, onClickReadStory, onSelectLogonType }: SbPublicPageFeatureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(getCachedUserLocation());
  const [proximityEnabled, setProximityEnabled] = useState<boolean>(() => {
    try {
      const saved = sessionStorage.getItem('sb_public_proximity_enabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [members, setMembers] = useState<any[]>([]);
  const [maxProfiles, setMaxProfiles] = useState<number>(DEFAULT_MAX_MEMBER_PROFILES);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);

  // Fetch dynamic system property PUBLIC_PAGE_MAX_MEMBER_PROFILES
  useEffect(() => {
    let isMounted = true;
    sysConfigApi
      .getSysConfigByTag('PUBLIC_PAGE_MAX_MEMBER_PROFILES')
      .then((cfg) => {
        if (isMounted && cfg && cfg.configValue) {
          const parsed = parseInt(cfg.configValue, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setMaxProfiles(parsed);
          }
        }
      })
      .catch((err) => {
        console.warn('Could not load PUBLIC_PAGE_MAX_MEMBER_PROFILES config, using fallback:', err);
      });

    const handleConfigChanged = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail?.configTag === 'PUBLIC_PAGE_MAX_MEMBER_PROFILES') {
        const val = parseInt(customEvent.detail?.configValue, 10);
        if (!isNaN(val) && val > 0) {
          setMaxProfiles(val);
        }
      }
    };

    window.addEventListener('sysconfig:changed', handleConfigChanged);
    return () => {
      isMounted = false;
      window.removeEventListener('sysconfig:changed', handleConfigChanged);
    };
  }, []);

  const handleToggleProximity = useCallback((val: boolean) => {
    setProximityEnabled(val);
    try {
      sessionStorage.setItem('sb_public_proximity_enabled', val ? 'true' : 'false');
    } catch {}
  }, []);

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
      setProximityEnabled(true);
    }
  }, []);

  // Fetch initial batch of members on load or when searchQuery / userLocation / proximityEnabled / maxProfiles changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setHasMore(true);

    const timer = setTimeout(async () => {
      try {
        const queryTrimmed = searchQuery.trim();
        // Guardrail: single-character searches are deferred until at least 2 characters are entered
        const effectiveQuery = queryTrimmed.length === 1 ? undefined : (queryTrimmed || undefined);
        const useProximity = proximityEnabled && userLocation;
        const initialLimit = Math.min(PAGE_SIZE, maxProfiles);
        const result = await taskApi.getMembers({
          query: effectiveQuery,
          proximity: useProximity ? userLocation?.label : undefined,
          proximity_lat: useProximity ? userLocation?.latitude : undefined,
          proximity_lng: useProximity ? userLocation?.longitude : undefined,
          public_only: true,
          limit: initialLimit,
          skip: 0
        });

        if (!isCancelled) {
          const uniqueList = Array.from(new Map((result || []).map((m: any) => [m.mbrId || m.id, m])).values());
          const cappedList = uniqueList.slice(0, maxProfiles);
          setMembers(cappedList);
          setHasMore((result || []).length === initialLimit && cappedList.length < maxProfiles);
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
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [searchQuery, userLocation, proximityEnabled, maxProfiles]);

  // Handler to fetch another batch of members up to maxProfiles
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;
    if (members.length >= maxProfiles) {
      setHasMore(false);
      return;
    }
    setLoadingMore(true);
    try {
      const queryTrimmed = searchQuery.trim();
      const effectiveQuery = queryTrimmed.length === 1 ? undefined : (queryTrimmed || undefined);
      const currentSkip = members.length;
      const fetchLimit = Math.min(PAGE_SIZE, maxProfiles - currentSkip);
      if (fetchLimit <= 0) {
        setHasMore(false);
        return;
      }
      const useProximity = proximityEnabled && userLocation;
      const nextBatch = await taskApi.getMembers({
        query: effectiveQuery,
        proximity: useProximity ? userLocation?.label : undefined,
        proximity_lat: useProximity ? userLocation?.latitude : undefined,
        proximity_lng: useProximity ? userLocation?.longitude : undefined,
        public_only: true,
        limit: fetchLimit,
        skip: currentSkip
      });

      if (nextBatch && nextBatch.length > 0) {
        let reachedLimit = false;
        setMembers((prev) => {
          const combined = [...prev, ...nextBatch];
          const deduplicated = Array.from(new Map(combined.map((m: any) => [m.mbrId || m.id, m])).values());
          if (deduplicated.length >= maxProfiles) {
            reachedLimit = true;
            return deduplicated.slice(0, maxProfiles);
          }
          return deduplicated;
        });
        setHasMore(!reachedLimit && nextBatch.length === fetchLimit && (currentSkip + nextBatch.length) < maxProfiles);
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.error("Failed to load more members:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, searchQuery, userLocation, proximityEnabled, members.length, maxProfiles]);

  // Infinite scroll listener: auto-fetch another 5 members when scrolling to the bottom until AUTO_SCROLL_LIMIT (or maxProfiles) is reached
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;
      const autoLimit = Math.min(AUTO_SCROLL_LIMIT, maxProfiles);
      if (members.length >= autoLimit) return; // Stop auto-scrolling once autoLimit is loaded

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;

      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore, loading, loadingMore, hasMore, members.length, maxProfiles]);

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section: Brand branding, authentication, explainer facts, stats */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftColumn setActiveTab={setActiveTab} onSelectLogonType={onSelectLogonType} />
        </div>

        {/* Center Column Section: Main page stories feed, searches, filters */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            members={members}
            maxProfiles={maxProfiles}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onClickReadStory={onClickReadStory}
            userLocation={userLocation}
            proximityEnabled={proximityEnabled}
            setProximityEnabled={handleToggleProximity}
            onRefreshLocation={handleRefreshLocation}
            setActiveTab={setActiveTab}
            onSelectLogonType={onSelectLogonType}
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
