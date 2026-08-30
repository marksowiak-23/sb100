/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Feather, Sliders, Sparkles } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { PreferencesSubTab } from '../types';

interface PreferencesNavigationMenuProps {
  activeSubTab: PreferencesSubTab;
  onSelectTab: (tab: PreferencesSubTab) => void;
  isStoryMateDirty: boolean;
  isWorkspaceDirty: boolean;
}

export default function PreferencesNavigationMenu({
  activeSubTab,
  onSelectTab,
  isStoryMateDirty,
  isWorkspaceDirty
}: PreferencesNavigationMenuProps) {
  return (
    <div className="space-y-6">
      <AdminComponentTag name="PreferencesNavigationMenu.tsx" />

      {/* Main Navigation Menu Panel */}
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        {/* Menu Header */}
        <div className="pb-4 mb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold font-serif text-slate-800 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Preferences Navigation</span>
          </h2>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1.5" aria-label="Preferences Navigation">
          {/* Menu Item 1: My Story Mate */}
          <button
            type="button"
            onClick={() => onSelectTab('story-mate')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
              activeSubTab === 'story-mate'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeSubTab === 'story-mate'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Feather className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">My Story Mate</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">Story Craft Assistant Persona</div>
              </div>
            </div>
            {isStoryMateDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes in Story Mate" />
            )}
          </button>

          {/* Menu Item 2: My Workspace */}
          <button
            type="button"
            onClick={() => onSelectTab('workspace')}
            className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-serif font-bold transition-all cursor-pointer text-left ${
              activeSubTab === 'workspace'
                ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                  activeSubTab === 'workspace'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                }`}
              >
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold font-serif text-slate-900 dark:text-white">My Workspace</div>
                <div className="text-[10px] font-normal text-slate-500 dark:text-slate-400 font-sans">Workspace & UI Preferences</div>
              </div>
            </div>
            {isWorkspaceDirty && (
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" title="Unsaved changes in workspace" />
            )}
          </button>
        </nav>
      </div>

      {/* Quick Guidance / Context Card */}
      <div className="bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2.5 shadow-xs">
        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <h4 className="text-xs font-bold font-serif">Preferences Guidance</h4>
        </div>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
          Use <strong>My Story Mate</strong> to choose the AI voice and style that best represents your storytelling tone.
        </p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
          Use <strong>My Workspace</strong> to configure your visual theme, notifications, and auto-save options.
        </p>
      </div>
    </div>
  );
}
