/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Edit3, Save, Plus, Trash2, X, Loader2, CheckCircle2, AlertCircle, FileText, AlertTriangle, ShieldAlert, Globe, Sparkles, MoreVertical, Layers, Check, Images, Mic, Printer, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { taskApi, mbrStoryActivityApi, mbrStoryStatApi, MbrStory, Topic, matchTopicByName, DEFAULT_TOPIC_LOOKUP, TopicCustom, MbrMedia, chatApi, mbrAiUsageLogApi } from '@/src/services/api';
import { FALLBACK_PERSONAS, WriterPersona } from '@/src/features/mbrPreferencesPage/types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import StoryAudioPlayer from '@/src/components/StoryAudioPlayer';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import AiVoiceModal from '@/src/components/AiVoiceModal';
import StoryPdfPrintModal from './StoryPdfPrintModal';
import MbrStoryPrivacyModal from '@/src/components/mbrStoryPrivacyModal';

interface StoryEditorPanelProps {
  topicTitle?: string;
  topicId?: string;
  chIntentId?: string;
  componentName?: string;
  subordinateId?: string;
  subordinateName?: string;
  memberId?: string;
  readOnly?: boolean;
  isSandbox?: boolean;
  onClose: () => void;
}

const componentNameMap: Record<string, string> = {
  family: 'sbMbrStryFamly',
  relationships: 'sbMbrStryRelationships',
  relationship: 'sbMbrStryRelationships',
  residencies: 'sbMbrStryResidence',
  residence: 'sbMbrStryResidence',
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
  activity: 'sbMbrStryActivity',
  achievements: 'sbMbrStryAchievement',
  achievement: 'sbMbrStryAchievement',
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
  profile: 'SbMbrProfile',
};

const DEFAULT_STORIES: Record<string, Partial<MbrStory>[]> = {
  'special events': [
    {
      mbrStoryId: 'st_event_1',
      mbrStoryTitle: 'A Night to Remember: Celebrating 50 Golden Years',
      mbrStoryContent: 'Looking out across the ballroom filled with our children, grandchildren, and friends who traveled hundreds of miles to celebrate our golden anniversary with us, I was overwhelmed with gratitude. Five decades of shared laughter, quiet morning coffee, and weathered storms culminating in an unforgettable night of love and celebration.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'special event': [
    {
      mbrStoryId: 'st_event_1',
      mbrStoryTitle: 'A Night to Remember: Celebrating 50 Golden Years',
      mbrStoryContent: 'Looking out across the ballroom filled with our children, grandchildren, and friends who traveled hundreds of miles to celebrate our golden anniversary with us, I was overwhelmed with gratitude. Five decades of shared laughter, quiet morning coffee, and weathered storms culminating in an unforgettable night of love and celebration.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  relationships: [
    {
      mbrStoryId: 'st_rel_1',
      mbrStoryTitle: 'Lifelong Friends and Cherished Mentors',
      mbrStoryContent: 'Looking back across the decades, it is the bonds of friendship and guidance from wise mentors that truly shaped my journey. From late-night study sessions in university dorms to shared travels and quiet conversations, each connection brought laughter, wisdom, and strength.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  relationship: [
    {
      mbrStoryId: 'st_rel_1',
      mbrStoryTitle: 'Lifelong Friends and Cherished Mentors',
      mbrStoryContent: 'Looking back across the decades, it is the bonds of friendship and guidance from wise mentors that truly shaped my journey. From late-night study sessions in university dorms to shared travels and quiet conversations, each connection brought laughter, wisdom, and strength.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  family: [
    {
      mbrStoryId: 'st_fam_1',
      mbrStoryTitle: 'Sunday Mornings at Harold’s Dock',
      mbrStoryContent: 'Every Sunday after morning services, the family would gather near the harbor. Harold would untie the wooden skiff and take us out past the breakwater to watch the fog roll off the headlands. Those silent mornings taught me more about patience and presence than any classroom ever could.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  residencies: [
    {
      mbrStoryId: 'st_res_1',
      mbrStoryTitle: 'The Old Cedar House by the Tide',
      mbrStoryContent: 'Our home in Coos Bay sat perched on stilts above the salt marsh. High tide meant the water tapped softly against the floorboards below our beds, whispering secrets of distant ocean currents.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  achievements: [
    {
      mbrStoryId: 'st_ach_1',
      mbrStoryTitle: 'Writing Whispers of the Coast',
      mbrStoryContent: 'Receiving the Pulitzer Prize in Biography was never something I anticipated when I sat down at my kitchen table in Sellwood. I simply wanted to record the voices of workers and elders whose stories were slipping away with the tide.',
      mbrStoryPublishStatusCd: 'Published'
    }
  ],
  education: [
    {
      mbrStoryId: 'st_edu_1',
      mbrStoryTitle: 'First Day at Lincoln Elementary',
      mbrStoryContent: 'Stepping into classroom 2B as a young teacher was nerve-wracking. Thirty pairs of bright eyes looked up at me expecting guidance. I decided that day to build a classroom rooted in curiosity and kindness.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  employment: [
    {
      mbrStoryId: 'st_emp_1',
      mbrStoryTitle: 'Thirty Years of Red Ink and Fresh Chalk',
      mbrStoryContent: 'Teaching literature wasn’t just a career; it was a daily invitation to help young minds discover empathy through stories. Watching a hesitant reader suddenly unlock a book remains the greatest reward of my working life.',
      mbrStoryPublishStatusCd: 'Published'
    }
  ],
  hobbies: [
    {
      mbrStoryId: 'st_act_1',
      mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
      mbrStoryContent: 'When I retired from teaching, I picked up watercolor brushes. Capturing the shifting light on Oregon hops fields became my weekend sanctuary and a new way of observing nature.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  activities: [
    {
      mbrStoryId: 'st_act_1',
      mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
      mbrStoryContent: 'When I retired from teaching, I picked up watercolor brushes. Capturing the shifting light on Oregon hops fields became my weekend sanctuary and a new way of observing nature.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  activity: [
    {
      mbrStoryId: 'st_act_1',
      mbrStoryTitle: 'Plein Air Painting in the Willamette Valley',
      mbrStoryContent: 'When I retired from teaching, I picked up watercolor brushes. Capturing the shifting light on Oregon hops fields became my weekend sanctuary and a new way of observing nature.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'fads and trends': [
    {
      mbrStoryId: 'st_fad_1',
      mbrStoryTitle: 'Bell Bottoms, Roller Discos, and Pet Rocks',
      mbrStoryContent: 'Every generation has its unforgettable crazes. I will never forget the weekend everyone on our block got obsessed with pet rocks, or the neon roller skating nights under mirror balls that defined that unforgettable summer.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  fads: [
    {
      mbrStoryId: 'st_fad_1',
      mbrStoryTitle: 'Bell Bottoms, Roller Discos, and Pet Rocks',
      mbrStoryContent: 'Every generation has its unforgettable crazes. I will never forget the weekend everyone on our block got obsessed with pet rocks, or the neon roller skating nights under mirror balls that defined that unforgettable summer.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'movies and tv': [
    {
      mbrStoryId: 'st_mov_1',
      mbrStoryTitle: 'Friday Nights at the Sellwood Cinema',
      mbrStoryContent: 'Growing up, nothing matched the excitement of walking to the neighborhood theater with a bag of hot buttered popcorn. The stories projected onto the silver screen transported us to distant galaxies and timeless adventures.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  movies: [
    {
      mbrStoryId: 'st_mov_1',
      mbrStoryTitle: 'Friday Nights at the Sellwood Cinema',
      mbrStoryContent: 'Growing up, nothing matched the excitement of walking to the neighborhood theater with a bag of hot buttered popcorn. The stories projected onto the silver screen transported us to distant galaxies and timeless adventures.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  music: [
    {
      mbrStoryId: 'st_mus_1',
      mbrStoryTitle: 'Acoustic Guitar by the Campfire',
      mbrStoryContent: 'Music was always the heartbeat of our family gatherings. Learning to play my first chords on an old mahogany acoustic guitar opened a doorway to writing songs that captured the seasons and spirits of the Pacific Northwest.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  songs: [
    {
      mbrStoryId: 'st_mus_1',
      mbrStoryTitle: 'Acoustic Guitar by the Campfire',
      mbrStoryContent: 'Music was always the heartbeat of our family gatherings. Learning to play my first chords on an old mahogany acoustic guitar opened a doorway to writing songs that captured the seasons and spirits of the Pacific Northwest.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'news of the times': [
    {
      mbrStoryId: 'st_nws_1',
      mbrStoryTitle: 'Watching the Moon Landing on a Black-and-White Zenith',
      mbrStoryContent: 'On July 20, 1969, the entire neighborhood gathered in our living room around our grainy black-and-white Zenith television. When Neil Armstrong stepped onto the lunar surface, the entire room erupted in cheers and tears of wonder.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'news of times': [
    {
      mbrStoryId: 'st_nws_1',
      mbrStoryTitle: 'Watching the Moon Landing on a Black-and-White Zenith',
      mbrStoryContent: 'On July 20, 1969, the entire neighborhood gathered in our living room around our grainy black-and-white Zenith television. When Neil Armstrong stepped onto the lunar surface, the entire room erupted in cheers and tears of wonder.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  news: [
    {
      mbrStoryId: 'st_nws_1',
      mbrStoryTitle: 'Watching the Moon Landing on a Black-and-White Zenith',
      mbrStoryContent: 'On July 20, 1969, the entire neighborhood gathered in our living room around our grainy black-and-white Zenith television. When Neil Armstrong stepped onto the lunar surface, the entire room erupted in cheers and tears of wonder.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'pop culture': [
    {
      mbrStoryId: 'st_pop_1',
      mbrStoryTitle: 'Saturday Morning Cartoons and Cereal Boxes',
      mbrStoryContent: 'Waking up at dawn on Saturdays in our pajamas, pouring a giant bowl of sugary cereal, and watching classic animated shows on our console TV was a sacred childhood ritual that defined an entire era.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  popculture: [
    {
      mbrStoryId: 'st_pop_1',
      mbrStoryTitle: 'Saturday Morning Cartoons and Cereal Boxes',
      mbrStoryContent: 'Waking up at dawn on Saturdays in our pajamas, pouring a giant bowl of sugary cereal, and watching classic animated shows on our console TV was a sacred childhood ritual that defined an entire era.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'pop-culture': [
    {
      mbrStoryId: 'st_pop_1',
      mbrStoryTitle: 'Saturday Morning Cartoons and Cereal Boxes',
      mbrStoryContent: 'Waking up at dawn on Saturdays in our pajamas, pouring a giant bowl of sugary cereal, and watching classic animated shows on our console TV was a sacred childhood ritual that defined an entire era.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  sports: [
    {
      mbrStoryId: 'st_spt_1',
      mbrStoryTitle: 'Under the Friday Night Lights',
      mbrStoryContent: 'The crisp autumn air, the roar of the hometown crowd, and the blinding glow of stadium lights created memories etched permanently in my mind. Playing alongside teammates taught me unity, resilience, and true sportsmanship.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  sport: [
    {
      mbrStoryId: 'st_spt_1',
      mbrStoryTitle: 'Under the Friday Night Lights',
      mbrStoryContent: 'The crisp autumn air, the roar of the hometown crowd, and the blinding glow of stadium lights created memories etched permanently in my mind. Playing alongside teammates taught me unity, resilience, and true sportsmanship.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  athletics: [
    {
      mbrStoryId: 'st_spt_1',
      mbrStoryTitle: 'Under the Friday Night Lights',
      mbrStoryContent: 'The crisp autumn air, the roar of the hometown crowd, and the blinding glow of stadium lights created memories etched permanently in my mind. Playing alongside teammates taught me unity, resilience, and true sportsmanship.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  technology: [
    {
      mbrStoryId: 'st_tch_1',
      mbrStoryTitle: 'The Hum of the First Dial-Up Modem',
      mbrStoryContent: 'I will never forget the screech and whistle of our first 56k dial-up modem connecting to the World Wide Web. Watching lines of text and low-res photos slowly load line-by-line felt like opening a magical window into the future.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  tech: [
    {
      mbrStoryId: 'st_tch_1',
      mbrStoryTitle: 'The Hum of the First Dial-Up Modem',
      mbrStoryContent: 'I will never forget the screech and whistle of our first 56k dial-up modem connecting to the World Wide Web. Watching lines of text and low-res photos slowly load line-by-line felt like opening a magical window into the future.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  computers: [
    {
      mbrStoryId: 'st_tch_1',
      mbrStoryTitle: 'The Hum of the First Dial-Up Modem',
      mbrStoryContent: 'I will never forget the screech and whistle of our first 56k dial-up modem connecting to the World Wide Web. Watching lines of text and low-res photos slowly load line-by-line felt like opening a magical window into the future.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  inventions: [
    {
      mbrStoryId: 'st_tch_1',
      mbrStoryTitle: 'The Hum of the First Dial-Up Modem',
      mbrStoryContent: 'I will never forget the screech and whistle of our first 56k dial-up modem connecting to the World Wide Web. Watching lines of text and low-res photos slowly load line-by-line felt like opening a magical window into the future.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  childhood: [
    {
      mbrStoryId: 'st_chd_1',
      mbrStoryTitle: 'Tree Forts and Endless Summer Evenings',
      mbrStoryContent: 'We spent whole summers building forts out of driftwood and salvage boards behind the neighborhood orchard. When the streetlights finally flickered on, we would race our bicycles home with windblown hair and scraped knees.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  childhoood: [
    {
      mbrStoryId: 'st_chd_1',
      mbrStoryTitle: 'Tree Forts and Endless Summer Evenings',
      mbrStoryContent: 'We spent whole summers building forts out of driftwood and salvage boards behind the neighborhood orchard. When the streetlights finally flickered on, we would race our bicycles home with windblown hair and scraped knees.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  youth: [
    {
      mbrStoryId: 'st_chd_1',
      mbrStoryTitle: 'Tree Forts and Endless Summer Evenings',
      mbrStoryContent: 'We spent whole summers building forts out of driftwood and salvage boards behind the neighborhood orchard. When the streetlights finally flickered on, we would race our bicycles home with windblown hair and scraped knees.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'early years': [
    {
      mbrStoryId: 'st_chd_1',
      mbrStoryTitle: 'Tree Forts and Endless Summer Evenings',
      mbrStoryContent: 'We spent whole summers building forts out of driftwood and salvage boards behind the neighborhood orchard. When the streetlights finally flickered on, we would race our bicycles home with windblown hair and scraped knees.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'life reflections': [
    {
      mbrStoryId: 'st_ref_1',
      mbrStoryTitle: 'Gleaning Wisdom from the Quiet Seasons',
      mbrStoryContent: 'Looking back across life’s winding road, the most profound milestones were rarely the loud victories, but the quiet moments of patience, perseverance, and forgiveness that anchored my soul through changing seasons.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  'life reflection': [
    {
      mbrStoryId: 'st_ref_1',
      mbrStoryTitle: 'Gleaning Wisdom from the Quiet Seasons',
      mbrStoryContent: 'Looking back across life’s winding road, the most profound milestones were rarely the loud victories, but the quiet moments of patience, perseverance, and forgiveness that anchored my soul through changing seasons.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  reflections: [
    {
      mbrStoryId: 'st_ref_1',
      mbrStoryTitle: 'Gleaning Wisdom from the Quiet Seasons',
      mbrStoryContent: 'Looking back across life’s winding road, the most profound milestones were rarely the loud victories, but the quiet moments of patience, perseverance, and forgiveness that anchored my soul through changing seasons.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  reflection: [
    {
      mbrStoryId: 'st_ref_1',
      mbrStoryTitle: 'Gleaning Wisdom from the Quiet Seasons',
      mbrStoryContent: 'Looking back across life’s winding road, the most profound milestones were rarely the loud victories, but the quiet moments of patience, perseverance, and forgiveness that anchored my soul through changing seasons.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ],
  other: [
    {
      mbrStoryId: 'st_cst_1',
      mbrStoryTitle: 'Coast Highway Sunset Reflections',
      mbrStoryContent: 'Driving south with the windows down, the Pacific breeze brought the scent of salt spray and pine needles. Custom adventures like this remind me of how vast and wonderful the world is.',
      mbrStoryPublishStatusCd: 'Draft'
    }
  ]
};

const DEFAULT_CUSTOM_TOPICS: TopicCustom[] = [
  {
    topicCustomId: 'ct_remember_when',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    topicCustomName: 'Remember When',
    topicCustomTopicDesc: 'Reflections on pop culture, news of the times, and defining generational moments.',
    chIntentId: 'c75f4efc-8a83-4084-89a4-e3ab49798d60',
    mbrCustomTopicId: 'ct_remember_when',
    mbrCustomTopicName: 'Remember When',
    mbrCustomTopicDesc: 'Reflections on pop culture, news of the times, and defining generational moments.'
  },
  {
    topicCustomId: 'ct_flashback',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    topicCustomName: 'Flashback',
    topicCustomTopicDesc: 'Personal trivia sparks, historical snapshots, and memories from days gone by.',
    chIntentId: 'c75f4efc-8a83-4084-89a4-e3ab49798d60',
    mbrCustomTopicId: 'ct_flashback',
    mbrCustomTopicName: 'Flashback',
    mbrCustomTopicDesc: 'Personal trivia sparks, historical snapshots, and memories from days gone by.'
  },
  {
    topicCustomId: 'ct_1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    topicCustomName: 'Pacific Road Trips',
    topicCustomTopicDesc: 'Memories, coastal drives, and roadside diner stops along the scenic Pacific Coast Highway.',
    chIntentId: 'c75f4efc-8a83-4084-89a4-e3ab49798d60',
    mbrCustomTopicId: 'ct_1',
    mbrCustomTopicName: 'Pacific Road Trips',
    mbrCustomTopicDesc: 'Memories, coastal drives, and roadside diner stops along the scenic Pacific Coast Highway.'
  },
  {
    topicCustomId: 'ct_2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    topicCustomName: 'Vintage Book Collecting',
    topicCustomTopicDesc: 'Hunting for rare first editions and signed memoirs in dusty coastal antiquarian bookshops.',
    chIntentId: 'c75f4efc-8a83-4084-89a4-e3ab49798d60',
    mbrCustomTopicId: 'ct_2',
    mbrCustomTopicName: 'Vintage Book Collecting',
    mbrCustomTopicDesc: 'Hunting for rare first editions and signed memoirs in dusty coastal antiquarian bookshops.'
  }
];

const ensureDefaultCustomTopics = (list: TopicCustom[], mbrId: string): TopicCustom[] => {
  const result = [...list];
  const otherIntent = DEFAULT_TOPIC_LOOKUP['other']?.chIntentId || 'c75f4efc-8a83-4084-89a4-e3ab49798d60';
  
  const hasRememberWhen = result.some(
    (t) => (t.topicCustomName || t.mbrCustomTopicName || '').trim().toLowerCase() === 'remember when'
  );
  if (!hasRememberWhen) {
    result.unshift({
      topicCustomId: 'ct_remember_when',
      mbrId: mbrId,
      topicCustomName: 'Remember When',
      topicCustomTopicDesc: 'Reflections on pop culture, news of the times, and defining generational moments.',
      chIntentId: otherIntent,
      mbrCustomTopicId: 'ct_remember_when',
      mbrCustomTopicName: 'Remember When',
      mbrCustomTopicDesc: 'Reflections on pop culture, news of the times, and defining generational moments.'
    });
  }

  const hasFlashback = result.some(
    (t) => (t.topicCustomName || t.mbrCustomTopicName || '').trim().toLowerCase() === 'flashback'
  );
  if (!hasFlashback) {
    const rwIndex = result.findIndex(t => (t.topicCustomName || t.mbrCustomTopicName || '').trim().toLowerCase() === 'remember when');
    const insertPos = rwIndex >= 0 ? rwIndex + 1 : 0;
    result.splice(insertPos, 0, {
      topicCustomId: 'ct_flashback',
      mbrId: mbrId,
      topicCustomName: 'Flashback',
      topicCustomTopicDesc: 'Personal trivia sparks, historical snapshots, and memories from days gone by.',
      chIntentId: otherIntent,
      mbrCustomTopicId: 'ct_flashback',
      mbrCustomTopicName: 'Flashback',
      mbrCustomTopicDesc: 'Personal trivia sparks, historical snapshots, and memories from days gone by.'
    });
  }
  return result;
};

const formatPublishedDate = (dateStr?: string | null) => {
  if (!dateStr) return '—';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);
    if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
      const mm = String(month).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const yyyy = String(year);
      return `${mm}/${dd}/${yyyy}`;
    }
  }
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = String(d.getFullYear());
      return `${mm}/${dd}/${yyyy}`;
    }
  } catch {}
  return dateStr;
};

const isUuid = (val?: string | null): boolean => {
  if (!val || typeof val !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
};

export function convertTriviaToFirstPerson(rawText: string): string {
  if (!rawText || typeof rawText !== 'string') return '';

  let text = rawText
    // Remove typical "Did you know?" / trivia intros
    .replace(/^Did you know(?:\s+that|\s+about)?\s*[:?,-]?\s*/i, '')
    .replace(/^(?:Personal Trivia|Story Spark|Fact|Memory Snapshot):\s*/i, '')
    .trim();

  // Sentence starters / conjunction clauses
  text = text
    .replace(/\bWhen you were\b/gi, 'When I was')
    .replace(/\bAs you were\b/gi, 'As I was')
    .replace(/\bIf you were\b/gi, 'If I was')
    .replace(/\bSince you were\b/gi, 'Since I was')
    .replace(/\bWhile you were\b/gi, 'While I was')
    .replace(/\bWhen you had\b/gi, 'When I had')
    .replace(/\bWhen you did\b/gi, 'When I did')
    .replace(/\bWhen you lived\b/gi, 'When I lived')
    .replace(/\bWhen you worked\b/gi, 'When I worked')
    .replace(/\bWhen you visited\b/gi, 'When I visited')
    .replace(/\bWhen you traveled\b/gi, 'When I traveled')
    .replace(/\bWhen you joined\b/gi, 'When I joined');

  // Pronoun conversions with boundary handling
  text = text
    .replace(/\bYou were\b/g, 'I was')
    .replace(/\byou were\b/g, 'I was')
    .replace(/\bYou are\b/g, 'I am')
    .replace(/\byou are\b/g, 'I am')
    .replace(/\bYou're\b/g, "I'm")
    .replace(/\byou're\b/g, "I'm")
    .replace(/\bYou have\b/g, 'I have')
    .replace(/\byou have\b/g, 'I have')
    .replace(/\bYou've\b/g, "I've")
    .replace(/\byou've\b/g, "I've")
    .replace(/\bYou had\b/g, 'I had')
    .replace(/\byou had\b/g, 'I had')
    .replace(/\bYou will\b/g, 'I will')
    .replace(/\byou will\b/g, 'I will')
    .replace(/\bYou'll\b/g, "I'll")
    .replace(/\byou'll\b/g, "I'll")
    .replace(/\bYou would\b/g, 'I would')
    .replace(/\byou would\b/g, 'I would')
    .replace(/\bYou'd\b/g, "I'd")
    .replace(/\byou'd\b/g, "I'd");

  // Possessives
  text = text
    .replace(/\bYour\b/g, 'My')
    .replace(/\byour\b/g, 'my')
    .replace(/\bYours\b/g, 'Mine')
    .replace(/\byours\b/g, 'mine')
    .replace(/\bYourself\b/g, 'Myself')
    .replace(/\byourself\b/g, 'myself');

  // Prepositions / verbs followed by objective "you": "with you", "for you", "to you", etc. -> "with me", "for me", "to me"
  text = text
    .replace(/\b(to|with|for|about|at|by|from|in|into|on|upon|around|near|beside|behind|between|among|reminded|taught|gave|inspired|connected|brought|welcomed|guided|awarded|offered|joined|helped|allowed|led|shaped)\s+you\b/gi, '$1 me');

  // Subject "You" at start of sentence, clauses, conjunctions
  text = text
    .replace(/(^|[.!?]\s+)You\b/g, '$1I')
    .replace(/\b([,;]\s+)you\b/g, '$1I')
    .replace(/\b(and|but|or|so|although|though|while|where|because|after|before|that|since|if)\s+you\b/gi, '$1 I');

  // General remaining "You" / "you" in subject positions
  text = text
    .replace(/\bYou\b/g, 'I')
    .replace(/\byou\b/g, 'I');

  // Fix capitalization after punctuation
  text = text.replace(/([.!?]\s+)([a-z])/g, (_, p1, p2) => p1 + p2.toUpperCase());

  return text;
}

const resolveCurrentMbrId = async (
  propMemberId?: string,
  stateResolvedMbrId?: string
): Promise<string> => {
  if (propMemberId && propMemberId !== 'm1' && isUuid(propMemberId)) return propMemberId;

  const storedMbr = sessionStorage.getItem('sb_current_mbr');
  if (storedMbr) {
    try {
      const parsed = JSON.parse(storedMbr);
      if (parsed.mbrId && isUuid(parsed.mbrId)) return parsed.mbrId;
    } catch {}
  }

  const legacyMbr = sessionStorage.getItem('mbr');
  if (legacyMbr) {
    try {
      const parsed = JSON.parse(legacyMbr);
      if (parsed.mbrId && isUuid(parsed.mbrId)) return parsed.mbrId;
    } catch {}
  }

  const userStr = sessionStorage.getItem('user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      const uid = u.user_id || u.id;
      if (uid) {
        const mbrProfile = await taskApi.getMemberByUserId(uid);
        if (mbrProfile && mbrProfile.mbrId && isUuid(mbrProfile.mbrId)) {
          return mbrProfile.mbrId;
        }
      }
    } catch (e) {
      console.warn("Could not retrieve member profile ID from user session:", e);
    }
  }

  if (stateResolvedMbrId && stateResolvedMbrId !== 'm1' && isUuid(stateResolvedMbrId)) {
    return stateResolvedMbrId;
  }

  return '9edb4311-a4bc-428a-8317-833f0f08fea1';
};

export default function StoryEditorPanel({
  topicTitle = 'Section',
  topicId = 'general',
  chIntentId,
  componentName,
  subordinateId,
  subordinateName,
  memberId,
  readOnly = false,
  isSandbox = true,
  onClose
}: StoryEditorPanelProps) {
  const [dbTopics, setDbTopics] = useState<Topic[]>([]);

  useEffect(() => {
    let isMounted = true;
    const fetchTopics = async () => {
      try {
        const fetched = await taskApi.getTopics();
        if (Array.isArray(fetched) && fetched.length > 0 && isMounted) {
          setDbTopics(fetched);
        }
      } catch (err) {
        console.warn("Could not load topics in StoryEditorPanel:", err);
      }
    };
    fetchTopics();
    return () => { isMounted = false; };
  }, []);

  // Resolve topicId (UUID) and chIntentId (UUID) from topic table / lookups
  const matchedTopic = matchTopicByName(topicTitle || topicId, dbTopics);
  const matchedOther = matchTopicByName('Other', dbTopics) || DEFAULT_TOPIC_LOOKUP['other'];
  const resolvedTopicId = (topicId && topicId.includes('-') && topicId.length >= 30)
    ? topicId
    : (matchedTopic?.topicId || DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.topicId || matchedOther?.topicId);
  const resolvedChIntentId = chIntentId || matchedTopic?.chIntentId || DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.chIntentId || matchedOther?.chIntentId;

  const [stories, setStories] = useState<Partial<MbrStory>[]>([]);
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('Draft');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activeThreadId, setActiveThreadId] = useState<string | undefined>(undefined);
  const [activeIntentId, setActiveIntentId] = useState<string | undefined>(undefined);
  const [storyStatsMap, setStoryStatsMap] = useState<Record<string, number>>({});
  const [showActionMenu, setShowActionMenu] = useState(false);

  // Column header sorting state for story list grid (default: newest Date first)
  const [sortColumn, setSortColumn] = useState<'topic' | 'story' | 'views' | 'date' | 'published'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (column: 'topic' | 'story' | 'views' | 'date' | 'published') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'views' || column === 'date' || column === 'published' ? 'desc' : 'asc');
    }
  };

  // Computed sorted stories list
  const sortedStories = useMemo(() => {
    if (!Array.isArray(stories)) return [];
    return [...stories].sort((a, b) => {
      if (sortColumn === 'topic') {
        const topicA = (a.mbrStoryTopicName || topicTitle || '').toLowerCase();
        const topicB = (b.mbrStoryTopicName || topicTitle || '').toLowerCase();
        const cmp = topicA.localeCompare(topicB);
        return sortDirection === 'asc' ? cmp : -cmp;
      } else if (sortColumn === 'story') {
        const titleA = (a.mbrStoryTitle || 'Untitled Story').toLowerCase();
        const titleB = (b.mbrStoryTitle || 'Untitled Story').toLowerCase();
        const cmp = titleA.localeCompare(titleB);
        return sortDirection === 'asc' ? cmp : -cmp;
      } else if (sortColumn === 'views') {
        const viewsA = (a.mbrStoryId && storyStatsMap[a.mbrStoryId] !== undefined) ? storyStatsMap[a.mbrStoryId] : 0;
        const viewsB = (b.mbrStoryId && storyStatsMap[b.mbrStoryId] !== undefined) ? storyStatsMap[b.mbrStoryId] : 0;
        const cmp = viewsA - viewsB;
        return sortDirection === 'asc' ? cmp : -cmp;
      } else if (sortColumn === 'date') {
        const getTime = (d?: string | null) => {
          if (!d) return 0;
          const t = new Date(d).getTime();
          return isNaN(t) ? 0 : t;
        };
        const dateA = getTime(a.mbrStoryPublishedDate || a.mbrStoryUpdatedAt || a.mbrStoryCreatedAt);
        const dateB = getTime(b.mbrStoryPublishedDate || b.mbrStoryUpdatedAt || b.mbrStoryCreatedAt);
        const cmp = dateA - dateB;
        return sortDirection === 'asc' ? cmp : -cmp;
      } else if (sortColumn === 'published') {
        const isPubA = (a.mbrStoryPublishStatusCd || '').trim().toLowerCase() === 'published' ? 1 : 0;
        const isPubB = (b.mbrStoryPublishStatusCd || '').trim().toLowerCase() === 'published' ? 1 : 0;
        const cmp = isPubA - isPubB;
        return sortDirection === 'asc' ? cmp : -cmp;
      }
      return 0;
    });
  }, [stories, sortColumn, sortDirection, topicTitle, storyStatsMap]);

  // Photo Gallery & Media Modal State for Stories
  const [showPhotoGalleryModal, setShowPhotoGalleryModal] = useState(false);
  const [showAiVoiceModal, setShowAiVoiceModal] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showStoryPrivacyModal, setShowStoryPrivacyModal] = useState(false);
  const [storyPhotosCountMap, setStoryPhotosCountMap] = useState<Record<string, number>>({});
  const [resolvedMbrId, setResolvedMbrId] = useState<string>(() => {
    if (memberId && memberId !== 'm1' && isUuid(memberId)) return memberId;
    const currentMbr = sessionStorage.getItem('sb_current_mbr');
    if (currentMbr) {
      try {
        const m = JSON.parse(currentMbr);
        if (m.mbrId && isUuid(m.mbrId)) return m.mbrId;
      } catch {}
    }
    const storedMbr = sessionStorage.getItem('mbr');
    if (storedMbr) {
      try {
        const m = JSON.parse(storedMbr);
        if (m.mbrId && isUuid(m.mbrId)) return m.mbrId;
      } catch {}
    }
    const savedMbr = sessionStorage.getItem('sandbox_mbr');
    if (savedMbr) {
      try {
        const m = JSON.parse(savedMbr);
        if (m.mbrId && isUuid(m.mbrId)) return m.mbrId;
      } catch {}
    }
    return '9edb4311-a4bc-428a-8317-833f0f08fea1';
  });

  const resolvedCategoryCd = useMemo(() => {
    const t = (topicId || topicTitle || '').toLowerCase();
    if (t.includes('activ') || t.includes('hobb')) return 'Activities';
    if (t.includes('fam')) return 'Family';
    if (t.includes('residen') || t.includes('home')) return 'Residencies';
    if (t.includes('achiev')) return 'Achievements';
    if (t.includes('edu') || t.includes('train')) return 'Education';
    if (t.includes('employ') || t.includes('career')) return 'Employment';
    if (t.includes('cust') || t.includes('other')) return 'Custom';
    if (t.includes('prof') || t.includes('bio')) return 'Profile';
    return topicTitle || 'Story';
  }, [topicId, topicTitle]);

  const [authorName, setAuthorName] = useState<string>('Storybook Author');
  const [authorLocation, setAuthorLocation] = useState<string | undefined>(undefined);

  useEffect(() => {
    const resolveAuthorInfo = async () => {
      try {
        const storedMbr = sessionStorage.getItem('mbr') || sessionStorage.getItem('sandbox_mbr');
        if (storedMbr) {
          const m = JSON.parse(storedMbr);
          const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim();
          if (fullName) setAuthorName(fullName);
          if (m.mbrLivesCityState || m.mbrFromCityState) {
            setAuthorLocation(m.mbrLivesCityState || m.mbrFromCityState);
          }
        }
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.user_id) {
            const m = await taskApi.getMemberByUserId(u.user_id).catch(() => null);
            if (m) {
              const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim();
              if (fullName) setAuthorName(fullName);
              if (m.mbrLivesCityState || m.mbrFromCityState) {
                setAuthorLocation(m.mbrLivesCityState || m.mbrFromCityState);
              }
            }
          }
        }
      } catch (e) {
        console.warn('Could not resolve author info for story PDF:', e);
      }
    };
    resolveAuthorInfo();
  }, [resolvedMbrId]);

  const handlePrintToPdf = () => {
    const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
    const effectiveTitle = title || activeStory?.mbrStoryTitle || '';
    const effectiveContent = content || activeStory?.mbrStoryText || '';

    if (!effectiveContent && !effectiveTitle) {
      setError('Please write some story content or enter a title before generating a PDF.');
      return;
    }
    setShowPdfModal(true);
  };

  const loadStoryPhotoCounts = async (targetMbrId?: string) => {
    const mbr = targetMbrId || resolvedMbrId;
    if (!mbr) return;
    try {
      const counts: Record<string, number> = {};
      if (isSandbox) {
        const savedMedia = sessionStorage.getItem('sandbox_media');
        if (savedMedia) {
          try {
            const list: MbrMedia[] = JSON.parse(savedMedia);
            if (Array.isArray(list)) {
              list.forEach((m) => {
                if (m.mbrMediaSubordinateId) {
                  counts[m.mbrMediaSubordinateId] = (counts[m.mbrMediaSubordinateId] || 0) + 1;
                }
              });
            }
          } catch {}
        }
      } else {
        const list = await taskApi.getMemberMedia(mbr).catch(() => []);
        if (Array.isArray(list)) {
          list.forEach((m) => {
            if (m.mbrMediaSubordinateId) {
              counts[m.mbrMediaSubordinateId] = (counts[m.mbrMediaSubordinateId] || 0) + 1;
            }
          });
        }
      }
      setStoryPhotosCountMap(counts);
    } catch (e) {
      console.warn('Could not load story photo counts:', e);
    }
  };

  // Custom Topic Selection Modal state (for Other / Custom topics)
  const [customTopics, setCustomTopics] = useState<TopicCustom[]>([]);
  const [showCustomTopicModal, setShowCustomTopicModal] = useState(false);
  const [selectedCustomTopic, setSelectedCustomTopic] = useState<TopicCustom | null>(null);
  const [loadingCustomTopics, setLoadingCustomTopics] = useState(false);
  const [newCustomTopicName, setNewCustomTopicName] = useState('');
  const [newCustomTopicDesc, setNewCustomTopicDesc] = useState('');
  const [showInlineNewTopic, setShowInlineNewTopic] = useState(false);
  const [creatingCustomTopic, setCreatingCustomTopic] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [editTopicName, setEditTopicName] = useState('');
  const [editTopicDesc, setEditTopicDesc] = useState('');
  const [savingTopicEdit, setSavingTopicEdit] = useState(false);
  const [deletingTopicId, setDeletingTopicId] = useState<string | null>(null);
  const [topicModalError, setTopicModalError] = useState<string | null>(null);

  // Close mobile action menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement;
      if (!target.closest('.story-action-menu-container')) {
        setShowActionMenu(false);
      }
    }
    if (showActionMenu) {
      document.addEventListener('click', handleClickOutside);
    }
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showActionMenu]);

  useEffect(() => {
    const handleContentUpdate = (e: any) => {
      const detail = e.detail || {};
      if (detail.content) {
        setContent(detail.content);
        if (detail.threadId) setActiveThreadId(detail.threadId);
        if (detail.intentId) setActiveIntentId(detail.intentId);
        setSuccessMsg('Story content updated from StoryMate AI!');
      }
    };
    window.addEventListener('update-story-editor-content', handleContentUpdate);
    return () => window.removeEventListener('update-story-editor-content', handleContentUpdate);
  }, []);

  const checkIsOtherOrCustom = () => {
    const tId = (topicId || '').toLowerCase();
    const tTitle = (topicTitle || '').toLowerCase();
    const cName = (componentName || '').toLowerCase();
    return (
      tId === 'other' ||
      tId === 'custom' ||
      tTitle === 'other' ||
      tTitle === 'custom' ||
      tTitle.includes('other') ||
      tTitle.includes('custom') ||
      cName === 'sbmbrstrycustom' ||
      cName === 'sbmbrstryother' ||
      resolvedTopicId === 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e' ||
      resolvedTopicId === DEFAULT_TOPIC_LOOKUP['other']?.topicId
    );
  };

  const pendingTriviaRef = useRef<any>(null);

  const refineStoryFromTriviaWithPersona = async (
    targetStoryId: string,
    rawTriviaContent: string,
    storyTitle: string,
    intentId: string
  ) => {
    if (!rawTriviaContent || !rawTriviaContent.trim()) return;

    try {
      // 1. Resolve member's active StoryMate Persona
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      let prefRecord: any = null;
      const savedPref = sessionStorage.getItem('sandbox_mbr_preferences') || sessionStorage.getItem('mbrPreferences');
      if (savedPref) {
        try { prefRecord = JSON.parse(savedPref); } catch {}
      }
      if (!prefRecord) {
        try {
          prefRecord = await taskApi.getMemberPreferences(currentMbrId);
        } catch {}
      }

      let activePersona: WriterPersona = FALLBACK_PERSONAS[0];
      try {
        const writers = await taskApi.getChWriters();
        if (Array.isArray(writers) && writers.length > 0) {
          const match = writers.find((w: any) => w.chWriterId === prefRecord?.chWriterId);
          if (match) activePersona = match;
        } else if (prefRecord?.chWriterId) {
          const match = FALLBACK_PERSONAS.find((w) => w.chWriterId === prefRecord.chWriterId);
          if (match) activePersona = match;
        }
      } catch {
        if (prefRecord?.chWriterId) {
          const match = FALLBACK_PERSONAS.find((w) => w.chWriterId === prefRecord.chWriterId);
          if (match) activePersona = match;
        }
      }

      const prompt = `[Task: Convert the following personal trivia spark into a rich, engaging memoir story draft in the FIRST-PERSON perspective ('I', 'my', 'we').
Writing Persona Style: ${activePersona.chWriterName} (${activePersona.chWriterDesc}).
Persona Voice Instruction: ${activePersona.chWriterPrompt}
Story Title: "${storyTitle}".

Source Trivia Spark:
"${rawTriviaContent}"

Output Rules:
- Write in authentic first-person narrative from the author's own memory ("I", "my", "we").
- Adopt the signature style, tone, and pacing of ${activePersona.chWriterName}.
- Output ONLY the polished story draft text.
- Do NOT wrap in quotation marks, do NOT include markdown code fences, and do NOT add conversational filler or intros.]`;

      const startTime = performance.now();
      const res = await chatApi.sendMessage(prompt, undefined, authorName || 'Author');
      if (res && res.response) {
        let polished = res.response
          .replace(/^Here is (your|a) (story|draft|narrative|memoir|revised draft)[^:\n]*:\s*/i, '')
          .replace(/^"(.*)"$/s, '$1')
          .trim();

        if (polished) {
          setStories((prev) =>
            prev.map((s) =>
              s.mbrStoryId === targetStoryId ? { ...s, mbrStoryContent: polished } : s
            )
          );
          setContent((curr) => {
            return polished;
          });
          setSuccessMsg(`Drafted story in first person using ${activePersona.chWriterName} persona!`);

          // Record telemetry if available
          try {
            const addedTokens = res.tokens_used || Math.ceil((prompt.length + polished.length) / 4);
            const durationMs = Math.round(performance.now() - startTime);
            if (!isSandbox) {
              await mbrAiUsageLogApi.createLog({
                mbrId: currentMbrId,
                chIntentId: intentId,
                tokensUsed: addedTokens,
                promptTokens: Math.ceil(prompt.length / 4),
                completionTokens: Math.ceil(polished.length / 4),
                latencyMs: durationMs,
                aiModel: 'gemini-1.5-flash',
                callerComponent: 'StoryEditorPanel:applyTriviaStory'
              });
            }
          } catch (telemErr) {
            console.warn("Could not log AI usage telemetry:", telemErr);
          }
        }
      }
    } catch (aiErr) {
      console.warn("Could not refine trivia draft with AI persona:", aiErr);
    }
  };

  const applyTriviaStory = (pendingTrivia: any, baseStories: Partial<MbrStory>[] = stories) => {
    const matchedOtherTopic = matchTopicByName('Other', dbTopics) || DEFAULT_TOPIC_LOOKUP['other'];
    const otherTopicId = isUuid(matchedOtherTopic?.topicId) ? matchedOtherTopic!.topicId : (DEFAULT_TOPIC_LOOKUP['other']?.topicId || 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e');
    const otherIntentId = isUuid(matchedOtherTopic?.chIntentId) ? matchedOtherTopic!.chIntentId : (DEFAULT_TOPIC_LOOKUP['other']?.chIntentId || 'c75f4efc-8a83-4084-89a4-e3ab49798d60');

    const derivedTopicName = (pendingTrivia.derivedTopicName || pendingTrivia.storyTitle || 'Personal Trivia').slice(0, 40);
    const derivedStoryTitle = (pendingTrivia.storyTitle || derivedTopicName).slice(0, 240);
    const rawContent = pendingTrivia.storyContent || pendingTrivia.promptSuggestion || '';
    
    // Immediate deterministic first-person conversion
    const immediateFirstPerson = convertTriviaToFirstPerson(rawContent);
    const newId = `temp_${Date.now()}`;
    const finalStoryTypeCd = 'sbMbrStryCustom';

    const newStory: Partial<MbrStory> = {
      mbrStoryId: newId,
      mbrStoryTitle: derivedStoryTitle,
      mbrStoryContent: immediateFirstPerson,
      mbrStoryPublishStatusCd: 'Draft',
      mbrStoryTypeCd: finalStoryTypeCd,
      mbrStorySubordinateId: undefined,
      mbrStoryTopicName: derivedTopicName,
      topicId: otherTopicId,
      chIntentId: otherIntentId,
      mbrCustomTopicId: undefined
    };

    const nextStories = [newStory, ...baseStories.filter((s) => s.mbrStoryId !== newId)];
    setStories(nextStories);
    setActiveStoryId(newId);
    setTitle(derivedStoryTitle);
    setContent(immediateFirstPerson);
    setStatus('Draft');
    setActiveIntentId(otherIntentId);
    setIsEditing(true);
    setError(null);
    setSuccessMsg(`Initiated new story draft from Trivia: "${derivedTopicName}"`);

    try {
      sessionStorage.removeItem('sb_pending_new_story');
    } catch {}
    pendingTriviaRef.current = null;

    setTimeout(() => {
      const el = document.getElementById('story-editor-panel');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);

    // Asynchronously rewrite into full StoryMate persona first-person voice
    refineStoryFromTriviaWithPersona(newId, rawContent, derivedStoryTitle, otherIntentId);
  };

  useEffect(() => {
    const handleInitiateTriviaStory = (e?: any) => {
      let pendingData: any = null;
      if (e?.detail && (e.detail.derivedTopicName || e.detail.storyTitle || e.detail.storyContent)) {
        pendingData = e.detail;
      } else {
        try {
          const raw = sessionStorage.getItem('sb_pending_new_story');
          if (raw) pendingData = JSON.parse(raw);
        } catch {}
      }

      if (!pendingData) return;

      const isOtherOrCustom = checkIsOtherOrCustom();
      if (!isOtherOrCustom) {
        pendingTriviaRef.current = pendingData;
        return;
      }

      if (loading) {
        pendingTriviaRef.current = pendingData;
      } else {
        applyTriviaStory(pendingData);
      }
    };

    window.addEventListener('initiate-trivia-story', handleInitiateTriviaStory);

    try {
      const raw = sessionStorage.getItem('sb_pending_new_story');
      if (raw) {
        pendingTriviaRef.current = JSON.parse(raw);
      }
    } catch {}

    return () => window.removeEventListener('initiate-trivia-story', handleInitiateTriviaStory);
  }, [topicId, topicTitle, componentName, resolvedTopicId, resolvedChIntentId, loading, stories]);

  useEffect(() => {
    loadStories();
  }, [topicId, isSandbox, componentName, subordinateId, memberId]);

  const loadStories = async () => {
    setLoading(true);
    setError(null);
    try {
      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId] || topicId);

      const isOtherOrCustom = checkIsOtherOrCustom();
      let pendingTrivia: any = pendingTriviaRef.current;
      if (!pendingTrivia) {
        try {
          const pendingRaw = sessionStorage.getItem('sb_pending_new_story');
          if (pendingRaw) {
            pendingTrivia = JSON.parse(pendingRaw);
          }
        } catch {}
      }

      if (isSandbox) {
        const key = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;
        const saved = sessionStorage.getItem(key);
        let list: Partial<MbrStory>[] = [];
        if (saved) {
          list = JSON.parse(saved);
        } else {
          list = (DEFAULT_STORIES[topicId] || [
            {
              mbrStoryId: `st_${topicId}_1`,
              mbrStoryTitle: subordinateName ? `Story of ${subordinateName}` : `${topicTitle} Memories & Reflections`,
              mbrStoryContent: `Write your story notes and reflections for ${subordinateName || topicTitle} here...`,
              mbrStoryPublishStatusCd: 'Draft'
            }
          ]).map(s => ({
            ...s,
            mbrStoryTypeCd: finalStoryTypeCd,
            mbrStorySubordinateId: subordinateId || undefined,
            mbrStoryVersion: s.mbrStoryVersion || 1,
            topicId: resolvedTopicId,
            chIntentId: resolvedChIntentId
          }));
          sessionStorage.setItem(key, JSON.stringify(list));
        }

        if (isOtherOrCustom && pendingTrivia) {
          applyTriviaStory(pendingTrivia, list);
        } else {
          setStories(list);
          if (list.length > 0) {
            selectStory(list[0]);
          }
        }
        loadStoryPhotoCounts(resolvedMbrId);
      } else {
        // DB load
        let currentMbrId = memberId;
        if (!currentMbrId) {
          const storedMbr = sessionStorage.getItem('sb_current_mbr');
          if (storedMbr) {
            try {
              const parsed = JSON.parse(storedMbr);
              if (parsed.mbrId) currentMbrId = parsed.mbrId;
            } catch {}
          }
        }
        if (!currentMbrId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id || u.id);
              if (mbrProfile && mbrProfile.mbrId) {
                currentMbrId = mbrProfile.mbrId;
              }
            } catch (e) {
              console.warn("Could not retrieve member profile ID from DB, falling back to default Eleanor Hartwell UUID:", e);
            }
          }
        }
        if (!currentMbrId) {
          currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
        }
        if (currentMbrId === 'm1') {
          currentMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0';
        }
        setResolvedMbrId(currentMbrId);
        loadStoryPhotoCounts(currentMbrId);

        const dbStories = await taskApi.getStories(currentMbrId);
        const filtered = dbStories.filter((s) => {
          const isFamilyType = (s.mbrStoryTypeCd === 'sbMbrStryFamly' || s.mbrStoryTypeCd === 'Family' || s.mbrStoryTypeCd === 'sbMbrStryFamilyMember');
          const isRelationshipType = (s.mbrStoryTypeCd === 'sbMbrStryRelationships' || s.mbrStoryTypeCd === 'sbMbrStryRelationship' || s.mbrStoryTypeCd === 'Relationships' || s.mbrStoryTypeCd === 'Relationship');
          const isResidencyType = (s.mbrStoryTypeCd === 'sbMbrStryResidence' || s.mbrStoryTypeCd === 'Residencies' || s.mbrStoryTypeCd === 'Residence');
          const isAchievementType = (s.mbrStoryTypeCd === 'sbMbrStryAchievement' || s.mbrStoryTypeCd === 'Achievements' || s.mbrStoryTypeCd === 'Achievement');
          const isEducationType = (s.mbrStoryTypeCd === 'sbMbrStryEducation' || s.mbrStoryTypeCd === 'Education');
          const isActivityType = (s.mbrStoryTypeCd === 'sbMbrStryActivity' || s.mbrStoryTypeCd === 'Activities' || s.mbrStoryTypeCd === 'Activities and Hobbies' || s.mbrStoryTypeCd === 'Hobbies' || s.mbrStoryTypeCd === 'Activity');
          const isCustomType = (
            s.mbrStoryTypeCd === 'sbMbrStryCustom' ||
            s.mbrStoryTypeCd === 'Other' ||
            s.mbrStoryTypeCd === 'Custom' ||
            s.mbrStoryTypeCd === 'sbMbrStryOther' ||
            Boolean(s.mbrStoryTopicName && (topicId?.toLowerCase() === 'other' || topicId?.toLowerCase() === 'custom'))
          );
          
          let matchesType = false;
          if (resolvedTopicId && s.topicId && s.topicId === resolvedTopicId) {
            matchesType = true;
          } else if (topicId?.toLowerCase() === 'family' || finalStoryTypeCd === 'sbMbrStryFamly') {
            matchesType = isFamilyType;
          } else if (topicId?.toLowerCase() === 'relationships' || topicId?.toLowerCase() === 'relationship' || finalStoryTypeCd === 'sbMbrStryRelationships') {
            matchesType = isRelationshipType;
          } else if (topicId?.toLowerCase() === 'residencies' || finalStoryTypeCd === 'sbMbrStryResidence') {
            matchesType = isResidencyType;
          } else if (topicId?.toLowerCase() === 'achievements' || finalStoryTypeCd === 'sbMbrStryAchievement') {
            matchesType = isAchievementType;
          } else if (topicId?.toLowerCase() === 'education' || finalStoryTypeCd === 'sbMbrStryEducation') {
            matchesType = isEducationType;
          } else if (topicId?.toLowerCase() === 'hobbies' || topicId?.toLowerCase() === 'activities' || finalStoryTypeCd === 'sbMbrStryActivity') {
            matchesType = isActivityType;
          } else if (topicId?.toLowerCase() === 'other' || topicId?.toLowerCase() === 'custom' || finalStoryTypeCd === 'sbMbrStryCustom') {
            matchesType = isCustomType;
          } else {
            matchesType = s.mbrStoryTypeCd === finalStoryTypeCd || s.mbrStoryTypeCd?.toLowerCase() === topicId?.toLowerCase();
          }
          if (!matchesType) return false;

          if (subordinateId) {
            return s.mbrStorySubordinateId === subordinateId || (subordinateName && s.mbrStoryTopicName === subordinateName);
          } else if (topicId?.toLowerCase() === 'family' || topicId?.toLowerCase() === 'relationships' || topicId?.toLowerCase() === 'relationship') {
            return !s.mbrStorySubordinateId;
          }
          return true;
        });

        let accessibleStories = filtered;
        if (readOnly) {
          // Viewer is reading stories authored by currentMbrId
          let candidateList = filtered.filter(s => (s.mbrStoryPublishStatusCd || '').toLowerCase() === 'published');

          try {
            // Fetch viewer's assigned group and global Public group
            let viewerMbrId: string | null = null;
            const storedMbr = sessionStorage.getItem('sb_current_mbr');
            if (storedMbr) {
              try { viewerMbrId = JSON.parse(storedMbr).mbrId; } catch {}
            }
            if (!viewerMbrId) {
              const userStr = sessionStorage.getItem('user');
              if (userStr) {
                try {
                  const u = JSON.parse(userStr);
                  const p = await taskApi.getMemberByUserId(u.user_id).catch(() => null);
                  if (p?.mbrId) viewerMbrId = p.mbrId;
                } catch {}
              }
            }

            // Connection assigned group
            let assignedGrpId: string | null = null;
            if (viewerMbrId && currentMbrId) {
              const authorConns = await taskApi.getMemberConnections({
                mbrId: currentMbrId,
                connectedMbrId: viewerMbrId
              }).catch(() => []);
              if (authorConns && authorConns.length > 0) {
                const connGrps = await taskApi.getMemberConnectionGrps({
                  connectionId: authorConns[0].mbrConnectionId
                }).catch(() => []);
                if (connGrps && connGrps.length > 0) {
                  assignedGrpId = connGrps[0].grpId;
                }
              }
            }

            // Public group
            let publicGrpId: string | null = null;
            const globals = await taskApi.getGroupsGlobal().catch(() => []);
            const pub = globals.find(g => g.grpName?.toLowerCase() === 'public');
            if (pub) publicGrpId = pub.grpId;
            if (!publicGrpId) publicGrpId = '13efcbad-d840-44ad-9b50-d6d2218e5cac';

            // Fetch all story group privs
            const allStoryPrivs = await taskApi.getMemberStoryGroupPrivs().catch(() => []);
            const privsByStoryId = new Map<string, any[]>();
            for (const sp of (allStoryPrivs || [])) {
              if (sp.mbrStoryId) {
                const list = privsByStoryId.get(sp.mbrStoryId) || [];
                list.push(sp);
                privsByStoryId.set(sp.mbrStoryId, list);
              }
            }

            // Filter by story group privileges (user must be in a group with view or view & comment privs)
            candidateList = candidateList.filter(story => {
              const storyPrivs = story.mbrStoryId ? (privsByStoryId.get(story.mbrStoryId) || []) : [];
              if (storyPrivs.length === 0) {
                return true;
              }

              let hasAccess = false;
              let hasDenial = false;

              const isPrivAllow = (val?: string) => {
                if (!val) return false;
                const upper = val.toUpperCase().trim();
                return upper === 'READ' || upper === 'WRITE' || upper === 'VIEW' || upper.includes('VIEW') || upper.includes('COMMENT') || upper === 'ALLOW';
              };

              if (assignedGrpId) {
                const assignedPriv = storyPrivs.find(p => p.grpId === assignedGrpId);
                if (assignedPriv) {
                  const val = (assignedPriv.privValueCd || '').toUpperCase();
                  if (isPrivAllow(val)) {
                    hasAccess = true;
                  } else if (val === 'NONE' || val === 'HIDE') {
                    hasDenial = true;
                  }
                }
              }

              if (!hasAccess && !hasDenial && publicGrpId) {
                const pubPriv = storyPrivs.find(p => p.grpId === publicGrpId);
                if (pubPriv) {
                  const val = (pubPriv.privValueCd || '').toUpperCase();
                  if (isPrivAllow(val)) {
                    hasAccess = true;
                  }
                }
              }

              return hasAccess;
            });
          } catch (e) {
            console.warn("Error evaluating story group privileges in StoryEditorPanel:", e);
          }
          accessibleStories = candidateList;
        }

        if (isOtherOrCustom && pendingTrivia) {
          applyTriviaStory(pendingTrivia, accessibleStories);
        } else if (accessibleStories.length > 0) {
          // Select max mbrStoryVersion if multiple stories exist
          const sorted = [...accessibleStories].sort((a, b) => (b.mbrStoryVersion || 0) - (a.mbrStoryVersion || 0));
          setStories(sorted);

          // Load story view stats for this member
          try {
            const stats = await mbrStoryStatApi.getMemberStoryStatsByMbrId(currentMbrId);
            const map: Record<string, number> = {};
            if (Array.isArray(stats)) {
              stats.forEach((st) => {
                if (st.mbrStoryId) {
                  map[st.mbrStoryId] = st.mbrStoryStatViewedCnt || 0;
                }
              });
            }
            setStoryStatsMap(map);
          } catch (statErr) {
            console.warn("Could not retrieve story stats:", statErr);
          }

          const defaultStory = (readOnly ? sorted.find(s => (s.mbrStoryPublishStatusCd || '').toLowerCase() === 'published') : null) || sorted[0];
          selectStory(defaultStory);
        } else {
          setStories([]);
          setActiveStoryId(null);
          setTitle('');
          setContent('');
          setStatus('Draft');
          setStoryStatsMap({});
        }
      }
    } catch (err: any) {
      setError(`Failed to load stories: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const recordedViewsRef = React.useRef<Set<string>>(new Set());

  const selectStory = (story: Partial<MbrStory>) => {
    setActiveStoryId(story.mbrStoryId || null);
    setTitle(story.mbrStoryTitle || '');
    setContent(story.mbrStoryContent || '');
    setStatus(story.mbrStoryPublishStatusCd || 'Draft');
    setActiveThreadId(story.mbrStoryThreadID);
    setActiveIntentId(story.chIntentId || resolvedChIntentId);
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);

    // Record View Activity if viewing another member's story
    if (story.mbrStoryId && !story.mbrStoryId.startsWith('temp_')) {
      (async () => {
        try {
          let viewerMbrId: string | null = null;
          const storedMbr = sessionStorage.getItem('sb_current_mbr');
          if (storedMbr) {
            try {
              const parsed = JSON.parse(storedMbr);
              if (parsed.mbrId) viewerMbrId = parsed.mbrId;
            } catch {}
          }
          if (!viewerMbrId) {
            const userStr = sessionStorage.getItem('user');
            if (userStr) {
              try {
                const u = JSON.parse(userStr);
                const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
                if (mbrProfile && mbrProfile.mbrId) viewerMbrId = mbrProfile.mbrId;
              } catch {}
            }
          }

          const storyOwnerMbrId = story.mbrMbrId || (memberId === 'm1' ? 'e20986fa-0fb9-4081-ae5d-35bc8f504df0' : memberId);
          if (viewerMbrId && storyOwnerMbrId && viewerMbrId !== storyOwnerMbrId) {
            const viewKey = `${viewerMbrId}_${story.mbrStoryId}`;
            if (!recordedViewsRef.current.has(viewKey)) {
              recordedViewsRef.current.add(viewKey);
              if (!isSandbox) {
                await mbrStoryActivityApi.createStoryActivity({
                  mbrId: storyOwnerMbrId,
                  mbrStoryId: story.mbrStoryId,
                  actMbrId: viewerMbrId,
                  actTypeCd: 'VIEW',
                  actDate: new Date().toISOString()
                });
                setStoryStatsMap((prev) => ({
                  ...prev,
                  [story.mbrStoryId!] : (prev[story.mbrStoryId!] || 0) + 1
                }));
              }
            }
          }
        } catch (viewErr) {
          console.warn("Could not record story view activity:", viewErr);
        }
      })();
    }
  };

  const loadCustomTopics = async () => {
    setLoadingCustomTopics(true);
    setTopicModalError(null);
    try {
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) currentMbrId = mbrProfile.mbrId;
        } catch (e) {}
      }
      let list: TopicCustom[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_custom_topics');
        if (saved) {
          try {
            list = ensureDefaultCustomTopics(JSON.parse(saved), currentMbrId);
          } catch {
            list = ensureDefaultCustomTopics(DEFAULT_CUSTOM_TOPICS, currentMbrId);
          }
        } else {
          list = ensureDefaultCustomTopics(DEFAULT_CUSTOM_TOPICS, currentMbrId);
          sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(list));
        }
      } else {
        try {
          const dbTopics = await taskApi.getCustomTopics(currentMbrId);
          if (Array.isArray(dbTopics) && dbTopics.length > 0) {
            list = ensureDefaultCustomTopics(dbTopics, currentMbrId);
          } else {
            const saved = sessionStorage.getItem('sandbox_custom_topics');
            if (saved) {
              list = ensureDefaultCustomTopics(JSON.parse(saved), currentMbrId);
            } else {
              list = ensureDefaultCustomTopics(DEFAULT_CUSTOM_TOPICS, currentMbrId);
            }
          }
        } catch (err) {
          console.warn("Could not load custom topics from DB, checking sandbox:", err);
          const saved = sessionStorage.getItem('sandbox_custom_topics');
          if (saved) {
            list = ensureDefaultCustomTopics(JSON.parse(saved), currentMbrId);
          } else {
            list = ensureDefaultCustomTopics(DEFAULT_CUSTOM_TOPICS, currentMbrId);
          }
        }
      }
      setCustomTopics(list);
      if (list.length > 0) {
        if (subordinateId) {
          const match = list.find((t) => (t.topicCustomId || t.mbrCustomTopicId) === subordinateId);
          setSelectedCustomTopic(match || list[0]);
        } else if (!selectedCustomTopic || !list.some(t => (t.topicCustomId || t.mbrCustomTopicId) === (selectedCustomTopic.topicCustomId || selectedCustomTopic.mbrCustomTopicId))) {
          setSelectedCustomTopic(list[0]);
        }
      }
      return list;
    } catch (err) {
      console.warn("Error loading custom topics in StoryEditorPanel:", err);
      return [];
    } finally {
      setLoadingCustomTopics(false);
    }
  };

  const handleAddNewStoryClick = async () => {
    const isOtherOrCustom = topicId?.toLowerCase() === 'other' || topicId?.toLowerCase() === 'custom' || topicTitle?.toLowerCase() === 'other' || topicTitle?.toLowerCase() === 'custom';
    
    if (isOtherOrCustom) {
      const list = await loadCustomTopics();
      setShowInlineNewTopic(false);
      setNewCustomTopicName('');
      setNewCustomTopicDesc('');
      setEditingTopicId(null);
      setTopicModalError(null);
      setShowCustomTopicModal(true);
    } else {
      handleCreateNew();
    }
  };

  const handleConfirmCustomTopicSelection = (topicToUse?: TopicCustom) => {
    const target = topicToUse || selectedCustomTopic;
    if (!target) return;
    const customTopicId = target.topicCustomId || target.mbrCustomTopicId || `ct_${Date.now()}`;
    const customTopicName = target.topicCustomName || target.mbrCustomTopicName || 'Custom Topic';
    const customIntentId = target.chIntentId || resolvedChIntentId || DEFAULT_TOPIC_LOOKUP['other'].chIntentId;

    const newId = `temp_${Date.now()}`;
    const finalStoryTypeCd = componentName || componentNameMap[topicId?.toLowerCase()] || 'sbMbrStryCustom';
    const newStory: Partial<MbrStory> = {
      mbrStoryId: newId,
      mbrStoryTitle: `Story of ${customTopicName}`,
      mbrStoryContent: '',
      mbrStoryPublishStatusCd: 'Draft',
      mbrStoryTypeCd: finalStoryTypeCd,
      mbrStorySubordinateId: customTopicId,
      mbrStoryTopicName: customTopicName,
      topicId: resolvedTopicId || DEFAULT_TOPIC_LOOKUP['other'].topicId,
      chIntentId: customIntentId,
      mbrCustomTopicId: customTopicId
    };
    setStories((prev) => [...prev, newStory]);
    setActiveStoryId(newId);
    setTitle(newStory.mbrStoryTitle!);
    setContent('');
    setStatus('Draft');
    setActiveIntentId(customIntentId);
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
    setShowCustomTopicModal(false);
  };

  const handleCreateCustomTopicInline = async () => {
    const trimmedName = newCustomTopicName.trim();
    if (!trimmedName) return;
    if (trimmedName.length > 22) {
      setTopicModalError('Topic name cannot exceed 22 characters.');
      return;
    }
    setCreatingCustomTopic(true);
    setTopicModalError(null);
    try {
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) currentMbrId = mbrProfile.mbrId;
        } catch (e) {}
      }
      const newCustomTopic: TopicCustom = {
        topicCustomId: `ct_${Date.now()}`,
        mbrId: currentMbrId,
        topicCustomName: trimmedName,
        topicCustomTopicDesc: newCustomTopicDesc.trim() || `Memories and reflections for ${trimmedName}.`,
        chIntentId: DEFAULT_TOPIC_LOOKUP['other'].chIntentId,
        mbrCustomTopicId: `ct_${Date.now()}`,
        mbrCustomTopicName: trimmedName,
        mbrCustomTopicDesc: newCustomTopicDesc.trim() || `Memories and reflections for ${trimmedName}.`
      };
      if (isSandbox) {
        const nextList = [...customTopics, newCustomTopic];
        setCustomTopics(nextList);
        sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
        setNewCustomTopicName('');
        setNewCustomTopicDesc('');
        setShowInlineNewTopic(false);
        handleConfirmCustomTopicSelection(newCustomTopic);
      } else {
        try {
          const created = await taskApi.createCustomTopic(newCustomTopic);
          setCustomTopics((prev) => [...prev, created]);
          setNewCustomTopicName('');
          setNewCustomTopicDesc('');
          setShowInlineNewTopic(false);
          handleConfirmCustomTopicSelection(created);
        } catch (e) {
          const nextList = [...customTopics, newCustomTopic];
          setCustomTopics(nextList);
          sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
          setNewCustomTopicName('');
          setNewCustomTopicDesc('');
          setShowInlineNewTopic(false);
          handleConfirmCustomTopicSelection(newCustomTopic);
        }
      }
    } catch (err: any) {
      setTopicModalError(`Failed to create custom topic: ${err.message || err}`);
    } finally {
      setCreatingCustomTopic(false);
    }
  };

  const handleStartEditCustomTopic = (e: React.MouseEvent, ct: TopicCustom) => {
    e.stopPropagation();
    const id = ct.topicCustomId || ct.mbrCustomTopicId || '';
    setEditingTopicId(id);
    setEditTopicName(ct.topicCustomName || ct.mbrCustomTopicName || '');
    setEditTopicDesc(ct.topicCustomTopicDesc || ct.mbrCustomTopicDesc || (ct as any).topicCustomTipicDesc || '');
    setTopicModalError(null);
  };

  const handleCancelEditCustomTopic = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingTopicId(null);
    setEditTopicName('');
    setEditTopicDesc('');
    setTopicModalError(null);
  };

  const handleSaveCustomTopicEdit = async (e: React.MouseEvent, ct: TopicCustom) => {
    e.stopPropagation();
    const trimmed = editTopicName.trim();
    if (!trimmed) {
      setTopicModalError('Topic name cannot be empty.');
      return;
    }
    if (trimmed.length > 22) {
      setTopicModalError('Topic name cannot exceed 22 characters.');
      return;
    }
    setSavingTopicEdit(true);
    setTopicModalError(null);
    try {
      const id = ct.topicCustomId || ct.mbrCustomTopicId || '';
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) currentMbrId = mbrProfile.mbrId;
        } catch {}
      }

      const updatedCt: TopicCustom = {
        ...ct,
        topicCustomName: trimmed,
        topicCustomTopicDesc: editTopicDesc.trim() || undefined,
        mbrCustomTopicName: trimmed,
        mbrCustomTopicDesc: editTopicDesc.trim() || undefined
      };

      if (isSandbox || id.startsWith('ct_remember') || id.startsWith('ct_flash') || id.startsWith('ct_')) {
        const nextList = customTopics.map((t) => (t.topicCustomId || t.mbrCustomTopicId) === id ? updatedCt : t);
        setCustomTopics(nextList);
        sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
      } else {
        try {
          await taskApi.updateCustomTopic(id, {
            mbrId: currentMbrId,
            topicCustomName: trimmed,
            topicCustomTopicDesc: editTopicDesc.trim() || undefined
          });
          const refreshed = await taskApi.getCustomTopics(currentMbrId);
          const withDefaults = ensureDefaultCustomTopics(refreshed, currentMbrId);
          setCustomTopics(withDefaults);
        } catch (err: any) {
          console.warn("Could not update custom topic in DB, updating locally:", err);
          const nextList = customTopics.map((t) => (t.topicCustomId || t.mbrCustomTopicId) === id ? updatedCt : t);
          setCustomTopics(nextList);
          sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
        }
      }

      if ((selectedCustomTopic?.topicCustomId || selectedCustomTopic?.mbrCustomTopicId) === id) {
        setSelectedCustomTopic(updatedCt);
      }
      setEditingTopicId(null);
    } catch (err: any) {
      setTopicModalError(`Failed to save topic edit: ${err.message || err}`);
    } finally {
      setSavingTopicEdit(false);
    }
  };

  const handleDeleteCustomTopic = async (e: React.MouseEvent, ct: TopicCustom) => {
    e.stopPropagation();
    const id = ct.topicCustomId || ct.mbrCustomTopicId || '';
    setDeletingTopicId(id);
    setTopicModalError(null);
    try {
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) currentMbrId = mbrProfile.mbrId;
        } catch {}
      }

      if (isSandbox || id.startsWith('ct_remember') || id.startsWith('ct_flash') || id.startsWith('ct_')) {
        const nextList = customTopics.filter((t) => (t.topicCustomId || t.mbrCustomTopicId) !== id);
        setCustomTopics(nextList);
        sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
        if ((selectedCustomTopic?.topicCustomId || selectedCustomTopic?.mbrCustomTopicId) === id) {
          setSelectedCustomTopic(nextList[0] || null);
        }
      } else {
        try {
          await taskApi.deleteCustomTopic(id);
          const refreshed = await taskApi.getCustomTopics(currentMbrId);
          const withDefaults = ensureDefaultCustomTopics(refreshed, currentMbrId);
          setCustomTopics(withDefaults);
          if ((selectedCustomTopic?.topicCustomId || selectedCustomTopic?.mbrCustomTopicId) === id) {
            setSelectedCustomTopic(withDefaults[0] || null);
          }
        } catch (err: any) {
          console.warn("Could not delete custom topic from DB, deleting locally:", err);
          const nextList = customTopics.filter((t) => (t.topicCustomId || t.mbrCustomTopicId) !== id);
          setCustomTopics(nextList);
          sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(nextList));
          if ((selectedCustomTopic?.topicCustomId || selectedCustomTopic?.mbrCustomTopicId) === id) {
            setSelectedCustomTopic(nextList[0] || null);
          }
        }
      }
    } catch (err: any) {
      setTopicModalError(`Failed to delete topic: ${err.message || err}`);
    } finally {
      setDeletingTopicId(null);
    }
  };

  const handleCreateNew = (customTopic?: TopicCustom) => {
    const isOtherOrCustom = topicId?.toLowerCase() === 'other' || topicId?.toLowerCase() === 'custom' || topicTitle?.toLowerCase() === 'other' || topicTitle?.toLowerCase() === 'custom';
    const customTopicId = customTopic?.topicCustomId || customTopic?.mbrCustomTopicId || (isOtherOrCustom ? subordinateId : undefined);
    const customTopicName = customTopic?.topicCustomName || customTopic?.mbrCustomTopicName || (isOtherOrCustom ? subordinateName : undefined);
    const customIntentId = customTopic?.chIntentId || resolvedChIntentId || (isOtherOrCustom ? DEFAULT_TOPIC_LOOKUP['other'].chIntentId : undefined);

    const newId = `temp_${Date.now()}`;
    const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId?.toLowerCase()] || topicId);
    const resolvedTopicName = customTopicName || subordinateName || (isOtherOrCustom ? (subordinateName || topicTitle) : undefined);
    const newStory: Partial<MbrStory> = {
      mbrStoryId: newId,
      mbrStoryTitle: customTopicName ? `Story of ${customTopicName}` : (subordinateName ? `Story of ${subordinateName}` : (isOtherOrCustom ? 'New Custom Topic Story' : `New ${topicTitle} Story`)),
      mbrStoryContent: '',
      mbrStoryPublishStatusCd: 'Draft',
      mbrStoryTypeCd: finalStoryTypeCd,
      mbrStorySubordinateId: customTopicId || subordinateId || undefined,
      mbrStoryTopicName: resolvedTopicName,
      topicId: resolvedTopicId,
      chIntentId: customIntentId || resolvedChIntentId,
      mbrCustomTopicId: customTopicId || (isOtherOrCustom ? (subordinateId || undefined) : undefined)
    };
    setStories((prev) => [...prev, newStory]);
    setActiveStoryId(newId);
    setTitle(newStory.mbrStoryTitle!);
    setContent('');
    setStatus('Draft');
    setActiveIntentId(newStory.chIntentId);
    setIsEditing(true);
    setError(null);
    setSuccessMsg(null);
    setShowCustomTopicModal(false);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Story title is required.');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const currentMbrId = await resolveCurrentMbrId(memberId, resolvedMbrId);
      setResolvedMbrId(currentMbrId);

      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId?.toLowerCase()] || topicId || 'sbMbrStryCustom');
      const sandboxKey = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;

      // Find original version from active story
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
      const version = activeStory ? (activeStory.mbrStoryVersion || 1) : 1;
      const todayDateStr = new Date().toISOString().split('T')[0];

      const rawSubordinateId = activeStory?.mbrStorySubordinateId || activeStory?.mbrCustomTopicId || subordinateId;
      const validSubordinateId = isUuid(rawSubordinateId) ? rawSubordinateId : undefined;
      const validCustomTopicId = isUuid(activeStory?.mbrCustomTopicId) ? activeStory?.mbrCustomTopicId : (isUuid(subordinateId) ? subordinateId : undefined);
      const isOtherOrCustomStory = (topicId || '').toLowerCase() === 'other' || (topicId || '').toLowerCase() === 'custom' || finalStoryTypeCd === 'sbMbrStryCustom' || activeStory?.mbrStoryTypeCd === 'sbMbrStryCustom';
      const fallbackTopicId = isOtherOrCustomStory ? 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e' : (DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.topicId || 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e');
      const fallbackChIntentId = isOtherOrCustomStory ? 'c75f4efc-8a83-4084-89a4-e3ab49798d60' : (DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.chIntentId || 'c75f4efc-8a83-4084-89a4-e3ab49798d60');

      const validTopicId = isUuid(activeStory?.topicId) ? activeStory?.topicId : (isUuid(resolvedTopicId) ? resolvedTopicId : fallbackTopicId);
      const validChIntentId = isUuid(activeIntentId) ? activeIntentId : (isUuid(activeStory?.chIntentId) ? activeStory?.chIntentId : (isUuid(resolvedChIntentId) ? resolvedChIntentId : fallbackChIntentId));

      const derivedTopicStr = activeStory?.mbrStoryTopicName || subordinateName || (topicId?.toLowerCase() === 'other' ? (subordinateName || topicTitle) : undefined) || 'Other';
      const cleanTopicName = derivedTopicStr ? derivedTopicStr.slice(0, 40) : undefined;

      // Check if user is publishing a draft story that has an original published story reference
      const isPublishingDraftWithOriginal = (status || '').toLowerCase() === 'published' && activeStory && activeStory.mbrStoryOriginalId && isUuid(activeStory.mbrStoryOriginalId);

      if (isPublishingDraftWithOriginal) {
        const originalId = activeStory.mbrStoryOriginalId!;
        const updatedOriginalStory: Partial<MbrStory> = {
          mbrStoryTitle: title.trim().slice(0, 240),
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: activeStory.mbrStoryPublishedDate || todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd.slice(0, 40),
          mbrStorySubordinateId: validSubordinateId,
          mbrStoryTopicName: cleanTopicName,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: version,
          mbrStoryThreadID: activeThreadId ? activeThreadId.slice(0, 88) : undefined,
          chIntentId: validChIntentId,
          topicId: validTopicId,
          mbrCustomTopicId: validCustomTopicId,
        };

        if (isSandbox) {
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? { ...updatedOriginalStory, mbrStoryId: originalId } : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push({ ...updatedOriginalStory, mbrStoryId: originalId });
          }
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          const updatedTarget = nextList.find((s) => s.mbrStoryId === originalId) || { ...updatedOriginalStory, mbrStoryId: originalId };
          selectStory(updatedTarget);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
        } else {
          const savedResult = await taskApi.updateStory(originalId, updatedOriginalStory);
          if (activeStoryId && activeStoryId !== originalId && !activeStoryId.startsWith('temp_')) {
            try {
              await taskApi.deleteStory(activeStoryId);
            } catch (delErr) {
              console.warn("Could not delete draft story after publishing:", delErr);
            }
          }
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? savedResult : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push(savedResult);
          }
          setStories(nextList);
          selectStory(savedResult);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
        setIsEditing(false);
        return;
      }

      const updatedStory: Partial<MbrStory> = {
        mbrStoryId: (activeStoryId && !activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
        mbrStoryTitle: title.trim().slice(0, 240),
        mbrStoryContent: content,
        mbrStoryPublishStatusCd: status,
        mbrStoryPublishedDate: (status || '').toLowerCase() === 'published' ? (activeStory?.mbrStoryPublishedDate || todayDateStr) : activeStory?.mbrStoryPublishedDate,
        mbrStoryTypeCd: finalStoryTypeCd.slice(0, 40),
        mbrStorySubordinateId: validSubordinateId,
        mbrStoryTopicName: cleanTopicName,
        mbrMbrId: currentMbrId,
        mbrStoryVersion: version,
        mbrStoryThreadID: activeThreadId ? activeThreadId.slice(0, 88) : undefined,
        chIntentId: validChIntentId,
        topicId: validTopicId,
        mbrCustomTopicId: validCustomTopicId,
        mbrStoryOriginalId: isUuid(activeStory?.mbrStoryOriginalId) ? activeStory?.mbrStoryOriginalId : undefined,
      };

      if (isSandbox) {
        // In Sandbox mode, keep a temp/mock ID
        const sandboxStory = {
          ...updatedStory,
          mbrStoryId: activeStoryId || `st_${Date.now()}`
        };
        const nextList = stories.map((s) =>
          s.mbrStoryId === activeStoryId ? sandboxStory : s
        );
        if (!stories.some((s) => s.mbrStoryId === activeStoryId)) {
          nextList.push(sandboxStory);
        }
        setStories(nextList);
        sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
        setSuccessMsg('Story saved successfully to Sandbox!');
      } else {
        let savedResult: MbrStory;
        if (activeStoryId && !activeStoryId.startsWith('temp_')) {
          savedResult = await taskApi.updateStory(activeStoryId, updatedStory);
        } else {
          savedResult = await taskApi.createStory(updatedStory);
        }
        
        // Update local state stories list
        const nextList = stories.map((s) =>
          s.mbrStoryId === activeStoryId ? savedResult : s
        );
        if (!stories.some((s) => s.mbrStoryId === activeStoryId)) {
          nextList.push(savedResult);
        }
        setStories(nextList);
        setActiveStoryId(savedResult.mbrStoryId);
        setSuccessMsg('Story saved successfully to database!');
      }
      setIsEditing(false);
    } catch (err: any) {
      setError(`Failed to save story: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!activeStoryId) return;
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!activeStoryId) return;
    setDeleting(true);

    try {
      const finalStoryTypeCd = componentName || componentNameMap[topicId] || topicId;

      if (isSandbox) {
        const nextList = stories.filter((s) => s.mbrStoryId !== activeStoryId);
        setStories(nextList);
        sessionStorage.setItem(`sandbox_stories_${finalStoryTypeCd}`, JSON.stringify(nextList));
        if (nextList.length > 0) {
          selectStory(nextList[0]);
        } else {
          setTitle('');
          setContent('');
          setActiveStoryId(null);
        }
      } else {
        if (!activeStoryId.startsWith('temp_')) {
          await taskApi.deleteStory(activeStoryId);
        }
        const nextList = stories.filter((s) => s.mbrStoryId !== activeStoryId);
        setStories(nextList);
        if (nextList.length > 0) {
          selectStory(nextList[0]);
        } else {
          setTitle('');
          setContent('');
          setActiveStoryId(null);
        }
      }
      setSuccessMsg('Story deleted successfully.');
      setShowDeleteModal(false);
    } catch (err: any) {
      setError(`Failed to delete story: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const confirmPublish = () => {
    if (!activeStoryId) return;
    setShowPublishModal(true);
  };

  const executePublish = async () => {
    if (!activeStoryId) return;
    setPublishing(true);
    setError(null);

    try {
      const currentMbrId = await resolveCurrentMbrId(memberId, resolvedMbrId);
      setResolvedMbrId(currentMbrId);

      const finalStoryTypeCd = (topicId === 'family' || componentName === 'sbMbrStryFamilyMember' || componentName === 'sbMbrStryFamly') ? 'sbMbrStryFamly' : (componentName || componentNameMap[topicId?.toLowerCase()] || topicId || 'sbMbrStryCustom');
      const sandboxKey = `sandbox_stories_${finalStoryTypeCd}_${subordinateId || 'all'}`;
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);

      const todayDateStr = new Date().toISOString().split('T')[0];

      const rawSubordinateId = activeStory?.mbrStorySubordinateId || activeStory?.mbrCustomTopicId || subordinateId;
      const validSubordinateId = isUuid(rawSubordinateId) ? rawSubordinateId : undefined;
      const validCustomTopicId = isUuid(activeStory?.mbrCustomTopicId) ? activeStory?.mbrCustomTopicId : (isUuid(subordinateId) ? subordinateId : undefined);
      const isOtherOrCustomStory = (topicId || '').toLowerCase() === 'other' || (topicId || '').toLowerCase() === 'custom' || finalStoryTypeCd === 'sbMbrStryCustom' || activeStory?.mbrStoryTypeCd === 'sbMbrStryCustom';
      const fallbackTopicId = isOtherOrCustomStory ? 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e' : (DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.topicId || 'f3bc73b4-d4db-4390-ad3b-6aa07af70e4e');
      const fallbackChIntentId = isOtherOrCustomStory ? 'c75f4efc-8a83-4084-89a4-e3ab49798d60' : (DEFAULT_TOPIC_LOOKUP[topicId?.toLowerCase()]?.chIntentId || 'c75f4efc-8a83-4084-89a4-e3ab49798d60');

      const validTopicId = isUuid(activeStory?.topicId) ? activeStory?.topicId : (isUuid(resolvedTopicId) ? resolvedTopicId : fallbackTopicId);
      const validChIntentId = isUuid(activeIntentId) ? activeIntentId : (isUuid(activeStory?.chIntentId) ? activeStory?.chIntentId : (isUuid(resolvedChIntentId) ? resolvedChIntentId : fallbackChIntentId));

      const derivedTopicStr = activeStory?.mbrStoryTopicName || subordinateName || (topicId?.toLowerCase() === 'other' ? (subordinateName || topicTitle) : undefined) || 'Other';
      const cleanTopicName = derivedTopicStr ? derivedTopicStr.slice(0, 40) : undefined;

      // Check if publishing a draft story that references an original published story
      if (activeStory && activeStory.mbrStoryOriginalId && isUuid(activeStory.mbrStoryOriginalId)) {
        const originalId = activeStory.mbrStoryOriginalId;
        const updatedOriginalStory: Partial<MbrStory> = {
          mbrStoryTitle: (title.trim() || 'Untitled Story').slice(0, 240),
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd.slice(0, 40),
          mbrStorySubordinateId: validSubordinateId,
          mbrStoryTopicName: cleanTopicName,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: activeStory.mbrStoryVersion || 1,
          mbrStoryThreadID: activeThreadId ? activeThreadId.slice(0, 88) : undefined,
          chIntentId: validChIntentId,
          topicId: validTopicId,
          mbrCustomTopicId: validCustomTopicId,
        };

        if (isSandbox) {
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? { ...updatedOriginalStory, mbrStoryId: originalId } : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push({ ...updatedOriginalStory, mbrStoryId: originalId });
          }
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          const updatedTarget = nextList.find((s) => s.mbrStoryId === originalId) || { ...updatedOriginalStory, mbrStoryId: originalId };
          selectStory(updatedTarget);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
        } else {
          const savedResult = await taskApi.updateStory(originalId, updatedOriginalStory);
          if (activeStoryId && activeStoryId !== originalId && !activeStoryId.startsWith('temp_')) {
            try {
              await taskApi.deleteStory(activeStoryId);
            } catch (delErr) {
              console.warn("Could not delete draft story after publishing:", delErr);
            }
          }
          const nextList = stories
            .filter((s) => s.mbrStoryId !== activeStoryId)
            .map((s) => (s.mbrStoryId === originalId ? savedResult : s));
          if (!nextList.some((s) => s.mbrStoryId === originalId)) {
            nextList.push(savedResult);
          }
          setStories(nextList);
          selectStory(savedResult);
          setSuccessMsg('Published draft changes to original story, and removed draft copy!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
      } else {
        const updatedStory: Partial<MbrStory> = {
          mbrStoryId: (!activeStoryId.startsWith('temp_')) ? activeStoryId : undefined,
          mbrStoryTitle: (title.trim() || 'Untitled Story').slice(0, 240),
          mbrStoryContent: content,
          mbrStoryPublishStatusCd: 'Published',
          mbrStoryPublishedDate: todayDateStr,
          mbrStoryTypeCd: finalStoryTypeCd.slice(0, 40),
          mbrStorySubordinateId: validSubordinateId,
          mbrStoryTopicName: cleanTopicName,
          mbrMbrId: currentMbrId,
          mbrStoryVersion: activeStory ? (activeStory.mbrStoryVersion || 1) : 1,
          mbrStoryThreadID: activeThreadId ? activeThreadId.slice(0, 88) : undefined,
          chIntentId: validChIntentId,
          topicId: validTopicId,
          mbrCustomTopicId: validCustomTopicId,
        };

        if (isSandbox) {
          const sandboxStory = {
            ...updatedStory,
            mbrStoryId: activeStoryId
          };
          const nextList = stories.map((s) =>
            s.mbrStoryId === activeStoryId ? sandboxStory : s
          );
          setStories(nextList);
          sessionStorage.setItem(sandboxKey, JSON.stringify(nextList));
          setStatus('Published');
          setSuccessMsg('Story published successfully in Sandbox!');
        } else {
          let savedResult: MbrStory;
          if (!activeStoryId.startsWith('temp_')) {
            savedResult = await taskApi.updateStory(activeStoryId, updatedStory);
          } else {
            savedResult = await taskApi.createStory(updatedStory);
          }
          const nextList = stories.map((s) =>
            s.mbrStoryId === activeStoryId ? savedResult : s
          );
          setStories(nextList);
          setActiveStoryId(savedResult.mbrStoryId);
          setStatus('Published');
          setSuccessMsg('Story published successfully to database!');
          window.dispatchEvent(new CustomEvent('stats-updated'));
        }
      }
      setShowPublishModal(false);
    } catch (err: any) {
      setError(`Failed to publish story: ${err.message}`);
    } finally {
      setPublishing(false);
    }
  };

  const handleEditClick = () => {
    setError(null);
    setSuccessMsg(null);
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    setSuccessMsg(null);

    // If the active story was a new uncommitted temporary story, remove it
    if (activeStoryId && activeStoryId.startsWith('temp_')) {
      const remainingStories = stories.filter((s) => s.mbrStoryId !== activeStoryId);
      setStories(remainingStories);
      if (remainingStories.length > 0) {
        selectStory(remainingStories[0]);
      } else {
        setActiveStoryId(null);
        setTitle('');
        setContent('');
        setStatus('Draft');
      }
    } else {
      // Revert the form inputs back to the saved active story's values
      const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
      if (activeStory) {
        selectStory(activeStory);
      }
    }
  };

  const handlePrivacyClick = () => {
    if (!activeStoryId) {
      setError('Please select or create a story first before configuring group privacy.');
      return;
    }
    setShowStoryPrivacyModal(true);
  };

  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const activePhotoCount = (activeStoryId && storyPhotosCountMap[activeStoryId]) || 0;

  return (
    <div id="story-editor-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-4 sm:py-5 px-2.5 sm:px-4 shadow-[0_8px_20px_rgba(0,0,0,0.015)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* --- HEADER BAR --- */}
      <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/60 border border-blue-100 text-blue-700 rounded-xl">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base sm:text-lg font-bold text-slate-800 leading-tight">
              {readOnly ? 'Member Stories' : 'Story Editor'}
            </h3>
            <p className="text-xs font-sans font-bold text-amber-500 tracking-wide mt-0.5">
              {subordinateName ? `${topicTitle} (${subordinateName})` : topicTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!readOnly && !isEditing && (
            <button
              onClick={handleAddNewStoryClick}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer shadow-sm active:scale-95 border border-blue-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Story</span>
            </button>
          )}
        </div>
      </div>

      {/* --- NOTIFICATIONS --- */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 py-2.5 px-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}

        {successMsg && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-2.5 py-2.5 px-3 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-2xl"
          >
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <div className="text-xs font-medium flex-grow">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="cursor-pointer">
              <X className="w-4 h-4 opacity-50 hover:opacity-100" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- STORIES TABLE --- */}
      {!isEditing && stories.length > 0 && (
        <div className="bg-white border border-[#EFECE7] rounded-2xl overflow-hidden shadow-xs">
          <div className="max-h-[225px] overflow-y-auto scrollbar-thin rounded-2xl">
            <table className="w-full table-fixed text-left text-xs border-separate border-spacing-0">
              <thead className="sticky top-0 z-10">
                <tr className="text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider bg-[#FAF8F5]">
                  <th className="py-2.5 pl-3 sm:pl-4 pr-1 sm:pr-2 text-left w-24 sm:w-28 md:w-32 shrink-0 rounded-tl-2xl border-b border-[#EFECE7] align-bottom">
                    <button
                      type="button"
                      onClick={() => handleSort('topic')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Topic</span>
                      {sortColumn === 'topic' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-1 sm:px-2 text-left w-auto border-b border-[#EFECE7] align-bottom">
                    <button
                      type="button"
                      onClick={() => handleSort('story')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Story</span>
                      {sortColumn === 'story' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-1 sm:px-2 text-right w-12 sm:w-14 shrink-0 border-b border-[#EFECE7] align-bottom">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSort('views')}
                        className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-right font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                      >
                        <span>Views</span>
                        {sortColumn === 'views' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="py-2.5 px-1 sm:px-1.5 text-right w-[72px] sm:w-[86px] min-w-[72px] shrink-0 border-b border-[#EFECE7] align-bottom">
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleSort('date')}
                        className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-right font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                      >
                        <span>Date</span>
                        {sortColumn === 'date' ? (
                          sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                        )}
                      </button>
                    </div>
                  </th>
                  <th className="py-2.5 pr-2.5 sm:pr-3.5 pl-1 text-center w-8 sm:w-9 min-w-[32px] shrink-0 rounded-tr-2xl border-b border-[#EFECE7] align-bottom">
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={() => handleSort('published')}
                        title="Sort by Published Status"
                        className="group/btn inline-flex items-center justify-center cursor-pointer select-none text-slate-400 hover:text-slate-700 transition-colors"
                      >
                        <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                        {sortColumn === 'published' && (
                          sortDirection === 'asc' ? <ArrowUp className="w-2.5 h-2.5 text-blue-600 ml-0.5 shrink-0" /> : <ArrowDown className="w-2.5 h-2.5 text-blue-600 ml-0.5 shrink-0" />
                        )}
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedStories.map((s, idx) => {
                  const isActive = activeStoryId === s.mbrStoryId;
                  const formattedDate = formatPublishedDate(s.mbrStoryPublishedDate || s.mbrStoryUpdatedAt || s.mbrStoryCreatedAt);
                  const viewCount = (s.mbrStoryId && storyStatsMap[s.mbrStoryId] !== undefined) ? storyStatsMap[s.mbrStoryId] : 0;
                  const isLastRow = idx === sortedStories.length - 1;
                  const displayTopicName = s.mbrStoryTopicName || topicTitle || '—';
                  const isPublished = (s.mbrStoryPublishStatusCd || '').trim().toLowerCase() === 'published';
                  return (
                    <tr
                      key={s.mbrStoryId}
                      onClick={() => selectStory(s)}
                      className={`cursor-pointer transition-colors duration-150 ${
                        isActive
                          ? 'bg-blue-50/70 font-bold text-slate-900'
                          : 'hover:bg-slate-50/80 text-slate-700'
                      }`}
                    >
                      <td className={`py-2.5 pl-2.5 sm:pl-3 pr-1 sm:pr-2 font-serif text-left align-top border-b border-[#EFECE7] ${isLastRow ? 'border-b-0' : ''}`}>
                        <div className="flex items-start gap-1.5 sm:gap-2 min-w-0 pt-0.5">
                          <div className={`w-1 sm:w-1.5 h-4 rounded-full shrink-0 mt-0.5 ${isActive ? 'bg-blue-600' : 'bg-transparent'}`} />
                          <span className="text-left font-serif text-slate-800 truncate" title={displayTopicName}>
                            {displayTopicName}
                          </span>
                        </div>
                      </td>
                      <td className={`py-2.5 px-1 sm:px-2 font-serif text-left align-top border-b border-[#EFECE7] ${isLastRow ? 'border-b-0' : ''}`}>
                        <span className="text-left whitespace-normal break-words leading-snug block">
                          {s.mbrStoryTitle || 'Untitled Story'}
                        </span>
                      </td>
                      <td className={`py-2.5 px-1 sm:px-2 text-right font-mono text-[10.5px] sm:text-[11px] text-slate-600 align-top border-b border-[#EFECE7] ${isLastRow ? 'border-b-0' : ''}`}>
                        {viewCount.toLocaleString()}
                      </td>
                      <td className={`py-2.5 px-1 sm:px-1.5 text-right font-mono text-[10.5px] sm:text-[11px] text-slate-500 whitespace-nowrap align-top border-b border-[#EFECE7] ${isLastRow ? 'border-b-0' : ''}`}>
                        {formattedDate}
                      </td>
                      <td className={`py-2.5 pr-2.5 sm:pr-3.5 pl-1 text-center align-top border-b border-[#EFECE7] ${isLastRow ? 'border-b-0' : ''}`}>
                        {isPublished && (
                          <div className="flex items-center justify-center pt-0.5" title="Published">
                            <Globe className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600" />
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- MAIN EDITOR / VIEW CONTENT --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading stories...</span>
        </div>
      ) : stories.length === 0 ? (
        /* NO STORIES FOUND STATE */
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center flex flex-col items-center justify-center gap-3">
          <FileText className="w-8 h-8 text-slate-350" />
          <p className="text-xs font-serif text-slate-500 italic">
            {readOnly ? 'No published stories are currently accessible in this section.' : 'No stories found for this section.'}
          </p>
          {!readOnly && (
            <button
              onClick={handleAddNewStoryClick}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md shadow-blue-500/10 active:scale-95 border border-blue-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Story</span>
            </button>
          )}
        </div>
      ) : isEditing ? (
        /* EDIT MODE */
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
              Story Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. A Summer to Remember..."
              className="w-full bg-white border border-[#EFECE7] rounded-xl font-serif text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100 px-3 py-2 sm:py-2.5 outline-none focus:border-slate-800 transition-colors tracking-tight leading-snug"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                Story Content & Narrative
              </label>
              <span className="text-[10px] font-mono text-slate-400 font-bold">
                {wordCount} words
              </span>
            </div>
            <textarea
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your story details here. Share memories, feelings, and reflection..."
              className="w-full bg-white border border-[#EFECE7] rounded-2xl text-sm sm:text-[15px] font-sans text-slate-600 dark:text-slate-300 p-3 sm:p-3.5 leading-relaxed outline-none focus:border-slate-800 transition-colors resize-y font-normal"
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-[#EFECE7]">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const normalizedTopic = (topicId || topicTitle || '').toLowerCase();
                  const activeStory = stories.find((s) => s.mbrStoryId === activeStoryId);
                  const isOtherOrCustom = normalizedTopic === 'other' || normalizedTopic === 'custom' || componentName === 'sbMbrStryCustom' || Boolean(activeStory?.mbrCustomTopicId);
                  const compName = (subordinateId || activeStory?.mbrCustomTopicId || componentName === 'sbMbrStryFamilyMember')
                    ? (normalizedTopic === 'family' ? 'sbMbrStryFamilyMember' : (componentName || componentNameMap[normalizedTopic] || 'sbMbrStryCustom'))
                    : (componentName || componentNameMap[normalizedTopic] || (matchedTopic?.topicName ? componentNameMap[matchedTopic.topicName.toLowerCase()] : undefined) || 'sbMbrStryFamly');
                  const intentToUse = activeStory?.chIntentId || activeIntentId || resolvedChIntentId || chIntentId || (normalizedTopic && DEFAULT_TOPIC_LOOKUP[normalizedTopic]?.chIntentId);

                  // Find matching custom topic metadata
                  const targetCustomId = activeStory?.mbrCustomTopicId || activeStory?.mbrStorySubordinateId || subordinateId;
                  const matchedCustom = customTopics.find(t =>
                    (targetCustomId && (t.topicCustomId === targetCustomId || t.mbrCustomTopicId === targetCustomId)) ||
                    (activeStory?.mbrStoryTopicName && (t.topicCustomName === activeStory.mbrStoryTopicName || t.mbrCustomTopicName === activeStory.mbrStoryTopicName)) ||
                    (subordinateName && (t.topicCustomName === subordinateName || t.mbrCustomTopicName === subordinateName))
                  ) || (isOtherOrCustom ? selectedCustomTopic : null);

                  const customName = matchedCustom?.topicCustomName || matchedCustom?.mbrCustomTopicName || activeStory?.mbrStoryTopicName || (isOtherOrCustom ? (subordinateName || title) : undefined);
                  const customDesc = matchedCustom?.topicCustomTopicDesc || matchedCustom?.mbrCustomTopicDesc || (matchedCustom as any)?.topicCustomTipicDesc;
                  const finalCustomId = matchedCustom?.topicCustomId || matchedCustom?.mbrCustomTopicId || targetCustomId;

                  window.dispatchEvent(new CustomEvent('open-story-mate', {
                    detail: {
                      componentName: compName,
                      topicId: resolvedTopicId || topicId,
                      topicTitle: activeStory?.mbrStoryTopicName || topicTitle,
                      activeStoryId,
                      mbrStoryThreadID: activeThreadId,
                      chIntentId: intentToUse,
                      storyTitle: title,
                      storyContent: content,
                      topicCustomName: customName,
                      topicCustomTopicDesc: customDesc,
                      topicCustomId: finalCustomId,
                      subordinateId: subordinateId || finalCustomId,
                    }
                  }));
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
                title="StoryMate AI Assistant"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>StoryMate AI</span>
              </button>

              {/* Photo gallery, narration player, and print PDF hidden during edit mode */}
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3">
              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-3.5 sm:px-4 py-1.5 sm:py-2 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 px-4 sm:px-5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all duration-150 cursor-pointer disabled:opacity-50 border border-blue-600"
              >
                {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{saving ? 'Saving...' : 'Save'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* VIEW MODE */
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-[#EFECE7] rounded-2xl py-3.5 sm:py-4 px-2.5 sm:px-3.5 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="font-serif text-xl sm:text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug tracking-tight">
                  {title || 'Untitled Story'}
                </h4>
                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold font-mono uppercase ${
                  (status || '').toLowerCase() === 'published'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {status || 'Draft'}
                </span>
              </div>
              {!readOnly && (() => {
                const isStoryPublished = (status || '').toLowerCase() === 'published';
                return (
                  <div className="flex items-center gap-2 shrink-0">
                    {/* Photo Gallery Quick Button */}
                    <button
                      type="button"
                      onClick={() => setShowPhotoGalleryModal(true)}
                      disabled={!activeStoryId}
                      title={`Story Photos${activePhotoCount > 0 ? ` (${activePhotoCount} photos)` : ''}`}
                      className="relative p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-150 rounded-xl cursor-pointer transition-colors"
                    >
                      <Images className="w-4 h-4 text-indigo-600" />
                      {activePhotoCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-indigo-600 text-white rounded-full leading-none shadow-xs">
                          {activePhotoCount}
                        </span>
                      )}
                    </button>

                    {/* AI Voice Narration (Published state) */}
                    {isStoryPublished && (
                      <button
                        type="button"
                        onClick={() => setShowAiVoiceModal(true)}
                        disabled={!activeStoryId}
                        title="Generate AI Voice Narration (MP3)"
                        className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 border border-slate-200 hover:border-purple-200 rounded-xl cursor-pointer transition-colors"
                      >
                        <Mic className="w-4 h-4 text-purple-600" />
                      </button>
                    )}

                    {/* Inline Story Audio Player if story has text */}
                    {content && (
                      <StoryAudioPlayer
                        text={`${title}. ${content}`}
                        storyId={activeStoryId || 'editor-story'}
                        title={title}
                        variant="icon-button"
                        showLabel={false}
                      />
                    )}

                    {/* 3-Dotted Vertical Action Menu Dropdown */}
                    <div className="relative inline-flex items-center story-action-menu-container">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(!showActionMenu);
                        }}
                        className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                          showActionMenu
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                        }`}
                        title="Story Actions"
                        aria-label="Story Actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      <AnimatePresence>
                        {showActionMenu && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-[#EFECE7] rounded-2xl shadow-xl py-1.5 min-w-[175px] text-left divide-y divide-slate-100 font-sans"
                          >
                            <div className="py-1">
                              {/* Edit Story */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActionMenu(false);
                                  handleEditClick();
                                }}
                                disabled={saving}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                              >
                                <Edit3 className="w-4 h-4 text-blue-600 shrink-0" />
                                <span>Edit Story</span>
                              </button>

                              {/* Publish Story */}
                              <button
                                type="button"
                                onClick={() => {
                                  if (isStoryPublished) return;
                                  setShowActionMenu(false);
                                  confirmPublish();
                                }}
                                disabled={isStoryPublished}
                                className={`w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold transition-colors text-left ${
                                  isStoryPublished
                                    ? 'text-slate-300 opacity-50 cursor-not-allowed pointer-events-none'
                                    : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer'
                                }`}
                              >
                                <Globe className={`w-4 h-4 shrink-0 ${isStoryPublished ? 'text-slate-300' : 'text-emerald-600'}`} />
                                <span>{isStoryPublished ? 'Published' : 'Publish Story'}</span>
                              </button>

                              {/* Privacy Settings */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActionMenu(false);
                                  handlePrivacyClick();
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer text-left"
                              >
                                <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                                <span>Privacy Settings</span>
                              </button>

                              {/* Print to PDF */}
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActionMenu(false);
                                  handlePrintToPdf();
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 transition-colors cursor-pointer text-left"
                              >
                                <Printer className="w-4 h-4 text-amber-600 shrink-0" />
                                <span>Print to PDF</span>
                              </button>
                            </div>

                            {/* Additional Actions */}
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActionMenu(false);
                                  setShowPhotoGalleryModal(true);
                                }}
                                disabled={!activeStoryId}
                                className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors cursor-pointer text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Images className="w-4 h-4 text-indigo-600 shrink-0" />
                                  <span>Story Photos</span>
                                </div>
                                {activePhotoCount > 0 && (
                                  <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                                    {activePhotoCount}
                                  </span>
                                )}
                              </button>

                              {isStoryPublished && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowActionMenu(false);
                                    setShowAiVoiceModal(true);
                                  }}
                                  disabled={!activeStoryId}
                                  className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-purple-700 hover:bg-purple-50 transition-colors cursor-pointer text-left"
                                >
                                  <Mic className="w-4 h-4 text-purple-600 shrink-0" />
                                  <span>AI Voice Narration</span>
                                </button>
                              )}
                            </div>

                            {/* Delete Story */}
                            <div className="py-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowActionMenu(false);
                                  confirmDelete();
                                }}
                                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                              >
                                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                                <span>Delete Story</span>
                              </button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })()}
            </div>

            {content ? (
              <div className="text-slate-600 dark:text-slate-300 font-sans text-sm sm:text-[15px] leading-relaxed space-y-2.5 whitespace-pre-line font-normal pt-1 border-t border-slate-100">
                {content}
              </div>
            ) : (
              <div className="py-6 text-center text-slate-400 font-sans italic text-sm">
                No content written for this story yet. Click the edit icon to start writing.
              </div>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 font-bold">
                <span>Topic: {topicTitle}</span>
                <span>•</span>
                <span>{wordCount} words</span>
              </div>

              <button
                type="button"
                onClick={handlePrintToPdf}
                title="Print story as a paperback book chapter PDF"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-900 border border-slate-200 hover:border-amber-300 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-2xs group"
              >
                <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-600 transition-colors" />
                <span>Print to PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowDeleteModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-850">
                  Delete Story?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete <span className="font-semibold text-slate-700">"{title || 'this story'}"</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeDelete}
                  disabled={deleting}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/10 transition-all cursor-pointer border border-rose-600 disabled:opacity-50"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Story</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- CUSTOM PUBLISH CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showPublishModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowPublishModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-sm w-full z-10 p-6 flex flex-col items-center text-center gap-4 relative overflow-hidden"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Globe className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-slate-850">
                  Publish Story?
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to publish <span className="font-semibold text-slate-700">"{title || 'this story'}"</span>? This will update its status to Published in the database.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2 border-t border-slate-100">
                <button
                  onClick={() => setShowPublishModal(false)}
                  disabled={publishing}
                  className="flex-1 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executePublish}
                  disabled={publishing}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/10 transition-all cursor-pointer border border-emerald-600 disabled:opacity-50"
                >
                  {publishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Globe className="w-3.5 h-3.5" />
                  )}
                  <span>Publish Story</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* --- CUSTOM TOPIC SELECTION MODAL --- */}
      <AnimatePresence>
        {showCustomTopicModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
            <div className="absolute inset-0 cursor-default" onClick={() => setShowCustomTopicModal(false)} />

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white border border-slate-100 rounded-3xl shadow-2xl max-w-lg w-full z-10 p-5 sm:p-6 flex flex-col gap-4 relative overflow-hidden"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200/70 text-amber-600 flex items-center justify-center shrink-0">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-slate-850">
                      Select Topic
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Choose, edit, or create topics to write stories for.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCustomTopicModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {topicModalError && (
                <div className="p-2.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{topicModalError}</span>
                  <button type="button" onClick={() => setTopicModalError(null)} className="cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {loadingCustomTopics ? (
                <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
                  <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                  <span className="text-xs">Loading topics...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {customTopics.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
                      {customTopics.map((ct) => {
                        const ctId = ct.topicCustomId || ct.mbrCustomTopicId || '';
                        const ctName = ct.topicCustomName || ct.mbrCustomTopicName || 'Untitled Topic';
                        const ctDesc = ct.topicCustomTopicDesc || ct.mbrCustomTopicDesc || (ct as any).topicCustomTipicDesc || '';
                        const isSelected = (selectedCustomTopic?.topicCustomId || selectedCustomTopic?.mbrCustomTopicId) === ctId;
                        const isEditingThis = editingTopicId === ctId;
                        const normalizedName = ctName.trim().toLowerCase();
                        const isSystemTopic = normalizedName === 'remember when' || normalizedName === 'flashback' || ctId === 'ct_remember_when' || ctId === 'ct_flashback';

                        if (isEditingThis) {
                          return (
                            <div
                              key={ctId}
                              onClick={(e) => e.stopPropagation()}
                              className="p-3 rounded-2xl border border-blue-300 bg-blue-50/40 space-y-2"
                            >
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                                  Edit Topic Title
                                </label>
                                <input
                                  type="text"
                                  value={editTopicName}
                                  onChange={(e) => setEditTopicName(e.target.value)}
                                  maxLength={22}
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500 font-semibold"
                                  autoFocus
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                                  Description (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={editTopicDesc}
                                  onChange={(e) => setEditTopicDesc(e.target.value)}
                                  maxLength={240}
                                  placeholder="Brief theme description..."
                                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                                />
                              </div>
                              <div className="flex items-center justify-end gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={handleCancelEditCustomTopic}
                                  disabled={savingTopicEdit}
                                  className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => handleSaveCustomTopicEdit(e, ct)}
                                  disabled={!editTopicName.trim() || savingTopicEdit}
                                  className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                                >
                                  {savingTopicEdit ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                                  <span>Save</span>
                                </button>
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={ctId}
                            onClick={() => setSelectedCustomTopic(ct)}
                            className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-3 group/topicitem ${
                              isSelected
                                ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400/20 shadow-xs'
                                : 'bg-[#FAF9F7] hover:bg-slate-50 border-slate-200/80 text-slate-700'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0 flex-1">
                              <h4 className="text-xs font-serif font-bold text-slate-850 truncate">
                                {ctName}
                              </h4>
                              {ctDesc && (
                                <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                                  {ctDesc}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1 shrink-0 mt-0.5">
                              {!isSystemTopic && (
                                <>
                                  <button
                                    type="button"
                                    onClick={(e) => handleStartEditCustomTopic(e, ct)}
                                    title="Edit topic"
                                    className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      if (window.confirm(`Are you sure you want to delete custom topic "${ctName}"?`)) {
                                        handleDeleteCustomTopic(e, ct);
                                      }
                                    }}
                                    disabled={deletingTopicId === ctId}
                                    title="Delete topic"
                                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                                  >
                                    {deletingTopicId === ctId ? (
                                      <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                                    ) : (
                                      <Trash2 className="w-3.5 h-3.5" />
                                    )}
                                  </button>
                                </>
                              )}
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center ml-1 shrink-0 ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}>
                                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-xs text-slate-400 italic">
                      No custom topics found. Create a new custom topic below to get started.
                    </div>
                  )}

                  {/* Inline New Topic Creator */}
                  {showInlineNewTopic ? (
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        New Topic Title
                      </label>
                      <input
                        type="text"
                        value={newCustomTopicName}
                        onChange={(e) => setNewCustomTopicName(e.target.value)}
                        maxLength={22}
                        placeholder="e.g. Scuba Adventures..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-blue-500"
                        autoFocus
                      />
                      <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        Description (Optional)
                      </label>
                      <input
                        type="text"
                        value={newCustomTopicDesc}
                        onChange={(e) => setNewCustomTopicDesc(e.target.value)}
                        maxLength={240}
                        placeholder="e.g. Diving trips across coral reefs..."
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                      />
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowInlineNewTopic(false);
                            setNewCustomTopicName('');
                            setNewCustomTopicDesc('');
                          }}
                          className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateCustomTopicInline}
                          disabled={!newCustomTopicName.trim() || creatingCustomTopic}
                          className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {creatingCustomTopic ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                          <span>Add Topic & Start Story</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        setShowInlineNewTopic(true);
                        setNewCustomTopicName('');
                        setNewCustomTopicDesc('');
                      }}
                      className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-bold p-1 self-start cursor-pointer hover:underline"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create New Custom Topic</span>
                    </button>
                  )}
                </div>
              )}

              <div className="flex items-center gap-3 w-full pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCustomTopicModal(false)}
                  className="flex-1 py-2.5 bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmCustomTopicSelection()}
                  disabled={!selectedCustomTopic || loadingCustomTopics}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/10 transition-all cursor-pointer border border-blue-600 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Start Story</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusable Photo Gallery Modal Dialog for Story */}
      <MbrPhotoGalleryPanel
        isOpen={showPhotoGalleryModal}
        onClose={() => {
          setShowPhotoGalleryModal(false);
          loadStoryPhotoCounts();
          window.dispatchEvent(new CustomEvent('update-story-editor-content', { detail: { storyId: activeStoryId } }));
        }}
        mbrId={resolvedMbrId}
        categoryCd={resolvedCategoryCd}
        categoryTitle={title ? `Photos: ${title}` : `${topicTitle} Story Photos`}
        subordinateId={activeStoryId || undefined}
        isSandbox={isSandbox}
        maxPhotos={15}
        readOnly={readOnly}
      />

      {/* AI Voice Narration Modal Dialog for Published Stories */}
      <AiVoiceModal
        isOpen={showAiVoiceModal}
        onClose={() => {
          setShowAiVoiceModal(false);
          loadStoryPhotoCounts();
        }}
        storyId={activeStoryId || ''}
        storyTitle={title}
        storyContent={content}
        mbrId={resolvedMbrId}
        categoryCd={resolvedCategoryCd}
        isSandbox={isSandbox}
      />

      {/* Story Print to PDF Customization & Page Size Modal */}
      <StoryPdfPrintModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        storyTitle={title || stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryTitle || 'Untitled Story'}
        storyContent={content || stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryText || ''}
        topicTitle={stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryTopicName || topicTitle || 'Story'}
        authorName={authorName}
        authorLocation={authorLocation}
        publishedDate={stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryPublishedDate || stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryCreatedAt}
        status={status}
        onSuccess={(msg) => setSuccessMsg(msg)}
        onError={(err) => setError(err)}
      />

      {/* Story Group Privacy Settings Modal Dialog */}
      <MbrStoryPrivacyModal
        isOpen={showStoryPrivacyModal}
        onClose={() => setShowStoryPrivacyModal(false)}
        storyId={activeStoryId || ''}
        storyTitle={title || stories.find((s) => s.mbrStoryId === activeStoryId)?.mbrStoryTitle || `${topicTitle} Story`}
        mbrId={resolvedMbrId}
        isSandbox={isSandbox}
        onSaved={() => {
          setSuccessMsg('Story group privacy settings updated successfully.');
        }}
      />

      <AdminComponentTag name="StoryEditorPanel" />
    </div>
  );
}
