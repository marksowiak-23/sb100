/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles, Heart } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbExplainerCard() {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-sm flex flex-col gap-5 relative">
      <div className="space-y-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-serif text-base font-bold text-slate-850">
            Why StoryBook?
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed font-serif">
          StoryBook is the creative space for people of all ages to share real life moments, personal adventures, creative journeys, and connect with a community that cares about authentic stories.
        </p>
      </div>

      {/* Bullet points */}
      <ul className="flex flex-col gap-2.5 font-serif">
        <li className="flex items-start gap-2.5 text-xs text-slate-700">
          <span className="text-sm leading-none shrink-0 mt-0.5" role="img" aria-label="Write">✍️</span>
          <span><strong>Your Voice, Your Chapters:</strong> Write about travel, passions, college life, or major milestones.</span>
        </li>
        <li className="flex items-start gap-2.5 text-xs text-slate-700">
          <span className="text-sm leading-none shrink-0 mt-0.5" role="img" aria-label="Connect">👥</span>
          <span><strong>Connect & Discover:</strong> Meet fellow creators, follow friends, and explore shared experiences.</span>
        </li>
        <li className="flex items-start gap-2.5 text-xs text-slate-700">
          <span className="text-sm leading-none shrink-0 mt-0.5" role="img" aria-label="Privacy">🔒</span>
          <span><strong>Total Privacy Control:</strong> Share with close friends, custom circles, family, or the world.</span>
        </li>
        <li className="flex items-start gap-2.5 text-xs text-slate-700">
          <span className="text-sm leading-none shrink-0 mt-0.5" role="img" aria-label="AI Partner">✨</span>
          <span><strong>StoryMate AI Partner:</strong> Brainstorm ideas, beat writer's block, and polish your stories.</span>
        </li>
        <li className="flex items-start gap-2.5 text-xs text-slate-700">
          <span className="text-sm leading-none shrink-0 mt-0.5" role="img" aria-label="Galleries">📸</span>
          <span><strong>Visual Galleries:</strong> Add photos and custom captions directly to your stories.</span>
        </li>
      </ul>

      {/* Testimonial Quote */}
      <div className="bg-gradient-to-r from-blue-50/60 via-indigo-50/40 to-transparent border border-blue-100/70 p-4 rounded-2xl flex flex-col gap-2">
        <div className="flex items-center gap-1.5 text-blue-800 text-[11px] font-bold font-serif">
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          <span>Community Voice</span>
        </div>
        <p className="text-xs italic text-slate-700 leading-relaxed font-serif">
          "StoryBook gave me a place to share my travel stories and creative projects, connecting with people who care about real stories without the noise."
        </p>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right font-mono">
          — Maya S., creator & student
        </span>
      </div>

      <AdminComponentTag name="SbExplainerCard" />
    </div>
  );
}
