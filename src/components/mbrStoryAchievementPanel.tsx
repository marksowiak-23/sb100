/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, Trash2, Edit3, Save, X, Plus, Loader2, 
  AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, 
  BookOpen, Images, ArrowUpDown, ArrowUp, ArrowDown, MoreVertical 
} from 'lucide-react';
import { taskApi, mediaApi, resolveMediaUrl, MbrMedia, MEDIA_API_BASE_URL } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryAchievementPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryAchievementProps = MbrStoryAchievementPanelProps;

interface Achievement {
  mbrAchievementId: string;
  mbrId: string;
  mbrAchievementTitle: string;
  mbrAchievementDescription?: string;
  mbrAchievementDate?: string; // YYYY-MM-DD
}

const SANDBOX_ACHIEVEMENTS: Achievement[] = [
  {
    mbrAchievementId: 'ac1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrAchievementTitle: 'Pulitzer Prize in Biography',
    mbrAchievementDescription: "Awarded for the memoir 'Whispers of the Coast'.",
    mbrAchievementDate: '2018-04-16'
  },
  {
    mbrAchievementId: 'ac2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrAchievementTitle: 'Lifetime Achievement Award',
    mbrAchievementDescription: 'Presented by the Oregon Historical Society for dedication to archiving oral histories.',
    mbrAchievementDate: '2024-11-05'
  }
];

// Helper for sorting list by default (Most recent on top by date DESC)
const sortAchievementList = (list: Achievement[]): Achievement[] => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const dateA = a.mbrAchievementDate || '';
    const dateB = b.mbrAchievementDate || '';
    if (dateA !== dateB) return dateB.localeCompare(dateA);
    return (a.mbrAchievementTitle || '').localeCompare(b.mbrAchievementTitle || '');
  });
};

export default function MbrStoryAchievementPanel({ isSandbox = false, memberId, readOnly = false }: MbrStoryAchievementPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [achievementList, setAchievementList] = useState<Achievement[]>([]);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingAchievementId, setEditingAchievementId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [initialFormTitle, setInitialFormTitle] = useState('');
  const [initialFormDate, setInitialFormDate] = useState('');
  const [initialFormDescription, setInitialFormDescription] = useState('');
  const [showModalDiscardConfirm, setShowModalDiscardConfirm] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Check if modal has unsaved changes compared to initial state
  const hasModalUnsavedChanges = useMemo(() => {
    return (
      formTitle.trim() !== initialFormTitle.trim() ||
      formDate !== initialFormDate ||
      formDescription.trim() !== initialFormDescription.trim()
    );
  }, [formTitle, formDate, formDescription, initialFormTitle, initialFormDate, initialFormDescription]);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteTargetAchievement, setDeleteTargetAchievement] = useState<Achievement | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- PHOTO GALLERY STATE ---
  const [showAchievementGalleryModal, setShowAchievementGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState<string>('Achievements');

  // --- SUBORDINATE STORIES & PHOTOS COUNT MAPS ---
  const [achievementPhotosMap, setAchievementPhotosMap] = useState<Record<string, number>>({});
  const [achievementStoriesMap, setAchievementStoriesMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // --- PRIVACY MODAL STATE ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // --- MOBILE ACTION DROPDOWN STATE ---
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // --- TABLE SORTING STATE ---
  const [sortColumn, setSortColumn] = useState<'title' | 'date'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Click outside handlers for mobile dropdown menus
  useEffect(() => {
    if (!activeActionMenuId && !showHeaderMenu) return;
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.achievement-action-menu-container')) {
        setActiveActionMenuId(null);
      }
      if (!target.closest('.achievement-header-menu-container')) {
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

  // Load Subordinate Story and Photo Counts for each achievement and header
  const loadSubordinateCounts = async (targetMbrId: string, currentAchievements: Achievement[]) => {
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
                if (cat === 'achievement' || cat === 'achievements') {
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

        const genStoriesStr = sessionStorage.getItem('sandbox_stories_sbMbrStryAchievement_all');
        if (genStoriesStr) {
          try {
            const parsed = JSON.parse(genStoriesStr);
            if (Array.isArray(parsed)) hdrStories = parsed.length;
          } catch {}
        }

        currentAchievements.forEach((a) => {
          const key = `sandbox_stories_sbMbrStryAchievement_${a.mbrAchievementId}`;
          const item = sessionStorage.getItem(key);
          if (item) {
            try {
              const list = JSON.parse(item);
              if (Array.isArray(list)) storyCounts[a.mbrAchievementId] = list.length;
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
              if (cat === 'achievement' || cat === 'achievements') {
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
              const isAchType = (
                s.mbrStoryTypeCd === 'sbMbrStryAchievement' ||
                s.mbrStoryTypeCd === 'achievements' ||
                s.mbrStoryTypeCd === 'achievement'
              );
              if (isAchType) {
                if (s.mbrStorySubordinateId) {
                  storyCounts[s.mbrStorySubordinateId] = (storyCounts[s.mbrStorySubordinateId] || 0) + 1;
                } else {
                  hdrStories++;
                }
              }
            });
          }
        } catch (e) {
          console.warn('Could not load achievement subordinate media and stories counts:', e);
        }
      }

      setAchievementPhotosMap(photoCounts);
      setAchievementStoriesMap(storyCounts);
      setHeaderPhotoCount(hdrPhotos);
      setHeaderStoryCount(hdrStories);
    } catch (err) {
      console.warn('Error computing achievement content counts:', err);
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, achievementList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, achievementList, isSandbox]);

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
            console.warn("Could not retrieve member profile ID from DB, falling back to Eleanor Hartwell UUID:", e);
          }
        }
      } else {
        setMbrId(memberId);
      }

      let loadedAchievements: Achievement[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_achievements');
        if (saved) {
          loadedAchievements = sortAchievementList(JSON.parse(saved));
        } else {
          loadedAchievements = sortAchievementList(SANDBOX_ACHIEVEMENTS);
          sessionStorage.setItem('sandbox_achievements', JSON.stringify(loadedAchievements));
        }
      } else {
        try {
          const dbAchievements = await taskApi.getAchievements(currentMbrId);
          if (dbAchievements && dbAchievements.length > 0) {
            loadedAchievements = sortAchievementList(dbAchievements);
          } else if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            loadedAchievements = sortAchievementList(SANDBOX_ACHIEVEMENTS);
          } else {
            loadedAchievements = [];
          }
        } catch (e) {
          console.warn("Could not load achievements from DB, using fallback sandbox:", e);
          loadedAchievements = sortAchievementList(SANDBOX_ACHIEVEMENTS);
        }
      }

      setAchievementList(loadedAchievements);
      await loadSubordinateCounts(currentMbrId, loadedAchievements);
    } catch (err: any) {
      setError(`Failed to load achievements: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- ADD / EDIT MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingAchievementId(null);
    setFormTitle('');
    setFormDate('');
    setFormDescription('');
    setInitialFormTitle('');
    setInitialFormDate('');
    setInitialFormDescription('');
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (ach: Achievement) => {
    const t = ach.mbrAchievementTitle || '';
    const d = ach.mbrAchievementDate || '';
    const desc = ach.mbrAchievementDescription || '';
    setEditingAchievementId(ach.mbrAchievementId);
    setFormTitle(t);
    setFormDate(d);
    setFormDescription(desc);
    setInitialFormTitle(t);
    setInitialFormDate(d);
    setInitialFormDescription(desc);
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  // Close attempt handler - checks for unsaved edits in Add/Edit modal
  const handleRequestCloseModal = () => {
    if (hasModalUnsavedChanges && !saving) {
      setShowModalDiscardConfirm(true);
    } else {
      setShowModal(false);
      setShowModalDiscardConfirm(false);
    }
  };

  const handleConfirmDiscardModal = () => {
    setShowModalDiscardConfirm(false);
    setShowModal(false);
  };

  const handleCancelDiscardModal = () => {
    setShowModalDiscardConfirm(false);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Achievement Title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        mbrId,
        mbrAchievementTitle: formTitle.trim(),
        mbrAchievementDate: formDate ? formDate : undefined,
        mbrAchievementDescription: formDescription.trim() ? formDescription.trim() : undefined
      };

      let nextList: Achievement[] = [];

      if (isSandbox) {
        if (editingAchievementId) {
          nextList = achievementList.map((a) =>
            a.mbrAchievementId === editingAchievementId
              ? { ...a, ...payload }
              : a
          );
        } else {
          const newAch: Achievement = {
            mbrAchievementId: `ac_${Date.now()}`,
            ...payload
          };
          nextList = [newAch, ...achievementList];
        }

        const sorted = sortAchievementList(nextList);
        setAchievementList(sorted);
        sessionStorage.setItem('sandbox_achievements', JSON.stringify(sorted));
        setSuccessMsg(editingAchievementId ? 'Achievement updated successfully!' : 'Achievement added successfully!');
        setShowModal(false);
        setShowModalDiscardConfirm(false);
        loadSubordinateCounts(mbrId, sorted);
      } else {
        if (editingAchievementId) {
          await taskApi.updateAchievement(editingAchievementId, payload);
          setSuccessMsg('Achievement updated successfully!');
        } else {
          await taskApi.createAchievement(payload);
          setSuccessMsg('Achievement added successfully!');
        }

        setShowModal(false);
        setShowModalDiscardConfirm(false);
        const refreshed = await taskApi.getAchievements(mbrId);
        const sorted = sortAchievementList(refreshed);
        setAchievementList(sorted);
        loadSubordinateCounts(mbrId, sorted);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to save achievement.');
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE MODAL HANDLERS ---
  const promptDeleteAchievement = (ach: Achievement) => {
    setDeleteTargetAchievement(ach);
  };

  const executeDeleteAchievement = async () => {
    if (!deleteTargetAchievement) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTargetAchievement.mbrAchievementId;

    try {
      if (isSandbox) {
        const nextList = achievementList.filter((a) => a.mbrAchievementId !== targetId);
        const sorted = sortAchievementList(nextList);
        setAchievementList(sorted);
        sessionStorage.setItem('sandbox_achievements', JSON.stringify(sorted));
        setSuccessMsg('Achievement deleted successfully!');
      } else {
        await taskApi.deleteAchievement(targetId);
        const dbAchievements = await taskApi.getAchievements(mbrId);
        setAchievementList(sortAchievementList(dbAchievements));
        setSuccessMsg('Achievement deleted successfully!');
      }
      setDeleteTargetAchievement(null);
    } catch (err: any) {
      setError(`Failed to delete achievement: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Gallery Open Handlers
  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Achievements');
    setShowAchievementGalleryModal(true);
  };

  const handleOpenAchievementSubordinateGalleryModal = (ach: Achievement) => {
    setActiveGallerySubordinateId(ach.mbrAchievementId);
    setActiveGalleryTitle(`Achievement (${ach.mbrAchievementTitle})`);
    setShowAchievementGalleryModal(true);
  };

  // Helper for formatting date strings as "MON YYYY" (e.g. "APR 2018")
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

  // --- COLUMN SORTING HANDLER ---
  const handleSort = (column: 'title' | 'date') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  // Computed Sorted List (Most recent on top by default)
  const sortedAchievementList = useMemo(() => {
    if (!Array.isArray(achievementList)) return [];
    return [...achievementList].sort((a, b) => {
      if (sortColumn === 'title') {
        const titleA = (a.mbrAchievementTitle || '').toLowerCase();
        const titleB = (b.mbrAchievementTitle || '').toLowerCase();
        const comparison = titleA.localeCompare(titleB);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'date') {
        const dateA = a.mbrAchievementDate || '';
        const dateB = b.mbrAchievementDate || '';
        const comparison = dateA.localeCompare(dateB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, [achievementList, sortColumn, sortDirection]);

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
            detail: { topicId: 'achievements', topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement' }
          }))}
          className="flex items-center gap-2 sm:gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98 min-w-0"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2 sm:p-2.5 bg-amber-50/50 group-hover/topic:bg-amber-100/70 border border-amber-100 group-hover/topic:border-amber-200 text-amber-700 rounded-xl transition-all shadow-2xs shrink-0">
            <Trophy className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block truncate">
              {headerStoryCount > 0 ? `Status: ${headerStoryCount} Stories` : 'Status: Draft'}
            </span>
            <span className="block font-serif text-base sm:text-lg font-bold text-slate-800 group-hover/topic:text-amber-700 transition-colors truncate">
              Achievements
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
              <span className="hidden xs:inline">Add Achievement</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {/* Desktop Expanded Icon Bar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Button with Count Badge */}
            <button
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-emerald-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Achievements Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
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
                detail: { topicId: 'achievements', topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement' }
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
          <div className="sm:hidden relative inline-flex items-center achievement-header-menu-container">
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
                          detail: { topicId: 'achievements', topicTitle: 'Achievements', componentName: 'sbMbrStryAchievement' }
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

      {/* --- ACHIEVEMENTS LIST --- */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-serif">Loading achievements...</span>
        </div>
      ) : sortedAchievementList.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#EFECE7] rounded-2xl bg-white/50">
          <Trophy className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="font-serif font-bold text-sm text-slate-700">No achievements added yet</h4>
          <p className="text-xs text-slate-400 font-serif max-w-sm mt-1 mb-4">
            {readOnly
              ? "This member hasn't added any achievements to their storybook yet."
              : "Document awards, honors, milestone recognitions, and major life achievements."}
          </p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Achievement</span>
            </button>
          )}
        </div>
      ) : (
        <div className="w-full">
          <div className="w-full overflow-hidden border border-[#EFECE7] rounded-2xl bg-white shadow-2xs divide-y divide-[#EFECE7]">
            {/* Header / Sort Bar */}
            <div className="bg-[#FAF8F5] px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider select-none">
              <button
                type="button"
                onClick={() => handleSort('title')}
                className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
              >
                <span>Achievement</span>
                {sortColumn === 'title' ? (
                  sortDirection === 'asc' ? (
                    <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                  ) : (
                    <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-600 shrink-0" />
                  )
                ) : (
                  <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                )}
              </button>

              <div className="flex items-center gap-3 sm:gap-6">
                <button
                  type="button"
                  onClick={() => handleSort('date')}
                  className="group/btn inline-flex items-center gap-1 cursor-pointer select-none font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                >
                  <span>Date</span>
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
                <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
              </div>
            </div>

            {/* Achievement Items */}
            {sortedAchievementList.map((ach, idx) => {
              const sCount = achievementStoriesMap[ach.mbrAchievementId] || 0;
              const pCount = achievementPhotosMap[ach.mbrAchievementId] || 0;
              const isMenuOpen = activeActionMenuId === ach.mbrAchievementId;

              return (
                <div
                  key={ach.mbrAchievementId}
                  className="p-2.5 sm:p-3.5 hover:bg-amber-50/20 transition-colors group/row flex items-start gap-2 sm:gap-2.5"
                >
                  {/* Trophy Icon Badge */}
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg shrink-0 border border-amber-100/80 mt-0.5">
                    <Trophy className="w-3.5 h-3.5" />
                  </div>

                  {/* Main Content Column (Title & Actions on Line 1, Description on Line 2) */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* Line 1: Title on left, Date and Action Icons on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      {/* Achievement Title */}
                      <span className="font-serif font-bold text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                        {ach.mbrAchievementTitle}
                      </span>

                      {/* Right: Date and Action Icons */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                        {/* Date */}
                        <span className="inline-block px-2 py-0.5 rounded-lg text-[10.5px] sm:text-xs font-mono font-medium text-slate-700 bg-slate-50 border border-slate-200/80 shadow-2xs">
                          {formatMonYear(ach.mbrAchievementDate)}
                        </span>

                        {/* Desktop Action Icons */}
                        <div className="hidden sm:flex items-center gap-1">
                          {/* Photo Gallery Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenAchievementSubordinateGalleryModal(ach)}
                            className="relative p-1 text-slate-400 hover:text-emerald-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Achievement Photos${pCount > 0 ? ` (${pCount} photos)` : ''}`}
                          >
                            <Images className="w-3.5 h-3.5 text-emerald-600" />
                            {pCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-emerald-600 text-white rounded-full leading-none shadow-xs">
                                {pCount}
                              </span>
                            )}
                          </button>

                          {/* Storybook Button */}
                          <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                              detail: { 
                                topicId: 'achievements', 
                                topicTitle: 'Achievements', 
                                componentName: 'sbMbrStryAchievement',
                                subordinateId: ach.mbrAchievementId,
                                subordinateTitle: ach.mbrAchievementTitle
                              }
                            }))}
                            className="relative p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title={readOnly ? `View Stories${sCount > 0 ? ` (${sCount})` : ''}` : `Story Editor${sCount > 0 ? ` (${sCount})` : ''}`}
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            {sCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-amber-500 text-white rounded-full leading-none shadow-xs">
                                {sCount}
                              </span>
                            )}
                          </button>

                          {!readOnly && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(ach)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit achievement"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteAchievement(ach)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Delete achievement"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile Action 3-Dots Dropdown */}
                        <div className="sm:hidden relative inline-flex items-center justify-end achievement-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(isMenuOpen ? null : ach.mbrAchievementId);
                            }}
                            className={`p-1 rounded-lg border transition-colors cursor-pointer ${
                              isMenuOpen 
                                ? 'bg-blue-50 text-blue-700 border-blue-200' 
                                : 'text-slate-400 hover:text-slate-700 border-transparent hover:border-slate-200 hover:bg-slate-100'
                            }`}
                            title="Actions"
                            aria-label="Actions"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                            {(pCount > 0 || sCount > 0) && (
                              <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 rounded-full bg-blue-600 ring-1 ring-white" />
                            )}
                          </button>

                          <AnimatePresence>
                            {isMenuOpen && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedAchievementList.length - 2 && sortedAchievementList.length > 2 ? 6 : -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 ${
                                  idx >= sortedAchievementList.length - 2 && sortedAchievementList.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1'
                                } z-40 bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenAchievementSubordinateGalleryModal(ach);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Photos</span>
                                    </div>
                                    {pCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
                                        {pCount}
                                      </span>
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      window.dispatchEvent(new CustomEvent('open-story-editor', {
                                        detail: { 
                                          topicId: 'achievements', 
                                          topicTitle: 'Achievements', 
                                          componentName: 'sbMbrStryAchievement',
                                          subordinateId: ach.mbrAchievementId,
                                          subordinateTitle: ach.mbrAchievementTitle
                                        }
                                      }));
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <BookOpen className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                                      <span>{readOnly ? 'View Stories' : 'Story Editor'}</span>
                                    </div>
                                    {sCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800">
                                        {sCount}
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
                                        handleOpenEditModal(ach);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDeleteAchievement(ach);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Delete</span>
                                    </button>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Line 2: Achievement Description Underneath - perfectly left aligned with title */}
                    {ach.mbrAchievementDescription && (
                      <p className="text-[11px] sm:text-xs text-slate-500 font-serif leading-relaxed break-words pr-1">
                        {ach.mbrAchievementDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ADD / EDIT ACHIEVEMENT POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {showModal && (
          <div 
            key="achievement-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestCloseModal();
              }
            }}
          >
            <motion.div
              key="achievement-modal-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-50 text-amber-700 border border-amber-100 rounded-2xl shrink-0">
                    <Trophy className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      {editingAchievementId ? 'Edit Achievement' : 'Add Achievement'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-serif mt-0.5 flex items-center gap-1.5">
                      <span>Document an award, honor, publication, or milestone in your storybook.</span>
                      {hasModalUnsavedChanges && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-amber-800 shrink-0">
                          Unsaved edits
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRequestCloseModal}
                  disabled={saving}
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Body / Form */}
              <form onSubmit={handleSaveModal} className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {modalError && (
                  <div className="bg-rose-50 border-l-4 border-rose-500 text-rose-800 p-3 rounded-xl text-xs font-medium flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Title */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Achievement Title / Honor <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pulitzer Prize in Biography, Dean's List, Employee of the Year"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Date */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Date Awarded / Completed
                  </label>
                  <input
                    type="date"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Description & Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide additional context, presenting organization, or personal significance..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-amber-500 focus:outline-none transition-colors resize-y"
                  />
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end gap-3 pt-3.5 border-t border-[#EFECE7] shrink-0">
                  <button
                    type="button"
                    onClick={handleRequestCloseModal}
                    disabled={saving}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 font-sans"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/10 transition-all cursor-pointer disabled:opacity-50 border border-blue-600 font-sans"
                  >
                    {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>{editingAchievementId ? 'Save Changes' : 'Save Achievement'}</span>
                  </button>
                </div>
              </form>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showModalDiscardConfirm && (
                  <div key="achievement-discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
                    <motion.div
                      key="achievement-discard-confirm-dialog"
                      initial={{ opacity: 0, scale: 0.92, y: 8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: 8 }}
                      className="bg-white rounded-2xl p-5 shadow-2xl border border-slate-200 max-w-sm w-full text-center flex flex-col items-center"
                    >
                      <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-3">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <h4 className="font-serif font-bold text-base text-slate-800">Discard Unsaved Changes?</h4>
                      <p className="text-xs text-slate-500 font-serif mt-1.5 mb-5 leading-relaxed">
                        You have unsaved changes to this achievement. If you leave now, these changes will be discarded.
                      </p>
                      <div className="flex items-center gap-2.5 w-full">
                        <button
                          type="button"
                          onClick={handleCancelDiscardModal}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                        >
                          Keep Editing
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmDiscardModal}
                          className="flex-1 py-2 px-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shadow-sm"
                        >
                          Discard Changes
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- DELETE CONFIRMATION MODAL DIALOG --- */}
      <AnimatePresence>
        {deleteTargetAchievement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-sm w-full relative flex flex-col text-center"
            >
              <div className="mx-auto w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3 border border-rose-100">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-base font-bold text-slate-800">
                Delete Achievement
              </h3>
              <p className="text-xs text-slate-500 font-serif mt-1 mb-5">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteTargetAchievement.mbrAchievementTitle}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTargetAchievement(null)}
                  disabled={deleting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteAchievement}
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
        isOpen={showAchievementGalleryModal}
        onClose={() => {
          setShowAchievementGalleryModal(false);
          loadSubordinateCounts(mbrId, achievementList);
        }}
        mbrId={mbrId}
        categoryCd="Achievements"
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
        topicName="Achievements"
        isSandbox={isSandbox}
      />

      <AdminComponentTag name="mbrStoryAchievementPanel" />
    </div>
  );
}

export { MbrStoryAchievementPanel, MbrStoryAchievementPanel as mbrStoryAchievementPanel, MbrStoryAchievementPanel as SbMbrStryAchievement };
