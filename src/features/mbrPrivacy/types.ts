/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Topic, GroupGlobal, GroupCustom, Cd } from '@/src/services/api';

export interface MbrPrivacyFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface UnifiedGroup {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  isCustom: boolean;
}

export interface PrivilegeCell {
  privId?: string;
  topicId: string;
  grpId: string;
  privValueCd: string;
  originalPrivValueCd: string;
}

export type ViewMode = 'by-topic' | 'by-group';
