/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Search, Info, HelpCircle, Users } from 'lucide-react';
import { MemberStory } from '@/src/features/sbPublicPage/constants/memberData';
import MemberCard from '@/src/features/sbPublicPage/components/MemberCard';

interface CenterColumnProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  members: MemberStory[];
  onClickReadStory?: (memberId: string) => void;
}

export default function CenterColumn({
  searchQuery,
  setSearchQuery,
  members,
  onClickReadStory
}: CenterColumnProps) {
  return (
    <div className="space-y-6 flex flex-col">
      
      {/* --- HERO DESCRIPTION BANNER --- */}
      <div className="space-y-3">
        <h2 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-tight">
          Welcome to your Storybook Portal
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xl font-serif">
          Manage your connections, update your biography status checklist, or search for other members and read their public life chapters.
        </p>
      </div>

      {/* --- SEARCH BAR --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-slate-400 shrink-0" />
            <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-wider">
              Find a Member
            </h3>
          </div>
          <HelpCircle className="w-4 h-4 text-slate-350 cursor-pointer hover:text-slate-400 transition-colors" title="Search by name, location, or tag" />
        </div>

        <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, location, tags..."
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
      </div>

      {/* --- STORIES FEED --- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
          <h3 className="font-serif text-sm font-bold text-slate-850">
            Recent Life Chapters
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Showing {members.length} members
          </span>
        </div>

        {members.length === 0 ? (
          /* Empty Search results placeholder */
          <div className="bg-[#FDFCFB] border border-[#EFECE7] border-dashed rounded-3xl py-12 px-6 text-center shadow-sm">
            <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EFECE7] text-slate-400">
              <Info className="w-6 h-6" />
            </div>
            <h4 className="text-slate-800 font-serif font-bold mb-1">No members match your search</h4>
            <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
              Try searching for different names, states, or tag keywords.
            </p>
          </div>
        ) : (
          /* Render filtered list feed */
          <div className="flex flex-col gap-5">
            {members.map((member) => (
              <MemberCard
                key={member.id}
                member={member}
                onClickReadStory={() => onClickReadStory && onClickReadStory(member.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
