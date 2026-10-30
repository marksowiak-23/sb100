/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  UserCheck,
  Search,
  Eye,
  MessageSquare,
  MapPin,
  Users,
  Settings2,
  Sparkles
} from 'lucide-react';
import {
  ConnectedMemberItem,
  StoryMemberAccessEntry
} from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByMemberViewProps {
  connectedMembers: ConnectedMemberItem[];
  memberAccessMap: Record<string, StoryMemberAccessEntry[]>;
  selectedMemberId: string | null;
  onSelectMember: (mbrId: string) => void;
  onEditStoryPrivacy: (storyId: string, storyTitle: string) => void;
}

export default function PrivacyByMemberView({
  connectedMembers,
  memberAccessMap,
  selectedMemberId,
  onSelectMember,
  onEditStoryPrivacy
}: PrivacyByMemberViewProps) {
  const [memberSearch, setMemberSearch] = useState('');
  const [storySearch, setStorySearch] = useState('');

  // Only show connected members who have View or View and comment access to at least one story
  const membersWithAccess = useMemo(() => {
    return connectedMembers.filter((m) => {
      const entries = memberAccessMap[m.mbrConnectionMbrId] || [];
      if (entries.length === 0) return false;

      if (!memberSearch.trim()) return true;
      const q = memberSearch.toLowerCase();
      return (
        m.fullName.toLowerCase().includes(q) ||
        (m.location && m.location.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        m.groupNames.some((g) => g.toLowerCase().includes(q))
      );
    });
  }, [connectedMembers, memberAccessMap, memberSearch]);

  const activeMember = useMemo(() => {
    if (selectedMemberId) {
      const found = membersWithAccess.find((m) => m.mbrConnectionMbrId === selectedMemberId);
      if (found) return found;
    }
    return membersWithAccess[0] || null;
  }, [membersWithAccess, selectedMemberId]);

  const memberStories = useMemo(() => {
    if (!activeMember) return [];
    const raw = memberAccessMap[activeMember.mbrConnectionMbrId] || [];
    if (!storySearch.trim()) return raw;
    const q = storySearch.toLowerCase();
    return raw.filter(
      (e) =>
        (e.story.mbrStoryTitle || '').toLowerCase().includes(q) ||
        e.topicLabel.toLowerCase().includes(q)
    );
  }, [activeMember, memberAccessMap, storySearch]);

  return (
    <div className="relative space-y-4">
      <AdminComponentTag name="PrivacyByMemberView.tsx" />

      {/* 1. Compact Member Search & Selector Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Connected Members with Access ({membersWithAccess.length})
            </h2>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={memberSearch}
              onChange={(e) => setMemberSearch(e.target.value)}
              placeholder="Search member by name, group, city..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>
        </div>

        {membersWithAccess.length === 0 ? (
          <div className="py-6 text-center space-y-1">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-serif">
              {memberSearch.trim()
                ? `No accessible members match "${memberSearch}"`
                : 'No Connected Members Have Story Access'}
            </p>
            <p className="text-[11px] text-slate-400">
              Members with no access are automatically excluded.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {membersWithAccess.map((m) => {
              const entries = memberAccessMap[m.mbrConnectionMbrId] || [];
              const isSelected = activeMember?.mbrConnectionMbrId === m.mbrConnectionMbrId;

              return (
                <button
                  key={m.mbrConnectionMbrId}
                  type="button"
                  onClick={() => onSelectMember(m.mbrConnectionMbrId)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50/90 dark:bg-emerald-950/50 border-emerald-400 dark:border-emerald-600 ring-1 ring-emerald-400/30 shadow-2xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {m.avatarUrl ? (
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        {m.fullName.charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-xs text-slate-900 dark:text-white truncate">
                        {m.fullName}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                        {m.groupNames.length > 0
                          ? m.groupNames.join(', ')
                          : m.location || 'Connected'}
                      </div>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10.5px] font-bold bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 border border-emerald-200/60 dark:border-slate-600 shrink-0">
                    {entries.length}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Selected Member's Accessible Stories Grid */}
      {activeMember && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
          {/* Compact Member Header + Story Filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 min-w-0">
              {activeMember.avatarUrl ? (
                <img
                  src={activeMember.avatarUrl}
                  alt={activeMember.fullName}
                  className="w-9 h-9 rounded-full object-cover border border-emerald-200 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                  {activeMember.fullName.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white">
                    {activeMember.fullName}
                  </h3>
                  <span className="text-xs text-slate-400">
                    • {memberStories.length} accessible {memberStories.length === 1 ? 'story' : 'stories'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                  {activeMember.location && (
                    <span className="inline-flex items-center gap-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {activeMember.location}
                    </span>
                  )}
                  {activeMember.groupNames.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-medium">
                      <Users className="w-3 h-3" />
                      {activeMember.groupNames.join(', ')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="relative w-full sm:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                placeholder="Filter member's stories..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          {/* Compact Multi-Column Story Grid */}
          {memberStories.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-serif">
              No published stories match "{storySearch}" for {activeMember.fullName}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {memberStories.map((entry) => {
                const isWrite = entry.accessLevel === 'WRITE';

                return (
                  <div
                    key={`${activeMember.mbrConnectionMbrId}_${entry.story.mbrStoryId}`}
                    className="flex flex-col justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-300 dark:hover:border-emerald-700 hover:shadow-2xs transition-all gap-2"
                  >
                    {/* Top Row: Topic + Access Badge + Edit */}
                    <div className="flex items-center justify-between gap-1.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate">
                          {entry.topicLabel}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold ${
                            isWrite
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200/80'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200/80'
                          }`}
                        >
                          {isWrite ? (
                            <>
                              <MessageSquare className="w-2.5 h-2.5" />
                              <span>View &amp; comment</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-2.5 h-2.5" />
                              <span>View</span>
                            </>
                          )}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            onEditStoryPrivacy(
                              entry.story.mbrStoryId,
                              entry.story.mbrStoryTitle || 'Untitled Story'
                            )
                          }
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          title="Edit story privacy"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h4
                      className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1"
                      title={entry.story.mbrStoryTitle || 'Untitled Story'}
                    >
                      {entry.story.mbrStoryTitle || 'Untitled Story'}
                    </h4>

                    {/* Compact Source Pills */}
                    <div className="flex flex-wrap items-center gap-1 text-[10px]">
                      {entry.directAccess && (
                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300 border border-violet-200/60 font-medium">
                          <Sparkles className="w-2.5 h-2.5" />
                          Direct
                        </span>
                      )}
                      {entry.grantedViaGroups.map((g) => (
                        <span
                          key={g.grpId}
                          className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200/60 font-medium"
                        >
                          <Users className="w-2.5 h-2.5" />
                          Via {g.grpName}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
