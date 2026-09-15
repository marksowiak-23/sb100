/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Loader2,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  BookOpen,
  Images,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  MoreVertical
} from 'lucide-react';
import { taskApi, MbrMedia } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryActivityPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryActivityProps = MbrStoryActivityPanelProps;

interface Activity {
  mbrActivityId: string;
  mbrId: string;
  mbrActivityName: string;
  mbrActivityDescription?: string;
  mbrActivityFrequencyCd?: string;
}

const FREQUENCY_OPTIONS = [
  { cdValue: 'DLY', cdDesc: 'Daily' },
  { cdValue: 'WKLY', cdDesc: 'Weekly' },
  { cdValue: 'MTHY', cdDesc: 'Monthly' },
  { cdValue: 'ANLY', cdDesc: 'Annually' },
  { cdValue: 'OCAS', cdDesc: 'Occasionally' }
];

const SANDBOX_ACTIVITIES: Activity[] = [
  {
    mbrActivityId: 'a1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Oil Painting',
    mbrActivityDescription: 'Creating landscape and portrait paintings using traditional oil techniques.',
    mbrActivityFrequencyCd: 'WKLY'
  },
  {
    mbrActivityId: 'a2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Daily Journaling',
    mbrActivityDescription: 'Writing morning pages and keeping track of daily thoughts and ideas.',
    mbrActivityFrequencyCd: 'DLY'
  },
  {
    mbrActivityId: 'a3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrActivityName: 'Historical Research',
    mbrActivityDescription: 'Researching local architectural history and archives.',
    mbrActivityFrequencyCd: 'MTHY'
  }
];

export default function MbrStoryActivityPanel({
  isSandbox = false,
  memberId,
  readOnly = false
}: MbrStoryActivityPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [activityList, setActivityList] = useState<Activity[]>([]);

  // Sorting state (default: name ascending)
  const [sortColumn, setSortColumn] = useState<'name' | 'frequency'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Subordinate counts tracking
  const [activityPhotosMap, setActivityPhotosMap] = useState<Record<string, number>>({});
  const [activityStoriesMap, setActivityStoriesMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingActivityId, setEditingActivityId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formFrequency, setFormFrequency] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Initial form states for tracking unsaved edits
  const [initialFormName, setInitialFormName] = useState('');
  const [initialFormFrequency, setInitialFormFrequency] = useState('');
  const [initialFormDescription, setInitialFormDescription] = useState('');
  const [showModalDiscardConfirm, setShowModalDiscardConfirm] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTargetActivity, setDeleteTargetActivity] = useState<Activity | null>(null);

  // Reusable Topic Privacy Settings Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Reusable Photo Gallery Modal State
  const [showActivityGalleryModal, setShowActivityGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('Activities & Hobbies');

  // Mobile Top Menu & Row Actions Menu State
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.activity-header-menu-container')) {
        setShowHeaderMenu(false);
      }
      if (!target.closest('.activity-action-menu-container')) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Check if Add/Edit form has unsaved edits
  const hasModalUnsavedChanges = useMemo(() => {
    return (
      formName.trim() !== initialFormName.trim() ||
      formFrequency !== initialFormFrequency ||
      formDescription.trim() !== initialFormDescription.trim()
    );
  }, [formName, formFrequency, formDescription, initialFormName, initialFormFrequency, initialFormDescription]);

  // Sorting helper
  const sortActivityList = (list: Activity[]) => {
    return [...list].sort((a, b) => {
      const nameA = (a.mbrActivityName || '').toLowerCase();
      const nameB = (b.mbrActivityName || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });
  };

  // Helper to load subordinate photo & story counts
  const loadSubordinateCounts = async (targetMbrId: string, currentActivities: Activity[]) => {
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
                if (cat === 'activity' || cat === 'activities' || cat === 'hobbies') {
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

        const genStoriesStr = sessionStorage.getItem('sandbox_stories_sbMbrStryActivity_all');
        if (genStoriesStr) {
          try {
            const parsed = JSON.parse(genStoriesStr);
            if (Array.isArray(parsed)) hdrStories = parsed.length;
          } catch {}
        }

        currentActivities.forEach((a) => {
          const key = `sandbox_stories_sbMbrStryActivity_${a.mbrActivityId}`;
          const item = sessionStorage.getItem(key);
          if (item) {
            try {
              const list = JSON.parse(item);
              if (Array.isArray(list)) storyCounts[a.mbrActivityId] = list.length;
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
              if (cat === 'activity' || cat === 'activities' || cat === 'hobbies') {
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
              const isActType = (
                s.mbrStoryTypeCd === 'sbMbrStryActivity' ||
                s.mbrStoryTypeCd === 'activities' ||
                s.mbrStoryTypeCd === 'activity' ||
                s.mbrStoryTypeCd === 'hobbies'
              );
              if (isActType) {
                if (s.mbrStorySubordinateId) {
                  storyCounts[s.mbrStorySubordinateId] = (storyCounts[s.mbrStorySubordinateId] || 0) + 1;
                } else {
                  hdrStories++;
                }
              }
            });
          }
        } catch (e) {
          console.warn('Could not load activity subordinate media and stories counts:', e);
        }
      }

      setActivityPhotosMap(photoCounts);
      setActivityStoriesMap(storyCounts);
      setHeaderPhotoCount(hdrPhotos);
      setHeaderStoryCount(hdrStories);
    } catch (err) {
      console.warn('Error computing activity content counts:', err);
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, activityList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, activityList, isSandbox]);

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

      let loadedActivities: Activity[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_activities');
        if (saved) {
          loadedActivities = sortActivityList(JSON.parse(saved));
        } else {
          loadedActivities = sortActivityList(SANDBOX_ACTIVITIES);
          sessionStorage.setItem('sandbox_activities', JSON.stringify(loadedActivities));
        }
      } else {
        try {
          const dbActivities = await taskApi.getActivities(currentMbrId);
          if (dbActivities && dbActivities.length > 0) {
            loadedActivities = sortActivityList(dbActivities);
          } else if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            loadedActivities = sortActivityList(SANDBOX_ACTIVITIES);
          } else {
            loadedActivities = [];
          }
        } catch (e) {
          console.warn("Could not load activities from DB, using fallback sandbox:", e);
          loadedActivities = sortActivityList(SANDBOX_ACTIVITIES);
        }
      }

      setActivityList(loadedActivities);
      await loadSubordinateCounts(currentMbrId, loadedActivities);
    } catch (err: any) {
      setError(`Failed to load activities: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- ADD / EDIT MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingActivityId(null);
    setFormName('');
    setFormFrequency('');
    setFormDescription('');
    setInitialFormName('');
    setInitialFormFrequency('');
    setInitialFormDescription('');
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (act: Activity) => {
    const n = act.mbrActivityName || '';
    const f = act.mbrActivityFrequencyCd || '';
    const desc = act.mbrActivityDescription || '';
    setEditingActivityId(act.mbrActivityId);
    setFormName(n);
    setFormFrequency(f);
    setFormDescription(desc);
    setInitialFormName(n);
    setInitialFormFrequency(f);
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
    if (!formName.trim()) {
      setModalError('Activity / Hobby Name is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        mbrId,
        mbrActivityName: formName.trim(),
        mbrActivityFrequencyCd: formFrequency || undefined,
        mbrActivityDescription: formDescription.trim() ? formDescription.trim() : undefined
      };

      let nextList: Activity[] = [];

      if (isSandbox) {
        if (editingActivityId) {
          nextList = activityList.map((a) =>
            a.mbrActivityId === editingActivityId
              ? { ...a, ...payload }
              : a
          );
        } else {
          const newAct: Activity = {
            mbrActivityId: `act_${Date.now()}`,
            ...payload
          };
          nextList = [newAct, ...activityList];
        }

        const sorted = sortActivityList(nextList);
        setActivityList(sorted);
        sessionStorage.setItem('sandbox_activities', JSON.stringify(sorted));
        setSuccessMsg(editingActivityId ? 'Activity updated successfully!' : 'Activity added successfully!');
        setShowModal(false);
        setShowModalDiscardConfirm(false);
        loadSubordinateCounts(mbrId, sorted);
      } else {
        if (editingActivityId) {
          await taskApi.updateActivity(editingActivityId, payload);
          setSuccessMsg('Activity updated successfully!');
        } else {
          await taskApi.createActivity(payload);
          setSuccessMsg('Activity added successfully!');
        }

        setShowModal(false);
        setShowModalDiscardConfirm(false);
        const refreshed = await taskApi.getActivities(mbrId);
        const sorted = sortActivityList(refreshed);
        setActivityList(sorted);
        loadSubordinateCounts(mbrId, sorted);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to save activity.');
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE MODAL HANDLERS ---
  const promptDeleteActivity = (act: Activity) => {
    setDeleteTargetActivity(act);
  };

  const executeDeleteActivity = async () => {
    if (!deleteTargetActivity) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTargetActivity.mbrActivityId;

    try {
      if (isSandbox) {
        const nextList = activityList.filter((a) => a.mbrActivityId !== targetId);
        const sorted = sortActivityList(nextList);
        setActivityList(sorted);
        sessionStorage.setItem('sandbox_activities', JSON.stringify(sorted));
        setSuccessMsg('Activity deleted successfully!');
      } else {
        await taskApi.deleteActivity(targetId);
        const dbActivities = await taskApi.getActivities(mbrId);
        setActivityList(sortActivityList(dbActivities));
        setSuccessMsg('Activity deleted successfully!');
      }
      setDeleteTargetActivity(null);
    } catch (err: any) {
      setError(`Failed to delete activity: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Gallery Open Handlers
  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Activities & Hobbies');
    setShowActivityGalleryModal(true);
  };

  const handleOpenActivitySubordinateGalleryModal = (act: Activity) => {
    setActiveGallerySubordinateId(act.mbrActivityId);
    setActiveGalleryTitle(`Activity (${act.mbrActivityName})`);
    setShowActivityGalleryModal(true);
  };

  // Frequency Label & Color Helpers
  const getFrequencyLabel = (cd: string | undefined) => {
    if (!cd) return 'N/A';
    const opt = FREQUENCY_OPTIONS.find((o) => o.cdValue === cd);
    return opt ? opt.cdDesc : cd;
  };

  const getFrequencyBadgeColor = (cd: string | undefined) => {
    switch (cd) {
      case 'DLY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case 'WKLY':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'MTHY':
        return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'ANLY':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      case 'OCAS':
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  // --- COLUMN SORTING HANDLER ---
  const handleSort = (column: 'name' | 'frequency') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Computed Sorted List
  const sortedActivityList = useMemo(() => {
    if (!Array.isArray(activityList)) return [];
    return [...activityList].sort((a, b) => {
      if (sortColumn === 'name') {
        const nameA = (a.mbrActivityName || '').toLowerCase();
        const nameB = (b.mbrActivityName || '').toLowerCase();
        const comparison = nameA.localeCompare(nameB);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'frequency') {
        const freqA = (getFrequencyLabel(a.mbrActivityFrequencyCd) || '').toLowerCase();
        const freqB = (getFrequencyLabel(b.mbrActivityFrequencyCd) || '').toLowerCase();
        const comparison = freqA.localeCompare(freqB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, [activityList, sortColumn, sortDirection]);

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
            detail: { topicId: 'hobbies', topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity' }
          }))}
          className="flex items-center gap-2 sm:gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98 min-w-0"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2 sm:p-2.5 bg-indigo-50/50 group-hover/topic:bg-indigo-100/70 border border-indigo-100 group-hover/topic:border-indigo-200 text-indigo-700 rounded-xl transition-all shadow-2xs shrink-0">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block truncate">
              {headerStoryCount > 0 ? `Status: ${headerStoryCount} Stories` : 'Status: Draft'}
            </span>
            <span className="block font-serif text-base sm:text-lg font-bold text-slate-800 group-hover/topic:text-indigo-700 transition-colors truncate">
              Activities & Hobbies
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
              <span className="hidden xs:inline">Add Activity</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {/* Desktop Expanded Icon Bar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Button with Count Badge */}
            <button
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-indigo-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Activities Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-indigo-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-indigo-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Storybook Icon Button with Count Badge */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                detail: { topicId: 'hobbies', topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity' }
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
          <div className="sm:hidden relative inline-flex items-center activity-header-menu-container">
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
                        <Images className="w-4 h-4 text-indigo-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
                          {headerPhotoCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        window.dispatchEvent(new CustomEvent('open-story-editor', {
                          detail: { topicId: 'hobbies', topicTitle: 'Activities and Hobbies', componentName: 'sbMbrStryActivity' }
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

      {/* --- ACTIVITIES LIST --- */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-serif">Loading activities...</span>
        </div>
      ) : sortedActivityList.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#EFECE7] rounded-2xl bg-white/50">
          <Sparkles className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="font-serif font-bold text-sm text-slate-700">No activities or hobbies added yet</h4>
          <p className="text-xs text-slate-400 font-serif max-w-sm mt-1 mb-4">
            {readOnly
              ? "This member hasn't added any activities or hobbies to their storybook yet."
              : "Document personal pastimes, creative pursuits, sports, and recurring hobbies."}
          </p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Your First Activity</span>
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
                onClick={() => handleSort('name')}
                className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
              >
                <span>Activity / Hobby</span>
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

              <div className="flex items-center gap-3 sm:gap-6">
                <button
                  type="button"
                  onClick={() => handleSort('frequency')}
                  className="group/btn inline-flex items-center gap-1 cursor-pointer select-none font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                >
                  <span>Frequency</span>
                  {sortColumn === 'frequency' ? (
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

            {/* Activity Items */}
            {sortedActivityList.map((act, idx) => {
              const sCount = activityStoriesMap[act.mbrActivityId] || 0;
              const pCount = activityPhotosMap[act.mbrActivityId] || 0;
              const isMenuOpen = activeActionMenuId === act.mbrActivityId;

              return (
                <div
                  key={act.mbrActivityId}
                  className="p-2.5 sm:p-3.5 hover:bg-indigo-50/20 transition-colors group/row flex items-start gap-2 sm:gap-2.5"
                >
                  {/* Sparkles Icon Badge */}
                  <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 border border-indigo-100/80 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>

                  {/* Main Content Column (Title & Actions on Line 1, Description on Line 2) */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* Line 1: Title on left, Frequency and Action Icons on right */}
                    <div className="flex items-center justify-between gap-2 min-w-0">
                      {/* Activity Title */}
                      <span className="font-serif font-bold text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                        {act.mbrActivityName}
                      </span>

                      {/* Right: Frequency Badge and Action Icons */}
                      <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                        {/* Frequency */}
                        <span className={`inline-block px-2 py-0.5 rounded-lg text-[10.5px] sm:text-xs font-mono font-medium border shadow-2xs ${getFrequencyBadgeColor(act.mbrActivityFrequencyCd)}`}>
                          {getFrequencyLabel(act.mbrActivityFrequencyCd)}
                        </span>

                        {/* Desktop Action Icons */}
                        <div className="hidden sm:flex items-center gap-1">
                          {/* Photo Gallery Button */}
                          <button
                            type="button"
                            onClick={() => handleOpenActivitySubordinateGalleryModal(act)}
                            className="relative p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title={`Activity Photos${pCount > 0 ? ` (${pCount} photos)` : ''}`}
                          >
                            <Images className="w-3.5 h-3.5 text-indigo-600" />
                            {pCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-indigo-600 text-white rounded-full leading-none shadow-xs">
                                {pCount}
                              </span>
                            )}
                          </button>

                          {/* Storybook Button */}
                          <button
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                              detail: { 
                                topicId: 'hobbies', 
                                topicTitle: 'Activities and Hobbies', 
                                componentName: 'sbMbrStryActivity',
                                subordinateId: act.mbrActivityId,
                                subordinateTitle: act.mbrActivityName
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
                                onClick={() => handleOpenEditModal(act)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Edit activity"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteActivity(act)}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                                title="Delete activity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile Action 3-Dots Dropdown */}
                        <div className="sm:hidden relative inline-flex items-center justify-end activity-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(isMenuOpen ? null : act.mbrActivityId);
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
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedActivityList.length - 2 && sortedActivityList.length > 2 ? 6 : -4 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 ${
                                  idx >= sortedActivityList.length - 2 && sortedActivityList.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1'
                                } z-40 bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenActivitySubordinateGalleryModal(act);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                      <span>Photos</span>
                                    </div>
                                    {pCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700">
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
                                          topicId: 'hobbies', 
                                          topicTitle: 'Activities and Hobbies', 
                                          componentName: 'sbMbrStryActivity',
                                          subordinateId: act.mbrActivityId,
                                          subordinateTitle: act.mbrActivityName
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
                                        handleOpenEditModal(act);
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
                                        promptDeleteActivity(act);
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

                    {/* Line 2: Activity Description Underneath - perfectly left-aligned with title */}
                    {act.mbrActivityDescription && (
                      <p className="text-[11px] sm:text-xs text-slate-500 font-serif leading-relaxed break-words pr-1">
                        {act.mbrActivityDescription}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* --- ADD / EDIT ACTIVITY POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {showModal && (
          <div 
            key="activity-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestCloseModal();
              }
            }}
          >
            <motion.div
              key="activity-modal-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-2xl shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      {editingActivityId ? 'Edit Activity' : 'Add Activity'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-serif mt-0.5 flex items-center gap-1.5">
                      <span>Document a hobby, personal interest, or creative pursuit in your storybook.</span>
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

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Activity / Hobby Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Oil Painting, Gardening, Marathon Running, Chess"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Frequency */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Frequency / Regularity
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    <option value="">Select frequency (optional)</option>
                    {FREQUENCY_OPTIONS.map((opt) => (
                      <option key={opt.cdValue} value={opt.cdValue}>
                        {opt.cdDesc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Description & Details
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe your involvement, favorite techniques, memorable experiences, or milestones..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:outline-none transition-colors resize-y"
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
                    <span>{editingActivityId ? 'Save Changes' : 'Save Activity'}</span>
                  </button>
                </div>
              </form>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showModalDiscardConfirm && (
                  <div key="activity-discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
                    <motion.div
                      key="activity-discard-confirm-dialog"
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
                        You have unsaved changes to this activity. If you leave now, these changes will be discarded.
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
        {deleteTargetActivity && (
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
                Delete Activity
              </h3>
              <p className="text-xs text-slate-500 font-serif mt-1 mb-5">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteTargetActivity.mbrActivityName}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTargetActivity(null)}
                  disabled={deleting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteActivity}
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
        isOpen={showActivityGalleryModal}
        onClose={() => {
          setShowActivityGalleryModal(false);
          loadSubordinateCounts(mbrId, activityList);
        }}
        mbrId={mbrId}
        categoryCd="Activities"
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
        topicName="Activities & Hobbies"
        isSandbox={isSandbox}
      />

      <AdminComponentTag name="mbrStoryActivityPanel" />
    </div>
  );
}

export { MbrStoryActivityPanel, MbrStoryActivityPanel as mbrStoryActivityPanel, MbrStoryActivityPanel as SbMbrStryActivity };
