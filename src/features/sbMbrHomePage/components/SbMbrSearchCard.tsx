/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, HelpCircle, Users } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrSearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

export default function SbMbrSearchCard({
  searchQuery,
  setSearchQuery
}: SbMbrSearchCardProps) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-wider">
            Find a Member
          </h3>
        </div>
        <HelpCircle className="w-4 h-4 text-slate-350 cursor-pointer hover:text-slate-400 transition-colors" title="Search by name or location" />
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or location..."
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-xs md:text-sm rounded-2xl border border-[#EFECE7] outline-none py-3.5 pl-11 pr-4 transition-all duration-150 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="submit"
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-2xl border border-blue-600 cursor-pointer shadow-sm transition-all duration-150 shrink-0"
        >
          Search
        </button>
      </form>

      <AdminComponentTag name="SbMbrSearchCard" />
    </div>
  );
}
