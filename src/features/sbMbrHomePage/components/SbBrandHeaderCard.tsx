/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbBrandHeaderCard() {
  return (
    <div className="space-y-1 relative">
      <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
        Storybook
      </h1>
      <p className="font-serif text-xs italic text-slate-500">
        Where every life becomes literature
      </p>
      <AdminComponentTag name="SbBrandHeaderCard" />
    </div>
  );
}
