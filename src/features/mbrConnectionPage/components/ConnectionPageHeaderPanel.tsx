/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface ConnectionPageHeaderPanelProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function ConnectionPageHeaderPanel({
  title = 'Storybook',
  tagline = 'Where every life becomes literature',
  className = ''
}: ConnectionPageHeaderPanelProps) {
  return (
    <div className={`space-y-1 relative ${className}`}>
      <h1 className="font-serif text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2.5">
        <Users className="w-7 h-7 text-slate-800 dark:text-slate-200 shrink-0" />
        <span>{title}</span>
      </h1>
      <p className="font-serif text-xs italic text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <AdminComponentTag name="ConnectionPageHeaderPanel" />
    </div>
  );
}

export { ConnectionPageHeaderPanel as brandHeaderPanel, ConnectionPageHeaderPanel as SbBrandHeaderCard };
