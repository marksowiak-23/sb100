/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Sparkles } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface PreferencesGuidancePanelProps {
  className?: string;
}

export default function PreferencesGuidancePanel({ className = '' }: PreferencesGuidancePanelProps) {
  return (
    <div className={`hidden lg:block relative bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-2.5 shadow-xs ${className}`}>
      <AdminComponentTag name="PreferencesGuidancePanel.tsx" />
      <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
        <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <h4 className="text-xs font-bold font-serif">Preferences Guidance</h4>
      </div>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
        Use <strong>My Story Mate</strong> to choose the AI voice and style that best represents your storytelling tone.
      </p>
      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
        Use <strong>My Workspace</strong> to configure your preferred application color theme and home page display settings.
      </p>
    </div>
  );
}

export { PreferencesGuidancePanel as PreferencesGuidanceCard };
