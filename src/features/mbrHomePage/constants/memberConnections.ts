/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ConnectionRecord {
  id: string;
  name: string;
  location: string;
  relationship: 'Friend' | 'Family' | 'Professional' | 'Other';
  connectedTime: string;
  avatarUrl?: string;
}

export const NEW_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'nc1',
    name: 'Clara Oduya',
    location: 'Portland, OR',
    relationship: 'Friend',
    connectedTime: '2 hrs ago',
    avatarUrl: '/assets/avatars/default_avatar_female_1.jpg'
  },
  {
    id: 'nc2',
    name: 'James Whitfield',
    location: 'New Orleans, LA',
    relationship: 'Family',
    connectedTime: '1 day ago',
    avatarUrl: '/assets/avatars/default_avatar_male_1.jpg'
  },
  {
    id: 'nc3',
    name: 'Mei-Ling Fong',
    location: 'Chicago, IL',
    relationship: 'Professional',
    connectedTime: '2 days ago',
    avatarUrl: '/assets/avatars/default_avatar_female_2.jpg'
  },
  {
    id: 'nc4',
    name: 'Roberto Salinas',
    location: 'Boston, MA',
    relationship: 'Friend',
    connectedTime: '3 days ago',
    avatarUrl: '/assets/avatars/default_avatar_male_2.jpg'
  },
  {
    id: 'nc5',
    name: 'Diane Kowalczyk',
    location: 'Seattle, WA',
    relationship: 'Family',
    connectedTime: '4 days ago',
    avatarUrl: '/assets/avatars/default_avatar_female_3.jpg'
  },
  {
    id: 'nc6',
    name: 'Samuel Okonkwo',
    location: 'Houston, TX',
    relationship: 'Professional',
    connectedTime: '5 days ago',
    avatarUrl: '/assets/avatars/default_avatar_male_3.jpg'
  },
  {
    id: 'nc7',
    name: 'Priya Nair',
    location: 'San Francisco, CA',
    relationship: 'Friend',
    connectedTime: '1 week ago',
    avatarUrl: '/assets/avatars/default_avatar_female_1.jpg'
  }
];

export const MY_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'mc1',
    name: 'Eleanor Hartwell',
    location: 'Portland, OR',
    relationship: 'Family',
    connectedTime: '3 mos ago',
    avatarUrl: '/assets/avatars/default_avatar_female_1.jpg'
  },
  {
    id: 'mc2',
    name: 'Marcus Delacroix',
    location: 'New Orleans, LA',
    relationship: 'Friend',
    connectedTime: '6 mos ago',
    avatarUrl: '/assets/avatars/default_avatar_male_1.jpg'
  },
  {
    id: 'mc3',
    name: 'Priya Chandrasekaran',
    location: 'Chicago, IL',
    relationship: 'Professional',
    connectedTime: '1 yr ago',
    avatarUrl: '/assets/avatars/default_avatar_female_2.jpg'
  },
  {
    id: 'mc4',
    name: 'Thomas Wakefield',
    location: 'Boston, MA',
    relationship: 'Family',
    connectedTime: '1 yr ago',
    avatarUrl: '/assets/avatars/default_avatar_male_2.jpg'
  },
  {
    id: 'mc5',
    name: 'Anita Ferreira',
    location: 'Miami, FL',
    relationship: 'Friend',
    connectedTime: '2 yrs ago',
    avatarUrl: '/assets/avatars/default_avatar_female_3.jpg'
  }
];
