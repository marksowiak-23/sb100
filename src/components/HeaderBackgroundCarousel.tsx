/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface HeaderBackgroundCarouselProps {
  images: string[];
  children: React.ReactNode;
  className?: string;
  intervalMs?: number;
}

const FALLBACK_IMAGES = [
  '/carousel_your_story.jpg',
  '/carousel_shared_memories.jpg',
  '/carousel_life_book.jpg',
];

export default function HeaderBackgroundCarousel({
  images,
  children,
  className = '',
  intervalMs = 6000,
}: HeaderBackgroundCarouselProps) {
  const slides = images.length > 0 ? images : FALLBACK_IMAGES;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    setActiveIndex(0);
  }, [slides.join('|')]);

  useEffect(() => {
    if (slides.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [slides.length, intervalMs]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm ${className}`}
    >
      {/* Background Inspiring Image Carousel */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden bg-slate-900/10 dark:bg-slate-950">
        {slides.map((src, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <img
              key={`${src}-${idx}`}
              src={src}
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = FALLBACK_IMAGES[idx % FALLBACK_IMAGES.length];
                if (!img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = fallback;
                }
              }}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
                isCurrent ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          );
        })}

        {/* Editorial Gradient Scrim matching AuthorTopicHeaderPanel */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/70 to-white/22 dark:from-slate-950/88 dark:via-slate-900/70 dark:to-slate-900/25" />
      </div>

      {/* Foreground Content (Icon, Title & Description Preserved with Boosted Contrast) */}
      <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-5 [&_h1]:!text-slate-950 dark:[&_h1]:!text-white [&_h1]:drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] dark:[&_h1]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] [&_p]:!text-slate-800 dark:[&_p]:!text-slate-200 [&_p]:font-medium">
        {children}
      </div>

      {/* Subtle Carousel Slide Indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show inspiring background image ${idx + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? 'w-4 h-1.5 bg-slate-800/80 dark:bg-white/90 shadow-2xs'
                  : 'w-1.5 h-1.5 bg-slate-500/45 hover:bg-slate-700/70 dark:bg-white/40 dark:hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}

      <AdminComponentTag name="HeaderBackgroundCarousel" />
    </div>
  );
}
