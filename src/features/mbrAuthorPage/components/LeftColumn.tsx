/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AuthorPageHeaderPanel from './AuthorPageHeaderPanel';
import SbMyStorybookStatusCard from './SbMyStorybookStatusCard';
import MbrStoryIndexPanel from '@/src/components/mbrStoryIndexPanel';
import MbrPhotoBookPanel from '@/src/components/mbrPhotoBookPanel';
import SbMbrStats from './SbMbrStats';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
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

      {/* --- PHOTO BOOK PANEL (Desktop only) --- */}
      <div className="hidden lg:block">
        <MbrPhotoBookPanel />
      </div>

      {/* --- MEMBER STATS CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbMbrStats />
      </div>

      {/* --- STORYBOOK STATUS CARD (Desktop only) --- */}
      <div className="hidden lg:block">
        <SbMyStorybookStatusCard />
      </div>

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
