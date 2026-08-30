import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Briefcase, GraduationCap, Calendar, Heart, Loader2, ChevronDown, ChevronUp, BookOpen, Images, ChevronLeft, ChevronRight, X, Edit3, Save, Users, UserCheck, UserPlus, Clock, User } from 'lucide-react';
import { taskApi, mbrStatApi, mbrSettingsApi, resolveMediaUrl, MbrMedia, MbrStat, MbrSettings } from '@/src/services/api';
import { MEMBER_STORIES } from '@/src/features/publicPage/constants/memberData';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrPhotoGalleryPanel from '@/src/components/mbrPhotoGalleryPanel';
import MbrConnectPanel from '@/src/components/mbrConnectPanel';

export interface MbrProfilePanelProps {
  key?: React.Key;
  isSandbox?: boolean;
  profile?: any;
  memberId?: string;
  readOnly?: boolean;
  isConnected?: boolean;
  connectionGrpName?: string;
  viewerMbrId?: string | null;
  showConnectButton?: boolean;
  onConnectSuccess?: () => void;
  onClickReadStory?: (memberId: string) => void;
}

export type SbMbrProfilePanelProps = MbrProfilePanelProps;
export type mbrProfilePanelProps = MbrProfilePanelProps;

export default function MbrProfilePanel({
  isSandbox = false,
  profile: propProfile,
  memberId,
  readOnly = false,
  isConnected: propIsConnected,
  connectionGrpName: propConnectionGrpName,
  viewerMbrId: propViewerMbrId,
  showConnectButton = true,
  onConnectSuccess,
  onClickReadStory
}: MbrProfilePanelProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(propProfile || null);
  const [settings, setSettings] = useState<MbrSettings | null>(() => {
    if (propProfile?.mbrSettings) return propProfile.mbrSettings;
    return null;
  });
  const [galleryItems, setGalleryItems] = useState<MbrMedia[]>([]);
  const [mbrStat, setMbrStat] = useState<MbrStat | null>(null);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // Resolved viewer member ID
  const [resolvedViewerId, setResolvedViewerId] = useState<string | null>(propViewerMbrId || null);

  useEffect(() => {
    if (propViewerMbrId) {
      setResolvedViewerId(propViewerMbrId);
      return;
    }
    const storedMbr = sessionStorage.getItem('sb_current_mbr');
    if (storedMbr) {
      try {
        const parsed = JSON.parse(storedMbr);
        if (parsed.mbrId) setResolvedViewerId(parsed.mbrId);
      } catch {}
    }
  }, [propViewerMbrId]);

  // --- PHOTO DESCRIPTION EDIT STATE ---
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescriptionInput, setEditDescriptionInput] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);

  // Session storage state for introduction accordion panel collapse persistence
  const [isIntroCollapsed, setIsIntroCollapsed] = useState<boolean>(() => {
    const key = propProfile?.mbrId ? `author_intro_collapsed_${propProfile.mbrId}` : 'author_intro_collapsed';
    return sessionStorage.getItem(key) === 'true';
  });

  const toggleIntroAccordion = () => {
    setIsIntroCollapsed((prev) => {
      const nextState = !prev;
      const key = profile?.mbrId ? `author_intro_collapsed_${profile.mbrId}` : 'author_intro_collapsed';
      sessionStorage.setItem(key, String(nextState));
      return nextState;
    });
  };

  useEffect(() => {
    if (propProfile) {
      const cachedPic = sessionStorage.getItem(`session_pic_${propProfile.mbrId}`);
      setProfile({
        ...propProfile,
        mbrProfilePic: resolveMediaUrl(cachedPic || propProfile.mbrProfilePic || propProfile.avatarUrl)
      });
      if (propProfile.mbrId) {
        fetchGallery(propProfile.mbrId);
        fetchStats(propProfile.mbrId);
        fetchSettings(propProfile.mbrId);
      }
      setLoading(false);
    } else if (memberId) {
      loadProfileById(memberId);
    } else {
      loadAuthorProfile();
    }
  }, [isSandbox, propProfile, memberId]);

  const fetchSettings = async (targetMbrId: string) => {
    if (!targetMbrId) return;
    const realMbrId = targetMbrId === 'm1' ? 'e20986fa-0fb9-4081-ae5d-35bc8f504df0' : targetMbrId;
    if (isSandbox || targetMbrId.startsWith('sandbox-')) {
      const saved = sessionStorage.getItem(`sandbox_settings_${realMbrId}`);
      if (saved) {
        try {
          setSettings(JSON.parse(saved));
          return;
        } catch {}
      }
      return;
    }
    try {
      const s = await mbrSettingsApi.getMemberSettings(realMbrId);
      if (s) {
        setSettings(s);
      }
    } catch {
      // If no settings found, defaults to show all
    }
  };

  const fetchStats = async (targetMbrId: string) => {
    if (!targetMbrId) return;
    const realMbrId = targetMbrId === 'm1' ? 'e20986fa-0fb9-4081-ae5d-35bc8f504df0' : targetMbrId;
    if (isSandbox || targetMbrId.startsWith('sandbox-')) {
      setMbrStat({
        statId: 'mock-stat-1',
        mbrId: realMbrId,
        statStoriesPublishedCnt: propProfile?.statStoriesPublishedCnt ?? propProfile?.chaptersCount ?? 5,
        statLastPublishedDt: propProfile?.statLastPublishedDt ?? propProfile?.statStoriesPublishedDt ?? '2026-08-15T14:30:00Z',
        statStoriesViewedCnt: propProfile?.statStoriesViewedCnt ?? 42
      });
      return;
    }
    try {
      const stat = await mbrStatApi.getMemberStatByMbrId(realMbrId);
      if (stat) {
        setMbrStat(stat);
      } else {
        setMbrStat(null);
      }
    } catch (err) {
      if (propProfile?.statStoriesPublishedCnt !== undefined) {
        setMbrStat({
          statId: 'prop-stat',
          mbrId: realMbrId,
          statStoriesPublishedCnt: propProfile.statStoriesPublishedCnt,
          statLastPublishedDt: propProfile.statLastPublishedDt ?? propProfile.statStoriesPublishedDt,
          statStoriesViewedCnt: propProfile.statStoriesViewedCnt ?? 0
        });
      } else {
        setMbrStat(null);
      }
    }
  };

  const loadProfileById = async (targetId: string) => {
    setLoading(true);
    try {
      const staticM = MEMBER_STORIES.find((m) => m.id === targetId);
      if (staticM) {
        setProfile({
          mbrId: staticM.id,
          mbrFirstName: staticM.name.split(' ')[0] || staticM.name,
          mbrLastName: staticM.name.split(' ').slice(1).join(' ') || '',
          mbrLivesCityState: staticM.location,
          mbrFromCityState: staticM.location,
          mbrIntroduction: staticM.excerpt,
          mbrProfilePic: staticM.avatarUrl,
          mbrCreatedAt: `${staticM.joinedDate}-01-01T00:00:00Z`
        });
        fetchStats(staticM.id);
        setLoading(false);
        return;
      }
      const mbr = await taskApi.getMemberById(targetId);
      if (mbr) {
        const cachedPic = sessionStorage.getItem(`session_pic_${mbr.mbrId}`);
        setProfile({
          ...mbr,
          mbrProfilePic: resolveMediaUrl(cachedPic || mbr.mbrProfilePic)
        });
        fetchGallery(mbr.mbrId);
        fetchStats(mbr.mbrId);
        fetchSettings(mbr.mbrId);
      }
    } catch (err) {
      console.error("Error loading member profile by ID:", err);
      const staticM = MEMBER_STORIES.find((m) => m.id === targetId);
      if (staticM) {
        setProfile({
          mbrId: staticM.id,
          mbrFirstName: staticM.name.split(' ')[0] || staticM.name,
          mbrLastName: staticM.name.split(' ').slice(1).join(' ') || '',
          mbrLivesCityState: staticM.location,
          mbrFromCityState: staticM.location,
          mbrIntroduction: staticM.excerpt,
          mbrProfilePic: staticM.avatarUrl,
          mbrCreatedAt: `${staticM.joinedDate}-01-01T00:00:00Z`
        });
        fetchStats(staticM.id);
        fetchSettings(staticM.id);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadAuthorProfile = async () => {
    setLoading(true);
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const u = JSON.parse(userStr);

      if (isSandbox) {
        // --- SANDBOX MODE ---
        const savedMbr = sessionStorage.getItem('sandbox_mbr');
        if (savedMbr) {
          const mbr = JSON.parse(savedMbr);
          setProfile(mbr);
          fetchGallery(mbr.mbrId);
          fetchStats(mbr.mbrId);
          fetchSettings(mbr.mbrId);
        } else {
          // Fallback Eleanor Hartwell template
          const defaultMbr = {
            mbrId: 'sandbox-id-eleanor',
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Hartwell',
            mbrMiddleName: 'Ruth',
            mbrBirthDate: '1961-10-14',
            mbrGenderCd: 'Female',
            mbrRelationshipStatusCd: 'Widowed',
            mbrLivesCityState: 'Portland, OR',
            mbrFromCityState: 'Coos Bay, OR',
            mbrWorkAt: 'Portland Public Schools',
            mbrStudiedAt: 'University of Oregon',
            mbrIntroduction: `The rain was different in those days — softer, somehow. We would run down to the docks without coats, our mother calling after us from the porch while the salt mist off Coos Bay clung to our hair.

She spent her childhood in the company of her grandfather, Harold, a taciturn man who had served in the Pacific and come home carrying something he never named. He taught Eleanor to fish, to mend nets, and to sit quietly with discomfort — lessons she would draw on for the rest of her life.

When Harold died the summer Eleanor turned twelve, she began writing. Not because anyone encouraged her, but because silence had to go somewhere. The chapters that follow are Eleanor's attempt to trace the invisible threads connecting her childhood on the Oregon coast to the woman she became: a schoolteacher, a gardener, a painter, and a grandmother.`,
            mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format',
            mbrCreatedAt: '2020-10-01T00:00:00Z'
          };
          setProfile(defaultMbr);
          fetchGallery(defaultMbr.mbrId);
          fetchStats(defaultMbr.mbrId);
          fetchSettings(defaultMbr.mbrId);
        }
      } else {
        // --- LIVE DATABASE MODE ---
        const mbr = await taskApi.getMemberByUserId(u.user_id);
        if (mbr) {
          // Resolve cached session avatar picture if present
          const cachedPic = sessionStorage.getItem(`session_pic_${mbr.mbrId}`);
          setProfile({
            ...mbr,
            mbrProfilePic: resolveMediaUrl(cachedPic || mbr.mbrProfilePic)
          });
          fetchGallery(mbr.mbrId);
          fetchStats(mbr.mbrId);
          fetchSettings(mbr.mbrId);
        }
      }
    } catch (err) {
      console.error("Error loading author profile for sidebar panel:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchGallery = async (targetMbrId: string) => {
    if (!targetMbrId) return;
    try {
      const media = await taskApi.getMemberMedia(targetMbrId);
      if (media && media.length > 0) {
        const profilePhotos = media.filter(
          (m) => (m.mbrMediaCategoryCd || '').toLowerCase() === 'profile'
        );
        setGalleryItems(profilePhotos);
      }
    } catch (err) {
      console.error("Error fetching gallery items for author profile:", err);
    }
  };

  // Active gallery list with fallback mock photos if database list is empty
  const activeGalleryItems = useMemo<MbrMedia[]>(() => {
    if (galleryItems.length > 0) {
      return galleryItems;
    }
    const mainPic = profile?.mbrProfilePic || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=600&fit=crop';
    return [
      {
        mbrMediaId: 'f1',
        mbrId: profile?.mbrId || 'mbr-1',
        mbrMediaPath: mainPic,
        mbrMediaOriginalFilename: 'Main_Profile_Avatar.jpg',
        mbrMediaDescription: 'Member Main Profile Avatar',
        mbrMediaCategoryCd: 'Profile'
      },
      {
        mbrMediaId: 'f2',
        mbrId: profile?.mbrId || 'mbr-1',
        mbrMediaPath: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=800&h=600&fit=crop',
        mbrMediaOriginalFilename: 'Family_Harbor_1965.jpg',
        mbrMediaDescription: 'Sunday mornings near the harbor in Coos Bay',
        mbrMediaCategoryCd: 'Profile'
      },
      {
        mbrMediaId: 'f3',
        mbrId: profile?.mbrId || 'mbr-1',
        mbrMediaPath: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&h=600&fit=crop',
        mbrMediaOriginalFilename: 'Oregon_Coastline.jpg',
        mbrMediaDescription: 'Walking along the coastal headlands',
        mbrMediaCategoryCd: 'Profile'
      },
      {
        mbrMediaId: 'f4',
        mbrId: profile?.mbrId || 'mbr-1',
        mbrMediaPath: 'https://images.unsplash.com/photo-1516541196182-6bdb0516ed27?w=800&h=600&fit=crop',
        mbrMediaOriginalFilename: 'Teaching_Classroom.jpg',
        mbrMediaDescription: 'Teaching years at Lincoln Elementary School',
        mbrMediaCategoryCd: 'Profile'
      }
    ];
  }, [galleryItems, profile]);

  const currentGalleryItem = activeGalleryItems[currentGalleryIndex] || activeGalleryItems[0];

  const handlePrevPhoto = () => {
    setIsEditingDescription(false);
    setCurrentGalleryIndex((prev) => (prev - 1 + activeGalleryItems.length) % activeGalleryItems.length);
  };

  const handleNextPhoto = () => {
    setIsEditingDescription(false);
    setCurrentGalleryIndex((prev) => (prev + 1) % activeGalleryItems.length);
  };

  const handleSavePhotoDescription = async () => {
    if (!currentGalleryItem?.mbrMediaId) return;
    setSavingDescription(true);
    try {
      const updatedDesc = editDescriptionInput.trim();
      if (!isSandbox && !currentGalleryItem.mbrMediaId.startsWith('f1') && !currentGalleryItem.mbrMediaId.startsWith('f2')) {
        await taskApi.updateMemberMedia(currentGalleryItem.mbrMediaId, {
          mbrMediaDescription: updatedDesc
        });
      }
      setGalleryItems((prev) =>
        prev.map((item) =>
          item.mbrMediaId === currentGalleryItem.mbrMediaId
            ? { ...item, mbrMediaDescription: updatedDesc }
            : item
        )
      );
      setIsEditingDescription(false);
    } catch (err: any) {
      console.error("Failed to update photo description:", err);
    } finally {
      setSavingDescription(false);
    }
  };

  // Keyboard navigation shortcuts
  useEffect(() => {
    if (!isGalleryModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setIsEditingDescription(false);
        setCurrentGalleryIndex((prev) => (prev + 1) % activeGalleryItems.length);
      } else if (e.key === 'ArrowLeft') {
        setIsEditingDescription(false);
        setCurrentGalleryIndex((prev) => (prev - 1 + activeGalleryItems.length) % activeGalleryItems.length);
      } else if (e.key === 'Escape') {
        setIsEditingDescription(false);
        setIsGalleryModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryModalOpen, activeGalleryItems.length]);

  if (loading) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex items-center justify-center min-h-[120px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-[10px] text-slate-400 font-serif">Loading author card...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] text-center text-xs text-slate-400 font-serif">
        Please complete your member profile settings to display your author card.
      </div>
    );
  }

  const firstName = profile.mbrFirstName || (profile.name ? profile.name.split(' ')[0] : '');
  const lastName = profile.mbrLastName || (profile.name ? profile.name.split(' ').slice(1).join(' ') : '');
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : (profile.name || firstName || lastName || 'Storybook Member');
  
  // Initials for avatar fallback
  const initials = (profile.mbrFirstName?.[0] || '') + (profile.mbrLastName?.[0] || '') || (profile.name ? profile.name.split(' ').map((w: string) => w[0]).join('').toUpperCase() : 'SB');

  // Calculate Age from mbrBirthDate
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
      return age;
    } catch (e) {
      return null;
    }
  };

  const age = calculateAge(profile.mbrBirthDate) ?? (isSandbox ? 64 : null);
  const livesIn = profile.mbrLivesCityState || profile.location || (isSandbox ? 'Portland, OR' : null);
  const fromLocation = profile.mbrFromCityState || (isSandbox ? 'Coos Bay, OR' : null);
  const worksAt = profile.mbrWorkAt || (isSandbox ? 'Lincoln Elementary School' : null);
  const studiedAt = profile.mbrStudiedAt || (isSandbox ? 'University of Oregon' : null);
  const relationshipStatus = profile.mbrRelationshipStatusCd || (isSandbox ? 'Widowed' : null);
  const introductionText = profile.mbrIntroduction || profile.excerpt;

  const formatPublishedDate = (dateStr?: string | null): string | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const publishedCount = mbrStat?.statStoriesPublishedCnt ?? profile?.statStoriesPublishedCnt ?? profile?.chaptersCount ?? (isSandbox ? 5 : 0);
  const rawLastPublishedDt = mbrStat?.statLastPublishedDt ?? profile?.statLastPublishedDt ?? profile?.statStoriesPublishedDt ?? (isSandbox ? '2026-08-15T14:30:00Z' : null);
  const lastPublishedFormatted = formatPublishedDate(rawLastPublishedDt);

  const isConnected = propIsConnected ?? profile?.isConnected ?? false;
  const connectionGrpName = propConnectionGrpName ?? profile?.connectionGrpName ?? profile?.grpName ?? '';
  const isSelf = Boolean(resolvedViewerId && profile?.mbrId && resolvedViewerId === profile.mbrId);

  // Settings visibility flags (if setting is FALSE, do not display label & value)
  const showBirthYr = settings ? settings.mbrSettingsShowBirthYr !== false : true;
  const showGender = settings ? settings.mbrSettingsShowGender !== false : true;
  const showRelationship = settings ? settings.mbrSettingsShowRelationship !== false : true;
  const showTown = settings ? settings.mbrSettingsShowTown !== false : true;
  const showWorksAt = settings ? settings.mbrSettingsShowWorksAt !== false : true;
  const showStudiedAt = settings ? settings.mbrSettingsShowStudiedAt !== false : true;
  const showIntroduction = settings ? settings.mbrSettingsShowIntroduction !== false : true;
  const showPhotoGallery = settings ? settings.mbrSettingsShowPhotoGallery !== false : true;

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      {/* Top Header & Metadata Block */}
      <div className="flex items-start gap-4">
        {/* Avatar image */}
        <div className="relative w-14 h-14 md:w-16 md:h-16 shrink-0 mt-0.5">
          {profile.mbrProfilePic ? (
            <img
              src={profile.mbrProfilePic}
              alt={fullName}
              className="w-full h-full rounded-2xl object-cover border border-[#EFECE7] shadow-xs"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-serif text-slate-700 font-bold text-xl">
              {initials}
            </div>
          )}
        </div>

        {/* Name & Metadata Rows Column */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center justify-between gap-2">
            <h2 className="font-serif text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight">
              {fullName}
            </h2>

            {/* Photo Gallery Icon Button */}
            {showPhotoGallery && (
              <button
                type="button"
                onClick={() => {
                  setCurrentGalleryIndex(0);
                  setIsGalleryModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-xs shrink-0"
                title="Open Photo Gallery"
              >
                <Images className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline font-sans text-xs">Photo Gallery</span>
              </button>
            )}
          </div>

          {/* Metadata Rows */}
          <div className="space-y-1.5 text-xs">
            {/* Lives In & From */}
            {showTown && (livesIn || fromLocation) && (
              <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-slate-700">
                {livesIn && (
                  <div className="flex items-center gap-1.5">
                    <Home className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">LIVES IN:</span>
                    <span className="font-semibold text-slate-800">{livesIn}</span>
                  </div>
                )}
                {livesIn && fromLocation && (
                  <span className="text-slate-300 font-bold select-none">•</span>
                )}
                {fromLocation && (
                  <div className="flex items-center gap-1.5">
                    <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">FROM:</span>
                    <span className="font-semibold text-slate-800">{fromLocation}</span>
                  </div>
                )}
              </div>
            )}

            {/* Works At */}
            {showWorksAt && worksAt && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">WORKS AT:</span>
                <span className="font-semibold text-slate-800">{worksAt}</span>
              </div>
            )}

            {/* Studied At */}
            {showStudiedAt && studiedAt && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">STUDIED AT:</span>
                <span className="font-semibold text-slate-800">{studiedAt}</span>
              </div>
            )}

            {/* Relationship Status, Gender & Age */}
            {((showRelationship && relationshipStatus) || (showGender && profile.mbrGenderCd) || (showBirthYr && age !== null)) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
                {showRelationship && relationshipStatus && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">RELATIONSHIP STATUS:</span>
                    <span className="font-semibold text-slate-800">{relationshipStatus}</span>
                  </div>
                )}
                {showGender && profile.mbrGenderCd && (
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-violet-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">GENDER:</span>
                    <span className="font-semibold text-slate-800">{profile.mbrGenderCd}</span>
                  </div>
                )}
                {showBirthYr && age !== null && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">AGE:</span>
                    <span className="font-semibold text-slate-800">{age}</span>
                  </div>
                )}
              </div>
            )}

            {/* Story Publication Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">STORIES PUBLISHED:</span>
                <span className="font-semibold text-slate-800">{publishedCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">LAST PUBLISHED:</span>
                <span className="font-semibold text-slate-800">{lastPublishedFormatted || 'None'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Divider and Collapsible Accordion Introduction Section */}
      {showIntroduction && introductionText && (
        <div className="pt-3 border-t border-[#EFECE7]">
          {/* Accordion Header Button */}
          <button
            type="button"
            onClick={toggleIntroAccordion}
            className="w-full flex items-center justify-between py-1 text-left cursor-pointer group"
          >
            <div className="flex items-center gap-1.5 text-xs font-serif font-bold text-slate-700 group-hover:text-slate-900 transition-colors">
              <BookOpen className="w-3.5 h-3.5 text-blue-500" />
              <span>Introduction</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
              <span>{isIntroCollapsed ? 'Expand' : 'Collapse'}</span>
              {isIntroCollapsed ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              ) : (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform" />
              )}
            </div>
          </button>

          {/* Accordion Body with Smooth Animation */}
          <AnimatePresence initial={false}>
            {!isIntroCollapsed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="overflow-hidden pt-2"
              >
                <div className="pl-3.5 border-l-2 border-slate-500 max-h-60 overflow-y-auto pr-1">
                  <p className="text-slate-600 font-serif leading-relaxed text-xs md:text-sm italic whitespace-pre-line">
                    "{introductionText}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Photo Gallery Reusable Modal Dialog */}
      {profile?.mbrId && (
        <MbrPhotoGalleryPanel
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          mbrId={profile.mbrId}
          categoryCd="Profile"
          categoryTitle="Profile"
          isSandbox={isSandbox}
          maxPhotos={20}
          readOnly={readOnly}
        />
      )}

      {/* Connect Modal Dialog */}
      {profile?.mbrId && (
        <MbrConnectPanel
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          targetMember={profile}
          viewerMbrId={resolvedViewerId}
          onSuccess={() => {
            setRequestSent(true);
            if (onConnectSuccess) {
              onConnectSuccess();
            }
          }}
        />
      )}

      {/* --- LOWER ACTION BAR (Connection Status/Action on Left, Read Story on Right) --- */}
      <div className="pt-3 border-t border-[#EFECE7] flex items-center justify-between gap-3">
        {/* LOWER LEFT: Connection Icon & Group Name OR Connect Button */}
        <div className="flex items-center min-h-[32px]">
          {isSelf ? null : isConnected ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50/95 text-emerald-800 border border-emerald-200/90 rounded-xl text-xs font-serif shadow-2xs transition-all hover:bg-emerald-100/90"
              title={connectionGrpName ? `Connection Group: ${connectionGrpName}` : 'Connected Member'}
            >
              <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="font-semibold text-xs tracking-tight">
                {connectionGrpName ? connectionGrpName : 'Connected'}
              </span>
            </div>
          ) : requestSent ? (
            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-xs font-serif shadow-2xs"
              title="Connection request sent"
            >
              <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="font-semibold text-xs tracking-tight">Inquiry Sent</span>
            </div>
          ) : showConnectButton ? (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsConnectModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-xs font-serif font-semibold shadow-2xs hover:shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
              title="Connect with this member"
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Connect</span>
            </button>
          ) : null}
        </div>

        {/* LOWER RIGHT: Read Story Button */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const targetMbrId = profile?.mbrId || profile?.id || memberId || '';
            if (onClickReadStory && targetMbrId) {
              onClickReadStory(targetMbrId);
            } else if (targetMbrId) {
              window.dispatchEvent(new CustomEvent('open-member-story', { detail: { memberId: targetMbrId } }));
            }
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-serif font-bold rounded-xl shadow-xs hover:shadow transition-all duration-150 cursor-pointer active:scale-95 group shrink-0"
          title="Read member's public story"
        >
          <BookOpen className="w-3.5 h-3.5 text-blue-200 group-hover:text-white transition-colors" />
          <span>Read Story</span>
          <ChevronRight className="w-3 h-3 text-blue-200 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      <AdminComponentTag name="mbrProfilePanel" />
    </div>
  );
}

export { MbrProfilePanel, MbrProfilePanel as mbrProfilePanel, MbrProfilePanel as SbMbrProfilePanel };

