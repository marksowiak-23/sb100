/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Users,
  UserCheck,
  Briefcase,
  Globe,
  Shield,
  Search,
  Eye,
  MessageSquare,
  Settings2,
  Calendar,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import {
  UnifiedGroup,
  ConnectedMemberItem,
  StoryGroupAccessEntry
} from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByGroupViewProps {
  groups: UnifiedGroup[];
  groupAccessMap: Record<string, StoryGroupAccessEntry[]>;
  membersByGroupMap: Record<string, ConnectedMemberItem[]>;
  selectedGroupId: string | null;
  onSelectGroup: (grpId: string) => void;
  onEditStoryPrivacy: (storyId: string, storyTitle: string) => void;
}

export default function PrivacyByGroupView({
  groups,
  groupAccessMap,
  membersByGroupMap,
  selectedGroupId,
  onSelectGroup,
  onEditStoryPrivacy
}: PrivacyByGroupViewProps) {
  const [storySearch, setStorySearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (mobileDropdownRef.current && !mobileDropdownRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    }
    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  // Only include groups that have at least one accessible story (no-access groups excluded)
  const accessibleGroups = useMemo(() => {
    return groups.filter((g) => (groupAccessMap[g.grpId] || []).length > 0);
  }, [groups, groupAccessMap]);

  const activeGroup = useMemo(() => {
    if (selectedGroupId) {
      const found = accessibleGroups.find((g) => g.grpId === selectedGroupId);
      if (found) return found;
    }
    return accessibleGroups[0] || null;
  }, [accessibleGroups, selectedGroupId]);

  const visibleStoryEntries = useMemo(() => {
    if (!activeGroup) return [];
    const raw = groupAccessMap[activeGroup.grpId] || [];
    if (!storySearch.trim()) return raw;
    const q = storySearch.toLowerCase();
    return raw.filter(
      (e) =>
        (e.story.mbrStoryTitle || '').toLowerCase().includes(q) ||
        e.topicLabel.toLowerCase().includes(q)
    );
  }, [activeGroup, groupAccessMap, storySearch]);

  const getGroupIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('family')) return <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
    if (n.includes('friend')) return <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (n.includes('work') || n.includes('colleague')) return <Briefcase className="w-4 h-4 text-violet-600 dark:text-violet-400" />;
    if (n.includes('public')) return <Globe className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
  };

  if (accessibleGroups.length === 0) {
    return (
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-xs">
        <AdminComponentTag name="PrivacyByGroupView.tsx" />
        <Users className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto mb-2.5" />
        <h3 className="text-sm font-bold font-serif text-slate-800 dark:text-white">
          No Groups Have Story Access Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
          Groups with no story access are hidden. Switch to the <strong>By Story</strong> tab to grant <strong>View</strong> or <strong>View and comment</strong> permissions to your groups.
        </p>
      </div>
    );
  }

  return (
    <div className="relative w-full max-w-full min-w-0 space-y-4">
      <AdminComponentTag name="PrivacyByGroupView.tsx" />

      {/* 1A. Mobile Group Dropdown Menu (< sm) - Constrained strictly to mobile width */}
      <div
        ref={mobileDropdownRef}
        className="block sm:hidden w-full max-w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3 shadow-xs relative z-20"
      >
        <div className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
          Select Group
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          className="w-full max-w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="shrink-0">
              {activeGroup ? getGroupIcon(activeGroup.grpName) : <Users className="w-4 h-4 text-indigo-600" />}
            </span>
            <span className="font-serif font-bold text-xs text-slate-900 dark:text-white truncate">
              {activeGroup ? activeGroup.grpName : 'Select Group'}
            </span>
            {activeGroup?.isCustom && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-100 text-violet-700 shrink-0">
                Custom
              </span>
            )}
          </div>
          {mobileMenuOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
          )}
        </button>

        {mobileMenuOpen && (
          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-1 max-h-60 overflow-y-auto w-full max-w-full">
            {accessibleGroups.map((grp) => {
              const isSelected = activeGroup?.grpId === grp.grpId;
              return (
                <button
                  key={grp.grpId}
                  type="button"
                  onClick={() => {
                    onSelectGroup(grp.grpId);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full max-w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-left text-xs font-serif transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200/80 dark:border-indigo-800'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="shrink-0">{getGroupIcon(grp.grpName)}</span>
                    <span className="truncate">{grp.grpName}</span>
                    {grp.isCustom && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-violet-100 text-violet-700 shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 1B. Desktop Group Selector Grid (>= sm) */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5">
        {accessibleGroups.map((grp) => {
          const entries = groupAccessMap[grp.grpId] || [];
          const viewCount = entries.filter((e) => e.accessLevel === 'READ').length;
          const commentCount = entries.filter((e) => e.accessLevel === 'WRITE').length;
          const memberCount = (membersByGroupMap[grp.grpId] || []).length;
          const isSelected = activeGroup?.grpId === grp.grpId;

          return (
            <button
              key={grp.grpId}
              type="button"
              onClick={() => onSelectGroup(grp.grpId)}
              className={`text-left p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                isSelected
                  ? 'bg-indigo-50/90 dark:bg-indigo-950/50 border-indigo-400 dark:border-indigo-600 ring-1 ring-indigo-400/30 shadow-xs'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700 shrink-0">
                    {getGroupIcon(grp.grpName)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                        {grp.grpName}
                      </span>
                      {grp.isCustom && (
                        <span className="px-1 py-0.2 rounded text-[8.5px] font-bold bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
                      {grp.grpName.toLowerCase() === 'public'
                        ? 'Public access'
                        : `${memberCount} member${memberCount === 1 ? '' : 's'}`}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100/80 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-200 shrink-0">
                  {entries.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-[10px]">
                {commentCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-100/80 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 font-semibold">
                    <MessageSquare className="w-2.5 h-2.5" />
                    {commentCount} Comment
                  </span>
                )}
                {viewCount > 0 && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-100/80 text-blue-800 dark:bg-blue-950/70 dark:text-blue-300 font-semibold">
                    <Eye className="w-2.5 h-2.5" />
                    {viewCount} View
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* 2. Selected Group Content Box */}
      {activeGroup && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs space-y-3.5">
          {/* Compact Group Sub-Header + Story Search */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 min-w-0">
              {getGroupIcon(activeGroup.grpName)}
              <h2 className="text-sm sm:text-base font-bold font-serif text-slate-900 dark:text-white">
                {activeGroup.grpName}
              </h2>
              <span className="text-xs text-slate-400">
                • {visibleStoryEntries.length} visible {visibleStoryEntries.length === 1 ? 'story' : 'stories'}
              </span>
            </div>

            <div className="relative w-full md:w-56 shrink-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={storySearch}
                onChange={(e) => setStorySearch(e.target.value)}
                placeholder="Search visible stories..."
                className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          {/* Compact Multi-Column Story Grid */}
          {visibleStoryEntries.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 font-serif">
              No published stories match "{storySearch}" in {activeGroup.grpName}.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {visibleStoryEntries.map((entry) => {
                const isWrite = entry.accessLevel === 'WRITE';
                const dateStr = entry.story.mbrStoryPublishedDate || entry.story.mbrStoryUpdatedAt;

                return (
                  <div
                    key={`${activeGroup.grpId}_${entry.story.mbrStoryId}`}
                    className="group flex flex-col justify-between p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-2xs transition-all gap-2"
                  >
                    {/* Top Row: Topic + Access Badge + Edit Button */}
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

                    {/* Story Title & Date */}
                    <div>
                      <h4
                        className="font-serif font-bold text-xs sm:text-sm text-slate-900 dark:text-white line-clamp-1"
                        title={entry.story.mbrStoryTitle || 'Untitled Story'}
                      >
                        {entry.story.mbrStoryTitle || 'Untitled Story'}
                      </h4>
                      {dateStr && (
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                          <Calendar className="w-2.5 h-2.5" />
                          <span>
                            {new Date(dateStr).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      )}
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
