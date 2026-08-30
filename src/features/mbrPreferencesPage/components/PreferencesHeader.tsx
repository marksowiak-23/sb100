/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, 
  Feather, 
  Sliders, 
  RotateCcw, 
  Save, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { PreferencesSubTab } from '../types';

interface PreferencesHeaderProps {
  activeSubTab: PreferencesSubTab;
  isDirty: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  onClickBack: () => void;
  onReset: () => void;
  onDismissError: () => void;
  onDismissSuccess: () => void;
}

export default function PreferencesHeader({
  activeSubTab,
  isDirty,
  saving,
  error,
  success,
  onClickBack,
  onReset,
  onDismissError,
  onDismissSuccess
}: PreferencesHeaderProps) {
  return (
    <div className="relative mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="PreferencesHeader.tsx" />

      {/* Top Bar: Back button, Title & Action buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={onClickBack}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 mb-3 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white">
              {activeSubTab === 'story-mate' ? <Feather className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                {activeSubTab === 'story-mate' ? 'My Story Mate' : 'My Workspace'}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {activeSubTab === 'story-mate'
                  ? 'Customize your preferred story craft writing assistant persona and narrative co-authoring style.'
                  : 'Manage application display theme, notifications, and workspace UI behaviors.'}
              </p>
            </div>
          </div>
        </div>

        {/* Global Top Action Buttons */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Discard Changes</span>
            </button>
          )}

          <button
            type="submit"
            disabled={!isDirty || saving}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold font-sans shadow-md transition-all cursor-pointer ${
              isDirty && !saving
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 active:scale-98'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Preferences...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Preferences</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications / Feedback Alerts */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
            <button type="button" onClick={onDismissError} className="text-rose-500 hover:text-rose-700 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-sm font-medium">{success}</span>
            </div>
            <button type="button" onClick={onDismissSuccess} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
