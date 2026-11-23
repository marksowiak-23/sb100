/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import MbrAuthorPhotoBookPanel from '@/src/components/mbrAuthorPhotoBookPanel';
import MbrAuthorVoicePanel from '@/src/components/mbrAuthorVoicePanel';
import MbrAuthorAiPhotoPanel from '@/src/components/mbrAuthorAiPhotoPanel';
import StoryBookGeneratorCard from './StoryBookGeneratorCard';
import SponsorsPanel from '@/src/components/SponsorsPanel';
import LinksPanel from '@/src/components/linksPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface RightColumnProps {
  onOpenPhotoBook?: () => void;
  onOpenStoryBookGenerator?: () => void;
  onOpenVoiceTranslation?: () => void;
}

export default function RightColumn({
  onOpenPhotoBook,
  onOpenStoryBookGenerator,
  onOpenVoiceTranslation,
}: RightColumnProps) {
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
      <div data-coach-mark="author-voice-panel">
        <MbrAuthorVoicePanel onOpenVoiceTranslation={onOpenVoiceTranslation} />
      </div>
      <div data-coach-mark="author-ai-photo-panel">
        <MbrAuthorAiPhotoPanel />
      </div>
      <StoryBookGeneratorCard onOpenStoryBookGenerator={onOpenStoryBookGenerator} />
      <SponsorsPanel />
      <LinksPanel />
      <AdminComponentTag name="RightColumn" />
    </div>
  );
}
