/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Image as ImageIcon,
  Sparkles,
  Heart,
  Film,
  CreditCard,
  ArrowRight,
  X
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { playUiSound } from '@/src/services/soundService';
import { useModalA11y } from '@/src/hooks/useModalA11y';

export interface NoImageCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle?: string;
}

export default function NoImageCreditsModal({
  isOpen,
  onClose,
  storyTitle
}: NoImageCreditsModalProps) {
  const { dialogProps } = useModalA11y({ isOpen, onClose });

  useEffect(() => {
    if (isOpen) {
      playUiSound('WARNING_ALERT');
    }
  }, [isOpen]);

  const handleGoToImageCredits = () => {
    onClose();
    window.dispatchEvent(
      new CustomEvent('open-member-account', {
        detail: { subTab: 'image-credits' }
      })
    );
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div {...dialogProps} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 18 }}
            transition={{ type: 'spring', damping: 26, stiffness: 360 }}
            className="relative w-full max-w-lg bg-[#FDFCFB] dark:bg-slate-900 rounded-3xl shadow-[0_24px_64px_-12px_rgba(15,23,42,0.4)] border border-teal-200/80 dark:border-teal-800/60 ring-1 ring-black/5 dark:ring-white/5 overflow-hidden z-10"
          >
            {/* Top Gradient Accent Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-teal-600 via-emerald-500 to-amber-500" />

            {/* Close X Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/85 dark:bg-slate-800/85 border border-stone-200/80 dark:border-slate-700 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-700 shadow-2xs transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero Header */}
            <div className="relative px-6 pt-7 pb-5 bg-gradient-to-br from-teal-50/90 via-[#FAF6EE]/80 to-emerald-50/60 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/30 border-b border-stone-200/70 dark:border-slate-800 text-center">
              <div className="absolute -top-10 -left-10 w-36 h-36 bg-teal-300/25 dark:bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-600 via-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-lg shadow-teal-600/25 mb-3 ring-4 ring-teal-100 dark:ring-teal-950/70">
                  <ImageIcon className="w-7 h-7" />
                </div>

                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10.5px] font-mono font-bold uppercase tracking-wider bg-rose-100/90 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/70 mb-2">
                  0 AI Image Credits Available
                </span>

                <h3 className="font-serif text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  Bring Your Stories to Life with Vivid AI Imagery
                </h3>

                <p className="mt-2 text-xs sm:text-[13px] font-serif text-slate-600 dark:text-slate-300 max-w-md leading-relaxed">
                  You are currently out of <strong className="font-semibold text-slate-900 dark:text-white">AI Image Credits</strong> to illustrate
                  {storyTitle ? (
                    <> <span className="italic text-teal-800 dark:text-teal-300">&ldquo;{storyTitle}&rdquo;</span></>
                  ) : (
                    ' this story'
                  )}. Purchase Image Credits anytime in <strong className="font-semibold text-slate-900 dark:text-white">My Account &rarr; My Image Credits</strong>.
                </p>
              </div>
            </div>

            {/* Editorial Value Highlights */}
            <div className="px-6 py-5 space-y-3.5">
              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700/70 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Heart className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-slate-900 dark:text-white">
                    A Picture Anchors Every Cherished Memory
                  </h4>
                  <p className="text-[11.5px] font-serif text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                    Associating evocative photographs with your stories transforms written memories into rich visual keepsakes that captivate family and friends—even when original photos were never taken or were lost over time.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white dark:bg-slate-800/60 border border-stone-200/80 dark:border-slate-700/70 shadow-2xs">
                <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Film className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-slate-900 dark:text-white">
                    2K Custom Scenes, Chat Refinement &amp; Living Photos
                  </h4>
                  <p className="text-[11.5px] font-serif text-slate-600 dark:text-slate-300 leading-relaxed mt-0.5">
                    Generate 6 ultra-crisp 2K images tailored directly to your story in contemporary or heirloom styles, refine every detail through chat, and animate scenes into Living Photos.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={handleGoToImageCredits}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs sm:text-sm font-serif font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Go to My Account &rarr; My Image Credits</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-3.5 rounded-2xl bg-stone-100 hover:bg-stone-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-stone-200/80 dark:border-slate-700 text-xs font-serif font-semibold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>

              <div className="pt-1 flex items-center justify-center gap-1.5 text-[10.5px] font-serif text-slate-400 dark:text-slate-500">
                <Sparkles className="w-3 h-3 text-teal-500" />
                <span>You can still select existing gallery photos or upload your own anytime.</span>
              </div>
            </div>

            <div className="pb-2 flex justify-center">
              <AdminComponentTag name="NoImageCreditsModal" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
