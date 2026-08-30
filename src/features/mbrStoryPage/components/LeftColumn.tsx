/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera, Lock } from 'lucide-react';
import MbrStoryIndexPanel from '@/src/components/mbrStoryIndexPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  memberName: string;
  lockedTopicIds?: string[];
  onClickBack?: () => void;
}

export default function LeftColumn({
  activeSection,
  setActiveSection,
  memberName,
  lockedTopicIds = []
}: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
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
      <MbrStoryIndexPanel
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        lockedTopicIds={lockedTopicIds}
        showEditControls={false}
      />

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
      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
