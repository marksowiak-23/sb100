/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MbrStory, Cd } from '@/src/services/api';

export interface MbrPrivacyFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export type AccessTabMode = 'by-group' | 'by-member' | 'by-story';

export type EffectiveAccessLevel = 'READ' | 'WRITE';

export interface UnifiedGroup {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  isCustom: boolean;
}

export interface ConnectedMemberItem {
  connectionId: string;
  mbrConnectionMbrId: string;
  fullName: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  location?: string;
  email?: string;
  groupIds: string[];
  groupNames: string[];
}

export interface StoryGroupAccessEntry {
  story: MbrStory;
  topicLabel: string;
  grpId: string;
  grpName: string;
  isCustomGroup: boolean;
  accessLevel: EffectiveAccessLevel;
  accessLabel: string;
}

export interface StoryMemberAccessEntry {
  story: MbrStory;
  topicLabel: string;
  member: ConnectedMemberItem;
  accessLevel: EffectiveAccessLevel;
  accessLabel: string;
  directAccess: EffectiveAccessLevel | null;
  grantedViaGroups: { grpId: string; grpName: string; accessLevel: EffectiveAccessLevel }[];
}

export interface EnrichedStoryItem {
  story: MbrStory;
  topicLabel: string;
  groupsWithAccess: {
    group: UnifiedGroup;
    accessLevel: EffectiveAccessLevel;
    accessLabel: string;
  }[];
  membersWithAccess: {
    member: ConnectedMemberItem;
    accessLevel: EffectiveAccessLevel;
    accessLabel: string;
    directAccess: EffectiveAccessLevel | null;
    grantedViaGroups: { grpId: string; grpName: string; accessLevel: EffectiveAccessLevel }[];
  }[];
}

export interface PrivacyReportData {
  mbrId: string;
  mbrName: string;
  mbrEmail: string;
  enrichedStories: EnrichedStoryItem[];
  privCodes: Cd[];
}
