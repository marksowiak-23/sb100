/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  Feather, 
  MessageSquare, 
  Wand2, 
  CheckCircle2, 
  ArrowRight,
  Smile,
  Bot
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbEasyStoryWritingCardProps {
  onClickAuthorPage?: (initialPrompt?: string) => void;
}

export default function SbEasyStoryWritingCard({ onClickAuthorPage }: SbEasyStoryWritingCardProps) {
  const steps = [
    {
      num: '1',
      title: 'Feed Short Statements',
      desc: 'No need to author long paragraphs! Just share bullet points, quick memories, or short statements about a moment in your life.',
      icon: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />,
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      num: '2',
      title: 'StoryMate Drafts the Story',
      desc: 'Your AI assistant instantly weaves your thoughts into a rich, engaging, and heartfelt narrative draft.',
      icon: <Wand2 className="w-3.5 h-3.5 text-purple-600" />,
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200'
    },
    {
      num: '3',
      title: 'Review & Correct with Ease',
      desc: 'Tell StoryMate to tweak details, adjust the tone, or add names. Review and publish when you love the draft.',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    }
  ];

  return (
    <div className="relative bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Top Signature Gold & Amber Gradient Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600" />

      <div className="p-4 sm:p-5 space-y-4">
        {/* Header Section */}
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80">
              <Sparkles className="w-3 h-3 text-amber-600 animate-pulse" />
              StoryMate Co-Writer
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <Smile className="w-3 h-3" /> Fun &amp; Easy
            </span>
          </div>

          <h3 className="font-serif text-lg font-bold text-slate-900 tracking-tight pt-1">
            Easy Story Writing
          </h3>
          <p className="text-xs text-slate-600 font-serif leading-relaxed">
            Writing your life stories is effortless when you team up with your personal AI co-writer.
          </p>
        </div>

        {/* 3 Step Flow */}
        <div className="space-y-2.5">
          {steps.map((s) => (
            <div 
              key={s.num}
              className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
            >
              <span className={`inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-bold shrink-0 border mt-0.5 ${s.badgeBg}`}>
                {s.num}
              </span>
              <div className="space-y-0.5 min-w-0">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  {s.title}
                </div>
                <p className="text-[11px] text-slate-600 leading-snug font-serif">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Example Mini Box */}
        <div className="p-3 bg-gradient-to-br from-amber-50/60 to-yellow-50/40 rounded-xl border border-amber-200/60 space-y-2 text-xs font-serif">
          <div className="flex items-center gap-1.5 text-amber-900 font-semibold text-[11px] uppercase tracking-wider">
            <Bot className="w-3.5 h-3.5 text-amber-700" />
            Quick Example
          </div>
          <div className="space-y-1.5 pl-1 text-[11px] leading-relaxed">
            <p className="text-slate-700 italic">
              <strong className="text-slate-900 not-italic">You say:</strong> &ldquo;I grew up near Lake Michigan in the 70s. We used to build sandcastles with my brother every summer.&rdquo;
            </p>
            <p className="text-amber-950 bg-amber-100/50 p-2 rounded-lg border border-amber-200/40">
              <strong className="text-amber-900 not-italic">StoryMate creates:</strong> &ldquo;Summer afternoons on the shores of Lake Michigan were filled with laughter and sun-soaked adventures...&rdquo;
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => {
            if (onClickAuthorPage) {
              onClickAuthorPage();
            }
          }}
          className="w-full inline-flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow transition-all group"
        >
          <Feather className="w-3.5 h-3.5" />
          <span>Try StoryMate in Author Studio</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <AdminComponentTag name="SbEasyStoryWritingCard" />
    </div>
  );
}
