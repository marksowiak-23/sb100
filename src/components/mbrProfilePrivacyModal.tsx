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

export interface MbrProfilePrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  mbrId?: string;
  memberName?: string;
  isSandbox?: boolean;
  onSaved?: () => void;
}

export type SbProfilePrivacyModalProps = MbrProfilePrivacyModalProps;
export type SbMbrProfilePrivacyModalProps = MbrProfilePrivacyModalProps;
export type mbrProfilePrivacyModalProps = MbrProfilePrivacyModalProps;

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
  mbrId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

export default function MbrProfilePrivacyModal({
  isOpen,
  onClose,
  mbrId: propMbrId,
  memberName = 'Member Profile',
  isSandbox = false,
  onSaved
}: MbrProfilePrivacyModalProps) {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedMbrId, setResolvedMbrId] = useState<string>(propMbrId || '');
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  const [matrix, setMatrix] = useState<Record<string, PrivilegeState>>({});
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Check if any privilege value differs from its initial/original value
  const hasUnsavedChanges = useMemo(() => {
    return (Object.values(matrix) as PrivilegeState[]).some((cell) => cell.privValueCd !== cell.originalPrivValueCd);
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
          currentMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0';
        }
      }
      setResolvedMbrId(currentMbrId);

      // 2. Fetch Groups (Global and Custom)
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

      // Deduplicate groups by grpId
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

      // 3. Fetch Privileges for this profile
      let fetchedPrivs: any[] = [];
      if (!isSandbox && currentMbrId && !currentMbrId.startsWith('sandbox-')) {
        try {
          fetchedPrivs = await taskApi.getMemberProfileGroupPrivs({ mbrId: currentMbrId });
        } catch (e) {
          console.warn('Error fetching member profile group privs:', e);
        }
      } else {
        const saved = sessionStorage.getItem(`sandbox_profile_privs_${currentMbrId}`);
        if (saved) {
          try {
            fetchedPrivs = JSON.parse(saved);
          } catch {}
        }
      }

      const matrixMap: Record<string, PrivilegeState> = {};
      const privLookup = new Map<string, any>();
      for (const p of fetchedPrivs) {
        if (p.mbrId === currentMbrId) {
          privLookup.set(p.grpId, p);
        }
      }

      for (const g of unified) {
        const existing = privLookup.get(g.grpId);
        const val = existing?.privValueCd || 'NONE';
        matrixMap[g.grpId] = {
          privId: existing?.privId,
          grpId: g.grpId,
          mbrId: currentMbrId,
          privValueCd: val,
          originalPrivValueCd: val
        };
      }

      setMatrix(matrixMap);
    } catch (err: any) {
      console.error('Failed to load profile privacy data:', err);
      setError(err?.message || 'Failed to load profile privacy settings.');
    } finally {
      setLoading(false);
    }
  }, [isOpen, propMbrId, isSandbox]);

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

  const handleRequestClose = () => {
    if (hasUnsavedChanges && !saving) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardConfirm(false);
    setMatrix((prev) => {
      const reverted: Record<string, PrivilegeState> = {};
      for (const [k, v] of Object.entries(prev) as [string, PrivilegeState][]) {
        reverted[k] = { ...v, privValueCd: v.originalPrivValueCd };
      }
      return reverted;
    });
    onClose();
  };

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

      if (!effectiveMbrId) {
        throw new Error('Member ID is required to configure profile group privacy.');
      }

      for (const grpId of Object.keys(matrix)) {
        const cell = matrix[grpId];
        if (cell.privValueCd !== cell.originalPrivValueCd) {
          if (cell.privId) {
            if (!isSandbox && !effectiveMbrId.startsWith('sandbox-')) {
              savePromises.push(
                taskApi.updateMemberProfileGroupPriv(cell.privId, {
                  privValueCd: cell.privValueCd
                })
              );
            }
          } else {
            if (!isSandbox && !effectiveMbrId.startsWith('sandbox-')) {
              savePromises.push(
                taskApi.createMemberProfileGroupPriv({
                  mbrId: effectiveMbrId,
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

      if (!isSandbox && !effectiveMbrId.startsWith('sandbox-')) {
        await Promise.all(savePromises);
      } else {
        sessionStorage.setItem(`sandbox_profile_privs_${effectiveMbrId}`, JSON.stringify(Object.values(matrix)));
      }

      setMatrix((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated)) {
          updated[k] = { ...updated[k], originalPrivValueCd: updated[k].privValueCd };
        }
        return updated;
      });

      setSuccess(`Profile privacy settings saved successfully.`);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Failed to save profile privacy settings:', err);
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        const effectiveMbrId = resolvedMbrId || propMbrId;
        if (effectiveMbrId) {
          sessionStorage.setItem(`sandbox_profile_privs_${effectiveMbrId}`, JSON.stringify(Object.values(matrix)));
          setMatrix((prev) => {
            const updatedState = { ...prev };
            for (const k of Object.keys(updatedState)) {
              updatedState[k] = { ...updatedState[k], originalPrivValueCd: updatedState[k].privValueCd };
            }
            return updatedState;
          });
          setSuccess(`Profile privacy settings saved (offline cached).`);
          if (onSaved) onSaved();
          setTimeout(() => {
            onClose();
          }, 800);
          return;
        }
      }
      setError(err?.message || 'Failed to save profile privacy settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const getGroupIcon = (name: string) => {
    const n = (name || '').toLowerCase();
    if (n.includes('fam')) return <Users className="w-4 h-4 text-rose-500" />;
    if (n.includes('friend')) return <UserCheck className="w-4 h-4 text-emerald-500" />;
    if (n.includes('work') || n.includes('colleague')) return <Briefcase className="w-4 h-4 text-amber-500" />;
    if (n.includes('pub') || n.includes('all')) return <Globe className="w-4 h-4 text-blue-500" />;
    return <Shield className="w-4 h-4 text-indigo-500" />;
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <div 
            key="profile-privacy-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestClose();
              }
            }}
          >
            <motion.div
              key="profile-privacy-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100/80 rounded-2xl shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      Profile Privacy Settings
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Profile:</span>
                      <span className="font-bold text-indigo-600 truncate max-w-[220px]">{memberName}</span>
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

              {/* Helper Description */}
              <div className="mt-3 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-[11.5px] text-slate-600 font-serif">
                Select the access privilege for each group.
              </div>

              {/* Modal Body / Groups List */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[160px]">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-xs font-serif">Loading group privileges...</span>
                  </div>
                ) : (
                  groups.map((grp, index) => {
                    const currentVal = matrix[grp.grpId]?.privValueCd || 'NONE';
                    const isModified = matrix[grp.grpId]?.privValueCd !== matrix[grp.grpId]?.originalPrivValueCd;
                    const groupKey = `profile-privacy-group-${grp.isCustom ? 'custom' : 'global'}-${grp.grpId || index}`;

                    return (
                      <div
                        key={groupKey}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 border rounded-2xl transition-colors ${
                          isModified ? 'bg-amber-50/40 border-amber-200/80' : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80'
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50 border border-indigo-600 font-sans"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Privacy Settings</span>
                </button>
              </div>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showDiscardConfirm && (
                  <div key="profile-discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
                    <motion.div
                      key="profile-discard-confirm-dialog"
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 8 }}
                      className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 max-w-sm w-full text-center flex flex-col items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-slate-850 mb-1">
                        Unsaved Privacy Changes
                      </h4>
                      <p className="text-xs text-slate-600 font-serif mb-4 leading-relaxed">
                        You have modified one or more group privacy settings. Are you sure you want to discard your changes?
                      </p>
                      <div className="flex items-center gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={handleCancelDiscard}
                          className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Keep Editing
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDiscard}
                          className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <AdminComponentTag name="mbrProfilePrivacyModal" />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export { MbrProfilePrivacyModal, MbrProfilePrivacyModal as mbrProfilePrivacyModal, MbrProfilePrivacyModal as SbProfilePrivacyModal, MbrProfilePrivacyModal as SbMbrProfilePrivacyModal };
