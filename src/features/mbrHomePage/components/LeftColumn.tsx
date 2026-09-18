/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import HomePageHeaderPanel from './HomePageHeaderPanel';
import SbMyConnectionsCard from './SbMyConnectionsCard';
import SbEasyStoryWritingCard from './SbEasyStoryWritingCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  onClickAuthorPage?: () => void;
  onClickReadStory?: (memberId: string) => void;
}

export default function LeftColumn({ onClickAuthorPage, onClickReadStory }: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      <HomePageHeaderPanel />
      <SbEasyStoryWritingCard onClickAuthorPage={onClickAuthorPage} />
      <SbMyConnectionsCard onClickMember={onClickReadStory} />
      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}

