/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
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
import { taskApi, Topic, matchTopicByName, DEFAULT_TOPIC_LOOKUP } from '@/src/services/api';

export interface StoryTopic {
  id: string;
  label: string;
  topicId?: string;
  chIntentId?: string | null;
  isLocked?: boolean;
}

export type StorySection = StoryTopic;

export interface MbrStoryIndexPanelProps {
  activeSection?: string;
  activeTopic?: string;
  setActiveSection?: (topicId: string) => void;
  setActiveTopic?: (topicId: string) => void;
  onSelectTopic?: (topic: StoryTopic, rawTopic?: Topic) => void;
  topics?: StoryTopic[];
  sections?: StoryTopic[];
  lockedTopicIds?: string[];
  onEditStories?: () => void;
  onEditBiography?: () => void;
  showEditControls?: boolean;
}

export type SbStoryIndexPanelProps = MbrStoryIndexPanelProps;
export type mbrStoryIndexPanelProps = MbrStoryIndexPanelProps;

const DEFAULT_TOPICS: StoryTopic[] = [
  { id: 'Profile', label: 'Profile', topicId: DEFAULT_TOPIC_LOOKUP.profile.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.profile.chIntentId },
  { id: 'Family', label: 'Family', topicId: DEFAULT_TOPIC_LOOKUP.family.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.family.chIntentId },
  { id: 'Residencies', label: 'Residencies', topicId: DEFAULT_TOPIC_LOOKUP.residencies.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.residencies.chIntentId },
  { id: 'Achievements', label: 'Achievements', topicId: DEFAULT_TOPIC_LOOKUP.achievements.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.achievements.chIntentId },
  { id: 'Education', label: 'Education and Training', topicId: DEFAULT_TOPIC_LOOKUP.education.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.education.chIntentId },
  { id: 'Employment', label: 'Employment and Career', topicId: DEFAULT_TOPIC_LOOKUP.employment.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.employment.chIntentId },
  { id: 'Hobbies', label: 'Activities and Hobbies', topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  { id: 'Other', label: 'Other', topicId: DEFAULT_TOPIC_LOOKUP.other.topicId, chIntentId: DEFAULT_TOPIC_LOOKUP.other.chIntentId }
];

function getTopicIcon(id: string, label: string = '') {
  const normalized = (id + ' ' + label).toLowerCase();
  if (normalized.includes('biograph') || normalized.includes('bio') || normalized.includes('profile')) {
    return User;
  }
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
  if (normalized.includes('stori') || normalized.includes('story')) {
    return FileText;
  }
  return Sparkles;
}

export default function MbrStoryIndexPanel({
  activeSection,
  activeTopic,
  setActiveSection,
  setActiveTopic,
  onSelectTopic,
  topics,
  sections,
  lockedTopicIds = [],
  onEditStories,
  onEditBiography,
  showEditControls = true
}: MbrStoryIndexPanelProps) {
  const [dbTopics, setDbTopics] = useState<Topic[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTopics = async () => {
      try {
        const fetched = await taskApi.getTopics();
        if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
          setDbTopics(fetched);
        }
      } catch (err) {
        console.warn("Could not read topic table in MbrStoryIndexPanel:", err);
      }
    };
    fetchTopics();
    return () => { isMounted = false; };
  }, []);

  const currentActive = activeTopic || activeSection || 'Profile';
  const rawList = topics || sections || DEFAULT_TOPICS;

  // Match topic names to DB topics and enrich with topicId and chIntentId
  const list: StoryTopic[] = rawList.map((item) => {
    const matched = matchTopicByName(item.id || item.label, dbTopics);
    return {
      ...item,
      label: item.label || matched?.topicFullName || matched?.topicName || item.id,
      topicId: item.topicId || matched?.topicId,
      chIntentId: item.chIntentId !== undefined ? item.chIntentId : (matched?.chIntentId ?? null)
    };
  });

  const handleSelect = (item: StoryTopic) => {
    const rawMatched = matchTopicByName(item.id, dbTopics);
    if (setActiveTopic) setActiveTopic(item.id);
    if (setActiveSection) setActiveSection(item.id);
    if (onSelectTopic) onSelectTopic(item, rawMatched);
  };

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
              onClick={() => !isItemLocked && handleSelect(item)}
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

      <AdminComponentTag name="mbrStoryIndexPanel" />
    </div>
  );
}

export { MbrStoryIndexPanel, MbrStoryIndexPanel as mbrStoryIndexPanel, MbrStoryIndexPanel as SbStoryIndexPanel };


