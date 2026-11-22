/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Camera,
  Wand2,
  Film,
  Images,
  CheckSquare
} from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { eventApi, taskApi } from '@/src/services/api';

export interface MbrAuthorAiPhotoPanelProps {
  onOpenImageCredits?: () => void;
  className?: string;
  memberId?: string;
  isSandbox?: boolean;
}

export type mbrAuthorAiPhotoPanelProps = MbrAuthorAiPhotoPanelProps;

export default function MbrAuthorAiPhotoPanel({
  onOpenImageCredits,
  className = '',
  memberId,
  isSandbox = false,
}: MbrAuthorAiPhotoPanelProps) {
  const [imageCreditBalance, setImageCreditBalance] = useState<number>(0);

  const loadImageCreditBalance = useCallback(async () => {
    try {
      let resolvedId = memberId || '';
      if (!resolvedId) {
        try {
          const mbrStr = sessionStorage.getItem('sb_current_mbr') || sessionStorage.getItem('mbr') || sessionStorage.getItem('sandbox_mbr');
          if (mbrStr) {
            const parsed = JSON.parse(mbrStr);
            if (parsed?.mbrId) resolvedId = parsed.mbrId;
          }
        } catch {}
      }
      if (!resolvedId) {
        try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            if (u?.mbrId || u?.mbr_id) {
              resolvedId = u.mbrId || u.mbr_id;
            } else if (!isSandbox && (u?.user_id || u?.id)) {
              const profile = await taskApi.getMemberByUserId(u.user_id || u.id).catch(() => null);
              if (profile?.mbrId) resolvedId = profile.mbrId;
            }
          }
        } catch {}
      }
      if (!resolvedId) {
        setImageCreditBalance(0);
        return;
      }

      if (isSandbox) {
        const savedAcctStr = sessionStorage.getItem(`sandbox_mbr_acct_${resolvedId}`);
        if (savedAcctStr) {
          const parsedAcct = JSON.parse(savedAcctStr);
          setImageCreditBalance(Number(parsedAcct?.mbrAcctImageCreditBalance ?? 0));
          return;
        }
        setImageCreditBalance(0);
        return;
      }

      const acct = await taskApi.getMemberAccount(resolvedId).catch(() => null);
      setImageCreditBalance(Number(acct?.mbrAcctImageCreditBalance ?? 0));
    } catch {
      setImageCreditBalance(0);
    }
  }, [memberId, isSandbox]);

  useEffect(() => {
    void loadImageCreditBalance();
    const handleRefresh = () => {
      void loadImageCreditBalance();
    };
    window.addEventListener('credits-updated', handleRefresh);
    window.addEventListener('user-switched', handleRefresh);
    return () => {
      window.removeEventListener('credits-updated', handleRefresh);
      window.removeEventListener('user-switched', handleRefresh);
    };
  }, [loadImageCreditBalance]);

  const hasImageCredits = imageCreditBalance > 0;
  const handleExploreImageStudio = () => {
    eventApi
      .logEvent({
        eventSiteCd: 'SB',
        eventActorId: memberId || undefined,
        eventActorTypeCd: 'MBR',
        eventCd: 'AUTHOR_AI_PHOTO_PANEL_OPEN',
        eventDetail: 'Member clicked Explore AI Photo Studio from the Author page right column',
        eventTagValue: {
          source: 'AuthorPage',
          component: 'mbrAuthorAiPhotoPanel',
          targetTab: 'image-credits',
        },
      })
      .catch((err) => console.warn('Could not log AUTHOR_AI_PHOTO_PANEL_OPEN event:', err));

    if (onOpenImageCredits) {
      onOpenImageCredits();
    } else {
      window.dispatchEvent(
        new CustomEvent('open-member-account', {
          detail: { subTab: 'image-credits' },
        })
      );
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      requestAnimationFrame(() => {
        window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#F4FBF9] via-[#EDF8F5] to-[#E2F3EC]/85 dark:from-teal-950/40 dark:via-slate-900 dark:to-emerald-950/40 border border-teal-200/80 dark:border-teal-800/60 hover:border-teal-400/80 dark:hover:border-teal-600/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(13,148,136,0.07)] hover:shadow-[0_12px_28px_rgba(13,148,136,0.14)] transition-all duration-300 flex flex-col gap-3.5 relative overflow-hidden group ${className}`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-teal-200/45 dark:bg-teal-700/20 rounded-full blur-2xl pointer-events-none group-hover:bg-teal-300/55 transition-colors" />

      {/* Header Badge Row */}
      <div className="flex items-center justify-between relative z-10">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-serif font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 bg-teal-100/90 dark:bg-teal-900/50 px-2.5 py-0.5 rounded-full border border-teal-200/80 dark:border-teal-700/60">
          <Sparkles className="w-3 h-3 text-teal-600 dark:text-teal-300" />
          AI Photo Studio
        </span>
        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-teal-700/90 dark:text-teal-300">
          <Images className="w-3.5 h-3.5" />
          2K &amp; Living Photos
        </span>
      </div>

      {/* Stylized Mini-Gallery Visual Banner */}
      <div className="relative z-10 rounded-2xl bg-gradient-to-r from-teal-950 via-emerald-950 to-slate-900 border border-teal-300/40 dark:border-teal-700/60 px-3.5 py-4 flex items-center justify-between gap-3 shadow-sm overflow-hidden">
        {/* Ambient radial highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.24),transparent_70%)] pointer-events-none" />

        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-teal-200 flex items-center justify-center shrink-0 backdrop-blur-xs relative z-10">
          <Camera className="w-5 h-5" />
        </div>

        {/* Fanned 3-Photo Triptych Graphic */}
        <div className="flex-1 flex items-center justify-center gap-1.5 relative z-10" aria-hidden="true">
          <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-amber-300/85 via-orange-400/75 to-rose-400/70 border border-white/40 shadow-md -rotate-6 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white/90" />
          </div>
          <div className="w-14 h-10 rounded-lg bg-gradient-to-br from-teal-300 via-emerald-400 to-sky-500 border-2 border-white/70 shadow-lg scale-105 z-10 flex items-center justify-center">
            <Wand2 className="w-4 h-4 text-white" />
          </div>
          <div className="w-12 h-9 rounded-lg bg-gradient-to-br from-indigo-400/85 via-purple-400/80 to-teal-300/80 border border-white/40 shadow-md rotate-6 flex items-center justify-center">
            <Film className="w-4 h-4 text-white/90" />
          </div>
        </div>

        <span className="relative z-10 px-2 py-0.5 rounded-md bg-amber-400/20 border border-amber-300/40 text-[9px] font-mono font-bold text-amber-200 uppercase tracking-wider shrink-0">
          6 Scenes
        </span>
      </div>

      {/* Editorial Copy */}
      <div className="space-y-1.5 relative z-10">
        <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white leading-snug">
          Every Story Shines Brighter with Imagery
        </h3>
        <p className="font-serif text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Photographs anchor your memories and draw family deeper into every chapter. Upload your own treasured snapshots anytime—and whenever a photo was never taken or lost over the years, open <strong className="font-semibold text-teal-900 dark:text-teal-200">Photo Layout &rarr; AI Photo Generation</strong> in the Story Editor to craft 6 crisp 2K scenes, refine them in chat, and animate Living Photos.
        </p>
      </div>

      {/* Feature Highlights Strip */}
      <div className="flex items-center gap-1.5 flex-wrap relative z-10">
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-white/80 dark:bg-slate-800/80 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
          2K Clarity
        </span>
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-white/80 dark:bg-slate-800/80 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
          Chat Refinement
        </span>
        <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-semibold bg-white/80 dark:bg-slate-800/80 text-teal-800 dark:text-teal-300 border border-teal-200/70 dark:border-teal-800">
          Living Motion
        </span>
      </div>

      {/* Action CTA Button / Ready Indicator */}
      {hasImageCredits ? (
        <div
          className="relative z-10 w-full py-2.5 px-3.5 rounded-xl text-xs font-serif font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/70 flex items-center justify-center gap-2 shadow-2xs"
          title={`You have ${imageCreditBalance.toLocaleString()} AI Image Credits available`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>AI Image Feature Ready</span>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleExploreImageStudio}
          className="relative z-10 w-full py-2.5 px-3.5 rounded-xl text-xs font-serif font-bold transition-all shadow-xs bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
          title="Go to My Account → My Image Credits"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Get AI Image Credits</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      <AdminComponentTag name="mbrAuthorAiPhotoPanel" />
    </div>
  );
}

export { MbrAuthorAiPhotoPanel as mbrAuthorAiPhotoPanel };
