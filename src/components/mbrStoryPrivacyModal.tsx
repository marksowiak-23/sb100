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
  Search,
  User
} from 'lucide-react';
import { taskApi, resolveMediaUrl } from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrStoryPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId?: string;
  storyTitle?: string;
  mbrId?: string;
  isSandbox?: boolean;
  onSaved?: () => void;
}

export type SbStoryPrivacyModalProps = MbrStoryPrivacyModalProps;
export type mbrStoryPrivacyModalProps = MbrStoryPrivacyModalProps;

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
  mbrStoryId: string;
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
  mbrStoryId: string;
  mbrConnectionMbrId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

export default function MbrStoryPrivacyModal({
  isOpen,
  onClose,
  storyId: propStoryId,
  storyTitle = 'Story',
  mbrId: propMbrId,
  isSandbox = false,
  onSaved
}: MbrStoryPrivacyModalProps) {
  const [activeTab, setActiveTab] = useState<PrivacyTab>('groups');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resolvedStoryId, setResolvedStoryId] = useState<string>(propStoryId || '');
  const [resolvedMbrId, setResolvedMbrId] = useState<string>(propMbrId || '');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Group privacy states (existing functionality)
  const [groups, setGroups] = useState<UnifiedGroup[]>([]);
  const [matrix, setMatrix] = useState<Record<string, PrivilegeState>>({});

  // Member connection privacy states (new functionality)
  const [connectedMembers, setConnectedMembers] = useState<ConnectedMemberInfo[]>([]);
  const [memberMatrix, setMemberMatrix] = useState<Record<string, MemberPrivilegeState>>({});
  const [memberSearchQuery, setMemberSearchQuery] = useState('');

  // Unsaved changes checks
  const hasGroupUnsaved = useMemo(() => {
    return (Object.values(matrix) as PrivilegeState[]).some((cell) => cell.privValueCd !== cell.originalPrivValueCd);
  }, [matrix]);

  const hasMemberUnsaved = useMemo(() => {
    return (Object.values(memberMatrix) as MemberPrivilegeState[]).some((cell) => cell.privValueCd !== cell.originalPrivValueCd);
  }, [memberMatrix]);

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
      // 1. Resolve Current Member ID
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

      const effectiveStoryId = propStoryId || '';
      setResolvedStoryId(effectiveStoryId);

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

      // 3. Fetch Group Privileges for this story (mbrStoryGroupPrivs)
      let fetchedGroupPrivs: any[] = [];
      if (!isSandbox && effectiveStoryId && !effectiveStoryId.startsWith('temp_')) {
        try {
          fetchedGroupPrivs = await taskApi.getMemberStoryGroupPrivs({ mbrStoryId: effectiveStoryId });
        } catch (e) {
          console.warn('Error fetching member story group privs:', e);
        }
      } else {
        const saved = sessionStorage.getItem(`sandbox_story_privs_${effectiveStoryId}`);
        if (saved) {
          try {
            fetchedGroupPrivs = JSON.parse(saved);
          } catch {}
        }
      }

      const matrixMap: Record<string, PrivilegeState> = {};
      const privLookup = new Map<string, any>();
      for (const p of fetchedGroupPrivs) {
        if (p.mbrStoryId === effectiveStoryId) {
          privLookup.set(p.grpId, p);
        }
      }

      for (const g of unified) {
        const existing = privLookup.get(g.grpId);
        const val = existing?.privValueCd || 'NONE';
        matrixMap[g.grpId] = {
          privId: existing?.privId,
          grpId: g.grpId,
          mbrStoryId: effectiveStoryId,
          privValueCd: val,
          originalPrivValueCd: val
        };
      }
      setMatrix(matrixMap);

      // 4. Fetch Connections, Members, and Individual Connection Privileges (mbrStoryConnectionPrivs)
      let connections: any[] = [];
      let allMembers: any[] = [];
      let fetchedConnPrivs: any[] = [];

      if (!isSandbox) {
        const [connsRes, membersRes, privsRes] = await Promise.allSettled([
          taskApi.getMemberConnections({ mbrId: currentMbrId }),
          taskApi.getMembers({ limit: 300 }),
          effectiveStoryId && !effectiveStoryId.startsWith('temp_')
            ? taskApi.getMemberStoryConnectionPrivs({ mbrStoryId: effectiveStoryId })
            : Promise.resolve([])
        ]);

        if (connsRes.status === 'fulfilled' && Array.isArray(connsRes.value)) {
          connections = connsRes.value;
        }
        if (membersRes.status === 'fulfilled' && Array.isArray(membersRes.value)) {
          allMembers = membersRes.value;
        }
        if (privsRes.status === 'fulfilled' && Array.isArray(privsRes.value)) {
          fetchedConnPrivs = privsRes.value;
        }
      } else {
        const savedConns = sessionStorage.getItem(`sandbox_mbr_connections_${currentMbrId}`);
        if (savedConns) {
          try { connections = JSON.parse(savedConns); } catch {}
        }
        const savedPrivs = sessionStorage.getItem(`sandbox_story_conn_privs_${effectiveStoryId}`);
        if (savedPrivs) {
          try { fetchedConnPrivs = JSON.parse(savedPrivs); } catch {}
        }
      }

      // Fallback connections for demo or sandbox environments if empty
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

      // Map member profiles
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

      // Build memberMatrix
      const connPrivLookup = new Map<string, any>();
      for (const cp of fetchedConnPrivs) {
        if (cp.mbrStoryId === effectiveStoryId && cp.mbrConnectionMbrId) {
          connPrivLookup.set(cp.mbrConnectionMbrId, cp);
        }
      }

      const memberMatrixMap: Record<string, MemberPrivilegeState> = {};
      for (const m of resolvedConnMembers) {
        const existing = connPrivLookup.get(m.mbrConnectionMbrId);
        const val = existing?.privValueCd || 'NONE';
        memberMatrixMap[m.mbrConnectionMbrId] = {
          privId: existing?.privId,
          mbrId: currentMbrId,
          mbrStoryId: effectiveStoryId,
          mbrConnectionMbrId: m.mbrConnectionMbrId,
          privValueCd: val,
          originalPrivValueCd: val
        };
      }
      setMemberMatrix(memberMatrixMap);

    } catch (err: any) {
      console.error('Failed to load story privacy data:', err);
      setError(err?.message || 'Failed to load story privacy settings.');
    } finally {
      setLoading(false);
    }
  }, [isOpen, propMbrId, propStoryId, isSandbox]);

  useEffect(() => {
    if (isOpen) {
      loadPrivacyData();
    }
  }, [isOpen, loadPrivacyData]);

  const handleGroupPrivilegeChange = (grpId: string, newValue: string) => {
    setMatrix((prev) => ({
      ...prev,
      [grpId]: {
        ...prev[grpId],
        privValueCd: newValue
      }
    }));
  };

  const handleMemberPrivilegeChange = (connMbrId: string, newValue: string) => {
    setMemberMatrix((prev) => ({
      ...prev,
      [connMbrId]: {
        ...prev[connMbrId],
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
    setMemberMatrix((prev) => {
      const reverted: Record<string, MemberPrivilegeState> = {};
      for (const [k, v] of Object.entries(prev) as [string, MemberPrivilegeState][]) {
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
      const effectiveStoryId = resolvedStoryId || propStoryId;

      if (!effectiveStoryId) {
        throw new Error('Please save the story draft first before configuring story-level privacy.');
      }

      // 1. Process Group Privileges (mbrStoryGroupPrivs)
      for (const grpId of Object.keys(matrix)) {
        const cell = matrix[grpId];
        if (cell.privValueCd !== cell.originalPrivValueCd) {
          if (cell.privId) {
            if (!isSandbox && !effectiveStoryId.startsWith('temp_')) {
              savePromises.push(
                taskApi.updateMemberStoryGroupPriv(cell.privId, {
                  privValueCd: cell.privValueCd
                })
              );
            }
          } else {
            if (!isSandbox && !effectiveStoryId.startsWith('temp_')) {
              savePromises.push(
                taskApi.createMemberStoryGroupPriv({
                  mbrStoryId: effectiveStoryId,
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

      // 2. Process Member Connection Privileges (mbrStoryConnectionPrivs)
      for (const connMbrId of Object.keys(memberMatrix)) {
        const cell = memberMatrix[connMbrId];
        if (cell.privValueCd !== cell.originalPrivValueCd) {
          if (cell.privId) {
            if (!isSandbox && !effectiveStoryId.startsWith('temp_')) {
              savePromises.push(
                taskApi.updateMemberStoryConnectionPriv(cell.privId, {
                  privValueCd: cell.privValueCd
                })
              );
            }
          } else {
            if (!isSandbox && !effectiveStoryId.startsWith('temp_')) {
              savePromises.push(
                taskApi.createMemberStoryConnectionPriv({
                  mbrId: resolvedMbrId,
                  mbrStoryId: effectiveStoryId,
                  mbrConnectionMbrId: cell.mbrConnectionMbrId,
                  privValueCd: cell.privValueCd
                }).then((created) => {
                  cell.privId = created.privId;
                })
              );
            }
          }
        }
      }

      if (!isSandbox && !effectiveStoryId.startsWith('temp_')) {
        await Promise.all(savePromises);
      } else {
        sessionStorage.setItem(`sandbox_story_privs_${effectiveStoryId}`, JSON.stringify(Object.values(matrix)));
        sessionStorage.setItem(`sandbox_story_conn_privs_${effectiveStoryId}`, JSON.stringify(Object.values(memberMatrix)));
      }

      // Update baseline states to reflect saved values
      setMatrix((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated)) {
          updated[k] = { ...updated[k], originalPrivValueCd: updated[k].privValueCd };
        }
        return updated;
      });

      setMemberMatrix((prev) => {
        const updated = { ...prev };
        for (const k of Object.keys(updated)) {
          updated[k] = { ...updated[k], originalPrivValueCd: updated[k].privValueCd };
        }
        return updated;
      });

      setSuccess(`Story privacy settings saved successfully.`);
      if (onSaved) onSaved();
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err: any) {
      console.error('Failed to save story privacy settings:', err);
      if (err?.message?.includes('Failed to fetch') || err?.name === 'TypeError') {
        const effectiveStoryId = resolvedStoryId || propStoryId;
        if (effectiveStoryId) {
          sessionStorage.setItem(`sandbox_story_privs_${effectiveStoryId}`, JSON.stringify(Object.values(matrix)));
          sessionStorage.setItem(`sandbox_story_conn_privs_${effectiveStoryId}`, JSON.stringify(Object.values(memberMatrix)));
          setMatrix((prev) => {
            const updatedState = { ...prev };
            for (const k of Object.keys(updatedState)) {
              updatedState[k] = { ...updatedState[k], originalPrivValueCd: updatedState[k].privValueCd };
            }
            return updatedState;
          });
          setMemberMatrix((prev) => {
            const updatedState = { ...prev };
            for (const k of Object.keys(updatedState)) {
              updatedState[k] = { ...updatedState[k], originalPrivValueCd: updatedState[k].privValueCd };
            }
            return updatedState;
          });
          setSuccess(`Story privacy settings saved (offline cached).`);
          if (onSaved) onSaved();
          setTimeout(() => {
            onClose();
          }, 800);
          return;
        }
      }
      setError(err?.message || 'Failed to save story privacy settings.');
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
    return connectedMembers.filter((m) =>
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
            key="story-privacy-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestClose();
              }
            }}
          >
            <motion.div
              key="story-privacy-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-xl w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100/80 rounded-2xl shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      Story Privacy Settings
                    </h3>
                    <p className="text-xs text-slate-500 font-serif mt-1 flex items-center gap-1.5">
                      <span className="font-semibold text-slate-400">Story:</span>
                      <span className="font-bold text-indigo-600 truncate max-w-[220px]">{storyTitle}</span>
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
                  id="tab-btn-group-privacy"
                  onClick={() => setActiveTab('groups')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    activeTab === 'groups'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50/50'
                  }`}
                >
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span>Group Privacy Settings</span>
                  {hasGroupUnsaved && (
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved group edits" />
                  )}
                </button>

                <button
                  type="button"
                  id="tab-btn-member-privacy"
                  onClick={() => setActiveTab('members')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    activeTab === 'members'
                      ? 'bg-white text-indigo-700 shadow-sm border border-slate-200/60'
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
                  ? 'Select the access privilege for each group to control who can view or comment on this story.'
                  : 'Set individual story access privileges for specific members in your connection network.'}
              </div>

              {/* Modal Body: Active Tab Content */}
              <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 min-h-[180px]">
                {loading ? (
                  <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                    <span className="text-xs font-serif">Loading privacy settings...</span>
                  </div>
                ) : activeTab === 'groups' ? (
                  // --- GROUP PRIVACY SETTINGS TAB ---
                  groups.map((grp, index) => {
                    const currentVal = matrix[grp.grpId]?.privValueCd || 'NONE';
                    const isModified = matrix[grp.grpId]?.privValueCd !== matrix[grp.grpId]?.originalPrivValueCd;
                    const groupKey = `story-privacy-group-${grp.isCustom ? 'custom' : 'global'}-${grp.grpId || index}`;

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
                            onChange={(newVal) => handleGroupPrivilegeChange(grp.grpId, newVal)}
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
                    {connectedMembers.length >= 4 && (
                      <div className="relative mb-2">
                        <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="text"
                          value={memberSearchQuery}
                          onChange={(e) => setMemberSearchQuery(e.target.value)}
                          placeholder="Search connected members..."
                          className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-serif"
                        />
                      </div>
                    )}

                    {connectedMembers.length === 0 ? (
                      <div className="py-10 text-center flex flex-col items-center justify-center gap-2 bg-slate-50/60 rounded-2xl border border-dashed border-slate-200 p-4">
                        <UserCheck className="w-8 h-8 text-slate-350" />
                        <p className="text-xs font-semibold text-slate-750 font-serif">No Connected Members Found</p>
                        <p className="text-[11px] text-slate-400 font-serif max-w-xs leading-relaxed">
                          You haven't established connections with other members yet. Add connections in your Connections directory to configure individual member story privileges.
                        </p>
                      </div>
                    ) : filteredMembers.length === 0 ? (
                      <div className="py-8 text-center text-xs text-slate-400 font-serif">
                        No connected members match "{memberSearchQuery}".
                      </div>
                    ) : (
                      filteredMembers.map((conn) => {
                        const currentVal = memberMatrix[conn.mbrConnectionMbrId]?.privValueCd || 'NONE';
                        const isModified = memberMatrix[conn.mbrConnectionMbrId]?.privValueCd !== memberMatrix[conn.mbrConnectionMbrId]?.originalPrivValueCd;
                        const memberKey = `story-privacy-member-${conn.mbrConnectionMbrId}`;

                        return (
                          <div
                            key={memberKey}
                            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 sm:p-3.5 border rounded-2xl transition-colors ${
                              isModified ? 'bg-amber-50/40 border-amber-200/80' : 'bg-slate-50/80 hover:bg-slate-50 border-slate-200/80'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200/80 shrink-0 bg-indigo-50 flex items-center justify-center">
                                {conn.avatarUrl ? (
                                  <img
                                    src={conn.avatarUrl}
                                    alt={conn.fullName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-bold text-indigo-700 font-serif">
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
                  className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-500/10 transition-all cursor-pointer disabled:opacity-50 border border-indigo-600 font-sans"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Privacy Settings</span>
                </button>
              </div>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showDiscardConfirm && (
                  <div key="story-discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
                    <motion.div
                      key="story-discard-confirm-dialog"
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
                        You have unsaved changes to your story privacy settings. If you leave now, these changes will be discarded.
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
      <AdminComponentTag name="mbrStoryPrivacyModal" />
    </>
  );
}

export { MbrStoryPrivacyModal, MbrStoryPrivacyModal as mbrStoryPrivacyModal, MbrStoryPrivacyModal as SbStoryPrivacyModal };
