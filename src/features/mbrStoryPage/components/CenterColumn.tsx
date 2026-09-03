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
  const [storyEditorConfig, setStoryEditorConfig] = useState<{
    topicId: string;
    topicTitle: string;
    componentName?: string;
    subordinateId?: string | null;
    subordinateName?: string;
  } | null>(null);

  // Check if active topic/section is locked for current user
  const isSectionLocked = lockedTopicIds.some(
    (id) => id.toLowerCase() === activeSection.toLowerCase()
  );

  // Listen for open-topic-stories custom events emitted by story panels
  useEffect(() => {
    const handleOpenStories = (event: any) => {
      if (event.detail) {
        setStoryEditorConfig({
          topicId: event.detail.topicId || activeSection,
          topicTitle: event.detail.topicTitle || activeSection,
          componentName: event.detail.componentName,
          subordinateId: event.detail.subordinateId || null,
          subordinateName: event.detail.subordinateName
        });
      }
    };

    window.addEventListener('open-topic-stories', handleOpenStories);
    return () => {
      window.removeEventListener('open-topic-stories', handleOpenStories);
    };
  }, [activeSection]);

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
        memberId={(member as any).mbrId || member.id}
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
            <MbrStoryFamilyPanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- RESIDENCES PANEL --- */}
          {(activeSection.toLowerCase() === 'residencies') && (
            <MbrStoryResidencePanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVITIES & HOBBIES PANEL --- */}
          {(activeSection.toLowerCase() === 'hobbies') && (
            <MbrStoryActivityPanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
          {(activeSection.toLowerCase() === 'achievements') && (
            <MbrStoryAchievementPanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'education') && (
            <MbrStoryEducationPanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
          {(activeSection.toLowerCase() === 'employment') && (
            <MbrStoryEmploymentPanel memberId={member.id} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVE SECTION CONTENT AREA (for other custom text sections) --- */}
          {!['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(activeSection.toLowerCase()) && (
            <MbrBookEditorPanel sectionTitle={activeSection} content={activeContent} readOnly={true} />
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
