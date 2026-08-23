/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Mbr } from '@/src/services/api';

export interface MbrConnectionFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}

export interface UnifiedGroupOption {
  grpId: string;
  grpName: string;
  grpDescription?: string;
  grpSortOrder?: number | null;
  isCustom: boolean;
}

export interface MemberConnectionItem {
  member: Mbr;
  mbrConnectionId?: string;
  mbrConnectionGrpId?: string;
  selectedGrpId: string; // "" represents 'None'
  originalGrpId: string;
}

export type ConnectionFilterType = 'ALL' | 'ASSIGNED' | 'UNASSIGNED' | string;
