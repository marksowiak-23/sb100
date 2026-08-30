import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Images, ChevronLeft, ChevronRight, Upload, Trash2, X, Loader2, Save, Edit3 } from 'lucide-react';
import { taskApi, mediaApi, resolveMediaUrl, MbrMedia } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface SbPhotoGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  mbrId: string;
  categoryCd: string;
  categoryTitle: string;
  isSandbox: boolean;
  maxPhotos?: number;
  subordinateId?: string | null;
  readOnly?: boolean;
}

export default function SbPhotoGalleryModal({
  isOpen,
  onClose,
  mbrId,
  categoryCd,
  categoryTitle,
  isSandbox,
  maxPhotos = 40,
  subordinateId,
  readOnly = false
}: SbPhotoGalleryModalProps) {
  const [loading, setLoading] = useState(false);
  const [mediaItems, setMediaItems] = useState<MbrMedia[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [deletingMediaId, setDeletingMediaId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [canUpload, setCanUpload] = useState(false);

  // Photo description editing state
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescriptionInput, setEditDescriptionInput] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);

  // Check ownership / author authorization
  useEffect(() => {
    let isMounted = true;
    const checkCanUpload = async () => {
      if (readOnly) {
        if (isMounted) setCanUpload(false);
        return;
      }

      if (isSandbox) {
        const savedMbr = sessionStorage.getItem('sandbox_mbr');
        if (savedMbr) {
          try {
            const mbr = JSON.parse(savedMbr);
            if (isMounted) {
              setCanUpload(!mbrId || mbr.mbrId === mbrId || mbrId === 'sandbox-id-eleanor' || mbrId === '9edb4311-a4bc-428a-8317-833f0f08fea1');
            }
            return;
          } catch {
            if (isMounted) setCanUpload(true);
            return;
          }
        }
        if (isMounted) setCanUpload(true);
        return;
      }

      const userStr = sessionStorage.getItem('user');
      if (!userStr) {
        if (isMounted) setCanUpload(false);
        return;
      }

      try {
        const u = JSON.parse(userStr);
        const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
        if (isMounted) {
          if (mbrProfile && mbrProfile.mbrId && mbrProfile.mbrId === mbrId) {
            setCanUpload(true);
          } else {
            setCanUpload(false);
          }
        }
      } catch (e) {
        console.warn("Could not verify member profile ownership for photo upload:", e);
        if (isMounted) setCanUpload(false);
      }
    };

    if (isOpen) {
      checkCanUpload();
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, mbrId, isSandbox, readOnly]);

  // Fetch photos for categoryCd when modal opens
  useEffect(() => {
    if (isOpen && mbrId) {
      loadCategoryPhotos();
    }
  }, [isOpen, mbrId, categoryCd, subordinateId]);

  const loadCategoryPhotos = async () => {
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    setCurrentIndex(0);
    setIsEditingDescription(false);

    try {
      if (!isSandbox) {
        const list = await taskApi.getMemberMedia(mbrId);
        if (list && Array.isArray(list)) {
          const filtered = list.filter((m) => {
            const catMatch = (m.mbrMediaCategoryCd || '').toLowerCase() === categoryCd.toLowerCase();
            if (subordinateId) {
              return catMatch && m.mbrMediaSubordinateId === subordinateId;
            }
            return catMatch;
          });
          setMediaItems(filtered);
        }
      } else {
        // Sandbox mode initial list
        setMediaItems([]);
      }
    } catch (err: any) {
      console.error(`Error loading ${categoryTitle} photos:`, err);
      setError(`Failed to load ${categoryTitle.toLowerCase()} photos.`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (mediaItems.length >= maxPhotos) {
      setError(`Maximum limit of ${maxPhotos} ${categoryTitle.toLowerCase()} photos reached. Please delete an existing photo first.`);
      e.target.value = '';
      return;
    }

    const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    const validExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;

    if (!validMimeTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setError("Invalid file format. Please upload an image file.");
      e.target.value = '';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      e.target.value = '';
      return;
    }

    setUploading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const destinationPath = subordinateId
        ? `member/${mbrId}/${categoryCd.toLowerCase()}/${subordinateId}/${cleanFileName}`
        : `member/${mbrId}/${categoryCd.toLowerCase()}/${cleanFileName}`;

      const uploadRes = await mediaApi.uploadMedia(file, destinationPath);
      const mediaBase = import.meta.env.VITE_API_URL_MEDIA || 'http://localhost:8003';
      const rawUrl = uploadRes.data?.name ? `${mediaBase}/media/read/${uploadRes.data.name}` : `${mediaBase}/media/read/${destinationPath}`;
      const storageUrl = resolveMediaUrl(rawUrl);

      if (!isSandbox) {
        const newMediaRecord = await taskApi.createMemberMedia({
          mbrId: mbrId,
          mbrMediaSubordinateId: subordinateId || undefined,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: categoryCd,
          mbrMediaDescription: 'Enter a Description'
        });
        setMediaItems((prev) => [newMediaRecord, ...prev]);
      } else {
        const mockItem: MbrMedia = {
          mbrMediaId: `${categoryCd.toLowerCase()}-mock-${Date.now()}`,
          mbrId: mbrId,
          mbrMediaSubordinateId: subordinateId || undefined,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: file.name,
          mbrMediaMimeType: file.type,
          mbrMediaCategoryCd: categoryCd,
          mbrMediaDescription: 'Enter a Description',
          mbrMediaCreatedAt: new Date().toISOString()
        };
        setMediaItems((prev) => [mockItem, ...prev]);
      }

      setCurrentIndex(0);
      setSuccessMsg(`${categoryTitle} photo uploaded successfully.`);
    } catch (err: any) {
      console.error(`Error uploading ${categoryTitle} photo:`, err);
      setError(`Upload failed: ${err.message || 'Unknown error'}`);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDeletePhoto = async (mbrMediaId: string) => {
    if (!mbrMediaId) return;
    setDeletingMediaId(mbrMediaId);
    setError(null);
    setSuccessMsg(null);

    try {
      if (!isSandbox && !mbrMediaId.includes('-mock-')) {
        await taskApi.deleteMemberMedia(mbrMediaId);
      }
      setMediaItems((prev) => prev.filter((item) => item.mbrMediaId !== mbrMediaId));
      setCurrentIndex(0);
      setSuccessMsg(`${categoryTitle} photo deleted.`);
    } catch (err: any) {
      console.error(`Error deleting ${categoryTitle} photo:`, err);
      setError(`Delete failed: ${err.message || 'Unknown error'}`);
    } finally {
      setDeletingMediaId(null);
    }
  };

  const handleSaveDescription = async () => {
    const currentItem = mediaItems[currentIndex];
    if (!currentItem?.mbrMediaId) return;
    setSavingDescription(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const updatedDesc = editDescriptionInput.trim();
      if (!isSandbox && !currentItem.mbrMediaId.includes('-mock-')) {
        await taskApi.updateMemberMedia(currentItem.mbrMediaId, {
          mbrMediaDescription: updatedDesc
        });
      }
      setMediaItems((prev) =>
        prev.map((item) =>
          item.mbrMediaId === currentItem.mbrMediaId
            ? { ...item, mbrMediaDescription: updatedDesc }
            : item
        )
      );
      setSuccessMsg("Photo description updated successfully.");
      setIsEditingDescription(false);
    } catch (err: any) {
      console.error("Failed to update photo description:", err);
      setError(`Failed to save description: ${err.message || 'Unknown error'}`);
    } finally {
      setSavingDescription(false);
    }
  };

  const handlePrevPhoto = () => {
    setIsEditingDescription(false);
    setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
  };

  const handleNextPhoto = () => {
    setIsEditingDescription(false);
    setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && mediaItems.length > 0) {
        setIsEditingDescription(false);
        setCurrentIndex((prev) => (prev + 1) % mediaItems.length);
      } else if (e.key === 'ArrowLeft' && mediaItems.length > 0) {
        setIsEditingDescription(false);
        setCurrentIndex((prev) => (prev - 1 + mediaItems.length) % mediaItems.length);
      } else if (e.key === 'Escape') {
        setIsEditingDescription(false);
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, mediaItems.length, onClose]);

  if (!isOpen) return null;

  const currentPhoto = mediaItems[currentIndex] || mediaItems[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10">
        {/* Backdrop Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Dialog Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[90vh]"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90 text-white shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                <Images className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-slate-100">{categoryTitle} Photo Gallery</h3>
                <p className="text-xs text-slate-400 font-mono">
                  Photo {mediaItems.length > 0 ? currentIndex + 1 : 0} of {mediaItems.length}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Upload Photo Button with Limit Indicator - only if canUpload */}
              {canUpload && (
                <>
                  <label
                    htmlFor={`gallery-upload-${categoryCd}`}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-white rounded-xl text-xs font-bold font-sans transition-all ${
                      mediaItems.length >= maxPhotos
                        ? 'bg-slate-700 text-slate-400 border border-slate-600 cursor-not-allowed opacity-60'
                        : uploading
                          ? 'bg-blue-600 opacity-50 pointer-events-none'
                          : 'bg-blue-600 hover:bg-blue-700 cursor-pointer hover:scale-[1.02] active:scale-[0.98]'
                    }`}
                    title={mediaItems.length >= maxPhotos ? `Maximum limit of ${maxPhotos} photos reached` : `Upload ${categoryTitle} Photo`}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Photo ({mediaItems.length}/{maxPhotos})</span>
                      </>
                    )}
                  </label>
                  <input
                    id={`gallery-upload-${categoryCd}`}
                    type="file"
                    accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                    onChange={handleUploadPhoto}
                    disabled={uploading || mediaItems.length >= maxPhotos}
                    className="hidden"
                  />
                </>
              )}

              {/* Delete Current Photo Button - only if canUpload */}
              {canUpload && mediaItems.length > 0 && currentPhoto && (
                <button
                  type="button"
                  onClick={() => handleDeletePhoto(currentPhoto.mbrMediaId)}
                  disabled={deletingMediaId === currentPhoto.mbrMediaId}
                  className="p-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 rounded-xl transition-all cursor-pointer"
                  title="Delete Current Photo"
                >
                  {deletingMediaId === currentPhoto.mbrMediaId ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close Gallery (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="bg-rose-950/60 border-b border-rose-800 text-rose-300 px-6 py-2.5 text-xs font-serif flex items-center justify-between shrink-0">
              <span>{error}</span>
              <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          {successMsg && (
            <div className="bg-emerald-950/60 border-b border-emerald-800 text-emerald-300 px-6 py-2.5 text-xs font-serif flex items-center justify-between shrink-0">
              <span>{successMsg}</span>
              <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-emerald-200">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Main Photo Viewing Stage */}
          <div className="relative flex-grow flex items-center justify-center bg-black/60 p-4 min-h-[300px] md:min-h-[400px] overflow-hidden select-none">
            {loading ? (
              <div className="flex flex-col items-center justify-center text-slate-400 py-12 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="text-xs font-serif">Loading gallery photos...</span>
              </div>
            ) : mediaItems.length > 0 ? (
              <>
                {/* Previous Photo Button */}
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Previous Photo (Left Arrow)"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* Current Active Photo & Editable Description */}
                <motion.div
                  key={currentPhoto?.mbrMediaId || currentIndex}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center justify-center max-h-[58vh] w-full"
                >
                  <img
                    src={resolveMediaUrl(currentPhoto?.mbrMediaPath)}
                    alt={currentPhoto?.mbrMediaOriginalFilename || `${categoryTitle} Gallery Photo`}
                    className="max-h-[44vh] max-w-full object-contain rounded-2xl shadow-xl border border-slate-800"
                  />

                  {/* Photo Description Editable Control */}
                  {currentPhoto && (
                    <div className="mt-3 max-w-xl w-full px-4 select-text">
                      {canUpload && isEditingDescription ? (
                        <div className="flex items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-blue-500/60 shadow-lg">
                          <input
                            type="text"
                            value={editDescriptionInput}
                            onChange={(e) => setEditDescriptionInput(e.target.value)}
                            placeholder="Enter a Description"
                            className="flex-grow bg-transparent text-slate-100 text-xs font-serif px-3 py-1 outline-none placeholder-slate-500"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveDescription();
                              if (e.key === 'Escape') setIsEditingDescription(false);
                            }}
                          />
                          <button
                            type="button"
                            onClick={handleSaveDescription}
                            disabled={savingDescription}
                            className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                          >
                            {savingDescription ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            <span>Save</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditingDescription(false)}
                            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : canUpload ? (
                        <div
                          onClick={() => {
                            setEditDescriptionInput(currentPhoto.mbrMediaDescription || '');
                            setIsEditingDescription(true);
                          }}
                          className="group flex items-center justify-center gap-2 bg-slate-900/70 hover:bg-slate-900/90 text-slate-300 hover:text-white px-4 py-1.5 rounded-full border border-slate-800 hover:border-slate-700 cursor-pointer transition-all mx-auto text-center"
                          title="Click to edit photo description"
                        >
                          <span className="text-xs md:text-sm font-serif truncate max-w-md">
                            {currentPhoto.mbrMediaDescription || (
                              <span className="italic text-slate-400 group-hover:text-slate-300">Enter a Description</span>
                            )}
                          </span>
                          <Edit3 className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 shrink-0 transition-colors" />
                        </div>
                      ) : currentPhoto.mbrMediaDescription ? (
                        <div className="flex items-center justify-center bg-slate-900/70 text-slate-300 px-4 py-1.5 rounded-full border border-slate-800 mx-auto text-center">
                          <span className="text-xs md:text-sm font-serif truncate max-w-md">
                            {currentPhoto.mbrMediaDescription}
                          </span>
                        </div>
                      ) : null}
                    </div>
                  )}
                </motion.div>

                {/* Next Photo Button */}
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-4 z-20 p-3 rounded-full bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/60 shadow-lg hover:scale-110 active:scale-95 transition-all cursor-pointer"
                  title="Next Photo (Right Arrow)"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            ) : (
              /* Empty State Prompt Message */
              <div className="flex flex-col items-center justify-center text-center text-slate-300 py-12 px-6 space-y-4 max-w-md mx-auto">
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl">
                  <Images className="w-10 h-10" />
                </div>
                <div className="space-y-1.5">
                  <h4 className="font-serif text-lg font-bold text-slate-100">No {categoryTitle} Photos Found</h4>
                  <p className="text-xs font-serif text-slate-400 leading-relaxed">
                    {canUpload
                      ? `No photos with the category "${categoryCd}" were found in your gallery. Click the button below to upload ${categoryTitle.toLowerCase()} photos.`
                      : `No photos are currently available for this section.`}
                  </p>
                </div>
                {canUpload && (
                  <>
                    <label
                      htmlFor={`gallery-upload-${categoryCd}`}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans cursor-pointer shadow-md transition-all hover:scale-105 active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Add {categoryTitle} Photos</span>
                    </label>
                    <input
                      id={`gallery-upload-${categoryCd}`}
                      type="file"
                      accept="image/jpeg,image/png,image/gif,image/webp,image/svg+xml"
                      onChange={handleUploadPhoto}
                      disabled={uploading}
                      className="hidden"
                    />
                  </>
                )}
              </div>
            )}
          </div>

          {/* Bottom Thumbnail Strip */}
          {mediaItems.length > 1 && (
            <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 shrink-0 overflow-x-auto">
              <div className="flex items-center justify-center gap-2.5 min-w-max mx-auto">
                {mediaItems.map((item, idx) => {
                  const isCurrent = idx === currentIndex;
                  return (
                    <button
                      key={item.mbrMediaId || idx}
                      type="button"
                      onClick={() => {
                        setIsEditingDescription(false);
                        setCurrentIndex(idx);
                      }}
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                        isCurrent
                          ? 'border-blue-500 scale-105 shadow-md ring-2 ring-blue-500/40'
                          : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-600'
                      }`}
                    >
                      <img
                        src={resolveMediaUrl(item.mbrMediaPath)}
                        alt={`Thumbnail ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      <AdminComponentTag name="SbPhotoGalleryModal" />
    </AnimatePresence>
  );
}
