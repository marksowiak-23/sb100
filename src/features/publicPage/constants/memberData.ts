/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface MemberStory {
  id: string;
  name: string;
  location: string;
  chaptersCount: number;
  joinedDate: string;
  tags: string[];
  excerpt: string;
  avatarUrl: string; // URL link to the thumbnail member image
}

export const MEMBER_STORIES: MemberStory[] = [
  {
    id: 'm1',
    name: 'Eleanor Hartwell',
    location: 'Portland, OR',
    chaptersCount: 18,
    joinedDate: 'Oct 2020',
    tags: ['Family', 'Childhood', 'Pacific NW'],
    excerpt: 'The rain was different in those days — softer, somehow. We would run down to the docks without coats, our mother calling after us...',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'm2',
    name: 'Marcus Delacroix',
    location: 'New Orleans, LA',
    chaptersCount: 34,
    joinedDate: 'Jan 2022',
    tags: ['Music', 'Heritage', '1970s'],
    excerpt: "Every Sunday, the brass would start up on Claiborne Avenue. You didn't just hear it; you felt it right in the center of your chest...",
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'm3',
    name: 'Priya Chandrasekaran',
    location: 'Chicago, IL',
    chaptersCount: 22,
    joinedDate: 'Sep 2021',
    tags: ['Travel', 'Career', 'Immigration'],
    excerpt: "Arriving at O'Hare with two suitcases and a heart full of equations was a beginning I couldn't have written better myself...",
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'm4',
    name: 'Thomas Wakefield',
    location: 'Boston, MA',
    chaptersCount: 12,
    joinedDate: 'Jun 2023',
    tags: ['Sea', 'Family', 'Sailing'],
    excerpt: 'The wind caught the mainsail, and for a moment, we were weightless. My father held the tiller with a calm that taught me everything...',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format'
  }
];
