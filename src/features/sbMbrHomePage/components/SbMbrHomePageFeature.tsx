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

interface SbMbrHomePageFeatureProps {
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: () => void;
}

export default function SbMbrHomePageFeature({ onClickReadStory, onClickAuthorPage }: SbMbrHomePageFeatureProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [connectionsMap, setConnectionsMap] = useState<Map<string, { isConnected: boolean; grpName?: string }>>(new Map());
  const [viewerMbrId, setViewerMbrId] = useState<string | null>(null);

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

  // Fetch initial 5 members on load, or search by query (name, location) on query change
  useEffect(() => {
    let isCancelled = false;
    setLoading(true);
    setHasMore(true);

    const timer = setTimeout(async () => {
      try {
        const queryTrimmed = searchQuery.trim();
        const result = await taskApi.getMembers({
          query: queryTrimmed || undefined,
          limit: 5,
          skip: 0
        });

        if (!isCancelled) {
          const uniqueList = Array.from(new Map((result || []).map((m: any) => [m.mbrId || m.id, m])).values());
          setMembers(uniqueList);
          if ((result || []).length < 5) {
            setHasMore(false);
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
  }, [searchQuery]);

  // Fetch 5 more members when the user scrolls to the bottom of the page
  const loadMoreMembers = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const queryTrimmed = searchQuery.trim();
      const currentSkip = members.length;
      const result = await taskApi.getMembers({
        query: queryTrimmed || undefined,
        limit: 5,
        skip: currentSkip
      });

      const fetchedList = result || [];
      if (fetchedList.length < 5) {
        setHasMore(false);
      }

      if (fetchedList.length > 0) {
        setMembers(prev => {
          const existingIds = new Set(prev.map((m: any) => m.mbrId || m.id));
          const newUnique = fetchedList.filter((m: any) => !existingIds.has(m.mbrId || m.id));
          if (newUnique.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...newUnique];
        });
      }
    } catch (err) {
      console.error("Failed to load more members:", err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [loading, loadingMore, hasMore, searchQuery, members.length]);

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
            loadingMore={loadingMore}
            hasMore={hasMore}
            connectionsMap={connectionsMap}
            viewerMbrId={viewerMbrId}
            onLoadMore={loadMoreMembers}
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
