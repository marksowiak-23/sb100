import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, Save, X } from 'lucide-react';
import { taskApi, Mbr, GroupGlobal, GroupCustom, MbrConnection, MbrConnectionGrp, MbrContact } from '@/src/services/api.ts';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { 
  MbrConnectionFeatureProps, 
  UnifiedGroupOption, 
  MemberConnectionItem, 
  ConnectionFilterType,
  ConnectionSection,
  MemberInvitationItem,
  InvitationDecision,
  MemberRequestItem,
  RequestDecision
} from '../types';
import ManageConnectionsMenu from './ManageConnectionsMenu';
import ConnectionHeader from './ConnectionHeader';
import ConnectionSearchToolbar from './ConnectionSearchToolbar';
import MemberConnectionList from './MemberConnectionList';
import InvitationsHeader from './InvitationsHeader';
import InvitationsList from './InvitationsList';
import RequestsHeader from './RequestsHeader';
import RequestsList from './RequestsList';
import SbBrandHeader from '@/src/components/SbBrandHeader';
import { generateConnectionPdf } from '../utils/generateConnectionPdf';

export default function MbrConnectionFeature({ isSandbox, onClickBack, onDirtyChange, onNavigate }: MbrConnectionFeatureProps) {
  // Navigation / View state: 'connections' | 'invitations' | 'requests'
  const [activeSection, setActiveSection] = useState<ConnectionSection>('connections');

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
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

  // Navigation Guard Modal State
  const [showSavePromptModal, setShowSavePromptModal] = useState<boolean>(false);
  const [pendingNavigationTarget, setPendingNavigationTarget] = useState<string | null>(null);
  const [pendingSectionTarget, setPendingSectionTarget] = useState<ConnectionSection | null>(null);

  // Determine dirty state across Connections, Invitations, and Requests
  const isConnectionsDirty = useMemo(() => {
    return Object.values(items).some(item => item.selectedGrpId !== item.originalGrpId);
  }, [items]);

  const isInvitationsDirty = useMemo(() => {
    return Object.values(invitations).some(inv => inv.selectedDecision !== null);
  }, [invitations]);

  const isRequestsDirty = useMemo(() => {
    return Object.values(requests).some(req => req.selectedDecision !== null);
  }, [requests]);

  const isDirty = useMemo(() => {
    return isConnectionsDirty || isInvitationsDirty || isRequestsDirty;
  }, [isConnectionsDirty, isInvitationsDirty, isRequestsDirty]);

  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Intercept navigation events when dirty
  useEffect(() => {
    const handleNavAttempt = (e: any) => {
      const targetTab = e.detail?.targetTab;
      if (isDirty) {
        setPendingNavigationTarget(targetTab || 'back');
        setShowSavePromptModal(true);
      } else {
        if (targetTab && onNavigate) {
          onNavigate(targetTab);
        } else {
          onClickBack();
        }
      }
    };

    window.addEventListener('attempt-connection-navigation', handleNavAttempt);
    return () => window.removeEventListener('attempt-connection-navigation', handleNavAttempt);
  }, [isDirty, onClickBack, onNavigate]);

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
        const savedConn = sessionStorage.getItem(`sandbox_mbr_connections_${resolvedMbrId}`);
        if (savedConn) {
          try { connections = JSON.parse(savedConn); } catch {}
        }
        const savedConnGrp = sessionStorage.getItem(`sandbox_mbr_connection_grps_${resolvedMbrId}`);
        if (savedConnGrp) {
          try { connectionGrps = JSON.parse(savedConnGrp); } catch {}
        }

        if (connections.length === 0) {
          connections = [
            {
              mbrConnectionId: 'conn-1',
              mbrId: resolvedMbrId,
              mbrConnectionMbrId: 'e20986fa-0fb9-4081-ae5d-35bc8f504df0'
            },
            {
              mbrConnectionId: 'conn-2',
              mbrId: resolvedMbrId,
              mbrConnectionMbrId: 'f87a329c-982a-4a56-8a03-9bb54fc82341'
            }
          ];
          connectionGrps = [
            { mbrConnectionGrpId: 'cg-1', mbrConnectionId: 'conn-1', grpId: 'g1' },
            { mbrConnectionGrpId: 'cg-2', mbrConnectionId: 'conn-2', grpId: 'g2' }
          ];
        }
      }

      // Extract only member IDs that are in mbrConnection (excluding self)
      const connectedMbrIds = Array.from(
        new Set(
          connections
            .map(c => c.mbrConnectionMbrId)
            .filter(id => id && id !== resolvedMbrId)
        )
      );

      // 3. Fetch ONLY members who are in mbrConnection
      let connectedMembers: Mbr[] = [];
      if (connectedMbrIds.length > 0) {
        if (!isSandbox) {
          const memberPromises = connectedMbrIds.map(id => taskApi.getMemberById(id).catch(() => null));
          const fetchedMembers = await Promise.all(memberPromises);
          connectedMembers = fetchedMembers.filter((m): m is Mbr => m !== null && Boolean(m.mbrId));
        }

        // Fallback for any missing member records or sandbox mode
        if (connectedMembers.length < connectedMbrIds.length) {
          const loadedIds = new Set(connectedMembers.map(m => m.mbrId));
          const mockData: Record<string, Partial<Mbr>> = {
            'e20986fa-0fb9-4081-ae5d-35bc8f504df0': {
              mbrFirstName: 'Eleanor',
              mbrLastName: 'Vance',
              mbrEmailAddress: 'eleanor.vance@storybook.ai',
              mbrLivesCityState: 'Boston, MA',
              mbrWorkAt: 'Architectural Historian'
            },
            'f87a329c-982a-4a56-8a03-9bb54fc82341': {
              mbrFirstName: 'James',
              mbrLastName: 'Sterling',
              mbrEmailAddress: 'james.sterling@storybook.ai',
              mbrLivesCityState: 'San Francisco, CA',
              mbrWorkAt: 'Product Designer'
            }
          };

          for (const id of connectedMbrIds) {
            if (!loadedIds.has(id)) {
              const mock = mockData[id] || {
                mbrFirstName: 'Connected',
                mbrLastName: 'Member',
                mbrEmailAddress: 'member@storybook.ai'
              };
              connectedMembers.push({
                mbrId: id,
                ...mock
              });
            }
          }
        }
      }

      // 4. Fetch groups (Global & Custom)
      let fetchedGlobals: GroupGlobal[] = [];
      let fetchedCustoms: GroupCustom[] = [];
      try {
        fetchedGlobals = await taskApi.getGroupsGlobal();
      } catch (e) {
        console.warn("Error fetching global groups:", e);
      }
      try {
        fetchedCustoms = await taskApi.getGroupsCustom(resolvedMbrId);
      } catch (e) {
        console.warn("Error fetching custom groups:", e);
      }

      if (!fetchedGlobals || fetchedGlobals.length === 0) {
        fetchedGlobals = [
          { grpId: 'g1', grpName: 'Family', grpDescription: 'Immediate and extended family', grpSortOrder: 10 },
          { grpId: 'g2', grpName: 'Friends', grpDescription: 'Close friends & peers', grpSortOrder: 20 },
          { grpId: 'g3', grpName: 'Work', grpDescription: 'Colleagues & professional circle', grpSortOrder: 30 },
          { grpId: 'g4', grpName: 'Public', grpDescription: 'All StoryBook members', grpSortOrder: 40 }
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
              grpId: 'g2'
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
              grpId: 'g3'
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
              grpId: 'g2'
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

  // Handle section switching (with dirty guard)
  const handleSelectSection = (targetSection: ConnectionSection) => {
    if (targetSection === activeSection) return;

    if (isDirty) {
      setPendingSectionTarget(targetSection);
      setShowSavePromptModal(true);
    } else {
      setActiveSection(targetSection);
    }
  };

  // Handle dropdown selection change for a member in Connections
  const handleGroupSelect = (targetMbrId: string, grpId: string) => {
    setItems(prev => {
      const existing = prev[targetMbrId];
      if (!existing) return prev;
      return {
        ...prev,
        [targetMbrId]: {
          ...existing,
          selectedGrpId: grpId
        }
      };
    });
  };

  // Handle Accept / Ignore decision toggle for an invitation
  const handleSelectInvitationDecision = (contactId: string, decision: InvitationDecision) => {
    setInvitations(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          selectedDecision: decision
        }
      };
    });
  };

  // Handle Withdraw toggle for an outgoing request
  const handleToggleWithdrawal = (contactId: string) => {
    setRequests(prev => {
      const existing = prev[contactId];
      if (!existing) return prev;
      return {
        ...prev,
        [contactId]: {
          ...existing,
          selectedDecision: existing.selectedDecision === 'WITHDRAW' ? null : 'WITHDRAW'
        }
      };
    });
  };

  // Discard all changes in Connections
  const handleResetConnections = () => {
    setItems(prev => {
      const resetMap: Record<string, MemberConnectionItem> = {};
      for (const [key, item] of Object.entries(prev)) {
        resetMap[key] = {
          ...item,
          selectedGrpId: item.originalGrpId
        };
      }
      return resetMap;
    });
  };

  // Discard all changes in Invitations
  const handleResetInvitations = () => {
    setInvitations(prev => {
      const resetMap: Record<string, MemberInvitationItem> = {};
      for (const [key, item] of Object.entries(prev)) {
        resetMap[key] = {
          ...item,
          selectedDecision: null
        };
      }
      return resetMap;
    });
  };

  // Discard all changes in Requests
  const handleResetRequests = () => {
    setRequests(prev => {
      const resetMap: Record<string, MemberRequestItem> = {};
      for (const [key, item] of Object.entries(prev)) {
        resetMap[key] = {
          ...item,
          selectedDecision: null
        };
      }
      return resetMap;
    });
  };

  // Save Connections group changes
  const handleSaveConnections = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const changedItems = Object.values(items).filter(
        item => item.selectedGrpId !== item.originalGrpId
      );

      for (const item of changedItems) {
        const targetMbrId = item.member.mbrId;
        const newGrpId = item.selectedGrpId;

        if (newGrpId === '') {
          if (item.mbrConnectionGrpId && !isSandbox) {
            try {
              await taskApi.deleteMemberConnectionGrp(item.mbrConnectionGrpId);
            } catch (e) {
              console.warn("Could not delete connection group:", e);
            }
          }
          item.mbrConnectionGrpId = undefined;
          item.originalGrpId = '';
        } else {
          let connId = item.mbrConnectionId;

          if (!connId) {
            if (!isSandbox) {
              const createdConn = await taskApi.createMemberConnection({
                mbrId: currentMbrId,
                mbrConnectionMbrId: targetMbrId
              });
              connId = createdConn.mbrConnectionId;
              item.mbrConnectionId = connId;
            } else {
              connId = `conn-${Date.now()}-${targetMbrId.slice(0, 4)}`;
              item.mbrConnectionId = connId;
            }
          }

          if (item.mbrConnectionGrpId) {
            if (!isSandbox) {
              await taskApi.updateMemberConnectionGrp(item.mbrConnectionGrpId, {
                mbrConnectionId: connId,
                grpId: newGrpId
              });
            }
          } else {
            if (!isSandbox) {
              const createdConnGrp = await taskApi.createMemberConnectionGrp({
                mbrConnectionId: connId,
                grpId: newGrpId
              });
              item.mbrConnectionGrpId = createdConnGrp.mbrConnectionGrpId;
            } else {
              item.mbrConnectionGrpId = `conngrp-${Date.now()}`;
            }
          }
          item.originalGrpId = newGrpId;
        }
      }

      if (isSandbox) {
        const allConns = Object.values(items)
          .filter(it => it.mbrConnectionId)
          .map(it => ({
            mbrConnectionId: it.mbrConnectionId!,
            mbrId: currentMbrId,
            mbrConnectionMbrId: it.member.mbrId
          }));
        sessionStorage.setItem(`sandbox_mbr_connections_${currentMbrId}`, JSON.stringify(allConns));

        const allConnGrps = Object.values(items)
          .filter(it => it.mbrConnectionGrpId && it.selectedGrpId)
          .map(it => ({
            mbrConnectionGrpId: it.mbrConnectionGrpId!,
            mbrConnectionId: it.mbrConnectionId!,
            grpId: it.selectedGrpId
          }));
        sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(allConnGrps));
      }

      setItems({ ...items });
      setSuccess("Member connections and group assignments saved successfully.");
      setTimeout(() => setSuccess(null), 4000);
    } catch (err: any) {
      console.error("Failed to save member connections:", err);
      setError(err?.message || "Failed to save member connections. Please check server status.");
    } finally {
      setSaving(false);
    }
  };

  // Save Invitations decisions (Accept / Ignore)
  const handleSaveInvitations = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const decidedItems = Object.values(invitations).filter(inv => inv.selectedDecision !== null);

      if (decidedItems.length === 0) {
        setSaving(false);
        return;
      }

      const timestamp = new Date().toISOString();

      for (const item of decidedItems) {
        const contactId = item.contact.mbrContactId;
        const senderMbrId = item.contact.mbrId;
        const decision = item.selectedDecision;

        if (!isSandbox) {
          await taskApi.updateMemberContact(contactId, {
            mbrContactResponseInd: 1,
            mbrContactResponseDt: timestamp
          });
        }

        if (decision === 'ACCEPT') {
          if (!isSandbox) {
            try {
              const createdConn = await taskApi.createMemberConnection({
                mbrId: currentMbrId,
                mbrConnectionMbrId: senderMbrId
              });

              if (item.contact.grpId && createdConn?.mbrConnectionId) {
                await taskApi.createMemberConnectionGrp({
                  mbrConnectionId: createdConn.mbrConnectionId,
                  grpId: item.contact.grpId
                }).catch(() => null);
              }
            } catch (e) {
              console.warn("Could not create connection for accepted invitation:", e);
            }
          }
        }
      }

      if (isSandbox) {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          try {
            const rawContacts: MbrContact[] = JSON.parse(rawContactsStr);
            for (const c of rawContacts) {
              const matched = decidedItems.find(it => it.contact.mbrContactId === c.mbrContactId);
              if (matched) {
                c.mbrContactResponseInd = 1;
                c.mbrContactResponseDt = timestamp;
              }
            }
            sessionStorage.setItem(`sandbox_mbr_contacts_${currentMbrId}`, JSON.stringify(rawContacts));
          } catch {}
        }

        const acceptedSenders = decidedItems.filter(it => it.selectedDecision === 'ACCEPT');
        if (acceptedSenders.length > 0) {
          const rawConnsStr = sessionStorage.getItem(`sandbox_mbr_connections_${currentMbrId}`);
          let connsList: any[] = [];
          if (rawConnsStr) {
            try { connsList = JSON.parse(rawConnsStr); } catch {}
          }
          for (const it of acceptedSenders) {
            const newConnId = `conn-${Date.now()}-${it.contact.mbrId.slice(0, 4)}`;
            connsList.push({
              mbrConnectionId: newConnId,
              mbrId: currentMbrId,
              mbrConnectionMbrId: it.contact.mbrId
            });

            if (it.contact.grpId) {
              const rawConnGrpsStr = sessionStorage.getItem(`sandbox_mbr_connection_grps_${currentMbrId}`);
              let connGrpsList: any[] = [];
              if (rawConnGrpsStr) {
                try { connGrpsList = JSON.parse(rawConnGrpsStr); } catch {}
              }
              connGrpsList.push({
                mbrConnectionGrpId: `cg-${Date.now()}`,
                mbrConnectionId: newConnId,
                grpId: it.contact.grpId
              });
              sessionStorage.setItem(`sandbox_mbr_connection_grps_${currentMbrId}`, JSON.stringify(connGrpsList));
            }
          }
          sessionStorage.setItem(`sandbox_mbr_connections_${currentMbrId}`, JSON.stringify(connsList));
        }
      }

      setSuccess(`Successfully updated ${decidedItems.length} connection invitation response${decidedItems.length > 1 ? 's' : ''}.`);
      setTimeout(() => setSuccess(null), 4000);

      await loadData();
      window.dispatchEvent(new CustomEvent('invitations-updated'));
    } catch (err: any) {

      console.error("Failed to save invitation responses:", err);
      setError(err?.message || "Failed to save invitation responses. Please check server status.");
    } finally {
      setSaving(false);
    }
  };

  // Save Requests withdrawals (Delete mbrContact records)
  const handleSaveRequests = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const withdrawnItems = Object.values(requests).filter(req => req.selectedDecision === 'WITHDRAW');

      if (withdrawnItems.length === 0) {
        setSaving(false);
        return;
      }

      for (const item of withdrawnItems) {
        const contactId = item.contact.mbrContactId;
        if (!isSandbox) {
          try {
            await taskApi.deleteMemberContact(contactId);
          } catch (e) {
            console.warn(`Could not delete mbrContact record ${contactId}:`, e);
          }
        }
      }

      if (isSandbox) {
        const rawContactsStr = sessionStorage.getItem(`sandbox_mbr_contacts_${currentMbrId}`);
        if (rawContactsStr) {
          try {
            const rawContacts: MbrContact[] = JSON.parse(rawContactsStr);
            const remaining = rawContacts.filter(
              c => !withdrawnItems.some(it => it.contact.mbrContactId === c.mbrContactId)
            );
            sessionStorage.setItem(`sandbox_mbr_contacts_${currentMbrId}`, JSON.stringify(remaining));
          } catch {}
        }
      }

      setSuccess(`Successfully withdrawn ${withdrawnItems.length} outgoing connection request${withdrawnItems.length > 1 ? 's' : ''}.`);
      setTimeout(() => setSuccess(null), 4000);

      await loadData();
    } catch (err: any) {
      console.error("Failed to withdraw connection requests:", err);
      setError(err?.message || "Failed to withdraw connection requests. Please check server status.");
    } finally {
      setSaving(false);
    }
  };

  // Filtered member list for Connections view
  const filteredMemberList = useMemo(() => {
    const list = Object.values(items);
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
  const assignedCount = Object.values(items).filter(it => it.selectedGrpId !== '').length;
  
  const pendingInvitationsList = useMemo(() => Object.values(invitations), [invitations]);
  const pendingInvitationsCount = pendingInvitationsList.length;
  const pendingDecisionsCount = pendingInvitationsList.filter(inv => inv.selectedDecision !== null).length;

  const pendingRequestsList = useMemo(() => Object.values(requests), [requests]);
  const pendingRequestsCount = pendingRequestsList.length;
  const pendingWithdrawalsCount = pendingRequestsList.filter(req => req.selectedDecision === 'WITHDRAW').length;

  const handleBack = () => {
    if (isDirty) {
      setPendingNavigationTarget('back');
      setShowSavePromptModal(true);
    } else {
      onClickBack();
    }
  };

  const handleSaveAndProceed = async () => {
    if (isConnectionsDirty) {
      await handleSaveConnections();
    }
    if (isInvitationsDirty) {
      await handleSaveInvitations();
    }
    if (isRequestsDirty) {
      await handleSaveRequests();
    }
    setShowSavePromptModal(false);

    if (pendingSectionTarget) {
      setActiveSection(pendingSectionTarget);
      setPendingSectionTarget(null);
    } else if (pendingNavigationTarget && pendingNavigationTarget !== 'back' && onNavigate) {
      onNavigate(pendingNavigationTarget);
    } else {
      onClickBack();
    }
  };

  const handleDiscardAndProceed = () => {
    if (isConnectionsDirty) handleResetConnections();
    if (isInvitationsDirty) handleResetInvitations();
    if (isRequestsDirty) handleResetRequests();
    setShowSavePromptModal(false);

    if (pendingSectionTarget) {
      setActiveSection(pendingSectionTarget);
      setPendingSectionTarget(null);
    } else if (pendingNavigationTarget && pendingNavigationTarget !== 'back' && onNavigate) {
      onNavigate(pendingNavigationTarget);
    } else {
      onClickBack();
    }
  };

  const handleKeepEditing = () => {
    setShowSavePromptModal(false);
    setPendingNavigationTarget(null);
    setPendingSectionTarget(null);
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8 relative">
      <AdminComponentTag name="MbrConnectionFeature.tsx" />

      {/* --- UNSAVED CHANGES PROMPT DIALOG MODAL --- */}
      <AnimatePresence>
        {showSavePromptModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0 shadow-xs">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={handleKeepEditing}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                  Save Changes Before Leaving?
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-serif leading-relaxed">
                  You have unsaved changes in your connection management settings. Would you like to save your modifications before proceeding?
                </p>
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleKeepEditing}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleDiscardAndProceed}
                  className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl text-xs font-semibold transition-all cursor-pointer border border-slate-200 dark:border-slate-700"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSaveAndProceed}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-sans shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <span>Saving...</span>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2-Column Responsive Layout: Left Column Menu + Right Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column Section: Brand Header & "Manage my Connections" Menu */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-6">
          <SbBrandHeader />
          <ManageConnectionsMenu
            activeSection={activeSection}
            onSelectSection={handleSelectSection}
            connectionsCount={totalConnectionsCount}
            invitationsCount={pendingInvitationsCount}
            requestsCount={pendingRequestsCount}
            hasUnsavedInvitations={isInvitationsDirty}
            hasUnsavedRequests={isRequestsDirty}
          />
        </aside>

        {/* Right Main Content Area: Connections, Invitations, or Requests */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          {activeSection === 'connections' && (
            <div>
              {/* Header Section for Connections */}
              <ConnectionHeader
                isDirty={isConnectionsDirty}
                saving={saving}
                success={success}
                error={error}
                onClickBack={handleBack}
                onReset={handleResetConnections}
                onSave={handleSaveConnections}
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
                isDirty={isInvitationsDirty}
                saving={saving}
                success={success}
                error={error}
                onClickBack={handleBack}
                onReset={handleResetInvitations}
                onSave={handleSaveInvitations}
                pendingDecisionsCount={pendingDecisionsCount}
              />

              {/* Invitations List Component */}
              <InvitationsList
                loading={loading}
                invitationList={pendingInvitationsList}
                groups={groups}
                onSelectDecision={handleSelectInvitationDecision}
              />
            </div>
          )}

          {activeSection === 'requests' && (
            <div>
              {/* Header Section for Requests */}
              <RequestsHeader
                isDirty={isRequestsDirty}
                saving={saving}
                success={success}
                error={error}
                onClickBack={handleBack}
                onReset={handleResetRequests}
                onSave={handleSaveRequests}
                pendingWithdrawalsCount={pendingWithdrawalsCount}
              />

              {/* Requests List Component */}
              <RequestsList
                loading={loading}
                requestList={pendingRequestsList}
                groups={groups}
                onToggleWithdrawal={handleToggleWithdrawal}
              />
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
