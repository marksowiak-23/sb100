/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  User,
  Users, 
  Home, 
  Trophy, 
  GraduationCap, 
  Briefcase, 
  Palette,
  Check,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StoryTopicItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const STORY_INDEX_TOPICS: StoryTopicItem[] = [
  { id: 'Profile', label: 'Profile', icon: User },
  { id: 'Family', label: 'Family', icon: Users },
  { id: 'Residencies', label: 'Residencies', icon: Home },
  { id: 'Achievements', label: 'Achievements', icon: Trophy },
  { id: 'Education', label: 'Education and Training', icon: GraduationCap },
  { id: 'Employment', label: 'Employment and Career', icon: Briefcase },
  { id: 'Hobbies', label: 'Activities and Hobbies', icon: Palette }
];

interface StoryMobileMenuBarProps {
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
  lockedTopicIds?: string[];
  className?: string;
}

export default function StoryMobileMenuBar({
  activeSection,
  setActiveSection,
  lockedTopicIds = [],
  className = ''
}: StoryMobileMenuBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeSecStr = typeof activeSection === 'string' ? activeSection : '';
  const currentTopic = STORY_INDEX_TOPICS.find(
    (t) => t.id.toLowerCase() === activeSecStr.toLowerCase()
  ) || STORY_INDEX_TOPICS[0];

  const CurrentIcon = currentTopic?.icon || User;

  const handleSelectTopic = (topicId: string, isLocked: boolean) => {
    if (isLocked) return;
    setActiveSection(topicId);
    setIsOpen(false);
  };

  const safeLocked = Array.isArray(lockedTopicIds) ? lockedTopicIds : [];

  return (
    <div ref={menuRef} className={`block lg:hidden w-full relative z-30 ${className}`}>
      {/* Mobile Menu Bar Container */}
      <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden group">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center justify-between gap-2">
          {/* Index Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              isOpen
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-expanded={isOpen}
            aria-label="Story Index Menu"
          >
            <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Index</span>
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            )}
          </button>

          {/* Active Section Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
            <CurrentIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-none">
              {currentTopic.label}
            </span>
          </div>
        </div>

        {/* Dropdown Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-[#EFECE7] dark:border-slate-800 pt-2"
            >
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-1">
                Story Index Topics
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1">
                {STORY_INDEX_TOPICS.map((topic) => {
                  const isActive = topic.id.toLowerCase() === activeSecStr.toLowerCase();
                  const isLocked = safeLocked.some(
                    (lid) => typeof lid === 'string' && lid.toLowerCase() === topic.id.toLowerCase()
                  );
                  const TopicIcon = topic.icon;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      disabled={isLocked}
                      onClick={() => handleSelectTopic(topic.id, isLocked)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all ${
                        isLocked
                          ? 'text-slate-400 dark:text-slate-600 cursor-not-allowed opacity-60 bg-slate-50/50 dark:bg-slate-800/50'
                          : isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs cursor-pointer'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <TopicIcon className={`w-4 h-4 shrink-0 ${
                          isLocked
                            ? 'text-slate-400 dark:text-slate-600'
                            : isActive
                            ? 'text-amber-400 dark:text-amber-600'
                            : 'text-slate-400 dark:text-slate-500'
                        }`} />
                        <span className="truncate">{topic.label}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        {isLocked && (
                          <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600" />
                        )}
                        {isActive && !isLocked && (
                          <Check className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminComponentTag name="StoryMobileMenuBar" />
    </div>
  );
}

export { StoryMobileMenuBar, StoryMobileMenuBar as storyMobileMenuBar };
