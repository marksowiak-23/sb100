/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
import SparksHeaderPanel from './SparksHeaderPanel';

export interface AuthorTopicHeaderPanelProps {
  activeSection: string;
  currentTopicId?: string;
  className?: string;
}

export default function AuthorTopicHeaderPanel({
  activeSection,
  currentTopicId,
  className = ''
}: AuthorTopicHeaderPanelProps) {
  const sec = (activeSection || 'Profile').toLowerCase();
  const topicId = currentTopicId || sec;

  if (sec === 'profile') {
    return <ProfileHeaderPanel className={className} />;
  }
  if (sec === 'family') {
    return <FamilyHeaderPanel className={className} />;
  }
  if (sec === 'relationships' || sec === 'relationship') {
    return <RelationshipsHeaderPanel className={className} />;
  }
  if (sec === 'residencies' || sec === 'residence') {
    return <ResidenciesHeaderPanel className={className} />;
  }
  if (
    sec === 'trips' ||
    sec === 'vacations' ||
    sec === 'trips and vacations' ||
    sec === 'trips & vacations' ||
    topicId === '5cd2052b-28fc-434f-9ce4-4358ff944576'
  ) {
    return <TripsHeaderPanel className={className} />;
  }
  if (
    sec === 'health' ||
    sec === 'wellness' ||
    sec === 'health and wellness' ||
    sec === 'health & wellness' ||
    topicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161'
  ) {
    return <HealthHeaderPanel className={className} />;
  }
  if (
    sec === 'special events' ||
    sec === 'special event' ||
    sec === 'specialevents' ||
    sec === 'special-events' ||
    sec === 'milestones' ||
    sec === 'celebrations' ||
    topicId === '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff'
  ) {
    return <SpecialEventsHeaderPanel className={className} />;
  }
  if (sec === 'hobbies' || sec === 'activities' || sec === 'activity') {
    return <ActivitiesHeaderPanel className={className} />;
  }
  if (sec === 'achievements' || sec === 'achievement') {
    return <AchievementsHeaderPanel className={className} />;
  }
  if (sec === 'education') {
    return <EducationHeaderPanel className={className} />;
  }
  if (sec === 'employment') {
    return <EmploymentHeaderPanel className={className} />;
  }
  if (
    sec === 'fads and trends' ||
    sec === 'fads & trends' ||
    sec === 'fads' ||
    sec === 'trends' ||
    topicId === '6635482f-24c8-4fdd-83d0-c5f86e22442f'
  ) {
    return <FadsHeaderPanel className={className} />;
  }
  if (
    sec === 'movies and tv' ||
    sec === 'movies & tv' ||
    sec === 'movies' ||
    sec === 'tv' ||
    sec === 'television' ||
    sec === 'movies and television' ||
    topicId === '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e'
  ) {
    return <MoviesTvHeaderPanel className={className} />;
  }
  if (sec === 'music' || sec === 'songs' || topicId === 'b24de4f6-9029-4665-94bf-f42630baee61') {
    return <MusicHeaderPanel className={className} />;
  }
  if (
    sec === 'news of the times' ||
    sec === 'news of times' ||
    sec === 'news' ||
    topicId === '99e16767-c945-47f9-8e5e-21c309cceac3'
  ) {
    return <NewsHeaderPanel className={className} />;
  }
  if (
    sec === 'pop culture' ||
    sec === 'popculture' ||
    sec === 'pop-culture' ||
    topicId === '40b046fa-cfae-4821-b3b8-17fda934a61a'
  ) {
    return <PopCultureHeaderPanel className={className} />;
  }
  if (
    sec === 'sports' ||
    sec === 'sport' ||
    sec === 'athletics' ||
    topicId === 'eeecb988-25d8-45d4-9304-e040aa14a326'
  ) {
    return <SportsHeaderPanel className={className} />;
  }
  if (
    sec === 'technology' ||
    sec === 'tech' ||
    sec === 'computers' ||
    sec === 'inventions' ||
    topicId === '74e60a94-dd9e-4148-a084-86d41ed9998a'
  ) {
    return <TechnologyHeaderPanel className={className} />;
  }
  if (
    sec === 'childhood' ||
    sec === 'childhoood' ||
    sec === 'youth' ||
    sec === 'early years' ||
    topicId === 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28'
  ) {
    return <ChildhoodHeaderPanel className={className} />;
  }
  if (
    sec === 'life reflections' ||
    sec === 'life reflection' ||
    sec === 'reflections' ||
    sec === 'reflection' ||
    topicId === '4cd7ccff-0617-445c-ae72-173daa059500'
  ) {
    return <LifeReflectionsHeaderPanel className={className} />;
  }
  if (
    sec === 'sparks' ||
    sec === 'question spark' ||
    sec === 'spark' ||
    sec === 'question sparks' ||
    topicId === 'bee8fe90-e799-4b8a-a52b-cbf390f43d2e'
  ) {
    return <SparksHeaderPanel className={className} />;
  }

  return <OtherHeaderPanel className={className} />;
}
