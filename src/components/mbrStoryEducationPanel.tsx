/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
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

export interface MbrStoryEducationPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryEducationProps = MbrStoryEducationPanelProps;

interface Education {
  mbrEducationId: string;
  mbrID: string;
  mbrEducationInstitutionalNm: string;
  mbrEducationDegreeCd: string; // e.g., High School, Associate, Bachelor’s, Master’s, PhD, Certificate, Other
  mbrEducationDesc?: string;
  mbrEducationStartDate?: string; // YYYY-MM-DD
  mbrEducationEndDate?: string;   // YYYY-MM-DD
}

const DEGREE_OPTIONS = [
  { cdValue: 'High School', cdDesc: 'High School' },
  { cdValue: 'Associate', cdDesc: "Associate's" },
  { cdValue: "Bachelor's", cdDesc: "Bachelor's" },
  { cdValue: "Master's", cdDesc: "Master's" },
  { cdValue: 'PhD', cdDesc: 'PhD / Doctorate' },
  { cdValue: 'Certificate', cdDesc: 'Certificate' },
  { cdValue: 'Other', cdDesc: 'Other' }
];

const SANDBOX_EDUCATION: Education[] = [
  {
    mbrEducationId: 'edu1',
    mbrID: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEducationInstitutionalNm: 'University of Oregon',
    mbrEducationDegreeCd: "Bachelor's",
    mbrEducationDesc: 'Bachelor of Arts in English Literature. Graduated Magna Cum Laude.',
    mbrEducationStartDate: '1979-09-15',
    mbrEducationEndDate: '1983-06-10'
  },
  {
    mbrEducationId: 'edu2',
    mbrID: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrEducationInstitutionalNm: 'Oregon State University',
    mbrEducationDegreeCd: 'Certificate',
    mbrEducationDesc: 'Completed Fourth and Fifth Grade Teaching Credential Program.',
    mbrEducationStartDate: '1983-09-10',
    mbrEducationEndDate: '1985-06-15'
  }
];

export default function MbrStoryEducationPanel({
  isSandbox = false,
  memberId,
  readOnly = false
}: MbrStoryEducationPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [educationList, setEducationList] = useState<Education[]>([]);

  // Sorting state (default: date descending)
  const [sortColumn, setSortColumn] = useState<'institution' | 'date' | 'degree'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Subordinate counts tracking
  const [educationPhotosMap, setEducationPhotosMap] = useState<Record<string, number>>({});
  const [educationStoriesMap, setEducationStoriesMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);
  const [headerStoryCount, setHeaderStoryCount] = useState<number>(0);

  // Add / Edit Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingEducationId, setEditingEducationId] = useState<string | null>(null);
  const [formInstitution, setFormInstitution] = useState('');
  const [formDegree, setFormDegree] = useState("Bachelor's");
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formCurrentInd, setFormCurrentInd] = useState(false);
  const [formDesc, setFormDesc] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // Initial form states for tracking unsaved edits
  const [initialFormInstitution, setInitialFormInstitution] = useState('');
  const [initialFormDegree, setInitialFormDegree] = useState("Bachelor's");
  const [initialFormStartDate, setInitialFormStartDate] = useState('');
  const [initialFormEndDate, setInitialFormEndDate] = useState('');
  const [initialFormCurrentInd, setInitialFormCurrentInd] = useState(false);
  const [initialFormDesc, setInitialFormDesc] = useState('');
  const [showModalDiscardConfirm, setShowModalDiscardConfirm] = useState(false);

  // Delete Confirmation Modal State
  const [deleteTargetEducation, setDeleteTargetEducation] = useState<Education | null>(null);

  // Reusable Topic Privacy Settings Modal State
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Reusable Photo Gallery Modal State
  const [showEducationGalleryModal, setShowEducationGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('Education & Training');

  // Mobile Top Menu & Row Actions Menu State
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // Close menus on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.education-header-menu-container')) {
        setShowHeaderMenu(false);
      }
      if (!target.closest('.education-action-menu-container')) {
        setActiveActionMenuId(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Check if Add/Edit form has unsaved edits
  const hasModalUnsavedChanges = useMemo(() => {
    return (
      formInstitution.trim() !== initialFormInstitution.trim() ||
      formDegree !== initialFormDegree ||
      formStartDate !== initialFormStartDate ||
      formEndDate !== initialFormEndDate ||
      formCurrentInd !== initialFormCurrentInd ||
      formDesc.trim() !== initialFormDesc.trim()
    );
  }, [
    formInstitution,
    formDegree,
    formStartDate,
    formEndDate,
    formCurrentInd,
    formDesc,
    initialFormInstitution,
    initialFormDegree,
    initialFormStartDate,
    initialFormEndDate,
    initialFormCurrentInd,
    initialFormDesc
  ]);

  // Date formatter helper (MON YYYY)
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

  const getDegreeBadgeColor = (degree: string | undefined) => {
    switch (degree) {
      case 'High School':
        return 'bg-slate-50 text-slate-700 border-slate-200/80';
      case 'Associate':
        return 'bg-blue-50 text-blue-700 border-blue-200/80';
      case "Bachelor's":
        return 'bg-emerald-50 text-emerald-700 border-emerald-200/80';
      case "Master's":
        return 'bg-indigo-50 text-indigo-700 border-indigo-200/80';
      case 'PhD':
        return 'bg-violet-50 text-violet-700 border-violet-200/80';
      case 'Certificate':
        return 'bg-amber-50 text-amber-700 border-amber-200/80';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200/80';
    }
  };

  // Sorting helper (most recent by default)
  const sortEducationList = (list: Education[]) => {
    return [...list].sort((a, b) => {
      const endA = a.mbrEducationEndDate || a.mbrEducationStartDate || '9999-12-31';
      const endB = b.mbrEducationEndDate || b.mbrEducationStartDate || '9999-12-31';
      return endB.localeCompare(endA);
    });
  };

  // Helper to load subordinate photo & story counts
  const loadSubordinateCounts = async (targetMbrId: string, currentEdus: Education[]) => {
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
                if (cat === 'education' || cat === 'educations') {
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

        const genStoriesStr = sessionStorage.getItem('sandbox_stories_sbMbrStryEducation_all');
        if (genStoriesStr) {
          try {
            const parsed = JSON.parse(genStoriesStr);
            if (Array.isArray(parsed)) hdrStories = parsed.length;
          } catch {}
        }

        currentEdus.forEach((e) => {
          const key = `sandbox_stories_sbMbrStryEducation_${e.mbrEducationId}`;
          const item = sessionStorage.getItem(key);
          if (item) {
            try {
              const list = JSON.parse(item);
              if (Array.isArray(list)) storyCounts[e.mbrEducationId] = list.length;
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
              if (cat === 'education' || cat === 'educations') {
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
              const isEduType = (
                s.mbrStoryTypeCd === 'sbMbrStryEducation' ||
                s.mbrStoryTypeCd === 'educations' ||
                s.mbrStoryTypeCd === 'education'
              );
              if (isEduType) {
                if (s.mbrStorySubordinateId) {
                  storyCounts[s.mbrStorySubordinateId] = (storyCounts[s.mbrStorySubordinateId] || 0) + 1;
                } else {
                  hdrStories++;
                }
              }
            });
          }
        } catch (e) {
          console.warn('Could not load education subordinate media and stories counts:', e);
        }
      }

      setEducationPhotosMap(photoCounts);
      setEducationStoriesMap(storyCounts);
      setHeaderPhotoCount(hdrPhotos);
      setHeaderStoryCount(hdrStories);
    } catch (err) {
      console.warn('Error computing education content counts:', err);
    }
  };

  // Re-fetch subordinate counts when story or gallery events occur
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, educationList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, educationList, isSandbox]);

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

      let loadedEdus: Education[] = [];
      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_education');
        if (saved) {
          loadedEdus = sortEducationList(JSON.parse(saved));
        } else {
          loadedEdus = sortEducationList(SANDBOX_EDUCATION);
          sessionStorage.setItem('sandbox_education', JSON.stringify(loadedEdus));
        }
      } else {
        try {
          const dbEdus = await taskApi.getEducations(currentMbrId);
          if (dbEdus && dbEdus.length > 0) {
            loadedEdus = sortEducationList(dbEdus);
          } else if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            loadedEdus = sortEducationList(SANDBOX_EDUCATION);
          } else {
            loadedEdus = [];
          }
        } catch (e) {
          console.warn("Could not load education from DB, using fallback sandbox:", e);
          loadedEdus = sortEducationList(SANDBOX_EDUCATION);
        }
      }

      setEducationList(loadedEdus);
      await loadSubordinateCounts(currentMbrId, loadedEdus);
    } catch (err: any) {
      setError(`Failed to load education records: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- ADD / EDIT MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingEducationId(null);
    setFormInstitution('');
    setFormDegree("Bachelor's");
    setFormStartDate('');
    setFormEndDate('');
    setFormCurrentInd(false);
    setFormDesc('');
    setInitialFormInstitution('');
    setInitialFormDegree("Bachelor's");
    setInitialFormStartDate('');
    setInitialFormEndDate('');
    setInitialFormCurrentInd(false);
    setInitialFormDesc('');
    setModalError(null);
    setShowModalDiscardConfirm(false);
    setShowModal(true);
  };

  const handleOpenEditModal = (edu: Education) => {
    const inst = edu.mbrEducationInstitutionalNm || '';
    const deg = edu.mbrEducationDegreeCd || "Bachelor's";
    const start = edu.mbrEducationStartDate || '';
    const end = edu.mbrEducationEndDate || '';
    const isCurrent = !end && !!start;
    const desc = edu.mbrEducationDesc || '';

    setEditingEducationId(edu.mbrEducationId);
    setFormInstitution(inst);
    setFormDegree(deg);
    setFormStartDate(start);
    setFormEndDate(end);
    setFormCurrentInd(isCurrent);
    setFormDesc(desc);

    setInitialFormInstitution(inst);
    setInitialFormDegree(deg);
    setInitialFormStartDate(start);
    setInitialFormEndDate(end);
    setInitialFormCurrentInd(isCurrent);
    setInitialFormDesc(desc);

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
    if (!formInstitution.trim()) {
      setModalError('School / Institution Name is required.');
      return;
    }
    if (!formDegree) {
      setModalError('Degree / Credential is required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    try {
      const payload = {
        mbrID: mbrId,
        mbrEducationInstitutionalNm: formInstitution.trim(),
        mbrEducationDegreeCd: formDegree,
        mbrEducationStartDate: formStartDate || undefined,
        mbrEducationEndDate: formCurrentInd ? undefined : (formEndDate || undefined),
        mbrEducationDesc: formDesc.trim() ? formDesc.trim() : undefined
      };

      let nextList: Education[] = [];

      if (isSandbox) {
        if (editingEducationId) {
          nextList = educationList.map((e) =>
            e.mbrEducationId === editingEducationId
              ? { ...e, ...payload }
              : e
          );
        } else {
          const newEdu: Education = {
            mbrEducationId: `edu_${Date.now()}`,
            ...payload
          };
          nextList = [newEdu, ...educationList];
        }

        const sorted = sortEducationList(nextList);
        setEducationList(sorted);
        sessionStorage.setItem('sandbox_education', JSON.stringify(sorted));
        setSuccessMsg(editingEducationId ? 'Education record updated successfully!' : 'Education record added successfully!');
        setShowModal(false);
        setShowModalDiscardConfirm(false);
        loadSubordinateCounts(mbrId, sorted);
      } else {
        if (editingEducationId) {
          await taskApi.updateEducation(editingEducationId, payload);
          setSuccessMsg('Education record updated successfully!');
        } else {
          await taskApi.createEducation(payload);
          setSuccessMsg('Education record added successfully!');
        }

        setShowModal(false);
        setShowModalDiscardConfirm(false);
        const refreshed = await taskApi.getEducations(mbrId);
        const sorted = sortEducationList(refreshed);
        setEducationList(sorted);
        loadSubordinateCounts(mbrId, sorted);
      }
    } catch (err: any) {
      setModalError(err.message || 'Failed to save education record.');
    } finally {
      setSaving(false);
    }
  };

  // --- DELETE MODAL HANDLERS ---
  const promptDeleteEducation = (edu: Education) => {
    setDeleteTargetEducation(edu);
  };

  const executeDeleteEducation = async () => {
    if (!deleteTargetEducation) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTargetEducation.mbrEducationId;

    try {
      if (isSandbox) {
        const nextList = educationList.filter((e) => e.mbrEducationId !== targetId);
        const sorted = sortEducationList(nextList);
        setEducationList(sorted);
        sessionStorage.setItem('sandbox_education', JSON.stringify(sorted));
        setSuccessMsg('Education record deleted successfully!');
      } else {
        await taskApi.deleteEducation(targetId);
        const dbEdus = await taskApi.getEducations(mbrId);
        setEducationList(sortEducationList(dbEdus));
        setSuccessMsg('Education record deleted successfully!');
      }
      setDeleteTargetEducation(null);
    } catch (err: any) {
      setError(`Failed to delete education record: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Gallery Open Handlers
  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Education & Training');
    setShowEducationGalleryModal(true);
  };

  const handleOpenEducationSubordinateGalleryModal = (edu: Education) => {
    setActiveGallerySubordinateId(edu.mbrEducationId);
    setActiveGalleryTitle(`Education (${edu.mbrEducationInstitutionalNm})`);
    setShowEducationGalleryModal(true);
  };

  // --- COLUMN SORTING HANDLER ---
  const handleSort = (column: 'institution' | 'date' | 'degree') => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection(column === 'date' ? 'desc' : 'asc');
    }
  };

  // Computed Sorted List
  const sortedEducationList = useMemo(() => {
    if (!Array.isArray(educationList)) return [];
    return [...educationList].sort((a, b) => {
      if (sortColumn === 'institution') {
        const instA = (a.mbrEducationInstitutionalNm || '').toLowerCase();
        const instB = (b.mbrEducationInstitutionalNm || '').toLowerCase();
        const comparison = instA.localeCompare(instB);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'date') {
        const endA = a.mbrEducationEndDate || a.mbrEducationStartDate || '9999-12-31';
        const endB = b.mbrEducationEndDate || b.mbrEducationStartDate || '9999-12-31';
        const comparison = endA.localeCompare(endB);
        return sortDirection === 'asc' ? comparison : -comparison;
      } else if (sortColumn === 'degree') {
        const degA = (a.mbrEducationDegreeCd || '').toLowerCase();
        const degB = (b.mbrEducationDegreeCd || '').toLowerCase();
        const comparison = degA.localeCompare(degB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, [educationList, sortColumn, sortDirection]);

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
            detail: { topicId: 'education', topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation' }
          }))}
          className="flex items-center gap-2 sm:gap-3 group/topic cursor-pointer text-left focus:outline-none transition-transform active:scale-98 min-w-0"
          title={readOnly ? "View Stories" : "Story Editor"}
        >
          <div className="p-2 sm:p-2.5 bg-blue-50/50 group-hover/topic:bg-blue-100/70 border border-blue-100 group-hover/topic:border-blue-200 text-blue-700 rounded-xl transition-all shadow-2xs shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 transition-transform group-hover/topic:scale-105" />
          </div>
          <div className="flex flex-col gap-0.5 min-w-0">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block truncate">
              {headerStoryCount > 0 ? `Status: ${headerStoryCount} Stories` : 'Status: Draft'}
            </span>
            <span className="block font-serif text-base sm:text-lg font-bold text-slate-800 group-hover/topic:text-blue-700 transition-colors truncate">
              Education & Training
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
              <span className="hidden xs:inline">Add Education</span>
              <span className="xs:hidden">Add</span>
            </button>
          )}

          {/* Desktop Expanded Icon Bar */}
          <div className="hidden sm:flex items-center gap-2">
            {/* Photo Gallery Button with Count Badge */}
            <button
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Education Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-blue-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {/* Storybook Icon Button with Count Badge */}
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                detail: { topicId: 'education', topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation' }
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
          <div className="sm:hidden relative inline-flex items-center education-header-menu-container">
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
                        <Images className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>Photo Gallery</span>
                      </div>
                      {headerPhotoCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">
                          {headerPhotoCount}
                        </span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowHeaderMenu(false);
                        window.dispatchEvent(new CustomEvent('open-story-editor', {
                          detail: { topicId: 'education', topicTitle: 'Education and Training', componentName: 'sbMbrStryEducation' }
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

      {/* --- EDUCATION GRID / TABLE VIEW --- */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-xs font-serif">Loading education records...</span>
        </div>
      ) : sortedEducationList.length === 0 ? (
        <div className="py-10 flex flex-col items-center justify-center text-center p-4 border border-dashed border-[#EFECE7] rounded-2xl bg-white/50">
          <GraduationCap className="w-8 h-8 text-slate-300 mb-2" />
          <h4 className="font-serif font-bold text-sm text-slate-700">No education records registered</h4>
          <p className="text-xs text-slate-400 font-serif max-w-sm mt-1 mb-4">
            {readOnly
              ? "This member hasn't added any education history to their storybook yet."
              : "Document schools, universities, degrees, certificates, and academic milestones."}
          </p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Education Record</span>
            </button>
          )}
        </div>
      ) : (
        <div className="border border-[#EFECE7] rounded-2xl bg-white shadow-xs overflow-hidden w-full max-w-full">
          <div className="max-h-[320px] overflow-y-auto overflow-x-hidden rounded-t-2xl w-full">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[10px] sm:text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  {/* Institution Column */}
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 align-bottom w-[42%] sm:w-[38%] rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('institution')}
                      className="group/btn inline-flex items-center gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Institution</span>
                      {sortColumn === 'institution' ? (
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

                  {/* Degree / Credential Column */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 align-bottom w-[14%] sm:w-[16%]">
                    <button
                      type="button"
                      onClick={() => handleSort('degree')}
                      className="group/btn inline-flex items-center gap-0.5 sm:gap-1 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider text-[10px] sm:text-[11px]"
                    >
                      <span>Degree</span>
                      {sortColumn === 'degree' ? (
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
                {sortedEducationList.map((edu, idx) => {
                  const storyCount = educationStoriesMap[edu.mbrEducationId] || 0;
                  const photoCount = educationPhotosMap[edu.mbrEducationId] || 0;
                  const hasContent = storyCount > 0 || photoCount > 0;
                  const isCurrent = !edu.mbrEducationEndDate && !!edu.mbrEducationStartDate;

                  return (
                    <tr
                      key={edu.mbrEducationId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Institution details */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                            <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                              {edu.mbrEducationInstitutionalNm}
                            </span>
                            {edu.mbrEducationDesc && (
                              <span className="text-[10px] text-slate-400 font-serif truncate leading-tight">
                                {edu.mbrEducationDesc}
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
                            <span className={isCurrent ? 'font-bold text-indigo-600 truncate' : 'font-semibold truncate'}>
                              {isCurrent ? 'Present' : (edu.mbrEducationEndDate ? formatMonYear(edu.mbrEducationEndDate) : '—')}
                            </span>
                          </div>
                          <div className="flex items-center truncate mt-0.5">
                            <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                              From:
                            </span>
                            <span className="font-semibold truncate">
                              {formatMonYear(edu.mbrEducationStartDate)}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Degree Badge */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold border rounded-full uppercase tracking-wider truncate max-w-full font-mono ${getDegreeBadgeColor(edu.mbrEducationDegreeCd)}`}>
                          {edu.mbrEducationDegreeCd || 'Other'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right">
                        {/* Desktop Action Icons */}
                        <div className="hidden sm:inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEducationSubordinateGalleryModal(edu)}
                            title={`Photo Gallery for ${edu.mbrEducationInstitutionalNm}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
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
                            type="button"
                            onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                              detail: {
                                topicId: 'education',
                                topicTitle: `Education (${edu.mbrEducationInstitutionalNm})`,
                                componentName: 'sbMbrStryEducation',
                                subordinateId: edu.mbrEducationId,
                                subordinateTitle: edu.mbrEducationInstitutionalNm
                              }
                            }))}
                            title={readOnly ? `View Stories for ${edu.mbrEducationInstitutionalNm}${storyCount > 0 ? ` (${storyCount} stories)` : ''}` : `Story Editor for ${edu.mbrEducationInstitutionalNm}${storyCount > 0 ? ` (${storyCount} stories)` : ''}`}
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
                                type="button"
                                onClick={() => handleOpenEditModal(edu)}
                                title="Edit Education Record"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDeleteEducation(edu)}
                                title="Delete Education Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end education-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === edu.mbrEducationId ? null : edu.mbrEducationId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === edu.mbrEducationId
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
                            {activeActionMenuId === edu.mbrEducationId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedEducationList.length - 2 && sortedEducationList.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 ${
                                  idx >= sortedEducationList.length - 2 && sortedEducationList.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenEducationSubordinateGalleryModal(edu);
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
                                          topicId: 'education',
                                          topicTitle: `Education (${edu.mbrEducationInstitutionalNm})`,
                                          componentName: 'sbMbrStryEducation',
                                          subordinateId: edu.mbrEducationId,
                                          subordinateTitle: edu.mbrEducationInstitutionalNm
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
                                        handleOpenEditModal(edu);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Edit Record</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDeleteEducation(edu);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer text-left"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                                      <span>Delete Record</span>
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

      {/* --- ADD / EDIT EDUCATION POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {showModal && (
          <div 
            key="education-modal-backdrop"
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                handleRequestCloseModal();
              }
            }}
          >
            <motion.div
              key="education-modal-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] overflow-hidden text-left"
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7] shrink-0">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-2xl shrink-0">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                      {editingEducationId ? 'Edit Education' : 'Add Education'}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-serif mt-0.5 flex items-center gap-1.5">
                      <span>Document a school, degree, training program, or academic credential.</span>
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

                {/* Institution Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    School / Institution Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. University of Oregon, Lincoln High School"
                    value={formInstitution}
                    onChange={(e) => setFormInstitution(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Degree / Credential */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Degree / Credential <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formDegree}
                    onChange={(e) => setFormDegree(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors cursor-pointer"
                  >
                    {DEGREE_OPTIONS.map((opt) => (
                      <option key={opt.cdValue} value={opt.cdValue}>
                        {opt.cdDesc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-serif font-bold text-slate-700">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-serif font-bold text-slate-700">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      disabled={formCurrentInd}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className={`w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors ${
                        formCurrentInd ? 'opacity-40 cursor-not-allowed bg-slate-100' : ''
                      }`}
                    />
                  </div>
                </div>

                {/* Currently Attending Checkbox */}
                <div className="flex items-center gap-2 pt-1">
                  <label className="flex items-center gap-2 p-2 bg-slate-50 hover:bg-slate-100 rounded-xl cursor-pointer transition-colors border border-slate-200/60 w-full sm:w-auto">
                    <input
                      type="checkbox"
                      checked={formCurrentInd}
                      onChange={(e) => {
                        setFormCurrentInd(e.target.checked);
                        if (e.target.checked) setFormEndDate('');
                      }}
                      className="rounded text-blue-600 focus:ring-blue-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className="text-xs font-serif font-bold text-slate-700">Currently Attending / Enrolled</span>
                  </label>
                </div>

                {/* Description / Major / Details */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-serif font-bold text-slate-700">
                    Details / Major / Honors
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Major in Literature, Magna Cum Laude, Student Council President..."
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-slate-800 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:outline-none transition-colors resize-y"
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
                    <span>{editingEducationId ? 'Save Changes' : 'Save Record'}</span>
                  </button>
                </div>
              </form>

              {/* Discard Changes Prompt Overlay */}
              <AnimatePresence>
                {showModalDiscardConfirm && (
                  <div key="education-discard-confirm-overlay" className="absolute inset-0 z-50 bg-slate-900/60 backdrop-blur-xs rounded-3xl flex items-center justify-center p-4">
                    <motion.div
                      key="education-discard-confirm-dialog"
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
                        You have unsaved changes to this education record. If you leave now, these changes will be discarded.
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
        {deleteTargetEducation && (
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
                Delete Education Record
              </h3>
              <p className="text-xs text-slate-500 font-serif mt-1 mb-5">
                Are you sure you want to delete <span className="font-bold text-slate-700">"{deleteTargetEducation.mbrEducationInstitutionalNm}"</span>? This action cannot be undone.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteTargetEducation(null)}
                  disabled={deleting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteEducation}
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
        isOpen={showEducationGalleryModal}
        onClose={() => {
          setShowEducationGalleryModal(false);
          loadSubordinateCounts(mbrId, educationList);
        }}
        mbrId={mbrId}
        categoryCd="Education"
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
        topicName="Education & Training"
        isSandbox={isSandbox}
      />

      <AdminComponentTag name="mbrStoryEducationPanel" />
    </div>
  );
}

export { MbrStoryEducationPanel, MbrStoryEducationPanel as mbrStoryEducationPanel, MbrStoryEducationPanel as SbMbrStryEducation };
