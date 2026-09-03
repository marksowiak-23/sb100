/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Users, Loader2, UserCheck, BookOpen, Calendar } from 'lucide-react';
import { taskApi, mbrStatApi, resolveMediaUrl, Mbr, MbrStat } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface ConnectedMemberItem {
  mbrId: string;
  name: string;
  location?: string;
  avatarUrl?: string;
  relationship: string;
  storiesPublishedCnt: number;
  lastPublishedDt?: string | null;
}

interface SbMyConnectionsCardProps {
  onClickMember?: (memberId: string) => void;
}

const formatPublishedDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
  return dateStr;
};

export default function SbMyConnectionsCard({ onClickMember }: SbMyConnectionsCardProps) {
  const [connections, setConnections] = useState<ConnectedMemberItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadConnections = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Resolve logged-in member ID
      let resolvedMbrId: string | null = null;
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
        } catch {}
      }

      if (!resolvedMbrId) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.user_id) {
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) {
                resolvedMbrId = mbrProfile.mbrId;
              }
            }
          } catch (e) {}
        }
      }

      if (!resolvedMbrId) {
        resolvedMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0'; // Eleanor Hartwell fallback
      }

      // 2. Fetch connections, connection groups, groups, members, and stats in parallel
      const [rawConnections, connectionGrps, groupsGlobal, groupsCustom, allMembers, allStats] = await Promise.all([
        taskApi.getMemberConnections({ mbrId: resolvedMbrId }).catch(() => []),
        taskApi.getMemberConnectionGrps().catch(() => []),
        taskApi.getGroupsGlobal().catch(() => []),
        taskApi.getGroupsCustom(resolvedMbrId).catch(() => []),
        taskApi.getMembers({ limit: 100 }).catch(() => []),
        mbrStatApi.getMemberStats(0, 1000).catch(() => [])
      ]);

      // Map Group ID -> Group Name
      const allGroups = [
        ...(groupsGlobal || []),
        ...(groupsCustom || []),
        { grpId: 'g1', grpName: 'Family' },
        { grpId: 'g2', grpName: 'Friends' },
        { grpId: 'g3', grpName: 'Work' },
        { grpId: 'g4', grpName: 'Public' }
      ];
      const groupNameById = new Map<string, string>();
      for (const g of allGroups) {
        if (g.grpId && g.grpName) {
          groupNameById.set(g.grpId, g.grpName);
        }
      }

      // Map Connection ID -> Group Name
      const grpNameByConnId = new Map<string, string>();
      for (const cg of (connectionGrps || [])) {
        if (cg.mbrConnectionId && cg.grpId) {
          const gName = groupNameById.get(cg.grpId);
          if (gName) grpNameByConnId.set(cg.mbrConnectionId, gName);
        }
      }

      // Map Member ID -> Member Profile
      const memberMap = new Map<string, Mbr>();
      for (const m of (allMembers || [])) {
        if (m.mbrId) memberMap.set(m.mbrId, m);
      }

      // Map Member ID -> Member Stat
      const statMap = new Map<string, MbrStat>();
      for (const st of (allStats || [])) {
        if (st.mbrId) statMap.set(st.mbrId, st);
      }

      // Build only members in which I have a verified connection
      const items: ConnectedMemberItem[] = [];
      const seenMbrIds = new Set<string>();

      for (const conn of (rawConnections || [])) {
        const targetMbrId = conn.mbrConnectionMbrId;
        if (!targetMbrId || seenMbrIds.has(targetMbrId)) continue;
        seenMbrIds.add(targetMbrId);

        let memberProfile = memberMap.get(targetMbrId);
        if (!memberProfile) {
          try {
            memberProfile = await taskApi.getMemberById(targetMbrId);
          } catch {}
        }

        if (memberProfile) {
          const fullName = `${memberProfile.mbrFirstName || ''} ${memberProfile.mbrLastName || ''}`.trim() || 'StoryBook Member';
          const loc = memberProfile.mbrLivesCityState || memberProfile.mbrFromCityState || '';
          const grpName = grpNameByConnId.get(conn.mbrConnectionId) || 'Connected';
          const avatar = memberProfile.mbrProfilePic ? resolveMediaUrl(memberProfile.mbrProfilePic) : undefined;

          const memberStat = statMap.get(targetMbrId);
          const publishedCnt = memberStat ? (memberStat.statStoriesPublishedCnt || 0) : 0;
          const lastPublishedDt = memberStat?.statLastPublishedDt || null;

          items.push({
            mbrId: targetMbrId,
            name: fullName,
            location: loc,
            avatarUrl: avatar,
            relationship: grpName,
            storiesPublishedCnt: publishedCnt,
            lastPublishedDt
          });
        }
      }

      // Order members with the most recent published date on top
      items.sort((a, b) => {
        const timeA = a.lastPublishedDt ? new Date(a.lastPublishedDt).getTime() : 0;
        const timeB = b.lastPublishedDt ? new Date(b.lastPublishedDt).getTime() : 0;
        if (timeA !== timeB) {
          return timeB - timeA; // Most recent published date first
        }
        if (b.storiesPublishedCnt !== a.storiesPublishedCnt) {
          return b.storiesPublishedCnt - a.storiesPublishedCnt;
        }
        return a.name.localeCompare(b.name);
      });

      setConnections(items);
    } catch (err) {
      console.error("Failed to load connections in SbMyConnectionsCard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();

    const handleUpdate = () => {
      loadConnections();
    };

    window.addEventListener('invitations-updated', handleUpdate);
    window.addEventListener('connections-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('invitations-updated', handleUpdate);
      window.removeEventListener('connections-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadConnections]);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center justify-between pb-1 border-b border-[#EFECE7]">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            My Connections
          </h3>
        </div>
        {!loading && connections.length > 0 && (
          <span className="text-[10px] font-mono font-bold text-slate-400">
            {connections.length}
          </span>
        )}
      </div>

      {/* Content list or Loading/Empty state */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          <span className="text-[11px] font-medium">Loading connections...</span>
        </div>
      ) : connections.length === 0 ? (
        <div className="py-5 px-3 text-center flex flex-col items-center justify-center gap-1.5 bg-slate-50/50 rounded-2xl border border-dashed border-[#EFECE7]">
          <UserCheck className="w-6 h-6 text-slate-350" />
          <p className="text-xs font-serif text-slate-600 font-bold">No Connections Yet</p>
          <p className="text-[10px] text-slate-400 leading-tight">
            Connect with members from the feed to view them here.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto max-h-[260px] pr-1 space-y-2.5 scrollbar-thin">
          {connections.map((conn) => {
            const initials = conn.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .toUpperCase() || 'M';

            const isFamily = conn.relationship.toLowerCase().includes('family');
            const isFriend = conn.relationship.toLowerCase().includes('friend');
            const isWork = conn.relationship.toLowerCase().includes('work') || conn.relationship.toLowerCase().includes('colleague');

            return (
              <div
                key={conn.mbrId}
                onClick={() => onClickMember && onClickMember(conn.mbrId)}
                className={`flex items-start justify-between gap-3 p-2.5 rounded-2xl transition-colors duration-150 border border-transparent hover:border-[#EFECE7] hover:bg-slate-50 ${
                  onClickMember ? 'cursor-pointer' : ''
                }`}
              >
                {/* Avatar */}
                <div className="relative w-9 h-9 shrink-0 mt-0.5">
                  {conn.avatarUrl ? (
                    <img
                      src={conn.avatarUrl}
                      alt={conn.name}
                      className="w-full h-full rounded-xl object-cover border border-[#EFECE7]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center font-serif text-[11px] text-slate-700 font-bold">
                      {initials}
                    </div>
                  )}
                </div>

                {/* Member Details */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1.5">
                    <span className="block text-xs font-serif font-bold text-slate-800 truncate">
                      {conn.name}
                    </span>
                    <span
                      className={`inline-block text-[8.5px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${
                        isFamily
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                          : isFriend
                          ? 'bg-blue-50 text-blue-700 border-blue-100'
                          : isWork
                          ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : 'bg-slate-100 text-slate-600 border-[#EFECE7]'
                      }`}
                    >
                      {conn.relationship}
                    </span>
                  </div>

                  {/* Stories Published Count & Last Published Date */}
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium truncate mt-1">
                    <span className="font-mono font-semibold text-slate-600">
                      {conn.storiesPublishedCnt} {conn.storiesPublishedCnt === 1 ? 'story' : 'stories'}
                    </span>
                    {conn.lastPublishedDt ? (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="truncate text-slate-500 font-sans" title={`Last published: ${formatPublishedDate(conn.lastPublishedDt)}`}>
                          Pub: {formatPublishedDate(conn.lastPublishedDt)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="italic text-slate-400">No stories yet</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <AdminComponentTag name="SbMyConnectionsCard" />
    </div>
  );
}
