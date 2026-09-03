/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import LeftColumn from './LeftColumn';
import CenterColumn from './CenterColumn';
import RightColumn from './RightColumn';
import { MEMBER_STORIES, MemberStory } from '@/src/features/publicPage/constants/memberData';
import { taskApi, resolveMediaUrl } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import PageSeo from '@/src/components/PageSeo';

interface SbMbrStoryPageFeatureProps {
  memberId: string;
  onClickBack: () => void;
}

const STORY_CONTENTS: Record<string, Record<string, string[]>> = {
  m1: {
    introduction: [
      "Eleanor Hartwell was born in the coastal town of Coos Bay, Oregon, in the autumn of 1961 — the second of four children raised in a weathered house that sat close enough to the water that the family could hear the tide turn in the night. Her father worked the docks; her mother kept a kitchen garden and read poetry aloud on Sunday mornings. It was a life measured not in milestones but in seasons, in the smell of rain on cedar, in the rhythm of boats leaving and returning.",
      "She spent her childhood in the company of her grandfather, Harold, a taciturn man who had served in the Pacific and come home carrying something he never named. He taught Eleanor to fish, to mend nets, and to sit quietly with discomfort — lessons she would draw on for the rest of her life. When Harold died the summer Eleanor turned twelve, she began writing. Not because anyone encouraged her, but because silence had to go somewhere.",
      "The chapters that follow are Eleanor's attempt to trace the invisible threads connecting her childhood on the Oregon coast to the woman she became: a schoolteacher, a gardener, a late-in-life painter, and a grandmother of three. She writes not to settle old accounts but to understand them — to find, in the accumulating details of an ordinary life, something worth passing on.",
      "This is her story, told in her own words, one chapter at a time."
    ],
    demographics: [
      "Eleanor Ruth Hartwell was born on October 14, 1961, in Coos Bay, Coos County, Oregon. She is the second of four children born to Raymond Dale Hartwell and Margaret Ann Hartwell, née Sorenson. Her father's family had roots in coastal Oregon stretching back three generations; her mother's family emigrated from Norway to Minnesota in the early 1900s before eventually settling on the West Coast.",
      "Eleanor attended Marshfield High School in Coos Bay, graduating in 1979. She went on to earn a Bachelor of Arts in English Literature from the University of Oregon in Eugene in 1983, and later completed a teaching credential through Oregon State University in 1985. She taught fourth and fifth grade at Lincoln Elementary School in Portland for over two decades before retiring in 2008.",
      "She married Thomas Allen Hartwell in June of 1987 in a small ceremony on the Oregon coast. They have two children: a son, Daniel, born 1990, who lives in Seattle with his family; and a daughter, Claire, born 1993, who resides in Portland. Eleanor has three grandchildren. Thomas passed away in 2019 after a brief illness.",
      "Eleanor currently resides in the Sellwood neighborhood of Portland, Oregon, in the home she and Thomas shared for thirty years. She is of Norwegian and English descent, identifies as Protestant, and holds dual membership in the Coos Bay Historical Society and the Oregon Memoir Writers Circle."
    ]
  }
};

export default function SbMbrStoryPageFeature({
  memberId,
  onClickBack
}: SbMbrStoryPageFeatureProps) {
  const [activeSection, setActiveSection] = useState('Family');
  const [liveMember, setLiveMember] = useState<MemberStory | null>(null);

  useEffect(() => {
    if (!memberId) return;
    const staticM = MEMBER_STORIES.find((m) => m.id === memberId);
    if (staticM) {
      setLiveMember(staticM);
      return;
    }
    taskApi.getMemberById(memberId).then((mbr) => {
      if (mbr) {
        setLiveMember({
          ...mbr,
          id: mbr.mbrId,
          mbrId: mbr.mbrId,
          name: `${mbr.mbrFirstName || ''} ${mbr.mbrLastName || ''}`.trim() || 'Member',
          location: mbr.mbrLivesCityState || mbr.mbrFromCityState || 'Storybook Member',
          tags: ['Memoirs', 'Family', 'Heritage'],
          joinedDate: mbr.mbrCreatedAt ? new Date(mbr.mbrCreatedAt).getFullYear().toString() : '2025',
          avatarUrl: resolveMediaUrl(mbr.mbrProfilePic),
          avatarInitials: `${mbr.mbrFirstName?.[0] || ''}${mbr.mbrLastName?.[0] || ''}`.toUpperCase() || 'SB',
          chaptersCount: 1,
          excerpt: mbr.mbrIntroduction || 'Preserving a lifetime of heritage, stories, and connections.'
        });
      }
    }).catch((err) => {

      console.warn("Failed to load member for story page:", err);
    });
  }, [memberId]);

  // Look up current member
  const member = liveMember || MEMBER_STORIES.find((m) => m.id === memberId) || MEMBER_STORIES[0];

  const [lockedTopicIds, setLockedTopicIds] = useState<string[]>([]);
  const [connectionGrpName, setConnectionGrpName] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [viewerMbrId, setViewerMbrId] = useState<string | null>(null);

  // Fetch live member profile from database & evaluate topic permissions
  useEffect(() => {
    const resolveMemberAndPrivileges = async () => {
      try {
        // 1. Determine logged-in member ID
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
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) resolvedViewerId = mbrProfile.mbrId;
            } catch {}
          }
        }
        setViewerMbrId(resolvedViewerId);

        // Author member ID (the member whose story is being viewed)
        const storyAuthorMbrId = member.id === 'm1' ? 'e20986fa-0fb9-4081-ae5d-35bc8f504df0' : (member.id || memberId);

        // If viewer is the author themselves, all topics are unlocked
        if (resolvedViewerId && storyAuthorMbrId && resolvedViewerId === storyAuthorMbrId) {
          setLockedTopicIds([]);
          setIsConnected(false);
          setConnectionGrpName('');
          return;
        }

        // 2. Fetch topics
        let topicsList: { topicId: string; topicName: string }[] = [];
        try {
          const fetchedTopics = await taskApi.getTopics();
          if (fetchedTopics && fetchedTopics.length > 0) {
            topicsList = fetchedTopics.map(t => ({ topicId: t.topicId, topicName: t.topicName }));
          }
        } catch (e) {
          console.warn("Could not fetch topics:", e);
        }

        if (topicsList.length === 0) {
          topicsList = [
            { topicId: 't1', topicName: 'Family' },
            { topicId: 't2', topicName: 'Residencies' },
            { topicId: 't3', topicName: 'Achievements' },
            { topicId: 't4', topicName: 'Education' },
            { topicId: 't5', topicName: 'Employment' },
            { topicId: 't6', topicName: 'Hobbies' }
          ];
        }

        // 3. Find viewer's connection to story author:
        let isUserConnected = false;
        let userConnectionGrpName = '';
        let assignedGrpId: string | null = null;

        if (resolvedViewerId && storyAuthorMbrId) {
          try {
            // Check logged-in member's connection to story author (viewer is owner)
            let viewerConns = await taskApi.getMemberConnections({
              mbrId: resolvedViewerId,
              connectedMbrId: storyAuthorMbrId
            }).catch(() => []);

            // Check story author's connection to viewer (author is owner, defines author's group for viewer for privacy checks)
            let authorConns = await taskApi.getMemberConnections({
              mbrId: storyAuthorMbrId,
              connectedMbrId: resolvedViewerId
            }).catch(() => []);

            if (viewerConns.length > 0 || authorConns.length > 0) {
              isUserConnected = true;
            }

            // Group assigned by author for viewer (used for topic permission checks)
            if (authorConns.length > 0) {
              const authorConnGrps = await taskApi.getMemberConnectionGrps({
                connectionId: authorConns[0].mbrConnectionId
              }).catch(() => []);
              if (authorConnGrps && authorConnGrps.length > 0) {
                assignedGrpId = authorConnGrps[0].grpId;
              }
            } else if (viewerConns.length > 0) {
              const viewerConnGrps = await taskApi.getMemberConnectionGrps({
                connectionId: viewerConns[0].mbrConnectionId
              }).catch(() => []);
              if (viewerConnGrps && viewerConnGrps.length > 0) {
                assignedGrpId = viewerConnGrps[0].grpId;
              }
            }

            // Group assigned by logged-in viewer for this member (to display on the badge)
            let badgeGrpId = '';
            if (viewerConns.length > 0) {
              const viewerConnGrps = await taskApi.getMemberConnectionGrps({
                connectionId: viewerConns[0].mbrConnectionId
              }).catch(() => []);
              if (viewerConnGrps && viewerConnGrps.length > 0) {
                badgeGrpId = viewerConnGrps[0].grpId;
              }
            } else if (authorConns.length > 0) {
              const authorConnGrps = await taskApi.getMemberConnectionGrps({
                connectionId: authorConns[0].mbrConnectionId
              }).catch(() => []);
              if (authorConnGrps && authorConnGrps.length > 0) {
                badgeGrpId = authorConnGrps[0].grpId;
              }
            }

            if (badgeGrpId) {
              const [globals, customs] = await Promise.all([
                taskApi.getGroupsGlobal().catch(() => []),
                taskApi.getGroupsCustom(resolvedViewerId).catch(() => [])
              ]);
              const matched = [...globals, ...customs].find(g => g.grpId === badgeGrpId);
              if (matched?.grpName) {
                userConnectionGrpName = matched.grpName;
              }
            }
          } catch (e) {
            console.warn("Could not fetch member connection for permissions:", e);
          }
        }

        setIsConnected(isUserConnected);
        setConnectionGrpName(userConnectionGrpName);

        // Find 'Public' group ID
        let publicGrpId: string | null = null;
        try {
          const globals = await taskApi.getGroupsGlobal();
          const pub = globals.find(g => g.grpName.toLowerCase() === 'public');
          if (pub) publicGrpId = pub.grpId;
        } catch {}
        if (!publicGrpId) publicGrpId = '13efcbad-d840-44ad-9b50-d6d2218e5cac';

        // 4. Fetch author's member topic group privileges
        let authorPrivs: any[] = [];
        try {
          authorPrivs = await taskApi.getMemberTopicGroupPrivs({ mbrId: storyAuthorMbrId });
        } catch (e) {
          console.warn("Could not fetch member topic group privileges:", e);
        }

        // 5. Evaluate privilege per topic:
        // - Viewer has access if their assigned group has 'READ' or 'WRITE' privilege.
        // - Or if the Public group has 'READ' or 'WRITE' privilege (and assigned group does not explicitly deny with NONE/HIDE).
        // - If neither grants access, the topic is locked (access restricted).
        const locked: string[] = [];
        for (const topic of topicsList) {
          const topicPrivs = (authorPrivs || []).filter(
            p => p.topicId === topic.topicId || p.topicId?.toLowerCase() === topic.topicName.toLowerCase()
          );

          // If author has no custom privacy rules configured at all for this topic, lock or check
          if (topicPrivs.length === 0) {
            continue;
          }

          // Check viewer's assigned connection group privilege
          let hasAssignedAccess = false;
          let hasAssignedDenial = false;
          if (assignedGrpId) {
            const assignedPriv = topicPrivs.find(p => p.grpId === assignedGrpId);
            if (assignedPriv) {
              const assignedVal = assignedPriv.privValueCd?.toUpperCase();
              if (assignedVal === 'READ' || assignedVal === 'WRITE') {
                hasAssignedAccess = true;
              } else if (assignedVal === 'NONE' || assignedVal === 'HIDE') {
                hasAssignedDenial = true;
              }
            }
          }

          // Check Public group privilege
          const publicPriv = topicPrivs.find(p => p.grpId === publicGrpId);
          let hasPublicAccess = false;
          if (publicPriv) {
            const publicVal = publicPriv.privValueCd?.toUpperCase();
            hasPublicAccess = publicVal === 'READ' || publicVal === 'WRITE';
          }

          // Evaluate access:
          // 1. If assigned group explicitly grants access ('READ'/'WRITE') -> UNLOCKED
          // 2. If public group grants access ('READ'/'WRITE') and assigned group doesn't deny -> UNLOCKED
          // 3. Otherwise -> LOCKED
          if (hasAssignedAccess) {
            // Access granted via connection group
          } else if (hasPublicAccess && !hasAssignedDenial) {
            // Access granted via public permissions
          } else {
            locked.push(topic.topicName);
          }
        }

        setLockedTopicIds(locked);

        // If currently active section is locked, switch to first unlocked section if available
        if (locked.some(id => id.toLowerCase() === activeSection.toLowerCase())) {
          const firstUnlocked = topicsList.find(t => !locked.some(lid => lid.toLowerCase() === t.topicName.toLowerCase()));
          if (firstUnlocked) {
            setActiveSection(firstUnlocked.topicName);
          }
        }

      } catch (err) {
        console.warn("Error resolving topic permissions:", err);
      }

    };

    resolveMemberAndPrivileges();
  }, [member.id, memberId]);

  // Retrieve active section contents
  const getActiveContent = (): string[] => {
    const secKey = activeSection.toLowerCase();
    if (member.id === 'm1' && STORY_CONTENTS.m1[secKey]) {
      return STORY_CONTENTS.m1[secKey];
    }
    
    // Dynamic fallback copy for other members
    if (secKey === 'introduction') {
      return [
        `${member.name} joined Storybook in ${member.joinedDate} to document a life lived across different eras. Residing in ${member.location}, they have already published ${member.chaptersCount} chapters of their memoirs, capturing personal anecdotes, family histories, and local transitions.`,
        `Their recollections focus heavily on themes of ${member.tags.join(', ')} — drawing connections between past events and the wisdom they hold today.`,
        "This is their story, written in their own words, preserved forever."
      ];
    }
    
    if (secKey === 'demographics') {
      return [
        `${member.name} was born and raised in ${member.location}. They have built a lifetime of experiences, establishing deep roots in their community while documenting their ancestry and descent.`,
        `As a member of the Storybook platform, they actively collaborate with family and friends to co-author and refine their life records. This section details their early education, family structure, marriages, and professional achievements.`
      ];
    }

    return ["This chapter is currently in draft status and will be available once the author has finalized the edit and clicked publish."];
  };

  return (
    <div className="w-full relative">
      <PageSeo
        title={`${member.name}'s Story & Experiences`}
        description={member.excerpt || `Read the personal journey, experiences, and stories shared by ${member.name} on StoryBook.`}
        keywords={`real life stories, ${member.name}, ${member.location || ''}, personal journey, creative writing, true stories, storybook`}
        ogType="article"
        ogTitle={`${member.name}'s Story & Experiences`}
        ogDescription={member.excerpt || `Discover the stories and life moments shared by ${member.name} on StoryBook.`}
        ogImage={member.avatarUrl}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": `${member.name}'s Story & Journey`,
          "description": member.excerpt || 'A life story and journey on StoryBook.',
          "author": {
            "@type": "Person",
            "name": member.name
          },
          "publisher": {
            "@type": "Organization",
            "name": "StoryBook",
            "url": "https://storybook.ai"
          },
          "image": member.avatarUrl || undefined
        }}
      />
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl w-full mx-auto items-start">
        
        {/* Left Column Sidebar */}
        <div className="lg:col-span-3">
          <LeftColumn
            onClickBack={onClickBack}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            memberName={member.name}
            lockedTopicIds={lockedTopicIds}
          />
        </div>

        {/* Center Column Main Panel */}
        <div className="lg:col-span-6 p-1 lg:p-0 rounded-3xl">
          <CenterColumn
            member={member}
            activeSection={activeSection}
            activeContent={getActiveContent()}
            lockedTopicIds={lockedTopicIds}
            onClickBack={onClickBack}
            connectionGrpName={connectionGrpName}
            isConnected={isConnected}
            viewerMbrId={viewerMbrId}
          />
        </div>


        {/* Right Column Sidebar */}
        <div className="lg:col-span-3">
          <RightColumn />
        </div>

      </div>
      <AdminComponentTag name="SbMbrStoryPageFeature" />
    </div>
  );
}
