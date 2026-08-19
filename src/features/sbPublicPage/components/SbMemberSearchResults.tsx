/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info } from 'lucide-react';
import { MemberStory } from '../constants/memberData';
import MemberCard from './MemberCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMemberSearchResultsProps {
  members: MemberStory[];
  onClickReadStory?: (memberId: string) => void;
}

export default function SbMemberSearchResults({
  members,
  onClickReadStory
}: SbMemberSearchResultsProps) {
  return (
    <div className="space-y-5 relative">
      <div className="flex items-center justify-between border-b border-slate-100 pb-2">
        <h3 className="font-serif text-base font-bold text-slate-800">
          Recent Life Chapters
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          Showing {members.length} members
        </span>
      </div>

      {members.length === 0 ? (
        /* Empty Search results placeholder */
        <div className="bg-white border border-slate-150 border-dashed rounded-3xl py-16 px-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-slate-800 font-serif font-bold mb-1">No members match your search</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
            Try searching for different names, states (e.g. OR, LA), or tag keywords (e.g. Music, Family).
          </p>
        </div>
      ) : (
        /* Render filtered list feed */
        <div className="flex flex-col gap-6">
          {members.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onClickReadStory={() => onClickReadStory && onClickReadStory(member.id)}
            />
          ))}
        </div>
      )}
      <AdminComponentTag name="SbMemberSearchResults" />
    </div>
  );
}
