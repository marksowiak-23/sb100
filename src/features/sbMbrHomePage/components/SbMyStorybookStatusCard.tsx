/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass, CheckCircle2, Circle } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMyStorybookStatusCardProps {
  onClickAuthorPage?: () => void;
}

export default function SbMyStorybookStatusCard({ onClickAuthorPage }: SbMyStorybookStatusCardProps) {
  const statusItems = [
    { name: 'Family', completed: true },
    { name: 'Residencies', completed: true },
    { name: 'Achievements', completed: false },
    { name: 'Education and Training', completed: false },
    { name: 'Employment and Career', completed: false },
    { name: 'Activities and Hobbies', completed: false },
    { name: 'Stories', completed: true },
    { name: 'Biography', completed: true }
  ];

  const completedCount = statusItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / statusItems.length) * 100);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <Compass className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          My Storybook Status
        </h3>
      </div>

      {/* Completion Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-serif">
          <span>Progress Indicator</span>
          <span className="text-slate-800">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-[#EFECE7]">
          <div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-850 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Categories checklist grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
        {statusItems.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-650">
            {item.completed ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            )}
            <span className="font-serif leading-none truncate">{item.name}</span>
          </div>
        ))}
      </div>

      {/* Link button to sbMbrAuthorPage */}
      <button
        onClick={onClickAuthorPage}
        className="w-full mt-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold font-serif transition-colors cursor-pointer text-center shadow-sm"
      >
        Go to Author Workspace
      </button>

      <AdminComponentTag name="SbMyStorybookStatusCard" />
    </div>
  );
}
