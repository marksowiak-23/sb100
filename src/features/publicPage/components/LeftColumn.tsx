/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbBrandHeader from './SbBrandHeader';
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
      {/* --- BRAND HEADER (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbBrandHeader />
      </div>

      {/* --- AUTH CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbPublicAuthCard setActiveTab={setActiveTab} onSelectLogonType={onSelectLogonType} />
      </div>

      {/* --- EXPLAINER CARD (Desktop: in LeftColumn; Mobile: in CenterColumn above search) --- */}
      <div className="hidden lg:block">
        <SbExplainerCard />
      </div>

      {/* --- COMMUNITY STATS CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbCommunityStatsCard />
      </div>

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
