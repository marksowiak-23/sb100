/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  BookOpen,
  Mic,
  Image as ImageIcon,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type AccountSubTab = 'story-credits' | 'voice-credits' | 'image-credits';

interface AccountNavigationMenuProps {
  activeSubTab: AccountSubTab;
  onSelectTab: (tab: AccountSubTab) => void;
}

export default function AccountNavigationMenu({
  activeSubTab,
  onSelectTab
}: AccountNavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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

  const activeTitle =
    activeSubTab === 'story-credits'
      ? 'My Story Credits'
      : activeSubTab === 'voice-credits'
      ? 'My Voice Credits'
      : 'My Image Credits';
  const ActiveIcon =
    activeSubTab === 'story-credits'
      ? BookOpen
      : activeSubTab === 'voice-credits'
      ? Mic
      : ImageIcon;

  const handleSelect = (tab: AccountSubTab) => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <AdminComponentTag name="AccountNavigationMenu.tsx" />

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW: Collapsible Dropdown Navigation (< lg)                   */}
      {/* ========================================================================= */}
      <div ref={dropdownRef} className="block lg:hidden w-full relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
          {/* Mobile Header & Dropdown Trigger Button */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                isOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-expanded={isOpen}
              aria-label="Toggle Account Navigation Menu"
            >
              <CreditCard className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Menu</span>
              {isOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              )}
            </button>

            {/* Current Active Selection Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
              <ActiveIcon
                className={`w-3.5 h-3.5 shrink-0 ${
                  activeSubTab === 'voice-credits'
                    ? 'text-purple-600 dark:text-purple-400'
                    : activeSubTab === 'image-credits'
                    ? 'text-teal-600 dark:text-teal-400'
                    : 'text-[#13547A] dark:text-sky-400'
                }`}
              />
              <span className="text-xs font-serif font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeTitle}
              </span>
            </div>
          </div>

          {/* Collapsible Dropdown Options */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1.5"
              >
                <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 py-0.5">
                  My Account
                </div>

                {/* Option 1: My Story Credits */}
                <button
                  type="button"
                  onClick={() => handleSelect('story-credits')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                    activeSubTab === 'story-credits'
                      ? 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-bold border border-blue-200/80 dark:border-blue-800 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeSubTab === 'story-credits'
                          ? 'bg-[#13547A] text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">My Story Credits</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans leading-tight">
                        Story Writing, PDF &amp; Book Credits
                      </div>
                    </div>
                  </div>
                  {activeSubTab === 'story-credits' && (
                    <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />
                  )}
                </button>

                {/* Option 2: My Voice Credits */}
                <button
                  type="button"
                  onClick={() => handleSelect('voice-credits')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                    activeSubTab === 'voice-credits'
                      ? 'bg-purple-50/90 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 font-bold border border-purple-200/80 dark:border-purple-800 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeSubTab === 'voice-credits'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">My Voice Credits</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans leading-tight">
                        AI Voice Narration Credits
                      </div>
                    </div>
                  </div>
                  {activeSubTab === 'voice-credits' && (
                    <Check className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0 ml-2" />
                  )}
                </button>

                {/* Option 3: My Image Credits */}
                <button
                  type="button"
                  onClick={() => handleSelect('image-credits')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                    activeSubTab === 'image-credits'
                      ? 'bg-teal-50/90 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 font-bold border border-teal-200/80 dark:border-teal-800 shadow-xs'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        activeSubTab === 'image-credits'
                          ? 'bg-teal-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                      }`}
                    >
                      <ImageIcon className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-xs font-bold leading-tight">My Image Credits</div>
                      <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans leading-tight">
                        AI Story Photo &amp; Animation Credits
                      </div>
                    </div>
                  </div>
                  {activeSubTab === 'image-credits' && (
                    <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />
                  )}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW: Sidebar Navigation Panel (>= lg)                        */}
      {/* ========================================================================= */}
      <div className="hidden lg:block relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        {/* Menu Header */}
        <div className="pb-4 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>My Account</span>
          </h2>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1.5" aria-label="Account Navigation">
          {/* Menu Item 1: My Story Credits */}
          <button
            type="button"
            onClick={() => onSelectTab('story-credits')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
              activeSubTab === 'story-credits'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeSubTab === 'story-credits'
                    ? 'bg-[#13547A] text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">My Story Credits</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">
                  Story Writing, PDF &amp; Book Credits
                </div>
              </div>
            </div>
          </button>

          {/* Menu Item 2: My Voice Credits */}
          <button
            type="button"
            onClick={() => onSelectTab('voice-credits')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
              activeSubTab === 'voice-credits'
                ? 'bg-purple-50/80 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200/80 dark:border-purple-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeSubTab === 'voice-credits'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">My Voice Credits</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">
                  AI Voice Narration Credits
                </div>
              </div>
            </div>
          </button>

          {/* Menu Item 3: My Image Credits */}
          <button
            type="button"
            onClick={() => onSelectTab('image-credits')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
              activeSubTab === 'image-credits'
                ? 'bg-teal-50/80 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200/80 dark:border-teal-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeSubTab === 'image-credits'
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">My Image Credits</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">
                  AI Story Photo &amp; Animation Credits
                </div>
              </div>
            </div>
          </button>
        </nav>
      </div>
    </div>
  );
}
