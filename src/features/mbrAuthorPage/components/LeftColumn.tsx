/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AuthorPageHeaderPanel from './AuthorPageHeaderPanel';
import MbrStoryIndexPanel from '@/src/components/mbrStoryIndexPanel';
import SbMbrStats from './SbMbrStats';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
  onOpenStoryBookGenerator?: () => void;
  onOpenPhotoBook?: () => void;
}

export default function LeftColumn({ activeSection, setActiveSection }: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      {/* --- PAGE HEADER --- */}
      <AuthorPageHeaderPanel />

      {/* --- STORY INDEX PANEL --- */}
      <MbrStoryIndexPanel
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* --- MEMBER STATS CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbMbrStats />
      </div>

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
