/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft } from 'lucide-react';
import StoryMatePanel from './StoryMatePanel';
import SbMbrAuthorProfile from './SbMbrAuthorProfile';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import SbMbrStryFamily from './SbMbrStryFamily';
import SbMbrStryResidence from './SbMbrStryResidence';
import SbMbrStryActivity from './SbMbrStryActivity';
import SbMbrStryAchievement from './SbMbrStryAchievement';
import SbMbrStryEducation from './SbMbrStryEducation';
import SbMbrStryEmployment from './SbMbrStryEmployment';

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
        <SbMbrStryFamily isSandbox={isSandbox} />
      )}

      {/* --- RESIDENCES PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrStryResidence isSandbox={isSandbox} />
      )}

      {/* --- ACTIVITIES & HOBBIES PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrStryActivity isSandbox={isSandbox} />
      )}

      {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrStryAchievement isSandbox={isSandbox} />
      )}

      {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrStryEducation isSandbox={isSandbox} />
      )}

      {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
      {activeSection === 'introduction' && (
        <SbMbrStryEmployment isSandbox={isSandbox} />
      )}

      {/* --- STORY MATE PANEL --- */}
      <StoryMatePanel memberName="Eleanor" />

    </div>
  );
}
