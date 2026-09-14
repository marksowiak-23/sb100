import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock } from 'lucide-react';
import { MemberStory } from '@/src/features/publicPage/constants/memberData';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import MbrProfileBriefPanel from '@/src/components/mbrProfileBriefPanel';
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
  previousTab?: string | null;
  backLabel?: string;
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
  viewerMbrId,
  previousTab,
  backLabel
}: CenterColumnProps) {
  const [subordinateId, setSubordinateId] = useState<string | null>(null);
  const [subordinateName, setSubordinateName] = useState<string | undefined>(undefined);

  // Normalize topic name for security lock comparison
  const safeActiveSection = typeof activeSection === 'string' ? activeSection : 'Profile';
  const topicId = safeActiveSection.toLowerCase();
  const safeLocked = Array.isArray(lockedTopicIds) ? lockedTopicIds : [];
  const isSectionLocked = safeLocked.some(
    (id) => typeof id === 'string' && id.toLowerCase() === topicId
  );

  const effectiveMemberId = member?.mbrId || member?.id || '';

  // Reset subordinate filter when active section changes
  useEffect(() => {
    setSubordinateId(null);
    setSubordinateName(undefined);
  }, [activeSection]);

  // Listen for custom navigation events triggered from subordinate rows inside panels
  useEffect(() => {
    const handleOpenStories = (e: Event) => {
      const customEvent = e as CustomEvent<{ topicId?: string; subordinateId?: string; subordinateName?: string }>;
      if (customEvent.detail) {
        if (customEvent.detail.subordinateId) {
          setSubordinateId(customEvent.detail.subordinateId);
        } else {
          setSubordinateId(null);
        }
        if (customEvent.detail.subordinateName) {
          setSubordinateName(customEvent.detail.subordinateName);
        } else {
          setSubordinateName(undefined);
        }
        // Smoothly scroll down to the story editor panel container
        setTimeout(() => {
          const el = document.getElementById('story-editor-panel');
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

  const isStandardTopic = ['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(topicId);

  const isFromConnections = previousTab === 'mbrConnectionPage' || previousTab === 'mbrConnections';
  const isFromStoriesFeed = previousTab === 'mbrStoryFeedPage' || previousTab === 'sbStoryFeed';
  const backButtonText = backLabel || (
    isFromConnections
      ? 'Back to Connections'
      : isFromStoriesFeed
      ? 'Back to Stories'
      : 'Back to Members'
  );

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-6 relative">
      {/* Top Header / Back Action (Desktop only, mobile has it at the top of the feature) */}
      {onClickBack && (
        <div className="hidden lg:flex items-center">
          <button
            type="button"
            onClick={onClickBack}
            className="group inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all">
              <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <span>{backButtonText}</span>
          </button>
        </div>
      )}

      {/* --- PROFILE SUMMARY CARD --- */}
      {topicId === 'profile' ? (
        <MbrProfilePanel
          memberId={effectiveMemberId}
          profile={member}
          isSandbox={false}
          readOnly={true}
          defaultCollapseIntro={false}
          defaultCollapseDetails={false}
          clampIntroduction={false}
          connectionGrpName={connectionGrpName}
          isConnected={isConnected}
          viewerMbrId={viewerMbrId}
          showReadStoryButton={false}
        />
      ) : (
        <MbrProfileBriefPanel
          memberId={effectiveMemberId}
          profile={member}
          isSandbox={false}
          readOnly={true}
          connectionGrpName={connectionGrpName}
          isConnected={isConnected}
          viewerMbrId={viewerMbrId}
        />
      )}

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
            The author has set the <strong>{safeActiveSection}</strong> chapter to private and has not granted viewing privileges for your member connection group.
          </p>
        </div>
      ) : (
        <>
          {/* --- FAMILY DIRECTORY PANEL --- */}
          {(topicId === 'family') && (
            <MbrStoryFamilyPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- RESIDENCES PANEL --- */}
          {(topicId === 'residencies') && (
            <MbrStoryResidencePanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVITIES & HOBBIES PANEL --- */}
          {(topicId === 'hobbies') && (
            <MbrStoryActivityPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
          {(topicId === 'achievements') && (
            <MbrStoryAchievementPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
          {(topicId === 'education') && (
            <MbrStoryEducationPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
          {(topicId === 'employment') && (
            <MbrStoryEmploymentPanel memberId={effectiveMemberId} isSandbox={false} readOnly={true} />
          )}

          {/* --- ACTIVE SECTION CONTENT AREA (for custom text sections) --- */}
          {!isStandardTopic && topicId !== 'profile' && (
            <MbrBookEditorPanel sectionTitle={safeActiveSection} content={activeContent || []} readOnly={true} />
          )}

          {/* --- MEMBER STORIES VIEW PANEL (Displayed for standard topics) --- */}
          {isStandardTopic && (
            <div id="story-editor-panel">
              <StoryEditorPanel
                topicId={topicId}
                topicTitle={safeActiveSection}
                componentName={componentNameMap[topicId] || `sbMbrStry${safeActiveSection}`}
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
