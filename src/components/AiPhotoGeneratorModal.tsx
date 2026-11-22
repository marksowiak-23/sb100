/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  X,
  Check,
  Trash2,
  Send,
  Loader2,
  Film,
  Image as ImageIcon,
  RefreshCw,
  Wand2,
  MessageSquare,
  Save,
  AlertCircle,
  CheckCircle2,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import {
  aiPhotoApi,
  AiPhotoUsage,
  eventApi,
  mbrAiUsageLogApi,
  mediaApi,
  taskApi,
  getOrCreateSessionId,
  resolveMediaUrl,
  MEDIA_API_BASE_URL,
  MbrMedia,
} from '@/src/services/api';
import { renderAnimatedGifBlob, PhotoMotionStyle } from '@/src/utils/animateImageToGif';
import { playUiSound } from '@/src/services/soundService';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface AiPhotoGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyId: string;
  storyTitle: string;
  storyContent: string;
  mbrId: string;
  categoryCd: string;
  isSandbox?: boolean;
  onPhotosSaved?: (savedMedia: MbrMedia[]) => void;
  onAiImageDateUpdated?: (aiImageDate: string) => void;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

interface GeneratedPhotoCard {
  id: string;
  index: number;
  title: string;
  caption: string;
  prompt: string;
  animatable: boolean;
  motionStyle: PhotoMotionStyle;
  motionReason: string;
  isAnimated: boolean;
  animatedPreviewUrl?: string;
  animatedBlob?: Blob;
  isAnimating?: boolean;
  imageBase64?: string;
  mimeType: string;
  dataUrl?: string;
  status: 'pending' | 'generating' | 'ready' | 'refining' | 'error';
  errorMsg?: string;
  selected: boolean;
  version: number;
  chatHistory: ChatMessage[];
}

const STYLE_OPTIONS = [
  // Contemporary / Current-Day Styles (Ultra-Crisp, Zero Grain)
  {
    id: 'ultra-sharp contemporary full-frame DSLR photography, crystal-clear optical focus, rich dynamic range, clean zero noise, no film grain',
    label: 'Ultra-Crisp Modern DSLR',
  },
  {
    id: 'contemporary lifestyle editorial magazine photography, bright airy natural daylight, crisp fine detail, clean modern color grading, no grain',
    label: 'Modern Lifestyle Editorial',
  },
  {
    id: 'contemporary cinematic 8K cinema still, tack-sharp focus, shallow depth of field, rich natural color, studio-grade lighting, clean digital clarity',
    label: 'Cinematic 8K Still',
  },
  {
    id: 'ultra-high-resolution contemporary travel and nature photography, vivid true-to-life colors, razor-sharp clarity, crisp natural light',
    label: 'Vibrant Modern Travel',
  },
  {
    id: 'modern minimalist contemporary photography, soft natural window light, crisp clean composition, ultra-high definition, zero grain',
    label: 'Modern Minimalist',
  },
  {
    id: 'contemporary golden hour photography, luminous warm sunset glow, razor-sharp full-frame DSLR clarity, clean zero-grain output',
    label: 'Contemporary Golden Hour',
  },
  // Classic & Artistic Heirloom Styles
  {
    id: 'warm editorial medium-format photography, natural lighting, crisp high resolution, rich tones',
    label: 'Warm Editorial Medium-Format',
  },
  {
    id: 'authentic 1970s Kodachrome color photograph, sharp medium-format detail, nostalgic warm palette',
    label: 'Vintage 1970s Kodachrome',
  },
  {
    id: 'museum-grade fine-art heirloom oil painting, luminous brushwork, high-resolution gallery canvas detail',
    label: 'Heirloom Oil Painting',
  },
  {
    id: 'delicate high-resolution storybook watercolor illustration, crisp detail and luminous washes',
    label: 'Watercolor Storybook',
  },
  {
    id: 'high-resolution fine-art monochrome black and white photography, crisp micro-contrast, Leica clarity',
    label: 'Timeless Black & White',
  },
];

const MOTION_OPTIONS: { id: PhotoMotionStyle; label: string }[] = [
  { id: 'ken_burns_zoom', label: 'Cinematic Zoom' },
  { id: 'gentle_pan', label: 'Gentle Pan' },
  { id: 'cinematic_drift', label: 'Living Drift' },
  { id: 'warm_glow', label: 'Warm Sunbeam' },
];

const QUICK_REFINEMENT_CHIPS = [
  'Make it ultra-crisp daylight with vibrant modern colors',
  'Make the lighting warmer and more golden hour',
  'Zoom out slightly to show more of the setting',
  'Sharpen fine details and make it look like a contemporary DSLR photo',
  'Make the mood cozier and more intimate',
  'Add a subtle nostalgic 1970s vintage warmth',
];

const isUuid = (val?: string | null): boolean =>
  Boolean(val && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val));

function base64ToBlob(base64: string, mimeType: string): Blob {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mimeType });
}

export default function AiPhotoGeneratorModal({
  isOpen,
  onClose,
  storyId,
  storyTitle,
  storyContent,
  mbrId,
  categoryCd,
  isSandbox = false,
  onPhotosSaved,
  onAiImageDateUpdated,
}: AiPhotoGeneratorModalProps) {
  const [photos, setPhotos] = useState<GeneratedPhotoCard[]>([]);
  const [selectedStyle, setSelectedStyle] = useState<string>(STYLE_OPTIONS[0].id);
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveProgress, setSaveProgress] = useState<{ current: number; total: number } | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [globalStatus, setGlobalStatus] = useState<string | null>(null);
  const [hasAutoGeneratedForSession, setHasAutoGeneratedForSession] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const abortGenerationRef = useRef<boolean>(false);

  const activePhoto = photos.find((p) => p.id === activePhotoId) || photos[0] || null;
  const selectedCount = photos.filter((p) => p.selected && p.status === 'ready').length;
  const animatedSelectedCount = photos.filter((p) => p.selected && p.status === 'ready' && p.isAnimated).length;
  const readyCount = photos.filter((p) => p.status === 'ready').length;
  const anyGenerating = planning || photos.some((p) => p.status === 'generating' || p.status === 'pending' || p.status === 'refining');

  // Helper to record AI usage to mbrAiUsageLog
  const recordAiUsage = useCallback(
    async (usage: AiPhotoUsage | undefined, action: string, extraMeta?: Record<string, any>) => {
      if (isSandbox || !mbrId || !isUuid(mbrId) || !usage) return;
      try {
        let userId: string | null = null;
        try {
          const userStr = sessionStorage.getItem('user');
          if (userStr) {
            const u = JSON.parse(userStr);
            userId = u?.user_id || u?.id || null;
          }
        } catch {}

        await mbrAiUsageLogApi.recordUsage({
          mbrId,
          userId: userId && isUuid(userId) ? userId : null,
          sessionId: getOrCreateSessionId(),
          promptTokens: usage.prompt_tokens || 0,
          completionTokens: usage.completion_tokens || 0,
          totalTokens: usage.total_tokens || 0,
          estimatedCostUsd: usage.estimated_cost_usd || 0,
          latencyMs: usage.latency_ms || 0,
          modelName: usage.model_name || 'gemini-2.5-flash-image',
          statusCode: 200,
          isSuccess: true,
          metadataJson: {
            feature: 'AI_PHOTO_GENERATOR',
            action,
            storyId,
            storyTitle,
            ...extraMeta,
          },
        });
      } catch (err) {
        console.warn('Could not record AI photo usage log:', err);
      }
    },
    [isSandbox, mbrId, storyId, storyTitle]
  );

  // Clean up object URLs on unmount
  useEffect(() => {
    return () => {
      abortGenerationRef.current = true;
      photos.forEach((p) => {
        if (p.animatedPreviewUrl) {
          try {
            URL.revokeObjectURL(p.animatedPreviewUrl);
          } catch {}
        }
      });
    };
  }, []);

  // Scroll chat to bottom when active photo's history updates
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activePhoto?.chatHistory.length, activePhotoId]);

  const generateAllSixPhotos = useCallback(
    async (styleOverride?: string) => {
      const styleToUse = styleOverride || selectedStyle;
      const cleanStory = (storyContent || '').replace(/<[^>]+>/g, ' ').replace(/<!--.*?-->/gs, ' ').trim();
      if (!cleanStory && !storyTitle.trim()) {
        setGlobalError('Please write a bit of your story first so the AI can illustrate it.');
        return;
      }

      abortGenerationRef.current = false;
      setGlobalError(null);
      setGlobalStatus('Analyzing your story to design 6 distinct visual moments...');
      setPlanning(true);

      // Revoke old animated preview URLs
      setPhotos((prev) => {
        prev.forEach((p) => {
          if (p.animatedPreviewUrl) {
            try {
              URL.revokeObjectURL(p.animatedPreviewUrl);
            } catch {}
          }
        });
        return [];
      });

      try {
        const planRes = await aiPhotoApi.planScenes({
          story_title: storyTitle || 'Untitled Story',
          story_content: cleanStory || storyTitle,
          count: 6,
          style_preference: styleToUse,
        });

        if (abortGenerationRef.current) return;

        void recordAiUsage(planRes.usage, 'PLAN_SCENES', {
          plannedCount: planRes.scenes.length,
          style: styleToUse,
        });

        const initialCards: GeneratedPhotoCard[] = planRes.scenes.map((sc, idx) => ({
          id: `ai-photo-${Date.now()}-${idx}`,
          index: idx,
          title: sc.title,
          caption: sc.caption,
          prompt: sc.prompt,
          animatable: sc.animatable,
          motionStyle: (['ken_burns_zoom', 'gentle_pan', 'cinematic_drift', 'warm_glow'].includes(sc.suggested_motion)
            ? sc.suggested_motion
            : 'ken_burns_zoom') as PhotoMotionStyle,
          motionReason: sc.motion_reason || 'Subtle cinematic motion enhances this scene.',
          isAnimated: false,
          mimeType: 'image/png',
          status: 'pending',
          selected: true,
          version: 1,
          chatHistory: [
            {
              id: `sys-${idx}`,
              role: 'assistant',
              text: `Scene ${idx + 1}: "${sc.title}" — ${sc.caption} Ask me to refine lighting, era, framing, or details anytime.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            },
          ],
        }));

        setPhotos(initialCards);
        setActivePhotoId(initialCards[0]?.id || null);
        setPlanning(false);
        setGlobalStatus('Generating 6 custom photographs from your story...');

        // Log generation batch event
        eventApi
          .logEvent({
            eventSiteCd: 'SB',
            eventActorId: mbrId || undefined,
            eventActorTypeCd: 'MBR',
            eventCd: 'AI_PHOTO_GENERATE',
            eventDetail: `Member started AI Photo Generation (6 scenes) for story '${storyTitle || storyId}'`,
            eventTagValue: {
              mbrStoryId: storyId || undefined,
              storyTitle: storyTitle || undefined,
              count: initialCards.length,
              style: styleToUse,
              isSandbox,
            },
          })
          .catch(() => {});

        // Generate in parallel batches of 3 for snappy progressive rendering
        const batchSize = 3;
        for (let i = 0; i < initialCards.length; i += batchSize) {
          if (abortGenerationRef.current) return;
          const batch = initialCards.slice(i, i + batchSize);

          setPhotos((prev) =>
            prev.map((p) => (batch.some((b) => b.id === p.id) ? { ...p, status: 'generating' } : p))
          );

          await Promise.all(
            batch.map(async (card) => {
              if (abortGenerationRef.current) return;
              try {
                const genRes = await aiPhotoApi.generatePhoto({
                  prompt: card.prompt,
                  style_hint: styleToUse,
                });
                if (abortGenerationRef.current) return;

                const dataUrl = `data:${genRes.mime_type};base64,${genRes.image_base64}`;
                setPhotos((prev) =>
                  prev.map((p) =>
                    p.id === card.id
                      ? {
                          ...p,
                          imageBase64: genRes.image_base64,
                          mimeType: genRes.mime_type,
                          dataUrl,
                          status: 'ready',
                        }
                      : p
                  )
                );

                void recordAiUsage(genRes.usage, 'GENERATE_IMAGE', {
                  sceneIndex: card.index,
                  sceneTitle: card.title,
                  style: styleToUse,
                });
              } catch (genErr: any) {
                if (abortGenerationRef.current) return;
                setPhotos((prev) =>
                  prev.map((p) =>
                    p.id === card.id
                      ? {
                          ...p,
                          status: 'error',
                          selected: false,
                          errorMsg: genErr?.message || 'Generation failed',
                        }
                      : p
                  )
                );
              }
            })
          );
        }

        if (!abortGenerationRef.current) {
          setGlobalStatus('All 6 story photos are ready! Refine any image in chat, animate scenes, or select photos to save.');
          playUiSound('AUDIO_GENERATE');
        }
      } catch (err: any) {
        setPlanning(false);
        setGlobalStatus(null);
        setGlobalError(err?.message || 'Could not generate AI photos for this story.');
      }
    },
    [selectedStyle, storyContent, storyTitle, storyId, mbrId, isSandbox, recordAiUsage]
  );

  // Auto-generate 6 photos when dialog opens for the first time
  useEffect(() => {
    if (isOpen && !hasAutoGeneratedForSession) {
      setHasAutoGeneratedForSession(true);
      void generateAllSixPhotos();
    }
    if (!isOpen) {
      abortGenerationRef.current = true;
    }
  }, [isOpen, hasAutoGeneratedForSession, generateAllSixPhotos]);

  // Reset session flag if story changes
  useEffect(() => {
    setHasAutoGeneratedForSession(false);
    setPhotos([]);
    setActivePhotoId(null);
    setGlobalError(null);
    setGlobalStatus(null);
  }, [storyId]);

  const handleRefinePhoto = async (instructionOverride?: string) => {
    const target = activePhoto;
    const instruction = (instructionOverride ?? chatInput).trim();
    if (!target || !instruction || target.status === 'generating' || target.status === 'refining') return;

    setChatInput('');
    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: instruction,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setPhotos((prev) =>
      prev.map((p) =>
        p.id === target.id
          ? {
              ...p,
              status: 'refining',
              errorMsg: undefined,
              chatHistory: [...p.chatHistory, userMsg],
            }
          : p
      )
    );

    try {
      const genRes = await aiPhotoApi.generatePhoto({
        prompt: target.prompt,
        refinement_instruction: instruction,
        reference_image_base64: target.imageBase64,
        reference_mime_type: target.mimeType,
        style_hint: selectedStyle,
      });

      const newDataUrl = `data:${genRes.mime_type};base64,${genRes.image_base64}`;
      let newAnimPreviewUrl: string | undefined;
      let newAnimBlob: Blob | undefined;

      // If this photo was already animated, regenerate the animated GIF from the refined image
      if (target.isAnimated) {
        try {
          newAnimBlob = await renderAnimatedGifBlob(newDataUrl, target.motionStyle);
          newAnimPreviewUrl = URL.createObjectURL(newAnimBlob);
        } catch {}
      }

      const aiMsg: ChatMessage = {
        id: `a-${Date.now()}`,
        role: 'assistant',
        text: `Updated "${target.title}" (v${target.version + 1}) based on your feedback. Let me know if you'd like any further adjustments!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== target.id) return p;
          if (p.animatedPreviewUrl && newAnimPreviewUrl) {
            try {
              URL.revokeObjectURL(p.animatedPreviewUrl);
            } catch {}
          }
          return {
            ...p,
            imageBase64: genRes.image_base64,
            mimeType: genRes.mime_type,
            dataUrl: newDataUrl,
            animatedPreviewUrl: p.isAnimated ? newAnimPreviewUrl : undefined,
            animatedBlob: p.isAnimated ? newAnimBlob : undefined,
            status: 'ready',
            selected: true,
            version: p.version + 1,
            chatHistory: [...p.chatHistory, aiMsg],
          };
        })
      );

      void recordAiUsage(genRes.usage, 'REFINE_IMAGE', {
        sceneTitle: target.title,
        instruction,
        version: target.version + 1,
      });

      eventApi
        .logEvent({
          eventSiteCd: 'SB',
          eventActorId: mbrId || undefined,
          eventActorTypeCd: 'MBR',
          eventCd: 'AI_PHOTO_REFINE',
          eventDetail: `Member refined AI photo '${target.title}' for story '${storyTitle || storyId}'`,
          eventTagValue: {
            mbrStoryId: storyId || undefined,
            sceneTitle: target.title,
            instruction,
            version: target.version + 1,
          },
        })
        .catch(() => {});

      playUiSound('SOFT_POP');
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `I couldn't apply that refinement (${err?.message || 'error'}). Try rephrasing your request.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === target.id
            ? {
                ...p,
                status: p.dataUrl ? 'ready' : 'error',
                chatHistory: [...p.chatHistory, errMsg],
              }
            : p
        )
      );
    }
  };

  const handleToggleAnimate = async (photo: GeneratedPhotoCard, motionOverride?: PhotoMotionStyle) => {
    if (!photo.dataUrl || photo.isAnimating) return;

    const targetMotion = motionOverride || photo.motionStyle;
    const shouldTurnOn = motionOverride ? true : !photo.isAnimated;

    if (!shouldTurnOn) {
      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== photo.id) return p;
          if (p.animatedPreviewUrl) {
            try {
              URL.revokeObjectURL(p.animatedPreviewUrl);
            } catch {}
          }
          return { ...p, isAnimated: false, animatedPreviewUrl: undefined, animatedBlob: undefined };
        })
      );
      return;
    }

    setPhotos((prev) =>
      prev.map((p) => (p.id === photo.id ? { ...p, isAnimating: true, motionStyle: targetMotion } : p))
    );

    try {
      const gifBlob = await renderAnimatedGifBlob(photo.dataUrl, targetMotion);
      const previewUrl = URL.createObjectURL(gifBlob);

      setPhotos((prev) =>
        prev.map((p) => {
          if (p.id !== photo.id) return p;
          if (p.animatedPreviewUrl) {
            try {
              URL.revokeObjectURL(p.animatedPreviewUrl);
            } catch {}
          }
          return {
            ...p,
            isAnimated: true,
            isAnimating: false,
            motionStyle: targetMotion,
            animatedPreviewUrl: previewUrl,
            animatedBlob: gifBlob,
          };
        })
      );

      eventApi
        .logEvent({
          eventSiteCd: 'SB',
          eventActorId: mbrId || undefined,
          eventActorTypeCd: 'MBR',
          eventCd: 'AI_PHOTO_ANIMATE',
          eventDetail: `Member animated AI photo '${photo.title}' with '${targetMotion}' motion for story '${storyTitle || storyId}'`,
          eventTagValue: {
            mbrStoryId: storyId || undefined,
            sceneTitle: photo.title,
            motionStyle: targetMotion,
          },
        })
        .catch(() => {});

      playUiSound('SOFT_POP');
    } catch (err) {
      console.warn('Could not animate photo:', err);
      setPhotos((prev) => prev.map((p) => (p.id === photo.id ? { ...p, isAnimating: false } : p)));
    }
  };

  const handleDeletePhotoCard = (photoId: string) => {
    setPhotos((prev) => {
      const target = prev.find((p) => p.id === photoId);
      if (target?.animatedPreviewUrl) {
        try {
          URL.revokeObjectURL(target.animatedPreviewUrl);
        } catch {}
      }
      const next = prev.filter((p) => p.id !== photoId);
      if (activePhotoId === photoId) {
        setActivePhotoId(next[0]?.id || null);
      }
      return next;
    });
    playUiSound('STORY_DELETE');
  };

  const handleSaveSelected = async () => {
    const toSave = photos.filter((p) => p.selected && p.status === 'ready' && p.imageBase64);
    if (toSave.length === 0) {
      setGlobalError('Please select at least one generated photo to save to your story.');
      return;
    }

    setSaving(true);
    setGlobalError(null);
    setSaveProgress({ current: 0, total: toSave.length });

    const savedRecords: MbrMedia[] = [];
    const safeCategory = (categoryCd || 'story').toLowerCase();
    const targetSubordinateId = storyId && isUuid(storyId) ? storyId : storyId || undefined;

    try {
      for (let i = 0; i < toSave.length; i++) {
        const item = toSave[i];
        setSaveProgress({ current: i + 1, total: toSave.length });

        const slug = (item.title || `ai_scene_${i + 1}`)
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '_')
          .replace(/^_|_$/g, '')
          .slice(0, 40);

        let fileBlob: Blob;
        let fileExt: string;
        let mimeType: string;

        if (item.isAnimated && item.animatedBlob) {
          fileBlob = item.animatedBlob;
          fileExt = 'gif';
          mimeType = 'image/gif';
        } else {
          fileBlob = base64ToBlob(item.imageBase64!, item.mimeType || 'image/png');
          fileExt = (item.mimeType || '').includes('jpeg') ? 'jpg' : 'png';
          mimeType = item.mimeType || 'image/png';
        }

        const fileName = `ai_${slug}_${Date.now()}_${i + 1}.${fileExt}`;
        const destinationPath = targetSubordinateId
          ? `member/${mbrId}/${safeCategory}/${targetSubordinateId}/${fileName}`
          : `member/${mbrId}/${safeCategory}/${fileName}`;

        if (!isSandbox) {
          const uploadRes = await mediaApi.uploadMedia(fileBlob, destinationPath, mimeType);
          const rawUrl = uploadRes.data?.name
            ? `${MEDIA_API_BASE_URL}/media/read/${uploadRes.data.name}`
            : `${MEDIA_API_BASE_URL}/media/read/${destinationPath}`;
          const storageUrl = resolveMediaUrl(rawUrl);

          const mediaRec = await taskApi.createMemberMedia({
            mbrId,
            mbrMediaSubordinateId: targetSubordinateId && isUuid(targetSubordinateId) ? targetSubordinateId : undefined,
            mbrMediaPath: storageUrl,
            mbrMediaOriginalFilename: fileName,
            mbrMediaMimeType: mimeType,
            mbrMediaCategoryCd: categoryCd || 'STORY',
            mbrMediaDescription: item.caption || item.title || `${storyTitle} AI Photo`,
          });
          savedRecords.push(mediaRec);
        } else {
          const mockUrl = item.isAnimated && item.animatedPreviewUrl ? item.animatedPreviewUrl : item.dataUrl!;
          const mockRec: MbrMedia = {
            mbrMediaId: `ai-photo-mock-${Date.now()}-${i}`,
            mbrId,
            mbrMediaSubordinateId: targetSubordinateId,
            mbrMediaPath: mockUrl,
            mbrMediaOriginalFilename: fileName,
            mbrMediaMimeType: mimeType,
            mbrMediaCategoryCd: categoryCd || 'STORY',
            mbrMediaDescription: item.caption || item.title || `${storyTitle} AI Photo`,
            mbrMediaCreatedAt: new Date().toISOString(),
          };
          savedRecords.push(mockRec);
        }
      }

      if (isSandbox && savedRecords.length > 0) {
        const existingStr = sessionStorage.getItem('sandbox_media');
        let existingList: MbrMedia[] = [];
        if (existingStr) {
          try {
            existingList = JSON.parse(existingStr);
          } catch {}
        }
        sessionStorage.setItem('sandbox_media', JSON.stringify([...savedRecords, ...existingList]));
      }

      // Log AI_PHOTO_SAVE FIRST so backend credit evaluation checks the story's
      // existing mbrStoryAiImageDate before updating it to today's date.
      await eventApi
        .logEvent({
          eventSiteCd: 'SB',
          eventActorId: mbrId || undefined,
          eventActorTypeCd: 'MBR',
          eventCd: 'AI_PHOTO_SAVE',
          eventDetail: `Member saved ${savedRecords.length} AI-generated photo(s) (${animatedSelectedCount} animated) to story '${storyTitle || storyId}'`,
          eventTagValue: {
            mbrStoryId: storyId || undefined,
            storyTitle: storyTitle || undefined,
            savedCount: savedRecords.length,
            animatedCount: animatedSelectedCount,
            mediaIds: savedRecords.map((r) => r.mbrMediaId),
            isSandbox,
          },
        })
        .then(() => {
          window.dispatchEvent(new CustomEvent('credits-updated'));
        })
        .catch(() => {});

      // Now update mbrStoryAiImageDate on the story to today's local date (YYYY-MM-DD)
      const now = new Date();
      const aiImageDateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
      if (!isSandbox && storyId && !storyId.startsWith('temp_')) {
        await taskApi
          .updateStory(storyId, { mbrStoryAiImageDate: aiImageDateStr })
          .catch((err) => console.warn('Could not update mbrStoryAiImageDate:', err));
      }
      onAiImageDateUpdated?.(aiImageDateStr);

      window.dispatchEvent(new CustomEvent('media-updated', { detail: { storyId, mbrId } }));
      window.dispatchEvent(new CustomEvent('stats-updated'));
      playUiSound('STORY_SAVE');

      onPhotosSaved?.(savedRecords);
      onClose();
    } catch (err: any) {
      console.error('Failed to save AI photos:', err);
      setGlobalError(`Failed to save selected photos: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
      setSaveProgress(null);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 bg-slate-900/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0" onClick={!saving ? onClose : undefined} />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          className="relative z-10 w-full max-w-6xl max-h-[92vh] bg-[#FAF8F5] rounded-3xl border border-[#E6DFD3] shadow-2xl flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-amber-50 via-purple-50/60 to-white border-b border-[#EFECE7] flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 via-orange-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                  <span>AI Photo Generation Studio</span>
                  <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold">
                    6 Story Scenes
                  </span>
                </h2>
                <p className="text-xs text-slate-500">
                  Generated from <span className="font-semibold text-slate-700">“{storyTitle || 'Untitled Story'}”</span> · Refine via chat, animate scenes, and save favorites to Cloud Storage.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedStyle}
                disabled={anyGenerating || saving}
                onChange={(e) => setSelectedStyle(e.target.value)}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer disabled:opacity-50"
                title="Visual style for AI photo generation"
              >
                {STYLE_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Style: {opt.label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                disabled={anyGenerating || saving}
                onClick={() => generateAllSixPhotos(selectedStyle)}
                className="px-3 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-50 text-amber-800 text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Regenerate 6 fresh scenes in the selected style"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${anyGenerating ? 'animate-spin' : ''}`} />
                <span>Regenerate 6</span>
              </button>

              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
                aria-label="Close AI Photo Studio"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status / Error Bar */}
          {(globalError || globalStatus) && (
            <div
              className={`px-5 py-2 text-xs font-medium flex items-center justify-between gap-2 border-b ${
                globalError
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-amber-50/70 text-amber-900 border-amber-200/70'
              }`}
            >
              <div className="flex items-center gap-2">
                {globalError ? (
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                ) : anyGenerating ? (
                  <Loader2 className="w-4 h-4 shrink-0 animate-spin text-amber-600" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                )}
                <span>{globalError || globalStatus}</span>
              </div>
              {readyCount > 0 && !globalError && (
                <span className="font-mono text-[11px] font-bold text-slate-600 shrink-0">
                  {readyCount}/{photos.length} Ready
                </span>
              )}
            </div>
          )}

          {/* Main 2-Column Workspace: Left 6-Photo Gallery | Right Chat Refinement & Animation Studio */}
          <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
            {/* LEFT: 6-Image Gallery Grid */}
            <div className="lg:col-span-7 xl:col-span-8 p-4 sm:p-5 overflow-y-auto space-y-3 border-b lg:border-b-0 lg:border-r border-[#EFECE7]">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-slate-500">
                  Generated Story Photographs ({photos.length})
                </span>
                {readyCount > 0 && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setPhotos((prev) => prev.map((p) => (p.status === 'ready' ? { ...p, selected: true } : p)))
                      }
                      className="text-blue-600 hover:underline font-semibold cursor-pointer"
                    >
                      Select All
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                      type="button"
                      onClick={() => setPhotos((prev) => prev.map((p) => ({ ...p, selected: false })))}
                      className="text-slate-500 hover:underline font-semibold cursor-pointer"
                    >
                      Deselect All
                    </button>
                  </div>
                )}
              </div>

              {planning ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className="rounded-2xl border border-[#EFECE7] bg-white p-3 space-y-2.5 animate-pulse"
                    >
                      <div className="aspect-[16/10] rounded-xl bg-slate-200/80 flex items-center justify-center">
                        <Sparkles className="w-6 h-6 text-amber-400" />
                      </div>
                      <div className="h-3.5 bg-slate-200 rounded w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded w-full" />
                    </div>
                  ))}
                </div>
              ) : photos.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <ImageIcon className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-sm font-medium">No photos in workspace yet.</p>
                  <button
                    type="button"
                    onClick={() => generateAllSixPhotos(selectedStyle)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold cursor-pointer"
                  >
                    Generate 6 Story Photos
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3.5">
                  {photos.map((photo) => {
                    const isActive = activePhoto?.id === photo.id;
                    const displaySrc = photo.isAnimated && photo.animatedPreviewUrl ? photo.animatedPreviewUrl : photo.dataUrl;

                    return (
                      <div
                        key={photo.id}
                        onClick={() => setActivePhotoId(photo.id)}
                        className={`rounded-2xl border bg-white overflow-hidden transition-all cursor-pointer flex flex-col ${
                          isActive
                            ? 'border-purple-500 ring-2 ring-purple-500/20 shadow-md'
                            : photo.selected
                            ? 'border-amber-300 hover:border-amber-400 shadow-xs'
                            : 'border-slate-200 opacity-75 hover:opacity-100'
                        }`}
                      >
                        {/* Image Preview Area */}
                        <div className="relative aspect-[16/10] bg-slate-100 overflow-hidden">
                          {displaySrc ? (
                            <img
                              src={displaySrc}
                              alt={photo.title}
                              className="w-full h-full object-cover"
                            />
                          ) : photo.status === 'error' ? (
                            <div className="w-full h-full flex flex-col items-center justify-center p-3 text-center bg-rose-50 text-rose-600 gap-1">
                              <AlertCircle className="w-5 h-5" />
                              <span className="text-[10px] font-semibold">Generation failed</span>
                            </div>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-amber-50 to-purple-50">
                              <Loader2 className="w-6 h-6 text-purple-600 animate-spin" />
                              <span className="text-[10px] font-mono font-semibold text-purple-700">
                                {photo.status === 'generating' ? 'Painting scene...' : 'Queued...'}
                              </span>
                            </div>
                          )}

                          {/* Refining Overlay */}
                          {(photo.status === 'refining' || photo.isAnimating) && (
                            <div className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px] flex flex-col items-center justify-center text-white gap-1.5">
                              <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                              <span className="text-[10px] font-mono font-bold uppercase tracking-wider">
                                {photo.isAnimating ? 'Animating...' : 'Refining...'}
                              </span>
                            </div>
                          )}

                          {/* Top-left Select Checkbox */}
                          {photo.status === 'ready' && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPhotos((prev) =>
                                  prev.map((p) => (p.id === photo.id ? { ...p, selected: !p.selected } : p))
                                );
                              }}
                              title={photo.selected ? 'Selected to save' : 'Click to select for saving'}
                              className={`absolute top-2 left-2 w-6 h-6 rounded-lg flex items-center justify-center border transition-all cursor-pointer shadow-xs ${
                                photo.selected
                                  ? 'bg-emerald-500 border-emerald-400 text-white'
                                  : 'bg-white/90 border-slate-300 text-transparent hover:border-emerald-400'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Top-right Delete Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeletePhotoCard(photo.id);
                            }}
                            title="Delete this generated photo"
                            className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/55 hover:bg-rose-600 text-white transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Badges */}
                          <div className="absolute bottom-2 left-2 flex items-center gap-1">
                            {photo.isAnimated && (
                              <span className="px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white text-[9px] font-mono font-bold uppercase flex items-center gap-1">
                                <Film className="w-2.5 h-2.5" />
                                Animated GIF
                              </span>
                            )}
                            {photo.version > 1 && (
                              <span className="px-1.5 py-0.5 rounded-md bg-amber-600/90 text-white text-[9px] font-mono font-bold">
                                v{photo.version}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Footer */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-bold text-slate-800 truncate">{photo.title}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2 leading-snug mt-0.5">
                              {photo.caption}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 pt-1 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActivePhotoId(photo.id);
                              }}
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Wand2 className="w-3 h-3" />
                              <span>Refine</span>
                            </button>

                            {photo.animatable && photo.status === 'ready' && (
                              <button
                                type="button"
                                disabled={photo.isAnimating}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleToggleAnimate(photo);
                                }}
                                title={photo.motionReason}
                                className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                                  photo.isAnimated
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700'
                                }`}
                              >
                                {photo.isAnimated ? (
                                  <>
                                    <Pause className="w-3 h-3" />
                                    <span>Animated</span>
                                  </>
                                ) : (
                                  <>
                                    <Play className="w-3 h-3" />
                                    <span>Animate</span>
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT: Chat-Like Refinement & Animation Inspector */}
            <div className="lg:col-span-5 xl:col-span-4 bg-white flex flex-col min-h-[340px] max-h-[45vh] lg:max-h-none overflow-hidden">
              {activePhoto ? (
                <>
                  {/* Selected Photo Mini-Header & Motion Controls */}
                  <div className="p-4 border-b border-[#EFECE7] bg-slate-50/70 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <MessageSquare className="w-4 h-4 text-purple-600 shrink-0" />
                        <h3 className="text-xs font-bold text-slate-800 truncate">
                          Refine: {activePhoto.title}
                        </h3>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 shrink-0">
                        Scene #{activePhoto.index + 1}
                      </span>
                    </div>

                    {/* Animation Motion Controls for Applicable Pictures */}
                    {activePhoto.animatable && activePhoto.status === 'ready' && (
                      <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-200/70 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-mono uppercase tracking-wider font-bold text-indigo-800 flex items-center gap-1">
                            <Film className="w-3 h-3" />
                            Living Photo Animation
                          </span>
                          <button
                            type="button"
                            disabled={activePhoto.isAnimating}
                            onClick={() => void handleToggleAnimate(activePhoto)}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer ${
                              activePhoto.isAnimated
                                ? 'bg-indigo-600 text-white'
                                : 'bg-white border border-indigo-300 text-indigo-700 hover:bg-indigo-100'
                            }`}
                          >
                            {activePhoto.isAnimating
                              ? 'Rendering...'
                              : activePhoto.isAnimated
                              ? 'Disable Motion'
                              : 'Enable Motion'}
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 flex-wrap">
                          {MOTION_OPTIONS.map((m) => (
                            <button
                              key={m.id}
                              type="button"
                              disabled={activePhoto.isAnimating}
                              onClick={() => void handleToggleAnimate(activePhoto, m.id)}
                              className={`px-2 py-1 rounded-lg text-[10px] font-semibold cursor-pointer transition-colors ${
                                activePhoto.isAnimated && activePhoto.motionStyle === m.id
                                  ? 'bg-indigo-600 text-white shadow-2xs'
                                  : 'bg-white border border-indigo-200 text-indigo-800 hover:bg-indigo-100'
                              }`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Transcript */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                    {activePhoto.chatHistory.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[90%] px-3 py-2 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user'
                              ? 'bg-purple-600 text-white rounded-br-sm'
                              : 'bg-slate-100 text-slate-700 rounded-bl-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                        <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                      </div>
                    ))}
                    {activePhoto.status === 'refining' && (
                      <div className="flex items-center gap-2 text-xs text-purple-600 font-medium">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Refining your photograph...</span>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Suggestion Chips */}
                  <div className="px-3 pt-2 pb-1 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                    {QUICK_REFINEMENT_CHIPS.map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        disabled={activePhoto.status !== 'ready'}
                        onClick={() => void handleRefinePhoto(chip)}
                        className="shrink-0 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-purple-50 hover:text-purple-700 text-slate-600 text-[10px] font-medium transition-colors cursor-pointer disabled:opacity-40"
                      >
                        {chip}
                      </button>
                    ))}
                  </div>

                  {/* Chat Input */}
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleRefinePhoto();
                    }}
                    className="p-3 border-t border-[#EFECE7] flex items-center gap-2 bg-white"
                  >
                    <input
                      type="text"
                      value={chatInput}
                      disabled={activePhoto.status !== 'ready'}
                      onChange={(e) => setChatInput(e.target.value)}
                      placeholder={`Describe changes for "${activePhoto.title}"...`}
                      className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-400 disabled:bg-slate-50"
                    />
                    <button
                      type="submit"
                      disabled={!chatInput.trim() || activePhoto.status !== 'ready'}
                      className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white transition-colors cursor-pointer disabled:opacity-40"
                      title="Send refinement request"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2">
                  <Wand2 className="w-8 h-8 text-slate-300" />
                  <p className="text-xs">Select a generated photograph to refine it via chat or add motion.</p>
                </div>
              )}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="px-5 sm:px-6 py-3.5 bg-white border-t border-[#EFECE7] flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-600 flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">
                {selectedCount} photo{selectedCount === 1 ? '' : 's'} selected
              </span>
              {animatedSelectedCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold">
                  {animatedSelectedCount} animated
                </span>
              )}
              <span className="text-slate-400 hidden sm:inline">· Unchecked or deleted photos won’t be saved.</span>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={saving}
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || selectedCount === 0}
                onClick={() => void handleSaveSelected()}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>
                      Saving {saveProgress?.current}/{saveProgress?.total} to Cloud Storage...
                    </span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Save Selected to Story ({selectedCount})</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <AdminComponentTag name="AiPhotoGeneratorModal" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
