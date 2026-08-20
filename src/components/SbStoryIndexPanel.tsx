/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StorySection {
  id: string;
  label: string;
}

interface SbStoryIndexPanelProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  sections?: StorySection[];
  onEditStories?: () => void;
  onEditBiography?: () => void;
  showEditControls?: boolean;
}

const DEFAULT_SECTIONS: StorySection[] = [
  { id: 'family', label: 'Family' },
  { id: 'residencies', label: 'Residencies' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'education', label: 'Education and Training' },
  { id: 'employment', label: 'Employment and Career' },
  { id: 'hobbies', label: 'Activities and Hobbies' }
];

export default function SbStoryIndexPanel({
  activeSection,
  setActiveSection,
  sections = DEFAULT_SECTIONS,
  onEditStories,
  onEditBiography,
  showEditControls = true
}: SbStoryIndexPanelProps) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
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
            type="button"
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

      {/* Edit Controls */}
      {showEditControls && (
        <div className="flex flex-col gap-1.5 pt-3 border-t border-[#EFECE7]">
          <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest pb-1">
            Edit Controls
          </div>
          <button
            type="button"
            onClick={onEditStories || (() => alert('Editing Stories checklists...'))}
            className="w-full text-left px-3 py-1 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2 transition-colors cursor-pointer"
          >
            • Stories
          </button>
          <button
            type="button"
            onClick={onEditBiography || (() => alert('Editing Biography metadata details...'))}
            className="w-full text-left px-3 py-1 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2 transition-colors cursor-pointer"
          >
            • Biography
          </button>
        </div>
      )}

      <AdminComponentTag name="SbStoryIndexPanel" />
    </div>
  );
}
