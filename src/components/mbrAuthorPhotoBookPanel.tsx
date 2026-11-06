/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Camera,
  Sparkles,
  ArrowRight,
  Images
} from 'lucide-react';
import { taskApi, resolveMediaUrl } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrAuthorPhotoBookPanelProps {
  onOpenPhotoBook?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  memberId?: string;
}

export type SbPhotoBookPanelProps = MbrAuthorPhotoBookPanelProps;
export type mbrAuthorPhotoBookPanelProps = MbrAuthorPhotoBookPanelProps;

// Curated vintage heirloom fallback previews
const FALLBACK_PREVIEWS = [
  'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80'
];

export default function MbrAuthorPhotoBookPanel({
  onOpenPhotoBook,
  title = 'Heirloom Photo Book',
  description = 'Collect, curate, and arrange cherished photographs with narratives into timeless chapters.',
  buttonText = 'Open Photo Book',
  memberId
}: MbrAuthorPhotoBookPanelProps) {
  const [displayPreviews, setDisplayPreviews] = useState<string[]>(FALLBACK_PREVIEWS);

  useEffect(() => {
    let resolvedMbrId = memberId;
    if (!resolvedMbrId) {
      try {
        const storedMbr = sessionStorage.getItem('selectedMember');
        if (storedMbr) {
          const parsed = JSON.parse(storedMbr);
          if (parsed?.mbrId) resolvedMbrId = parsed.mbrId;
        }
      } catch {}
    }
    if (!resolvedMbrId) {
      try {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          if (u.user_id) {
            taskApi.getMemberByUserId(u.user_id).then((m) => {
              if (m?.mbrId) fetchPanelData(m.mbrId);
            }).catch(() => {});
            return;
          }
        }
      } catch {}
    }

    if (resolvedMbrId) {
      fetchPanelData(resolvedMbrId);
    }
  }, [memberId]);

  const fetchPanelData = async (mbrId: string) => {
    try {
      const media = await taskApi.getMemberMedia(mbrId, { excludeAudio: true }).catch(() => []);

      // Collect up to 3 real photos if available
      const realUrls: string[] = [];
      if (Array.isArray(media) && media.length > 0) {
        for (let i = 0; i < Math.min(media.length, 3); i++) {
          if (media[i]?.mbrMediaPath) {
            realUrls.push(resolveMediaUrl(media[i].mbrMediaPath));
          }
        }
      }
      if (realUrls.length >= 2) {
        setDisplayPreviews(realUrls);
      } else {
        setDisplayPreviews(FALLBACK_PREVIEWS);
      }
    } catch {
      // Fallback stays in place
    }
  };

  const handleOpen = () => {
    if (onOpenPhotoBook) {
      onOpenPhotoBook();
    } else {
      window.dispatchEvent(new CustomEvent('open-photo-book'));
    }
  };

  return (
    <div className="bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5ECE0]/80 border border-[#E8DEC9] hover:border-amber-400/80 rounded-3xl p-5 shadow-[0_8px_24px_rgba(180,120,60,0.06)] hover:shadow-[0_12px_28px_rgba(180,120,60,0.12)] transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-200/35 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-300/45 transition-colors" />

      {/* Top Header Section */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#EDE4D4]/90 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-2xl bg-amber-100 text-amber-900 border border-amber-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
            <Camera className="w-4 h-4 text-amber-800" />
          </div>
          <div>
            <h3 className="font-serif text-sm font-bold text-slate-900 group-hover:text-amber-950 transition-colors leading-tight">
              {title}
            </h3>
            <span className="text-[10px] font-serif text-amber-800 font-semibold flex items-center gap-1 mt-0.5">
              <Sparkles className="w-2.5 h-2.5 text-amber-600" /> Heirloom Albums & Stories
            </span>
          </div>
        </div>

        <span className="text-[9px] font-serif font-bold uppercase tracking-wider text-amber-900 bg-amber-200/60 px-2 py-0.5 rounded-full border border-amber-300/70">
          Studio
        </span>
      </div>

      {/* Interactive Polaroid Snapshot Showcase */}
      <div
        onClick={handleOpen}
        className="relative py-2 flex items-center justify-center cursor-pointer group/polaroid select-none"
        title="Click to open your Photo Book"
      >
        <div className="flex items-center justify-center h-28 w-full max-w-[240px]">
          {/* Left Photo (Tilted Left) */}
          <div className="w-20 h-24 bg-white p-1 pb-3 rounded-xl shadow-md border border-[#EAE3D2] -rotate-8 -mr-5 group-hover/polaroid:-rotate-12 group-hover/polaroid:-translate-x-1 transition-all duration-300 z-10">
            <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-200">
              <img
                src={displayPreviews[0] || FALLBACK_PREVIEWS[0]}
                alt="Preview 1"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-1 h-1.5 w-8 bg-amber-100/70 rounded-full mx-auto" />
          </div>

          {/* Center Elevated Photo */}
          <div className="w-22 h-26 bg-white p-1 pb-4 rounded-xl shadow-lg border border-[#E4DCB6] scale-105 z-20 group-hover/polaroid:scale-110 group-hover/polaroid:-translate-y-1 transition-all duration-300">
            <div className="w-full h-18 rounded-lg overflow-hidden bg-slate-200 relative">
              <img
                src={displayPreviews[1] || FALLBACK_PREVIEWS[1]}
                alt="Preview 2"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover/polaroid:opacity-100 transition-opacity flex items-end justify-center pb-1">
                <span className="text-[9px] font-serif font-bold text-white drop-shadow-xs">Explore</span>
              </div>
            </div>
            <div className="mt-1.5 h-1.5 w-10 bg-amber-200/80 rounded-full mx-auto" />
          </div>

          {/* Right Photo (Tilted Right) */}
          <div className="w-20 h-24 bg-white p-1 pb-3 rounded-xl shadow-md border border-[#EAE3D2] rotate-8 -ml-5 group-hover/polaroid:rotate-12 group-hover/polaroid:translate-x-1 transition-all duration-300 z-10">
            <div className="w-full h-16 rounded-lg overflow-hidden bg-slate-200">
              <img
                src={displayPreviews[2] || FALLBACK_PREVIEWS[2]}
                alt="Preview 3"
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            <div className="mt-1 h-1.5 w-8 bg-amber-100/70 rounded-full mx-auto" />
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-650 leading-relaxed font-serif">
        {description}
      </p>

      {/* Rich Primary Action Button */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-800 via-amber-850 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-2xs hover:shadow-md flex items-center justify-center gap-2 cursor-pointer group/btn"
      >
        <Images className="w-3.5 h-3.5 text-amber-200 group-hover/btn:scale-110 transition-transform" />
        <span>{buttonText}</span>
        <ArrowRight className="w-3.5 h-3.5 text-amber-300 group-hover/btn:translate-x-1 transition-transform" />
      </button>

      <AdminComponentTag name="mbrAuthorPhotoBookPanel" />
    </div>
  );
}

export { MbrAuthorPhotoBookPanel, MbrAuthorPhotoBookPanel as mbrAuthorPhotoBookPanel, MbrAuthorPhotoBookPanel as SbPhotoBookPanel };
