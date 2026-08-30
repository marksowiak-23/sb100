/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MailCheck, Loader2 } from 'lucide-react';
import { MemberInvitationItem, UnifiedGroupOption, InvitationDecision } from '../types';
import InvitationCard from './InvitationCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface InvitationsListProps {
  loading: boolean;
  invitationList: MemberInvitationItem[];
  groups: UnifiedGroupOption[];
  onSelectDecision: (contactId: string, decision: InvitationDecision) => void;
}

export default function InvitationsList({
  loading,
  invitationList,
  groups,
  onSelectDecision
}: InvitationsListProps) {
  if (loading) {
    return (
      <div className="relative py-16 flex flex-col items-center justify-center gap-3 text-slate-400">
        <AdminComponentTag name="InvitationsList.tsx" />
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="text-xs font-serif font-medium">Loading incoming invitations...</span>
      </div>
    );
  }

  if (invitationList.length === 0) {
    return (
      <div className="relative py-16 px-4 text-center rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40">
        <AdminComponentTag name="InvitationsList.tsx" />
        <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 mx-auto mb-3 shadow-xs">
          <MailCheck className="w-7 h-7" />
        </div>
        <h3 className="text-base font-bold font-serif text-slate-800 dark:text-slate-200 mb-1">
          No Pending Invitations
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-serif leading-relaxed">
          You are all caught up! When other StoryBook members send you a connection request, it will appear here for you to accept or ignore.
        </p>
      </div>
    );
  }

  return (
    <div className="relative space-y-4">
      <AdminComponentTag name="InvitationsList.tsx" />
      {invitationList.map((item) => (
        <InvitationCard
          key={item.contact.mbrContactId}
          item={item}
          groups={groups}
          onSelectDecision={onSelectDecision}
        />
      ))}
    </div>
  );
}
