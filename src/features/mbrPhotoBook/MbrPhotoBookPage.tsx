/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Camera,
  Plus,
  Image as ImageIcon,
  FolderPlus,
  Folder,
  FolderMinus,
  Trash2,
  Edit3,
  ChevronLeft,
  ChevronRight,
  X,
  Upload,
  Maximize2,
  Minimize2,
  Play,
  Pause,
  Calendar,
  MapPin,
  Sparkles,
  Download,
  Search,
  Grid,
  Layers,
  Check,
  CheckSquare,
  AlertCircle,
  ArrowLeft,
  RotateCw,
  Eye,
  ShieldAlert
} from 'lucide-react';
import { taskApi, mediaApi, MbrMedia, MEDIA_API_BASE_URL, resolveMediaUrl } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrAlbumPrivacyModal from '@/src/components/mbrAlbumPrivacyModal';

export interface MbrPhotoBookPageProps {
  isSandbox?: boolean;
  onClickBack?: () => void;
  targetMemberId?: string;
}

export interface PhotoAlbum {
  id: string;
  mbrId: string;
  name: string;
  description: string;
  dateLabel?: string;
  coverPhotoUrl?: string;
  createdAt: string;
  updatedAt?: string;
  recordId?: string; // MbrMedia ID if stored as PhotoBookAlbum
  isSystemCategory?: boolean;
}

export interface PhotoItem {
  id: string; // MbrMedia ID or albumPhotoId
  albumPhotoId?: string;
  mbrMediaId?: string;
  mbrId: string;
  albumId?: string;
  url: string;
  title: string;
  description: string;
  date?: string;
  location?: string;
  originalFilename?: string;
  mimeType?: string;
  categoryCd?: string;
  createdAt: string;
  isCover?: boolean;
}

// Default empty collections for new members
const INITIAL_SANDBOX_ALBUMS: PhotoAlbum[] = [];
const INITIAL_SANDBOX_PHOTOS: PhotoItem[] = [];

export default function MbrPhotoBookPage({
  isSandbox = false,
  onClickBack,
  targetMemberId
}: MbrPhotoBookPageProps) {
  // --- STATE ---
  const [currentMbrId, setCurrentMbrId] = useState<string>(targetMemberId || '');
  const [albums, setAlbums] = useState<PhotoAlbum[]>([]);
  const [photos, setPhotos] = useState<PhotoItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation / view mode: 'albums' | 'albumDetail' | 'allPhotos'
  const [currentView, setCurrentView] = useState<'albums' | 'albumDetail' | 'allPhotos'>('albums');
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);

  // Modals
  const [isAlbumModalOpen, setIsAlbumModalOpen] = useState<boolean>(false);
  const [isCoverPickerOpen, setIsCoverPickerOpen] = useState<boolean>(false);
  const [privacyTargetAlbum, setPrivacyTargetAlbum] = useState<PhotoAlbum | null>(null);
  const [albumPendingDelete, setAlbumPendingDelete] = useState<PhotoAlbum | null>(null);
  const [isDeletingAlbum, setIsDeletingAlbum] = useState<boolean>(false);
  const [editingAlbum, setEditingAlbum] = useState<PhotoAlbum | null>(null);
  const [albumFormName, setAlbumFormName] = useState<string>('');
  const [albumFormDate, setAlbumFormDate] = useState<string>('');
  const [albumFormDesc, setAlbumFormDesc] = useState<string>('');
  const [albumFormCover, setAlbumFormCover] = useState<string>('');

  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [uploadTargetAlbumId, setUploadTargetAlbumId] = useState<string>('');
  const [stagedFiles, setStagedFiles] = useState<Array<{
    file: File;
    previewUrl: string;
    title: string;
    description: string;
    date: string;
    location: string;
  }>>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const [editingPhoto, setEditingPhoto] = useState<PhotoItem | null>(null);
  const [photoFormTitle, setPhotoFormTitle] = useState<string>('');
  const [photoFormDesc, setPhotoFormDesc] = useState<string>('');
  const [photoFormDate, setPhotoFormDate] = useState<string>('');
  const [photoFormLocation, setPhotoFormLocation] = useState<string>('');
  const [photoFormAlbumId, setPhotoFormAlbumId] = useState<string>('');
  const [photoFormIsCover, setPhotoFormIsCover] = useState<boolean>(false);

  // Multi-select & Photo Action Confirmation Dialog
  const [selectedPhotoIds, setSelectedPhotoIds] = useState<Set<string>>(new Set());
  const [photoActionPending, setPhotoActionPending] = useState<{
    type: 'delete' | 'removeFromAlbum';
    photos: PhotoItem[];
    albumId?: string;
    albumName?: string;
  } | null>(null);
  const [isProcessingPhotoAction, setIsProcessingPhotoAction] = useState<boolean>(false);

  // Lightbox & Slideshow
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [isSlideshowPlaying, setIsSlideshowPlaying] = useState<boolean>(false);
  const slideshowTimerRef = useRef<NodeJS.Timeout | null>(null);


  // Status message toast
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // --- MEMBER RESOLUTION ---
  useEffect(() => {
    let resolvedId = targetMemberId;

    // 1. Check sb_current_mbr (primary logged-in member session object)
    if (!resolvedId) {
      const currentMbrStr = sessionStorage.getItem('sb_current_mbr');
      if (currentMbrStr) {
        try {
          const parsed = JSON.parse(currentMbrStr);
          if (parsed?.mbrId) resolvedId = parsed.mbrId;
        } catch {}
      }
    }

    // 2. Check selectedMember or legacy mbr
    if (!resolvedId) {
      const storedMbr = sessionStorage.getItem('selectedMember') || sessionStorage.getItem('mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed?.mbrId) resolvedId = parsed.mbrId;
        } catch {}
      }
    }

    // 3. Fallback to user account ID query
    if (!resolvedId && !isSandbox) {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.user_id) {
            taskApi.getMemberByUserId(u.user_id).then((m) => {
              if (m?.mbrId) setCurrentMbrId(m.mbrId);
            }).catch(() => {});
            return;
          }
        } catch {}
      }
    }

    if (resolvedId) {
      setCurrentMbrId(resolvedId);
    }
  }, [targetMemberId, isSandbox]);

  // Reset multi-select when switching views or albums
  useEffect(() => {
    setSelectedPhotoIds(new Set());
  }, [currentView, selectedAlbumId]);

  // --- DATA LOADING ---
  const loadPhotoBookData = async () => {
    if (!currentMbrId) return;
    setLoading(true);

    try {
      if (isSandbox) {
        // Load from sessionStorage
        const savedAlbumsStr = sessionStorage.getItem(`sb_photobook_albums_${currentMbrId}`);
        const savedPhotosStr = sessionStorage.getItem(`sb_photobook_photos_${currentMbrId}`);

        if (savedAlbumsStr) {
          try {
            setAlbums(JSON.parse(savedAlbumsStr));
          } catch {
            setAlbums([]);
          }
        } else {
          setAlbums([]);
        }

        if (savedPhotosStr) {
          try {
            setPhotos(JSON.parse(savedPhotosStr));
          } catch {
            setPhotos([]);
          }
        } else {
          setPhotos([]);
        }
      } else {
        // Live DB Mode: clear any previous mock albums from sessionStorage
        sessionStorage.removeItem(`sb_photobook_albums_${currentMbrId}`);
        sessionStorage.removeItem(`sb_photobook_photos_${currentMbrId}`);
        // Live DB Mode: Fetch albums and media concurrently (Zero N+1)
        const [backendAlbums, allMedia] = await Promise.all([
          taskApi.getMemberAlbums(currentMbrId).catch(() => []),
          taskApi.getMemberMedia(currentMbrId, { excludeAudio: true }).catch(() => [])
        ]);

        const liveAlbums: PhotoAlbum[] = [];
        const livePhotos: PhotoItem[] = [];

        // 1. Process relational albums from mbrAlbum
        if (backendAlbums && Array.isArray(backendAlbums) && backendAlbums.length > 0) {
          for (const a of backendAlbums) {
            liveAlbums.push({
              id: a.albumId,
              recordId: a.albumId,
              mbrId: a.mbrId,
              name: a.albumName,
              description: a.albumDesc || '',
              dateLabel: a.albumDateLabel || '',
              coverPhotoUrl: a.albumCoverPhotoUrl || '',
              createdAt: a.albumCreatedAt || new Date().toISOString()
            });
          }
        }

        // 2. Fetch album photos concurrently for each album
        const albumPhotoLinks = await Promise.all(
          liveAlbums.map((a) => taskApi.getMemberAlbumPhotos(a.id).catch(() => []))
        );

        // Track media IDs already linked to albums
        const linkedMediaIds = new Set<string>();

        albumPhotoLinks.forEach((photosInAlbum, idx) => {
          const album = liveAlbums[idx];
          for (const ap of photosInAlbum) {
            linkedMediaIds.add(ap.mbrMediaId);
            livePhotos.push({
              id: ap.albumPhotoId || ap.mbrMediaId,
              albumPhotoId: ap.albumPhotoId,
              mbrMediaId: ap.mbrMediaId,
              mbrId: album.mbrId,
              albumId: album.id,
              url: resolveMediaUrl(ap.mbrMediaPath || ''),
              title: ap.photoTitle || ap.mbrMediaOriginalFilename || 'Untitled Photograph',
              description: ap.photoCaption || '',
              date: ap.photoDate || '',
              location: ap.photoLocation || '',
              originalFilename: ap.mbrMediaOriginalFilename,
              mimeType: ap.mbrMediaMimeType,
              createdAt: ap.albumPhotoCreatedAt || new Date().toISOString(),
              isCover: ap.isCover || false
            });
          }
        });

        // 3. Process remaining unlinked media from mbrMedia as general library photos
        for (const m of allMedia) {
          const cat = (m.mbrMediaCategoryCd || '').toLowerCase();
          if (cat === 'photobookalbum') continue;
          if (linkedMediaIds.has(m.mbrMediaId)) continue;

          let meta: any = {};
          try {
            meta = m.mbrMediaDescription ? JSON.parse(m.mbrMediaDescription) : {};
          } catch {
            meta = { description: m.mbrMediaDescription };
          }

          livePhotos.push({
            id: m.mbrMediaId,
            mbrMediaId: m.mbrMediaId,
            mbrId: m.mbrId,
            albumId: m.mbrMediaSubordinateId || meta.albumId || undefined,
            url: resolveMediaUrl(m.mbrMediaPath),
            title: meta.title || m.mbrMediaOriginalFilename || 'Untitled Photograph',
            description: meta.description || (typeof m.mbrMediaDescription === 'string' ? m.mbrMediaDescription : ''),
            date: meta.date || (m.mbrMediaCreatedAt ? new Date(m.mbrMediaCreatedAt).toLocaleDateString() : ''),
            location: meta.location || '',
            originalFilename: m.mbrMediaOriginalFilename,
            mimeType: m.mbrMediaMimeType,
            categoryCd: m.mbrMediaCategoryCd,
            createdAt: m.mbrMediaCreatedAt || new Date().toISOString(),
            isCover: meta.isCover || false
          });
        }

        setAlbums(liveAlbums);
        setPhotos(livePhotos);
      }
    } catch (err) {
      console.error('Error loading Photo Book data:', err);
      showToast('Could not load Photo Book data.', 'error');
      setAlbums([]);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPhotoBookData();
  }, [currentMbrId, isSandbox]);

  // Persist sandbox changes
  const saveSandboxState = (updatedAlbums: PhotoAlbum[], updatedPhotos: PhotoItem[]) => {
    if (isSandbox || !currentMbrId) {
      sessionStorage.setItem(`sb_photobook_albums_${currentMbrId}`, JSON.stringify(updatedAlbums));
      sessionStorage.setItem(`sb_photobook_photos_${currentMbrId}`, JSON.stringify(updatedPhotos));
    }
  };

  // --- DERIVED DATA ---
  const activeAlbum = useMemo(() => {
    if (!selectedAlbumId) return null;
    return albums.find((a) => a.id === selectedAlbumId) || null;
  }, [albums, selectedAlbumId]);

  // Photos belonging to active album (or all photos if in 'allPhotos' view)
  const currentViewPhotos = useMemo(() => {
    let list: PhotoItem[] = [];
    if (currentView === 'allPhotos') {
      list = photos;
    } else if (selectedAlbumId) {
      list = photos.filter((p) => p.albumId === selectedAlbumId);
    } else {
      list = photos;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.location && p.location.toLowerCase().includes(q)) ||
          (p.date && p.date.toLowerCase().includes(q))
      );
    }

    return list;
  }, [photos, currentView, selectedAlbumId, searchQuery]);

  // Album photo counts & covers
  const albumStats = useMemo(() => {
    const stats: Record<string, { count: number; coverUrl?: string }> = {};
    for (const a of albums) {
      const albumPhotos = photos.filter((p) => p.albumId === a.id);
      const coverPhoto = albumPhotos.find((p) => p.isCover) || albumPhotos[0];
      stats[a.id] = {
        count: albumPhotos.length,
        coverUrl: a.coverPhotoUrl || coverPhoto?.url || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'
      };
    }
    return stats;
  }, [albums, photos]);

  // --- KEYBOARD LIGHTBOX LISTENER ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (lightboxIndex === null) return;
      if (e.key === 'ArrowRight') {
        handleNextLightbox();
      } else if (e.key === 'ArrowLeft') {
        handlePrevLightbox();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, currentViewPhotos]);

  // Slideshow auto-advance
  useEffect(() => {
    if (isSlideshowPlaying && lightboxIndex !== null && currentViewPhotos.length > 0) {
      slideshowTimerRef.current = setTimeout(() => {
        setLightboxIndex((prev) => ((prev ?? 0) + 1) % currentViewPhotos.length);
      }, 4000);
    } else {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    }
    return () => {
      if (slideshowTimerRef.current) clearInterval(slideshowTimerRef.current);
    };
  }, [isSlideshowPlaying, lightboxIndex, currentViewPhotos]);

  // --- LIGHTBOX HANDLERS ---
  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setIsSlideshowPlaying(false);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    setIsSlideshowPlaying(false);
  };

  const handleNextLightbox = () => {
    if (lightboxIndex === null || currentViewPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex + 1) % currentViewPhotos.length);
  };

  const handlePrevLightbox = () => {
    if (lightboxIndex === null || currentViewPhotos.length === 0) return;
    setLightboxIndex((lightboxIndex - 1 + currentViewPhotos.length) % currentViewPhotos.length);
  };

  // --- ALBUM ACTIONS ---
  const handleOpenCreateAlbum = () => {
    setEditingAlbum(null);
    setAlbumFormName('');
    setAlbumFormDate('');
    setAlbumFormDesc('');
    setAlbumFormCover('');
    setIsAlbumModalOpen(true);
  };

  const handleOpenEditAlbum = (album: PhotoAlbum) => {
    setEditingAlbum(album);
    setAlbumFormName(album.name);
    setAlbumFormDate(album.dateLabel || '');
    setAlbumFormDesc(album.description || '');
    setAlbumFormCover(album.coverPhotoUrl || '');
    setIsAlbumModalOpen(true);
  };

  const handleSaveAlbum = async () => {
    if (!albumFormName.trim()) {
      showToast('Please provide an album title.', 'error');
      return;
    }

    try {
      if (editingAlbum) {
        // Edit existing album
        const newCoverUrl = albumFormCover.trim() || editingAlbum.coverPhotoUrl;
        const updatedAlbums = albums.map((a) => {
          if (a.id === editingAlbum.id) {
            return {
              ...a,
              name: albumFormName.trim(),
              dateLabel: albumFormDate.trim(),
              description: albumFormDesc.trim(),
              coverPhotoUrl: newCoverUrl,
              updatedAt: new Date().toISOString()
            };
          }
          return a;
        });

        // Also update photos in this album to sync isCover flag
        const updatedPhotos = photos.map((p) => {
          if (p.albumId === editingAlbum.id) {
            return {
              ...p,
              isCover: p.url === newCoverUrl
            };
          }
          return p;
        });

        setAlbums(updatedAlbums);
        setPhotos(updatedPhotos);
        saveSandboxState(updatedAlbums, updatedPhotos);

        if (!isSandbox && editingAlbum.recordId) {
          const matchingPhoto = photos.find((p) => p.albumId === editingAlbum.id && p.url === newCoverUrl);
          await taskApi.updateMemberAlbum(editingAlbum.recordId, {
            albumName: albumFormName.trim(),
            albumDateLabel: albumFormDate.trim(),
            albumDesc: albumFormDesc.trim(),
            albumCoverPhotoUrl: newCoverUrl,
            albumCoverMediaId: matchingPhoto?.mbrMediaId || matchingPhoto?.id
          }).catch((err) => console.warn('Could not update album in live DB:', err));

          if (matchingPhoto?.albumPhotoId) {
            await taskApi.updateMemberAlbumPhoto(matchingPhoto.albumPhotoId, {
              isCover: true
            }).catch(() => {});
          }
        }

        showToast(`Album "${albumFormName}" updated.`);
      } else {
        // Create new album
        const defaultCover = 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80';
        let newAlbumId = `album-${Date.now()}`;
        let liveRecordId: string | undefined;

        if (!isSandbox && currentMbrId) {
          try {
            const rec = await taskApi.createMemberAlbum({
              mbrId: currentMbrId,
              albumName: albumFormName.trim(),
              albumDateLabel: albumFormDate.trim(),
              albumDesc: albumFormDesc.trim(),
              albumCoverPhotoUrl: defaultCover
            });
            newAlbumId = rec.albumId;
            liveRecordId = rec.albumId;
          } catch (err) {
            console.warn('Failed to persist album in live DB:', err);
          }
        }

        const newAlbum: PhotoAlbum = {
          id: newAlbumId,
          recordId: liveRecordId,
          mbrId: currentMbrId,
          name: albumFormName.trim(),
          dateLabel: albumFormDate.trim(),
          description: albumFormDesc.trim(),
          coverPhotoUrl: defaultCover,
          createdAt: new Date().toISOString()
        };

        const updatedAlbums = [newAlbum, ...albums];
        setAlbums(updatedAlbums);
        saveSandboxState(updatedAlbums, photos);
        showToast(`Album "${albumFormName}" created!`);
      }

      setIsAlbumModalOpen(false);
    } catch (err) {
      console.error('Error saving album:', err);
      showToast('Error saving album.', 'error');
    }
  };

  const handleSetAlbumCoverPhoto = async (albumId: string, photo: PhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    try {
      // 1. Update photos state: mark selected photo as isCover: true, un-cover others in the same album
      const updatedPhotos = photos.map((p) => {
        if (p.albumId === albumId) {
          return { ...p, isCover: p.id === photo.id };
        }
        return p;
      });

      // 2. Update album coverPhotoUrl in albums state
      const updatedAlbums = albums.map((a) => {
        if (a.id === albumId) {
          return {
            ...a,
            coverPhotoUrl: photo.url,
            updatedAt: new Date().toISOString()
          };
        }
        return a;
      });

      setPhotos(updatedPhotos);
      setAlbums(updatedAlbums);
      saveSandboxState(updatedAlbums, updatedPhotos);

      // 3. Persist to live DB
      if (!isSandbox) {
        const targetAlbum = albums.find((a) => a.id === albumId);
        const albumRecordId = targetAlbum?.recordId || albumId;
        const mediaId = photo.mbrMediaId || photo.id;

        // Update mbrAlbum table with new cover photo
        await taskApi.updateMemberAlbum(albumRecordId, {
          albumCoverPhotoUrl: photo.url,
          albumCoverMediaId: mediaId
        }).catch((err) => console.warn('Failed to update album cover in live DB:', err));

        // Update mbrAlbumPhoto records for this album so isCover is synced in DB
        const albumPhotos = photos.filter((p) => p.albumId === albumId);
        await Promise.all(
          albumPhotos.map(async (p) => {
            if (p.albumPhotoId) {
              const isNowCover = p.id === photo.id;
              await taskApi.updateMemberAlbumPhoto(p.albumPhotoId, {
                isCover: isNowCover
              }).catch(() => {});
            }
          })
        );
      }

      showToast(`Album cover set to "${photo.title || 'selected photo'}"!`);
    } catch (err) {
      console.error('Error setting album cover photo:', err);
      showToast('Could not update album cover photo.', 'error');
    }
  };

  const handleOpenDeleteAlbumDialog = (album: PhotoAlbum, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAlbumPendingDelete(album);
  };

  const handleConfirmDeleteAlbum = async () => {
    if (!albumPendingDelete) return;
    setIsDeletingAlbum(true);

    try {
      const albumId = albumPendingDelete.id;
      const updatedAlbums = albums.filter((a) => a.id !== albumId);
      // Unlink photos from this album
      const updatedPhotos = photos.map((p) => (p.albumId === albumId ? { ...p, albumId: undefined } : p));
      
      setAlbums(updatedAlbums);
      setPhotos(updatedPhotos);
      saveSandboxState(updatedAlbums, updatedPhotos);

      if (!isSandbox && albumPendingDelete.recordId) {
        await taskApi.deleteMemberAlbum(albumPendingDelete.recordId).catch(() => {});
      }

      if (selectedAlbumId === albumId) {
        setSelectedAlbumId(null);
        setCurrentView('albums');
      }

      showToast(`Album "${albumPendingDelete.name}" deleted.`);
      setAlbumPendingDelete(null);
    } catch (err) {
      console.error('Error deleting album:', err);
      showToast('Error deleting album.', 'error');
    } finally {
      setIsDeletingAlbum(false);
    }
  };

  // --- PHOTO UPLOAD ACTIONS ---
  const handleOpenUploadModal = (albumId?: string) => {
    setUploadTargetAlbumId(albumId || selectedAlbumId || albums[0]?.id || '');
    setStagedFiles([]);
    setUploadError(null);
    setIsUploadModalOpen(true);
  };

  const handleFilesSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newStaged: typeof stagedFiles = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) {
        continue;
      }
      const previewUrl = URL.createObjectURL(f);
      const cleanTitle = f.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      newStaged.push({
        file: f,
        previewUrl,
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1),
        description: '',
        date: '',
        location: ''
      });
    }

    setStagedFiles((prev) => [...prev, ...newStaged]);
    e.target.value = '';
  };

  const handleRemoveStagedFile = (index: number) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      URL.revokeObjectURL(copy[index].previewUrl);
      copy.splice(index, 1);
      return copy;
    });
  };

  const handleUpdateStagedFile = (index: number, field: string, val: string) => {
    setStagedFiles((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: val };
      return copy;
    });
  };

  const handleExecuteUpload = async () => {
    if (stagedFiles.length === 0) {
      setUploadError('Please select at least one photo to upload.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    const newlyCreatedPhotos: PhotoItem[] = [];

    try {
      for (const item of stagedFiles) {
        let storageUrl = item.previewUrl;
        let originalFilename = item.file.name;
        let mimeType = item.file.type;
        let mediaRecordId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        let addedAlbumPhotoId: string | undefined;

        if (!isSandbox && currentMbrId) {
          // Upload to Media API Cloud Storage
          const cleanFileName = item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
          const destinationPath = `member/${currentMbrId}/photobook/${Date.now()}_${cleanFileName}`;

          try {
            const uploadRes = await mediaApi.uploadMedia(item.file, destinationPath);
            const rawUrl = uploadRes.data?.name
              ? `${MEDIA_API_BASE_URL}/media/read/${uploadRes.data.name}`
              : `${MEDIA_API_BASE_URL}/media/read/${destinationPath}`;
            storageUrl = resolveMediaUrl(rawUrl);
          } catch (uploadErr) {
            console.warn('GCS upload error, falling back to local object URL:', uploadErr);
          }

          // Create mbrMedia record & link to album if target album specified
          try {
            const metaPayload = {
              title: item.title.trim() || item.file.name,
              description: item.description.trim(),
              date: item.date.trim(),
              location: item.location.trim(),
              albumId: uploadTargetAlbumId || undefined
            };

            const rec = await taskApi.createMemberMedia({
              mbrId: currentMbrId,
              mbrMediaSubordinateId: uploadTargetAlbumId || undefined,
              mbrMediaPath: storageUrl,
              mbrMediaOriginalFilename: originalFilename,
              mbrMediaMimeType: mimeType,
              mbrMediaCategoryCd: 'PhotoBook',
              mbrMediaDescription: JSON.stringify(metaPayload)
            });
            mediaRecordId = rec.mbrMediaId;

            if (uploadTargetAlbumId) {
              const added = await taskApi.addPhotoToMemberAlbum(uploadTargetAlbumId, {
                albumId: uploadTargetAlbumId,
                mbrMediaId: rec.mbrMediaId,
                photoTitle: item.title.trim() || originalFilename,
                photoCaption: item.description.trim(),
                photoDate: item.date.trim(),
                photoLocation: item.location.trim()
              }).catch((e) => console.warn('Could not map photo to album in live DB:', e));
              if (added && typeof added === 'object' && 'albumPhotoId' in added) {
                addedAlbumPhotoId = (added as any).albumPhotoId;
              }
            }
          } catch (dbErr) {
            console.warn('Failed to insert mbrMedia record in live DB:', dbErr);
          }
        }

        newlyCreatedPhotos.push({
          id: addedAlbumPhotoId || mediaRecordId,
          mbrMediaId: mediaRecordId,
          albumPhotoId: addedAlbumPhotoId,
          mbrId: currentMbrId,
          albumId: uploadTargetAlbumId || undefined,
          url: storageUrl,
          title: item.title.trim() || originalFilename,
          description: item.description.trim(),
          date: item.date.trim(),
          location: item.location.trim(),
          originalFilename,
          mimeType,
          categoryCd: 'PhotoBook',
          createdAt: new Date().toISOString()
        });
      }

      const updatedPhotos = [...newlyCreatedPhotos, ...photos];
      setPhotos(updatedPhotos);
      saveSandboxState(albums, updatedPhotos);

      showToast(`Successfully uploaded ${stagedFiles.length} photo${stagedFiles.length > 1 ? 's' : ''}!`);
      setIsUploadModalOpen(false);
      setStagedFiles([]);
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadError(err?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // --- PHOTO EDITING ACTIONS ---
  const handleOpenEditPhoto = (photo: PhotoItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingPhoto(photo);
    setPhotoFormTitle(photo.title);
    setPhotoFormDesc(photo.description);
    setPhotoFormDate(photo.date || '');
    setPhotoFormLocation(photo.location || '');
    setPhotoFormAlbumId(photo.albumId || '');
    setPhotoFormIsCover(photo.isCover || false);
  };

  const handleSavePhotoEdit = async () => {
    if (!editingPhoto) return;

    try {
      const updatedPhotos = photos.map((p) => {
        if (p.id === editingPhoto.id) {
          return {
            ...p,
            title: photoFormTitle.trim(),
            description: photoFormDesc.trim(),
            date: photoFormDate.trim(),
            location: photoFormLocation.trim(),
            albumId: photoFormAlbumId || undefined,
            isCover: photoFormIsCover
          };
        }
        // If this photo was set as cover, un-cover others in the same album
        if (photoFormIsCover && p.albumId === photoFormAlbumId && p.id !== editingPhoto.id) {
          return { ...p, isCover: false };
        }
        return p;
      });

      // If set as cover, update the album's coverPhotoUrl
      let updatedAlbums = [...albums];
      if (photoFormIsCover && photoFormAlbumId) {
        updatedAlbums = albums.map((a) =>
          a.id === photoFormAlbumId ? { ...a, coverPhotoUrl: editingPhoto.url } : a
        );
        setAlbums(updatedAlbums);
      }

      setPhotos(updatedPhotos);
      saveSandboxState(updatedAlbums, updatedPhotos);

      if (!isSandbox) {
        const metaPayload = {
          title: photoFormTitle.trim(),
          description: photoFormDesc.trim(),
          date: photoFormDate.trim(),
          location: photoFormLocation.trim(),
          albumId: photoFormAlbumId || undefined,
          isCover: photoFormIsCover
        };

        const mediaId = editingPhoto.mbrMediaId || editingPhoto.id;

        // 1. Update underlying mbrMedia record
        await taskApi.updateMemberMedia(mediaId, {
          mbrMediaSubordinateId: photoFormAlbumId || undefined,
          mbrMediaDescription: JSON.stringify(metaPayload)
        }).catch((err) => console.warn('Could not update photo in live DB:', err));

        // 2. Manage mbrAlbumPhoto relational link
        if (editingPhoto.albumPhotoId) {
          if (!photoFormAlbumId) {
            // Unlink from album
            await taskApi.removePhotoFromMemberAlbum(editingPhoto.albumPhotoId).catch(() => {});
          } else if (editingPhoto.albumId !== photoFormAlbumId) {
            // Moved to a different album
            await taskApi.updateMemberAlbumPhoto(editingPhoto.albumPhotoId, {
              albumId: photoFormAlbumId,
              photoTitle: photoFormTitle.trim(),
              photoCaption: photoFormDesc.trim(),
              photoDate: photoFormDate.trim(),
              photoLocation: photoFormLocation.trim(),
              isCover: photoFormIsCover
            }).catch(() => {});
          } else {
            // Updated in same album
            await taskApi.updateMemberAlbumPhoto(editingPhoto.albumPhotoId, {
              photoTitle: photoFormTitle.trim(),
              photoCaption: photoFormDesc.trim(),
              photoDate: photoFormDate.trim(),
              photoLocation: photoFormLocation.trim(),
              isCover: photoFormIsCover
            }).catch(() => {});
          }
        } else if (photoFormAlbumId) {
          // Previously had no album link, now assigned to an album
          try {
            const added = await taskApi.addPhotoToMemberAlbum(photoFormAlbumId, {
              albumId: photoFormAlbumId,
              mbrMediaId: mediaId,
              photoTitle: photoFormTitle.trim(),
              photoCaption: photoFormDesc.trim(),
              photoDate: photoFormDate.trim(),
              photoLocation: photoFormLocation.trim(),
              isCover: photoFormIsCover
            });
            if (added?.albumPhotoId) {
              setPhotos((prev) =>
                prev.map((p) => (p.id === editingPhoto.id ? { ...p, albumPhotoId: added.albumPhotoId } : p))
              );
            }
          } catch (e) {
            console.warn('Could not add photo to album in DB:', e);
          }
        }

        // 3. If marked as cover, update mbrAlbum.albumCoverPhotoUrl
        if (photoFormIsCover && photoFormAlbumId) {
          await taskApi.updateMemberAlbum(photoFormAlbumId, {
            albumCoverPhotoUrl: editingPhoto.url,
            albumCoverMediaId: mediaId
          }).catch(() => {});
        }
      }

      showToast('Photo details updated.');
      setEditingPhoto(null);
    } catch (err) {
      console.error('Error updating photo:', err);
      showToast('Error updating photo.', 'error');
    }
  };

  // --- MULTI-SELECT HELPERS ---
  const togglePhotoSelection = (photoId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPhotoIds((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const selectAllCurrentPhotos = () => {
    setSelectedPhotoIds(new Set(currentViewPhotos.map((p) => p.id)));
  };

  const deselectAllPhotos = () => {
    setSelectedPhotoIds(new Set());
  };

  // --- PHOTO ACTION CONFIRMATION TRIGGERS ---
  const handleOpenRemoveFromAlbumDialog = (targetPhotos: PhotoItem[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!targetPhotos || targetPhotos.length === 0) return;
    setPhotoActionPending({
      type: 'removeFromAlbum',
      photos: targetPhotos,
      albumId: activeAlbum?.id || targetPhotos[0]?.albumId,
      albumName: activeAlbum?.name || albums.find((a) => a.id === targetPhotos[0]?.albumId)?.name || 'this album'
    });
  };

  const handleOpenDeletePhotosDialog = (targetPhotos: PhotoItem[], e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!targetPhotos || targetPhotos.length === 0) return;
    setPhotoActionPending({
      type: 'delete',
      photos: targetPhotos
    });
  };

  const handleConfirmPhotoAction = async () => {
    if (!photoActionPending) return;
    setIsProcessingPhotoAction(true);

    const { type, photos: targetPhotos } = photoActionPending;
    const targetIds = new Set(targetPhotos.map((p) => p.id));

    try {
      if (type === 'removeFromAlbum') {
        const updatedPhotos = photos.map((p) =>
          targetIds.has(p.id) ? { ...p, albumId: undefined, isCover: false } : p
        );
        setPhotos(updatedPhotos);
        saveSandboxState(albums, updatedPhotos);

        if (!isSandbox) {
          await Promise.all(
            targetPhotos.map(async (p) => {
              if (p.albumPhotoId) {
                await taskApi.removePhotoFromMemberAlbum(p.albumPhotoId).catch(() => {});
              }
              const mediaId = p.mbrMediaId || p.id;
              await taskApi.updateMemberMedia(mediaId, { mbrMediaSubordinateId: undefined }).catch(() => {});
            })
          );
        }

        setSelectedPhotoIds((prev) => {
          const next = new Set(prev);
          targetIds.forEach((id) => next.delete(id));
          return next;
        });

        showToast(`Removed ${targetPhotos.length} photo${targetPhotos.length > 1 ? 's' : ''} from album.`);
      } else {
        // Permanent Delete action
        const updatedPhotos = photos.filter((p) => !targetIds.has(p.id));
        setPhotos(updatedPhotos);
        saveSandboxState(albums, updatedPhotos);

        if (!isSandbox) {
          await Promise.all(
            targetPhotos.map(async (p) => {
              if (p.albumPhotoId) {
                await taskApi.removePhotoFromMemberAlbum(p.albumPhotoId).catch(() => {});
              }
              const mediaId = p.mbrMediaId || p.id;
              await taskApi.deleteMemberMedia(mediaId).catch(() => {});
            })
          );
        }

        // Close lightbox if the active photo was deleted
        if (lightboxIndex !== null && currentViewPhotos[lightboxIndex]) {
          if (targetIds.has(currentViewPhotos[lightboxIndex].id)) {
            closeLightbox();
          }
        }

        setSelectedPhotoIds((prev) => {
          const next = new Set(prev);
          targetIds.forEach((id) => next.delete(id));
          return next;
        });

        showToast(`Deleted ${targetPhotos.length} photo${targetPhotos.length > 1 ? 's' : ''}.`);
      }

      setPhotoActionPending(null);
    } catch (err) {
      console.error(`Error completing photo ${type}:`, err);
      showToast(`Error processing photo ${type}.`, 'error');
    } finally {
      setIsProcessingPhotoAction(false);
    }
  };


  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-slate-800 pb-24 relative selection:bg-amber-100 selection:text-amber-900">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-serif font-bold transition-all animate-bounce ${
          toastMsg.type === 'error'
            ? 'bg-rose-50 border-rose-200 text-rose-800'
            : 'bg-emerald-50 border-emerald-200 text-emerald-900'
        }`}>
          {toastMsg.type === 'error' ? <AlertCircle className="w-4 h-4 text-rose-600" /> : <Check className="w-4 h-4 text-emerald-600" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* --- TOP STICKY APP BAR --- */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/90 backdrop-blur-md border-b border-[#EAE5DC] px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-2xs">
        <div className="flex items-center gap-3">
          {onClickBack && (
            <button
              type="button"
              onClick={onClickBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-serif font-bold"
              title="Return to Author Page"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center shadow-xs">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-serif text-base sm:text-lg font-bold text-slate-900 leading-tight">
                Heirloom Photo Book
              </h1>
              <p className="text-[11px] text-slate-500 font-serif hidden sm:block">
                Preserve, curate, and bind your family's photographic legacy
              </p>
            </div>
          </div>
        </div>

        {/* Header Right Indicator */}
        {isSandbox && (
          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-mono uppercase tracking-wider text-amber-800 bg-amber-100/80 border border-amber-200 px-2.5 py-0.5 rounded-full">
              Sandbox Mode
            </span>
          </div>
        )}
      </header>

      {/* --- SUB-NAVIGATION BAR --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 pb-2">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE5DC]">
          
          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-1 bg-[#F1ECE1] p-1 rounded-2xl border border-[#E3DDD2]">
            <button
              type="button"
              onClick={() => {
                setCurrentView('albums');
                setSelectedAlbumId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'albums'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Folder className="w-3.5 h-3.5 text-amber-700" />
              <span>Albums ({albums.length})</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentView('allPhotos');
                setSelectedAlbumId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                currentView === 'allPhotos'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-amber-700" />
              <span>All Photos ({photos.length})</span>
            </button>

            {selectedAlbumId && activeAlbum && (
              <button
                type="button"
                onClick={() => setCurrentView('albumDetail')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'albumDetail'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Layers className="w-3.5 h-3.5 text-amber-700" />
                <span className="truncate max-w-[140px]">{activeAlbum.name}</span>
              </button>
            )}


          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search photos & stories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6">

        {loading ? (
          <div className="py-24 text-center space-y-3">
            <div className="inline-block w-8 h-8 border-3 border-amber-800 border-t-transparent rounded-full animate-spin" />
            <p className="font-serif text-sm text-slate-500">Retrieving photo albums and heirloom memories...</p>
          </div>
        ) : (
          <>
            {/* VIEW 1: ALBUMS OVERVIEW */}
            {currentView === 'albums' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-900">
                      Your Photo Albums
                    </h2>
                    <p className="font-serif text-xs text-slate-500">
                      Curated collections arranged by era, journey, or family chapter
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {/* Create New Album Action Card */}
                  <div
                    onClick={handleOpenCreateAlbum}
                    className="group border-2 border-dashed border-[#E3DDD2] hover:border-amber-600 bg-white/50 hover:bg-amber-50/30 rounded-3xl p-6 flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer min-h-[280px]"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/70 group-hover:bg-amber-200/80 text-amber-900 flex items-center justify-center transition-all shadow-2xs">
                      <Plus className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-slate-800 group-hover:text-amber-950">
                        Create New Album
                      </h3>
                      <p className="text-[11px] text-slate-500 font-serif mt-1">
                        Group photographs with custom title, era, and narrative
                      </p>
                    </div>
                  </div>

                  {/* Album Cards */}
                  {albums.map((album) => {
                    const stats = albumStats[album.id] || { count: 0, coverUrl: album.coverPhotoUrl };
                    return (
                      <div
                        key={album.id}
                        onClick={() => {
                          setSelectedAlbumId(album.id);
                          setCurrentView('albumDetail');
                        }}
                        className="group bg-white border border-[#EAE5DC] hover:border-amber-400/80 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer"
                      >
                        {/* Cover Image Container */}
                        <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
                          <img
                            src={stats.coverUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80'}
                            alt={album.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />

                          {/* Top Badges */}
                          <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                            {album.dateLabel ? (
                              <span className="inline-flex items-center gap-1 text-[10px] font-serif font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                                <Calendar className="w-3 h-3" />
                                {album.dateLabel}
                              </span>
                            ) : <span />}

                            <span className="inline-flex items-center gap-1 text-[10px] font-serif font-bold text-white bg-black/50 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-white/20">
                              <ImageIcon className="w-3 h-3" />
                              {stats.count} {stats.count === 1 ? 'photo' : 'photos'}
                            </span>
                          </div>

                          {/* Title on Cover */}
                          <div className="absolute bottom-3 left-3 right-3">
                            <h3 className="font-serif text-sm font-bold text-white drop-shadow-sm leading-snug">
                              {album.name}
                            </h3>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                          <p className="text-[11px] text-slate-600 font-serif line-clamp-2 leading-relaxed">
                            {album.description || 'No description provided.'}
                          </p>

                          {/* Footer Actions */}
                          <div className="pt-2 border-t border-[#F2EEE9] flex items-center justify-between text-xs">
                            <span className="font-serif font-bold text-amber-900 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                              View Album &rarr;
                            </span>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrivacyTargetAlbum(album);
                                }}
                                className="p-1.5 text-slate-400 hover:text-indigo-700 hover:bg-indigo-50 rounded-lg transition-all cursor-pointer"
                                title="Album Privacy Settings"
                              >
                                <ShieldAlert className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleOpenEditAlbum(album);
                                }}
                                className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-all"
                                title="Edit Album"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleOpenDeleteAlbumDialog(album, e)}
                                className="p-1.5 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-all"
                                title="Delete Album"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 2: ALBUM DETAIL */}
            {currentView === 'albumDetail' && activeAlbum && (
              <div className="space-y-6">
                
                {/* Album Header Banner */}
                <div className="bg-white border border-[#EAE5DC] rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="flex items-start gap-5">
                    <div
                      onClick={() => setIsCoverPickerOpen(true)}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shadow-xs border border-[#EAE5DC] shrink-0 bg-slate-100 relative group cursor-pointer"
                      title="Click to replace album cover photo"
                    >
                      <img
                        src={albumStats[activeAlbum.id]?.coverUrl || activeAlbum.coverPhotoUrl}
                        alt={activeAlbum.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/55 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-center p-1">
                        <Camera className="w-5 h-5 text-amber-300 mb-0.5" />
                        <span className="text-[9px] font-serif font-bold leading-tight">Change Cover</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentView('albums');
                          setSelectedAlbumId(null);
                        }}
                        className="text-xs text-amber-900 hover:underline font-serif inline-flex items-center gap-1 font-bold mb-1"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        Back to All Albums
                      </button>
                      <h2 className="font-serif text-xl sm:text-2xl font-bold text-slate-900">
                        {activeAlbum.name}
                      </h2>
                      {activeAlbum.dateLabel && (
                        <p className="text-xs font-serif font-bold text-amber-800 inline-flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {activeAlbum.dateLabel}
                        </p>
                      )}
                      <p className="text-xs text-slate-600 font-serif max-w-2xl leading-relaxed">
                        {activeAlbum.description || 'No description provided.'}
                      </p>
                    </div>
                  </div>

                  {/* Album Toolbar Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                    {currentViewPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={
                          selectedPhotoIds.size === currentViewPhotos.length
                            ? deselectAllPhotos
                            : selectAllCurrentPhotos
                        }
                        className="flex-1 md:flex-initial px-3 py-2 bg-[#FAF8F5] hover:bg-[#F2ECE1] text-slate-700 border border-[#E3DDD2] rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-amber-800" />
                        <span>{selectedPhotoIds.size === currentViewPhotos.length ? 'Deselect All' : 'Select All'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(activeAlbum.id)}
                      className="flex-1 md:flex-initial px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Add Photos</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setIsCoverPickerOpen(true)}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#E3DDD2] rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Replace Album Cover Photo"
                    >
                      <Camera className="w-3.5 h-3.5 text-amber-800" />
                      <span>Change Cover</span>
                    </button>



                    <button
                      type="button"
                      onClick={() => {
                        if (currentViewPhotos.length > 0) {
                          openLightbox(0);
                          setIsSlideshowPlaying(true);
                        }
                      }}
                      disabled={currentViewPhotos.length === 0}
                      className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-[#E3DDD2] rounded-xl text-xs font-serif font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                      <Play className="w-3.5 h-3.5 text-amber-700" />
                      <span>Slideshow</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setPrivacyTargetAlbum(activeAlbum)}
                      className="p-2 text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 rounded-xl transition-all cursor-pointer"
                      title="Album Privacy Settings"
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenEditAlbum(activeAlbum)}
                      className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                      title="Edit Album Information"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleOpenDeleteAlbumDialog(activeAlbum)}
                      className="p-2 text-slate-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Album"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Photos Grid within Album */}
                {currentViewPhotos.length === 0 ? (
                  <div className="bg-white border border-[#EAE5DC] rounded-3xl p-12 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-serif text-sm font-bold text-slate-800">
                        No photos in this album yet
                      </h3>
                      <p className="font-serif text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        Upload photographs with stories, captions, and dates to build this chapter of your photo book.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(activeAlbum.id)}
                      className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload First Photo</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentViewPhotos.map((photo, idx) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        isSelected={selectedPhotoIds.has(photo.id)}
                        onToggleSelect={(e) => togglePhotoSelection(photo.id, e)}
                        onClick={() => openLightbox(idx)}
                        onEdit={(e) => handleOpenEditPhoto(photo, e)}
                        onDelete={(e) => handleOpenDeletePhotosDialog([photo], e)}
                        onRemoveFromAlbum={(e) => handleOpenRemoveFromAlbumDialog([photo], e)}
                        onSetAsCover={activeAlbum ? (e) => handleSetAlbumCoverPhoto(activeAlbum.id, photo, e) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* VIEW 3: ALL PHOTOS GRID */}
            {currentView === 'allPhotos' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-lg font-bold text-slate-900">
                      All Photographs ({photos.length})
                    </h2>
                    <p className="font-serif text-xs text-slate-500">
                      Every photograph across all chapters and heirloom albums
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {currentViewPhotos.length > 0 && (
                      <button
                        type="button"
                        onClick={
                          selectedPhotoIds.size === currentViewPhotos.length
                            ? deselectAllPhotos
                            : selectAllCurrentPhotos
                        }
                        className="px-3 py-1.5 bg-[#FAF8F5] hover:bg-[#F2ECE1] text-slate-700 border border-[#E3DDD2] rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckSquare className="w-3.5 h-3.5 text-amber-800" />
                        <span>{selectedPhotoIds.size === currentViewPhotos.length ? 'Deselect All' : 'Select All'}</span>
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal()}
                      className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo</span>
                    </button>
                  </div>
                </div>

                {currentViewPhotos.length === 0 ? (
                  <div className="bg-white border border-[#EAE5DC] rounded-3xl p-12 text-center space-y-3">
                    <p className="font-serif text-xs text-slate-500">No photos match your search filter.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentViewPhotos.map((photo, idx) => (
                      <PhotoCard
                        key={photo.id}
                        photo={photo}
                        albumName={albums.find((a) => a.id === photo.albumId)?.name}
                        isSelected={selectedPhotoIds.has(photo.id)}
                        onToggleSelect={(e) => togglePhotoSelection(photo.id, e)}
                        onClick={() => openLightbox(idx)}
                        onEdit={(e) => handleOpenEditPhoto(photo, e)}
                        onDelete={(e) => handleOpenDeletePhotosDialog([photo], e)}
                        onRemoveFromAlbum={photo.albumId ? (e) => handleOpenRemoveFromAlbumDialog([photo], e) : undefined}
                        onSetAsCover={photo.albumId ? (e) => handleSetAlbumCoverPhoto(photo.albumId!, photo, e) : undefined}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

          </>
        )}
      </main>

      {/* --- FLOATING BULK SELECTION ACTIONS BAR --- */}
      {selectedPhotoIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <div className="flex items-center gap-2 pr-3 border-r border-slate-700 text-xs font-serif font-bold">
            <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[11px] font-extrabold">
              {selectedPhotoIds.size}
            </span>
            <span>Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                selectedPhotoIds.size === currentViewPhotos.length
                  ? deselectAllPhotos
                  : selectAllCurrentPhotos
              }
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer"
            >
              {selectedPhotoIds.size === currentViewPhotos.length ? 'Deselect All' : 'Select All'}
            </button>

            {currentView === 'albumDetail' && activeAlbum && (
              <button
                type="button"
                onClick={() => {
                  const selectedPhotos = currentViewPhotos.filter((p) => selectedPhotoIds.has(p.id));
                  handleOpenRemoveFromAlbumDialog(selectedPhotos);
                }}
                className="px-3.5 py-1.5 bg-amber-600/30 hover:bg-amber-600/40 text-amber-200 border border-amber-500/40 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FolderMinus className="w-3.5 h-3.5" />
                <span>Remove from Album</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                const selectedPhotos = currentViewPhotos.filter((p) => selectedPhotoIds.has(p.id));
                handleOpenDeletePhotosDialog(selectedPhotos);
              }}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Photo{selectedPhotoIds.size > 1 ? 's' : ''}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={deselectAllPhotos}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer ml-1"
            title="Clear selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* --- CONFIRM PHOTO ACTION MODAL (REMOVE FROM ALBUM OR DELETE PHOTO) --- */}
      {photoActionPending && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-2 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-2xs shrink-0 ${
                  photoActionPending.type === 'delete'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {photoActionPending.type === 'delete' ? (
                    <Trash2 className="w-5 h-5" />
                  ) : (
                    <FolderMinus className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 leading-tight">
                    {photoActionPending.type === 'delete'
                      ? `Delete ${photoActionPending.photos.length === 1 ? 'Photograph' : `${photoActionPending.photos.length} Photographs`}?`
                      : `Remove ${photoActionPending.photos.length === 1 ? 'Photo' : `${photoActionPending.photos.length} Photos`} from Album?`}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-serif">
                    {photoActionPending.type === 'delete'
                      ? 'Confirm permanent deletion from library'
                      : `Unlink from \"${photoActionPending.albumName || 'album'}\"`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isProcessingPhotoAction}
                onClick={() => setPhotoActionPending(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body / Thumbnail previews */}
            <div className="space-y-3 pt-1">
              {photoActionPending.photos.length === 1 ? (
                // Single Photo Preview
                <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-3 flex items-center gap-3.5">
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-[#E3DDD2]">
                    <img
                      src={photoActionPending.photos[0].url}
                      alt={photoActionPending.photos[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <h4 className="font-serif text-xs font-bold text-slate-900 truncate">
                      {photoActionPending.photos[0].title}
                    </h4>
                    {(photoActionPending.photos[0].date || photoActionPending.photos[0].location) && (
                      <p className="text-[10px] text-slate-500 font-serif truncate">
                        {[photoActionPending.photos[0].location, photoActionPending.photos[0].date].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    {photoActionPending.photos[0].originalFilename && (
                      <p className="text-[10px] text-slate-400 font-mono truncate">
                        {photoActionPending.photos[0].originalFilename}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                // Multiple Photos Preview Grid
                <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between text-xs font-serif">
                    <span className="font-bold text-slate-800">Selected Photographs</span>
                    <span className="text-amber-900 font-bold bg-amber-100 px-2 py-0.5 rounded-full text-[10px]">
                      {photoActionPending.photos.length} total
                    </span>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto py-1">
                    {photoActionPending.photos.slice(0, 5).map((p) => (
                      <div key={p.id} className="w-12 h-12 rounded-lg overflow-hidden bg-slate-200 border border-[#E3DDD2] shrink-0">
                        <img src={p.url} alt={p.title} className="w-full h-full object-cover" />
                      </div>
                    ))}
                    {photoActionPending.photos.length > 5 && (
                      <div className="w-12 h-12 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 font-serif font-bold text-xs flex items-center justify-center shrink-0">
                        +{photoActionPending.photos.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Informative Alert Box */}
              {photoActionPending.type === 'delete' ? (
                <div className="p-3 bg-rose-50/70 border border-rose-200/80 rounded-xl text-xs font-serif text-rose-900 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>
                    This action <strong>cannot be undone</strong>. {photoActionPending.photos.length === 1 ? 'This photograph' : 'These photographs'} will be permanently removed from your library and storage.
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs font-serif text-amber-900 flex items-start gap-2 leading-relaxed">
                  <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>
                    {photoActionPending.photos.length === 1 ? 'This photo' : 'These photos'} will be unlinked from <strong>{photoActionPending.albumName || 'this album'}</strong>, but will remain safely preserved in your Photo Book under <strong>All Photos</strong>.
                  </span>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isProcessingPhotoAction}
                onClick={() => setPhotoActionPending(null)}
                className="px-4 py-2 text-xs font-serif font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessingPhotoAction}
                onClick={handleConfirmPhotoAction}
                className={`px-4 py-2 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                  photoActionPending.type === 'delete'
                    ? 'bg-rose-700 hover:bg-rose-800'
                    : 'bg-amber-800 hover:bg-amber-900'
                }`}
              >
                {isProcessingPhotoAction ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    {photoActionPending.type === 'delete' ? (
                      <>
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Yes, Delete Photo{photoActionPending.photos.length > 1 ? 's' : ''}</span>
                      </>
                    ) : (
                      <>
                        <FolderMinus className="w-3.5 h-3.5" />
                        <span>Remove from Album</span>
                      </>
                    )}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* --- CONFIRM DELETE ALBUM DIALOG --- */}
      {albumPendingDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-2 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shadow-2xs shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900 leading-tight">
                    Delete Photo Album?
                  </h3>
                  <p className="text-[11px] text-slate-500 font-serif">
                    Confirm deletion of this heirloom collection
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={isDeletingAlbum}
                onClick={() => setAlbumPendingDelete(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 pt-1">
              <div className="bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl p-4 flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-[#E3DDD2]">
                  <img
                    src={albumStats[albumPendingDelete.id]?.coverUrl || albumPendingDelete.coverPhotoUrl}
                    alt={albumPendingDelete.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-serif text-sm font-bold text-slate-900 truncate">
                    {albumPendingDelete.name}
                  </h4>
                  {albumPendingDelete.dateLabel && (
                    <p className="text-[11px] text-amber-800 font-serif font-bold">
                      {albumPendingDelete.dateLabel}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-500 font-serif mt-0.5">
                    {albumStats[albumPendingDelete.id]?.count || 0} {(albumStats[albumPendingDelete.id]?.count || 0) === 1 ? 'photo' : 'photos'} in album
                  </p>
                </div>
              </div>

              <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-xs font-serif text-amber-900 flex items-start gap-2 leading-relaxed">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <span>
                  Deleting this album does <strong>not</strong> delete your photos. All photographs will remain safely in your Photo Book under <strong>All Photos</strong>.
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingAlbum}
                onClick={() => setAlbumPendingDelete(null)}
                className="px-4 py-2 text-xs font-serif font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeletingAlbum}
                onClick={handleConfirmDeleteAlbum}
                className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeletingAlbum ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Yes, Delete Album</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CREATE / EDIT ALBUM MODAL --- */}
      {isAlbumModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif text-base font-bold text-slate-900">
                  {editingAlbum ? 'Edit Album Details' : 'Create New Photo Album'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAlbumModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Album Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g., Summer at the Oregon Coast"
                  value={albumFormName}
                  onChange={(e) => setAlbumFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Time Period / Date Label
                </label>
                <input
                  type="text"
                  placeholder="e.g., 1975 – 1985 or October 2024"
                  value={albumFormDate}
                  onChange={(e) => setAlbumFormDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Album Story / Description
                </label>
                <textarea
                  rows={3}
                  placeholder="What memories or family milestones are gathered in this album?"
                  value={albumFormDesc}
                  onChange={(e) => setAlbumFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                />
              </div>

              {editingAlbum && (
                <div className="pt-2 border-t border-[#F2EEE9]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-serif font-bold text-slate-700">
                      Album Cover Photo
                    </label>
                    <span className="text-[10px] font-serif text-amber-800">
                      {photos.filter((p) => p.albumId === editingAlbum.id).length > 0
                        ? 'Click a photo below to set as cover'
                        : 'No photos in this album yet'}
                    </span>
                  </div>

                  {photos.filter((p) => p.albumId === editingAlbum.id).length > 0 ? (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl">
                      {photos
                        .filter((p) => p.albumId === editingAlbum.id)
                        .map((p) => {
                          const isSelected = albumFormCover === p.url;
                          return (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => setAlbumFormCover(p.url)}
                              className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer group ${
                                isSelected
                                  ? 'border-amber-800 ring-2 ring-amber-800/40 shadow-xs'
                                  : 'border-transparent hover:border-amber-600/70 opacity-75 hover:opacity-100'
                              }`}
                              title={p.title || 'Album photo'}
                            >
                              <img
                                src={p.url}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                              {isSelected && (
                                <div className="absolute inset-0 bg-amber-950/40 flex items-center justify-center">
                                  <div className="w-4 h-4 rounded-full bg-amber-800 text-white flex items-center justify-center shadow-xs">
                                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                                  </div>
                                </div>
                              )}
                            </button>
                          );
                        })}
                    </div>
                  ) : (
                    <p className="text-[11px] font-serif text-slate-400 italic">
                      Upload photos to this album first to select a custom cover photo.
                    </p>
                  )}
                </div>
              )}

            </div>

            <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAlbumModalOpen(false)}
                className="px-3.5 py-1.5 text-xs font-serif font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAlbum}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs"
              >
                {editingAlbum ? 'Save Changes' : 'Create Album'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- UPLOAD PHOTOS MODAL --- */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Upload Photos to Heirloom Photo Book
                </h3>
              </div>
              <button
                type="button"
                disabled={isUploading}
                onClick={() => {
                  setIsUploadModalOpen(false);
                  setStagedFiles([]);
                }}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-serif flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Target Album Selection */}
            <div className="space-y-1">
              <label className="block text-xs font-serif font-bold text-slate-700">
                Destination Album
              </label>
              <select
                value={uploadTargetAlbumId}
                onChange={(e) => setUploadTargetAlbumId(e.target.value)}
                disabled={isUploading}
                className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
              >
                {albums.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.dateLabel || 'Undated'})
                  </option>
                ))}
                <option value="">General / Unassigned Photos</option>
              </select>
            </div>

            {/* File Dropzone */}
            <div className="border-2 border-dashed border-[#E3DDD2] hover:border-amber-600 rounded-2xl p-6 text-center space-y-2 bg-[#FAF8F5]/50 transition-all">
              <input
                type="file"
                id="photo-upload-input"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleFilesSelected}
                disabled={isUploading}
                className="hidden"
              />
              <label
                htmlFor="photo-upload-input"
                className="cursor-pointer inline-flex flex-col items-center gap-2"
              >
                <div className="w-12 h-12 rounded-2xl bg-amber-100/80 text-amber-900 flex items-center justify-center shadow-2xs">
                  <Camera className="w-6 h-6" />
                </div>
                <div>
                  <span className="font-serif text-xs font-bold text-amber-900 hover:underline">
                    Click to select photographs
                  </span>
                  <span className="text-xs text-slate-500 font-serif"> or drag files here</span>
                </div>
                <p className="text-[10px] text-slate-400 font-serif">
                  Supports JPEG, PNG, WebP up to 15MB each
                </p>
              </label>
            </div>

            {/* Staged Files Preview & Captioning */}
            {stagedFiles.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                <div className="flex items-center justify-between text-xs font-serif font-bold text-slate-700">
                  <span>Selected Photos ({stagedFiles.length})</span>
                  <button
                    type="button"
                    onClick={() => setStagedFiles([])}
                    className="text-rose-600 hover:underline text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

                <div className="space-y-3">
                  {stagedFiles.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 bg-[#FAF8F5] border border-[#EAE5DC] rounded-2xl"
                    >
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-[#E3DDD2]">
                        <img
                          src={item.previewUrl}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                          <input
                            type="text"
                            placeholder="Photo Title / Caption"
                            value={item.title}
                            onChange={(e) => handleUpdateStagedFile(idx, 'title', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#E3DDD2] rounded-lg font-serif"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            placeholder="Date taken (e.g. Oct 1974)"
                            value={item.date}
                            onChange={(e) => handleUpdateStagedFile(idx, 'date', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#E3DDD2] rounded-lg font-serif"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            placeholder="Photo Story / Memory narrative"
                            value={item.description}
                            onChange={(e) => handleUpdateStagedFile(idx, 'description', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs bg-white border border-[#E3DDD2] rounded-lg font-serif"
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveStagedFile(idx)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-serif">
                {stagedFiles.length} file{stagedFiles.length === 1 ? '' : 's'} ready
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setStagedFiles([]);
                  }}
                  className="px-3.5 py-1.5 text-xs font-serif font-bold text-slate-600 hover:text-slate-900 rounded-xl"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={isUploading || stagedFiles.length === 0}
                  onClick={handleExecuteUpload}
                  className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 disabled:opacity-40"
                >
                  {isUploading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Uploading...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload {stagedFiles.length > 0 ? `(${stagedFiles.length})` : ''}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT PHOTO DETAILS MODAL --- */}
      {editingPhoto && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-amber-800" />
                <h3 className="font-serif text-base font-bold text-slate-900">
                  Edit Photograph Details
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-4 p-3 bg-[#FAF8F5] border border-[#E3DDD2] rounded-2xl">
              <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={editingPhoto.url}
                  alt={editingPhoto.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-xs font-serif text-slate-600 space-y-0.5 truncate">
                <p className="font-bold text-slate-900 truncate">{editingPhoto.originalFilename || 'Photo Asset'}</p>
                <p className="text-[10px] text-slate-400">Added: {new Date(editingPhoto.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Photo Title / Caption *
                </label>
                <input
                  type="text"
                  value={photoFormTitle}
                  onChange={(e) => setPhotoFormTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Date Taken
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. October 1974"
                    value={photoFormDate}
                    onChange={(e) => setPhotoFormDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Coos Bay, Oregon"
                    value={photoFormLocation}
                    onChange={(e) => setPhotoFormLocation(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Story / Narrative Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Record the memories, people, and context of this photograph..."
                  value={photoFormDesc}
                  onChange={(e) => setPhotoFormDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                />
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Assign to Album
                </label>
                <select
                  value={photoFormAlbumId}
                  onChange={(e) => setPhotoFormAlbumId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#E3DDD2] rounded-xl focus:outline-hidden focus:ring-2 focus:ring-amber-800/20 font-serif"
                >
                  <option value="">Unassigned</option>
                  {albums.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-serif text-slate-800">
                  <input
                    type="checkbox"
                    checked={photoFormIsCover}
                    onChange={(e) => setPhotoFormIsCover(e.target.checked)}
                    className="rounded border-[#E3DDD2] text-amber-800 focus:ring-amber-800/20 w-4 h-4"
                  />
                  <span>Set as primary cover photo for this album</span>
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="px-3.5 py-1.5 text-xs font-serif font-bold text-slate-600 hover:text-slate-900 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePhotoEdit}
                className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs"
              >
                Save Photo Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX & SLIDESHOW OVERLAY --- */}
      {lightboxIndex !== null && currentViewPhotos[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 text-white select-none">
          
          {/* Lightbox Header */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <span className="font-serif text-xs text-white/70">
                Photo {lightboxIndex + 1} of {currentViewPhotos.length}
              </span>
              {currentViewPhotos[lightboxIndex].albumId && (
                <span className="text-[11px] font-serif text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full">
                  {albums.find((a) => a.id === currentViewPhotos[lightboxIndex].albumId)?.name}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsSlideshowPlaying(!isSlideshowPlaying)}
                className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSlideshowPlaying
                    ? 'bg-amber-700 text-white shadow-sm'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {isSlideshowPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isSlideshowPlaying ? 'Pause Slideshow' : 'Play Slideshow'}</span>
              </button>

              {currentViewPhotos[lightboxIndex].albumId && (
                <button
                  type="button"
                  onClick={() => {
                    const currentPhoto = currentViewPhotos[lightboxIndex];
                    if (currentPhoto.albumId) {
                      handleSetAlbumCoverPhoto(currentPhoto.albumId, currentPhoto);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-serif font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    currentViewPhotos[lightboxIndex].isCover
                      ? 'bg-amber-500/25 text-amber-300 border border-amber-500/40'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  title={currentViewPhotos[lightboxIndex].isCover ? 'Current Album Cover Photo' : 'Set as Album Cover Photo'}
                >
                  <Camera className="w-3.5 h-3.5 text-amber-300" />
                  <span>{currentViewPhotos[lightboxIndex].isCover ? 'Cover Photo' : 'Set as Cover'}</span>
                </button>
              )}
              {currentViewPhotos[lightboxIndex].albumId && (
                <button
                  type="button"
                  onClick={() => handleOpenRemoveFromAlbumDialog([currentViewPhotos[lightboxIndex]])}
                  className="p-2 bg-white/10 hover:bg-white/20 text-amber-300 rounded-xl transition-all cursor-pointer"
                  title="Remove from Album (Keep in Library)"
                >
                  <FolderMinus className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleOpenDeletePhotosDialog([currentViewPhotos[lightboxIndex]])}
                className="p-2 bg-white/10 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 rounded-xl transition-all cursor-pointer"
                title="Delete Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleOpenEditPhoto(currentViewPhotos[lightboxIndex])}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
                title="Edit Photo Details"
              >
                <Edit3 className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={closeLightbox}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all ml-2"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Main Image Viewport & Navigation Arrows */}
          <div className="relative flex-1 flex items-center justify-center py-4">
            <button
              type="button"
              onClick={handlePrevLightbox}
              className="absolute left-2 sm:left-6 p-3 bg-black/40 hover:bg-black/70 border border-white/20 rounded-2xl text-white transition-all z-20 cursor-pointer"
              title="Previous Photo (Left Arrow)"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <div className="max-w-4xl max-h-[70vh] flex items-center justify-center">
              <img
                src={currentViewPhotos[lightboxIndex].url}
                alt={currentViewPhotos[lightboxIndex].title}
                className="max-h-[70vh] max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>

            <button
              type="button"
              onClick={handleNextLightbox}
              className="absolute right-2 sm:right-6 p-3 bg-black/40 hover:bg-black/70 border border-white/20 rounded-2xl text-white transition-all z-20 cursor-pointer"
              title="Next Photo (Right Arrow)"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Footer Caption */}
          <div className="max-w-2xl mx-auto w-full text-center space-y-1.5 z-10 bg-black/40 backdrop-blur-xs p-4 rounded-2xl border border-white/10">
            <h3 className="font-serif text-lg font-bold text-white">
              {currentViewPhotos[lightboxIndex].title}
            </h3>
            {(currentViewPhotos[lightboxIndex].date || currentViewPhotos[lightboxIndex].location) && (
              <p className="text-xs font-serif text-amber-300 flex items-center justify-center gap-3">
                {currentViewPhotos[lightboxIndex].location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {currentViewPhotos[lightboxIndex].location}
                  </span>
                )}
                {currentViewPhotos[lightboxIndex].date && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {currentViewPhotos[lightboxIndex].date}
                  </span>
                )}
              </p>
            )}
            {currentViewPhotos[lightboxIndex].description && (
              <p className="text-xs font-serif text-white/80 leading-relaxed max-w-lg mx-auto">
                {currentViewPhotos[lightboxIndex].description}
              </p>
            )}
          </div>

        </div>
      )}

      {/* --- REPLACE ALBUM COVER MODAL --- */}
      {isCoverPickerOpen && activeAlbum && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-800" />
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900">
                    Replace Album Cover Photo
                  </h3>
                  <p className="font-serif text-xs text-slate-500">
                    Select a photograph from &ldquo;{activeAlbum.name}&rdquo; to display on the cover
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCoverPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {currentViewPhotos.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <p className="font-serif text-xs text-slate-500">
                  There are no photos in this album yet. Upload photos first to choose a cover.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsCoverPickerOpen(false);
                    handleOpenUploadModal(activeAlbum.id);
                  }}
                  className="px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all cursor-pointer shadow-xs inline-flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photos</span>
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {currentViewPhotos.map((photo) => {
                    const isCover = photo.isCover || photo.url === (albumStats[activeAlbum.id]?.coverUrl || activeAlbum.coverPhotoUrl);
                    return (
                      <div
                        key={photo.id}
                        onClick={() => {
                          handleSetAlbumCoverPhoto(activeAlbum.id, photo);
                          setIsCoverPickerOpen(false);
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-4/3 bg-slate-100 ${
                          isCover
                            ? 'border-amber-800 ring-2 ring-amber-800/30 shadow-md'
                            : 'border-[#EAE5DC] hover:border-amber-600 hover:shadow-xs'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-2">
                          <div className="flex justify-end">
                            {isCover ? (
                              <span className="text-[10px] font-serif font-bold text-amber-900 bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded-md shadow-xs flex items-center gap-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Current Cover
                              </span>
                            ) : (
                              <span className="text-[10px] font-serif font-bold text-white bg-black/60 px-1.5 py-0.5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                Select
                              </span>
                            )}
                          </div>
                          <p className="text-white text-[11px] font-serif font-bold truncate">
                            {photo.title || 'Untitled Photo'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setIsCoverPickerOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Component Tag per Guidelines */}
      {/* Album Privacy Settings Modal */}
      <MbrAlbumPrivacyModal
        isOpen={Boolean(privacyTargetAlbum)}
        onClose={() => setPrivacyTargetAlbum(null)}
        albumId={privacyTargetAlbum?.id || ''}
        albumName={privacyTargetAlbum?.name || 'Photo Album'}
        mbrId={currentMbrId}
        isSandbox={isSandbox}
      />

      {/* Admin Component Tag per Guidelines */}
      <AdminComponentTag name="mbrPhotoBookFeature" />
    </div>
  );
}

// Subcomponent: Photo Card
interface PhotoCardProps {
  key?: React.Key;
  photo: PhotoItem;
  albumName?: string;
  isSelected?: boolean;
  onToggleSelect?: (e: React.MouseEvent) => void;
  onClick: () => void;
  onEdit: (e: React.MouseEvent) => void;
  onDelete: (e: React.MouseEvent) => void;
  onRemoveFromAlbum?: (e: React.MouseEvent) => void;
  onSetAsCover?: (e: React.MouseEvent) => void;
}

function PhotoCard({
  photo,
  albumName,
  isSelected = false,
  onToggleSelect,
  onClick,
  onEdit,
  onDelete,
  onRemoveFromAlbum,
  onSetAsCover
}: PhotoCardProps) {
  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col cursor-pointer relative ${
        isSelected
          ? 'border-2 border-amber-800 ring-2 ring-amber-800/20 shadow-sm'
          : 'border border-[#EAE5DC] hover:border-amber-400/80'
      }`}
    >
      <div className="relative aspect-4/3 overflow-hidden bg-slate-100">
        <img
          src={photo.url}
          alt={photo.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        {/* Selection Checkbox Button */}
        {onToggleSelect && (
          <button
            type="button"
            onClick={onToggleSelect}
            className={`absolute top-2.5 left-2.5 z-20 w-6 h-6 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
              isSelected
                ? 'bg-amber-800 text-white shadow-md ring-2 ring-white opacity-100'
                : 'bg-black/40 text-white/80 hover:bg-black/60 hover:text-white opacity-0 group-hover:opacity-100 backdrop-blur-xs'
            }`}
            title={isSelected ? 'Deselect photo' : 'Select photo'}
          >
            <Check className={`w-3.5 h-3.5 ${isSelected ? 'stroke-[3]' : 'stroke-[2]'}`} />
          </button>
        )}

        {/* Top Badges */}
        <div className={`absolute top-2.5 right-2.5 flex items-center justify-between ${onToggleSelect ? 'left-11' : 'left-2.5'}`}>
          {albumName ? (
            <span className="text-[10px] font-serif font-bold text-white bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 truncate max-w-[130px]">
              {albumName}
            </span>
          ) : <span />}

          {photo.isCover && (
            <span className="text-[10px] font-serif font-bold text-amber-900 bg-amber-200/95 border border-amber-300 px-2 py-0.5 rounded-full shadow-xs shrink-0 flex items-center gap-1">
              <Camera className="w-2.5 h-2.5" />
              Cover
            </span>
          )}
        </div>

        {/* Action icons on hover */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 z-20">
          {onSetAsCover && !photo.isCover && (
            <button
              type="button"
              onClick={onSetAsCover}
              className="p-1.5 bg-white/95 hover:bg-amber-100 text-amber-900 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Set as Album Cover Photo"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          )}
          {onRemoveFromAlbum && (
            <button
              type="button"
              onClick={onRemoveFromAlbum}
              className="p-1.5 bg-white/95 hover:bg-white text-amber-900 hover:text-amber-950 rounded-lg shadow-xs transition-all cursor-pointer"
              title="Remove from Album (Keep in Collection)"
            >
              <FolderMinus className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 bg-white/95 hover:bg-white text-slate-800 rounded-lg shadow-xs transition-all cursor-pointer"
            title="Edit Photo Details"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-1.5 bg-white/95 hover:bg-white text-rose-700 hover:text-rose-800 rounded-lg shadow-xs transition-all cursor-pointer"
            title="Delete Photo"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between gap-2">
        <div className="space-y-1">
          <h4 className="font-serif text-xs font-bold text-slate-900 group-hover:text-amber-950 truncate">
            {photo.title}
          </h4>
          {(photo.date || photo.location) && (
            <p className="text-[10px] font-serif text-slate-500 truncate">
              {[photo.location, photo.date].filter(Boolean).join(' • ')}
            </p>
          )}
          {photo.description && (
            <p className="text-[11px] font-serif text-slate-600 line-clamp-2 leading-relaxed">
              {photo.description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export { MbrPhotoBookPage as MbrPhotoBookFeature, MbrPhotoBookPage as SbMbrPhotoBookFeature };
