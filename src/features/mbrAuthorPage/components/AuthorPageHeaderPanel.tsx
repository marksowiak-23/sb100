/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface AuthorPageHeaderPanelProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function AuthorPageHeaderPanel({
  title = 'Storybook',
  tagline = 'Where every life becomes literature',
  className = ''
}: AuthorPageHeaderPanelProps) {
  return (
    <div className={`space-y-1 relative ${className}`}>
      <h1 className="font-serif text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2.5">
        <BookOpen className="w-7 h-7 text-slate-800 dark:text-slate-200 shrink-0" />
        <span>{title}</span>
      </h1>
      <p className="font-serif text-xs italic text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <AdminComponentTag name="AuthorPageHeaderPanel" />
    </div>
  );
}

export { AuthorPageHeaderPanel as brandHeaderPanel, AuthorPageHeaderPanel as SbBrandHeaderCard };
