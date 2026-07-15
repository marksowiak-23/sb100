/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, BookOpen, Calendar } from 'lucide-react';
import { MemberStory } from '@/src/features/sbPublicPage/constants/memberData';

interface SbMbrProfilePanelProps {
  member: MemberStory;
}

export default function SbMbrProfilePanel({ member }: SbMbrProfilePanelProps) {
  // Initials for avatar fallback
  const initials = member.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar image */}
          <div className="relative w-14 h-14 shrink-0">
            {member.avatarUrl ? (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-full h-full rounded-2xl object-cover border border-[#EFECE7] shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-serif text-slate-700 font-bold text-xl">
                {initials}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-serif text-xl font-black text-slate-800 tracking-tight leading-tight">
              {member.name}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{member.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats metadata */}
      <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 tracking-wider uppercase bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 w-fit">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>{member.chaptersCount} chapters</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-250"></div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Member since {member.joinedDate}</span>
        </div>
      </div>

      {/* Intro quote excerpt */}
      <p className="text-slate-500 font-serif leading-relaxed text-sm italic relative pl-4 border-l-2 border-slate-250">
        "{member.excerpt}"
      </p>

      {/* Category tags */}
      <div className="flex flex-wrap gap-1.5 pt-1 border-t border-[#EFECE7]">
        {member.tags.map((tag) => (
          <span
            key={tag}
            className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
