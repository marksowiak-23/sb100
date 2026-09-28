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
import { taskApi, Topic, matchTopicByName, DEFAULT_TOPIC_LOOKUP } from '@/src/services/api';

interface CenterColumnProps {
  isSandbox: boolean;
  activeSection: string;
  activeContent: string[];
  onClickBack: () => void;
  onSaveActiveContent: (newContent: string[]) => void;
  onClickAuthorProfile?: () => void;
}

const TOPIC_DETAILS: Record<string, { topicId: string; topicTitle: string; componentName: string; chIntentId?: string }> = {
  family: { topicId: DEFAULT_TOPIC_LOOKUP.family.topicId, topicTitle: 'Family', componentName: 'sbMbrStryFamly', chIntentId: DEFAULT_TOPIC_LOOKUP.family.chIntentId },
  residencies: { topicId: DEFAULT_TOPIC_LOOKUP.residencies.topicId, topicTitle: 'Residencies', componentName: 'sbMbrStryResidence', chIntentId: DEFAULT_TOPIC_LOOKUP.residencies.chIntentId },
  residence: { topicId: DEFAULT_TOPIC_LOOKUP.residencies.topicId, topicTitle: 'Residencies', componentName: 'sbMbrStryResidence', chIntentId: DEFAULT_TOPIC_LOOKUP.residencies.chIntentId },
  hobbies: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  activities: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  activity: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  achievements: { topicId: DEFAULT_TOPIC_LOOKUP.achievements.topicId, topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement', chIntentId: DEFAULT_TOPIC_LOOKUP.achievements.chIntentId },
  achievement: { topicId: DEFAULT_TOPIC_LOOKUP.achievements.topicId, topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement', chIntentId: DEFAULT_TOPIC_LOOKUP.achievements.chIntentId },
  education: { topicId: DEFAULT_TOPIC_LOOKUP.education.topicId, topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation', chIntentId: DEFAULT_TOPIC_LOOKUP.education.chIntentId },
  employment: { topicId: DEFAULT_TOPIC_LOOKUP.employment.topicId, topicTitle: 'Employment and Career', componentName: 'sbMbrStryEmployment', chIntentId: DEFAULT_TOPIC_LOOKUP.employment.chIntentId },
  other: { topicId: DEFAULT_TOPIC_LOOKUP.other.topicId, topicTitle: 'Other', componentName: 'sbMbrStryCustom', chIntentId: DEFAULT_TOPIC_LOOKUP.other.chIntentId },
  custom: { topicId: DEFAULT_TOPIC_LOOKUP.custom.topicId, topicTitle: 'Other', componentName: 'sbMbrStryCustom', chIntentId: DEFAULT_TOPIC_LOOKUP.custom.chIntentId },
  profile: { topicId: DEFAULT_TOPIC_LOOKUP.profile.topicId, topicTitle: 'Profile', componentName: 'SbMbrProfile', chIntentId: DEFAULT_TOPIC_LOOKUP.profile.chIntentId },
};

export default function CenterColumn({
  isSandbox,
  activeSection,
  activeContent,
  onClickBack,
  onSaveActiveContent,
  onClickAuthorProfile
}: CenterColumnProps) {
  const [dbTopics, setDbTopics] = useState<Topic[]>([]);
  const [showStoryMate, setShowStoryMate] = useState(false);
  const [subordinateId, setSubordinateId] = useState<string | null>(null);
  const [subordinateName, setSubordinateName] = useState<string | undefined>(undefined);

  // Load topics from topic table
  useEffect(() => {
    let isMounted = true;
    const fetchTopics = async () => {
      try {
        const fetched = await taskApi.getTopics();
        if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
          setDbTopics(fetched);
        }
      } catch (err) {
        console.warn("Could not load topics in CenterColumn:", err);
      }
    };
    fetchTopics();
    return () => { isMounted = false; };
  }, []);

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
    topicCustomName?: string;
    topicCustomTopicDesc?: string;
    topicCustomId?: string;
    subordinateId?: string;
  } | null>(null);

  // Reset subordinate filter and StoryMate state whenever active section changes
  useEffect(() => {
    setShowStoryMate(false);
    setStoryMateConfig(null);
    setSubordinateId(null);
    setSubordinateName(undefined);
  }, [activeSection]);

  const sec = (activeSection || 'Profile').toLowerCase();
  const matchedTopic = matchTopicByName(activeSection, dbTopics);
  const isStandardTopic = ['family', 'residencies', 'hobbies', 'activities', 'achievements', 'education', 'employment', 'other', 'custom'].includes(sec);

  const fallbackInfo = TOPIC_DETAILS[sec] || {
    topicId: sec,
    topicTitle: activeSection || 'Section',
    componentName: `sbMbrStry${activeSection}`,
    chIntentId: undefined
  };

  const currentTopicId = matchedTopic?.topicId || fallbackInfo.topicId;
  const currentChIntentId = matchedTopic?.chIntentId || fallbackInfo.chIntentId;
  const currentTopicTitle = matchedTopic?.topicFullName || matchedTopic?.topicName || fallbackInfo.topicTitle;
  const currentComponentName = fallbackInfo.componentName;

  useEffect(() => {
    const handleOpen = (e: any) => {
      const detail = e?.detail || {};
      const secKey = sec || (activeSection || '').toLowerCase();
      const resolvedFallback = DEFAULT_TOPIC_LOOKUP[secKey]?.chIntentId || TOPIC_DETAILS[secKey]?.chIntentId;
      const effectiveIntent = detail.chIntentId || currentChIntentId || resolvedFallback;
      const effectiveTopicId = detail.topicId || currentTopicId || DEFAULT_TOPIC_LOOKUP[secKey]?.topicId;
      const effectiveCompName = detail.componentName || currentComponentName || TOPIC_DETAILS[secKey]?.componentName;
      const effectiveTitle = detail.topicTitle || currentTopicTitle || TOPIC_DETAILS[secKey]?.topicTitle;

      setStoryMateConfig({
        componentName: effectiveCompName,
        topicId: effectiveTopicId,
        topicTitle: effectiveTitle,
        activeStoryId: detail.activeStoryId,
        mbrStoryThreadID: detail.mbrStoryThreadID,
        chIntentId: effectiveIntent,
        storyTitle: detail.storyTitle,
        storyContent: detail.storyContent,
        topicCustomName: detail.topicCustomName || detail.mbrCustomTopicName,
        topicCustomTopicDesc: detail.topicCustomTopicDesc || detail.topicCustomDesc || detail.mbrCustomTopicDesc || detail.topicCustomTipicDesc,
        topicCustomId: detail.topicCustomId || detail.mbrCustomTopicId || detail.subordinateId,
        subordinateId: detail.subordinateId || detail.mbrStorySubordinateId,
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
  }, [activeSection, sec, currentTopicId, currentChIntentId, currentTopicTitle, currentComponentName]);

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
          <MbrStoryFamilyPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {sec === 'residencies' && (
        <>
          <ResidenciesHeaderPanel />
          <MbrStoryResidencePanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {(sec === 'hobbies' || sec === 'activities') && (
        <>
          <ActivitiesHeaderPanel />
          <MbrStoryActivityPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {sec === 'achievements' && (
        <>
          <AchievementsHeaderPanel />
          <MbrStoryAchievementPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {sec === 'education' && (
        <>
          <EducationHeaderPanel />
          <MbrStoryEducationPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {sec === 'employment' && (
        <>
          <EmploymentHeaderPanel />
          <MbrStoryEmploymentPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {(sec === 'other' || sec === 'custom') && (
        <>
          <OtherHeaderPanel />
          <MbrStoryCustomPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {!['profile', 'family', 'residencies', 'hobbies', 'activities', 'achievements', 'education', 'employment', 'other', 'custom'].includes(sec) && (
        <>
          <TopicHeaderPanel title={activeSection} />
          <MbrBookEditorPanel sectionTitle={activeSection} content={activeContent} />
        </>
      )}

      {/* --- STORY EDITOR PANEL (Automatically shown for topic) --- */}
      {isStandardTopic && (
        <div id="story-editor-panel">
          <StoryEditorPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            topicTitle={currentTopicTitle}
            componentName={currentComponentName}
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
          key={`${storyMateConfig?.chIntentId || currentChIntentId}_${storyMateConfig?.activeStoryId || 'new'}_${storyMateConfig?.componentName || currentComponentName}`}
          memberName="Eleanor"
          componentName={storyMateConfig?.componentName || currentComponentName}
          topicId={storyMateConfig?.topicId || currentTopicId}
          storyTitle={storyMateConfig?.storyTitle}
          storyContent={storyMateConfig?.storyContent}
          mbrStoryThreadID={storyMateConfig?.mbrStoryThreadID}
          chIntentId={storyMateConfig?.chIntentId || currentChIntentId}
          topicCustomName={storyMateConfig?.topicCustomName}
          topicCustomTopicDesc={storyMateConfig?.topicCustomTopicDesc}
          topicCustomId={storyMateConfig?.topicCustomId}
          subordinateId={storyMateConfig?.subordinateId}
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
