/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { taskApi, Topic, GroupGlobal, GroupCustom, MbrTopicGroupPrivs } from '@/src/services/api.ts';
import { useCodes } from '@/src/context/CodeContext.tsx';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { MbrPrivacyFeatureProps, UnifiedGroup, PrivilegeCell, ViewMode } from '../types';
import PrivacyHeader from './PrivacyHeader';
import PrivacyViewToolbar from './PrivacyViewToolbar';
import PrivacyByTopicView from './PrivacyByTopicView';
import PrivacyByGroupView from './PrivacyByGroupView';
import { generatePrivacyPdf } from '../utils/generatePrivacyPdf';

export default function MbrPrivacyFeature({ isSandbox, onClickBack, onDirtyChange }: MbrPrivacyFeatureProps) {
  const { getCodesByTag, loading: codesLoading } = useCodes();
  const privCodes = getCodesByTag('privValueCd');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [mbrEmail, setMbrEmail] = useState<string>('eleanor.vance@storybook.ai');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  
  // Matrix map: key is `${topicId}_${grpId}` -> PrivilegeCell
  const [matrix, setMatrix] = useState<Record<string, PrivilegeCell>>({});
  const [initialMatrix, setInitialMatrix] = useState<Record<string, PrivilegeCell>>({});

  // View mode: 'by-topic' | 'by-group'
  const [viewMode, setViewMode] = useState<ViewMode>('by-topic');
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);

  // Determine dirty state
  const isDirty = useMemo(() => {
    for (const key of Object.keys(matrix)) {
      const current = matrix[key];
      const initial = initialMatrix[key];
      if (!initial && current.privValueCd !== 'NONE') return true;
      if (initial && initial.privValueCd !== current.privValueCd) return true;
    }
    return false;
  }, [matrix, initialMatrix]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Load all topics, groups, and privileges
  const loadPrivacyData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Identify member ID & email
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      let currentEmail = 'eleanor.vance@storybook.ai';

      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email) currentEmail = u.email;
          if (!isSandbox) {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              currentMbrId = mbrProfile.mbrId;
              if (mbrProfile.mbrEmailAddress) currentEmail = mbrProfile.mbrEmailAddress;
            }
          }
        } catch (e) {
          console.warn("Could not retrieve member ID, using fallback:", e);
        }
      } else {
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) currentMbrId = parsed.mbrId;
            if (parsed.mbrEmailAddress) currentEmail = parsed.mbrEmailAddress;
          } catch {}
        }
      }
      setMbrId(currentMbrId);
      setMbrEmail(currentEmail);

      // 2. Fetch Topics
      let fetchedTopics: Topic[] = [];
      try {
        fetchedTopics = await taskApi.getTopics();
      } catch (e) {
        console.warn("Error fetching topics:", e);
      }
      if (!fetchedTopics || fetchedTopics.length === 0) {
        fetchedTopics = [
          { topicId: 't1', topicName: 'Family', topicFullName: 'Family' },
          { topicId: 't2', topicName: 'Residencies', topicFullName: 'Residencies' },
          { topicId: 't3', topicName: 'Achievements', topicFullName: 'Achievements' },
          { topicId: 't4', topicName: 'Education', topicFullName: 'Education & Training' },
          { topicId: 't5', topicName: 'Employment', topicFullName: 'Employment & Career' },
          { topicId: 't6', topicName: 'Hobbies', topicFullName: 'Activities & Hobbies' }
        ];
      }
      setTopics(fetchedTopics);
      if (fetchedTopics.length > 0 && !selectedTopicId) {
        setSelectedTopicId(fetchedTopics[0].topicId);
      }

      // 3. Fetch Groups (Global & Custom)
      let fetchedGlobals: GroupGlobal[] = [];
      let fetchedCustoms: GroupCustom[] = [];
      try {
        fetchedGlobals = await taskApi.getGroupsGlobal();
      } catch (e) {
        console.warn("Error fetching global groups:", e);
      }
      try {
        fetchedCustoms = await taskApi.getGroupsCustom(currentMbrId);
      } catch (e) {
        console.warn("Error fetching custom groups:", e);
      }

      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: 'g1', grpName: 'Family', grpDescription: 'Immediate family members', grpSortOrder: 10 },
          { grpId: 'g2', grpName: 'Friends', grpDescription: 'Close personal friends', grpSortOrder: 20 },
          { grpId: 'g3', grpName: 'Work', grpDescription: 'Colleagues and coworkers', grpSortOrder: 30 },
          { grpId: 'g4', grpName: 'Public', grpDescription: 'All members and visitors', grpSortOrder: 40 }
        ];
      }

      const unified: UnifiedGroup[] = [
        ...fetchedGlobals.map(g => ({
          grpId: g.grpId,
          grpName: g.grpName,
          grpDescription: g.grpDescription,
          grpSortOrder: g.grpSortOrder,
          isCustom: false
        })),
        ...fetchedCustoms.map(c => ({
          grpId: c.grpId,
          grpName: c.grpName,
          grpDescription: 'Custom Member Group',
          grpSortOrder: c.grpSortOrder,
          isCustom: true
        }))
      ];

      // Sort unified groups by grpSortOrder ASC (nulls/undefined placed last), secondary by grpName
      unified.sort((a, b) => {
        const orderA = a.grpSortOrder != null ? a.grpSortOrder : Infinity;
        const orderB = b.grpSortOrder != null ? b.grpSortOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.grpName.localeCompare(b.grpName);
      });

      setGroups(unified);

      // 4. Fetch Member Topic Group Privileges
      let fetchedPrivs: MbrTopicGroupPrivs[] = [];
      if (!isSandbox) {
        try {
          fetchedPrivs = await taskApi.getMemberTopicGroupPrivs({ mbrId: currentMbrId });
        } catch (e) {
          console.warn("Error fetching mbrTopicGroupPrivs:", e);
        }
      } else {
        const saved = sessionStorage.getItem(`sandbox_mbr_privs_${currentMbrId}`);
        if (saved) {
          try {
            fetchedPrivs = JSON.parse(saved);
          } catch {}
        }
      }

      // 5. Build initial matrix map
      const newMatrix: Record<string, PrivilegeCell> = {};
      const existingPrivMap = new Map<string, MbrTopicGroupPrivs>();
      for (const p of fetchedPrivs) {
        existingPrivMap.set(`${p.topicId}_${p.grpId}`, p);
      }

      for (const topic of fetchedTopics) {
        for (const grp of unified) {
          const key = `${topic.topicId}_${grp.grpId}`;
          const existing = existingPrivMap.get(key);
          const val = existing?.privValueCd || 'NONE';
          newMatrix[key] = {
            privId: existing?.privId,
            topicId: topic.topicId,
            grpId: grp.grpId,
            privValueCd: val,
            originalPrivValueCd: val
          };
        }
      }

      setMatrix(newMatrix);
      setInitialMatrix(JSON.parse(JSON.stringify(newMatrix)));
    } catch (err: any) {
      console.error("Failed to load privacy settings:", err);
      setError(err?.message || "Failed to load privacy settings.");
    } finally {
      setLoading(false);
    }
  }, [isSandbox, selectedTopicId]);

  useEffect(() => {
    loadPrivacyData();
  }, [loadPrivacyData]);

  // Update privilege in matrix
  const handlePrivilegeChange = (topicId: string, grpId: string, newValue: string) => {
    const key = `${topicId}_${grpId}`;
    setMatrix(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        topicId,
        grpId,
        privValueCd: newValue
      }
    }));
  };

  // Batch action: Set all groups in a topic
  const handleSetAllForTopic = (topicId: string, value: string) => {
    setMatrix(prev => {
      const next = { ...prev };
      for (const grp of groups) {
        const key = `${topicId}_${grp.grpId}`;
        if (next[key]) {
          next[key] = { ...next[key], privValueCd: value };
        }
      }
      return next;
    });
  };

  // Batch action: Set all topics for a group
  const handleSetAllForGroup = (grpId: string, value: string) => {
    setMatrix(prev => {
      const next = { ...prev };
      for (const topic of topics) {
        const key = `${topic.topicId}_${grpId}`;
        if (next[key]) {
          next[key] = { ...next[key], privValueCd: value };
        }
      }
      return next;
    });
  };

  // Save all modified privileges
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const savePromises: Promise<any>[] = [];

      for (const key of Object.keys(matrix)) {
        const cell = matrix[key];
        const initial = initialMatrix[key];

        // If changed
        if (!initial || initial.privValueCd !== cell.privValueCd) {
          if (cell.privId) {
            // Update existing
            if (!isSandbox) {
              savePromises.push(
                taskApi.updateMemberTopicGroupPriv(cell.privId, {
                  privValueCd: cell.privValueCd
                })
              );
            }
          } else {
            // Create new record
            if (!isSandbox) {
              savePromises.push(
                taskApi.createMemberTopicGroupPriv({
                  mbrId,
                  topicId: cell.topicId,
                  grpId: cell.grpId,
                  privValueCd: cell.privValueCd
                }).then(created => {
                  cell.privId = created.privId;
                })
              );
            }
          }
        }
      }

      if (!isSandbox) {
        await Promise.all(savePromises);
      } else {
        sessionStorage.setItem(`sandbox_mbr_privs_${mbrId}`, JSON.stringify(Object.values(matrix)));
      }

      setInitialMatrix(JSON.parse(JSON.stringify(matrix)));
      setSuccess("Privacy privileges successfully saved.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error("Failed to save privacy privileges:", err);
      setError(err?.message || "Failed to save privacy privileges. Please check constraints.");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setMatrix(JSON.parse(JSON.stringify(initialMatrix)));
  };

  const handlePrintPdf = () => {
    generatePrivacyPdf({
      mbrId,
      mbrEmail,
      topics,
      groups,
      matrix,
      privCodes
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 relative">
      <AdminComponentTag name="MbrPrivacyFeature.tsx" />

      {/* Header Section */}
      <PrivacyHeader
        isDirty={isDirty}
        saving={saving}
        success={success}
        error={error}
        onClickBack={onClickBack}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* View Mode Toolbar */}
      <PrivacyViewToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onPrintPdf={handlePrintPdf}
      />

      {/* Main Content Area */}
      {loading || codesLoading ? (
        <div className="w-full h-72 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading member privacy privileges & lookup codes...
          </span>
        </div>
      ) : (
        <>
          {/* By Topic View */}
          {viewMode === 'by-topic' && (
            <PrivacyByTopicView
              topics={topics}
              groups={groups}
              matrix={matrix}
              selectedTopicId={selectedTopicId}
              privCodes={privCodes}
              onSelectTopic={setSelectedTopicId}
              onPrivilegeChange={handlePrivilegeChange}
              onSetAllForTopic={handleSetAllForTopic}
            />
          )}

          {/* By Group View */}
          {viewMode === 'by-group' && (
            <PrivacyByGroupView
              groups={groups}
              topics={topics}
              matrix={matrix}
              privCodes={privCodes}
              onPrivilegeChange={handlePrivilegeChange}
              onSetAllForGroup={handleSetAllForGroup}
            />
          )}
        </>
      )}
    </div>
  );
}
