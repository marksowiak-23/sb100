/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { taskApi, resolveMediaUrl, MbrStory } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';
import { storyCache } from '@/src/utils/storyCache';

interface SbStoryPageFeatureProps {
  storyId?: string | null;
  memberId?: string | null;
  isSandbox?: boolean;
  onClickBack?: () => void;
  onClickViewAuthorStorybook?: (authorId: string) => void;
}

// Fallback sandbox stories for demonstration
const SANDBOX_STORIES: Record<string, any> = {
  feed_st_1: {
    mbrStoryId: 'feed_st_1',
    mbrStoryTitle: 'Sunday Mornings on Claiborne Avenue',
    mbrStoryContent: `Every Sunday, the brass bands would start tuning up on Claiborne Avenue. You didn’t just hear the notes; you felt them resonance right in the center of your chest. The sound carried across three neighborhoods, pulling neighbors onto porches and children into the streets to dance.\n\nMy grandfather would sit on the front steps with his cup of chicory coffee, tapping his foot in time. He used to say that a city without music was just a collection of buildings, but New Orleans was alive because its streets had a heartbeat.\n\nLooking back now, those Sunday mornings formed the foundation of everything I understand about community, rhythm, and belonging. It was never just about the music; it was about the collective joy of living together.`,
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-04T18:30:00Z',
    mbrStoryTypeCd: 'Family',
    authorMbrId: 'm2',
    authorName: 'Marcus Delacroix',
    authorLocation: 'New Orleans, LA',
    authorAvatarUrl: '/assets/avatars/default_avatar_male_1.jpg',
    authorInitials: 'MD',
    connectionGrpName: 'Friends'
  },
  feed_st_2: {
    mbrStoryId: 'feed_st_2',
    mbrStoryTitle: 'Arriving at O’Hare with Two Suitcases',
    mbrStoryContent: `Stepping off the international flight at O’Hare airport in the chill of autumn was the start of an unimaginable journey. With two battered suitcases and a notebook filled with mathematical proofs, I realized my entire life was beginning anew.\n\nThe scale of Chicago was overwhelming. The highways were wider than any road I had ever seen, the buildings reached into the low clouds, and everyone moved with a purposeful briskness. In my pocket was the acceptance letter from the university department, creased from being read a hundred times.\n\nThose first few semesters were difficult, but every late night in the laboratory taught me resilience. Science became my universal language, and Chicago slowly became my home.`,
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-03T14:15:00Z',
    mbrStoryTypeCd: 'Education',
    authorMbrId: 'm3',
    authorName: 'Priya Chandrasekaran',
    authorLocation: 'Chicago, IL',
    authorAvatarUrl: '/assets/avatars/default_avatar_female_2.jpg',
    authorInitials: 'PC',
    connectionGrpName: 'Colleagues'
  },
  feed_st_3: {
    mbrStoryId: 'feed_st_3',
    mbrStoryTitle: 'Thirty Years of Red Ink and Fresh Chalk',
    mbrStoryContent: `Teaching literature wasn’t just a career; it was a daily invitation to help young minds discover empathy through stories. Watching a hesitant reader suddenly unlock a classic book remains the greatest reward of my working life in Portland.\n\nEvery September brought thirty new faces, each carrying their own untold stories, fears, and hopes into room 204. We read Steinbeck, Morrison, and Frost, dissecting sentences not just for grammar, but for truth.\n\nRetirement came softly, but the memories of those classroom discussions still echo whenever I open a well-loved volume on my own bookshelf.`,
    mbrStoryPublishStatusCd: 'Published',
    mbrStoryPublishedDate: '2026-09-02T10:00:00Z',
    mbrStoryTypeCd: 'Employment',
    authorMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
    authorName: 'Eleanor Hartwell',
    authorLocation: 'Portland, OR',
    authorAvatarUrl: '/assets/avatars/default_avatar_female_1.jpg',
    authorInitials: 'EH',
    connectionGrpName: 'Family'
  }
};

export default function SbStoryPageFeature({
  storyId,
  memberId,
  isSandbox = false,
  onClickBack,
  onClickViewAuthorStorybook
}: SbStoryPageFeatureProps) {
  const initialCachedStory = storyId ? storyCache.get(storyId) : null;
  const [story, setStory] = useState<any>(() => initialCachedStory);
  const [authorProfile, setAuthorProfile] = useState<any>(() => {
    const authorId = memberId || initialCachedStory?.mbrMbrId || initialCachedStory?.authorMbrId;
    return authorId ? storyCache.getAuthorProfile(authorId) : null;
  });
  const [connectionGrpName, setConnectionGrpName] = useState<string>(() => initialCachedStory?.connectionGrpName || 'Public');
  const [isLoading, setIsLoading] = useState<boolean>(() => !initialCachedStory && !isSandbox);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (storyId) {
      try {
        const raw = sessionStorage.getItem('sb_read_stories');
        const list: string[] = raw ? JSON.parse(raw) : [];
        if (!list.includes(storyId)) {
          list.push(storyId);
          sessionStorage.setItem('sb_read_stories', JSON.stringify(list));
        }
      } catch {}
    }
  }, [storyId]);

  useEffect(() => {
    let isCancelled = false;

    const loadStoryDetails = async () => {
      // 1. Resolve viewer ID synchronously from session storage if possible
      let resolvedViewerId: string = '299da1e4-a233-4333-ab7c-b9ca64b6b7d4';
      try {
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) resolvedViewerId = parsed.mbrId;
        } else {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            if (u.mbrId) resolvedViewerId = u.mbrId;
          }
        }
      } catch {}

      // Sandbox Mode fallback
      if (isSandbox) {
        const mock = (storyId && SANDBOX_STORIES[storyId]) || Object.values(SANDBOX_STORIES)[0];
        if (!isCancelled) {
          setStory(mock);
          setAuthorProfile({
            mbrFirstName: mock.authorName.split(' ')[0],
            mbrLastName: mock.authorName.split(' ')[1] || '',
            mbrLivesCityState: mock.authorLocation,
            mbrProfilePic: mock.authorAvatarUrl
          });
          setConnectionGrpName(mock.connectionGrpName || 'Connected');
          setIsLoading(false);
        }
        return;
      }

      // 2. Check cache first for instant render
      let loadedStory: MbrStory | null = storyId ? storyCache.get(storyId) : null;

      // If we don't have a cached story, show loading indicator while fetching
      if (!loadedStory) {
        setIsLoading(true);
      } else {
        setIsLoading(false);
      }

      // Fetch live story record
      try {
        if (storyId) {
          const apiStory = await taskApi.getStoryById(storyId, resolvedViewerId);
          if (apiStory) {
            loadedStory = apiStory;
            storyCache.set(storyId, apiStory);
          }
        }
      } catch (err: any) {
        const status = err?.status || err?.response?.status;
        if (status === 403 || err?.message?.includes('403') || err?.message?.includes('permission')) {
          if (!isCancelled) {
            setIsRestricted(true);
            setIsLoading(false);
          }
          return;
        }
      }

      // Fallback: If storyId wasn't found directly, try author's stories
      const targetAuthorId = loadedStory?.mbrMbrId || loadedStory?.mbrId || memberId;
      if (!loadedStory && targetAuthorId) {
        try {
          const stories = await taskApi.getStories(targetAuthorId);
          loadedStory = stories.find(s => s.mbrStoryId === storyId) || stories[0] || null;
          if (loadedStory?.mbrStoryId) {
            storyCache.set(loadedStory.mbrStoryId, loadedStory);
          }
        } catch (e) {
          console.warn(`Could not load author stories for ${targetAuthorId}:`, e);
        }
      }

      if (!loadedStory) {
        if (!isCancelled) {
          setStory(null);
          setIsLoading(false);
        }
        return;
      }

      // CRITICAL UNBLOCK: Update story content immediately and dismiss loader
      if (!isCancelled) {
        setStory(loadedStory);
        setIsLoading(false);
      }

      // Record story read in background (non-blocking)
      if (loadedStory.mbrStoryId && resolvedViewerId) {
        taskApi.recordStoryRead({ mbrStoryId: loadedStory.mbrStoryId, mbrId: resolvedViewerId }).catch(() => {});
      }

      const resolvedAuthorId = loadedStory.mbrMbrId || loadedStory.mbrId || memberId;
      const isSelf = Boolean(resolvedAuthorId && resolvedViewerId && resolvedAuthorId === resolvedViewerId);

      // 3. Background Metadata: Resolve Author Profile & Connection Badge non-blockingly
      try {
        let profile = resolvedAuthorId ? storyCache.getAuthorProfile(resolvedAuthorId) : null;
        if (!profile && resolvedAuthorId) {
          profile = await taskApi.getMemberById(resolvedAuthorId).catch(() => null);
          if (profile) storyCache.setAuthorProfile(resolvedAuthorId, profile);
        }
        if (profile && !isCancelled) {
          setAuthorProfile(profile);
        }

        if (isSelf) {
          if (!isCancelled) setConnectionGrpName('Author');
        } else if (resolvedAuthorId && resolvedViewerId) {
          // Fetch viewer connection & connection groups concurrently
          const [viewerConns, connectionGrps, globalGroups] = await Promise.all([
            taskApi.getMemberConnections({ mbrId: resolvedViewerId, connectedMbrId: resolvedAuthorId }).catch(() => []),
            taskApi.getMemberConnectionGrps().catch(() => []),
            storyCache.getGlobalGroups() ? Promise.resolve(storyCache.getGlobalGroups()!) : taskApi.getGroupsGlobal().catch(() => [])
          ]);

          if (globalGroups && !storyCache.getGlobalGroups()) {
            storyCache.setGlobalGroups(globalGroups);
          }

          const groupNameById = new Map<string, string>();
          (globalGroups || []).forEach((g: any) => {
            if (g.grpId && g.grpName) groupNameById.set(g.grpId, g.grpName);
          });
          groupNameById.set('g1', 'Family');
          groupNameById.set('g2', 'Friends');
          groupNameById.set('g3', 'Colleagues');
          groupNameById.set('g4', 'Public');

          const viewerToAuthorConn = (viewerConns || [])[0];
          const viewerConnGrp = viewerToAuthorConn
            ? (connectionGrps || []).find(cg => cg.mbrConnectionId === viewerToAuthorConn.mbrConnectionId)
            : undefined;

          const badge = (viewerConnGrp?.grpId && groupNameById.get(viewerConnGrp.grpId)) || 'Public';
          if (!isCancelled) {
            setConnectionGrpName(badge);
          }
        }
      } catch (e) {
        console.warn('Background metadata resolution error:', e);
      }
    };

    loadStoryDetails();

    return () => {
      isCancelled = true;
    };
  }, [storyId, memberId, isSandbox]);

  const authorName = authorProfile
    ? `${authorProfile.mbrFirstName || ''} ${authorProfile.mbrLastName || ''}`.trim() || 'Member Author'
    : story?.authorName || 'Author';

  const authorLocation = authorProfile?.mbrLivesCityState || authorProfile?.mbrFromCityState || story?.authorLocation;
  const authorAvatarUrl = resolveMediaUrl(authorProfile?.mbrProfilePic || story?.authorAvatarUrl);
  const authorInitials = `${authorProfile?.mbrFirstName?.[0] || ''}${authorProfile?.mbrLastName?.[0] || ''}`.toUpperCase() || story?.authorInitials || 'SB';

  return (
    <div className="w-full relative">
      <PageSeo
        title={`${story?.mbrStoryTitle || 'Story'} | BackStory`}
        description={story?.mbrStoryContent?.slice(0, 150) || "Read personal memoir chapters on BackStory."}
      />

      {/* 3-Column Responsive Grid Structure */}
      {/* lg:grid-cols-12 distributes proportions as 3/12 (Left), 6/12 (Center), and 3/12 (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        {/* Left Column */}
        <div className="hidden lg:block lg:col-span-3">
          <LeftColumn
            topicName={story?.mbrStoryTypeCd}
            onClickBack={onClickBack}
          />
        </div>

        {/* Center Column */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            storyId={story?.mbrStoryId || storyId}
            storyTitle={story?.mbrStoryTitle}
            storyContent={story?.mbrStoryContent}
            storyTopic={story?.mbrStoryTypeCd}
            mbrStoryLayoutCd={story?.mbrStoryLayoutCd}
            mbrStoryHeaderPhotoUrl={story?.mbrStoryHeaderPhotoUrl}
            mbrStoryHeaderPhotoCaption={story?.mbrStoryHeaderPhotoCaption}
            mbrStoryHeaderPhotoStyleCd={story?.mbrStoryHeaderPhotoStyleCd}
            publishedDate={story?.mbrStoryPublishedDate || story?.mbrStoryCreatedAt}
            authorName={authorName}
            authorMbrId={story?.mbrMbrId || story?.authorMbrId}
            authorLocation={authorLocation}
            authorAvatarUrl={authorAvatarUrl}
            authorInitials={authorInitials}
            connectionGrpName={connectionGrpName}
            isLoading={isLoading}
            isRestricted={isRestricted}
            onClickBack={onClickBack}
            onClickViewAuthorStorybook={
              onClickViewAuthorStorybook && (story?.mbrMbrId || story?.authorMbrId)
                ? () => onClickViewAuthorStorybook(story?.mbrMbrId || story?.authorMbrId)
                : undefined
            }
          />
        </div>

        {/* Right Column */}
        <div className="hidden lg:block lg:col-span-3">
          <RightColumn />
        </div>
      </div>

      <AdminComponentTag name="sbStoryPageFeature" />
    </div>
  );
}

export { SbStoryPageFeature as StoryPageFeature, SbStoryPageFeature };
