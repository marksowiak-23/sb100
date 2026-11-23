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
  RotateCcw,
  Type
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export type FontScaleOption = 'standard' | 'large' | 'xlarge';

interface WorkspacePreferencesPanelProps {
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
  hideGettingStartedCard: boolean;
  onToggleHideGettingStartedCard: (hide: boolean) => void;
  hideHowToAuthorCard: boolean;
  onToggleHideHowToAuthorCard: (hide: boolean) => void;
  hideStorySparkCard: boolean;
  onToggleHideStorySparkCard: (hide: boolean) => void;
  coachMarksDisabled: boolean;
  onToggleCoachMarksDisabled: (disabled: boolean) => void;
  completedCoachToursCount?: number;
  onResetCoachTours: () => void;
  fontScale?: FontScaleOption;
  onSelectFontScale?: (scale: FontScaleOption) => void;
}

const FONT_SCALE_OPTIONS: Array<{ id: FontScaleOption; label: string; desc: string; previewClass: string }> = [
  { id: 'standard', label: 'Standard', desc: 'Default comfortable size (100%)', previewClass: 'text-sm' },
  { id: 'large', label: 'Large', desc: 'Easier reading across all pages (112%)', previewClass: 'text-base' },
  { id: 'xlarge', label: 'Extra Large', desc: 'Maximum readability for long memoirs (125%)', previewClass: 'text-lg' },
];

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
  hideGettingStartedCard,
  onToggleHideGettingStartedCard,
  hideHowToAuthorCard,
  onToggleHideHowToAuthorCard,
  hideStorySparkCard,
  onToggleHideStorySparkCard,
  coachMarksDisabled,
  onToggleCoachMarksDisabled,
  completedCoachToursCount = 0,
  onResetCoachTours,
  fontScale = 'standard',
  onSelectFontScale
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
            Select your preferred application color theme and visual presentation style.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Theme Preference Selector */}
        <div className="space-y-2.5">
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

        {/* Reading Text Size Selector */}
        {onSelectFontScale && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
            <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-blue-500" />
              <span>Reading &amp; Interface Text Size</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {FONT_SCALE_OPTIONS.map((opt) => {
                const isSelected = fontScale === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onSelectFontScale(opt.id)}
                    className={`flex flex-col items-start gap-1.5 p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className={`font-serif font-bold text-slate-900 dark:text-white ${opt.previewClass}`}>
                        Aa · {opt.label}
                      </span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
                    </div>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-snug">
                      {opt.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Home Page & Display Preferences */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <label className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
            Display & Card Preferences
          </label>
          
          {/* Hide Getting Started Card */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
              hideGettingStartedCard
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-serif font-bold text-sm block ${hideGettingStartedCard ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-100'}`}>
                  Hide Getting Started Card
                </span>
                {hideGettingStartedCard && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white">
                    On
                  </span>
                )}
              </div>
              <p className={`text-xs font-serif leading-relaxed ${hideGettingStartedCard ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                When enabled, the Getting Started guide checklist on your Home page is completely hidden and will not process onboarding steps.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hideGettingStartedCard}
                onChange={(e) => onToggleHideGettingStartedCard(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full peer-focus:outline-hidden after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors ${
                  hideGettingStartedCard
                    ? 'bg-blue-600 after:translate-x-full after:border-white shadow-xs shadow-blue-600/30'
                    : 'bg-slate-200 dark:bg-slate-700 after:border-slate-300'
                }`}
              ></div>
            </label>
          </div>

          {/* Hide HowTo Authoring Card */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
              hideHowToAuthorCard
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-serif font-bold text-sm block ${hideHowToAuthorCard ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-100'}`}>
                  Hide HowTo Authoring Card
                </span>
                {hideHowToAuthorCard && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white">
                    On
                  </span>
                )}
              </div>
              <p className={`text-xs font-serif leading-relaxed ${hideHowToAuthorCard ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                When enabled, the How-To authoring guide card at the top of your Author page is completely hidden.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hideHowToAuthorCard}
                onChange={(e) => onToggleHideHowToAuthorCard(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full peer-focus:outline-hidden after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors ${
                  hideHowToAuthorCard
                    ? 'bg-blue-600 after:translate-x-full after:border-white shadow-xs shadow-blue-600/30'
                    : 'bg-slate-200 dark:bg-slate-700 after:border-slate-300'
                }`}
              ></div>
            </label>
          </div>

          {/* Hide Story Spark Card */}
          <div
            className={`border rounded-2xl p-4 flex items-center justify-between gap-4 transition-all ${
              hideStorySparkCard
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className={`font-serif font-bold text-sm block ${hideStorySparkCard ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-100'}`}>
                  Hide Story Spark Card
                </span>
                {hideStorySparkCard && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white">
                    On
                  </span>
                )}
              </div>
              <p className={`text-xs font-serif leading-relaxed ${hideStorySparkCard ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                When enabled, the Story Spark writing ideas card above the Story Editor on your Author page is hidden.
              </p>
            </div>

            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={hideStorySparkCard}
                onChange={(e) => onToggleHideStorySparkCard(e.target.checked)}
                className="sr-only peer"
              />
              <div
                className={`w-11 h-6 rounded-full peer-focus:outline-hidden after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors ${
                  hideStorySparkCard
                    ? 'bg-blue-600 after:translate-x-full after:border-white shadow-xs shadow-blue-600/30'
                    : 'bg-slate-200 dark:bg-slate-700 after:border-slate-300'
                }`}
              ></div>
            </label>
          </div>

          {/* Disable Automatic Coach Marks */}
          <div
            className={`border rounded-2xl p-4 space-y-3 transition-all ${
              coachMarksDisabled
                ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/80'
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className={`font-serif font-bold text-sm block ${coachMarksDisabled ? 'text-blue-900 dark:text-blue-200' : 'text-slate-800 dark:text-slate-100'}`}>
                    Disable Automatic Guided Tours (Coach Marks)
                  </span>
                  {coachMarksDisabled && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-sans font-bold uppercase tracking-wider bg-blue-600 text-white">
                      On
                    </span>
                  )}
                </div>
                <p className={`text-xs font-serif leading-relaxed ${coachMarksDisabled ? 'text-blue-800/80 dark:text-blue-300/80' : 'text-slate-500 dark:text-slate-400'}`}>
                  When enabled, interactive spotlight tours will not start automatically when you visit a page. You can still launch any page tour manually using the Tour button.
                </p>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={coachMarksDisabled}
                  onChange={(e) => onToggleCoachMarksDisabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div
                  className={`w-11 h-6 rounded-full peer-focus:outline-hidden after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all transition-colors ${
                    coachMarksDisabled
                      ? 'bg-blue-600 after:translate-x-full after:border-white shadow-xs shadow-blue-600/30'
                      : 'bg-slate-200 dark:bg-slate-700 after:border-slate-300'
                  }`}
                ></div>
              </label>
            </div>

            <div className="pt-2.5 border-t border-slate-200/70 dark:border-slate-700/60 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-serif text-slate-500 dark:text-slate-400">
                {completedCoachToursCount > 0
                  ? `${completedCoachToursCount} of 8 page tours completed.`
                  : 'All 8 page tours (Home, Author, Story Feed, Connections, Profile, Account, Preferences, Privacy) are ready to play.'}
              </span>
              <button
                type="button"
                onClick={onResetCoachTours}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 hover:bg-amber-50 dark:hover:bg-amber-950/30 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-800/70 shadow-2xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset &amp; Replay All Tours</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
