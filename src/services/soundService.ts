/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lightweight zero-asset Web Audio API UI feedback sound engine for BackStory (SBook).
 * Fetches administrator-configured event -> sound preset mappings from /ui-sound-events
 * and synthesizes warm, unobtrusive micro-sounds on key user actions.
 */

import { uiSoundEventApi, UiSoundEvent } from '@/src/services/api';

export interface SoundPresetDefinition {
  code: string;
  name: string;
  vibe: string;
  description: string;
  suggestedFor: string;
}

export const SOUND_PRESET_CATALOG: SoundPresetDefinition[] = [
  {
    code: 'NONE',
    name: 'Silent (No Sound)',
    vibe: 'Muted',
    description: 'Disables audio feedback for this action event.',
    suggestedFor: 'Any event you want silent',
  },
  {
    code: 'WARM_CHIME',
    name: 'Warm Heirloom Chime',
    vibe: 'Celebratory',
    description: 'Gentle ascending two-note marimba chime (C5 → E5).',
    suggestedFor: 'Story Published',
  },
  {
    code: 'SOFT_POP',
    name: 'Soft Page Pop',
    vibe: 'Tactile',
    description: 'Ultra-subtle warm wooden bubble pop.',
    suggestedFor: 'Story Saved, Story Liked',
  },
  {
    code: 'TRIUMPH_CHORD',
    name: 'Golden Arpeggio Chord',
    vibe: 'Milestone',
    description: 'Warm major triad arpeggio (C5–E5–G5–C6).',
    suggestedFor: 'Credits Purchased, StoryBook PDF Generated',
  },
  {
    code: 'SPARKLE_BELL',
    name: 'Sparkle Bell',
    vibe: 'Magical',
    description: 'Airy harmonic chime with gentle shimmer overtone.',
    suggestedFor: 'AI Voice Narration Ready',
  },
  {
    code: 'PAGE_TURN',
    name: 'Soft Paper Flutter',
    vibe: 'Bookish',
    description: 'Soft filtered paper rustle followed by a light tap.',
    suggestedFor: 'Story PDF Downloaded',
  },
  {
    code: 'GENTLE_PING',
    name: 'Gentle Glass Ping',
    vibe: 'Friendly',
    description: 'Clean, soft crystal ping.',
    suggestedFor: 'Comment Posted',
  },
  {
    code: 'SOFT_THUD',
    name: 'Soft Muted Thud',
    vibe: 'Destructive',
    description: 'Low, warm damped tone that confirms removal without harshness.',
    suggestedFor: 'Story Deleted',
  },
  {
    code: 'DOUBLE_TAP',
    name: 'Subtle Double Tap',
    vibe: 'Attention',
    description: 'Two gentle low-mid pulses to signal an alert or limit.',
    suggestedFor: 'Warning / Insufficient Credits',
  },
  {
    code: 'WOODBLOCK_TICK',
    name: 'Warm Woodblock Tick',
    vibe: 'Minimal',
    description: 'Short, crisp acoustic woodblock tap.',
    suggestedFor: 'Light UI confirmations',
  },
  {
    code: 'HARP_STRUM',
    name: 'Soft Harp Glissando',
    vibe: 'Elegant',
    description: 'Delicate 4-note ascending harp pluck.',
    suggestedFor: 'Special milestones & completions',
  },
];

const DEFAULT_FALLBACK_MAP: Record<string, { soundPresetCd: string; volumeAmt: number; isEnabled: boolean }> = {
  STORY_PUBLISH: { soundPresetCd: 'WARM_CHIME', volumeAmt: 0.16, isEnabled: true },
  STORY_SAVE: { soundPresetCd: 'SOFT_POP', volumeAmt: 0.12, isEnabled: true },
  STORY_DELETE: { soundPresetCd: 'SOFT_THUD', volumeAmt: 0.14, isEnabled: true },
  STORY_PRINT_PDF: { soundPresetCd: 'PAGE_TURN', volumeAmt: 0.16, isEnabled: true },
  STORYBOOK_PDF_GENERATE: { soundPresetCd: 'TRIUMPH_CHORD', volumeAmt: 0.16, isEnabled: true },
  AUDIO_GENERATE: { soundPresetCd: 'SPARKLE_BELL', volumeAmt: 0.16, isEnabled: true },
  CREDIT_PURCHASE: { soundPresetCd: 'TRIUMPH_CHORD', volumeAmt: 0.18, isEnabled: true },
  STORY_LIKE: { soundPresetCd: 'SOFT_POP', volumeAmt: 0.10, isEnabled: true },
  COMMENT_POST: { soundPresetCd: 'GENTLE_PING', volumeAmt: 0.12, isEnabled: true },
  WARNING_ALERT: { soundPresetCd: 'DOUBLE_TAP', volumeAmt: 0.14, isEnabled: true },
};

const USER_SOUND_PREF_KEY = 'sb_ui_sounds_enabled';
const CONFIG_TTL_MS = 60_000;

let sharedAudioCtx: AudioContext | null = null;
let cachedEvents: Record<string, UiSoundEvent> | null = null;
let cachedAt = 0;
let loadingPromise: Promise<void> | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return null;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }
  if (sharedAudioCtx.state === 'suspended') {
    sharedAudioCtx.resume().catch(() => {});
  }
  return sharedAudioCtx;
}

/** Check whether any HTML <audio> element (e.g. AI voice narration) is actively playing */
function isNarrationAudioPlaying(): boolean {
  if (typeof document === 'undefined') return false;
  const audios = document.querySelectorAll('audio');
  for (let i = 0; i < audios.length; i++) {
    const a = audios[i];
    if (!a.paused && !a.ended && a.currentTime > 0) {
      return true;
    }
  }
  return false;
}

export function isUserUiSoundEnabled(): boolean {
  try {
    const val = localStorage.getItem(USER_SOUND_PREF_KEY);
    if (val === 'false' || val === '0') return false;
  } catch {}
  return true;
}

export function setUserUiSoundEnabled(enabled: boolean): void {
  try {
    localStorage.setItem(USER_SOUND_PREF_KEY, enabled ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('ui-sound-pref-changed', { detail: { enabled } }));
  } catch {}
}

/** Play a single enveloped tone */
function playTone(
  ctx: AudioContext,
  freq: number,
  startOffset: number,
  duration: number,
  gainPeak: number,
  type: OscillatorType = 'sine',
  endFreq?: number
) {
  const now = ctx.currentTime + startOffset;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (endFreq && endFreq !== freq) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
  }

  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, gainPeak), now + Math.min(0.015, duration * 0.2));
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + duration + 0.02);
}

/** Play a soft filtered white-noise burst (used for paper turn) */
function playFilteredNoise(ctx: AudioContext, startOffset: number, duration: number, gainPeak: number) {
  const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * duration));
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.5;
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.setValueAtTime(1600, ctx.currentTime + startOffset);
  filter.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + startOffset + duration);
  filter.Q.value = 1.4;

  const gain = ctx.createGain();
  const now = ctx.currentTime + startOffset;
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.linearRampToValueAtTime(Math.max(0.0001, gainPeak), now + duration * 0.25);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);

  source.start(now);
  source.stop(now + duration + 0.02);
}

/**
 * Synthesize and play a named sound preset immediately.
 * Safe to call from admin preview buttons or user actions.
 */
export function playSoundPreset(presetCd: string, volume = 0.15): void {
  const code = (presetCd || 'NONE').trim().toUpperCase();
  if (code === 'NONE' || volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  const v = Math.min(1, Math.max(0.01, Number(volume) || 0.15));

  switch (code) {
    case 'WARM_CHIME':
      playTone(ctx, 523.25, 0.0, 0.24, v, 'sine');        // C5
      playTone(ctx, 1046.5, 0.0, 0.18, v * 0.22, 'sine'); // C6 harmonic
      playTone(ctx, 659.25, 0.09, 0.32, v, 'sine');       // E5
      playTone(ctx, 1318.5, 0.09, 0.22, v * 0.2, 'sine'); // E6 harmonic
      break;

    case 'SOFT_POP':
      playTone(ctx, 360, 0.0, 0.09, v, 'sine', 540);
      break;

    case 'TRIUMPH_CHORD':
      playTone(ctx, 523.25, 0.0, 0.28, v * 0.85, 'triangle');  // C5
      playTone(ctx, 659.25, 0.06, 0.30, v * 0.85, 'triangle'); // E5
      playTone(ctx, 783.99, 0.12, 0.32, v * 0.85, 'triangle'); // G5
      playTone(ctx, 1046.5, 0.18, 0.42, v * 0.95, 'sine');     // C6
      break;

    case 'SPARKLE_BELL':
      playTone(ctx, 880.0, 0.0, 0.26, v * 0.75, 'sine');       // A5
      playTone(ctx, 1318.5, 0.05, 0.30, v * 0.65, 'sine');     // E6
      playTone(ctx, 1760.0, 0.11, 0.38, v * 0.55, 'sine');     // A6
      break;

    case 'PAGE_TURN':
      playFilteredNoise(ctx, 0.0, 0.14, v * 1.1);
      playTone(ctx, 440, 0.11, 0.08, v * 0.45, 'triangle', 330);
      break;

    case 'GENTLE_PING':
      playTone(ctx, 783.99, 0.0, 0.22, v * 0.85, 'sine');      // G5
      playTone(ctx, 1567.98, 0.0, 0.14, v * 0.25, 'sine');     // G6
      break;

    case 'SOFT_THUD':
      playTone(ctx, 190, 0.0, 0.15, v * 1.1, 'triangle', 105);
      break;

    case 'DOUBLE_TAP':
      playTone(ctx, 290, 0.0, 0.09, v * 0.9, 'triangle', 240);
      playTone(ctx, 240, 0.11, 0.11, v * 0.85, 'triangle', 195);
      break;

    case 'WOODBLOCK_TICK':
      playTone(ctx, 720, 0.0, 0.055, v * 0.95, 'triangle', 580);
      break;

    case 'HARP_STRUM':
      playTone(ctx, 440.0, 0.0, 0.26, v * 0.75, 'sine');       // A4
      playTone(ctx, 554.37, 0.055, 0.28, v * 0.75, 'sine');    // C#5
      playTone(ctx, 659.25, 0.11, 0.30, v * 0.75, 'sine');     // E5
      playTone(ctx, 880.0, 0.165, 0.38, v * 0.85, 'sine');     // A5
      break;

    default:
      break;
  }
}

/** Load (or refresh) the server-side UI sound event mappings into memory */
export async function loadSoundConfig(force = false): Promise<void> {
  const now = Date.now();
  if (!force && cachedEvents && now - cachedAt < CONFIG_TTL_MS) {
    return;
  }
  if (loadingPromise && !force) {
    return loadingPromise;
  }
  loadingPromise = (async () => {
    try {
      const list = await uiSoundEventApi.getAll();
      const map: Record<string, UiSoundEvent> = {};
      for (const item of list) {
        if (item?.eventCd) {
          map[item.eventCd.toUpperCase()] = item;
        }
      }
      cachedEvents = map;
      cachedAt = Date.now();
    } catch {
      // Keep existing cache or fallback defaults if API is unreachable
    } finally {
      loadingPromise = null;
    }
  })();
  return loadingPromise;
}

/**
 * Play the administrator-configured UI feedback sound for a logical event code
 * (e.g. 'STORY_PUBLISH', 'STORY_DELETE', 'STORY_PRINT_PDF', 'AUDIO_GENERATE').
 */
export function playUiSound(eventCd: string): void {
  if (!isUserUiSoundEnabled()) return;
  if (isNarrationAudioPlaying()) return;

  const key = (eventCd || '').trim().toUpperCase();
  if (!key) return;

  // Refresh cache asynchronously in the background if stale
  if (!cachedEvents || Date.now() - cachedAt >= CONFIG_TTL_MS) {
    void loadSoundConfig(false);
  }

  const configured = cachedEvents?.[key];
  if (configured) {
    if (!configured.isEnabled || configured.soundPresetCd === 'NONE') return;
    playSoundPreset(configured.soundPresetCd, Number(configured.volumeAmt ?? 0.15));
    return;
  }

  const fallback = DEFAULT_FALLBACK_MAP[key];
  if (fallback && fallback.isEnabled && fallback.soundPresetCd !== 'NONE') {
    playSoundPreset(fallback.soundPresetCd, fallback.volumeAmt);
  }
}
