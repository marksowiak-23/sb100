/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Coins, AlertTriangle, ArrowRight, X, Sparkles } from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';
import { playUiSound } from '@/src/services/soundService';
import { useModalA11y } from '@/src/hooks/useModalA11y';

interface ExhaustedCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  actionAttempted?: string;
  onNavigateToAccount?: () => void;
}

export default function ExhaustedCreditsModal({
  isOpen,
  onClose,
  actionAttempted,
  onNavigateToAccount
}: ExhaustedCreditsModalProps) {
  const { dialogProps } = useModalA11y({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      playUiSound('WARNING_ALERT');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoToAccount = () => {
    onClose();
    if (onNavigateToAccount) {
      onNavigateToAccount();
    } else {
      window.dispatchEvent(new CustomEvent('open-member-account'));
      window.dispatchEvent(new CustomEvent('navigate-tab', { detail: { tab: 'mbrAccountPage' } }));
    }
  };

  return (
    <AnimatePresence>
      <div {...dialogProps} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative"
        >
          <AdminComponentTag name="ExhaustedCreditsModal.tsx" />

          {/* Modal Header */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  Credits Exhausted
                </h3>
                <p className="text-[11px] font-sans text-amber-600 dark:text-amber-400 font-semibold flex items-center gap-1 mt-0.5">
                  <AlertTriangle className="w-3 h-3 inline" />
                  <span>Account Credit Balance Depleted</span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">
                  Current Credit Balance
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                  0 Credits
                </span>
              </div>
              {actionAttempted && (
                <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                  Action blocked: <strong className="text-slate-700 dark:text-slate-200">{actionAttempted}</strong> requires active credits.
                </p>
              )}
            </div>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
              You have exhausted your allocated credits. Additional credits can be purchased via the <strong className="font-semibold text-slate-900 dark:text-white">My Account</strong> menu to continue creating new stories, printing to PDF, using AI Flashbacks, and generating voice translations.
            </p>

            <div className="flex items-center gap-2 p-3 rounded-xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 text-blue-800 dark:text-blue-300 text-xs">
              <Sparkles className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
              <span>Credit packages start at just $29.00 for 1,500 credits with instant top-up.</span>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-serif font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={handleGoToAccount}
              className="px-5 py-2 rounded-xl text-xs font-serif font-bold bg-[#13547A] hover:bg-[#0E3E5B] text-white shadow-md shadow-[#13547A]/20 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <span>Go to My Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
