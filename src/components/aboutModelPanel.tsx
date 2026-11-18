/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Users, 
  Images, 
  Heart, 
  Compass, 
  Feather, 
  Zap, 
  Bookmark, 
  Lock, 
  CheckCircle2, 
  ArrowRight,
  Flame,
  Award
} from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';
import { BUILD_INFO } from '@/src/config/buildInfo';

export interface AboutModelPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export type SbAboutModalProps = AboutModelPanelProps;

export default function AboutModelPanel({ isOpen, onClose }: AboutModelPanelProps) {
  const [activePersona, setActivePersona] = useState<number>(0);

  // ESC key listener to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const personas = [
    {
      id: 0,
      title: 'Young Creators',
      tagline: 'Bold Firsts & Big Dreams',
      icon: Zap,
      gradient: 'from-blue-500 to-cyan-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      description: 'Document college life, road trips, artistic passions, career beginnings, and bold personal milestones.',
      tags: ['#CollegeLife', '#RoadTrips', '#FirstCareer', '#Passions']
    },
    {
      id: 1,
      title: 'Everyday Storytellers',
      tagline: 'Real Life & Meaningful Moments',
      icon: Flame,
      gradient: 'from-emerald-500 to-teal-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description: 'Share real-world lessons, funny anecdotes, major life transitions, and what inspires you day to day.',
      tags: ['#LifeLessons', '#FamilyMoments', '#EverydayReflections', '#Growth']
    },
    {
      id: 2,
      title: 'Lifelong Biographers',
      tagline: 'Ancestral Roots & Timeless Wisdom',
      icon: Bookmark,
      gradient: 'from-amber-500 to-orange-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'Preserve deep roots, ancestral heritage, family traditions, and timeless wisdom for the next generations.',
      tags: ['#Heritage', '#FamilyRoots', '#TimelessWisdom', '#Memoir']
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          {/* Backdrop Overlay with blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity cursor-default"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FCFBF8] to-[#F8F6F0] border border-[#E8E2D5] rounded-3xl shadow-2xl z-10 overflow-hidden flex flex-col max-h-[92vh]"
          >
            {/* Top Atmospheric Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-72 h-32 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-1/4 w-72 h-32 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

            {/* Modal Header */}
            <div className="relative px-6 py-4.5 border-b border-[#E8E2D5] flex items-center justify-between bg-white/70 backdrop-blur-md">
              <div className="flex items-center gap-3.5">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
                    <Sparkles className="w-5 h-5 animate-pulse" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center" title="Platform Active">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      About <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">BackStory</span>
                    </h2>
                    <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold tracking-wider uppercase bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                      ✨ Storytelling Platform
                    </span>
                  </div>
                  <p className="font-serif text-xs italic text-slate-500 mt-0.5">
                    Your life, your voice, your story — for every generation
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 rounded-xl transition-all cursor-pointer hover:rotate-90 duration-200"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Scrollable Content */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 text-slate-700 text-xs font-serif leading-relaxed">
              
              {/* Visual Hero Collage Banner */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-md group">
                <div className="relative h-44 sm:h-52 w-full overflow-hidden bg-slate-900">
                  <img
                    src="/backstory_splash_collage.jpg"
                    alt="BackStory Community Collage"
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out opacity-90"
                  />
                  {/* Visual Gradients */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-90" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-950/70 via-transparent to-purple-950/50 mix-blend-multiply" />
                  
                  {/* Floating Content over Image */}
                  <div className="absolute bottom-3.5 left-4 right-4 sm:bottom-4.5 sm:left-6 sm:right-6 text-white space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-mono font-bold tracking-wider uppercase text-amber-300 border border-white/25 shadow-sm">
                      <Sparkles className="w-3 h-3 text-amber-300" />
                      <span>Every Life Has A Story</span>
                    </div>

                    <h3 className="font-serif font-black text-lg sm:text-xl text-white tracking-tight leading-snug drop-shadow-md">
                      A Permanent Home for What Matters Most
                    </h3>

                    <p className="text-[11px] sm:text-xs text-slate-200 font-serif max-w-xl leading-relaxed line-clamp-2 drop-shadow-sm">
                      BackStory is a creative storytelling and community platform designed for people of all ages to share personal journeys, everyday adventures, and meaningful life milestones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mission Statement Box */}
              <div className="relative p-4 sm:p-5 bg-white/80 rounded-2xl border border-[#EAE3D4] shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-blue-800 uppercase tracking-wider">
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Our Mission: Real Stories, Real Connections</span>
                </div>
                <p className="text-slate-800 text-[13px] leading-relaxed font-semibold">
                  Unlike traditional social feeds where your thoughts disappear in seconds under endless algorithms, BackStory gives your experiences a permanent, beautifully crafted home.
                </p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Whether you're documenting your college years, sharing travel adventures, chronicling creative breakthroughs, or preserving family memories, BackStory is your creative space to write, illustrate, and connect with people who care.
                </p>
              </div>

              {/* Platform Pillars / Highlights Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Compass className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-bold text-[10px] text-slate-900">Zero Feeds</span>
                  <span className="text-[10px] text-slate-500 font-serif">No algorithms</span>
                </div>

                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-bold text-[10px] text-slate-900">StoryMate AI</span>
                  <span className="text-[10px] text-slate-500 font-serif">Creative prompts</span>
                </div>

                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-bold text-[10px] text-slate-900">100% Owned</span>
                  <span className="text-[10px] text-slate-500 font-serif">Total privacy</span>
                </div>

                <div className="p-3 bg-white/90 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col items-center text-center space-y-1">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                    <Users className="w-4 h-4" />
                  </div>
                  <span className="font-mono font-bold text-[10px] text-slate-900">All Ages</span>
                  <span className="text-[10px] text-slate-500 font-serif">Multi-generation</span>
                </div>
              </div>

              {/* Who Is BackStory For? (Interactive Persona Cards) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-800 uppercase tracking-wider">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span>A Creative Space for Everyone</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">Click a card to highlight</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {personas.map((persona) => {
                    const IconComp = persona.icon;
                    const isSelected = activePersona === persona.id;

                    return (
                      <motion.div
                        key={persona.id}
                        whileHover={{ y: -4 }}
                        onClick={() => setActivePersona(persona.id)}
                        className={`p-4 rounded-2xl transition-all cursor-pointer relative overflow-hidden border ${
                          isSelected
                            ? 'bg-white border-indigo-400 shadow-md ring-2 ring-indigo-500/20'
                            : 'bg-white/80 border-[#EFECE7] hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        {/* Top Gradient Stripe */}
                        <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${persona.gradient}`} />

                        <div className="space-y-2 mt-1">
                          <div className="flex items-center justify-between">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${persona.badgeBg}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                              Persona #{persona.id + 1}
                            </span>
                          </div>

                          <div>
                            <h4 className="font-serif font-bold text-slate-900 text-xs">
                              {persona.title}
                            </h4>
                            <p className="text-[10px] font-serif italic text-slate-500">
                              {persona.tagline}
                            </p>
                          </div>

                          <p className="text-[11px] text-slate-600 leading-snug">
                            {persona.description}
                          </p>

                          <div className="flex flex-wrap gap-1 pt-1">
                            {persona.tags.map((tag) => (
                              <span
                                key={tag}
                                className="px-1.5 py-0.5 rounded-md text-[9px] font-mono bg-slate-100 text-slate-600"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Core Features Grid */}
              <div className="space-y-3 pt-2 border-t border-[#EAE3D4]">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-purple-800 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>Why You'll Love BackStory</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-white/90 border border-[#EAE3D4] hover:border-blue-300 rounded-2xl space-y-2 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-slate-900 text-xs">Dynamic Chapters</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-blue-50 text-blue-600 border border-blue-200/60">
                        Taxonomy
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-serif">
                      Organize your life into rich chapters: Adventures, Passions, Education, Career, Family, and Everyday Thoughts.
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-white/90 border border-[#EAE3D4] hover:border-amber-300 rounded-2xl space-y-2 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center">
                          <Feather className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-slate-900 text-xs">StoryMate AI Partner</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
                        AI Creative
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-serif">
                      Break through writer's block with intelligent interview prompts, conversational brainstorming, and creative polish.
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-white/90 border border-[#EAE3D4] hover:border-emerald-300 rounded-2xl space-y-2 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                          <Images className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-slate-900 text-xs">Visual Photo Galleries</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                        Rich Media
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-serif">
                      Bring chapters to life by embedding photo memories, screenshots, and custom captions in every narrative.
                    </p>
                  </motion.div>

                  <motion.div 
                    whileHover={{ scale: 1.01 }}
                    className="p-4 bg-white/90 border border-[#EAE3D4] hover:border-violet-300 rounded-2xl space-y-2 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-violet-100/80 text-violet-700 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="font-serif font-bold text-slate-900 text-xs">Total Privacy & Control</span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-violet-50 text-violet-700 border border-violet-200/60">
                        Private & Circles
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed font-serif">
                      You own your words. Keep entries private, share with close circles, or publish to the broader community.
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Community & Connection Banner */}
              <div className="relative p-5 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl shadow-lg space-y-3 overflow-hidden">
                <div className="absolute -top-12 -right-12 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
                <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 font-bold text-white text-sm">
                      <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />
                      <span>Share your journey. Discover theirs.</span>
                    </div>
                    <p className="text-xs text-blue-100 font-serif leading-relaxed max-w-md">
                      Join a thoughtful, authentic community where stories matter. Follow fellow writers, connect with new friends, and share the milestones that make life extraordinary.
                    </p>
                  </div>

                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white text-indigo-700 hover:bg-blue-50 font-sans font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 shrink-0"
                  >
                    <span>Start Exploring</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-[#E8E2D5] bg-[#F7F4EC]/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex flex-col gap-0.5 text-center sm:text-left">
                <div className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider flex items-center justify-center sm:justify-start gap-1.5">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  <span>BackStory Platform • Connect & Inspire</span>
                </div>
                <div
                  className="text-[9px] font-mono text-slate-400 tracking-tight"
                  title={BUILD_INFO.buildDate ? `Built on ${new Date(BUILD_INFO.buildDate).toLocaleString()}` : undefined}
                >
                  v{BUILD_INFO.version} (Build #{BUILD_INFO.buildNumber} • {BUILD_INFO.commitHash}) [{BUILD_INFO.environment}]
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full sm:w-auto px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold font-sans transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>

            <AdminComponentTag name="aboutModelPanel" />
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export { AboutModelPanel, AboutModelPanel as aboutModelPanel, AboutModelPanel as SbAboutModal };
