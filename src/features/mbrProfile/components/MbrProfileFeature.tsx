/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera, User, Calendar, Save, ArrowLeft, Loader2, 
  CheckCircle2, AlertCircle, Image as ImageIcon, Sparkles, Upload,
  AlertTriangle, X, Heart, MapPin, Briefcase, GraduationCap, Home, Mail, Plus, Trash2, Check
} from 'lucide-react';
import { taskApi, mediaApi, resolveMediaUrl, MbrMedia } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import StoryMatePanel from '@/src/features/sbMbrAuthorPage/components/StoryMatePanel';
import ImageCropModal from './ImageCropModal';

interface MbrProfileFeatureProps {
  isSandbox: boolean;
  onClickBack: () => void;
  onDirtyChange?: (dirty: boolean) => void;
}




export default function MbrProfileFeature({ isSandbox, onClickBack, onDirtyChange }: MbrProfileFeatureProps) {
  // --- STATE DEFINITIONS ---
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Member profile state
  const [mbrId, setMbrId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    mbrFirstName: '',
    mbrLastName: '',
    mbrMiddleName: '',
    mbrBirthDate: '',
    mbrDeathDate: '',
    mbrGenderCd: '',
    mbrRelationshipStatusCd: '',
    mbrLivesCityState: '',
    mbrFromCityState: '',
    mbrWorkAt: '',
    mbrStudiedAt: '',
    mbrEmailAddress: '',
    mbrIntroduction: '',
    mbrProfilePic: ''
  });

  // Local state for image upload preview (data URL)
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Unsaved changes tracking state
  const [initialData, setInitialData] = useState<{ formData: typeof formData; previewImage: string | null } | null>(null);
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [showStoryMate, setShowStoryMate] = useState(false);

  // Member Photo Gallery state
  const [galleryItems, setGalleryItems] = useState<MbrMedia[]>([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingGalleryPhoto, setUploadingGalleryPhoto] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);

  // Listen for StoryMate AI text insertion updates
  useEffect(() => {
    const handleUpdateContent = (e: any) => {
      const detail = e.detail || {};
      if (detail.text) {
        setFormData((prev) => ({
          ...prev,
          mbrIntroduction: prev.mbrIntroduction 
            ? `${prev.mbrIntroduction}\n\n${detail.text}`
            : detail.text
        }));
      }
    };
    window.addEventListener('update-story-editor-content', handleUpdateContent);
    return () => window.removeEventListener('update-story-editor-content', handleUpdateContent);
  }, []);

  // Compute dirty status (true if any field was changed from initial loaded state)
  const isDirty = useMemo(() => {
    if (!initialData) return false;
    return (
      formData.mbrFirstName !== initialData.formData.mbrFirstName ||
      formData.mbrLastName !== initialData.formData.mbrLastName ||
      formData.mbrMiddleName !== initialData.formData.mbrMiddleName ||
      formData.mbrBirthDate !== initialData.formData.mbrBirthDate ||
      formData.mbrDeathDate !== initialData.formData.mbrDeathDate ||
      formData.mbrGenderCd !== initialData.formData.mbrGenderCd ||
      formData.mbrRelationshipStatusCd !== initialData.formData.mbrRelationshipStatusCd ||
      formData.mbrLivesCityState !== initialData.formData.mbrLivesCityState ||
      formData.mbrFromCityState !== initialData.formData.mbrFromCityState ||
      formData.mbrWorkAt !== initialData.formData.mbrWorkAt ||
      formData.mbrStudiedAt !== initialData.formData.mbrStudiedAt ||
      formData.mbrEmailAddress !== initialData.formData.mbrEmailAddress ||
      formData.mbrIntroduction !== initialData.formData.mbrIntroduction ||
      formData.mbrProfilePic !== initialData.formData.mbrProfilePic ||
      previewImage !== initialData.previewImage
    );
  }, [formData, previewImage, initialData]);

  // Notify parent component of dirty state changes
  useEffect(() => {
    if (onDirtyChange) {
      onDirtyChange(isDirty);
    }
  }, [isDirty, onDirtyChange]);

  // Browser level protection (beforeunload prompt when reloading/closing tab)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  // --- DATA LOADING (useEffect) ---
  useEffect(() => {
    loadMemberProfile();
  }, [isSandbox]);

  const loadMemberProfile = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      setError("No logged-in user session found. Please logon first.");
      setLoading(false);
      return;
    }

    try {
      const u = JSON.parse(userStr);
      setUserId(u.user_id);

      if (isSandbox) {
        // --- SANDBOX MODE ---
        const savedMbr = sessionStorage.getItem('sandbox_mbr');
        if (savedMbr) {
          const mbr = JSON.parse(savedMbr);
          setMbrId(mbr.mbrId);
          setFormData(mbr);
          setPreviewImage(mbr.mbrProfilePic);
          setInitialData({ formData: mbr, previewImage: mbr.mbrProfilePic });
        } else {
          // Initialize default Eleanor Hartwell template for sandbox
          const defaultMbr = {
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Hartwell',
            mbrMiddleName: 'Ruth',
            mbrBirthDate: '1961-10-14',
            mbrDeathDate: '',
            mbrGenderCd: 'Female',
            mbrRelationshipStatusCd: 'Married',
            mbrLivesCityState: 'Coos Bay, Oregon',
            mbrFromCityState: 'Seattle, Washington',
            mbrWorkAt: 'Coos Bay Public Library',
            mbrStudiedAt: 'University of Washington',
            mbrEmailAddress: 'eleanor.hartwell@example.com',
            mbrIntroduction: 'Eleanor Hartwell was born in the coastal town of Coos Bay, Oregon...',
            mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format'
          };
          sessionStorage.setItem('sandbox_mbr', JSON.stringify({ ...defaultMbr, mbrId: 'sandbox-id-eleanor' }));
          setMbrId('sandbox-id-eleanor');
          setFormData(defaultMbr);
          setPreviewImage(defaultMbr.mbrProfilePic);
          setInitialData({ formData: defaultMbr, previewImage: defaultMbr.mbrProfilePic });
        }
      } else {
        // --- LIVE DATABASE MODE ---
        try {
          const mbr = await taskApi.getMemberByUserId(u.user_id);
          if (mbr) {
            setMbrId(mbr.mbrId);
            const resolvedPic = resolveMediaUrl(mbr.mbrProfilePic || '');
            const loadedForm = {
              mbrFirstName: mbr.mbrFirstName || '',
              mbrLastName: mbr.mbrLastName || '',
              mbrMiddleName: mbr.mbrMiddleName || '',
              mbrBirthDate: mbr.mbrBirthDate || '',
              mbrDeathDate: mbr.mbrDeathDate || '',
              mbrGenderCd: mbr.mbrGenderCd || '',
              mbrRelationshipStatusCd: mbr.mbrRelationshipStatusCd || '',
              mbrLivesCityState: mbr.mbrLivesCityState || '',
              mbrFromCityState: mbr.mbrFromCityState || '',
              mbrWorkAt: mbr.mbrWorkAt || '',
              mbrStudiedAt: mbr.mbrStudiedAt || '',
              mbrEmailAddress: mbr.mbrEmailAddress || '',
              mbrIntroduction: mbr.mbrIntroduction || '',
              mbrProfilePic: resolvedPic
            };
            setFormData(loadedForm);
            // If the saved profile picture is stored locally for session
            const cachedPic = sessionStorage.getItem(`session_pic_${mbr.mbrId}`);
            const finalPreview = resolveMediaUrl(cachedPic) || resolvedPic || '';
            setPreviewImage(finalPreview);
            setInitialData({ formData: loadedForm, previewImage: finalPreview });
          }
        } catch (err: any) {
          if (err.message.includes('404') || err.message.includes('not found')) {
            console.log("No member profile found, initializing creation draft");
            const emailPrefix = u.email ? u.email.split('@')[0] : 'mark.sowiak';
            const names = emailPrefix.split('.');
            const draftForm = {
              mbrFirstName: names[0] ? names[0].charAt(0).toUpperCase() + names[0].slice(1) : 'Mark',
              mbrLastName: names[1] ? names[1].charAt(0).toUpperCase() + names[1].slice(1) : 'Sowiak',
              mbrMiddleName: '',
              mbrBirthDate: '1990-01-01',
              mbrDeathDate: '',
              mbrGenderCd: 'Male',
              mbrRelationshipStatusCd: '',
              mbrLivesCityState: '',
              mbrFromCityState: '',
              mbrWorkAt: '',
              mbrStudiedAt: '',
              mbrEmailAddress: u.email || '',
              mbrIntroduction: 'Co-authored narrative story biography workspace.',
              mbrProfilePic: ''
            };
            setFormData(draftForm);
            setInitialData({ formData: draftForm, previewImage: '' });
          } else {
            throw err;
          }
        }
      }
    } catch (err: any) {
      console.error("Error loading member profile:", err);
      setError(`Failed to retrieve member profile: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM SUBMISSION ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    // Form validation
    if (!formData.mbrFirstName.trim() || !formData.mbrLastName.trim()) {
      setError("First Name and Last Name are required.");
      setSaving(false);
      return;
    }

    try {
      const payload: any = {
        mbrFirstName: formData.mbrFirstName.trim(),
        mbrLastName: formData.mbrLastName.trim(),
        mbrMiddleName: formData.mbrMiddleName.trim() || null,
        mbrBirthDate: formData.mbrBirthDate || null,
        mbrDeathDate: formData.mbrDeathDate || null,
        mbrGenderCd: formData.mbrGenderCd || null,
        mbrRelationshipStatusCd: formData.mbrRelationshipStatusCd.trim() || null,
        mbrLivesCityState: formData.mbrLivesCityState.trim() || null,
        mbrFromCityState: formData.mbrFromCityState.trim() || null,
        mbrWorkAt: formData.mbrWorkAt.trim() || null,
        mbrStudiedAt: formData.mbrStudiedAt.trim() || null,
        mbrEmailAddress: formData.mbrEmailAddress.trim() || null,
        mbrIntroduction: formData.mbrIntroduction.trim() || null,
        mbrProfilePic: formData.mbrProfilePic.trim() || null,
        user_id: userId
      };

      if (isSandbox) {
        // Save sandbox state
        const updatedMbr = { ...payload, mbrId: mbrId || 'sandbox-id-eleanor' };
        sessionStorage.setItem('sandbox_mbr', JSON.stringify(updatedMbr));
        
        // Update public stories feed list avatar
        const updatedStories = sessionStorage.getItem('sandbox_stories');
        if (updatedStories) {
          const stories = JSON.parse(updatedStories);
          const idx = stories.findIndex((s: any) => s.id === 'm1');
          if (idx !== -1) {
            stories[idx].name = `${payload.mbrFirstName} ${payload.mbrLastName}`;
            stories[idx].avatarUrl = payload.mbrProfilePic;
            stories[idx].excerpt = payload.mbrIntroduction ? payload.mbrIntroduction.substring(0, 150) + "..." : "";
            sessionStorage.setItem('sandbox_stories', JSON.stringify(stories));
          }
        }

        setSuccess("Sandbox member profile updated successfully!");
        setMbrId(updatedMbr.mbrId);
        setInitialData({ formData: { ...payload, mbrProfilePic: payload.mbrProfilePic || '' }, previewImage: previewImage });
      } else {
        // Save live database
        if (mbrId) {
          // UPDATE
          const res = await taskApi.updateMember(mbrId, payload);
          setSuccess("Member profile updated successfully in sbDB100!");
          if (res.mbrId && payload.mbrProfilePic) {
            sessionStorage.setItem(`session_pic_${res.mbrId}`, payload.mbrProfilePic);
          }
          setInitialData({ formData: { ...payload, mbrProfilePic: payload.mbrProfilePic || '' }, previewImage: previewImage });
        } else {
          // CREATE
          // We call taskApi to create member record using FastAPI POST /mbrs
          const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/mbrs`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            const data = await response.json();
            throw new Error(data.detail || "Failed to create member profile.");
          }
          const res = await response.json();
          setMbrId(res.mbrId);
          setSuccess("Member profile created successfully in sbDB100!");
          if (res.mbrId && payload.mbrProfilePic) {
            sessionStorage.setItem(`session_pic_${res.mbrId}`, payload.mbrProfilePic);
          }
          setInitialData({ formData: { ...payload, mbrProfilePic: payload.mbrProfilePic || '' }, previewImage: previewImage });
        }
      }

      if (onDirtyChange) {
        onDirtyChange(false);
      }
      setTimeout(() => {
        onClickBack();
      }, 0);
    } catch (err: any) {
      console.error("Error saving member profile:", err);
      setError(`Failed to save changes: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  // State for image crop modal & upload status
  const [uploadingImage, setUploadingImage] = useState(false);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string>('');
  const [pendingUploadFile, setPendingUploadFile] = useState<File | null>(null);

  // --- IMAGE CROP & UPLOAD TO CLOUD STORAGE ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type is a valid display image (.jpg, .jpeg, .png, .gif, .webp, .svg)
    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

    if (!validMimeTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setError("Invalid file type. Please select a valid image file (.png, .jpg, .jpeg, .webp, .gif, .svg).");
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose an image file under 10MB.");
      e.target.value = '';
      return;
    }

    setError(null);
    setSuccess(null);

    // Open Crop Modal with selected local image
    const rawUrl = URL.createObjectURL(file);
    setPendingUploadFile(file);
    setCropImageSrc(rawUrl);
    setCropModalOpen(true);

    e.target.value = '';
  };

  // Perform Cloud Storage Upload after Crop
  const handleCropComplete = async (croppedBlob: Blob, croppedDataUrl: string) => {
    setCropModalOpen(false);
    setUploadingImage(true);

    const originalName = pendingUploadFile?.name || 'profile.jpg';
    const croppedFile = new File([croppedBlob], originalName, { type: 'image/jpeg' });

    try {
      // Determine member ID or generate a draft ID
      let targetMbrId = mbrId;
      if (!targetMbrId) {
        targetMbrId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `mbr-${Date.now()}`;
        setMbrId(targetMbrId);
      }

      // Required Cloud Storage folder path: /member/{mbrId}/profile/{filename}
      const cleanFileName = croppedFile.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destinationPath = `member/${targetMbrId}/profile/${cleanFileName}`;

      // Perform upload to Google Cloud Storage via sb-api-media
      const uploadRes = await mediaApi.uploadMedia(croppedFile, destinationPath);

      const mediaBase = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';
      const rawUrl = uploadRes.data?.name ? `${mediaBase}/media/read/${uploadRes.data.name}` : `${mediaBase}/media/read/${destinationPath}`;
      const storageUrl = resolveMediaUrl(rawUrl);

      // Refresh picture in display window and form state
      setFormData((prev) => ({ ...prev, mbrProfilePic: storageUrl }));
      setPreviewImage(storageUrl);
      setSuccess("Cropped profile picture uploaded successfully.");
    } catch (err: any) {
      console.error("Error uploading cropped image to cloud storage:", err);
      // Fallback to cropped Data URL preview if media service unreachable
      setPreviewImage(croppedDataUrl);
      setFormData((prev) => ({ ...prev, mbrProfilePic: croppedDataUrl }));
      setSuccess("Cropped profile picture updated locally.");
    } finally {
      if (cropImageSrc) {
        URL.revokeObjectURL(cropImageSrc);
      }
      setCropImageSrc('');
      setPendingUploadFile(null);
      setUploadingImage(false);
    }
  };

  const handleCropCancel = () => {
    setCropModalOpen(false);
    if (cropImageSrc) {
      URL.revokeObjectURL(cropImageSrc);
    }
    setCropImageSrc('');
    setPendingUploadFile(null);
  };

  // Load Member Photo Gallery from mbrMedia table
  const loadMemberGallery = async (targetMbrId: string) => {
    if (!targetMbrId || isSandbox) return;
    setLoadingGallery(true);
    try {
      const mediaList = await taskApi.getMemberMedia(targetMbrId);
      // Filter gallery photos (mbrMediaCategoryCd === 'Profile' or general category)
      const profileMedia = mediaList.filter(
        item => !item.mbrMediaCategoryCd || item.mbrMediaCategoryCd === 'Profile'
      );
      setGalleryItems(profileMedia);
    } catch (err) {
      console.error("Error loading member gallery photos:", err);
    } finally {
      setLoadingGallery(false);
    }
  };

  useEffect(() => {
    if (mbrId && !isSandbox) {
      loadMemberGallery(mbrId);
    }
  }, [mbrId, isSandbox]);

  // Upload and save photo to Member Gallery
  const handleAddGalleryPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (galleryItems.length >= 20) {
      setError("Maximum limit of 20 member gallery photos reached. Please delete an existing photo before adding a new one.");
      e.target.value = '';
      return;
    }

    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

    if (!validMimeTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setError("Invalid file type. Please select a valid image file.");
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Please choose an image file under 10MB.");
      e.target.value = '';
      return;
    }

    setUploadingGalleryPhoto(true);
    setError(null);

    try {
      let targetMbrId = mbrId;
      if (!targetMbrId) {
        targetMbrId = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `mbr-${Date.now()}`;
        setMbrId(targetMbrId);
      }

      // Required Cloud Storage folder path: member/{mbrId}/profile/gallery/{filename}
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destinationPath = `member/${targetMbrId}/profile/gallery/${cleanFileName}`;

      // Upload file to Google Cloud Storage
      const uploadRes = await mediaApi.uploadMedia(file, destinationPath);
      const mediaBase = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';
      const rawUrl = uploadRes.data?.name ? `${mediaBase}/media/read/${uploadRes.data.name}` : `${mediaBase}/media/read/${destinationPath}`;
      const storageUrl = resolveMediaUrl(rawUrl);

      if (!isSandbox) {
        // Create database record in mbrMedia table
        const newMediaRecord = await taskApi.createMemberMedia({
          mbrId: targetMbrId,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: 'Profile',
          mbrMediaDescription: 'Member Profile Gallery Photo'
        });

        setGalleryItems((prev) => [newMediaRecord, ...prev]);
      } else {
        const mockItem: MbrMedia = {
          mbrMediaId: `gallery-mock-${Date.now()}`,
          mbrId: targetMbrId,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: 'Profile',
          mbrMediaCreatedAt: new Date().toISOString()
        };
        setGalleryItems((prev) => [mockItem, ...prev]);
      }

      // Gallery photo added and saved to mbrMedia table
      setSuccess("Gallery photo uploaded and saved successfully.");
    } catch (err: any) {
      console.error("Error adding gallery photo:", err);
      setError(`Failed to upload gallery photo: ${err.message || 'Unknown error'}`);
    } finally {
      setUploadingGalleryPhoto(false);
      e.target.value = '';
    }
  };

  // Delete photo from Member Gallery
  const handleDeleteGalleryPhoto = async (mbrMediaId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    if (!mbrMediaId) return;

    setDeletingMediaId(mbrMediaId);
    try {
      if (!isSandbox && !mbrMediaId.startsWith('gallery-mock-')) {
        await taskApi.deleteMemberMedia(mbrMediaId);
      }
      setGalleryItems((prev) => prev.filter((item) => item.mbrMediaId !== mbrMediaId));
      setSuccess("Gallery photo deleted.");
    } catch (err: any) {
      console.error("Error deleting gallery photo:", err);
      setError(`Failed to delete photo: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingMediaId(null);
    }
  };

  // Select photo from Member Gallery
  const handleSelectGalleryPhoto = (_url: string) => {
    // Gallery photos remain in gallery without mutating primary profile avatar
  };

  // Handler for explicit Cancel button: directly reverts changes and leaves without popup prompt
  const handleExplicitCancel = () => {
    if (initialData) {
      setFormData(initialData.formData);
      setPreviewImage(initialData.previewImage);
    }
    if (onDirtyChange) {
      onDirtyChange(false);
    }
    setTimeout(() => {
      onClickBack();
    }, 0);
  };

  // Navigation guard helper for top back button
  const handleAttemptBack = () => {
    if (isDirty) {
      setShowDiscardModal(true);
    } else {
      onClickBack();
    }
  };

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false);
    if (initialData) {
      setFormData(initialData.formData);
      setPreviewImage(initialData.previewImage);
    }
    if (onDirtyChange) {
      onDirtyChange(false);
    }
    setTimeout(() => {
      onClickBack();
    }, 0);
  };

  if (loading) {
    return (
      <div className="w-full min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          <p className="text-xs text-slate-400 font-serif">Retrieving member profile record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 md:p-10 shadow-[0_12px_40px_rgba(0,0,0,0.02)] animate-fade-in relative">
      
      {/* --- UNSAVED CHANGES CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {showDiscardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white border border-[#EFECE7] rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-slate-800">Unsaved Changes</h3>
                <p className="text-xs text-slate-500 font-serif leading-relaxed">
                  You have modified fields on your member profile settings. If you leave or cancel now, your unsaved changes will be lost.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowDiscardModal(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDiscard}
                  className="w-full sm:w-auto px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold font-sans transition-all cursor-pointer shadow-xs"
                >
                  Discard Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#EFECE7] mb-8">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleAttemptBack}
            className="p-2 bg-slate-50 hover:bg-slate-100 border border-[#EFECE7] text-slate-600 rounded-xl transition-all cursor-pointer"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-black text-slate-800 tracking-tight">Member Profile</h2>
              <span className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                isSandbox ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {isSandbox ? 'Sandbox' : 'sbDB100 Live'}
              </span>
            </div>
            <p className="text-xs text-slate-450 font-serif mt-0.5">Customize your biography narratives, demographics, and profile visual assets.</p>
          </div>
        </div>
      </div>

      {/* --- FEEDBACK ALERTS --- */}
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-rose-50 border border-rose-100 text-rose-700 rounded-2xl mb-6 text-xs font-serif leading-relaxed"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}

      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 text-emerald-700 rounded-2xl mb-6 text-xs font-serif leading-relaxed"
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </motion.div>
      )}

      {/* --- PROFILE FORM --- */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* PROFILE PICTURE COLUMN */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Profile Picture</h3>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Avatar Preview & Upload Button */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="w-28 h-28 rounded-2xl overflow-hidden border-2 border-white shadow-md bg-slate-100 flex items-center justify-center relative">
                {previewImage ? (
                  <img 
                    src={previewImage} 
                    alt="Profile Preview" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <User className="w-12 h-12 text-slate-300" />
                )}

                {uploadingImage && (
                  <div className="absolute inset-0 bg-slate-900/70 flex flex-col items-center justify-center text-white gap-1.5 z-10">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
                    <span className="text-[9px] font-bold">Uploading...</span>
                  </div>
                )}
              </div>
              
              <label 
                htmlFor="avatar-upload" 
                className={`inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-sm transition-all duration-150 ${
                  uploadingImage ? 'opacity-50 pointer-events-none' : 'hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploadingImage ? 'Uploading...' : 'Upload Image'}</span>
              </label>
              
              <input 
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                onChange={handleImageChange}
                disabled={uploadingImage}
                className="hidden"
              />
            </div>

            {/* Member Photo Gallery Section in Vertical Scroll Window */}
            <div className="flex-grow space-y-2.5 w-full">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Member Photo Gallery</span>
                  <p className="text-[11px] text-slate-450 font-serif leading-relaxed">Add photos that will be displayed as part of your Member Profile to Friends, Family, and Others based upon your security preferences.</p>
                </div>

                {/* Add Photo Button with (count/20) indicator */}
                <label 
                  htmlFor="gallery-photo-upload" 
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    galleryItems.length >= 20 
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : uploadingGalleryPhoto 
                        ? 'bg-blue-50 text-blue-700 border border-blue-200/80 opacity-50 pointer-events-none' 
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                  title={galleryItems.length >= 20 ? 'Maximum 20 photos reached' : 'Add Photo to Gallery'}
                >
                  {uploadingGalleryPhoto ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Adding...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Photo ({galleryItems.length}/20)</span>
                    </>
                  )}
                </label>
                <input 
                  id="gallery-photo-upload"
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                  onChange={handleAddGalleryPhoto}
                  disabled={uploadingGalleryPhoto || galleryItems.length >= 20}
                  className="hidden"
                />
              </div>

              {/* Vertical Scrollable Container for Gallery Thumbnails */}
              <div className="max-h-[195px] overflow-y-auto pr-2 space-y-2 border border-[#EFECE7] rounded-2xl p-3 bg-white/70 shadow-inner min-h-[120px]">
                {loadingGallery ? (
                  <div className="flex items-center justify-center h-24 text-slate-400 gap-2 text-xs font-serif">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                    <span>Loading gallery photos...</span>
                  </div>
                ) : galleryItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center text-slate-400 gap-1.5">
                    <ImageIcon className="w-8 h-8 opacity-40 text-slate-400" />
                    <p className="text-xs font-serif text-slate-500">No profile gallery photos saved yet.</p>
                    <p className="text-[10px] text-slate-400 font-sans">Click "Add Photo" above to upload photos to your gallery.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-5 gap-2.5">
                    {galleryItems.map((item) => {
                      const itemUrl = resolveMediaUrl(item.mbrMediaPath);
                      const isDeleting = deletingMediaId === item.mbrMediaId;

                      return (
                        <div
                          key={item.mbrMediaId}
                          className="group relative aspect-square rounded-2xl overflow-hidden border p-1 bg-white transition-all border-[#EFECE7] hover:border-slate-400 shadow-xs"
                          title={item.mbrMediaOriginalFilename || 'Member Gallery Photo'}
                        >
                          <img 
                            src={itemUrl} 
                            alt={item.mbrMediaOriginalFilename || 'Gallery Thumbnail'} 
                            className="w-full h-full object-cover rounded-xl" 
                          />

                          {/* Delete Hover Action */}
                          <button
                            type="button"
                            onClick={(e) => handleDeleteGalleryPhoto(item.mbrMediaId, e)}
                            disabled={isDeleting}
                            className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-lg bg-red-600/90 hover:bg-red-700 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-xs cursor-pointer z-10"
                            title="Delete photo from gallery"
                          >
                            {isDeleting ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Trash2 className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* DEMOGRAPHIC NAMES SECTION */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Demographics</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">First Name *</label>
              <input 
                type="text" 
                value={formData.mbrFirstName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrFirstName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                required
              />
            </div>
            
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Middle Name</label>
              <input 
                type="text" 
                value={formData.mbrMiddleName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrMiddleName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Last Name *</label>
              <input 
                type="text" 
                value={formData.mbrLastName}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrLastName: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Birth Date</label>
              <div className="relative">
                <input 
                  type="date" 
                  value={formData.mbrBirthDate}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrBirthDate: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Gender Classification</label>
              <select 
                value={formData.mbrGenderCd}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrGenderCd: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3 py-2.5 text-slate-700 transition-colors"
              >
                <option value="">-- Choose Gender --</option>
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Non-Binary">Non-Binary</option>
                <option value="Rather not say">Rather not say</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Relationship Status</label>
              <select 
                value={formData.mbrRelationshipStatusCd}
                onChange={(e) => setFormData((prev) => ({ ...prev, mbrRelationshipStatusCd: e.target.value }))}
                className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3 py-2.5 text-slate-700 transition-colors"
              >
                <option value="">-- Choose Relationship Status --</option>
                <option value="Single">Single</option>
                <option value="In a relationship">In a relationship</option>
                <option value="Engaged">Engaged</option>
                <option value="Married">Married</option>
                <option value="Separated">Separated</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Rather not say">Rather not say</option>
              </select>
            </div>
          </div>
        </div>

        {/* PERSONAL BACKGROUND & PLACES */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-650" />
            <h3 className="font-serif text-sm font-bold text-slate-800">Background & Places</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Lives In (City, State)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Coos Bay, Oregon"
                  value={formData.mbrLivesCityState}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrLivesCityState: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">From / Hometown (City, State)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Seattle, Washington"
                  value={formData.mbrFromCityState}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrFromCityState: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Works At (Company / Organization)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. Coos Bay Library"
                  value={formData.mbrWorkAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrWorkAt: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Studied At (School / University)</label>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="e.g. University of Washington"
                  value={formData.mbrStudiedAt}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrStudiedAt: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Email Address</label>
              <div className="relative">
                <input 
                  type="email" 
                  placeholder="e.g. eleanor.hartwell@example.com"
                  value={formData.mbrEmailAddress}
                  onChange={(e) => setFormData((prev) => ({ ...prev, mbrEmailAddress: e.target.value }))}
                  className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-xl px-3.5 py-2.5 text-slate-700 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>

        {/* LONG FORM BIOGRAPHY / CONTEXT */}
        <div className="bg-slate-50/50 p-6 border border-[#EFECE7] rounded-3xl space-y-6">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-slate-650" />
              <h3 className="font-serif text-sm font-bold text-slate-800">Introduction</h3>
            </div>

            <button
              type="button"
              onClick={() => setShowStoryMate((prev) => !prev)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-800 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-2xs"
              title="StoryMate AI Assistant for Profile Introduction"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>StoryMate AI</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono block">Introduction / Biography / Co-authored Story Context</label>
            <textarea 
              rows={6}
              placeholder="Tell your life story, co-authored chronicles or write an introductory excerpt..."
              value={formData.mbrIntroduction}
              onChange={(e) => setFormData((prev) => ({ ...prev, mbrIntroduction: e.target.value }))}
              className="w-full text-xs font-serif bg-white border border-[#EFECE7] focus:border-slate-400 focus:outline-none rounded-2xl px-3.5 py-3 text-slate-700 transition-colors resize-y leading-relaxed"
            />
            <p className="text-[10px] text-slate-400 font-serif mt-1">This text appears as the primary long-form introduction for your profile portfolio.</p>
          </div>

          {showStoryMate && (
            <div className="pt-2">
              <StoryMatePanel
                memberName={formData.mbrFirstName || 'Member'}
                componentName="SbMbrProfile"
                storyTitle="Member Profile Introduction"
                storyContent={formData.mbrIntroduction}
                onClose={() => setShowStoryMate(false)}
              />
            </div>
          )}
        </div>

        {/* --- BUTTONS --- */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#EFECE7]">
          <button
            type="button"
            onClick={handleExplicitCancel}
            className="px-6 py-2.5 bg-transparent hover:bg-slate-50 text-slate-650 hover:text-slate-800 border border-transparent hover:border-[#EFECE7] rounded-xl text-xs font-bold font-sans transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={saving || !isDirty}
            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:bg-slate-200 disabled:text-slate-400 disabled:border disabled:border-slate-300/60 disabled:cursor-not-allowed disabled:shadow-none"
            title={!isDirty ? "Make an edit to enable saving" : "Save changes to your member profile"}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>

      </form>

      <ImageCropModal
        isOpen={cropModalOpen}
        imageSrc={cropImageSrc}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
      />

      <AdminComponentTag name="MbrProfileFeature" />
    </div>
  );
}
