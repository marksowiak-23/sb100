/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { taskApi, Mbr, GroupGlobal, GroupCustom, MbrConnection, MbrConnectionGrp } from '@/src/services/api.ts';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { 
  MbrConnectionFeatureProps, 
  UnifiedGroupOption, 
  MemberConnectionItem, 
  ConnectionFilterType 
} from '../types';
import ConnectionHeader from './ConnectionHeader';
import ConnectionSearchToolbar from './ConnectionSearchToolbar';
import MemberConnectionList from './MemberConnectionList';
import { generateConnectionPdf } from '../utils/generateConnectionPdf';

export default function MbrConnectionFeature({ isSandbox, onClickBack, onDirtyChange }: MbrConnectionFeatureProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentMbrId, setCurrentMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [mbrEmail, setMbrEmail] = useState<string>('eleanor.vance@storybook.ai');
  const [groups, setGroups] = useState<UnifiedGroupOption[]>([]);
  const [items, setItems] = useState<Record<string, MemberConnectionItem>>({});
  
  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<ConnectionFilterType>('ALL');

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
      // 1. Identify logged-in member ID & email
      let resolvedMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      let resolvedEmail = 'eleanor.vance@storybook.ai';

      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email) resolvedEmail = u.email;
          if (!isSandbox) {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              resolvedMbrId = mbrProfile.mbrId;
              if (mbrProfile.mbrEmailAddress) resolvedEmail = mbrProfile.mbrEmailAddress;
            }
          }
        } catch {}
      } else {
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
            if (parsed.mbrEmailAddress) resolvedEmail = parsed.mbrEmailAddress;
          } catch {}
        }
      }
      setCurrentMbrId(resolvedMbrId);
      setMbrEmail(resolvedEmail);

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
        const assignedGrpId = existingConnGrp ? existingConnGrp.grpId : '';

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

  const handlePrintPdf = () => {
    generateConnectionPdf({
      mbrId: currentMbrId,
      mbrEmail,
      groupFilter,
      groups,
      memberList: filteredMemberList
    });
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8 relative">
      <AdminComponentTag name="MbrConnectionFeature.tsx" />

      {/* Header Section */}
      <ConnectionHeader
        isDirty={isDirty}
        saving={saving}
        success={success}
        error={error}
        onClickBack={onClickBack}
        onReset={handleReset}
        onSave={handleSave}
      />

      {/* Search & Filter Toolbar */}
      <ConnectionSearchToolbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        groupFilter={groupFilter}
        onGroupFilterChange={setGroupFilter}
        groups={groups}
        totalMembers={totalMembers}
        assignedCount={assignedCount}
        onPrintPdf={handlePrintPdf}
      />

      {/* Member Cards Directory */}
      <MemberConnectionList
        loading={loading}
        memberList={filteredMemberList}
        groups={groups}
        onGroupSelect={handleGroupSelect}
      />
    </div>
  );
}
