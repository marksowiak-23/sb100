/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTextToSpeechOptions {
  defaultRate?: number;
  onEnd?: () => void;
  onError?: (err: any) => void;
}

export interface UseTextToSpeechReturn {
  isSupported: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  currentId: string | null;
  currentTitle: string | null;
  playbackRate: number;
  voices: SpeechSynthesisVoice[];
  selectedVoiceURI: string | null;
  progress: number;
  speak: (text: string, id?: string, title?: string) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  togglePlay: (text: string, id?: string, title?: string) => void;
  setPlaybackRate: (rate: number) => void;
  setSelectedVoiceURI: (voiceURI: string) => void;
}

export function useTextToSpeech(options: UseTextToSpeechOptions = {}): UseTextToSpeechReturn {
  const { defaultRate = 1.0, onEnd, onError } = options;

  const [isSupported, setIsSupported] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const [currentTitle, setCurrentTitle] = useState<string | null>(null);
  const [playbackRate, setPlaybackRateState] = useState<number>(defaultRate);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURIState] = useState<string | null>(null);
  const [progress, setProgress] = useState<number>(0);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const textLengthRef = useRef<number>(0);

  // Initialize Speech Synthesis & Voices
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);

      const updateVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        if (availableVoices.length > 0) {
          // Prefer English voices
          const englishVoices = availableVoices.filter((v) =>
            v.lang.startsWith('en')
          );
          const list = englishVoices.length > 0 ? englishVoices : availableVoices;
          setVoices(list);

          // Select preferred natural/default voice if none selected
          if (!selectedVoiceURI) {
            const preferred =
              list.find((v) => v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha') || v.name.includes('Jenny') || v.name.includes('Guy')) ||
              list.find((v) => v.default) ||
              list[0];
            if (preferred) {
              setSelectedVoiceURIState(preferred.voiceURI);
            }
          }
        }
      };

      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;

      return () => {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.onvoiceschanged = null;
          window.speechSynthesis.cancel();
        }
      };
    } else {
      setIsSupported(false);
    }
  }, []);

  // Global stop listener to sync across components
  useEffect(() => {
    const handleGlobalStop = () => {
      stop();
    };
    window.addEventListener('stop-storybook-tts', handleGlobalStop);
    return () => {
      window.removeEventListener('stop-storybook-tts', handleGlobalStop);
    };
  }, []);

  const stop = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentId(null);
    setCurrentTitle(null);
    setProgress(0);
    utteranceRef.current = null;
  }, []);

  const pause = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPlaying) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isPlaying]);

  const resume = useCallback(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window && isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isPaused]);

  const speak = useCallback(
    (text: string, id: string = 'active-story', title?: string) => {
      if (!isSupported || !text || !text.trim()) return;

      // Stop any existing speech across the application
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }

      // Strip basic HTML tags if any
      const cleanText = text.replace(/<[^>]*>?/gm, '').trim();
      textLengthRef.current = cleanText.length;

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = playbackRate;

      if (selectedVoiceURI) {
        const voiceObj = voices.find((v) => v.voiceURI === selectedVoiceURI);
        if (voiceObj) utterance.voice = voiceObj;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setCurrentId(id);
        setCurrentTitle(title || null);
        setProgress(0);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentId(null);
        setCurrentTitle(null);
        setProgress(100);
        if (onEnd) onEnd();
      };

      utterance.onerror = (e) => {
        // Interrupted is normal when user switches or cancels
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          console.warn('Speech synthesis error:', e);
          if (onError) onError(e);
        }
        setIsPlaying(false);
        setIsPaused(false);
        setCurrentId(null);
        setCurrentTitle(null);
        setProgress(0);
      };

      utterance.onboundary = (e) => {
        if (e.name === 'word' && textLengthRef.current > 0) {
          const charIndex = e.charIndex || 0;
          const pct = Math.min(100, Math.round((charIndex / textLengthRef.current) * 100));
          setProgress(pct);
        }
      };

      utteranceRef.current = utterance;
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.resume();
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 50);
      }
    },
    [isSupported, playbackRate, selectedVoiceURI, voices, onEnd, onError]
  );

  const togglePlay = useCallback(
    (text: string, id: string = 'active-story', title?: string) => {
      if (currentId === id && isPlaying) {
        if (isPaused) {
          resume();
        } else {
          pause();
        }
      } else {
        speak(text, id, title);
      }
    },
    [currentId, isPlaying, isPaused, speak, pause, resume]
  );

  const setPlaybackRate = useCallback(
    (rate: number) => {
      setPlaybackRateState(rate);
      if (isPlaying && utteranceRef.current) {
        // Apply for next utterance
      }
    },
    [isPlaying]
  );

  const setSelectedVoiceURI = useCallback((voiceURI: string) => {
    setSelectedVoiceURIState(voiceURI);
  }, []);

  return {
    isSupported,
    isPlaying,
    isPaused,
    currentId,
    currentTitle,
    playbackRate,
    voices,
    selectedVoiceURI,
    progress,
    speak,
    pause,
    resume,
    stop,
    togglePlay,
    setPlaybackRate,
    setSelectedVoiceURI
  };
}
