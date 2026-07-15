import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { MemberStory } from '@/src/features/sbPublicPage/constants/memberData';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';

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
    <div className="space-y-6 flex flex-col">
      
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
      <SbMbrProfilePanel member={member} />

      {/* --- ACTIVE SECTION CONTENT AREA --- */}
      <SbMbrBookEditor sectionTitle={activeSection} content={activeContent} readOnly={true} />

    </div>
  );
}
