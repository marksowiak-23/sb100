/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbHeroWelcomeCard() {
  return (
    <div className="space-y-3 relative">
      <h2 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-tight">
        Welcome to your Storybook
      </h2>
      <p className="text-slate-500 text-xs md:text-sm leading-relaxed max-w-xl font-serif">
        Discover the stories of friends and family while sharing the moments that shaped your own -- Live it. Write it. Share it.
      </p>
      <AdminComponentTag name="SbHeroWelcomeCard" />
    </div>
  );
}
