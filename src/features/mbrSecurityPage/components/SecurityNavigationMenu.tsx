/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  MailCheck,
  Laptop,
  KeyRound,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Check,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type SecuritySubTab = 'username-email' | 'trusted-devices' | 'password';

interface SecurityNavigationMenuProps {
  activeSubTab: SecuritySubTab;
  onSelectTab: (tab: SecuritySubTab) => void;
}

const MENU_ITEMS: Array<{
  id: SecuritySubTab;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  activeBox: string;
  activeIconBg: string;
  activeCheck: string;
}> = [
  {
    id: 'username-email',
    title: 'My Username (Email)',
    subtitle: 'Email Verification & Two-Factor MFA',
    icon: MailCheck,
    activeBox: 'bg-blue-50/90 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs',
    activeIconBg: 'bg-[#13547A] text-white shadow-xs',
    activeCheck: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'trusted-devices',
    title: 'My Trusted Devices',
    subtitle: 'Recognized Browsers & Revocation',
    icon: Laptop,
    activeBox: 'bg-emerald-50/90 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shadow-xs',
    activeIconBg: 'bg-emerald-600 text-white shadow-xs',
    activeCheck: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'password',
    title: 'My Password',
    subtitle: 'Update Your Account Password',
    icon: KeyRound,
    activeBox: 'bg-indigo-50/90 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200/80 dark:border-indigo-800 shadow-xs',
    activeIconBg: 'bg-indigo-600 text-white shadow-xs',
    activeCheck: 'text-indigo-600 dark:text-indigo-400',
  },
];

export default function SecurityNavigationMenu({
  activeSubTab,
  onSelectTab,
}: SecurityNavigationMenuProps) {
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

  const activeItem = MENU_ITEMS.find((m) => m.id === activeSubTab) || MENU_ITEMS[0];
  const ActiveIcon = activeItem.icon;

  const handleSelect = (tab: SecuritySubTab) => {
    onSelectTab(tab);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full">
      <AdminComponentTag name="SecurityNavigationMenu" />

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
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span>Menu</span>
              {isOpen ? <ChevronUp className="w-3.5 h-3.5 opacity-70" /> : <ChevronDown className="w-3.5 h-3.5 opacity-70" />}
            </button>

            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
              <ActiveIcon className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
              <span className="text-xs font-serif font-semibold text-slate-800 dark:text-slate-200 truncate">
                {activeItem.title}
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
                  My Security
                </div>
                {MENU_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                        isActive
                          ? `${item.activeBox} font-bold`
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${isActive ? item.activeIconBg : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold leading-tight">{item.title}</div>
                          <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans leading-tight">
                            {item.subtitle}
                          </div>
                        </div>
                      </div>
                      {isActive && <Check className={`w-4 h-4 shrink-0 ml-2 ${item.activeCheck}`} />}
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
            <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>My Security</span>
          </h2>
        </div>

        <nav className="space-y-1.5" aria-label="Security Navigation">
          {MENU_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeSubTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
                  isActive
                    ? item.activeBox
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isActive ? item.activeIconBg : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">{item.title}</div>
                    <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">
                      {item.subtitle}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
