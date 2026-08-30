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
            <div className="p-6 pb-4 border-b border-[#EFECE7] flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-amber-50/30 to-purple-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-xs">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-serif text-xl font-bold text-slate-850 tracking-tight">
                    About StoryBook
                  </h2>
                  <p className="font-serif text-xs italic text-slate-500">
                    Your life, your voice, your story — for every generation
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
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                  <Compass className="w-3.5 h-3.5 text-blue-600" />
                  <span>Our Mission: Real Stories, Real Connections</span>
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-semibold">
                  StoryBook is a creative storytelling and community platform designed for people of all ages to share personal journeys, everyday adventures, and meaningful life moments.
                </p>
                <p className="text-slate-600">
                  Unlike traditional social feeds where your thoughts disappear in seconds under endless algorithms, StoryBook gives your experiences a permanent, beautifully crafted home. Whether you're documenting your college years, sharing travel adventures, chronicling creative breakthroughs, or preserving family memories, StoryBook is your creative space to write, illustrate, and connect.
                </p>
              </div>

              {/* Who Is StoryBook For? (All Ages Callout) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-800 uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-indigo-600" />
                  <span>A Creative Space for Everyone</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-850 text-xs flex items-center gap-1.5 text-blue-700">
                      ⚡ Young Creators
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Document college life, road trips, artistic passions, career beginnings, and bold personal milestones.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-850 text-xs flex items-center gap-1.5 text-emerald-700">
                      🌱 Everyday Storytellers
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Share real-world lessons, funny anecdotes, major life transitions, and what inspires you daily.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-850 text-xs flex items-center gap-1.5 text-amber-700">
                      📖 Lifelong Biographers
                    </span>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Preserve deep roots, ancestral heritage, family traditions, and timeless wisdom for the next generations.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-3 pt-2 border-t border-[#EFECE7]">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-purple-800 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Why You'll Love StoryBook</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <BookOpen className="w-4 h-4 text-blue-600" />
                      <span>Dynamic Chapter Topics</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Organize your life into rich chapters: Adventures, Passions, Education, Career, Family, and Everyday Thoughts.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Feather className="w-4 h-4 text-amber-600" />
                      <span>StoryMate AI Creative Partner</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Get inspired with smart interview prompts, conversational brainstorming, and creative writing polish.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <Images className="w-4 h-4 text-emerald-600" />
                      <span>Visual Photo Galleries</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      Bring your chapters to life by adding photos, memorable screenshots, and custom captions to every story.
                    </p>
                  </div>

                  <div className="p-3.5 bg-white border border-[#EFECE7] rounded-2xl space-y-1.5 shadow-2xs">
                    <div className="flex items-center gap-2 text-slate-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-violet-600" />
                      <span>Total Privacy & Control</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      You own your words. Share freely with close friends, custom circles, family, or publish to the public world.
                    </p>
                  </div>
                </div>
              </div>

              {/* Community & Connection Banner */}
              <div className="p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/50 to-purple-50/50 border border-blue-100 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-850">
                  <Heart className="w-4 h-4 text-rose-500" />
                  <span>Share your journey. Discover theirs.</span>
                </div>
                <p className="text-[11px] text-slate-650 leading-relaxed">
                  Join a positive, authentic community where stories matter. Follow fellow storytellers, connect with new friends, and share the milestones that make your life extraordinary.
                </p>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#EFECE7] bg-slate-50/60 flex items-center justify-between">
              <div className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">
                StoryBook Platform • Connect & Inspire
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
