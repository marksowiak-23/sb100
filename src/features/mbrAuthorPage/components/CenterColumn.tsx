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
import MbrStoryCustomPanel from '@/src/components/mbrStoryCustomPanel';
import ProfileHeaderPanel from './ProfileHeaderPanel';
import FamilyHeaderPanel from './FamilyHeaderPanel';
import ResidenciesHeaderPanel from './ResidenciesHeaderPanel';
import AchievementsHeaderPanel from './AchievementsHeaderPanel';
import EducationHeaderPanel from './EducationHeaderPanel';
import EmploymentHeaderPanel from './EmploymentHeaderPanel';
import ActivitiesHeaderPanel from './ActivitiesHeaderPanel';
import OtherHeaderPanel from './OtherHeaderPanel';
import TopicHeaderPanel from './TopicHeaderPanel';
import AuthorHowToCard from './AuthorHowToCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface CenterColumnProps {
  isSandbox: boolean;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
  onClickAuthorProfile?: () => void;
}

const TOPIC_DETAILS: Record<string, { topicId: string; topicTitle: string; componentName: string }> = {
  family: { topicId: 'family', topicTitle: 'Family', componentName: 'sbMbrStryFamly' },
  residencies: { topicId: 'residencies', topicTitle: 'Residencies', componentName: 'sbMbrStryResidence' },
  hobbies: { topicId: 'hobbies', topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity' },
  achievements: { topicId: 'achievements', topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement' },
  education: { topicId: 'education', topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation' },
  employment: { topicId: 'employment', topicTitle: 'Employment and Career', componentName: 'sbMbrStryEmployment' },
  other: { topicId: 'other', topicTitle: 'Other', componentName: 'sbMbrStryCustom' },
};

export default function CenterColumn({
  isSandbox,
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent,
  onClickAuthorProfile
}: CenterColumnProps) {
  const [showStoryMate, setShowStoryMate] = useState(false);
  const [subordinateId, setSubordinateId] = useState<string | null>(null);
  const [subordinateName, setSubordinateName] = useState<string | undefined>(undefined);

  // StoryMate panel configuration
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

  // Reset subordinate filter and StoryMate state whenever active section changes
  useEffect(() => {
    setShowStoryMate(false);
    setStoryMateConfig(null);
    setSubordinateId(null);
    setSubordinateName(undefined);
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
      if (detail.subordinateId || detail.mbrStorySubordinateId) {
        setSubordinateId(detail.subordinateId || detail.mbrStorySubordinateId);
      } else {
        setSubordinateId(null);
      }
      if (detail.subordinateName) {
        setSubordinateName(detail.subordinateName);
      } else {
        setSubordinateName(undefined);
      }
      setTimeout(() => {
        const el = document.getElementById('story-editor-panel');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    window.addEventListener('open-story-editor', handleOpenEditor);
    window.addEventListener('open-topic-stories', handleOpenEditor);
    return () => {
      window.removeEventListener('open-story-editor', handleOpenEditor);
      window.removeEventListener('open-topic-stories', handleOpenEditor);
    };
  }, [activeSection]);

  const sec = (activeSection || 'Profile').toLowerCase();
  const isStandardTopic = ['family', 'residencies', 'hobbies', 'achievements', 'education', 'employment', 'other'].includes(sec);
  const currentTopicInfo = TOPIC_DETAILS[sec] || {
    topicId: sec,
    topicTitle: activeSection || 'Section',
    componentName: `sbMbrStry${activeSection}`
  };

  return (
    <div className="space-y-6 flex flex-col relative">
      {/* --- HOW-TO GUIDE CARD (Desktop only; on mobile rendered above AuthorMobileMenuBar) --- */}
      <div className="hidden lg:block">
        <AuthorHowToCard />
      </div>
      
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

      {sec === 'other' && (
        <>
          <OtherHeaderPanel />
          <MbrStoryCustomPanel isSandbox={isSandbox} />
        </>
      )}

      {!['profile', 'family', 'residencies', 'hobbies', 'achievements', 'education', 'employment', 'other'].includes(sec) && (
        <>
          <TopicHeaderPanel title={activeSection} />
          <MbrBookEditorPanel sectionTitle={activeSection} content={activeContent} />
        </>
      )}

      {/* --- STORY EDITOR PANEL (Automatically shown for topic) --- */}
      {isStandardTopic && (
        <div id="story-editor-panel">
          <StoryEditorPanel
            topicId={currentTopicInfo.topicId}
            topicTitle={currentTopicInfo.topicTitle}
            componentName={currentTopicInfo.componentName}
            subordinateId={subordinateId || undefined}
            subordinateName={subordinateName}
            isSandbox={isSandbox}
            onClose={() => {
              setSubordinateId(null);
              setSubordinateName(undefined);
            }}
          />
        </div>
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
