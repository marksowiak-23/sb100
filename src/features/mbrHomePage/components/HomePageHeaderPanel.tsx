/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Home } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { CoachTourTriggerButton } from '@/src/features/coachMarks';

export interface HomePageHeaderPanelProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function HomePageHeaderPanel({
  title = 'Home',
  tagline = 'Live it. Write it. Share it.',
  className = ''
}: HomePageHeaderPanelProps) {
  return (
    <div className={`hidden lg:block space-y-1.5 relative ${className}`}>
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-serif text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2.5">
          <Home className="w-7 h-7 text-slate-800 dark:text-slate-200 shrink-0" />
          <span>{title}</span>
        </h1>
        <CoachTourTriggerButton tourId="home_tour" label="Tour" />
      </div>
      <p className="font-serif text-xs italic text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <AdminComponentTag name="HomePageHeaderPanel" />
    </div>
  );
}

export { HomePageHeaderPanel as brandHeaderPanel, HomePageHeaderPanel as SbBrandHeaderCard };
