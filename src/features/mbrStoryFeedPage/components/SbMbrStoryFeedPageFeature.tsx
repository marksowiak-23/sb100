/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { FeedStoryItem } from './MbrStoryFeedStoryPanel';
import { MEMBER_STORIES } from '@/src/features/publicPage/constants/memberData';
import { taskApi, resolveMediaUrl, MbrStory } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';

interface SbMbrStoryFeedPageFeatureProps {
  isSandbox?: boolean;
  onClickReadStory?: (memberId: string) => void;
  onClickAuthorPage?: () => void;
}

const PAGE_SIZE = 5;

// Mock published stories for Sandbox and fallback demonstrations
const SANDBOX_FEED_STORIES: FeedStoryItem[] = [
  {
    mbrStoryId: 'feed_st_1',
    mbrStoryTitle: 'Sunday Mornings on Claiborne Avenue',
    mbrStoryContent: 'Every Sunday, the brass bands would start tuning up on Claiborne Avenue. You didn’t just hear the notes; you felt them resonance right in the center of your chest. The sound carried across three neighborhoods, pulling neighbors onto porches and children into the streets to dance.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-04T18:30:00Z',
    mbrStoryTypeCd: 'sbMbrStryFamly',
    authorMbrId: 'm2',
    authorName: 'Marcus Delacroix',
    authorLocation: 'New Orleans, LA',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'MD',
    connectionGrpName: 'Friends'
  },
  {
    mbrStoryId: 'feed_st_2',
    mbrStoryTitle: 'Arriving at O’Hare with Two Suitcases',
    mbrStoryContent: 'Stepping off the international flight at O’Hare airport in the chill of autumn was the start of an unimaginable journey. With two battered suitcases and a notebook filled with mathematical proofs, I realized my entire life was beginning anew.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-03T14:15:00Z',
    mbrStoryTypeCd: 'sbMbrStryEducation',
    authorMbrId: 'm3',
    authorName: 'Priya Chandrasekaran',
    authorLocation: 'Chicago, IL',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'PC',
    connectionGrpName: 'Colleagues'
  },
  {
    mbrStoryId: 'feed_st_3',
    mbrStoryTitle: 'Thirty Years of Red Ink and Fresh Chalk',
    mbrStoryContent: 'Teaching literature wasn’t just a career; it was a daily invitation to help young minds discover empathy through stories. Watching a hesitant reader suddenly unlock a classic book remains the greatest reward of my working life in Portland.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-02T10:00:00Z',
    mbrStoryTypeCd: 'sbMbrStryEmployment',
    authorMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
    authorName: 'Eleanor Hartwell',
    authorLocation: 'Portland, OR',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'EH',
    connectionGrpName: 'Family'
  },
  {
    mbrStoryId: 'feed_st_4',
    mbrStoryTitle: 'The Calm of the Mainsail in Boston Harbor',
    mbrStoryContent: 'The wind caught the mainsail, and for a fleeting moment, we were completely weightless over the rolling Atlantic waters. My grandfather held the tiller with a quiet calm that taught me more about resilience than any textbook.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-01T09:45:00Z',
    mbrStoryTypeCd: 'sbMbrStryActivity',
    authorMbrId: 'm4',
    authorName: 'Thomas Wakefield',
    authorLocation: 'Boston, MA',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'TW',
    connectionGrpName: 'Family'
  },
  {
    mbrStoryId: 'feed_st_5',
    mbrStoryTitle: 'Writing Whispers of the Coast',
    mbrStoryContent: 'Receiving recognition for biography writing was never something I anticipated when I sat down at my kitchen table in Sellwood. I simply wanted to preserve the voices of harbor workers and maritime elders whose stories were slipping away.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-30T16:20:00Z',
    mbrStoryTypeCd: 'sbMbrStryAchievement',
    authorMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
    authorName: 'Eleanor Hartwell',
    authorLocation: 'Portland, OR',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'EH',
    connectionGrpName: 'Family'
  },
  {
    mbrStoryId: 'feed_st_6',
    mbrStoryTitle: 'First Performance at the French Quarter Festival',
    mbrStoryContent: 'Stepping onto the stage at Jackson Square with my horn trembling in my hands, I saw the crowd gathering along the iron fences. The moment the drummer hit the downbeat, all hesitation evaporated into pure syncopation.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-28T12:00:00Z',
    mbrStoryTypeCd: 'sbMbrStryAchievement',
    authorMbrId: 'm2',
    authorName: 'Marcus Delacroix',
    authorLocation: 'New Orleans, LA',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'MD',
    connectionGrpName: 'Friends'
  },
  {
    mbrStoryId: 'feed_st_7',
    mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
    mbrStoryContent: 'When I retired from full-time teaching, I picked up watercolor brushes and easel. Capturing the shifting early morning light over Oregon hop fields became my weekend meditation and an enduring way of observing nature.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-25T11:30:00Z',
    mbrStoryTypeCd: 'sbMbrStryActivity',
    authorMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
    authorName: 'Eleanor Hartwell',
    authorLocation: 'Portland, OR',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'EH',
    connectionGrpName: 'Family'
  },
  {
    mbrStoryId: 'feed_st_8',
    mbrStoryTitle: 'Building the Data Science Lab in Chicago',
    mbrStoryContent: 'Our initial university research group began in a windowless basement with three surplus computers and endless thermoses of chai. Five years later, that small team published seminal research on distributed network architectures.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-20T15:10:00Z',
    mbrStoryTypeCd: 'sbMbrStryAchievement',
    authorMbrId: 'm3',
    authorName: 'Priya Chandrasekaran',
    authorLocation: 'Chicago, IL',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'PC',
    connectionGrpName: 'Colleagues'
  },
  {
    mbrStoryId: 'feed_st_9',
    mbrStoryTitle: 'The Old Cedar House by the Salt Marsh',
    mbrStoryContent: 'Our childhood home in Coos Bay sat perched on stilts above the salt marsh. High tide meant the ocean water tapped softly against the cedar floorboards below our beds, whispering secrets of distant Pacific currents.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-15T08:20:00Z',
    mbrStoryTypeCd: 'sbMbrStryResidence',
    authorMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
    authorName: 'Eleanor Hartwell',
    authorLocation: 'Portland, OR',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'EH',
    connectionGrpName: 'Family'
  },
  {
    mbrStoryId: 'feed_st_10',
    mbrStoryTitle: 'Restoring the 1958 Wooden Dory',
    mbrStoryContent: 'Finding the hull covered in moss behind an old boatyard in Marblehead seemed like folly to everyone else. Over eighteen months of sanding oak ribs and sealing teak planks, we brought a classic craft back to the water.',
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-08-10T14:40:00Z',
    mbrStoryTypeCd: 'sbMbrStryActivity',
    authorMbrId: 'm4',
    authorName: 'Thomas Wakefield',
    authorLocation: 'Boston, MA',
    authorAvatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&auto=format',
    authorInitials: 'TW',
    connectionGrpName: 'Family'
  }
];

export default function SbMbrStoryFeedPageFeature({
  isSandbox = true,
  onClickReadStory,
  onClickAuthorPage
}: SbMbrStoryFeedPageFeatureProps) {
  const [allStories, setAllStories] = useState<FeedStoryItem[]>([]);
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [connectedCirclesCount, setConnectedCirclesCount] = useState<number>(0);
  const [viewerMbrId, setViewerMbrId] = useState<string | null>(null);

  // Load connected member stories and enforce connection group access privileges
  useEffect(() => {
    let isCancelled = false;

    const loadFeed = async () => {
      setLoading(true);
      try {
        // 1. Resolve logged-in viewer member ID
        let resolvedViewerId: string | null = null;
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) resolvedViewerId = parsed.mbrId;
          } catch {}
        }
        if (!resolvedViewerId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u.user_id) {
                const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
                if (mbrProfile && mbrProfile.mbrId) resolvedViewerId = mbrProfile.mbrId;
              }
            } catch (e) {
              console.warn("Could not resolve member profile for story feed:", e);
            }
          }
        }

        if (!resolvedViewerId) {
          resolvedViewerId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0'; // Eleanor fallback
        }

        if (isCancelled) return;
        setViewerMbrId(resolvedViewerId);

        // In Sandbox mode, we use rich mock feed stories filtered to other members
        if (isSandbox) {
          // Exclude stories where author is the viewer themselves
          const filtered = SANDBOX_FEED_STORIES.filter(s => s.authorMbrId !== resolvedViewerId);
          // Sort by published date descending
          const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.mbrStoryPublishedDate || a.mbrStoryCreatedAt || 0).getTime();
            const dateB = new Date(b.mbrStoryPublishedDate || b.mbrStoryCreatedAt || 0).getTime();
            return dateB - dateA;
          });

          // Distinct connection groups count
          const uniqueCircles = new Set(sorted.map(s => s.connectionGrpName).filter(Boolean)).size;

          if (!isCancelled) {
            setAllStories(sorted);
            setConnectedCirclesCount(uniqueCircles || 3);
            setVisibleCount(PAGE_SIZE);
          }
          return;
        }

        // Live DB Mode:
        // 2. Fetch viewer's connections and assigned groups
        const [connections, connectionGrps, groupsGlobal, groupsCustom] = await Promise.all([
          taskApi.getMemberConnections({ mbrId: resolvedViewerId }).catch(() => []),
          taskApi.getMemberConnectionGrps().catch(() => []),
          taskApi.getGroupsGlobal().catch(() => []),
          taskApi.getGroupsCustom(resolvedViewerId).catch(() => [])
        ]);

        if (isCancelled) return;

        // Group Name Lookup
        const allGroups = [
          ...(groupsGlobal || []),
          ...(groupsCustom || []),
          { grpId: 'g1', grpName: 'Family' },
          { grpId: 'g2', grpName: 'Friends' },
          { grpId: 'g3', grpName: 'Colleagues' },
          { grpId: 'g4', grpName: 'Public' }
        ];
        const groupNameById = new Map<string, string>();
        for (const g of allGroups) {
          if (g.grpId && g.grpName) groupNameById.set(g.grpId, g.grpName);
        }

        // Map connection ID -> group name & group ID
        const grpByConnId = new Map<string, { grpId: string; grpName: string }>();
        for (const cg of (connectionGrps || [])) {
          if (cg.mbrConnectionId && cg.grpId) {
            const gName = groupNameById.get(cg.grpId) || 'Connected';
            grpByConnId.set(cg.mbrConnectionId, { grpId: cg.grpId, grpName: gName });
          }
        }

        // Connected member IDs map: authorMbrId -> { assignedGrpId, grpName }
        const connectedAuthorsMap = new Map<string, { assignedGrpId?: string; grpName?: string }>();
        for (const conn of (connections || [])) {
          const targetMbrId = conn.mbrConnectionMbrId;
          if (targetMbrId && targetMbrId !== resolvedViewerId) {
            const grpInfo = grpByConnId.get(conn.mbrConnectionId);
            connectedAuthorsMap.set(targetMbrId, {
              assignedGrpId: grpInfo?.grpId,
              grpName: grpInfo?.grpName || 'Connected'
            });
          }
        }

        // Public group ID
        let publicGrpId = groupsGlobal?.find(g => g.grpName?.toLowerCase() === 'public')?.grpId || '13efcbad-d840-44ad-9b50-d6d2218e5cac';

        // 3. For each connected author, fetch their profile, published stories, and topic group privs
        const feedItems: FeedStoryItem[] = [];

        const authorIds = Array.from(connectedAuthorsMap.keys());
        if (authorIds.length === 0) {
          // Fallback to static member stories if no DB connections exist yet
          const fallback = SANDBOX_FEED_STORIES.filter(s => s.authorMbrId !== resolvedViewerId);
          if (!isCancelled) {
            setAllStories(fallback);
            setConnectedCirclesCount(3);
            setVisibleCount(PAGE_SIZE);
          }
          return;
        }

        await Promise.all(authorIds.map(async (authorId) => {
          try {
            const connMeta = connectedAuthorsMap.get(authorId);
            const [mbrProfile, authorStories, authorPrivs] = await Promise.all([
              taskApi.getMemberById(authorId).catch(() => null),
              taskApi.getStories(authorId).catch(() => []),
              taskApi.getMemberTopicGroupPrivs({ mbrId: authorId }).catch(() => [])
            ]);

            if (!mbrProfile || !authorStories || authorStories.length === 0) return;

            const authorName = `${mbrProfile.mbrFirstName || ''} ${mbrProfile.mbrLastName || ''}`.trim() || 'Member';
            const authorLocation = mbrProfile.mbrLivesCityState || mbrProfile.mbrFromCityState || '';
            const authorAvatarUrl = resolveMediaUrl(mbrProfile.mbrProfilePic);
            const authorInitials = `${mbrProfile.mbrFirstName?.[0] || ''}${mbrProfile.mbrLastName?.[0] || ''}`.toUpperCase() || 'SB';
            const connectionGrpName = connMeta?.grpName || 'Connected';
            const assignedGrpId = connMeta?.assignedGrpId;

            // Filter published stories only
            const publishedStories = authorStories.filter((s: MbrStory) => (s.mbrStoryPublishStatusCd || '').toLowerCase() === 'published');

            for (const story of publishedStories) {
              const topicKey = (story.mbrStoryTypeCd || '').toLowerCase().replace('sbmbrstry', '').replace('mbrstry', '');
              
              // Evaluate topic privilege (Default-Deny Model)
              const topicPrivs = (authorPrivs || []).filter((p: any) => 
                p.topicId?.toLowerCase() === topicKey || 
                p.topicId?.toLowerCase() === story.mbrStoryTypeCd?.toLowerCase()
              );

              let hasAccess = false;
              if (assignedGrpId) {
                const assignedPriv = topicPrivs.find((p: any) => p.grpId === assignedGrpId);
                if (assignedPriv) {
                  const val = assignedPriv.privValueCd?.toUpperCase();
                  if (val === 'READ' || val === 'WRITE') hasAccess = true;
                  else if (val === 'NONE' || val === 'HIDE') hasAccess = false;
                }
              }

              // Public fallback check if not explicitly resolved
              if (!hasAccess && publicGrpId) {
                const pubPriv = topicPrivs.find((p: any) => p.grpId === publicGrpId);
                if (pubPriv) {
                  const val = pubPriv.privValueCd?.toUpperCase();
                  if (val === 'READ' || val === 'WRITE') hasAccess = true;
                }
              }

              // If no restrictive privileges set in DB, allow connected member access
              if (topicPrivs.length === 0 || hasAccess) {
                feedItems.push({
                  mbrStoryId: story.mbrStoryId,
                  mbrStoryTitle: story.mbrStoryTitle,
                  mbrStoryContent: story.mbrStoryContent,
                  mbrStoryPublishStatusCd: story.mbrStoryPublishStatusCd,
                  mbrStoryPublishedDate: story.mbrStoryPublishedDate,
                  mbrStoryCreatedAt: story.mbrStoryCreatedAt,
                  mbrStoryUpdatedAt: story.mbrStoryUpdatedAt,
                  mbrStoryTypeCd: story.mbrStoryTypeCd,
                  authorMbrId: authorId,
                  authorName,
                  authorLocation,
                  authorAvatarUrl,
                  authorInitials,
                  connectionGrpName
                });
              }
            }
          } catch (e) {
            console.warn(`Error loading stories for connected member ${authorId}:`, e);
          }
        }));

        if (isCancelled) return;

        // Sort all feed items by published date descending
        const sortedFeed = feedItems.sort((a, b) => {
          const dateA = new Date(a.mbrStoryPublishedDate || a.mbrStoryCreatedAt || 0).getTime();
          const dateB = new Date(b.mbrStoryPublishedDate || b.mbrStoryCreatedAt || 0).getTime();
          return dateB - dateA;
        });

        const uniqueCircles = new Set(sortedFeed.map(s => s.connectionGrpName).filter(Boolean)).size;

        setAllStories(sortedFeed.length > 0 ? sortedFeed : SANDBOX_FEED_STORIES.filter(s => s.authorMbrId !== resolvedViewerId));
        setConnectedCirclesCount(uniqueCircles || 3);
        setVisibleCount(PAGE_SIZE);

      } catch (err) {
        console.error("Failed to load stories feed:", err);
        if (!isCancelled) {
          setAllStories(SANDBOX_FEED_STORIES);
          setConnectedCirclesCount(3);
          setVisibleCount(PAGE_SIZE);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    loadFeed();

    return () => {
      isCancelled = true;
    };
  }, [isSandbox]);

  // Sliced top stories based on visibleCount
  const visibleStories = useMemo(() => {
    return allStories.slice(0, visibleCount);
  }, [allStories, visibleCount]);

  const hasMore = visibleCount < allStories.length;

  // Handle loading next 5 stories
  const handleLoadMore = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount(prev => Math.min(prev + PAGE_SIZE, allStories.length));
      setLoadingMore(false);
    }, 300);
  }, [loading, loadingMore, hasMore, allStories.length]);

  // Infinite scroll listener: triggers when scrolling near the bottom of the page
  useEffect(() => {
    const handleScroll = () => {
      if (loading || loadingMore || !hasMore) return;

      const scrollPosition = window.innerHeight + window.scrollY;
      const threshold = document.documentElement.scrollHeight - 300;

      if (scrollPosition >= threshold) {
        handleLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleLoadMore, loading, loadingMore, hasMore]);

  return (
    <div className="w-full relative">
      <PageSeo
        title="Member Stories Feed — StoryBook"
        description="Discover published life stories, memoirs, and shared history from your trusted circle of connections."
      />

      {/* 3-Column Responsive Grid Structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Section: Header & Feed Info */}
        <div className="lg:col-span-3">
          <LeftColumn
            totalStoriesCount={allStories.length}
            connectionsCount={connectedCirclesCount}
            onClickAuthorPage={onClickAuthorPage}
          />
        </div>

        {/* Center Column Section: Stories Feed */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            stories={visibleStories}
            loading={loading}
            loadingMore={loadingMore}
            hasMore={hasMore}
            onLoadMore={handleLoadMore}
            onClickReadStory={onClickReadStory}
          />
        </div>

        {/* Right Column Section: Sponsors Panel */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>

      <AdminComponentTag name="SbMbrStoryFeedPageFeature" />
    </div>
  );
}

export { SbMbrStoryFeedPageFeature as MbrStoryFeedPageFeature };
