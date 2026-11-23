/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Compass } from 'lucide-react';
import { CoachTourId } from './types';
import { useCoachMarks } from './CoachMarkContext';

interface CoachTourTriggerButtonProps {
  tourId: CoachTourId;
  label?: string;
  className?: string;
}

export function CoachTourTriggerButton({
  tourId,
  label = 'Page Tour',
  className = ''
}: CoachTourTriggerButtonProps) {
  const { isFeatureEnabled, startTour } = useCoachMarks();

  if (!isFeatureEnabled) return null;

  return (
    <button
      type="button"
      onClick={() => startTour(tourId)}
      title={`Start interactive ${label}`}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-semibold bg-amber-50/90 hover:bg-amber-100 dark:bg-amber-950/40 dark:hover:bg-amber-900/50 text-amber-800 dark:text-amber-200 border border-amber-200/80 dark:border-amber-800/60 shadow-2xs transition-all cursor-pointer active:scale-95 whitespace-nowrap ${className}`}
    >
      <Compass className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
