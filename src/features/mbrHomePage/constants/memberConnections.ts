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
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc2',
    name: 'James Whitfield',
    location: 'New Orleans, LA',
    relationship: 'Family',
    connectedTime: '1 day ago',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc3',
    name: 'Mei-Ling Fong',
    location: 'Chicago, IL',
    relationship: 'Professional',
    connectedTime: '2 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc4',
    name: 'Roberto Salinas',
    location: 'Boston, MA',
    relationship: 'Friend',
    connectedTime: '3 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc5',
    name: 'Diane Kowalczyk',
    location: 'Seattle, WA',
    relationship: 'Family',
    connectedTime: '4 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc6',
    name: 'Samuel Okonkwo',
    location: 'Houston, TX',
    relationship: 'Professional',
    connectedTime: '5 days ago',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'nc7',
    name: 'Priya Nair',
    location: 'San Francisco, CA',
    relationship: 'Friend',
    connectedTime: '1 week ago',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&h=80&fit=crop&auto=format'
  }
];

export const MY_CONNECTIONS: ConnectionRecord[] = [
  {
    id: 'mc1',
    name: 'Eleanor Hartwell',
    location: 'Portland, OR',
    relationship: 'Family',
    connectedTime: '3 mos ago',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'mc2',
    name: 'Marcus Delacroix',
    location: 'New Orleans, LA',
    relationship: 'Friend',
    connectedTime: '6 mos ago',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'mc3',
    name: 'Priya Chandrasekaran',
    location: 'Chicago, IL',
    relationship: 'Professional',
    connectedTime: '1 yr ago',
    avatarUrl: 'https://images.unsplash.com/photo-1554151228-14d9def656e4?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'mc4',
    name: 'Thomas Wakefield',
    location: 'Boston, MA',
    relationship: 'Family',
    connectedTime: '1 yr ago',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop&auto=format'
  },
  {
    id: 'mc5',
    name: 'Anita Ferreira',
    location: 'Miami, FL',
    relationship: 'Friend',
    connectedTime: '2 yrs ago',
    avatarUrl: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=80&h=80&fit=crop&auto=format'
  }
];
