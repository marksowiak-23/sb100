/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  Square,
  Volume2,
  ChevronDown,
  Headphones,
  Gauge
} from 'lucide-react';
import { useTextToSpeech } from '@/src/hooks/useTextToSpeech';
import { taskApi, resolveMediaUrl, MbrMedia } from '@/src/services/api';

export interface StoryAudioPlayerProps {
  text: string;
  storyId?: string;
  title?: string;
  variant?: 'compact' | 'full' | 'inline-button' | 'icon-button';
  showLabel?: boolean;
  className?: string;
}

export default function StoryAudioPlayer({
  text,
  storyId = 'current-story',
  title = 'Story Narration',
  variant = 'compact',
  showLabel = true,
  className = ''
}: StoryAudioPlayerProps) {
  const {
    isSupported,
    isPlaying: ttsPlaying,
    isPaused: ttsPaused,
    currentId,
    playbackRate,
    voices,
    selectedVoiceURI,
    progress: ttsProgress,
    togglePlay: ttsTogglePlay,
    stop: ttsStop,
    setPlaybackRate: ttsSetPlaybackRate,
    setSelectedVoiceURI
  } = useTextToSpeech();

  const [showVoiceMenu, setShowVoiceMenu] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  // Saved AI Voice Studio narration media state (from mbrMedia)
  const [savedAudioMedia, setSavedAudioMedia] = useState<MbrMedia | null>(null);
  const [isNativePlaying, setIsNativePlaying] = useState(false);
  const [isNativePaused, setIsNativePaused] = useState(false);
  const [nativeProgress, setNativeProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const isMatchingStoryAudio = (m: MbrMedia) =>
    Boolean(
      storyId &&
      m.mbrMediaSubordinateId === storyId &&
      (
        (m.mbrMediaMimeType && m.mbrMediaMimeType.toLowerCase().startsWith('audio/')) ||
        (m.mbrMediaOriginalFilename && (m.mbrMediaOriginalFilename.toLowerCase().endsWith('.mp3') || m.mbrMediaOriginalFilename.toLowerCase().endsWith('.wav'))) ||
        (m.mbrMediaDescription && m.mbrMediaDescription.toLowerCase().includes('narration'))
      )
    );

  // Load any saved AI Voice Narration for this storyId and refresh when 'media-updated' fires
  useEffect(() => {
    let isMounted = true;
    if (!storyId || storyId === 'current-story' || storyId === 'editor-story') {
      setSavedAudioMedia(null);
      return;
    }

    const loadSavedNarration = async () => {
      try {
        // 1. Check sandbox_media first if present
        const sandboxStr = sessionStorage.getItem('sandbox_media');
        if (sandboxStr) {
          try {
            const parsed: MbrMedia[] = JSON.parse(sandboxStr);
            const foundSandbox = parsed.find(isMatchingStoryAudio);
            if (foundSandbox && isMounted) {
              setSavedAudioMedia(foundSandbox);
              return;
            }
          } catch {}
        }

        // 2. Check live member media
        let targetMbrId: string | null = null;
        try {
          const mbrStr = sessionStorage.getItem('sb_current_mbr') || sessionStorage.getItem('mbr');
          if (mbrStr) {
            const parsed = JSON.parse(mbrStr);
            targetMbrId = parsed?.mbrId || null;
          }
        } catch {}

        const mediaList = targetMbrId
          ? await taskApi.getMemberMedia(targetMbrId).catch(() => [])
          : [];

        if (isMounted && Array.isArray(mediaList)) {
          const found = mediaList.find(isMatchingStoryAudio) || null;
          setSavedAudioMedia(found);
        }
      } catch {
        // ignore
      }
    };

    loadSavedNarration();

    const handleMediaUpdated = (evt: Event) => {
      const customEvt = evt as CustomEvent;
      if (!customEvt.detail?.storyId || customEvt.detail.storyId === storyId) {
        if (audioRef.current) {
          audioRef.current.pause();
          audioRef.current = null;
        }
        setIsNativePlaying(false);
        setIsNativePaused(false);
        setNativeProgress(0);
        loadSavedNarration();
      }
    };

    const handleGlobalStop = () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      setIsNativePlaying(false);
      setIsNativePaused(false);
      setNativeProgress(0);
    };

    window.addEventListener('media-updated', handleMediaUpdated);
    window.addEventListener('stop-storybook-tts', handleGlobalStop);
    return () => {
      isMounted = false;
      window.removeEventListener('media-updated', handleMediaUpdated);
      window.removeEventListener('stop-storybook-tts', handleGlobalStop);
    };
  }, [storyId]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  const stop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsNativePlaying(false);
    setIsNativePaused(false);
    setNativeProgress(0);
    ttsStop();
  };

  const setPlaybackRate = (rate: number) => {
    ttsSetPlaybackRate(rate);
    if (audioRef.current) {
      audioRef.current.playbackRate = rate;
    }
  };

  const togglePlay = (narrationText: string, id?: string, narrationTitle?: string) => {
    const savedUrl = savedAudioMedia?.mbrMediaPath ? resolveMediaUrl(savedAudioMedia.mbrMediaPath) : '';
    if (savedUrl) {
      // Stop any browser speechSynthesis
      ttsStop();
      if (isNativePlaying) {
        if (isNativePaused && audioRef.current) {
          audioRef.current.play().catch(() => {});
          setIsNativePaused(false);
        } else if (audioRef.current) {
          audioRef.current.pause();
          setIsNativePaused(true);
        }
        return;
      }

      const audio = new Audio(savedUrl);
      audioRef.current = audio;
      audio.playbackRate = playbackRate;
      audio.onplay = () => {
        setIsNativePlaying(true);
        setIsNativePaused(false);
      };
      audio.ontimeupdate = () => {
        if (audio.duration && audio.duration > 0) {
          setNativeProgress(Math.min(100, Math.round((audio.currentTime / audio.duration) * 100)));
        }
      };
      audio.onended = () => {
        setIsNativePlaying(false);
        setIsNativePaused(false);
        setNativeProgress(100);
      };
      audio.onerror = () => {
        setIsNativePlaying(false);
        setIsNativePaused(false);
        ttsTogglePlay(narrationText, id, narrationTitle);
      };
      audio.play().catch(() => {
        setIsNativePlaying(false);
        setIsNativePaused(false);
        ttsTogglePlay(narrationText, id, narrationTitle);
      });
      return;
    }

    ttsTogglePlay(narrationText, id, narrationTitle);
  };

  const isCurrentPlaying = isNativePlaying || (ttsPlaying && currentId === storyId);
  const isCurrentPaused = isNativePaused || (ttsPaused && currentId === storyId);
  const progress = isNativePlaying ? nativeProgress : ttsProgress;

  if (!isSupported || !text || !text.trim()) {
    return null;
  }

  const speedOptions = [0.8, 1.0, 1.25, 1.5];

  // Inline / Icon Button Variant (perfect for action toolbars, feed cards and list rows)
  if (variant === 'inline-button' || variant === 'icon-button') {
    const isIconOnly = variant === 'icon-button' || showLabel === false;
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          togglePlay(text, storyId, title);
        }}
        className={`${
          isIconOnly
            ? 'p-2 rounded-xl text-xs font-serif font-semibold transition-all cursor-pointer shadow-2xs'
            : 'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-serif font-semibold transition-all cursor-pointer shadow-2xs'
        } ${
          isCurrentPlaying && !isCurrentPaused
            ? 'bg-amber-100 text-amber-900 border border-amber-300 ring-2 ring-amber-400/30 animate-pulse'
            : isCurrentPaused
            ? 'bg-amber-50 text-amber-800 border border-amber-200'
            : 'bg-white hover:bg-slate-50 text-slate-700 border border-[#EFECE7]'
        } ${className}`}
        title={isCurrentPlaying ? (isCurrentPaused ? 'Resume narration' : 'Pause narration') : 'Play story narration'}
      >
        {isCurrentPlaying && !isCurrentPaused ? (
          <>
            <Pause className={`${isIconOnly ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-amber-600 shrink-0`} />
            {!isIconOnly && <span>Listening</span>}
            {!isIconOnly && (
              <span className="flex items-end gap-0.5 h-3 px-0.5">
                <span className="w-0.5 h-2 bg-amber-600 rounded-full animate-bounce [animation-delay:0.1s]" />
                <span className="w-0.5 h-3 bg-amber-600 rounded-full animate-bounce [animation-delay:0.3s]" />
                <span className="w-0.5 h-1.5 bg-amber-600 rounded-full animate-bounce [animation-delay:0.2s]" />
              </span>
            )}
          </>
        ) : isCurrentPaused ? (
          <>
            <Play className={`${isIconOnly ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-amber-600 fill-amber-600 shrink-0`} />
            {!isIconOnly && <span>Paused</span>}
          </>
        ) : (
          <>
            <Headphones className={`${isIconOnly ? 'w-4 h-4' : 'w-3.5 h-3.5'} text-indigo-500 shrink-0`} />
            {!isIconOnly && <span>Listen</span>}
          </>
        )}
      </button>
    );
  }

  // Full / Banner Audio Player Variant
  return (
    <div
      className={`bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-950 text-white rounded-2xl p-3.5 sm:p-4 shadow-lg border border-indigo-800/40 relative overflow-hidden ${className}`}
    >
      {/* Background Decorative Glow */}
      <div className="absolute -top-12 -right-12 w-36 h-36 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col gap-3">
        {/* Header Bar */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shrink-0 shadow-inner">
              <Headphones className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/20">
                  Audiobook Narration
                </span>
                {isCurrentPlaying && !isCurrentPaused && (
                  <span className="flex items-center gap-1 text-[10px] text-indigo-300 font-mono">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Playing
                  </span>
                )}
              </div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-slate-100 truncate mt-0.5">
                {title}
              </h4>
            </div>
          </div>

          {/* Quick Voice & Speed Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Speed Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[11px] font-mono text-slate-200 transition-colors cursor-pointer"
                title="Playback Speed"
              >
                <Gauge className="w-3 h-3 text-amber-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute right-0 mt-1 w-24 bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-30 font-mono text-xs text-left">
                  {speedOptions.map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => {
                        setPlaybackRate(rate);
                        setShowSpeedMenu(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 flex items-center justify-between hover:bg-white/10 ${
                        playbackRate === rate ? 'text-amber-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>{rate}x</span>
                      {playbackRate === rate && <span className="text-[10px]">✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Voices Selector (if multiple available) */}
            {voices.length > 1 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowVoiceMenu(!showVoiceMenu)}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-white/10 hover:bg-white/15 border border-white/10 rounded-lg text-[11px] font-serif text-slate-200 transition-colors cursor-pointer"
                  title="Select Voice"
                >
                  <Volume2 className="w-3 h-3 text-indigo-400" />
                  <span className="hidden sm:inline">Voice</span>
                  <ChevronDown className="w-3 h-3 opacity-60" />
                </button>

                {showVoiceMenu && (
                  <div className="absolute right-0 mt-1 w-56 max-h-48 overflow-y-auto scrollbar-thin bg-slate-900 border border-slate-700 rounded-xl shadow-xl py-1 z-30 font-serif text-xs text-left divide-y divide-slate-800">
                    {voices.map((v) => (
                      <button
                        key={v.voiceURI}
                        type="button"
                        onClick={() => {
                          setSelectedVoiceURI(v.voiceURI);
                          setShowVoiceMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex flex-col hover:bg-white/10 transition-colors ${
                          selectedVoiceURI === v.voiceURI ? 'text-amber-400 font-bold bg-white/5' : 'text-slate-300'
                        }`}
                      >
                        <span className="truncate">{v.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">{v.lang}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/15 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-400 to-indigo-400 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${isCurrentPlaying ? Math.max(progress, 3) : 0}%` }}
          />
        </div>

        {/* Action Controls Row */}
        <div className="flex items-center justify-between gap-2 pt-0.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => togglePlay(text, storyId, title)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-serif font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer active:scale-95"
            >
              {isCurrentPlaying && !isCurrentPaused ? (
                <>
                  <Pause className="w-4 h-4 fill-slate-950" />
                  <span>Pause</span>
                </>
              ) : isCurrentPaused ? (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Resume</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950" />
                  <span>Play Narration</span>
                </>
              )}
            </button>

            {isCurrentPlaying && (
              <button
                type="button"
                onClick={stop}
                className="p-2 bg-white/10 hover:bg-white/15 text-slate-300 hover:text-white rounded-xl text-xs transition-colors cursor-pointer border border-white/10"
                title="Stop Narration"
              >
                <Square className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="text-[11px] font-mono text-slate-400">
            {isCurrentPlaying ? `${progress}% played` : `${text.split(/\s+/).length} words`}
          </div>
        </div>
      </div>
    </div>
  );
}
