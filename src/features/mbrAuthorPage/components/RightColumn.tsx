/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MbrAuthorPhotoBookPanel from '@/src/components/mbrAuthorPhotoBookPanel';
import StoryBookGeneratorCard from './StoryBookGeneratorCard';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from '@/src/components/linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface RightColumnProps {
  onOpenPhotoBook?: () => void;
  onOpenStoryBookGenerator?: () => void;
}

export default function RightColumn({ onOpenPhotoBook, onOpenStoryBookGenerator }: RightColumnProps) {
  const handleLaunchPhotoBook = () => {
    if (onOpenPhotoBook) {
      onOpenPhotoBook();
    } else {
      window.dispatchEvent(new CustomEvent('open-photo-book'));
    }
  };

  return (
    <div className="space-y-6 flex flex-col justify-between h-full relative">
      <MbrAuthorPhotoBookPanel onOpenPhotoBook={handleLaunchPhotoBook} />
      <StoryBookGeneratorCard onOpenStoryBookGenerator={onOpenStoryBookGenerator} />
      <SponsorsPanel />
      <LinksPanel />
      <AdminComponentTag name="RightColumn" />
    </div>
  );
}
