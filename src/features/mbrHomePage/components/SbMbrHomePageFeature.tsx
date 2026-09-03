import React, { useState, useEffect, useCallback } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { taskApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { detectUserLocation, getCachedUserLocation, UserLocation } from '@/src/utils/userLocation';

interface SbMbrHomePageFeatureProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: () => void;
}

const PAGE_SIZE = 5;
const AUTO_SCROLL_LIMIT = 20;

export default function SbMbrHomePageFeature({ onClickReadStory, onClickAuthorPage }: SbMbrHomePageFeatureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [connectionsOnly, setConnectionsOnly] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('sb_search_connections_only') === 'true';
    } catch {
      return false;
    }
  });

  // Persist connectionsOnly filter in sessionStorage across the user session
  useEffect(() => {
    try {
      sessionStorage.setItem('sb_search_connections_only', String(connectionsOnly));
    } catch (e) {
      console.warn("Failed to persist connectionsOnly to sessionStorage:", e);
    }
  }, [connectionsOnly]);

  const [userLocation, setUserLocation] = useState<UserLocation | null>(getCachedUserLocation());

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [connectionsMap, setConnectionsMap] = useState<Map<string, { isConnected: boolean; grpName?: string }>>(new Map());
  const [viewerMbrId, setViewerMbrId] = useState<string | null>(null);

  // Detect user location on initial mount and listen for updates
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

  // Load viewer connections and group names
  useEffect(() => {
    let isCancelled = false;

    const loadConnections = async () => {
      let resolvedMbrId: string | null = null;

      // 1. Check cached/stored member
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
        } catch {}
      }

      // 2. Fallback to user session
      if (!resolvedMbrId) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.user_id) {
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) {
                resolvedMbrId = mbrProfile.mbrId;
              }
            }
          } catch (e) {
            console.warn("Could not resolve member profile for connections:", e);
          }
        }
      }

      if (!resolvedMbrId) return;
      if (!isCancelled) setViewerMbrId(resolvedMbrId);

      try {
        const [connections, connectionGrps, groupsGlobal, groupsCustom] = await Promise.all([
          taskApi.getMemberConnections({ mbrId: resolvedMbrId }).catch(() => []),
          taskApi.getMemberConnectionGrps().catch(() => []),
          taskApi.getGroupsGlobal().catch(() => []),
          taskApi.getGroupsCustom(resolvedMbrId).catch(() => [])
        ]);

        if (isCancelled) return;

        // Map Group ID -> Group Name
        const allGroups = [
          ...(groupsGlobal || []),
          ...(groupsCustom || []),
          { grpId: 'g1', grpName: 'Family' },
          { grpId: 'g2', grpName: 'Friends' },
          { grpId: 'g3', grpName: 'Work' },
          { grpId: 'g4', grpName: 'Public' }
        ];
        const groupNameById = new Map<string, string>();
        for (const g of allGroups) {
          if (g.grpId && g.grpName) {
            groupNameById.set(g.grpId, g.grpName);
          }
        }

        // Map Connection ID -> Group Name
        const grpNameByConnId = new Map<string, string>();
        for (const cg of (connectionGrps || [])) {
          if (cg.mbrConnectionId && cg.grpId) {
            const gName = groupNameById.get(cg.grpId);
            if (gName) grpNameByConnId.set(cg.mbrConnectionId, gName);
          }
        }

        // Map target member ID -> { isConnected: true, grpName }
        const map = new Map<string, { isConnected: boolean; grpName?: string }>();
        for (const conn of (connections || [])) {
          if (conn.mbrConnectionMbrId) {
            const gName = grpNameByConnId.get(conn.mbrConnectionId);
            map.set(conn.mbrConnectionMbrId, {
              isConnected: true,
              grpName: gName || 'Connected'
            });
          }
        }

        setConnectionsMap(map);
      } catch (err) {
        console.error("Error loading viewer connections for Member Home:", err);
      }
    };

    loadConnections();

    return () => {
      isCancelled = true;
    };
  }, []);

  // Fetch initial members on load or when searchQuery / userLocation / connectionsOnly / connectionsMap changes
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setHasMore(true);

    const timer = setTimeout(async () => {
      try {
        const queryTrimmed = searchQuery.trim();
        const fetchLimit = connectionsOnly ? 200 : PAGE_SIZE;

        const result = await taskApi.getMembers({
          query: queryTrimmed || undefined,
          proximity: userLocation?.label || undefined,
          proximity_lat: userLocation?.latitude,
          proximity_lng: userLocation?.longitude,
          public_only: true,
          limit: fetchLimit,
          skip: 0
        });

        if (!isCancelled) {
          let uniqueList = Array.from(new Map((result || []).map((m: any) => [m.mbrId || m.id, m])).values());
          
          if (connectionsOnly) {
            uniqueList = uniqueList.filter((m: any) => {
              const targetId = m.mbrId || m.id;
              return connectionsMap.has(targetId) && connectionsMap.get(targetId)?.isConnected === true;
            });
            setMembers(uniqueList);
            setHasMore(false); // All filtered connections returned in one query
          } else {
            setMembers(uniqueList);
            setHasMore((result || []).length === PAGE_SIZE);
          }
        }
      } catch (err) {
        console.error("Failed to fetch members for member home page search:", err);
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
  }, [searchQuery, userLocation, connectionsOnly, connectionsMap]);

  // Handler to fetch another 5 members (only when not in connectionsOnly mode)
  const handleLoadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore || connectionsOnly) return;

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
  }, [loading, loadingMore, hasMore, connectionsOnly, searchQuery, userLocation, members.length]);

  // Infinite scroll listener: auto-fetch another 5 members when scrolling to the bottom until 20 are loaded
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore || connectionsOnly) return;
      if (members.length >= AUTO_SCROLL_LIMIT) return; // Stop auto-scrolling once 20 members are loaded

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;

      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore, loading, loadingMore, hasMore, connectionsOnly, members.length]);

  return (
    <div className="w-full relative">
      {/* 3-Column Responsive Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section */}
        <div className="lg:col-span-3">
          <LeftColumn onClickAuthorPage={onClickAuthorPage} onClickReadStory={onClickReadStory} />
        </div>

        {/* Center Column Section */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            connectionsOnly={connectionsOnly}
            setConnectionsOnly={setConnectionsOnly}
            connectedCount={connectionsMap.size}
            members={members}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            connectionsMap={connectionsMap}
            viewerMbrId={viewerMbrId}
            onLoadMore={handleLoadMore}
            onClickReadStory={onClickReadStory}
            userLocation={userLocation}
            onRefreshLocation={handleRefreshLocation}
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
