/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import BrandHeaderPanel from './brandHeaderPanel';
import SbMyConnectionsCard from './SbMyConnectionsCard';
import SbMyStorybookStatusCard from './SbMyStorybookStatusCard';
import SbMbrStats from './SbMbrStats';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  onClickAuthorPage?: () => void;
  onClickReadStory?: (memberId: string) => void;
}

export default function LeftColumn({ onClickAuthorPage, onClickReadStory }: LeftColumnProps) {
  return (
    <div className="space-y-8 flex flex-col relative">
      <BrandHeaderPanel />
      <SbMyConnectionsCard onClickMember={onClickReadStory} />
      <SbMyStorybookStatusCard onClickAuthorPage={onClickAuthorPage} />
      <SbMbrStats />
      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
