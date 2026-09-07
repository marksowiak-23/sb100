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
    authorAvatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop&auto=format',
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
    authorAvatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=120&h=120&fit=crop&auto=format',
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
    authorAvatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&auto=format',
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
  const [story, setStory] = useState<any>(null);
  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [connectionGrpName, setConnectionGrpName] = useState<string>('Public');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRestricted, setIsRestricted] = useState<boolean>(false);

  useEffect(() => {
    let isCancelled = false;

    const loadStoryDetails = async () => {
      setIsLoading(true);
      setIsRestricted(false);

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
                if (mbrProfile?.mbrId) resolvedViewerId = mbrProfile.mbrId;
              }
            } catch {}
          }
        }
        if (!resolvedViewerId) {
          resolvedViewerId = '299da1e4-a233-4333-ab7c-b9ca64b6b7d4'; // Mark Sowiak fallback
        }

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

        // Live DB Mode
        // 2. Fetch the story
        let loadedStory: MbrStory | null = null;
        if (storyId) {
          try {
            loadedStory = await taskApi.getStoryById(storyId, resolvedViewerId);
          } catch (e) {
            console.warn(`Could not load story by ID ${storyId}:`, e);
          }
        }

        // If storyId wasn't direct, try fetching member's published stories
        const targetAuthorId = loadedStory?.mbrMbrId || loadedStory?.mbrId || memberId;
        if (!loadedStory && targetAuthorId) {
          try {
            const stories = await taskApi.getStories(targetAuthorId);
            loadedStory = stories.find(s => s.mbrStoryId === storyId) || stories[0] || null;
          } catch (e) {
            console.warn(`Could not load author stories for ${targetAuthorId}:`, e);
          }
        }

        if (!loadedStory) {
          // Check sandbox fallback if DB empty
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

        const resolvedAuthorId = loadedStory.mbrMbrId || loadedStory.mbrId;

        // 3. Fetch author profile, connections, topic privileges, and topic catalogue
        const [
          profile,
          authorConns,
          viewerConns,
          connectionGrps,
          topicsList,
          authorPrivs,
          groupsGlobal,
          groupsCustom
        ] = await Promise.all([
          taskApi.getMemberById(resolvedAuthorId).catch(() => null),
          taskApi.getMemberConnections({ mbrId: resolvedAuthorId, connectedMbrId: resolvedViewerId }).catch(() => []),
          taskApi.getMemberConnections({ mbrId: resolvedViewerId, connectedMbrId: resolvedAuthorId }).catch(() => []),
          taskApi.getMemberConnectionGrps().catch(() => []),
          taskApi.getTopics().catch(() => []),
          taskApi.getMemberTopicGroupPrivs({ mbrId: resolvedAuthorId }).catch(() => []),
          taskApi.getGroupsGlobal().catch(() => []),
          taskApi.getGroupsCustom(resolvedViewerId).catch(() => [])
        ]);

        if (isCancelled) return;

        // 4. Resolve Connection Badging & Assigned Group ID
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

        const authorToViewerConn = (authorConns || [])[0];
        const viewerToAuthorConn = (viewerConns || [])[0];

        const authorConnGrp = authorToViewerConn
          ? (connectionGrps || []).find(cg => cg.mbrConnectionId === authorToViewerConn.mbrConnectionId)
          : undefined;
        const viewerConnGrp = viewerToAuthorConn
          ? (connectionGrps || []).find(cg => cg.mbrConnectionId === viewerToAuthorConn.mbrConnectionId)
          : undefined;

        const assignedGrpId = authorConnGrp?.grpId || viewerConnGrp?.grpId;
        const resolvedBadgeName = (viewerConnGrp?.grpId && groupNameById.get(viewerConnGrp.grpId))
          || (authorConnGrp?.grpId && groupNameById.get(authorConnGrp.grpId))
          || 'Public';

        let publicGrpId = groupsGlobal?.find(g => g.grpName?.toLowerCase() === 'public')?.grpId || '13efcbad-d840-44ad-9b50-d6d2218e5cac';

        // 5. Evaluate Privacy for this Story
        // Self-author bypass
        const isSelf = resolvedAuthorId === resolvedViewerId;
        let hasAccess = isSelf;
        let hasDenial = false;

        const normalizeTopicKey = (typeCd?: string): string => {
          if (!typeCd) return '';
          const clean = typeCd.toLowerCase().replace('sbmbrstry', '').replace('mbrstry', '');
          if (clean === 'famly' || clean === 'family') return 'family';
          if (clean === 'residence' || clean === 'residencies') return 'residencies';
          if (clean === 'achievement' || clean === 'achievements') return 'achievements';
          if (clean === 'education') return 'education';
          if (clean === 'employment' || clean === 'career') return 'employment';
          if (clean === 'activity' || clean === 'activities' || clean === 'hobbies') return 'hobbies';
          return clean;
        };

        const normStoryTopic = normalizeTopicKey(loadedStory.mbrStoryTypeCd);
        const matchedTopic = (topicsList || []).find(t => 
          t.topicId === loadedStory?.mbrStoryTypeCd || 
          normalizeTopicKey(t.topicName) === normStoryTopic
        );
        const matchedTopicId = matchedTopic?.topicId;

        const topicPrivs = (authorPrivs || []).filter((p: any) => 
          (matchedTopicId && p.topicId === matchedTopicId) ||
          normalizeTopicKey(p.topicId) === normStoryTopic ||
          (matchedTopic?.topicName && p.topicId?.toLowerCase() === matchedTopic.topicName.toLowerCase())
        );

        if (!hasAccess && assignedGrpId) {
          const assignedPriv = topicPrivs.find((p: any) => p.grpId === assignedGrpId);
          if (assignedPriv) {
            const val = assignedPriv.privValueCd?.toUpperCase();
            if (val === 'READ' || val === 'WRITE') hasAccess = true;
            else if (val === 'NONE' || val === 'HIDE') hasDenial = true;
          }
        }

        if (!hasAccess && !hasDenial && publicGrpId) {
          const pubPriv = topicPrivs.find((p: any) => p.grpId === publicGrpId);
          if (pubPriv) {
            const val = pubPriv.privValueCd?.toUpperCase();
            if (val === 'READ' || val === 'WRITE') hasAccess = true;
          }
        }

        if (!isCancelled) {
          if (!hasAccess) {
            setIsRestricted(true);
          } else {
            setStory({
              ...loadedStory,
              mbrStoryTypeCd: matchedTopic?.topicName || loadedStory.mbrStoryTypeCd
            });
            setAuthorProfile(profile);
            setConnectionGrpName(resolvedBadgeName);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Failed to load story page details:", err);
        if (!isCancelled) {
          setIsLoading(false);
        }
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
    <div className="min-h-screen pb-16">
      <PageSeo
        title={`${story?.mbrStoryTitle || 'Story'} | StoryBook`}
        description={story?.mbrStoryContent?.slice(0, 150) || "Read personal memoir chapters on StoryBook."}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Left Column */}
          <LeftColumn
            authorName={authorName}
            authorLocation={authorLocation}
            authorAvatarUrl={authorAvatarUrl}
            authorInitials={authorInitials}
            authorWorksAt={authorProfile?.mbrWorkAt}
            authorStudiedAt={authorProfile?.mbrStudiedAt}
            authorIntroduction={authorProfile?.mbrIntroduction}
            connectionGrpName={connectionGrpName}
            topicName={story?.mbrStoryTypeCd}
            onClickBack={onClickBack}
            onClickViewAuthorStorybook={
              onClickViewAuthorStorybook && (story?.mbrMbrId || story?.authorMbrId)
                ? () => onClickViewAuthorStorybook(story?.mbrMbrId || story?.authorMbrId)
                : undefined
            }
          />

          {/* Center Column */}
          <CenterColumn
            storyTitle={story?.mbrStoryTitle}
            storyContent={story?.mbrStoryContent}
            storyTopic={story?.mbrStoryTypeCd}
            publishedDate={story?.mbrStoryPublishedDate || story?.mbrStoryCreatedAt}
            authorName={authorName}
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

          {/* Right Column */}
          <RightColumn />
        </div>
      </div>

      <AdminComponentTag name="sbStoryPageFeature" />
    </div>
  );
}

export { SbStoryPageFeature as StoryPageFeature, SbStoryPageFeature };
