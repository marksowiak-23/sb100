/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import StoryMatePanel from './StoryMatePanel';
import SbMbrAuthorProfile from './SbMbrAuthorProfile';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import SbMbrFamily from './SbMbrFamily';
import SbMbrResidence from './SbMbrResidence';
import SbMbrActivity from './SbMbrActivity';
import SbMbrAchievement from './SbMbrAchievement';

interface CenterColumnProps {
  isSandbox: boolean;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
}

export default function CenterColumn({
  isSandbox,
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent
}: CenterColumnProps) {
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
      <SbMbrAuthorProfile isSandbox={isSandbox} />

      {/* --- ACTIVE SECTION CONTENT AREA --- */}
      <SbMbrBookEditor
        sectionTitle={activeSection}
        content={activeContent}
        onSave={onSaveActiveContent}
      />

      {/* --- FAMILY DIRECTORY PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrFamily isSandbox={isSandbox} />
      )}

      {/* --- RESIDENCES PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrResidence isSandbox={isSandbox} />
      )}

      {/* --- ACTIVITIES & HOBBIES PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrActivity isSandbox={isSandbox} />
      )}

      {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrAchievement isSandbox={isSandbox} />
      )}

      {/* --- STORY MATE PANEL --- */}
      <StoryMatePanel memberName="Eleanor" />

    </div>
  );
}
