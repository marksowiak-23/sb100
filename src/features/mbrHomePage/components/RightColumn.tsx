/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from './linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function RightColumn() {
  return (
    <div className="space-y-8 flex flex-col justify-between h-full relative">
      <SponsorsPanel />
      <LinksPanel />
      <AdminComponentTag name="RightColumn" />
    </div>
  );
}
