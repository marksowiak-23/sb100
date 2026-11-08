/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  BookOpen,
  ArrowLeft,
  Save,
  Download,
  Printer,
  CheckSquare,
  Square,
  ChevronUp,
  ChevronDown,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Layers,
  Type,
  Palette,
  Award,
  Check,
  CheckCircle,
  AlertCircle,
  Cloud,
  Loader2,
  Eye,
  Edit3,
  BookMarked,
  Upload,
  Folder,
  Trash2,
  Camera,
  X,
  ChevronRight,
} from 'lucide-react';
import {
  taskApi,
  eventApi,
  mediaApi,
  MEDIA_API_BASE_URL,
  resolveMediaUrl,
  MbrStoryBook,
  MbrStoryBookItem,
  MbrAlbum,
  MbrAlbumPhoto,
} from '@/src/services/api';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import {
  generateStoryBookPdf,
  StoryBookChapterInput,
  TRIM_SPECS,
  COVER_THEME_PALETTES,
  toRoman,
} from './utils/generateStoryBookPdf';
import { MbrStoryBookPublishOrderSection } from './components/MbrStoryBookPublishOrderSection';

export interface MbrStoryBookGeneratorPageProps {
  isSandbox: boolean;
  onClickBack: () => void;
}

type ConfigTab = 'curator' | 'cover' | 'frontMatter' | 'backMatter' | 'printFormat';
type PreviewTab = 'cover' | 'backCover' | 'toc' | 'chapter';

interface AlbumOption {
  albumId: string;
  albumName: string;
  coverPhotoUrl?: string;
  photos: Array<{
    photoId: string;
    url: string;
    title?: string;
    caption?: string;
  }>;
}

interface EnrichedStoryItem {
  mbrStoryId: string;
  originalTitle: string;
  content: string;
  topicCategory: string;
  publishedDate?: string | null;
  photoUrl?: string | null;
  photoCaption?: string | null;
  wordCount: number;
  // User-configurable book item fields
  included: boolean;
  partTitle: string;
  partSortOrder: number;
  chapterSortOrder: number;
  chapterTitleOverride: string;
  chapterSubtitle: string;
  chapterIncludePhoto: boolean;
}

const TOPIC_CODE_TO_CATEGORY: Record<string, string> = {
  sbmbrstryfamly: 'Family & Heritage',
  topicfamily: 'Family & Heritage',
  family: 'Family & Heritage',
  sbmbrstryresidence: 'Residences & Hometowns',
  topicresidence: 'Residences & Hometowns',
  residences: 'Residences & Hometowns',
  sbmbrstryactivity: 'Activities & Hobbies',
  topicactivity: 'Activities & Hobbies',
  activities: 'Activities & Hobbies',
  sbmbrstryachievements: 'Achievements & Milestones',
  topicachievements: 'Achievements & Milestones',
  achievements: 'Achievements & Milestones',
  sbmbrstryeducation: 'Education & Learning',
  topiceducation: 'Education & Learning',
  education: 'Education & Learning',
  sbmbrstryemployment: 'Career & Vocation',
  topicemployment: 'Career & Vocation',
  employment: 'Career & Vocation',
  sbmbrstryrelationships: 'Meaningful Relationships',
  topicrelationships: 'Meaningful Relationships',
  relationships: 'Meaningful Relationships',
  sbmbrstrytrips: 'Travels & Journeys',
  topictrips: 'Travels & Journeys',
  trips: 'Travels & Journeys',
  sbmbrstryhealth: 'Health & Resilience',
  topichealth: 'Health & Resilience',
  health: 'Health & Resilience',
  sbmbrstryspecialevents: 'Special Celebrations & Events',
  topicspecialevents: 'Special Celebrations & Events',
  specialevents: 'Special Celebrations & Events',
  biography: 'Personal Biography & Overview',
  introduction: 'Personal Biography & Overview',
};

const DEFAULT_PART_ORDER: string[] = [
  'Personal Biography & Overview',
  'Family & Heritage',
  'Residences & Hometowns',
  'Education & Learning',
  'Career & Vocation',
  'Meaningful Relationships',
  'Activities & Hobbies',
  'Travels & Journeys',
  'Special Celebrations & Events',
  'Achievements & Milestones',
  'Health & Resilience',
  'Life Reflections & Stories',
];

function resolveStoryTopicCategory(
  story: any,
  topicsById: Map<string, string>,
  customTopicsById: Map<string, string>
): string {
  if (story.mbrCustomTopicId && customTopicsById.has(story.mbrCustomTopicId)) {
    return customTopicsById.get(story.mbrCustomTopicId)!;
  }
  if (story.topicId && topicsById.has(story.topicId)) {
    return topicsById.get(story.topicId)!;
  }
  if (story.mbrStoryTopicName && String(story.mbrStoryTopicName).trim()) {
    const raw = String(story.mbrStoryTopicName).trim();
    const mapped = TOPIC_CODE_TO_CATEGORY[raw.toLowerCase()];
    return mapped || raw;
  }
  if (story.mbrStoryTypeCd && String(story.mbrStoryTypeCd).trim()) {
    const raw = String(story.mbrStoryTypeCd).trim();
    const mapped = TOPIC_CODE_TO_CATEGORY[raw.toLowerCase()];
    if (mapped) return mapped;
  }
  return 'Life Reflections & Stories';
}

function countWords(text?: string | null): number {
  if (!text) return 0;
  const cleaned = text.replace(/<[^>]+>/g, ' ').trim();
  if (!cleaned) return 0;
  return cleaned.split(/\s+/).filter(Boolean).length;
}

const SANDBOX_FALLBACK_STORIES = [
  {
    mbrStoryId: 'sb-demo-story-1',
    mbrStoryTitle: 'Sunday Mornings at Harold’s Dock',
    mbrStoryTopicName: 'Family & Heritage',
    mbrStoryTypeCd: 'sbMbrStryFamly',
    mbrStoryPublishStatusCd: 'published',
    mbrStoryPublishedDate: '2026-04-12',
    mbrStoryStartDate: '1968-06-15',
    mbrStoryContent:
      'Every Sunday after morning services, our family gathered near the Coos Bay harbor. Grandfather Harold would untie the weathered cedar skiff and guide us past the breakwater to watch the coastal fog lift off the headlands.\n\nHe spoke very little on the water, yet every knot he tied and every current he pointed out felt like an heirloom passed quietly into our hands. Those mornings taught us patience, gratitude, and the enduring pull of home.',
    mbrStoryHeaderPhotoUrl:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80',
    mbrStoryHeaderPhotoCaption: 'Morning mist along the Oregon coastline, summer of 1968.',
  },
  {
    mbrStoryId: 'sb-demo-story-2',
    mbrStoryTitle: 'The Cedar House on Maple Street',
    mbrStoryTopicName: 'Residences & Hometowns',
    mbrStoryTypeCd: 'sbMbrStryResidence',
    mbrStoryPublishStatusCd: 'published',
    mbrStoryPublishedDate: '2026-05-02',
    mbrStoryStartDate: '1961-10-14',
    mbrStoryContent:
      'Our childhood house sat three blocks above the bay with a wrap-around porch that smelled of rain and cedar shingles. In the kitchen, Mother kept a windowsill of rosemary and read poetry aloud while bread rose on the counter.\n\nEven decades later, whenever I hear rain against window glass, I am back in that warm upstairs hallway listening to the foghorns echo across the water.',
    mbrStoryHeaderPhotoUrl: '',
    mbrStoryHeaderPhotoCaption: '',
  },
  {
    mbrStoryId: 'sb-demo-story-3',
    mbrStoryTitle: 'First Autumn in the Fourth-Grade Classroom',
    mbrStoryTopicName: 'Career & Vocation',
    mbrStoryTypeCd: 'sbMbrStryEmployment',
    mbrStoryPublishStatusCd: 'published',
    mbrStoryPublishedDate: '2026-06-18',
    mbrStoryStartDate: '1985-09-04',
    mbrStoryContent:
      'Walking into Lincoln Elementary for my first morning as a teacher, I chalked my name on the slate board and arranged twenty-eight fresh composition notebooks. By noon, any nervousness had vanished into the lively curiosity of the children.\n\nOver the next twenty-three years in that classroom, I learned that teaching is really the art of noticing—helping each child discover the story only they can tell.',
    mbrStoryHeaderPhotoUrl: '',
    mbrStoryHeaderPhotoCaption: '',
  },
];

export default function MbrStoryBookGeneratorPage({
  isSandbox,
  onClickBack,
}: MbrStoryBookGeneratorPageProps) {
  const [mainMode, setMainMode] = useState<'studio' | 'publishOrder'>('studio');
  const [activeTab, setActiveTab] = useState<ConfigTab>('curator');
  const [previewTab, setPreviewTab] = useState<PreviewTab>('cover');
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [generatingMode, setGeneratingMode] = useState<'full' | 'pod-interior' | null>(null);
  const [statusBanner, setStatusBanner] = useState<{ type: 'success' | 'info' | 'error'; message: string } | null>(
    null
  );

  const isLoadedRef = useRef<boolean>(false);
  const lastSavedPayloadRef = useRef<string>('');
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const latestBookConfigRef = useRef<Partial<MbrStoryBook>>({});
  const latestStoryItemsRef = useRef<EnrichedStoryItem[]>([]);

  // Serializer to cleanly compare changes and detect edits
  const serializeSettings = useCallback(
    (config: Partial<MbrStoryBook>, items: EnrichedStoryItem[]) => {
      return JSON.stringify({
        title: config.bookTitle,
        subtitle: config.bookSubtitle,
        author: config.bookAuthorDisplayName,
        volume: config.bookVolumeLabel,
        layout: config.bookCoverLayoutCd,
        theme: config.bookCoverThemeCd,
        photo: config.bookCoverPhotoUrl,
        caption: config.bookCoverPhotoCaption,
        blurb: config.bookBackCoverBlurb,
        spine: config.bookSpineTitle,
        trim: config.bookTrimSizeCd,
        font: config.bookFontFamilyCd,
        fontSize: config.bookFontSizePt,
        toc: config.bookIncludeToc,
        parts: config.bookIncludePartDividers,
        dropCaps: config.bookIncludeDropCaps,
        photos: config.bookIncludeStoryPhotos,
        copyright: config.bookIncludeCopyrightPage,
        colophon: config.bookIncludeColophon,
        dedication: config.bookDedicationText,
        forewordTitle: config.bookForewordTitle,
        forewordText: config.bookForewordText,
        forewordAuthor: config.bookForewordAuthor,
        afterwordTitle: config.bookAfterwordTitle,
        afterwordText: config.bookAfterwordText,
        ack: config.bookAcknowledgmentsText,
        aboutText: config.bookAboutAuthorText,
        aboutPhoto: config.bookAboutAuthorPhotoUrl,
        items: items.map((i) => ({
          id: i.mbrStoryId,
          inc: i.included,
          pt: i.partTitle,
          pso: i.partSortOrder,
          cso: i.chapterSortOrder,
          cto: i.chapterTitleOverride,
          cs: i.chapterSubtitle,
          cip: i.chapterIncludePhoto,
        })),
      });
    },
    []
  );

  const [memberProfile, setMemberProfile] = useState<any>(null);
  const [memberPhotos, setMemberPhotos] = useState<any[]>([]);
  const [memberAlbums, setMemberAlbums] = useState<AlbumOption[]>([]);
  const [isAlbumPickerOpen, setIsAlbumPickerOpen] = useState<boolean>(false);
  const [selectedAlbumIdForCover, setSelectedAlbumIdForCover] = useState<string>('all');
  const [isUploadingCover, setIsUploadingCover] = useState<boolean>(false);
  const [storyItems, setStoryItems] = useState<EnrichedStoryItem[]>([]);
  const [editingChapterId, setEditingChapterId] = useState<string | null>(null);

  const [bookConfig, setBookConfig] = useState<Partial<MbrStoryBook>>({
    bookTitle: 'My Life Stories',
    bookSubtitle: 'A Personal Memoir & Family Keepsake',
    bookAuthorDisplayName: '',
    bookVolumeLabel: 'First Family Edition',
    bookCoverLayoutCd: 'CLASSIC_FRAME',
    bookCoverThemeCd: 'AMBER',
    bookCoverPhotoUrl: '',
    bookCoverPhotoCaption: '',
    bookBackCoverBlurb: '',
    bookSpineTitle: '',
    bookTrimSizeCd: 'TRADE_6X9',
    bookFontFamilyCd: 'times',
    bookFontSizePt: 11.0,
    bookIncludeToc: true,
    bookIncludePartDividers: true,
    bookIncludeDropCaps: true,
    bookIncludeStoryPhotos: true,
    bookIncludeCopyrightPage: true,
    bookIncludeColophon: true,
    bookDedicationText: '',
    bookForewordTitle: 'Foreword',
    bookForewordText: '',
    bookForewordAuthor: '',
    bookAfterwordTitle: 'Afterword',
    bookAfterwordText: '',
    bookAcknowledgmentsText: '',
    bookAboutAuthorText: '',
    bookAboutAuthorPhotoUrl: '',
    bookCopyrightYear: new Date().getFullYear(),
    bookIsbn: '',
    bookStatusCd: 'DRAFT',
  });

  const showToast = (type: 'success' | 'info' | 'error', message: string) => {
    setStatusBanner({ type, message });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Resolve logged-in member and load published stories + book configuration concurrently
  const loadBookWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      let resolvedMbr: any = null;
      const storedMbrStr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbrStr) {
        try {
          resolvedMbr = JSON.parse(storedMbrStr);
        } catch {}
      }

      if (!resolvedMbr && !isSandbox) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.user_id) {
              resolvedMbr = await taskApi.getMemberByUserId(u.user_id);
            }
          } catch {}
        }
      }

      const mbrId = resolvedMbr?.mbrId || 'e20986fa-0fb9-4081-ae5d-35bc8f504df0';
      const defaultAuthorName = resolvedMbr
        ? [resolvedMbr.mbrFirstName, resolvedMbr.mbrMiddleName, resolvedMbr.mbrLastName]
            .filter(Boolean)
            .join(' ')
        : 'Eleanor Ruth Hartwell';

      if (isSandbox) {
        // Load from sessionStorage in Sandbox Mode
        const savedBookStr = sessionStorage.getItem(`sb_storybook_config_${mbrId}`);
        const savedItemsStr = sessionStorage.getItem(`sb_storybook_items_${mbrId}`);
        const savedBook = savedBookStr ? JSON.parse(savedBookStr) : null;
        const savedItems: MbrStoryBookItem[] = savedItemsStr ? JSON.parse(savedItemsStr) : [];

        setMemberProfile(
          resolvedMbr || {
            mbrId,
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Hartwell',
            mbrIntroduction:
              'Born in Coos Bay, Oregon, Eleanor taught fourth and fifth grade in Portland for over two decades and writes to preserve her family history for her grandchildren.',
          }
        );

        const initialBook: Partial<MbrStoryBook> = savedBook || {
          bookId: `sandbox-book-${mbrId}`,
          mbrId,
          bookTitle: `The Collected Stories of ${defaultAuthorName}`,
          bookSubtitle: 'Reflections on Family, Home, and Life’s Seasons',
          bookAuthorDisplayName: defaultAuthorName,
          bookVolumeLabel: 'First Family Edition',
          bookCoverLayoutCd: 'CLASSIC_FRAME',
          bookCoverThemeCd: 'AMBER',
          bookTrimSizeCd: 'TRADE_6X9',
          bookFontFamilyCd: 'times',
          bookFontSizePt: 11.0,
          bookIncludeToc: true,
          bookIncludePartDividers: true,
          bookIncludeDropCaps: true,
          bookIncludeStoryPhotos: true,
          bookIncludeCopyrightPage: true,
          bookIncludeColophon: true,
          bookDedicationText:
            'For my family and future generations—may these pages keep our shared memories close.',
          bookForewordTitle: 'Foreword',
          bookAfterwordTitle: 'Afterword',
          bookCopyrightYear: new Date().getFullYear(),
          bookStatusCd: 'DRAFT',
        };
        setBookConfig(initialBook);

        const savedMap = new Map<string, MbrStoryBookItem>(
          savedItems.map((it) => [it.mbrStoryId, it])
        );
        const enriched: EnrichedStoryItem[] = SANDBOX_FALLBACK_STORIES.map((st, idx) => {
          const existing = savedMap.get(st.mbrStoryId);
          const partTitle = existing?.bookPartTitle || st.mbrStoryTopicName || 'Life Reflections & Stories';
          const defaultPartIdx = DEFAULT_PART_ORDER.indexOf(partTitle);
          return {
            mbrStoryId: st.mbrStoryId,
            originalTitle: st.mbrStoryTitle,
            content: st.mbrStoryContent,
            topicCategory: st.mbrStoryTopicName,
            publishedDate: st.mbrStoryPublishedDate,
            photoUrl: st.mbrStoryHeaderPhotoUrl,
            photoCaption: st.mbrStoryHeaderPhotoCaption,
            wordCount: countWords(st.mbrStoryContent),
            included: existing ? existing.bookItemIncluded : true,
            partTitle,
            partSortOrder:
              existing?.bookPartSortOrder ?? (defaultPartIdx >= 0 ? defaultPartIdx + 1 : 50),
            chapterSortOrder: existing?.bookChapterSortOrder ?? idx + 1,
            chapterTitleOverride: existing?.bookChapterTitleOverride || '',
            chapterSubtitle: existing?.bookChapterSubtitle || st.mbrStoryStartDate || '',
            chapterIncludePhoto: existing ? existing.bookChapterIncludePhoto : true,
          };
        });
        setStoryItems(enriched);

        // Load sandbox albums & photos
        const sbAlbumsStr =
          sessionStorage.getItem(`sb_photobook_albums_${mbrId}`) ||
          sessionStorage.getItem('sb_sandbox_photobook_albums');
        const sbPhotosStr =
          sessionStorage.getItem(`sb_photobook_photos_${mbrId}`) ||
          sessionStorage.getItem('sb_sandbox_photobook_photos');
        if (sbAlbumsStr) {
          try {
            const parsedAlbums = JSON.parse(sbAlbumsStr);
            const parsedPhotos = sbPhotosStr ? JSON.parse(sbPhotosStr) : [];
            const sbMapped: AlbumOption[] = parsedAlbums.map((a: any) => ({
              albumId: a.id || a.albumId,
              albumName: a.name || a.albumName,
              coverPhotoUrl: a.coverPhotoUrl,
              photos: parsedPhotos
                .filter((p: any) => p.albumId === (a.id || a.albumId))
                .filter((p: any) => !isAudioMedia(p))
                .map((p: any) => ({
                  photoId: p.id,
                  url: resolveMediaUrl(p.url),
                  title: p.title,
                  caption: p.description,
                })),
            }));
            setMemberAlbums(sbMapped);
          } catch {
            setMemberAlbums([]);
          }
        }

        lastSavedPayloadRef.current = serializeSettings(initialBook, enriched);
        isLoadedRef.current = true;
        setLoading(false);
        return;
      }

      // Live DB Mode: Fetch everything concurrently via Promise.all (Zero N+1)
      const [mbrData, allStories, stdTopics, customTopics, mediaList, existingBooks, liveAlbums] =
        await Promise.all([
          resolvedMbr ? Promise.resolve(resolvedMbr) : taskApi.getMemberById(mbrId).catch(() => null),
          taskApi.getStories(mbrId).catch(() => []),
          taskApi.getTopics().catch(() => []),
          taskApi.getCustomTopics(mbrId).catch(() => []),
          taskApi.getMemberMedia(mbrId, { excludeAudio: true }).catch(() => []),
          taskApi.getMemberStoryBooks(mbrId).catch(() => []),
          taskApi.getMemberAlbums(mbrId).catch(() => []),
        ]);

      // Map member albums and album photo links
      if (liveAlbums && Array.isArray(liveAlbums) && liveAlbums.length > 0) {
        const albumPhotoLinks = await Promise.all(
          liveAlbums.map((a: any) => taskApi.getMemberAlbumPhotos(a.albumId).catch(() => []))
        );
        const mappedAlbums: AlbumOption[] = liveAlbums.map((a: any, idx: number) => {
          const photosInAlbum = (albumPhotoLinks[idx] || []).filter((ap: any) => !isAudioMedia(ap));
          return {
            albumId: a.albumId,
            albumName: a.albumName,
            coverPhotoUrl: resolveMediaUrl(a.albumCoverPhotoUrl || ''),
            photos: photosInAlbum.map((ap: any) => ({
              photoId: ap.albumPhotoId || ap.mbrMediaId,
              url: resolveMediaUrl(ap.mbrMediaPath || ''),
              title: ap.photoTitle,
              caption: ap.photoCaption,
            }))
          };
        });
        setMemberAlbums(mappedAlbums);
      } else {
        setMemberAlbums([]);
      }

      if (mbrData) setMemberProfile(mbrData);
      setMemberPhotos(Array.isArray(mediaList) ? mediaList : []);

      const authorFull = mbrData
        ? [mbrData.mbrFirstName, mbrData.mbrMiddleName, mbrData.mbrLastName]
            .filter(Boolean)
            .join(' ')
        : defaultAuthorName;

      const topicsById = new Map<string, string>();
      (stdTopics || []).forEach((t: any) => {
        if (t.topicId) {
          const mapped =
            TOPIC_CODE_TO_CATEGORY[String(t.topicName || '').toLowerCase()] ||
            TOPIC_CODE_TO_CATEGORY[String(t.topicComponent || '').toLowerCase()] ||
            t.topicFullName ||
            t.topicName;
          topicsById.set(t.topicId, mapped);
        }
      });

      const customTopicsById = new Map<string, string>();
      (customTopics || []).forEach((ct: any) => {
        const id = ct.topicCustomId || ct.mbrCustomTopicId;
        if (id && ct.topicCustomName) {
          customTopicsById.set(id, ct.topicCustomName);
        }
      });

      // Filter to published stories (and exclude subordinate draft copies of published stories)
      const publishedStories = (allStories || []).filter((s: any) => {
        const status = String(s.mbrStoryPublishStatusCd || '').toLowerCase();
        return status === 'published' && !s.mbrStoryOriginalId;
      });

      let activeBook = existingBooks && existingBooks.length > 0 ? existingBooks[0] : null;
      let existingBookItems: MbrStoryBookItem[] = [];

      if (activeBook && activeBook.bookId) {
        existingBookItems = await taskApi.getMemberStoryBookItems(activeBook.bookId).catch(() => []);
        setBookConfig({
          ...activeBook,
          bookAuthorDisplayName: activeBook.bookAuthorDisplayName || authorFull,
        });
      } else {
        setBookConfig((prev) => ({
          ...prev,
          mbrId,
          bookTitle: `The Collected Stories of ${authorFull}`,
          bookSubtitle: 'A Personal Memoir & Family Keepsake',
          bookAuthorDisplayName: authorFull,
          bookCoverPhotoUrl: mbrData?.mbrProfilePic || '',
          bookAboutAuthorText: mbrData?.mbrIntroduction || '',
          bookAboutAuthorPhotoUrl: mbrData?.mbrProfilePic || '',
          bookDedicationText:
            'For my family and loved ones—may these stories preserve the memories, places, and moments that shaped our lives.',
        }));
      }

      const itemByStoryId = new Map<string, MbrStoryBookItem>();
      existingBookItems.forEach((it) => itemByStoryId.set(it.mbrStoryId, it));

      // Group and enrich stories
      const enrichedList: EnrichedStoryItem[] = publishedStories.map((st: any, index: number) => {
        const savedItem = itemByStoryId.get(st.mbrStoryId);
        const category = resolveStoryTopicCategory(st, topicsById, customTopicsById);
        const partTitle = savedItem?.bookPartTitle || category;
        const defaultOrderIdx = DEFAULT_PART_ORDER.indexOf(partTitle);
        const partOrder =
          savedItem?.bookPartSortOrder ?? (defaultOrderIdx >= 0 ? defaultOrderIdx + 1 : 50);

        return {
          mbrStoryId: st.mbrStoryId,
          originalTitle: st.mbrStoryTitle || 'Untitled Story',
          content: st.mbrStoryContent || '',
          topicCategory: category,
          publishedDate: st.mbrStoryPublishedDate || st.mbrStoryCreatedAt || null,
          photoUrl: st.mbrStoryHeaderPhotoUrl || null,
          photoCaption: st.mbrStoryHeaderPhotoCaption || null,
          wordCount: countWords(st.mbrStoryContent),
          included: savedItem ? savedItem.bookItemIncluded : true,
          partTitle,
          partSortOrder: partOrder,
          chapterSortOrder: savedItem?.bookChapterSortOrder ?? index + 1,
          chapterTitleOverride: savedItem?.bookChapterTitleOverride || '',
          chapterSubtitle: savedItem?.bookChapterSubtitle || st.mbrStoryStartDate || '',
          chapterIncludePhoto: savedItem ? savedItem.bookChapterIncludePhoto : true,
        };
      });

      // Normalize sort orders cleanly per part
      enrichedList.sort((a, b) => {
        if (a.partSortOrder !== b.partSortOrder) return a.partSortOrder - b.partSortOrder;
        return a.chapterSortOrder - b.chapterSortOrder;
      });

      setStoryItems(enrichedList);
      const snapshotBook = activeBook || {
        ...bookConfig,
        mbrId,
        bookAuthorDisplayName: authorFull,
      };
      lastSavedPayloadRef.current = serializeSettings(snapshotBook, enrichedList);
      isLoadedRef.current = true;
    } catch (err) {
      console.error('Error loading StoryBook Generator workspace:', err);
      showToast('error', 'Unable to load all book data. Using available defaults.');
    } finally {
      setLoading(false);
    }
  }, [isSandbox]);

  useEffect(() => {
    loadBookWorkspace();
  }, [loadBookWorkspace]);

  // Group stories into ordered Topic Category Parts
  const groupedParts = useMemo(() => {
    const map = new Map<
      string,
      { partTitle: string; partSortOrder: number; stories: EnrichedStoryItem[] }
    >();
    for (const item of storyItems) {
      const key = item.partTitle || item.topicCategory || 'Life Reflections & Stories';
      if (!map.has(key)) {
        map.set(key, {
          partTitle: key,
          partSortOrder: item.partSortOrder,
          stories: [],
        });
      }
      map.get(key)!.stories.push(item);
    }
    const parts = Array.from(map.values()).sort((a, b) => a.partSortOrder - b.partSortOrder);
    parts.forEach((p, pIdx) => {
      p.partSortOrder = pIdx + 1;
      p.stories.sort((a, b) => a.chapterSortOrder - b.chapterSortOrder);
    });
    return parts;
  }, [storyItems]);

  // Included chapters in final book order
  const includedChapters: StoryBookChapterInput[] = useMemo(() => {
    const result: StoryBookChapterInput[] = [];
    groupedParts.forEach((part, pIdx) => {
      const activeInPart = part.stories.filter((s) => s.included);
      activeInPart.forEach((s, cIdx) => {
        result.push({
          mbrStoryId: s.mbrStoryId,
          title: (s.chapterTitleOverride || s.originalTitle).trim(),
          subtitle: s.chapterSubtitle || null,
          partTitle: part.partTitle,
          partSortOrder: pIdx + 1,
          chapterSortOrder: cIdx + 1,
          content: s.content,
          photoUrl: s.photoUrl,
          photoCaption: s.photoCaption,
          includePhoto: s.chapterIncludePhoto,
          publishedDate: s.publishedDate,
        });
      });
    });
    return result;
  }, [groupedParts]);

  // Book statistics
  const bookMetrics = useMemo(() => {
    const includedCount = includedChapters.length;
    const totalCount = storyItems.length;
    const activePartsCount = new Set(includedChapters.map((c) => c.partTitle)).size;
    const totalWords = storyItems
      .filter((s) => s.included)
      .reduce((acc, s) => acc + s.wordCount, 0);
    const photosCount = includedChapters.filter(
      (c) => bookConfig.bookIncludeStoryPhotos !== false && c.includePhoto && c.photoUrl
    ).length;

    // Estimate pages: front matter (~5) + part dividers + ~250 words/page + photos + back matter (~3)
    const contentPages = Math.max(includedCount, Math.ceil(totalWords / 240) + Math.ceil(photosCount * 0.4));
    const dividerPages = bookConfig.bookIncludePartDividers !== false ? activePartsCount : 0;
    const frontPages =
      2 +
      (bookConfig.bookIncludeCopyrightPage !== false ? 1 : 0) +
      (bookConfig.bookDedicationText?.trim() ? 1 : 0) +
      (bookConfig.bookForewordText?.trim() ? 1 : 0) +
      (bookConfig.bookIncludeToc !== false ? 1 : 0);
    const backPages =
      (bookConfig.bookAfterwordText?.trim() ? 1 : 0) +
      (bookConfig.bookAcknowledgmentsText?.trim() ? 1 : 0) +
      (bookConfig.bookAboutAuthorText?.trim() ? 1 : 0) +
      (bookConfig.bookIncludeColophon !== false ? 1 : 0);

    const estimatedPages = includedCount === 0 ? frontPages + backPages : frontPages + dividerPages + contentPages + backPages;

    return {
      includedCount,
      totalCount,
      activePartsCount,
      totalWords,
      photosCount,
      estimatedPages,
    };
  }, [includedChapters, storyItems, bookConfig]);

  // Toggle single story inclusion
  const toggleStoryInclusion = (mbrStoryId: string) => {
    setStoryItems((prev) =>
      prev.map((item) =>
        item.mbrStoryId === mbrStoryId ? { ...item, included: !item.included } : item
      )
    );
  };

  // Toggle all stories in a Topic Category Part
  const togglePartInclusion = (partTitle: string, include: boolean) => {
    setStoryItems((prev) =>
      prev.map((item) => (item.partTitle === partTitle ? { ...item, included: include } : item))
    );
  };

  // Move a Topic Part up or down
  const movePartOrder = (partIndex: number, direction: -1 | 1) => {
    const targetIdx = partIndex + direction;
    if (targetIdx < 0 || targetIdx >= groupedParts.length) return;
    const orderedTitles = groupedParts.map((p) => p.partTitle);
    const temp = orderedTitles[partIndex];
    orderedTitles[partIndex] = orderedTitles[targetIdx];
    orderedTitles[targetIdx] = temp;

    const newOrderMap = new Map<string, number>();
    orderedTitles.forEach((title, idx) => newOrderMap.set(title, idx + 1));

    setStoryItems((prev) =>
      prev.map((item) => ({
        ...item,
        partSortOrder: newOrderMap.get(item.partTitle) ?? item.partSortOrder,
      }))
    );
  };

  // Move a Story Chapter up or down within its Topic Part
  const moveChapterInPart = (partTitle: string, storyIndexInPart: number, direction: -1 | 1) => {
    const part = groupedParts.find((p) => p.partTitle === partTitle);
    if (!part) return;
    const targetIdx = storyIndexInPart + direction;
    if (targetIdx < 0 || targetIdx >= part.stories.length) return;

    const ids = part.stories.map((s) => s.mbrStoryId);
    const temp = ids[storyIndexInPart];
    ids[storyIndexInPart] = ids[targetIdx];
    ids[targetIdx] = temp;

    const orderMap = new Map<string, number>();
    ids.forEach((id, idx) => orderMap.set(id, idx + 1));

    setStoryItems((prev) =>
      prev.map((item) =>
        item.partTitle === partTitle
          ? { ...item, chapterSortOrder: orderMap.get(item.mbrStoryId) ?? item.chapterSortOrder }
          : item
      )
    );
  };

  // Save book configuration + item mappings
  const handleSaveBookConfig = async (silent: boolean = false): Promise<Partial<MbrStoryBook> | null> => {
    setSaving(true);
    try {
      const mbrId =
        bookConfig.mbrId ||
        memberProfile?.mbrId ||
        'e20986fa-0fb9-4081-ae5d-35bc8f504df0';

      if (isSandbox) {
        const updatedBook = {
          ...bookConfig,
          bookId: bookConfig.bookId || `sandbox-book-${mbrId}`,
          mbrId,
          bookUpdatedAt: new Date().toISOString(),
        };
        sessionStorage.setItem(`sb_storybook_config_${mbrId}`, JSON.stringify(updatedBook));

        const itemsToSave = storyItems.map((s) => ({
          bookItemId: `sandbox-item-${s.mbrStoryId}`,
          bookId: updatedBook.bookId!,
          mbrStoryId: s.mbrStoryId,
          bookItemIncluded: s.included,
          bookPartTitle: s.partTitle,
          bookPartSortOrder: s.partSortOrder,
          bookChapterSortOrder: s.chapterSortOrder,
          bookChapterTitleOverride: s.chapterTitleOverride || null,
          bookChapterSubtitle: s.chapterSubtitle || null,
          bookChapterIncludePhoto: s.chapterIncludePhoto,
        }));
        sessionStorage.setItem(`sb_storybook_items_${mbrId}`, JSON.stringify(itemsToSave));
        lastSavedPayloadRef.current = serializeSettings(updatedBook, storyItems);
        setBookConfig(updatedBook);
        setAutoSaveStatus('saved');
        if (!silent) showToast('success', 'Book configuration saved to Sandbox session.');
        return updatedBook;
      }

      // Live DB mode
      const payload: Partial<MbrStoryBook> = {
        mbrId,
        bookTitle: bookConfig.bookTitle || 'My Life Stories',
        bookSubtitle: bookConfig.bookSubtitle || null,
        bookAuthorDisplayName: bookConfig.bookAuthorDisplayName || null,
        bookVolumeLabel: bookConfig.bookVolumeLabel || null,
        bookCoverLayoutCd: bookConfig.bookCoverLayoutCd || 'CLASSIC_FRAME',
        bookCoverThemeCd: bookConfig.bookCoverThemeCd || 'AMBER',
        bookCoverPhotoUrl: bookConfig.bookCoverPhotoUrl || null,
        bookCoverPhotoCaption: bookConfig.bookCoverPhotoCaption || null,
        bookBackCoverBlurb: bookConfig.bookBackCoverBlurb || null,
        bookSpineTitle: bookConfig.bookSpineTitle || null,
        bookTrimSizeCd: bookConfig.bookTrimSizeCd || 'TRADE_6X9',
        bookFontFamilyCd: bookConfig.bookFontFamilyCd || 'times',
        bookFontSizePt: Number(bookConfig.bookFontSizePt) || 11.0,
        bookIncludeToc: bookConfig.bookIncludeToc !== false,
        bookIncludePartDividers: bookConfig.bookIncludePartDividers !== false,
        bookIncludeDropCaps: bookConfig.bookIncludeDropCaps !== false,
        bookIncludeStoryPhotos: bookConfig.bookIncludeStoryPhotos !== false,
        bookIncludeCopyrightPage: bookConfig.bookIncludeCopyrightPage !== false,
        bookIncludeColophon: bookConfig.bookIncludeColophon !== false,
        bookDedicationText: bookConfig.bookDedicationText || null,
        bookForewordTitle: bookConfig.bookForewordTitle || 'Foreword',
        bookForewordText: bookConfig.bookForewordText || null,
        bookForewordAuthor: bookConfig.bookForewordAuthor || null,
        bookAfterwordTitle: bookConfig.bookAfterwordTitle || 'Afterword',
        bookAfterwordText: bookConfig.bookAfterwordText || null,
        bookAcknowledgmentsText: bookConfig.bookAcknowledgmentsText || null,
        bookAboutAuthorText: bookConfig.bookAboutAuthorText || null,
        bookAboutAuthorPhotoUrl: bookConfig.bookAboutAuthorPhotoUrl || null,
        bookCopyrightYear: bookConfig.bookCopyrightYear || new Date().getFullYear(),
        bookIsbn: bookConfig.bookIsbn || null,
        bookStatusCd: bookConfig.bookStatusCd || 'DRAFT',
      };

      let savedBook: MbrStoryBook;
      if (bookConfig.bookId) {
        savedBook = await taskApi.updateMemberStoryBook(bookConfig.bookId, payload);
      } else {
        savedBook = await taskApi.createMemberStoryBook(payload);
      }

      if (savedBook?.bookId && storyItems.length > 0) {
        const syncPayload = storyItems.map((s) => ({
          bookId: savedBook.bookId,
          mbrStoryId: s.mbrStoryId,
          bookItemIncluded: s.included,
          bookPartTitle: s.partTitle,
          bookPartSortOrder: s.partSortOrder,
          bookChapterSortOrder: s.chapterSortOrder,
          bookChapterTitleOverride: s.chapterTitleOverride || null,
          bookChapterSubtitle: s.chapterSubtitle || null,
          bookChapterIncludePhoto: s.chapterIncludePhoto,
        }));
        await taskApi.syncMemberStoryBookItems(savedBook.bookId, syncPayload);
      }

      lastSavedPayloadRef.current = serializeSettings(savedBook, storyItems);
      setBookConfig(savedBook);
      setAutoSaveStatus('saved');
      if (!silent) showToast('success', 'StoryBook configuration saved to database!');
      return savedBook;
    } catch (err) {
      console.error('Failed to save StoryBook configuration:', err);
      setAutoSaveStatus('error');
      if (!silent) showToast('error', 'Failed to save book configuration. Please try again.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  // Auto-Save Effect: Watches bookConfig and storyItems with 1.2s debounce
  useEffect(() => {
    latestBookConfigRef.current = bookConfig;
    latestStoryItemsRef.current = storyItems;

    if (!isLoadedRef.current || loading) return;

    const currentPayload = serializeSettings(bookConfig, storyItems);
    if (currentPayload === lastSavedPayloadRef.current) return;

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus('saving');

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        const saved = await handleSaveBookConfig(true);
        if (saved) {
          lastSavedPayloadRef.current = serializeSettings(saved, latestStoryItemsRef.current);
          setAutoSaveStatus('saved');
        } else {
          setAutoSaveStatus('error');
        }
      } catch (err) {
        console.error('Auto-save failed:', err);
        setAutoSaveStatus('error');
      }
    }, 1200);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [bookConfig, storyItems, loading, serializeSettings]);

  // Generate PDF
  const handleGeneratePdf = async (mode: 'full' | 'pod-interior') => {
    if (includedChapters.length === 0) {
      showToast('error', 'Please include at least one story chapter before generating your book PDF.');
      return;
    }
    setGeneratingMode(mode);
    try {
      const saved = await handleSaveBookConfig(true);
      const activeBook = saved || bookConfig;
      await generateStoryBookPdf({
        book: activeBook,
        chapters: includedChapters,
        mode,
      });

      if (!isSandbox && activeBook.bookId) {
        await taskApi
          .updateMemberStoryBook(activeBook.bookId, {
            bookLastGeneratedAt: new Date().toISOString(),
            bookStatusCd: 'READY',
          })
          .catch(() => {});
      }

      // Log PDF generation event
      const actorId = activeBook.mbrId || memberProfile?.mbrId || undefined;
      eventApi.logEvent({
        eventSiteCd: 'SB',
        eventActorId: actorId,
        eventActorTypeCd: 'MBR',
        eventCd: mode === 'pod-interior' ? 'STORYBOOK_PDF_INTERIOR_GENERATE' : 'STORYBOOK_PDF_GENERATE',
        eventDetail: `Member generated ${mode === 'pod-interior' ? 'POD interior block' : 'complete heirloom'} PDF for storybook '${activeBook.bookTitle || 'My Life Stories'}' (${includedChapters.length} chapters, ${activeTrim.label})`,
        eventTagValue: {
          bookId: activeBook.bookId,
          bookTitle: activeBook.bookTitle,
          mode,
          trimSizeCd: activeBook.bookTrimSizeCd,
          chaptersCount: includedChapters.length,
          estimatedPages: bookMetrics.estimatedPages,
          coverLayoutCd: activeBook.bookCoverLayoutCd,
          coverThemeCd: activeBook.bookCoverThemeCd,
          fontFamilyCd: activeBook.bookFontFamilyCd,
          isSandbox,
        },
      }).catch((err) => console.warn('Could not log storybook PDF generate event:', err));

      showToast(
        'success',
        mode === 'pod-interior'
          ? 'Print-on-Demand (POD) interior block PDF generated and downloaded!'
          : 'Complete Heirloom StoryBook PDF generated and downloaded!'
      );
    } catch (err) {
      console.error('Error generating StoryBook PDF:', err);
      showToast('error', 'An error occurred while generating the PDF.');
    } finally {
      setGeneratingMode(null);
    }
  };

  // Helper to determine if a media item is an audio file or voice recording
  const isAudioMedia = (m: any): boolean => {
    if (!m) return false;
    const mime = (m.mbrMediaMimeType || m.mimeType || '').toLowerCase();
    const path = (m.mbrMediaPath || m.url || '').toLowerCase();
    const filename = (m.mbrMediaOriginalFilename || m.title || '').toLowerCase();
    const desc = (m.mbrMediaDescription || m.caption || '').toLowerCase();
    const cat = (m.mbrMediaCategoryCd || '').toLowerCase();
    return (
      mime.startsWith('audio/') ||
      /\.(wav|mp3|ogg|m4a|aac|flac|webm|opus|wma|aiff)(\?.*)?$/i.test(path) ||
      /\.(wav|mp3|ogg|m4a|aac|flac|webm|opus|wma|aiff)$/i.test(filename) ||
      filename.startsWith('narration_') ||
      filename.startsWith('voice_sample_') ||
      desc.includes('voice narration') ||
      desc.includes('ai voice narration') ||
      cat === 'voiceprofile' ||
      cat === 'narration'
    );
  };

  // Flattened list of all accessible album photos and media library photos (excluding audio files)
  const allAvailablePhotos = useMemo(() => {
    const list: Array<{
      photoId: string;
      url: string;
      title?: string;
      caption?: string;
      albumName?: string;
      albumId?: string;
    }> = [];
    const seenUrls = new Set<string>();

    memberAlbums.forEach((alb) => {
      alb.photos.forEach((p) => {
        if (isAudioMedia(p)) return;
        if (!seenUrls.has(p.url)) {
          seenUrls.add(p.url);
          list.push({ ...p, albumName: alb.albumName, albumId: alb.albumId });
        }
      });
    });

    memberPhotos.forEach((m) => {
      if (isAudioMedia(m)) return;
      const url = resolveMediaUrl(m.mbrMediaPath);
      if (url && !seenUrls.has(url)) {
        seenUrls.add(url);
        list.push({
          photoId: m.mbrMediaId,
          url,
          title: m.mbrMediaOriginalFilename || 'Photo',
          caption: m.mbrMediaDescription,
          albumName: 'Media Library',
          albumId: 'media_library',
        });
      }
    });

    return list;
  }, [memberAlbums, memberPhotos]);

  const displayedAlbumPhotos = useMemo(() => {
    if (selectedAlbumIdForCover === 'all') {
      return allAvailablePhotos;
    }
    const targetAlbum = memberAlbums.find((a) => a.albumId === selectedAlbumIdForCover);
    if (!targetAlbum) return [];
    return targetAlbum.photos
      .filter((p) => !isAudioMedia(p))
      .map((p) => ({
        ...p,
        albumName: targetAlbum.albumName,
        albumId: targetAlbum.albumId,
      }));
  }, [selectedAlbumIdForCover, allAvailablePhotos, memberAlbums]);

  const handleUploadCoverPhoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/avif'];
    if (
      !validTypes.includes(file.type.toLowerCase()) &&
      !file.name.match(/\.(jpg|jpeg|png|webp|gif|heic|avif)$/i)
    ) {
      showToast('error', 'Please upload a valid image file (JPEG, PNG, WebP, GIF, or HEIC).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('error', 'Image size exceeds maximum limit of 15MB.');
      return;
    }

    setIsUploadingCover(true);
    try {
      const activeMbrId =
        memberProfile?.mbrId ||
        (sessionStorage.getItem('sb_current_mbr')
          ? JSON.parse(sessionStorage.getItem('sb_current_mbr')!).mbrId
          : 'e20986fa-0fb9-4081-ae5d-35bc8f504df0');
      let finalUrl = '';

      if (isSandbox) {
        const reader = new FileReader();
        finalUrl = await new Promise<string>((resolve) => {
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      } else {
        const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const destinationPath = `member/${activeMbrId}/books/book_cover_${Date.now()}_${cleanFilename}`;

        const uploadRes = await mediaApi.uploadMedia(file, destinationPath);
        const rawUrl = uploadRes.data?.name
          ? `${MEDIA_API_BASE_URL}/media/read/${uploadRes.data.name}`
          : `${MEDIA_API_BASE_URL}/media/read/${destinationPath}`;
        finalUrl = resolveMediaUrl(rawUrl);

        // Register in mbrMedia as well per requirement
        await taskApi
          .createMemberMedia({
            mbrId: activeMbrId,
            mbrMediaPath: finalUrl,
            mbrMediaOriginalFilename: file.name,
            mbrMediaMimeType: file.type || 'image/jpeg',
            mbrMediaCategoryCd: 'StoryBookCover',
            mbrMediaDescription: JSON.stringify({
              title: file.name,
              purpose: 'StoryBookCover',
            }),
          })
          .catch((err) => console.warn('Could not register cover media in mbrMedia:', err));
      }

      setBookConfig((prev) => ({
        ...prev,
        bookCoverPhotoUrl: finalUrl,
      }));
      showToast('success', 'Cover photograph uploaded successfully!');
    } catch (err: any) {
      console.error('Failed to upload cover photo:', err);
      showToast('error', `Failed to upload cover photo: ${err.message || 'Upload error'}`);
    } finally {
      setIsUploadingCover(false);
      if (e.target) e.target.value = '';
    }
  };

  const activePalette =
    COVER_THEME_PALETTES[bookConfig.bookCoverThemeCd || 'AMBER'] || COVER_THEME_PALETTES.AMBER;
  const activeTrim =
    TRIM_SPECS[bookConfig.bookTrimSizeCd || 'TRADE_6X9'] || TRIM_SPECS.TRADE_6X9;
  const sampleChapter = includedChapters[0] || null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-16 px-4 flex flex-col items-center justify-center gap-3 text-slate-600">
        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
        <p className="font-serif text-sm">Loading your StoryBook Publishing Studio...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Top Studio Header Bar */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClickBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Author Page</span>
            </button>
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
              Heirloom Publishing Studio
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2.5 pt-1">
            <BookOpen className="w-7 h-7 text-amber-800 shrink-0" />
            <span>StoryBook Generator</span>
          </h1>
          <p className="font-serif text-xs sm:text-sm text-slate-600">
            Curate your published stories by topic category, customize your book cover and front/back matter, and export print-ready PDFs.
          </p>
        </div>

        {/* Primary Action & Auto-Save Indicator */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-serif shadow-2xs">
            {saving || autoSaveStatus === 'saving' ? (
              <>
                <Loader2 className="w-3.5 h-3.5 text-amber-700 animate-spin" />
                <span className="text-slate-600 font-medium">Saving changes...</span>
              </>
            ) : autoSaveStatus === 'saved' ? (
              <>
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-800 font-medium">All changes saved</span>
              </>
            ) : autoSaveStatus === 'error' ? (
              <>
                <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                <span className="text-rose-700 font-medium">Auto-save error</span>
              </>
            ) : (
              <>
                <Cloud className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500">Auto-saved</span>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => handleGeneratePdf('full')}
            disabled={generatingMode !== null || includedChapters.length === 0}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold font-serif transition-all shadow-sm cursor-pointer disabled:opacity-50"
          >
            {generatingMode === 'full' ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            <span>Generate Complete Book PDF</span>
          </button>
        </div>
      </div>

      {/* Status Toast Banner */}
      {statusBanner && (
        <div
          className={`rounded-2xl px-4 py-3 text-xs font-serif font-semibold flex items-center justify-between border ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : statusBanner.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-amber-50 border-amber-200 text-amber-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{statusBanner.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusBanner(null)}
            className="text-[11px] underline opacity-75 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Book Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-3.5 flex flex-col">
          <span className="text-[11px] font-serif text-slate-500">Included Chapters</span>
          <span className="text-lg font-serif font-black text-slate-800">
            {bookMetrics.includedCount}{' '}
            <span className="text-xs font-normal text-slate-400">of {bookMetrics.totalCount}</span>
          </span>
        </div>
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-3.5 flex flex-col">
          <span className="text-[11px] font-serif text-slate-500">Topic Sections (Parts)</span>
          <span className="text-lg font-serif font-black text-slate-800">{bookMetrics.activePartsCount}</span>
        </div>
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-3.5 flex flex-col">
          <span className="text-[11px] font-serif text-slate-500">Total Word Count</span>
          <span className="text-lg font-serif font-black text-slate-800">
            {bookMetrics.totalWords.toLocaleString()}
          </span>
        </div>
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-3.5 flex flex-col">
          <span className="text-[11px] font-serif text-slate-500">Chapter Photos</span>
          <span className="text-lg font-serif font-black text-slate-800">{bookMetrics.photosCount}</span>
        </div>
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl p-3.5 flex flex-col col-span-2 sm:col-span-1">
          <span className="text-[11px] font-serif text-slate-500">Est. Book Length</span>
          <span className="text-lg font-serif font-black text-amber-800">
            ~{bookMetrics.estimatedPages} pages
          </span>
        </div>
      </div>

      {/* Major Mode Switcher Tabs */}
      <div className="flex flex-wrap border-b border-[#EFECE7] gap-2 pt-2">
        <button
          type="button"
          onClick={() => setMainMode('studio')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            mainMode === 'studio'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60 rounded-t-2xl shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4 text-amber-800" />
          <span>1. Generate Book for PDF (Studio & Export)</span>
        </button>

        <button
          type="button"
          onClick={() => setMainMode('publishOrder')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 font-serif font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            mainMode === 'publishOrder'
              ? 'border-amber-700 text-amber-900 bg-amber-50/60 rounded-t-2xl shadow-2xs'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Printer className="w-4 h-4 text-amber-800" />
          <span>2. Generate for Publish, Print & Ship</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-800 font-sans uppercase tracking-wider font-semibold">
            Lulu Direct
          </span>
        </button>
      </div>

      {mainMode === 'studio' ? (
        /* Main Two-Column Studio Layout */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT 7 COLUMNS: Configuration Tabs & Forms */}
        <div className="lg:col-span-7 bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 sm:p-6 shadow-xs space-y-6">
          {/* Step Navigation Pills */}
          <div className="flex flex-wrap gap-1.5 border-b border-[#EFECE7] pb-4">
            {[
              { id: 'curator', label: '1. Stories & Topics', icon: Layers },
              { id: 'cover', label: '2. Book Cover', icon: Palette },
              { id: 'frontMatter', label: '3. Front Matter', icon: BookMarked },
              { id: 'backMatter', label: '4. Back Matter', icon: Award },
              { id: 'printFormat', label: '5. Print & Trim Size', icon: Type },
            ].map((t) => {
              const Icon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setActiveTab(t.id as ConfigTab)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100/80 hover:bg-slate-200/70 text-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: STORIES & TOPIC CATEGORIES CURATOR */}
          {activeTab === 'curator' && (
            <div className="space-y-5">
              {storyItems.length === 0 ? (
                <div className="text-center py-12 px-4 border border-dashed border-slate-300 rounded-2xl space-y-2">
                  <FileText className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="font-serif font-bold text-sm text-slate-700">
                    No Published Stories Found Yet
                  </p>
                  <p className="font-serif text-xs text-slate-500 max-w-md mx-auto">
                    Publish stories on your Author Page first, and they will automatically appear here organized by their Topic Categories.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {groupedParts.map((part, pIdx) => {
                    const includedInPart = part.stories.filter((s) => s.included).length;
                    const allPartIncluded = includedInPart === part.stories.length;

                    return (
                      <div
                        key={part.partTitle}
                        className="border border-[#EFECE7] rounded-2xl overflow-hidden bg-white shadow-2xs"
                      >
                        {/* Topic Category Part Header */}
                        <div className="bg-slate-50 px-4 py-3 border-b border-[#EFECE7] flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5">
                            <button
                              type="button"
                              onClick={() => togglePartInclusion(part.partTitle, !allPartIncluded)}
                              className="text-slate-700 hover:text-amber-700 cursor-pointer"
                              title={allPartIncluded ? 'Exclude all stories in this topic' : 'Include all stories in this topic'}
                            >
                              {allPartIncluded ? (
                                <CheckSquare className="w-4 h-4 text-amber-700" />
                              ) : (
                                <Square className="w-4 h-4 text-slate-400" />
                              )}
                            </button>
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                                Part {toRoman(pIdx + 1)} • Topic Category
                              </span>
                              <h3 className="font-serif font-bold text-sm text-slate-900">
                                {part.partTitle}
                              </h3>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-serif text-slate-500">
                              {includedInPart} of {part.stories.length} included
                            </span>
                            <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                              <button
                                type="button"
                                onClick={() => movePartOrder(pIdx, -1)}
                                disabled={pIdx === 0}
                                className="p-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Topic Section Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5 text-slate-700" />
                              </button>
                              <button
                                type="button"
                                onClick={() => movePartOrder(pIdx, 1)}
                                disabled={pIdx === groupedParts.length - 1}
                                className="p-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                title="Move Topic Section Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5 text-slate-700" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Stories List inside this Topic Part */}
                        <div className="divide-y divide-slate-100">
                          {part.stories.map((story, sIdx) => {
                            const isEditing = editingChapterId === story.mbrStoryId;
                            return (
                              <div
                                key={story.mbrStoryId}
                                className={`p-3.5 transition-colors ${
                                  story.included ? 'bg-white' : 'bg-slate-50/60 opacity-60'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <button
                                      type="button"
                                      onClick={() => toggleStoryInclusion(story.mbrStoryId)}
                                      className="mt-0.5 text-slate-700 hover:text-amber-700 cursor-pointer shrink-0"
                                    >
                                      {story.included ? (
                                        <CheckSquare className="w-4 h-4 text-amber-700" />
                                      ) : (
                                        <Square className="w-4 h-4 text-slate-400" />
                                      )}
                                    </button>
                                    <div className="min-w-0">
                                      <p className="font-serif font-bold text-xs sm:text-sm text-slate-900 truncate">
                                        {story.chapterTitleOverride || story.originalTitle}
                                      </p>
                                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 font-serif mt-0.5">
                                        <span>{story.wordCount.toLocaleString()} words</span>
                                        {story.chapterSubtitle && (
                                          <>
                                            <span>•</span>
                                            <span className="italic">{story.chapterSubtitle}</span>
                                          </>
                                        )}
                                        {story.photoUrl && (
                                          <>
                                            <span>•</span>
                                            <span className="inline-flex items-center gap-1 text-amber-800">
                                              <ImageIcon className="w-3 h-3" />
                                              {story.chapterIncludePhoto ? 'Photo included' : 'Photo hidden'}
                                            </span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1.5 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setEditingChapterId(isEditing ? null : story.mbrStoryId)
                                      }
                                      className="px-2 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 text-[11px] font-serif text-slate-600 inline-flex items-center gap-1 cursor-pointer"
                                      title="Customize chapter title, subtitle, or photo inclusion"
                                    >
                                      <Edit3 className="w-3 h-3" />
                                      <span>Customize</span>
                                    </button>
                                    <div className="flex items-center border border-slate-200 rounded-lg bg-white overflow-hidden">
                                      <button
                                        type="button"
                                        onClick={() => moveChapterInPart(part.partTitle, sIdx, -1)}
                                        disabled={sIdx === 0}
                                        className="p-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                        title="Move Chapter Up"
                                      >
                                        <ChevronUp className="w-3.5 h-3.5 text-slate-600" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => moveChapterInPart(part.partTitle, sIdx, 1)}
                                        disabled={sIdx === part.stories.length - 1}
                                        className="p-1 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                                        title="Move Chapter Down"
                                      >
                                        <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                                      </button>
                                    </div>
                                  </div>
                                </div>

                                {/* Per-Chapter Override Drawer */}
                                {isEditing && (
                                  <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50/70 p-3 rounded-xl">
                                    <div>
                                      <label className="block text-[11px] font-serif font-bold text-slate-700 mb-1">
                                        Chapter Title Override (Book Only)
                                      </label>
                                      <input
                                        type="text"
                                        value={story.chapterTitleOverride}
                                        onChange={(e) =>
                                          setStoryItems((prev) =>
                                            prev.map((it) =>
                                              it.mbrStoryId === story.mbrStoryId
                                                ? { ...it, chapterTitleOverride: e.target.value }
                                                : it
                                            )
                                          )
                                        }
                                        placeholder={story.originalTitle}
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-serif bg-white"
                                      />
                                    </div>
                                    <div>
                                      <label className="block text-[11px] font-serif font-bold text-slate-700 mb-1">
                                        Chapter Subtitle / Date Label
                                      </label>
                                      <input
                                        type="text"
                                        value={story.chapterSubtitle}
                                        onChange={(e) =>
                                          setStoryItems((prev) =>
                                            prev.map((it) =>
                                              it.mbrStoryId === story.mbrStoryId
                                                ? { ...it, chapterSubtitle: e.target.value }
                                                : it
                                            )
                                          )
                                        }
                                        placeholder="e.g. Summer 1968 • Coos Bay, Oregon"
                                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-serif bg-white"
                                      />
                                    </div>
                                    {story.photoUrl && (
                                      <div className="sm:col-span-2 flex items-center justify-between">
                                        <label className="inline-flex items-center gap-2 text-xs font-serif text-slate-700 cursor-pointer">
                                          <input
                                            type="checkbox"
                                            checked={story.chapterIncludePhoto}
                                            onChange={(e) =>
                                              setStoryItems((prev) =>
                                                prev.map((it) =>
                                                  it.mbrStoryId === story.mbrStoryId
                                                    ? { ...it, chapterIncludePhoto: e.target.checked }
                                                    : it
                                                )
                                              )
                                            }
                                            className="rounded border-slate-300 text-amber-700"
                                          />
                                          <span>Include story header photograph in this chapter</span>
                                        </label>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BOOK COVER DESIGNER */}
          {activeTab === 'cover' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif font-bold text-base text-slate-900">
                  Book Cover & Spine Designer
                </h2>
                <p className="font-serif text-xs text-slate-600">
                  Configure your front cover title, author attribution, layout template, heirloom color palette, and back cover synopsis.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Book Title
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookTitle || ''}
                    onChange={(e) => setBookConfig({ ...bookConfig, bookTitle: e.target.value })}
                    placeholder="My Life Stories"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-serif"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Book Subtitle
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookSubtitle || ''}
                    onChange={(e) => setBookConfig({ ...bookConfig, bookSubtitle: e.target.value })}
                    placeholder="A Personal Memoir & Family Keepsake"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Author Display Name
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookAuthorDisplayName || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookAuthorDisplayName: e.target.value })
                    }
                    placeholder="Eleanor Ruth Hartwell"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Volume / Edition Label
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookVolumeLabel || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookVolumeLabel: e.target.value })
                    }
                    placeholder="Volume I • First Family Edition"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Cover Layout Template
                  </label>
                  <CdSelect
                    tag="bookCoverLayoutCd"
                    value={bookConfig.bookCoverLayoutCd || 'CLASSIC_FRAME'}
                    onChange={(val) => {
                      setBookConfig({ ...bookConfig, bookCoverLayoutCd: val });
                      setPreviewTab('cover');
                    }}
                    includeEmptyOption={false}
                    showDescriptionHelper
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Cover Color Palette
                  </label>
                  <CdSelect
                    tag="bookCoverThemeCd"
                    value={bookConfig.bookCoverThemeCd || 'AMBER'}
                    onChange={(val) => {
                      setBookConfig({ ...bookConfig, bookCoverThemeCd: val });
                      setPreviewTab('cover');
                    }}
                    includeEmptyOption={false}
                    showDescriptionHelper
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>
              </div>

              {/* Quick Color Swatch Selector */}
              <div className="pt-1">
                <span className="block text-[11px] font-serif font-bold text-slate-600 mb-2">
                  Quick Color Theme Swatches
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {Object.entries(COVER_THEME_PALETTES).map(([code, pal]) => {
                    const selected = (bookConfig.bookCoverThemeCd || 'AMBER') === code;
                    return (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setBookConfig({ ...bookConfig, bookCoverThemeCd: code });
                          setPreviewTab('cover');
                        }}
                        className={`p-2 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                          selected
                            ? 'border-amber-700 ring-2 ring-amber-700/20 bg-amber-50/40'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center gap-1">
                          <span
                            className="w-4 h-4 rounded-full border border-black/15"
                            style={{ backgroundColor: pal.bgHex }}
                          />
                          <span
                            className="w-4 h-4 rounded-full border border-black/15"
                            style={{ backgroundColor: pal.accentHex }}
                          />
                        </div>
                        <span className="text-[10px] font-serif font-bold text-slate-700 truncate">
                          {pal.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Front Cover Photograph Section (URL input removed per requirement) */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-800">
                    Front Cover Photograph (Optional)
                  </label>
                  <p className="text-[11px] font-serif text-slate-500">
                    Upload a high-resolution portrait or choose a picture from one of your photo albums.
                  </p>
                </div>

                {bookConfig.bookCoverPhotoUrl ? (
                  // Cover Photo Selected State
                  <div className="bg-[#FAF8F5] border border-[#E3DDD2] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="w-24 h-32 rounded-xl overflow-hidden bg-slate-200 border border-slate-300 shadow-xs shrink-0 relative group">
                      <img
                        src={bookConfig.bookCoverPhotoUrl}
                        alt="Front Cover Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 space-y-2.5 w-full">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-serif font-bold text-slate-800">
                          Active Cover Photo
                        </span>
                        <span className="text-[10px] font-serif font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                          Set
                        </span>
                      </div>

                      <div>
                        <label className="block text-[11px] font-serif text-slate-600 mb-1">
                          Cover Photo Caption / Inscription (optional)
                        </label>
                        <input
                          type="text"
                          value={bookConfig.bookCoverPhotoCaption || ''}
                          onChange={(e) =>
                            setBookConfig({ ...bookConfig, bookCoverPhotoCaption: e.target.value })
                          }
                          placeholder="e.g., Portrait taken in Autumn 1978"
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <label className="px-3 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer">
                          {isUploadingCover ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Upload className="w-3.5 h-3.5" />
                          )}
                          <span>{isUploadingCover ? 'Uploading...' : 'Upload Replacement'}</span>
                          <input
                            type="file"
                            accept="image/*"
                            disabled={isUploadingCover}
                            onChange={handleUploadCoverPhoto}
                            className="hidden"
                          />
                        </label>

                        <button
                          type="button"
                          onClick={() => setIsAlbumPickerOpen(true)}
                          className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Folder className="w-3.5 h-3.5 text-amber-800" />
                          <span>Choose from Albums</span>
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            setBookConfig({
                              ...bookConfig,
                              bookCoverPhotoUrl: '',
                              bookCoverPhotoCaption: '',
                            })
                          }
                          className="px-3 py-1.5 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-serif font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Empty State
                  <div className="bg-[#FAF8F5] border-2 border-dashed border-[#E3DDD2] rounded-2xl p-6 text-center space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-100/70 text-amber-800 flex items-center justify-center mx-auto shadow-2xs">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-serif text-xs font-bold text-slate-800">
                        No cover photograph selected
                      </h4>
                      <p className="font-serif text-[11px] text-slate-500 mt-0.5 max-w-sm mx-auto">
                        Add a portrait or memorable family photo to grace the front of your printed keepsake book.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                      <label className="px-4 py-2 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer">
                        {isUploadingCover ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingCover ? 'Uploading...' : 'Upload Cover Photo'}</span>
                        <input
                          type="file"
                          accept="image/*"
                          disabled={isUploadingCover}
                          onChange={handleUploadCoverPhoto}
                          className="hidden"
                        />
                      </label>

                      <button
                        type="button"
                        onClick={() => setIsAlbumPickerOpen(true)}
                        className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-serif font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <Folder className="w-3.5 h-3.5 text-amber-800" />
                        <span>Choose from Photo Albums</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                  Back Cover Blurb / Synopsis
                </label>
                <textarea
                  rows={4}
                  value={bookConfig.bookBackCoverBlurb || ''}
                  onChange={(e) => {
                    setBookConfig({ ...bookConfig, bookBackCoverBlurb: e.target.value });
                    setPreviewTab('backCover');
                  }}
                  placeholder="Write a warm summary of your memoir to appear on the back cover of your book..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                />
              </div>
            </div>
          )}

          {/* TAB 3: FRONT MATTER */}
          {activeTab === 'frontMatter' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif font-bold text-base text-slate-900">
                  Book Front Matter Configuration
                </h2>
                <p className="font-serif text-xs text-slate-600">
                  Configure standard publishing pages that appear before Chapter I: Copyright, Dedication, Foreword, and Table of Contents.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-[#EFECE7]">
                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludeToc !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludeToc: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Include Auto-Numbered Table of Contents</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludePartDividers !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludePartDividers: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Include Topic Category Part Divider Pages</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludeCopyrightPage !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludeCopyrightPage: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Include Copyright & Edition Page</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Copyright Year
                  </label>
                  <input
                    type="number"
                    value={bookConfig.bookCopyrightYear || new Date().getFullYear()}
                    onChange={(e) =>
                      setBookConfig({
                        ...bookConfig,
                        bookCopyrightYear: parseInt(e.target.value, 10) || new Date().getFullYear(),
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    ISBN or Private Family Edition Number (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookIsbn || ''}
                    onChange={(e) => setBookConfig({ ...bookConfig, bookIsbn: e.target.value })}
                    placeholder="e.g. Private Family Archive Edition #01"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
              </div>

              {/* Dedication */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-serif font-bold text-slate-700">
                    Dedication Page Text
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setBookConfig({
                        ...bookConfig,
                        bookDedicationText:
                          'To my children and grandchildren—may these stories remind you of where we came from, the love that carried us through every season, and the enduring bond of our family.',
                      })
                    }
                    className="text-[11px] font-serif text-amber-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Insert Sample Family Dedication</span>
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={bookConfig.bookDedicationText || ''}
                  onChange={(e) =>
                    setBookConfig({ ...bookConfig, bookDedicationText: e.target.value })
                  }
                  placeholder="For my children and grandchildren..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                />
              </div>

              {/* Foreword / Preface */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Foreword / Preface Heading
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookForewordTitle || 'Foreword'}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookForewordTitle: e.target.value })
                    }
                    placeholder="Foreword or Author's Preface"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Foreword Author Attribution (Optional)
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookForewordAuthor || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookForewordAuthor: e.target.value })
                    }
                    placeholder={bookConfig.bookAuthorDisplayName || 'Author Name'}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Foreword / Preface Narrative
                  </label>
                  <textarea
                    rows={5}
                    value={bookConfig.bookForewordText || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookForewordText: e.target.value })
                    }
                    placeholder="Share why you decided to compile this book or invite a family member to write an introductory note..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACK MATTER */}
          {activeTab === 'backMatter' && (
            <div className="space-y-4">
              <div>
                <h2 className="font-serif font-bold text-base text-slate-900">
                  Book Back Matter Configuration
                </h2>
                <p className="font-serif text-xs text-slate-600">
                  Add closing reflections, gratitude, an About the Author biography, and a classic publisher’s Colophon.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Afterword / Epilogue Heading
                  </label>
                  <input
                    type="text"
                    value={bookConfig.bookAfterwordTitle || 'Afterword'}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookAfterwordTitle: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>
                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Afterword / Epilogue Text
                  </label>
                  <textarea
                    rows={4}
                    value={bookConfig.bookAfterwordText || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookAfterwordText: e.target.value })
                    }
                    placeholder="Closing reflections looking back on the journey..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Acknowledgments
                  </label>
                  <textarea
                    rows={3}
                    value={bookConfig.bookAcknowledgmentsText || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookAcknowledgmentsText: e.target.value })
                    }
                    placeholder="Thank family members, friends, and mentors who contributed memories or photographs..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-serif font-bold text-slate-700">
                      About the Author Biography
                    </label>
                    {memberProfile?.mbrIntroduction && (
                      <button
                        type="button"
                        onClick={() =>
                          setBookConfig({
                            ...bookConfig,
                            bookAboutAuthorText: memberProfile.mbrIntroduction,
                          })
                        }
                        className="text-[11px] font-serif text-amber-800 hover:underline cursor-pointer"
                      >
                        Copy from Member Profile Introduction
                      </button>
                    )}
                  </div>
                  <textarea
                    rows={4}
                    value={bookConfig.bookAboutAuthorText || ''}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookAboutAuthorText: e.target.value })
                    }
                    placeholder="Short biographical note about the author..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif"
                  />
                </div>

                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludeColophon !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludeColophon: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Include Archival Colophon Page at End of Book</span>
                </label>
              </div>
            </div>
          )}

          {/* TAB 5: PRINT FORMAT & TYPOGRAPHY */}
          {activeTab === 'printFormat' && (
            <div className="space-y-5">
              <div>
                <h2 className="font-serif font-bold text-base text-slate-900">
                  Print-on-Demand (POD) Trim Format & Typography
                </h2>
                <p className="font-serif text-xs text-slate-600">
                  Select industry-standard book trim dimensions compatible with Amazon KDP, Lulu, Blurb, and IngramSpark.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Book Trim Size Format
                  </label>
                  <CdSelect
                    tag="bookTrimSizeCd"
                    value={bookConfig.bookTrimSizeCd || 'TRADE_6X9'}
                    onChange={(val) => setBookConfig({ ...bookConfig, bookTrimSizeCd: val })}
                    includeEmptyOption={false}
                    showDescriptionHelper
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Interior Typography Font Family
                  </label>
                  <select
                    value={bookConfig.bookFontFamilyCd || 'times'}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookFontFamilyCd: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  >
                    <option value="times">Classic Literary Serif (Times / Baskerville style)</option>
                    <option value="helvetica">Clean Modern Sans (Helvetica)</option>
                    <option value="courier">Archival Typewriter (Courier)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-serif font-bold text-slate-700 mb-1">
                    Base Body Font Size (pt)
                  </label>
                  <select
                    value={String(bookConfig.bookFontSizePt || 11)}
                    onChange={(e) =>
                      setBookConfig({
                        ...bookConfig,
                        bookFontSizePt: parseFloat(e.target.value) || 11.0,
                      })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-serif bg-white"
                  >
                    <option value="10">10 pt (Compact Trade Edition)</option>
                    <option value="10.5">10.5 pt (Standard Literary)</option>
                    <option value="11">11 pt (Recommended Heirloom Reader)</option>
                    <option value="11.5">11.5 pt (Comfortable Print)</option>
                    <option value="12">12 pt (Large Comfort Print)</option>
                    <option value="13">13 pt (Accessible Keepsake Print)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-[#EFECE7]">
                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludeDropCaps !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludeDropCaps: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Render 3-Line Literary Drop Caps on Chapters</span>
                </label>

                <label className="flex items-center gap-2.5 text-xs font-serif text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={bookConfig.bookIncludeStoryPhotos !== false}
                    onChange={(e) =>
                      setBookConfig({ ...bookConfig, bookIncludeStoryPhotos: e.target.checked })
                    }
                    className="rounded border-slate-300 text-amber-700"
                  />
                  <span>Include Story Photographs in Chapters</span>
                </label>
              </div>

              {/* Third-Party Printing Specification Card */}
              <div className="bg-amber-50/60 border border-amber-200/80 rounded-2xl p-4 space-y-2">
                <h3 className="font-serif font-bold text-xs text-amber-950 flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-amber-800" />
                  <span>Print-on-Demand (POD) Specification Summary</span>
                </h3>
                <p className="font-serif text-xs text-slate-700 leading-relaxed">
                  Selected Trim: <strong>{activeTrim.label}</strong> ({activeTrim.width}pt × {activeTrim.height}pt). Inside binding gutter margin: <strong>{activeTrim.insideMargin}pt</strong>; Outside edge margin: <strong>{activeTrim.outsideMargin}pt</strong>.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT 5 COLUMNS: Live Interactive Book Preview Studio */}
        <div className="lg:col-span-5 lg:sticky lg:top-6 space-y-4">
          <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-[#EFECE7] pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-amber-800" />
                <h3 className="font-serif font-bold text-sm text-slate-900">
                  Live Book Preview
                </h3>
              </div>
              <div className="flex items-center gap-1.5">
                {previewTab === 'cover' && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 text-[10px] font-serif font-bold">
                    {bookConfig.bookCoverLayoutCd === 'HERO_BLEED'
                      ? 'Full-Bleed Hero'
                      : bookConfig.bookCoverLayoutCd === 'PORTRAIT_MEDALLION'
                        ? 'Portrait Medallion'
                        : bookConfig.bookCoverLayoutCd === 'MINIMAL_LINEN'
                          ? 'Minimalist Linen'
                          : 'Classic Frame'}
                  </span>
                )}
                <span className="text-[11px] font-serif text-slate-500">{activeTrim.label}</span>
              </div>
            </div>

            {/* Preview Mode Switcher */}
            <div className="grid grid-cols-4 gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'cover', label: 'Front Cover' },
                { id: 'backCover', label: 'Back Cover' },
                { id: 'toc', label: 'Contents' },
                { id: 'chapter', label: 'Chapter' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPreviewTab(p.id as PreviewTab)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-serif font-bold transition-all cursor-pointer ${
                    previewTab === p.id
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Book Page Mockup Canvas (6:9 aspect ratio) */}
            <div className="flex justify-center py-2">
              {previewTab === 'cover' && (
                <div
                  className="w-full max-w-[310px] aspect-[2/3] rounded-r-2xl rounded-l-md shadow-xl relative overflow-hidden border transition-all duration-300"
                  style={{
                    backgroundColor: activePalette.bgHex,
                    color: activePalette.textHex,
                    borderColor: activePalette.accentHex,
                  }}
                >
                  {/* Book Spine Crease Effect */}
                  <div
                    className="absolute inset-y-0 left-0 w-3 opacity-25 pointer-events-none z-20"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(0,0,0,0.45) 0%, rgba(255,255,255,0.2) 60%, transparent 100%)',
                    }}
                  />

                  {/* LAYOUT 1: HERO_BLEED (Top 58% Full-Bleed Photo + Bottom Title Band) */}
                  {bookConfig.bookCoverLayoutCd === 'HERO_BLEED' ? (
                    <div className="w-full h-full flex flex-col">
                      {/* Top 58% Full-Bleed Hero Area */}
                      <div
                        className="relative w-full h-[58%] overflow-hidden flex items-center justify-center"
                        style={{
                          backgroundColor: `rgb(${activePalette.secondaryBgRgb.join(',')})`,
                        }}
                      >
                        {bookConfig.bookCoverPhotoUrl ? (
                          <img
                            src={bookConfig.bookCoverPhotoUrl}
                            alt="Book cover hero"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="flex flex-col items-center justify-center gap-1.5 p-4 text-center"
                            style={{ color: activePalette.accentHex }}
                          >
                            <ImageIcon className="w-10 h-10 opacity-75" />
                            <span className="text-[10px] font-serif tracking-wider uppercase opacity-80">
                              Full-Bleed Hero Photo Area
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Gold / Accent Horizontal Divider */}
                      <div
                        className="w-full h-[3px] shrink-0"
                        style={{ backgroundColor: activePalette.accentHex }}
                      />

                      {/* Bottom 42% Title Band */}
                      <div className="flex-1 flex flex-col justify-between items-center text-center px-5 py-4">
                        <div className="space-y-1.5">
                          {bookConfig.bookVolumeLabel && (
                            <p
                              className="text-[9px] font-serif font-bold tracking-[0.2em] uppercase"
                              style={{ color: activePalette.accentHex }}
                            >
                              {bookConfig.bookVolumeLabel}
                            </p>
                          )}
                          <h4 className="font-serif font-black text-base leading-snug line-clamp-2">
                            {bookConfig.bookTitle || 'My Life Stories'}
                          </h4>
                          {bookConfig.bookSubtitle && (
                            <p className="font-serif italic text-[10px] opacity-85 line-clamp-2">
                              {bookConfig.bookSubtitle}
                            </p>
                          )}
                        </div>

                        <p
                          className="font-serif font-bold text-[10px] tracking-[0.16em] uppercase pt-1"
                          style={{ color: activePalette.accentHex }}
                        >
                          {bookConfig.bookAuthorDisplayName || 'Author'}
                        </p>
                      </div>
                    </div>
                  ) : bookConfig.bookCoverLayoutCd === 'PORTRAIT_MEDALLION' ? (
                    /* LAYOUT 2: PORTRAIT_MEDALLION (Outer Frame + Top Title + Centered Framed Portrait Medallion) */
                    <div className="w-full h-full flex flex-col justify-between p-6 relative">
                      <div
                        className="absolute inset-3.5 border-2 pointer-events-none"
                        style={{ borderColor: activePalette.accentHex, opacity: 0.85 }}
                      />

                      <div className="relative z-10 text-center space-y-1.5 pt-2">
                        {bookConfig.bookVolumeLabel && (
                          <p
                            className="text-[9px] font-serif font-bold tracking-[0.2em] uppercase"
                            style={{ color: activePalette.accentHex }}
                          >
                            {bookConfig.bookVolumeLabel}
                          </p>
                        )}
                        <h4 className="font-serif font-black text-base leading-snug px-2">
                          {bookConfig.bookTitle || 'My Life Stories'}
                        </h4>
                        {bookConfig.bookSubtitle && (
                          <p className="font-serif italic text-[10px] opacity-85 px-2 leading-relaxed line-clamp-2">
                            {bookConfig.bookSubtitle}
                          </p>
                        )}
                      </div>

                      {/* Centered Medallion Portrait Frame with Mat */}
                      <div className="relative z-10 my-auto mx-auto">
                        <div
                          className="w-36 h-44 rounded-full p-1.5 border-2 shadow-md flex items-center justify-center overflow-hidden"
                          style={{
                            borderColor: activePalette.accentHex,
                            backgroundColor: `rgb(${activePalette.secondaryBgRgb.join(',')})`,
                          }}
                        >
                          {bookConfig.bookCoverPhotoUrl ? (
                            <img
                              src={bookConfig.bookCoverPhotoUrl}
                              alt="Portrait medallion"
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div
                              className="flex flex-col items-center justify-center text-center p-2"
                              style={{ color: activePalette.accentHex }}
                            >
                              <BookOpen className="w-8 h-8 opacity-80 mb-1" />
                              <span className="text-[9px] font-serif uppercase tracking-wider opacity-80">
                                Portrait Medallion
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="relative z-10 text-center pb-1">
                        <p className="font-serif font-bold text-xs tracking-wide">
                          {bookConfig.bookAuthorDisplayName || 'Author'}
                        </p>
                      </div>
                    </div>
                  ) : bookConfig.bookCoverLayoutCd === 'MINIMAL_LINEN' ? (
                    /* LAYOUT 3: MINIMAL_LINEN (Left Cloth Spine Accent Bar + Clean Left-Aligned Typography) */
                    <div className="w-full h-full flex">
                      {/* Left Bookbinding Cloth Spine Bar */}
                      <div
                        className="w-5 h-full shrink-0"
                        style={{ backgroundColor: activePalette.accentHex }}
                      />

                      {/* Right Linen Cover Surface */}
                      <div className="flex-1 h-full flex flex-col justify-between p-6 text-left">
                        <div className="space-y-2.5 pt-6">
                          {bookConfig.bookVolumeLabel && (
                            <p
                              className="text-[9px] font-serif font-bold tracking-[0.2em] uppercase"
                              style={{ color: activePalette.accentHex }}
                            >
                              {bookConfig.bookVolumeLabel}
                            </p>
                          )}
                          <h4 className="font-serif font-black text-xl leading-tight">
                            {bookConfig.bookTitle || 'My Life Stories'}
                          </h4>
                          <div
                            className="w-12 h-[2.5px] my-2"
                            style={{ backgroundColor: activePalette.accentHex }}
                          />
                          {bookConfig.bookSubtitle && (
                            <p className="font-serif italic text-[11px] opacity-85 leading-relaxed">
                              {bookConfig.bookSubtitle}
                            </p>
                          )}
                        </div>

                        {bookConfig.bookCoverPhotoUrl && (
                          <div
                            className="w-28 h-28 rounded-md overflow-hidden border my-auto"
                            style={{ borderColor: activePalette.accentHex }}
                          >
                            <img
                              src={bookConfig.bookCoverPhotoUrl}
                              alt="Book cover"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                        <div className="pb-2">
                          <p
                            className="font-serif text-xs tracking-wider uppercase font-semibold"
                            style={{ color: activePalette.accentHex }}
                          >
                            {bookConfig.bookAuthorDisplayName || 'Author'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* LAYOUT 4 (DEFAULT): CLASSIC_FRAME (Double-Ruled Ornamental Border + Centered Heirloom Serif) */
                    <div className="w-full h-full flex flex-col justify-between p-6 relative">
                      {/* Outer & Inner Double Ornamental Frame */}
                      <div
                        className="absolute inset-3 border-2 pointer-events-none"
                        style={{ borderColor: activePalette.accentHex, opacity: 0.85 }}
                      />
                      <div
                        className="absolute inset-4 border pointer-events-none"
                        style={{ borderColor: activePalette.accentHex, opacity: 0.55 }}
                      />

                      <div className="relative z-10 text-center space-y-2 pt-4">
                        {bookConfig.bookVolumeLabel && (
                          <p
                            className="text-[9px] font-serif font-bold tracking-[0.2em] uppercase"
                            style={{ color: activePalette.accentHex }}
                          >
                            {bookConfig.bookVolumeLabel}
                          </p>
                        )}
                        <h4 className="font-serif font-black text-lg leading-snug px-2">
                          {bookConfig.bookTitle || 'My Life Stories'}
                        </h4>
                        <div
                          className="w-12 h-[1px] mx-auto my-1.5"
                          style={{ backgroundColor: activePalette.accentHex }}
                        />
                        {bookConfig.bookSubtitle && (
                          <p className="font-serif italic text-[11px] opacity-85 px-3 leading-relaxed">
                            {bookConfig.bookSubtitle}
                          </p>
                        )}
                      </div>

                      {bookConfig.bookCoverPhotoUrl ? (
                        <div
                          className="relative z-10 my-auto mx-auto w-36 h-36 rounded-lg overflow-hidden border shadow-sm"
                          style={{ borderColor: activePalette.accentHex }}
                        >
                          <img
                            src={bookConfig.bookCoverPhotoUrl}
                            alt="Book cover"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="relative z-10 my-auto text-center opacity-40">
                          <BookOpen className="w-10 h-10 mx-auto" />
                        </div>
                      )}

                      <div className="relative z-10 text-center pb-2">
                        <p className="font-serif font-bold text-xs tracking-wide">
                          {bookConfig.bookAuthorDisplayName || 'Author'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {previewTab === 'backCover' && (
                <div
                  className="w-full max-w-[310px] aspect-[2/3] rounded-l-2xl rounded-r-md shadow-xl relative overflow-hidden flex flex-col justify-between p-7 border transition-all duration-300"
                  style={{
                    backgroundColor: activePalette.bgHex,
                    color: activePalette.textHex,
                    borderColor: activePalette.accentHex,
                  }}
                >
                  <div
                    className="absolute inset-3.5 border pointer-events-none"
                    style={{ borderColor: activePalette.accentHex, opacity: 0.6 }}
                  />
                  <div className="relative z-10 space-y-3 pt-6 text-center">
                    <h5
                      className="font-serif font-bold text-xs uppercase tracking-wider"
                      style={{ color: activePalette.accentHex }}
                    >
                      {bookConfig.bookTitle || 'My Life Stories'}
                    </h5>
                    <p className="font-serif italic text-[11px] leading-relaxed opacity-90 px-2">
                      {bookConfig.bookBackCoverBlurb ||
                        bookConfig.bookAboutAuthorText ||
                        'A curated collection of personal memoirs, family history, and life reflections preserved for future generations.'}
                    </p>
                  </div>
                  <div className="relative z-10 text-center space-y-1 pb-2 opacity-75 text-[10px] font-serif">
                    {bookConfig.bookIsbn && <p>ISBN / Edition: {bookConfig.bookIsbn}</p>}
                    <p>StoryBook Heirloom Edition • {bookMetrics.includedCount} Chapters</p>
                  </div>
                </div>
              )}

              {previewTab === 'toc' && (
                <div className="w-full max-w-[310px] aspect-[2/3] bg-[#FDFCF9] rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between text-slate-800">
                  <div className="space-y-3 overflow-y-auto pr-1">
                    <div className="text-center space-y-1 pb-2 border-b border-amber-900/15">
                      <h4 className="font-serif font-bold text-sm text-slate-900">
                        Table of Contents
                      </h4>
                    </div>
                    <div className="space-y-2.5 text-[10px] font-serif">
                      {groupedParts.map((part, pIdx) => {
                        const activeInPart = part.stories.filter((s) => s.included);
                        if (activeInPart.length === 0) return null;
                        return (
                          <div key={part.partTitle} className="space-y-1">
                            {bookConfig.bookIncludePartDividers !== false && (
                              <div className="font-bold text-amber-900 uppercase tracking-wider text-[9px] pt-1">
                                Part {toRoman(pIdx + 1)}: {part.partTitle}
                              </div>
                            )}
                            {activeInPart.map((st, idx) => (
                              <div
                                key={st.mbrStoryId}
                                className="flex items-baseline justify-between gap-2 pl-2 text-slate-700"
                              >
                                <span className="truncate">
                                  {st.chapterTitleOverride || st.originalTitle}
                                </span>
                                <span className="text-slate-400 shrink-0">••• {pIdx * 6 + idx + 5}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="text-center text-[9px] font-serif text-slate-400 pt-2">
                    v
                  </div>
                </div>
              )}

              {previewTab === 'chapter' && (
                <div className="w-full max-w-[310px] aspect-[2/3] bg-[#FDFCF9] rounded-xl shadow-lg border border-slate-200 p-6 flex flex-col justify-between text-slate-800 overflow-hidden">
                  {sampleChapter ? (
                    <div className="space-y-2.5 overflow-hidden">
                      <div className="text-center space-y-1 pb-2 border-b border-slate-200">
                        <span className="text-[8px] font-serif font-bold tracking-widest text-amber-800 uppercase">
                          CHAPTER I • {sampleChapter.partTitle}
                        </span>
                        <h4 className="font-serif font-bold text-sm text-slate-900 leading-snug">
                          {sampleChapter.title}
                        </h4>
                        {sampleChapter.subtitle && (
                          <p className="text-[9px] font-serif italic text-slate-500">
                            {sampleChapter.subtitle}
                          </p>
                        )}
                      </div>

                      {bookConfig.bookIncludeStoryPhotos !== false &&
                        sampleChapter.includePhoto &&
                        sampleChapter.photoUrl && (
                          <div className="w-full h-24 rounded-md overflow-hidden border border-slate-200">
                            <img
                              src={sampleChapter.photoUrl}
                              alt={sampleChapter.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}

                      <p className="font-serif text-[10px] leading-relaxed text-slate-700 line-clamp-10">
                        {bookConfig.bookIncludeDropCaps !== false && sampleChapter.content ? (
                          <>
                            <span className="float-left font-serif font-bold text-2xl leading-none pr-1.5 pt-0.5 text-amber-800">
                              {sampleChapter.content.trim().charAt(0)}
                            </span>
                            {sampleChapter.content.trim().slice(1, 420)}...
                          </>
                        ) : (
                          sampleChapter.content.slice(0, 420)
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="my-auto text-center text-xs font-serif text-slate-400">
                      Include at least one story to preview a sample chapter page.
                    </div>
                  )}
                  <div className="text-center text-[9px] font-serif text-slate-400 pt-2">1</div>
                </div>
              )}
            </div>
          </div>

          {/* Lulu Physical Print Keepsake Callout Card */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 border border-amber-200/80 rounded-3xl p-5 space-y-3 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center shrink-0">
                <Printer className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-serif font-bold text-amber-950">
                  Publish & Ship Physical Keepsake
                </h4>
                <p className="text-[11px] font-serif text-amber-800">
                  Archival casebound hardcover with foil embossing via Lulu Direct.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setMainMode('publishOrder')}
              className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white text-xs font-serif font-bold shadow-2xs transition-all cursor-pointer"
            >
              <span>Publish, Print & Ship Book</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
      ) : (
        <MbrStoryBookPublishOrderSection
          bookConfig={bookConfig}
          includedChapters={includedChapters}
          pageCount={bookMetrics.estimatedPages}
          isSandbox={isSandbox}
          mbrId={memberProfile?.mbrId}
          onSwitchToStudioTab={() => setMainMode('studio')}
          onSaveBook={() => handleSaveBookConfig(true)}
        />
      )}

      {/* --- CHOOSE COVER FROM PHOTO ALBUMS MODAL --- */}
      {isAlbumPickerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-[#EAE5DC] rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#F2EEE9]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100/70 text-amber-800 flex items-center justify-center">
                  <Folder className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-slate-900">
                    Choose Cover Photo from Albums
                  </h3>
                  <p className="font-serif text-xs text-slate-500">
                    Select a photograph from your curated collections to feature on your book cover
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAlbumPickerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Album Tabs */}
            {memberAlbums.length > 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAlbumIdForCover('all')}
                  className={`px-3 py-1 rounded-full text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                    selectedAlbumIdForCover === 'all'
                      ? 'bg-amber-800 text-white font-bold shadow-2xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All Photos ({allAvailablePhotos.length})
                </button>
                {memberAlbums.map((alb) => (
                  <button
                    key={alb.albumId}
                    type="button"
                    onClick={() => setSelectedAlbumIdForCover(alb.albumId)}
                    className={`px-3 py-1 rounded-full text-xs font-serif whitespace-nowrap transition-all cursor-pointer ${
                      selectedAlbumIdForCover === alb.albumId
                        ? 'bg-amber-800 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {alb.albumName} ({alb.photos.filter((p) => !isAudioMedia(p)).length})
                  </button>
                ))}
              </div>
            )}

            {/* Photos Grid */}
            {displayedAlbumPhotos.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
                  <ImageIcon className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-serif text-xs font-bold text-slate-700">
                    No photographs found in this collection
                  </h4>
                  <p className="font-serif text-[11px] text-slate-500 mt-0.5">
                    Upload photos in your Photo Book or upload a new picture directly.
                  </p>
                </div>
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-800 hover:bg-amber-900 text-white rounded-xl text-xs font-serif font-bold transition-all shadow-xs cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Cover Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      setIsAlbumPickerOpen(false);
                      handleUploadCoverPhoto(e);
                    }}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-1">
                  {displayedAlbumPhotos.map((photo) => {
                    const isSelected = bookConfig.bookCoverPhotoUrl === photo.url;
                    return (
                      <div
                        key={photo.photoId}
                        onClick={() => {
                          setBookConfig((prev) => ({
                            ...prev,
                            bookCoverPhotoUrl: photo.url,
                            bookCoverPhotoCaption:
                              photo.caption || photo.title || prev.bookCoverPhotoCaption || '',
                          }));
                          setIsAlbumPickerOpen(false);
                          showToast('success', `Selected "${photo.title || 'photo'}" as book cover.`);
                        }}
                        className={`group relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-4/3 bg-slate-100 ${
                          isSelected
                            ? 'border-amber-800 ring-2 ring-amber-800/40 shadow-md'
                            : 'border-[#EAE5DC] hover:border-amber-600 hover:shadow-xs'
                        }`}
                      >
                        <img
                          src={photo.url}
                          alt={photo.title || 'Album photo'}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-between p-2">
                          <div className="flex justify-between items-start">
                            {photo.albumName && (
                              <span className="text-[9px] font-serif text-white/90 bg-black/60 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                {photo.albumName}
                              </span>
                            )}
                            {isSelected ? (
                              <span className="text-[10px] font-serif font-bold text-amber-900 bg-amber-200 border border-amber-300 px-1.5 py-0.5 rounded shadow-xs flex items-center gap-0.5">
                                <Check className="w-3 h-3 stroke-[3]" />
                                Active
                              </span>
                            ) : (
                              <span className="text-[10px] font-serif font-bold text-white bg-black/60 px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                                Select
                              </span>
                            )}
                          </div>
                          <p className="text-white text-[11px] font-serif font-bold truncate">
                            {photo.title || 'Untitled Photo'}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-[#F2EEE9] flex items-center justify-between">
                  <label className="text-xs font-serif font-bold text-amber-800 hover:text-amber-950 flex items-center gap-1.5 cursor-pointer">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload a new image instead</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        setIsAlbumPickerOpen(false);
                        handleUploadCoverPhoto(e);
                      }}
                      className="hidden"
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setIsAlbumPickerOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-serif font-bold transition-all cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <AdminComponentTag name="mbrStoryBookGenerator" />
    </div>
  );
}

export {
  MbrStoryBookGeneratorPage as MbrStoryBookGeneratorFeature,
  MbrStoryBookGeneratorPage as SbMbrStoryBookGeneratorFeature,
};
