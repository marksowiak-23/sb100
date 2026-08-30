/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Check, 
  X, 
  MapPin, 
  Briefcase, 
  Tag, 
  MessageSquare, 
  Clock, 
  Users,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { MemberInvitationItem, InvitationDecision, UnifiedGroupOption } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface InvitationCardProps {
  item: MemberInvitationItem;
  groups: UnifiedGroupOption[];
  onSelectDecision: (contactId: string, decision: InvitationDecision) => void;
}

export default function InvitationCard({
  item,
  groups,
  onSelectDecision
}: InvitationCardProps) {
  const { contact, senderMember, selectedDecision } = item;
  
  const senderName = senderMember
    ? `${senderMember.mbrFirstName || ''} ${senderMember.mbrLastName || ''}`.trim() || 'StoryBook Member'
    : (contact.mbrContactEmail || 'StoryBook Member');

  const senderInitials = senderMember
    ? `${senderMember.mbrFirstName?.[0] || 'M'}${senderMember.mbrLastName?.[0] || ''}`.toUpperCase()
    : 'SB';

  // Format date received
  const formattedDate = contact.mbrContactCreatedAt
    ? new Date(contact.mbrContactCreatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently';

  // Find reason label or fallback
  const reasonLabel = contact.mbrContactReasonCd
    ? contact.mbrContactReasonCd.charAt(0) + contact.mbrContactReasonCd.slice(1).toLowerCase()
    : 'General Inquiry';

  // Find suggested group name if any
  const suggestedGroup = contact.grpId
    ? groups.find(g => g.grpId === contact.grpId)
    : null;

  return (
    <div
      className={`relative p-5 rounded-3xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between gap-5 shadow-xs hover:shadow-md ${
        selectedDecision === 'ACCEPT'
          ? 'border-emerald-400 dark:border-emerald-500 ring-2 ring-emerald-400/20 bg-emerald-50/20 dark:bg-emerald-950/20'
          : selectedDecision === 'IGNORE'
          ? 'border-rose-300 dark:border-rose-600 ring-2 ring-rose-300/20 bg-rose-50/20 dark:bg-rose-950/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <AdminComponentTag name="InvitationCard.tsx" />

      {/* Top Header: Sender Profile & Reason Tag */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            {senderMember?.mbrProfilePic ? (
              <img
                src={senderMember.mbrProfilePic}
                alt={senderName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-base">{senderInitials}</span>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-tight truncate">
              {senderName}
            </h3>

            {senderMember?.mbrLivesCityState && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{senderMember.mbrLivesCityState}</span>
              </p>
            )}

            {senderMember?.mbrWorkAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{senderMember.mbrWorkAt}</span>
              </p>
            )}
          </div>
        </div>

        {/* Reason and Timestamp Badges */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-2xs">
            <Tag className="w-3 h-3 text-blue-500" />
            <span>{reasonLabel}</span>
          </span>

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-sans">
            <Clock className="w-3 h-3" />
            <span>{formattedDate}</span>
          </span>
        </div>
      </div>

      {/* Sender's Personal Message (if present) */}
      {contact.mbrContactMsg && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-slate-400">Message from sender</span>
            <p className="italic">"{contact.mbrContactMsg}"</p>
          </div>
        </div>
      )}

      {/* Suggested Group badge (if available) */}
      {suggestedGroup && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-serif">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>Requested Group: <strong className="text-slate-700 dark:text-slate-200">{suggestedGroup.grpName}</strong></span>
        </div>
      )}

      {/* Actions: Accept or Ignore */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Indicator */}
        <div className="text-xs font-serif">
          {selectedDecision === 'ACCEPT' ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>Marked to Accept (Click Save to confirm)</span>
            </span>
          ) : selectedDecision === 'IGNORE' ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <XCircle className="w-4 h-4" />
              <span>Marked to Ignore (Click Save to confirm)</span>
            </span>
          ) : (
            <span className="text-slate-400 dark:text-slate-500">
              Select an action:
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Ignore Button */}
          <button
            type="button"
            onClick={() => onSelectDecision(contact.mbrContactId, selectedDecision === 'IGNORE' ? null : 'IGNORE')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              selectedDecision === 'IGNORE'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 border border-slate-200 dark:border-slate-700'
            }`}
          >
            <X className="w-3.5 h-3.5" />
            <span>Ignore</span>
          </button>

          {/* Accept Button */}
          <button
            type="button"
            onClick={() => onSelectDecision(contact.mbrContactId, selectedDecision === 'ACCEPT' ? null : 'ACCEPT')}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              selectedDecision === 'ACCEPT'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-xs hover:shadow'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Accept Connection</span>
          </button>
        </div>
      </div>
    </div>
  );
}
