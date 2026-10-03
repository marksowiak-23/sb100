/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartHandshake, Trash2, Edit3, Save, X, Plus, Loader2, 
  AlertCircle, CheckCircle2, ShieldAlert, Images, 
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, MapPin, Calendar
} from 'lucide-react';
import { 
  taskApi, 
  MbrTopicRelationship, 
  DEFAULT_TOPIC_LOOKUP, 
  Cd 
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryRelationshipsPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
  topicId?: string;
  chIntentId?: string;
}

export type SbMbrStryRelationshipsProps = MbrStoryRelationshipsPanelProps;

const SANDBOX_RELATIONSHIPS: MbrTopicRelationship[] = [
  {
    mbrRelationshipId: 'rel-1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrRelationshipTypeCd: 'BEST_FRIEND',
    mbrRelationshipFirstNm: 'Arthur',
    mbrRelationshipMiddleNm: 'Conan',
    mbrRelationshipLastNm: 'Pendleton',
    mbrRelationshipNickname: 'Artie',
    mbrRelationshipLocation: 'Ann Arbor, MI',
    mbrRelationshipStartDate: '1970-09-01',
    mbrRelationshipCurrentInd: true,
    mbrRelationshipHowWeMet: 'Roommates during freshman year at university dorms.',
    mbrRelationshipDescription: 'Lifelong confidant, travel companion across Europe in 1974, and best man at my wedding.'
  },
  {
    mbrRelationshipId: 'rel-2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrRelationshipTypeCd: 'MENTOR',
    mbrRelationshipFirstNm: 'Dr. Evelyn',
    mbrRelationshipLastNm: 'Vance',
    mbrRelationshipNickname: 'Doc Vance',
    mbrRelationshipLocation: 'Boston, MA',
    mbrRelationshipStartDate: '1978-06-15',
    mbrRelationshipEndDate: '1995-12-31',
    mbrRelationshipCurrentInd: false,
    mbrRelationshipHowWeMet: 'Senior research advisor during graduate residency.',
    mbrRelationshipDescription: 'Guided my entire early career in clinical genetics and taught me how to write impactful scientific papers.'
  },
  {
    mbrRelationshipId: 'rel-3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrRelationshipTypeCd: 'CHILDHOOD',
    mbrRelationshipFirstNm: 'Billy',
    mbrRelationshipLastNm: 'O\'Connor',
    mbrRelationshipLocation: 'Coos Bay, OR',
    mbrRelationshipStartDate: '1965-05-10',
    mbrRelationshipCurrentInd: true,
    mbrRelationshipHowWeMet: 'Grew up on the same block on Bayview Drive.',
    mbrRelationshipDescription: 'Spent countless summers fishing off the pier and building treehouses in the coastal pines.'
  }
];

const DEFAULT_RELATIONSHIP_CODES: Partial<Cd>[] = [
  { cdValue: 'BEST_FRIEND', cdLabel: 'Best Friend', cdDesc: 'Best or closest lifelong friend', cdSortOrder: 1 },
  { cdValue: 'CLOSE_FRIEND', cdLabel: 'Close Friend', cdDesc: 'Close personal friend', cdSortOrder: 2 },
  { cdValue: 'CHILDHOOD', cdLabel: 'Childhood Friend', cdDesc: 'Friend from childhood or school years', cdSortOrder: 3 },
  { cdValue: 'PARTNER', cdLabel: 'Partner', cdDesc: 'Partner or significant other', cdSortOrder: 4 },
  { cdValue: 'MENTOR', cdLabel: 'Mentor / Advisor', cdDesc: 'Mentor, guide, or advisor', cdSortOrder: 5 },
  { cdValue: 'COLLEAGUE', cdLabel: 'Colleague / Coworker', cdDesc: 'Professional colleague or work companion', cdSortOrder: 6 },
  { cdValue: 'TEACHER', cdLabel: 'Teacher / Coach', cdDesc: 'Teacher, professor, or coach', cdSortOrder: 7 },
  { cdValue: 'NEIGHBOR', cdLabel: 'Neighbor', cdDesc: 'Neighbor or community acquaintance', cdSortOrder: 8 },
  { cdValue: 'OTHER', cdLabel: 'Other', cdDesc: 'Other meaningful connection or relationship', cdSortOrder: 9 }
];

export default function MbrStoryRelationshipsPanel({
  isSandbox = false,
  memberId,
  readOnly = false,
  topicId = DEFAULT_TOPIC_LOOKUP.relationships?.topicId || '172dc3fc-ce2d-463b-ad9f-976f893cce5e',
  chIntentId = DEFAULT_TOPIC_LOOKUP.relationships?.chIntentId || '1e9238af-c28a-4420-a88a-09b6f3e831ac'
}: MbrStoryRelationshipsPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [relationshipList, setRelationshipList] = useState<MbrTopicRelationship[]>([]);
  const [typeCodes, setTypeCodes] = useState<Partial<Cd>[]>(DEFAULT_RELATIONSHIP_CODES);

  // --- MODAL FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingRelationshipId, setEditingRelationshipId] = useState<string | null>(null);
  const [formTypeCd, setFormTypeCd] = useState('BEST_FRIEND');
  const [formFirstNm, setFormFirstNm] = useState('');
  const [formMiddleNm, setFormMiddleNm] = useState('');
  const [formLastNm, setFormLastNm] = useState('');
  const [formNickname, setFormNickname] = useState('');
  const [formMaidenNm, setFormMaidenNm] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCurrentInd, setFormCurrentInd] = useState(true);
  const [formHowWeMet, setFormHowWeMet] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteTarget, setDeleteTarget] = useState<MbrTopicRelationship | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- PHOTO GALLERY STATE ---
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState<string>('Relationships');

  // --- PRIVACY MODAL STATE ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- PHOTO COUNTS MAP ---
  const [memberPhotosMap, setMemberPhotosMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);

  // --- MOBILE ACTION DROPDOWN STATE ---
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // --- SORTING STATE ---
  type SortColumn = 'name' | 'type' | 'startDate' | 'location';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    if (!activeActionMenuId && !showHeaderMenu) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.relationship-action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!target.closest('.relationship-header-menu-container')) {
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

  // Load photo count badges
  const loadSubordinateCounts = async (targetMbrId: string, currentRelationships: MbrTopicRelationship[]) => {
    try {
      if (isSandbox) {
        setHeaderPhotoCount(0);
        setMemberPhotosMap({});
        return;
      }
      const mediaList: any[] = await taskApi.getMemberMedia(targetMbrId).catch(() => []);
      if (Array.isArray(mediaList)) {
        const photoMap: Record<string, number> = {};
        let headerPhotos = 0;

        mediaList.forEach((m) => {
          const category = (m.mbrMediaCategoryCd || '').toLowerCase();
          if (category.includes('relationship')) {
            headerPhotos++;
            if (m.mbrMediaSubordinateId) {
              photoMap[m.mbrMediaSubordinateId] = (photoMap[m.mbrMediaSubordinateId] || 0) + 1;
            }
          }
        });

        setHeaderPhotoCount(headerPhotos);
        setMemberPhotosMap(photoMap);
      }
    } catch {
      // Graceful fallback
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, relationshipList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, relationshipList, isSandbox]);

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

        // Fetch lookup codes for relationship types
        try {
          const codes = await taskApi.getCds('relationshipTypeCd');
          if (Array.isArray(codes) && codes.length > 0 && isMounted) {
            setTypeCodes(codes);
          }
        } catch {
          // fallback to defaults
        }

        if (isSandbox) {
          const local = sessionStorage.getItem('sandbox_relationships');
          const data = local ? JSON.parse(local) : SANDBOX_RELATIONSHIPS;
          if (isMounted) {
            setRelationshipList(data);
            loadSubordinateCounts(currentMbrId, data);
          }
        } else {
          try {
            const dbData = await taskApi.getRelationships(currentMbrId);
            if (isMounted) {
              let list = Array.isArray(dbData) ? dbData : [];
              if (list.length === 0 && (currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1' || memberId === 'm1')) {
                list = SANDBOX_RELATIONSHIPS;
              }
              setRelationshipList(list);
              loadSubordinateCounts(currentMbrId, list);
            }
          } catch (err: any) {
            if (isMounted) {
              if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1' || err.message?.includes('Parent member profile not found')) {
                console.warn("Falling back to sandbox relationships due to unseeded parent member:", err);
                const local = sessionStorage.getItem('sandbox_relationships');
                const data = local ? JSON.parse(local) : SANDBOX_RELATIONSHIPS;
                setRelationshipList(data);
                loadSubordinateCounts(currentMbrId, data);
              } else {
                setError(`Failed to load relationships: ${err.message || err}`);
              }
            }
          }
        }
      } catch (err: any) {
        if (isMounted) setError(`Failed to load relationships: ${err.message}`);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    init();
    return () => { isMounted = false; };
  }, [isSandbox, memberId]);

  const getTypeLabel = (cdVal?: string) => {
    if (!cdVal) return 'Friend';
    const found = typeCodes.find(
      (c) => c?.cdValue?.toLowerCase() === cdVal?.toLowerCase()
    );
    return found?.cdLabel || found?.cdValue || cdVal;
  };

  const getInitials = (first: string = '', last: string = '') => {
    const f = first ? first[0] : '';
    const l = last ? last[0] : '';
    return (f + l).toUpperCase() || '?';
  };

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedRelationships = useMemo(() => {
    if (!Array.isArray(relationshipList)) return [];
    if (!sortColumn) {
      // Default sort: current first, then start date desc
      return [...relationshipList].sort((a, b) => {
        if (a.mbrRelationshipCurrentInd && !b.mbrRelationshipCurrentInd) return -1;
        if (!a.mbrRelationshipCurrentInd && b.mbrRelationshipCurrentInd) return 1;
        const dtA = a.mbrRelationshipStartDate || '';
        const dtB = b.mbrRelationshipStartDate || '';
        if (dtA !== dtB) return dtB.localeCompare(dtA);
        const nameA = `${a.mbrRelationshipFirstNm} ${a.mbrRelationshipLastNm || ''}`.toLowerCase();
        const nameB = `${b.mbrRelationshipFirstNm} ${b.mbrRelationshipLastNm || ''}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
    }

    return [...relationshipList].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'name') {
        const nameA = `${a.mbrRelationshipFirstNm} ${a.mbrRelationshipLastNm || ''}`.trim().toLowerCase();
        const nameB = `${b.mbrRelationshipFirstNm} ${b.mbrRelationshipLastNm || ''}`.trim().toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortColumn === 'type') {
        const typeA = (getTypeLabel(a.mbrRelationshipTypeCd) || '').toLowerCase();
        const typeB = (getTypeLabel(b.mbrRelationshipTypeCd) || '').toLowerCase();
        comparison = typeA.localeCompare(typeB);
      } else if (sortColumn === 'startDate') {
        const dateA = a.mbrRelationshipStartDate || '';
        const dateB = b.mbrRelationshipStartDate || '';
        comparison = dateA.localeCompare(dateB);
      } else if (sortColumn === 'location') {
        const locA = (a.mbrRelationshipLocation || '').toLowerCase();
        const locB = (b.mbrRelationshipLocation || '').toLowerCase();
        comparison = locA.localeCompare(locB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [relationshipList, sortColumn, sortDirection, typeCodes]);

  // Modal Handlers
  const handleOpenAddModal = () => {
    setEditingRelationshipId(null);
    setFormTypeCd(typeCodes[0]?.cdValue || 'BEST_FRIEND');
    setFormFirstNm('');
    setFormMiddleNm('');
    setFormLastNm('');
    setFormNickname('');
    setFormMaidenNm('');
    setFormLocation('');
    setFormStartDate('');
    setFormEndDate('');
    setFormCurrentInd(true);
    setFormHowWeMet('');
    setFormDescription('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (rel: MbrTopicRelationship) => {
    setEditingRelationshipId(rel.mbrRelationshipId);
    setFormTypeCd(rel.mbrRelationshipTypeCd || 'BEST_FRIEND');
    setFormFirstNm(rel.mbrRelationshipFirstNm || '');
    setFormMiddleNm(rel.mbrRelationshipMiddleNm || '');
    setFormLastNm(rel.mbrRelationshipLastNm || '');
    setFormNickname(rel.mbrRelationshipNickname || '');
    setFormMaidenNm(rel.mbrRelationshipMaidenNm || '');
    setFormLocation(rel.mbrRelationshipLocation || '');
    setFormStartDate(rel.mbrRelationshipStartDate ? rel.mbrRelationshipStartDate.split('T')[0] : '');
    setFormEndDate(rel.mbrRelationshipEndDate ? rel.mbrRelationshipEndDate.split('T')[0] : '');
    setFormCurrentInd(rel.mbrRelationshipCurrentInd ?? true);
    setFormHowWeMet(rel.mbrRelationshipHowWeMet || '');
    setFormDescription(rel.mbrRelationshipDescription || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formFirstNm.trim()) {
      setModalError('First name is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload: Partial<MbrTopicRelationship> = {
      mbrId,
      mbrRelationshipTypeCd: formTypeCd,
      mbrRelationshipFirstNm: formFirstNm.trim(),
      mbrRelationshipMiddleNm: formMiddleNm.trim() || undefined,
      mbrRelationshipLastNm: formLastNm.trim() || undefined,
      mbrRelationshipNickname: formNickname.trim() || undefined,
      mbrRelationshipMaidenNm: formMaidenNm.trim() || undefined,
      mbrRelationshipLocation: formLocation.trim() || undefined,
      mbrRelationshipStartDate: formStartDate.trim() || undefined,
      mbrRelationshipEndDate: formEndDate.trim() || undefined,
      mbrRelationshipCurrentInd: formCurrentInd,
      mbrRelationshipHowWeMet: formHowWeMet.trim() || undefined,
      mbrRelationshipDescription: formDescription.trim() || undefined
    };

    try {
      if (isSandbox) {
        let nextList: MbrTopicRelationship[];
        if (editingRelationshipId) {
          nextList = relationshipList.map((r) =>
            r.mbrRelationshipId === editingRelationshipId ? { ...r, ...payload } : r
          );
          setSuccessMsg('Relationship updated successfully!');
        } else {
          const newEntry: MbrTopicRelationship = {
            mbrRelationshipId: `rel-${Date.now()}`,
            ...payload as any
          };
          nextList = [...relationshipList, newEntry];
          setSuccessMsg('Relationship added successfully!');
        }
        setRelationshipList(nextList);
        sessionStorage.setItem('sandbox_relationships', JSON.stringify(nextList));
        setShowModal(false);
      } else {
        if (editingRelationshipId) {
          await taskApi.updateRelationship(editingRelationshipId, payload);
          setSuccessMsg('Relationship updated successfully!');
        } else {
          await taskApi.createRelationship(payload);
          setSuccessMsg('Relationship added successfully!');
        }
        setShowModal(false);
        const refreshed = await taskApi.getRelationships(mbrId);
        setRelationshipList(Array.isArray(refreshed) ? refreshed : []);
      }
    } catch (err: any) {
      setModalError(`Failed to save relationship: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const promptDelete = (rel: MbrTopicRelationship) => {
    setDeleteTarget(rel);
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTarget.mbrRelationshipId;

    try {
      if (isSandbox) {
        const nextList = relationshipList.filter((r) => r.mbrRelationshipId !== targetId);
        setRelationshipList(nextList);
        sessionStorage.setItem('sandbox_relationships', JSON.stringify(nextList));
        setSuccessMsg('Relationship deleted successfully!');
      } else {
        await taskApi.deleteRelationship(targetId);
        const refreshed = await taskApi.getRelationships(mbrId);
        setRelationshipList(Array.isArray(refreshed) ? refreshed : []);
        setSuccessMsg('Relationship deleted successfully!');
      }
      setDeleteTarget(null);
    } catch (err: any) {
      setError(`Failed to delete relationship: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Photo Gallery Handlers
  const handleOpenRelationshipsGallery = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Relationships');
    setShowGalleryModal(true);
  };

  const handleOpenMemberGallery = (rel: MbrTopicRelationship) => {
    setActiveGallerySubordinateId(rel.mbrRelationshipId);
    setActiveGalleryTitle(`Relationships (${rel.mbrRelationshipFirstNm} ${rel.mbrRelationshipLastNm || ''})`.trim());
    setShowGalleryModal(true);
  };

  const formatYearOrDate = (dtStr?: string | null) => {
    if (!dtStr) return '';
    const parts = dtStr.split('T')[0].split('-');
    if (parts.length >= 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dtStr;
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-4 sm:py-5 px-2.5 sm:px-4 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
            detail: { topicId, chIntentId, topicTitle: 'Relationships', componentName: 'sbMbrStryRelationships' }
          }))}
          className="flex items-center gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2.5 bg-rose-50/50 group-hover/topic:bg-rose-100/70 border border-rose-100 group-hover/topic:border-rose-200 text-rose-600 rounded-xl transition-all shadow-2xs">
            <HeartHandshake className="w-5 h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <span className="block font-serif text-lg font-bold text-slate-800 group-hover/topic:text-rose-600 transition-colors">
            Relationships
          </span>
        </button>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-blue-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Relationship</span>
            </button>
          )}

          {/* Desktop Action Icons */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Icon Button */}
            <button
              onClick={handleOpenRelationshipsGallery}
              className="relative p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Relationships Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-blue-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Privacy Modal Button */}
            <button
              onClick={() => setShowPrivacyModal(true)}
              className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Relationships Privacy Settings"
            >
              <ShieldAlert className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          {/* Mobile Actions Dropdown Trigger */}
          <div className="sm:hidden relative inline-flex items-center relationship-header-menu-container">
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
                        handleOpenRelationshipsGallery();
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Images className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
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
          <span className="text-xs font-medium">Loading relationships...</span>
        </div>
      ) : relationshipList.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
          <HeartHandshake className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-serif text-slate-500 italic">No relationships recorded yet.</p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Relationship
            </button>
          )}
        </div>
      ) : (
        /* RELATIONSHIPS TABLE VIEW */
        <div className="border border-[#EFECE7] rounded-2xl bg-white shadow-xs overflow-hidden">
          <div className="max-h-[300px] overflow-y-auto overflow-x-hidden sm:overflow-x-auto rounded-t-2xl">
            <table className="w-full text-left border-collapse table-fixed sm:table-auto">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 align-bottom w-[40%] sm:w-auto rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Person</span>
                      {sortColumn === 'name' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
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
                      <span>Type</span>
                      {sortColumn === 'type' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[24%] sm:w-auto hidden md:table-cell">
                    <button
                      type="button"
                      onClick={() => handleSort('location')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Location</span>
                      {sortColumn === 'location' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right align-bottom w-[12%] sm:w-auto rounded-tr-2xl">
                    <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedRelationships.map((rel, idx) => {
                  const photoCount = memberPhotosMap[rel.mbrRelationshipId] || 0;
                  const hasContent = photoCount > 0;

                  return (
                    <tr
                      key={rel.mbrRelationshipId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Person Name + Nickname + Photos */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-50 border border-rose-200/80 flex items-center justify-center text-rose-700 font-serif font-bold text-[10px] sm:text-xs shrink-0">
                            {getInitials(rel.mbrRelationshipFirstNm, rel.mbrRelationshipLastNm || '')}
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                                {rel.mbrRelationshipFirstNm} {rel.mbrRelationshipLastNm || ''}
                              </span>
                              {rel.mbrRelationshipNickname && (
                                <span className="text-[10px] text-slate-500 italic">
                                  "{rel.mbrRelationshipNickname}"
                                </span>
                              )}
                            </div>
                            {rel.mbrRelationshipHowWeMet && (
                              <p className="text-[10px] text-slate-500 line-clamp-1 italic mt-0.5">
                                {rel.mbrRelationshipHowWeMet}
                              </p>
                            )}
                            {hasContent && (
                              <div className="flex items-center gap-1 mt-0.5">
                                <span
                                  className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/70"
                                  title={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} available`}
                                >
                                  <Images className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                                  <span>{photoCount}</span>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Relationship Type */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <div className="flex flex-col items-start gap-1">
                          <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 text-[8.5px] sm:text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-100/70 rounded-full uppercase tracking-wider truncate max-w-full">
                            {getTypeLabel(rel.mbrRelationshipTypeCd)}
                          </span>
                          {rel.mbrRelationshipStartDate && (
                            <span className="text-[9.5px] font-mono text-slate-400">
                              Since {rel.mbrRelationshipStartDate.split('-')[0]}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2 hidden md:table-cell">
                        {rel.mbrRelationshipLocation ? (
                          <div className="flex items-center gap-1 text-[11px] text-slate-600 truncate max-w-[180px]">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{rel.mbrRelationshipLocation}</span>
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
                            onClick={() => handleOpenMemberGallery(rel)}
                            title={`Photo Gallery for ${rel.mbrRelationshipFirstNm} ${rel.mbrRelationshipLastNm || ''}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Images className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-blue-600' : ''}`} />
                            {photoCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-blue-600 text-white rounded-full leading-none shadow-xs">
                                {photoCount}
                              </span>
                            )}
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(rel)}
                                title="Edit Relationship"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promptDelete(rel)}
                                title="Delete Relationship"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end relationship-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === rel.mbrRelationshipId ? null : rel.mbrRelationshipId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === rel.mbrRelationshipId
                                ? 'bg-rose-100 text-rose-700'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                            {hasContent && (
                              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
                            )}
                          </button>

                          <AnimatePresence>
                            {activeActionMenuId === rel.mbrRelationshipId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedRelationships.length - 2 && sortedRelationships.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 ${
                                  idx >= sortedRelationships.length - 2 && sortedRelationships.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenMemberGallery(rel);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span>Photo Gallery</span>
                                    </div>
                                    {photoCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
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
                                        handleOpenEditModal(rel);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Edit Relationship</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDelete(rel);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Delete Relationship</span>
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

      {/* --- ADD / EDIT RELATIONSHIP MODAL --- */}
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
                  <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                    <HeartHandshake className="w-5 h-5" />
                  </div>
                  <h2 className="font-serif text-lg font-bold text-slate-800">
                    {editingRelationshipId ? 'Edit Relationship' : 'Add Relationship'}
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
                {/* Relationship Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">
                    Relationship Type *
                  </label>
                  <select
                    value={formTypeCd}
                    onChange={(e) => setFormTypeCd(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    required
                  >
                    {typeCodes.map((c) => (
                      <option key={c.cdValue} value={c.cdValue}>
                        {c.cdLabel || c.cdValue}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Name Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">First Name *</label>
                    <input
                      type="text"
                      value={formFirstNm}
                      onChange={(e) => setFormFirstNm(e.target.value)}
                      placeholder="e.g. Arthur"
                      required
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Middle Name</label>
                    <input
                      type="text"
                      value={formMiddleNm}
                      onChange={(e) => setFormMiddleNm(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Last Name</label>
                    <input
                      type="text"
                      value={formLastNm}
                      onChange={(e) => setFormLastNm(e.target.value)}
                      placeholder="e.g. Pendleton"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Nickname & Maiden Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Nickname / Moniker</label>
                    <input
                      type="text"
                      value={formNickname}
                      onChange={(e) => setFormNickname(e.target.value)}
                      placeholder="e.g. Artie, Skip"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Maiden / Prior Name</label>
                    <input
                      type="text"
                      value={formMaidenNm}
                      onChange={(e) => setFormMaidenNm(e.target.value)}
                      placeholder="Optional"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">City / Location</label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder="e.g. Boston, MA or University Campus"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">Date / Year Met</label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-700 font-serif">End Date (If past)</label>
                    <input
                      type="date"
                      value={formEndDate}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      disabled={formCurrentInd}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                {/* Current Relationship Checkbox */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formCurrentInd}
                    onChange={(e) => {
                      setFormCurrentInd(e.target.checked);
                      if (e.target.checked) setFormEndDate('');
                    }}
                    className="w-4 h-4 text-rose-600 rounded border-slate-300 focus:ring-rose-500 cursor-pointer"
                  />
                  <span className="text-xs font-serif font-medium text-slate-700">
                    Active / Ongoing Relationship
                  </span>
                </label>

                {/* How We Met */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">How We Met</label>
                  <input
                    type="text"
                    value={formHowWeMet}
                    onChange={(e) => setFormHowWeMet(e.target.value)}
                    placeholder="e.g. Roommates in college dorms, 1970"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Description & Memories */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 font-serif">Notes & Shared Memories</label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Special stories, shared adventures, or meaningful memories..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-sans focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
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
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50"
                  >
                    {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingRelationshipId ? 'Save Changes' : 'Add Relationship'}</span>
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
                  Delete Relationship?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">{deleteTarget.mbrRelationshipFirstNm} {deleteTarget.mbrRelationshipLastNm || ''}</span>? This action cannot be undone.
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
            memberId={mbrId}
            category="relationships"
            subordinateId={activeGallerySubordinateId || undefined}
            title={activeGalleryTitle}
            isOpen={showGalleryModal}
            onClose={() => {
              setShowGalleryModal(false);
              loadSubordinateCounts(mbrId, relationshipList);
            }}
          />
        )}
      </AnimatePresence>

      {/* --- PRIVACY SETTINGS MODAL --- */}
      <AnimatePresence>
        {showPrivacyModal && (
          <MbrTopicPrivacyModal
            memberId={mbrId}
            topicTitle="Relationships"
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        )}
      </AnimatePresence>

      <AdminComponentTag name="mbrStoryRelationshipsPanel" />
    </div>
  );
}

export { MbrStoryRelationshipsPanel, MbrStoryRelationshipsPanel as mbrStoryRelationshipsPanel };
