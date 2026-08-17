/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users, BookOpen, Share2, Globe } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbCommunityStatsCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4 relative">
      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
        Community Stats
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Members */}
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
          <Users className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-slate-800 block mt-1">48,200+</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Members</span>
        </div>

        {/* Chapters */}
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
          <BookOpen className="w-4 h-4 text-emerald-500" />
          <span className="text-sm font-bold text-slate-800 block mt-1">312,000+</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Chapters</span>
        </div>

        {/* Stories shared */}
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
          <Share2 className="w-4 h-4 text-indigo-500" />
          <span className="text-sm font-bold text-slate-800 block mt-1">1.4M+</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Shared</span>
        </div>

        {/* Countries */}
        <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
          <Globe className="w-4 h-4 text-amber-500" />
          <span className="text-sm font-bold text-slate-800 block mt-1">94</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Countries</span>
        </div>
      </div>

      <AdminComponentTag name="SbCommunityStatsCard" />
    </div>
  );
}
