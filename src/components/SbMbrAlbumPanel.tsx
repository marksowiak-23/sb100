/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Images,
  FolderLock,
  ChevronRight,
  ChevronLeft,
  X,
  Loader2,
  Calendar,
  Sparkles,
  Info,
  ShieldAlert
} from 'lucide-react';
import { taskApi, resolveMediaUrl, MbrAlbum, MbrAlbumPhoto, MbrAlbumGroupPrivs, MbrAlbumConnectionPrivs } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface SbMbrAlbumPanelProps {
  memberId: string;
  viewerMbrId?: string | null;
  memberName?: string;
  isSandbox?: boolean;
}

export type sbMbrAlbumPanelProps = SbMbrAlbumPanelProps;
export type MbrAlbumPanelProps = SbMbrAlbumPanelProps;

interface AccessibleAlbum {
  album: MbrAlbum;
  photoCount?: number;
}

export default function SbMbrAlbumPanel({
  memberId,
  viewerMbrId: propViewerMbrId,
  memberName = 'Member',
  isSandbox = false
}: SbMbrAlbumPanelProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [accessibleAlbums, setAccessibleAlbums] = useState<AccessibleAlbum[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Viewing dialog state
  const [selectedAlbum, setSelectedAlbum] = useState<MbrAlbum | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<MbrAlbumPhoto[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState<boolean>(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);

  // Resolved viewer ID
  const [viewerMbrId, setViewerMbrId] = useState<string | null>(() => {
    if (propViewerMbrId) return propViewerMbrId;
    const storedMbr = sessionStorage.getItem('sb_current_mbr');
    if (storedMbr) {
      try {
        const parsed = JSON.parse(storedMbr);
        if (parsed.mbrId) return parsed.mbrId;
      } catch {}
    }
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.mbr_id) return u.mbr_id;
      } catch {}
    }
    return null;
  });

  const isPrivAllow = (val?: string): boolean => {
    if (!val) return false;
    const upper = val.toUpperCase().trim();
    return upper === 'READ' || upper === 'WRITE' || upper === 'VIEW' || upper.includes('VIEW') || upper.includes('COMMENT') || upper === 'ALLOW';
  };

  const isPrivDeny = (val?: string): boolean => {
    if (!val) return false;
    const upper = val.toUpperCase().trim();
    return upper === 'NONE' || upper === 'HIDE' || upper === 'DENY' || upper === 'RESTRICTED';
  };

  const loadAccessibleAlbums = useCallback(async () => {
    if (!memberId) {
      setAccessibleAlbums([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Resolve viewer member ID if not yet resolved
      let currentViewerId = propViewerMbrId || viewerMbrId;
      if (!currentViewerId) {
        const storedMbr = sessionStorage.getItem('sb_current_mbr');
        if (storedMbr) {
          try {
            const parsed = JSON.parse(storedMbr);
            if (parsed.mbrId) currentViewerId = parsed.mbrId;
          } catch {}
        }
        if (!currentViewerId) {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            try {
              const u = JSON.parse(userStr);
              if (u.mbr_id) {
                currentViewerId = u.mbr_id;
              } else if (u.user_id) {
                const profile = await taskApi.getMemberByUserId(u.user_id).catch(() => null);
                if (profile?.mbrId) currentViewerId = profile.mbrId;
              }
            } catch {}
          }
        }
        if (currentViewerId) {
          setViewerMbrId(currentViewerId);
        }
      }

      // 2. Fetch the target author's albums
      let allAlbums: MbrAlbum[] = [];
      if (!isSandbox) {
        allAlbums = await taskApi.getMemberAlbums(memberId).catch(() => []);
      } else {
        const savedStr = sessionStorage.getItem(`sb_photobook_albums_${memberId}`);
        if (savedStr) {
          try {
            allAlbums = JSON.parse(savedStr);
          } catch {
            allAlbums = [];
          }
        }
      }

      if (!allAlbums || allAlbums.length === 0) {
        setAccessibleAlbums([]);
        setLoading(false);
        return;
      }

      // 3. If viewer is author themselves, all albums are accessible
      const isAuthorViewer = Boolean(currentViewerId && currentViewerId === memberId);
      if (isAuthorViewer) {
        const listWithPhotos: AccessibleAlbum[] = await Promise.all(
          allAlbums.map(async (alb) => {
            const photos = await taskApi.getMemberAlbumPhotos(alb.albumId).catch(() => []);
            return { album: alb, photoCount: photos.length };
          })
        );
        setAccessibleAlbums(listWithPhotos);
        setLoading(false);
        return;
      }

      // 4. Resolve connection group between author and viewer
      let assignedGrpId: string | null = null;
      if (currentViewerId && memberId) {
        try {
          const authorConns = await taskApi.getMemberConnections({
            mbrId: memberId,
            connectedMbrId: currentViewerId
          }).catch(() => []);

          if (authorConns.length > 0) {
            const connGrps = await taskApi.getMemberConnectionGrps({
              connectionId: authorConns[0].mbrConnectionId
            }).catch(() => []);
            if (connGrps && connGrps.length > 0) {
              assignedGrpId = connGrps[0].grpId;
            }
          } else {
            const viewerConns = await taskApi.getMemberConnections({
              mbrId: currentViewerId,
              connectedMbrId: memberId
            }).catch(() => []);
            if (viewerConns.length > 0) {
              const connGrps = await taskApi.getMemberConnectionGrps({
                connectionId: viewerConns[0].mbrConnectionId
              }).catch(() => []);
              if (connGrps && connGrps.length > 0) {
                assignedGrpId = connGrps[0].grpId;
              }
            }
          }
        } catch (connErr) {
          console.warn('Could not determine connection group for album privacy check:', connErr);
        }
      }

      // 5. Fetch Public group ID
      let publicGrpId = '13efcbad-d840-44ad-9b50-d6d2218e5cac';
      try {
        const globals = await taskApi.getGroupsGlobal().catch(() => []);
        const pub = globals.find((g) => g.grpName?.toLowerCase() === 'public');
        if (pub?.grpId) publicGrpId = pub.grpId;
      } catch {}

      // 6. Fetch album privileges concurrently (mbrAlbumGroupPrivs & mbrAlbumConnectionPrivs)
      const allowedAlbumList: AccessibleAlbum[] = [];

      await Promise.all(
        allAlbums.map(async (alb) => {
          let grpAllowed = false;
          let grpDenied = false;
          let memberAllowed = false;
          let memberDenied = false;

          if (isSandbox) {
            const grpPrivsStr = sessionStorage.getItem(`sandbox_album_privs_${alb.albumId}`);
            const connPrivsStr = sessionStorage.getItem(`sandbox_album_conn_privs_${alb.albumId}`);
            const grpPrivs: any[] = grpPrivsStr ? JSON.parse(grpPrivsStr) : [];
            const connPrivs: any[] = connPrivsStr ? JSON.parse(connPrivsStr) : [];

            if (assignedGrpId) {
              const matched = grpPrivs.find((p) => p.grpId === assignedGrpId);
              if (matched) {
                if (isPrivAllow(matched.privValueCd)) grpAllowed = true;
                if (isPrivDeny(matched.privValueCd)) grpDenied = true;
              }
            }
            if (!grpAllowed && !grpDenied && publicGrpId) {
              const pubMatched = grpPrivs.find((p) => p.grpId === publicGrpId);
              if (pubMatched) {
                if (isPrivAllow(pubMatched.privValueCd)) grpAllowed = true;
                if (isPrivDeny(pubMatched.privValueCd)) grpDenied = true;
              }
            }
            if (currentViewerId) {
              const connMatched = connPrivs.find((p) => p.mbrConnectionMbrId === currentViewerId);
              if (connMatched) {
                if (isPrivAllow(connMatched.privValueCd)) memberAllowed = true;
                if (isPrivDeny(connMatched.privValueCd)) memberDenied = true;
              }
            }
          } else {
            // Live DB: check mbrAlbumGroupPrivs & mbrAlbumConnectionPrivs
            const [grpPrivs, connPrivs] = await Promise.all([
              taskApi.getMemberAlbumGroupPrivs({ albumId: alb.albumId }).catch(() => [] as MbrAlbumGroupPrivs[]),
              currentViewerId
                ? taskApi.getMemberAlbumConnectionPrivs({ albumId: alb.albumId, mbrConnectionMbrId: currentViewerId }).catch(() => [] as MbrAlbumConnectionPrivs[])
                : Promise.resolve([] as MbrAlbumConnectionPrivs[])
            ]);

            if (assignedGrpId) {
              const matched = grpPrivs.find((p) => p.grpId === assignedGrpId);
              if (matched) {
                if (isPrivAllow(matched.privValueCd)) grpAllowed = true;
                if (isPrivDeny(matched.privValueCd)) grpDenied = true;
              }
            }

            if (!grpAllowed && !grpDenied && publicGrpId) {
              const pubMatched = grpPrivs.find((p) => p.grpId === publicGrpId);
              if (pubMatched) {
                if (isPrivAllow(pubMatched.privValueCd)) grpAllowed = true;
                if (isPrivDeny(pubMatched.privValueCd)) grpDenied = true;
              }
            }

            if (connPrivs.length > 0) {
              const direct = connPrivs[0];
              if (isPrivAllow(direct.privValueCd)) memberAllowed = true;
              if (isPrivDeny(direct.privValueCd)) memberDenied = true;
            }
          }

          // Strict Privilege Alignment:
          // Must have at least one allow (group or member connection), and ZERO denials.
          if (!grpDenied && !memberDenied && (grpAllowed || memberAllowed)) {
            const photos = await taskApi.getMemberAlbumPhotos(alb.albumId).catch(() => []);
            allowedAlbumList.push({
              album: alb,
              photoCount: photos.length
            });
          }
        })
      );

      // Sort albums alphabetically or by sort order
      allowedAlbumList.sort((a, b) => {
        const orderA = a.album.albumSortOrder ?? 999;
        const orderB = b.album.albumSortOrder ?? 999;
        if (orderA !== orderB) return orderA - orderB;
        return (a.album.albumName || '').localeCompare(b.album.albumName || '');
      });

      setAccessibleAlbums(allowedAlbumList);
    } catch (err: any) {
      console.error('Failed to load member album privileges:', err);
      setError('Unable to load photo albums at this time.');
    } finally {
      setLoading(false);
    }
  }, [memberId, propViewerMbrId, viewerMbrId, isSandbox]);

  useEffect(() => {
    loadAccessibleAlbums();
  }, [loadAccessibleAlbums]);

  // Click on an album to open photo viewer dialog
  const handleOpenAlbumPhotos = async (album: MbrAlbum) => {
    setSelectedAlbum(album);
    setActivePhotoIndex(0);
    setPhotoError(null);
    setLoadingPhotos(true);

    try {
      const photos = await taskApi.getMemberAlbumPhotos(album.albumId).catch(() => []);
      photos.sort((a, b) => (a.photoSortOrder ?? 999) - (b.photoSortOrder ?? 999));
      setAlbumPhotos(photos);
    } catch (err: any) {
      console.error('Failed to load photos for album:', err);
      setPhotoError('Unable to load album photos.');
    } finally {
      setLoadingPhotos(false);
    }
  };

  const handleCloseAlbumPhotos = () => {
    setSelectedAlbum(null);
    setAlbumPhotos([]);
    setActivePhotoIndex(0);
    setPhotoError(null);
  };

  const handleNextPhoto = () => {
    if (albumPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev + 1) % albumPhotos.length);
  };

  const handlePrevPhoto = () => {
    if (albumPhotos.length === 0) return;
    setActivePhotoIndex((prev) => (prev - 1 + albumPhotos.length) % albumPhotos.length);
  };

  // Keyboard navigation for viewer dialog
  useEffect(() => {
    if (!selectedAlbum) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        handleNextPhoto();
      } else if (e.key === 'ArrowLeft') {
        handlePrevPhoto();
      } else if (e.key === 'Escape') {
        handleCloseAlbumPhotos();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedAlbum, albumPhotos.length]);

  const currentPhoto = albumPhotos[activePhotoIndex];

  return (
    <div className="bg-[#FFFDF9] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.02)] flex flex-col gap-4 relative overflow-hidden">
      
      {/* =========================================================================
          TOP HALF: Designed similar to MbrAlbumPrivacyModal (Header + Badge + Subtext)
          ========================================================================= */}
      <div className="flex items-start justify-between pb-3.5 border-b border-[#EFECE7]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-700 border border-indigo-100/80 rounded-2xl shrink-0 shadow-2xs">
            <Images className="w-5 h-5 text-indigo-700" />
          </div>
          <div>
            <h3 className="font-serif text-base font-bold text-slate-850 leading-tight">
              Photo Albums
            </h3>
            <div className="text-xs text-slate-500 font-serif mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span className="font-semibold text-slate-400">Author:</span>
              <span className="font-bold text-indigo-700 truncate max-w-[150px]">{memberName}</span>
              <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-700 font-medium bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                Verified Privileges
              </span>
            </div>
          </div>
        </div>

        <span className="text-[9.5px] font-serif font-bold uppercase tracking-wider text-indigo-800 bg-indigo-100/70 px-2 py-0.5 rounded-full border border-indigo-200">
          Albums
        </span>
      </div>

      {/* Descriptive summary banner matching privacy modal aesthetic */}
      <div className="bg-slate-50/80 border border-slate-200/70 rounded-2xl p-3 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="text-[11.5px] font-serif text-slate-600 leading-relaxed">
          Albums shared with you according to {memberName}'s group and member connection privacy permissions. Click any album to view photographs.
        </p>
      </div>

      {/* =========================================================================
          BOTTOM HALF: Scrollable list of accessible albums for the member
          ========================================================================= */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between pb-2">
          <span className="text-xs font-serif font-bold text-slate-700">
            Available Albums
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {accessibleAlbums.length} {accessibleAlbums.length === 1 ? 'Album' : 'Albums'}
          </span>
        </div>

        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center text-slate-400 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <span className="text-xs font-serif">Checking album permissions...</span>
          </div>
        ) : error ? (
          <div className="py-4 text-center text-rose-600 text-xs font-serif bg-rose-50 rounded-2xl p-3 border border-rose-100">
            {error}
          </div>
        ) : accessibleAlbums.length === 0 ? (
          <div className="py-8 px-4 text-center flex flex-col items-center justify-center text-slate-500 gap-2 bg-slate-50/50 rounded-2xl border border-slate-200/60">
            <FolderLock className="w-8 h-8 text-slate-400" />
            <span className="text-xs font-serif font-semibold text-slate-700">No Shared Albums</span>
            <p className="text-[11px] font-serif text-slate-400 max-w-xs leading-normal">
              No photo albums are currently accessible based on your connection group and member privacy settings with {memberName}.
            </p>
          </div>
        ) : (
          <div className="max-h-[320px] overflow-y-auto space-y-2.5 pr-1 focus:outline-none">
            {accessibleAlbums.map(({ album, photoCount }) => {
              const coverUrl = album.albumCoverPhotoUrl ? resolveMediaUrl(album.albumCoverPhotoUrl) : null;
              return (
                <div
                  key={album.albumId}
                  onClick={() => handleOpenAlbumPhotos(album)}
                  className="group/album cursor-pointer bg-white hover:bg-indigo-50/40 border border-[#EFECE7] hover:border-indigo-300 rounded-2xl p-3 transition-all shadow-2xs hover:shadow-sm flex items-center justify-between gap-3"
                  title={`Click to view photos in ${album.albumName}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Album Cover Thumbnail or Icon */}
                    <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center relative">
                      {coverUrl ? (
                        <img
                          src={coverUrl}
                          alt={album.albumName}
                          className="w-full h-full object-cover group-hover/album:scale-105 transition-transform"
                          loading="lazy"
                        />
                      ) : (
                        <Images className="w-5 h-5 text-indigo-400" />
                      )}
                    </div>

                    {/* Album Name, Description & Date */}
                    <div className="min-w-0">
                      <h4 className="font-serif text-xs font-bold text-slate-900 group-hover/album:text-indigo-800 truncate transition-colors leading-tight">
                        {album.albumName}
                      </h4>
                      {album.albumDesc && (
                        <p className="text-[11px] font-serif text-slate-500 truncate max-w-[210px] mt-0.5">
                          {album.albumDesc}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400 font-mono">
                        {album.albumDateLabel ? (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-2.5 h-2.5 text-slate-400" />
                            {album.albumDateLabel}
                          </span>
                        ) : null}
                        <span>{photoCount ?? 0} {photoCount === 1 ? 'photo' : 'photos'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-xl text-slate-400 group-hover/album:text-indigo-600 group-hover/album:bg-indigo-100/60 transition-all shrink-0">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* =========================================================================
          PHOTO GALLERY DIALOG BOX (Read-Only: No upload or delete capabilities)
          Using the exact visual design and layout of Photo Gallery
          ========================================================================= */}
      <AnimatePresence>
        {selectedAlbum && (
          <div
            key={`album-gallery-modal-${selectedAlbum.albumId}`}
            className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-6 md:p-10"
          >
            {/* Backdrop Overlay */}
            <motion.div
              key="album-gallery-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseAlbumPhotos}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            />

            {/* Dialog Window */}
            <motion.div
              key="album-gallery-dialog"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl z-10 flex flex-col max-h-[92vh] sm:max-h-[90vh]"
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-80 z-20" />

              {/* Modal Header */}
              <div className="flex items-center justify-between px-3.5 sm:px-6 py-3 sm:py-4 border-b border-slate-800 bg-slate-900/95 text-white shrink-0 gap-2 relative">
                {/* Left Info / Title */}
                <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
                  <div className="p-2 sm:p-2.5 bg-blue-500/20 text-blue-400 rounded-xl shrink-0">
                    <Images className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-sm sm:text-base text-slate-100 truncate leading-tight">
                        {selectedAlbum.albumName}
                      </h3>
                      {selectedAlbum.albumDateLabel && (
                        <span className="text-[11px] font-mono text-slate-400 border-l border-slate-700 pl-2 hidden xs:inline-block">
                          {selectedAlbum.albumDateLabel}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[11px] sm:text-xs text-slate-400 font-mono whitespace-nowrap">
                        Photo {albumPhotos.length > 0 ? activePhotoIndex + 1 : 0} of {albumPhotos.length}
                      </span>
                      <span className="text-[10px] text-indigo-400 font-mono border-l border-slate-700 pl-2">
                        Read-Only View
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action Controls: Close button only (No upload/delete) */}
                <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
                  <button
                    type="button"
                    onClick={handleCloseAlbumPhotos}
                    className="p-1.5 sm:p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
                    title="Close Album Viewer (Esc)"
                    aria-label="Close Album Viewer"
                  >
                    <X className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>

              {/* Feedback Alerts */}
              {photoError && (
                <div className="bg-rose-950/60 border-b border-rose-800 text-rose-300 px-6 py-2.5 text-xs font-serif flex items-center justify-between shrink-0">
                  <span>{photoError}</span>
                  <button onClick={() => setPhotoError(null)} className="text-rose-400 hover:text-rose-200">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Main Photo Viewing Stage */}
              <div className="relative flex-grow flex items-center justify-center bg-black/60 p-4 min-h-[300px] md:min-h-[400px] overflow-hidden select-none">
                {loadingPhotos ? (
                  <div className="flex flex-col items-center justify-center text-slate-400 py-12 gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                    <span className="text-xs font-serif">Loading album photos...</span>
                  </div>
                ) : albumPhotos.length > 0 ? (
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

                    {/* Current Active Photo & Caption */}
                    <motion.div
                      key={currentPhoto?.albumPhotoId ? `photo-${currentPhoto.albumPhotoId}-${activePhotoIndex}` : `photo-idx-${activePhotoIndex}`}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col items-center justify-center max-h-[58vh] w-full"
                    >
                      <img
                        src={resolveMediaUrl(currentPhoto?.mbrMediaPath)}
                        alt={currentPhoto?.photoTitle || currentPhoto?.mbrMediaOriginalFilename || `${selectedAlbum.albumName} Photo`}
                        className="max-h-[44vh] max-w-full object-contain rounded-2xl shadow-xl border border-slate-800"
                      />

                      {/* Photo Description / Title Display (Read Only) */}
                      {(currentPhoto?.photoTitle || currentPhoto?.photoCaption) && (
                        <div className="mt-3 max-w-xl w-full px-4 select-text">
                          <div className="flex flex-col items-center justify-center bg-slate-900/70 text-slate-300 px-4 py-2 rounded-2xl border border-slate-800 mx-auto text-center">
                            {currentPhoto.photoTitle && (
                              <span className="text-xs md:text-sm font-serif font-bold text-slate-100 truncate max-w-md">
                                {currentPhoto.photoTitle}
                              </span>
                            )}
                            {currentPhoto.photoCaption && (
                              <span className="text-[11px] md:text-xs font-serif text-slate-400 line-clamp-2 max-w-md mt-0.5">
                                {currentPhoto.photoCaption}
                              </span>
                            )}
                          </div>
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
                  /* Empty State Prompt */
                  <div className="flex flex-col items-center justify-center text-center text-slate-300 py-12 px-6 space-y-4 max-w-md mx-auto">
                    <div className="p-4 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-3xl">
                      <Images className="w-10 h-10" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="font-serif text-lg font-bold text-slate-100">No Photos In Album</h4>
                      <p className="text-xs font-serif text-slate-400 leading-relaxed">
                        There are no photographs in the album "{selectedAlbum.albumName}" at this time.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Thumbnail Strip */}
              {albumPhotos.length > 1 && (
                <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/80 shrink-0 overflow-x-auto">
                  <div className="flex items-center justify-center gap-2.5 min-w-max mx-auto">
                    {albumPhotos.map((item, idx) => {
                      const isCurrent = idx === activePhotoIndex;
                      return (
                        <button
                          key={item.albumPhotoId ? `thumb-${item.albumPhotoId}-${idx}` : `thumb-idx-${idx}`}
                          type="button"
                          onClick={() => setActivePhotoIndex(idx)}
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
        )}
      </AnimatePresence>

      <AdminComponentTag name="SbMbrAlbumPanel" />
    </div>
  );
}

export { SbMbrAlbumPanel, SbMbrAlbumPanel as sbMbrAlbumPanel };

