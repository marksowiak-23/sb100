import React, { useState, useEffect } from 'react';
import StoryMatePanel from './StoryMatePanel';
import StoryEditorPanel from './StoryEditorPanel';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import MbrStoryFamilyPanel from '@/src/components/mbrStoryFamilyPanel';
import MbrStoryResidencePanel from '@/src/components/mbrStoryResidencePanel';
import MbrStoryActivityPanel from '@/src/components/mbrStoryActivityPanel';
import MbrStoryAchievementPanel from '@/src/components/mbrStoryAchievementPanel';
import MbrStoryEducationPanel from '@/src/components/mbrStoryEducationPanel';
import MbrStoryEmploymentPanel from '@/src/components/mbrStoryEmploymentPanel';
import MbrStoryRelationshipsPanel from '@/src/components/mbrStoryRelationshipsPanel';
import MbrStoryTripsPanel from '@/src/components/mbrStoryTripsPanel';
import MbrStoryHealthPanel from '@/src/components/mbrStoryHealthPanel';
import MbrStorySpecialEventsPanel from '@/src/components/mbrStorySpecialEventsPanel';
import ProfileHeaderPanel from './ProfileHeaderPanel';
import FamilyHeaderPanel from './FamilyHeaderPanel';
import RelationshipsHeaderPanel from './RelationshipsHeaderPanel';
import ResidenciesHeaderPanel from './ResidenciesHeaderPanel';
import TripsHeaderPanel from './TripsHeaderPanel';
import HealthHeaderPanel from './HealthHeaderPanel';
import SpecialEventsHeaderPanel from './SpecialEventsHeaderPanel';
import AchievementsHeaderPanel from './AchievementsHeaderPanel';
import EducationHeaderPanel from './EducationHeaderPanel';
import EmploymentHeaderPanel from './EmploymentHeaderPanel';
import ActivitiesHeaderPanel from './ActivitiesHeaderPanel';
import FadsHeaderPanel from './FadsHeaderPanel';
import MoviesTvHeaderPanel from './MoviesTvHeaderPanel';
import MusicHeaderPanel from './MusicHeaderPanel';
import NewsHeaderPanel from './NewsHeaderPanel';
import PopCultureHeaderPanel from './PopCultureHeaderPanel';
import SportsHeaderPanel from './SportsHeaderPanel';
import TechnologyHeaderPanel from './TechnologyHeaderPanel';
import ChildhoodHeaderPanel from './ChildhoodHeaderPanel';
import LifeReflectionsHeaderPanel from './LifeReflectionsHeaderPanel';
import OtherHeaderPanel from './OtherHeaderPanel';
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
  relationships: { topicId: DEFAULT_TOPIC_LOOKUP.relationships.topicId, topicTitle: 'Relationships', componentName: 'sbMbrStryRelationships', chIntentId: DEFAULT_TOPIC_LOOKUP.relationships.chIntentId },
  relationship: { topicId: DEFAULT_TOPIC_LOOKUP.relationships.topicId, topicTitle: 'Relationships', componentName: 'sbMbrStryRelationships', chIntentId: DEFAULT_TOPIC_LOOKUP.relationships.chIntentId },
  residencies: { topicId: DEFAULT_TOPIC_LOOKUP.residencies.topicId, topicTitle: 'Residencies', componentName: 'sbMbrStryResidence', chIntentId: DEFAULT_TOPIC_LOOKUP.residencies.chIntentId },
  residence: { topicId: DEFAULT_TOPIC_LOOKUP.residencies.topicId, topicTitle: 'Residencies', componentName: 'sbMbrStryResidence', chIntentId: DEFAULT_TOPIC_LOOKUP.residencies.chIntentId },
  trips: { topicId: DEFAULT_TOPIC_LOOKUP.trips.topicId, topicTitle: 'Trips and Vacations', componentName: 'sbMbrStryTrips', chIntentId: DEFAULT_TOPIC_LOOKUP.trips.chIntentId },
  vacations: { topicId: DEFAULT_TOPIC_LOOKUP.vacations.topicId, topicTitle: 'Trips and Vacations', componentName: 'sbMbrStryTrips', chIntentId: DEFAULT_TOPIC_LOOKUP.vacations.chIntentId },
  'trips and vacations': { topicId: DEFAULT_TOPIC_LOOKUP['trips and vacations'].topicId, topicTitle: 'Trips and Vacations', componentName: 'sbMbrStryTrips', chIntentId: DEFAULT_TOPIC_LOOKUP['trips and vacations'].chIntentId },
  'trips & vacations': { topicId: DEFAULT_TOPIC_LOOKUP['trips & vacations'].topicId, topicTitle: 'Trips and Vacations', componentName: 'sbMbrStryTrips', chIntentId: DEFAULT_TOPIC_LOOKUP['trips & vacations'].chIntentId },
  health: { topicId: DEFAULT_TOPIC_LOOKUP.health.topicId, topicTitle: 'Health', componentName: 'sbMbrStryHealth', chIntentId: DEFAULT_TOPIC_LOOKUP.health.chIntentId },
  wellness: { topicId: DEFAULT_TOPIC_LOOKUP.wellness.topicId, topicTitle: 'Health', componentName: 'sbMbrStryHealth', chIntentId: DEFAULT_TOPIC_LOOKUP.wellness.chIntentId },
  'health and wellness': { topicId: DEFAULT_TOPIC_LOOKUP['health and wellness'].topicId, topicTitle: 'Health', componentName: 'sbMbrStryHealth', chIntentId: DEFAULT_TOPIC_LOOKUP['health and wellness'].chIntentId },
  'health & wellness': { topicId: DEFAULT_TOPIC_LOOKUP['health & wellness'].topicId, topicTitle: 'Health', componentName: 'sbMbrStryHealth', chIntentId: DEFAULT_TOPIC_LOOKUP['health & wellness'].chIntentId },
  'special events': { topicId: DEFAULT_TOPIC_LOOKUP['special events'].topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP['special events'].chIntentId },
  'special event': { topicId: DEFAULT_TOPIC_LOOKUP['special event'].topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP['special event'].chIntentId },
  specialevents: { topicId: DEFAULT_TOPIC_LOOKUP.specialevents.topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP.specialevents.chIntentId },
  'special-events': { topicId: DEFAULT_TOPIC_LOOKUP['special-events'].topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP['special-events'].chIntentId },
  milestones: { topicId: DEFAULT_TOPIC_LOOKUP.milestones.topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP.milestones.chIntentId },
  celebrations: { topicId: DEFAULT_TOPIC_LOOKUP.celebrations.topicId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents', chIntentId: DEFAULT_TOPIC_LOOKUP.celebrations.chIntentId },
  hobbies: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  activities: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  activity: { topicId: DEFAULT_TOPIC_LOOKUP.activities.topicId, topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity', chIntentId: DEFAULT_TOPIC_LOOKUP.activities.chIntentId },
  achievements: { topicId: DEFAULT_TOPIC_LOOKUP.achievements.topicId, topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement', chIntentId: DEFAULT_TOPIC_LOOKUP.achievements.chIntentId },
  achievement: { topicId: DEFAULT_TOPIC_LOOKUP.achievements.topicId, topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement', chIntentId: DEFAULT_TOPIC_LOOKUP.achievements.chIntentId },
  education: { topicId: DEFAULT_TOPIC_LOOKUP.education.topicId, topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation', chIntentId: DEFAULT_TOPIC_LOOKUP.education.chIntentId },
  employment: { topicId: DEFAULT_TOPIC_LOOKUP.employment.topicId, topicTitle: 'Employment and Career', componentName: 'sbMbrStryEmployment', chIntentId: DEFAULT_TOPIC_LOOKUP.employment.chIntentId },
  'fads and trends': { topicId: '6635482f-24c8-4fdd-83d0-c5f86e22442f', topicTitle: 'Fads and Trends', componentName: 'sbMbrStryFadsAndTrends', chIntentId: DEFAULT_TOPIC_LOOKUP['fads and trends']?.chIntentId },
  'fads & trends': { topicId: '6635482f-24c8-4fdd-83d0-c5f86e22442f', topicTitle: 'Fads and Trends', componentName: 'sbMbrStryFadsAndTrends', chIntentId: DEFAULT_TOPIC_LOOKUP['fads & trends']?.chIntentId },
  fads: { topicId: '6635482f-24c8-4fdd-83d0-c5f86e22442f', topicTitle: 'Fads and Trends', componentName: 'sbMbrStryFadsAndTrends', chIntentId: DEFAULT_TOPIC_LOOKUP.fads?.chIntentId },
  trends: { topicId: '6635482f-24c8-4fdd-83d0-c5f86e22442f', topicTitle: 'Fads and Trends', componentName: 'sbMbrStryFadsAndTrends', chIntentId: DEFAULT_TOPIC_LOOKUP.trends?.chIntentId },
  'movies and tv': { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP['movies and tv']?.chIntentId },
  'movies & tv': { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP['movies & tv']?.chIntentId },
  movies: { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP.movies?.chIntentId },
  tv: { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP.tv?.chIntentId },
  television: { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP.television?.chIntentId },
  'movies and television': { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicTitle: 'Movies and TV', componentName: 'sbMbrStryMoviesAndTv', chIntentId: DEFAULT_TOPIC_LOOKUP['movies and television']?.chIntentId },
  music: { topicId: 'b24de4f6-9029-4665-94bf-f42630baee61', topicTitle: 'Music', componentName: 'sbMbrStryMusic', chIntentId: DEFAULT_TOPIC_LOOKUP.music?.chIntentId },
  songs: { topicId: 'b24de4f6-9029-4665-94bf-f42630baee61', topicTitle: 'Music', componentName: 'sbMbrStryMusic', chIntentId: DEFAULT_TOPIC_LOOKUP.songs?.chIntentId },
  'news of the times': { topicId: '99e16767-c945-47f9-8e5e-21c309cceac3', topicTitle: 'News of the Times', componentName: 'sbMbrStryNewsOfTheTimes', chIntentId: DEFAULT_TOPIC_LOOKUP['news of the times']?.chIntentId },
  'news of times': { topicId: '99e16767-c945-47f9-8e5e-21c309cceac3', topicTitle: 'News of the Times', componentName: 'sbMbrStryNewsOfTheTimes', chIntentId: DEFAULT_TOPIC_LOOKUP['news of times']?.chIntentId },
  news: { topicId: '99e16767-c945-47f9-8e5e-21c309cceac3', topicTitle: 'News of the Times', componentName: 'sbMbrStryNewsOfTheTimes', chIntentId: DEFAULT_TOPIC_LOOKUP.news?.chIntentId },
  'pop culture': { topicId: '40b046fa-cfae-4821-b3b8-17fda934a61a', topicTitle: 'Pop Culture', componentName: 'sbMbrStryPopCulture', chIntentId: DEFAULT_TOPIC_LOOKUP['pop culture']?.chIntentId },
  popculture: { topicId: '40b046fa-cfae-4821-b3b8-17fda934a61a', topicTitle: 'Pop Culture', componentName: 'sbMbrStryPopCulture', chIntentId: DEFAULT_TOPIC_LOOKUP.popculture?.chIntentId },
  'pop-culture': { topicId: '40b046fa-cfae-4821-b3b8-17fda934a61a', topicTitle: 'Pop Culture', componentName: 'sbMbrStryPopCulture', chIntentId: DEFAULT_TOPIC_LOOKUP['pop culture']?.chIntentId },
  sports: { topicId: 'eeecb988-25d8-45d4-9304-e040aa14a326', topicTitle: 'Sports', componentName: 'sbMbrStrySports', chIntentId: DEFAULT_TOPIC_LOOKUP.sports?.chIntentId },
  sport: { topicId: 'eeecb988-25d8-45d4-9304-e040aa14a326', topicTitle: 'Sports', componentName: 'sbMbrStrySports', chIntentId: DEFAULT_TOPIC_LOOKUP.sport?.chIntentId },
  athletics: { topicId: 'eeecb988-25d8-45d4-9304-e040aa14a326', topicTitle: 'Sports', componentName: 'sbMbrStrySports', chIntentId: DEFAULT_TOPIC_LOOKUP.athletics?.chIntentId },
  technology: { topicId: '74e60a94-dd9e-4148-a084-86d41ed9998a', topicTitle: 'Technology', componentName: 'sbMbrStryTechnology', chIntentId: DEFAULT_TOPIC_LOOKUP.technology?.chIntentId },
  tech: { topicId: '74e60a94-dd9e-4148-a084-86d41ed9998a', topicTitle: 'Technology', componentName: 'sbMbrStryTechnology', chIntentId: DEFAULT_TOPIC_LOOKUP.tech?.chIntentId },
  computers: { topicId: '74e60a94-dd9e-4148-a084-86d41ed9998a', topicTitle: 'Technology', componentName: 'sbMbrStryTechnology', chIntentId: DEFAULT_TOPIC_LOOKUP.computers?.chIntentId },
  inventions: { topicId: '74e60a94-dd9e-4148-a084-86d41ed9998a', topicTitle: 'Technology', componentName: 'sbMbrStryTechnology', chIntentId: DEFAULT_TOPIC_LOOKUP.inventions?.chIntentId },
  childhood: { topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', topicTitle: 'Childhood', componentName: 'sbMbrStryChildhood', chIntentId: DEFAULT_TOPIC_LOOKUP.childhood?.chIntentId },
  childhoood: { topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', topicTitle: 'Childhood', componentName: 'sbMbrStryChildhood', chIntentId: DEFAULT_TOPIC_LOOKUP.childhoood?.chIntentId },
  youth: { topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', topicTitle: 'Childhood', componentName: 'sbMbrStryChildhood', chIntentId: DEFAULT_TOPIC_LOOKUP.youth?.chIntentId },
  'early years': { topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', topicTitle: 'Childhood', componentName: 'sbMbrStryChildhood', chIntentId: DEFAULT_TOPIC_LOOKUP['early years']?.chIntentId },
  'life reflections': { topicId: '4cd7ccff-0617-445c-ae72-173daa059500', topicTitle: 'Life Reflections', componentName: 'sbMbrStryLifeReflections', chIntentId: DEFAULT_TOPIC_LOOKUP['life reflections']?.chIntentId },
  'life reflection': { topicId: '4cd7ccff-0617-445c-ae72-173daa059500', topicTitle: 'Life Reflections', componentName: 'sbMbrStryLifeReflections', chIntentId: DEFAULT_TOPIC_LOOKUP['life reflection']?.chIntentId },
  reflections: { topicId: '4cd7ccff-0617-445c-ae72-173daa059500', topicTitle: 'Life Reflections', componentName: 'sbMbrStryLifeReflections', chIntentId: DEFAULT_TOPIC_LOOKUP.reflections?.chIntentId },
  reflection: { topicId: '4cd7ccff-0617-445c-ae72-173daa059500', topicTitle: 'Life Reflections', componentName: 'sbMbrStryLifeReflections', chIntentId: DEFAULT_TOPIC_LOOKUP.reflection?.chIntentId },
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

  const isStandardTopic = [
    'family', 'relationships', 'relationship', 'residencies',
    'trips', 'vacations', 'trips and vacations', 'trips & vacations',
    'health', 'wellness', 'health and wellness', 'health & wellness',
    'special events', 'special event', 'specialevents', 'special-events', 'milestones', 'celebrations',
    'hobbies', 'activities', 'achievements', 'education', 'employment',
    'fads and trends', 'fads & trends', 'fads', 'trends',
    'movies and tv', 'movies & tv', 'movies', 'tv', 'television', 'movies and television',
    'music', 'songs',
    'news of the times', 'news of times', 'news',
    'pop culture', 'popculture', 'pop-culture',
    'sports', 'sport', 'athletics',
    'technology', 'tech', 'computers', 'inventions',
    'childhood', 'childhoood', 'youth', 'early years',
    'life reflections', 'life reflection', 'reflections', 'reflection',
    'other', 'custom'
  ].includes(sec) || currentTopicId === '5cd2052b-28fc-434f-9ce4-4358ff944576' || currentTopicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161' || currentTopicId === '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff' || currentTopicId === '6635482f-24c8-4fdd-83d0-c5f86e22442f' || currentTopicId === '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e' || currentTopicId === 'b24de4f6-9029-4665-94bf-f42630baee61' || currentTopicId === '99e16767-c945-47f9-8e5e-21c309cceac3' || currentTopicId === '40b046fa-cfae-4821-b3b8-17fda934a61a' || currentTopicId === 'eeecb988-25d8-45d4-9304-e040aa14a326' || currentTopicId === '74e60a94-dd9e-4148-a084-86d41ed9998a' || currentTopicId === 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28' || currentTopicId === '4cd7ccff-0617-445c-ae72-173daa059500';

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

      {(sec === 'relationships' || sec === 'relationship') && (
        <>
          <RelationshipsHeaderPanel />
          <MbrStoryRelationshipsPanel
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

      {(sec === 'trips' || sec === 'vacations' || sec === 'trips and vacations' || sec === 'trips & vacations' || currentTopicId === '5cd2052b-28fc-434f-9ce4-4358ff944576') && (
        <>
          <TripsHeaderPanel />
          <MbrStoryTripsPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {(sec === 'health' || sec === 'wellness' || sec === 'health and wellness' || sec === 'health & wellness' || currentTopicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161') && (
        <>
          <HealthHeaderPanel />
          <MbrStoryHealthPanel
            topicId={currentTopicId}
            chIntentId={currentChIntentId}
            isSandbox={isSandbox}
          />
        </>
      )}

      {(sec === 'special events' || sec === 'special event' || sec === 'specialevents' || sec === 'special-events' || sec === 'milestones' || sec === 'celebrations' || currentTopicId === '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff') && (
        <>
          <SpecialEventsHeaderPanel />
          <MbrStorySpecialEventsPanel
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

      {(sec === 'fads and trends' || sec === 'fads & trends' || sec === 'fads' || sec === 'trends' || currentTopicId === '6635482f-24c8-4fdd-83d0-c5f86e22442f') && (
        <FadsHeaderPanel />
      )}

      {(sec === 'movies and tv' || sec === 'movies & tv' || sec === 'movies' || sec === 'tv' || sec === 'television' || sec === 'movies and television' || currentTopicId === '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e') && (
        <MoviesTvHeaderPanel />
      )}

      {(sec === 'music' || sec === 'songs' || currentTopicId === 'b24de4f6-9029-4665-94bf-f42630baee61') && (
        <MusicHeaderPanel />
      )}

      {(sec === 'news of the times' || sec === 'news of times' || sec === 'news' || currentTopicId === '99e16767-c945-47f9-8e5e-21c309cceac3') && (
        <NewsHeaderPanel />
      )}

      {(sec === 'pop culture' || sec === 'popculture' || sec === 'pop-culture' || currentTopicId === '40b046fa-cfae-4821-b3b8-17fda934a61a') && (
        <PopCultureHeaderPanel />
      )}

      {(sec === 'sports' || sec === 'sport' || sec === 'athletics' || currentTopicId === 'eeecb988-25d8-45d4-9304-e040aa14a326') && (
        <SportsHeaderPanel />
      )}

      {(sec === 'technology' || sec === 'tech' || sec === 'computers' || sec === 'inventions' || currentTopicId === '74e60a94-dd9e-4148-a084-86d41ed9998a') && (
        <TechnologyHeaderPanel />
      )}

      {(sec === 'childhood' || sec === 'childhoood' || sec === 'youth' || sec === 'early years' || currentTopicId === 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28') && (
        <ChildhoodHeaderPanel />
      )}

      {(sec === 'life reflections' || sec === 'life reflection' || sec === 'reflections' || sec === 'reflection' || currentTopicId === '4cd7ccff-0617-445c-ae72-173daa059500') && (
        <LifeReflectionsHeaderPanel />
      )}

      {(sec === 'other' || sec === 'custom' || (!['profile', 'family', 'residencies', 'trips', 'vacations', 'trips and vacations', 'trips & vacations', 'health', 'wellness', 'health and wellness', 'health & wellness', 'special events', 'special event', 'specialevents', 'special-events', 'milestones', 'celebrations', 'hobbies', 'activities', 'achievements', 'education', 'employment', 'relationships', 'relationship', 'fads and trends', 'fads & trends', 'fads', 'trends', 'movies and tv', 'movies & tv', 'movies', 'tv', 'television', 'movies and television', 'music', 'songs', 'news of the times', 'news of times', 'news', 'pop culture', 'popculture', 'pop-culture', 'sports', 'sport', 'athletics', 'technology', 'tech', 'computers', 'inventions', 'childhood', 'childhoood', 'youth', 'early years', 'life reflections', 'life reflection', 'reflections', 'reflection'].includes(sec) && currentTopicId !== '5cd2052b-28fc-434f-9ce4-4358ff944576' && currentTopicId !== '273184ab-e09d-49ef-b416-3fc3ba0a8161' && currentTopicId !== '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff' && currentTopicId !== '6635482f-24c8-4fdd-83d0-c5f86e22442f' && currentTopicId !== '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e' && currentTopicId !== 'b24de4f6-9029-4665-94bf-f42630baee61' && currentTopicId !== '99e16767-c945-47f9-8e5e-21c309cceac3' && currentTopicId !== '40b046fa-cfae-4821-b3b8-17fda934a61a' && currentTopicId !== 'eeecb988-25d8-45d4-9304-e040aa14a326' && currentTopicId !== '74e60a94-dd9e-4148-a084-86d41ed9998a' && currentTopicId !== 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28' && currentTopicId !== '4cd7ccff-0617-445c-ae72-173daa059500')) && (
        <OtherHeaderPanel />
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
