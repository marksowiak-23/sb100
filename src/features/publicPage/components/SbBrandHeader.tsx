/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface SbBrandHeaderProps {
  className?: string;
}

export default function SbBrandHeader({ className = '' }: SbBrandHeaderProps) {
  return (
    <div className={`space-y-2 relative ${className}`}>
      <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
        Storybook
      </h1>
      <p className="font-serif text-sm italic text-slate-500 tracking-wide">
        Live it. Write it. Share it.
      </p>
      <AdminComponentTag name="SbBrandHeader" />
    </div>
  );
}

export { SbBrandHeader as BrandHeader, SbBrandHeader as SbBrandHeaderCard };
