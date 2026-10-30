/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import {
  taskApi,
  resolveMediaUrl,
  MbrStory,
  Topic,
  GroupGlobal,
  GroupCustom,
  MbrStoryGroupPrivs,
  MbrStoryConnectionPrivs,
  MbrConnection,
  MbrConnectionGrp,
  Mbr
} from '@/src/services/api.ts';
import { useCodes } from '@/src/context/CodeContext.tsx';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrStoryPrivacyModal from '@/src/components/mbrStoryPrivacyModal';
import {
  MbrPrivacyFeatureProps,
  AccessTabMode,
  EffectiveAccessLevel,
  UnifiedGroup,
  ConnectedMemberItem,
  StoryGroupAccessEntry,
  StoryMemberAccessEntry,
  EnrichedStoryItem
} from '../types';
import PrivacyHeader from './PrivacyHeader';
import PrivacyByGroupView from './PrivacyByGroupView';
import PrivacyByMemberView from './PrivacyByMemberView';
import PrivacyByStoryView from './PrivacyByStoryView';
import { generatePrivacyPdf } from '../utils/generatePrivacyPdf';

function parseAccessLevel(raw?: string | null): EffectiveAccessLevel | 'NONE' | null {
  if (!raw) return null;
  const upper = raw.trim().toUpperCase();
  if (upper === 'WRITE' || upper === 'COMMENT' || upper.includes('COMMENT')) {
    return 'WRITE';
  }
  if (upper === 'READ' || upper === 'VIEW' || upper === 'ALLOW') {
    return 'READ';
  }
  if (upper === 'NONE' || upper === 'HIDE' || upper === 'DENY' || upper === 'RESTRICTED') {
    return 'NONE';
  }
  return null;
}

function getAccessDisplayLabel(level: EffectiveAccessLevel): string {
  return level === 'WRITE' ? 'View and comment' : 'View';
}

function resolveStoryTopicLabel(story: MbrStory, topics: Topic[]): string {
  if (story.mbrStoryTopicName && story.mbrStoryTopicName.trim()) {
    return story.mbrStoryTopicName.trim();
  }
  if (story.topicId) {
    const matched = topics.find((t) => t.topicId === story.topicId);
    if (matched) return matched.topicFullName || matched.topicName;
  }
  const typeCd = (story.mbrStoryTypeCd || '').toLowerCase();
  if (typeCd.includes('fam')) return 'Family';
  if (typeCd.includes('residen')) return 'Residencies';
  if (typeCd.includes('edu')) return 'Education';
  if (typeCd.includes('employ') || typeCd.includes('work')) return 'Employment';
  if (typeCd.includes('achieve')) return 'Achievements';
  if (typeCd.includes('activ') || typeCd.includes('hobb')) return 'Activities & Hobbies';
  if (typeCd.includes('trip') || typeCd.includes('vacat')) return 'Trips & Vacations';
  if (typeCd.includes('relat')) return 'Relationships';
  if (typeCd.includes('health')) return 'Health';
  if (typeCd.includes('special') || typeCd.includes('event')) return 'Special Events';
  if (typeCd.includes('child')) return 'Childhood';
  if (typeCd.includes('music')) return 'Music';
  if (typeCd.includes('movie') || typeCd.includes('tv')) return 'Movies & TV';
  if (typeCd.includes('sport')) return 'Sports';
  return 'Life Story';
}

export default function MbrPrivacyFeature({
  isSandbox,
  onDirtyChange
}: MbrPrivacyFeatureProps) {
  const { getCodesByTag, loading: codesLoading } = useCodes();
  const privCodes = getCodesByTag('privValueCd');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('e20986fa-0fb9-4081-ae5d-35bc8f504df0');
  const [mbrName, setMbrName] = useState<string>('Eleanor Hartwell');
  const [mbrEmail, setMbrEmail] = useState<string>('eleanor.vance@storybook.ai');

  const [activeTab, setActiveTab] = useState<AccessTabMode>('by-group');

  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);

  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  const [connectedMembers, setConnectedMembers] = useState<ConnectedMemberItem[]>([]);
  const [stories, setStories] = useState<MbrStory[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [storyGroupPrivs, setStoryGroupPrivs] = useState<MbrStoryGroupPrivs[]>([]);
  const [storyConnPrivs, setStoryConnPrivs] = useState<MbrStoryConnectionPrivs[]>([]);

  // Story Privacy Modal state for quick in-place editing
  const [editingStory, setEditingStory] = useState<{ storyId: string; storyTitle: string } | null>(null);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(false);
    }
  }, [onDirtyChange]);

  const loadAccessData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Resolve current Member ID, Name & Email
      let currentMbrId = '';
      let currentEmail = 'eleanor.vance@storybook.ai';
      let currentName = 'Eleanor Hartwell';

      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) currentMbrId = parsed.mbrId;
          if (parsed.mbrEmailAddress) currentEmail = parsed.mbrEmailAddress;
          if (parsed.mbrFirstName || parsed.mbrLastName) {
            currentName = `${parsed.mbrFirstName || ''} ${parsed.mbrLastName || ''}`.trim();
          }
        } catch {}
      }

      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email) currentEmail = u.email;
          if (!currentMbrId && u.mbr_id) currentMbrId = u.mbr_id;
          if (!currentMbrId && u.mbrId) currentMbrId = u.mbrId;
          if (!isSandbox && !currentMbrId && u.user_id) {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id).catch(() => null);
            if (mbrProfile && mbrProfile.mbrId) {
              currentMbrId = mbrProfile.mbrId;
              if (mbrProfile.mbrEmailAddress) currentEmail = mbrProfile.mbrEmailAddress;
              if (mbrProfile.mbrFirstName || mbrProfile.mbrLastName) {
                currentName = `${mbrProfile.mbrFirstName || ''} ${mbrProfile.mbrLastName || ''}`.trim();
              }
            }
          }
        } catch {}
      }

      if (!currentMbrId) {
        currentMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0';
      }

      setMbrId(currentMbrId);
      setMbrEmail(currentEmail);
      setMbrName(currentName);

      // 2. Concurrent Batch Query (Zero N+1 Waterfalls)
      let fetchedTopics: Topic[] = [];
      let fetchedGlobals: GroupGlobal[] = [];
      let fetchedCustoms: GroupCustom[] = [];
      let fetchedStories: MbrStory[] = [];
      let fetchedConns: MbrConnection[] = [];
      let fetchedConnGrps: MbrConnectionGrp[] = [];
      let fetchedMembers: Mbr[] = [];
      let fetchedStoryGrpPrivs: MbrStoryGroupPrivs[] = [];
      let fetchedStoryConnPrivs: MbrStoryConnectionPrivs[] = [];

      if (!isSandbox) {
        const [
          topicsRes,
          globalsRes,
          customsRes,
          storiesRes,
          connsRes,
          connGrpsRes,
          membersRes,
          storyGrpPrivsRes,
          storyConnPrivsRes
        ] = await Promise.all([
          taskApi.getTopics().catch(() => []),
          taskApi.getGroupsGlobal().catch(() => []),
          taskApi.getGroupsCustom(currentMbrId).catch(() => []),
          taskApi.getStories(currentMbrId).catch(() => []),
          taskApi.getMemberConnections({ mbrId: currentMbrId }).catch(() => []),
          taskApi.getMemberConnectionGrps({ limit: 1000 }).catch(() => []),
          taskApi.getMembers({ limit: 500 }).catch(() => []),
          taskApi.getMemberStoryGroupPrivs({ limit: 1000 }).catch(() => []),
          taskApi.getMemberStoryConnectionPrivs({ mbrId: currentMbrId, limit: 1000 }).catch(() => [])
        ]);

        fetchedTopics = topicsRes || [];
        fetchedGlobals = globalsRes || [];
        fetchedCustoms = customsRes || [];
        fetchedStories = storiesRes || [];
        fetchedConns = connsRes || [];
        fetchedConnGrps = connGrpsRes || [];
        fetchedMembers = membersRes || [];
        fetchedStoryGrpPrivs = storyGrpPrivsRes || [];
        fetchedStoryConnPrivs = storyConnPrivsRes || [];
      }

      // 3. Fallback / Sandbox Data Enrichment
      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: 'g1', grpName: 'Family', grpDescription: 'Immediate and extended family members', grpSortOrder: 10 },
          { grpId: 'g2', grpName: 'Friends', grpDescription: 'Close personal friends', grpSortOrder: 20 },
          { grpId: 'g3', grpName: 'Work', grpDescription: 'Colleagues and professional peers', grpSortOrder: 30 },
          { grpId: 'g4', grpName: 'Public', grpDescription: 'All StoryBook members and visitors', grpSortOrder: 40 }
        ];
      }

      const unifiedGroups: UnifiedGroup[] = [
        ...fetchedGlobals.map((g) => ({
          grpId: g.grpId,
          grpName: g.grpName,
          grpDescription: g.grpDescription,
          grpSortOrder: g.grpSortOrder,
          isCustom: false
        })),
        ...fetchedCustoms.map((c) => ({
          grpId: c.grpId,
          grpName: c.grpName,
          grpDescription: 'Custom Member Group',
          grpSortOrder: c.grpSortOrder,
          isCustom: true
        }))
      ];

      unifiedGroups.sort((a, b) => {
        const orderA = a.grpSortOrder != null ? a.grpSortOrder : Infinity;
        const orderB = b.grpSortOrder != null ? b.grpSortOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.grpName.localeCompare(b.grpName);
      });

      const famGrpId = unifiedGroups.find((g) => g.grpName.toLowerCase().includes('family'))?.grpId || unifiedGroups[0]?.grpId || 'g1';
      const frdGrpId = unifiedGroups.find((g) => g.grpName.toLowerCase().includes('friend'))?.grpId || unifiedGroups[1]?.grpId || 'g2';
      const wrkGrpId = unifiedGroups.find((g) => g.grpName.toLowerCase().includes('work'))?.grpId || unifiedGroups[2]?.grpId || 'g3';

      // Merge any sandbox stories from sessionStorage
      const sandboxStoriesRaw =
        sessionStorage.getItem(`sb_sandbox_stories_${currentMbrId}`) ||
        sessionStorage.getItem('sb_sandbox_stories');
      if (sandboxStoriesRaw) {
        try {
          const parsedSandboxStories = JSON.parse(sandboxStoriesRaw);
          if (Array.isArray(parsedSandboxStories)) {
            const byId = new Map<string, MbrStory>();
            fetchedStories.forEach((s) => { if (s.mbrStoryId) byId.set(s.mbrStoryId, s); });
            parsedSandboxStories.forEach((s) => { if (s.mbrStoryId) byId.set(s.mbrStoryId, s); });
            fetchedStories = Array.from(byId.values());
          }
        } catch {}
      }

      if (fetchedStories.length === 0) {
        fetchedStories = [
          {
            mbrStoryId: 'sb_demo_story_1',
            mbrStoryTitle: 'The Old Cedar House by the Salt Marsh',
            mbrStoryTypeCd: 'sbMbrStryResidence',
            mbrStoryTopicName: 'Residencies',
            mbrStoryPublishStatusCd: 'Published',
            mbrStoryPublishedDate: '2026-08-15T08:20:00Z',
            mbrStoryVersion: 1,
            mbrStoryCreatedAt: '2026-08-10T08:20:00Z',
            mbrStoryUpdatedAt: '2026-08-15T08:20:00Z',
            mbrMbrId: currentMbrId
          },
          {
            mbrStoryId: 'sb_demo_story_2',
            mbrStoryTitle: 'Thirty Years of Red Ink and Fresh Chalk',
            mbrStoryTypeCd: 'sbMbrStryEmployment',
            mbrStoryTopicName: 'Employment',
            mbrStoryPublishStatusCd: 'Published',
            mbrStoryPublishedDate: '2026-09-02T10:00:00Z',
            mbrStoryVersion: 1,
            mbrStoryCreatedAt: '2026-08-28T10:00:00Z',
            mbrStoryUpdatedAt: '2026-09-02T10:00:00Z',
            mbrMbrId: currentMbrId
          },
          {
            mbrStoryId: 'sb_demo_story_3',
            mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
            mbrStoryTypeCd: 'sbMbrStryActivity',
            mbrStoryTopicName: 'Activities & Hobbies',
            mbrStoryPublishStatusCd: 'Published',
            mbrStoryPublishedDate: '2026-08-25T11:30:00Z',
            mbrStoryVersion: 1,
            mbrStoryCreatedAt: '2026-08-20T11:30:00Z',
            mbrStoryUpdatedAt: '2026-08-25T11:30:00Z',
            mbrMbrId: currentMbrId
          },
          {
            mbrStoryId: 'sb_demo_story_4',
            mbrStoryTitle: 'Summer Sailings with Grandfather Harold',
            mbrStoryTypeCd: 'sbMbrStryFamly',
            mbrStoryTopicName: 'Family',
            mbrStoryPublishStatusCd: 'Published',
            mbrStoryPublishedDate: '2026-09-10T14:15:00Z',
            mbrStoryVersion: 1,
            mbrStoryCreatedAt: '2026-09-05T14:15:00Z',
            mbrStoryUpdatedAt: '2026-09-10T14:15:00Z',
            mbrMbrId: currentMbrId
          }
        ];
      }

      if (fetchedConns.length === 0) {
        fetchedConns = [
          { mbrConnectionId: 'conn_demo_1', mbrId: currentMbrId, mbrConnectionMbrId: 'mbr_demo_1' },
          { mbrConnectionId: 'conn_demo_2', mbrId: currentMbrId, mbrConnectionMbrId: 'mbr_demo_2' },
          { mbrConnectionId: 'conn_demo_3', mbrId: currentMbrId, mbrConnectionMbrId: 'mbr_demo_3' },
          { mbrConnectionId: 'conn_demo_4', mbrId: currentMbrId, mbrConnectionMbrId: 'mbr_demo_4' }
        ];
        fetchedConnGrps = [
          { mbrConnectionGrpId: 'cg_1', mbrConnectionId: 'conn_demo_1', grpId: famGrpId },
          { mbrConnectionGrpId: 'cg_2', mbrConnectionId: 'conn_demo_2', grpId: famGrpId },
          { mbrConnectionGrpId: 'cg_3', mbrConnectionId: 'conn_demo_3', grpId: frdGrpId },
          { mbrConnectionGrpId: 'cg_4', mbrConnectionId: 'conn_demo_4', grpId: wrkGrpId }
        ];
        fetchedMembers = [
          ...fetchedMembers,
          {
            mbrId: 'mbr_demo_1',
            mbrFirstName: 'Thomas',
            mbrLastName: 'Wakefield',
            mbrLivesCityState: 'Boston, MA',
            mbrEmailAddress: 'thomas.wakefield@storybook.ai'
          },
          {
            mbrId: 'mbr_demo_2',
            mbrFirstName: 'Clara',
            mbrLastName: 'Vance',
            mbrLivesCityState: 'Palm Springs, CA',
            mbrEmailAddress: 'clara.vance@storybook.ai'
          },
          {
            mbrId: 'mbr_demo_3',
            mbrFirstName: 'Marcus',
            mbrLastName: 'Delacroix',
            mbrLivesCityState: 'New Orleans, LA',
            mbrEmailAddress: 'marcus.delacroix@storybook.ai'
          },
          {
            mbrId: 'mbr_demo_4',
            mbrFirstName: 'Priya',
            mbrLastName: 'Chandrasekaran',
            mbrLivesCityState: 'Chicago, IL',
            mbrEmailAddress: 'priya.c@storybook.ai'
          }
        ];
      }

      // Only stories with mbrStoryPublishStatusCd equal to 'published' (case-insensitive) are viewable to other members
      fetchedStories = fetchedStories.filter(
        (s) => (s.mbrStoryPublishStatusCd || '').trim().toLowerCase() === 'published'
      );

      // Filter story group privs to this member's published stories, and merge any sessionStorage story privs
      const memberStoryIdSet = new Set(fetchedStories.map((s) => s.mbrStoryId));
      const mergedGrpPrivMap = new Map<string, MbrStoryGroupPrivs>();

      for (const p of fetchedStoryGrpPrivs) {
        if (memberStoryIdSet.has(p.mbrStoryId)) {
          mergedGrpPrivMap.set(`${p.mbrStoryId}_${p.grpId}`, p);
        }
      }

      const mergedConnPrivMap = new Map<string, MbrStoryConnectionPrivs>();
      for (const cp of fetchedStoryConnPrivs) {
        if (memberStoryIdSet.has(cp.mbrStoryId)) {
          mergedConnPrivMap.set(`${cp.mbrStoryId}_${cp.mbrConnectionMbrId}`, cp);
        }
      }

      // Apply any sandbox session overrides saved by MbrStoryPrivacyModal
      for (const story of fetchedStories) {
        const sId = story.mbrStoryId;
        const savedGrpStr = sessionStorage.getItem(`sandbox_story_privs_${sId}`);
        if (savedGrpStr) {
          try {
            const arr = JSON.parse(savedGrpStr);
            if (Array.isArray(arr)) {
              arr.forEach((item: any) => {
                if (item.grpId && item.privValueCd) {
                  mergedGrpPrivMap.set(`${sId}_${item.grpId}`, {
                    privId: item.privId || `sb_gp_${sId}_${item.grpId}`,
                    mbrStoryId: sId,
                    grpId: item.grpId,
                    privValueCd: item.privValueCd
                  });
                }
              });
            }
          } catch {}
        }

        const savedConnStr = sessionStorage.getItem(`sandbox_story_conn_privs_${sId}`);
        if (savedConnStr) {
          try {
            const arr = JSON.parse(savedConnStr);
            if (Array.isArray(arr)) {
              arr.forEach((item: any) => {
                if (item.mbrConnectionMbrId && item.privValueCd) {
                  mergedConnPrivMap.set(`${sId}_${item.mbrConnectionMbrId}`, {
                    privId: item.privId || `sb_cp_${sId}_${item.mbrConnectionMbrId}`,
                    mbrId: currentMbrId,
                    mbrStoryId: sId,
                    mbrConnectionMbrId: item.mbrConnectionMbrId,
                    privValueCd: item.privValueCd
                  });
                }
              });
            }
          } catch {}
        }
      }

      // If no story privileges exist yet in Sandbox/Demo, seed sensible defaults so all 3 views are populated
      if (mergedGrpPrivMap.size === 0 && mergedConnPrivMap.size === 0 && fetchedStories.length > 0) {
        fetchedStories.forEach((st, idx) => {
          mergedGrpPrivMap.set(`${st.mbrStoryId}_${famGrpId}`, {
            privId: `demo_gp_fam_${idx}`,
            mbrStoryId: st.mbrStoryId,
            grpId: famGrpId,
            privValueCd: 'WRITE'
          });
          if (idx % 2 === 0 && frdGrpId) {
            mergedGrpPrivMap.set(`${st.mbrStoryId}_${frdGrpId}`, {
              privId: `demo_gp_frd_${idx}`,
              mbrStoryId: st.mbrStoryId,
              grpId: frdGrpId,
              privValueCd: 'READ'
            });
          }
          if (idx === 1 && wrkGrpId) {
            mergedGrpPrivMap.set(`${st.mbrStoryId}_${wrkGrpId}`, {
              privId: `demo_gp_wrk_${idx}`,
              mbrStoryId: st.mbrStoryId,
              grpId: wrkGrpId,
              privValueCd: 'READ'
            });
          }
        });
      }

      // Build ConnectedMemberItem list with their group memberships
      const groupById = new Map<string, UnifiedGroup>();
      unifiedGroups.forEach((g) => groupById.set(g.grpId, g));

      const grpsByConnId = new Map<string, string[]>();
      for (const cg of fetchedConnGrps) {
        if (!cg.mbrConnectionId || !cg.grpId) continue;
        const list = grpsByConnId.get(cg.mbrConnectionId) || [];
        if (!list.includes(cg.grpId)) list.push(cg.grpId);
        grpsByConnId.set(cg.mbrConnectionId, list);
      }

      const memberProfileMap = new Map<string, Mbr>();
      fetchedMembers.forEach((m) => {
        if (m.mbrId) memberProfileMap.set(m.mbrId, m);
      });

      const resolvedMembers: ConnectedMemberItem[] = [];
      const seenConnMbrIds = new Set<string>();

      for (const conn of fetchedConns) {
        const targetMbrId = conn.mbrConnectionMbrId;
        if (!targetMbrId || seenConnMbrIds.has(targetMbrId)) continue;
        seenConnMbrIds.add(targetMbrId);

        const profile = memberProfileMap.get(targetMbrId);
        const fullName = profile
          ? `${profile.mbrFirstName || ''} ${profile.mbrLastName || ''}`.trim() || 'Connected Member'
          : `Member (${targetMbrId.slice(0, 8)})`;

        const assignedGrpIds = grpsByConnId.get(conn.mbrConnectionId) || [];
        const assignedGrpNames = assignedGrpIds
          .map((gid) => groupById.get(gid)?.grpName)
          .filter((n): n is string => Boolean(n));

        resolvedMembers.push({
          connectionId: conn.mbrConnectionId,
          mbrConnectionMbrId: targetMbrId,
          fullName,
          firstName: profile?.mbrFirstName,
          lastName: profile?.mbrLastName,
          avatarUrl: profile?.mbrProfilePic ? resolveMediaUrl(profile.mbrProfilePic) : undefined,
          location: profile?.mbrLivesCityState,
          email: profile?.mbrEmailAddress,
          groupIds: assignedGrpIds,
          groupNames: assignedGrpNames
        });
      }

      resolvedMembers.sort((a, b) => a.fullName.localeCompare(b.fullName));

      setTopics(fetchedTopics);
      setGroups(unifiedGroups);
      setConnectedMembers(resolvedMembers);
      setStories(fetchedStories);
      setStoryGroupPrivs(Array.from(mergedGrpPrivMap.values()));
      setStoryConnPrivs(Array.from(mergedConnPrivMap.values()));
    } catch (err: any) {
      console.error('Failed to load story access data:', err);
      setError(err?.message || 'Failed to load story access permissions.');
    } finally {
      setLoading(false);
    }
  }, [isSandbox]);

  useEffect(() => {
    loadAccessData();
  }, [loadAccessData]);

  // Compute enriched access structures excluding all No-Access ('NONE') entries
  const {
    enrichedStories,
    groupAccessMap,
    memberAccessMap,
    membersByGroupMap,
    totalAccessibleStories,
    totalActiveGroups,
    totalActiveMembers
  } = useMemo(() => {
    const grpById = new Map<string, UnifiedGroup>();
    groups.forEach((g) => grpById.set(g.grpId, g));

    const publicGroup = groups.find((g) => g.grpName.trim().toLowerCase() === 'public');

    // Index group privileges by `${storyId}_${grpId}`
    const grpPrivLookup = new Map<string, EffectiveAccessLevel | 'NONE'>();
    for (const gp of storyGroupPrivs) {
      const parsed = parseAccessLevel(gp.privValueCd);
      if (parsed) {
        grpPrivLookup.set(`${gp.mbrStoryId}_${gp.grpId}`, parsed);
      }
    }

    // Index member connection privileges by `${storyId}_${mbrConnectionMbrId}`
    const connPrivLookup = new Map<string, EffectiveAccessLevel | 'NONE'>();
    for (const cp of storyConnPrivs) {
      const parsed = parseAccessLevel(cp.privValueCd);
      if (parsed) {
        connPrivLookup.set(`${cp.mbrStoryId}_${cp.mbrConnectionMbrId}`, parsed);
      }
    }

    // Map each group -> connected members in that group
    const mbrsByGrp: Record<string, ConnectedMemberItem[]> = {};
    for (const g of groups) {
      if (g.grpName.trim().toLowerCase() === 'public') {
        mbrsByGrp[g.grpId] = connectedMembers;
      } else {
        mbrsByGrp[g.grpId] = connectedMembers.filter((m) => m.groupIds.includes(g.grpId));
      }
    }

    const grpAccess: Record<string, StoryGroupAccessEntry[]> = {};
    const mbrAccess: Record<string, StoryMemberAccessEntry[]> = {};
    const enriched: EnrichedStoryItem[] = [];

    const activeGrpIds = new Set<string>();
    const activeMbrIds = new Set<string>();
    let sharedStoryCount = 0;

    for (const story of stories) {
      const sId = story.mbrStoryId;
      const topicLabel = resolveStoryTopicLabel(story, topics);

      // 1. Evaluate Groups with Access to this Story
      const storyGroupsWithAccess: EnrichedStoryItem['groupsWithAccess'] = [];
      for (const grp of groups) {
        const level = grpPrivLookup.get(`${sId}_${grp.grpId}`);
        if (level === 'READ' || level === 'WRITE') {
          const accessLabel = getAccessDisplayLabel(level);
          storyGroupsWithAccess.push({
            group: grp,
            accessLevel: level,
            accessLabel
          });
          activeGrpIds.add(grp.grpId);

          if (!grpAccess[grp.grpId]) grpAccess[grp.grpId] = [];
          grpAccess[grp.grpId].push({
            story,
            topicLabel,
            grpId: grp.grpId,
            grpName: grp.grpName,
            isCustomGroup: grp.isCustom,
            accessLevel: level,
            accessLabel
          });
        }
      }

      // 2. Evaluate Connected Members with Access to this Story
      const storyMembersWithAccess: EnrichedStoryItem['membersWithAccess'] = [];
      for (const member of connectedMembers) {
        const rawDirect = connPrivLookup.get(`${sId}_${member.mbrConnectionMbrId}`);

        // Explicit NONE on the member connection denies access
        if (rawDirect === 'NONE') {
          continue;
        }

        const directAccess: EffectiveAccessLevel | null =
          rawDirect === 'READ' || rawDirect === 'WRITE' ? rawDirect : null;

        // Check group-inherited access (from member's assigned groups + Public group if enabled)
        const candidateGrpIds = [...member.groupIds];
        if (publicGroup && !candidateGrpIds.includes(publicGroup.grpId)) {
          candidateGrpIds.push(publicGroup.grpId);
        }

        const grantedViaGroups: { grpId: string; grpName: string; accessLevel: EffectiveAccessLevel }[] = [];
        for (const gid of candidateGrpIds) {
          const gLevel = grpPrivLookup.get(`${sId}_${gid}`);
          if (gLevel === 'READ' || gLevel === 'WRITE') {
            const gObj = grpById.get(gid);
            if (gObj) {
              grantedViaGroups.push({
                grpId: gid,
                grpName: gObj.grpName,
                accessLevel: gLevel
              });
            }
          }
        }

        // Determine highest effective access ('WRITE' > 'READ')
        let effective: EffectiveAccessLevel | null = null;
        if (
          directAccess === 'WRITE' ||
          grantedViaGroups.some((g) => g.accessLevel === 'WRITE')
        ) {
          effective = 'WRITE';
        } else if (
          directAccess === 'READ' ||
          grantedViaGroups.some((g) => g.accessLevel === 'READ')
        ) {
          effective = 'READ';
        }

        if (effective) {
          const accessLabel = getAccessDisplayLabel(effective);
          storyMembersWithAccess.push({
            member,
            accessLevel: effective,
            accessLabel,
            directAccess,
            grantedViaGroups
          });
          activeMbrIds.add(member.mbrConnectionMbrId);

          if (!mbrAccess[member.mbrConnectionMbrId]) {
            mbrAccess[member.mbrConnectionMbrId] = [];
          }
          mbrAccess[member.mbrConnectionMbrId].push({
            story,
            topicLabel,
            member,
            accessLevel: effective,
            accessLabel,
            directAccess,
            grantedViaGroups
          });
        }
      }

      if (storyGroupsWithAccess.length > 0 || storyMembersWithAccess.length > 0) {
        sharedStoryCount++;
      }

      enriched.push({
        story,
        topicLabel,
        groupsWithAccess: storyGroupsWithAccess,
        membersWithAccess: storyMembersWithAccess
      });
    }

    return {
      enrichedStories: enriched,
      groupAccessMap: grpAccess,
      memberAccessMap: mbrAccess,
      membersByGroupMap: mbrsByGrp,
      totalAccessibleStories: sharedStoryCount,
      totalActiveGroups: activeGrpIds.size,
      totalActiveMembers: activeMbrIds.size
    };
  }, [groups, connectedMembers, stories, topics, storyGroupPrivs, storyConnPrivs]);

  const handlePrintPdf = () => {
    generatePrivacyPdf({
      mbrId,
      mbrName,
      mbrEmail,
      enrichedStories,
      privCodes
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-1 sm:px-4 pb-8 relative">
      <AdminComponentTag name="MbrPrivacyFeature.tsx" />

      {/* Integrated Header & Tab Navigation */}
      <PrivacyHeader
        loading={loading}
        error={error}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        totalAccessibleStories={totalAccessibleStories}
        totalActiveGroups={totalActiveGroups}
        totalActiveMembers={totalActiveMembers}
        onRefresh={loadAccessData}
        onPrintPdf={handlePrintPdf}
      />

      {/* Main Content Area */}
      {loading || codesLoading ? (
        <div className="w-full h-72 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-serif">
            Loading story access permissions for your groups and connected members...
          </span>
        </div>
      ) : (
        <>
          {activeTab === 'by-group' && (
            <PrivacyByGroupView
              groups={groups}
              groupAccessMap={groupAccessMap}
              membersByGroupMap={membersByGroupMap}
              selectedGroupId={selectedGroupId}
              onSelectGroup={setSelectedGroupId}
              onEditStoryPrivacy={(storyId, storyTitle) =>
                setEditingStory({ storyId, storyTitle })
              }
            />
          )}

          {activeTab === 'by-member' && (
            <PrivacyByMemberView
              connectedMembers={connectedMembers}
              memberAccessMap={memberAccessMap}
              selectedMemberId={selectedMemberId}
              onSelectMember={setSelectedMemberId}
              onEditStoryPrivacy={(storyId, storyTitle) =>
                setEditingStory({ storyId, storyTitle })
              }
            />
          )}

          {activeTab === 'by-story' && (
            <PrivacyByStoryView
              enrichedStories={enrichedStories}
              selectedStoryId={selectedStoryId}
              onSelectStory={setSelectedStoryId}
              onEditStoryPrivacy={(storyId, storyTitle) =>
                setEditingStory({ storyId, storyTitle })
              }
            />
          )}
        </>
      )}

      {/* In-Place Story Privacy Editor Modal */}
      <MbrStoryPrivacyModal
        isOpen={Boolean(editingStory)}
        onClose={() => setEditingStory(null)}
        storyId={editingStory?.storyId}
        storyTitle={editingStory?.storyTitle}
        mbrId={mbrId}
        isSandbox={isSandbox}
        onSaved={() => {
          loadAccessData();
        }}
      />
    </div>
  );
}
