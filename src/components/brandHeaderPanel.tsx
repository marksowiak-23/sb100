/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbBrandHeaderProps {
  title?: string;
  tagline?: string;
  className?: string;
}

export default function SbBrandHeader({
  title = 'Storybook',
  tagline = 'Where every life becomes literature',
  className = ''
}: SbBrandHeaderProps) {
  return (
    <div className={`space-y-1 relative ${className}`}>
      <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
        {title}
      </h1>
      <p className="font-serif text-xs italic text-slate-500">
        {tagline}
      </p>
      <AdminComponentTag name="SbBrandHeader" />
    </div>
  );
}
