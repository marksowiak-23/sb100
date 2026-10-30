/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  ShieldCheck,
  RefreshCw,
  Printer,
  BookOpen,
  Users,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { AccessTabMode } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyHeaderProps {
  loading: boolean;
  error: string | null;
  activeTab: AccessTabMode;
  onTabChange: (tab: AccessTabMode) => void;
  totalAccessibleStories: number;
  totalActiveGroups: number;
  totalActiveMembers: number;
  onRefresh: () => void;
  onPrintPdf: () => void;
}

export default function PrivacyHeader({
  loading,
  error,
  activeTab,
  onTabChange,
  onRefresh,
  onPrintPdf
}: PrivacyHeaderProps) {
  return (
    <div className="relative mb-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 sm:p-4 shadow-xs">
      <AdminComponentTag name="PrivacyHeader.tsx" />

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Title, Subtitle & Mobile Action Buttons */}
        <div className="flex items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-500 flex items-center justify-center shadow-sm text-white shrink-0">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold font-serif text-slate-900 dark:text-white tracking-tight leading-tight">
                Story Access &amp; Visibility
              </h1>
              <p className="text-[11px] sm:text-[11.5px] text-slate-500 dark:text-slate-400">
                See which groups and connected members have <strong>View</strong> or <strong>View &amp; comment</strong> access to your stories.
              </p>
            </div>
          </div>

          {/* Action Buttons (visible top-right on mobile/tablet, hidden on lg where they sit right of tabs) */}
          <div className="flex lg:hidden items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Refresh story access data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              type="button"
              onClick={onPrintPdf}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Download Story Access PDF Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs + Desktop Utility Buttons */}
        <div className="flex items-center justify-between lg:justify-end gap-2 w-full lg:w-auto min-w-0">
          {/* 3-Tab Switcher */}
          <div className="grid grid-cols-3 sm:inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-full sm:w-auto min-w-0">
            <button
              type="button"
              onClick={() => onTabChange('by-group')}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold font-serif transition-all cursor-pointer min-w-0 whitespace-nowrap ${
                activeTab === 'by-group'
                  ? 'bg-white dark:bg-slate-700 text-indigo-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="truncate">By Group</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('by-member')}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold font-serif transition-all cursor-pointer min-w-0 whitespace-nowrap ${
                activeTab === 'by-member'
                  ? 'bg-white dark:bg-slate-700 text-emerald-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span className="truncate">By Member</span>
            </button>

            <button
              type="button"
              onClick={() => onTabChange('by-story')}
              className={`inline-flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg text-[11px] sm:text-xs font-bold font-serif transition-all cursor-pointer min-w-0 whitespace-nowrap ${
                activeTab === 'by-story'
                  ? 'bg-white dark:bg-slate-700 text-amber-700 dark:text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="truncate">By Story</span>
            </button>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={onRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Refresh story access data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={onPrintPdf}
              disabled={loading}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
              title="Download Story Access PDF Report"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-2 text-xs font-medium">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
