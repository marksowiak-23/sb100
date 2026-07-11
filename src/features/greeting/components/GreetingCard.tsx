/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Sparkles, RefreshCw } from 'lucide-react';

// Interfaces outline the data structure of the properties passed from parent components.
interface GreetingCardProps {
  name: string;                   // The string value representing the subject name.
  setName: (name: string) => void; // A function callback to update state in the parent App.tsx.
}

/**
 * GreetingCard Component
 * Displays the dynamic welcome message. It uses input state that it modifies via props callback,
 * demonstrating "Lifting State Up" (state is owned by App.tsx, but edited by GreetingCard).
 */
export default function GreetingCard({ name, setName }: GreetingCardProps) {
  
  // Resets the greeting input back to its default empty state.
  const handleReset = () => {
    setName('');
  };

  // Fallback string if the user hasn't typed anything yet.
  const displayName = name.trim() || 'World';

  return (
    <div
      id="greeting-card"
      className="w-full max-w-2xl bg-white border border-slate-100 rounded-3xl p-8 md:p-16 shadow-[0_20px_50px_rgba(148,163,184,0.12)] text-center transition-shadow duration-300"
    >
      {/* --- DYNAMIC BADGE --- */}
      {/* Uses a ternary expression to conditionally choose the text depending on whether `name` is empty. */}
      <div className="inline-block px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold rounded-full mb-6 uppercase tracking-widest">
        {name.trim() ? 'System Synced' : 'Initialization Successful'}
      </div>

      {/* --- DYNAMIC GREETING HEADING --- */}
      <div id="greeting-display" className="min-h-[140px] flex flex-col justify-center text-center">
        {/* AnimatePresence monitors when elements enter or leave the DOM tree */}
        <AnimatePresence mode="wait">
          {/* We set `key={displayName}` on the motion.div. */}
          {/* In React, changing a key tells it to completely discard the old element and animate in a brand new one. */}
          <motion.div
            key={displayName}
            initial={{ opacity: 0, scale: 0.97, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.03, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="space-y-4"
          >
            {/* Conditional Avatar Display: Shows static User icon if name is set, or animated Sparkles if empty */}
            <div
              className="inline-flex items-center justify-center p-3 bg-blue-50/70 rounded-2xl"
              id="avatar-container"
            >
              {name.trim() ? (
                <User className="w-6 h-6 text-blue-600" />
              ) : (
                <Sparkles className="w-6 h-6 text-blue-500 animate-spin-slow" />
              )}
            </div>

            <h1
              id="main-greeting"
              className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tighter mb-4 leading-normal break-words"
            >
              Hello,{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                {displayName}!
              </span>
            </h1>

            <p id="greeting-subtitle" className="text-lg text-slate-500 max-w-md mx-auto leading-relaxed">
              {name.trim()
                ? 'A personalized reactive screen tailored specifically for Mark.'
                : 'Mark Sowiak, your interactive React environment is fully initialized. Start customizing by entering your name below.'}
            </p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* --- INPUT FORM CONTAINER --- */}
      <div id="input-container" className="mt-10 pt-8 border-t border-slate-100 space-y-4 max-w-md mx-auto">
        <div className="space-y-2 text-left">
          <label
            htmlFor="name-input"
            className="block text-xs font-bold text-slate-400 uppercase tracking-widest font-mono"
          >
            Change Greeting Subject
          </label>
          <div className="relative">
            {/* A "controlled input" in React: */}
            {/* 1. value={name} links the input value directly to our state. */}
            {/* 2. onChange is a callback function that is fired on every keystroke. */}
            {/*    e.target.value grabs the text currently typed, and calls setName to update state. */}
            <input
              id="name-input"
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Type a custom name..."
              className="w-full bg-slate-50/70 hover:bg-slate-50/90 focus:bg-white text-slate-800 placeholder-slate-400 text-sm rounded-2xl border border-slate-200 outline-none py-3.5 pl-11 pr-4 transition-all duration-150 font-sans shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-150"
            />
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          </div>
        </div>

        {/* --- RESET BUTTON --- */}
        {/* We use double-ampersand logical AND `&&` to render this button ONLY if a name has been typed. */}
        <AnimatePresence>
          {name && (
            <motion.button
              id="clear-button"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.15 }}
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 text-xs font-semibold text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200/70 rounded-2xl transition-all duration-150"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to World</span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
