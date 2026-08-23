/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Shield, 
  Lock, 
  Globe, 
  Users, 
  Eye, 
  MessageSquare, 
  EyeOff, 
  Save, 
  RotateCcw, 
  Check, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  LayoutList, 
  ChevronRight,
  HelpCircle
} from 'lucide-react';
import { taskApi, Topic, GroupGlobal, GroupCustom, MbrTopicGroupPrivs, Cd } from '@/src/services/api.ts';
import { useCodes } from '@/src/context/CodeContext.tsx';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { CdSelect } from '@/src/components/CdSelect.tsx';

interface MbrPrivacyFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

interface UnifiedGroup {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  isCustom: boolean;
}

interface PrivilegeCell {
  privId?: string;
  topicId: string;
  grpId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

export default function MbrPrivacyFeature({ isSandbox, onClickBack, onDirtyChange }: MbrPrivacyFeatureProps) {
  const { getCodesByTag, getCode, loading: codesLoading } = useCodes();
  const privCodes = getCodesByTag('privValueCd');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  
  // Matrix map: key is `${topicId}_${grpId}` -> PrivilegeCell
  const [matrix, setMatrix] = useState<Record<string, PrivilegeCell>>({});
  const [initialMatrix, setInitialMatrix] = useState<Record<string, PrivilegeCell>>({});

  // View mode: 'by-topic' | 'by-group'
  const [viewMode, setViewMode] = useState<'by-topic' | 'by-group'>('by-topic');
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
      // 1. Identify member ID
      let currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr && !isSandbox) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            currentMbrId = mbrProfile.mbrId;
          }
        } catch (e) {
          console.warn("Could not retrieve member ID, using fallback:", e);
        }
      }
      setMbrId(currentMbrId);

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
          const val = existing?.privValueCd || 'NONE'; // default to No Access ('NONE') if no record saved yet
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

  // Helper icon renderer for privValueCd
  const renderPrivIcon = (val: string) => {
    switch (val) {
      case 'WRITE':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-500" />;
      case 'READ':
        return <Eye className="w-3.5 h-3.5 text-emerald-500" />;
      case 'NONE':
      default:
        return <EyeOff className="w-3.5 h-3.5 text-rose-400" />;
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 relative">
      <AdminComponentTag name="MbrPrivacyFeature.tsx" />

      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <button
            type="button"
            onClick={onClickBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center shadow-md shadow-amber-500/20 text-white">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                Member Privacy & Permissions
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure who can view or comment on your StoryBook topics across each personal and social group.
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={handleReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-sans shadow-md transition-all cursor-pointer ${
              isDirty && !saving
                ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-600/30 active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Settings...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Privacy Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Feedback */}
      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 shadow-xs"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="text-sm font-medium">{success}</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3 shadow-xs"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Mode Toolbar */}
      <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        {/* Layout Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <button
            type="button"
            onClick={() => setViewMode('by-topic')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'by-topic'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>By Topic</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('by-group')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              viewMode === 'by-group'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>By Group</span>
          </button>
        </div>
      </div>

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
          {/* --- VIEW 1: BY TOPIC VIEW --- */}
          {viewMode === 'by-topic' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {/* Topic Selector Sidebar */}
              <div className="md:col-span-1 space-y-2">
                <h3 className="text-xs font-bold uppercase text-slate-400 px-2 tracking-wider mb-2">
                  Select Topic
                </h3>
                {topics.map(topic => {
                  const isSelected = selectedTopicId === topic.topicId;
                  return (
                    <button
                      key={topic.topicId}
                      type="button"
                      onClick={() => setSelectedTopicId(topic.topicId)}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                          : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                      }`}
                    >
                      <span>{topic.topicFullName || topic.topicName}</span>
                      <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    </button>
                  );
                })}
              </div>

              {/* Topic Detail & Groups Configuration */}
              <div className="md:col-span-3">
                {selectedTopicId && (
                  <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
                      <div>
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                          Topic Configuration
                        </span>
                        <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                          {topics.find(t => t.topicId === selectedTopicId)?.topicFullName || topics.find(t => t.topicId === selectedTopicId)?.topicName}
                        </h2>
                      </div>

                      {/* Quick Apply All for Topic */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">Set all to:</span>
                        <select
                          onChange={(e) => {
                            if (e.target.value) {
                              handleSetAllForTopic(selectedTopicId, e.target.value);
                              e.target.value = '';
                            }
                          }}
                          defaultValue=""
                          className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                        >
                          <option value="" disabled>Choose Code...</option>
                          {privCodes.map(c => (
                            <option key={c.cdId || c.cdValue} value={c.cdValue}>
                              {c.cdLabel || c.cdValue}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Groups List */}
                    <div className="space-y-3">
                      {groups.map(grp => {
                        const key = `${selectedTopicId}_${grp.grpId}`;
                        const cell = matrix[key];
                        const currentValue = cell?.privValueCd || 'NONE';

                        return (
                          <div
                            key={grp.grpId}
                            className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                          >
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                                  {grp.grpName}
                                </span>
                                {grp.isCustom && (
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 font-medium">
                                    Custom
                                  </span>
                                )}
                              </div>
                              {grp.grpDescription && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">
                                  {grp.grpDescription}
                                </p>
                              )}
                            </div>

                            <div className="w-full sm:w-48 shrink-0">
                              <CdSelect
                                tag="privValueCd"
                                value={currentValue}
                                onChange={(newVal) => handlePrivilegeChange(selectedTopicId, grp.grpId, newVal)}
                                includeEmptyOption={false}
                                showDescriptionHelper={true}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* --- VIEW 3: BY GROUP VIEW --- */}
          {viewMode === 'by-group' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {groups.map(grp => (
                <div
                  key={grp.grpId}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-amber-500" />
                        <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                          {grp.grpName}
                        </h3>
                      </div>
                      {grp.grpDescription && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {grp.grpDescription}
                        </p>
                      )}
                    </div>

                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          handleSetAllForGroup(grp.grpId, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      defaultValue=""
                      className="text-[11px] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    >
                      <option value="" disabled>Set All...</option>
                      {privCodes.map(c => (
                        <option key={c.cdId || c.cdValue} value={c.cdValue}>
                          {c.cdLabel || c.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    {topics.map(topic => {
                      const key = `${topic.topicId}_${grp.grpId}`;
                      const cell = matrix[key];
                      const currentValue = cell?.privValueCd || 'NONE';

                      return (
                        <div
                          key={topic.topicId}
                          className="flex items-center justify-between gap-3 text-xs"
                        >
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {topic.topicFullName || topic.topicName}
                          </span>
                          <div className="w-36">
                            <CdSelect
                              tag="privValueCd"
                              value={currentValue}
                              onChange={(newVal) => handlePrivilegeChange(topic.topicId, grp.grpId, newVal)}
                              includeEmptyOption={false}
                              className="text-xs py-1 px-2 rounded-lg"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
