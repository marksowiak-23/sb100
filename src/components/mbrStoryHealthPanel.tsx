/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  HeartPulse, Trash2, Edit3, Save, X, Plus, Loader2, 
  AlertCircle, CheckCircle2, ShieldAlert, Images, 
  ArrowUpDown, ArrowUp, ArrowDown, MoreVertical, Calendar
} from 'lucide-react';
import { 
  taskApi, 
  MbrTopicHealth, 
  DEFAULT_TOPIC_LOOKUP, 
  Cd 
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrTopicPrivacyModal from '@/src/components/mbrTopicPrivacyModal';

export interface MbrStoryHealthPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
  topicId?: string;
  chIntentId?: string;
}

export type SbMbrStryHealthProps = MbrStoryHealthPanelProps;

const SANDBOX_HEALTH: MbrTopicHealth[] = [
  {
    mbrHealthId: 'health-1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrHealthTitle: 'ACL Knee Surgery & Marathon Comeback',
    mbrHealthTypeCd: 'INJURY_ACCIDENT',
    mbrHealthStatusCd: 'RESOLVED',
    mbrHealthStartDate: '2018-04-12',
    mbrHealthEndDate: '2019-05-01',
    mbrHealthYear: 2018,
    mbrHealthCurrentInd: false,
    mbrHealthImpactTreatment: 'Reconstructive surgery followed by 9 months of intensive physical therapy and cycling.',
    mbrHealthDescription: 'Tore my ACL during a rec league soccer match. The recovery journey taught me mental grit and culminated in crossing the finish line at the Chicago Marathon.'
  },
  {
    mbrHealthId: 'health-2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrHealthTitle: 'Plant-Based Nutrition & Heart Health',
    mbrHealthTypeCd: 'WELLNESS_LIFESTYLE',
    mbrHealthStatusCd: 'MANAGING',
    mbrHealthStartDate: '2015-01-01',
    mbrHealthEndDate: undefined,
    mbrHealthYear: 2015,
    mbrHealthCurrentInd: true,
    mbrHealthImpactTreatment: 'Mediterranean-style whole food nutrition, daily walking, and meditation routine.',
    mbrHealthDescription: 'Transformed my cardiovascular wellness and energy levels by embracing mindful eating and consistent daily movement with Eleanor.'
  },
  {
    mbrHealthId: 'health-3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrHealthTitle: 'Childhood Asthma Journey',
    mbrHealthTypeCd: 'CONDITION',
    mbrHealthStatusCd: 'HISTORICAL',
    mbrHealthStartDate: '1962-09-01',
    mbrHealthEndDate: '1975-06-01',
    mbrHealthYear: 1962,
    mbrHealthCurrentInd: false,
    mbrHealthImpactTreatment: 'Breathing exercises, swimming lessons, and inhalers.',
    mbrHealthDescription: 'Growing up with asthma inspired me to join the swim team to build lung capacity, turning a challenge into a lifelong love of water sports.'
  }
];

const DEFAULT_HEALTH_TYPE_CODES: Partial<Cd>[] = [
  { cdValue: 'CONDITION', cdLabel: 'Medical Condition', cdDesc: 'Chronic or diagnosed condition (e.g. asthma, diabetes, heart)', cdSortOrder: 1 },
  { cdValue: 'SURGERY_PROCEDURE', cdLabel: 'Surgery / Procedure', cdDesc: 'Major surgery, operation, or specialized medical procedure', cdSortOrder: 2 },
  { cdValue: 'INJURY_ACCIDENT', cdLabel: 'Injury / Recovery', cdDesc: 'Accident, broken bone, sports injury, and recovery journey', cdSortOrder: 3 },
  { cdValue: 'MILESTONE', cdLabel: 'Health / Fitness Milestone', cdDesc: 'Fitness milestone, marathon, weight loss, or healthy habit transformation', cdSortOrder: 4 },
  { cdValue: 'WELLNESS_LIFESTYLE', cdLabel: 'Wellness & Lifestyle', cdDesc: 'Holistic wellness, meditation, dietary shift, or lifestyle routine', cdSortOrder: 5 },
  { cdValue: 'GENETIC_FAMILY', cdLabel: 'Genetic & Family Health', cdDesc: 'Family medical history, hereditary insights, or genetic discoveries', cdSortOrder: 6 },
  { cdValue: 'PREVENTIVE_CARE', cdLabel: 'Preventive Care', cdDesc: 'Milestone screenings, wellness retreats, or preventive checkups', cdSortOrder: 7 },
  { cdValue: 'OTHER', cdLabel: 'Other Health Story', cdDesc: 'Other meaningful personal health or wellness experience', cdSortOrder: 8 }
];

const DEFAULT_HEALTH_STATUS_CODES: Partial<Cd>[] = [
  { cdValue: 'RESOLVED', cdLabel: 'Resolved / Healed', cdDesc: 'Fully healed, recovered, or milestone completed', cdSortOrder: 1 },
  { cdValue: 'MANAGING', cdLabel: 'Actively Managing', cdDesc: 'Actively managing well on an ongoing basis', cdSortOrder: 2 },
  { cdValue: 'ONGOING', cdLabel: 'In Treatment / Active', cdDesc: 'Currently undergoing treatment, therapy, or active routine', cdSortOrder: 3 },
  { cdValue: 'HISTORICAL', cdLabel: 'Past Experience', cdDesc: 'Past childhood or historical experience', cdSortOrder: 4 },
  { cdValue: 'MONITORED', cdLabel: 'Routine Monitoring', cdDesc: 'Under routine surveillance or periodic checkups', cdSortOrder: 5 }
];

export default function MbrStoryHealthPanel({
  isSandbox = false,
  memberId,
  readOnly = false,
  topicId = DEFAULT_TOPIC_LOOKUP.health?.topicId || '273184ab-e09d-49ef-b416-3fc3ba0a8161',
  chIntentId = DEFAULT_TOPIC_LOOKUP.health?.chIntentId || 'b33d14cf-0891-4e1c-802b-05b3e2299c3b'
}: MbrStoryHealthPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [healthList, setHealthList] = useState<MbrTopicHealth[]>([]);
  const [typeCodes, setTypeCodes] = useState<Partial<Cd>[]>(DEFAULT_HEALTH_TYPE_CODES);
  const [statusCodes, setStatusCodes] = useState<Partial<Cd>[]>(DEFAULT_HEALTH_STATUS_CODES);

  // --- MODAL FORM STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingHealthId, setEditingHealthId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState('');
  const [formTypeCd, setFormTypeCd] = useState('CONDITION');
  const [formStatusCd, setFormStatusCd] = useState('RESOLVED');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formYear, setFormYear] = useState('');
  const [formCurrentInd, setFormCurrentInd] = useState(false);
  const [formImpactTreatment, setFormImpactTreatment] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION MODAL STATE ---
  const [deleteTarget, setDeleteTarget] = useState<MbrTopicHealth | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- TOPIC PRIVACY & PHOTO GALLERY MODAL STATES ---
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState('Health & Wellness');

  // --- HEADER & ROW DROPDOWN MENUS ---
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [activeActionMenuId, setActiveActionMenuId] = useState<string | null>(null);

  // --- MEDIA / BADGE MAPS ---
  const [healthPhotosMap, setHealthPhotosMap] = useState<Record<string, number>>({});
  const [headerPhotoCount, setHeaderPhotoCount] = useState<number>(0);

  // --- SORTING ---
  const [sortColumn, setSortColumn] = useState<'title' | 'type' | 'status' | 'dates'>('dates');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const resolvedTopicId = topicId || DEFAULT_TOPIC_LOOKUP.health?.topicId || '273184ab-e09d-49ef-b416-3fc3ba0a8161';
  const resolvedChIntentId = chIntentId || DEFAULT_TOPIC_LOOKUP.health?.chIntentId || 'b33d14cf-0891-4e1c-802b-05b3e2299c3b';

  // Format month and year from YYYY-MM-DD
  const formatMonYear = (dateStr?: string | null): string => {
    if (!dateStr) return '—';
    try {
      const parts = dateStr.split('-');
      if (parts.length >= 2) {
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const monthIdx = parseInt(parts[1], 10) - 1;
        const year = parts[0];
        if (monthIdx >= 0 && monthIdx < 12) {
          return `${monthNames[monthIdx]} ${year}`;
        }
      }
      return dateStr;
    } catch {
      return dateStr || '—';
    }
  };

  // Close menus on outer click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.health-action-menu-container') && !target.closest('.health-header-menu-container')) {
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

  // Load photo count badges for health entries
  const loadSubordinateCounts = async (targetMbrId: string, currentRecords: MbrTopicHealth[]) => {
    try {
      if (isSandbox) {
        setHeaderPhotoCount(0);
        setHealthPhotosMap({});
        return;
      }
      const mediaList: any[] = await taskApi.getMemberMedia(targetMbrId).catch(() => []);
      if (Array.isArray(mediaList)) {
        const photoMap: Record<string, number> = {};
        let headerPhotos = 0;

        mediaList.forEach((m) => {
          const category = (m.mbrMediaCategoryCd || '').toLowerCase();
          if (category.includes('health') || category.includes('wellness') || m.mbrMediaTopicId === resolvedTopicId) {
            headerPhotos++;
            if (m.mbrMediaSubordinateId) {
              photoMap[m.mbrMediaSubordinateId] = (photoMap[m.mbrMediaSubordinateId] || 0) + 1;
            }
          }
        });

        setHeaderPhotoCount(headerPhotos);
        setHealthPhotosMap(photoMap);
      }
    } catch {
      // Graceful fallback
    }
  };

  // Re-fetch subordinate counts when storage or sync occurs
  useEffect(() => {
    const handleSync = () => {
      loadSubordinateCounts(mbrId, healthList);
    };
    window.addEventListener('update-story-editor-content', handleSync);
    window.addEventListener('story-saved', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('update-story-editor-content', handleSync);
      window.removeEventListener('story-saved', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [mbrId, healthList, isSandbox]);

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

        // Fetch lookup codes for health types and status
        try {
          const [loadedTypes, loadedStatus] = await Promise.all([
            taskApi.getCds('healthTypeCd').catch(() => []),
            taskApi.getCds('healthStatusCd').catch(() => [])
          ]);
          if (Array.isArray(loadedTypes) && loadedTypes.length > 0 && isMounted) {
            setTypeCodes(loadedTypes);
          }
          if (Array.isArray(loadedStatus) && loadedStatus.length > 0 && isMounted) {
            setStatusCodes(loadedStatus);
          }
        } catch {
          // fallback to defaults
        }

        if (isSandbox) {
          const local = sessionStorage.getItem('sandbox_health');
          const data = local ? JSON.parse(local) : SANDBOX_HEALTH;
          if (isMounted) {
            setHealthList(data);
            loadSubordinateCounts(currentMbrId, data);
          }
        } else {
          const records = await taskApi.getMemberHealthRecords(currentMbrId);
          if (isMounted) {
            setHealthList(Array.isArray(records) ? records : []);
            loadSubordinateCounts(currentMbrId, records || []);
          }
        }
      } catch (err: any) {
        console.error("Error loading health records:", err);
        if (isMounted) {
          setError(err.message || 'Failed to load health records.');
          setHealthList(SANDBOX_HEALTH);
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
    if (!cdVal) return 'Health Story';
    const found = typeCodes.find(c => c.cdValue === cdVal);
    return found?.cdLabel || cdVal;
  };

  const getStatusCodeLabel = (cdVal?: string | null) => {
    if (!cdVal) return 'Resolved';
    const found = statusCodes.find(c => c.cdValue === cdVal);
    return found?.cdLabel || cdVal;
  };

  const getStatusBadgeStyle = (statusVal?: string | null, isCurrent?: boolean) => {
    if (isCurrent) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold';
    }
    switch (statusVal) {
      case 'RESOLVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'MANAGING':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'ONGOING':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'HISTORICAL':
        return 'bg-slate-50 text-slate-600 border-slate-200';
      case 'MONITORED':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Sorting
  const sortedHealthList = useMemo(() => {
    return [...healthList].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'title') {
        comparison = (a.mbrHealthTitle || '').localeCompare(b.mbrHealthTitle || '');
      } else if (sortColumn === 'type') {
        comparison = (a.mbrHealthTypeCd || '').localeCompare(b.mbrHealthTypeCd || '');
      } else if (sortColumn === 'status') {
        comparison = (a.mbrHealthStatusCd || '').localeCompare(b.mbrHealthStatusCd || '');
      } else if (sortColumn === 'dates') {
        const dateA = a.mbrHealthStartDate || (a.mbrHealthYear ? `${a.mbrHealthYear}-01-01` : '0000-00-00');
        const dateB = b.mbrHealthStartDate || (b.mbrHealthYear ? `${b.mbrHealthYear}-01-01` : '0000-00-00');
        comparison = dateA.localeCompare(dateB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [healthList, sortColumn, sortDirection]);

  const handleSort = (column: 'title' | 'type' | 'status' | 'dates') => {
    if (sortColumn === column) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // Open modal handlers
  const handleOpenAddModal = () => {
    setEditingHealthId(null);
    setFormTitle('');
    setFormTypeCd(typeCodes[0]?.cdValue || 'CONDITION');
    setFormStatusCd(statusCodes[0]?.cdValue || 'RESOLVED');
    setFormStartDate('');
    setFormEndDate('');
    setFormYear('');
    setFormCurrentInd(false);
    setFormImpactTreatment('');
    setFormDescription('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (record: MbrTopicHealth) => {
    setEditingHealthId(record.mbrHealthId);
    setFormTitle(record.mbrHealthTitle || '');
    setFormTypeCd(record.mbrHealthTypeCd || 'CONDITION');
    setFormStatusCd(record.mbrHealthStatusCd || 'RESOLVED');
    setFormStartDate(record.mbrHealthStartDate ? record.mbrHealthStartDate.split('T')[0] : '');
    setFormEndDate(record.mbrHealthEndDate ? record.mbrHealthEndDate.split('T')[0] : '');
    setFormYear(record.mbrHealthYear ? String(record.mbrHealthYear) : '');
    setFormCurrentInd(record.mbrHealthCurrentInd || false);
    setFormImpactTreatment(record.mbrHealthImpactTreatment || '');
    setFormDescription(record.mbrHealthDescription || '');
    setModalError(null);
    setShowModal(true);
  };

  // Submit Add / Edit Form
  const handleSubmitModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setModalError('Headline / title is required.');
      return;
    }

    setSaving(true);
    setModalError(null);

    const payload: Partial<MbrTopicHealth> = {
      mbrId,
      mbrHealthTitle: formTitle.trim(),
      mbrHealthTypeCd: formTypeCd,
      mbrHealthStatusCd: formStatusCd || null,
      mbrHealthStartDate: formStartDate || null,
      mbrHealthEndDate: formEndDate || null,
      mbrHealthYear: formYear ? parseInt(formYear, 10) : null,
      mbrHealthCurrentInd: formCurrentInd,
      mbrHealthImpactTreatment: formImpactTreatment.trim() || null,
      mbrHealthDescription: formDescription.trim() || null
    };

    try {
      if (isSandbox) {
        let nextList: MbrTopicHealth[];
        if (editingHealthId) {
          nextList = healthList.map(h => h.mbrHealthId === editingHealthId ? { ...h, ...payload } as MbrTopicHealth : h);
          setSuccessMsg('Health record updated (Sandbox mode).');
        } else {
          const newEntry: MbrTopicHealth = {
            ...payload,
            mbrHealthId: `health-${Date.now()}`,
            mbrHealthCreatedAt: new Date().toISOString(),
            mbrHealthUpdatedAt: new Date().toISOString()
          } as MbrTopicHealth;
          nextList = [newEntry, ...healthList];
          setSuccessMsg('Health record created (Sandbox mode).');
        }
        setHealthList(nextList);
        sessionStorage.setItem('sandbox_health', JSON.stringify(nextList));
        setShowModal(false);
      } else {
        if (editingHealthId) {
          const updated = await taskApi.updateHealthRecord(editingHealthId, payload);
          setHealthList(prev => prev.map(h => h.mbrHealthId === editingHealthId ? updated : h));
          setSuccessMsg('Health record updated successfully.');
        } else {
          const created = await taskApi.createHealthRecord(payload);
          setHealthList(prev => [created, ...prev]);
          setSuccessMsg('Health record created successfully.');
        }
        setShowModal(false);
        loadSubordinateCounts(mbrId, healthList);
      }
    } catch (err: any) {
      console.error("Error saving health record:", err);
      setModalError(err.message || 'Failed to save health record.');
    } finally {
      setSaving(false);
    }
  };

  // Delete handlers
  const promptDelete = (record: MbrTopicHealth) => {
    setDeleteTarget(record);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (isSandbox) {
        const nextList = healthList.filter(h => h.mbrHealthId !== deleteTarget.mbrHealthId);
        setHealthList(nextList);
        sessionStorage.setItem('sandbox_health', JSON.stringify(nextList));
        setSuccessMsg('Health record removed (Sandbox mode).');
      } else {
        await taskApi.deleteHealthRecord(deleteTarget.mbrHealthId);
        setHealthList(prev => prev.filter(h => h.mbrHealthId !== deleteTarget.mbrHealthId));
        setSuccessMsg('Health record deleted successfully.');
      }
      setDeleteTarget(null);
    } catch (err: any) {
      console.error("Error deleting health record:", err);
      setError(err.message || 'Failed to delete health record.');
    } finally {
      setDeleting(false);
    }
  };

  // Subordinate Photo Gallery Modal Handler
  const handleOpenHealthGallery = (record: MbrTopicHealth) => {
    setActiveGallerySubordinateId(record.mbrHealthId);
    setActiveGalleryTitle(`Health: ${record.mbrHealthTitle}`);
    setShowGalleryModal(true);
  };

  const handleOpenTopicGalleryModal = () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Health & Wellness');
    setShowGalleryModal(true);
  };

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-4 sm:p-6 shadow-xs relative">
      <AdminComponentTag name="mbrStoryHealthPanel" />

      {/* --- PANEL HEADER --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EFECE7]/80">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold font-serif text-slate-800 tracking-tight">
                Health & Wellness
              </h2>
              {healthList.length > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-100 text-rose-800 rounded-full font-mono">
                  {healthList.length}
                </span>
              )}
            </div>
            <p className="text-xs font-serif text-slate-500">
              Personal health milestones, wellness routines, recoveries, and medical journeys.
            </p>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {!readOnly && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Record</span>
            </button>
          )}

          {/* Desktop Top Panel Action Icons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleOpenTopicGalleryModal}
              className="relative p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title={`Member Photo Gallery${headerPhotoCount > 0 ? ` (${headerPhotoCount} photos)` : ''}`}
            >
              <Images className="w-4 h-4 text-blue-600" />
              {headerPhotoCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 px-1.5 min-w-[16px] h-4 flex items-center justify-center text-[9px] font-bold bg-blue-600 text-white rounded-full leading-none shadow-xs">
                  {headerPhotoCount}
                </span>
              )}
            </button>

            {!readOnly && (
              <button
                type="button"
                onClick={() => setShowPrivacyModal(true)}
                className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
                title="Privacy settings"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Mobile Top Panel Vertical Ellipsis Dropdown Menu */}
          <div className="sm:hidden relative inline-flex items-center health-header-menu-container">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowHeaderMenu(!showHeaderMenu);
              }}
              className={`relative p-1.5 rounded-xl border transition-colors cursor-pointer ${
                showHeaderMenu
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border-slate-200'
              }`}
              title="More options"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
              {headerPhotoCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-2 h-2 rounded-full bg-rose-600 ring-2 ring-white" />
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
                      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
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
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
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

      {/* --- MESSAGES --- */}
      {error && (
        <div className="mt-3 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}
      {successMsg && (
        <div className="mt-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button type="button" onClick={() => setSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* --- CONTENT TABLE / LIST --- */}
      {loading ? (
        <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-rose-600" />
          <span className="text-xs font-medium font-serif">Loading health records...</span>
        </div>
      ) : healthList.length === 0 ? (
        <div className="py-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center">
            <HeartPulse className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-sm font-bold text-slate-700">No health records documented yet</h3>
            <p className="text-xs font-serif text-slate-400 max-w-sm">
              Document meaningful wellness milestones, physical recoveries, dietary transformations, or health journeys.
            </p>
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Health Record</span>
            </button>
          )}
        </div>
      ) : (
        <div className="mt-4 -mx-4 sm:mx-0">
          <div className="overflow-x-auto rounded-2xl border border-[#EFECE7]/90 shadow-2xs">
            <table className="w-full text-left border-collapse table-fixed">
              <thead>
                <tr className="border-b border-[#EFECE7] bg-slate-50/70 text-[10px] sm:text-[11px] font-bold font-serif text-slate-600 select-none">
                  {/* Headline & Type */}
                  <th className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2 text-left align-bottom w-[46%] sm:w-[48%] rounded-tl-2xl">
                    <button
                      type="button"
                      onClick={() => handleSort('title')}
                      className="group/btn inline-flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <span>Story & Headline</span>
                      {sortColumn === 'title' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Period Range */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 text-left align-bottom w-[24%] sm:w-[20%]">
                    <button
                      type="button"
                      onClick={() => handleSort('dates')}
                      className="group/btn inline-flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <span>Timeline</span>
                      {sortColumn === 'dates' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Status & Category */}
                  <th className="py-2 sm:py-2.5 px-1 sm:px-2 text-left align-bottom w-[18%] sm:w-[16%]">
                    <button
                      type="button"
                      onClick={() => handleSort('status')}
                      className="group/btn inline-flex items-center gap-1 hover:text-slate-900 transition-colors cursor-pointer text-left"
                    >
                      <span>Status</span>
                      {sortColumn === 'status' ? (
                        sortDirection === 'asc' ? <ArrowUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" /> : <ArrowDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-600 shrink-0" />
                      ) : (
                        <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>

                  {/* Actions Column */}
                  <th className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right align-bottom w-[12%] sm:w-[16%] rounded-tr-2xl">
                    <span className="hidden sm:inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedHealthList.map((record, idx) => {
                  const photoCount = healthPhotosMap[record.mbrHealthId] || 0;
                  const hasContent = photoCount > 0;
                  const isCurrent = record.mbrHealthCurrentInd;

                  return (
                    <tr
                      key={record.mbrHealthId}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Title & Category Details */}
                      <td className="py-2 sm:py-2.5 pl-2 sm:pl-3 pr-1 sm:pr-2">
                        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
                            <HeartPulse className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </div>
                          <div className="flex flex-col min-w-0 justify-center">
                            <span className="font-serif font-bold text-slate-800 truncate text-[11px] sm:text-xs">
                              {record.mbrHealthTitle}
                            </span>
                            <span className="text-[10px] text-slate-500 font-serif font-medium truncate leading-tight">
                              {getTypeCodeLabel(record.mbrHealthTypeCd)}
                            </span>
                            {hasContent && (
                              <div className="flex items-center gap-1 mt-0.5">
                                {photoCount > 0 && (
                                  <span
                                    className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] sm:text-[9px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70"
                                    title={`${photoCount} ${photoCount === 1 ? 'photo' : 'photos'} available`}
                                  >
                                    <Images className="w-2.5 h-2.5 text-emerald-600 shrink-0" />
                                    <span>{photoCount}</span>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Period Range */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <div className="flex flex-col min-w-0 font-mono text-[9px] sm:text-[10px] leading-snug text-slate-700">
                          <div className="flex items-center truncate">
                            <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                              To:
                            </span>
                            <span className={isCurrent ? 'font-bold text-indigo-600 truncate' : 'font-semibold truncate'}>
                              {isCurrent ? 'Ongoing' : (record.mbrHealthEndDate ? formatMonYear(record.mbrHealthEndDate) : (record.mbrHealthYear ? `${record.mbrHealthYear}` : '—'))}
                            </span>
                          </div>
                          <div className="flex items-center truncate mt-0.5">
                            <span className="inline-block w-7 sm:w-8 text-right font-serif font-bold text-slate-400 text-[8.5px] sm:text-[9px] mr-1 shrink-0">
                              From:
                            </span>
                            <span className="font-semibold truncate">
                              {record.mbrHealthStartDate ? formatMonYear(record.mbrHealthStartDate) : (record.mbrHealthYear ? `${record.mbrHealthYear}` : '—')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-2 sm:py-2.5 px-1 sm:px-2">
                        <span className={`inline-flex items-center px-1.5 py-0.5 text-[8px] sm:text-[8.5px] font-bold border rounded-full uppercase tracking-wider truncate max-w-full font-mono ${getStatusBadgeStyle(record.mbrHealthStatusCd, isCurrent)}`}>
                          {isCurrent ? 'Active' : getStatusCodeLabel(record.mbrHealthStatusCd)}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-2 sm:py-2.5 pr-2 sm:pr-3 pl-1 sm:pl-2 text-right">
                        {/* Desktop Action Icons */}
                        <div className="hidden sm:inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenHealthGallery(record)}
                            title={`Photo Gallery for ${record.mbrHealthTitle}${photoCount > 0 ? ` (${photoCount} photos)` : ''}`}
                            className="relative p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Images className={`w-3.5 h-3.5 ${photoCount > 0 ? 'text-emerald-600' : ''}`} />
                            {photoCount > 0 && (
                              <span className="absolute -top-1 -right-1 px-1 min-w-[14px] h-3.5 flex items-center justify-center text-[8.5px] font-bold bg-emerald-600 text-white rounded-full leading-none shadow-xs">
                                {photoCount}
                              </span>
                            )}
                          </button>

                          {!readOnly && (
                            <>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(record)}
                                title="Edit Health Record"
                                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => promptDelete(record)}
                                title="Delete Health Record"
                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>

                        {/* Mobile 3-Dots Dropdown Menu */}
                        <div className="sm:hidden relative inline-flex items-center justify-end health-action-menu-container">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveActionMenuId(activeActionMenuId === record.mbrHealthId ? null : record.mbrHealthId);
                            }}
                            className={`relative p-1 rounded-md transition-colors cursor-pointer ${
                              activeActionMenuId === record.mbrHealthId
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
                            {activeActionMenuId === record.mbrHealthId && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.92, y: idx >= sortedHealthList.length - 2 && sortedHealthList.length > 2 ? 6 : -6 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.92 }}
                                transition={{ duration: 0.12 }}
                                className={`absolute right-0 z-40 ${
                                  idx >= sortedHealthList.length - 2 && sortedHealthList.length > 2 ? 'bottom-full mb-1.5' : 'top-full mt-1.5'
                                } bg-white border border-[#EFECE7] rounded-xl shadow-xl py-1 min-w-[155px] text-left divide-y divide-slate-100`}
                              >
                                <div className="py-0.5">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveActionMenuId(null);
                                      handleOpenHealthGallery(record);
                                    }}
                                    className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                  >
                                    <div className="flex items-center gap-2">
                                      <Images className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                      <span>Photo Gallery</span>
                                    </div>
                                    {photoCount > 0 && (
                                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-700">
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
                                        handleOpenEditModal(record);
                                      }}
                                      className="w-full flex items-center gap-2 px-3 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer text-left"
                                    >
                                      <Edit3 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                      <span>Edit Record</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveActionMenuId(null);
                                        promptDelete(record);
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

      {/* --- ADD / EDIT HEALTH POP-UP MODAL DIALOG --- */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#EFECE7] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-slate-800 text-sm sm:text-base">
                      {editingHealthId ? 'Edit Health Record' : 'Add Health & Wellness Record'}
                    </h3>
                    <p className="text-[10px] text-slate-500">
                      {editingHealthId ? 'Update health journey or milestone details' : 'Document a health experience or recovery story'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Form */}
              <form onSubmit={handleSubmitModal} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
                {modalError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{modalError}</span>
                  </div>
                )}

                {/* Headline / Title */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Headline / Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Knee Replacement & Rehab, Marathon Journey"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-serif"
                  />
                </div>

                {/* Category Type & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Category Type <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formTypeCd}
                      onChange={(e) => setFormTypeCd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-serif"
                    >
                      {typeCodes.map(code => (
                        <option key={code.cdValue} value={code.cdValue}>
                          {code.cdLabel || code.cdValue}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      Status / Outcome
                    </label>
                    <select
                      value={formStatusCd}
                      onChange={(e) => setFormStatusCd(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-serif"
                    >
                      {statusCodes.map(code => (
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
                      Start / Diagnosis Date
                    </label>
                    <input
                      type="date"
                      value={formStartDate}
                      onChange={(e) => setFormStartDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-serif font-bold text-slate-700 mb-1">
                      End / Recovery Date
                    </label>
                    <input
                      type="date"
                      value={formEndDate}
                      disabled={formCurrentInd}
                      onChange={(e) => setFormEndDate(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono text-xs disabled:opacity-40 disabled:bg-slate-50"
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
                      placeholder="e.g. 1998"
                      min="1900"
                      max="2099"
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-mono text-xs"
                    />
                  </div>
                </div>

                {/* Ongoing / Current Checkbox */}
                <div className="pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formCurrentInd}
                      onChange={(e) => {
                        setFormCurrentInd(e.target.checked);
                        if (e.target.checked) setFormEndDate('');
                      }}
                      className="rounded border-slate-300 text-rose-600 focus:ring-rose-500 w-4 h-4 cursor-pointer"
                    />
                    <span className="font-serif font-bold text-slate-700">
                      This is an ongoing condition, lifestyle habit, or active routine
                    </span>
                  </label>
                </div>

                {/* Treatments & Lifestyle Impact */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Treatments, Therapies & Lifestyle Impact
                  </label>
                  <textarea
                    rows={2}
                    value={formImpactTreatment}
                    onChange={(e) => setFormImpactTreatment(e.target.value)}
                    placeholder="Key therapies, physical conditioning, dietary shifts, medications, or routines..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-serif"
                  />
                </div>

                {/* Description & Story Notes */}
                <div>
                  <label className="block font-serif font-bold text-slate-700 mb-1">
                    Description, Memories & Reflections
                  </label>
                  <textarea
                    rows={3}
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Personal reflections, emotional journey, lessons learned, and life story narrative..."
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-serif"
                  />
                </div>

                {/* Form Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>{editingHealthId ? 'Save Changes' : 'Add Record'}</span>
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
                  Delete Health Record?
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to remove <span className="font-semibold text-slate-700">"{deleteTarget.mbrHealthTitle}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={deleting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm active:scale-95 disabled:opacity-50 cursor-pointer"
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
            categoryCd="health"
            categoryTitle={activeGalleryTitle}
            isSandbox={isSandbox}
            subordinateId={activeGallerySubordinateId || undefined}
            isOpen={showGalleryModal}
            onClose={() => {
              setShowGalleryModal(false);
              loadSubordinateCounts(mbrId, healthList);
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
            topicName="Health"
            isSandbox={isSandbox}
            isOpen={showPrivacyModal}
            onClose={() => setShowPrivacyModal(false)}
          />
        )}
      </AnimatePresence>

      <AdminComponentTag name="mbrStoryHealthPanel" />
    </div>
  );
}

export { MbrStoryHealthPanel, MbrStoryHealthPanel as mbrStoryHealthPanel, MbrStoryHealthPanel as SbMbrStryHealth };
