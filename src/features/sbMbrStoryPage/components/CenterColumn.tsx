import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MemberStory } from '@/src/features/sbPublicPage/constants/memberData';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import SbMbrStryFamily from '@/src/components/SbMbrStryFamily';
import SbMbrStryResidence from '@/src/components/SbMbrStryResidence';
import SbMbrStryActivity from '@/src/components/SbMbrStryActivity';
import SbMbrStryAchievement from '@/src/components/SbMbrStryAchievement';
import SbMbrStryEducation from '@/src/components/SbMbrStryEducation';
import SbMbrStryEmployment from '@/src/components/SbMbrStryEmployment';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  member: MemberStory;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
}

export default function CenterColumn({
  member,
  activeSection,
  activeContent,
  onClickBack
}: CenterColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      
      {/* --- BACK NAVIGATION LINK --- */}
      <div>
        <button
          onClick={onClickBack}
          className="group inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Members</span>
        </button>
      </div>

      {/* --- PROFILE SUMMARY CARD --- */}
      <SbMbrProfilePanel memberId={member.id} profile={member} isSandbox={false} readOnly={true} />

      {/* --- FAMILY DIRECTORY PANEL --- */}
      {activeSection === 'family' && (
        <SbMbrStryFamily memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- RESIDENCES PANEL --- */}
      {activeSection === 'residencies' && (
        <SbMbrStryResidence memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- ACTIVITIES & HOBBIES PANEL --- */}
      {activeSection === 'hobbies' && (
        <SbMbrStryActivity memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
      {activeSection === 'achievements' && (
        <SbMbrStryAchievement memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
      {activeSection === 'education' && (
        <SbMbrStryEducation memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
      {activeSection === 'employment' && (
        <SbMbrStryEmployment memberId={member.id} isSandbox={false} readOnly={true} />
      )}

      {/* --- ACTIVE SECTION CONTENT AREA (for other custom text sections) --- */}
      {!['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(activeSection) && (
        <SbMbrBookEditor sectionTitle={activeSection} content={activeContent} readOnly={true} />
      )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
