import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { MemberStory } from '@/src/features/publicPage/constants/memberData';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import MbrBookEditorPanel from '@/src/components/mbrBookEditorPanel';
import MbrStoryFamilyPanel from '@/src/components/mbrStoryFamilyPanel';
import MbrStoryResidencePanel from '@/src/components/mbrStoryResidencePanel';
import MbrStoryActivityPanel from '@/src/components/mbrStoryActivityPanel';
import MbrStoryAchievementPanel from '@/src/components/mbrStoryAchievementPanel';
import MbrStoryEducationPanel from '@/src/components/mbrStoryEducationPanel';
import MbrStoryEmploymentPanel from '@/src/components/mbrStoryEmploymentPanel';
import StoryEditorPanel from '@/src/features/mbrAuthorPage/components/StoryEditorPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  member: MemberStory;
  activeSection: string;
  activeContent: string[];
  lockedTopicIds?: string[];
  onClickBack: () => void;
  connectionGrpName?: string;
  isConnected?: boolean;
  viewerMbrId?: string | null;
}

const componentNameMap: Record<string, string> = {
  family: 'sbMbrStryFamly',
  residencies: 'sbMbrStryResidence',
  hobbies: 'sbMbrStryActivity',
  achievements: 'sbMbrStryAchievement',
  education: 'sbMbrStryEducation',
  employment: 'sbMbrStryEmployment',
};

export default function CenterColumn({
  member,
  activeSection,
  activeContent,
  lockedTopicIds = [],
  onClickBack,
  connectionGrpName,
  isConnected,
  viewerMbrId
}: CenterColumnProps) {
  const [subordinateId, setSubordinateId] = useState<string | null>(null);
  const [subordinateName, setSubordinateName] = useState<string | undefined>(undefined);

  const effectiveMemberId = (member as any).mbrId || member.id;

  // Check if active topic/section is locked for current user
  const isSectionLocked = lockedTopicIds.some(
    (id) => id.toLowerCase() === activeSection.toLowerCase()
  );

  // Reset subordinate filter when active section changes
  useEffect(() => {
    setSubordinateId(null);
    setSubordinateName(undefined);
  }, [activeSection]);

  // Listen for open-story-editor and open-topic-stories custom events emitted by story panels
  useEffect(() => {
    const handleOpenStories = (event: any) => {
      if (event.detail) {
        const detail = event.detail;
        setSubordinateId(detail.subordinateId || detail.mbrStorySubordinateId || null);
        setSubordinateName(detail.subordinateName || undefined);

        setTimeout(() => {
          const el = document.getElementById('story-editor-panel');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 100);
      }
    };

    window.addEventListener('open-story-editor', handleOpenStories);
    window.addEventListener('open-topic-stories', handleOpenStories);
    return () => {
      window.removeEventListener('open-story-editor', handleOpenStories);
      window.removeEventListener('open-topic-stories', handleOpenStories);
    };
  }, [activeSection]);

  const isStandardTopic = ['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(activeSection.toLowerCase());

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-6 relative">
      {/* Top Header / Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={onClickBack}
          className="flex items-center gap-2 text-xs font-serif text-slate-500 hover:text-slate-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Members</span>
        </button>
      </div>

      {/* --- PROFILE SUMMARY CARD --- */}
      <MbrProfilePanel
        memberId={effectiveMemberId}
        profile={member}
        isSandbox={false}
        readOnly={true}
        defaultCollapseIntro={true}
        connectionGrpName={connectionGrpName}
        isConnected={isConnected}
        viewerMbrId={viewerMbrId}
        showReadStoryButton={false}
      />

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
            <MbrStoryFamilyPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- RESIDENCES PANEL --- */}
          {(activeSection.toLowerCase() === 'residencies') && (
            <MbrStoryResidencePanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVITIES & HOBBIES PANEL --- */}
          {(activeSection.toLowerCase() === 'hobbies') && (
            <MbrStoryActivityPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
          {(activeSection.toLowerCase() === 'achievements') && (
            <MbrStoryAchievementPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'education') && (
            <MbrStoryEducationPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'employment') && (
            <MbrStoryEmploymentPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVE SECTION CONTENT AREA (for custom text sections) --- */}
          {!isStandardTopic && (
            <MbrBookEditorPanel sectionTitle={activeSection} content={activeContent} readOnly={true} />
          )}

          {/* --- MEMBER STORIES VIEW PANEL (Displayed for standard topics) --- */}
          {isStandardTopic && (
            <div id="story-editor-panel">
              <StoryEditorPanel
                topicId={activeSection.toLowerCase()}
                topicTitle={activeSection}
                componentName={componentNameMap[activeSection.toLowerCase()] || `sbMbrStry${activeSection}`}
                subordinateId={subordinateId || undefined}
                subordinateName={subordinateName}
                memberId={effectiveMemberId}
                readOnly={true}
                isSandbox={false}
                onClose={() => {
                  setSubordinateId(null);
                  setSubordinateName(undefined);
                }}
              />
            </div>
          )}
        </>
      )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
