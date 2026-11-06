/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Square,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Volume2,
  Trash2,
  ShieldCheck,
  Wand2,
  Upload,
  Sliders,
  Radio,
  BookOpen,
} from 'lucide-react';
import {
  mbrVoiceProfileApi,
  voiceCloneApi,
  textToSpeechApi,
  mediaApi,
  taskApi,
  mbrAiUsageLogApi,
  getOrCreateSessionId,
  resolveMediaUrl,
  MEDIA_API_BASE_URL,
  MbrVoiceProfile,
  MbrVoiceAcousticProfile,
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MbrVoiceTranslationPanelProps {
  isSandbox: boolean;
  mbrId: string | null;
  memberFirstName?: string;
}

interface CalibrationScript {
  id: string;
  title: string;
  subtitle: string;
  estimatedSeconds: string;
  text: string;
}

const CONSENT_STATEMENT =
  'I am the owner of this voice and I consent to Google using this voice to create a synthetic voice model.';

const CALIBRATION_SCRIPTS: CalibrationScript[] = [
  {
    id: 'SCRIPT_MEMOIR_01',
    title: 'Script 1: Hometown & Childhood Memories',
    subtitle: 'Warm, reflective storytelling cadence',
    estimatedSeconds: '25–30 sec',
    text: `When I look back on the neighborhood where I grew up, I still remember the sound of screen doors slamming on long summer afternoons and the glow of streetlights coming on at dusk. Every season had its own rhythm—from crisp autumn mornings walking to school, to quiet winter evenings gathered around the kitchen table sharing stories that shaped who we became.`,
  },
  {
    id: 'SCRIPT_MEMOIR_02',
    title: 'Script 2: Family Traditions & Gatherings',
    subtitle: 'Expressive, conversational warmth',
    estimatedSeconds: '25–30 sec',
    text: `In our family, the best conversations always happened in the kitchen while someone was preparing a favorite recipe passed down through generations. There was laughter, gentle teasing, and the unmistakable comfort of being surrounded by people who knew your whole history. Those small, everyday moments are the treasures I want future generations to hear in my own voice.`,
  },
  {
    id: 'SCRIPT_MEMOIR_03',
    title: 'Script 3: Life Lessons & Journeys',
    subtitle: 'Steady, measured narrative presence',
    estimatedSeconds: '25–30 sec',
    text: `Over the years, life has taken me down unexpected roads, teaching me patience, gratitude, and courage along the way. Every challenge brought a new perspective, and every friendship left a lasting mark on my journey. By recording these memories today, I hope to pass along not only the events of my life, but the heart and spirit behind them.`,
  },
];

/**
 * Converts any browser-decoded AudioBuffer into a clean 24,000 Hz 16-bit Mono PCM RIFF WAV Blob + base64 string.
 */
async function convertAudioBlobToWav24kMono(inputBlob: Blob): Promise<{
  wavBlob: Blob;
  wavBase64: string;
  durationSec: number;
}> {
  const arrayBuffer = await inputBlob.arrayBuffer();
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  const audioCtx = new AudioCtx();
  try {
    const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    const targetSampleRate = 24000;
    const targetLength = Math.max(1, Math.ceil(decodedBuffer.duration * targetSampleRate));
    const offlineCtx = new OfflineAudioContext(1, targetLength, targetSampleRate);

    const source = offlineCtx.createBufferSource();
    source.buffer = decodedBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    const renderedBuffer = await offlineCtx.startRendering();
    const channelData = renderedBuffer.getChannelData(0);
    const numSamples = channelData.length;
    const dataByteLength = numSamples * 2;
    const buffer = new ArrayBuffer(44 + dataByteLength);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i));
      }
    };

    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataByteLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // PCM chunk size
    view.setUint16(20, 1, true); // PCM format = 1
    view.setUint16(22, 1, true); // Mono = 1 channel
    view.setUint32(24, targetSampleRate, true);
    view.setUint32(28, targetSampleRate * 2, true); // Byte rate
    view.setUint16(32, 2, true); // Block align
    view.setUint16(34, 16, true); // 16-bit samples
    writeString(36, 'data');
    view.setUint32(40, dataByteLength, true);

    // Normalize peak slightly if very quiet and write 16-bit signed PCM
    let maxPeak = 0;
    for (let i = 0; i < numSamples; i++) {
      const abs = Math.abs(channelData[i]);
      if (abs > maxPeak) maxPeak = abs;
    }
    const gain = maxPeak > 0.02 && maxPeak < 0.85 ? Math.min(2.2, 0.88 / maxPeak) : 1.0;

    let offset = 44;
    for (let i = 0; i < numSamples; i++) {
      const sample = Math.max(-1, Math.min(1, channelData[i] * gain));
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true);
      offset += 2;
    }

    const wavBlob = new Blob([buffer], { type: 'audio/wav' });
    const bytes = new Uint8Array(buffer);
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + chunkSize)));
    }
    const wavBase64 = btoa(binary);
    const durationSec = Math.round((numSamples / targetSampleRate) * 100) / 100;

    return { wavBlob, wavBase64, durationSec };
  } finally {
    try {
      await audioCtx.close();
    } catch {
      // Ignore close errors
    }
  }
}

export default function MbrVoiceTranslationPanel({
  isSandbox,
  mbrId,
  memberFirstName,
}: MbrVoiceTranslationPanelProps) {
  const defaultVoiceName = memberFirstName ? `${memberFirstName}'s Personal Voice` : 'My Personal Voice';

  // --- Profile State ---
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [voiceProfile, setVoiceProfile] = useState<MbrVoiceProfile | null>(null);
  const [voiceNameInput, setVoiceNameInput] = useState(defaultVoiceName);
  const [selectedScriptId, setSelectedScriptId] = useState<string>(CALIBRATION_SCRIPTS[0].id);
  const [fontSizeMode, setFontSizeMode] = useState<'normal' | 'large' | 'xlarge'>('large');

  // --- Recording State ---
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [micLevel, setMicLevel] = useState(0);
  const [recordedWavBlob, setRecordedWavBlob] = useState<Blob | null>(null);
  const [recordedWavBase64, setRecordedWavBase64] = useState<string | null>(null);
  const [recordedPreviewUrl, setRecordedPreviewUrl] = useState<string | null>(null);
  const [recordedDurationSec, setRecordedDurationSec] = useState<number>(0);
  const [hasUnenrolledSample, setHasUnenrolledSample] = useState<boolean>(false);
  const [isPlayingSample, setIsPlayingSample] = useState(false);

  // --- Enrollment & Synthesis Playground State ---
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [testText, setTestText] = useState(
    'Looking back on those years, it warms my heart to share this chapter of my life story with you in my own voice.'
  );
  const [synthesizingTest, setSynthesizingTest] = useState(false);
  const [testAudioUrl, setTestAudioUrl] = useState<string | null>(null);
  const [isPlayingTest, setIsPlayingTest] = useState(false);

  // --- Refs ---
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<number | null>(null);
  const levelIntervalRef = useRef<number | null>(null);
  const analyserContextRef = useRef<AudioContext | null>(null);
  const sampleAudioElRef = useRef<HTMLAudioElement | null>(null);
  const testAudioElRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedScript =
    CALIBRATION_SCRIPTS.find((s) => s.id === selectedScriptId) || CALIBRATION_SCRIPTS[0];

  const fullScriptToRead = `${CONSENT_STATEMENT}\n\n${selectedScript.text}`;

  useEffect(() => {
    if (memberFirstName && (!voiceProfile || voiceNameInput === 'My Personal Voice')) {
      setVoiceNameInput(`${memberFirstName}'s Personal Voice`);
    }
  }, [memberFirstName]);

  useEffect(() => {
    loadExistingVoiceProfile();
    return () => {
      cleanupRecordingResources();
      if (sampleAudioElRef.current) {
        sampleAudioElRef.current.pause();
      }
      if (testAudioElRef.current) {
        testAudioElRef.current.pause();
      }
    };
  }, [mbrId, isSandbox]);

  const cleanupRecordingResources = () => {
    if (timerIntervalRef.current) {
      window.clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (levelIntervalRef.current) {
      window.clearInterval(levelIntervalRef.current);
      levelIntervalRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    if (analyserContextRef.current) {
      analyserContextRef.current.close().catch(() => {});
      analyserContextRef.current = null;
    }
  };

  const loadExistingVoiceProfile = async () => {
    setLoadingProfile(true);
    setError(null);
    try {
      const targetMbrId = mbrId || 'sandbox-mbr';
      const cacheKey = `sb_voice_profile_${targetMbrId}`;

      if (isSandbox) {
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as MbrVoiceProfile;
          setVoiceProfile(parsed);
          setVoiceNameInput(parsed.voiceName || defaultVoiceName);
        }
      } else if (mbrId) {
        const profiles = await mbrVoiceProfileApi.getMemberVoiceProfiles(mbrId);
        if (profiles && profiles.length > 0) {
          const latest = profiles[0];
          setVoiceProfile(latest);
          setVoiceNameInput(latest.voiceName || defaultVoiceName);
          sessionStorage.setItem(cacheKey, JSON.stringify(latest));
        }
      }
    } catch (err: any) {
      console.warn('Could not load existing voice profile:', err);
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleStartRecording = async () => {
    setError(null);
    setSuccess(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 24000,
        },
      });
      mediaStreamRef.current = stream;
      audioChunksRef.current = [];

      // Set up real-time microphone level meter
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      analyserContextRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      levelIntervalRef.current = window.setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        setMicLevel(Math.min(100, Math.round((avg / 128) * 100)));
      }, 80);

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) {
          audioChunksRef.current.push(ev.data);
        }
      };

      recorder.onstop = async () => {
        cleanupRecordingResources();
        setIsRecording(false);
        setMicLevel(0);

        try {
          const rawBlob = new Blob(audioChunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          const { wavBlob, wavBase64, durationSec } = await convertAudioBlobToWav24kMono(rawBlob);
          if (recordedPreviewUrl) {
            URL.revokeObjectURL(recordedPreviewUrl);
          }
          const previewUrl = URL.createObjectURL(wavBlob);
          setRecordedWavBlob(wavBlob);
          setRecordedWavBase64(wavBase64);
          setRecordedPreviewUrl(previewUrl);
          setRecordedDurationSec(durationSec);
          setHasUnenrolledSample(true);
        } catch (convErr: any) {
          console.error('WAV conversion error:', convErr);
          setError('Could not process the recorded audio. Please try recording again.');
        }
      };

      recorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (micErr: any) {
      console.error('Microphone access error:', micErr);
      setError(
        'Microphone access was denied or no microphone was detected. Please allow microphone permissions in your browser or upload a WAV/MP3 voice sample file below.'
      );
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    } else {
      cleanupRecordingResources();
      setIsRecording(false);
    }
  };

  const handleUploadAudioFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSuccess(null);

    try {
      const { wavBlob, wavBase64, durationSec } = await convertAudioBlobToWav24kMono(file);
      if (recordedPreviewUrl) {
        URL.revokeObjectURL(recordedPreviewUrl);
      }
      const previewUrl = URL.createObjectURL(wavBlob);
      setRecordedWavBlob(wavBlob);
      setRecordedWavBase64(wavBase64);
      setRecordedPreviewUrl(previewUrl);
      setRecordedDurationSec(durationSec);
      setHasUnenrolledSample(true);
    } catch (err: any) {
      setError('Could not decode the selected audio file. Please choose a valid WAV, MP3, or M4A recording.');
    } finally {
      e.target.value = '';
    }
  };

  const handlePlaySamplePreview = (urlToPlay?: string | null) => {
    const targetUrl = urlToPlay || recordedPreviewUrl || (voiceProfile ? resolveMediaUrl(voiceProfile.sampleAudioPath) : null);
    if (!targetUrl) return;

    if (isPlayingSample && sampleAudioElRef.current) {
      sampleAudioElRef.current.pause();
      setIsPlayingSample(false);
      return;
    }

    if (sampleAudioElRef.current) {
      sampleAudioElRef.current.pause();
    }

    const audio = new Audio(targetUrl);
    sampleAudioElRef.current = audio;
    audio.onplay = () => setIsPlayingSample(true);
    audio.onended = () => setIsPlayingSample(false);
    audio.onerror = () => {
      setIsPlayingSample(false);
      setError('Could not play back the voice recording preview.');
    };
    audio.play().catch(() => setIsPlayingSample(false));
  };

  const handleEnrollAndSaveVoice = async (): Promise<MbrVoiceProfile | null> => {
    if (!recordedWavBlob || !recordedWavBase64) {
      setError('Please record or upload your voice calibration sample first.');
      return null;
    }
    if (recordedDurationSec < 5) {
      setError('Your voice recording is under 5 seconds. Please record at least 10–30 seconds of the calibration script for accurate voice cloning.');
      return null;
    }

    setEnrolling(true);
    setError(null);
    setSuccess(null);
    const startMs = performance.now();

    try {
      const targetMbrId = mbrId || 'sandbox-mbr';
      const timestamp = Date.now();
      const wavFilename = `voice_sample_${timestamp}.wav`;
      const destinationPath = `member/${targetMbrId}/voice-samples/${wavFilename}`;

      let storageUrl = recordedPreviewUrl || '';
      let sampleMediaId: string | null = null;

      // 1. Upload 24kHz WAV reference audio to Google Cloud Storage (`sb-api-media`)
      if (!isSandbox && mbrId) {
        const wavFile = new File([recordedWavBlob], wavFilename, { type: 'audio/wav' });
        const uploadRes = await mediaApi.uploadMedia(wavFile, destinationPath, 'audio/wav');
        const rawUrl = uploadRes.data?.name
          ? `${MEDIA_API_BASE_URL}/media/read/${uploadRes.data.name}`
          : `${MEDIA_API_BASE_URL}/media/read/${destinationPath}`;
        storageUrl = resolveMediaUrl(rawUrl);

        try {
          const mediaRec = await taskApi.createMemberMedia({
            mbrId,
            mbrMediaPath: storageUrl,
            mbrMediaOriginalFilename: wavFilename,
            mbrMediaMimeType: 'audio/wav',
            mbrMediaCategoryCd: 'VoiceProfile',
            mbrMediaDescription: `Personal AI Voice Cloning Reference Sample (${recordedDurationSec}s)`,
          });
          sampleMediaId = mediaRec.mbrMediaId;
        } catch (mediaDbErr) {
          console.warn('Optional mbrMedia entry creation note:', mediaDbErr);
        }
      }

      // 2. Enroll with Google Cloud / Vertex AI via `sb-api-ai`
      const enrollRes = await voiceCloneApi.enrollVoice({
        audio_base64: recordedWavBase64,
        script_text: fullScriptToRead,
        consent_text: CONSENT_STATEMENT,
        voice_name: voiceNameInput.trim() || defaultVoiceName,
        sample_duration_sec: recordedDurationSec,
      });

      const latencyMs = Math.round(performance.now() - startMs);

      // 3. Log AI token consumption to `mbrAiUsageLog`
      if (!isSandbox && mbrId) {
        const promptTok = enrollRes.prompt_tokens || 250;
        const compTok = enrollRes.completion_tokens || 120;
        const totalTok = enrollRes.tokens_used || promptTok + compTok;
        let userId: string | null = null;
        try {
          const uStr = sessionStorage.getItem('user');
          if (uStr) userId = JSON.parse(uStr)?.user_id || null;
        } catch {
          // ignore
        }

        mbrAiUsageLogApi
          .recordUsage({
            mbrId,
            userId,
            sessionId: getOrCreateSessionId(),
            promptTokens: promptTok,
            completionTokens: compTok,
            totalTokens: totalTok,
            estimatedCostUsd: Number(((totalTok / 1000) * 0.00025).toFixed(6)),
            latencyMs,
            modelName: 'gemini-3.8-flash-tts',
            statusCode: 200,
            isSuccess: true,
            metadataJson: {
              feature: 'mbrVoiceCloneEnroll',
              aiUseTypeCd: 'VOICE_CLONE',
              sampleDurationSec: recordedDurationSec,
              scriptId: selectedScript.id,
              detectedGender: enrollRes.acoustic_profile?.detected_gender,
              anchorVoice: enrollRes.acoustic_profile?.recommended_gemini_anchor,
            },
          })
          .catch((logErr) => console.warn('Voice clone usage log note:', logErr));
      }

      // 4. Persist `MbrVoiceProfile` in PostgreSQL (`sb-api`) and `sessionStorage`
      const profilePayload: Partial<MbrVoiceProfile> = {
        mbrId: targetMbrId,
        voiceName: voiceNameInput.trim() || defaultVoiceName,
        voiceStatusCd: 'READY',
        sampleMediaId,
        sampleAudioPath: storageUrl,
        sampleDurationSec: recordedDurationSec,
        scriptId: selectedScript.id,
        scriptText: fullScriptToRead,
        consentConfirmed: true,
        vertexVoiceCloningKey: enrollRes.voice_cloning_key || null,
        acousticProfileJson: enrollRes.acoustic_profile || {},
        isActive: true,
      };

      let savedProfile: MbrVoiceProfile;
      if (!isSandbox && mbrId) {
        savedProfile = await mbrVoiceProfileApi.saveMemberVoiceProfile(profilePayload);
      } else {
        savedProfile = {
          ...(profilePayload as MbrVoiceProfile),
          mbrVoiceProfileId: voiceProfile?.mbrVoiceProfileId || `vp-${Date.now()}`,
          voiceCreatedAt: voiceProfile?.voiceCreatedAt || new Date().toISOString(),
          voiceUpdatedAt: new Date().toISOString(),
        };
      }

      setVoiceProfile(savedProfile);
      setHasUnenrolledSample(false);
      sessionStorage.setItem(`sb_voice_profile_${targetMbrId}`, JSON.stringify(savedProfile));
      setSuccess(
        `Your personal AI voice ("${savedProfile.voiceName}") has been enrolled with Google Cloud Vertex AI and is now available in the AI Voice Studio!`
      );
      return savedProfile;
    } catch (err: any) {
      console.error('Voice enrollment error:', err);
      setError(err?.message || 'Failed to enroll your voice sample with Vertex AI. Please try again.');
      return null;
    } finally {
      setEnrolling(false);
    }
  };

  const handleToggleVoiceActive = async () => {
    if (!voiceProfile) return;
    const nextActive = !voiceProfile.isActive;
    try {
      const targetMbrId = mbrId || 'sandbox-mbr';
      let updated: MbrVoiceProfile;
      if (!isSandbox && mbrId && voiceProfile.mbrVoiceProfileId) {
        updated = await mbrVoiceProfileApi.updateMemberVoiceProfile(voiceProfile.mbrVoiceProfileId, {
          isActive: nextActive,
          voiceStatusCd: nextActive ? 'READY' : 'DISABLED',
        });
      } else {
        updated = {
          ...voiceProfile,
          isActive: nextActive,
          voiceStatusCd: nextActive ? 'READY' : 'DISABLED',
          voiceUpdatedAt: new Date().toISOString(),
        };
      }
      setVoiceProfile(updated);
      sessionStorage.setItem(`sb_voice_profile_${targetMbrId}`, JSON.stringify(updated));
    } catch (err: any) {
      setError('Failed to update voice profile status.');
    }
  };

  const handleDeleteVoiceProfile = async () => {
    if (!voiceProfile) return;
    try {
      const targetMbrId = mbrId || 'sandbox-mbr';
      if (!isSandbox && mbrId && voiceProfile.mbrVoiceProfileId) {
        await mbrVoiceProfileApi.deleteMemberVoiceProfile(voiceProfile.mbrVoiceProfileId);
      }
      sessionStorage.removeItem(`sb_voice_profile_${targetMbrId}`);
      setVoiceProfile(null);
      setSuccess('Your saved voice profile has been removed.');
    } catch (err: any) {
      setError('Could not delete voice profile.');
    }
  };

  const handleTestClonedVoice = async () => {
    if (!testText.trim()) return;
    setSynthesizingTest(true);
    setError(null);
    const startMs = performance.now();

    try {
      // If the member just recorded or uploaded a new voice script that hasn't been enrolled yet,
      // automatically enroll & save it first so "Speak with My AI Voice" always uses their latest recording/upload.
      let activeProfile = voiceProfile;
      if (hasUnenrolledSample && recordedWavBlob && recordedWavBase64) {
        const newlyEnrolled = await handleEnrollAndSaveVoice();
        if (newlyEnrolled) {
          activeProfile = newlyEnrolled;
        }
      }

      if (!activeProfile && !recordedWavBase64) {
        setError('Please record or upload your voice calibration sample first.');
        return;
      }

      const resolvedSampleUrl = activeProfile?.sampleAudioPath
        ? resolveMediaUrl(activeProfile.sampleAudioPath)
        : null;

      const res = await textToSpeechApi.synthesize({
        text: testText.trim(),
        voice_name: 'mbr-personal-voice',
        persona: activeProfile?.voiceName || voiceNameInput || defaultVoiceName,
        speed: 1.0,
        is_cloned_voice: true,
        voice_cloning_key: activeProfile?.vertexVoiceCloningKey || null,
        reference_audio_base64: recordedWavBase64 || null,
        sample_audio_url: resolvedSampleUrl,
        acoustic_profile: (activeProfile?.acousticProfileJson as Record<string, any>) || null,
      });

      // If the backend upgraded a legacy voice_cloning_key to a native Gemini Replicated Voice key ('voice_...'),
      // persist it to the member's voice profile so future story narrations use it directly.
      if (
        activeProfile &&
        res.voice_cloning_key &&
        res.voice_cloning_key !== activeProfile.vertexVoiceCloningKey
      ) {
        const targetMbrId = mbrId || 'sandbox-mbr';
        const updatedAcoustic = {
          ...((activeProfile.acousticProfileJson as Record<string, any>) || {}),
          enrollment_engine: res.voice_cloning_key.startsWith('voice_')
            ? 'google_voice_replication'
            : ((activeProfile.acousticProfileJson as Record<string, any>)?.enrollment_engine || 'google_voice_replication'),
        };
        const upgradedProfile: MbrVoiceProfile = {
          ...activeProfile,
          vertexVoiceCloningKey: res.voice_cloning_key,
          acousticProfileJson: updatedAcoustic,
          voiceUpdatedAt: new Date().toISOString(),
        };
        setVoiceProfile(upgradedProfile);
        sessionStorage.setItem(`sb_voice_profile_${targetMbrId}`, JSON.stringify(upgradedProfile));
        if (!isSandbox && mbrId && activeProfile.mbrVoiceProfileId) {
          mbrVoiceProfileApi
            .updateMemberVoiceProfile(activeProfile.mbrVoiceProfileId, {
              vertexVoiceCloningKey: res.voice_cloning_key,
              acousticProfileJson: updatedAcoustic,
            })
            .catch(() => {});
        }
      }

      const latencyMs = Math.round(performance.now() - startMs);

      if (!isSandbox && mbrId) {
        const promptTok = res.prompt_tokens || Math.max(1, Math.ceil(testText.length / 4));
        const compTok = res.completion_tokens || 60;
        const totalTok = res.total_tokens || promptTok + compTok;
        let userId: string | null = null;
        try {
          const uStr = sessionStorage.getItem('user');
          if (uStr) userId = JSON.parse(uStr)?.user_id || null;
        } catch {
          // ignore
        }
        mbrAiUsageLogApi
          .recordUsage({
            mbrId,
            userId,
            sessionId: getOrCreateSessionId(),
            promptTokens: promptTok,
            completionTokens: compTok,
            totalTokens: totalTok,
            estimatedCostUsd: Number(((totalTok / 1000) * 0.0003).toFixed(6)),
            latencyMs,
            modelName: 'gemini-3.8-flash-tts',
            statusCode: 200,
            isSuccess: true,
            metadataJson: {
              feature: 'mbrVoiceCloneTestPlayground',
              aiUseTypeCd: 'TTS',
              voiceName: activeProfile?.voiceName || defaultVoiceName,
              voiceCloningKey: res.voice_cloning_key || activeProfile?.vertexVoiceCloningKey,
            },
          })
          .catch(() => {});
      }

      if (res.audio_base64) {
        const mime = res.mime_type || 'audio/wav';
        const dataUrl = `data:${mime};base64,${res.audio_base64}`;
        setTestAudioUrl(dataUrl);

        if (testAudioElRef.current) {
          testAudioElRef.current.pause();
        }
        const audio = new Audio(dataUrl);
        testAudioElRef.current = audio;
        audio.onplay = () => setIsPlayingTest(true);
        audio.onended = () => setIsPlayingTest(false);
        audio.onerror = () => setIsPlayingTest(false);
        await audio.play();
      } else {
        setError('AI voice synthesis returned an empty audio stream.');
      }
    } catch (err: any) {
      console.error('Test cloned voice synthesis error:', err);
      setError('Could not synthesize test audio with your cloned voice.');
    } finally {
      setSynthesizingTest(false);
    }
  };

  const acousticProfile: MbrVoiceAcousticProfile =
    (voiceProfile?.acousticProfileJson as MbrVoiceAcousticProfile) || {};

  if (loadingProfile) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center gap-3 shadow-xs">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-xs font-serif text-slate-500">Loading your personal voice profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Status Banner Alerts */}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="text-xs sm:text-sm font-serif">{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 flex items-center gap-3 shadow-xs">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="text-xs sm:text-sm font-serif">{error}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* ACTIVE VOICE PROFILE SUMMARY CARD (IF ENROLLED)                       */}
      {/* ===================================================================== */}
      {voiceProfile && (
        <div className="bg-gradient-to-br from-indigo-50/90 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/60 rounded-3xl p-6 md:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-indigo-100 dark:border-slate-800">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                    {voiceProfile.voiceName}
                  </h3>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      voiceProfile.isActive
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border border-emerald-300/60'
                        : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {voiceProfile.isActive ? 'Active in AI Voice Studio' : 'Disabled'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-serif mt-0.5">
                  Enrolled with Google Cloud Vertex AI • Reference Sample: {Number(voiceProfile.sampleDurationSec || 0).toFixed(1)}s (24kHz WAV)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => handlePlaySamplePreview(resolveMediaUrl(voiceProfile.sampleAudioPath))}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
              >
                {isPlayingSample ? <Pause className="w-3.5 h-3.5 text-indigo-600" /> : <Play className="w-3.5 h-3.5 text-indigo-600" />}
                <span>{isPlayingSample ? 'Stop Sample' : 'Hear Recorded Sample'}</span>
              </button>

              <button
                type="button"
                onClick={handleToggleVoiceActive}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all cursor-pointer"
              >
                <span>{voiceProfile.isActive ? 'Disable Voice' : 'Enable Voice'}</span>
              </button>

              <button
                type="button"
                onClick={handleDeleteVoiceProfile}
                className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                title="Delete Personal Voice Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Extracted Vertex AI Acoustic Profile Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Detected Vocal Range</div>
              <div className="text-xs font-serif font-bold text-slate-800 dark:text-slate-100 mt-0.5 capitalize">
                {acousticProfile.detected_gender || 'Adult'} • {(acousticProfile.pitch_register || 'Natural').replace(/_/g, ' ')}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Speaking Cadence</div>
              <div className="text-xs font-serif font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                ~{acousticProfile.speaking_rate_wpm || 140} Words / Min
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Dialect / Accent</div>
              <div className="text-xs font-serif font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                {acousticProfile.accent_region || 'General American'}
              </div>
            </div>
            <div className="bg-white/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/70 rounded-2xl p-3">
              <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Google Cloud Voice Engine</div>
              <div className="text-xs font-serif font-bold text-indigo-600 dark:text-indigo-400 mt-0.5">
                {voiceProfile.vertexVoiceCloningKey?.startsWith('voice_') ||
                acousticProfile.enrollment_engine === 'google_voice_replication'
                  ? 'Gemini Voice Replication'
                  : acousticProfile.enrollment_engine === 'vertex_chirp3_instant_voice'
                  ? 'Chirp 3: HD Instant Voice'
                  : `Gemini Voice Clone (${acousticProfile.recommended_gemini_anchor || 'Custom'})`}
              </div>
            </div>
          </div>

          {acousticProfile.timbre_description && (
            <div className="text-xs font-serif text-slate-600 dark:text-slate-300 bg-white/70 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200/60 dark:border-slate-700/60">
              <span className="font-bold text-slate-800 dark:text-white">Vocal Timbre Analysis: </span>
              {acousticProfile.timbre_description}
            </div>
          )}

          {/* Live Test Playground */}
          <div className="pt-2 border-t border-indigo-100 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-serif font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Wand2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Test Your Personal AI Voice</span>
              </label>
              <span className="text-[11px] text-slate-400 font-serif">
                Type any sentence below to hear your cloned AI voice narrate it
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <textarea
                rows={2}
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="flex-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-xs sm:text-sm font-serif text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter a sentence to test your cloned voice..."
              />
              <button
                type="button"
                onClick={handleTestClonedVoice}
                disabled={synthesizingTest || !testText.trim()}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 text-white shadow-md shadow-indigo-600/20 transition-all cursor-pointer shrink-0"
              >
                {synthesizingTest ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Synthesizing...</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4" />
                    <span>Speak with My AI Voice</span>
                  </>
                )}
              </button>
            </div>

            {testAudioUrl && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 bg-indigo-50/50 dark:bg-slate-800/60 p-3 rounded-2xl border border-indigo-100 dark:border-slate-700">
                <span className="text-[11px] font-mono text-indigo-700 dark:text-indigo-300 font-semibold shrink-0">
                  Personal AI Voice Audio:
                </span>
                <audio
                  controls
                  src={testAudioUrl}
                  className="w-full h-8"
                  aria-label="Synthesized Personal AI Voice Audio"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* VOICE RECORDING & TELEPROMPTER STUDIO                                 */}
      {/* ===================================================================== */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mic className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-slate-900 dark:text-white">
                {voiceProfile ? 'Re-Record or Update Your Voice Sample' : 'Record Your Personal Voice Sample'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-serif">
                Read the guided script below in your natural storytelling voice (recommended 20–35 seconds in a quiet room).
              </p>
            </div>
          </div>

          {/* Voice Display Label Input */}
          <div className="w-full sm:w-64">
            <label className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1">
              Voice Label in AI Voice Studio
            </label>
            <input
              type="text"
              value={voiceNameInput}
              onChange={(e) => setVoiceNameInput(e.target.value)}
              maxLength={80}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-serif font-semibold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Mark's Personal Voice"
            />
          </div>
        </div>

        {/* Step 1: Select Calibration Script & Teleprompter Controls */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <label className="text-xs font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Step 1: Choose a Calibration Script to Read Aloud</span>
            </label>

            {/* Font size selector for comfortable reading */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-400 font-serif mr-1">Teleprompter Size:</span>
              {(['normal', 'large', 'xlarge'] as const).map((sz) => (
                <button
                  key={sz}
                  type="button"
                  onClick={() => setFontSizeMode(sz)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-serif font-semibold transition-all cursor-pointer ${
                    fontSizeMode === sz
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                  }`}
                >
                  {sz === 'normal' ? 'A' : sz === 'large' ? 'A+' : 'A++'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CALIBRATION_SCRIPTS.map((script) => {
              const isSelected = script.id === selectedScriptId;
              return (
                <button
                  key={script.id}
                  type="button"
                  onClick={() => setSelectedScriptId(script.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-400 dark:border-blue-700 shadow-xs'
                      : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-serif font-bold text-slate-900 dark:text-white">
                      {script.title}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700 shrink-0">
                      {script.estimatedSeconds}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 font-serif mt-1">
                    {script.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Teleprompter Reader Box */}
        <div className="rounded-3xl bg-amber-50/60 dark:bg-slate-800/70 border-2 border-amber-200/80 dark:border-slate-700 p-6 md:p-8 space-y-4 shadow-inner">
          <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-amber-900 dark:text-amber-300">
                Guided Voice Teleprompter — Read Aloud When Recording Starts
              </span>
            </div>
            <span className="text-[11px] font-mono font-medium text-amber-700 dark:text-amber-400 bg-amber-100/70 dark:bg-amber-950/50 px-2 py-0.5 rounded-md">
              Spoken Consent Required
            </span>
          </div>

          <div
            className={`font-serif leading-relaxed text-slate-900 dark:text-slate-100 space-y-4 ${
              fontSizeMode === 'normal'
                ? 'text-base'
                : fontSizeMode === 'large'
                ? 'text-lg sm:text-xl'
                : 'text-xl sm:text-2xl'
            }`}
          >
            <p className="text-indigo-900 dark:text-indigo-300 font-semibold italic border-l-4 border-indigo-400 pl-4 py-1">
              "{CONSENT_STATEMENT}"
            </p>
            <p className="leading-loose">"{selectedScript.text}"</p>
          </div>
        </div>

        {/* Step 2: Recorder Controls & Live Waveform Meter */}
        <div className="space-y-2">
          <label className="text-xs font-serif font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Mic className="w-4 h-4 text-rose-600" />
            <span>Step 2: Click the start recording script button and read the above script and then click stop when complete.</span>
          </label>

          <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-wrap">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={handleStartRecording}
                  disabled={enrolling}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-md shadow-rose-600/25 transition-all cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                  <span>{recordedWavBlob ? 'Record Again' : 'Start Recording Script'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStopRecording}
                  className="inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-slate-900 hover:bg-slate-800 dark:bg-white dark:text-slate-900 text-white shadow-md transition-all cursor-pointer animate-pulse"
                >
                  <Square className="w-4 h-4 fill-current" />
                  <span>Stop Recording ({recordingSeconds}s)</span>
                </button>
              )}

              {/* Optional file upload fallback */}
              <input
                ref={fileInputRef}
                type="file"
                accept="audio/wav,audio/mpeg,audio/mp3,audio/mp4,audio/x-m4a,audio/webm"
                onChange={handleUploadAudioFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isRecording || enrolling}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4 text-blue-600" />
                <span>Or Upload Voice Audio File</span>
              </button>

              {recordedPreviewUrl && !isRecording && (
                <button
                  type="button"
                  onClick={() => handlePlaySamplePreview(recordedPreviewUrl)}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition-all cursor-pointer"
                >
                  {isPlayingSample ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  <span>
                    {isPlayingSample ? 'Stop Preview' : `Listen to Recording (${recordedDurationSec}s)`}
                  </span>
                </button>
              )}
            </div>

            {/* Live Microphone Level Bar */}
            <div className="w-full md:w-64 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                <span>{isRecording ? 'LIVE MIC LEVEL' : '24kHz MONO PCM WAV'}</span>
                <span>
                  {isRecording
                    ? `${recordingSeconds}s / 30s target`
                    : recordedDurationSec > 0
                    ? `${recordedDurationSec}s ready`
                    : 'Idle'}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 rounded-full ${
                    isRecording ? 'bg-rose-500' : recordedDurationSec > 0 ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                  style={{
                    width: isRecording
                      ? `${Math.max(8, micLevel)}%`
                      : recordedDurationSec > 0
                      ? '100%'
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Step 3: Save & Enroll Button */}
          {recordedWavBlob && !isRecording && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2.5 text-xs font-serif text-slate-600 dark:text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Lossless 24kHz WAV sample captured ({recordedDurationSec}s). Ready to enroll with Google Cloud Vertex AI.
                </span>
              </div>

              <button
                type="button"
                onClick={handleEnrollAndSaveVoice}
                disabled={enrolling}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-600/25 transition-all cursor-pointer"
              >
                {enrolling ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Enrolling Voice with Vertex AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Save & Activate My AI Voice</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>

      <AdminComponentTag name="MbrVoiceTranslationPanel.tsx" />
    </div>
  );
}

