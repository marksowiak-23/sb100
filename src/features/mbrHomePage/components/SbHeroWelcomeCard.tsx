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
        Manage your connections, update your biography status checklist, or search for other members and read their public life chapters.
      </p>
      <AdminComponentTag name="SbHeroWelcomeCard" />
    </div>
  );
}
