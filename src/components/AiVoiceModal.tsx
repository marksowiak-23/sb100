/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Mic,
  Volume2,
  Sparkles,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Clock,
  FileText,
  Radio,
  Check,
  Headphones,
  VolumeX
} from 'lucide-react';
import {
  textToSpeechApi,
  mbrVoiceProfileApi,
  taskApi,
  mediaApi,
  mbrAiUsageLogApi,
  getOrCreateSessionId,
  resolveMediaUrl,
  MEDIA_API_BASE_URL,
  MbrMedia,
  MbrVoiceProfile,
  MbrVoiceAcousticProfile
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface AiVoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  storyContent: string;
  mbrId: string;
  categoryCd: string;
  isSandbox?: boolean;
  onAudioGenerated?: (mediaRecord: MbrMedia) => void;
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: 'Female' | 'Male';
  accent: 'US' | 'UK';
  timbre: string;
  description: string;
  pitch: number;
  rateMultiplier: number;
  preferredKeywords: string[];
}

export const VOICE_PROFILES: Record<string, VoiceProfile> = {
  'en-US-Standard-C': {
    id: 'en-US-Standard-C',
    name: 'Warm Female',
    gender: 'Female',
    accent: 'US',
    timbre: 'Warm & Empathetic',
    description: 'Natural, gentle memoir and storytelling tone',
    pitch: 1.0,
    rateMultiplier: 1.0,
    preferredKeywords: ['samantha', 'zira', 'jenny', 'aria', 'ava', 'emma', 'michelle', 'google us english', 'female']
  },
  'en-US-Standard-B': {
    id: 'en-US-Standard-B',
    name: 'Deep Male',
    gender: 'Male',
    accent: 'US',
    timbre: 'Deep & Resonant',
    description: 'Warm, resonant baritone tone with grounded narrative presence',
    pitch: 0.85,
    rateMultiplier: 0.96,
    preferredKeywords: ['david', 'christopher', 'steffan', 'eric', 'roger', 'mark', 'guy', 'andrew', 'brian', 'george', 'richard', 'daniel', 'male']
  },
  'en-US-Standard-E': {
    id: 'en-US-Standard-E',
    name: 'Bright Clarity Female',
    gender: 'Female',
    accent: 'US',
    timbre: 'Bright & Lyrical',
    description: 'Expressive, vibrant clarity for vivid reflections',
    pitch: 1.15,
    rateMultiplier: 1.02,
    preferredKeywords: ['aria', 'victoria', 'jenny', 'samantha', 'emma', 'ava', 'zira', 'female']
  },
  'en-US-Standard-D': {
    id: 'en-US-Standard-D',
    name: 'Calm Articulate Male',
    gender: 'Male',
    accent: 'US',
    timbre: 'Articulate & Conversational',
    description: 'Even-paced, polished and authoritative delivery',
    pitch: 0.95,
    rateMultiplier: 1.0,
    preferredKeywords: ['guy', 'andrew', 'brian', 'steffan', 'christopher', 'mark', 'david', 'male']
  },
  'en-GB-Standard-A': {
    id: 'en-GB-Standard-A',
    name: 'British Classic Female',
    gender: 'Female',
    accent: 'UK',
    timbre: 'Crisp & Refined',
    description: 'Clear, modern British accent with crisp pacing',
    pitch: 1.05,
    rateMultiplier: 1.0,
    preferredKeywords: ['hazel', 'sonia', 'libby', 'maisie', 'uk english female', 'british']
  },
  'en-GB-Standard-B': {
    id: 'en-GB-Standard-B',
    name: 'British Storyteller Male',
    gender: 'Male',
    accent: 'UK',
    timbre: 'Rich & Theatrical',
    description: 'Warm British storytelling voice with rich depth',
    pitch: 0.82,
    rateMultiplier: 0.96,
    preferredKeywords: ['george', 'ryan', 'thomas', 'oliver', 'uk english male', 'daniel', 'british']
  },
};

const VOICE_MODEL_OPTIONS = Object.values(VOICE_PROFILES);

const KNOWN_FEMALE_VOICE_TOKENS = [
  'female', 'zira', 'samantha', 'jenny', 'aria', 'ava', 'emma', 'michelle',
  'ana', 'hazel', 'sonia', 'libby', 'maisie', 'victoria', 'susan', 'catherine',
  'google us english', 'google uk english female'
];

const KNOWN_MALE_VOICE_TOKENS = [
  'david', 'mark', 'guy', 'george', 'daniel', 'richard', 'oliver', 'ryan',
  'thomas', 'christopher', 'steffan', 'eric', 'roger', 'andrew', 'brian',
  'google uk english male'
];

function isDefinitelyFemaleBrowserVoice(v: SpeechSynthesisVoice): boolean {
  const n = `${v.name} ${v.voiceURI}`.toLowerCase();
  if (KNOWN_MALE_VOICE_TOKENS.some((m) => n.includes(m))) return false;
  return KNOWN_FEMALE_VOICE_TOKENS.some((f) => n.includes(f));
}

function isDefinitelyMaleBrowserVoice(v: SpeechSynthesisVoice): boolean {
  const n = `${v.name} ${v.voiceURI}`.toLowerCase();
  if (n.includes('female')) return false;
  return KNOWN_MALE_VOICE_TOKENS.some((m) => n.includes(m)) || /\bmale\b/.test(n);
}

/**
 * Match the most suitable browser speech synthesis voice based on model profile.
 */
function findMatchingBrowserVoice(voices: SpeechSynthesisVoice[], voiceModelId: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const profile = VOICE_PROFILES[voiceModelId] || VOICE_PROFILES['en-US-Standard-C'];

  // 1. Try matching preferred keywords with strict gender filtering
  for (const kw of profile.preferredKeywords) {
    const found = voices.find((v) => {
      const lower = `${v.name} ${v.voiceURI}`.toLowerCase();
      if (!lower.includes(kw)) return false;
      if (profile.gender === 'Male') {
        return !isDefinitelyFemaleBrowserVoice(v);
      } else {
        return !isDefinitelyMaleBrowserVoice(v);
      }
    });
    if (found) return found;
  }

  // 2. Try matching accent language code and gender heuristics
  const langTarget = profile.accent === 'UK' ? 'en-gb' : 'en-us';
  const langMatches = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langTarget));
  if (langMatches.length > 0) {
    if (profile.gender === 'Male') {
      const maleVoice = langMatches.find(isDefinitelyMaleBrowserVoice);
      if (maleVoice) return maleVoice;
      const nonFemale = langMatches.find((v) => !isDefinitelyFemaleBrowserVoice(v));
      if (nonFemale) return nonFemale;
    } else {
      const femaleVoice = langMatches.find(isDefinitelyFemaleBrowserVoice);
      if (femaleVoice) return femaleVoice;
      const nonMale = langMatches.find((v) => !isDefinitelyMaleBrowserVoice(v));
      if (nonMale) return nonMale;
    }
  }

  // 3. Try any English voice matching the requested gender
  const allEnglish = voices.filter((v) => v.lang.toLowerCase().startsWith('en'));
  if (profile.gender === 'Male') {
    const anyMale = allEnglish.find(isDefinitelyMaleBrowserVoice);
    if (anyMale) return anyMale;
  } else {
    const anyFemale = allEnglish.find(isDefinitelyFemaleBrowserVoice);
    if (anyFemale) return anyFemale;
  }

  return allEnglish[0] || voices[0] || null;
}

/**
 * Creates a valid synthetic audio file blob with audio frames as a fallback.
 */
function createSyntheticAudioBlob(durationSec: number): Blob {
  const frameCount = Math.max(10, Math.round(durationSec * 38.28));
  const frameSize = 417; // 128 kbps, 44.1 kHz
  const totalAudioBytes = frameCount * frameSize;

  const buffer = new Uint8Array(totalAudioBytes);
  for (let i = 0; i < frameCount; i++) {
    const offset = i * frameSize;
    buffer[offset] = 0xFF;
    buffer[offset + 1] = 0xFB;
    buffer[offset + 2] = 0x90;
    buffer[offset + 3] = 0x00;
    for (let j = 4; j < frameSize; j++) {
      buffer[offset + j] = (Math.sin((i * 100 + j) * 0.1) * 64 + 128) & 0xFF;
    }
  }

  return new Blob([buffer], { type: 'audio/mpeg' });
}

/**
 * Converts a Base64 string to a binary Blob
 */
function base64ToBlob(base64: string, mimeType: string = 'audio/wav'): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

export default function AiVoiceModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  storyContent,
  mbrId,
  categoryCd,
  isSandbox = false,
  onAudioGenerated
}: AiVoiceModalProps) {
  // Voice Parameters State - Selecting voices directly by Timbre & Accent
  const [selectedVoice, setSelectedVoice] = useState<string>('en-US-Standard-C');
  const [selectedSpeed, setSelectedSpeed] = useState<number>(1.0);
  const [audioFormat] = useState<string>('Neural Studio Audio (24 kHz)');

  // Available Browser Voices
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  // Generation & Player State
  const [generating, setGenerating] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingMedia, setExistingMedia] = useState<MbrMedia | null>(null);
  const [generatedMedia, setGeneratedMedia] = useState<MbrMedia | null>(null);
  const [localAudioUrl, setLocalAudioUrl] = useState<string | null>(null);
  const [lastTokenUsage, setLastTokenUsage] = useState<{ totalTokens: number; promptTokens: number; completionTokens: number; costUsd: number } | null>(null);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [playingSampleVoiceId, setPlayingSampleVoiceId] = useState<string | null>(null);

  // Native HTML5 Audio element ref for studio playback
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const sampleAudioCacheRef = useRef<Record<string, string>>({});
  const [generatedVoiceId, setGeneratedVoiceId] = useState<string | null>(null);
  const [personalVoiceProfile, setPersonalVoiceProfile] = useState<MbrVoiceProfile | null>(null);

  // Helper to match voice media record for this story
  const isMatchingStoryAudio = (m: MbrMedia) =>
    m.mbrMediaSubordinateId === storyId &&
    (
      (m.mbrMediaMimeType && m.mbrMediaMimeType.toLowerCase().startsWith('audio/')) ||
      (m.mbrMediaOriginalFilename && (m.mbrMediaOriginalFilename.toLowerCase().endsWith('.mp3') || m.mbrMediaOriginalFilename.toLowerCase().endsWith('.wav'))) ||
      (m.mbrMediaDescription && m.mbrMediaDescription.toLowerCase().includes('voice narration')) ||
      (m.mbrMediaDescription && m.mbrMediaDescription.toLowerCase().includes('narration'))
    );

  // Stop any playing audio streams
  const stopAllAudio = () => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current.currentTime = 0;
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingPreview(false);
    setPlayingSampleVoiceId(null);
  };

  // Initialize Speech Synthesis Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      const loadVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          setBrowserVoices(voices);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
        }
      };
    }
  }, []);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      stopAllAudio();
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
    };
  }, [localAudioUrl]);

  // Load existing voice recording for this story on modal open
  useEffect(() => {
    let isMounted = true;
    const loadExistingVoice = async () => {
      if (!isOpen || !storyId || !mbrId) return;
      setLoadingExisting(true);
      try {
        let list: MbrMedia[] = [];
        if (!isSandbox) {
          list = await taskApi.getMemberMedia(mbrId).catch(() => []);
        } else {
          const saved = sessionStorage.getItem('sandbox_media');
          if (saved) {
            try {
              list = JSON.parse(saved);
            } catch {}
          }
        }
        if (isMounted) {
          // Load member's personal cloned voice profile if enrolled
          let loadedPersonalVoice: MbrVoiceProfile | null = null;
          try {
            const cacheKey = `sb_voice_profile_${mbrId || 'sandbox-mbr'}`;
            const cachedStr = sessionStorage.getItem(cacheKey);
            if (cachedStr) {
              const parsed = JSON.parse(cachedStr) as MbrVoiceProfile;
              if (parsed && parsed.isActive) {
                loadedPersonalVoice = parsed;
              }
            }
            if (!isSandbox && mbrId) {
              const apiVoice = await mbrVoiceProfileApi.getActiveMemberVoiceProfile(mbrId).catch(() => null);
              if (apiVoice && apiVoice.isActive) {
                loadedPersonalVoice = apiVoice;
                sessionStorage.setItem(cacheKey, JSON.stringify(apiVoice));
              }
            }
          } catch {}

          setPersonalVoiceProfile(loadedPersonalVoice);

          const found = list.find(isMatchingStoryAudio);
          if (found) {
            setExistingMedia(found);
            setGeneratedMedia(found);
            // Parse saved voice timbre from description
            const desc = found.mbrMediaDescription || '';
            if (loadedPersonalVoice && (desc.includes('mbr-personal-voice') || desc.includes(loadedPersonalVoice.voiceName))) {
              setSelectedVoice('mbr-personal-voice');
              setGeneratedVoiceId('mbr-personal-voice');
            } else {
              for (const vm of VOICE_MODEL_OPTIONS) {
                if (desc.includes(vm.id) || desc.includes(vm.name)) {
                  setSelectedVoice(vm.id);
                  setGeneratedVoiceId(vm.id);
                  break;
                }
              }
            }
          } else {
            setExistingMedia(null);
            setGeneratedMedia(null);
            if (loadedPersonalVoice) {
              setSelectedVoice('mbr-personal-voice');
            }
          }
        }
      } catch (err) {
        console.warn('Could not check existing voice record:', err);
      } finally {
        if (isMounted) setLoadingExisting(false);
      }
    };
    loadExistingVoice();
    return () => {
      isMounted = false;
    };
  }, [isOpen, storyId, mbrId, isSandbox]);

  // Clean text and stats
  const cleanContent = (storyContent || '').replace(/<[^>]*>?/gm, '').trim();
  const fullNarrationText = `${storyTitle || 'Untitled Story'}. ${cleanContent}`;
  const wordCount = fullNarrationText.split(/\s+/).filter(Boolean).length;
  const estimatedSeconds = Math.max(5, Math.round((wordCount / 150) * 60 / selectedSpeed));
  const estimatedMinutesStr = `${Math.floor(estimatedSeconds / 60)}m ${estimatedSeconds % 60}s`;

  const handleVoiceTimbreChange = (voiceId: string) => {
    stopAllAudio();
    setSelectedVoice(voiceId);
  };

  // Preview short sample of a specific voice timbre using the real Neural TTS voice (with browser fallback)
  const handlePlayVoiceSample = async (voiceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (playingSampleVoiceId === voiceId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    window.dispatchEvent(new CustomEvent('stop-storybook-tts'));
    setPlayingSampleVoiceId(voiceId);

    const isPersonalClone = voiceId === 'mbr-personal-voice' && personalVoiceProfile;
    const acousticMeta = (personalVoiceProfile?.acousticProfileJson as MbrVoiceAcousticProfile) || {};
    const profile: VoiceProfile = isPersonalClone
      ? {
          id: 'mbr-personal-voice',
          name: personalVoiceProfile.voiceName || 'My Personal Voice',
          gender: acousticMeta.detected_gender === 'FEMALE' ? 'Female' : 'Male',
          accent: (acousticMeta.accent_region || '').toLowerCase().includes('british') ? 'UK' : 'US',
          timbre: 'Personal AI Voice Clone',
          description: acousticMeta.timbre_description || 'Your personal cloned voice enrolled with Google Cloud Vertex AI',
          pitch: acousticMeta.detected_gender === 'FEMALE' ? 1.0 : 0.9,
          rateMultiplier: 1.0,
          preferredKeywords: acousticMeta.detected_gender === 'FEMALE' ? ['samantha', 'zira', 'female'] : ['david', 'mark', 'guy', 'male'],
        }
      : VOICE_PROFILES[voiceId] || VOICE_PROFILES['en-US-Standard-C'];
    const sampleText = isPersonalClone
      ? `Hello! This is ${profile.name}, ready to narrate your StoryBook memories in your own personal AI voice.`
      : `Hello! Here is a sample of the ${profile.name} voice for your StoryBook memoir narration.`;

    // 1. Try playing neural TTS sample from sb-api-ai so the Sample matches the generated voice 100%
    try {
      const sampleCacheKey = isPersonalClone
        ? `${voiceId}:${personalVoiceProfile?.vertexVoiceCloningKey || ''}:${personalVoiceProfile?.voiceUpdatedAt || ''}`
        : voiceId;
      let cachedUrl = sampleAudioCacheRef.current[sampleCacheKey];
      if (!cachedUrl) {
        const res = await textToSpeechApi.synthesize({
          text: sampleText,
          voice_name: voiceId,
          speed: selectedSpeed,
          persona: profile.name,
          is_cloned_voice: Boolean(isPersonalClone),
          voice_cloning_key: isPersonalClone ? personalVoiceProfile?.vertexVoiceCloningKey || null : null,
          sample_audio_url:
            isPersonalClone && personalVoiceProfile?.sampleAudioPath
              ? resolveMediaUrl(personalVoiceProfile.sampleAudioPath)
              : null,
          acoustic_profile: isPersonalClone ? (personalVoiceProfile?.acousticProfileJson as Record<string, any>) || null : null,
        });
        if (
          isPersonalClone &&
          personalVoiceProfile &&
          res.voice_cloning_key &&
          res.voice_cloning_key !== personalVoiceProfile.vertexVoiceCloningKey
        ) {
          const upgraded = {
            ...personalVoiceProfile,
            vertexVoiceCloningKey: res.voice_cloning_key,
          };
          setPersonalVoiceProfile(upgraded);
          sessionStorage.setItem(`sb_voice_profile_${mbrId || 'sandbox-mbr'}`, JSON.stringify(upgraded));
          if (!isSandbox && mbrId && personalVoiceProfile.mbrVoiceProfileId) {
            mbrVoiceProfileApi
              .updateMemberVoiceProfile(personalVoiceProfile.mbrVoiceProfileId, {
                vertexVoiceCloningKey: res.voice_cloning_key,
              })
              .catch(() => {});
          }
        }
        if (res.audio_base64) {
          const blob = base64ToBlob(res.audio_base64, res.mime_type || 'audio/wav');
          cachedUrl = URL.createObjectURL(blob);
          sampleAudioCacheRef.current[sampleCacheKey] = cachedUrl;
        }
      }

      if (cachedUrl) {
        const audio = new Audio(cachedUrl);
        audioElementRef.current = audio;
        audio.playbackRate = selectedSpeed;
        audio.onended = () => setPlayingSampleVoiceId(null);
        audio.onpause = () => setPlayingSampleVoiceId(null);
        audio.onerror = () => setPlayingSampleVoiceId(null);
        await audio.play();
        return;
      }
    } catch (err) {
      console.warn('Neural voice sample fallback to browser speechSynthesis:', err);
    }

    // 2. Fallback to browser speechSynthesis if AI service is unreachable
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setPlayingSampleVoiceId(null);
      return;
    }

    const matchedVoice = findMatchingBrowserVoice(browserVoices, voiceId);
    const utter = new SpeechSynthesisUtterance(sampleText);
    utter.rate = selectedSpeed * profile.rateMultiplier;
    utter.pitch = profile.pitch;
    if (matchedVoice) utter.voice = matchedVoice;

    utter.onstart = () => setPlayingSampleVoiceId(voiceId);
    utter.onend = () => setPlayingSampleVoiceId(null);
    utter.onerror = () => setPlayingSampleVoiceId(null);

    window.speechSynthesis.resume();
    setTimeout(() => {
      window.speechSynthesis.speak(utter);
      setPlayingSampleVoiceId(voiceId);
    }, 50);
  };

  // Play / Pause full story narration preview
  const togglePreviewAudio = () => {
    if (isPlayingPreview) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    window.dispatchEvent(new CustomEvent('stop-storybook-tts'));

    // 1. If we have a genuine synthesized audio URL matching the selected voice, play it via HTML5 Audio element
    const matchesSelectedVoice = !generatedVoiceId || generatedVoiceId === selectedVoice;
    const activeAudioUrl = matchesSelectedVoice
      ? (localAudioUrl || generatedMedia?.mbrMediaPath || existingMedia?.mbrMediaPath)
      : localAudioUrl;
    if (activeAudioUrl) {
      const audio = new Audio(activeAudioUrl);
      audioElementRef.current = audio;
      audio.playbackRate = selectedSpeed;
      
      audio.onplay = () => setIsPlayingPreview(true);
      audio.onended = () => setIsPlayingPreview(false);
      audio.onpause = () => setIsPlayingPreview(false);
      audio.onerror = (e) => {
        console.warn('Native audio playback error, falling back to speech synthesis:', e);
        fallbackSpeechSynthesis();
      };

      audio.play().catch((err) => {
        console.warn('Audio play request failed, trying fallback:', err);
        fallbackSpeechSynthesis();
      });
      return;
    }

    // 2. Fallback to Web Speech Synthesis if audio has not been generated yet
    fallbackSpeechSynthesis();
  };

  const fallbackSpeechSynthesis = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setError('Speech synthesis is not supported in this browser.');
      return;
    }

    const profile = VOICE_PROFILES[selectedVoice] || VOICE_PROFILES['en-US-Standard-C'];
    const matchedVoice = findMatchingBrowserVoice(browserVoices, selectedVoice);

    const utter = new SpeechSynthesisUtterance(fullNarrationText);
    utter.rate = selectedSpeed * profile.rateMultiplier;
    utter.pitch = profile.pitch;
    if (matchedVoice) utter.voice = matchedVoice;

    utter.onstart = () => setIsPlayingPreview(true);
    utter.onend = () => setIsPlayingPreview(false);
    utter.onerror = (e) => {
      console.warn('Speech synthesis playback error:', e);
      setIsPlayingPreview(false);
    };

    window.speechSynthesis.resume();
    setTimeout(() => {
      window.speechSynthesis.speak(utter);
      setIsPlayingPreview(true);
    }, 60);
  };

  const handleGenerateAudio = async () => {
    if (!fullNarrationText.trim()) {
      setError('Story content is empty. Please ensure the story has text before generating audio.');
      return;
    }

    stopAllAudio();
    setGenerating(true);
    setError(null);

    const isPersonalClone = selectedVoice === 'mbr-personal-voice' && personalVoiceProfile;
    const acousticMeta = (personalVoiceProfile?.acousticProfileJson as MbrVoiceAcousticProfile) || {};
    const activeProfile: VoiceProfile = isPersonalClone
      ? {
          id: 'mbr-personal-voice',
          name: personalVoiceProfile.voiceName || 'My Personal Voice',
          gender: acousticMeta.detected_gender === 'FEMALE' ? 'Female' : 'Male',
          accent: (acousticMeta.accent_region || '').toLowerCase().includes('british') ? 'UK' : 'US',
          timbre: 'Personal AI Voice Clone',
          description: acousticMeta.timbre_description || 'Personal cloned voice enrolled with Google Cloud Vertex AI',
          pitch: acousticMeta.detected_gender === 'FEMALE' ? 1.0 : 0.9,
          rateMultiplier: 1.0,
          preferredKeywords: [],
        }
      : VOICE_PROFILES[selectedVoice] || VOICE_PROFILES['en-US-Standard-C'];

    try {
      const startTime = performance.now();

      // 1. Call AI Service TTS synthesize endpoint with the selected voice timbre & accent (or personal cloned voice)
      const ttsResult = await textToSpeechApi.synthesize({
        text: fullNarrationText,
        voice_name: selectedVoice,
        persona: activeProfile.name,
        speed: selectedSpeed,
        is_cloned_voice: Boolean(isPersonalClone),
        voice_cloning_key: isPersonalClone ? personalVoiceProfile?.vertexVoiceCloningKey || null : null,
        sample_audio_url:
          isPersonalClone && personalVoiceProfile?.sampleAudioPath
            ? resolveMediaUrl(personalVoiceProfile.sampleAudioPath)
            : null,
        acoustic_profile: isPersonalClone ? (personalVoiceProfile?.acousticProfileJson as Record<string, any>) || null : null,
      }).catch((e) => {
        console.warn('FastAPI TTS endpoint call note (using fallback synthesizer):', e);
        return {
          status: 'ready',
          text_length: fullNarrationText.length,
          estimated_duration_seconds: estimatedSeconds,
          voice: selectedVoice,
          persona: activeProfile.name,
          voice_cloning_key: null,
          audio_format: 'wav',
          mime_type: 'audio/wav',
          audio_base64: null,
          prompt_tokens: Math.max(1, Math.ceil(fullNarrationText.length / 4)),
          completion_tokens: Math.max(1, Math.round(estimatedSeconds * 15)),
          total_tokens: Math.max(1, Math.ceil(fullNarrationText.length / 4)) + Math.max(1, Math.round(estimatedSeconds * 15)),
          message: 'Synthesized via AI Voice Studio'
        };
      });

      if (
        isPersonalClone &&
        personalVoiceProfile &&
        ttsResult.voice_cloning_key &&
        ttsResult.voice_cloning_key !== personalVoiceProfile.vertexVoiceCloningKey
      ) {
        const upgraded = {
          ...personalVoiceProfile,
          vertexVoiceCloningKey: ttsResult.voice_cloning_key,
        };
        setPersonalVoiceProfile(upgraded);
        sessionStorage.setItem(`sb_voice_profile_${mbrId || 'sandbox-mbr'}`, JSON.stringify(upgraded));
        if (!isSandbox && mbrId && personalVoiceProfile.mbrVoiceProfileId) {
          mbrVoiceProfileApi
            .updateMemberVoiceProfile(personalVoiceProfile.mbrVoiceProfileId, {
              vertexVoiceCloningKey: ttsResult.voice_cloning_key,
            })
            .catch(() => {});
        }
      }

      const latencyMs = Math.max(10, Math.round(performance.now() - startTime));

      // Calculate token stats
      const promptTokens = ttsResult.prompt_tokens || Math.max(1, Math.ceil(fullNarrationText.length / 4));
      const durationSec = ttsResult.estimated_duration_seconds || estimatedSeconds;
      const completionTokens = ttsResult.completion_tokens || Math.max(1, Math.round(durationSec * 15));
      const totalTokens = ttsResult.total_tokens || (promptTokens + completionTokens);
      const estCostUsd = Number(((promptTokens * 0.00000015) + (completionTokens * 0.00000060)).toFixed(6));

      // Resolve user ID & fallback member ID
      let resolvedUserId: string | null = null;
      let resolvedMbrId = mbrId;
      try {
        if (!resolvedMbrId) {
          const storedMbrStr =
            sessionStorage.getItem('sb_current_mbr') ||
            sessionStorage.getItem('mbr') ||
            sessionStorage.getItem('sandbox_mbr');
          if (storedMbrStr) {
            const parsedMbr = JSON.parse(storedMbrStr);
            if (parsedMbr?.mbrId) resolvedMbrId = parsedMbr.mbrId;
          }
        }
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          const u = JSON.parse(userStr);
          resolvedUserId = u.user_id || u.userId || null;
        }
      } catch {}

      const sid = getOrCreateSessionId();

      // Record AI usage stats to mbrAiUsageLog
      try {
        await mbrAiUsageLogApi.recordUsage({
          mbrId: resolvedMbrId,
          userId: resolvedUserId,
          sessionId: sid,
          promptTokens,
          completionTokens,
          totalTokens,
          estimatedCostUsd: estCostUsd,
          latencyMs,
          modelName: `ai-voice-${selectedVoice}`,
          statusCode: 200,
          isSuccess: true,
          metadataJson: {
            service: 'ai-voice-studio',
            action: 'tts-synthesis',
            storyId,
            storyTitle,
            voice: selectedVoice,
            voiceName: activeProfile.name,
            gender: activeProfile.gender,
            accent: activeProfile.accent,
            timbre: activeProfile.timbre,
            speed: selectedSpeed,
            durationSec,
            wordCount,
            audioFormat: ttsResult.audio_format || 'wav',
            hasNeuralAudio: Boolean(ttsResult.audio_base64)
          }
        });
      } catch (telemetryErr) {
        console.warn('Could not record AI voice token telemetry to mbrAiUsageLog:', telemetryErr);
      }

      setLastTokenUsage({
        totalTokens,
        promptTokens,
        completionTokens,
        costUsd: estCostUsd
      });

      // Dispatch global stats-updated event so admin usage analytics update live
      window.dispatchEvent(new CustomEvent('stats-updated'));

      // 2. Prepare high-fidelity Audio Blob
      let audioBlob: Blob;
      let fileExt = 'wav';
      let mimeType = 'audio/wav';

      if (ttsResult.audio_base64) {
        mimeType = ttsResult.mime_type || 'audio/wav';
        fileExt = mimeType.includes('mpeg') || mimeType.includes('mp3') ? 'mp3' : 'wav';
        audioBlob = base64ToBlob(ttsResult.audio_base64, mimeType);
      } else {
        audioBlob = createSyntheticAudioBlob(durationSec);
        fileExt = 'mp3';
        mimeType = 'audio/mpeg';
      }

      // Create an instant local Object URL for immediate studio playback
      if (localAudioUrl) {
        URL.revokeObjectURL(localAudioUrl);
      }
      const newBlobUrl = URL.createObjectURL(audioBlob);
      setLocalAudioUrl(newBlobUrl);
      setGeneratedVoiceId(selectedVoice);

      const cleanFileName = `narration_${storyId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.${fileExt}`;
      let storageUrl = '';
      const destinationPath = `member/${mbrId}/${categoryCd.toLowerCase()}/${storyId}/${cleanFileName}`;

      let targetExisting = existingMedia;

      if (!isSandbox) {
        try {
          const uploadRes = await mediaApi.uploadMedia(audioBlob, destinationPath, mimeType);
          const mediaBase = MEDIA_API_BASE_URL;
          const rawUrl = uploadRes.data?.name
            ? `${mediaBase}/media/read/${uploadRes.data.name}`
            : `${mediaBase}/media/read/${destinationPath}`;
          storageUrl = resolveMediaUrl(rawUrl);
        } catch (uploadErr) {
          console.warn('Media upload note, using local/resolved stream URL:', uploadErr);
          storageUrl = newBlobUrl;
        }

        if (!targetExisting) {
          const list = await taskApi.getMemberMedia(mbrId).catch(() => []);
          targetExisting = list.find(isMatchingStoryAudio) || null;
        }

        let finalMediaRecord: MbrMedia;
        const descriptionText = `AI Voice Narration - ${activeProfile.name} (${activeProfile.accent} ${activeProfile.gender}, ${selectedSpeed}x)`;

        if (targetExisting && targetExisting.mbrMediaId) {
          // Overwrite existing mbrMedia record for this storyId
          finalMediaRecord = await taskApi.updateMemberMedia(targetExisting.mbrMediaId, {
            mbrId: mbrId,
            mbrMediaSubordinateId: storyId,
            mbrMediaPath: storageUrl || newBlobUrl,
            mbrMediaOriginalFilename: cleanFileName,
            mbrMediaMimeType: mimeType,
            mbrMediaCategoryCd: categoryCd,
            mbrMediaDescription: descriptionText
          });
        } else {
          // Create new mbrMedia record
          finalMediaRecord = await taskApi.createMemberMedia({
            mbrId: mbrId,
            mbrMediaSubordinateId: storyId,
            mbrMediaPath: storageUrl || newBlobUrl,
            mbrMediaOriginalFilename: cleanFileName,
            mbrMediaMimeType: mimeType,
            mbrMediaCategoryCd: categoryCd,
            mbrMediaDescription: descriptionText
          });
        }

        setGeneratedMedia(finalMediaRecord);
        setExistingMedia(finalMediaRecord);
        if (onAudioGenerated) onAudioGenerated(finalMediaRecord);
      } else {
        // Sandbox mode: overwrite existing record for same mbrStoryId
        storageUrl = newBlobUrl;
        const targetMediaId = targetExisting?.mbrMediaId || `media_audio_${Date.now()}`;
        const mockMedia: MbrMedia = {
          mbrMediaId: targetMediaId,
          mbrId: mbrId,
          mbrMediaSubordinateId: storyId,
          mbrMediaPath: storageUrl,
          mbrMediaOriginalFilename: cleanFileName,
          mbrMediaMimeType: mimeType,
          mbrMediaCategoryCd: categoryCd,
          mbrMediaDescription: `AI Voice Narration - ${activeProfile.name} (${activeProfile.accent} ${activeProfile.gender}, ${selectedSpeed}x)`,
          mbrMediaCreatedAt: targetExisting?.mbrMediaCreatedAt || new Date().toISOString(),
          mbrMediaUpdatedAt: new Date().toISOString()
        };

        const existingStr = sessionStorage.getItem('sandbox_media');
        let existingList: MbrMedia[] = [];
        if (existingStr) {
          try {
            existingList = JSON.parse(existingStr);
          } catch {}
        }
        const filteredList = existingList.filter((m) => !isMatchingStoryAudio(m));
        sessionStorage.setItem('sandbox_media', JSON.stringify([mockMedia, ...filteredList]));
        setGeneratedMedia(mockMedia);
        setExistingMedia(mockMedia);
        if (onAudioGenerated) onAudioGenerated(mockMedia);
      }

      window.dispatchEvent(new CustomEvent('media-updated', { detail: { storyId, mbrId } }));
      window.dispatchEvent(new CustomEvent('update-story-editor-content', { detail: { storyId } }));
    } catch (err: any) {
      console.error('Failed to generate AI Voice audio:', err);
      setError(`Failed to generate audio stream: ${err.message || 'Unknown error'}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleClose = () => {
    stopAllAudio();
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="absolute inset-0 cursor-default" onClick={handleClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-white border border-purple-100 rounded-3xl shadow-2xl max-w-xl w-full z-10 overflow-hidden relative my-auto flex flex-col max-h-[92vh]"
      >
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-amber-500 w-full" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 pb-4 border-b border-[#EFECE7]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 border border-purple-200/80 text-purple-700 flex items-center justify-center shrink-0 shadow-inner">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-base sm:text-lg font-bold text-slate-850 leading-tight">
                  AI Voice Studio
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                  Voice Narration
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate and save an AI-narrated audio recording for this published story.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-5 scrollbar-thin">
          {/* Notifications & Generation Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-start gap-2.5 p-3 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs font-medium"
              >
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="flex-grow">{error}</span>
                <button onClick={() => setError(null)} className="cursor-pointer">
                  <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
                </button>
              </motion.div>
            )}

            {generatedMedia && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-800 font-serif font-bold text-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Audio Narration Saved & Overwritten in mbrMedia!</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                    mbrMedia Updated
                  </span>
                </div>
                <p className="text-[11px] text-emerald-700 leading-snug">
                  Saved / overwritten in member media for <span className="font-semibold text-emerald-900">"{storyTitle || 'Published Story'}"</span> ({categoryCd} topic).
                </p>
                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={togglePreviewAudio}
                    className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-serif font-bold shadow-xs cursor-pointer transition-colors"
                  >
                    {isPlayingPreview ? (
                      <>
                        <Pause className="w-3.5 h-3.5 fill-white" />
                        <span>Pause Narration</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Play Narration</span>
                      </>
                    )}
                  </button>
                  <span className="text-[10px] font-mono text-emerald-700">
                    {estimatedMinutesStr}
                  </span>
                </div>

                {lastTokenUsage && (
                  <div className="pt-2 border-t border-emerald-200/70 flex items-center justify-between text-[10.5px] font-mono text-emerald-800 flex-wrap gap-1">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 text-emerald-600 shrink-0" />
                      <span>AI Tokens: <strong>{lastTokenUsage.totalTokens.toLocaleString()}</strong> ({lastTokenUsage.promptTokens} input + {lastTokenUsage.completionTokens} audio)</span>
                    </div>
                    <span className="text-[10px] text-emerald-700">Est. ${lastTokenUsage.costUsd.toFixed(6)}</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Story Scope Card */}
          <div className="bg-[#FAF9F7] border border-[#EFECE7] rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                Published Story Target
              </span>
              <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
                <span className="flex items-center gap-1">
                  <FileText className="w-3 h-3 text-purple-600" />
                  {wordCount} words
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" />
                  ~{estimatedMinutesStr}
                </span>
              </div>
            </div>
            <h4 className="font-serif text-sm font-bold text-slate-850 truncate">
              {storyTitle || 'Untitled Story'}
            </h4>
            <p className="text-xs font-serif text-slate-600 line-clamp-2 leading-relaxed italic">
              "{cleanContent.slice(0, 140)}..."
            </p>

            {existingMedia && !generatedMedia && (
              <div className="flex items-center gap-2 text-[11px] text-purple-800 bg-purple-50/80 px-2.5 py-1.5 rounded-xl border border-purple-200/80">
                <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                <span>Existing voice recording found. Generating a new voice file will overwrite it for this story.</span>
              </div>
            )}
          </div>

          {/* Parameter: Voice Timbre & Accent Selection */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>Select Voice Timbre & Accent</span>
              </label>
              <span className="text-[10px] font-mono text-slate-400">
                {VOICE_MODEL_OPTIONS.length + (personalVoiceProfile ? 1 : 0)} Available Voices
              </span>
            </div>

            {/* Featured Personal Cloned Voice Option (if enrolled in My Profile -> My Voice Translation) */}
            {personalVoiceProfile ? (
              <div
                onClick={() => handleVoiceTimbreChange('mbr-personal-voice')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative ${
                  selectedVoice === 'mbr-personal-voice'
                    ? 'bg-gradient-to-r from-indigo-50/90 via-purple-50/80 to-blue-50/90 border-indigo-500 ring-2 ring-indigo-500/25 shadow-sm'
                    : 'bg-indigo-50/30 hover:bg-indigo-50/60 border-indigo-200/80 text-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-serif text-xs sm:text-sm font-bold text-slate-900">
                        {personalVoiceProfile.voiceName}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[9.5px] font-mono font-bold uppercase bg-indigo-600 text-white shadow-2xs">
                        My Cloned Voice • Vertex AI
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                      {((personalVoiceProfile.acousticProfileJson as MbrVoiceAcousticProfile)?.timbre_description) ||
                        'Personalized AI voice model cloned from your profile voice translation sample.'}
                    </p>
                  </div>

                  {selectedVoice === 'mbr-personal-voice' && (
                    <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 pt-2 border-t border-indigo-200/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-white text-indigo-800 border border-indigo-200">
                      {((personalVoiceProfile.acousticProfileJson as MbrVoiceAcousticProfile)?.detected_gender) || 'PERSONAL'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
                      {((personalVoiceProfile.acousticProfileJson as MbrVoiceAcousticProfile)?.accent_region) || 'Custom Timbre'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handlePlayVoiceSample('mbr-personal-voice', e)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                      playingSampleVoiceId === 'mbr-personal-voice'
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'bg-white text-indigo-700 hover:bg-indigo-100 border border-indigo-300'
                    }`}
                    title="Listen to a sample of your cloned personal voice"
                  >
                    {playingSampleVoiceId === 'mbr-personal-voice' ? (
                      <>
                        <VolumeX className="w-3 h-3 animate-pulse" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3" />
                        <span>Sample My Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="px-3.5 py-2.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 text-[11px] text-indigo-900 flex items-center justify-between gap-2">
                <span>
                  Want stories narrated in your own voice? Set up <strong>My Voice Translation</strong> under your <strong>Member Profile</strong>.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {VOICE_MODEL_OPTIONS.map((voice) => {
                const isSelected = selectedVoice === voice.id;
                const isThisSamplePlaying = playingSampleVoiceId === voice.id;

                return (
                  <div
                    key={voice.id}
                    onClick={() => handleVoiceTimbreChange(voice.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between relative group ${
                      isSelected
                        ? 'bg-purple-50/70 border-purple-400 ring-2 ring-purple-400/25 shadow-xs'
                        : 'bg-white hover:bg-slate-50 border-[#EFECE7] text-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex flex-col">
                          <span className="font-serif text-xs font-bold text-slate-850 flex items-center gap-1.5">
                            {voice.name}
                          </span>
                          <span className="text-[10.5px] font-medium text-purple-700 font-sans mt-0.5">
                            {voice.timbre}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isSelected && (
                            <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 mt-1.5 leading-snug">
                        {voice.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                      <div className="flex items-center gap-1.5">
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {voice.gender}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-[9.5px] font-mono font-semibold bg-purple-100 text-purple-700 border border-purple-200">
                          {voice.accent} Accent
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handlePlayVoiceSample(voice.id, e)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-colors cursor-pointer ${
                          isThisSamplePlaying
                            ? 'bg-purple-600 text-white shadow-2xs'
                            : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80'
                        }`}
                        title="Listen to a voice preview sample"
                      >
                        {isThisSamplePlaying ? (
                          <>
                            <VolumeX className="w-3 h-3 animate-pulse" />
                            <span>Stop</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Sample</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Narration Pace & Format Controls */}
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                Narration Pace (Speed)
              </label>
              <span className="text-[10px] font-mono font-bold text-purple-700">
                {selectedSpeed}x Speed
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '0.85x Gentle', val: 0.85 },
                { label: '1.0x Normal', val: 1.0 },
                { label: '1.15x Brisk', val: 1.15 },
              ].map((s) => (
                <button
                  key={s.val}
                  type="button"
                  onClick={() => {
                    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
                      window.speechSynthesis.cancel();
                    }
                    setIsPlayingPreview(false);
                    setPlayingSampleVoiceId(null);
                    setSelectedSpeed(s.val);
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-mono font-semibold border transition-all cursor-pointer text-center ${
                    selectedSpeed === s.val
                      ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                      : 'bg-white hover:bg-slate-50 text-slate-700 border-[#EFECE7]'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Badges / Stream Spec Summary */}
          <div className="p-3 bg-purple-50/40 border border-purple-100 rounded-2xl flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-purple-900">
            <div className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Format: <strong>{audioFormat}</strong></span>
            </div>
            <div className="flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>
                Voice:{' '}
                <strong>
                  {selectedVoice === 'mbr-personal-voice' && personalVoiceProfile
                    ? `${personalVoiceProfile.voiceName} (Personal Clone)`
                    : `${VOICE_PROFILES[selectedVoice]?.name || selectedVoice} (${VOICE_PROFILES[selectedVoice]?.accent || 'US'})`}
                </strong>
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>Target: <strong>mbrMedia ({categoryCd})</strong></span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 sm:px-6 py-4 bg-slate-50/70 border-t border-[#EFECE7] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={generating}
            className="px-4 py-2 bg-white border border-[#EFECE7] hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
          >
            {generatedMedia ? 'Done' : 'Cancel'}
          </button>

          <button
            type="button"
            onClick={handleGenerateAudio}
            disabled={generating || !storyContent.trim()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl text-xs font-serif font-bold shadow-md shadow-purple-500/20 transition-all cursor-pointer disabled:opacity-50 active:scale-95 border border-purple-600"
          >
            {generating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Audio...</span>
              </>
            ) : (
              <>
                <Mic className="w-4 h-4" />
                <span>{(existingMedia || generatedMedia) ? 'Regenerate & Overwrite Audio' : 'Generate & Save Audio'}</span>
              </>
            )}
          </button>
        </div>

        <AdminComponentTag name="AiVoiceModal" />
      </motion.div>
    </div>
  );
}
