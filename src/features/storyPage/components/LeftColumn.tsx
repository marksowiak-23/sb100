/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import StoryPageHeaderPanel from './StoryPageHeaderPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  authorName?: string;
  authorLocation?: string;
  authorAvatarUrl?: string;
  authorInitials?: string;
  authorWorksAt?: string;
  authorStudiedAt?: string;
  authorIntroduction?: string;
  connectionGrpName?: string;
  topicName?: string;
  onClickBack?: () => void;
  onClickViewAuthorStorybook?: () => void;
}

export default function LeftColumn({
  topicName,
  onClickBack,
}: LeftColumnProps) {
  return (
    <aside className="w-full space-y-6">
      <StoryPageHeaderPanel onClickBack={onClickBack} topicName={topicName} />
      <AdminComponentTag name="storyPageLeftColumn" />
    </aside>
  );
}

export { LeftColumn as storyPageLeftColumn };

