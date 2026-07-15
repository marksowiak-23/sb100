/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Camera, Edit2, Lock } from 'lucide-react';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export default function LeftColumn({ activeSection, setActiveSection }: LeftColumnProps) {
  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'demographics', label: 'Demographics' },
    { id: 'family', label: 'Family', disabled: true },
    { id: 'residencies', label: 'Residencies', disabled: true },
    { id: 'achievements', label: 'Achievements', disabled: true },
    { id: 'health', label: 'Health', disabled: true },
    { id: 'hobbies', label: 'Hobbies', disabled: true }
  ];

  return (
    <div className="space-y-6 flex flex-col">
      {/* --- BRAND HEADER --- */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
          Story Book
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
              disabled={sec.disabled}
              onClick={() => setActiveSection(sec.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-serif transition-all duration-150 cursor-pointer ${
                sec.disabled
                  ? 'text-slate-300 cursor-not-allowed hover:bg-transparent'
                  : activeSection === sec.id
                  ? 'text-slate-850 font-bold underline underline-offset-2'
                  : 'text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2'
              }`}
            >
              <span>• {sec.label}</span>
              {sec.disabled && <Lock className="w-3 h-3 text-slate-300" />}
            </button>
          ))}
        </nav>

        {/* Edit Controls */}
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#EFECE7]">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-1">
            Edit Controls
          </div>
          <button
            onClick={() => alert('Editing Stories checklists...')}
            className="w-full text-left px-3 py-1 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2 transition-colors cursor-pointer"
          >
            • Stories
          </button>
          <button
            onClick={() => alert('Editing Biography metadata details...')}
            className="w-full text-left px-3 py-1 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2 transition-colors cursor-pointer"
          >
            • Biography
          </button>
        </div>
      </div>

      {/* --- PHOTO BOOK PANEL --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
          <Camera className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            Photo Book
          </h3>
        </div>

        <p className="text-[11px] text-slate-550 leading-relaxed font-serif">
          Collect and arrange photos that bring your story to life.
        </p>

        <button
          onClick={() => alert('Opening your Photo Book collection...')}
          className="w-full py-2 bg-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
        >
          Open Photo Book
        </button>
      </div>

    </div>
  );
}
