/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { User } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface ProfilePageHeaderPanelProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function ProfilePageHeaderPanel({
  title = 'Profile',
  tagline = 'Where every life becomes literature',
  className = ''
}: ProfilePageHeaderPanelProps) {
  return (
    <div className={`space-y-0.5 sm:space-y-1 relative ${className}`}>
      <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2 sm:gap-2.5">
        <User className="w-6 h-6 sm:w-7 sm:h-7 text-slate-800 dark:text-slate-200 shrink-0" />
        <span>{title}</span>
      </h1>
      <p className="font-serif text-[11px] sm:text-xs italic text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <AdminComponentTag name="ProfilePageHeaderPanel" />
    </div>
  );
}

export { ProfilePageHeaderPanel as brandHeaderPanel, ProfilePageHeaderPanel as SbBrandHeaderCard };
