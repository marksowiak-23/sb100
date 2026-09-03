import { Mbr, MbrContact } from '@/src/services/api';

export type ConnectionSection = 'connections' | 'invitations' | 'requests';

export interface MbrConnectionFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
  onNavigate?: (tab: string) => void;
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

export type InvitationDecision = 'ACCEPT' | 'IGNORE' | null;

export interface MemberInvitationItem {
  contact: MbrContact;
  senderMember?: Mbr;
  selectedDecision: InvitationDecision;
  originalDecision: InvitationDecision;
  selectedGrpId?: string;
}


export type RequestDecision = 'WITHDRAW' | null;

export interface MemberRequestItem {
  contact: MbrContact;
  targetMember?: Mbr;
  selectedDecision: RequestDecision;
  originalDecision: RequestDecision;
}


