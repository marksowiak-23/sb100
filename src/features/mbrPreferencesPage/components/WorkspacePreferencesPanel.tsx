/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sliders, 
  Sun, 
  Moon, 
  Flame, 
  Crown, 
  Cpu, 
  Leaf, 
  Minus, 
  Compass, 
  Bell, 
  FileText 
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface WorkspacePreferencesPanelProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  notificationsInd: boolean;
  onToggleNotifications: (checked: boolean) => void;
  autoSaveInd: boolean;
  onToggleAutoSave: (checked: boolean) => void;
}

const THEME_OPTIONS = [
  { id: 'Default', label: 'Default (Warm)', desc: 'Warm cream & slate', icon: Sun, badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  { id: 'Dark', label: 'Dark Midnight', desc: 'Charcoal & silver', icon: Moon, badge: 'bg-slate-900 text-slate-100 border-slate-700' },
  { id: 'Rustic', label: 'Rustic Bar', desc: 'Burnt copper espresso', icon: Flame, badge: 'bg-[#2E2016] text-[#D97724] border-[#4A3222]' },
  { id: 'Luxury', label: 'Luxury Gold', desc: 'Obsidian & champagne', icon: Crown, badge: 'bg-[#241F10] text-[#D4AF37] border-[#42391D]' },
  { id: 'Tech', label: 'Modern Tech', desc: 'Cyber cyan & violet', icon: Cpu, badge: 'bg-[#0E1B2E] text-[#00F2FE] border-[#163356]' },
  { id: 'Earthy', label: 'Earthy Craft', desc: 'Warm sand & terracotta', icon: Leaf, badge: 'bg-[#EBE5DA] text-[#C84218] border-[#D9D1C3]' },
  { id: 'Minimalist', label: 'Minimalist', desc: 'Stark monochrome', icon: Minus, badge: 'bg-stone-100 text-stone-900 border-stone-300' },
  { id: 'Ocean', label: 'Ocean Indigo', desc: 'Deep indigo & navy', icon: Compass, badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
];

export default function WorkspacePreferencesPanel({
  selectedTheme,
  onSelectTheme,
  notificationsInd,
  onToggleNotifications,
  autoSaveInd,
  onToggleAutoSave
}: WorkspacePreferencesPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      <AdminComponentTag name="WorkspacePreferencesPanel.tsx" />

      {/* Panel Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
          <Sliders className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Workspace & UI Preferences</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-snug">
            Manage application display theme, notifications, and editor auto-save behaviors.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Theme Preference Selector */}
        <div className="space-y-2.5 md:col-span-2">
          <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
            Application Color Theme
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {THEME_OPTIONS.map((t) => {
              const Icon = t.icon;
              const isThemeSelected = (selectedTheme === t.id) || (selectedTheme === 'System' && t.id === 'Default') || (selectedTheme === 'Light' && t.id === 'Default');
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => onSelectTheme(t.id)}
                  className={`flex flex-col items-start gap-2.5 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    isThemeSelected
                      ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className={`p-2 rounded-xl border ${t.badge}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    {isThemeSelected && (
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                    )}
                  </div>
                  <div>
                    <span className="font-serif font-bold text-xs text-slate-800 dark:text-slate-100 block leading-snug">{t.label}</span>
                    <span className="text-[10px] text-slate-400 font-serif block mt-0.5">{t.desc}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles Column */}
        <div className="space-y-4 pt-1 md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Notifications Toggle */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <Bell className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div>
                <h5 className="text-xs font-serif font-bold text-slate-700 dark:text-slate-200">App Notifications</h5>
                <p className="text-[10px] text-slate-400 font-serif">Receive activity & story edit updates</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={notificationsInd}
              onChange={(e) => onToggleNotifications(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>

          {/* Auto-Save Toggle */}
          <div className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl">
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <div>
                <h5 className="text-xs font-serif font-bold text-slate-700 dark:text-slate-200">Story Auto-Save</h5>
                <p className="text-[10px] text-slate-400 font-serif">Automatically save drafts while typing</p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={autoSaveInd}
              onChange={(e) => onToggleAutoSave(e.target.checked)}
              className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
            />
          </div>
        </div>

      </div>
    </div>
  );
}
