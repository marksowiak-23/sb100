/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbPublicAuthCard from './SbPublicAuthCard';
import SbExplainerCard from './SbExplainerCard';
import SbCommunityStatsCard from './SbCommunityStatsCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  setActiveTab: (tab: any) => void;
  onSelectLogonType?: (type: 'Google' | 'Apple') => void;
}

export default function LeftColumn({ setActiveTab, onSelectLogonType }: LeftColumnProps) {
  return (
    <div className="space-y-8 flex flex-col relative">
      {/* --- BRAND HEADER --- */}
      <div className="space-y-2">
        <h1 className="font-serif text-4xl md:text-5xl font-black text-slate-800 tracking-tight leading-none">
          Storybook
        </h1>
        <p className="font-serif text-sm italic text-slate-500 tracking-wide">
          Live it. Write it. Share it.
        </p>
      </div>

      {/* --- AUTH CARD --- */}
      <SbPublicAuthCard setActiveTab={setActiveTab} onSelectLogonType={onSelectLogonType} />

      {/* --- EXPLAINER CARD --- */}
      <SbExplainerCard />

      {/* --- COMMUNITY STATS CARD --- */}
      <SbCommunityStatsCard />

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
