/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, Loader2 } from 'lucide-react';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrSearchResultsProps {
  searchQuery: string;
  members: any[];
  loading?: boolean;
  onClickReadStory?: (memberId: string) => void;
}

export default function SbMbrSearchResults({
  searchQuery,
  members,
  loading = false,
  onClickReadStory
}: SbMbrSearchResultsProps) {
  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
        <h3 className="font-serif text-sm font-bold text-slate-850">
          {searchQuery.trim() ? 'Search Results' : 'Recent Members'}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {loading ? 'Searching...' : `Showing ${members.length} member${members.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {loading ? (
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-12 px-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-serif">Loading members...</span>
        </div>
      ) : members.length === 0 ? (
        /* Empty Search results placeholder */
        <div className="bg-[#FDFCFB] border border-[#EFECE7] border-dashed rounded-3xl py-12 px-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EFECE7] text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-slate-800 font-serif font-bold mb-1">No members match your search</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
            Try searching for different names (e.g. Eleanor) or locations (e.g. Portland, OR).
          </p>
        </div>
      ) : (
        /* Render member profile cards using SbMbrProfilePanel */
        <div className="flex flex-col gap-6">
          {members.map((member) => (
            <SbMbrProfilePanel
              key={member.mbrId || member.id}
              profile={member}
              isSandbox={false}
              onClickReadStory={onClickReadStory}
            />
          ))}
        </div>
      )}

      <AdminComponentTag name="SbMbrSearchResults" />
    </div>
  );
}
