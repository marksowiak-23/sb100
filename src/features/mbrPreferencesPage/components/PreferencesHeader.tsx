/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Feather, 
  Sliders, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { PreferencesSubTab } from '../types';

interface PreferencesHeaderProps {
  activeSubTab: PreferencesSubTab;
  savedNotification?: boolean;
  saving?: boolean;
  error?: string | null;
  onDismissError?: () => void;
}

export default function PreferencesHeader({
  activeSubTab,
  savedNotification = false,
  saving = false,
  error = null,
  onDismissError
}: PreferencesHeaderProps) {
  return (
    <div className="relative mb-3 sm:mb-6 lg:mb-8 pb-3 sm:pb-4 lg:pb-6 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="PreferencesHeader.tsx" />

      {/* Top Bar: Title & Dynamic Save Status Pulse */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white shrink-0">
            {activeSubTab === 'story-mate' ? <Feather className="w-4 h-4 sm:w-5 sm:h-5" /> : <Sliders className="w-4 h-4 sm:w-5 sm:h-5" />}
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              {activeSubTab === 'story-mate' ? 'My Story Mate' : 'My Workspace'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-normal">
              {activeSubTab === 'story-mate'
                ? 'Customize your preferred story craft writing assistant persona and narrative co-authoring style.'
                : 'Select your preferred application color theme and visual presentation style.'}
            </p>
          </div>
        </div>

        {/* Dynamic Save Notification: Pulses in on change, then fades out */}
        <div className="flex items-center min-h-[32px] self-start sm:self-auto">
          <AnimatePresence>
            {savedNotification && (
              <motion.div
                key="changes-saved"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ 
                  opacity: 1, 
                  scale: [0.95, 1.05, 1],
                  y: 0 
                }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-serif font-bold border border-emerald-200 dark:border-emerald-800 shadow-sm shadow-emerald-500/10"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Changes saved</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Error Alert */}
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
            {onDismissError && (
              <button type="button" onClick={onDismissError} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
