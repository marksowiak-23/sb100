/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Trash2, Edit3, Save, X, Plus, Loader2, AlertCircle, AlertTriangle, CheckCircle2, ShieldAlert, BookOpen, Images, ChevronLeft, ChevronRight, Upload, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { taskApi, mediaApi, resolveMediaUrl, MbrMedia } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';

export interface MbrStoryFamilyPanelProps {
  isSandbox?: boolean;
  memberId?: string;
  readOnly?: boolean;
}

export type SbMbrStryFamilyProps = MbrStoryFamilyPanelProps;

interface FamilyMember {
  mbrFamilyId: string;
  mbrId: string;
  mbrFamilyRelationshipCd: string;
  mbrFamilyFirstNm: string;
  mbrFamilyMiddleNm?: string;
  mbrFamilyLastNm: string;
  mbrFamilyBirthDt?: string;
}

const SANDBOX_FAMILY: FamilyMember[] = [
  {
    mbrFamilyId: 'f1',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Spouse',
    mbrFamilyFirstNm: 'Thomas',
    mbrFamilyMiddleNm: 'Allen',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1948-03-12'
  },
  {
    mbrFamilyId: 'f2',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Son',
    mbrFamilyFirstNm: 'Daniel',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1978-06-25'
  },
  {
    mbrFamilyId: 'f3',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Daughter',
    mbrFamilyFirstNm: 'Claire',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1982-11-04'
  },
  {
    mbrFamilyId: 'f4',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Grandfather',
    mbrFamilyFirstNm: 'Harold',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Sorenson',
    mbrFamilyBirthDt: '1920-01-15'
  },
  {
    mbrFamilyId: 'f5',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Father',
    mbrFamilyFirstNm: 'Raymond',
    mbrFamilyMiddleNm: 'Dale',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1925-08-19'
  },
  {
    mbrFamilyId: 'f6',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Mother',
    mbrFamilyFirstNm: 'Margaret',
    mbrFamilyMiddleNm: 'Ann',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1928-04-03'
  },
  {
    mbrFamilyId: 'f7',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Sister',
    mbrFamilyFirstNm: 'Sarah',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1952-09-14'
  },
  {
    mbrFamilyId: 'f8',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Brother',
    mbrFamilyFirstNm: 'James',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Hartwell',
    mbrFamilyBirthDt: '1955-12-01'
  },
  {
    mbrFamilyId: 'f9',
    mbrId: '9edb4311-a4bc-428a-8317-833f0f08fea1',
    mbrFamilyRelationshipCd: 'Aunt',
    mbrFamilyFirstNm: 'Clara',
    mbrFamilyMiddleNm: '',
    mbrFamilyLastNm: 'Sorenson',
    mbrFamilyBirthDt: '1932-07-22'
  }
];

const DEFAULT_RELATIONSHIPS = [
  { cdValue: 'Father', cdDesc: 'Father' },
  { cdValue: 'Mother', cdDesc: 'Mother' },
  { cdValue: 'Spouse', cdDesc: 'Spouse' },
  { cdValue: 'Partner', cdDesc: 'Partner' },
  { cdValue: 'Brother', cdDesc: 'Brother' },
  { cdValue: 'Sister', cdDesc: 'Sister' },
  { cdValue: 'Son', cdDesc: 'Son' },
  { cdValue: 'Daughter', cdDesc: 'Daughter' },
  { cdValue: 'Grandfather', cdDesc: 'Grandfather' },
  { cdValue: 'Grandmother', cdDesc: 'Grandmother' },
  { cdValue: 'Great Grandfather', cdDesc: 'Great Grandfather' },
  { cdValue: 'Great Grandmother', cdDesc: 'Great Grandmother' },
  { cdValue: 'Uncle', cdDesc: 'Uncle' },
  { cdValue: 'Aunt', cdDesc: 'Aunt' },
  { cdValue: 'Nephew', cdDesc: 'Nephew' },
  { cdValue: 'Niece', cdDesc: 'Niece' },
  { cdValue: '1st Cousin', cdDesc: '1st Cousin' },
  { cdValue: 'N Cousin', cdDesc: 'N Cousin' },
  { cdValue: 'Step Son', cdDesc: 'Step Son' },
  { cdValue: 'Step Daughter', cdDesc: 'Step Daughter' }
];

const RELATIONSHIP_ORDER: Record<string, number> = {
  'Father': 1,
  'Mother': 2,
  'Son': 3,
  'Daughter': 4,
  'Brother': 5,
  'Sister': 6,
  'Grandfather': 7,
  'Grandmother': 8,
  'Great Grandfather': 9,
  'Great Grandmother': 10,
  'Uncle': 11,
  'Aunt': 12,
  '1st Cousin': 13,
  'N Cousin': 14,
  'Nephew': 15,
  'Niece': 16,
  'Spouse': 17,
  'Partner': 18,
  'Step Son': 19,
};

const getRelationshipRank = (cd?: string): number => {
  if (!cd) return 99;
  return RELATIONSHIP_ORDER[cd] ?? 50;
};

const sortFamilyList = (list: FamilyMember[]): FamilyMember[] => {
  return [...list].sort((a, b) => {
    const relA = a.mbrFamilyRelationshipCd.toLowerCase();
    const relB = b.mbrFamilyRelationshipCd.toLowerCase();
    if (relA === 'spouse' && relB !== 'spouse') return -1;
    if (relB === 'spouse' && relA !== 'spouse') return 1;
    const nameA = `${a.mbrFamilyFirstNm} ${a.mbrFamilyLastNm}`.toLowerCase();
    const nameB = `${b.mbrFamilyFirstNm} ${b.mbrFamilyLastNm}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });
};

export default function MbrStoryFamilyPanel({ isSandbox = false, memberId, readOnly = false }: MbrStoryFamilyPanelProps) {
  // --- STATE VARIABLES ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [mbrId, setMbrId] = useState<string>(memberId || '9edb4311-a4bc-428a-8317-833f0f08fea1');
  const [familyList, setFamilyList] = useState<FamilyMember[]>([]);
  const [relationshipCodes, setRelationshipCodes] = useState<any[]>(DEFAULT_RELATIONSHIPS);

  // --- MODAL STATE ---
  const [showModal, setShowModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [formRelationship, setFormRelationship] = useState('Spouse');
  const [formFirstNm, setFormFirstNm] = useState('');
  const [formMiddleNm, setFormMiddleNm] = useState('');
  const [formLastNm, setFormLastNm] = useState('');
  const [formBirthDt, setFormBirthDt] = useState('');
  const [modalError, setModalError] = useState<string | null>(null);

  // --- DELETE CONFIRMATION STATE ---
  const [deleteTargetMember, setDeleteTargetMember] = useState<FamilyMember | null>(null);
  const [deleting, setDeleting] = useState(false);

  // --- FAMILY PHOTO GALLERY STATE ---
  const [showFamilyGalleryModal, setShowFamilyGalleryModal] = useState(false);
  const [selectedFamilyMemberForGallery, setSelectedFamilyMemberForGallery] = useState<FamilyMember | null>(null);
  const [activeGallerySubordinateId, setActiveGallerySubordinateId] = useState<string | null>(null);
  const [activeGalleryTitle, setActiveGalleryTitle] = useState<string>('Family');
  const [familyGalleryItems, setFamilyGalleryItems] = useState<MbrMedia[]>([]);
  const [currentFamilyPhotoIndex, setCurrentFamilyPhotoIndex] = useState(0);
  const [uploadingFamilyPhoto, setUploadingFamilyPhoto] = useState(false);
  const [deletingFamilyMediaId, setDeletingFamilyMediaId] = useState<string | null>(null);
  const [galleryError, setGalleryError] = useState<string | null>(null);
  const [gallerySuccess, setGallerySuccess] = useState<string | null>(null);

  // --- PHOTO DESCRIPTION EDIT STATE ---
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescriptionInput, setEditDescriptionInput] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);

  // --- INITIAL DATA FETCH ---
  useEffect(() => {
    loadData();
  }, [isSandbox, memberId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (!isSandbox) {
        try {
          const dbCodes = await taskApi.getLookupCodes('mbrFamilyRelationsipCd');
          const codeMap = new Map<string, string>();
          DEFAULT_RELATIONSHIPS.forEach((c) => codeMap.set(c.cdValue, c.cdDesc));
          if (dbCodes && Array.isArray(dbCodes)) {
            dbCodes.forEach((c: any) => {
              if (c.cdValue && c.cdDesc) {
                codeMap.set(c.cdValue, c.cdDesc);
              }
            });
          }
          const merged = Array.from(codeMap.entries()).map(([cdValue, cdDesc]) => ({
            cdValue,
            cdDesc
          }));
          setRelationshipCodes(merged);
        } catch (e) {
          console.warn("Could not fetch DB relationship codes, using defaults:", e);
          setRelationshipCodes(DEFAULT_RELATIONSHIPS);
        }
      } else {
        setRelationshipCodes(DEFAULT_RELATIONSHIPS);
      }

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

      if (isSandbox) {
        const saved = sessionStorage.getItem('sandbox_family');
        if (saved) {
          setFamilyList(sortFamilyList(JSON.parse(saved)));
        } else {
          const sorted = sortFamilyList(SANDBOX_FAMILY);
          setFamilyList(sorted);
          sessionStorage.setItem('sandbox_family', JSON.stringify(sorted));
        }
      } else {
        try {
          const dbFamily = await taskApi.getFamilyMembers(currentMbrId);
          if (dbFamily && dbFamily.length > 0) {
            setFamilyList(sortFamilyList(dbFamily));
          } else if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            setFamilyList(sortFamilyList(SANDBOX_FAMILY));
          } else {
            setFamilyList([]);
          }
        } catch (err) {
          if (memberId === 'm1' || currentMbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1') {
            setFamilyList(sortFamilyList(SANDBOX_FAMILY));
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      setError(`Failed to load family directory: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- MODAL HANDLERS ---
  const handleOpenAddModal = () => {
    setEditingMemberId(null);
    setFormRelationship(relationshipCodes[0]?.cdValue || 'Spouse');
    setFormFirstNm('');
    setFormMiddleNm('');
    setFormLastNm('');
    setFormBirthDt('');
    setModalError(null);
    setShowModal(true);
  };

  const handleOpenEditModal = (member: FamilyMember) => {
    setEditingMemberId(member.mbrFamilyId);
    setFormRelationship(member.mbrFamilyRelationshipCd);
    setFormFirstNm(member.mbrFamilyFirstNm);
    setFormMiddleNm(member.mbrFamilyMiddleNm || '');
    setFormLastNm(member.mbrFamilyLastNm);
    setFormBirthDt(member.mbrFamilyBirthDt || '');
    setModalError(null);
    setShowModal(true);
  };

  const handleSaveModalRecord = async () => {
    if (!formFirstNm.trim() || !formLastNm.trim()) {
      setModalError('First Name and Last Name are required.');
      return;
    }

    setSaving(true);
    setModalError(null);
    setError(null);
    setSuccessMsg(null);

    const payload = {
      mbrId: mbrId,
      mbrFamilyRelationshipCd: formRelationship,
      mbrFamilyFirstNm: formFirstNm.trim(),
      mbrFamilyMiddleNm: formMiddleNm.trim() || undefined,
      mbrFamilyLastNm: formLastNm.trim(),
      mbrFamilyBirthDt: formBirthDt.trim() || undefined
    };

    try {
      if (isSandbox) {
        let nextList: FamilyMember[] = [];
        if (editingMemberId) {
          nextList = familyList.map((item) =>
            item.mbrFamilyId === editingMemberId
              ? ({ ...item, ...payload } as FamilyMember)
              : item
          );
          setSuccessMsg('Family member updated successfully!');
        } else {
          const newMember: FamilyMember = {
            mbrFamilyId: `f_${Date.now()}`,
            mbrId: mbrId,
            mbrFamilyRelationshipCd: formRelationship,
            mbrFamilyFirstNm: formFirstNm.trim(),
            mbrFamilyMiddleNm: formMiddleNm.trim() || undefined,
            mbrFamilyLastNm: formLastNm.trim(),
            mbrFamilyBirthDt: formBirthDt.trim() || undefined
          };
          nextList = [...familyList, newMember];
          setSuccessMsg('Family member added successfully!');
        }
        const sorted = sortFamilyList(nextList);
        setFamilyList(sorted);
        sessionStorage.setItem('sandbox_family', JSON.stringify(sorted));
        setShowModal(false);
      } else {
        if (editingMemberId) {
          await taskApi.updateFamilyMember(editingMemberId, payload);
          setSuccessMsg('Family member updated successfully!');
        } else {
          await taskApi.createFamilyMember(payload);
          setSuccessMsg('Family member added successfully!');
        }
        setShowModal(false);
        const dbFamily = await taskApi.getFamilyMembers(mbrId);
        setFamilyList(sortFamilyList(dbFamily));
      }
    } catch (err: any) {
      setModalError(`Failed to save family member: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const promptDeleteMember = (member: FamilyMember) => {
    setDeleteTargetMember(member);
  };

  const executeDeleteMember = async () => {
    if (!deleteTargetMember) return;
    setDeleting(true);
    setError(null);
    setSuccessMsg(null);

    const targetId = deleteTargetMember.mbrFamilyId;

    try {
      if (isSandbox) {
        const nextList = familyList.filter((f) => f.mbrFamilyId !== targetId);
        const sorted = sortFamilyList(nextList);
        setFamilyList(sorted);
        sessionStorage.setItem('sandbox_family', JSON.stringify(sorted));
        setSuccessMsg('Family member deleted successfully!');
      } else {
        await taskApi.deleteFamilyMember(targetId);
        const dbFamily = await taskApi.getFamilyMembers(mbrId);
        setFamilyList(sortFamilyList(dbFamily));
        setSuccessMsg('Family member deleted successfully!');
      }
      setDeleteTargetMember(null);
    } catch (err: any) {
      setError(`Failed to delete family member: ${err.message}`);
    } finally {
      setDeleting(false);
    }
  };

  const getInitials = (first: string, last: string) => {
    const f = first ? first[0] : '';
    const l = last ? last[0] : '';
    return (f + l).toUpperCase() || '?';
  };

  const getRelationLabel = (cdVal: string) => {
    const codeObj = relationshipCodes.find((c) => c.cdValue === cdVal);
    return codeObj ? codeObj.cdDesc : cdVal;
  };

  const calculateAge = (birthDateStr?: string): number | null => {
    if (!birthDateStr) return null;
    try {
      const birthDate = new Date(birthDateStr);
      if (isNaN(birthDate.getTime())) return null;
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch (e) {
      return null;
    }
  };

  // --- SORTING STATE ---
  type SortColumn = 'name' | 'age' | 'relationship';
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const sortedFamilyList = useMemo(() => {
    if (!sortColumn) {
      return sortFamilyList(familyList);
    }
    return [...familyList].sort((a, b) => {
      let comparison = 0;
      if (sortColumn === 'name') {
        const nameA = `${a.mbrFamilyFirstNm} ${a.mbrFamilyLastNm}`.toLowerCase();
        const nameB = `${b.mbrFamilyFirstNm} ${b.mbrFamilyLastNm}`.toLowerCase();
        comparison = nameA.localeCompare(nameB);
      } else if (sortColumn === 'age') {
        const ageA = calculateAge(a.mbrFamilyBirthDt);
        const ageB = calculateAge(b.mbrFamilyBirthDt);
        if (ageA === null && ageB === null) comparison = 0;
        else if (ageA === null) comparison = 1;
        else if (ageB === null) comparison = -1;
        else comparison = ageA - ageB;
      } else if (sortColumn === 'relationship') {
        const relA = getRelationLabel(a.mbrFamilyRelationshipCd).toLowerCase();
        const relB = getRelationLabel(b.mbrFamilyRelationshipCd).toLowerCase();
        comparison = relA.localeCompare(relB);
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [familyList, sortColumn, sortDirection, relationshipCodes]);

  // --- FAMILY PHOTO GALLERY HANDLERS ---
  const loadFamilyGallery = async (targetMbrId: string) => {
    if (!targetMbrId) return;
    try {
      const mediaList = await taskApi.getMemberMedia(targetMbrId);
      if (mediaList && Array.isArray(mediaList)) {
        // Filter strictly for category code "Family" only
        const familyMedia = mediaList.filter((m) => m.mbrMediaCategoryCd === 'Family');
        setFamilyGalleryItems(familyMedia);
      }
    } catch (err) {
      console.error("Error loading family gallery photos:", err);
    }
  };

  const handleOpenFamilyGalleryModal = async () => {
    setActiveGallerySubordinateId(null);
    setActiveGalleryTitle('Family');
    setShowFamilyGalleryModal(true);
    setCurrentFamilyPhotoIndex(0);
    setGalleryError(null);
    setGallerySuccess(null);
    await loadFamilyGallery(mbrId);
  };

  const handleOpenFamilyMemberGalleryModal = (member: FamilyMember) => {
    setActiveGallerySubordinateId(member.mbrFamilyId);
    setActiveGalleryTitle(`Family (${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm})`);
    setShowFamilyGalleryModal(true);
    setCurrentFamilyPhotoIndex(0);
    setGalleryError(null);
    setGallerySuccess(null);
  };

  const handleUploadFamilyPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (familyGalleryItems.length >= 40) {
      setGalleryError("Maximum limit of 40 family photos reached. Please delete an existing photo before adding a new one.");
      e.target.value = '';
      return;
    }

    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

    if (!validMimeTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setGalleryError("Invalid file format. Please upload an image file.");
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setGalleryError("File size exceeds 10MB limit.");
      e.target.value = '';
      return;
    }

    setUploadingFamilyPhoto(true);
    setGalleryError(null);
    setGallerySuccess(null);

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      // Storage path required: member/{mbrID}/family/{filename}
      const destinationPath = `member/${mbrId}/family/${cleanFileName}`;

      const uploadRes = await mediaApi.uploadMedia(file, destinationPath);
      const mediaBase = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';
      const rawUrl = uploadRes.data?.name ? `${mediaBase}/media/read/${uploadRes.data.name}` : `${mediaBase}/media/read/${destinationPath}`;
      const storageUrl = resolveMediaUrl(rawUrl);

      if (!isSandbox) {
        const newMediaRecord = await taskApi.createMemberMedia({
          mbrId: mbrId,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: 'Family',
          mbrMediaDescription: 'Enter a Description'
        });
        setFamilyGalleryItems((prev) => [newMediaRecord, ...prev]);
      } else {
        const mockItem: MbrMedia = {
          mbrMediaId: `fam-mock-${Date.now()}`,
          mbrId: mbrId,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: 'Family',
          mbrMediaDescription: 'Enter a Description',
          mbrMediaCreatedAt: new Date().toISOString()
        };
        setFamilyGalleryItems((prev) => [mockItem, ...prev]);
      }

      setCurrentFamilyPhotoIndex(0);
      setGallerySuccess("Family photo uploaded successfully.");
    } catch (err: any) {
      console.error("Error uploading family photo:", err);
      setGalleryError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingFamilyPhoto(false);
      e.target.value = '';
    }
  };

  const handleDeleteFamilyPhoto = async (mbrMediaId: string) => {
    if (!mbrMediaId) return;
    setDeletingFamilyMediaId(mbrMediaId);
    setGalleryError(null);
    setGallerySuccess(null);

    try {
      if (!isSandbox && !mbrMediaId.startsWith('fam-mock-') && !mbrMediaId.startsWith('f-mock-')) {
        await taskApi.deleteMemberMedia(mbrMediaId);
      }
      setFamilyGalleryItems((prev) => prev.filter((item) => item.mbrMediaId !== mbrMediaId));
      setCurrentFamilyPhotoIndex(0);
      setGallerySuccess("Family photo deleted.");
    } catch (err: any) {
      console.error("Error deleting family photo:", err);
      setGalleryError(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingFamilyMediaId(null);
    }
  };

  const activeFamilyPhotos = useMemo<MbrMedia[]>(() => {
    return familyGalleryItems;
  }, [familyGalleryItems]);

  const currentFamilyPhoto = activeFamilyPhotos[currentFamilyPhotoIndex] || activeFamilyPhotos[0];

  const handlePrevFamilyPhoto = () => {
    setIsEditingDescription(false);
    setCurrentFamilyPhotoIndex((prev) => (prev - 1 + activeFamilyPhotos.length) % activeFamilyPhotos.length);
  };

  const handleNextFamilyPhoto = () => {
    setIsEditingDescription(false);
    setCurrentFamilyPhotoIndex((prev) => (prev + 1) % activeFamilyPhotos.length);
  };

  const handleSavePhotoDescription = async () => {
    if (!currentFamilyPhoto?.mbrMediaId) return;
    setSavingDescription(true);
    setGalleryError(null);
    setGallerySuccess(null);

    try {
      const updatedDesc = editDescriptionInput.trim();
      if (!isSandbox && !currentFamilyPhoto.mbrMediaId.startsWith('fam-mock-') && !currentFamilyPhoto.mbrMediaId.startsWith('f-mock-')) {
        await taskApi.updateMemberMedia(currentFamilyPhoto.mbrMediaId, {
          mbrMediaDescription: updatedDesc
        });
      }
      setFamilyGalleryItems((prev) =>
        prev.map((item) =>
          item.mbrMediaId === currentFamilyPhoto.mbrMediaId
            ? { ...item, mbrMediaDescription: updatedDesc }
            : item
        )
      );
      setGallerySuccess("Photo description updated successfully.");
      setIsEditingDescription(false);
    } catch (err: any) {
      console.error("Failed to update photo description:", err);
      setGalleryError(`Failed to save description: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingDescription(false);
    }
  };

  useEffect(() => {
    if (!showFamilyGalleryModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIsEditingDescription(false);
        setCurrentFamilyPhotoIndex((prev) => (prev + 1) % activeFamilyPhotos.length);
      } else if (e.key === 'ArrowLeft') {
        setIsEditingDescription(false);
        setCurrentFamilyPhotoIndex((prev) => (prev - 1 + activeFamilyPhotos.length) % activeFamilyPhotos.length);
      } else if (e.key === 'Escape') {
        setIsEditingDescription(false);
        setShowFamilyGalleryModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showFamilyGalleryModal, activeFamilyPhotos.length]);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-6 relative">
      
      {/* --- PANEL HEADER --- */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50/50 border border-blue-100 text-blue-700 rounded-xl">
            <Users className="w-5 h-5" />
          </div>
          <h2 className="font-serif text-lg font-bold text-slate-800">Family</h2>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-blue-600 font-sans"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Member</span>
            </button>
          )}

          {/* Photo Gallery Icon Button */}
          <button
            onClick={handleOpenFamilyGalleryModal}
            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            title="Family Photo Gallery"
          >
            <Images className="w-4 h-4 text-blue-600" />
          </button>

          {/* Storybook Icon Button */}
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', { detail: { topicId: 'family', topicTitle: 'Family', componentName: 'sbMbrStryFamly' } }))}
            className="p-2 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
            title={readOnly ? "View Member Stories" : "Story Editor"}
          >
            <BookOpen className="w-4 h-4 text-blue-500" />
          </button>

          {!readOnly && (
            <button
              onClick={() => alert('Opening Privacy settings for family members...')}
              className="p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl cursor-pointer transition-colors"
              title="Privacy settings"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>
          )}
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
          <span className="text-xs font-medium">Loading family members...</span>
        </div>
      ) : familyList.length === 0 ? (
        <div className="bg-slate-50/50 border border-slate-100 border-dashed py-10 px-4 rounded-2xl text-center">
          <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-serif text-slate-500 italic">No family members registered.</p>
          {!readOnly && (
            <button
              onClick={handleOpenAddModal}
              className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-all"
            >
              <Plus className="w-3.5 h-3.5" /> Add Family Member
            </button>
          )}
        </div>
      ) : (
        /* FAMILY TABLE VIEW */
        <div className="border border-[#EFECE7] rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="max-h-[220px] overflow-y-auto overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#EFECE7] text-[11px] font-serif font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
                  <th className="py-2.5 px-3.5 align-bottom">
                    <button
                      type="button"
                      onClick={() => handleSort('name')}
                      className="group/btn inline-flex items-center gap-1.5 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                    >
                      <span>Member</span>
                      {sortColumn === 'name' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 align-bottom">
                    <button
                      type="button"
                      onClick={() => handleSort('age')}
                      className="group/btn inline-flex items-center gap-1.5 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                    >
                      <span>Age</span>
                      {sortColumn === 'age' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3 align-bottom">
                    <button
                      type="button"
                      onClick={() => handleSort('relationship')}
                      className="group/btn inline-flex items-center gap-1.5 cursor-pointer select-none text-left font-serif font-bold text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-wider"
                    >
                      <span>Relationship</span>
                      {sortColumn === 'relationship' ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        ) : (
                          <ArrowDown className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-slate-600 opacity-60 group-hover/btn:opacity-100 shrink-0" />
                      )}
                    </button>
                  </th>
                  <th className="py-2.5 px-3.5 text-right align-bottom">
                    <span className="inline-block uppercase tracking-wider">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFECE7]/70 text-xs">
                {sortedFamilyList.map((member) => (
                  <tr
                    key={member.mbrFamilyId}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Member Name + Avatar (without middle name) */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-700 font-serif font-bold text-xs shrink-0">
                          {getInitials(member.mbrFamilyFirstNm, member.mbrFamilyLastNm)}
                        </div>
                        <span className="font-serif font-bold text-slate-800 truncate">
                          {member.mbrFamilyFirstNm} {member.mbrFamilyLastNm}
                        </span>
                      </div>
                    </td>

                    {/* Age */}
                    <td className="py-2.5 px-3">
                      {calculateAge(member.mbrFamilyBirthDt) !== null ? (
                        <span className="font-mono text-slate-700 font-semibold text-xs">
                          {calculateAge(member.mbrFamilyBirthDt)}
                        </span>
                      ) : (
                        <span className="text-slate-300 font-mono text-xs">—</span>
                      )}
                    </td>

                    {/* Relationship Badge */}
                    <td className="py-2.5 px-3">
                      <span className="inline-flex items-center px-2 py-0.5 text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-100/70 rounded-full uppercase tracking-wider">
                        {getRelationLabel(member.mbrFamilyRelationshipCd)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-2.5 px-3.5 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenFamilyMemberGalleryModal(member)}
                          title={`Photo Gallery for ${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Images className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => window.dispatchEvent(new CustomEvent('open-story-editor', {
                            detail: {
                              topicId: 'family',
                              topicTitle: `Family (${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm})`,
                              componentName: 'sbMbrStryFamilyMember',
                              subordinateId: member.mbrFamilyId,
                              subordinateName: `${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm}`
                            }
                          }))}
                          title={readOnly ? `View Stories for ${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm}` : `Story Editor for ${member.mbrFamilyFirstNm} ${member.mbrFamilyLastNm}`}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                        </button>
                        {!readOnly && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(member)}
                              title="Edit Family Member"
                              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => promptDeleteMember(member)}
                              title="Delete Family Member"
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- EDIT / ADD FAMILY MEMBER POP-UP MODAL DIALOG --- */}
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
                  {editingMemberId ? 'Edit Family Member' : 'Add Family Member'}
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
                  <button onClick={() => setModalError(null)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Modal Form Controls */}
              <div className="space-y-4 text-left">
                {/* Relationship Dropdown */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Relationship Type
                  </label>
                  <select
                    value={formRelationship}
                    onChange={(e) => setFormRelationship(e.target.value)}
                    className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-700 py-2.5 px-3 outline-none focus:border-slate-800 cursor-pointer"
                  >
                    {relationshipCodes.map((code) => (
                      <option key={code.cdValue} value={code.cdValue}>
                        {code.cdDesc}
                      </option>
                    ))}
                  </select>
                </div>

                {/* First Name, Middle Name & Last Name Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formFirstNm}
                      onChange={(e) => setFormFirstNm(e.target.value)}
                      placeholder="e.g. Thomas"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Middle Name
                    </label>
                    <input
                      type="text"
                      value={formMiddleNm}
                      onChange={(e) => setFormMiddleNm(e.target.value)}
                      placeholder="e.g. Allen"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formLastNm}
                      onChange={(e) => setFormLastNm(e.target.value)}
                      placeholder="e.g. Hartwell"
                      className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-bold text-slate-800 py-2.5 px-2.5 outline-none focus:border-slate-800"
                    />
                  </div>
                </div>

                {/* Birth Date Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    Birth Date
                  </label>
                  <input
                    type="date"
                    value={formBirthDt}
                    onChange={(e) => setFormBirthDt(e.target.value)}
                    className="w-full bg-white border border-[#EFECE7] rounded-xl text-xs font-mono font-medium text-slate-800 py-2.5 px-3 outline-none focus:border-slate-800"
                  />
                  <p className="text-[11px] text-slate-400 font-serif leading-normal mt-0.5">
                    Birth Dates are not displayed to others. Birth Dates may come in handy as StoryMate helps you generate stories.
                  </p>
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
        {deleteTargetMember && (
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
                  Delete Family Member?
                </h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed mt-1.5">
                  Are you sure you want to remove <span className="font-bold text-slate-700">{deleteTargetMember.mbrFamilyFirstNm} {deleteTargetMember.mbrFamilyLastNm}</span> from your family directory? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setDeleteTargetMember(null)}
                  disabled={deleting}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer disabled:opacity-50 font-sans"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={executeDeleteMember}
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
        isOpen={showFamilyGalleryModal}
        onClose={() => setShowFamilyGalleryModal(false)}
        mbrId={mbrId}
        categoryCd="Family"
        categoryTitle={activeGalleryTitle}
        subordinateId={activeGallerySubordinateId}
        isSandbox={isSandbox}
        maxPhotos={activeGallerySubordinateId ? 12 : 40}
        readOnly={readOnly}
      />

      <AdminComponentTag name="mbrStoryFamilyPanel" />
    </div>
  );
}

export { MbrStoryFamilyPanel, MbrStoryFamilyPanel as mbrStoryFamilyPanel, MbrStoryFamilyPanel as SbMbrStryFamily };
