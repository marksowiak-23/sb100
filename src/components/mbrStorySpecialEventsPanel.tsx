/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  PartyPopper, Trash2, Edit3, Save, X, Plus, Loader2, 
  AlertCircle, CheckCircle2, ShieldAlert, Images, 
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Calendar,
  MapPin, Users, Sparkles, BookOpen
} from 'lucide-react';
import { 
  taskApi, 
  MbrTopicSpecialEvent, 
  DEFAULT_TOPIC_LOOKUP, 
  Cd 
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStorySpecialEventsPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
  topicId?: string;
  chIntentId?: string;
}

export type SbMbrStrySpecialEventsProps = MbrStorySpecialEventsPanelProps;

const SANDBOX_SPECIAL_EVENTS: MbrTopicSpecialEvent[] = [
  {
    mbrSpecialEventId: 'event-1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrSpecialEventTitle: 'Golden Wedding Anniversary Gala',
    mbrSpecialEventTypeCd: 'ANNIVERSARY',
    mbrSpecialEventRoleCd: 'HONOREE',
    mbrSpecialEventDate: '2024-06-15',
    mbrSpecialEventEndDate: undefined,
    mbrSpecialEventYear: 2024,
    mbrSpecialEventLocation: 'The Benson Hotel, Crystal Ballroom, Portland, OR',
    mbrSpecialEventKeyPeople: 'Eleanor, children, grandchildren, and lifelong university friends',
    mbrSpecialEventHighlights: 'Fifty wonderful years of marriage celebrated with four generations of family under glittering crystal chandeliers.',
    mbrSpecialEventDescription: 'An unforgettable evening honoring our golden jubilee. Our children prepared a heartwarming retrospective video and friends traveled from four states to share stories and toast our journey together.'
  },
  {
    mbrSpecialEventId: 'event-2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrSpecialEventTitle: 'Stanford University Commencement',
    mbrSpecialEventTypeCd: 'GRADUATION',
    mbrSpecialEventRoleCd: 'HONOREE',
    mbrSpecialEventDate: '1978-06-18',
    mbrSpecialEventEndDate: undefined,
    mbrSpecialEventYear: 1978,
    mbrSpecialEventLocation: 'Stanford Stadium, Palo Alto, CA',
    mbrSpecialEventKeyPeople: 'Parents Harold and Martha, Eleanor, thesis advisor Dr. Vance',
    mbrSpecialEventHighlights: 'Conferral of Master of Science in Civil Engineering with academic honors.',
    mbrSpecialEventDescription: 'A crisp, sun-drenched morning in the Bay Area. Hearing my name called with my parents and Eleanor in the stands made every late night in the lab worthwhile.'
  },
  {
    mbrSpecialEventId: 'event-3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrSpecialEventTitle: 'Engineering Career Farewell & Retirement Toast',
    mbrSpecialEventTypeCd: 'RETIREMENT',
    mbrSpecialEventRoleCd: 'HONOREE',
    mbrSpecialEventDate: '2019-12-10',
    mbrSpecialEventEndDate: undefined,
    mbrSpecialEventYear: 2019,
    mbrSpecialEventLocation: 'Sellwood Riverfront Club, Portland, OR',
    mbrSpecialEventKeyPeople: 'Engineering firm partners, former interns, bridge division staff',
    mbrSpecialEventHighlights: 'Presented with commemorative bridge blueprint plaque and surprise video messages.',
    mbrSpecialEventDescription: 'Celebrating thirty-eight fulfilling years in structural engineering surrounded by the brilliant colleagues and mentees who became second family.'
  }
];

const DEFAULT_SPECIAL_EVENT_TYPE_CODES: Partial<Cd>[] = [
  { cdValue: 'WEDDING', cdLabel: 'Wedding', cdDesc: 'Wedding or marriage ceremony', cdSortOrder: 1 },
  { cdValue: 'MILESTONE_BIRTHDAY', cdLabel: 'Milestone Birthday', cdDesc: 'Significant birthday celebration (e.g., 21st, 50th, 80th)', cdSortOrder: 2 },
  { cdValue: 'ANNIVERSARY', cdLabel: 'Anniversary', cdDesc: 'Milestone wedding or life anniversary', cdSortOrder: 3 },
  { cdValue: 'GRADUATION', cdLabel: 'Graduation', cdDesc: 'High school, college, or graduate commencement', cdSortOrder: 4 },
  { cdValue: 'RETIREMENT', cdLabel: 'Retirement', cdDesc: 'Retirement celebration or career sendoff', cdSortOrder: 5 },
  { cdValue: 'REUNION', cdLabel: 'Family / School Reunion', cdDesc: 'Family reunion or class homecoming', cdSortOrder: 6 },
  { cdValue: 'RITE_OF_PASSAGE', cdLabel: 'Rite of Passage', cdDesc: 'Bar/Bat Mitzvah, Quinceañera, Confirmation, etc.', cdSortOrder: 7 },
  { cdValue: 'AWARD_GALA', cdLabel: 'Award / Gala / Ceremony', cdDesc: 'Award gala, ceremony, or formal recognition dinner', cdSortOrder: 8 },
  { cdValue: 'FESTIVAL_HOLIDAY', cdLabel: 'Holiday / Festival Gathering', cdDesc: 'Memorable holiday feast or festival gathering', cdSortOrder: 9 },
  { cdValue: 'CELEBRATION', cdLabel: 'Celebration / Party', cdDesc: 'General celebration, gala, or party', cdSortOrder: 10 },
  { cdValue: 'OTHER', cdLabel: 'Other Special Event', cdDesc: 'Other meaningful celebration or milestone event', cdSortOrder: 11 }
];

const DEFAULT_SPECIAL_EVENT_ROLE_CODES: Partial<Cd>[] = [
  { cdValue: 'HONOREE', cdLabel: 'Honoree / Guest of Honor', cdDesc: 'Person being celebrated or honored', cdSortOrder: 1 },
  { cdValue: 'HOST', cdLabel: 'Host / Organizer', cdDesc: 'Event planner, host, or organizer', cdSortOrder: 2 },
  { cdValue: 'KEY_PARTICIPANT', cdLabel: 'Key Participant / Speaker', cdDesc: 'Best man, maid of honor, speaker, or performer', cdSortOrder: 3 },
  { cdValue: 'ATTENDEE', cdLabel: 'Attendee / Guest', cdDesc: 'Guest or attendee', cdSortOrder: 4 }
];

export default function MbrStorySpecialEventsPanel({
  isSandbox = false,
  memberId,
  readOnly = false,
  topicId = DEFAULT_TOPIC_LOOKUP['special events']?.topicId || '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff',
  chIntentId = DEFAULT_TOPIC_LOOKUP['special events']?.chIntentId || '6b5b064c-844e-48b8-a04f-a7f1c3c632ae'
}: MbrStorySpecialEventsPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [eventsList, setEventsList] = useState<MbrTopicSpecialEvent[]>([]);
  const [typeCodes, setTypeCodes] = useState<Partial<Cd>[]>(DEFAULT_SPECIAL_EVENT_TYPE_CODES);
  const [roleCodes, setRoleCodes] = useState<Partial<Cd>[]>(DEFAULT_SPECIAL_EVENT_ROLE_CODES);

  // --- MODAL FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTypeCd, setFormTypeCd] = useState('CELEBRATION');
  const [formRoleCd, setFormRoleCd] = useState('HONOREE');
  const [formDate, setFormDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formKeyPeople, setFormKeyPeople] = useState('');
  const [formHighlights, setFormHighlights] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION MODAL STATE ---
  const [deleteTarget, setDeleteTarget] = useState<MbrTopicSpecialEvent | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- TOPIC PRIVACY & PHOTO GALLERY MODAL STATES ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('Special Events & Milestones');

  // --- HEADER & ROW DROPDOWN MENUS ---
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // --- MEDIA / BADGE MAPS ---
  const [eventPhotosMap, setEventPhotosMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // --- COLUMN SORTING ---
  const [sortColumn, setSortColumn] = useState<'title' | 'type' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const resolvedTopicId = topicId || DEFAULT_TOPIC_LOOKUP['special events']?.topicId || '223c07b1-a7b0-4ed2-91fb-0bf4da9ba4ff';
  const resolvedChIntentId = chIntentId || DEFAULT_TOPIC_LOOKUP['special events']?.chIntentId || '6b5b064c-844e-48b8-a04f-a7f1c3c632ae';

  // Format month and year from YYYY-MM-DD
  const formatMonYear = (dateStr?: string | null): string => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parts[2] ? parseInt(parts[2], 10) : 1;
        const date = new Date(year, month, day);
        const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
        return `${mon} ${year}`;
      }
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const mon = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
      return `${mon} ${date.getFullYear()}`;
    } catch {
      return dateStr || '—';
    }
  };

  const getTypeBadgeStyle = (typeCd?: string | null) => {
    switch (typeCd?.toUpperCase()) {
      case 'WEDDING':
        return 'bg-rose-50 text-rose-700 border-rose-200/80';
      case 'ANNIVERSARY':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'MILESTONE_BIRTHDAY':
        return 'bg-purple-50 text-purple-700 border-purple-200/80';
      case 'GRADUATION':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'RETIREMENT':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'AWARD_GALA':
        return 'bg-yellow-50 text-yellow-800 border-yellow-300/80';
      case 'REUNION':
        return 'bg-sky-50 text-sky-700 border-sky-200/80';
      case 'RITE_OF_PASSAGE':
        return 'bg-teal-50 text-teal-700 border-teal-200/80';
      case 'FESTIVAL_HOLIDAY':
        return 'bg-orange-50 text-orange-700 border-orange-200/80';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
    }
  };

  // Close menus on outer click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.event-action-menu-container') && !target.closest('.event-header-menu-container')) {
        setActiveActionMenuId(null);
        setShowHeaderMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
    };
  }, [activeActionMenuId, showHeaderMenu]);

  // Load photo count badges for special event entries
  const loadSubordinateCounts = async (targetMbrId: string, currentRecords: MbrTopicSpecialEvent[]) => {
    try {
      if (isSandbox) {
        setHeaderPhotoCount(0);
        setEventPhotosMap({});
        return;
      }
      const mediaList: any[] = await taskApi.getMemberMedia(targetMbrId).catch(() => []);
      if (Array.isArray(mediaList)) {
        const photoMap: Record<string, number> = {};
        let headerPhotos = 0;

        mediaList.forEach((m) => {
          const category = (m.mbrMediaCategoryCd || '').toLowerCase();
          if (category.includes('event') || category.includes('milestone') || category.includes('celebration') || m.mbrMediaTopicId === resolvedTopicId) {
            headerPhotos++;
            if (m.mbrMediaSubordinateId) {
              photoMap[m.mbrMediaSubordinateId] = (photoMap[m.mbrMediaSubordinateId] || 0) + 1;
            }
          }
        });

        setHeaderPhotoCount(headerPhotos);
        setEventPhotosMap(photoMap);
      }

      // Fetch stories count
      try {
        const stories = await taskApi.getStories(targetMbrId).catch(() => []);
        if (Array.isArray(stories)) {
          const evtStories = stories.filter((s: any) => 
            s.mbrStoryTopicId === resolvedTopicId || 
            s.mbrStoryTypeCd === 'sbMbrStrySpecialEvents' ||
            (s.mbrStoryTopicTitle && s.mbrStoryTopicTitle.toLowerCase().includes('special event'))
          );
          setHeaderStoryCount(evtStories.length);
        }
      } catch {}
    } catch {
      // Graceful fallback
    }
  };

  // Re-fetch subordinate counts when storage or sync occurs
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, eventsList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, eventsList, isSandbox]);

  // Primary Data Fetch
  useEffect(() => {
    let isMounted = true;
    const init = async () => {
      setLoading(true);
      setError(null);
      try {
        let currentMbrId = memberId;
        if (!currentMbrId) {
          const storedMbr = sessionStorage.getItem('sb_current_mbr');
          if (storedMbr) {
            try {
              const parsed = JSON.parse(storedMbr);
              if (parsed.mbrId) currentMbrId = parsed.mbrId;
            } catch {}
          }
        }
        if (!currentMbrId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr && !isSandbox) {
            try {
              const u = JSON.parse(userStr);
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id || u.id);
              if (mbrProfile && mbrProfile.mbrId) {
                currentMbrId = mbrProfile.mbrId;
              }
            } catch (e) {
              console.warn("Could not retrieve member profile ID from DB:", e);
            }
          }
        }
        if (!currentMbrId) {
          currentMbrId = '9edb4311-a4bc-428a-8317-833f0f08fea1';
        }
        if (isMounted) setMbrId(currentMbrId);

        // Fetch lookup codes for special event types and roles
        try {
          const [loadedTypes, loadedRoles] = await Promise.all([
            taskApi.getCds('specialEventTypeCd').catch(() => []),
            taskApi.getCds('specialEventRoleCd').catch(() => [])
          ]);
          if (Array.isArray(loadedTypes) && loadedTypes.length > 0 && isMounted) {
            setTypeCodes(loadedTypes);
          }
          if (Array.isArray(loadedRoles) && loadedRoles.length > 0 && isMounted) {
            setRoleCodes(loadedRoles);
          }
        } catch {
          // fallback to defaults
        }

        if (isSandbox) {
          const local = sessionStorage.getItem('sandbox_special_events');
          const data = local ? JSON.parse(local) : SANDBOX_SPECIAL_EVENTS;
          if (isMounted) {
            setEventsList(data);
            loadSubordinateCounts(currentMbrId, data);
          }
        } else {
          const records = await taskApi.getMemberSpecialEvents(currentMbrId);
          if (isMounted) {
            setEventsList(Array.isArray(records) ? records : []);
            loadSubordinateCounts(currentMbrId, records || []);
          }
        }
      } catch (err: any) {
        console.error("Error loading special events records:", err);
        if (isMounted) {
          setError(err.message || 'Failed to load special events records.');
          setEventsList(SANDBOX_SPECIAL_EVENTS);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [memberId, isSandbox, resolvedTopicId]);

  // Code helpers
  const getTypeCodeLabel = (cdVal?: string | null) => {
    if (!cdVal) return 'Celebration';
    const found = typeCodes.find(c => c.cdValue === cdVal);
    return found?.cdLabel || cdVal;
  };

  const getRoleCodeLabel = (cdVal?: string | null) => {
    if (!cdVal) return 'Honoree';
    const found = roleCodes.find(c => c.cdValue === cdVal);
    return found?.cdLabel || cdVal;
  };

  // --- SORT HANDLER ---
  const handleSort = (column: 'title' | 'type' | 'date') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  // Computed Sorted List
  const sortedEventsList = useMemo(() => {
    if (!Array.isArray(eventsList)) return [];
    return [...eventsList].sort((a, b) => {
      if (sortColumn === 'title') {
        const valA = (a.mbrSpecialEventTitle || '').toLowerCase();
        const valB = (b.mbrSpecialEventTitle || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortColumn === 'type') {
        const valA = (a.mbrSpecialEventTypeCd || '').toLowerCase();
        const valB = (b.mbrSpecialEventTypeCd || '').toLowerCase();
        return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      if (sortColumn === 'date') {
        const dateA = a.mbrSpecialEventDate || (a.mbrSpecialEventYear ? `${a.mbrSpecialEventYear}-01-01` : '0000-00-00');
        const dateB = b.mbrSpecialEventDate || (b.mbrSpecialEventYear ? `${b.mbrSpecialEventYear}-01-01` : '0000-00-00');
        return sortDirection === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
      return 0;
    });
  }, [eventsList, sortColumn, sortDirection]);

  // --- MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingEventId(null);
    setFormTitle('');
    setFormTypeCd('CELEBRATION');
    setFormRoleCd('HONOREE');
    setFormDate('');
    setFormEndDate('');
    setFormYear('');
    setFormLocation('');
    setFormKeyPeople('');
    setFormHighlights('');
    setFormDescription('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (item: MbrTopicSpecialEvent) => {
    setEditingEventId(item.mbrSpecialEventId);
    setFormTitle(item.mbrSpecialEventTitle || '');
    setFormTypeCd(item.mbrSpecialEventTypeCd || 'CELEBRATION');
    setFormRoleCd(item.mbrSpecialEventRoleCd || 'HONOREE');
    setFormDate(item.mbrSpecialEventDate || '');
    setFormEndDate(item.mbrSpecialEventEndDate || '');
    setFormYear(item.mbrSpecialEventYear ? String(item.mbrSpecialEventYear) : '');
    setFormLocation(item.mbrSpecialEventLocation || '');
    setFormKeyPeople(item.mbrSpecialEventKeyPeople || '');
    setFormHighlights(item.mbrSpecialEventHighlights || '');
    setFormDescription(item.mbrSpecialEventDescription || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Event Title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    try {
      const payload: Partial<MbrTopicSpecialEvent> = {
        mbrId,
        mbrSpecialEventTitle: formTitle.trim(),
        mbrSpecialEventTypeCd: formTypeCd || undefined,
        mbrSpecialEventRoleCd: formRoleCd || undefined,
        mbrSpecialEventDate: formDate || undefined,
        mbrSpecialEventEndDate: formEndDate || undefined,
        mbrSpecialEventYear: formYear ? parseInt(formYear, 10) : undefined,
        mbrSpecialEventLocation: formLocation.trim() || undefined,
        mbrSpecialEventKeyPeople: formKeyPeople.trim() || undefined,
        mbrSpecialEventHighlights: formHighlights.trim() || undefined,
        mbrSpecialEventDescription: formDescription.trim() || undefined
      };

      if (isSandbox) {
        if (editingEventId) {
          const updated = eventsList.map(item => 
            item.mbrSpecialEventId === editingEventId ? { ...item, ...payload } : item
          );
          setEventsList(updated);
          sessionStorage.setItem('sandbox_special_events', JSON.stringify(updated));
          setSuccessMsg('Special event updated successfully.');
        } else {
          const newRec: MbrTopicSpecialEvent = {
            mbrSpecialEventId: `event-${Date.now()}`,
            ...payload
          } as MbrTopicSpecialEvent;
          const updated = [newRec, ...eventsList];
          setEventsList(updated);
          sessionStorage.setItem('sandbox_special_events', JSON.stringify(updated));
          setSuccessMsg('Special event added successfully.');
        }
      } else {
        if (editingEventId) {
          await taskApi.updateSpecialEvent(editingEventId, payload);
          setSuccessMsg('Special event updated successfully.');
        } else {
          await taskApi.createSpecialEvent(payload);
          setSuccessMsg('Special event added successfully.');
        }
        const refreshed = await taskApi.getMemberSpecialEvents(mbrId);
        setEventsList(Array.isArray(refreshed) ? refreshed : []);
        loadSubordinateCounts(mbrId, refreshed || []);
      }

      setShowModal(false);
    } catch (err: any) {
      console.error("Error saving special event:", err);
      setModalError(err.message || 'Failed to save special event.');
    } finally {
      setSaving(false);
    }
  };

  const promptDeleteEvent = (item: MbrTopicSpecialEvent) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (isSandbox) {
        const updated = eventsList.filter(e => e.mbrSpecialEventId !== deleteTarget.mbrSpecialEventId);
        setEventsList(updated);
        sessionStorage.setItem('sandbox_special_events', JSON.stringify(updated));
        setSuccessMsg('Special event deleted successfully.');
      } else {
        await taskApi.deleteSpecialEvent(deleteTarget.mbrSpecialEventId);
        setSuccessMsg('Special event deleted successfully.');
        const refreshed = await taskApi.getMemberSpecialEvents(mbrId);
        setEventsList(Array.isArray(refreshed) ? refreshed : []);
        loadSubordinateCounts(mbrId, refreshed || []);
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("Error deleting special event:", err);
      setError(err.message || 'Failed to delete special event.');
    } finally {
      setDeleting(false);
    }
  };

  // Gallery Modal Handlers
  const handleOpenEventGallery = (record: MbrTopicSpecialEvent) => {
    setActiveGallerySubordinateId(record.mbrSpecialEventId);
    setActiveGalleryTitle(`Special Event: ${record.mbrSpecialEventTitle}`);
    setShowGalleryModal(true);
  };

  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Special Events & Milestones');
    setShowGalleryModal(true);
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-4 sm:py-5 px-2.5 sm:px-4 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-[#EFECE7]">
        {/* Left Side: Topic Title & Status Badge */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
            detail: { topicId: resolvedTopicId, chIntentId: resolvedChIntentId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents' }
          }))}
          className="flex items-center gap-2 sm:gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98 min-w-0"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2 sm:p-2.5 bg-amber-50/70 group-hover/topic:bg-amber-100/80 border border-amber-100 group-hover/topic:border-amber-200 text-amber-600 rounded-xl transition-all shadow-2xs shrink-0">
            <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block truncate">
              {headerStoryCount > 0 ? `Status: ${headerStoryCount} Stories` : 'Status: Draft'}
            </span>
            <span className="block font-serif text-base sm:text-lg font-bold text-slate-800 group-hover/topic:text-amber-600 transition-colors truncate">
              Special Events & Milestones
            </span>
          </div>
        </button>

        {/* Right Side: Add Button and Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              disabled={loading}
              className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Add Event</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {/* Desktop Expanded Icon Bar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Button with Count Badge */}
            <button
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-amber-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Special Events Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-amber-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-amber-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Storybook Icon Button with Count Badge */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                detail: { topicId: resolvedTopicId, chIntentId: resolvedChIntentId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents' }
              }))}
              className="relative p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={readOnly ? `View Member Stories${headerStoryCount > 0 ? ` (${headerStoryCount} stories)` : ''}` : `Story Editor${headerStoryCount > 0 ? ` (${headerStoryCount} stories)` : ''}`}
            >
              <BookOpen className="w-4 h-4 text-blue-500" />
              {headerStoryCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-amber-500 text-white rounded-full leading-none shadow-xs">
                  {headerStoryCount}
                </span>
              )}
            </button>

            {!readOnly && (
              <button
                onClick={() => setShowPrivacyModal(true)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                title="Privacy settings"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Top Panel Vertical Ellipsis Dropdown Menu */}
          <div className="sm:hidden relative inline-flex items-center event-header-menu-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHeaderMenu(!showHeaderMenu);
              }}
              className={`relative p-1.5 rounded-xl border transition-colors cursor-pointer ${
                showHeaderMenu
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
              {(headerPhotoCount > 0 || headerStoryCount > 0) && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" />
              )}
            </button>

            <AnimatePresence>
              {showHeaderMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-1.5 z-40 bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[165px] text-left divide-y divide-slate-100"
                >
                  <div className="py-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        handleOpenTopicGalleryModal();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Images className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-700">
                          {headerPhotoCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        window.dispatchEvent(new CustomEvent('open-story-editor', {
                          detail: { topicId: resolvedTopicId, chIntentId: resolvedChIntentId, topicTitle: 'Special Events', componentName: 'sbMbrStrySpecialEvents' }
                        }));
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>{readOnly ? 'View Stories' : 'Story Editor'}</span>
                      </div>
                      {headerStoryCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                          {headerStoryCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {!readOnly && (
                    <div className="py-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          setShowHeaderMenu(false);
                          setShowPrivacyModal(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer text-left"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-500 shrink-0" />
                        <span>Privacy Settings</span>
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* --- STATUS NOTIFICATIONS --- */}
      {error && (
        <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-3 sm:p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- SPECIAL EVENTS GRID / TABLE VIEW --- */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
          <span className="text-xs font-serif">Loading special events...</span>
        </div>
      ) : sortedEventsList.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#EFECE7] rounded-2xl bg-white/50">
          <PartyPopper className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="font-serif font-bold text-sm text-slate-700">No special events registered</h4>
          <p className="text-xs text-slate-400 font-serif max-w-sm mt-1 mb-4">
            {readOnly
              ? "This member hasn't added any milestone celebrations or special events yet."
              : "Document weddings, milestone birthdays, anniversaries, graduations, and memorable gatherings."}
          </p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Special Event</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[#EFECE7] rounded-2xl bg-white shadow-xs overflow-hidden w-full max-w-full">
          <div className="max-h-[320px] overflow-y-auto overflow-x-hidden rounded-t-2xl w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  {/* Event & Details Column */}
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 align-bottom w-[42%] sm:w-[38%] rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('title')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Event & Details</span>
                      {sortColumn === 'title' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Dates / Period Column */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[32%] sm:w-[28%] text-left">
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Date / Period</span>
                      {sortColumn === 'date' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Type Column */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[14%] sm:w-[16%]">
                    <button
                      type="button"
                      onClick={() => handleSort('type')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Type</span>
                      {sortColumn === 'type' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Actions Column */}
                  <th className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right align-bottom w-[12%] sm:w-[18%] rounded-tr-2xl">
                    <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedEventsList.map((item, idx) => {
                  const photoCount = eventPhotosMap[item.mbrSpecialEventId] || 0;
                  const hasContent = photoCount > 0;
                  const hasDateRange = !!item.mbrSpecialEventEndDate;

                  return (
                    <tr
                      key={item.mbrSpecialEventId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Event Title & Details */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                            <PartyPopper className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                              {item.mbrSpecialEventTitle}
                            </span>
                            <span className="text-[10px] text-slate-500 font-serif font-medium truncate leading-tight">
                              {getRoleCodeLabel(item.mbrSpecialEventRoleCd)}
                              {item.mbrSpecialEventLocation && ` • ${item.mbrSpecialEventLocation}`}
                            </span>
                            {hasContent && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {photoCount > 0 && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70"
                                    title={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} available`}
                                  >
                                    <Images className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                    <span>{photoCount}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Period Range Stacked: To on top, From underneath, colons right-justified */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        {hasDateRange ? (
                          <div className="flex flex-col min-w-0 font-mono text-[9px] sm:text-[10px] leading-snug text-slate-700">
                            <div className="flex items-center truncate">
                              <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                                To:
                              </span>
                              <span className="font-semibold truncate">
                                {formatMonYear(item.mbrSpecialEventEndDate)}
                              </span>
                            </div>
                            <div className="flex items-center truncate mt-0.5">
                              <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                                From:
                              </span>
                              <span className="font-semibold truncate">
                                {formatMonYear(item.mbrSpecialEventDate) || item.mbrSpecialEventYear || '—'}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col min-w-0 font-mono text-[9px] sm:text-[10px] leading-snug text-slate-700">
                            <div className="flex items-center truncate">
                              <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                                Date:
                              </span>
                              <span className="font-semibold truncate text-slate-800">
                                {item.mbrSpecialEventDate ? formatMonYear(item.mbrSpecialEventDate) : (item.mbrSpecialEventYear ? String(item.mbrSpecialEventYear) : '—')}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold border rounded-full uppercase tracking-wider truncate max-w-full font-mono ${getTypeBadgeStyle(item.mbrSpecialEventTypeCd)}`}>
                          {getTypeCodeLabel(item.mbrSpecialEventTypeCd)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right">
                        {/* Desktop Action Icons */}
                        <div className="hidden sm:inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEventGallery(item)}
                            title={`Photo Gallery for ${item.mbrSpecialEventTitle}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Images className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-amber-600' : ''}`} />
                            {photoCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-amber-600 text-white rounded-full leading-none shadow-xs">
                                {photoCount}
                              </span>
                            )}
                          </button>

                          {!readOnly && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(item)}
                                title="Edit Special Event"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteEvent(item)}
                                title="Delete Special Event"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end event-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === item.mbrSpecialEventId ? null : item.mbrSpecialEventId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === item.mbrSpecialEventId
                                ? 'bg-amber-100 text-amber-700'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                            {hasContent && (
                              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-amber-600 ring-2 ring-white" />
                            )}
                          </button>

                          <AnimatePresence>
                            {activeActionMenuId === item.mbrSpecialEventId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedEventsList.length - 2 && sortedEventsList.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[145px] text-left divide-y divide-slate-100 ${
                                  idx >= sortedEventsList.length - 2 && sortedEventsList.length > 2 ? 'bottom-full mb-1' : 'top-full mt-1'
                                }`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenEventGallery(item);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Photos</span>
                                    </div>
                                    {photoCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                        {photoCount}
                                      </span>
                                    )}
                                  </button>
                                </div>

                                {!readOnly && (
                                  <div className="py-0.5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        handleOpenEditModal(item);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                                      <span>Edit Event</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDeleteEvent(item);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      <span>Delete Event</span>
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- ADD / EDIT SPECIAL EVENT MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl border border-slate-100 flex flex-col max-h-[90vh] overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <PartyPopper className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif font-bold text-base text-slate-800">
                    {editingEventId ? 'Edit Special Event' : 'Add Special Event'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleSaveModal} className="overflow-y-auto flex-1 py-4 space-y-3.5 text-xs">
                {modalError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Event Title */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Event Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Golden Wedding Anniversary, Stanford Graduation"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                  />
                </div>

                {/* Event Type & Role */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Event Type
                    </label>
                    <select
                      value={formTypeCd}
                      onChange={(e) => setFormTypeCd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                    >
                      {typeCodes.map((code) => (
                        <option key={code.cdValue} value={code.cdValue}>
                          {code.cdLabel || code.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Your Role
                    </label>
                    <select
                      value={formRoleCd}
                      onChange={(e) => setFormRoleCd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                    >
                      {roleCodes.map((code) => (
                        <option key={code.cdValue} value={code.cdValue}>
                          {code.cdLabel || code.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Timeline Dates & Approximate Year */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Start / Event Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      End Date (Optional)
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Approximate Year
                    </label>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="e.g. 2024"
                      min="1900"
                      max="2099"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Location & Key People */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Location / Venue
                    </label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. The Benson Hotel, Portland, OR"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                    />
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Key People Present
                    </label>
                    <input
                      type="text"
                      value={formKeyPeople}
                      onChange={(e) => setFormKeyPeople(e.target.value)}
                      placeholder="e.g. Family, friends, mentors"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                    />
                  </div>
                </div>

                {/* Event Highlights */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Key Highlights / Speeches / Moments
                  </label>
                  <input
                    type="text"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    placeholder="e.g. Golden jubilee celebration with retrospective video toast"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif"
                  />
                </div>

                {/* Description & Reflections */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Event Narrative / Memory Notes
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Describe how the event felt, memorable toasts, who attended, and why it stands out in your life story..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-serif resize-none"
                  />
                </div>

                {/* Form Action Buttons */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition disabled:opacity-50 cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingEventId ? 'Update Event' : 'Save Event'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-slate-100 text-center space-y-4"
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-serif font-bold text-base text-slate-900">Delete Special Event?</h4>
                <p className="text-xs text-slate-500 mt-1 font-serif">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">"{deleteTarget.mbrSpecialEventTitle}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  disabled={deleting}
                  className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                >
                  {deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- PHOTO GALLERY MODAL --- */}
      <AnimatePresence>
        {showGalleryModal && (
          <MbrPhotoGalleryPanel
            isOpen={showGalleryModal}
            onClose={() => {
              setShowGalleryModal(false);
              loadSubordinateCounts(mbrId, eventsList);
            }}
            mbrId={mbrId}
            categoryCd={resolvedTopicId}
            categoryTitle={activeGalleryTitle || "Special Events"}
            isSandbox={Boolean(isSandbox)}
            subordinateId={activeGallerySubordinateId || undefined}
          />
        )}
      </AnimatePresence>

      {/* --- PRIVACY MODAL --- */}
      <AnimatePresence>
        {showPrivacyModal && (
          <MbrTopicPrivacyModal
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
            mbrId={mbrId}
            topicId={resolvedTopicId}
            topicName="Special Events"
            isSandbox={Boolean(isSandbox)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export { MbrStorySpecialEventsPanel, MbrStorySpecialEventsPanel as mbrStorySpecialEventsPanel, MbrStorySpecialEventsPanel as SbMbrStrySpecialEvents };
