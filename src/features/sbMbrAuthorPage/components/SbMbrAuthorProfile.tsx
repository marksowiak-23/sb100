import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Home, Compass, Briefcase, GraduationCap, Calendar, Heart, Loader2, ChevronDown, ChevronUp, BookOpen, Images, ChevronLeft, ChevronRight, X, Edit3, Save } from 'lucide-react';
import { taskApi, resolveMediaUrl, MbrMedia } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import SbPhotoGalleryModal from '@/src/components/SbPhotoGalleryModal';

interface SbMbrAuthorProfileProps {
  isSandbox: boolean;
}

export default function SbMbrAuthorProfile({ isSandbox }: SbMbrAuthorProfileProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [galleryItems, setGalleryItems] = useState<MbrMedia[]>([]);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [currentGalleryIndex, setCurrentGalleryIndex] = useState(0);

  // --- PHOTO DESCRIPTION EDIT STATE ---
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [editDescriptionInput, setEditDescriptionInput] = useState('');
  const [savingDescription, setSavingDescription] = useState(false);

  // Session storage state for introduction accordion panel collapse persistence
  const [isIntroCollapsed, setIsIntroCollapsed] = useState<boolean>(() => {
    return sessionStorage.getItem('author_intro_collapsed') === 'true';
  });

  const toggleIntroAccordion = () => {
    setIsIntroCollapsed((prev) => {
      const nextState = !prev;
      sessionStorage.setItem('author_intro_collapsed', String(nextState));
      return nextState;
    });
  };

  useEffect(() => {
    loadAuthorProfile();
  }, [isSandbox]);

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

  const fullName = `${profile.mbrFirstName} ${profile.mbrMiddleName ? profile.mbrMiddleName + ' ' : ''}${profile.mbrLastName}`;
  
  // Initials for avatar fallback
  const initials = (profile.mbrFirstName?.[0] || '') + (profile.mbrLastName?.[0] || '').toUpperCase();

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
  const livesIn = profile.mbrLivesCityState || (isSandbox ? 'Portland, OR' : null);
  const fromLocation = profile.mbrFromCityState || (isSandbox ? 'Coos Bay, OR' : null);
  const worksAt = profile.mbrWorkAt || (isSandbox ? 'Lincoln Elementary School' : null);
  const studiedAt = profile.mbrStudiedAt || (isSandbox ? 'University of Oregon' : null);
  const relationshipStatus = profile.mbrRelationshipStatusCd || (isSandbox ? 'Widowed' : null);

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
          </div>

          {/* Metadata Rows */}
          <div className="space-y-1.5 text-xs">
            {/* Lives In & From */}
            {(livesIn || fromLocation) && (
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
            {worksAt && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Briefcase className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">WORKS AT:</span>
                <span className="font-semibold text-slate-800">{worksAt}</span>
              </div>
            )}

            {/* Studied At */}
            {studiedAt && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">STUDIED AT:</span>
                <span className="font-semibold text-slate-800">{studiedAt}</span>
              </div>
            )}

            {/* Relationship Status & Age */}
            {(relationshipStatus || age !== null) && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700">
                {relationshipStatus && (
                  <div className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">RELATIONSHIP STATUS:</span>
                    <span className="font-semibold text-slate-800">{relationshipStatus}</span>
                  </div>
                )}
                {age !== null && (
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">AGE:</span>
                    <span className="font-semibold text-slate-800">{age}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Divider and Collapsible Accordion Introduction Section */}
      {profile.mbrIntroduction && (
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
                    "{profile.mbrIntroduction}"
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Photo Gallery Reusable Modal Dialog */}
      {profile?.mbrId && (
        <SbPhotoGalleryModal
          isOpen={isGalleryModalOpen}
          onClose={() => setIsGalleryModalOpen(false)}
          mbrId={profile.mbrId}
          categoryCd="Profile"
          categoryTitle="Profile"
          isSandbox={isSandbox}
          maxPhotos={20}
        />
      )}

      <AdminComponentTag name="SbMbrAuthorProfile" />
    </div>
  );
}
