/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  Users,
  UserCheck,
  Eye,
  MessageSquare,
  Settings2,
  MapPin,
  Sparkles,
  Briefcase,
  Globe,
  Shield
} from 'lucide-react';
import { EnrichedStoryItem } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByStoryViewProps {
  enrichedStories: EnrichedStoryItem[];
  selectedStoryId: string | null;
  onSelectStory: (storyId: string) => void;
  onEditStoryPrivacy: (storyId: string, storyTitle: string) => void;
}

export default function PrivacyByStoryView({
  enrichedStories,
  selectedStoryId,
  onSelectStory,
  onEditStoryPrivacy
}: PrivacyByStoryViewProps) {
  const [storySearch, setStorySearch] = useState('');
  const [memberFilter, setMemberFilter] = useState('');
  const [showUnsharedStories, setShowUnsharedStories] = useState(false);
  const [storyDetailTab, setStoryDetailTab] = useState<'groups' | 'members'>('groups');

  const filteredStories = useMemo(() => {
    return enrichedStories.filter((item) => {
      const hasAnyAccess =
        item.groupsWithAccess.length > 0 || item.membersWithAccess.length > 0;
      if (!showUnsharedStories && !hasAnyAccess) return false;

      if (!storySearch.trim()) return true;
      const q = storySearch.toLowerCase();
      return (
        (item.story.mbrStoryTitle || '').toLowerCase().includes(q) ||
        item.topicLabel.toLowerCase().includes(q)
      );
    });
  }, [enrichedStories, showUnsharedStories, storySearch]);

  const activeStoryItem = useMemo(() => {
    if (selectedStoryId) {
      const found = filteredStories.find((s) => s.story.mbrStoryId === selectedStoryId);
      if (found) return found;
    }
    return filteredStories[0] || null;
  }, [filteredStories, selectedStoryId]);

  const activeGroupsWithAccess = useMemo(() => {
    if (!activeStoryItem) return [];
    return activeStoryItem.groupsWithAccess;
  }, [activeStoryItem]);

  const activeMembersWithAccess = useMemo(() => {
    if (!activeStoryItem) return [];
    const base = activeStoryItem.membersWithAccess;
    if (!memberFilter.trim()) return base;
    const q = memberFilter.toLowerCase();
    return base.filter(
      (entry) =>
        entry.member.fullName.toLowerCase().includes(q) ||
        (entry.member.location && entry.member.location.toLowerCase().includes(q)) ||
        entry.grantedViaGroups.some((g) => g.grpName.toLowerCase().includes(q))
    );
  }, [activeStoryItem, memberFilter]);

  const getGroupIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('family')) return <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />;
    if (n.includes('friend')) return <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />;
    if (n.includes('work') || n.includes('colleague')) return <Briefcase className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />;
    if (n.includes('public')) return <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />;
    return <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />;
  };

  return (
    <div className="relative space-y-4">
      <AdminComponentTag name="PrivacyByStoryView.tsx" />

      {/* 1. Compact Story Grid Selector */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Select Story ({filteredStories.length})
              </h2>
            </div>

            <label className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showUnsharedStories}
                onChange={(e) => setShowUnsharedStories(e.target.checked)}
                className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
              />
              <span>Include unshared stories</span>
            </label>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={storySearch}
              onChange={(e) => setStorySearch(e.target.value)}
              placeholder="Search stories by title or topic..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        </div>

        {filteredStories.length === 0 ? (
          <div className="py-6 text-center space-y-1.5">
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-serif">
              No Shared Stories Found
            </p>
            <button
              type="button"
              onClick={() => setShowUnsharedStories(true)}
              className="text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
            >
              Show all stories to configure access
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-56 overflow-y-auto pr-1">
            {filteredStories.map((item) => {
              const grpCount = item.groupsWithAccess.length;
              const mbrCount = item.membersWithAccess.length;
              const isSelected = activeStoryItem?.story.mbrStoryId === item.story.mbrStoryId;

              return (
                <button
                  key={item.story.mbrStoryId}
                  type="button"
                  onClick={() => onSelectStory(item.story.mbrStoryId)}
                  className={`text-left p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                    isSelected
                      ? 'bg-amber-50/90 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-1 ring-amber-400/30 shadow-2xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/50 hover:bg-slate-100/80 dark:hover:bg-slate-800 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[9.5px] font-semibold bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-300 truncate">
                        {item.topicLabel}
                      </span>
                    </div>
                    <div
                      className="font-serif font-bold text-xs text-slate-900 dark:text-white line-clamp-1"
                      title={item.story.mbrStoryTitle || 'Untitled Story'}
                    >
                      {item.story.mbrStoryTitle || 'Untitled Story'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1 text-indigo-700 dark:text-indigo-300">
                      <Users className="w-3 h-3" />
                      {grpCount} {grpCount === 1 ? 'Grp' : 'Grps'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 dark:text-emerald-300">
                      <UserCheck className="w-3 h-3" />
                      {mbrCount} {mbrCount === 1 ? 'Mbr' : 'Mbrs'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2. Selected Story Access Breakdown */}
      {activeStoryItem && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-4">
          {/* Compact Story Header + Sub-Tabs + Manage Action */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5 flex-wrap min-w-0">
              <span className="px-2 py-0.5 rounded-md text-[10.5px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                {activeStoryItem.topicLabel}
              </span>
              <h3 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white truncate">
                {activeStoryItem.story.mbrStoryTitle || 'Untitled Story'}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-2 shrink-0">
              {/* Two Sub-Tabs: Groups with Access | Members with Access */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setStoryDetailTab('groups')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-serif transition-all cursor-pointer ${
                    storyDetailTab === 'groups'
                      ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>Groups with Access</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-sans font-bold bg-indigo-50 text-indigo-700 dark:bg-slate-600 dark:text-slate-200">
                    {activeGroupsWithAccess.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setStoryDetailTab('members')}
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold font-serif transition-all cursor-pointer ${
                    storyDetailTab === 'members'
                      ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-white shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Members with Access</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-sans font-bold bg-emerald-50 text-emerald-700 dark:bg-slate-600 dark:text-slate-200">
                    {activeStoryItem.membersWithAccess.length}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() =>
                  onEditStoryPrivacy(
                    activeStoryItem.story.mbrStoryId,
                    activeStoryItem.story.mbrStoryTitle || 'Untitled Story'
                  )
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-2xs transition-colors cursor-pointer shrink-0"
              >
                <Settings2 className="w-3.5 h-3.5" />
                <span>Manage Story Access</span>
              </button>
            </div>
          </div>

          {/* Active Sub-Tab Content */}
          {storyDetailTab === 'groups' ? (
            <div className="space-y-2.5">
              {activeGroupsWithAccess.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 font-serif">
                  No groups have access to this story.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                  {activeGroupsWithAccess.map(({ group, accessLevel }) => {
                    const isWrite = accessLevel === 'WRITE';
                    return (
                      <div
                        key={group.grpId}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                            {getGroupIcon(group.grpName)}
                          </div>
                          <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                            {group.grpName}
                          </span>
                          {group.isCustom && (
                            <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-violet-100 text-violet-700">
                              Custom
                            </span>
                          )}
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                            isWrite
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200'
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {activeStoryItem.membersWithAccess.length > 4 && (
                <div className="flex justify-end">
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={memberFilter}
                      onChange={(e) => setMemberFilter(e.target.value)}
                      placeholder="Filter members with access..."
                      className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>
              )}

              {activeMembersWithAccess.length === 0 ? (
                <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 font-serif">
                  No connected members have access to this story.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-80 overflow-y-auto pr-1">
                  {activeMembersWithAccess.map((entry) => {
                    const isWrite = entry.accessLevel === 'WRITE';
                    const { member } = entry;

                    return (
                      <div
                        key={member.mbrConnectionMbrId}
                        className="flex items-center justify-between gap-2 p-3 rounded-xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {member.avatarUrl ? (
                            <img
                              src={member.avatarUrl}
                              alt={member.fullName}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 font-serif font-bold text-[11px] flex items-center justify-center shrink-0">
                              {member.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-serif font-bold text-xs text-slate-900 dark:text-white truncate">
                              {member.fullName}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 text-[9.5px] text-slate-500">
                              {entry.directAccess && (
                                <span className="inline-flex items-center gap-0.5 text-violet-700 dark:text-violet-300 font-semibold">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  Direct
                                </span>
                              )}
                              {entry.grantedViaGroups.map((g) => (
                                <span key={g.grpId} className="text-indigo-600 dark:text-indigo-400 font-medium">
                                  Via {g.grpName}
                                </span>
                              ))}
                              {!entry.directAccess && entry.grantedViaGroups.length === 0 && member.location && (
                                <span className="inline-flex items-center gap-0.5 text-slate-400">
                                  <MapPin className="w-2.5 h-2.5" />
                                  {member.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-bold shrink-0 ${
                            isWrite
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-200'
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
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
