import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { MemberStory } from '@/src/features/sbPublicPage/constants/memberData';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import SbMbrBookEditor from '@/src/components/SbMbrBookEditor';
import SbMbrStryFamily from '@/src/components/SbMbrStryFamily';
import SbMbrStryResidence from '@/src/components/SbMbrStryResidence';
import SbMbrStryActivity from '@/src/components/SbMbrStryActivity';
import SbMbrStryAchievement from '@/src/components/SbMbrStryAchievement';
import SbMbrStryEducation from '@/src/components/SbMbrStryEducation';
import SbMbrStryEmployment from '@/src/components/SbMbrStryEmployment';
import StoryEditorPanel from '@/src/features/sbMbrAuthorPage/components/StoryEditorPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  member: MemberStory;
  activeSection: string;
  activeContent: string[];
  lockedTopicIds?: string[];
  onClickBack: () => void;
}

export default function CenterColumn({
  member,
  activeSection,
  activeContent,
  lockedTopicIds = [],
  onClickBack
}: CenterColumnProps) {
  const isSectionLocked = lockedTopicIds.some(id => id.toLowerCase() === activeSection.toLowerCase());
  const [storyEditorConfig, setStoryEditorConfig] = useState<{
    topicId: string;
    topicTitle: string;
    componentName?: string;
    subordinateId?: string;
    subordinateName?: string;
  } | null>(null);

  // Hide StoryEditor panel whenever the active topic/section changes
  useEffect(() => {
    setStoryEditorConfig(null);
  }, [activeSection]);

  useEffect(() => {
    const handleOpenEditor = (e: any) => {
      const detail = e.detail || {};
      setStoryEditorConfig({
        topicId: detail.topicId || activeSection,
        topicTitle: detail.topicTitle || activeSection,
        componentName: detail.componentName,
        subordinateId: detail.subordinateId || detail.mbrStorySubordinateId,
        subordinateName: detail.subordinateName
      });
      setTimeout(() => {
        const el = document.getElementById('story-editor-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('open-story-editor', handleOpenEditor);
    return () => window.removeEventListener('open-story-editor', handleOpenEditor);
  }, [activeSection]);

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

      {/* --- LOCKED SECTION RESTRICTION NOTICE --- */}
      {isSectionLocked ? (
        <div className="p-8 rounded-3xl bg-[#FDFCFB] border border-[#EFECE7] shadow-sm text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-bold text-base text-slate-800">
            Access Restricted
          </h3>
          <p className="text-xs text-slate-500 font-serif max-w-md leading-relaxed">
            The author has set the <strong>{activeSection}</strong> chapter to private and has not granted viewing privileges for your member connection group.
          </p>
        </div>
      ) : (
        <>
          {/* --- FAMILY DIRECTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'family') && (
            <SbMbrStryFamily memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- RESIDENCES PANEL --- */}
          {(activeSection.toLowerCase() === 'residencies') && (
            <SbMbrStryResidence memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVITIES & HOBBIES PANEL --- */}
          {(activeSection.toLowerCase() === 'hobbies') && (
            <SbMbrStryActivity memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
          {(activeSection.toLowerCase() === 'achievements') && (
            <SbMbrStryAchievement memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'education') && (
            <SbMbrStryEducation memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'employment') && (
            <SbMbrStryEmployment memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVE SECTION CONTENT AREA (for other custom text sections) --- */}
          {!['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(activeSection.toLowerCase()) && (
            <SbMbrBookEditor sectionTitle={activeSection} content={activeContent} readOnly={true} />
          )}

          {/* --- MEMBER STORIES VIEW PANEL --- */}
          {storyEditorConfig && (
            <StoryEditorPanel
              topicId={storyEditorConfig.topicId}
              topicTitle={storyEditorConfig.topicTitle}
              componentName={storyEditorConfig.componentName}
              subordinateId={storyEditorConfig.subordinateId}
              subordinateName={storyEditorConfig.subordinateName}
              memberId={member.id}
              readOnly={true}
              isSandbox={false}
              onClose={() => setStoryEditorConfig(null)}
            />
          )}
        </>
      )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
