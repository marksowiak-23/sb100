/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Sparkles } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface StoryBookGeneratorCardProps {
  onOpenStoryBookGenerator?: () => void;
  className?: string;
}

export default function StoryBookGeneratorCard({
  onOpenStoryBookGenerator,
  className = '',
}: StoryBookGeneratorCardProps) {
  const handleLaunchGenerator = () => {
    if (onOpenStoryBookGenerator) {
      onOpenStoryBookGenerator();
    } else {
      window.dispatchEvent(new CustomEvent('open-storybook-generator'));
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-amber-50/90 via-[#FDFCFB] to-amber-100/40 border border-amber-200/80 rounded-3xl p-4 shadow-xs space-y-2.5 relative ${className}`}
    >
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1 text-[10px] font-serif font-bold uppercase tracking-wider text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-full border border-amber-200">
          <Sparkles className="w-3 h-3 text-amber-700" />
          Heirloom Book Studio
        </span>
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-sm font-bold text-slate-900">
          BackStory Book Studio
        </h3>
        <p className="font-serif text-[11px] text-slate-600 leading-relaxed">
          Compile your published stories by topic category, design your book cover, and export a print-ready PDF book.
        </p>
      </div>
      <button
        type="button"
        onClick={handleLaunchGenerator}
        className="w-full py-2 px-3 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer"
      >
        <BookOpen className="w-3.5 h-3.5" />
        <span>Configure & Print My Book</span>
      </button>

      <AdminComponentTag name="StoryBookGeneratorCard" />
    </div>
  );
}

export { StoryBookGeneratorCard as SbStoryBookGeneratorCard };

