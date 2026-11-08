/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { MbrStoryBook } from '@/src/services/api';

export interface StoryBookChapterInput {
  mbrStoryId: string;
  title: string;
  subtitle?: string | null;
  partTitle: string;
  partSortOrder: number;
  chapterSortOrder: number;
  content: string;
  photoUrl?: string | null;
  photoCaption?: string | null;
  includePhoto: boolean;
  publishedDate?: string | null;
}

export interface GenerateStoryBookPdfOptions {
  book: Partial<MbrStoryBook>;
  chapters: StoryBookChapterInput[];
  mode?: 'full' | 'pod-interior' | 'cover-spread';
}

interface TrimSpec {
  label: string;
  width: number;
  height: number;
  insideMargin: number;
  outsideMargin: number;
  topMargin: number;
  bottomMargin: number;
}

export const TRIM_SPECS: Record<string, TrimSpec> = {
  TRADE_6X9: {
    label: 'Trade Paperback (6" x 9")',
    width: 432,
    height: 648,
    insideMargin: 58,
    outsideMargin: 44,
    topMargin: 52,
    bottomMargin: 54,
  },
  ROYAL_614X921: {
    label: 'Royal Hardcover (6.14" x 9.21")',
    width: 442.08,
    height: 663.12,
    insideMargin: 60,
    outsideMargin: 46,
    topMargin: 54,
    bottomMargin: 56,
  },
  DIGEST_55X85: {
    label: 'Pocket Digest (5.5" x 8.5")',
    width: 396,
    height: 612,
    insideMargin: 52,
    outsideMargin: 40,
    topMargin: 48,
    bottomMargin: 50,
  },
  EXEC_725X105: {
    label: 'Executive Keepsake (7.25" x 10.5")',
    width: 522,
    height: 756,
    insideMargin: 64,
    outsideMargin: 50,
    topMargin: 58,
    bottomMargin: 60,
  },
  LETTER_85X11: {
    label: 'US Letter (8.5" x 11")',
    width: 612,
    height: 792,
    insideMargin: 68,
    outsideMargin: 54,
    topMargin: 62,
    bottomMargin: 64,
  },
  A4: {
    label: 'A4 International (210mm x 297mm)',
    width: 595.28,
    height: 841.89,
    insideMargin: 66,
    outsideMargin: 52,
    topMargin: 62,
    bottomMargin: 64,
  },
};

export interface CoverThemePalette {
  name: string;
  bgRgb: [number, number, number];
  secondaryBgRgb: [number, number, number];
  accentRgb: [number, number, number];
  textRgb: [number, number, number];
  mutedTextRgb: [number, number, number];
  bgHex: string;
  accentHex: string;
  textHex: string;
}

export const COVER_THEME_PALETTES: Record<string, CoverThemePalette> = {
  AMBER: {
    name: 'Warm Amber & Cream',
    bgRgb: [251, 247, 238],
    secondaryBgRgb: [242, 233, 216],
    accentRgb: [180, 118, 42],
    textRgb: [41, 32, 24],
    mutedTextRgb: [115, 96, 76],
    bgHex: '#FBF7EE',
    accentHex: '#B4762A',
    textHex: '#292018',
  },
  NAVY_GOLD: {
    name: 'Heirloom Navy & Gold',
    bgRgb: [20, 34, 56],
    secondaryBgRgb: [30, 48, 76],
    accentRgb: [212, 175, 95],
    textRgb: [248, 245, 238],
    mutedTextRgb: [188, 198, 214],
    bgHex: '#142238',
    accentHex: '#D4AF5F',
    textHex: '#F8F5EE',
  },
  BURGUNDY: {
    name: 'Royal Burgundy',
    bgRgb: [74, 21, 33],
    secondaryBgRgb: [96, 30, 45],
    accentRgb: [218, 184, 120],
    textRgb: [252, 248, 242],
    mutedTextRgb: [214, 192, 196],
    bgHex: '#4A1521',
    accentHex: '#DAB878',
    textHex: '#FCF8F2',
  },
  EMERALD: {
    name: 'Forest Emerald',
    bgRgb: [22, 53, 43],
    secondaryBgRgb: [32, 70, 57],
    accentRgb: [201, 169, 106],
    textRgb: [246, 244, 238],
    mutedTextRgb: [182, 201, 193],
    bgHex: '#16352B',
    accentHex: '#C9A96A',
    textHex: '#F6F4EE',
  },
  SLATE: {
    name: 'Midnight Slate',
    bgRgb: [38, 44, 54],
    secondaryBgRgb: [52, 60, 72],
    accentRgb: [186, 196, 210],
    textRgb: [248, 250, 252],
    mutedTextRgb: [176, 184, 196],
    bgHex: '#262C36',
    accentHex: '#BAC4D2',
    textHex: '#F8FAFC',
  },
  MONOCHROME: {
    name: 'Minimalist Ink',
    bgRgb: [250, 250, 249],
    secondaryBgRgb: [238, 238, 235],
    accentRgb: [35, 35, 35],
    textRgb: [20, 20, 20],
    mutedTextRgb: [105, 105, 105],
    bgHex: '#FAFAF9',
    accentHex: '#232323',
    textHex: '#141414',
  },
};

const ROMAN_NUMERALS = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX'
];

export function toRoman(num: number): string {
  return ROMAN_NUMERALS[num - 1] || String(num);
}

async function loadImageAsDataUrl(url?: string | null): Promise<{ dataUrl: string; width: number; height: number } | null> {
  if (!url || !url.trim()) return null;
  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) return null;
    const blob = await response.blob();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(String(reader.result));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const dims = await new Promise<{ width: number; height: number }>((resolve) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth || 600, height: img.naturalHeight || 400 });
      img.onerror = () => resolve({ width: 600, height: 400 });
      img.src = dataUrl;
    });
    return { dataUrl, ...dims };
  } catch {
    return null;
  }
}

function cleanStoryParagraphs(rawContent: string): string[] {
  if (!rawContent) return [];
  const normalized = rawContent
    .replace(/\r\n/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '');
  return normalized
    .split(/\n\s*\n/)
    .map((p) => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}

export async function generateStoryBookPdf({
  book,
  chapters,
  mode = 'full',
}: GenerateStoryBookPdfOptions): Promise<void> {
  const trimCode = book.bookTrimSizeCd || 'TRADE_6X9';
  const trim = TRIM_SPECS[trimCode] || TRIM_SPECS.TRADE_6X9;
  const themeCode = book.bookCoverThemeCd || 'AMBER';
  const palette = COVER_THEME_PALETTES[themeCode] || COVER_THEME_PALETTES.AMBER;
  const coverLayout = book.bookCoverLayoutCd || 'CLASSIC_FRAME';
  const fontName = (book.bookFontFamilyCd || 'times') as 'times' | 'helvetica' | 'courier';
  const baseFontSize = Number(book.bookFontSizePt) || 11;
  const lineHeight = Math.round(baseFontSize * 1.55 * 10) / 10;

  const bookTitle = (book.bookTitle || 'My Life Stories').trim();
  const bookSubtitle = (book.bookSubtitle || '').trim();
  const authorName = (book.bookAuthorDisplayName || 'StoryBook Member').trim();
  const volumeLabel = (book.bookVolumeLabel || '').trim();
  const copyrightYear = book.bookCopyrightYear || new Date().getFullYear();

  // Preload images concurrently
  const [coverImg, authorImg, ...chapterImgs] = await Promise.all([
    loadImageAsDataUrl(book.bookCoverPhotoUrl),
    loadImageAsDataUrl(book.bookAboutAuthorPhotoUrl),
    ...chapters.map((ch) =>
      book.bookIncludeStoryPhotos !== false && ch.includePhoto && ch.photoUrl
        ? loadImageAsDataUrl(ch.photoUrl)
        : Promise.resolve(null)
    ),
  ]);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [trim.width, trim.height],
  });

  const pageWidth = trim.width;
  const pageHeight = trim.height;

  // Helper to get mirrored margins for a given 1-based interior page number
  // Odd pages (1, 3, 5...) are right-hand (recto): left margin is inside (gutter), right margin is outside
  // Even pages (2, 4, 6...) are left-hand (verso): left margin is outside, right margin is inside (gutter)
  const getMarginsForPage = (interiorPageNum: number) => {
    const isRecto = interiorPageNum % 2 === 1;
    const left = isRecto ? trim.insideMargin : trim.outsideMargin;
    const right = isRecto ? trim.outsideMargin : trim.insideMargin;
    return {
      left,
      right,
      top: trim.topMargin,
      bottom: trim.bottomMargin,
      contentWidth: pageWidth - left - right,
      centerX: left + (pageWidth - left - right) / 2,
    };
  };

  let currentInteriorPage = 0;
  let tocPageStart = 0;
  let tocPageCount = 0;

  interface TocEntry {
    type: 'part' | 'chapter' | 'matter';
    label: string;
    sublabel?: string;
    pageNumber: number;
  }
  const tocEntries: TocEntry[] = [];

  const addInteriorPage = () => {
    if (currentInteriorPage > 0 || mode === 'full') {
      doc.addPage([pageWidth, pageHeight], 'portrait');
    }
    currentInteriorPage += 1;
    // subtle warm cream background for full mode, pure white for POD interior
    if (mode === 'full') {
      doc.setFillColor(253, 252, 249);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }
    return getMarginsForPage(currentInteriorPage);
  };

  const drawRunningHeaderAndFolio = (
    interiorPageNum: number,
    sectionTitle: string,
    suppressHeader: boolean = false
  ) => {
    const m = getMarginsForPage(interiorPageNum);
    const isRecto = interiorPageNum % 2 === 1;

    if (!suppressHeader) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(130, 122, 112);
      const headerText = isRecto ? sectionTitle : bookTitle;
      const truncated = headerText.length > 52 ? headerText.slice(0, 49) + '...' : headerText;
      doc.text(truncated, m.centerX, m.top - 18, { align: 'center' });

      doc.setDrawColor(225, 219, 210);
      doc.setLineWidth(0.4);
      doc.line(m.left, m.top - 11, pageWidth - m.right, m.top - 11);
    }

    // Bottom page folio
    doc.setFont(fontName, 'normal');
    doc.setFontSize(9);
    doc.setTextColor(115, 108, 98);
    doc.text(`${interiorPageNum}`, m.centerX, pageHeight - m.bottom + 24, { align: 'center' });
  };

  // =========================================================================
  // 1. FRONT COVER (when mode === 'full')
  // =========================================================================
  if (mode === 'full') {
    doc.setFillColor(...palette.bgRgb);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    if (coverLayout === 'HERO_BLEED' && coverImg) {
      // Draw cover photo filling top 62% of cover
      const heroH = pageHeight * 0.58;
      doc.addImage(coverImg.dataUrl, 'JPEG', 0, 0, pageWidth, heroH, undefined, 'FAST');
      // Bottom band
      doc.setFillColor(...palette.bgRgb);
      doc.rect(0, heroH, pageWidth, pageHeight - heroH, 'F');
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(2);
      doc.line(0, heroH, pageWidth, heroH);

      let y = heroH + 42;
      if (volumeLabel) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...palette.accentRgb);
        doc.text(volumeLabel.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 24;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...palette.textRgb);
      const titleLines = doc.splitTextToSize(bookTitle, pageWidth - 80);
      doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
      y += titleLines.length * 28 + 8;

      if (bookSubtitle) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(12);
        doc.setTextColor(...palette.mutedTextRgb);
        const subLines = doc.splitTextToSize(bookSubtitle, pageWidth - 96);
        doc.text(subLines, pageWidth / 2, y, { align: 'center' });
      }

      doc.setFont(fontName, 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...palette.textRgb);
      doc.text(authorName.toUpperCase(), pageWidth / 2, pageHeight - 44, { align: 'center' });
    } else if (coverLayout === 'PORTRAIT_MEDALLION') {
      // Outer frame
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(1.2);
      doc.rect(28, 28, pageWidth - 56, pageHeight - 56);

      let y = 78;
      if (volumeLabel) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...palette.accentRgb);
        doc.text(volumeLabel.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 24;
      }

      doc.setFont(fontName, 'bold');
      doc.setFontSize(24);
      doc.setTextColor(...palette.textRgb);
      const titleLines = doc.splitTextToSize(bookTitle, pageWidth - 100);
      doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
      y += titleLines.length * 28 + 8;

      if (bookSubtitle) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(12);
        doc.setTextColor(...palette.mutedTextRgb);
        const subLines = doc.splitTextToSize(bookSubtitle, pageWidth - 110);
        doc.text(subLines, pageWidth / 2, y, { align: 'center' });
        y += subLines.length * 16 + 16;
      }

      // Centered framed portrait
      const boxW = Math.min(200, pageWidth - 140);
      const boxH = boxW * 1.15;
      const boxX = (pageWidth - boxW) / 2;
      const boxY = Math.max(y + 12, pageHeight * 0.40);
      doc.setFillColor(...palette.secondaryBgRgb);
      doc.rect(boxX - 5, boxY - 5, boxW + 10, boxH + 10, 'F');
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(1.5);
      doc.rect(boxX - 5, boxY - 5, boxW + 10, boxH + 10, 'S');
      if (coverImg) {
        doc.addImage(coverImg.dataUrl, 'JPEG', boxX, boxY, boxW, boxH, undefined, 'FAST');
      } else {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(10);
        doc.setTextColor(...palette.mutedTextRgb);
        doc.text('Family Heirloom Edition', pageWidth / 2, boxY + boxH / 2, { align: 'center' });
      }

      doc.setFont(fontName, 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...palette.textRgb);
      doc.text(authorName, pageWidth / 2, pageHeight - 56, { align: 'center' });
    } else if (coverLayout === 'MINIMAL_LINEN') {
      // Left spine accent bar
      doc.setFillColor(...palette.accentRgb);
      doc.rect(0, 0, 18, pageHeight, 'F');

      let y = pageHeight * 0.28;
      if (volumeLabel) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9);
        doc.setTextColor(...palette.accentRgb);
        doc.text(volumeLabel.toUpperCase(), 58, y);
        y += 22;
      }
      doc.setFont(fontName, 'bold');
      doc.setFontSize(28);
      doc.setTextColor(...palette.textRgb);
      const titleLines = doc.splitTextToSize(bookTitle, pageWidth - 100);
      doc.text(titleLines, 58, y);
      y += titleLines.length * 32 + 10;

      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(1.5);
      doc.line(58, y, 138, y);
      y += 24;

      if (bookSubtitle) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(13);
        doc.setTextColor(...palette.mutedTextRgb);
        const subLines = doc.splitTextToSize(bookSubtitle, pageWidth - 110);
        doc.text(subLines, 58, y);
      }

      doc.setFont(fontName, 'normal');
      doc.setFontSize(12);
      doc.setTextColor(...palette.textRgb);
      doc.text(authorName, 58, pageHeight - 64);
    } else {
      // CLASSIC_FRAME (default)
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(1.8);
      doc.rect(26, 26, pageWidth - 52, pageHeight - 52);
      doc.setLineWidth(0.6);
      doc.rect(32, 32, pageWidth - 64, pageHeight - 64);

      let y = pageHeight * 0.24;
      if (volumeLabel) {
        doc.setFont(fontName, 'bold');
        doc.setFontSize(9.5);
        doc.setTextColor(...palette.accentRgb);
        doc.text(volumeLabel.toUpperCase(), pageWidth / 2, y, { align: 'center' });
        y += 28;
      }

      doc.setFont(fontName, 'bold');
      doc.setFontSize(26);
      doc.setTextColor(...palette.textRgb);
      const titleLines = doc.splitTextToSize(bookTitle, pageWidth - 110);
      doc.text(titleLines, pageWidth / 2, y, { align: 'center' });
      y += titleLines.length * 31 + 12;

      // Ornamental divider
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(0.9);
      doc.line(pageWidth / 2 - 48, y, pageWidth / 2 + 48, y);
      y += 24;

      if (bookSubtitle) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(13);
        doc.setTextColor(...palette.mutedTextRgb);
        const subLines = doc.splitTextToSize(bookSubtitle, pageWidth - 120);
        doc.text(subLines, pageWidth / 2, y, { align: 'center' });
        y += subLines.length * 18 + 20;
      }

      if (coverImg) {
        const imgW = Math.min(180, pageWidth - 140);
        const imgH = imgW * 0.75;
        const imgX = (pageWidth - imgW) / 2;
        const imgY = Math.max(y + 10, pageHeight * 0.48);
        doc.setDrawColor(...palette.accentRgb);
        doc.setLineWidth(1);
        doc.rect(imgX - 3, imgY - 3, imgW + 6, imgH + 6);
        doc.addImage(coverImg.dataUrl, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');
      }

      doc.setFont(fontName, 'bold');
      doc.setFontSize(13);
      doc.setTextColor(...palette.textRgb);
      doc.text(authorName, pageWidth / 2, pageHeight - 68, { align: 'center' });
    }
  }

  // =========================================================================
  // 2. HALF-TITLE & FULL TITLE PAGE
  // =========================================================================
  {
    const m = addInteriorPage();
    doc.setFont(fontName, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(35, 30, 26);
    const halfLines = doc.splitTextToSize(bookTitle, m.contentWidth - 40);
    doc.text(halfLines, m.centerX, pageHeight * 0.38, { align: 'center' });
  }

  // Full Title Page
  {
    const m = addInteriorPage();
    let y = pageHeight * 0.24;
    if (volumeLabel) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(140, 110, 75);
      doc.text(volumeLabel.toUpperCase(), m.centerX, y, { align: 'center' });
      y += 26;
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(25, 22, 18);
    const titleLines = doc.splitTextToSize(bookTitle, m.contentWidth - 20);
    doc.text(titleLines, m.centerX, y, { align: 'center' });
    y += titleLines.length * 29 + 12;

    if (bookSubtitle) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(13);
      doc.setTextColor(95, 88, 78);
      const subLines = doc.splitTextToSize(bookSubtitle, m.contentWidth - 36);
      doc.text(subLines, m.centerX, y, { align: 'center' });
      y += subLines.length * 18 + 18;
    }

    doc.setDrawColor(180, 155, 120);
    doc.setLineWidth(0.75);
    doc.line(m.centerX - 36, y, m.centerX + 36, y);

    doc.setFont(fontName, 'normal');
    doc.setFontSize(13);
    doc.setTextColor(40, 35, 30);
    doc.text(authorName, m.centerX, pageHeight * 0.68, { align: 'center' });

    doc.setFont(fontName, 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(130, 122, 112);
    doc.text('StoryBook Heirloom Press', m.centerX, pageHeight - m.bottom - 12, { align: 'center' });
  }

  // =========================================================================
  // 3. COPYRIGHT PAGE (Optional)
  // =========================================================================
  if (book.bookIncludeCopyrightPage !== false) {
    const m = addInteriorPage();
    let y = pageHeight - m.bottom - 140;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(60, 54, 48);
    doc.text(bookTitle, m.left, y);
    y += 14;

    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 92, 82);
    doc.text(`Copyright © ${copyrightYear} by ${authorName}. All rights reserved.`, m.left, y);
    y += 14;
    const rightsLines = doc.splitTextToSize(
      'Published as a private heirloom edition through StoryBook. No part of this book may be reproduced without written permission from the author or family estate.',
      m.contentWidth
    );
    doc.text(rightsLines, m.left, y);
    y += rightsLines.length * 12 + 8;

    if (book.bookIsbn && book.bookIsbn.trim()) {
      doc.text(`Edition / ISBN: ${book.bookIsbn.trim()}`, m.left, y);
      y += 12;
    }
    doc.text(`Trim Format: ${trim.label}`, m.left, y);
  }

  // =========================================================================
  // 4. DEDICATION PAGE (Optional)
  // =========================================================================
  if (book.bookDedicationText && book.bookDedicationText.trim()) {
    const m = addInteriorPage();
    tocEntries.push({
      type: 'matter',
      label: 'Dedication',
      pageNumber: currentInteriorPage,
    });
    let y = pageHeight * 0.34;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(140, 115, 82);
    doc.text('DEDICATION', m.centerX, y, { align: 'center' });
    y += 24;

    doc.setFont(fontName, 'italic');
    doc.setFontSize(baseFontSize + 0.5);
    doc.setTextColor(45, 40, 34);
    const dedLines = doc.splitTextToSize(book.bookDedicationText.trim(), m.contentWidth - 60);
    doc.text(dedLines, m.centerX, y, { align: 'center' });
    drawRunningHeaderAndFolio(currentInteriorPage, 'Dedication', true);
  }

  // =========================================================================
  // 5. FOREWORD / PREFACE (Optional)
  // =========================================================================
  if (book.bookForewordText && book.bookForewordText.trim()) {
    let m = addInteriorPage();
    const fwTitle = (book.bookForewordTitle || 'Foreword').trim();
    tocEntries.push({
      type: 'matter',
      label: fwTitle,
      pageNumber: currentInteriorPage,
    });

    let y = m.top + 32;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(30, 26, 22);
    doc.text(fwTitle, m.centerX, y, { align: 'center' });
    y += 16;

    doc.setDrawColor(185, 165, 135);
    doc.setLineWidth(0.6);
    doc.line(m.centerX - 30, y, m.centerX + 30, y);
    y += 28;

    const paragraphs = cleanStoryParagraphs(book.bookForewordText);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(baseFontSize);
    doc.setTextColor(38, 34, 30);

    let firstFwPage = true;
    for (const para of paragraphs) {
      const lines: string[] = doc.splitTextToSize(para, m.contentWidth);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - m.bottom) {
          drawRunningHeaderAndFolio(currentInteriorPage, fwTitle, firstFwPage);
          firstFwPage = false;
          m = addInteriorPage();
          y = m.top + 10;
          doc.setFont(fontName, 'normal');
          doc.setFontSize(baseFontSize);
          doc.setTextColor(38, 34, 30);
        }
        doc.text(line, m.left, y);
        y += lineHeight;
      }
      y += lineHeight * 0.45;
    }

    if (book.bookForewordAuthor && book.bookForewordAuthor.trim()) {
      y += 12;
      doc.setFont(fontName, 'italic');
      doc.setFontSize(baseFontSize);
      doc.setTextColor(85, 78, 68);
      doc.text(`— ${book.bookForewordAuthor.trim()}`, pageWidth - m.right, y, { align: 'right' });
    }
    drawRunningHeaderAndFolio(currentInteriorPage, fwTitle, firstFwPage);
  }

  // =========================================================================
  // 6. RESERVE TABLE OF CONTENTS PAGES (Filled in after chapters are placed)
  // =========================================================================
  if (book.bookIncludeToc !== false && chapters.length > 0) {
    // Estimate how many TOC pages we need (roughly 18 entries per page)
    const distinctParts = new Set(chapters.map((c) => c.partTitle)).size;
    const totalEstimatedTocRows = chapters.length + distinctParts + 4;
    tocPageCount = Math.max(1, Math.ceil(totalEstimatedTocRows / 18));
    tocPageStart = currentInteriorPage + 1;
    for (let i = 0; i < tocPageCount; i++) {
      addInteriorPage();
    }
  }

  // =========================================================================
  // 7. GROUP CHAPTERS BY TOPIC CATEGORY & RENDER PARTS + CHAPTERS
  // =========================================================================
  const sortedChapters = [...chapters].sort((a, b) => {
    if (a.partSortOrder !== b.partSortOrder) return a.partSortOrder - b.partSortOrder;
    return a.chapterSortOrder - b.chapterSortOrder;
  });

  let currentPartTitle: string | null = null;
  let partCounter = 0;
  let chapterCounter = 0;

  for (let idx = 0; idx < sortedChapters.length; idx++) {
    const ch = sortedChapters[idx];
    const chImg = chapterImgs[idx];

    // Render Topic Category Part Divider Page when part changes
    if (book.bookIncludePartDividers !== false && ch.partTitle !== currentPartTitle) {
      currentPartTitle = ch.partTitle;
      partCounter += 1;
      const partRoman = toRoman(partCounter);
      const partChaptersCount = sortedChapters.filter((c) => c.partTitle === currentPartTitle).length;

      const m = addInteriorPage();
      tocEntries.push({
        type: 'part',
        label: `Part ${partRoman}: ${currentPartTitle}`,
        pageNumber: currentInteriorPage,
      });

      let y = pageHeight * 0.34;
      doc.setFont(fontName, 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(150, 120, 82);
      doc.text(`PART ${partRoman}`, m.centerX, y, { align: 'center' });
      y += 28;

      doc.setFont(fontName, 'bold');
      doc.setFontSize(22);
      doc.setTextColor(28, 24, 20);
      const partLines = doc.splitTextToSize(currentPartTitle || 'Stories', m.contentWidth - 30);
      doc.text(partLines, m.centerX, y, { align: 'center' });
      y += partLines.length * 26 + 10;

      doc.setDrawColor(180, 158, 125);
      doc.setLineWidth(0.8);
      doc.line(m.centerX - 42, y, m.centerX + 42, y);
      y += 20;

      doc.setFont(fontName, 'italic');
      doc.setFontSize(10);
      doc.setTextColor(115, 106, 95);
      doc.text(
        `${partChaptersCount} ${partChaptersCount === 1 ? 'Chapter' : 'Chapters'}`,
        m.centerX,
        y,
        { align: 'center' }
      );
      drawRunningHeaderAndFolio(currentInteriorPage, currentPartTitle || bookTitle, true);
    }

    // Render Story Chapter
    chapterCounter += 1;
    let m = addInteriorPage();
    tocEntries.push({
      type: 'chapter',
      label: `Chapter ${chapterCounter}: ${ch.title}`,
      sublabel: ch.subtitle || undefined,
      pageNumber: currentInteriorPage,
    });

    let y = m.top + 22;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(145, 118, 82);
    doc.text(`CHAPTER ${toRoman(chapterCounter)}`, m.centerX, y, { align: 'center' });
    y += 22;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(25, 22, 18);
    const chTitleLines = doc.splitTextToSize(ch.title, m.contentWidth - 20);
    doc.text(chTitleLines, m.centerX, y, { align: 'center' });
    y += chTitleLines.length * 22 + 6;

    if (ch.subtitle && ch.subtitle.trim()) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(10.5);
      doc.setTextColor(110, 102, 92);
      doc.text(ch.subtitle.trim(), m.centerX, y, { align: 'center' });
      y += 16;
    }

    doc.setDrawColor(195, 178, 152);
    doc.setLineWidth(0.5);
    doc.line(m.centerX - 28, y, m.centerX + 28, y);
    y += 20;

    // Optional Chapter Header Photo
    if (chImg) {
      const maxImgW = m.contentWidth - 24;
      const maxImgH = 155;
      const ratio = Math.min(maxImgW / chImg.width, maxImgH / chImg.height);
      const drawW = chImg.width * ratio;
      const drawH = chImg.height * ratio;
      const imgX = m.centerX - drawW / 2;

      doc.setDrawColor(210, 202, 190);
      doc.setLineWidth(0.5);
      doc.rect(imgX - 2, y - 2, drawW + 4, drawH + 4);
      doc.addImage(chImg.dataUrl, 'JPEG', imgX, y, drawW, drawH, undefined, 'FAST');
      y += drawH + 12;

      if (ch.photoCaption && ch.photoCaption.trim()) {
        doc.setFont(fontName, 'italic');
        doc.setFontSize(8.5);
        doc.setTextColor(115, 106, 96);
        const capLines = doc.splitTextToSize(ch.photoCaption.trim(), m.contentWidth - 40);
        doc.text(capLines, m.centerX, y, { align: 'center' });
        y += capLines.length * 11 + 10;
      } else {
        y += 8;
      }
    }

    // Render Story Body Paragraphs
    const paragraphs = cleanStoryParagraphs(ch.content);
    let isFirstChapterPage = true;

    for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
      const para = paragraphs[pIdx].trim();
      if (!para) continue;

      if (pIdx === 0 && book.bookIncludeDropCaps !== false && para.length > 1) {
        const firstChar = para.charAt(0).toUpperCase();
        const restOfPara = para.slice(1);

        if (y + lineHeight * 3 > pageHeight - m.bottom) {
          drawRunningHeaderAndFolio(currentInteriorPage, ch.title, isFirstChapterPage);
          isFirstChapterPage = false;
          m = addInteriorPage();
          y = m.top + 10;
        }

        const dropCapSize = baseFontSize * 3.1;
        doc.setFont(fontName, 'bold');
        doc.setFontSize(dropCapSize);
        doc.setTextColor(140, 105, 65);
        const dropCapWidth = doc.getTextWidth(firstChar) + 6;
        doc.text(firstChar, m.left, y + lineHeight * 1.65);

        doc.setFont(fontName, 'normal');
        doc.setFontSize(baseFontSize);
        doc.setTextColor(32, 29, 25);

        const indentedWidth = m.contentWidth - dropCapWidth;
        const allIndentedLines: string[] = doc.splitTextToSize(restOfPara, indentedWidth);
        const dropLinesCount = Math.min(3, allIndentedLines.length);

        for (let i = 0; i < dropLinesCount; i++) {
          doc.text(allIndentedLines[i], m.left + dropCapWidth, y);
          y += lineHeight;
        }

        const consumedText = allIndentedLines.slice(0, dropLinesCount).join(' ');
        const remainingText = restOfPara.slice(consumedText.length).trim();

        if (dropLinesCount < 3) {
          y += (3 - dropLinesCount) * lineHeight;
        }

        if (remainingText.length > 0) {
          const fullWidthLines: string[] = doc.splitTextToSize(remainingText, m.contentWidth);
          for (const line of fullWidthLines) {
            if (y + lineHeight > pageHeight - m.bottom) {
              drawRunningHeaderAndFolio(currentInteriorPage, ch.title, isFirstChapterPage);
              isFirstChapterPage = false;
              m = addInteriorPage();
              y = m.top + 10;
              doc.setFont(fontName, 'normal');
              doc.setFontSize(baseFontSize);
              doc.setTextColor(32, 29, 25);
            }
            doc.text(line, m.left, y);
            y += lineHeight;
          }
        }
        y += lineHeight * 0.42;
      } else {
        doc.setFont(fontName, 'normal');
        doc.setFontSize(baseFontSize);
        doc.setTextColor(32, 29, 25);

        const lines: string[] = doc.splitTextToSize(para, m.contentWidth);
        for (const line of lines) {
          if (y + lineHeight > pageHeight - m.bottom) {
            drawRunningHeaderAndFolio(currentInteriorPage, ch.title, isFirstChapterPage);
            isFirstChapterPage = false;
            m = addInteriorPage();
            y = m.top + 10;
            doc.setFont(fontName, 'normal');
            doc.setFontSize(baseFontSize);
            doc.setTextColor(32, 29, 25);
          }
          doc.text(line, m.left, y);
          y += lineHeight;
        }
        y += lineHeight * 0.42;
      }
    }

    // End of chapter ornamentalflourish
    if (y + 24 <= pageHeight - m.bottom) {
      y += 8;
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(175, 155, 128);
      doc.text('*   *   *', m.centerX, y, { align: 'center' });
    }

    drawRunningHeaderAndFolio(currentInteriorPage, ch.title, isFirstChapterPage);
  }

  // =========================================================================
  // 8. BACK MATTER: AFTERWORD, ACKNOWLEDGMENTS, ABOUT THE AUTHOR, COLOPHON
  // =========================================================================
  const renderBackMatterSection = (
    heading: string,
    bodyText: string,
    portrait?: { dataUrl: string; width: number; height: number } | null
  ) => {
    let m = addInteriorPage();
    tocEntries.push({
      type: 'matter',
      label: heading,
      pageNumber: currentInteriorPage,
    });

    let y = m.top + 28;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(28, 24, 20);
    doc.text(heading, m.centerX, y, { align: 'center' });
    y += 16;

    doc.setDrawColor(185, 165, 135);
    doc.setLineWidth(0.6);
    doc.line(m.centerX - 30, y, m.centerX + 30, y);
    y += 24;

    if (portrait) {
      const pSize = 96;
      const pX = m.centerX - pSize / 2;
      doc.setDrawColor(195, 178, 152);
      doc.setLineWidth(0.8);
      doc.rect(pX - 3, y - 3, pSize + 6, pSize + 6);
      doc.addImage(portrait.dataUrl, 'JPEG', pX, y, pSize, pSize, undefined, 'FAST');
      y += pSize + 22;
    }

    const paragraphs = cleanStoryParagraphs(bodyText);
    doc.setFont(fontName, 'normal');
    doc.setFontSize(baseFontSize);
    doc.setTextColor(35, 31, 27);

    let firstSecPage = true;
    for (const para of paragraphs) {
      const lines: string[] = doc.splitTextToSize(para, m.contentWidth);
      for (const line of lines) {
        if (y + lineHeight > pageHeight - m.bottom) {
          drawRunningHeaderAndFolio(currentInteriorPage, heading, firstSecPage);
          firstSecPage = false;
          m = addInteriorPage();
          y = m.top + 10;
          doc.setFont(fontName, 'normal');
          doc.setFontSize(baseFontSize);
          doc.setTextColor(35, 31, 27);
        }
        doc.text(line, m.left, y);
        y += lineHeight;
      }
      y += lineHeight * 0.45;
    }
    drawRunningHeaderAndFolio(currentInteriorPage, heading, firstSecPage);
  };

  if (book.bookAfterwordText && book.bookAfterwordText.trim()) {
    renderBackMatterSection((book.bookAfterwordTitle || 'Afterword').trim(), book.bookAfterwordText);
  }

  if (book.bookAcknowledgmentsText && book.bookAcknowledgmentsText.trim()) {
    renderBackMatterSection('Acknowledgments', book.bookAcknowledgmentsText);
  }

  if (book.bookAboutAuthorText && book.bookAboutAuthorText.trim()) {
    renderBackMatterSection('About the Author', book.bookAboutAuthorText, authorImg);
  }

  if (book.bookIncludeColophon !== false) {
    const m = addInteriorPage();
    let y = pageHeight * 0.36;
    doc.setDrawColor(185, 165, 135);
    doc.setLineWidth(0.6);
    doc.line(m.centerX - 36, y, m.centerX + 36, y);
    y += 22;

    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(125, 108, 86);
    doc.text('COLOPHON', m.centerX, y, { align: 'center' });
    y += 20;

    doc.setFont(fontName, 'italic');
    doc.setFontSize(9.5);
    doc.setTextColor(95, 86, 76);
    const colophonLines = doc.splitTextToSize(
      `This heirloom volume of "${bookTitle}" by ${authorName} was compiled and typeset using the StoryBook Generator in ${trim.label} format (${baseFontSize}pt ${fontName}). Preserved for future generations on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })}.`,
      m.contentWidth - 50
    );
    doc.text(colophonLines, m.centerX, y, { align: 'center' });
  }

  // =========================================================================
  // 9. POPULATE RESERVED TABLE OF CONTENTS PAGES
  // =========================================================================
  if (book.bookIncludeToc !== false && tocPageStart > 0 && tocEntries.length > 0) {
    // Physical page index in jsPDF (1-based)
    // When mode === 'full', page 1 is Front Cover, so interior page P is physical page P + 1
    const pageOffset = mode === 'full' ? 1 : 0;
    let currentTocSlot = 0;
    let tocPageInteriorNum = tocPageStart;
    doc.setPage(tocPageInteriorNum + pageOffset);
    let m = getMarginsForPage(tocPageInteriorNum);

    let y = m.top + 26;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(18);
    doc.setTextColor(28, 24, 20);
    doc.text('Table of Contents', m.centerX, y, { align: 'center' });
    y += 14;

    doc.setDrawColor(185, 165, 135);
    doc.setLineWidth(0.6);
    doc.line(m.centerX - 36, y, m.centerX + 36, y);
    y += 26;

    for (const entry of tocEntries) {
      if (y + 22 > pageHeight - m.bottom && currentTocSlot + 1 < tocPageCount) {
        drawRunningHeaderAndFolio(tocPageInteriorNum, 'Table of Contents', currentTocSlot === 0);
        currentTocSlot += 1;
        tocPageInteriorNum = tocPageStart + currentTocSlot;
        doc.setPage(tocPageInteriorNum + pageOffset);
        m = getMarginsForPage(tocPageInteriorNum);
        y = m.top + 16;
      }

      if (entry.type === 'part') {
        y += 6;
        doc.setFont(fontName, 'bold');
        doc.setFontSize(10.5);
        doc.setTextColor(135, 105, 68);
        doc.text(entry.label.toUpperCase(), m.left, y);
        doc.text(`${entry.pageNumber}`, pageWidth - m.right, y, { align: 'right' });
        y += 18;
      } else {
        const isMatter = entry.type === 'matter';
        doc.setFont(fontName, isMatter ? 'italic' : 'normal');
        doc.setFontSize(10);
        doc.setTextColor(40, 35, 30);

        const indent = isMatter ? 0 : 12;
        const maxLabelW = m.contentWidth - indent - 45;
        const displayLabel =
          entry.label.length > 58 ? entry.label.slice(0, 55) + '...' : entry.label;
        const clipped = doc.splitTextToSize(displayLabel, maxLabelW)[0] || displayLabel;

        doc.text(clipped, m.left + indent, y);
        const labelW = doc.getTextWidth(clipped);
        const pageStr = `${entry.pageNumber}`;
        const pageW = doc.getTextWidth(pageStr);

        // Dotted leader
        const dotsStart = m.left + indent + labelW + 6;
        const dotsEnd = pageWidth - m.right - pageW - 6;
        if (dotsEnd > dotsStart + 10) {
          doc.setTextColor(175, 165, 152);
          let dotX = dotsStart;
          while (dotX < dotsEnd) {
            doc.text('.', dotX, y);
            dotX += 5;
          }
        }

        doc.setTextColor(40, 35, 30);
        doc.text(pageStr, pageWidth - m.right, y, { align: 'right' });
        y += 16;
      }
    }

    drawRunningHeaderAndFolio(tocPageInteriorNum, 'Table of Contents', currentTocSlot === 0);
  }

  // =========================================================================
  // 10. BACK COVER (when mode === 'full')
  // =========================================================================
  if (mode === 'full') {
    doc.addPage([pageWidth, pageHeight], 'portrait');
    doc.setFillColor(...palette.bgRgb);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(1.2);
    doc.rect(28, 28, pageWidth - 56, pageHeight - 56);

    let y = pageHeight * 0.22;
    doc.setFont(fontName, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...palette.accentRgb);
    doc.text(bookTitle, pageWidth / 2, y, { align: 'center' });
    y += 24;

    const blurb =
      (book.bookBackCoverBlurb || '').trim() ||
      (book.bookAboutAuthorText || '').trim() ||
      `A curated collection of personal memoirs, family history, and life reflections authored by ${authorName}.`;

    doc.setFont(fontName, 'italic');
    doc.setFontSize(11);
    doc.setTextColor(...palette.textRgb);
    const blurbLines = doc.splitTextToSize(blurb, pageWidth - 116);
    doc.text(blurbLines, pageWidth / 2, y, { align: 'center' });

    // Bottom ISBN / Heirloom Seal
    doc.setFont(fontName, 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...palette.mutedTextRgb);
    if (book.bookIsbn && book.bookIsbn.trim()) {
      doc.text(`ISBN / Edition: ${book.bookIsbn.trim()}`, pageWidth / 2, pageHeight - 62, {
        align: 'center',
      });
    }
    doc.text(
      `StoryBook Heirloom Edition • ${chapters.length} ${
        chapters.length === 1 ? 'Chapter' : 'Chapters'
      }`,
      pageWidth / 2,
      pageHeight - 46,
      { align: 'center' }
    );
  }

  // =========================================================================
  // 11. POD INTERIOR EVEN-PAGE PADDING FOR LULU MANUFACTURING
  // Lulu strictly requires physical interior blocks to have an even page count (divisible by 2)
  // =========================================================================
  if (mode === 'pod-interior' && currentInteriorPage % 2 !== 0) {
    addInteriorPage();
    // Intentionally unnumbered blank verso leaf ensures clean physical sheet alignment
  }

  const safeSlug = bookTitle
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  const suffix = mode === 'pod-interior' ? 'pod_interior' : 'complete_book';
  doc.save(`${safeSlug || 'storybook'}_${suffix}.pdf`);
}

export interface GenerateStoryBookCoverSpreadOptions {
  book: Partial<MbrStoryBook>;
  pageCount: number;
  bindingType?: 'HARDCOVER' | 'PAPERBACK';
}

export async function generateStoryBookCoverSpread({
  book,
  pageCount,
  bindingType = 'HARDCOVER',
}: GenerateStoryBookCoverSpreadOptions): Promise<void> {
  const trimCode = book.bookTrimSizeCd || 'TRADE_6X9';
  const trim = TRIM_SPECS[trimCode] || TRIM_SPECS.TRADE_6X9;
  const themeCode = book.bookCoverThemeCd || 'AMBER';
  const palette = COVER_THEME_PALETTES[themeCode] || COVER_THEME_PALETTES.AMBER;
  const fontName = (book.bookFontFamilyCd || 'times') as 'times' | 'helvetica' | 'courier';
  const coverLayout = book.bookCoverLayoutCd || 'CLASSIC_FRAME';

  const bookTitle = (book.bookTitle || 'My Life Stories').trim();
  const bookSubtitle = (book.bookSubtitle || '').trim();
  const authorName = (book.bookAuthorDisplayName || 'StoryBook Member').trim();
  const volumeLabel = (book.bookVolumeLabel || '').trim();
  const spineTitle = (book.bookSpineTitle || bookTitle).trim();

  // Load cover image if present
  const coverImg = await loadImageAsDataUrl(book.bookCoverPhotoUrl);

  // Lulu standard: Hardcovers require 0.625" (45pt) wrap margin around boards; paperbacks require 0.125" (9pt) bleed
  const isHardcover = bindingType === 'HARDCOVER';
  const bleed = isHardcover ? 45 : 9;

  // Even page count enforcement for spine calculation
  const effectivePages = pageCount % 2 !== 0 ? pageCount + 1 : Math.max(pageCount, 4);

  // Spine calculation: page count * 0.002252 in * 72 pt/in (+ board gap for casebound)
  const baseSpine = effectivePages * 0.002252 * 72;
  const calculatedSpine = Math.round((baseSpine + (isHardcover ? 14 : 0)) * 10) / 10;
  const spineWidth = Math.max(isHardcover ? 24 : 16, calculatedSpine);

  const spreadWidth = trim.width * 2 + spineWidth + bleed * 2;
  const spreadHeight = trim.height + bleed * 2;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: [spreadWidth, spreadHeight],
  });

  // Background across whole spread
  doc.setFillColor(...palette.bgRgb);
  doc.rect(0, 0, spreadWidth, spreadHeight, 'F');

  const backCoverLeft = bleed;
  const spineLeft = bleed + trim.width;
  const frontCoverLeft = bleed + trim.width + spineWidth;

  // =========================================================================
  // 1. BACK COVER (Left Panel)
  // =========================================================================
  const backCenterX = backCoverLeft + trim.width / 2;

  // Back cover ornamental borders
  doc.setDrawColor(...palette.accentRgb);
  doc.setLineWidth(1.4);
  doc.rect(backCoverLeft + 26, bleed + 26, trim.width - 52, trim.height - 52);
  doc.setLineWidth(0.6);
  doc.rect(backCoverLeft + 32, bleed + 32, trim.width - 64, trim.height - 64);

  let backY = bleed + trim.height * 0.22;
  doc.setFont(fontName, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(...palette.accentRgb);
  doc.text(bookTitle, backCenterX, backY, { align: 'center' });
  backY += 24;

  const blurb =
    (book.bookBackCoverBlurb || '').trim() ||
    (book.bookAboutAuthorText || '').trim() ||
    `A curated collection of personal memoirs, family history, and life reflections authored by ${authorName}.`;

  doc.setFont(fontName, 'italic');
  doc.setFontSize(10.5);
  doc.setTextColor(...palette.textRgb);
  const blurbLines = doc.splitTextToSize(blurb, trim.width - 100);
  doc.text(blurbLines, backCenterX, backY, { align: 'center' });

  // Bottom ISBN / Edition Seal
  doc.setFont(fontName, 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...palette.mutedTextRgb);
  if (book.bookIsbn && book.bookIsbn.trim()) {
    doc.text(`ISBN / Edition: ${book.bookIsbn.trim()}`, backCenterX, spreadHeight - bleed - 42, {
      align: 'center',
    });
  }
  doc.text(
    `Heirloom Print Edition • ${effectivePages} Pages`,
    backCenterX,
    spreadHeight - bleed - 26,
    { align: 'center' }
  );

  // =========================================================================
  // 2. SPINE (Center Panel)
  // =========================================================================
  doc.setDrawColor(...palette.accentRgb);
  doc.setLineWidth(0.5);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(spineLeft, 0, spineLeft, spreadHeight);
  doc.line(spineLeft + spineWidth, 0, spineLeft + spineWidth, spreadHeight);
  doc.setLineDashPattern([], 0);

  // Vertical spine title and author
  if (spineWidth >= 16) {
    doc.setFont(fontName, 'bold');
    doc.setFontSize(spineWidth > 26 ? 9 : 7.5);
    doc.setTextColor(...palette.textRgb);
    const spineText = `${spineTitle}   —   ${authorName}`;
    const spineCenterX = spineLeft + spineWidth / 2;
    const spineCenterY = spreadHeight / 2;
    doc.text(spineText, spineCenterX + (spineWidth > 26 ? 3 : 2), spineCenterY, {
      align: 'center',
      angle: 270,
    });
  }

  // =========================================================================
  // 3. FRONT COVER (Right Panel) - Faithfully renders bookCoverLayoutCd & photo!
  // =========================================================================
  const frontCenterX = frontCoverLeft + trim.width / 2;
  const frontPageWidth = trim.width;
  const frontPageHeight = trim.height;

  if (coverLayout === 'HERO_BLEED' && coverImg) {
    // Cover photo filling top 58% of front cover panel
    const heroH = frontPageHeight * 0.58;
    doc.addImage(
      coverImg.dataUrl,
      'JPEG',
      frontCoverLeft,
      bleed,
      frontPageWidth,
      heroH,
      undefined,
      'FAST'
    );
    // Divider band
    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(2);
    doc.line(frontCoverLeft, bleed + heroH, frontCoverLeft + frontPageWidth, bleed + heroH);

    let y = bleed + heroH + 38;
    if (volumeLabel) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...palette.accentRgb);
      doc.text(volumeLabel.toUpperCase(), frontCenterX, y, { align: 'center' });
      y += 22;
    }
    doc.setFont(fontName, 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...palette.textRgb);
    const titleLines = doc.splitTextToSize(bookTitle, frontPageWidth - 70);
    doc.text(titleLines, frontCenterX, y, { align: 'center' });
    y += titleLines.length * 26 + 8;

    if (bookSubtitle) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...palette.mutedTextRgb);
      const subLines = doc.splitTextToSize(bookSubtitle, frontPageWidth - 80);
      doc.text(subLines, frontCenterX, y, { align: 'center' });
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(11.5);
    doc.setTextColor(...palette.textRgb);
    doc.text(authorName.toUpperCase(), frontCenterX, spreadHeight - bleed - 42, { align: 'center' });
  } else if (coverLayout === 'PORTRAIT_MEDALLION') {
    // Outer frame
    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(1.2);
    doc.rect(frontCoverLeft + 26, bleed + 26, frontPageWidth - 52, frontPageHeight - 52);

    let y = bleed + 68;
    if (volumeLabel) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...palette.accentRgb);
      doc.text(volumeLabel.toUpperCase(), frontCenterX, y, { align: 'center' });
      y += 22;
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(22);
    doc.setTextColor(...palette.textRgb);
    const titleLines = doc.splitTextToSize(bookTitle, frontPageWidth - 80);
    doc.text(titleLines, frontCenterX, y, { align: 'center' });
    y += titleLines.length * 26 + 8;

    if (bookSubtitle) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(11);
      doc.setTextColor(...palette.mutedTextRgb);
      const subLines = doc.splitTextToSize(bookSubtitle, frontPageWidth - 90);
      doc.text(subLines, frontCenterX, y, { align: 'center' });
      y += subLines.length * 15 + 14;
    }

    // Centered framed portrait photograph
    const boxW = Math.min(180, frontPageWidth - 120);
    const boxH = boxW * 1.15;
    const boxX = frontCoverLeft + (frontPageWidth - boxW) / 2;
    const boxY = Math.max(y + 8, bleed + frontPageHeight * 0.4);
    doc.setFillColor(...palette.secondaryBgRgb);
    doc.rect(boxX - 5, boxY - 5, boxW + 10, boxH + 10, 'F');
    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(1.5);
    doc.rect(boxX - 5, boxY - 5, boxW + 10, boxH + 10, 'S');
    if (coverImg) {
      doc.addImage(coverImg.dataUrl, 'JPEG', boxX, boxY, boxW, boxH, undefined, 'FAST');
    } else {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(9.5);
      doc.setTextColor(...palette.mutedTextRgb);
      doc.text('Family Heirloom Edition', frontCenterX, boxY + boxH / 2, { align: 'center' });
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...palette.textRgb);
    doc.text(authorName, frontCenterX, spreadHeight - bleed - 48, { align: 'center' });
  } else if (coverLayout === 'MINIMAL_LINEN') {
    // Left vertical spine accent bar on front cover
    doc.setFillColor(...palette.accentRgb);
    doc.rect(frontCoverLeft, bleed, 16, frontPageHeight, 'F');

    let y = bleed + frontPageHeight * 0.26;
    if (volumeLabel) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...palette.accentRgb);
      doc.text(volumeLabel.toUpperCase(), frontCoverLeft + 48, y);
      y += 20;
    }
    doc.setFont(fontName, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...palette.textRgb);
    const titleLines = doc.splitTextToSize(bookTitle, frontPageWidth - 80);
    doc.text(titleLines, frontCoverLeft + 48, y);
    y += titleLines.length * 28 + 8;

    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(1.5);
    doc.line(frontCoverLeft + 48, y, frontCoverLeft + 128, y);
    y += 22;

    if (bookSubtitle) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(11.5);
      doc.setTextColor(...palette.mutedTextRgb);
      const subLines = doc.splitTextToSize(bookSubtitle, frontPageWidth - 90);
      doc.text(subLines, frontCoverLeft + 48, y);
    }

    doc.setFont(fontName, 'normal');
    doc.setFontSize(11);
    doc.setTextColor(...palette.textRgb);
    doc.text(authorName, frontCoverLeft + 48, spreadHeight - bleed - 54);
  } else {
    // CLASSIC_FRAME (default)
    // Double-ruled gold ornamental border
    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(1.8);
    doc.rect(frontCoverLeft + 26, bleed + 26, frontPageWidth - 52, frontPageHeight - 52);
    doc.setLineWidth(0.6);
    doc.rect(frontCoverLeft + 32, bleed + 32, frontPageWidth - 64, frontPageHeight - 64);

    let y = bleed + frontPageHeight * 0.22;
    if (volumeLabel) {
      doc.setFont(fontName, 'bold');
      doc.setFontSize(9);
      doc.setTextColor(...palette.accentRgb);
      doc.text(volumeLabel.toUpperCase(), frontCenterX, y, { align: 'center' });
      y += 24;
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(24);
    doc.setTextColor(...palette.textRgb);
    const titleLines = doc.splitTextToSize(bookTitle, frontPageWidth - 90);
    doc.text(titleLines, frontCenterX, y, { align: 'center' });
    y += titleLines.length * 28 + 10;

    // Ornamental gold divider line
    doc.setDrawColor(...palette.accentRgb);
    doc.setLineWidth(0.9);
    doc.line(frontCenterX - 42, y, frontCenterX + 42, y);
    y += 22;

    if (bookSubtitle) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(11.5);
      doc.setTextColor(...palette.mutedTextRgb);
      const subLines = doc.splitTextToSize(bookSubtitle, frontPageWidth - 100);
      doc.text(subLines, frontCenterX, y, { align: 'center' });
      y += subLines.length * 16 + 18;
    }

    // Centered framed photo if uploaded
    if (coverImg) {
      const imgW = Math.min(160, frontPageWidth - 120);
      const imgH = imgW * 0.75;
      const imgX = frontCoverLeft + (frontPageWidth - imgW) / 2;
      const imgY = Math.max(y + 8, bleed + frontPageHeight * 0.46);
      doc.setDrawColor(...palette.accentRgb);
      doc.setLineWidth(1);
      doc.rect(imgX - 3, imgY - 3, imgW + 6, imgH + 6);
      doc.addImage(coverImg.dataUrl, 'JPEG', imgX, imgY, imgW, imgH, undefined, 'FAST');
    }

    doc.setFont(fontName, 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...palette.textRgb);
    doc.text(authorName, frontCenterX, spreadHeight - bleed - 50, { align: 'center' });
  }

  const safeSlug = bookTitle
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  doc.save(`${safeSlug || 'storybook'}_lulu_cover_spread.pdf`);
}

