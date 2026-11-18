/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles, 
  Copy, 
  Check, 
  Gift 
} from 'lucide-react';
import { MbrAcct } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AccountPlanPanelProps {
  account: MbrAcct | null;
  memberId: string;
}

export default function AccountPlanPanel({ account, memberId }: AccountPlanPanelProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!memberId) return;
    navigator.clipboard.writeText(memberId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const perks = [
    '1,500 complimentary registration credits',
    'StoryMate AI Co-Writer access with personalized persona calibration',
    'High-resolution PDF book compilation and single story printing',
    'Google Cloud Vertex AI & ElevenLabs personal voice cloning narration',
    'Private family sharing circles, comments, and connection invitations'
  ];

  const dateStr = account?.mbrAcctCreatedAt;

  return (
    <div className="space-y-6 py-1">
      <AdminComponentTag name="AccountPlanPanel.tsx" />

      {/* Plan Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold block mb-1">
              Active Subscription
            </span>
            <h3 className="text-xl sm:text-2xl font-serif font-extrabold text-white">
              {account?.mbrAcctTypeCd === 'STANDARD' ? 'Standard Author Membership' : account?.mbrAcctTypeCd || 'Standard Membership'}
            </h3>
            <p className="text-xs font-sans text-slate-300 mt-1">
              Active member since {dateStr ? new Date(dateStr).toLocaleDateString() : 'Account Creation'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{account?.mbrAcctStatusCd || 'ACTIVE'}</span>
            </span>
          </div>
        </div>

        {/* Member ID Bar */}
        <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-sans text-slate-400">Account ID:</span>
            <span className="font-mono text-xs font-bold text-amber-300">{memberId || '—'}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Membership Perks */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <h4 className="font-serif font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Included Author Features</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {perks.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs font-sans text-slate-700 dark:text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{p}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
