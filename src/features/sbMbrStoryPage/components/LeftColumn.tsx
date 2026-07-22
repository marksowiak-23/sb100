/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Camera, Edit3, Lock } from 'lucide-react';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  memberName: string;
}

export default function LeftColumn({
  activeSection,
  setActiveSection,
  memberName
}: LeftColumnProps) {
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'family', label: 'Family' },
    { id: 'residencies', label: 'Residencies' },
    { id: 'achievements', label: 'Achievements' },
    { id: 'education', label: 'Education and Training' },
    { id: 'employment', label: 'Employment and Career' },
    { id: 'hobbies', label: 'Activities and Hobbies' }
  ];

  return (
    <div className="space-y-6 flex flex-col">
      {/* --- BRAND HEADER --- */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
          Storybook
        </h1>
        <p className="font-serif text-xs italic text-slate-500">
          Where every life becomes literature
        </p>
      </div>

      {/* --- STORY INDEX PANEL --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
          <BookOpen className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            Story Index
          </h3>
        </div>

        {/* Section List */}
        <nav className="flex flex-col gap-1.5">
          {sections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-serif transition-all duration-150 cursor-pointer ${
                activeSection === sec.id
                  ? 'text-slate-850 font-bold underline underline-offset-2 bg-slate-100/60'
                  : 'text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2'
              }`}
            >
              <span>{sec.label}</span>
            </button>
          ))}
        </nav>

        {/* Edit Actions buttons */}
        <div className="flex flex-col gap-2 pt-2 border-t border-[#EFECE7]">
          <button
            onClick={() => alert(`Simulating Edit Stories interface for ${memberName}...`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-[#EFECE7] rounded-xl text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Stories</span>
          </button>
          <button
            onClick={() => alert(`Simulating Edit Biography checklist for ${memberName}...`)}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-slate-50 hover:bg-slate-100 border border-[#EFECE7] rounded-xl text-[10px] font-bold text-slate-700 transition-colors cursor-pointer"
          >
            <Edit3 className="w-3 h-3" />
            <span>Edit Biography</span>
          </button>
        </div>
      </div>

      {/* --- PHOTO BOOK CALLOUT --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
          <Camera className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            Photo Book
          </h3>
        </div>

        <p className="text-[11px] text-slate-550 leading-relaxed font-serif">
          Collect and arrange photos that bring your story to life, from early childhood to recent milestones.
        </p>

        <button
          onClick={() => alert(`Opening Photo Book slider for ${memberName}...`)}
          className="w-full text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
        >
          Open Photo Book
        </button>
      </div>

    </div>
  );
}
