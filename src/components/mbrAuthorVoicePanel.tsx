/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Sparkles, ArrowRight, Volume2, Lock, Play, Pause, Loader2, CheckSquare, CreditCard } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { eventApi, taskApi, mbrVoiceProfileApi, MEDIA_API_BASE_URL, resolveMediaUrl } from '@/src/services/api';
import { useMemberCredits } from '@/src/services/creditBalanceService';
import ExhaustedCreditsModal from '@/src/components/ExhaustedCreditsModal';

export interface MbrAuthorVoicePanelProps {
  onOpenVoiceTranslation?: () => void;
  className?: string;
  memberId?: string;
  isSandbox?: boolean;
}

export type mbrAuthorVoicePanelProps = MbrAuthorVoicePanelProps;

const WAVEFORM_BARS = [35, 68, 52, 90, 74, 42, 85, 100, 62, 48, 78, 56, 38, 64, 44];
const VOICE_PANEL_NARRATION_OBJECT = 'site/audio/author_voice_panel_narration.wav';

export default function MbrAuthorVoicePanel({
  onOpenVoiceTranslation,
  className = '',
  memberId,
  isSandbox = false,
}: MbrAuthorVoicePanelProps) {
  const { isExhausted: hasExhaustedCredits } = useMemberCredits(memberId);
  const [showExhaustedCreditsModal, setShowExhaustedCreditsModal] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);
  const [hasReadyVoiceProfile, setHasReadyVoiceProfile] = useState<boolean>(false);
  const [voiceCreditBalance, setVoiceCreditBalance] = useState<number>(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const loadVoiceReadiness = useCallback(async () => {
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
        setHasReadyVoiceProfile(false);
        setVoiceCreditBalance(0);
        return;
      }

      if (isSandbox) {
        let ready = false;
        const savedProfileStr = sessionStorage.getItem(`sandbox_voice_profile_${resolvedId}`);
        if (savedProfileStr) {
          try {
            const parsedProfile = JSON.parse(savedProfileStr);
            ready = (parsedProfile?.voiceStatusCd || '').trim().toUpperCase() === 'READY';
          } catch {}
        }
        let bal = 0;
        const savedAcctStr = sessionStorage.getItem(`sandbox_mbr_acct_${resolvedId}`);
        if (savedAcctStr) {
          try {
            const parsedAcct = JSON.parse(savedAcctStr);
            bal = Number(parsedAcct?.mbrAcctVoiceCreditBalance ?? 0);
          } catch {}
        }
        setHasReadyVoiceProfile(ready);
        setVoiceCreditBalance(bal);
        return;
      }

      // Batch voice profile & account balance concurrently
      const [profiles, acct] = await Promise.all([
        mbrVoiceProfileApi.getMemberVoiceProfiles(resolvedId, true).catch(() => []),
        taskApi.getMemberAccount(resolvedId).catch(() => null),
      ]);

      const isReady = Array.isArray(profiles) && profiles.some(
        (p) => (p?.voiceStatusCd || '').trim().toUpperCase() === 'READY'
      );
      setHasReadyVoiceProfile(isReady);
      setVoiceCreditBalance(Number(acct?.mbrAcctVoiceCreditBalance ?? 0));
    } catch {
      setHasReadyVoiceProfile(false);
      setVoiceCreditBalance(0);
    }
  }, [memberId, isSandbox]);

  useEffect(() => {
    void loadVoiceReadiness();
    const handleRefresh = () => {
      void loadVoiceReadiness();
    };
    window.addEventListener('credits-updated', handleRefresh);
    window.addEventListener('user-switched', handleRefresh);
    return () => {
      window.removeEventListener('credits-updated', handleRefresh);
      window.removeEventListener('user-switched', handleRefresh);
    };
  }, [loadVoiceReadiness]);

  const hasVoiceCredits = voiceCreditBalance > 0;

  const handleGoToVoiceCredits = () => {
    eventApi.logEvent({
      eventSiteCd: 'SB',
      eventActorId: memberId || undefined,
      eventActorTypeCd: 'MBR',
      eventCd: 'AUTHOR_VOICE_CREDITS_OPEN',
      eventDetail: 'Member clicked Get AI Voice Credits from the Author page right column',
      eventTagValue: {
        source: 'AuthorPage',
        component: 'mbrAuthorVoicePanel',
        targetTab: 'voice-credits',
      },
    }).catch((err) => console.warn('Could not log AUTHOR_VOICE_CREDITS_OPEN event:', err));

    window.dispatchEvent(
      new CustomEvent('open-member-account', {
        detail: { subTab: 'voice-credits' },
      })
    );
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
  };

  const narrationUrl = resolveMediaUrl(`${MEDIA_API_BASE_URL}/media/read/${VOICE_PANEL_NARRATION_OBJECT}`);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const handleTogglePlayNarration = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (audioRef.current && isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }

    try {
      setIsLoadingAudio(true);
      if (!audioRef.current) {
        const audio = new Audio(narrationUrl);
        audio.onended = () => setIsPlaying(false);
        audio.onpause = () => setIsPlaying(false);
        audio.onplaying = () => {
          setIsLoadingAudio(false);
          setIsPlaying(true);
        };
        audio.onerror = () => {
          setIsLoadingAudio(false);
          setIsPlaying(false);
        };
        audioRef.current = audio;
      }

      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn('Unable to play author voice panel narration:', err);
      setIsPlaying(false);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  const handleOpenVoiceStudio = () => {
    if (hasExhaustedCredits) {
      setShowExhaustedCreditsModal(true);
      return;
    }

    eventApi.logEvent({
      eventSiteCd: 'SB',
      eventActorId: memberId || undefined,
      eventActorTypeCd: 'MBR',
      eventCd: 'AUTHOR_VOICE_PANEL_OPEN',
      eventDetail: 'Member clicked Set Up My AI Voice from the Author page right column',
      eventTagValue: {
        source: 'AuthorPage',
        component: 'mbrAuthorVoicePanel',
        targetTab: 'voice-translation',
      },
    }).catch((err) => console.warn('Could not log AUTHOR_VOICE_PANEL_OPEN event:', err));

    if (onOpenVoiceTranslation) {
      onOpenVoiceTranslation();
    } else {
      window.dispatchEvent(
        new CustomEvent('open-member-profile', {
          detail: { subTab: 'voice-translation' },
        })
      );
    }
  };

  return (
    <div
      className={`bg-gradient-to-br from-[#FBF9FF] via-[#F6F1FE] to-[#EDE5FB]/85 dark:from-purple-950/40 dark:via-slate-900 dark:to-indigo-950/40 border border-purple-200/80 dark:border-purple-800/60 hover:border-purple-400/80 dark:hover:border-purple-600/80 rounded-3xl p-4 sm:p-5 shadow-[0_8px_24px_rgba(124,58,237,0.07)] hover:shadow-[0_12px_28px_rgba(124,58,237,0.14)] transition-all duration-300 flex flex-col gap-3.5 relative overflow-hidden group ${className}`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-200/40 dark:bg-purple-700/20 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-300/50 transition-colors" />

      {/* Header Badge Row */}
      <div className="flex items-center justify-between relative z-10">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-serif font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200 bg-purple-100/90 dark:bg-purple-900/50 px-2.5 py-0.5 rounded-full border border-purple-200/80 dark:border-purple-700/60">
          <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-300" />
          AI Voice Studio
        </span>
        {hasExhaustedCredits ? (
          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-900">
            0 Credits
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-purple-700/90 dark:text-purple-300">
            <Volume2 className="w-3.5 h-3.5" />
            Audio Stories
          </span>
        )}
      </div>

      {/* Stylized Header Visual Waveform with Play Overlay */}
      <div className="relative z-10 rounded-2xl bg-gradient-to-r from-purple-950 via-indigo-950 to-purple-900 border border-purple-300/40 dark:border-purple-700/60 px-3.5 py-4 flex items-center gap-3 shadow-sm overflow-hidden">
        {/* Ambient radial highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(192,132,252,0.28),transparent_70%)] pointer-events-none" />

        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-purple-200 flex items-center justify-center shrink-0 backdrop-blur-xs">
          <Mic className="w-5 h-5" />
        </div>

        <div className="flex-1 flex items-center justify-between gap-1 h-9 px-1 opacity-85" aria-hidden="true">
          {WAVEFORM_BARS.map((height, idx) => (
            <span
              key={idx}
              style={{
                height: `${height}%`,
                animationDelay: isPlaying ? `${idx * 70}ms` : undefined,
              }}
              className={`w-1 rounded-full bg-gradient-to-t from-purple-400 via-indigo-300 to-fuchsia-300 transition-all ${
                isPlaying ? 'animate-pulse' : ''
              }`}
            />
          ))}
        </div>

        {/* Centered Play / Pause Icon Overlay over the Header Visual */}
        <button
          type="button"
          onClick={handleTogglePlayNarration}
          aria-label={isPlaying ? 'Pause AI Voice Narration Sample' : 'Play AI Voice Narration Sample'}
          title={isPlaying ? 'Pause Deep Male AI Voice Sample' : 'Listen to Deep Male AI Voice Sample'}
          className={`absolute inset-0 m-auto w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-lg backdrop-blur-sm ${
            isPlaying
              ? 'bg-purple-600/95 text-white ring-4 ring-purple-300/60 scale-105'
              : 'bg-white/95 hover:bg-white text-purple-700 hover:text-purple-900 ring-4 ring-purple-400/35 hover:ring-purple-300/60 hover:scale-110'
          }`}
        >
          {isLoadingAudio ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : isPlaying ? (
            <Pause className="w-5 h-5 fill-current" />
          ) : (
            <Play className="w-5 h-5 fill-current ml-0.5" />
          )}
        </button>
      </div>

      {/* Copy */}
      <div className="space-y-1 relative z-10">
        <h3 className="font-serif text-sm font-bold text-slate-900 dark:text-white leading-snug">
          Narrate Stories in Your Voice
        </h3>
        <p className="font-serif text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
          Let family and friends hear your memories told aloud. You choose which stories to narrate and which voice to use—clone your own personal AI voice or pick from 6 studio AI voices to turn any published story into a keepsake audio narration.
        </p>
      </div>

      {/* Action CTA Button / Ready Indicator */}
      {hasReadyVoiceProfile && hasVoiceCredits ? (
        <div
          className="relative z-10 w-full py-2.5 px-3.5 rounded-xl text-xs font-serif font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-200 border border-emerald-300/80 dark:border-emerald-700/70 flex items-center justify-center gap-2 shadow-2xs"
          title={`Personal AI Voice is READY with ${voiceCreditBalance.toLocaleString()} AI Voice Credits available`}
        >
          <CheckSquare className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>AI Voice Feature Ready</span>
        </div>
      ) : hasReadyVoiceProfile && !hasVoiceCredits ? (
        <button
          type="button"
          onClick={handleGoToVoiceCredits}
          className="relative z-10 w-full py-2.5 px-3.5 rounded-xl text-xs font-serif font-bold transition-all shadow-xs bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white hover:shadow-md cursor-pointer flex items-center justify-center gap-2"
          title="Go to My Account → My Voice Credits"
        >
          <CreditCard className="w-3.5 h-3.5" />
          <span>Get AI Voice Credits</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      ) : (
        <div
          onClick={() => {
            if (hasExhaustedCredits) {
              setShowExhaustedCreditsModal(true);
            }
          }}
          className={`relative z-10 w-full ${hasExhaustedCredits ? 'cursor-pointer' : ''}`}
        >
          <button
            type="button"
            disabled={hasExhaustedCredits}
            onClick={(e) => {
              if (hasExhaustedCredits) {
                e.preventDefault();
                e.stopPropagation();
                setShowExhaustedCreditsModal(true);
                return;
              }
              handleOpenVoiceStudio();
            }}
            className={`w-full py-2.5 px-3.5 rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center justify-center gap-2 ${
              hasExhaustedCredits
                ? 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-600 opacity-60 cursor-not-allowed pointer-events-none'
                : 'bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white hover:shadow-md cursor-pointer'
            }`}
            title={
              hasExhaustedCredits
                ? 'Credits exhausted - click to purchase via My Account'
                : 'Go to My Profile → My Voice Translation'
            }
          >
            {hasExhaustedCredits ? (
              <Lock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            ) : (
              <Mic className="w-3.5 h-3.5" />
            )}
            <span>Set Up My AI Voice</span>
            {!hasExhaustedCredits && (
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            )}
          </button>
        </div>
      )}

      {/* Exhausted Credits Modal */}
      <ExhaustedCreditsModal
        isOpen={showExhaustedCreditsModal}
        onClose={() => setShowExhaustedCreditsModal(false)}
        actionAttempted="Setting up your personal AI voice"
      />

      <AdminComponentTag name="mbrAuthorVoicePanel" />
    </div>
  );
}

export { MbrAuthorVoicePanel as mbrAuthorVoicePanel };
