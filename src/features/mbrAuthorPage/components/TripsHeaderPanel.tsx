/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Plane } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface TripsHeaderPanelProps {
  onClickBack?: () => void;
  title?: string;
  description?: string;
  className?: string;
}

export default function TripsHeaderPanel({
  title = 'My Trips & Vacations',
  description = 'Document vacations, family journeys, road trips, adventures, and meaningful travels across the years.',
  className = ''
}: TripsHeaderPanelProps) {
  return (
    <div className={`relative mb-6 pb-6 border-b border-slate-200 dark:border-slate-800 ${className}`}>
      <AdminComponentTag name="TripsHeaderPanel.tsx" />

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-600 flex items-center justify-center shadow-md shadow-sky-500/20 text-white shrink-0">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
                {title}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { TripsHeaderPanel, TripsHeaderPanel as tripsHeaderPanel };
