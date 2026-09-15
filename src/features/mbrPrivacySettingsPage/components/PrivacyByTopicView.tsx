/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronRight, ChevronDown, ChevronUp, BookOpen, Layers, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Topic, Cd } from '@/src/services/api';
import { UnifiedGroup, PrivilegeCell } from '../types';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByTopicViewProps {
  topics: Topic[];
  groups: UnifiedGroup[];
  matrix: Record<string, PrivilegeCell>;
  selectedTopicId: string | null;
  privCodes: Cd[];
  onSelectTopic: (topicId: string) => void;
  onPrivilegeChange: (topicId: string, grpId: string, newValue: string) => void;
  onSetAllForTopic: (topicId: string, value: string) => void;
}

export default function PrivacyByTopicView({
  topics,
  groups,
  matrix,
  selectedTopicId,
  privCodes,
  onSelectTopic,
  onPrivilegeChange,
  onSetAllForTopic
}: PrivacyByTopicViewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close mobile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedTopic = topics.find(t => t.topicId === selectedTopicId) || topics[0];

  const handleSelectTopic = (topicId: string) => {
    onSelectTopic(topicId);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative flex flex-col md:grid md:grid-cols-4 gap-4 sm:gap-6">
      <AdminComponentTag name="PrivacyByTopicView.tsx" />

      {/* ========================================================================= */}
      {/* 1. MOBILE VIEW: Collapsible Topic Selector Dropdown (< md)                */}
      {/* ========================================================================= */}
      <div ref={dropdownRef} className="block md:hidden w-full relative z-20">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs">
          {/* Header & Trigger Button */}
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                isDropdownOpen
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
              aria-expanded={isDropdownOpen}
              aria-label="Toggle Topic Selection Menu"
            >
              <Layers className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>Select Topic</span>
              {isDropdownOpen ? (
                <ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              )}
            </button>

            {/* Current Active Topic Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 rounded-xl min-w-0">
              <BookOpen className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200 truncate">
                {selectedTopic?.topicFullName || selectedTopic?.topicName || 'Select a topic'}
              </span>
            </div>
          </div>

          {/* Animated Dropdown Menu Options */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden border-t border-slate-100 dark:border-slate-800 pt-2.5 space-y-1"
              >
                <div className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest px-2 py-0.5">
                  Available Topics ({topics.length})
                </div>

                <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                  {topics.map(topic => {
                    const isSelected = selectedTopicId === topic.topicId;
                    const topicLabel = topic.topicFullName || topic.topicName;

                    return (
                      <button
                        key={topic.topicId}
                        type="button"
                        onClick={() => handleSelectTopic(topic.topicId)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-white font-bold shadow-xs'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <BookOpen className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                          <span className="truncate">{topicLabel}</span>
                        </div>
                        {isSelected && (
                          <Check className="w-4 h-4 text-white shrink-0 ml-2" />
                        )}
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
      {/* 2. DESKTOP VIEW: Sidebar Topic List (>= md)                              */}
      {/* ========================================================================= */}
      <div className="hidden md:block md:col-span-1 space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-400 px-2 tracking-wider mb-2">
          Select Topic
        </h3>
        {topics.map(topic => {
          const isSelected = selectedTopicId === topic.topicId;
          return (
            <button
              key={topic.topicId}
              type="button"
              onClick={() => onSelectTopic(topic.topicId)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{topic.topicFullName || topic.topicName}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      {/* ========================================================================= */}
      {/* 3. MAIN CONTENT: Topic Detail & Groups Privilege Configuration            */}
      {/* ========================================================================= */}
      <div className="w-full md:col-span-3">
        {selectedTopicId && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 mb-4 sm:mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[11px] sm:text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Topic Configuration
                </span>
                <h2 className="text-lg sm:text-xl font-bold font-serif text-slate-900 dark:text-white">
                  {selectedTopic?.topicFullName || selectedTopic?.topicName}
                </h2>
              </div>

              {/* Quick Apply All for Topic */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Set all to:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onSetAllForTopic(selectedTopicId, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="" disabled>Choose Code...</option>
                  {privCodes.map(c => (
                    <option key={c.cdId || c.cdValue} value={c.cdValue}>
                      {c.cdLabel || c.cdValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Groups List */}
            <div className="space-y-2.5 sm:space-y-3">
              {groups.map(grp => {
                const key = `${selectedTopicId}_${grp.grpId}`;
                const cell = matrix[key];
                const currentValue = cell?.privValueCd || 'NONE';

                return (
                  <div
                    key={grp.grpId}
                    className="p-3 sm:p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {grp.grpName}
                        </span>
                        {grp.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      {grp.grpDescription && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {grp.grpDescription}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:w-48 shrink-0">
                      <CdSelect
                        tag="privValueCd"
                        value={currentValue}
                        onChange={(newVal) => onPrivilegeChange(selectedTopicId, grp.grpId, newVal)}
                        includeEmptyOption={false}
                        showDescriptionHelper={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
