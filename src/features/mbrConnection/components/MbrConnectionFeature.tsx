/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Users, 
  UserCheck, 
  UserX, 
  Search, 
  Save, 
  RotateCcw, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Briefcase, 
  Filter, 
  Check, 
  ShieldCheck, 
  Sparkles,
  UserPlus
} from 'lucide-react';
import { taskApi, Mbr, GroupGlobal, GroupCustom, MbrConnection, MbrConnectionGrp } from '@/src/services/api.ts';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MbrConnectionFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

interface UnifiedGroupOption {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  isCustom: boolean;
}

interface MemberConnectionItem {
  member: Mbr;
  mbrConnectionId?: string;
  mbrConnectionGrpId?: string;
  selectedGrpId: string; // "" represents 'None'
  originalGrpId: string;
}

export default function MbrConnectionFeature({ isSandbox, onClickBack, onDirtyChange }: MbrConnectionFeatureProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentMbrId, setCurrentMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [groups, setGroups] = useState<UnifiedGroupOption[]>([]);
  const [items, setItems] = useState<Record<string, MemberConnectionItem>>({});
  
  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<string>('ALL'); // 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | specific grpId

  // Determine dirty state
  const isDirty = useMemo(() => {
    return Object.values(items).some(item => item.selectedGrpId !== item.originalGrpId);
  }, [items]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Load all data: current user, members, groups, connections, connection groups
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Identify logged-in member ID
      let resolvedMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
        } catch {}
      } else {
        const userStr = sessionStorage.getItem('user');
        if (userStr && !isSandbox) {
          try {
            const u = JSON.parse(userStr);
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) resolvedMbrId = mbrProfile.mbrId;
          } catch {}
        }
      }
      setCurrentMbrId(resolvedMbrId);

      // 2. Fetch all members
      let allMembers: Mbr[] = [];
      try {
        allMembers = await taskApi.getMembers(0, 100);
      } catch (e) {
        console.warn("Error fetching members:", e);
      }

      // Filter out the logged-in member so we only assign other members
      const otherMembers = allMembers.filter(m => m.mbrId !== resolvedMbrId);

      // Fallback mock members if empty (e.g. sandbox offline)
      if (otherMembers.length === 0) {
        otherMembers.push(
          {
            mbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0',
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Vance',
            mbrEmailAddress: 'eleanor.vance@storybook.ai',
            mbrLivesCityState: 'Boston, MA',
            mbrWorkAt: 'Architectural Historian'
          },
          {
            mbrId: 'f87a329c-982a-4a56-8a03-9bb54fc82341',
            mbrFirstName: 'James',
            mbrLastName: 'Sterling',
            mbrEmailAddress: 'james.sterling@storybook.ai',
            mbrLivesCityState: 'San Francisco, CA',
            mbrWorkAt: 'Product Designer'
          },
          {
            mbrId: 'a12b34cd-56ef-7890-abcd-ef1234567890',
            mbrFirstName: 'Sophia',
            mbrLastName: 'Rodriguez',
            mbrEmailAddress: 'sophia.rodriguez@storybook.ai',
            mbrLivesCityState: 'Austin, TX',
            mbrWorkAt: 'Music Producer'
          },
          {
            mbrId: 'b23c45de-67fa-8901-bcde-f23456789012',
            mbrFirstName: 'Marcus',
            mbrLastName: 'Chen',
            mbrEmailAddress: 'marcus.chen@storybook.ai',
            mbrLivesCityState: 'Seattle, WA',
            mbrWorkAt: 'Software Architect'
          }
        );
      }

      // 3. Fetch groups (Global & Custom)
      let fetchedGlobals: GroupGlobal[] = [];
      let fetchedCustoms: GroupCustom[] = [];
      try {
        fetchedGlobals = await taskApi.getGroupsGlobal();
      } catch (e) {
        console.warn("Error fetching global groups:", e);
      }
      try {
        fetchedCustoms = await taskApi.getGroupsCustom(resolvedMbrId);
      } catch (e) {
        console.warn("Error fetching custom groups:", e);
      }

      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: 'g1', grpName: 'Family', grpDescription: 'Immediate and extended family', grpSortOrder: 10 },
          { grpId: 'g2', grpName: 'Friends', grpDescription: 'Close friends & peers', grpSortOrder: 20 },
          { grpId: 'g3', grpName: 'Work', grpDescription: 'Colleagues & professional circle', grpSortOrder: 30 },
          { grpId: 'g4', grpName: 'Public', grpDescription: 'All StoryBook members', grpSortOrder: 40 }
        ];
      }

      const unifiedGroups: UnifiedGroupOption[] = [
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

      // Sort by grpSortOrder ASC (nulls last), secondary by grpName
      unifiedGroups.sort((a, b) => {
        const orderA = a.grpSortOrder != null ? a.grpSortOrder : Infinity;
        const orderB = b.grpSortOrder != null ? b.grpSortOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.grpName.localeCompare(b.grpName);
      });
      setGroups(unifiedGroups);

      // 4. Fetch Member Connections for this owner
      let connections: MbrConnection[] = [];
      let connectionGrps: MbrConnectionGrp[] = [];

      if (!isSandbox) {
        try {
          connections = await taskApi.getMemberConnections({ mbrId: resolvedMbrId });
          if (connections.length > 0) {
            connectionGrps = await taskApi.getMemberConnectionGrps();
          }
        } catch (e) {
          console.warn("Error fetching member connections:", e);
        }
      } else {
        const savedConn = sessionStorage.getItem(`sandbox_mbr_connections_${resolvedMbrId}`);
        if (savedConn) {
          try { connections = JSON.parse(savedConn); } catch {}
        }
        const savedConnGrp = sessionStorage.getItem(`sandbox_mbr_connection_grps_${resolvedMbrId}`);
        if (savedConnGrp) {
          try { connectionGrps = JSON.parse(savedConnGrp); } catch {}
        }
      }

      // 5. Build lookup map: target member ID -> { mbrConnection, mbrConnectionGrp }
      const connectionByTargetMbr = new Map<string, MbrConnection>();
      for (const conn of connections) {
        connectionByTargetMbr.set(conn.mbrConnectionMbrId, conn);
      }

      const connectionGrpByConnId = new Map<string, MbrConnectionGrp>();
      for (const cg of connectionGrps) {
        connectionGrpByConnId.set(cg.mbrConnectionId, cg);
      }

      const newItems: Record<string, MemberConnectionItem> = {};
      for (const m of otherMembers) {
        const existingConn = connectionByTargetMbr.get(m.mbrId);
        const existingConnGrp = existingConn ? connectionGrpByConnId.get(existingConn.mbrConnectionId) : undefined;
        const assignedGrpId = existingConnGrp ? existingConnGrp.grpId : ''; // "" means None

        newItems[m.mbrId] = {
          member: m,
          mbrConnectionId: existingConn?.mbrConnectionId,
          mbrConnectionGrpId: existingConnGrp?.mbrConnectionGrpId,
          selectedGrpId: assignedGrpId,
          originalGrpId: assignedGrpId
        };
      }

      setItems(newItems);
    } catch (err: any) {
      console.error("Failed to load connections data:", err);
      setError(err?.message || "Failed to load member connections data.");
    } finally {
      setLoading(false);
    }
  }, [isSandbox]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle dropdown selection change for a member
  const handleGroupSelect = (targetMbrId: string, grpId: string) => {
    setItems(prev => {
      const existing = prev[targetMbrId];
      if (!existing) return prev;
      return {
        ...prev,
        [targetMbrId]: {
          ...existing,
          selectedGrpId: grpId
        }
      };
    });
  };

  // Discard all changes
  const handleReset = () => {
    setItems(prev => {
      const resetMap: Record<string, MemberConnectionItem> = {};
      for (const [key, item] of Object.entries(prev)) {
        resetMap[key] = {
          ...item,
          selectedGrpId: item.originalGrpId
        };
      }
      return resetMap;
    });
  };

  // Save all modified connections
  const handleSave = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const changedItems = Object.values(items).filter(
        item => item.selectedGrpId !== item.originalGrpId
      );

      for (const item of changedItems) {
        const targetMbrId = item.member.mbrId;
        const newGrpId = item.selectedGrpId;

        if (newGrpId === '') {
          // Assigned to "None": delete connection group assignment if exists
          if (item.mbrConnectionGrpId && !isSandbox) {
            try {
              await taskApi.deleteMemberConnectionGrp(item.mbrConnectionGrpId);
            } catch (e) {
              console.warn("Could not delete connection group:", e);
            }
          }
          item.mbrConnectionGrpId = undefined;
          item.originalGrpId = '';
        } else {
          // Assigning to a group
          let connId = item.mbrConnectionId;

          // 1. Create mbrConnection if it does not exist
          if (!connId) {
            if (!isSandbox) {
              const createdConn = await taskApi.createMemberConnection({
                mbrId: currentMbrId,
                mbrConnectionMbrId: targetMbrId
              });
              connId = createdConn.mbrConnectionId;
              item.mbrConnectionId = connId;
            } else {
              connId = `conn-${Date.now()}-${targetMbrId.slice(0, 4)}`;
              item.mbrConnectionId = connId;
            }
          }

          // 2. Create or Update mbrConnectionGrp
          if (item.mbrConnectionGrpId) {
            // Update existing group assignment
            if (!isSandbox) {
              await taskApi.updateMemberConnectionGrp(item.mbrConnectionGrpId, {
                mbrConnectionId: connId,
                grpId: newGrpId
              });
            }
          } else {
            // Create new group assignment
            if (!isSandbox) {
              const createdConnGrp = await taskApi.createMemberConnectionGrp({
                mbrConnectionId: connId,
                grpId: newGrpId
              });
              item.mbrConnectionGrpId = createdConnGrp.mbrConnectionGrpId;
            } else {
              item.mbrConnectionGrpId = `conngrp-${Date.now()}`;
            }
          }
          item.originalGrpId = newGrpId;
        }
      }

      if (isSandbox) {
        // Save to session storage in sandbox mode
        const allConns = Object.values(items)
          .filter(it => it.mbrConnectionId)
          .map(it => ({
            mbrConnectionId: it.mbrConnectionId!,
            mbrId: currentMbrId,
            mbrConnectionMbrId: it.member.mbrId
          }));
        sessionStorage.setItem(`sandbox_mbr_connections_${currentMbrId}`, JSON.stringify(allConns));

        const allConnGrps = Object.values(items)
          .filter(it => it.mbrConnectionGrpId && it.selectedGrpId)
          .map(it => ({
            mbrConnectionGrpId: it.mbrConnectionGrpId!,
            mbrConnectionId: it.mbrConnectionId!,
            grpId: it.selectedGrpId
          }));
        sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(allConnGrps));
      }

      setItems({ ...items });
      setSuccess("Member connections and group assignments saved successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error("Failed to save member connections:", err);
      setError(err?.message || "Failed to save member connections. Please check server status.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered member list based on search and group filter
  const filteredMemberList = useMemo(() => {
    const list = Object.values(items);
    return list.filter(item => {
      const name = `${item.member.mbrFirstName || ''} ${item.member.mbrLastName || ''}`.toLowerCase();
      const location = `${item.member.mbrLivesCityState || ''} ${item.member.mbrFromCityState || ''}`.toLowerCase();
      const email = (item.member.mbrEmailAddress || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      if (query && !name.includes(query) && !location.includes(query) && !email.includes(query)) {
        return false;
      }

      if (groupFilter === 'ASSIGNED') {
        return item.selectedGrpId !== '';
      }
      if (groupFilter === 'UNASSIGNED') {
        return item.selectedGrpId === '';
      }
      if (groupFilter !== 'ALL') {
        return item.selectedGrpId === groupFilter;
      }

      return true;
    });
  }, [items, searchQuery, groupFilter]);

  // Statistics counters
  const totalMembers = Object.keys(items).length;
  const assignedCount = Object.values(items).filter(it => it.selectedGrpId !== '').length;

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 relative">
      <AdminComponentTag name="MbrConnectionFeature.tsx" />

      {/* Top Navigation & Title Bar */}
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                Member Connections & Groups
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Organize other StoryBook members into your personal groups to control sharing and story access permissions.
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
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Connections...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Connection Settings</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Alerts */}
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

      {/* Search & Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search members by name or location..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Counts overview */}
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Total: <strong className="text-slate-800 dark:text-slate-200">{totalMembers}</strong></span>
            <span>•</span>
            <span>Assigned: <strong className="text-blue-600 dark:text-blue-400">{assignedCount}</strong></span>
            <span>•</span>
            <span>Unassigned: <strong className="text-amber-600 dark:text-amber-400">{totalMembers - assignedCount}</strong></span>
          </div>
        </div>

        {/* Group Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setGroupFilter('ALL')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              groupFilter === 'ALL'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            All Members
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('ASSIGNED')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              groupFilter === 'ASSIGNED'
                ? 'bg-blue-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Assigned
          </button>
          <button
            type="button"
            onClick={() => setGroupFilter('UNASSIGNED')}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              groupFilter === 'UNASSIGNED'
                ? 'bg-amber-600 text-white font-bold shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
            }`}
          >
            Unassigned (None)
          </button>

          {groups.map(grp => (
            <button
              key={grp.grpId}
              type="button"
              onClick={() => setGroupFilter(grp.grpId)}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                groupFilter === grp.grpId
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {grp.grpName}
            </button>
          ))}
        </div>
      </div>

      {/* Main Members List */}
      {loading ? (
        <div className="w-full h-72 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
            Loading member directory and connection assignments...
          </span>
        </div>
      ) : filteredMemberList.length === 0 ? (
        <div className="w-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1 font-serif">
            No matching members found
          </h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search criteria or filter options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMemberList.map(item => {
            const m = item.member;
            const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim() || 'Anonymous Member';
            const initials = `${(m.mbrFirstName?.[0] || 'M')}${(m.mbrLastName?.[0] || '')}`.toUpperCase();
            const isAssigned = item.selectedGrpId !== '';
            const isModified = item.selectedGrpId !== item.originalGrpId;
            const currentGroup = groups.find(g => g.grpId === item.selectedGrpId);

            return (
              <div
                key={m.mbrId}
                className={`p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between gap-4 shadow-xs hover:shadow-md ${
                  isModified
                    ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Member Header & Avatar */}
                <div className="flex items-start gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
                    {m.mbrProfilePic ? (
                      <img
                        src={m.mbrProfilePic}
                        alt={fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </div>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate font-serif">
                        {fullName}
                      </h3>
                      {isAssigned ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                          <Check className="w-2.5 h-2.5" />
                          {currentGroup?.grpName || 'Assigned'}
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                          None
                        </span>
                      )}
                    </div>

                    {m.mbrLivesCityState && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.mbrLivesCityState}</span>
                      </p>
                    )}

                    {m.mbrWorkAt && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
                        <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{m.mbrWorkAt}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Group Selector Control */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Assigned Group:
                  </span>

                  <div className="w-48 sm:w-56">
                    <select
                      value={item.selectedGrpId}
                      onChange={(e) => handleGroupSelect(m.mbrId, e.target.value)}
                      className={`w-full text-xs py-1.5 px-3 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
                        item.selectedGrpId === ''
                          ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                          : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold'
                      }`}
                    >
                      <option value="">None (No Group)</option>
                      {groups.map(grp => (
                        <option key={grp.grpId} value={grp.grpId}>
                          {grp.grpName} {grp.isCustom ? '(Custom)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
