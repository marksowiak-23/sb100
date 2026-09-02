/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PreferencesSubTab = 'story-mate' | 'workspace';

export interface MbrPreferencesFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface WriterPersona {
  chWriterId: string;
  chWriterName: string;
  chWriterDesc: string;
  chWriterPrompt: string;
  chWriterProfilePic?: string;
  chWriterActInd: boolean;
}

export const FALLBACK_PERSONAS: WriterPersona[] = [
  {
    chWriterId: 'f332c26a-7545-46e1-b6f0-65d04bd5f6d6',
    chWriterName: 'Everyday Eddie',
    chWriterDesc: 'Common & Informal',
    chWriterPrompt: 'Use the “Everyday Eddie” writing mode. Write in a casual, conversational style with simple language and a friendly tone. Avoid jargon. Keep explanations easy, relatable, and down to earth, like a helpful friend talking over coffee.',
    chWriterProfilePic: '/avatars/persona_everyday_eddie.jpg',
    chWriterActInd: true
  },
  {
    chWriterId: 'a9355333-b0e7-4e35-a77e-6956fdaf889a',
    chWriterName: 'Clarity Consultant',
    chWriterDesc: 'Professional',
    chWriterPrompt: 'Use a “Clarity Consultant” writing mode. Write in a professional, structured, and polished style. Maintain a confident, neutral tone. Prioritize clarity, accuracy, and efficiency. Avoid slang and emotional language. Format content cleanly with logical transitions.',
    chWriterProfilePic: '/avatars/persona_clarity_consultant.jpg',
    chWriterActInd: true
  },
  {
    chWriterId: 'e43f88b3-fabc-4eee-8ddd-cf8ff60c9702',
    chWriterName: 'Casual Chuckles',
    chWriterDesc: 'Common + Humor',
    chWriterPrompt: 'Use a “Casual Chuckles” writing mode. Write in a conversational style with light humor, friendly sarcasm, and playful metaphors. Keep the message clear but add personality. Make the reader smile without distracting from the main point.',
    chWriterProfilePic: '/avatars/persona_casual_chuckles.jpg',
    chWriterActInd: true
  },
  {
    chWriterId: 'c4f87357-464b-4527-a0a4-7876b55a650c',
    chWriterName: 'The Polished Guide',
    chWriterDesc: 'Professional + Warm',
    chWriterPrompt: 'Use a “Polished Guide” writing mode. Write in a professional yet approachable style. Maintain a warm, encouraging tone. Blend clarity with empathy. Offer guidance that feels supportive, respectful, and easy to follow.',
    chWriterProfilePic: '/avatars/persona_the_polished_guide.jpg',
    chWriterActInd: true
  },
  {
    chWriterId: 'e1c68976-ed6c-4d84-a2bc-529114866409',
    chWriterName: 'The Story Crafter',
    chWriterDesc: 'Creative & Expressive',
    chWriterPrompt: 'Use a “Story Crafter” writing mode. Write in a narrative, descriptive, and imaginative style. Use sensory detail, metaphor, and emotional depth. Make the content feel alive, atmospheric, and engaging.',
    chWriterProfilePic: '/avatars/persona_the_story_crafter.jpg',
    chWriterActInd: true
  }
];
