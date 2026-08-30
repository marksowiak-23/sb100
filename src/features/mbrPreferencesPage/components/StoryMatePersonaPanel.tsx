/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Feather, Check } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { WriterPersona } from '../types';

interface StoryMatePersonaPanelProps {
  personas: WriterPersona[];
  selectedWriterId: string;
  onSelectWriterId: (id: string) => void;
}

export default function StoryMatePersonaPanel({
  personas,
  selectedWriterId,
  onSelectWriterId
}: StoryMatePersonaPanelProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
      <AdminComponentTag name="StoryMatePersonaPanel.tsx" />

      {/* Panel Header */}
      <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
          <Feather className="w-4 h-4" />
        </div>
        <div>
          <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white">Story Craft Assistant Persona</h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-snug">
            Select your preferred writing persona to guide AI co-authoring tone, vocabulary, and narrative style.
          </p>
        </div>
      </div>

      {/* Persona Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {personas.map((persona) => {
          const isSelected = selectedWriterId === persona.chWriterId;
          return (
            <div
              key={persona.chWriterId}
              onClick={() => onSelectWriterId(persona.chWriterId)}
              className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 relative ${
                isSelected
                  ? 'bg-blue-50/40 dark:bg-blue-950/20 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-xs'
              }`}
            >
              {/* Header line: Name + Desc Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-serif text-sm font-bold text-slate-900 dark:text-white">{persona.chWriterName}</h4>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded-full">
                    {persona.chWriterDesc}
                  </span>
                </div>

                {/* Selection Check Circle */}
                <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 ${
                  isSelected ? 'bg-blue-600 text-white' : 'border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800'
                }`}>
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>

              {/* Prompt Instruction Excerpt */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                <p className="text-[11px] font-serif text-slate-600 dark:text-slate-400 leading-relaxed italic">
                  "{persona.chWriterPrompt}"
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
