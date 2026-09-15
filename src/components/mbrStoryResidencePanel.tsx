/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MapPin, Trash2, Edit3, Save, X, Plus, Loader2, 
  AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, 
  BookOpen, Images, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical 
} from 'lucide-react';
import { taskApi, mediaApi, resolveMediaUrl, MbrMedia, MEDIA_API_BASE_URL } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryResidencePanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryResidenceProps = MbrStoryResidencePanelProps;

interface Residence {
  mbrResidenceId: string;
  mbrId: string;
  mbrResidenceAddress?: string;
  mbrResidenceCity: string;
  mbrResidenceState: string;
  mbrResidenceCountry: string;
  mbrResidenceStartDate: string; // YYYY-MM-DD
  mbrResidenceEndDate?: string;   // YYYY-MM-DD
  mbrResidenceBornInd: boolean;
  mbrResidenceCurrentInd: boolean;
  mbrResidenceHomeTownInd: boolean;
}

const SANDBOX_RESIDENCES: Residence[] = [
  {
    mbrResidenceId: 'r1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrResidenceAddress: '742 Evergreen Terrace',
    mbrResidenceCity: 'Portland',
    mbrResidenceState: 'OR',
    mbrResidenceCountry: 'USA',
    mbrResidenceStartDate: '1990-06-15',
    mbrResidenceBornInd: false,
    mbrResidenceCurrentInd: true,
    mbrResidenceHomeTownInd: false
  },
  {
    mbrResidenceId: 'r2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrResidenceAddress: '1240 Bayview Dr',
    mbrResidenceCity: 'Coos Bay',
    mbrResidenceState: 'OR',
    mbrResidenceCountry: 'USA',
    mbrResidenceStartDate: '1961-10-14',
    mbrResidenceEndDate: '1983-09-01',
    mbrResidenceBornInd: true,
    mbrResidenceCurrentInd: false,
    mbrResidenceHomeTownInd: true
  },
  {
    mbrResidenceId: 'r3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrResidenceAddress: '1850 University St',
    mbrResidenceCity: 'Eugene',
    mbrResidenceState: 'OR',
    mbrResidenceCountry: 'USA',
    mbrResidenceStartDate: '1983-09-15',
    mbrResidenceEndDate: '1987-06-20',
    mbrResidenceBornInd: false,
    mbrResidenceCurrentInd: false,
    mbrResidenceHomeTownInd: false
  }
];

// Helper for sorting list by default (Most recent on top: Current residence first, then end date / start date DESC)
const sortResidenceList = (list: Residence[]): Residence[] => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    if (a.mbrResidenceCurrentInd && !b.mbrResidenceCurrentInd) return -1;
    if (!a.mbrResidenceCurrentInd && b.mbrResidenceCurrentInd) return 1;
    const dateA = a.mbrResidenceEndDate || a.mbrResidenceStartDate || '';
    const dateB = b.mbrResidenceEndDate || b.mbrResidenceStartDate || '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (b.mbrResidenceStartDate || '').localeCompare(a.mbrResidenceStartDate || '');
  });
};

export default function MbrStoryResidencePanel({ isSandbox = false, memberId, readOnly = false }: MbrStoryResidencePanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [residenceList, setResidenceList] = useState<Residence[]>([]);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingResidenceId, setEditingResidenceId] = useState<string | null>(null);
  const [formAddress, setFormAddress] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formState, setFormState] = useState('');
  const [formCountry, setFormCountry] = useState('USA');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formBornInd, setFormBornInd] = useState(false);
  const [formCurrentInd, setFormCurrentInd] = useState(false);
  const [formHomeTownInd, setFormHomeTownInd] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteTargetResidence, setDeleteTargetResidence] = useState<Residence | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- RESIDENCE PHOTO GALLERY STATE ---
  const [showResidenceGalleryModal, setShowResidenceGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState<string>('Residencies');

  // --- SUBORDINATE STORIES & PHOTOS COUNT MAPS ---
  const [residencePhotosMap, setResidencePhotosMap] = useState<Record<string, number>>({});
  const [residenceStoriesMap, setResidenceStoriesMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // --- PRIVACY MODAL STATE ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- MOBILE ACTION DROPDOWN STATE ---
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // --- TABLE SORTING STATE ---
  const [sortColumn, setSortColumn] = useState<'location' | 'date' | 'status'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Click outside handlers for mobile dropdown menus
  useEffect(() => {
    if (!activeActionMenuId && !showHeaderMenu) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.residence-action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!target.closest('.residence-header-menu-container')) {
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

  // Load Subordinate Story and Photo Counts for each residence and header
  const loadSubordinateCounts = async (targetMbrId: string, currentResidences: Residence[]) => {
    try {
      const photoCounts: Record<string, number> = {};
      const storyCounts: Record<string, number> = {};
      let hdrPhotos = 0;
      let hdrStories = 0;

      if (isSandbox) {
        const savedMedia = sessionStorage.getItem('sandbox_media');
        if (savedMedia) {
          try {
            const parsedMedia: MbrMedia[] = JSON.parse(savedMedia);
            if (Array.isArray(parsedMedia)) {
              parsedMedia.forEach((m) => {
                const cat = (m.mbrMediaCategoryCd || '').toLowerCase();
                if (cat === 'residence' || cat === 'residencies') {
                  if (m.mbrMediaSubordinateId) {
                    photoCounts[m.mbrMediaSubordinateId] = (photoCounts[m.mbrMediaSubordinateId] || 0) + 1;
                  } else {
                    hdrPhotos++;
                  }
                }
              });
            }
          } catch {}
        }

        const genStoriesStr = sessionStorage.getItem('sandbox_stories_sbMbrStryResidence_all');
        if (genStoriesStr) {
          try {
            const parsed = JSON.parse(genStoriesStr);
            if (Array.isArray(parsed)) hdrStories = parsed.length;
          } catch {}
        }

        currentResidences.forEach((r) => {
          const key = `sandbox_stories_sbMbrStryResidence_${r.mbrResidenceId}`;
          const item = sessionStorage.getItem(key);
          if (item) {
            try {
              const list = JSON.parse(item);
              if (Array.isArray(list)) storyCounts[r.mbrResidenceId] = list.length;
            } catch {}
          }
        });
      } else {
        try {
          const [mediaList, storyList] = await Promise.all([
            taskApi.getMemberMedia(targetMbrId).catch(() => []),
            taskApi.getStories(targetMbrId).catch(() => [])
          ]);

          if (Array.isArray(mediaList)) {
            mediaList.forEach((m) => {
              const cat = (m.mbrMediaCategoryCd || '').toLowerCase();
              if (cat === 'residence' || cat === 'residencies') {
                if (m.mbrMediaSubordinateId) {
                  photoCounts[m.mbrMediaSubordinateId] = (photoCounts[m.mbrMediaSubordinateId] || 0) + 1;
                } else {
                  hdrPhotos++;
                }
              }
            });
          }

          if (Array.isArray(storyList)) {
            storyList.forEach((s) => {
              const isResType = (
                s.mbrStoryTypeCd === 'sbMbrStryResidence' ||
                s.mbrStoryTypeCd === 'residencies' ||
                s.mbrStoryTypeCd === 'residence'
              );
              if (isResType) {
                if (s.mbrStorySubordinateId) {
                  storyCounts[s.mbrStorySubordinateId] = (storyCounts[s.mbrStorySubordinateId] || 0) + 1;
                } else {
                  hdrStories++;
                }
              }
            });
          }
        } catch (e) {
          console.warn('Could not load residence subordinate media and stories counts:', e);
        }
      }

      setResidencePhotosMap(photoCounts);
      setResidenceStoriesMap(storyCounts);
      setHeaderPhotoCount(hdrPhotos);
      setHeaderStoryCount(hdrStories);
    } catch (err) {
      console.warn('Error computing residence content counts:', err);
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, residenceList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, residenceList, isSandbox]);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    loadData();
  }, [isSandbox, memberId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      let currentMbrId = memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1';
      if (!memberId) {
        const userStr = sessionStorage.getItem('user');
        if (userStr && !isSandbox) {
          try {
            const u = JSON.parse(userStr);
            const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
            if (mbrProfile && mbrProfile.mbrId) {
              currentMbrId = mbrProfile.mbrId;
              setMbrId(currentMbrId);
            }
          } catch (e) {
            console.warn("Could not retrieve member profile ID from DB, falling back to default Eleanor Hartwell UUID:", e);
          }
        }
      } else {
        setMbrId(memberId);
      }

      let loadedResidences: Residence[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_residences');
        if (saved) {
          loadedResidences = sortResidenceList(JSON.parse(saved));
        } else {
          loadedResidences = sortResidenceList(SANDBOX_RESIDENCES);
          sessionStorage.setItem('sandbox_residences', JSON.stringify(loadedResidences));
        }
      } else {
        try {
          const dbResidences = await taskApi.getResidences(currentMbrId);
          if (dbResidences && dbResidences.length > 0) {
            loadedResidences = sortResidenceList(dbResidences);
          } else if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            loadedResidences = sortResidenceList(SANDBOX_RESIDENCES);
          } else {
            loadedResidences = [];
          }
        } catch (err) {
          if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            loadedResidences = sortResidenceList(SANDBOX_RESIDENCES);
          } else {
            throw err;
          }
        }
      }

      setResidenceList(loadedResidences);
      await loadSubordinateCounts(currentMbrId, loadedResidences);
    } catch (err: any) {
      setError(`Failed to load residences: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL OPEN HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingResidenceId(null);
    setFormAddress('');
    setFormCity('');
    setFormState('');
    setFormCountry('USA');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormEndDate('');
    setFormBornInd(false);
    setFormCurrentInd(false);
    setFormHomeTownInd(false);
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (res: Residence) => {
    setEditingResidenceId(res.mbrResidenceId);
    setFormAddress(res.mbrResidenceAddress || '');
    setFormCity(res.mbrResidenceCity || '');
    setFormState(res.mbrResidenceState || '');
    setFormCountry(res.mbrResidenceCountry || 'USA');
    setFormStartDate(res.mbrResidenceStartDate || '');
    setFormEndDate(res.mbrResidenceEndDate || '');
    setFormBornInd(Boolean(res.mbrResidenceBornInd));
    setFormCurrentInd(Boolean(res.mbrResidenceCurrentInd));
    setFormHomeTownInd(Boolean(res.mbrResidenceHomeTownInd));
    setModalError(null);
    setShowModal(true);
  };

  // Save Modal Record (Create or Update)
  const handleSaveModalRecord = async () => {
    if (!formCity.trim() || !formState.trim() || !formCountry.trim() || !formStartDate) {
      setModalError('City, State, Country, and Start Date are required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload: Partial<Residence> = {
      mbrId,
      mbrResidenceAddress: formAddress.trim() || undefined,
      mbrResidenceCity: formCity.trim(),
      mbrResidenceState: formState.trim(),
      mbrResidenceCountry: formCountry.trim(),
      mbrResidenceStartDate: formStartDate,
      mbrResidenceEndDate: formCurrentInd ? undefined : (formEndDate || undefined),
      mbrResidenceBornInd: formBornInd,
      mbrResidenceCurrentInd: formCurrentInd,
      mbrResidenceHomeTownInd: formHomeTownInd
    };

    try {
      if (isSandbox) {
        let updatedList: Residence[] = [];
        if (editingResidenceId) {
          updatedList = residenceList.map((r) => {
            if (r.mbrResidenceId === editingResidenceId) {
              return {
                ...r,
                ...payload
              } as Residence;
            }
            // If setting current/born/hometown to true, clear on others
            return {
              ...r,
              ...(formCurrentInd ? { mbrResidenceCurrentInd: false } : {}),
              ...(formBornInd ? { mbrResidenceBornInd: false } : {}),
              ...(formHomeTownInd ? { mbrResidenceHomeTownInd: false } : {})
            };
          });
          setSuccessMsg('Residence record updated in Sandbox.');
        } else {
          const newResidence: Residence = {
            mbrResidenceId: `r_${Date.now()}`,
            mbrId,
            mbrResidenceAddress: formAddress.trim(),
            mbrResidenceCity: formCity.trim(),
            mbrResidenceState: formState.trim(),
            mbrResidenceCountry: formCountry.trim(),
            mbrResidenceStartDate: formStartDate,
            mbrResidenceEndDate: formCurrentInd ? undefined : (formEndDate || undefined),
            mbrResidenceBornInd: formBornInd,
            mbrResidenceCurrentInd: formCurrentInd,
            mbrResidenceHomeTownInd: formHomeTownInd
          };
          const clearedOthers = residenceList.map((r) => ({
            ...r,
            ...(formCurrentInd ? { mbrResidenceCurrentInd: false } : {}),
            ...(formBornInd ? { mbrResidenceBornInd: false } : {}),
            ...(formHomeTownInd ? { mbrResidenceHomeTownInd: false } : {})
          }));
          updatedList = [newResidence, ...clearedOthers];
          setSuccessMsg('New residence added to Sandbox.');
        }

        const sorted = sortResidenceList(updatedList);
        sessionStorage.setItem('sandbox_residences', JSON.stringify(sorted));
        setResidenceList(sorted);
        await loadSubordinateCounts(mbrId, sorted);
        setShowModal(false);
      } else {
        if (editingResidenceId) {
          await taskApi.updateResidence(editingResidenceId, payload);
          setSuccessMsg('Residence record updated.');
        } else {
          await taskApi.createResidence(payload);
          setSuccessMsg('New residence added.');
        }

        const dbResidences = await taskApi.getResidences(mbrId);
        const sorted = sortResidenceList(dbResidences);
        setResidenceList(sorted);
        await loadSubordinateCounts(mbrId, sorted);
        setShowModal(false);
      }
    } catch (err: any) {
      setModalError(`Failed to save residence: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE CONFIRMATION HANDLERS ---
  const promptDeleteResidence = (res: Residence) => {
    setDeleteTargetResidence(res);
  };

  const executeDeleteResidence = async () => {
    if (!deleteTargetResidence) return;
    setDeleting(true);
    try {
      if (isSandbox) {
        const remaining = residenceList.filter((r) => r.mbrResidenceId !== deleteTargetResidence.mbrResidenceId);
        sessionStorage.setItem('sandbox_residences', JSON.stringify(remaining));
        setResidenceList(remaining);
        await loadSubordinateCounts(mbrId, remaining);
        setSuccessMsg('Residence deleted from Sandbox.');
      } else {
        await taskApi.deleteResidence(deleteTargetResidence.mbrResidenceId);
        const dbResidences = await taskApi.getResidences(mbrId);
        const sorted = sortResidenceList(dbResidences);
        setResidenceList(sorted);
        await loadSubordinateCounts(mbrId, sorted);
        setSuccessMsg('Residence deleted successfully.');
      }
      setDeleteTargetResidence(null);
    } catch (err: any) {
      setError(`Failed to delete residence: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // --- PHOTO GALLERY MODAL HANDLERS ---
  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Residencies');
    setShowResidenceGalleryModal(true);
  };

  const handleOpenResidenceSubordinateGalleryModal = (res: Residence) => {
    setActiveGallerySubordinateId(res.mbrResidenceId);
    setActiveGalleryTitle(`Residency (${res.mbrResidenceCity}, ${res.mbrResidenceState})`);
    setShowResidenceGalleryModal(true);
  };

  // Helper for formatting date strings as "MON YYYY" (e.g. "JUN 1990")
  const formatMonYear = (dateStr?: string) => {
    if (!dateStr) return '—';
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
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const date = new Date(year, month, day);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
    }
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  // --- COLUMN SORTING HANDLER ---
  const handleSort = (column: 'location' | 'date' | 'status') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  // Computed Sorted List (Most recent on top by default)
  const sortedResidenceList = useMemo(() => {
    if (!Array.isArray(residenceList)) return [];
    return [...residenceList].sort((a, b) => {
      if (sortColumn === 'location') {
        const locA = `${a.mbrResidenceCity || ''}, ${a.mbrResidenceState || ''} ${a.mbrResidenceAddress || ''}`.toLowerCase();
        const locB = `${b.mbrResidenceCity || ''}, ${b.mbrResidenceState || ''} ${b.mbrResidenceAddress || ''}`.toLowerCase();
        const comparison = locA.localeCompare(locB);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'date') {
        // Most recent on top in 'desc' mode; oldest on top in 'asc' mode
        const getEffectiveDate = (r: Residence) => {
          if (r.mbrResidenceCurrentInd) return '9999-99-99';
          return r.mbrResidenceEndDate || r.mbrResidenceStartDate || '';
        };
        const dateA = getEffectiveDate(a);
        const dateB = getEffectiveDate(b);
        let comparison = dateA.localeCompare(dateB);
        if (comparison === 0) {
          comparison = (a.mbrResidenceStartDate || '').localeCompare(b.mbrResidenceStartDate || '');
        }
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'status') {
        const getRank = (r: Residence) => {
          if (r.mbrResidenceCurrentInd) return 1;
          if (r.mbrResidenceBornInd) return 2;
          if (r.mbrResidenceHomeTownInd) return 3;
          return 4;
        };
        const comparison = getRank(a) - getRank(b);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, [residenceList, sortColumn, sortDirection]);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-4 sm:py-5 px-2.5 sm:px-4 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 sm:gap-5 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 pb-3 sm:pb-4 border-b border-[#EFECE7]">
        {/* Left Side: Topic Title & Status Badge */}
        <button
          type="button"
          onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
            detail: { topicId: 'residencies', topicTitle: 'Residencies', componentName: 'sbMbrStryResidence' }
          }))}
          className="flex items-center gap-2 sm:gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98 min-w-0"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2 sm:p-2.5 bg-emerald-50/50 group-hover/topic:bg-emerald-100/70 border border-emerald-100 group-hover/topic:border-emerald-200 text-emerald-700 rounded-xl transition-all shadow-2xs shrink-0">
            <MapPin className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block truncate">
              {headerStoryCount > 0 ? `Status: ${headerStoryCount} Stories` : 'Status: Draft'}
            </span>
            <span className="block font-serif text-base sm:text-lg font-bold text-slate-800 group-hover/topic:text-emerald-700 transition-colors truncate">
              Residencies
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
              <span className="hidden xs:inline">Add Residence</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {/* Desktop Expanded Icon Bar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Button with Count Badge */}
            <button
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Residencies Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-emerald-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-emerald-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Storybook Icon Button with Count Badge */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                detail: { topicId: 'residencies', topicTitle: 'Residencies', componentName: 'sbMbrStryResidence' }
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
          <div className="sm:hidden relative inline-flex items-center residence-header-menu-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHeaderMenu(!showHeaderMenu);
              }}
              className={`relative p-1.5 rounded-xl border transition-colors cursor-pointer ${
                showHeaderMenu
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
              {(headerPhotoCount > 0 || headerStoryCount > 0) && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
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
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Images className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                          {headerPhotoCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        window.dispatchEvent(new CustomEvent('open-story-editor', {
                          detail: { topicId: 'residencies', topicTitle: 'Residencies', componentName: 'sbMbrStryResidence' }
                        }));
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
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
            <button onClick={() => setError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
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
            <button onClick={() => setSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- CONTENT WORKSPACE --- */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
          <Loader2 className="w-7 h-7 animate-spin text-slate-500" />
          <span className="text-xs font-medium">Loading residences...</span>
        </div>
      ) : residenceList.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
          <MapPin className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-serif text-slate-500 italic">No residences registered.</p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Residence
            </button>
          )}
        </div>
      ) : (
        /* RESIDENCY TABLE VIEW */
        <div className="border border-[#EFECE7] rounded-2xl bg-white shadow-xs overflow-hidden w-full max-w-full">
          <div className="max-h-[250px] overflow-y-auto overflow-x-hidden rounded-t-2xl w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  {/* Location Column */}
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 align-bottom w-[42%] sm:w-[38%] rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('location')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
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

                  {/* Dates / Period Column */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[32%] sm:w-[28%] text-left">
                    <button
                      type="button"
                      onClick={() => handleSort('date')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Period</span>
                      {sortColumn === 'date' ? (
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

                  {/* Status Badges Column */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[14%] sm:w-[16%]">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span className="hidden xs:inline">Status</span>
                      <span className="xs:hidden">Tag</span>
                      {sortColumn === 'status' ? (
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

                  {/* Actions Column */}
                  <th className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right align-bottom w-[12%] sm:w-[18%] rounded-tr-2xl">
                    <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedResidenceList.map((res, idx) => {
                  const storyCount = residenceStoriesMap[res.mbrResidenceId] || 0;
                  const photoCount = residencePhotosMap[res.mbrResidenceId] || 0;
                  const hasContent = storyCount > 0 || photoCount > 0;

                  return (
                    <tr
                      key={res.mbrResidenceId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Location details */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                            <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                              {res.mbrResidenceCity}, {res.mbrResidenceState}
                            </span>
                            {res.mbrResidenceAddress && (
                              <span className="text-[10px] text-slate-400 font-serif truncate leading-tight">
                                {res.mbrResidenceAddress}
                              </span>
                            )}
                            {hasContent && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {storyCount > 0 && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/70"
                                    title={`${storyCount} ${storyCount === 1 ? 'story' : 'stories'} available`}
                                  >
                                    <BookOpen className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                                    <span>{storyCount}</span>
                                  </span>
                                )}
                                {photoCount > 0 && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-blue-50 text-blue-800 border border-blue-200/70"
                                    title={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} available`}
                                  >
                                    <Images className="w-2.5 h-2.5 text-blue-600 shrink-0" />
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
                        <div className="flex flex-col min-w-0 font-mono text-[9px] sm:text-[10px] leading-snug text-slate-700">
                          <div className="flex items-center truncate">
                            <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                              To:
                            </span>
                            <span className={res.mbrResidenceCurrentInd ? 'font-bold text-indigo-600 truncate' : 'font-semibold truncate'}>
                              {res.mbrResidenceCurrentInd ? 'Present' : formatMonYear(res.mbrResidenceEndDate)}
                            </span>
                          </div>
                          <div className="flex items-center truncate mt-0.5">
                            <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                              From:
                            </span>
                            <span className="font-semibold truncate">
                              {formatMonYear(res.mbrResidenceStartDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badges */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <div className="flex flex-col sm:flex-row sm:flex-wrap items-start gap-1 min-w-0">
                          {res.mbrResidenceCurrentInd && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/70 rounded-full uppercase tracking-wider truncate max-w-full">
                              Current
                            </span>
                          )}
                          {res.mbrResidenceBornInd && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100/70 rounded-full uppercase tracking-wider truncate max-w-full">
                              Born
                            </span>
                          )}
                          {res.mbrResidenceHomeTownInd && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold bg-violet-50 text-violet-700 border border-violet-100/70 rounded-full uppercase tracking-wider truncate max-w-full">
                              Hometown
                            </span>
                          )}
                          {!res.mbrResidenceCurrentInd && !res.mbrResidenceBornInd && !res.mbrResidenceHomeTownInd && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold bg-slate-50 text-slate-500 border border-slate-200/70 rounded-full uppercase tracking-wider truncate max-w-full">
                              Past
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right">
                        {/* Desktop Expanded Action Icons */}
                        <div className="hidden sm:inline-flex items-center gap-1">
                          <button
                            onClick={() => handleOpenResidenceSubordinateGalleryModal(res)}
                            title={`Photo Gallery for ${res.mbrResidenceCity}, ${res.mbrResidenceState}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Images className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-blue-600' : ''}`} />
                            {photoCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-blue-600 text-white rounded-full leading-none shadow-xs">
                                {photoCount}
                              </span>
                            )}
                          </button>
                          <button
                            onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                              detail: {
                                topicId: 'residencies',
                                topicTitle: `Residency (${res.mbrResidenceCity}, ${res.mbrResidenceState})`,
                                componentName: 'sbMbrStryResidence',
                                subordinateId: res.mbrResidenceId,
                                subordinateName: `${res.mbrResidenceCity}, ${res.mbrResidenceState}`
                              }
                            }))}
                            title={readOnly ? `View Stories for ${res.mbrResidenceCity}, ${res.mbrResidenceState}${storyCount > 0 ? ` (${storyCount} stories)` : ''}` : `Story Editor for ${res.mbrResidenceCity}, ${res.mbrResidenceState}${storyCount > 0 ? ` (${storyCount} stories)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <BookOpen className={`w-3.5 h-3.5 ${storyCount > 0 ? 'text-amber-500' : 'text-blue-500'}`} />
                            {storyCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-amber-500 text-white rounded-full leading-none shadow-xs">
                                {storyCount}
                              </span>
                            )}
                          </button>
                          {!readOnly && (
                            <>
                              <button
                                onClick={() => handleOpenEditModal(res)}
                                title="Edit Residence"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => promptDeleteResidence(res)}
                                title="Delete Residence"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end residence-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === res.mbrResidenceId ? null : res.mbrResidenceId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === res.mbrResidenceId
                                ? 'bg-blue-100 text-blue-700'
                                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-4 h-4" />
                            {hasContent && (
                              <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-blue-600 ring-2 ring-white" />
                            )}
                          </button>

                          <AnimatePresence>
                            {activeActionMenuId === res.mbrResidenceId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedResidenceList.length - 2 && sortedResidenceList.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 ${
                                  idx >= sortedResidenceList.length - 2 && sortedResidenceList.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenResidenceSubordinateGalleryModal(res);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
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
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      window.dispatchEvent(new CustomEvent('open-story-editor', {
                                        detail: {
                                          topicId: 'residencies',
                                          topicTitle: `Residency (${res.mbrResidenceCity}, ${res.mbrResidenceState})`,
                                          componentName: 'sbMbrStryResidence',
                                          subordinateId: res.mbrResidenceId,
                                          subordinateName: `${res.mbrResidenceCity}, ${res.mbrResidenceState}`
                                        }
                                      }));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{readOnly ? 'View Stories' : 'Story Editor'}</span>
                                    </div>
                                    {storyCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                        {storyCount}
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
                                        handleOpenEditModal(res);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Edit Residence</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDeleteResidence(res);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Delete Residence</span>
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

      {/* --- EDIT / ADD RESIDENCE POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-6 shadow-2xl max-w-md w-full relative space-y-5"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3 border-b border-[#EFECE7]">
                <h3 className="font-serif text-base font-bold text-slate-800">
                  {editingResidenceId ? 'Edit Residence' : 'Add Residence'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Error Banner */}
              {modalError && (
                <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center justify-between">
                  <span>{modalError}</span>
                  <button onClick={() => setModalError(null)} className="text-rose-500 hover:text-rose-700 cursor-pointer">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Modal Form Controls */}
              <div className="space-y-4 text-left">
                {/* Street Address */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Street Address (Optional)
                  </label>
                  <input
                    type="text"
                    value={formAddress}
                    onChange={(e) => setFormAddress(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-3 outline-none focus:border-slate-800"
                  />
                </div>

                {/* City, State, Country Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      City *
                    </label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="e.g. Portland"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      State *
                    </label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="e.g. OR"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Country *
                    </label>
                    <input
                      type="text"
                      value={formCountry}
                      onChange={(e) => setFormCountry(e.target.value)}
                      placeholder="e.g. USA"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Start Date & End Date Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-mono font-medium text-slate-800 py-2.5 px-3 outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      disabled={formCurrentInd}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className={`w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-mono font-medium text-slate-800 py-2.5 px-3 outline-none focus:border-slate-800 ${
                        formCurrentInd ? 'opacity-40 cursor-not-allowed bg-slate-50' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Checkbox Attributes */}
                <div className="pt-2 border-t border-[#EFECE7] space-y-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
                    Special Designations
                  </span>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={formCurrentInd}
                        onChange={(e) => {
                          setFormCurrentInd(e.target.checked);
                          if (e.target.checked) setFormEndDate('');
                        }}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-serif font-bold text-slate-700">Current</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={formBornInd}
                        onChange={(e) => setFormBornInd(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-serif font-bold text-slate-700">Birthplace</span>
                    </label>

                    <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/60">
                      <input
                        type="checkbox"
                        checked={formHomeTownInd}
                        onChange={(e) => setFormHomeTownInd(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                      />
                      <span className="text-xs font-serif font-bold text-slate-700">Hometown</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Footer Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EFECE7]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveModalRecord}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 border border-blue-600 font-sans"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  <span>Save Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {deleteTargetResidence && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-6 shadow-2xl max-w-sm w-full relative space-y-4 text-center"
            >
              <div className="p-3 bg-amber-50 text-amber-600 border border-amber-200/60 rounded-2xl w-12 h-12 flex items-center justify-center mx-auto shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>

              <div>
                <h3 className="font-serif text-base font-bold text-slate-850">
                  Delete Residence?
                </h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed mt-1.5">
                  Are you sure you want to remove <span className="font-bold text-slate-700">{deleteTargetResidence.mbrResidenceCity}, {deleteTargetResidence.mbrResidenceState}</span> from your residence directory? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetResidence(null)}
                  disabled={deleting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteResidence}
                  disabled={deleting}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shadow-md shadow-rose-500/10 transition-all cursor-pointer disabled:opacity-50 border border-rose-600 font-sans"
                >
                  {deleting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                  <span>Delete Record</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reusable Photo Gallery Modal Dialog */}
      <MbrPhotoGalleryPanel
        isOpen={showResidenceGalleryModal}
        onClose={() => {
          setShowResidenceGalleryModal(false);
          loadSubordinateCounts(mbrId, residenceList);
        }}
        mbrId={mbrId}
        categoryCd="Residencies"
        categoryTitle={activeGalleryTitle}
        subordinateId={activeGallerySubordinateId}
        isSandbox={isSandbox}
        maxPhotos={activeGallerySubordinateId ? 12 : 40}
        readOnly={readOnly}
      />

      {/* Reusable Topic Privacy Settings Modal */}
      <MbrTopicPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        mbrId={mbrId}
        topicName="Residencies"
        isSandbox={isSandbox}
      />

      <AdminComponentTag name="mbrStoryResidencePanel" />
    </div>
  );
}

export { MbrStoryResidencePanel, MbrStoryResidencePanel as mbrStoryResidencePanel, MbrStoryResidencePanel as SbMbrStryResidence };
