/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  Compass,
  Feather,
  BookOpen,
  Users,
  Coins,
  ShieldCheck,
  Search,
  X,
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { HelpCategoryMeta, HelpCategoryId } from '../constants/helpContent';

const CATEGORY_ICONS: Record<HelpCategoryId, React.ComponentType<{ className?: string }>> = {
  'getting-started': Compass,
  'stories-authoring': Feather,
  'books-audio': BookOpen,
  'connections-messaging': Users,
  'account-credits': Coins,
  'privacy-security': ShieldCheck,
};

interface HelpHeaderProps {
  category: HelpCategoryMeta;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  totalMatches: number;
}

export default function HelpHeader({
  category,
  searchQuery,
  onSearchChange,
  totalMatches,
}: HelpHeaderProps) {
  const Icon = CATEGORY_ICONS[category.id];
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="relative mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-slate-200 dark:border-slate-800 space-y-4">
      <AdminComponentTag name="HelpHeader" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr ${category.accentGradient} flex items-center justify-center shadow-md text-white shrink-0`}
          >
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              {isSearching ? `Search Results (${totalMatches})` : category.title}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-snug">
              {isSearching
                ? `Showing matching how-to guides across all BackStory topics for "${searchQuery.trim()}"`
                : category.description}
            </p>
          </div>
        </div>
      </div>

      {/* Live Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search how-to questions (e.g., MFA, password, print book, credits, StoryMate, messaging)..."
          className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-800 dark:text-slate-100 placeholder-slate-400 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
        {isSearching && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}
