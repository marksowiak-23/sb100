/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldAlert,
  X,
  CheckCircle2,
  Save,
  Loader2,
  Users,
  UserCheck,
  Briefcase,
  Globe,
  Shield,
  AlertTriangle,
  Search
} from 'lucide-react';
import {
  taskApi,
  resolveMediaUrl,
  MbrTopicRelationship,
  MbrTopicRelationshipsConnectionPrivs,
  MbrTopicFamilyConnectionPrivs,
  MbrTopicTripsConnectionPrivs,
  MbrTopicResidenceConnectionPrivs,
  MbrTopicEducationConnectionPrivs,
  MbrTopicEmploymentConnectionPrivs,
  MbrTopicHealthConnectionPrivs,
  MbrTopicActivityConnectionPrivs,
  MbrTopicSpecialEventsConnectionPrivs,
  MbrTopicAchievementsConnectionPrivs,
  MbrTopicConnectionPrivs
} from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrTopicPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mbrId: string;
  topicId?: string;
  topicName: string;
  relationships?: MbrTopicRelationship[];
  relationshipId?: string;
  familyMembers?: any[];
  familyId?: string;
  topicItems?: any[];
  topicItemId?: string;
  isSandbox?: boolean;
  onSaved?: () => void;
}

export type SbTopicPrivacyModalProps = MbrTopicPrivacyModalProps;
export type mbrTopicPrivacyModalProps = MbrTopicPrivacyModalProps;

type PrivacyTab = 'groups' | 'members';

interface UnifiedGroup {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number;
  isCustom: boolean;
}

interface PrivilegeState {
  privId?: string;
  grpId: string;
  topicId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

interface ConnectedMemberInfo {
  connectionId: string;
  mbrConnectionMbrId: string;
  fullName: string;
  avatarUrl?: string;
  location?: string;
  email?: string;
}

interface MemberPrivilegeState {
  privId?: string;
  mbrId: string;
  subId: string;
  mbrConnectionMbrId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

interface TopicPrivHandler {
  topicType: string;
  itemKeyField: string;
  subItemName: string;
  allLabel: string;
  sandboxPrefix: string;
  getItemLabel: (item: any) => string;
  getItemId: (item: any) => string;
  fetchPrivs: (mbrId: string, itemId: string) => Promise<any[]>;
  createPriv: (mbrId: string, itemId: string, connMbrId: string, privValueCd: string) => Promise<any>;
  updatePriv: (privId: string, privValueCd: string) => Promise<any>;
  deletePriv: (privId: string) => Promise<any>;
}

function getTopicPrivHandler(topicName: string, resolvedTopicId?: string): TopicPrivHandler {
  const norm = (topicName || '').toLowerCase().trim();

  // 1. Trips and Vacations
  if (norm.includes('trip') || norm.includes('vacation')) {
    return {
      topicType: 'trips',
      itemKeyField: 'mbrTripId',
      subItemName: 'Trip',
      allLabel: 'All Trips and Vacations',
      sandboxPrefix: 'sandbox_trip_conn_privs_',
      getItemLabel: (item) => item.mbrTripTitle || item.mbrTripDestination || 'Trip',
      getItemId: (item) => item.mbrTripId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicTripsConnectionPrivs({ mbrId, mbrTripId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicTripsConnectionPriv({ mbrId, mbrTripId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicTripsConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicTripsConnectionPriv(privId)
    };
  }

  // 2. Residencies
  if (norm.includes('residen') || norm.includes('place')) {
    return {
      topicType: 'residence',
      itemKeyField: 'mbrResidenceId',
      subItemName: 'Residence',
      allLabel: 'All Residencies',
      sandboxPrefix: 'sandbox_residence_conn_privs_',
      getItemLabel: (item) =>
        item.mbrResidenceCityState ||
        item.mbrResidenceStreetAddress ||
        (item.mbrResidenceCity ? `${item.mbrResidenceCity}, ${item.mbrResidenceState || ''}` : 'Residence'),
      getItemId: (item) => item.mbrResidenceId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicResidenceConnectionPrivs({ mbrId, mbrResidenceId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicResidenceConnectionPriv({ mbrId, mbrResidenceId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicResidenceConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicResidenceConnectionPriv(privId)
    };
  }

  // 3. Education & Training
  if (norm.includes('educat') || norm.includes('training') || norm.includes('school')) {
    return {
      topicType: 'education',
      itemKeyField: 'mbrEducationId',
      subItemName: 'School / Institution',
      allLabel: 'All Education & Training',
      sandboxPrefix: 'sandbox_education_conn_privs_',
      getItemLabel: (item) =>
        `${item.mbrEducationInstitution || item.mbrEducationSchool || 'School'}${
          item.mbrEducationDegree ? ` - ${item.mbrEducationDegree}` : ''
        }`,
      getItemId: (item) => item.mbrEducationId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicEducationConnectionPrivs({ mbrId, mbrEducationId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicEducationConnectionPriv({ mbrId, mbrEducationId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicEducationConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicEducationConnectionPriv(privId)
    };
  }

  // 4. Employment & Career
  if (norm.includes('employ') || norm.includes('career') || norm.includes('work')) {
    return {
      topicType: 'employment',
      itemKeyField: 'mbrEmploymentId',
      subItemName: 'Employer / Role',
      allLabel: 'All Career & Employment',
      sandboxPrefix: 'sandbox_employment_conn_privs_',
      getItemLabel: (item) =>
        `${item.mbrEmploymentCompany || item.mbrEmploymentEmployer || 'Company'}${
          item.mbrEmploymentPosition || item.mbrEmploymentTitle
            ? ` (${item.mbrEmploymentPosition || item.mbrEmploymentTitle})`
            : ''
        }`,
      getItemId: (item) => item.mbrEmploymentId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicEmploymentConnectionPrivs({ mbrId, mbrEmploymentId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicEmploymentConnectionPriv({ mbrId, mbrEmploymentId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicEmploymentConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicEmploymentConnectionPriv(privId)
    };
  }

  // 5. Health & Wellness
  if (norm.includes('health') || norm.includes('wellness')) {
    return {
      topicType: 'health',
      itemKeyField: 'mbrHealthId',
      subItemName: 'Health Record',
      allLabel: 'All Health & Wellness',
      sandboxPrefix: 'sandbox_health_conn_privs_',
      getItemLabel: (item) => item.mbrHealthTitle || item.mbrHealthTypeCd || 'Health Record',
      getItemId: (item) => item.mbrHealthId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicHealthConnectionPrivs({ mbrId, mbrHealthId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicHealthConnectionPriv({ mbrId, mbrHealthId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicHealthConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicHealthConnectionPriv(privId)
    };
  }

  // 6. Activities & Hobbies
  if (norm.includes('activit') || norm.includes('hobb')) {
    return {
      topicType: 'activity',
      itemKeyField: 'mbrActivityId',
      subItemName: 'Activity',
      allLabel: 'All Activities & Hobbies',
      sandboxPrefix: 'sandbox_activity_conn_privs_',
      getItemLabel: (item) => item.mbrActivityName || item.mbrActivityTitle || item.mbrActivityTypeCd || 'Activity',
      getItemId: (item) => item.mbrActivityId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicActivityConnectionPrivs({ mbrId, mbrActivityId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicActivityConnectionPriv({ mbrId, mbrActivityId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicActivityConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicActivityConnectionPriv(privId)
    };
  }

  // 7. Special Events
  if (norm.includes('special') || norm.includes('event') || norm.includes('celebrat')) {
    return {
      topicType: 'special_events',
      itemKeyField: 'mbrSpecialEventId',
      subItemName: 'Special Event',
      allLabel: 'All Special Events',
      sandboxPrefix: 'sandbox_special_events_conn_privs_',
      getItemLabel: (item) => item.mbrSpecialEventTitle || item.mbrSpecialEventTypeCd || 'Special Event',
      getItemId: (item) => item.mbrSpecialEventId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicSpecialEventsConnectionPrivs({ mbrId, mbrSpecialEventId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicSpecialEventsConnectionPriv({ mbrId, mbrSpecialEventId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicSpecialEventsConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicSpecialEventsConnectionPriv(privId)
    };
  }

  // 8. Family
  if (norm.includes('fam')) {
    return {
      topicType: 'family',
      itemKeyField: 'mbrFamilyId',
      subItemName: 'Family Member',
      allLabel: 'All Family Members',
      sandboxPrefix: 'sandbox_fam_conn_privs_',
      getItemLabel: (item) =>
        `${item.mbrFamilyFirstNm || ''} ${item.mbrFamilyLastNm || ''}`.trim() +
        (item.mbrFamilyRelationshipCd ? ` (${item.mbrFamilyRelationshipCd})` : ''),
      getItemId: (item) => item.mbrFamilyId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicFamilyConnectionPrivs({ mbrId, mbrFamilyId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicFamilyConnectionPriv({ mbrId, mbrFamilyId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicFamilyConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicFamilyConnectionPriv(privId)
    };
  }

  // 9. Relationships
  if (norm.includes('relation')) {
    return {
      topicType: 'relationships',
      itemKeyField: 'mbrRelationshipId',
      subItemName: 'Relationship',
      allLabel: 'All Relationships',
      sandboxPrefix: 'sandbox_rel_conn_privs_',
      getItemLabel: (item) =>
        `${item.mbrRelationshipFirstNm || ''} ${item.mbrRelationshipLastNm || ''}`.trim() ||
        item.mbrRelationshipNickname ||
        'Relationship',
      getItemId: (item) => item.mbrRelationshipId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicRelationshipsConnectionPrivs({ mbrId, mbrRelationshipId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicRelationshipsConnectionPriv({ mbrId, mbrRelationshipId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicRelationshipsConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicRelationshipsConnectionPriv(privId)
    };
  }

  // 10. Achievements
  if (norm.includes('achieve')) {
    return {
      topicType: 'achievements',
      itemKeyField: 'mbrAchievementId',
      subItemName: 'Achievement',
      allLabel: 'All Achievements',
      sandboxPrefix: 'sandbox_achievements_conn_privs_',
      getItemLabel: (item) => item.mbrAchievementTitle || 'Achievement',
      getItemId: (item) => item.mbrAchievementId || '',
      fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicAchievementsConnectionPrivs({ mbrId, mbrAchievementId: itemId }),
      createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
        taskApi.createMemberTopicAchievementsConnectionPriv({ mbrId, mbrAchievementId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
      updatePriv: (privId, privValueCd) =>
        taskApi.updateMemberTopicAchievementsConnectionPriv(privId, { privValueCd }),
      deletePriv: (privId) => taskApi.deleteMemberTopicAchievementsConnectionPriv(privId)
    };
  }

  // 11. Generic fallback topic
  return {
    topicType: 'topic_custom',
    itemKeyField: 'topicId',
    subItemName: topicName,
    allLabel: `All ${topicName}`,
    sandboxPrefix: 'sandbox_topic_conn_privs_',
    getItemLabel: () => topicName,
    getItemId: () => resolvedTopicId || 'default',
    fetchPrivs: (mbrId, itemId) => taskApi.getMemberTopicConnectionPrivs({ mbrId, topicId: itemId }),
    createPriv: (mbrId, itemId, connMbrId, privValueCd) =>
      taskApi.createMemberTopicConnectionPriv({ mbrId, topicId: itemId, mbrConnectionMbrId: connMbrId, privValueCd }),
    updatePriv: (privId, privValueCd) =>
      taskApi.updateMemberTopicConnectionPriv(privId, { privValueCd }),
    deletePriv: (privId) => taskApi.deleteMemberTopicConnectionPriv(privId)
  };
}

const EMPTY_ITEMS: any[] = [];

export default function MbrTopicPrivacyModal({
  isOpen,
  onClose,
  mbrId: propMbrId,
  topicId: propTopicId,
  topicName,
  relationships = EMPTY_ITEMS,
  relationshipId: propRelationshipId,
  familyMembers = EMPTY_ITEMS,
  familyId: propFamilyId,
  topicItems = EMPTY_ITEMS,
  topicItemId: propTopicItemId,
  isSandbox = false,
  onSaved
}: MbrTopicPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<PrivacyTab>('groups');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedTopicId, setResolvedTopicId] = useState<string>(propTopicId || '');
  const [resolvedMbrId, setResolvedMbrId] = useState<string>(propMbrId || '');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Group privacy states
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  const [matrix, setMatrix] = useState<Record<string, PrivilegeState>>({});

  // Member connection privacy states
  const [selectedSubId, setSelectedSubId] = useState<string>('all');
  const [connectedMembers, setConnectedMembers] = useState<ConnectedMemberInfo[]>([]);
  // Maps subId -> (mbrConnectionMbrId -> MemberPrivilegeState)
  const [memberMatrixBySub, setMemberMatrixBySub] = useState<Record<string, Record<string, MemberPrivilegeState>>>({});
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Resolved list of topic subordinate items
  const resolvedItems = useMemo(() => {
    if (topicItems && topicItems.length > 0) return topicItems;
    if (relationships && relationships.length > 0) return relationships;
    if (familyMembers && familyMembers.length > 0) return familyMembers;
    return EMPTY_ITEMS;
  }, [topicItems, relationships, familyMembers]);

  // Topic handler
  const handler = useMemo(() => {
    return getTopicPrivHandler(topicName, resolvedTopicId || propTopicId);
  }, [topicName, resolvedTopicId, propTopicId]);

  // All topics now support Member Privacy Settings tab
  const hasMemberPrivacyTab = true;

  // Current active member matrix for the selected sub item
  const currentMemberMatrix = useMemo(() => {
    return memberMatrixBySub[selectedSubId] || {};
  }, [memberMatrixBySub, selectedSubId]);

  // Check if any group privilege differs from its initial/original value
  const hasGroupUnsaved = useMemo(() => {
    return (Object.values(matrix) as PrivilegeState[]).some((cell) => cell.privValueCd !== cell.originalPrivValueCd);
  }, [matrix]);

  // Check if any member privilege differs from its initial/original value
  const hasMemberUnsaved = useMemo(() => {
    for (const subId of Object.keys(memberMatrixBySub)) {
      const subMatrix = memberMatrixBySub[subId];
      if (subMatrix) {
        for (const cell of (Object.values(subMatrix) as MemberPrivilegeState[])) {
          if (cell.privValueCd !== cell.originalPrivValueCd) return true;
        }
      }
    }
    return false;
  }, [memberMatrixBySub]);

  const hasUnsavedChanges = useMemo(() => {
    return hasGroupUnsaved || hasMemberUnsaved;
  }, [hasGroupUnsaved, hasMemberUnsaved]);

  const loadPrivacyData = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowDiscardConfirm(false);
    setMemberSearchQuery('');

    try {
      // 1. Resolve Member ID
      let currentMbrId = propMbrId || '';
      if (!currentMbrId) {
        const userStr = sessionStorage.getItem('user');
        if (userStr && !isSandbox) {
          try {
            const u = JSON.parse(userStr);
            if (u.mbr_id) {
              currentMbrId = u.mbr_id;
            } else if (u.user_id) {
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) {
                currentMbrId = mbrProfile.mbrId;
              }
            }
          } catch (e) {
            console.warn('Could not retrieve member ID from user session:', e);
          }
        }
        if (!currentMbrId) {
          const storedMbr = sessionStorage.getItem('sb_current_mbr');
          if (storedMbr) {
            try {
              const parsed = JSON.parse(storedMbr);
              if (parsed.mbrId) currentMbrId = parsed.mbrId;
            } catch {}
          }
        }
        if (!currentMbrId) {
          currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
        }
      }
      setResolvedMbrId(currentMbrId);

      // 2. Resolve Topic ID by prop or name matching against database topics
      let currentTopicId = propTopicId || '';
      try {
        const topics = await taskApi.getTopics();
        if (topics && topics.length > 0) {
          const match = topics.find(
            (t) =>
              (t.topicId && propTopicId && t.topicId.toLowerCase() === propTopicId.toLowerCase()) ||
              (t.topicName && t.topicName.toLowerCase() === topicName.toLowerCase()) ||
              (t.topicFullName && t.topicFullName.toLowerCase() === topicName.toLowerCase()) ||
              (t.topicName && t.topicName.toLowerCase().includes(topicName.toLowerCase())) ||
              (t.topicFullName && t.topicFullName.toLowerCase().includes(topicName.toLowerCase())) ||
              topicName.toLowerCase().includes((t.topicName || '').toLowerCase())
          );
          if (match) {
            currentTopicId = match.topicId;
          } else if (!currentTopicId) {
            currentTopicId = topics[0].topicId;
          }
        }
      } catch (e) {
        console.warn('Could not fetch topics list for privacy modal:', e);
      }

      if (!currentTopicId) {
        currentTopicId = propTopicId || 't1';
      }
      setResolvedTopicId(currentTopicId);

      // 3. Fetch Groups (Global and Custom)
      let fetchedGlobals: any[] = [];
      let fetchedCustoms: any[] = [];
      try {
        fetchedGlobals = await taskApi.getGroupsGlobal();
      } catch (e) {
        console.warn('Error fetching global groups:', e);
      }
      try {
        fetchedCustoms = await taskApi.getGroupsCustom(currentMbrId);
      } catch (e) {
        console.warn('Error fetching custom groups:', e);
      }

      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: 'g1', grpName: 'Family', grpDescription: 'Immediate family members', grpSortOrder: 10 },
          { grpId: 'g2', grpName: 'Friends', grpDescription: 'Close personal friends', grpSortOrder: 20 },
          { grpId: 'g3', grpName: 'Work', grpDescription: 'Colleagues and coworkers', grpSortOrder: 30 },
          { grpId: 'g4', grpName: 'Public', grpDescription: 'All members and visitors', grpSortOrder: 40 }
        ];
      }

      const rawUnified: UnifiedGroup[] = [
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

      // Deduplicate groups by grpId to guarantee uniqueness
      const seenGrpIds = new Set<string>();
      const unified: UnifiedGroup[] = [];
      for (const g of rawUnified) {
        if (g.grpId && !seenGrpIds.has(g.grpId)) {
          seenGrpIds.add(g.grpId);
          unified.push(g);
        }
      }

      unified.sort((a, b) => {
        const orderA = a.grpSortOrder != null ? a.grpSortOrder : Infinity;
        const orderB = b.grpSortOrder != null ? b.grpSortOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.grpName.localeCompare(b.grpName);
      });

      setGroups(unified);

      // 4. Fetch Group Privileges for this member (mbrTopicGroupPrivs)
      let fetchedPrivs: any[] = [];
      if (!isSandbox) {
        try {
          fetchedPrivs = await taskApi.getMemberTopicGroupPrivs({ mbrId: currentMbrId });
        } catch (e) {
          console.warn('Error fetching member topic group privs:', e);
        }
      } else {
        const saved = sessionStorage.getItem(`sandbox_mbr_privs_${currentMbrId}`);
        if (saved) {
          try {
            fetchedPrivs = JSON.parse(saved);
          } catch {}
        }
      }

      const matrixMap: Record<string, PrivilegeState> = {};
      const privLookup = new Map<string, any>();
      for (const p of fetchedPrivs) {
        if (p.topicId === currentTopicId) {
          privLookup.set(p.grpId, p);
        }
      }

      for (const g of unified) {
        const existing = privLookup.get(g.grpId);
        const val = existing?.privValueCd || 'NONE';
        matrixMap[g.grpId] = {
          privId: existing?.privId,
          grpId: g.grpId,
          topicId: currentTopicId,
          privValueCd: val,
          originalPrivValueCd: val
        };
      }
      setMatrix(matrixMap);

      // 5. Fetch Connected Members from mbrConnection & load Member Privileges
      let connections: any[] = [];
      let allMembers: any[] = [];

      if (!isSandbox) {
        const [connsRes, membersRes] = await Promise.allSettled([
          taskApi.getMemberConnections({ mbrId: currentMbrId }),
          taskApi.getMembers({ limit: 300 })
        ]);

        if (connsRes.status === 'fulfilled' && Array.isArray(connsRes.value)) {
          connections = connsRes.value;
        }
        if (membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)) {
          allMembers = membersRes.value;
        }
      } else {
        const savedConns = sessionStorage.getItem(`sandbox_mbr_connections_${currentMbrId}`);
        if (savedConns) {
          try {
            connections = JSON.parse(savedConns);
          } catch {}
        }
      }

      // Fallback demo connections if empty
      if (connections.length === 0 && (isSandbox || !connections)) {
        connections = [
          { mbrConnectionId: 'c1', mbrId: currentMbrId, mbrConnectionMbrId: 'e1a2b3c4-1111-4000-8000-000000000001' },
          { mbrConnectionId: 'c2', mbrId: currentMbrId, mbrConnectionMbrId: 'e1a2b3c4-2222-4000-8000-000000000002' }
        ];
        allMembers = [
          {
            mbrId: 'e1a2b3c4-1111-4000-8000-000000000001',
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Vance',
            mbrLivesCityState: 'Boston, MA',
            mbrEmailAddress: 'eleanor.vance@storybook.ai'
          },
          {
            mbrId: 'e1a2b3c4-2222-4000-8000-000000000002',
            mbrFirstName: 'Thomas',
            mbrLastName: 'Sterling',
            mbrLivesCityState: 'New York, NY',
            mbrEmailAddress: 'thomas.sterling@storybook.ai'
          }
        ];
      }

      const membersById = new Map<string, any>();
      allMembers.forEach((m) => {
        if (m.mbrId) membersById.set(m.mbrId, m);
      });

      const resolvedConnMembers: ConnectedMemberInfo[] = [];
      const seenConnMbrIds = new Set<string>();

      for (const c of connections) {
        const targetMbrId = c.mbrConnectionMbrId;
        if (!targetMbrId || seenConnMbrIds.has(targetMbrId)) continue;
        seenConnMbrIds.add(targetMbrId);

        const mProfile = membersById.get(targetMbrId);
        const fullName = mProfile
          ? `${mProfile.mbrFirstName || ''} ${mProfile.mbrLastName || ''}`.trim() || 'Connected Member'
          : `Member (${targetMbrId.slice(0, 8)})`;

        resolvedConnMembers.push({
          connectionId: c.mbrConnectionId,
          mbrConnectionMbrId: targetMbrId,
          fullName,
          avatarUrl: mProfile?.mbrProfilePic ? resolveMediaUrl(mProfile.mbrProfilePic) : undefined,
          location: mProfile?.mbrLivesCityState || undefined,
          email: mProfile?.mbrEmailAddress || undefined
        });
      }

      resolvedConnMembers.sort((a, b) => a.fullName.localeCompare(b.fullName));
      setConnectedMembers(resolvedConnMembers);

      // 6. Fetch topic connection privileges for items
      const itemIdsToLoad: string[] = [];
      if (resolvedItems.length > 0) {
        resolvedItems.forEach((it) => {
          const id = handler.getItemId(it);
          if (id) itemIdsToLoad.push(id);
        });
      }
      const specificPropId = propTopicItemId || propRelationshipId || propFamilyId;
      if (specificPropId && !itemIdsToLoad.includes(specificPropId)) {
        itemIdsToLoad.push(specificPropId);
      }
      if (itemIdsToLoad.length === 0) {
        itemIdsToLoad.push(currentTopicId || 'default');
      }

      const newMatrixBySub: Record<string, Record<string, MemberPrivilegeState>> = {};

      for (const itemId of itemIdsToLoad) {
        let fetchedItemPrivs: any[] = [];
        if (!isSandbox && itemId !== 'default' && !itemId.startsWith('temp_')) {
          try {
            fetchedItemPrivs = await handler.fetchPrivs(currentMbrId, itemId);
          } catch (e) {
            console.warn(`Could not fetch connection privs for ${handler.subItemName} ${itemId}:`, e);
          }
        } else {
          const saved = sessionStorage.getItem(`${handler.sandboxPrefix}${itemId}`);
          if (saved) {
            try {
              fetchedItemPrivs = JSON.parse(saved);
            } catch {}
          }
        }

        const privLookupByConnMbr = new Map<string, any>();
        if (Array.isArray(fetchedItemPrivs)) {
          fetchedItemPrivs.forEach((p) => {
            if (p.mbrConnectionMbrId) privLookupByConnMbr.set(p.mbrConnectionMbrId, p);
          });
        }

        const itemMap: Record<string, MemberPrivilegeState> = {};
        for (const conn of resolvedConnMembers) {
          const existing = privLookupByConnMbr.get(conn.mbrConnectionMbrId);
          const val = existing?.privValueCd || 'NONE';
          itemMap[conn.mbrConnectionMbrId] = {
            privId: existing?.privId,
            mbrId: currentMbrId,
            subId: itemId,
            mbrConnectionMbrId: conn.mbrConnectionMbrId,
            privValueCd: val,
            originalPrivValueCd: val
          };
        }
        newMatrixBySub[itemId] = itemMap;
      }

      // Setup 'all' virtual view based on the first item
      const primaryItemId = specificPropId || itemIdsToLoad[0] || 'default';
      if (newMatrixBySub[primaryItemId]) {
        const allMap: Record<string, MemberPrivilegeState> = {};
        for (const [connMbrId, state] of Object.entries(newMatrixBySub[primaryItemId])) {
          allMap[connMbrId] = { ...state, subId: 'all' };
        }
        newMatrixBySub['all'] = allMap;
      }

      setMemberMatrixBySub(newMatrixBySub);

      if (specificPropId) {
        setSelectedSubId(specificPropId);
      } else {
        setSelectedSubId('all');
      }
    } catch (err: any) {
      console.error('Failed to load privacy modal data:', err);
      setError(err?.message || 'Failed to load privacy settings.');
    } finally {
      setLoading(false);
    }
  }, [
    isOpen,
    propMbrId,
    propTopicId,
    topicName,
    isSandbox,
    resolvedItems,
    handler,
    propTopicItemId,
    propRelationshipId,
    propFamilyId
  ]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab('groups');
      loadPrivacyData();
    }
  }, [isOpen, propMbrId, propTopicId, topicName, isSandbox]);

  // Handle group privilege code change
  const handlePrivilegeChange = (grpId: string, newValue: string) => {
    setMatrix((prev) => ({
      ...prev,
      [grpId]: {
        ...prev[grpId],
        privValueCd: newValue
      }
    }));
  };

  // Handle member connection privilege code change for selected item
  const handleMemberPrivilegeChange = (connMbrId: string, newValue: string) => {
    setMemberMatrixBySub((prev) => {
      const updated = { ...prev };
      const targetIds =
        resolvedItems.length > 0
          ? resolvedItems.map((it) => handler.getItemId(it)).filter(Boolean)
          : [resolvedTopicId || propTopicId || 'default'];

      if (selectedSubId === 'all') {
        // Update 'all' map and propagate to all individual item maps
        for (const itemId of [...targetIds, 'all']) {
          if (!updated[itemId]) updated[itemId] = {};
          const existing = updated[itemId][connMbrId];
          updated[itemId] = {
            ...updated[itemId],
            [connMbrId]: {
              ...existing,
              privValueCd: newValue
            }
          };
        }
      } else {
        // Update specific item map
        if (!updated[selectedSubId]) updated[selectedSubId] = {};
        const existing = updated[selectedSubId][connMbrId];
        updated[selectedSubId] = {
          ...updated[selectedSubId],
          [connMbrId]: {
            ...existing,
            privValueCd: newValue
          }
        };
      }
      return updated;
    });
  };

  // Close attempt handler - checks for unsaved edits
  const handleRequestClose = () => {
    if (hasUnsavedChanges && !saving) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  // Confirm discard unsaved changes
  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    // Reset group matrix values to original
    setMatrix((prev) => {
      const reverted: Record<string, PrivilegeState> = {};
      for (const [k, v] of Object.entries(prev) as [string, PrivilegeState][]) {
        reverted[k] = { ...v, privValueCd: v.originalPrivValueCd };
      }
      return reverted;
    });
    // Reset member matrix values to original
    setMemberMatrixBySub((prev) => {
      const reverted: Record<string, Record<string, MemberPrivilegeState>> = {};
      for (const [subId, subMap] of Object.entries(prev)) {
        reverted[subId] = {};
        for (const [connId, cell] of Object.entries(subMap)) {
          reverted[subId][connId] = { ...cell, privValueCd: cell.originalPrivValueCd };
        }
      }
      return reverted;
    });
    onClose();
  };

  // Cancel discard dialog and return to editing
  const handleCancelDiscard = () => {
    setShowDiscardConfirm(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const effectiveMbrId = resolvedMbrId || propMbrId;
      const effectiveTopicId = resolvedTopicId || propTopicId;
      const savePromises: Promise<any>[] = [];

      // 1. Save Group Privileges (mbrTopicGroupPrivs)
      for (const grpId of Object.keys(matrix)) {
        const cell = matrix[grpId];
        if (cell.privValueCd !== cell.originalPrivValueCd) {
          if (cell.privId) {
            if (!isSandbox) {
              savePromises.push(
                taskApi.updateMemberTopicGroupPriv(cell.privId, {
                  privValueCd: cell.privValueCd
                })
              );
            }
          } else {
            if (!isSandbox) {
              savePromises.push(
                taskApi
                  .createMemberTopicGroupPriv({
                    mbrId: effectiveMbrId,
                    topicId: cell.topicId || effectiveTopicId,
                    grpId: cell.grpId,
                    privValueCd: cell.privValueCd
                  })
                  .then((created) => {
                    cell.privId = created.privId;
                  })
              );
            }
          }
        }
      }

      // 2. Save Member Connection Privileges across target items
      const targetItemIds =
        resolvedItems.length > 0
          ? resolvedItems.map((it) => handler.getItemId(it)).filter(Boolean)
          : [resolvedTopicId || propTopicId || 'default'];

      for (const itemId of targetItemIds) {
        const itemMatrix = memberMatrixBySub[itemId];
        if (!itemMatrix) continue;

        for (const connMbrId of Object.keys(itemMatrix)) {
          const cell = itemMatrix[connMbrId];
          if (cell.privValueCd !== cell.originalPrivValueCd) {
            if (!isSandbox && itemId !== 'default' && !itemId.startsWith('temp_')) {
              if (cell.privId && cell.privValueCd === 'NONE') {
                savePromises.push(handler.deletePriv(cell.privId));
              } else if (cell.privId) {
                savePromises.push(handler.updatePriv(cell.privId, cell.privValueCd));
              } else if (cell.privValueCd !== 'NONE') {
                savePromises.push(
                  handler
                    .createPriv(effectiveMbrId, itemId, cell.mbrConnectionMbrId, cell.privValueCd)
                    .then((created) => {
                      cell.privId = created.privId;
                    })
                );
              }
            }
          }
        }

        if (isSandbox || itemId.startsWith('temp_') || itemId === 'default') {
          sessionStorage.setItem(`${handler.sandboxPrefix}${itemId}`, JSON.stringify(Object.values(itemMatrix)));
        }
      }

      if (!isSandbox) {
        await Promise.all(savePromises);
      } else {
        const currentPrivsStr = sessionStorage.getItem(`sandbox_mbr_privs_${effectiveMbrId}`);
        let allPrivs: any[] = [];
        if (currentPrivsStr) {
          try {
            allPrivs = JSON.parse(currentPrivsStr);
          } catch {}
        }
        const filtered = allPrivs.filter((p) => p.topicId !== effectiveTopicId);
        const updated = [...filtered, ...Object.values(matrix)];
        sessionStorage.setItem(`sandbox_mbr_privs_${effectiveMbrId}`, JSON.stringify(updated));
      }

      // Update baseline states to reflect saved values
      setMatrix((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated)) {
          updated[k] = { ...updated[k], originalPrivValueCd: updated[k].privValueCd };
        }
        return updated;
      });

      setMemberMatrixBySub((prev) => {
        const updated = { ...prev };
        for (const subId of Object.keys(updated)) {
          const map = updated[subId];
          for (const connId of Object.keys(map)) {
            map[connId] = { ...map[connId], originalPrivValueCd: map[connId].privValueCd };
          }
        }
        return updated;
      });

      setSuccess(`Privacy settings for ${topicName} saved successfully.`);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Failed to save privacy settings:', err);
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        const effectiveMbrId = resolvedMbrId || propMbrId;
        const effectiveTopicId = resolvedTopicId || propTopicId;
        const currentPrivsStr = sessionStorage.getItem(`sandbox_mbr_privs_${effectiveMbrId}`);
        let allPrivs: any[] = [];
        if (currentPrivsStr) {
          try {
            allPrivs = JSON.parse(currentPrivsStr);
          } catch {}
        }
        const filtered = allPrivs.filter((p) => p.topicId !== effectiveTopicId);
        const updated = [...filtered, ...Object.values(matrix)];
        sessionStorage.setItem(`sandbox_mbr_privs_${effectiveMbrId}`, JSON.stringify(updated));

        setMatrix((prev) => {
          const updatedState = { ...prev };
          for (const k of Object.keys(updatedState)) {
            updatedState[k] = { ...updatedState[k], originalPrivValueCd: updatedState[k].privValueCd };
          }
          return updatedState;
        });

        setSuccess(`Privacy settings saved (offline cached).`);
        if (onSaved) onSaved();
        setTimeout(() => {
          onClose();
        }, 800);
        return;
      }
      setError(err?.message || 'Failed to save privacy settings.');
    } finally {
      setSaving(false);
    }
  };

  const getGroupIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('family')) return <Users className="w-4 h-4 text-blue-600" />;
    if (n.includes('friend')) return <UserCheck className="w-4 h-4 text-emerald-600" />;
    if (n.includes('work') || n.includes('colleague')) return <Briefcase className="w-4 h-4 text-violet-600" />;
    if (n.includes('public')) return <Globe className="w-4 h-4 text-amber-600" />;
    return <Shield className="w-4 h-4 text-slate-600" />;
  };

  // Filtered members for member tab search
  const filteredMembers = useMemo(() => {
    if (!memberSearchQuery.trim()) return connectedMembers;
    const q = memberSearchQuery.toLowerCase();
    return connectedMembers.filter(
      (m) =>
        m.fullName.toLowerCase().includes(q) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q))
    );
  }, [connectedMembers, memberSearchQuery]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div
            key="topic-privacy-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestClose();
              }
            }}
          >
            <motion.div
              key="topic-privacy-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-xl w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 border border-blue-100/80 rounded-2xl shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      Privacy Settings
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Topic:</span>
                      <span className="font-bold text-amber-600">{topicName}</span>
                      {hasUnsavedChanges && (
                        <span className="ml-1.5 px-1.5 py-0.5 rounded text-[9.5px] font-bold bg-amber-100 text-amber-800">
                          Unsaved edits
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestClose}
                  disabled={saving}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Banners */}
              {error && (
                <div className="mt-3 bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center justify-between shrink-0">
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              {success && (
                <div className="mt-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 rounded-xl text-xs font-medium flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{success}</span>
                  </div>
                </div>
              )}

              {/* Tab Navigation Component */}
              <div className="mt-3.5 flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/80 shrink-0 gap-1">
                <button
                  type="button"
                  id="tab-btn-topic-group-privacy"
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    activeTab === 'groups'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Group Privacy Settings</span>
                  {hasGroupUnsaved && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved group edits" />
                  )}
                </button>

                <button
                  type="button"
                  id="tab-btn-topic-member-privacy"
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <UserCheck className="w-4 h-4 text-emerald-600" />
                  <span>Member Privacy Settings</span>
                  {connectedMembers.length > 0 && (
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] font-sans font-semibold bg-slate-200/80 text-slate-700">
                      {connectedMembers.length}
                    </span>
                  )}
                  {hasMemberUnsaved && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved member edits" />
                  )}
                </button>
              </div>

              {/* Helper Description based on Active Tab */}
              <div className="mt-2.5 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11.5px] text-slate-600 font-serif shrink-0">
                {activeTab === 'groups'
                  ? `Select the access privilege for each group to control who can view entries in the ${topicName} topic.`
                  : `Configure individual access privileges for connected members in your network for ${topicName} records.`}
              </div>

              {/* Modal Body: Active Tab Content */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[180px]">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs font-serif">Loading privacy settings...</span>
                  </div>
                ) : activeTab === 'groups' ? (
                  // --- GROUP PRIVACY SETTINGS TAB ---
                  groups.map((grp, index) => {
                    const currentVal = matrix[grp.grpId]?.privValueCd || 'NONE';
                    const isModified = matrix[grp.grpId]?.privValueCd !== matrix[grp.grpId]?.originalPrivValueCd;
                    const groupKey = `privacy-group-${grp.isCustom ? 'custom' : 'global'}-${grp.grpId || index}`;

                    return (
                      <div
                        key={groupKey}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 border rounded-2xl transition-colors ${
                          isModified
                            ? 'bg-amber-50/40 border-amber-200/80'
                            : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-white border border-slate-200/70 rounded-xl shrink-0">
                            {getGroupIcon(grp.grpName)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-bold text-slate-800 text-xs sm:text-sm truncate">
                                {grp.grpName}
                              </span>
                              {grp.isCustom && (
                                <span className="px-1.5 py-0.2 rounded text-[8.5px] font-bold bg-violet-100 text-violet-700">
                                  Custom
                                </span>
                              )}
                              {isModified && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Modified" />
                              )}
                            </div>
                            {grp.grpDescription && (
                              <span className="text-[10.5px] text-slate-400 font-serif truncate">
                                {grp.grpDescription}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full sm:w-48 shrink-0 mt-1 sm:mt-0">
                          <CdSelect
                            tag="privValueCd"
                            value={currentVal}
                            onChange={(newVal) => handlePrivilegeChange(grp.grpId, newVal)}
                            includeEmptyOption={false}
                            showDescriptionHelper={false}
                          />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  // --- MEMBER PRIVACY SETTINGS TAB ---
                  <div className="space-y-2.5">
                    {/* Item Selector when multiple items exist */}
                    {resolvedItems.length > 1 && (
                      <div className="flex items-center gap-2 mb-2 p-2 bg-slate-50 border border-slate-200/80 rounded-xl">
                        <span className="text-[11px] font-bold text-slate-600 shrink-0">Configure for:</span>
                        <select
                          id="topic-item-privacy-selector"
                          value={selectedSubId}
                          onChange={(e) => setSelectedSubId(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-serif text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="all">{handler.allLabel}</option>
                          {resolvedItems.map((item, idx) => {
                            const id = handler.getItemId(item) || `item-${idx}`;
                            const label = handler.getItemLabel(item);
                            return (
                              <option key={id} value={id}>
                                {label}
                              </option>
                            );
                          })}
                        </select>
                      </div>
                    )}

                    {connectedMembers.length >= 4 && (
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          placeholder="Search connected members..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 font-serif"
                        />
                      </div>
                    )}

                    {connectedMembers.length === 0 ? (
                      <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
                        <UserCheck className="w-8 h-8 text-slate-350" />
                        <p className="text-xs font-semibold text-slate-750 font-serif">No Connected Members Found</p>
                        <p className="text-[11px] text-slate-400 font-serif max-w-xs leading-relaxed">
                          You haven't established connections with other members yet. Add connections in your
                          Connections directory to configure individual member privileges.
                        </p>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 font-serif">
                        No connected members match "{memberSearchQuery}".
                      </div>
                    ) : (
                      filteredMembers.map((conn) => {
                        const cell = currentMemberMatrix[conn.mbrConnectionMbrId];
                        const currentVal = cell?.privValueCd || 'NONE';
                        const isModified = cell && cell.privValueCd !== cell.originalPrivValueCd;
                        const memberKey = `topic-privacy-member-${conn.mbrConnectionMbrId}`;

                        return (
                          <div
                            key={memberKey}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 border rounded-2xl transition-colors ${
                              isModified
                                ? 'bg-amber-50/40 border-amber-200/80'
                                : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200/80 shrink-0 bg-blue-50 flex items-center justify-center">
                                {conn.avatarUrl ? (
                                  <img
                                    src={conn.avatarUrl}
                                    alt={conn.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-blue-700 font-serif">
                                    {conn.fullName.slice(0, 2).toUpperCase()}
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="font-serif font-bold text-slate-800 text-xs sm:text-sm truncate">
                                    {conn.fullName}
                                  </span>
                                  {isModified && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" title="Modified" />
                                  )}
                                </div>
                                <span className="text-[10.5px] text-slate-400 font-serif truncate">
                                  {conn.location || conn.email || 'Connected Member'}
                                </span>
                              </div>
                            </div>

                            <div className="w-full sm:w-48 shrink-0 mt-1 sm:mt-0">
                              <CdSelect
                                id={`select-member-priv-${conn.mbrConnectionMbrId}`}
                                tag="privValueCd"
                                value={currentVal}
                                onChange={(newVal) => handleMemberPrivilegeChange(conn.mbrConnectionMbrId, newVal)}
                                includeEmptyOption={false}
                                showDescriptionHelper={false}
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#EFECE7] shrink-0">
                <button
                  type="button"
                  onClick={handleRequestClose}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading || saving}
                  className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 border border-blue-600 font-sans"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Privacy Settings</span>
                </button>
              </div>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showDiscardConfirm && (
                  <div
                    key="discard-confirm-overlay"
                    className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4"
                  >
                    <motion.div
                      key="discard-confirm-dialog"
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 8 }}
                      className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 max-w-sm w-full text-center flex flex-col items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-slate-800">Discard Unsaved Changes?</h4>
                      <p className="text-xs text-slate-500 font-serif mt-1.5 mb-5 leading-relaxed">
                        You have unsaved changes to your privacy settings for{' '}
                        <span className="font-bold text-amber-600">{topicName}</span>. If you leave now, these changes
                        will be discarded.
                      </p>
                      <div className="flex items-center gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={handleCancelDiscard}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Keep Editing
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDiscard}
                          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AdminComponentTag name="mbrTopicPrivacyModal" />
    </>
  );
}

export { MbrTopicPrivacyModal, MbrTopicPrivacyModal as mbrTopicPrivacyModal, MbrTopicPrivacyModal as SbTopicPrivacyModal };
