/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbBrandHeaderCard from './SbBrandHeaderCard';
import SbMyNewConnectionsCard from './SbMyNewConnectionsCard';
import SbMyStorybookStatusCard from './SbMyStorybookStatusCard';
import SbMyConnectionsCard from './SbMyConnectionsCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  onClickAuthorPage?: () => void;
}

export default function LeftColumn({ onClickAuthorPage }: LeftColumnProps) {
  return (
    <div className="space-y-8 flex flex-col relative">
      <SbBrandHeaderCard />
      <SbMyNewConnectionsCard />
      <SbMyStorybookStatusCard onClickAuthorPage={onClickAuthorPage} />
      <SbMyConnectionsCard />
      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
