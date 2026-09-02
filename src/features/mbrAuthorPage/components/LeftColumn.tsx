/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import AuthorPageHeaderPanel from './AuthorPageHeaderPanel';
import MbrStoryIndexPanel from '@/src/components/mbrStoryIndexPanel';
import MbrPhotoBookPanel from '@/src/components/mbrPhotoBookPanel';
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

      {/* --- PHOTO BOOK PANEL --- */}
      <MbrPhotoBookPanel />

      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}
