/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function RightColumn() {
  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-6">
      <SponsorsPanel />
      <AdminComponentTag name="storyPageRightColumn" />
    </aside>
  );
}

export { RightColumn as storyPageRightColumn };
