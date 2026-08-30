/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from '@/src/components/linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function RightColumn() {
  return (
    <div className="space-y-8 flex flex-col justify-between h-full relative">
      <SponsorsPanel />
      <LinksPanel className="pt-6 border-t border-slate-100/70" />
      <AdminComponentTag name="RightColumn" />
    </div>
  );
}
