/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen,
  Mic,
  Image as ImageIcon,
  RefreshCw, 
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { AccountSubTab } from './AccountNavigationMenu';
import { CoachTourTriggerButton } from '@/src/features/coachMarks';

export interface AccountHeaderProps {
  activeSubTab?: AccountSubTab;
  onClickBack?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  successMessage?: string | null;
  errorMessage?: string | null;
  onDismissError?: () => void;
}

export default function AccountHeader({
  activeSubTab = 'story-credits',
  refreshing = false,
  onRefresh,
  successMessage = null,
  errorMessage = null,
  onDismissError
}: AccountHeaderProps) {
  const isVoiceTab = activeSubTab === 'voice-credits';
  const isImageTab = activeSubTab === 'image-credits';

  return (
    <div className="relative mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="AccountHeader.tsx" />

      {/* Top Bar: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md text-white shrink-0 ${
              isVoiceTab
                ? 'bg-gradient-to-tr from-purple-600 to-indigo-600 shadow-purple-600/20'
                : isImageTab
                ? 'bg-gradient-to-tr from-teal-600 to-emerald-600 shadow-teal-600/20'
                : 'bg-gradient-to-tr from-[#13547A] to-blue-600 shadow-blue-600/20'
            }`}
          >
            {isVoiceTab ? (
              <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : isImageTab ? (
              <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              {isVoiceTab ? 'My Voice Credits' : isImageTab ? 'My Image Credits' : 'My Story Credits'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-normal">
              {isVoiceTab
                ? 'Purchase and manage Voice Credits for AI voice narration of your published stories.'
                : isImageTab
                ? 'Purchase and manage Image Credits for 2K AI story photo generation, chat refinement, and Living Photos.'
                : 'Purchase and manage Story Credits for AI co-writing, formatting, and printable books.'}
            </p>
          </div>
        </div>

        {/* Action Controls & Notifications */}
        <div className="flex items-center gap-2 min-h-[32px] self-start sm:self-auto">
          <AnimatePresence>
            {successMessage && (
              <motion.div
                key="account-success"
                initial={{ opacity: 0, scale: 0.9, y: -4 }}
                animate={{ opacity: 1, scale: [0.95, 1.05, 1], y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -4 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-xs font-serif font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <CoachTourTriggerButton tourId="account_tour" label="Account Tour" />

          {onRefresh && (
            <button
              type="button"
              disabled={refreshing}
              onClick={onRefresh}
              className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Refresh Balance"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence mode="wait">
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span className="text-xs font-medium font-serif">{errorMessage}</span>
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
