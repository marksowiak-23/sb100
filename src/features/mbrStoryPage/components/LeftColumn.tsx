/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MbrStoryIndexPanel from '@/src/components/mbrStoryIndexPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  memberName: string;
  memberId?: string;
  viewerMbrId?: string | null;
  lockedPanelIds?: string[];
  lockedTopicIds?: string[];
  onClickBack?: () => void;
}

export default function LeftColumn({
  activeSection,
  setActiveSection,
  memberId,
  viewerMbrId,
  lockedPanelIds = [],
  lockedTopicIds = []
}: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      {/* --- BRAND HEADER --- */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
          Storybook
        </h1>
        <p className="font-serif text-xs italic text-slate-500">
          Where every life becomes literature
        </p>
      </div>

      {/* --- STORY INDEX PANEL --- */}
      <MbrStoryIndexPanel
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        memberId={memberId}
        viewerMbrId={viewerMbrId}
        lockedPanelIds={lockedPanelIds}
        lockedTopicIds={lockedTopicIds}
        showEditControls={false}
        isStoryPage={true}
      />

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
