/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, X, Sparkles, ShieldCheck, Users, Images, Heart, Compass, Feather } from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';

interface SbAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SbAboutModal({ isOpen, onClose }: SbAboutModalProps) {
  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-2xl bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="p-6 pb-4 border-b border-[#EFECE7] flex items-center justify-between bg-gradient-to-r from-amber-50/40 via-white to-blue-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-100/80 border border-amber-200/80 flex items-center justify-center text-amber-800 shadow-xs">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-850 tracking-tight">
                    About Storybook
                  </h2>
                  <p className="font-serif text-xs italic text-slate-500">
                    Where every life becomes literature
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs font-serif leading-relaxed">
              
              {/* Introduction / Purpose */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-800 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-amber-600" />
                  <span>Our Purpose & Mission</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed">
                  <strong>Storybook</strong> is a platform designed to help individuals document, organize, tell and preserve their life stories. As well as a way to learn about the lives of others. 
                </p>
                <p className="text-slate-600">
                  Unlike transient social media posts that vanish into fast-moving feeds, Storybook transforms your milestones, anecdotes, lineage, and wisdom into authentic, permanent chapters of personal literature.
                </p>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>How Storybook Works</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Curated Life Topics</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Organize your life story through structured topics: Family, Residencies, Achievements, Education, Career, and Hobbies.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Feather className="w-4 h-4 text-amber-600" />
                      <span>StoryMate AI Co-Writer</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Conversational prompts and thoughtful interview questions guide you in recalling forgotten details and drafting memoirs.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Images className="w-4 h-4 text-emerald-600" />
                      <span>Photo Book Galleries</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Upload and attach historical photographs with rich narrative descriptions tied directly to specific family members or topics.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-violet-600" />
                      <span>Granular Privacy Controls</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      You own your data. Configure fine-grained access rules by groups—Immediate Family, Extended Family, Friends, or Public.
                    </p>
                  </div>
                </div>
              </div>

              {/* Background Information */}
              <div className="space-y-2.5 pt-2 border-t border-[#EFECE7]">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  <Heart className="w-3.5 h-3.5 text-rose-500" />
                  <span>Background & Heritage</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  Founded with the conviction that every life is full of invaluable wisdom, humor, and resilience, Storybook provides a digital home for memoirs. Whether chronicling early childhood roots, milestone career contributions, or beloved family traditions, Storybook ensures that no voice or legacy is lost and no story is untold.  It is a place to share your life with family, friends, and the world (according to your preferences).
                </p>
              </div>

              {/* Community & Connection */}
              <div className="p-4 bg-amber-50/50 border border-amber-100/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-900">
                  <Users className="w-4 h-4 text-amber-700" />
                  <span>Share your journey. Discover theirs.</span>
                </div>
                <p className="text-[11px] text-amber-800/90 leading-relaxed">
                  Connect with family, collaborate with friends, and discover shared heritage within a secure, respectful storytelling community.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#EFECE7] bg-slate-50/60 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                Storybook Platform • Version 1.0.0
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>

            <AdminComponentTag name="SbAboutModal" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
