/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbMbrAlbumPanel from '@/src/components/SbMbrAlbumPanel';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from '@/src/components/linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface RightColumnProps {
  memberId?: string;
  viewerMbrId?: string | null;
  memberName?: string;
}

export default function RightColumn({
  memberId,
  viewerMbrId,
  memberName
}: RightColumnProps) {
  return (
    <div className="space-y-6 flex flex-col justify-between h-full relative">
      {memberId && (
        <SbMbrAlbumPanel
          memberId={memberId}
          viewerMbrId={viewerMbrId}
          memberName={memberName}
        />
      )}
      <SponsorsPanel />
      <LinksPanel />
      <AdminComponentTag name="RightColumn" />
    </div>
  );
}
