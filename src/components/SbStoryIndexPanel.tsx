/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Lock, 
  Users, 
  Home, 
  Trophy, 
  GraduationCap, 
  Briefcase, 
  Palette,
  FileText,
  User,
  Sparkles
} from 'lucide-react';
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

function getTopicIcon(id: string, label: string = '') {
  const normalized = (id + ' ' + label).toLowerCase();
  if (normalized.includes('family') || normalized.includes('famly')) {
    return Users;
  }
  if (normalized.includes('residen') || normalized.includes('home') || normalized.includes('house')) {
    return Home;
  }
  if (normalized.includes('achieve') || normalized.includes('award') || normalized.includes('trophy')) {
    return Trophy;
  }
  if (normalized.includes('educat') || normalized.includes('train') || normalized.includes('school') || normalized.includes('college')) {
    return GraduationCap;
  }
  if (normalized.includes('employ') || normalized.includes('career') || normalized.includes('work') || normalized.includes('job')) {
    return Briefcase;
  }
  if (normalized.includes('activ') || normalized.includes('hobbi') || normalized.includes('hobby') || normalized.includes('interest')) {
    return Palette;
  }
  if (normalized.includes('biograph') || normalized.includes('bio') || normalized.includes('profile')) {
    return User;
  }
  if (normalized.includes('stori') || normalized.includes('story')) {
    return FileText;
  }
  return Sparkles;
}

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
      <nav className="flex flex-col gap-1">
        {list.map((item) => {
          const isActive = currentActive?.toLowerCase() === item.id.toLowerCase();
          const isItemLocked = !!(
            item.isLocked ||
            (lockedTopicIds && lockedTopicIds.some(lid => lid.toLowerCase() === item.id.toLowerCase()))
          );
          const IconComponent = getTopicIcon(item.id, item.label);

          return (
            <button
              key={item.id}
              type="button"
              disabled={isItemLocked}
              onClick={() => !isItemLocked && handleSelect(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-serif transition-all duration-150 ${
                isItemLocked
                  ? 'text-slate-400 dark:text-slate-500 cursor-not-allowed opacity-60 bg-slate-50/50'
                  : isActive
                  ? 'text-slate-900 font-bold bg-slate-100/90 cursor-pointer shadow-xs'
                  : 'text-slate-650 hover:text-slate-850 hover:bg-slate-50/80 cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <IconComponent className={`w-3.5 h-3.5 shrink-0 ${
                  isItemLocked 
                    ? 'text-slate-400' 
                    : isActive 
                    ? 'text-slate-800' 
                    : 'text-slate-400'
                }`} />
                <span className="truncate">{item.label}</span>
              </div>
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
            className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Stories</span>
          </button>
          <button
            type="button"
            onClick={onEditBiography || (() => alert('Editing Biography metadata details...'))}
            className="w-full flex items-center gap-2 text-left px-3 py-1.5 rounded-lg text-xs font-serif text-slate-650 hover:text-slate-850 hover:bg-slate-50/80 transition-colors cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Biography</span>
          </button>
        </div>
      )}

      <AdminComponentTag name="SbStoryIndexPanel" />
    </div>
  );
}
