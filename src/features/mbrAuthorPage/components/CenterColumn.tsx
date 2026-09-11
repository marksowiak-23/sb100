import React, { useState, useEffect } from 'react';
import StoryMatePanel from './StoryMatePanel';
import StoryEditorPanel from './StoryEditorPanel';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import MbrBookEditorPanel from '@/src/components/mbrBookEditorPanel';
import MbrStoryFamilyPanel from '@/src/components/mbrStoryFamilyPanel';
import MbrStoryResidencePanel from '@/src/components/mbrStoryResidencePanel';
import MbrStoryActivityPanel from '@/src/components/mbrStoryActivityPanel';
import MbrStoryAchievementPanel from '@/src/components/mbrStoryAchievementPanel';
import MbrStoryEducationPanel from '@/src/components/mbrStoryEducationPanel';
import MbrStoryEmploymentPanel from '@/src/components/mbrStoryEmploymentPanel';
import ProfileHeaderPanel from './ProfileHeaderPanel';
import FamilyHeaderPanel from './FamilyHeaderPanel';
import ResidenciesHeaderPanel from './ResidenciesHeaderPanel';
import AchievementsHeaderPanel from './AchievementsHeaderPanel';
import EducationHeaderPanel from './EducationHeaderPanel';
import EmploymentHeaderPanel from './EmploymentHeaderPanel';
import ActivitiesHeaderPanel from './ActivitiesHeaderPanel';
import TopicHeaderPanel from './TopicHeaderPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  isSandbox: boolean;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
  onClickAuthorProfile?: () => void;
}

export default function CenterColumn({
  isSandbox,
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent,
  onClickAuthorProfile
}: CenterColumnProps) {
  const [showStoryMate, setShowStoryMate] = useState(false);
  const [storyEditorConfig, setStoryEditorConfig] = useState<{
    topicId: string;
    topicTitle: string;
    componentName?: string;
    subordinateId?: string;
    subordinateName?: string;
  } | null>(null);

  // Hide StoryMate panel and StoryEditor panel whenever the active topic/section changes
  const [storyMateConfig, setStoryMateConfig] = useState<{
    componentName?: string;
    topicId?: string;
    topicTitle?: string;
    activeStoryId?: string;
    mbrStoryThreadID?: string;
    chIntentId?: string;
    storyTitle?: string;
    storyContent?: string;
  } | null>(null);

  useEffect(() => {
    setShowStoryMate(false);
    setStoryMateConfig(null);
    setStoryEditorConfig(null);
  }, [activeSection]);

  useEffect(() => {
    const handleOpen = (e: any) => {
      const detail = e?.detail || {};
      setStoryMateConfig({
        componentName: detail.componentName,
        topicId: detail.topicId || activeSection,
        topicTitle: detail.topicTitle,
        activeStoryId: detail.activeStoryId,
        mbrStoryThreadID: detail.mbrStoryThreadID,
        chIntentId: detail.chIntentId,
        storyTitle: detail.storyTitle,
        storyContent: detail.storyContent,
      });
      setShowStoryMate(true);
      setTimeout(() => {
        const el = document.getElementById('story-mate-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    };
    window.addEventListener('open-story-mate', handleOpen);
    return () => window.removeEventListener('open-story-mate', handleOpen);
  }, [activeSection]);

  useEffect(() => {
    const handleOpenEditor = (e: any) => {
      const detail = e.detail || {};
      setStoryEditorConfig({
        topicId: detail.topicId || activeSection,
        topicTitle: detail.topicTitle || 'Section',
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

  const sec = activeSection.toLowerCase();

  return (
    <div className="space-y-6 flex flex-col relative">
      
      {/* --- TOPIC HEADER PANELS --- */}
      {sec === 'profile' && (
        <>
          <ProfileHeaderPanel />
          <MbrProfilePanel
            isSandbox={isSandbox}
            showConnectButton={false}
            showReadStoryButton={false}
            onClickAuthorProfile={onClickAuthorProfile}
          />
        </>
      )}

      {sec === 'family' && (
        <>
          <FamilyHeaderPanel />
          <MbrStoryFamilyPanel isSandbox={isSandbox} />
        </>
      )}

      {sec === 'residencies' && (
        <>
          <ResidenciesHeaderPanel />
          <MbrStoryResidencePanel isSandbox={isSandbox} />
        </>
      )}

      {sec === 'hobbies' && (
        <>
          <ActivitiesHeaderPanel />
          <MbrStoryActivityPanel isSandbox={isSandbox} />
        </>
      )}

      {sec === 'achievements' && (
        <>
          <AchievementsHeaderPanel />
          <MbrStoryAchievementPanel isSandbox={isSandbox} />
        </>
      )}

      {sec === 'education' && (
        <>
          <EducationHeaderPanel />
          <MbrStoryEducationPanel isSandbox={isSandbox} />
        </>
      )}

      {sec === 'employment' && (
        <>
          <EmploymentHeaderPanel />
          <MbrStoryEmploymentPanel isSandbox={isSandbox} />
        </>
      )}

      {!['profile', 'family', 'residencies', 'hobbies', 'achievements', 'education', 'employment'].includes(sec) && (
        <>
          <TopicHeaderPanel title={activeSection} />
          <MbrBookEditorPanel sectionTitle={activeSection} content={activeContent} />
        </>
      )}

      {storyEditorConfig && (
        <StoryEditorPanel
          topicId={storyEditorConfig.topicId}
          topicTitle={storyEditorConfig.topicTitle}
          componentName={storyEditorConfig.componentName}
          subordinateId={storyEditorConfig.subordinateId}
          subordinateName={storyEditorConfig.subordinateName}
          isSandbox={isSandbox}
          onClose={() => setStoryEditorConfig(null)}
        />
      )}

      {/* --- STORY MATE PANEL --- */}
      {showStoryMate && (
        <StoryMatePanel
          memberName="Eleanor"
          componentName={storyMateConfig?.componentName}
          topicId={storyMateConfig?.topicId || activeSection}
          storyTitle={storyMateConfig?.storyTitle}
          storyContent={storyMateConfig?.storyContent}
          mbrStoryThreadID={storyMateConfig?.mbrStoryThreadID}
          chIntentId={storyMateConfig?.chIntentId}
          onClose={() => {
            setShowStoryMate(false);
            setStoryMateConfig(null);
          }}
        />
      )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
