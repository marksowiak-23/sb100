/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { BookOpen, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { MemberStory } from '../constants/memberData';

interface MemberCardProps {
  member: MemberStory;
}

const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
  // Get initials for avatar
  const initials = member.name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, boxShadow: '0 12px 30px rgba(0, 0, 0, 0.04)' }}
      className="bg-white border border-slate-100 rounded-3xl p-6 transition-all duration-300 flex flex-col gap-5"
    >
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Thumbnail Image Avatar with Initials Fallback */}
          <div className="relative w-12 h-12 shrink-0">
            {member.avatarUrl && (
              <img
                src={member.avatarUrl}
                alt={member.name}
                className="w-full h-full rounded-2xl object-cover border border-[#EFECE7] shadow-sm"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = document.getElementById(`avatar-fallback-${member.id}`);
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
            )}
            <div
              id={`avatar-fallback-${member.id}`}
              style={{ display: member.avatarUrl ? 'none' : 'flex' }}
              className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-serif text-slate-700 font-bold text-lg"
            >
              {initials}
            </div>
          </div>
          <div>
            <h4 className="font-serif text-lg font-bold text-slate-800 tracking-tight">
              {member.name}
            </h4>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{member.location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters count & Joined info banner */}
      <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 tracking-wider uppercase bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50">
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

      {/* Excerpt text */}
      <p className="text-slate-500 font-serif leading-relaxed text-sm italic relative pl-4 border-l-2 border-slate-200">
        "{member.excerpt}"
      </p>

      {/* Footer Tags & Actions */}
      <div className="mt-2 pt-4 border-t border-slate-50 flex flex-wrap items-center justify-between gap-3">
        {/* Tags list */}
        <div className="flex flex-wrap gap-1.5">
          {member.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Read story button link */}
        <button
          onClick={() => alert(`Opening complete memoirs of ${member.name}...`)}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors"
        >
          <span>Read story</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default MemberCard;
