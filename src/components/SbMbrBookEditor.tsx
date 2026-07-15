/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldAlert, Edit2 } from 'lucide-react';

interface SbMbrBookEditorProps {
  sectionTitle: string;
  content: string[];
  readOnly?: boolean;
}

export default function SbMbrBookEditor({ sectionTitle, content, readOnly = false }: SbMbrBookEditorProps) {
  const formattedSectionTitle =
    sectionTitle.charAt(0).toUpperCase() + sectionTitle.slice(1);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
      {/* Status Draft indicator & Actions header */}
      <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
        <div className="flex flex-col gap-0.5">
          {!readOnly && (
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Status: Draft
            </span>
          )}
          <h3 className="font-serif text-lg font-bold text-slate-800">
            {formattedSectionTitle}
          </h3>
        </div>

        {!readOnly && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => alert('Opening Privacy settings for this draft...')}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => alert(`Simulating text editor interface for ${formattedSectionTitle}...`)}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg cursor-pointer transition-colors"
              title={`Edit ${formattedSectionTitle}`}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Scrollable text paragraphs */}
      <div className={`space-y-4 overflow-y-auto pr-1 scrollbar-thin ${readOnly ? 'max-h-[420px]' : 'max-h-56'}`}>
        {content.map((paragraph, index) => (
          <p
            key={index}
            className="text-xs md:text-sm text-slate-650 leading-relaxed font-serif text-justify"
          >
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
