/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award,
  Sparkles,
  Infinity as InfinityIcon,
  Coins,
  Mic,
  Image as ImageIcon,
  X,
  CheckCircle2,
  Crown
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { playUiSound } from '@/src/services/soundService';

export interface MbrEarlyAdopterProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'welcome' | 'badge';
  memberFirstName?: string;
  onStartWriting?: () => void;
  onViewAccount?: () => void;
}

export type mbrEarlyAdopterProps = MbrEarlyAdopterProps;

export default function MbrEarlyAdopter({
  isOpen,
  onClose,
  mode = 'welcome',
  memberFirstName,
  onStartWriting,
  onViewAccount,
}: MbrEarlyAdopterProps) {
  const isWelcomeMode = mode === 'welcome';

  useEffect(() => {
    if (isOpen) {
      playUiSound('CREDIT_PURCHASE');
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/75 backdrop-blur-md"
          />

          {/* Dialog Window */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: 'spring', damping: 24, stiffness: 320 }}
            className="relative z-10 w-full max-w-xl bg-[#FDFCFB] dark:bg-slate-900 rounded-3xl shadow-[0_28px_80px_-12px_rgba(15,23,42,0.55)] border border-amber-300/60 dark:border-amber-700/50 ring-1 ring-amber-400/20 overflow-hidden"
          >
            {/* Top Gold Shimmer Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500" />

            {/* Close Button */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              title="Close"
              className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Hero Banner */}
            <div className="relative px-6 sm:px-8 pt-8 pb-6 bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#1E1B4B] text-white text-center overflow-hidden">
              {/* Ambient Gold & Indigo Glows */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-40 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-44 h-44 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col items-center">
                {/* Founding Early Adopter Medallion */}
                <div className="relative mb-3.5">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.45)] ring-4 ring-amber-300/25">
                    {isWelcomeMode ? <Crown className="w-8 h-8" /> : <Award className="w-8 h-8" />}
                  </div>
                  <span className="absolute -bottom-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center border-2 border-[#0F172A] shadow-sm">
                    <Sparkles className="w-3 h-3" />
                  </span>
                </div>

                {/* Status Pill */}
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-widest bg-amber-400/15 text-amber-300 border border-amber-400/35 mb-2.5">
                  <Sparkles className="w-3 h-3" />
                  {isWelcomeMode ? 'Founding Early Adopter · Welcome Gift' : 'Founding Early Adopter · Member Status'}
                </span>

                {/* Headline */}
                <h2 className="font-serif text-2xl sm:text-3xl font-black tracking-tight text-white leading-tight">
                  {isWelcomeMode
                    ? `Welcome to BackStory${memberFirstName ? `, ${memberFirstName}` : ''}!`
                    : 'Your Early Adopter Benefits'}
                </h2>

                {/* Subcopy */}
                <p className="mt-2.5 text-xs sm:text-sm font-serif text-slate-300 max-w-md leading-relaxed">
                  {isWelcomeMode
                    ? 'Thank you for joining us as a Founding Early Adopter. To celebrate the start of your storytelling journey, your account has been unlocked with lifetime membership and starter AI credits.'
                    : 'As a Founding Early Adopter of BackStory, your account carries permanent lifetime privileges along with our complete suite of starter AI creative credits.'}
                </p>
              </div>
            </div>

            {/* Body: Lifetime Subscription + 3 Credit Gift Cards */}
            <div className="px-6 sm:px-8 py-6 space-y-4">
              {/* Featured Lifetime Subscription Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-[#FFFBF0] to-amber-50/70 dark:from-amber-950/40 dark:via-slate-800/80 dark:to-amber-950/30 border border-amber-300/80 dark:border-amber-700/60 shadow-xs flex items-start gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/20">
                  <InfinityIcon className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="font-serif text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      Free BackStory Lifetime Subscription
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/70 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      Active Forever
                    </span>
                  </div>
                  <p className="text-[11.5px] font-serif text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Full lifetime access to write, preserve, organize, and share your personal memoirs, photo albums, and family chapters—completely free of subscription fees.
                  </p>
                </div>
              </div>

              {/* 3 Starter Credit Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1,500 AI Story Credits */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-amber-200/80 dark:border-amber-800/50 shadow-2xs flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                    <Coins className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-black text-amber-600 dark:text-amber-400 leading-none mt-0.5">
                    1,500
                  </div>
                  <div className="text-[11px] font-serif font-bold text-slate-800 dark:text-white leading-tight">
                    AI Story Credits
                  </div>
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 leading-snug">
                    AI Co-Writing, Story PDFs &amp; Heirloom Books
                  </p>
                </div>

                {/* 25 AI Voice Credits */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-purple-200/80 dark:border-purple-800/50 shadow-2xs flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
                    <Mic className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-black text-purple-600 dark:text-purple-400 leading-none mt-0.5">
                    25
                  </div>
                  <div className="text-[11px] font-serif font-bold text-slate-800 dark:text-white leading-tight">
                    AI Voice Credits
                  </div>
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 leading-snug">
                    Narrate stories in your cloned or studio voice
                  </p>
                </div>

                {/* 25 AI Image Credits */}
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800/70 border border-teal-200/80 dark:border-teal-800/50 shadow-2xs flex flex-col items-center text-center gap-1.5">
                  <div className="w-9 h-9 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <div className="font-serif text-2xl font-black text-teal-600 dark:text-teal-400 leading-none mt-0.5">
                    25
                  </div>
                  <div className="text-[11px] font-serif font-bold text-slate-800 dark:text-white leading-tight">
                    AI Image Credits
                  </div>
                  <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 leading-snug">
                    2K AI Story Photos, Chat Edits &amp; Living Motion
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#0F172A] to-[#1E293B] hover:from-slate-800 hover:to-slate-700 text-amber-300 border border-amber-400/35 text-xs sm:text-sm font-serif font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="pb-2.5 flex justify-center">
              <AdminComponentTag name="mbrEarlyAdopter" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { MbrEarlyAdopter as mbrEarlyAdopter };
