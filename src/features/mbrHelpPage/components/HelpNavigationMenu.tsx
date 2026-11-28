/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Compass,
  Feather,
  BookOpen,
  Users,
  Coins,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { HELP_CATEGORIES, HelpCategoryId } from '../constants/helpContent';

const CATEGORY_ICONS: Record<HelpCategoryId, React.ComponentType<{ className?: string }>> = {
  'getting-started': Compass,
  'stories-authoring': Feather,
  'books-audio': BookOpen,
  'connections-messaging': Users,
  'account-credits': Coins,
  'privacy-security': ShieldCheck,
};

interface HelpNavigationMenuProps {
  activeCategory: HelpCategoryId;
  onSelectCategory: (cat: HelpCategoryId) => void;
  countsByCategory: Record<HelpCategoryId, number>;
}

export default function HelpNavigationMenu({
  activeCategory,
  onSelectCategory,
  countsByCategory,
}: HelpNavigationMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const activeMeta = HELP_CATEGORIES.find((c) => c.id === activeCategory) || HELP_CATEGORIES[0];
  const ActiveIcon = CATEGORY_ICONS[activeMeta.id];

  const handleSelect = (cat: HelpCategoryId) => {
    onSelectCategory(cat);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <AdminComponentTag name="HelpNavigationMenu" />

      {/* Mobile Collapsible Dropdown (< lg) */}
      <div ref={dropdownRef} className="block lg:hidden w-full relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-xs">
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
            >
              <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Topics</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
              <ActiveIcon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="text-xs font-serif font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeMeta.title}
              </span>
            </div>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1.5"
              >
                <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-0.5">
                  Help Topics
                </div>
                {HELP_CATEGORIES.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.id];
                  const isActive = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => handleSelect(cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                        isActive
                          ? `${cat.activeBox} font-bold`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? cat.activeIconBg : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold leading-tight truncate">{cat.title}</div>
                          <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans leading-tight truncate">
                            {cat.subtitle}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className={`w-4 h-4 shrink-0 ml-2 ${cat.activeCheck}`} />}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Desktop Sidebar Navigation (>= lg) */}
      <div className="hidden lg:block relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="pb-4 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Help Topics</span>
          </h2>
        </div>

        <nav className="space-y-1.5" aria-label="Help Topics Navigation">
          {HELP_CATEGORIES.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.id];
            const isActive = activeCategory === cat.id;
            const count = countsByCategory[cat.id] || 0;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? cat.activeBox
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors ${isActive ? cat.activeIconBg : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold font-serif text-slate-900 dark:text-white truncate">{cat.title}</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans truncate">
                      {cat.subtitle}
                    </div>
                  </div>
                </div>
                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  {count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
