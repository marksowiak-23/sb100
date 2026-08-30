/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, Mail, Send, Sparkles } from 'lucide-react';
import { ConnectionSection } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface ManageConnectionsMenuProps {
  activeSection: ConnectionSection;
  onSelectSection: (section: ConnectionSection) => void;
  connectionsCount: number;
  invitationsCount: number;
  requestsCount: number;
  hasUnsavedInvitations?: boolean;
  hasUnsavedRequests?: boolean;
}

export default function ManageConnectionsMenu({
  activeSection,
  onSelectSection,
  connectionsCount,
  invitationsCount,
  requestsCount,
  hasUnsavedInvitations = false,
  hasUnsavedRequests = false
}: ManageConnectionsMenuProps) {
  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
      <AdminComponentTag name="ManageConnectionsMenu.tsx" />

      {/* Menu Header */}
      <div className="pb-4 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <h2 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Manage my Connections</span>
        </h2>
      </div>

      {/* Navigation Items List */}
      <nav className="space-y-1.5" aria-label="Manage Connections Navigation">
        {/* Item 1: Connections */}
        <button
          type="button"
          onClick={() => onSelectSection('connections')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
            activeSection === 'connections'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                activeSection === 'connections'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Users className="w-4 h-4" />
            </div>
            <span>Connections</span>
          </div>

          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold transition-colors ${
              activeSection === 'connections'
                ? 'bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
            }`}
          >
            {connectionsCount}
          </span>
        </button>

        {/* Item 2: Invitations */}
        <button
          type="button"
          onClick={() => onSelectSection('invitations')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
            activeSection === 'invitations'
              ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                activeSection === 'invitations'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Mail className="w-4 h-4" />
            </div>
            <span>Invitations</span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasUnsavedInvitations && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved decisions" />
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold transition-colors ${
                invitationsCount > 0
                  ? 'bg-blue-600 text-white shadow-xs'
                  : activeSection === 'invitations'
                  ? 'bg-blue-200/60 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {invitationsCount}
            </span>
          </div>
        </button>

        {/* Item 3: Requests */}
        <button
          type="button"
          onClick={() => onSelectSection('requests')}
          className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
            activeSection === 'requests'
              ? 'bg-amber-50/80 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                activeSection === 'requests'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              <Send className="w-4 h-4" />
            </div>
            <span>Requests</span>
          </div>

          <div className="flex items-center gap-1.5">
            {hasUnsavedRequests && (
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" title="Unsaved withdrawals" />
            )}
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold transition-colors ${
                requestsCount > 0
                  ? 'bg-amber-500 text-white shadow-xs'
                  : activeSection === 'requests'
                  ? 'bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {requestsCount}
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
}
