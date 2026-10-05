/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Plane, Trash2, Edit3, X, Plus, Loader2, 
  AlertCircle, CheckCircle2, ShieldAlert, Images, 
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, MapPin, Calendar,
  Compass, Users, Car, Ship, Train, Bus, Bike
} from 'lucide-react';
import { 
  taskApi, 
  MbrTopicTrip, 
  DEFAULT_TOPIC_LOOKUP, 
  Cd 
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryTripsPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
  topicId?: string;
  chIntentId?: string;
}

export type SbMbrStryTripsProps = MbrStoryTripsPanelProps;

const SANDBOX_TRIPS: MbrTopicTrip[] = [
  {
    mbrTripId: 'trip-1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrTripTitle: 'Grand European Adventure',
    mbrTripTypeCd: 'VACATION',
    mbrTripDestination: 'London, Paris, Lucerne & Rome',
    mbrTripLocation: 'United Kingdom, France, Switzerland, Italy',
    mbrTripStartDate: '1974-06-15',
    mbrTripEndDate: '1974-07-10',
    mbrTripYear: 1974,
    mbrTripDurationDays: 25,
    mbrTripCompanions: 'Artie Pendleton & Sarah Jenkins',
    mbrTripModeOfTravelCd: 'FLIGHT',
    mbrTripHighlights: 'First transatlantic flight, visiting the Louvre museum at twilight, and a train ride through the Swiss Alps.',
    mbrTripDescription: 'Our post-graduation backpack journey across Europe. We stayed in youth hostels, navigated trains with Eurail passes, and made lifelong memories in historic cafes.'
  },
  {
    mbrTripId: 'trip-2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrTripTitle: 'Pacific Coast Highway Road Trip',
    mbrTripTypeCd: 'ROAD_TRIP',
    mbrTripDestination: 'Highway 1 - San Francisco to Big Sur',
    mbrTripLocation: 'California, USA',
    mbrTripStartDate: '1985-08-10',
    mbrTripEndDate: '1985-08-20',
    mbrTripYear: 1985,
    mbrTripDurationDays: 10,
    mbrTripCompanions: 'Eleanor, Michael & kids',
    mbrTripModeOfTravelCd: 'CAR',
    mbrTripHighlights: 'Driving the scenic Bixby Bridge, camping under the giant redwoods, and watching sea otters in Monterey Bay.',
    mbrTripDescription: 'A classic summer road trip in our station wagon packed with camping gear. Beautiful coastal sunsets and family campfire stories every night.'
  },
  {
    mbrTripId: 'trip-3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrTripTitle: 'Alaska Inside Passage Cruise',
    mbrTripTypeCd: 'CRUISE',
    mbrTripDestination: 'Juneau, Skagway & Glacier Bay',
    mbrTripLocation: 'Alaska, USA',
    mbrTripStartDate: '2002-07-04',
    mbrTripEndDate: '2002-07-14',
    mbrTripYear: 2002,
    mbrTripDurationDays: 10,
    mbrTripCompanions: 'Eleanor & close friends',
    mbrTripModeOfTravelCd: 'CRUISE_SHIP',
    mbrTripHighlights: 'Whale watching in Icy Strait, viewing dramatic glacier calving in Glacier Bay, and the historic White Pass railway.',
    mbrTripDescription: 'Celebrated our wedding anniversary with an awe-inspiring voyage along the Alaskan coast. Unforgettable wildlife sightings and crisp glacial air.'
  }
];

const DEFAULT_TRIP_TYPE_CODES: Partial<Cd>[] = [
  { cdValue: 'VACATION', cdLabel: 'Vacation / Holiday', cdDesc: 'Leisure trip or holiday vacation', cdSortOrder: 1 },
  { cdValue: 'ROAD_TRIP', cdLabel: 'Road Trip', cdDesc: 'Driving road trip or overland journey', cdSortOrder: 2 },
  { cdValue: 'CRUISE', cdLabel: 'Cruise / Sea Voyage', cdDesc: 'Ocean or river cruise', cdSortOrder: 3 },
  { cdValue: 'ADVENTURE', cdLabel: 'Adventure / Camping', cdDesc: 'Outdoor adventure, hiking, or camping', cdSortOrder: 4 },
  { cdValue: 'FAMILY_TRIP', cdLabel: 'Family Trip / Reunion', cdDesc: 'Family vacation or gathering', cdSortOrder: 5 },
  { cdValue: 'WEEKEND_GETAWAY', cdLabel: 'Weekend Getaway', cdDesc: 'Short trip or city break', cdSortOrder: 6 },
  { cdValue: 'PILGRIMAGE', cdLabel: 'Pilgrimage / Heritage', cdDesc: 'Ancestral or spiritual journey', cdSortOrder: 7 },
  { cdValue: 'BUSINESS', cdLabel: 'Business / Work Trip', cdDesc: 'Work-related or conference travel', cdSortOrder: 8 },
  { cdValue: 'STUDY_ABROAD', cdLabel: 'Study / Exchange', cdDesc: 'Academic study or exchange tour', cdSortOrder: 9 },
  { cdValue: 'OTHER', cdLabel: 'Other Travel', cdDesc: 'Other trip or expedition', cdSortOrder: 10 }
];

const DEFAULT_TRAVEL_MODE_CODES: Partial<Cd>[] = [
  { cdValue: 'FLIGHT', cdLabel: 'Airplane / Flight', cdDesc: 'Air travel', cdSortOrder: 1 },
  { cdValue: 'CAR', cdLabel: 'Car / Automobile', cdDesc: 'Personal car or rental', cdSortOrder: 2 },
  { cdValue: 'CRUISE_SHIP', cdLabel: 'Cruise Ship / Boat', cdDesc: 'Ship, ferry, or boat', cdSortOrder: 3 },
  { cdValue: 'TRAIN', cdLabel: 'Train / Rail', cdDesc: 'Train or passenger rail', cdSortOrder: 4 },
  { cdValue: 'RV', cdLabel: 'RV / Camper', cdDesc: 'Recreational vehicle or motorhome', cdSortOrder: 5 },
  { cdValue: 'BUS', cdLabel: 'Bus / Coach', cdDesc: 'Tour bus or motor coach', cdSortOrder: 6 },
  { cdValue: 'MOTORCYCLE', cdLabel: 'Motorcycle / Bike', cdDesc: 'Motorcycle or bicycle tour', cdSortOrder: 7 },
  { cdValue: 'MULTI_MODAL', cdLabel: 'Multi-Modal / Mixed', cdDesc: 'Combination of multiple travel modes', cdSortOrder: 8 }
];

export default function MbrStoryTripsPanel({
  isSandbox = false,
  memberId,
  readOnly = false,
  topicId = DEFAULT_TOPIC_LOOKUP.trips?.topicId || '5cd2052b-28fc-434f-9ce4-4358ff944576',
  chIntentId = DEFAULT_TOPIC_LOOKUP.trips?.chIntentId || '5cd2052b-28fc-434f-9ce4-4358ff944576'
}: MbrStoryTripsPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [tripList, setTripList] = useState<MbrTopicTrip[]>([]);
  const [typeCodes, setTypeCodes] = useState<Partial<Cd>[]>(DEFAULT_TRIP_TYPE_CODES);
  const [modeCodes, setModeCodes] = useState<Partial<Cd>[]>(DEFAULT_TRAVEL_MODE_CODES);

  // --- MODAL FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingTripId, setEditingTripId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTypeCd, setFormTypeCd] = useState('VACATION');
  const [formDestination, setFormDestination] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formYear, setFormYear] = useState<string>('');
  const [formDurationDays, setFormDurationDays] = useState<string>('');
  const [formCompanions, setFormCompanions] = useState('');
  const [formModeOfTravelCd, setFormModeOfTravelCd] = useState('FLIGHT');
  const [formHighlights, setFormHighlights] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteTarget, setDeleteTarget] = useState<MbrTopicTrip | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- PHOTO GALLERY STATE ---
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState<string>('Trips and Vacations');

  // --- PRIVACY MODAL STATE ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- PHOTO COUNTS MAP ---
  const [tripPhotosMap, setTripPhotosMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);

  // --- MOBILE ACTION DROPDOWN STATE ---
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // --- SORTING STATE ---
  type SortColumn = 'title' | 'type' | 'destination' | 'startDate' | 'year';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!activeActionMenuId && !showHeaderMenu) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.trip-action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!target.closest('.trip-header-menu-container')) {
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

  // Load photo count badges for trips
  const loadSubordinateCounts = async (targetMbrId: string, currentTrips: MbrTopicTrip[]) => {
    try {
      if (isSandbox) {
        setHeaderPhotoCount(0);
        setTripPhotosMap({});
        return;
      }
      const mediaList: any[] = await taskApi.getMemberMedia(targetMbrId).catch(() => []);
      if (Array.isArray(mediaList)) {
        const photoMap: Record<string, number> = {};
        let headerPhotos = 0;

        mediaList.forEach((m) => {
          const category = (m.mbrMediaCategoryCd || '').toLowerCase();
          if (category.includes('trip') || category.includes('vacation') || category.includes('travel')) {
            headerPhotos++;
            if (m.mbrMediaSubordinateId) {
              photoMap[m.mbrMediaSubordinateId] = (photoMap[m.mbrMediaSubordinateId] || 0) + 1;
            }
          }
        });

        setHeaderPhotoCount(headerPhotos);
        setTripPhotosMap(photoMap);
      }
    } catch {
      // Graceful fallback
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, tripList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, tripList, isSandbox]);

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

        // Fetch lookup codes for trip types & modes of travel
        try {
          const [tripTypes, travelModes] = await Promise.all([
            taskApi.getCds('tripTypeCd').catch(() => []),
            taskApi.getCds('tripModeOfTravelCd').catch(() => [])
          ]);
          if (Array.isArray(tripTypes) && tripTypes.length > 0 && isMounted) {
            setTypeCodes(tripTypes);
          }
          if (Array.isArray(travelModes) && travelModes.length > 0 && isMounted) {
            setModeCodes(travelModes);
          }
        } catch {
          // fallback to defaults
        }

        if (isSandbox) {
          const local = sessionStorage.getItem('sandbox_trips');
          const data = local ? JSON.parse(local) : SANDBOX_TRIPS;
          if (isMounted) {
            setTripList(data);
            loadSubordinateCounts(currentMbrId, data);
          }
        } else {
          try {
            const dbData = await taskApi.getMemberTrips(currentMbrId);
            if (isMounted) {
              let list = Array.isArray(dbData) ? dbData : [];
              if (list.length === 0 && (currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1' || memberId === 'm1')) {
                list = SANDBOX_TRIPS;
              }
              setTripList(list);
              loadSubordinateCounts(currentMbrId, list);
            }
          } catch (err: any) {
            if (isMounted) {
              if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1' || err.message?.includes('Parent member profile not found')) {
                console.warn("Falling back to sandbox trips due to unseeded parent member:", err);
                const local = sessionStorage.getItem('sandbox_trips');
                const data = local ? JSON.parse(local) : SANDBOX_TRIPS;
                setTripList(data);
                loadSubordinateCounts(currentMbrId, data);
              } else {
                setError(`Failed to load trips: ${err.message || err}`);
              }
            }
          }
        }
      } catch (err: any) {
        if (isMounted) setError(`Failed to load trips: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [isSandbox, memberId]);

  const getTypeLabel = (cdVal?: string | null) => {
    if (!cdVal) return 'Vacation';
    const found = typeCodes.find(
      (c) => c?.cdValue?.toLowerCase() === cdVal?.toLowerCase()
    );
    return found?.cdLabel || found?.cdValue || cdVal;
  };

  const getModeLabel = (cdVal?: string | null) => {
    if (!cdVal) return '';
    const found = modeCodes.find(
      (c) => c?.cdValue?.toLowerCase() === cdVal?.toLowerCase()
    );
    return found?.cdLabel || found?.cdValue || cdVal;
  };

  const getModeIcon = (cdVal?: string | null) => {
    const val = (cdVal || '').toUpperCase();
    if (val.includes('FLIGHT') || val.includes('AIR')) return <Plane className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
    if (val.includes('CAR') || val.includes('AUTO') || val.includes('DRIVE')) return <Car className="w-3.5 h-3.5 text-amber-600 shrink-0" />;
    if (val.includes('CRUISE') || val.includes('BOAT') || val.includes('SHIP')) return <Ship className="w-3.5 h-3.5 text-blue-600 shrink-0" />;
    if (val.includes('TRAIN') || val.includes('RAIL')) return <Train className="w-3.5 h-3.5 text-indigo-600 shrink-0" />;
    if (val.includes('BUS') || val.includes('COACH')) return <Bus className="w-3.5 h-3.5 text-emerald-600 shrink-0" />;
    if (val.includes('BIKE') || val.includes('MOTORCYCLE')) return <Bike className="w-3.5 h-3.5 text-orange-600 shrink-0" />;
    return <Compass className="w-3.5 h-3.5 text-sky-600 shrink-0" />;
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedTrips = useMemo(() => {
    if (!Array.isArray(tripList)) return [];
    if (!sortColumn) {
      // Default sort: start date / year desc, then title
      return [...tripList].sort((a, b) => {
        const dtA = a.mbrTripStartDate || (a.mbrTripYear ? `${a.mbrTripYear}-01-01` : '');
        const dtB = b.mbrTripStartDate || (b.mbrTripYear ? `${b.mbrTripYear}-01-01` : '');
        if (dtA !== dtB) return dtB.localeCompare(dtA);
        const titleA = (a.mbrTripTitle || '').toLowerCase();
        const titleB = (b.mbrTripTitle || '').toLowerCase();
        return titleA.localeCompare(titleB);
      });
    }

    return [...tripList].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'title') {
        comparison = (a.mbrTripTitle || '').trim().localeCompare((b.mbrTripTitle || '').trim());
      } else if (sortColumn === 'type') {
        const typeA = getTypeLabel(a.mbrTripTypeCd).toLowerCase();
        const typeB = getTypeLabel(b.mbrTripTypeCd).toLowerCase();
        comparison = typeA.localeCompare(typeB);
      } else if (sortColumn === 'destination') {
        const destA = (a.mbrTripDestination || a.mbrTripLocation || '').toLowerCase();
        const destB = (b.mbrTripDestination || b.mbrTripLocation || '').toLowerCase();
        comparison = destA.localeCompare(destB);
      } else if (sortColumn === 'startDate') {
        const dateA = a.mbrTripStartDate || '';
        const dateB = b.mbrTripStartDate || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortColumn === 'year') {
        const yrA = a.mbrTripYear || (a.mbrTripStartDate ? parseInt(a.mbrTripStartDate.split('-')[0]) : 0);
        const yrB = b.mbrTripYear || (b.mbrTripStartDate ? parseInt(b.mbrTripStartDate.split('-')[0]) : 0);
        comparison = yrA - yrB;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [tripList, sortColumn, sortDirection, typeCodes]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingTripId(null);
    setFormTitle('');
    setFormTypeCd(typeCodes[0]?.cdValue || 'VACATION');
    setFormDestination('');
    setFormLocation('');
    setFormStartDate('');
    setFormEndDate('');
    setFormYear('');
    setFormDurationDays('');
    setFormCompanions('');
    setFormModeOfTravelCd(modeCodes[0]?.cdValue || 'FLIGHT');
    setFormHighlights('');
    setFormDescription('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (trip: MbrTopicTrip) => {
    setEditingTripId(trip.mbrTripId);
    setFormTitle(trip.mbrTripTitle || '');
    setFormTypeCd(trip.mbrTripTypeCd || 'VACATION');
    setFormDestination(trip.mbrTripDestination || '');
    setFormLocation(trip.mbrTripLocation || '');
    setFormStartDate(trip.mbrTripStartDate ? trip.mbrTripStartDate.split('T')[0] : '');
    setFormEndDate(trip.mbrTripEndDate ? trip.mbrTripEndDate.split('T')[0] : '');
    setFormYear(trip.mbrTripYear ? String(trip.mbrTripYear) : '');
    setFormDurationDays(trip.mbrTripDurationDays ? String(trip.mbrTripDurationDays) : '');
    setFormCompanions(trip.mbrTripCompanions || '');
    setFormModeOfTravelCd(trip.mbrTripModeOfTravelCd || 'FLIGHT');
    setFormHighlights(trip.mbrTripHighlights || '');
    setFormDescription(trip.mbrTripDescription || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Trip title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    let parsedYear: number | undefined = undefined;
    if (formYear.trim()) {
      const y = parseInt(formYear.trim(), 10);
      if (!isNaN(y)) parsedYear = y;
    } else if (formStartDate.trim()) {
      const y = parseInt(formStartDate.split('-')[0], 10);
      if (!isNaN(y)) parsedYear = y;
    }

    let parsedDays: number | undefined = undefined;
    if (formDurationDays.trim()) {
      const d = parseInt(formDurationDays.trim(), 10);
      if (!isNaN(d)) parsedDays = d;
    }

    const payload: Partial<MbrTopicTrip> = {
      mbrId,
      mbrTripTitle: formTitle.trim(),
      mbrTripTypeCd: formTypeCd,
      mbrTripDestination: formDestination.trim() || undefined,
      mbrTripLocation: formLocation.trim() || undefined,
      mbrTripStartDate: formStartDate.trim() || undefined,
      mbrTripEndDate: formEndDate.trim() || undefined,
      mbrTripYear: parsedYear,
      mbrTripDurationDays: parsedDays,
      mbrTripCompanions: formCompanions.trim() || undefined,
      mbrTripModeOfTravelCd: formModeOfTravelCd || undefined,
      mbrTripHighlights: formHighlights.trim() || undefined,
      mbrTripDescription: formDescription.trim() || undefined
    };

    try {
      if (isSandbox) {
        let nextList: MbrTopicTrip[];
        if (editingTripId) {
          nextList = tripList.map((t) =>
            t.mbrTripId === editingTripId ? { ...t, ...payload } : t
          );
          setSuccessMsg('Trip updated successfully!');
        } else {
          const newEntry: MbrTopicTrip = {
            mbrTripId: `trip-${Date.now()}`,
            ...payload as any
          };
          nextList = [...tripList, newEntry];
          setSuccessMsg('Trip added successfully!');
        }
        setTripList(nextList);
        sessionStorage.setItem('sandbox_trips', JSON.stringify(nextList));
        setShowModal(false);
      } else {
        if (editingTripId) {
          await taskApi.updateTrip(editingTripId, payload);
          setSuccessMsg('Trip updated successfully!');
        } else {
          await taskApi.createTrip(payload);
          setSuccessMsg('Trip added successfully!');
        }
        setShowModal(false);
        const refreshed = await taskApi.getMemberTrips(mbrId);
        setTripList(Array.isArray(refreshed) ? refreshed : []);
      }
    } catch (err: any) {
      setModalError(`Failed to save trip: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (trip: MbrTopicTrip) => {
    setDeleteTarget(trip);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTarget.mbrTripId;

    try {
      if (isSandbox) {
        const nextList = tripList.filter((t) => t.mbrTripId !== targetId);
        setTripList(nextList);
        sessionStorage.setItem('sandbox_trips', JSON.stringify(nextList));
        setSuccessMsg('Trip deleted successfully!');
      } else {
        await taskApi.deleteTrip(targetId);
        const refreshed = await taskApi.getMemberTrips(mbrId);
        setTripList(Array.isArray(refreshed) ? refreshed : []);
        setSuccessMsg('Trip deleted successfully!');
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setError(`Failed to delete trip: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Photo Gallery Handlers
  const handleOpenTripsGallery = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Trips and Vacations');
    setShowGalleryModal(true);
  };

  const handleOpenTripGallery = (trip: MbrTopicTrip) => {
    setActiveGallerySubordinateId(trip.mbrTripId);
    setActiveGalleryTitle(`Trips (${trip.mbrTripTitle})`);
    setShowGalleryModal(true);
  };

  const formatYearOrDate = (dtStr?: string | null, yr?: number | null) => {
    if (dtStr) {
      const parts = dtStr.split('T')[0].split('-');
      if (parts.length >= 3) {
        return `${parts[1]}/${parts[2]}/${parts[0]}`;
      }
      return dtStr;
    }
    if (yr) return String(yr);
    return '';
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-4 sm:py-5 px-2.5 sm:px-4 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-teal-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
            detail: { topicId, chIntentId, topicTitle: 'Trips and Vacations', componentName: 'sbMbrStryTrips' }
          }))}
          className="flex items-center gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2.5 bg-sky-50/70 group-hover/topic:bg-sky-100/80 border border-sky-100 group-hover/topic:border-sky-200 text-sky-600 rounded-xl transition-all shadow-2xs">
            <Plane className="w-5 h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <span className="block font-serif text-lg font-bold text-slate-800 group-hover/topic:text-sky-600 transition-colors">
            Trips and Vacations
          </span>
        </button>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-sky-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Trip</span>
            </button>
          )}

          {/* Desktop Action Icons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Icon Button */}
            <button
              onClick={handleOpenTripsGallery}
              className="relative p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Trips Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-sky-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-sky-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Privacy Modal Button */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="p-2 text-slate-400 hover:text-sky-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Trips Privacy Settings"
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Mobile Actions Dropdown Trigger */}
          <div className="sm:hidden relative inline-flex items-center trip-header-menu-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHeaderMenu(!showHeaderMenu);
              }}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              aria-label="More Actions"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            <AnimatePresence>
              {showHeaderMenu && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.12 }}
                  className="absolute right-0 top-full mt-2 z-30 bg-white border border-[#EFECE7] rounded-2xl shadow-xl py-1.5 min-w-[160px] text-left divide-y divide-slate-100 font-sans"
                >
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        handleOpenTripsGallery();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Images className="w-4 h-4 text-sky-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-100 text-sky-700">
                          {headerPhotoCount}
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
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

      {/* --- NOTIFICATIONS BANNER --- */}
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-4 rounded-xl flex items-start gap-2.5"
          >
            <AlertCircle className="w-4.5 h-4.5 text-rose-500 shrink-0 mt-0.5" />
            <div className="text-xs font-medium flex-grow">{error}</div>
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
        {successMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 p-4 rounded-xl flex items-start gap-2.5"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs font-medium flex-grow">{successMsg}</div>
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT WORKSPACE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading trips and vacations...</span>
        </div>
      ) : tripList.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
          <Plane className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-serif text-slate-500 italic">No trips or vacations recorded yet.</p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Trip
            </button>
          )}
        </div>
      ) : (
        /* TRIPS TABLE VIEW */
        <div className="border border-[#EFECE7] rounded-2xl bg-white shadow-xs overflow-hidden">
          <div className="max-h-[360px] overflow-y-auto overflow-x-hidden sm:overflow-x-auto rounded-t-2xl">
            <table className="w-full text-left border-collapse table-fixed sm:table-auto">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 align-bottom w-[42%] sm:w-auto rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('title')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Trip & Destination</span>
                      {sortColumn === 'title' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[24%] sm:w-auto">
                    <button
                      type="button"
                      onClick={() => handleSort('type')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Type & Date</span>
                      {sortColumn === 'type' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[22%] sm:w-auto hidden md:table-cell">
                    <span className="font-serif font-bold text-slate-500 uppercase tracking-wider text-[10px] sm:text-[11px]">
                      Companions
                    </span>
                  </th>
                  <th className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right align-bottom w-[12%] sm:w-auto rounded-tr-2xl">
                    <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedTrips.map((trip, idx) => {
                  const photoCount = tripPhotosMap[trip.mbrTripId] || 0;
                  const hasContent = photoCount > 0;
                  const yearDisplay = trip.mbrTripYear || (trip.mbrTripStartDate ? trip.mbrTripStartDate.split('-')[0] : '');

                  return (
                    <tr
                      key={trip.mbrTripId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Trip Title + Destination + Highlights */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-sky-50 border border-sky-200/80 flex items-center justify-center text-sky-700 shrink-0">
                            {getModeIcon(trip.mbrTripModeOfTravelCd)}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                                {trip.mbrTripTitle}
                              </span>
                            </div>
                            {(trip.mbrTripDestination || trip.mbrTripLocation) && (
                              <div className="flex items-center gap-1 text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                <MapPin className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate">
                                  {trip.mbrTripDestination || trip.mbrTripLocation}
                                </span>
                              </div>
                            )}
                            {trip.mbrTripHighlights && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">
                                {trip.mbrTripHighlights}
                              </p>
                            )}
                            {hasContent && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-sky-50 text-sky-800 border border-sky-200/70"
                                  title={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} available`}
                                >
                                  <Images className="w-2.5 h-2.5 text-sky-600 shrink-0" />
                                  <span>{photoCount}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Trip Type & Date */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold bg-sky-50 text-sky-700 border border-sky-100/70 rounded-full uppercase tracking-wider truncate max-w-full">
                            {getTypeLabel(trip.mbrTripTypeCd)}
                          </span>
                          {yearDisplay && (
                            <span className="text-[9.5px] font-mono text-slate-400">
                              {trip.mbrTripStartDate ? formatYearOrDate(trip.mbrTripStartDate, trip.mbrTripYear) : yearDisplay}
                              {trip.mbrTripDurationDays ? ` (${trip.mbrTripDurationDays}d)` : ''}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Companions */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2 hidden md:table-cell">
                        {trip.mbrTripCompanions ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[180px]">
                            <Users className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{trip.mbrTripCompanions}</span>
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right">
                        {/* Desktop Expanded Action Icons */}
                        <div className="hidden sm:inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenTripGallery(trip)}
                            title={`Photo Gallery for ${trip.mbrTripTitle}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Images className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-sky-600' : ''}`} />
                            {photoCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-sky-600 text-white rounded-full leading-none shadow-xs">
                                {photoCount}
                              </span>
                            )}
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(trip)}
                                title="Edit Trip"
                                className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promptDelete(trip)}
                                title="Delete Trip"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end trip-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === trip.mbrTripId ? null : trip.mbrTripId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === trip.mbrTripId
                                ? 'bg-sky-100 text-sky-700'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                            {hasContent && (
                              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-sky-600 ring-2 ring-white" />
                            )}
                          </button>

                          <AnimatePresence>
                            {activeActionMenuId === trip.mbrTripId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedTrips.length - 2 && sortedTrips.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 ${
                                  idx >= sortedTrips.length - 2 && sortedTrips.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenTripGallery(trip);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-sky-600 shrink-0" />
                                      <span>Photo Gallery</span>
                                    </div>
                                    {photoCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-sky-100 text-sky-700">
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
                                        handleOpenEditModal(trip);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Edit Trip</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDelete(trip);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Delete Trip</span>
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

      {/* --- ADD / EDIT TRIP MODAL --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#EFECE7] flex flex-col gap-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                    <Plane className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-slate-800">
                    {editingTripId ? 'Edit Trip' : 'Add Trip'}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {modalError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-xl text-xs font-medium">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleSaveModal} className="flex flex-col gap-4">
                {/* Trip Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">Trip Title *</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Grand European Adventure, Route 66 Road Trip"
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Trip Type & Mode of Travel */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Trip Type *</label>
                    <select
                      value={formTypeCd}
                      onChange={(e) => setFormTypeCd(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                      required
                    >
                      {typeCodes.map((c) => (
                        <option key={c.cdValue} value={c.cdValue}>
                          {c.cdLabel || c.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Mode of Travel</label>
                    <select
                      value={formModeOfTravelCd}
                      onChange={(e) => setFormModeOfTravelCd(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    >
                      {modeCodes.map((c) => (
                        <option key={c.cdValue} value={c.cdValue}>
                          {c.cdLabel || c.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Destination & Location/Region */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Destination / Cities / Route</label>
                    <input
                      type="text"
                      value={formDestination}
                      onChange={(e) => setFormDestination(e.target.value)}
                      placeholder="e.g. Paris, Lucerne & Rome"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Country / State / Region</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      placeholder="e.g. Western Europe, California"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Dates & Year */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="flex flex-col gap-1.5 sm:col-span-2">
                    <label className="text-xs font-bold text-slate-700 font-serif">Start Date</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => {
                        setFormStartDate(e.target.value);
                        if (e.target.value && !formYear) {
                          setFormYear(e.target.value.split('-')[0]);
                        }
                      }}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Year</label>
                    <input
                      type="number"
                      value={formYear}
                      onChange={(e) => setFormYear(e.target.value)}
                      placeholder="e.g. 1974"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Days</label>
                    <input
                      type="number"
                      value={formDurationDays}
                      onChange={(e) => setFormDurationDays(e.target.value)}
                      placeholder="e.g. 14"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                    />
                  </div>
                </div>

                {/* Travel Companions */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">Travel Companions</label>
                  <input
                    type="text"
                    value={formCompanions}
                    onChange={(e) => setFormCompanions(e.target.value)}
                    placeholder="e.g. Eleanor, Artie Pendleton & friends"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Highlights */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">Highlights & Memorable Moments</label>
                  <input
                    type="text"
                    value={formHighlights}
                    onChange={(e) => setFormHighlights(e.target.value)}
                    placeholder="e.g. Visiting the Louvre, hiking the Swiss Alps at sunrise"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Description & Memories */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">Trip Journal & Notes</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Special stories, reflections, funny mishaps, and travel highlights..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingTripId ? 'Save Changes' : 'Add Trip'}</span>
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
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-[#EFECE7] flex flex-col gap-4 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-base font-bold text-slate-800">
                  Delete Trip?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">{deleteTarget.mbrTripTitle}</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  disabled={deleting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
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
            mbrId={mbrId}
            categoryCd="trips"
            categoryTitle={activeGalleryTitle}
            isSandbox={isSandbox}
            subordinateId={activeGallerySubordinateId || undefined}
            isOpen={showGalleryModal}
            onClose={() => {
              setShowGalleryModal(false);
              loadSubordinateCounts(mbrId, tripList);
            }}
          />
        )}
      </AnimatePresence>

      {/* --- PRIVACY SETTINGS MODAL --- */}
      <AnimatePresence>
        {showPrivacyModal && (
          <MbrTopicPrivacyModal
            mbrId={mbrId}
            topicId={topicId}
            topicName="Trips and Vacations"
            isSandbox={isSandbox}
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        )}
      </AnimatePresence>

      <AdminComponentTag name="mbrStoryTripsPanel" />
    </div>
  );
}

export { MbrStoryTripsPanel, MbrStoryTripsPanel as mbrStoryTripsPanel };
