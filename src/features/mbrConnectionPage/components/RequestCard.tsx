/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Trash2, 
  RotateCcw, 
  MapPin, 
  Briefcase, 
  Tag, 
  MessageSquare, 
  Clock, 
  Users,
  Hourglass,
  AlertCircle
} from 'lucide-react';
import { MemberRequestItem, RequestDecision, UnifiedGroupOption } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface RequestCardProps {
  key?: React.Key;
  item: MemberRequestItem;
  groups: UnifiedGroupOption[];
  onToggleWithdrawal: (contactId: string) => void;
}


export default function RequestCard({
  item,
  groups,
  onToggleWithdrawal
}: RequestCardProps) {
  const { contact, targetMember, selectedDecision } = item;
  
  const recipientName = targetMember
    ? `${targetMember.mbrFirstName || ''} ${targetMember.mbrLastName || ''}`.trim() || 'StoryBook Member'
    : (contact.mbrContactEmail || 'StoryBook Member');

  const recipientInitials = targetMember
    ? `${targetMember.mbrFirstName?.[0] || 'M'}${targetMember.mbrLastName?.[0] || ''}`.toUpperCase()
    : 'SB';

  const formattedDate = contact.mbrContactCreatedAt
    ? new Date(contact.mbrContactCreatedAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Recently';

  const reasonLabel = contact.mbrContactReasonCd
    ? contact.mbrContactReasonCd.charAt(0) + contact.mbrContactReasonCd.slice(1).toLowerCase()
    : '';
  const showReasonBadge = Boolean(reasonLabel && reasonLabel.toLowerCase() !== 'other');

  const assignedGroup = contact.grpId
    ? groups.find(g => g.grpId === contact.grpId)
    : null;

  const isWithdrawn = selectedDecision === 'WITHDRAW';

  return (
    <div
      className={`relative p-5 rounded-3xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between gap-5 shadow-xs hover:shadow-md ${
        isWithdrawn
          ? 'border-rose-300 dark:border-rose-700 bg-rose-50/20 dark:bg-rose-950/20 ring-2 ring-rose-300/20'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <AdminComponentTag name="RequestCard.tsx" />

      {/* Top Header: Recipient Member Profile & Tags */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
            {targetMember?.mbrProfilePic ? (
              <img
                src={targetMember.mbrProfilePic}
                alt={recipientName}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="font-serif text-base">{recipientInitials}</span>
            )}
          </div>

          <div className="space-y-1 min-w-0">
            <h3 className="font-bold text-base text-slate-900 dark:text-white font-serif tracking-tight truncate">
              {recipientName}
            </h3>

            {targetMember?.mbrLivesCityState && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{targetMember.mbrLivesCityState}</span>
              </p>
            )}

            {targetMember?.mbrWorkAt && (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">
                <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{targetMember.mbrWorkAt}</span>
              </p>
            )}
          </div>
        </div>

        {/* Reason, Date & Status Badges */}
        <div className="flex flex-wrap sm:flex-col items-start sm:items-end gap-1.5 shrink-0">
          {showReasonBadge && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shadow-2xs">
              <Tag className="w-3 h-3 text-amber-500" />
              <span>{reasonLabel}</span>
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 font-sans">
            <Clock className="w-3 h-3" />
            <span>Sent {formattedDate}</span>
          </span>
        </div>
      </div>


      {/* Your Message Sent */}
      {contact.mbrContactMsg && (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed flex items-start gap-2.5">
          <MessageSquare className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase tracking-wider font-sans font-bold text-slate-400">Your message</span>
            <p className="italic">"{contact.mbrContactMsg}"</p>
          </div>
        </div>
      )}

      {/* Assigned Group tag if any */}
      {assignedGroup && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-serif">
          <Users className="w-3.5 h-3.5 text-emerald-500" />
          <span>Assigned Group: <strong className="text-slate-700 dark:text-slate-200">{assignedGroup.grpName}</strong></span>
        </div>
      )}

      {/* Actions & Status Bar */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-serif">
          {isWithdrawn ? (
            <span className="inline-flex items-center gap-1.5 font-bold text-rose-600 dark:text-rose-400">
              <AlertCircle className="w-4 h-4" />
              <span>Marked to Withdraw (Click Save to delete request)</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
              <Hourglass className="w-3.5 h-3.5 text-amber-500 animate-spin" style={{ animationDuration: '4s' }} />
              <span>Awaiting response from member</span>
            </span>
          )}
        </div>

        <div>
          {isWithdrawn ? (
            <button
              type="button"
              onClick={() => onToggleWithdrawal(contact.mbrContactId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Undo Withdrawal</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onToggleWithdrawal(contact.mbrContactId)}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-2xs hover:shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Withdraw Request</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
