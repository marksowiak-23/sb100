/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { useCoachMarks, findVisibleCoachTarget } from './CoachMarkContext';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

const PADDING = 8;
const POPOVER_WIDTH = 340;
const POPOVER_GAP = 14;

export function CoachMarkOverlay() {
  const {
    activeTour,
    activeSteps,
    currentStepIndex,
    nextStep,
    prevStep,
    skipTour,
    finishTour
  } = useCoachMarks();

  const [targetRect, setTargetRect] = useState<SpotlightRect | null>(null);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [popoverHeight, setPopoverHeight] = useState<number>(220);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const currentStep = activeTour ? activeSteps[currentStepIndex] : null;
  const isLastStep = currentStepIndex >= activeSteps.length - 1;

  // Reset checkbox when a new tour begins
  useEffect(() => {
    setDontShowAgain(false);
  }, [activeTour?.id]);

  // Keyboard shortcuts: Esc to skip, ArrowRight/Enter for next, ArrowLeft for prev
  useEffect(() => {
    if (!activeTour) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipTour(dontShowAgain);
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        nextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        prevStep();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [activeTour, dontShowAgain, skipTour, nextStep, prevStep]);

  // Measure target element & scroll it smoothly into view
  useEffect(() => {
    if (!currentStep) {
      setTargetRect(null);
      return;
    }

    const el = findVisibleCoachTarget(currentStep.targetId);
    if (!el) {
      setTargetRect(null);
      return;
    }

    const updateRect = () => {
      const r = el.getBoundingClientRect();
      setTargetRect({
        top: Math.max(4, r.top - PADDING),
        left: Math.max(4, r.left - PADDING),
        width: Math.min(window.innerWidth - 8, r.width + PADDING * 2),
        height: r.height + PADDING * 2
      });
    };

    // Scroll smoothly so the element is comfortably in the viewport
    el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    updateRect();

    // Re-measure after smooth scroll settles and on resize/scroll
    const settleTimer = window.setTimeout(updateRect, 350);
    const ro = new ResizeObserver(updateRect);
    ro.observe(el);

    window.addEventListener('scroll', updateRect, true);
    window.addEventListener('resize', updateRect);

    return () => {
      window.clearTimeout(settleTimer);
      ro.disconnect();
      window.removeEventListener('scroll', updateRect, true);
      window.removeEventListener('resize', updateRect);
    };
  }, [currentStep?.targetId, currentStepIndex]);

  useLayoutEffect(() => {
    if (popoverRef.current) {
      const h = popoverRef.current.getBoundingClientRect().height;
      if (h > 0) setPopoverHeight(h);
    }
  }, [currentStepIndex, activeTour?.id]);

  if (!activeTour || !currentStep || !targetRect) {
    return null;
  }

  // Compute viewport-safe popover coordinates
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const effWidth = Math.min(POPOVER_WIDTH, vw - 24);
  const preferred = currentStep.placement || 'auto';

  let popTop = targetRect.top + targetRect.height + POPOVER_GAP;
  let popLeft = targetRect.left + targetRect.width / 2 - effWidth / 2;

  const fitsBelow = targetRect.top + targetRect.height + POPOVER_GAP + popoverHeight < vh - 12;
  const fitsAbove = targetRect.top - POPOVER_GAP - popoverHeight > 12;
  const fitsRight = targetRect.left + targetRect.width + POPOVER_GAP + effWidth < vw - 12;
  const fitsLeft = targetRect.left - POPOVER_GAP - effWidth > 12;

  if (preferred === 'right' && fitsRight) {
    popLeft = targetRect.left + targetRect.width + POPOVER_GAP;
    popTop = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  } else if (preferred === 'left' && fitsLeft) {
    popLeft = targetRect.left - POPOVER_GAP - effWidth;
    popTop = targetRect.top + targetRect.height / 2 - popoverHeight / 2;
  } else if (preferred === 'top' && fitsAbove) {
    popTop = targetRect.top - POPOVER_GAP - popoverHeight;
  } else if (preferred === 'bottom' && fitsBelow) {
    popTop = targetRect.top + targetRect.height + POPOVER_GAP;
  } else if (fitsBelow) {
    popTop = targetRect.top + targetRect.height + POPOVER_GAP;
  } else if (fitsAbove) {
    popTop = targetRect.top - POPOVER_GAP - popoverHeight;
  } else if (fitsRight) {
    popLeft = targetRect.left + targetRect.width + POPOVER_GAP;
    popTop = targetRect.top;
  } else if (fitsLeft) {
    popLeft = targetRect.left - POPOVER_GAP - effWidth;
    popTop = targetRect.top;
  } else {
    popTop = Math.max(12, vh - popoverHeight - 16);
  }

  // Clamp inside viewport
  popLeft = Math.max(12, Math.min(vw - effWidth - 12, popLeft));
  popTop = Math.max(12, Math.min(vh - popoverHeight - 12, popTop));

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[120] pointer-events-auto" role="dialog" aria-modal="true" aria-label={activeTour.name}>
        {/* Clickable backdrop (clicking outside skips gracefully) */}
        <div
          className="fixed inset-0"
          onClick={() => skipTour(dontShowAgain)}
        />

        {/* Spotlight Cutout Ring via massive outer box-shadow */}
        <motion.div
          key="coach-spotlight-ring"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            top: targetRect.top,
            left: targetRect.left,
            width: targetRect.width,
            height: targetRect.height
          }}
          transition={{ type: 'spring', stiffness: 320, damping: 32 }}
          style={{
            position: 'fixed',
            boxShadow: '0 0 0 9999px rgba(15, 23, 42, 0.62)'
          }}
          className="rounded-2xl ring-2 ring-amber-400/90 pointer-events-none"
        />

        {/* Floating Callout Card */}
        <motion.div
          ref={popoverRef}
          key={`${activeTour.id}-${currentStepIndex}`}
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2 }}
          style={{
            position: 'fixed',
            top: popTop,
            left: popLeft,
            width: effWidth
          }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-300/80 dark:border-amber-700/60 shadow-2xl overflow-hidden text-slate-900 dark:text-white"
        >
          {/* Top Accent Gradient */}
          <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-amber-500 to-indigo-600" />

          <div className="p-4 space-y-3">
            {/* Header: Badge, Step Count & Close */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60">
                  <Sparkles className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                  {currentStep.badge || activeTour.name}
                </span>
                <span className="text-[11px] font-mono font-semibold text-slate-400">
                  {currentStepIndex + 1} / {activeSteps.length}
                </span>
              </div>

              <button
                type="button"
                onClick={() => skipTour(dontShowAgain)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close tour"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Title & Description */}
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base text-slate-900 dark:text-white leading-snug">
                {currentStep.title}
              </h4>
              <p className="text-xs font-serif text-slate-600 dark:text-slate-300 leading-relaxed">
                {currentStep.description}
              </p>
            </div>

            {/* Progress Dots */}
            <div className="flex items-center gap-1.5 pt-0.5">
              {activeSteps.map((_, idx) => (
                <span
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentStepIndex
                      ? 'w-5 bg-amber-500'
                      : idx < currentStepIndex
                      ? 'w-2 bg-emerald-500'
                      : 'w-1.5 bg-slate-200 dark:bg-slate-700'
                  }`}
                />
              ))}
            </div>

            {/* Footer Controls */}
            <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => skipTour(dontShowAgain)}
                className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              >
                Skip Tour
              </button>

              <div className="flex items-center gap-1.5">
                {currentStepIndex > 0 && (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-0.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Back</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={isLastStep ? finishTour : nextStep}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#122347] to-blue-700 hover:from-[#1B3160] hover:to-blue-800 text-white text-xs font-bold shadow-sm transition-all cursor-pointer active:scale-95"
                >
                  {isLastStep ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Got It!</span>
                    </>
                  ) : (
                    <>
                      <span>Next</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Optional Opt-Out Checkbox */}
            <label className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 cursor-pointer select-none pt-0.5">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <span>Don&apos;t show guided tours automatically</span>
            </label>
          </div>

          <AdminComponentTag name="CoachMarkOverlay" />
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
