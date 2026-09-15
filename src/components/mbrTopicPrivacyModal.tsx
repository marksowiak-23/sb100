/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, X, CheckCircle2, Save, Loader2, Users, UserCheck, Briefcase, Globe, Shield, AlertTriangle } from 'lucide-react';
import { taskApi } from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrTopicPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mbrId: string;
  topicId?: string;
  topicName: string;
  isSandbox?: boolean;
  onSaved?: () => void;
}

export type SbTopicPrivacyModalProps = MbrTopicPrivacyModalProps;
export type mbrTopicPrivacyModalProps = MbrTopicPrivacyModalProps;

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

export default function MbrTopicPrivacyModal({
  isOpen,
  onClose,
  mbrId: propMbrId,
  topicId: propTopicId,
  topicName,
  isSandbox = false,
  onSaved
}: MbrTopicPrivacyModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedTopicId, setResolvedTopicId] = useState<string>(propTopicId || '');
  const [resolvedMbrId, setResolvedMbrId] = useState<string>(propMbrId || '');
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  const [matrix, setMatrix] = useState<Record<string, PrivilegeState>>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Check if any privilege value differs from its initial/original value
  const hasUnsavedChanges = useMemo(() => {
    return Object.values(matrix).some((cell) => cell.privValueCd !== cell.originalPrivValueCd);
  }, [matrix]);

  const loadPrivacyData = useCallback(async () => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    setShowDiscardConfirm(false);

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
              (topicName.toLowerCase().includes((t.topicName || '').toLowerCase()))
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

      // 4. Fetch Privileges for this member
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
    } catch (err: any) {
      console.error('Failed to load privacy modal data:', err);
      setError(err?.message || 'Failed to load privacy settings.');
    } finally {
      setLoading(false);
    }
  }, [isOpen, propMbrId, propTopicId, topicName, isSandbox]);

  useEffect(() => {
    if (isOpen) {
      loadPrivacyData();
    }
  }, [isOpen, loadPrivacyData]);

  const handlePrivilegeChange = (grpId: string, newValue: string) => {
    setMatrix((prev) => ({
      ...prev,
      [grpId]: {
        ...prev[grpId],
        privValueCd: newValue
      }
    }));
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
    // Reset matrix values to original
    setMatrix((prev) => {
      const reverted: Record<string, PrivilegeState> = {};
      for (const [k, v] of Object.entries(prev)) {
        reverted[k] = { ...v, privValueCd: v.originalPrivValueCd };
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
      const savePromises: Promise<any>[] = [];
      const effectiveMbrId = resolvedMbrId || propMbrId;
      const effectiveTopicId = resolvedTopicId || propTopicId;

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
                taskApi.createMemberTopicGroupPriv({
                  mbrId: effectiveMbrId,
                  topicId: cell.topicId || effectiveTopicId,
                  grpId: cell.grpId,
                  privValueCd: cell.privValueCd
                }).then((created) => {
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

      setMatrix((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated)) {
          updated[k] = { ...updated[k], originalPrivValueCd: updated[k].privValueCd };
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
      // Fallback to session storage if network issue occurs so changes are not lost
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
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
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
                      <span className="font-bold text-amber-500">{topicName}</span>
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

              {/* Modal Body / Groups List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[160px]">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    <span className="text-xs font-serif">Loading privacy settings...</span>
                  </div>
                ) : (
                  groups.map((grp, index) => {
                    const currentVal = matrix[grp.grpId]?.privValueCd || 'NONE';
                    const isModified = matrix[grp.grpId]?.privValueCd !== matrix[grp.grpId]?.originalPrivValueCd;
                    const groupKey = `privacy-group-${grp.isCustom ? 'custom' : 'global'}-${grp.grpId || index}`;

                    return (
                      <div
                        key={groupKey}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 border rounded-2xl transition-colors ${
                          isModified ? 'bg-amber-50/40 border-amber-200/80' : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-white border border-slate-200/70 rounded-xl shrink-0">
                            {getGroupIcon(grp.grpName)}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-serif font-bold text-slate-800 text-xs truncate">
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
                              <span className="text-[10px] text-slate-400 font-serif truncate">
                                {grp.grpDescription}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="w-full sm:w-44 shrink-0">
                          <CdSelect
                            tag="privValueCd"
                            value={currentVal}
                            onChange={(newVal) => handlePrivilegeChange(grp.grpId, newVal)}
                            includeEmptyOption={false}
                            showDescriptionHelper={false}
                            className="text-xs py-1.5 px-2.5"
                          />
                        </div>
                      </div>
                    );
                  })
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
                  <div key="discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
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
                        You have unsaved changes to your privacy settings for <span className="font-bold text-amber-600">{topicName}</span>. If you leave now, these changes will be discarded.
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
