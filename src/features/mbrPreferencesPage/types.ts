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
  chWriterActInd: boolean;
}

export const FALLBACK_PERSONAS: WriterPersona[] = [
  {
    chWriterId: 'w1',
    chWriterName: 'Everyday Eddie',
    chWriterDesc: 'Common & Informal',
    chWriterPrompt: 'Use the “Everyday Eddie” writing mode. Write in a casual, conversational style with simple language and a friendly tone. Avoid jargon. Keep explanations easy, relatable, and down to earth, like a helpful friend talking over coffee.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w2',
    chWriterName: 'Clarity Consultant',
    chWriterDesc: 'Professional',
    chWriterPrompt: 'Use a “Clarity Consultant” writing mode. Write in a professional, structured, and polished style. Maintain a confident, neutral tone. Prioritize clarity, accuracy, and efficiency. Avoid slang and emotional language. Format content cleanly with logical transitions.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w3',
    chWriterName: 'Casual Chuckles',
    chWriterDesc: 'Common + Humor',
    chWriterPrompt: 'Use a “Casual Chuckles” writing mode. Write in a conversational style with light humor, friendly sarcasm, and playful metaphors. Keep the message clear but add personality. Make the reader smile without distracting from the main point.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w4',
    chWriterName: 'The Polished Guide',
    chWriterDesc: 'Professional + Warm',
    chWriterPrompt: 'Use a “Polished Guide” writing mode. Write in a professional yet approachable style. Maintain a warm, encouraging tone. Blend clarity with empathy. Offer guidance that feels supportive, respectful, and easy to follow.',
    chWriterActInd: true
  },
  {
    chWriterId: 'w5',
    chWriterName: 'The Story Crafter',
    chWriterDesc: 'Creative & Expressive',
    chWriterPrompt: 'Use a “Story Crafter” writing mode. Write in a narrative, descriptive, and imaginative style. Use sensory detail, metaphor, and emotional depth. Make the content feel alive, atmospheric, and engaging.',
    chWriterActInd: true
  }
];
