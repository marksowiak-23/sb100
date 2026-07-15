/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import StoryMatePanel from './StoryMatePanel';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import { MEMBER_STORIES } from '@/src/features/sbPublicPage/constants/memberData';

interface CenterColumnProps {
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
}

export default function CenterColumn({
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent
}: CenterColumnProps) {
  const eleanor = MEMBER_STORIES.find((m) => m.id === 'm1') || MEMBER_STORIES[0];

  return (
    <div className="space-y-6 flex flex-col">
      
      {/* --- BACK NAVIGATION LINK --- */}
      <div>
        <button
          onClick={onClickBack}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Dashboard</span>
        </button>
      </div>

      {/* --- PROFILE SUMMARY CARD --- */}
      <SbMbrProfilePanel member={eleanor} />

      {/* --- ACTIVE SECTION CONTENT AREA --- */}
      <SbMbrBookEditor
        sectionTitle={activeSection}
        content={activeContent}
        onSave={onSaveActiveContent}
      />

      {/* --- STORY MATE PANEL --- */}
      <StoryMatePanel memberName="Eleanor" />

    </div>
  );
}
