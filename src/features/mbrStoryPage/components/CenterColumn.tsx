import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MemberStory } from '@/src/features/publicPage/constants/memberData';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import MbrProfileBriefPanel from '@/src/components/mbrProfileBriefPanel';
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
import StoryEditorPanel from '@/src/features/mbrAuthorPage/components/StoryEditorPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { taskApi, Topic, matchTopicByName, DEFAULT_TOPIC_LOOKUP } from '@/src/services/api';

interface CenterColumnProps {
  member: MemberStory | any;
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
  relationships: 'sbMbrStryRelationships',
  relationship: 'sbMbrStryRelationships',
  residencies: 'sbMbrStryResidence',
  trips: 'sbMbrStryTrips',
  vacations: 'sbMbrStryTrips',
  'trips and vacations': 'sbMbrStryTrips',
  'trips & vacations': 'sbMbrStryTrips',
  health: 'sbMbrStryHealth',
  wellness: 'sbMbrStryHealth',
  'health and wellness': 'sbMbrStryHealth',
  'health & wellness': 'sbMbrStryHealth',
  'special events': 'sbMbrStrySpecialEvents',
  'special event': 'sbMbrStrySpecialEvents',
  specialevents: 'sbMbrStrySpecialEvents',
  'special-events': 'sbMbrStrySpecialEvents',
  milestones: 'sbMbrStrySpecialEvents',
  celebrations: 'sbMbrStrySpecialEvents',
  hobbies: 'sbMbrStryActivity',
  activities: 'sbMbrStryActivity',
  achievements: 'sbMbrStryAchievement',
  education: 'sbMbrStryEducation',
  employment: 'sbMbrStryEmployment',
  'fads and trends': 'sbMbrStryFadsAndTrends',
  'fads & trends': 'sbMbrStryFadsAndTrends',
  fads: 'sbMbrStryFadsAndTrends',
  trends: 'sbMbrStryFadsAndTrends',
  'movies and tv': 'sbMbrStryMoviesAndTv',
  'movies & tv': 'sbMbrStryMoviesAndTv',
  movies: 'sbMbrStryMoviesAndTv',
  tv: 'sbMbrStryMoviesAndTv',
  television: 'sbMbrStryMoviesAndTv',
  'movies and television': 'sbMbrStryMoviesAndTv',
  music: 'sbMbrStryMusic',
  songs: 'sbMbrStryMusic',
  'news of the times': 'sbMbrStryNewsOfTheTimes',
  'news of times': 'sbMbrStryNewsOfTheTimes',
  news: 'sbMbrStryNewsOfTheTimes',
  'pop culture': 'sbMbrStryPopCulture',
  popculture: 'sbMbrStryPopCulture',
  'pop-culture': 'sbMbrStryPopCulture',
  sports: 'sbMbrStrySports',
  sport: 'sbMbrStrySports',
  athletics: 'sbMbrStrySports',
  technology: 'sbMbrStryTechnology',
  tech: 'sbMbrStryTechnology',
  computers: 'sbMbrStryTechnology',
  inventions: 'sbMbrStryTechnology',
  childhood: 'sbMbrStryChildhood',
  childhoood: 'sbMbrStryChildhood',
  youth: 'sbMbrStryChildhood',
  'early years': 'sbMbrStryChildhood',
  'life reflections': 'sbMbrStryLifeReflections',
  'life reflection': 'sbMbrStryLifeReflections',
  reflections: 'sbMbrStryLifeReflections',
  reflection: 'sbMbrStryLifeReflections',
  other: 'sbMbrStryCustom',
  custom: 'sbMbrStryCustom',
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
  const [dbTopics, setDbTopics] = useState<Topic[]>([]);
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
        console.warn("Could not load topics in mbrStoryPage CenterColumn:", err);
      }
    };
    fetchTopics();
    return () => { isMounted = false; };
  }, []);

  // Normalize topic name
  const safeActiveSection = typeof activeSection === 'string' ? activeSection : 'Profile';
  const topicId = safeActiveSection.toLowerCase();

  const matchedTopic = matchTopicByName(safeActiveSection, dbTopics);
  const currentTopicId = matchedTopic?.topicId || DEFAULT_TOPIC_LOOKUP[topicId]?.topicId || topicId;
  const currentChIntentId = matchedTopic?.chIntentId || DEFAULT_TOPIC_LOOKUP[topicId]?.chIntentId;
  const currentTopicTitle = matchedTopic?.topicFullName || matchedTopic?.topicName || safeActiveSection;

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

  const isOwner = !viewerMbrId || (Boolean(effectiveMemberId) && viewerMbrId === effectiveMemberId);
  const isReadOnly = !isOwner;

  const isTopicLocked = isReadOnly && (
    lockedTopicIds.some((lid) => 
      typeof lid === 'string' && (
        lid.toLowerCase() === topicId ||
        lid.toLowerCase() === currentTopicId.toLowerCase() ||
        lid.toLowerCase() === safeActiveSection.toLowerCase() ||
        (matchedTopic?.topicName && lid.toLowerCase() === matchedTopic.topicName.toLowerCase()) ||
        (matchedTopic?.topicFullName && lid.toLowerCase() === matchedTopic.topicFullName.toLowerCase())
      )
    )
  );

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
  ].includes(topicId) || currentTopicId === '5cd2052b-28fc-434f-9ce4-4358ff944576' || currentTopicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161' || currentTopicId === '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff' || currentTopicId === '6635482f-24c8-4fdd-83d0-c5f86e22442f' || currentTopicId === '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e' || currentTopicId === 'b24de4f6-9029-4665-94bf-f42630baee61' || currentTopicId === '99e16767-c945-47f9-8e5e-21c309cceac3' || currentTopicId === '40b046fa-cfae-4821-b3b8-17fda934a61a' || currentTopicId === 'eeecb988-25d8-45d4-9304-e040aa14a326' || currentTopicId === '74e60a94-dd9e-4148-a084-86d41ed9998a' || currentTopicId === 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28' || currentTopicId === '4cd7ccff-0617-445c-ae72-173daa059500';

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
            className="group inline-flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-xs group-hover:border-blue-300 dark:group-hover:border-blue-600 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/40 transition-all">
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
          readOnly={isReadOnly}
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
          readOnly={isReadOnly}
          connectionGrpName={connectionGrpName}
          isConnected={isConnected}
          viewerMbrId={viewerMbrId}
        />
      )}

      {/* --- TOPIC DIRECTORY PANEL (When permitted) --- */}
      {!isTopicLocked && (
        <>
          {/* --- FAMILY DIRECTORY PANEL --- */}
          {(topicId === 'family') && (
            <MbrStoryFamilyPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- RELATIONSHIPS PANEL --- */}
          {(topicId === 'relationships' || topicId === 'relationship') && (
            <MbrStoryRelationshipsPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- RESIDENCES PANEL --- */}
          {(topicId === 'residencies') && (
            <MbrStoryResidencePanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- TRIPS & VACATIONS PANEL --- */}
          {(topicId === 'trips' || topicId === 'vacations' || topicId === 'trips and vacations' || topicId === 'trips & vacations' || currentTopicId === '5cd2052b-28fc-434f-9ce4-4358ff944576') && (
            <MbrStoryTripsPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- HEALTH & WELLNESS PANEL --- */}
          {(topicId === 'health' || topicId === 'wellness' || topicId === 'health and wellness' || topicId === 'health & wellness' || currentTopicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161') && (
            <MbrStoryHealthPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- SPECIAL EVENTS & MILESTONES PANEL --- */}
          {(topicId === 'special events' || topicId === 'special event' || topicId === 'specialevents' || topicId === 'special-events' || topicId === 'milestones' || topicId === 'celebrations' || currentTopicId === '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff') && (
            <MbrStorySpecialEventsPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- ACTIVITIES & HOBBIES PANEL --- */}
          {(topicId === 'hobbies' || topicId === 'activities') && (
            <MbrStoryActivityPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- ACHIEVEMENTS & RECOGNITION PANEL --- */}
          {(topicId === 'achievements') && (
            <MbrStoryAchievementPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- EDUCATION & ACADEMIC HISTORY PANEL --- */}
          {(topicId === 'education') && (
            <MbrStoryEducationPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}

          {/* --- EMPLOYMENT & PROFESSIONAL HISTORY PANEL --- */}
          {(topicId === 'employment') && (
            <MbrStoryEmploymentPanel
              memberId={effectiveMemberId}
              topicId={currentTopicId}
              chIntentId={currentChIntentId}
              isSandbox={false}
              readOnly={isReadOnly}
            />
          )}
        </>
      )}

          {/* --- MEMBER STORIES VIEW PANEL (Displayed for standard topics) --- */}
          {isStandardTopic && (
            <div id="story-editor-panel">
              <StoryEditorPanel
                topicId={currentTopicId}
                chIntentId={currentChIntentId}
                topicTitle={currentTopicTitle}
                componentName={componentNameMap[topicId] || `sbMbrStry${safeActiveSection}`}
                subordinateId={subordinateId || undefined}
                subordinateName={subordinateName}
                memberId={effectiveMemberId}
                readOnly={isReadOnly}
                isSandbox={false}
                onClose={() => {
                  setSubordinateId(null);
                  setSubordinateName(undefined);
                }}
              />
            </div>
          )}

      <AdminComponentTag name="CenterColumn" />
    </div>
  );
}
