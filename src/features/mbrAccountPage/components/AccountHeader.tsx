/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CreditCard,
  RefreshCw, 
  Download, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface AccountHeaderProps {
  onClickBack?: () => void;
  refreshing?: boolean;
  onRefresh?: () => void;
  onDownloadStatement?: () => void;
  disableDownload?: boolean;
  successMessage?: string | null;
  errorMessage?: string | null;
  onDismissError?: () => void;
}

export default function AccountHeader({
  onClickBack,
  refreshing = false,
  onRefresh,
  onDownloadStatement,
  disableDownload = false,
  successMessage = null,
  errorMessage = null,
  onDismissError
}: AccountHeaderProps) {
  return (
    <div className="relative mb-3 sm:mb-6 lg:mb-8 pb-3 sm:pb-4 lg:pb-6 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="AccountHeader.tsx" />

      {/* Top Bar: Title & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          {onClickBack && (
            <button
              type="button"
              onClick={onClickBack}
              className="p-1.5 -ml-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-serif font-bold mr-0.5"
              title="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-600/20 text-white shrink-0">
            <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              My Account
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-normal">
              Member credit balance, subscription status, and activity ledger
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

          {onDownloadStatement && (
            <button
              type="button"
              onClick={onDownloadStatement}
              disabled={disableDownload}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-blue-600/20"
              title="Download Statement PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Statement PDF</span>
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
