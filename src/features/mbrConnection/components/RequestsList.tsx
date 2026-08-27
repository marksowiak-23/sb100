/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Send, Loader2 } from 'lucide-react';
import { MemberRequestItem, UnifiedGroupOption } from '../types';
import RequestCard from './RequestCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface RequestsListProps {
  loading: boolean;
  requestList: MemberRequestItem[];
  groups: UnifiedGroupOption[];
  onToggleWithdrawal: (contactId: string) => void;
}

export default function RequestsList({
  loading,
  requestList,
  groups,
  onToggleWithdrawal
}: RequestsListProps) {
  if (loading) {
    return (
      <div className="relative py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <AdminComponentTag name="RequestsList.tsx" />
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        <span className="text-xs font-serif font-medium">Loading outgoing requests...</span>
      </div>
    );
  }

  if (requestList.length === 0) {
    return (
      <div className="relative py-16 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <AdminComponentTag name="RequestsList.tsx" />
        <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 mx-auto mb-3 shadow-xs">
          <Send className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold font-serif text-slate-800 dark:text-slate-200 mb-1">
          No Outgoing Requests
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-serif leading-relaxed">
          You currently have no pending connection requests waiting for response. You can connect with other StoryBook members from the Find a Member feed.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <AdminComponentTag name="RequestsList.tsx" />
      {requestList.map((item) => (
        <RequestCard
          key={item.contact.mbrContactId}
          item={item}
          groups={groups}
          onToggleWithdrawal={onToggleWithdrawal}
        />
      ))}
    </div>
  );
}
