/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  Sparkles, 
  FileText, 
  BookOpen, 
  Mic, 
  LogIn, 
  Layers, 
  Info 
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AccountRatesPanelProps {
  rates: Record<string, number>;
}

export default function AccountRatesPanel({ rates }: AccountRatesPanelProps) {
  const defaultRates = [
    { code: 'STORY_GENERATE', name: 'Story AI Generation', credits: rates['STORY_GENERATE'] ?? -50, icon: Sparkles, desc: 'Generates AI story narrative using your selected StoryMate persona.' },
    { code: 'STORY_PRINT_PDF', name: 'Story Single PDF Export', credits: rates['STORY_PRINT_PDF'] ?? -15, icon: FileText, desc: 'Renders high-resolution printable PDF of a single story memoir.' },
    { code: 'STORYBOOK_PDF_GENERATE', name: 'Full Storybook PDF Album', credits: rates['STORYBOOK_PDF_GENERATE'] ?? -100, icon: BookOpen, desc: 'Compiles and generates bound storybook collection with front/back cover.' },
    { code: 'AUDIO_GENERATE', name: 'Voice Narration Synthesis', credits: rates['AUDIO_GENERATE'] ?? -25, icon: Mic, desc: 'Synthesizes audio playback using cloned voice or standard studio narrator.' },
    { code: 'LOGON', name: 'Member Session & Daily Recall', credits: rates['LOGON'] ?? -10, icon: LogIn, desc: 'Accounts for Remember When flashback AI computations upon signing in.' }
  ];

  return (
    <div className="space-y-4 py-1">
      <AdminComponentTag name="AccountRatesPanel.tsx" />

      <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-300 text-xs flex items-start gap-2.5">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="font-sans leading-relaxed">
          The table below reflects current BackStory platform credit deduction rates for AI tasks. Credits are only deducted upon successful event completion.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        {defaultRates.map((r) => {
          const Icon = r.icon;
          return (
            <div
              key={r.code}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-xs text-slate-900 dark:text-white">
                      {r.name}
                    </h4>
                    <span className="font-mono text-[10px] text-slate-400 block">{r.code}</span>
                  </div>
                </div>
                <span className="font-mono font-bold text-xs px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-800 dark:text-amber-400 border border-amber-500/20">
                  {r.credits} cr
                </span>
              </div>
              <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-normal">
                {r.desc}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
