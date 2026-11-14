/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface BrandHeaderPanelProps {
  title?: string;
  tagline?: string;
  className?: string;
  icon?: React.ReactNode;
}

export type SbBrandHeaderProps = BrandHeaderPanelProps;

export default function BrandHeaderPanel({
  title = 'BackStory',
  tagline = 'Where every life becomes literature',
  className = '',
  icon
}: BrandHeaderPanelProps) {
  return (
    <div className={`space-y-1 relative ${className}`}>
      <h1 className="font-serif text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-none flex items-center gap-2.5">
        {icon && <span className="shrink-0">{icon}</span>}
        <span>{title}</span>
      </h1>
      <p className="font-serif text-xs italic text-slate-500 dark:text-slate-400">
        {tagline}
      </p>
      <AdminComponentTag name="brandHeaderPanel" />
    </div>
  );
}


export { BrandHeaderPanel, BrandHeaderPanel as brandHeaderPanel, BrandHeaderPanel as SbBrandHeader };
