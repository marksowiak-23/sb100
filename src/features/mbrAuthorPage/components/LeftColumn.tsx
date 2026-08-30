/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import SbBrandHeader from '@/src/components/SbBrandHeader';
import SbStoryIndexPanel from '@/src/components/SbStoryIndexPanel';
import SbPhotoBookPanel from '@/src/components/SbPhotoBookPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  activeSection: string;
  setActiveSection: (sec: string) => void;
}

export default function LeftColumn({ activeSection, setActiveSection }: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      {/* --- BRAND HEADER --- */}
      <SbBrandHeader />

      {/* --- STORY INDEX PANEL --- */}
      <SbStoryIndexPanel
        activeSection={activeSection}
        setActiveSection={setActiveSection}
      />

      {/* --- PHOTO BOOK PANEL --- */}
      <SbPhotoBookPanel />

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
