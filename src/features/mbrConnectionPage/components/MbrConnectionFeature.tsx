import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { taskApi, Mbr, GroupGlobal, GroupCustom, MbrConnection, MbrConnectionGrp, MbrContact } from '@/src/services/api.ts';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { 
  MbrConnectionFeatureProps, 
  UnifiedGroupOption, 
  MemberConnectionItem, 
  ConnectionFilterType,
  ConnectionSection,
  MemberInvitationItem,
  MemberRequestItem
} from '../types';
import ManageConnectionsMenu from './ManageConnectionsMenu';
import ConnectionHeader from './ConnectionHeader';
import ConnectionSearchToolbar from './ConnectionSearchToolbar';
import MemberConnectionList from './MemberConnectionList';
import InvitationsHeader from './InvitationsHeader';
import InvitationsList from './InvitationsList';
import RequestsHeader from './RequestsHeader';
import RequestsList from './RequestsList';
import ConnectionPageHeaderPanel from './ConnectionPageHeaderPanel';
import ConnectionMobileMenuBar from './ConnectionMobileMenuBar';
import AcceptInvitationModal from './AcceptInvitationModal';
import { generateConnectionPdf } from '../utils/generateConnectionPdf';


export default function MbrConnectionFeature({ isSandbox, onClickBack, onDirtyChange, onNavigate }: MbrConnectionFeatureProps) {
  // Navigation / View state: 'connections' | 'invitations' | 'requests'
  const [activeSection, setActiveSection] = useState<ConnectionSection>('connections');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [currentMbrId, setCurrentMbrId] = useState<string>('9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [mbrEmail, setMbrEmail] = useState<string>('eleanor.vance@storybook.ai');
  const [groups, setGroups] = useState<UnifiedGroupOption[]>([]);
  const [items, setItems] = useState<Record<string, MemberConnectionItem>>({});
  const [invitations, setInvitations] = useState<Record<string, MemberInvitationItem>>({});
  const [requests, setRequests] = useState<Record<string, MemberRequestItem>>({});
  
  // Search and Filtering State for Connections
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupFilter, setGroupFilter] = useState<ConnectionFilterType>('ALL');

  // Accept Connection Group Selection Modal State
  const [acceptModalInvitation, setAcceptModalInvitation] = useState<MemberInvitationItem | null>(null);

  // Since all changes are saved immediately, dirty state is always false
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(false);
    }
  }, [onDirtyChange]);

  // Handle direct navigation events
  useEffect(() => {
    const handleNavAttempt = (e: any) => {
      const targetTab = e.detail?.targetTab;
      if (targetTab && onNavigate) {
        onNavigate(targetTab);
      } else {
        onClickBack();
      }
    };

    window.addEventListener('attempt-connection-navigation', handleNavAttempt);
    return () => window.removeEventListener('attempt-connection-navigation', handleNavAttempt);
  }, [onClickBack, onNavigate]);

  // Load all data: current user, members, groups, connections, invitations, requests
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Identify logged-in member ID & email
      let resolvedMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
      let resolvedEmail = 'eleanor.vance@storybook.ai';

      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.email) resolvedEmail = u.email;
          if (!isSandbox) {
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              resolvedMbrId = mbrProfile.mbrId;
              if (mbrProfile.mbrEmailAddress) resolvedEmail = mbrProfile.mbrEmailAddress;
            }
          }
        } catch {}
      } else {
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
            if (parsed.mbrEmailAddress) resolvedEmail = parsed.mbrEmailAddress;
          } catch {}
        }
      }
      setCurrentMbrId(resolvedMbrId);
      setMbrEmail(resolvedEmail);

      // 2. Fetch Member Connections for this owner
      let connections: MbrConnection[] = [];
      let connectionGrps: MbrConnectionGrp[] = [];

      if (!isSandbox) {
        try {
          connections = await taskApi.getMemberConnections({ mbrId: resolvedMbrId });
          if (connections.length > 0) {
            connectionGrps = await taskApi.getMemberConnectionGrps();
          }
        } catch (e) {
          console.warn("Error fetching member connections:", e);
        }
      } else {
        const savedConns = sessionStorage.getItem(`sandbox_mbr_connections_${resolvedMbrId}`);
        const savedGrps = sessionStorage.getItem(`sandbox_mbr_connection_grps_${resolvedMbrId}`);
        if (savedConns) {
          try { connections = JSON.parse(savedConns); } catch {}
        }
        if (savedGrps) {
          try { connectionGrps = JSON.parse(savedGrps); } catch {}
        }
      }

      // 3. Fetch all members
      let allMembers: Mbr[] = [];
      if (!isSandbox) {
        try {
          allMembers = await taskApi.getMembers();
        } catch (e) {
          console.warn("Error fetching all members:", e);
        }
      } else {
        allMembers = [
          {
            mbrId: 'e1a2b3c4-1111-4000-8000-000000000001',
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Vance',
            mbrEmailAddress: 'eleanor.vance@storybook.ai',
            mbrLivesCityState: 'Boston, MA',
            mbrFromCityState: 'Concord, NH',
            mbrProfilePic: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Architectural Historian'
          },
          {
            mbrId: 'e1a2b3c4-2222-4000-8000-000000000002',
            mbrFirstName: 'Thomas',
            mbrLastName: 'Sterling',
            mbrEmailAddress: 'thomas.sterling@storybook.ai',
            mbrLivesCityState: 'New York, NY',
            mbrFromCityState: 'Philadelphia, PA',
            mbrProfilePic: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'University Professor'
          },
          {
            mbrId: 'e1a2b3c4-3333-4000-8000-000000000003',
            mbrFirstName: 'Clara',
            mbrLastName: 'Oswald',
            mbrEmailAddress: 'clara.oswald@storybook.ai',
            mbrLivesCityState: 'London, UK',
            mbrFromCityState: 'Blackpool, UK',
            mbrProfilePic: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'High School Literature Teacher'
          },
          {
            mbrId: 'e1a2b3c4-4444-4000-8000-000000000004',
            mbrFirstName: 'Arthur',
            mbrLastName: 'Pendelton',
            mbrEmailAddress: 'arthur.pendelton@storybook.ai',
            mbrLivesCityState: 'Chicago, IL',
            mbrFromCityState: 'Detroit, MI',
            mbrProfilePic: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Senior Civil Engineer'
          },
          {
            mbrId: 'e1a2b3c4-5555-4000-8000-000000000005',
            mbrFirstName: 'Miriam',
            mbrLastName: 'Al-Mansoor',
            mbrEmailAddress: 'miriam.mansoor@storybook.ai',
            mbrLivesCityState: 'Toronto, ON',
            mbrFromCityState: 'Dubai, UAE',
            mbrProfilePic: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Biomedical Researcher'
          },
          {
            mbrId: 'e1a2b3c4-6666-4000-8000-000000000006',
            mbrFirstName: 'Samuel',
            mbrLastName: 'Rivers',
            mbrEmailAddress: 'samuel.rivers@storybook.ai',
            mbrLivesCityState: 'Austin, TX',
            mbrFromCityState: 'Nashville, TN',
            mbrProfilePic: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Music Producer & Composer'
          },
          {
            mbrId: 'e1a2b3c4-7777-4000-8000-000000000007',
            mbrFirstName: 'Beatrice',
            mbrLastName: 'Fontaine',
            mbrEmailAddress: 'beatrice.fontaine@storybook.ai',
            mbrLivesCityState: 'Montreal, QC',
            mbrFromCityState: 'Paris, France',
            mbrProfilePic: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Documentary Filmmaker'
          },
          {
            mbrId: 'e1a2b3c4-8888-4000-8000-000000000008',
            mbrFirstName: 'Henry',
            mbrLastName: 'Zimmerman',
            mbrEmailAddress: 'henry.zimmerman@storybook.ai',
            mbrLivesCityState: 'San Francisco, CA',
            mbrFromCityState: 'Seattle, WA',
            mbrProfilePic: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
            mbrWorkAt: 'Software Architect'
          }
        ];
      }

      // Filter connected members: either connected in DB or fallback sandbox members
      const connectedMbrIds = new Set(connections.map(c => c.mbrConnectionMbrId));
      let connectedMembers = allMembers.filter(m => m.mbrId !== resolvedMbrId && (connectedMbrIds.size === 0 || connectedMbrIds.has(m.mbrId)));
      if (connectedMembers.length === 0 && allMembers.length > 0) {
        connectedMembers = allMembers.filter(m => m.mbrId !== resolvedMbrId);
      }

      // 4. Fetch Global and Custom Groups
      let fetchedGlobals: GroupGlobal[] = [];
      let fetchedCustoms: GroupCustom[] = [];

      if (!isSandbox) {
        try {
          fetchedGlobals = await taskApi.getGroupsGlobal();
          fetchedCustoms = await taskApi.getGroupsCustom(resolvedMbrId);
        } catch (e) {
          console.warn("Error fetching groups:", e);
        }
      } else {
        fetchedGlobals = [
          { grpId: '00000000-0000-4000-8000-000000000001', grpName: 'Family', grpDescription: 'Immediate and extended family', grpSortOrder: 10 },
          { grpId: '00000000-0000-4000-8000-000000000002', grpName: 'Friends', grpDescription: 'Close friends & peers', grpSortOrder: 20 },
          { grpId: '00000000-0000-4000-8000-000000000003', grpName: 'Work', grpDescription: 'Colleagues & professional circle', grpSortOrder: 30 },
          { grpId: '00000000-0000-4000-8000-000000000004', grpName: 'Public', grpDescription: 'All StoryBook members', grpSortOrder: 40 }
        ];
        fetchedCustoms = [
          { grpId: '00000000-0000-4000-8000-0000000000c1', mbrId: resolvedMbrId, grpName: 'Book Club', grpSortOrder: 50 },
          { grpId: '00000000-0000-4000-8000-0000000000c2', mbrId: resolvedMbrId, grpName: 'Travel Buddies', grpSortOrder: 60 }
        ];
      }

      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: '00000000-0000-4000-8000-000000000001', grpName: 'Family', grpDescription: 'Immediate and extended family', grpSortOrder: 10 },
          { grpId: '00000000-0000-4000-8000-000000000002', grpName: 'Friends', grpDescription: 'Close friends & peers', grpSortOrder: 20 },
          { grpId: '00000000-0000-4000-8000-000000000003', grpName: 'Work', grpDescription: 'Colleagues & professional circle', grpSortOrder: 30 },
          { grpId: '00000000-0000-4000-8000-000000000004', grpName: 'Public', grpDescription: 'All StoryBook members', grpSortOrder: 40 }
        ];
      }

      const unifiedGroups: UnifiedGroupOption[] = [
        ...fetchedGlobals.map(g => ({
          grpId: g.grpId,
          grpName: g.grpName,
          grpDescription: g.grpDescription,
          grpSortOrder: g.grpSortOrder,
          isCustom: false
        })),
        ...fetchedCustoms.map(c => ({
          grpId: c.grpId,
          grpName: c.grpName,
          grpDescription: 'Custom Member Group',
          grpSortOrder: c.grpSortOrder,
          isCustom: true
        }))
      ];

      unifiedGroups.sort((a, b) => {
        const orderA = a.grpSortOrder != null ? a.grpSortOrder : Infinity;
        const orderB = b.grpSortOrder != null ? b.grpSortOrder : Infinity;
        if (orderA !== orderB) return orderA - orderB;
        return a.grpName.localeCompare(b.grpName);
      });
      setGroups(unifiedGroups);

      // 5. Build lookup map: target member ID -> { mbrConnection, mbrConnectionGrp }
      const connectionByTargetMbr = new Map<string, MbrConnection>();
      for (const conn of connections) {
        connectionByTargetMbr.set(conn.mbrConnectionMbrId, conn);
      }

      const connectionGrpByConnId = new Map<string, MbrConnectionGrp>();
      for (const cg of connectionGrps) {
        connectionGrpByConnId.set(cg.mbrConnectionId, cg);
      }

      const newItems: Record<string, MemberConnectionItem> = {};
      for (const m of connectedMembers) {
        const existingConn = connectionByTargetMbr.get(m.mbrId);
        const existingConnGrp = existingConn ? connectionGrpByConnId.get(existingConn.mbrConnectionId) : undefined;
        const assignedGrpId = existingConnGrp ? existingConnGrp.grpId : '';

        newItems[m.mbrId] = {
          member: m,
          mbrConnectionId: existingConn?.mbrConnectionId,
          mbrConnectionGrpId: existingConnGrp?.mbrConnectionGrpId,
          selectedGrpId: assignedGrpId,
          originalGrpId: assignedGrpId
        };
      }

      setItems(newItems);

      // 6. Fetch all mbrContact records for Invitations & Requests
      let rawContacts: MbrContact[] = [];
      if (!isSandbox) {
        try {
          const recipientContacts = await taskApi.getMemberContactsByRecipient(resolvedMbrId).catch(() => []);
          const senderContacts = await taskApi.getMemberContacts(resolvedMbrId).catch(() => []);
          const allContacts = await taskApi.getAllMemberContacts().catch(() => []);
          
          const combined = [...recipientContacts, ...senderContacts, ...allContacts];
          const map = new Map<string, MbrContact>();
          for (const c of combined) {
            if (c.mbrContactId) map.set(c.mbrContactId, c);
          }
          rawContacts = Array.from(map.values());
        } catch (e) {
          console.warn("Error fetching member contact invitations/requests:", e);
        }
      } else {
        const savedContacts = sessionStorage.getItem(`sandbox_mbr_contacts_${resolvedMbrId}`);
        if (savedContacts) {
          try { rawContacts = JSON.parse(savedContacts); } catch {}
        } else {
          // Default sample invitations & requests for demo
          rawContacts = [
            {
              mbrContactId: 'inv-101',
              mbrId: 'a1b2c3d4-0001-4000-8000-000000000001',
              mbrContactMbrId: resolvedMbrId,
              mbrContactEmail: 'sarah.jenkins@storybook.ai',
              mbrContactMsg: 'Hi Eleanor! I loved your recent chapter on historic architecture in Boston and would love to connect with you.',
              mbrContactReasonCd: 'FRIEND',
              mbrContactResponseInd: 0,
              mbrContactCreatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              grpId: '00000000-0000-4000-8000-000000000002'
            },
            {
              mbrContactId: 'inv-102',
              mbrId: 'a1b2c3d4-0002-4000-8000-000000000002',
              mbrContactMbrId: resolvedMbrId,
              mbrContactEmail: 'david.chen@storybook.ai',
              mbrContactMsg: 'Hello Eleanor, hope you are doing well. Reaching out to connect regarding our shared photography activities!',
              mbrContactReasonCd: 'WORK',
              mbrContactResponseInd: 0,
              mbrContactCreatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              grpId: '00000000-0000-4000-8000-000000000003'
            },
            {
              mbrContactId: 'req-201',
              mbrId: resolvedMbrId,
              mbrContactMbrId: 'a1b2c3d4-0003-4000-8000-000000000003',
              mbrContactEmail: resolvedEmail,
              mbrContactMsg: 'Hi Marcus! Reaching out to connect regarding your recent memoirs in Chicago.',
              mbrContactReasonCd: 'FRIEND',
              mbrContactResponseInd: 0,
              mbrContactCreatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
              grpId: '00000000-0000-4000-8000-000000000002'
            }
          ];
          sessionStorage.setItem(`sandbox_mbr_contacts_${resolvedMbrId}`, JSON.stringify(rawContacts));
        }
      }

      // Collect all referenced member IDs for sender/recipient lookup
      const referencedMbrIds = new Set<string>();
      for (const c of rawContacts) {
        if (c.mbrId) referencedMbrIds.add(c.mbrId);
        if (c.mbrContactMbrId) referencedMbrIds.add(c.mbrContactMbrId);
      }

      const referencedProfilesMap = new Map<string, Mbr>();
      if (!isSandbox && referencedMbrIds.size > 0) {
        const idList = Array.from(referencedMbrIds);
        const profilePromises = idList.map(id => taskApi.getMemberById(id).catch(() => null));
        const fetchedProfiles = await Promise.all(profilePromises);
        for (const p of fetchedProfiles) {
          if (p && p.mbrId) {
            referencedProfilesMap.set(p.mbrId, p);
          }
        }
      }

      // Fallback mock profiles
      const mockProfiles: Record<string, Partial<Mbr>> = {
        'a1b2c3d4-0001-4000-8000-000000000001': {
          mbrFirstName: 'Sarah',
          mbrLastName: 'Jenkins',
          mbrEmailAddress: 'sarah.jenkins@storybook.ai',
          mbrLivesCityState: 'Cambridge, MA',
          mbrWorkAt: 'Book Editor & Novelist'
        },
        'a1b2c3d4-0002-4000-8000-000000000002': {
          mbrFirstName: 'David',
          mbrLastName: 'Chen',
          mbrEmailAddress: 'david.chen@storybook.ai',
          mbrLivesCityState: 'Seattle, WA',
          mbrWorkAt: 'Landscape Photographer'
        },
        'a1b2c3d4-0003-4000-8000-000000000003': {
          mbrFirstName: 'Marcus',
          mbrLastName: 'Aurelius',
          mbrEmailAddress: 'marcus.aurelius@storybook.ai',
          mbrLivesCityState: 'Chicago, IL',
          mbrWorkAt: 'Philosopher & Author'
        }
      };

      // 7. Populate Invitations (Incoming: mbrContactMbrId === resolvedMbrId and mbrContactResponseInd !== 1)
      const pendingInvitations = rawContacts.filter(c => {
        const isRecipient = c.mbrContactMbrId ? c.mbrContactMbrId === resolvedMbrId : c.mbrId !== resolvedMbrId;
        const isPending = c.mbrContactResponseInd !== 1;
        return isRecipient && isPending;
      });

      const newInvitationsMap: Record<string, MemberInvitationItem> = {};
      for (const contact of pendingInvitations) {
        const senderProfile = referencedProfilesMap.get(contact.mbrId) || (mockProfiles[contact.mbrId] as Mbr) || {
          mbrId: contact.mbrId,
          mbrFirstName: contact.mbrContactEmail ? contact.mbrContactEmail.split('@')[0] : 'StoryBook',
          mbrLastName: 'Member',
          mbrEmailAddress: contact.mbrContactEmail
        };

        newInvitationsMap[contact.mbrContactId] = {
          contact,
          senderMember: senderProfile,
          selectedDecision: null,
          originalDecision: null
        };
      }
      setInvitations(newInvitationsMap);

      // 8. Populate Requests (Outgoing: mbrId === resolvedMbrId and mbrContactResponseInd === 0 or null)
      const pendingRequests = rawContacts.filter(c => {
        const isSender = c.mbrId === resolvedMbrId;
        const isPending = !c.mbrContactResponseInd || c.mbrContactResponseInd === 0;
        return isSender && isPending;
      });

      const newRequestsMap: Record<string, MemberRequestItem> = {};
      for (const contact of pendingRequests) {
        const targetMbrId = contact.mbrContactMbrId || '';
        const targetProfile = referencedProfilesMap.get(targetMbrId) || (mockProfiles[targetMbrId] as Mbr) || {
          mbrId: targetMbrId,
          mbrFirstName: 'StoryBook',
          mbrLastName: 'Member',
          mbrEmailAddress: 'member@storybook.ai'
        };

        newRequestsMap[contact.mbrContactId] = {
          contact,
          targetMember: targetProfile,
          selectedDecision: null,
          originalDecision: null
        };
      }
      setRequests(newRequestsMap);

    } catch (err: any) {
      console.error("Failed to load connections, invitations & requests data:", err);
      setError(err?.message || "Failed to load member connections data.");
    } finally {
      setLoading(false);
    }
  }, [isSandbox]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle section switching
  const handleSelectSection = (targetSection: ConnectionSection) => {
    setActiveSection(targetSection);
  };

  // Immediate update: Group dropdown selection change for a member in Connections
  const handleGroupSelect = async (targetMbrId: string, grpId: string) => {
    const currentItem = items[targetMbrId];
    if (!currentItem) return;

    // Optimistically update local state immediately
    setItems(prev => {
      const item = prev[targetMbrId];
      if (!item) return prev;
      return {
        ...prev,
        [targetMbrId]: {
          ...item,
          selectedGrpId: grpId,
          originalGrpId: grpId
        }
      };
    });

    try {
      let connId = currentItem.mbrConnectionId;
      let connGrpId = currentItem.mbrConnectionGrpId;

      if (grpId === '') {
        // Remove group assignment
        if (connGrpId && !isSandbox) {
          try {
            await taskApi.deleteMemberConnectionGrp(connGrpId);
          } catch (e) {
            console.warn("Could not delete connection group:", e);
          }
        }
        setItems(prev => {
          const it = prev[targetMbrId];
          if (!it) return prev;
          return {
            ...prev,
            [targetMbrId]: { ...it, mbrConnectionGrpId: undefined }
          };
        });
      } else {
        // Ensure member connection exists
        if (!connId) {
          if (!isSandbox) {
            const createdConn = await taskApi.createMemberConnection({
              mbrId: currentMbrId,
              mbrConnectionMbrId: targetMbrId
            });
            connId = createdConn.mbrConnectionId;
          } else {
            connId = `conn-${Date.now()}-${targetMbrId.slice(0, 4)}`;
          }
        }

        // Create or update connection group
        if (connGrpId) {
          if (!isSandbox) {
            await taskApi.updateMemberConnectionGrp(connGrpId, {
              mbrConnectionId: connId,
              grpId: grpId
            });
          }
        } else {
          if (!isSandbox) {
            const createdConnGrp = await taskApi.createMemberConnectionGrp({
              mbrConnectionId: connId,
              grpId: grpId
            });
            connGrpId = createdConnGrp.mbrConnectionGrpId;
          } else {
            connGrpId = `conngrp-${Date.now()}`;
          }
        }

        setItems(prev => {
          const it = prev[targetMbrId];
          if (!it) return prev;
          return {
            ...prev,
            [targetMbrId]: {
              ...it,
              mbrConnectionId: connId,
              mbrConnectionGrpId: connGrpId
            }
          };
        });
      }

      if (isSandbox) {
        const updatedList = Object.values({
          ...items,
          [targetMbrId]: {
            ...currentItem,
            selectedGrpId: grpId,
            originalGrpId: grpId,
            mbrConnectionId: connId,
            mbrConnectionGrpId: grpId === '' ? undefined : connGrpId
          }
        }) as MemberConnectionItem[];

        const allConns = updatedList
          .filter(it => it.mbrConnectionId)
          .map(it => ({
            mbrConnectionId: it.mbrConnectionId!,
            mbrId: currentMbrId,
            mbrConnectionMbrId: it.member.mbrId
          }));
        sessionStorage.setItem(`sandbox_mbr_connections_${currentMbrId}`, JSON.stringify(allConns));

        const allConnGrps = updatedList
          .filter(it => it.mbrConnectionGrpId && it.selectedGrpId)
          .map(it => ({
            mbrConnectionGrpId: it.mbrConnectionGrpId!,
            mbrConnectionId: it.mbrConnectionId!,
            grpId: it.selectedGrpId
          }));
        sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(allConnGrps));
      }
    } catch (err: any) {
      console.error("Failed to update member connection group:", err);
      setError(err?.message || "Failed to update connection group.");
    }
  };

  // Immediate update: Confirm & Accept Invitation
  const handleConfirmAcceptInvitation = async (contactId: string, selectedGrpId: string) => {
    const invItem = invitations[contactId];
    if (!invItem) return;

    // Optimistically remove from invitations immediately
    setInvitations(prev => {
      const next = { ...prev };
      delete next[contactId];
      return next;
    });

    try {
      const senderMbrId = invItem.contact.mbrId;
      const timestamp = new Date().toISOString();

      if (!isSandbox) {
        await taskApi.updateMemberContact(contactId, {
          mbrContactResponseInd: 1,
          mbrContactResponseDt: timestamp
        });

        // 1. Recipient -> Sender Connection & Group
        try {
          const recipientConn = await taskApi.createMemberConnection({
            mbrId: currentMbrId,
            mbrConnectionMbrId: senderMbrId
          });
          if (selectedGrpId && recipientConn?.mbrConnectionId) {
            await taskApi.createMemberConnectionGrp({
              mbrConnectionId: recipientConn.mbrConnectionId,
              grpId: selectedGrpId
            }).catch(() => null);
          }

          // 2. Sender -> Recipient Connection & Group
          const senderConn = await taskApi.createMemberConnection({
            mbrId: senderMbrId,
            mbrConnectionMbrId: currentMbrId
          });
          const senderOriginalGrpId = invItem.contact.grpId;
          if (senderOriginalGrpId && senderConn?.mbrConnectionId) {
            await taskApi.createMemberConnectionGrp({
              mbrConnectionId: senderConn.mbrConnectionId,
              grpId: senderOriginalGrpId
            }).catch(() => null);
          }
        } catch (e) {
          console.warn("Could not create bidirectional connections for accepted invitation:", e);
        }
      } else {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          try {
            const rawContacts: MbrContact[] = JSON.parse(rawContactsStr);
            for (const c of rawContacts) {
              if (c.mbrContactId === contactId) {
                c.mbrContactResponseInd = 1;
                c.mbrContactResponseDt = timestamp;
              }
            }
            sessionStorage.setItem(`sandbox_mbr_contacts_${currentMbrId}`, JSON.stringify(rawContacts));
          } catch {}
        }

        const rawConnsStr = sessionStorage.getItem(`sandbox_mbr_connections_${currentMbrId}`);
        let connsList: any[] = [];
        if (rawConnsStr) {
          try { connsList = JSON.parse(rawConnsStr); } catch {}
        }

        const newConnId1 = `conn-${Date.now()}-${senderMbrId.slice(0, 4)}-recip`;
        connsList.push({
          mbrConnectionId: newConnId1,
          mbrId: currentMbrId,
          mbrConnectionMbrId: senderMbrId
        });

        if (selectedGrpId) {
          const rawConnGrpsStr = sessionStorage.getItem(`sandbox_mbr_connection_grps_${currentMbrId}`);
          let connGrpsList: any[] = [];
          if (rawConnGrpsStr) {
            try { connGrpsList = JSON.parse(rawConnGrpsStr); } catch {}
          }
          connGrpsList.push({
            mbrConnectionGrpId: `cg-${Date.now()}-1`,
            mbrConnectionId: newConnId1,
            grpId: selectedGrpId
          });
          sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(connGrpsList));
        }

        const newConnId2 = `conn-${Date.now()}-${senderMbrId.slice(0, 4)}-sender`;
        connsList.push({
          mbrConnectionId: newConnId2,
          mbrId: senderMbrId,
          mbrConnectionMbrId: currentMbrId
        });

        const senderOriginalGrpId = invItem.contact.grpId;
        if (senderOriginalGrpId) {
          const rawConnGrpsStr = sessionStorage.getItem(`sandbox_mbr_connection_grps_${currentMbrId}`);
          let connGrpsList: any[] = [];
          if (rawConnGrpsStr) {
            try { connGrpsList = JSON.parse(rawConnGrpsStr); } catch {}
          }
          connGrpsList.push({
            mbrConnectionGrpId: `cg-${Date.now()}-2`,
            mbrConnectionId: newConnId2,
            grpId: senderOriginalGrpId
          });
          sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(connGrpsList));
        }

        sessionStorage.setItem(`sandbox_mbr_connections_${currentMbrId}`, JSON.stringify(connsList));
      }

      setSuccess("Invitation accepted and member added to connections.");
      setTimeout(() => setSuccess(null), 3500);

      await loadData();
      window.dispatchEvent(new CustomEvent('invitations-updated'));
    } catch (err: any) {
      console.error("Failed to accept invitation:", err);
      setError(err?.message || "Failed to accept invitation.");
      await loadData();
    }
  };

  // Immediate update: Ignore Invitation
  const handleIgnoreInvitation = async (contactId: string) => {
    const invItem = invitations[contactId];
    if (!invItem) return;

    // Optimistically remove from invitations immediately
    setInvitations(prev => {
      const next = { ...prev };
      delete next[contactId];
      return next;
    });

    try {
      const timestamp = new Date().toISOString();
      if (!isSandbox) {
        await taskApi.updateMemberContact(contactId, {
          mbrContactResponseInd: 1,
          mbrContactResponseDt: timestamp
        });
      } else {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          try {
            const rawContacts: MbrContact[] = JSON.parse(rawContactsStr);
            for (const c of rawContacts) {
              if (c.mbrContactId === contactId) {
                c.mbrContactResponseInd = 1;
                c.mbrContactResponseDt = timestamp;
              }
            }
            sessionStorage.setItem(`sandbox_mbr_contacts_${currentMbrId}`, JSON.stringify(rawContacts));
          } catch {}
        }
      }

      window.dispatchEvent(new CustomEvent('invitations-updated'));
    } catch (err: any) {
      console.error("Failed to ignore invitation:", err);
      setError(err?.message || "Failed to ignore invitation.");
      await loadData();
    }
  };

  // Immediate update: Withdraw Outgoing Request
  const handleWithdrawRequest = async (contactId: string) => {
    // Optimistically remove from requests immediately
    setRequests(prev => {
      const next = { ...prev };
      delete next[contactId];
      return next;
    });

    try {
      if (!isSandbox) {
        await taskApi.deleteMemberContact(contactId);
      } else {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          try {
            const rawContacts: MbrContact[] = JSON.parse(rawContactsStr);
            const remaining = rawContacts.filter(c => c.mbrContactId !== contactId);
            sessionStorage.setItem(`sandbox_mbr_contacts_${currentMbrId}`, JSON.stringify(remaining));
          } catch {}
        }
      }
    } catch (err: any) {
      console.error("Failed to withdraw connection request:", err);
      setError(err?.message || "Failed to withdraw connection request.");
      await loadData();
    }
  };

  // Filtered member list for Connections view
  const filteredMemberList = useMemo(() => {
    const list = Object.values(items) as MemberConnectionItem[];
    return list.filter(item => {
      const name = `${item.member.mbrFirstName || ''} ${item.member.mbrLastName || ''}`.toLowerCase();
      const location = `${item.member.mbrLivesCityState || ''} ${item.member.mbrFromCityState || ''}`.toLowerCase();
      const email = (item.member.mbrEmailAddress || '').toLowerCase();
      const query = searchQuery.trim().toLowerCase();

      if (query && !name.includes(query) && !location.includes(query) && !email.includes(query)) {
        return false;
      }

      if (groupFilter !== 'ALL' && groupFilter !== 'ASSIGNED') {
        return item.selectedGrpId === groupFilter;
      }

      return true;
    });
  }, [items, searchQuery, groupFilter]);

  // Statistics counters
  const totalConnectionsCount = Object.keys(items).length;
  const assignedCount = (Object.values(items) as MemberConnectionItem[]).filter(it => it.selectedGrpId !== '').length;
  
  const pendingInvitationsList = useMemo(() => Object.values(invitations) as MemberInvitationItem[], [invitations]);
  const pendingInvitationsCount = pendingInvitationsList.length;

  const pendingRequestsList = useMemo(() => Object.values(requests) as MemberRequestItem[], [requests]);
  const pendingRequestsCount = pendingRequestsList.length;

  const handleBack = () => {
    onClickBack();
  };

  const handlePrintPdf = () => {
    generateConnectionPdf({
      mbrId: currentMbrId,
      mbrEmail,
      groupFilter,
      groups,
      memberList: filteredMemberList
    });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-1 sm:px-4 pt-1 sm:pt-6 md:pt-8 pb-8 relative">
      <AdminComponentTag name="MbrConnectionFeature.tsx" />

      {/* Mobile Menu Bar: Connections Navigation */}
      <ConnectionMobileMenuBar
        activeSection={activeSection}
        onSelectSection={handleSelectSection}
        connectionsCount={totalConnectionsCount}
        invitationsCount={pendingInvitationsCount}
        requestsCount={pendingRequestsCount}
        className="mb-4"
      />

      {/* 2-Column Responsive Layout: Left Column Menu + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-8 items-start">
        
        {/* Left Column Section: Brand Header & "Manage my Connections" Menu (Desktop only) */}
        <aside className="hidden lg:block lg:col-span-4 xl:col-span-3 space-y-6">
          <ConnectionPageHeaderPanel />
          <ManageConnectionsMenu
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            connectionsCount={totalConnectionsCount}
            invitationsCount={pendingInvitationsCount}
            requestsCount={pendingRequestsCount}
          />
        </aside>

        {/* Right Main Content Area: Connections, Invitations, or Requests */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          {activeSection === 'connections' && (
            <div>
              {/* Header Section for Connections */}
              <ConnectionHeader
                success={success}
                error={error}
              />

              {/* Search & Filter Toolbar */}
              <ConnectionSearchToolbar
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                groupFilter={groupFilter}
                onGroupFilterChange={setGroupFilter}
                groups={groups}
                totalMembers={totalConnectionsCount}
                assignedCount={assignedCount}
                onPrintPdf={handlePrintPdf}
              />

              {/* Member Cards Directory */}
              <MemberConnectionList
                loading={loading}
                memberList={filteredMemberList}
                groups={groups}
                onGroupSelect={handleGroupSelect}
              />
            </div>
          )}

          {activeSection === 'invitations' && (
            <div>
              {/* Header Section for Invitations */}
              <InvitationsHeader
                success={success}
                error={error}
              />

              {/* Invitations List Component */}
              <InvitationsList
                loading={loading}
                invitationList={pendingInvitationsList}
                groups={groups}
                onIgnore={handleIgnoreInvitation}
                onOpenAcceptModal={(item) => setAcceptModalInvitation(item)}
              />
            </div>
          )}

          {activeSection === 'requests' && (
            <div>
              {/* Header Section for Requests */}
              <RequestsHeader
                success={success}
                error={error}
              />

              {/* Requests List Component */}
              <RequestsList
                loading={loading}
                requestList={pendingRequestsList}
                groups={groups}
                onWithdraw={handleWithdrawRequest}
              />
            </div>
          )}
        </main>

      </div>

      {/* Accept Connection Group Selection Modal Dialog */}
      <AcceptInvitationModal
        isOpen={acceptModalInvitation !== null}
        onClose={() => setAcceptModalInvitation(null)}
        invitation={acceptModalInvitation}
        groups={groups}
        onConfirmAccept={(contactId, selectedGrpId) => {
          handleConfirmAcceptInvitation(contactId, selectedGrpId);
        }}
      />
    </div>
  );
}
