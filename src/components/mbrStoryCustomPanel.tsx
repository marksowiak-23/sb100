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
  MoreVertical,
  Layers
} from 'lucide-react';
import { taskApi, MbrMedia, MbrTopicCustom } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryCustomPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryCustomProps = MbrStoryCustomPanelProps;

const SANDBOX_CUSTOM_TOPICS: MbrTopicCustom[] = [
  {
    mbrCustomTopicId: 'ct_1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrCustomTopicName: 'Pacific Road Trips',
    mbrCustomTopicDesc: 'Memories, coastal drives, and roadside diner stops along the scenic Pacific Coast Highway.',
    mbrCustomTopicCreatedAt: '2024-06-15T10:30:00Z',
    mbrCustomTopicUpdatedAt: '2024-06-15T10:30:00Z'
  },
  {
    mbrCustomTopicId: 'ct_2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrCustomTopicName: 'Vintage Book Collecting',
    mbrCustomTopicDesc: 'Hunting for rare first editions and signed memoirs in dusty coastal antiquarian bookshops.',
    mbrCustomTopicCreatedAt: '2024-08-20T14:15:00Z',
    mbrCustomTopicUpdatedAt: '2024-08-20T14:15:00Z'
  }
];

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  } catch {}
  return dateStr;
};

export default function MbrStoryCustomPanel({
  isSandbox = false,
  memberId,
  readOnly = false
}: MbrStoryCustomPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [topicList, setTopicList] = useState<MbrTopicCustom[]>([]);

  // Sorting state (default: name ascending)
  const [sortColumn, setSortColumn] = useState<'name' | 'date'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Subordinate counts tracking
  const [topicPhotosMap, setTopicPhotosMap] = useState<Record<string, number>>({});
  const [topicStoriesMap, setTopicStoriesMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Initial form states for tracking unsaved edits
  const [initialFormName, setInitialFormName] = useState('');
  const [initialFormDescription, setInitialFormDescription] = useState('');
  const [showModalDiscardConfirm, setShowModalDiscardConfirm] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTargetTopic, setDeleteTargetTopic] = useState<MbrTopicCustom | null>(null);

  // Topic Privacy Settings Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Photo Gallery Modal State
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('Custom Topics');

  // Mobile Top Menu & Row Actions Menu State
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.custom-header-menu-container')) {
        setShowHeaderMenu(false);
      }
      if (!target.closest('.custom-action-menu-container')) {
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
      formDescription.trim() !== initialFormDescription.trim()
    );
  }, [formName, formDescription, initialFormName, initialFormDescription]);

  // Load Subordinate Story and Photo Counts for each custom topic and header
  const loadSubordinateCounts = async (targetMbrId: string, currentTopics: MbrTopicCustom[]) => {
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
                if (cat === 'custom' || cat === 'other') {
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

        const genStoriesStr = sessionStorage.getItem('sandbox_stories_sbMbrStryCustom_all');
        if (genStoriesStr) {
          try {
            const parsed = JSON.parse(genStoriesStr);
            if (Array.isArray(parsed)) hdrStories = parsed.length;
          } catch {}
        }

        currentTopics.forEach((t) => {
          const key = `sandbox_stories_sbMbrStryCustom_${t.mbrCustomTopicId}`;
          const item = sessionStorage.getItem(key);
          if (item) {
            try {
              const list = JSON.parse(item);
              if (Array.isArray(list)) storyCounts[t.mbrCustomTopicId] = list.length;
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
              if (cat === 'custom' || cat === 'other') {
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
              const isCustomStory = (
                s.mbrStoryTypeCd === 'sbMbrStryCustom' ||
                s.mbrStoryTypeCd === 'Custom' ||
                s.mbrStoryTypeCd === 'Other' ||
                s.mbrStoryTypeCd === 'sbMbrStryOther'
              );
              if (isCustomStory) {
                if (s.mbrStorySubordinateId) {
                  storyCounts[s.mbrStorySubordinateId] = (storyCounts[s.mbrStorySubordinateId] || 0) + 1;
                } else {
                  hdrStories++;
                }
              }
            });
          }
        } catch (e) {
          console.warn('Could not load custom topic subordinate media and stories counts:', e);
        }
      }

      setTopicPhotosMap(photoCounts);
      setTopicStoriesMap(storyCounts);
      setHeaderPhotoCount(hdrPhotos);
      setHeaderStoryCount(hdrStories);
    } catch (err) {
      console.warn('Error computing custom topic content counts:', err);
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, topicList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, topicList, isSandbox]);

  // Helper to resolve effective member ID from props or session
  const resolveEffectiveMbrId = async (): Promise<string> => {
    if (memberId && memberId !== 'm1') return memberId;
    
    // 1. Try cached member profile
    const storedMbr = sessionStorage.getItem('sb_current_mbr');
    if (storedMbr) {
      try {
        const parsed = JSON.parse(storedMbr);
        if (parsed && parsed.mbrId) return parsed.mbrId;
      } catch {}
    }

    // 2. Try logged-in user profile
    const userStr = sessionStorage.getItem('user');
    if (userStr && !isSandbox) {
      try {
        const u = JSON.parse(userStr);
        if (u.user_id) {
          const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
          if (mbrProfile && mbrProfile.mbrId) {
            return mbrProfile.mbrId;
          }
        }
      } catch (e) {
        console.warn("Could not retrieve member profile ID from user_id:", e);
      }
    }

    // 3. Fallback to Mark Sowiak default UUID
    return '299da1e4-a233-4333-ab7c-b9ca64b6b7d4';
  };

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    loadData();
  }, [isSandbox, memberId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const currentMbrId = await resolveEffectiveMbrId();
      setMbrId(currentMbrId);

      let loadedTopics: MbrTopicCustom[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_custom_topics');
        if (saved) {
          loadedTopics = JSON.parse(saved);
        } else {
          loadedTopics = SANDBOX_CUSTOM_TOPICS;
          sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(loadedTopics));
        }
      } else {
        try {
          const dbTopics = await taskApi.getCustomTopics(currentMbrId);
          if (dbTopics && Array.isArray(dbTopics)) {
            loadedTopics = dbTopics;
          } else if (memberId === 'm1') {
            loadedTopics = SANDBOX_CUSTOM_TOPICS;
          } else {
            loadedTopics = [];
          }
        } catch (e) {
          console.warn("Could not load custom topics from DB, using fallback sandbox:", e);
          loadedTopics = SANDBOX_CUSTOM_TOPICS;
        }
      }

      setTopicList(loadedTopics);
      await loadSubordinateCounts(currentMbrId, loadedTopics);
    } catch (err: any) {
      setError(`Failed to load custom topics: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- ADD / EDIT MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingTopicId(null);
    setFormName('');
    setFormDescription('');
    setInitialFormName('');
    setInitialFormDescription('');
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (topic: MbrTopicCustom) => {
    setEditingTopicId(topic.mbrCustomTopicId);
    const n = topic.mbrCustomTopicName || '';
    const d = topic.mbrCustomTopicDesc || '';
    setFormName(n);
    setFormDescription(d);
    setInitialFormName(n);
    setInitialFormDescription(d);
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    if (hasModalUnsavedChanges) {
      setShowModalDiscardConfirm(true);
      return;
    }
    setShowModal(false);
    setShowModalDiscardConfirm(false);
    setModalError(null);
  };

  const handleConfirmDiscard = () => {
    setShowModalDiscardConfirm(false);
    setShowModal(false);
    setModalError(null);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = formName.trim();
    if (!trimmedName) {
      setModalError('Topic name is required.');
      return;
    }
    if (trimmedName.length > 22) {
      setModalError('Topic name cannot exceed 22 characters.');
      return;
    }
    if (formDescription.length > 240) {
      setModalError('Topic description cannot exceed 240 characters.');
      return;
    }

    // Check duplicate name for this member
    const isDuplicate = topicList.some(
      (t) =>
        t.mbrCustomTopicName.trim().toLowerCase() === trimmedName.toLowerCase() &&
        t.mbrCustomTopicId !== editingTopicId
    );
    if (isDuplicate) {
      setModalError(`A custom topic named "${trimmedName}" already exists.`);
      return;
    }

    setSaving(true);
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    try {
      const targetMbrId = await resolveEffectiveMbrId();
      setMbrId(targetMbrId);

      if (isSandbox) {
        let updatedList: MbrTopicCustom[];
        if (editingTopicId) {
          updatedList = topicList.map((t) =>
            t.mbrCustomTopicId === editingTopicId
              ? {
                  ...t,
                  mbrCustomTopicName: trimmedName,
                  mbrCustomTopicDesc: formDescription.trim() || undefined,
                  mbrCustomTopicUpdatedAt: new Date().toISOString()
                }
              : t
          );
        } else {
          const newRecord: MbrTopicCustom = {
            mbrCustomTopicId: `ct_${Date.now()}`,
            mbrId: targetMbrId,
            mbrCustomTopicName: trimmedName,
            mbrCustomTopicDesc: formDescription.trim() || undefined,
            mbrCustomTopicCreatedAt: new Date().toISOString(),
            mbrCustomTopicUpdatedAt: new Date().toISOString()
          };
          updatedList = [...topicList, newRecord];
        }
        setTopicList(updatedList);
        sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(updatedList));
        await loadSubordinateCounts(targetMbrId, updatedList);
      } else {
        if (editingTopicId) {
          await taskApi.updateCustomTopic(editingTopicId, {
            mbrId: targetMbrId,
            mbrCustomTopicName: trimmedName,
            mbrCustomTopicDesc: formDescription.trim() || undefined
          });
        } else {
          await taskApi.createCustomTopic({
            mbrId: targetMbrId,
            mbrCustomTopicName: trimmedName,
            mbrCustomTopicDesc: formDescription.trim() || undefined
          });
        }

        const refreshed = await taskApi.getCustomTopics(targetMbrId);
        setTopicList(refreshed);
        await loadSubordinateCounts(targetMbrId, refreshed);
      }

      setSuccessMsg(editingTopicId ? 'Custom topic updated successfully!' : 'Custom topic created successfully!');
      setShowModal(false);
      setShowModalDiscardConfirm(false);
      window.dispatchEvent(new CustomEvent('stats-updated'));
    } catch (err: any) {
      setModalError(`Failed to save custom topic: ${err.message || err}`);
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE CONFIRMATION HANDLERS ---
  const handleOpenDeleteConfirm = (topic: MbrTopicCustom) => {
    setDeleteTargetTopic(topic);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetTopic) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const targetMbrId = await resolveEffectiveMbrId();
      const topicIdToDelete = deleteTargetTopic.mbrCustomTopicId;
      if (isSandbox) {
        const updatedList = topicList.filter((t) => t.mbrCustomTopicId !== topicIdToDelete);
        setTopicList(updatedList);
        sessionStorage.setItem('sandbox_custom_topics', JSON.stringify(updatedList));
        await loadSubordinateCounts(targetMbrId, updatedList);
      } else {
        await taskApi.deleteCustomTopic(topicIdToDelete);
        const refreshed = await taskApi.getCustomTopics(targetMbrId);
        setTopicList(refreshed);
        await loadSubordinateCounts(targetMbrId, refreshed);
      }

      setSuccessMsg(`Custom topic "${deleteTargetTopic.mbrCustomTopicName}" deleted.`);
      setDeleteTargetTopic(null);
      window.dispatchEvent(new CustomEvent('stats-updated'));
    } catch (err: any) {
      setError(`Failed to delete custom topic: ${err.message || err}`);
    } finally {
      setDeleting(false);
    }
  };

  // --- ACTION HANDLERS ---
  const handleWriteStory = (topic: MbrTopicCustom) => {
    window.dispatchEvent(
      new CustomEvent('open-story-editor', {
        detail: {
          subordinateId: topic.mbrCustomTopicId,
          subordinateName: topic.mbrCustomTopicName,
          topicId: 'other',
          topicTitle: topic.mbrCustomTopicName,
          componentName: 'sbMbrStryCustom',
          mbrStoryTopicName: topic.mbrCustomTopicName
        }
      })
    );
  };

  const handleOpenGallery = (subordinateId: string | null = null, galleryTitle: string = 'Custom Topics') => {
    setActiveGallerySubordinateId(subordinateId);
    setActiveGalleryTitle(galleryTitle);
    setShowGalleryModal(true);
  };

  // Sorting
  const sortedTopics = useMemo(() => {
    const list = [...topicList];
    return list.sort((a, b) => {
      if (sortColumn === 'name') {
        const nameA = (a.mbrCustomTopicName || '').toLowerCase();
        const nameB = (b.mbrCustomTopicName || '').toLowerCase();
        return sortDirection === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
      } else {
        const dateA = a.mbrCustomTopicCreatedAt || '';
        const dateB = b.mbrCustomTopicCreatedAt || '';
        return sortDirection === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      }
    });
  }, [topicList, sortColumn, sortDirection]);

  const handleSort = (column: 'name' | 'date') => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl shadow-[0_8px_20px_rgba(0,0,0,0.02)] overflow-hidden relative">
      {/* Rainbow / Golden Top Decorative Border */}
      <div className="h-1 bg-gradient-to-r from-amber-400 via-rose-400 to-indigo-500 w-full" />

      {/* Header Section */}
      <div className="p-5 md:p-6 border-b border-[#EFECE7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-xs">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-800 tracking-tight">
                Custom Topics
              </h2>
              <span className="px-2 py-0.5 rounded-full text-xs font-serif font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/60">
                {topicList.length}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-serif">
              Define custom topics and draft unique chapters for your StoryBook.
            </p>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden sm:flex items-center gap-2">
          {!readOnly && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Custom Topic</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => handleOpenGallery(null, 'Custom Topics Photo Gallery')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <Images className="w-3.5 h-3.5 text-indigo-500" />
            <span>Photos</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPrivacyModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-semibold bg-white border border-[#EFECE7] text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
            <span>Privacy</span>
          </button>
        </div>

        {/* Mobile Header Menu */}
        <div className="sm:hidden flex items-center justify-between pt-2 border-t border-slate-100 custom-header-menu-container relative">
          {!readOnly && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-bold bg-indigo-600 text-white shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Topic</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="p-1.5 rounded-lg border border-[#EFECE7] bg-white text-slate-600 hover:bg-slate-50"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {showHeaderMenu && (
              <div className="absolute right-0 mt-1 w-44 bg-white border border-[#EFECE7] rounded-xl shadow-lg z-20 py-1 font-serif text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setShowHeaderMenu(false);
                    handleOpenGallery(null, 'Custom Topics Photo Gallery');
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <Images className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Photo Gallery</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowHeaderMenu(false);
                    setShowPrivacyModal(true);
                  }}
                  className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                >
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                  <span>Privacy Settings</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="m-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs font-serif flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="m-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-750 text-xs font-serif flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="p-4 md:p-6">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400 font-serif text-xs">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
            <span>Loading custom topics...</span>
          </div>
        ) : sortedTopics.length === 0 ? (
          <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-sm font-bold text-slate-700">
              No Custom Topics Yet
            </h4>
            <p className="text-xs text-slate-500 font-serif max-w-sm">
              {readOnly
                ? 'This author has not created any custom topics yet.'
                : 'Create your first custom topic to organize unique stories and cherished reflections.'}
            </p>
            {!readOnly && (
              <button
                type="button"
                onClick={handleOpenAddModal}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-serif font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Custom Topic</span>
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table / List Header for Sort Controls */}
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider px-2">
              <button
                type="button"
                onClick={() => handleSort('name')}
                className="inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <span>Topic Name</span>
                {sortColumn === 'name' ? (
                  sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                ) : (
                  <ArrowUpDown className="w-3 h-3 opacity-40" />
                )}
              </button>

              <div className="flex items-center gap-6">
                <button
                  type="button"
                  onClick={() => handleSort('date')}
                  className="hidden md:inline-flex items-center gap-1 hover:text-slate-800 transition-colors cursor-pointer"
                >
                  <span>Created Date</span>
                  {sortColumn === 'date' ? (
                    sortDirection === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />
                  ) : (
                    <ArrowUpDown className="w-3 h-3 opacity-40" />
                  )}
                </button>
                <span className="text-right">Actions</span>
              </div>
            </div>            {/* Custom Topics Rows */}
            <div className="divide-y divide-slate-100">
              {sortedTopics.map((topic) => {
                const photoCount = topicPhotosMap[topic.mbrCustomTopicId] || 0;
                const storyCount = topicStoriesMap[topic.mbrCustomTopicId] || 0;

                return (
                  <div
                    key={topic.mbrCustomTopicId}
                    className="p-2.5 sm:p-3.5 hover:bg-indigo-50/20 rounded-2xl transition-colors group/row flex items-start gap-2.5"
                  >
                    {/* Custom Topic Icon */}
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg shrink-0 border border-indigo-100/80 mt-0.5">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>

                    {/* Main Content Column (Line 1: Topic Name & Actions on same line, Line 2: Description) */}
                    <div className="flex-1 min-w-0 flex flex-col gap-1">
                      {/* Line 1: Topic Name & Badges on left, Date and Action Icons on right (same line) */}
                      <div className="flex items-center justify-between gap-2 min-w-0">
                        {/* Topic Name & Badges */}
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <span className="font-serif font-bold text-slate-800 text-xs sm:text-[13px] leading-tight truncate">
                            {topic.mbrCustomTopicName}
                          </span>
                          {storyCount > 0 && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-serif font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                              <BookOpen className="w-2.5 h-2.5" />
                              {storyCount} {storyCount === 1 ? 'Story' : 'Stories'}
                            </span>
                          )}
                        </div>

                        {/* Right: Date & Action Icons on the same line */}
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto">
                          <span className="hidden md:inline-block text-xs text-slate-400 font-serif">
                            {formatDate(topic.mbrCustomTopicCreatedAt)}
                          </span>

                          {/* Desktop Action Buttons */}
                          <div className="hidden sm:flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleWriteStory(topic)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-serif font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition-colors cursor-pointer"
                              title="Open in Story Editor"
                            >
                              <BookOpen className="w-3 h-3" />
                              <span>Stories</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenGallery(topic.mbrCustomTopicId, `${topic.mbrCustomTopicName} Photos`)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="View Topic Photo Gallery"
                            >
                              <Images className="w-3.5 h-3.5" />
                            </button>

                            {!readOnly && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(topic)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                                  title="Edit Custom Topic"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleOpenDeleteConfirm(topic)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                                  title="Delete Custom Topic"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}
                          </div>

                          {/* Mobile Row Action Dropdown Menu */}
                          <div className="sm:hidden relative custom-action-menu-container">
                            <button
                              type="button"
                              onClick={() =>
                                setActiveActionMenuId(
                                  activeActionMenuId === topic.mbrCustomTopicId ? null : topic.mbrCustomTopicId
                                )
                              }
                              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                            >
                              <MoreVertical className="w-3.5 h-3.5" />
                            </button>

                            {activeActionMenuId === topic.mbrCustomTopicId && (
                              <div className="absolute right-0 mt-1 w-36 bg-white border border-[#EFECE7] rounded-xl shadow-lg z-20 py-1 font-serif text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handleWriteStory(topic);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-indigo-50 text-indigo-700 font-semibold"
                                >
                                  <BookOpen className="w-3 h-3" />
                                  <span>Story Editor</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveActionMenuId(null);
                                    handleOpenGallery(topic.mbrCustomTopicId, `${topic.mbrCustomTopicName} Photos`);
                                  }}
                                  className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                                >
                                  <Images className="w-3 h-3 text-indigo-500" />
                                  <span>Photos ({photoCount})</span>
                                </button>
                                {!readOnly && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        handleOpenEditModal(topic);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-slate-50 text-slate-700"
                                    >
                                      <Edit3 className="w-3 h-3 text-blue-500" />
                                      <span>Edit</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        handleOpenDeleteConfirm(topic);
                                      }}
                                      className="w-full text-left px-3 py-1.5 flex items-center gap-2 hover:bg-red-50 text-red-600 font-semibold"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                      <span>Delete</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Line 2: Description underneath */}
                      {topic.mbrCustomTopicDesc && (
                        <p className="text-xs text-slate-600 font-serif mt-0.5 leading-relaxed">
                          {topic.mbrCustomTopicDesc}
                        </p>
                      )}
                      <div className="text-[11px] text-slate-400 font-serif sm:hidden">
                        Added: {formatDate(topic.mbrCustomTopicCreatedAt)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD / EDIT TOPIC MODAL                                                    */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-2xl max-w-lg w-full relative"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="font-serif text-base font-bold text-slate-800">
                    {editingTopicId ? 'Edit Custom Topic' : 'Add Custom Topic'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSaveModal} className="mt-4 space-y-4 font-serif">
                {modalError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-750 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Topic Name */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Topic Name <span className="text-red-500">*</span>
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {formName.length}/22
                    </span>
                  </div>
                  <input
                    type="text"
                    maxLength={22}
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Pacific Road Trips"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs"
                  />
                </div>

                {/* Topic Description */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-700">
                      Description
                    </label>
                    <span className="text-[10px] text-slate-400">
                      {formDescription.length}/240
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    maxLength={240}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Brief description of this custom topic or chapter theme (up to 240 characters)..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-xs resize-none"
                  />
                </div>

                {/* Modal Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-100 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>{editingTopicId ? 'Save Changes' : 'Create Topic'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DISCARD CONFIRMATION MODAL                                                */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showModalDiscardConfirm && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xl max-w-sm w-full font-serif"
            >
              <div className="flex items-center gap-3 text-amber-600 mb-2">
                <AlertTriangle className="w-5 h-5" />
                <h4 className="font-bold text-sm text-slate-800">Unsaved Changes</h4>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                You have unsaved changes. Are you sure you want to discard them?
              </p>
              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModalDiscardConfirm(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 text-white hover:bg-red-700 shadow-xs"
                >
                  Discard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL                                                 */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {deleteTargetTopic && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl max-w-md w-full font-serif"
            >
              <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-red-600 mb-3">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-slate-800">
                Delete Custom Topic
              </h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Are you sure you want to delete the custom topic{' '}
                <strong>"{deleteTargetTopic.mbrCustomTopicName}"</strong>? This will permanently remove the topic from your database.
              </p>

              <div className="mt-6 flex items-center justify-end gap-2">
                <button
                  type="button"
                  disabled={deleting}
                  onClick={() => setDeleteTargetTopic(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-650 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={deleting}
                  onClick={handleConfirmDelete}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete Topic</span>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* PHOTO GALLERY MODAL                                                       */}
      {/* ========================================================================= */}
      <MbrPhotoGalleryPanel
        isOpen={showGalleryModal}
        onClose={() => {
          setShowGalleryModal(false);
          loadSubordinateCounts(mbrId, topicList);
        }}
        mbrId={mbrId}
        categoryCd="Custom"
        categoryTitle={activeGalleryTitle}
        subordinateId={activeGallerySubordinateId}
        isSandbox={isSandbox}
        readOnly={readOnly}
      />

      {/* ========================================================================= */}
      {/* TOPIC PRIVACY SETTINGS MODAL                                              */}
      {/* ========================================================================= */}
      <MbrTopicPrivacyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
        mbrId={mbrId}
        topicId="Other"
        topicName="Other"
        isSandbox={isSandbox}
      />

      <AdminComponentTag name="mbrStoryCustomPanel" />
    </div>
  );
}

export { MbrStoryCustomPanel, MbrStoryCustomPanel as mbrStoryCustomPanel, MbrStoryCustomPanel as SbMbrStryCustom };
