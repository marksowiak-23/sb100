/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  User, 
  Users, 
  HeartHandshake, 
  Home, 
  Plane, 
  GraduationCap, 
  Briefcase, 
  Medal, 
  Trophy, 
  Palette, 
  HeartPulse, 
  Sparkles, 
  Film, 
  Music, 
  Newspaper, 
  Laptop, 
  PartyPopper,
  Compass,
  Check,
  Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { taskApi, Topic, Cd, MbrStory } from '@/src/services/api';

const DEFAULT_CATEGORIES: Partial<Cd>[] = [
  { cdTag: 'topicCategoryCd', cdValue: 'PPL', cdLabel: 'People and Relationships', cdSortOrder: 1 },
  { cdTag: 'topicCategoryCd', cdValue: 'PP', cdLabel: 'Places, Path, & Journeys', cdSortOrder: 2 },
  { cdTag: 'topicCategoryCd', cdValue: 'MB', cdLabel: 'Milestones & Beliefs', cdSortOrder: 3 },
  { cdTag: 'topicCategoryCd', cdValue: 'CAR', cdLabel: 'Growth, Career & Education', cdSortOrder: 4 },
  { cdTag: 'topicCategoryCd', cdValue: 'EL', cdLabel: 'Daily Life & Leisure', cdSortOrder: 5 },
  { cdTag: 'topicCategoryCd', cdValue: 'CME', cdLabel: 'Culture, Media & the Era', cdSortOrder: 6 },
  { cdTag: 'topicCategoryCd', cdValue: 'LSM', cdLabel: 'Life Stages & Milestones', cdSortOrder: 7 },
  { cdTag: 'topicCategoryCd', cdValue: 'OTHER', cdLabel: 'Other', cdSortOrder: 8 }
];

const DEFAULT_TOPICS_LIST: Topic[] = [
  { topicId: 'b54e7b10-8725-494b-902e-4b9fff8f3c23', topicName: 'Profile', topicFullName: 'Profile', topicCategoryCd: 'PPL', topicSortOrder: 1 },
  { topicId: 'a01cfe18-ad54-495b-9636-4b0d5c0aa3c2', topicName: 'Family', topicFullName: 'Family', topicCategoryCd: 'PPL', topicSortOrder: 2 },
  { topicId: '172dc3fc-ce2d-463b-ad9f-976f893cce5e', topicName: 'Relationships', topicFullName: 'Relationships', topicCategoryCd: 'PPL', topicSortOrder: 3 },
  { topicId: '0c56cf6a-64d7-4174-abb0-0a049a40dcd5', topicName: 'Residencies', topicFullName: 'Residencies', topicCategoryCd: 'PP', topicSortOrder: 1 },
  { topicId: '5cd2052b-28fc-434f-9ce4-4358ff944576', topicName: 'Trips and Vacations', topicFullName: 'Trips and Vacations', topicCategoryCd: 'PP', topicSortOrder: 2 },
  { topicId: '196bc8c6-2b8b-4d80-9cc6-1498d37b67a6', topicName: 'Education', topicFullName: 'Education and Training', topicCategoryCd: 'CAR', topicSortOrder: 1 },
  { topicId: '272a39fd-9b43-4fee-9c26-dccf1d8edd1e', topicName: 'Employment', topicFullName: 'Employment and Career', topicCategoryCd: 'CAR', topicSortOrder: 2 },
  { topicId: 'df0744af-1f72-4c4a-b141-05cfdbd2863d', topicName: 'Activities', topicFullName: 'Activities and Hobbies', topicCategoryCd: 'EL', topicSortOrder: 1 },
  { topicId: '273184ab-e09d-49ef-b416-3fc3ba0a8161', topicName: 'Health', topicFullName: 'Health', topicCategoryCd: 'EL', topicSortOrder: 2 },
  { topicId: '95af15b6-ccd4-4487-8151-aef0ad82b6e8', topicName: 'Achievements', topicFullName: 'Achievements', topicCategoryCd: 'LSM', topicSortOrder: 1 },
  { topicId: 'd38d5f71-bbb1-4b84-bcc6-63ed19ce7c28', topicName: 'Childhood', topicFullName: 'Childhood', topicCategoryCd: 'LSM', topicSortOrder: 2 },
  { topicId: '4cd7ccff-0617-445c-ae72-173daa059500', topicName: 'Life Reflections', topicFullName: 'Life Reflections', topicCategoryCd: 'LSM', topicSortOrder: 3 },
  { topicId: '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff', topicName: 'Special Events', topicFullName: 'Special Events', topicCategoryCd: 'LSM', topicSortOrder: 4 },
  { topicId: '04ab0c6a-a9ab-4637-ab8d-a7bf06e2937e', topicName: 'Movies and TV', topicFullName: 'Movies and TV', topicCategoryCd: 'CME', topicSortOrder: 1 },
  { topicId: 'b24de4f6-9029-4665-94bf-f42630baee61', topicName: 'Music', topicFullName: 'Music', topicCategoryCd: 'CME', topicSortOrder: 2 },
  { topicId: 'eeecb988-25d8-45d4-9304-e040aa14a326', topicName: 'Sports', topicFullName: 'Sports', topicCategoryCd: 'CME', topicSortOrder: 3 },
  { topicId: '74e60a94-dd9e-4148-a084-86d41ed9998a', topicName: 'Technology', topicFullName: 'Technology', topicCategoryCd: 'CME', topicSortOrder: 4 },
  { topicId: '40b046fa-cfae-4821-b3b8-17fda934a61a', topicName: 'Pop Culture', topicFullName: 'Pop Culture', topicCategoryCd: 'CME', topicSortOrder: 5 },
  { topicId: '6635482f-24c8-4fdd-83d0-c5f86e22442f', topicName: 'Fads and Trends', topicFullName: 'Fads and Trends', topicCategoryCd: 'CME', topicSortOrder: 6 },
  { topicId: '99e16767-c945-47f9-8e5e-21c309cceac3', topicName: 'News of the Times', topicFullName: 'News of the Times', topicCategoryCd: 'CME', topicSortOrder: 7 },
  { topicId: 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e', topicName: 'Other', topicFullName: 'Other', topicCategoryCd: 'OTHER', topicSortOrder: 99 }
];

function getTopicIconDetails(name: string = '', fullName: string = '') {
  const norm = `${name} ${fullName}`.toLowerCase();
  
  if (norm.includes('profile') || norm.includes('bio') || norm.includes('about')) {
    return { icon: User, colorClass: 'text-purple-600 dark:text-purple-400' };
  }
  if (norm.includes('family') || norm.includes('famly')) {
    return { icon: Users, colorClass: 'text-indigo-600 dark:text-indigo-400' };
  }
  if (norm.includes('friend') || norm.includes('relation') || norm.includes('marri') || norm.includes('parent')) {
    return { icon: HeartHandshake, colorClass: 'text-rose-500 dark:text-rose-400' };
  }
  if (norm.includes('residen') || norm.includes('home') || norm.includes('house') || norm.includes('living')) {
    return { icon: Home, colorClass: 'text-amber-600 dark:text-amber-500' };
  }
  if (norm.includes('trip') || norm.includes('vacation') || norm.includes('travel') || norm.includes('adventure')) {
    return { icon: Plane, colorClass: 'text-sky-500 dark:text-sky-400' };
  }
  if (norm.includes('educat') || norm.includes('train') || norm.includes('school') || norm.includes('college')) {
    return { icon: GraduationCap, colorClass: 'text-slate-700 dark:text-slate-300' };
  }
  if (norm.includes('employ') || norm.includes('career') || norm.includes('work') || norm.includes('job')) {
    return { icon: Briefcase, colorClass: 'text-amber-800 dark:text-amber-600' };
  }
  if (norm.includes('militar') || norm.includes('service') || norm.includes('veteran')) {
    return { icon: Medal, colorClass: 'text-orange-600 dark:text-orange-400' };
  }
  if (norm.includes('achieve') || norm.includes('award') || norm.includes('trophy') || norm.includes('honor')) {
    return { icon: Trophy, colorClass: 'text-amber-500 dark:text-amber-400' };
  }
  if (norm.includes('activ') || norm.includes('hobbi') || norm.includes('hobby') || norm.includes('craft')) {
    return { icon: Palette, colorClass: 'text-emerald-600 dark:text-emerald-400' };
  }
  if (norm.includes('health') || norm.includes('wellness') || norm.includes('medical')) {
    return { icon: HeartPulse, colorClass: 'text-rose-500 dark:text-rose-400' };
  }
  if (norm.includes('event') || norm.includes('celebrat') || norm.includes('party') || norm.includes('holiday')) {
    return { icon: PartyPopper, colorClass: 'text-fuchsia-500 dark:text-fuchsia-400' };
  }
  if (norm.includes('movie') || norm.includes('film') || norm.includes('tv') || norm.includes('show')) {
    return { icon: Film, colorClass: 'text-red-500 dark:text-red-400' };
  }
  if (norm.includes('music') || norm.includes('song') || norm.includes('concert')) {
    return { icon: Music, colorClass: 'text-rose-500 dark:text-rose-400' };
  }
  if (norm.includes('news') || norm.includes('era') || norm.includes('history')) {
    return { icon: Newspaper, colorClass: 'text-slate-600 dark:text-slate-400' };
  }
  if (norm.includes('tech') || norm.includes('computer') || norm.includes('digital')) {
    return { icon: Laptop, colorClass: 'text-cyan-600 dark:text-cyan-400' };
  }
  if (norm.includes('reflect') || norm.includes('philosoph') || norm.includes('belief') || norm.includes('spiritual')) {
    return { icon: Compass, colorClass: 'text-violet-600 dark:text-violet-400' };
  }
  return { icon: Sparkles, colorClass: 'text-amber-500 dark:text-amber-400' };
}

function matchStoryToTopic(s: MbrStory, topic: Topic): boolean {
  const normTopicName = (topic.topicName || '').trim().toLowerCase();
  const normTopicFullName = (topic.topicFullName || '').trim().toLowerCase();
  const topicId = topic.topicId;

  if (topicId && s.topicId && s.topicId === topicId) {
    return true;
  }

  const storyTypeCd = (s.mbrStoryTypeCd || '').trim().toLowerCase();
  const storyTopicName = (s.mbrStoryTopicName || '').trim().toLowerCase();

  if (normTopicName === 'profile') {
    return storyTypeCd === 'profile' || storyTopicName === 'profile';
  }
  if (normTopicName === 'family') {
    return storyTypeCd === 'sbmbrstryfamly' || storyTypeCd === 'family' || storyTypeCd === 'sbmbrstryfamilymember' || storyTopicName === 'family';
  }
  if (normTopicName === 'relationships') {
    return storyTypeCd === 'sbmbrstryrelationships' || storyTypeCd === 'sbmbrstryrelationship' || storyTypeCd === 'relationships' || storyTypeCd === 'relationship' || storyTopicName === 'relationships' || storyTopicName === 'relationship';
  }
  if (normTopicName === 'residencies' || normTopicName === 'residence') {
    return storyTypeCd === 'sbmbrstryresidence' || storyTypeCd === 'residencies' || storyTypeCd === 'residence' || storyTopicName === 'residencies' || storyTopicName === 'residence';
  }
  if (normTopicName === 'trips and vacations' || normTopicName === 'trips' || normTopicName === 'vacations' || normTopicName === 'trips & vacations') {
    return storyTypeCd === 'sbmbrstrytrips' || storyTypeCd === 'trips' || storyTypeCd === 'vacations' || storyTopicName.includes('trip') || storyTopicName.includes('vacation');
  }
  if (normTopicName === 'education') {
    return storyTypeCd === 'sbmbrstryeducation' || storyTypeCd === 'education' || storyTopicName.includes('education');
  }
  if (normTopicName === 'employment') {
    return storyTypeCd === 'sbmbrstryemployment' || storyTypeCd === 'employment' || storyTopicName.includes('employment') || storyTopicName.includes('career');
  }
  if (normTopicName === 'activities' || normTopicName === 'hobbies') {
    return storyTypeCd === 'sbmbrstryactivity' || storyTypeCd === 'activities' || storyTypeCd === 'hobbies' || storyTypeCd === 'activity' || storyTopicName.includes('activit') || storyTopicName.includes('hobb');
  }
  if (normTopicName === 'health') {
    return storyTypeCd === 'sbmbrstryhealth' || storyTypeCd === 'health' || storyTopicName.includes('health') || storyTopicName.includes('wellness');
  }
  if (normTopicName === 'achievements') {
    return storyTypeCd === 'sbmbrstryachievement' || storyTypeCd === 'achievements' || storyTypeCd === 'achievement' || storyTopicName.includes('achievement');
  }
  if (normTopicName === 'special events') {
    return storyTypeCd === 'sbmbrstryspecialevents' || storyTypeCd === 'special events' || storyTypeCd === 'special event' || storyTopicName.includes('special event') || storyTopicName.includes('celebrat');
  }
  if (normTopicName === 'fads and trends' || normTopicName === 'fads & trends' || normTopicName === 'fads') {
    return storyTypeCd === 'sbmbrstryfadsandtrends' || storyTopicName.includes('fad') || storyTopicName.includes('trend');
  }
  if (normTopicName === 'movies and tv' || normTopicName === 'movies & tv' || normTopicName === 'movies' || normTopicName === 'tv') {
    return storyTypeCd === 'sbmbrstrymoviesandtv' || storyTopicName.includes('movie') || storyTopicName.includes('tv') || storyTopicName.includes('television');
  }
  if (normTopicName === 'music') {
    return storyTypeCd === 'sbmbrstrymusic' || storyTopicName.includes('music') || storyTopicName.includes('song');
  }
  if (normTopicName === 'news of the times' || normTopicName === 'news') {
    return storyTypeCd === 'sbmbrstrynewsofthetimes' || storyTopicName.includes('news');
  }
  if (normTopicName === 'pop culture') {
    return storyTypeCd === 'sbmbrstrypopculture' || storyTopicName.includes('pop culture');
  }
  if (normTopicName === 'sports') {
    return storyTypeCd === 'sbmbrstrysports' || storyTopicName.includes('sport') || storyTopicName.includes('athletic');
  }
  if (normTopicName === 'technology') {
    return storyTypeCd === 'sbmbrstrytechnology' || storyTopicName.includes('technology') || storyTopicName.includes('tech');
  }
  if (normTopicName === 'childhood') {
    return storyTypeCd === 'sbmbrstrychildhood' || storyTopicName.includes('childhood') || storyTopicName.includes('early years');
  }
  if (normTopicName === 'life reflections') {
    return storyTypeCd === 'sbmbrstrylifereflections' || storyTopicName.includes('reflection') || storyTopicName.includes('life reflection');
  }
  if (normTopicName === 'other' || normTopicName === 'custom') {
    return storyTypeCd === 'sbmbrstrycustom' || storyTypeCd === 'other' || storyTypeCd === 'custom' || storyTypeCd === 'sbmbrstryother' || Boolean(s.mbrCustomTopicId);
  }

  if (storyTopicName && (storyTopicName === normTopicName || storyTopicName === normTopicFullName)) {
    return true;
  }
  if (storyTypeCd && (storyTypeCd === normTopicName || storyTypeCd === `sbmbrstry${normTopicName.replace(/\s+/g, '')}`)) {
    return true;
  }

  return false;
}

const TOPICS_WITH_CARDS = new Set([
  'profile',
  'family',
  'relationships',
  'relationship',
  'residencies',
  'residence',
  'trips and vacations',
  'trips & vacations',
  'trips',
  'vacations',
  'education',
  'education and training',
  'education & training',
  'employment',
  'employment and career',
  'employment & career',
  'activities',
  'hobbies',
  'activity',
  'activities and hobbies',
  'activities & hobbies',
  'health',
  'wellness',
  'health and wellness',
  'health & wellness',
  'achievements',
  'achievement',
  'special events',
  'special event',
  'specialevents',
  'special-events',
  'celebrations'
]);

const hasTopicCard = (topic: Topic): boolean => {
  const normName = (topic.topicName || '').trim().toLowerCase();
  const normFullName = (topic.topicFullName || '').trim().toLowerCase();
  return TOPICS_WITH_CARDS.has(normName) || TOPICS_WITH_CARDS.has(normFullName);
};

const isUuid = (id?: string | null): boolean => {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
};

interface AuthorMobileMenuBarProps {
  activeSection: string;
  setActiveSection: (sectionId: string) => void;
  className?: string;
}

export default function AuthorMobileMenuBar({
  activeSection,
  setActiveSection,
  className = ''
}: AuthorMobileMenuBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dbTopics, setDbTopics] = useState<Topic[]>(DEFAULT_TOPICS_LIST);
  const [categories, setCategories] = useState<Partial<Cd>[]>(DEFAULT_CATEGORIES);
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const [stories, setStories] = useState<MbrStory[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchStories = async () => {
    try {
      let resolvedMbrId: string | undefined = undefined;
      const currentMbr = sessionStorage.getItem('sb_current_mbr');
      if (currentMbr) {
        try {
          const parsed = JSON.parse(currentMbr);
          if (parsed.mbrId && isUuid(parsed.mbrId)) resolvedMbrId = parsed.mbrId;
        } catch {}
      }
      if (!resolvedMbrId || !isUuid(resolvedMbrId)) {
        const storedMbr = sessionStorage.getItem('mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId && isUuid(parsed.mbrId)) resolvedMbrId = parsed.mbrId;
          } catch {}
        }
      }
      if (!resolvedMbrId || !isUuid(resolvedMbrId)) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.mbrId && isUuid(u.mbrId)) resolvedMbrId = u.mbrId;
            else {
              const profile = await taskApi.getMemberByUserId(u.user_id || u.id).catch(() => null);
              if (profile?.mbrId) resolvedMbrId = profile.mbrId;
            }
          } catch {}
        }
      }
      if (!resolvedMbrId || !isUuid(resolvedMbrId)) {
        const sandboxMbr = sessionStorage.getItem('sandbox_mbr');
        if (sandboxMbr) {
          try {
            const parsed = JSON.parse(sandboxMbr);
            if (parsed.mbrId && isUuid(parsed.mbrId)) resolvedMbrId = parsed.mbrId;
          } catch {}
        }
      }
      if (!resolvedMbrId || !isUuid(resolvedMbrId)) {
        setStories([]);
        return;
      }

      const fetched = await taskApi.getStories(resolvedMbrId).catch(() => []);
      let allStories = Array.isArray(fetched) ? fetched : [];

      const sandboxKey = `sb_sandbox_stories_${resolvedMbrId}`;
      const sandboxStr = sessionStorage.getItem(sandboxKey) || sessionStorage.getItem('sb_sandbox_stories');
      if (sandboxStr) {
        try {
          const sandboxStories = JSON.parse(sandboxStr);
          if (Array.isArray(sandboxStories)) {
            const map = new Map<string, MbrStory>();
            allStories.forEach(s => { if (s.mbrStoryId) map.set(s.mbrStoryId, s); });
            sandboxStories.forEach(s => { if (s.mbrStoryId) map.set(s.mbrStoryId, s); });
            allStories = Array.from(map.values());
          }
        } catch {}
      }

      setStories(allStories);
    } catch (err) {
      console.warn("Could not load stories in AuthorMobileMenuBar:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const fetchTopicsAndCategories = async () => {
      try {
        const [fetchedTopics, fetchedCds] = await Promise.all([
          taskApi.getTopics().catch(() => []),
          taskApi.getCds('topicCategoryCd').catch(() => [])
        ]);

        if (isMounted) {
          const finalTopics = Array.isArray(fetchedTopics) && fetchedTopics.length > 0 
            ? fetchedTopics 
            : DEFAULT_TOPICS_LIST;
          setDbTopics(finalTopics);

          const finalCds = Array.isArray(fetchedCds) && fetchedCds.length > 0 
            ? fetchedCds 
            : DEFAULT_CATEGORIES;
          setCategories(finalCds);

          const initialOpen: Record<string, boolean> = {};
          finalCds.forEach(c => {
            if (c.cdValue) initialOpen[c.cdValue] = true;
          });
          initialOpen['OTHER'] = true;
          setOpenCategories(initialOpen);
        }
      } catch (err) {
        console.warn("Could not load topics or categories in AuthorMobileMenuBar:", err);
      }
    };
    fetchTopicsAndCategories();
    fetchStories();

    const handleRefresh = () => {
      fetchStories();
    };

    window.addEventListener('stats-updated', handleRefresh);
    window.addEventListener('update-story-editor-content', handleRefresh);
    window.addEventListener('refresh-stories', handleRefresh);
    window.addEventListener('user-switched', handleRefresh);

    return () => {
      isMounted = false;
      window.removeEventListener('stats-updated', handleRefresh);
      window.removeEventListener('update-story-editor-content', handleRefresh);
      window.removeEventListener('refresh-stories', handleRefresh);
      window.removeEventListener('user-switched', handleRefresh);
    };
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const activeSecStr = (activeSection || 'Profile').toLowerCase();

  // Find active topic details
  const matchedActiveTopic = dbTopics.find(t => 
    (t.topicName && t.topicName.toLowerCase() === activeSecStr) ||
    (t.topicFullName && t.topicFullName.toLowerCase() === activeSecStr) ||
    (t.topicId && t.topicId.toLowerCase() === activeSecStr) ||
    (activeSecStr === 'family' && t.topicName?.toLowerCase() === 'family') ||
    (activeSecStr === 'profile' && t.topicName?.toLowerCase() === 'profile') ||
    (activeSecStr === 'residencies' && t.topicName?.toLowerCase() === 'residencies') ||
    ((activeSecStr === 'hobbies' || activeSecStr === 'activities') && t.topicName?.toLowerCase() === 'activities')
  );

  const activeLabel = matchedActiveTopic?.topicFullName || matchedActiveTopic?.topicName || activeSection || 'Profile';
  const { icon: ActiveIcon, colorClass: activeColorClass } = getTopicIconDetails(
    matchedActiveTopic?.topicName || activeSection,
    matchedActiveTopic?.topicFullName
  );

  // Sort categories by cdSortOrder
  const sortedCategories = [...categories].sort((a, b) => {
    const orderA = a.cdSortOrder ?? 999;
    const orderB = b.cdSortOrder ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    return (a.cdLabel || a.cdValue || '').localeCompare(b.cdLabel || b.cdValue || '');
  });

  // Group topics by category
  const topicsByCategory = new Map<string, Topic[]>();
  const knownCatCodes = new Set(sortedCategories.map(c => (c.cdValue || '').toUpperCase()));

  dbTopics.forEach(topic => {
    const catCode = (topic.topicCategoryCd || 'OTHER').toUpperCase();
    const targetKey = knownCatCodes.has(catCode) ? catCode : 'OTHER';
    const list = topicsByCategory.get(targetKey) || [];
    list.push(topic);
    topicsByCategory.set(targetKey, list);
  });

  // Sort topics in each category
  topicsByCategory.forEach((list) => {
    list.sort((a, b) => {
      const ordA = a.topicSortOrder ?? 999;
      const ordB = b.topicSortOrder ?? 999;
      if (ordA !== ordB) return ordA - ordB;
      return (a.topicFullName || a.topicName || '').localeCompare(b.topicFullName || b.topicName || '');
    });
  });

  const toggleCategory = (catCode: string) => {
    setOpenCategories(prev => ({
      ...prev,
      [catCode]: !prev[catCode]
    }));
  };

  const handleSelectTopic = (topic: Topic) => {
    const topicKey = topic.topicName || topic.topicFullName || topic.topicId;
    setActiveSection(topicKey);
    setIsOpen(false);
  };

  return (
    <div ref={menuRef} className={`block lg:hidden w-full relative z-30 ${className}`}>
      {/* Mobile Menu Bar Container */}
      <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-2xl p-2.5 sm:p-3 shadow-xs relative overflow-hidden group">
        {/* Top Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

        <div className="flex items-center justify-between gap-2">
          {/* Index Menu Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
              isOpen
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
            aria-expanded={isOpen}
            aria-label="Story Index Menu"
          >
            <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Index</span>
            {isOpen ? (
              <ChevronUp className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5 ml-0.5 opacity-70" />
            )}
          </button>

          {/* Active Section Indicator */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700 rounded-xl min-w-0">
            <ActiveIcon className={`w-3.5 h-3.5 ${activeColorClass} shrink-0`} />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-none">
              {activeLabel}
            </span>
          </div>
        </div>

        {/* Dropdown Menu Items */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: 'auto', marginTop: 10 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              className="overflow-hidden border-t border-[#EFECE7] dark:border-slate-800 pt-2.5 max-h-[70vh] overflow-y-auto space-y-2.5 pr-1"
            >
              {sortedCategories.map((cat) => {
                const catCode = (cat.cdValue || '').toUpperCase();
                const topicsInCat = topicsByCategory.get(catCode) || [];
                if (topicsInCat.length === 0) return null;

                const isCatOpen = openCategories[catCode] ?? true;
                const categoryLabel = cat.cdLabel || cat.cdValue || 'Topics';

                return (
                  <div key={catCode} className="flex flex-col">
                    {/* Category Accordion Subheader */}
                    <button
                      type="button"
                      onClick={() => toggleCategory(catCode)}
                      className="w-full flex items-center justify-between py-1 px-1.5 rounded-lg text-left hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-colors cursor-pointer select-none"
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                        {categoryLabel}
                      </span>
                      <ChevronDown
                        className={`w-3 h-3 text-slate-400 transition-transform duration-200 shrink-0 ${
                          isCatOpen ? 'rotate-180' : 'rotate-0'
                        }`}
                      />
                    </button>

                    {/* Topics Grid */}
                    <AnimatePresence initial={false}>
                      {isCatOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.16, ease: 'easeInOut' }}
                          className="overflow-hidden grid grid-cols-1 sm:grid-cols-2 gap-1 mt-1 pl-1"
                        >
                          {topicsInCat.map((topic) => {
                            const topicName = topic.topicName || '';
                            const topicFullName = topic.topicFullName || topicName;
                            const isActive = 
                              activeSecStr === topicName.toLowerCase() ||
                              activeSecStr === topicFullName.toLowerCase() ||
                              (topic.topicId && activeSecStr === topic.topicId.toLowerCase()) ||
                              (activeSecStr === 'family' && topicName.toLowerCase() === 'family') ||
                              (activeSecStr === 'profile' && topicName.toLowerCase() === 'profile') ||
                              (activeSecStr === 'residencies' && topicName.toLowerCase() === 'residencies') ||
                              ((activeSecStr === 'hobbies' || activeSecStr === 'activities') && topicName.toLowerCase() === 'activities');

                            const { icon: TopicIcon, colorClass } = getTopicIconDetails(topicName, topicFullName);
                            const matchingStories = stories.filter(s => matchStoryToTopic(s, topic));
                            const totalCount = matchingStories.length;
                            const publishedCount = matchingStories.filter(s => (s.mbrStoryPublishStatusCd || '').trim().toLowerCase() === 'published').length;

                            return (
                              <button
                                key={topic.topicId || topicName}
                                type="button"
                                onClick={() => handleSelectTopic(topic)}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-serif transition-all cursor-pointer ${
                                  isActive
                                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-bold shadow-xs'
                                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
                                  <TopicIcon className={`w-4 h-4 shrink-0 ${
                                    isActive 
                                      ? 'text-amber-400 dark:text-amber-600' 
                                      : colorClass
                                  }`} />
                                  <span className="truncate">{topicFullName}</span>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  {totalCount > 0 && (
                                    <div className={`flex items-center gap-0.5 text-[10px] sm:text-[10.5px] font-mono font-medium select-none ${
                                      isActive ? 'text-amber-300 dark:text-amber-400' : 'text-slate-500'
                                    }`}>
                                      <span>{publishedCount}</span>
                                      <Globe className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0 inline-block mx-0.5" />
                                      <span>/ {totalCount}</span>
                                    </div>
                                  )}
                                  {isActive && (
                                    <Check className="w-3.5 h-3.5 text-amber-400 dark:text-amber-600 shrink-0 ml-1" />
                                  )}
                                </div>
                              </button>
                            );
                          })}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AdminComponentTag name="AuthorMobileMenuBar" />
    </div>
  );
}

export { AuthorMobileMenuBar, AuthorMobileMenuBar as authorMobileMenuBar };

