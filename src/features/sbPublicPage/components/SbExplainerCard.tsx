/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbExplainerCard() {
  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 relative">
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

      <AdminComponentTag name="SbExplainerCard" />
    </div>
  );
}
