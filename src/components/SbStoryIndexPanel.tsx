/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Lock } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StoryTopic {
  id: string;
  label: string;
  isLocked?: boolean;
}

export type StorySection = StoryTopic;

interface SbStoryIndexPanelProps {
  activeSection?: string;
  activeTopic?: string;
  setActiveSection?: (topicId: string) => void;
  setActiveTopic?: (topicId: string) => void;
  topics?: StoryTopic[];
  sections?: StoryTopic[];
  lockedTopicIds?: string[];
  onEditStories?: () => void;
  onEditBiography?: () => void;
  showEditControls?: boolean;
}

const DEFAULT_TOPICS: StoryTopic[] = [
  { id: 'Family', label: 'Family' },
  { id: 'Residencies', label: 'Residencies' },
  { id: 'Achievements', label: 'Achievements' },
  { id: 'Education', label: 'Education and Training' },
  { id: 'Employment', label: 'Employment and Career' },
  { id: 'Hobbies', label: 'Activities and Hobbies' }
];

export default function SbStoryIndexPanel({
  activeSection,
  activeTopic,
  setActiveSection,
  setActiveTopic,
  topics,
  sections,
  lockedTopicIds = [],
  onEditStories,
  onEditBiography,
  showEditControls = true
}: SbStoryIndexPanelProps) {
  const currentActive = activeTopic || activeSection || 'Family';
  const handleSelect = (topicId: string) => {
    if (setActiveTopic) setActiveTopic(topicId);
    if (setActiveSection) setActiveSection(topicId);
  };
  const list = topics || sections || DEFAULT_TOPICS;

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <BookOpen className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          Story Index
        </h3>
      </div>

      {/* Topic List */}
      <nav className="flex flex-col gap-1.5">
        {list.map((item) => {
          const isActive = currentActive?.toLowerCase() === item.id.toLowerCase();
          const isItemLocked = !!(
            item.isLocked ||
            (lockedTopicIds && lockedTopicIds.some(lid => lid.toLowerCase() === item.id.toLowerCase()))
          );

          return (
            <button
              key={item.id}
              type="button"
              disabled={isItemLocked}
              onClick={() => !isItemLocked && handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left text-xs font-serif transition-all duration-150 ${
                isItemLocked
                  ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 bg-slate-50/50'
                  : isActive
                  ? 'text-slate-850 font-bold underline underline-offset-2 bg-slate-100/60 cursor-pointer'
                  : 'text-slate-650 hover:text-slate-850 hover:underline hover:underline-offset-2 cursor-pointer'
              }`}
            >
              <span className="truncate">{item.label}</span>
              {isItemLocked && (
                <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 ml-2" />
              )}
            </button>
          );
        })}
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

