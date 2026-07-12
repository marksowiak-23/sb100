/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    title: 'Your Story. Finally Written.',
    subtitle: 'Author, organize, and share the chapters of your life — on your terms.'
  },
  {
    image: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=800&auto=format&fit=crop&q=80',
    title: 'Connect Through Shared Memories.',
    subtitle: 'Read life stories from friends, family, and a global community of authors.'
  },
  {
    image: 'https://images.unsplash.com/photo-1471107340929-a87cd0f5b5f3?w=800&auto=format&fit=crop&q=80',
    title: 'Every Life is a Book Worth Reading.',
    subtitle: 'Uncover the wisdom of your ancestors and document your personal journey.'
  },
  {
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
    title: 'Co-Author Your Shared History.',
    subtitle: 'Collaborate with family members to write chapters of shared events and experiences.'
  },
  {
    image: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&auto=format&fit=crop&q=80',
    title: 'Create a Legacy of Wisdom.',
    subtitle: 'Pass down lessons, advice, and values in a beautiful, structured format.'
  }
];

export default function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0); // -1 for left, 1 for right

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 6000); // Autoplay slide interval of 6 seconds
    return () => clearInterval(interval);
  }, [index]);

  const handleNext = () => {
    setDirection(1);
    setIndex((prev) => (prev + 1) % SLIDES.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  // Framer Motion Animation Variants for Slide Transitions
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <div className="relative w-full h-[170px] md:h-[200px] bg-slate-900 rounded-3xl overflow-hidden shadow-md group border border-[#EFECE7]">
      {/* --- IMAGE BACKGROUND SLIDES --- */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={index}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 }
          }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Slide image overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-slate-950/20 z-10" />
          <img
            src={SLIDES[index].image}
            alt={SLIDES[index].title}
            className="w-full h-full object-cover"
          />

          {/* --- CONTENT CAPTION --- */}
          <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 z-25 text-left text-white space-y-1 md:space-y-1.5 pb-6 md:pb-8">
            <motion.h2 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="font-serif text-lg md:text-xl font-black leading-tight tracking-tight text-white drop-shadow-sm"
            >
              {SLIDES[index].title}
            </motion.h2>
            <motion.p 
              initial={{ y: 15, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="text-[10px] md:text-xs text-slate-200 leading-relaxed font-serif max-w-xl drop-shadow-sm"
            >
              {SLIDES[index].subtitle}
            </motion.p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* --- NAVIGATION ARROWS (Fade in on hover) --- */}
      <button
        onClick={handlePrev}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-200 cursor-pointer"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* --- SLIDE INDICATOR DOTS --- */}
      <div className="absolute bottom-4 right-6 md:right-8 z-30 flex gap-2">
        {SLIDES.map((_, idx) => (
          <button
            key={idx}
            onClick={() => {
              setDirection(idx > index ? 1 : -1);
              setIndex(idx);
            }}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-250 cursor-pointer ${
              idx === index ? 'bg-white scale-110' : 'bg-white/40 hover:bg-white/60'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
