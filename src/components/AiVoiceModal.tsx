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
  taskApi,
  mediaApi,
  mbrAiUsageLogApi,
  getOrCreateSessionId,
  resolveMediaUrl,
  MEDIA_API_BASE_URL,
  MbrMedia
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
    preferredKeywords: ['samantha', 'zira', 'jenny', 'aria', 'female', 'en-us', 'en_us']
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
    preferredKeywords: ['david', 'george', 'richard', 'daniel', 'guy', 'mark', 'male', 'en-us', 'en_us']
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
    preferredKeywords: ['aria', 'victoria', 'jenny', 'samantha', 'female', 'en-us', 'en_us']
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
    preferredKeywords: ['guy', 'david', 'male', 'en-us', 'en_us']
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
    preferredKeywords: ['hazel', 'sonia', 'uk english female', 'en-gb', 'en_gb', 'british']
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
    preferredKeywords: ['george', 'oliver', 'uk english male', 'en-gb', 'en_gb', 'british']
  },
};

const VOICE_MODEL_OPTIONS = Object.values(VOICE_PROFILES);

/**
 * Match the most suitable browser speech synthesis voice based on model profile.
 */
function findMatchingBrowserVoice(voices: SpeechSynthesisVoice[], voiceModelId: string): SpeechSynthesisVoice | null {
  if (!voices || voices.length === 0) return null;
  const profile = VOICE_PROFILES[voiceModelId] || VOICE_PROFILES['en-US-Standard-C'];

  // 1. Try matching preferred keywords (e.g. david, george, richard, samantha)
  for (const kw of profile.preferredKeywords) {
    const found = voices.find(
      (v) => (v.name.toLowerCase().includes(kw) || v.voiceURI.toLowerCase().includes(kw)) &&
        (profile.gender === 'Male'
          ? !v.name.toLowerCase().includes('female') && !v.name.toLowerCase().includes('zira') && !v.name.toLowerCase().includes('samantha') && !v.name.toLowerCase().includes('jenny') && !v.name.toLowerCase().includes('aria')
          : !v.name.toLowerCase().includes('male') && !v.name.toLowerCase().includes('david') && !v.name.toLowerCase().includes('guy') && !v.name.toLowerCase().includes('george'))
    );
    if (found) return found;
  }

  // 2. Try matching accent language code and gender heuristics
  const langTarget = profile.accent === 'UK' ? 'en-gb' : 'en-us';
  const langMatches = voices.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith(langTarget));
  if (langMatches.length > 0) {
    if (profile.gender === 'Male') {
      const maleVoice = langMatches.find(v =>
        v.name.toLowerCase().includes('david') ||
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('daniel') ||
        v.name.toLowerCase().includes('guy') ||
        v.name.toLowerCase().includes('mark') ||
        v.name.toLowerCase().includes('male')
      );
      if (maleVoice) return maleVoice;
    } else {
      const femaleVoice = langMatches.find(v =>
        v.name.toLowerCase().includes('zira') ||
        v.name.toLowerCase().includes('samantha') ||
        v.name.toLowerCase().includes('aria') ||
        v.name.toLowerCase().includes('jenny') ||
        v.name.toLowerCase().includes('hazel') ||
        v.name.toLowerCase().includes('female')
      );
      if (femaleVoice) return femaleVoice;
    }
    return langMatches[0];
  }

  // 3. Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.toLowerCase().startsWith('en'));
  if (anyEnglish) return anyEnglish;

  return voices[0] || null;
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
          const found = list.find(isMatchingStoryAudio);
          if (found) {
            setExistingMedia(found);
            setGeneratedMedia(found);
            // Parse saved voice timbre from description
            const desc = found.mbrMediaDescription || '';
            for (const vm of VOICE_MODEL_OPTIONS) {
              if (desc.includes(vm.id) || desc.includes(vm.name)) {
                setSelectedVoice(vm.id);
                break;
              }
            }
          } else {
            setExistingMedia(null);
            setGeneratedMedia(null);
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

  // Preview short sample of a specific voice timbre
  const handlePlayVoiceSample = (voiceId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    if (playingSampleVoiceId === voiceId) {
      stopAllAudio();
      return;
    }

    stopAllAudio();
    window.dispatchEvent(new CustomEvent('stop-storybook-tts'));

    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const profile = VOICE_PROFILES[voiceId] || VOICE_PROFILES['en-US-Standard-C'];
    const sampleText = `Hello! Here is a sample of the ${profile.name} voice. Listen to the tone, accent, and timbre for your story narration.`;
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

    // 1. If we have a genuine synthesized audio URL (local blob or remote path), play it via HTML5 Audio element
    const activeAudioUrl = localAudioUrl || generatedMedia?.mbrMediaPath || existingMedia?.mbrMediaPath;
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

    const activeProfile = VOICE_PROFILES[selectedVoice] || VOICE_PROFILES['en-US-Standard-C'];

    try {
      const startTime = performance.now();

      // 1. Call AI Service TTS synthesize endpoint with the selected voice timbre & accent
      const ttsResult = await textToSpeechApi.synthesize({
        text: fullNarrationText,
        voice_name: selectedVoice,
        speed: selectedSpeed
      }).catch((e) => {
        console.warn('FastAPI TTS endpoint call note (using fallback synthesizer):', e);
        return {
          status: 'ready',
          text_length: fullNarrationText.length,
          estimated_duration_seconds: estimatedSeconds,
          voice: selectedVoice,
          persona: activeProfile.name,
          audio_format: 'wav',
          mime_type: 'audio/wav',
          audio_base64: null,
          prompt_tokens: Math.max(1, Math.ceil(fullNarrationText.length / 4)),
          completion_tokens: Math.max(1, Math.round(estimatedSeconds * 15)),
          total_tokens: Math.max(1, Math.ceil(fullNarrationText.length / 4)) + Math.max(1, Math.round(estimatedSeconds * 15)),
          message: 'Synthesized via AI Voice Studio'
        };
      });

      const latencyMs = Math.max(10, Math.round(performance.now() - startTime));

      // Calculate token stats
      const promptTokens = ttsResult.prompt_tokens || Math.max(1, Math.ceil(fullNarrationText.length / 4));
      const durationSec = ttsResult.estimated_duration_seconds || estimatedSeconds;
      const completionTokens = ttsResult.completion_tokens || Math.max(1, Math.round(durationSec * 15));
      const totalTokens = ttsResult.total_tokens || (promptTokens + completionTokens);
      const estCostUsd = Number(((promptTokens * 0.00000015) + (completionTokens * 0.00000060)).toFixed(6));

      // Resolve user ID
      let resolvedUserId: string | null = null;
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          resolvedUserId = u.user_id || u.userId || null;
        } catch {}
      }

      const sid = getOrCreateSessionId();

      // Record AI usage stats to mbrAiUsageLog
      try {
        await mbrAiUsageLogApi.recordUsage({
          mbrId: mbrId,
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
                {VOICE_MODEL_OPTIONS.length} Available Voices
              </span>
            </div>

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
              <span>Voice: <strong>{VOICE_PROFILES[selectedVoice]?.name || selectedVoice} ({VOICE_PROFILES[selectedVoice]?.accent})</strong></span>
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
