/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import ProfileHeaderPanel from './ProfileHeaderPanel';
import FamilyHeaderPanel from './FamilyHeaderPanel';
import RelationshipsHeaderPanel from './RelationshipsHeaderPanel';
import ResidenciesHeaderPanel from './ResidenciesHeaderPanel';
import TripsHeaderPanel from './TripsHeaderPanel';
import HealthHeaderPanel from './HealthHeaderPanel';
import SpecialEventsHeaderPanel from './SpecialEventsHeaderPanel';
import EventHeaderPanel from './EventHeaderPanel';
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

const FALLBACK_CAROUSEL_IMAGES = [
  '/carousel_your_story.jpg',
  '/carousel_shared_memories.jpg',
  '/carousel_life_book.jpg',
];

function getTopicCarouselImages(topicKey: string): string[] {
  return [
    `/assets/topic-headers/${topicKey}_1.jpg`,
    `/assets/topic-headers/${topicKey}_2.jpg`,
    `/assets/topic-headers/${topicKey}_3.jpg`,
  ];
}

function resolveTopicDescriptor(activeSection: string, currentTopicId?: string): {
  key: string;
  renderHeader: (innerClassName: string) => React.ReactNode;
} {
  const sec = (activeSection || 'Profile').toLowerCase();
  const topicId = currentTopicId || sec;

  if (sec === 'profile') {
    return { key: 'profile', renderHeader: (c) => <ProfileHeaderPanel className={c} /> };
  }
  if (sec === 'family') {
    return { key: 'family', renderHeader: (c) => <FamilyHeaderPanel className={c} /> };
  }
  if (sec === 'relationships' || sec === 'relationship') {
    return { key: 'relationships', renderHeader: (c) => <RelationshipsHeaderPanel className={c} /> };
  }
  if (sec === 'residencies' || sec === 'residence') {
    return { key: 'residencies', renderHeader: (c) => <ResidenciesHeaderPanel className={c} /> };
  }
  if (
    sec === 'trips' ||
    sec === 'vacations' ||
    sec === 'trips and vacations' ||
    sec === 'trips & vacations' ||
    topicId === '5cd2052b-28fc-434f-9ce4-4358ff944576'
  ) {
    return { key: 'trips', renderHeader: (c) => <TripsHeaderPanel className={c} /> };
  }
  if (
    sec === 'health' ||
    sec === 'wellness' ||
    sec === 'health and wellness' ||
    sec === 'health & wellness' ||
    topicId === '273184ab-e09d-49ef-b416-3fc3ba0a8161'
  ) {
    return { key: 'health', renderHeader: (c) => <HealthHeaderPanel className={c} /> };
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
    return { key: 'special_events', renderHeader: (c) => <SpecialEventsHeaderPanel className={c} /> };
  }
  if (sec === 'hobbies' || sec === 'activities' || sec === 'activity') {
    return { key: 'activities', renderHeader: (c) => <ActivitiesHeaderPanel className={c} /> };
  }
  if (sec === 'achievements' || sec === 'achievement') {
    return { key: 'achievements', renderHeader: (c) => <AchievementsHeaderPanel className={c} /> };
  }
  if (sec === 'education') {
    return { key: 'education', renderHeader: (c) => <EducationHeaderPanel className={c} /> };
  }
  if (sec === 'employment') {
    return { key: 'employment', renderHeader: (c) => <EmploymentHeaderPanel className={c} /> };
  }
  if (
    sec === 'fads and trends' ||
    sec === 'fads & trends' ||
    sec === 'fads' ||
    sec === 'trends' ||
    topicId === '6635482f-24c8-4fdd-83d0-c5f86e22442f'
  ) {
    return { key: 'fads', renderHeader: (c) => <FadsHeaderPanel className={c} /> };
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
    return { key: 'movies_tv', renderHeader: (c) => <MoviesTvHeaderPanel className={c} /> };
  }
  if (sec === 'music' || sec === 'songs' || topicId === 'b24de4f6-9029-4665-94bf-f42630baee61') {
    return { key: 'music', renderHeader: (c) => <MusicHeaderPanel className={c} /> };
  }
  if (
    sec === 'news of the times' ||
    sec === 'news of times' ||
    sec === 'news' ||
    topicId === '99e16767-c945-47f9-8e5e-21c309cceac3'
  ) {
    return { key: 'news', renderHeader: (c) => <NewsHeaderPanel className={c} /> };
  }
  if (
    sec === 'pop culture' ||
    sec === 'popculture' ||
    sec === 'pop-culture' ||
    topicId === '40b046fa-cfae-4821-b3b8-17fda934a61a'
  ) {
    return { key: 'pop_culture', renderHeader: (c) => <PopCultureHeaderPanel className={c} /> };
  }
  if (
    sec === 'sports' ||
    sec === 'sport' ||
    sec === 'athletics' ||
    topicId === 'eeecb988-25d8-45d4-9304-e040aa14a326'
  ) {
    return { key: 'sports', renderHeader: (c) => <SportsHeaderPanel className={c} /> };
  }
  if (
    sec === 'technology' ||
    sec === 'tech' ||
    sec === 'computers' ||
    sec === 'inventions' ||
    topicId === '74e60a94-dd9e-4148-a084-86d41ed9998a'
  ) {
    return { key: 'technology', renderHeader: (c) => <TechnologyHeaderPanel className={c} /> };
  }
  if (
    sec === 'childhood' ||
    sec === 'childhoood' ||
    sec === 'youth' ||
    sec === 'early years' ||
    topicId === 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28'
  ) {
    return { key: 'childhood', renderHeader: (c) => <ChildhoodHeaderPanel className={c} /> };
  }
  if (
    sec === 'life reflections' ||
    sec === 'life reflection' ||
    sec === 'reflections' ||
    sec === 'reflection' ||
    topicId === '4cd7ccff-0617-445c-ae72-173daa059500'
  ) {
    return { key: 'life_reflections', renderHeader: (c) => <LifeReflectionsHeaderPanel className={c} /> };
  }
  if (
    sec === 'event' ||
    sec === 'events' ||
    topicId === '5d8f6cc7-0db2-4df5-af9b-be55758faca7'
  ) {
    return { key: 'special_events', renderHeader: (c) => <EventHeaderPanel className={c} /> };
  }
  if (
    sec === 'sparks' ||
    sec === 'question spark' ||
    sec === 'spark' ||
    sec === 'question sparks' ||
    topicId === 'bee8fe90-e799-4b8a-a52b-cbf390f43d2e'
  ) {
    return { key: 'sparks', renderHeader: (c) => <SparksHeaderPanel className={c} /> };
  }

  return { key: 'other', renderHeader: (c) => <OtherHeaderPanel className={c} /> };
}

export default function AuthorTopicHeaderPanel({
  activeSection,
  currentTopicId,
  className = ''
}: AuthorTopicHeaderPanelProps) {
  const descriptor = useMemo(
    () => resolveTopicDescriptor(activeSection, currentTopicId),
    [activeSection, currentTopicId]
  );

  const images = useMemo(() => getTopicCarouselImages(descriptor.key), [descriptor.key]);
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset carousel to first slide when switching topics
  useEffect(() => {
    setActiveIndex(0);
  }, [descriptor.key]);

  // Auto-advance inspiring background carousel every 6 seconds (respects prefers-reduced-motion)
  useEffect(() => {
    if (images.length <= 1) return;
    if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % images.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [images.length, descriptor.key]);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm mb-6 ${className}`}
    >
      {/* Background Inspiring Image Carousel */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden bg-slate-900/10 dark:bg-slate-950">
        {images.map((src, idx) => {
          const isCurrent = idx === activeIndex;
          return (
            <img
              key={`${descriptor.key}-${idx}`}
              src={src}
              alt=""
              aria-hidden="true"
              onError={(e) => {
                const img = e.currentTarget;
                const fallback = FALLBACK_CAROUSEL_IMAGES[idx % FALLBACK_CAROUSEL_IMAGES.length];
                if (!img.dataset.fallbackApplied) {
                  img.dataset.fallbackApplied = 'true';
                  img.src = fallback;
                }
              }}
              className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-1000 ease-out ${
                isCurrent ? 'opacity-100 scale-105' : 'opacity-0 scale-100'
              }`}
            />
          );
        })}

        {/* Editorial Gradient Scrim: balanced transparency so photography shows nicely while keeping text high-contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-white/88 via-white/70 to-white/22 dark:from-slate-950/88 dark:via-slate-900/70 dark:to-slate-900/25" />
      </div>

      {/* Foreground: Original Topic Header Panel (Icon, Title & Description Preserved with Boosted Contrast) */}
      <div className="relative z-10 px-4 py-4 sm:px-5 sm:py-5 [&_h1]:!text-slate-950 dark:[&_h1]:!text-white [&_h1]:drop-shadow-[0_1px_1px_rgba(255,255,255,0.85)] dark:[&_h1]:drop-shadow-[0_1px_2px_rgba(0,0,0,0.7)] [&_p]:!text-slate-800 dark:[&_p]:!text-slate-200 [&_p]:font-medium">
        {descriptor.renderHeader('!mb-0 !pb-0 !border-b-0')}
      </div>

      {/* Subtle Carousel Slide Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-3 z-20 flex items-center gap-1.5">
          {images.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setActiveIndex(idx)}
              aria-label={`Show inspiring background image ${idx + 1}`}
              className={`rounded-full transition-all cursor-pointer ${
                idx === activeIndex
                  ? 'w-4 h-1.5 bg-slate-800/80 dark:bg-white/90 shadow-2xs'
                  : 'w-1.5 h-1.5 bg-slate-500/45 hover:bg-slate-700/70 dark:bg-white/40 dark:hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
