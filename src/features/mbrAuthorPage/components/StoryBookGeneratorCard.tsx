/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BookOpen, Sparkles, Lock } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { useMemberCredits } from '@/src/services/creditBalanceService';
import ExhaustedCreditsModal from '@/src/components/ExhaustedCreditsModal';

export interface StoryBookGeneratorCardProps {
  onOpenStoryBookGenerator?: () => void;
  className?: string;
  memberId?: string;
}

export default function StoryBookGeneratorCard({
  onOpenStoryBookGenerator,
  className = '',
  memberId,
}: StoryBookGeneratorCardProps) {
  const { isExhausted: hasExhaustedCredits } = useMemberCredits(memberId);
  const [showExhaustedCreditsModal, setShowExhaustedCreditsModal] = useState<boolean>(false);

  const handleLaunchGenerator = () => {
    if (hasExhaustedCredits) {
      setShowExhaustedCreditsModal(true);
      return;
    }

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
        {hasExhaustedCredits && (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            0 Credits
          </span>
        )}
      </div>
      <div className="space-y-1">
        <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">
          BackStory Book Studio
        </h3>
        <p className="font-serif text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
          Compile your published stories by topic category, design your book cover, and export a print-ready PDF book.
        </p>
      </div>

      <div
        onClick={() => {
          if (hasExhaustedCredits) {
            setShowExhaustedCreditsModal(true);
          }
        }}
        className={hasExhaustedCredits ? 'cursor-pointer w-full' : 'w-full'}
      >
        <button
          type="button"
          disabled={hasExhaustedCredits}
          onClick={(e) => {
            if (hasExhaustedCredits) {
              e.preventDefault();
              e.stopPropagation();
              setShowExhaustedCreditsModal(true);
              return;
            }
            handleLaunchGenerator();
          }}
          className={`w-full py-2 px-3 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center justify-center gap-2 ${
            hasExhaustedCredits
              ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
              : 'bg-amber-800 hover:bg-amber-900 text-white cursor-pointer'
          }`}
          title={hasExhaustedCredits ? 'Credits exhausted - click to purchase via My Account' : 'Configure & Print My Book'}
        >
          {hasExhaustedCredits ? (
            <Lock className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
          ) : (
            <BookOpen className="w-3.5 h-3.5" />
          )}
          <span>Configure & Print My Book</span>
        </button>
      </div>

      {/* Exhausted Credits Modal */}
      <ExhaustedCreditsModal
        isOpen={showExhaustedCreditsModal}
        onClose={() => setShowExhaustedCreditsModal(false)}
        actionAttempted="Configuring and printing book"
      />

      <AdminComponentTag name="StoryBookGeneratorCard" />
    </div>
  );
}

export { StoryBookGeneratorCard as SbStoryBookGeneratorCard };
