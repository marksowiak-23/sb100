/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { Users, Mail, Send, ChevronDown, ChevronUp, Check, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ConnectionSection } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface ConnectionMobileMenuBarProps {
  activeSection: ConnectionSection;
  onSelectSection: (section: ConnectionSection) => void;
  connectionsCount: number;
  invitationsCount: number;
  requestsCount: number;
  hasUnsavedInvitations?: boolean;
  hasUnsavedRequests?: boolean;
  className?: string;
}

interface ConnectionMenuItem {
  id: ConnectionSection;
  label: string;
  icon: React.ElementType;
  count: number;
  hasUnsaved?: boolean;
  colorClass: string;
}

export default function ConnectionMobileMenuBar({
  activeSection,
  onSelectSection,
  connectionsCount,
  invitationsCount,
  requestsCount,
  hasUnsavedInvitations = false,
  hasUnsavedRequests = false,
  className = ''
}: ConnectionMobileMenuBarProps) {
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

  const menuItems: ConnectionMenuItem[] = [
    {
      id: 'connections',
      label: 'My Connections',
      icon: Users,
      count: connectionsCount,
      colorClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'invitations',
      label: 'My Invitations',
      icon: Mail,
      count: invitationsCount,
      hasUnsaved: hasUnsavedInvitations,
      colorClass: 'text-blue-600 dark:text-blue-400'
    },
    {
      id: 'requests',
      label: 'My Requests',
      icon: Send,
      count: requestsCount,
      hasUnsaved: hasUnsavedRequests,
      colorClass: 'text-amber-600 dark:text-amber-400'
    }
  ];

  const currentItem = menuItems.find((m) => m.id === activeSection) || menuItems[0];
  const CurrentIcon = currentItem.icon;

  const handleSelect = (sectionId: ConnectionSection) => {
    onSelectSection(sectionId);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`block lg:hidden w-full relative z-30 ${className}`}>
      {/* Mobile Menu Bar Container */}
      <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden group">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center justify-between gap-2">
          {/* Connections Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              isOpen
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-expanded={isOpen}
            aria-label="Connections Menu"
          >
            <Users className="w-4 h-4 text-blue-500 shrink-0" />
            <span>Connections</span>
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            )}
          </button>

          {/* Active Section Indicator Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
            <CurrentIcon className={`w-3.5 h-3.5 shrink-0 ${currentItem.colorClass}`} />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-none">
              {currentItem.label}
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-sans font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 ml-0.5">
              {currentItem.count}
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
              <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest px-2 py-1 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-blue-500" />
                <span>Manage Connections</span>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {menuItems.map((item) => {
                  const isActive = item.id === activeSection;
                  const ItemIcon = item.icon;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                        isActive
                          ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <ItemIcon className={`w-4 h-4 shrink-0 ${
                          isActive
                            ? 'text-amber-400 dark:text-amber-600'
                            : item.colorClass
                        }`} />
                        <span className="truncate">{item.label}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.hasUnsaved && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved modifications" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold ${
                            isActive
                              ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {item.count}
                        </span>
                        {isActive && (
                          <Check className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 shrink-0" />
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

      <AdminComponentTag name="ConnectionMobileMenuBar" />
    </div>
  );
}

export { ConnectionMobileMenuBar, ConnectionMobileMenuBar as connectionMobileMenuBar };
