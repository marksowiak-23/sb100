/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { ShieldAlert, Sparkles, MessageSquare, Users, BookOpen, Share2, Globe } from 'lucide-react';

interface LeftColumnProps {
  setActiveTab: (tab: any) => void;
}

export default function LeftColumn({ setActiveTab }: LeftColumnProps) {
  const handleSocialLogin = (provider: string) => {
    if (provider === 'Google') {
      setActiveTab('sbMbrHomePage');
    } else {
      alert(`Initiating simulated ${provider} OAuth sign-in flow...`);
    }
  };

  return (
    <div className="space-y-8 flex flex-col">
      {/* --- BRAND HEADER --- */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
          Storybook
        </h1>
        <p className="font-serif text-sm italic text-slate-500 tracking-wide">
          Where every life becomes literature
        </p>
      </div>

      {/* --- AUTH CARD --- */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <div>
          <h3 className="font-serif text-lg font-bold text-slate-800">
            Welcome Back
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Sign in to continue your story
          </p>
        </div>

        <div className="flex flex-col gap-2">
          {/* Google Sign In */}
          <button
            onClick={() => handleSocialLogin('Google')}
            className="w-full flex items-center justify-center gap-2.5 py-3 border border-slate-150 hover:bg-slate-50 text-slate-650 hover:text-slate-800 font-semibold text-xs rounded-2xl transition-all duration-150 cursor-pointer"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Apple Sign In */}
          <button
            onClick={() => handleSocialLogin('Apple')}
            className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all duration-150 shadow-sm"
          >
            {/* Custom Apple icon using simple paths */}
            <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.12 0 2.15-.52 2.81-1.33z" />
            </svg>
            <span>Continue with Apple</span>
          </button>
        </div>

        <div className="text-center pt-2 border-t border-slate-50">
          <span className="text-[10px] text-slate-400 font-semibold">
            Don't have an account?{' '}
            <button
              onClick={() => alert('Opening membership sign-up application...')}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </button>
          </span>
        </div>
      </div>

      {/* --- EXPLAINER CARD --- */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-slate-700 shrink-0" />
            <h3 className="font-serif text-base font-bold text-slate-800">
              What is Storybook?
            </h3>
          </div>
          <p className="text-xs text-slate-550 leading-relaxed">
            Storybook is a dedicated space for recording personal memories, organizing life chapters, and preserving them securely for generations to come.
          </p>
        </div>

        {/* Bullet points */}
        <ul className="flex flex-col gap-3">
          <li className="flex items-start gap-2.5 text-xs text-slate-650">
            <span className="text-base leading-none shrink-0" role="img" aria-label="Write">✍️</span>
            <span className="mt-0.5">Write & organize life chapters</span>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-slate-650">
            <span className="text-base leading-none shrink-0" role="img" aria-label="Control">🔒</span>
            <span className="mt-0.5">Control who reads (private or public)</span>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-slate-650">
            <span className="text-base leading-none shrink-0" role="img" aria-label="Share">👨‍👩‍👧</span>
            <span className="mt-0.5">Share memoirs with family & friends</span>
          </li>
          <li className="flex items-start gap-2.5 text-xs text-slate-650">
            <span className="text-base leading-none shrink-0" role="img" aria-label="Preserve">📚</span>
            <span className="mt-0.5">Preserve digital memories securely</span>
          </li>
        </ul>

        {/* Testimonial Quote */}
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl flex flex-col gap-2">
          <p className="text-xs italic text-slate-500 leading-relaxed">
            "The most beautiful gift I ever gave my grandchildren."
          </p>
          <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wider text-right font-mono">
            — Margaret K., member since 2021
          </span>
        </div>
      </div>

      {/* --- COMMUNITY STATS GRID --- */}
      <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-4">
        <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Community Stats
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* Members */}
          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
            <Users className="w-4 h-4 text-blue-500" />
            <span className="text-sm font-bold text-slate-800 block mt-1">48,200+</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Members</span>
          </div>

          {/* Chapters */}
          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
            <BookOpen className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-bold text-slate-800 block mt-1">312,000+</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Chapters</span>
          </div>

          {/* Stories shared */}
          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
            <Share2 className="w-4 h-4 text-indigo-500" />
            <span className="text-sm font-bold text-slate-800 block mt-1">1.4M+</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Shared</span>
          </div>

          {/* Countries */}
          <div className="p-4 bg-slate-50/50 border border-slate-100 rounded-2xl flex flex-col gap-1">
            <Globe className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-bold text-slate-800 block mt-1">94</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Countries</span>
          </div>
        </div>
      </div>
    </div>
  );
}
