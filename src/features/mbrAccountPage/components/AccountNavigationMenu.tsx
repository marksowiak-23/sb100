/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Coins, 
  FileText, 
  Layers, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  Check 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type AccountSubTab = 'overview' | 'ledger' | 'rates' | 'plan';

interface AccountNavigationMenuProps {
  activeSubTab: AccountSubTab;
  onSelectTab: (tab: AccountSubTab) => void;
  activityCount?: number;
}

export default function AccountNavigationMenu({
  activeSubTab,
  onSelectTab,
  activityCount = 0
}: AccountNavigationMenuProps) {
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
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const navItems: { id: AccountSubTab; label: string; icon: React.ElementType; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview & Top-Up', icon: Coins },
    { id: 'ledger', label: 'Activity Ledger', icon: FileText, badge: activityCount > 0 ? activityCount : undefined },
    { id: 'rates', label: 'Platform Event Rates', icon: Layers },
    { id: 'plan', label: 'Plan & Membership', icon: ShieldCheck }
  ];

  const activeItem = navItems.find((item) => item.id === activeSubTab) || navItems[0];
  const ActiveIcon = activeItem.icon;

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
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                isOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <ActiveIcon className="w-3.5 h-3.5 shrink-0" />
              <span>{activeItem.label}</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden mt-3 pt-3 border-t border-slate-100 dark:border-slate-800"
              >
                <div className="flex flex-col gap-1.5">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isSelected = activeSubTab === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelect(item.id)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-serif font-bold transition-all text-left cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white dark:text-slate-900' : 'text-slate-400'}`} />
                          <span>{item.label}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-white dark:text-slate-900" />}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DESKTOP VIEW: Sidebar Vertical Navigation (>= lg)                     */}
      {/* ========================================================================= */}
      <nav className="hidden lg:flex flex-col gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-3 shadow-xs">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isSelected = activeSubTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl text-xs font-serif font-bold transition-all text-left cursor-pointer group ${
                isSelected
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-md shadow-slate-900/10'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                  isSelected ? 'text-white dark:text-slate-900' : 'text-slate-400'
                }`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                  isSelected
                    ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
