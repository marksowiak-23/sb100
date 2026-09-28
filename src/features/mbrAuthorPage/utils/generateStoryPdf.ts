/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import jsPDF from 'jspdf';

export type StoryPdfPageSize = 'trade-paperback' | 'letter' | 'a4' | 'digest' | 'executive';
export type StoryPdfOrientation = 'portrait' | 'landscape';
export type StoryPdfFontFamily = 'serif' | 'sans' | 'mono';
export type StoryPdfFontSize = 'compact' | 'regular' | 'large';
export type StoryPdfMargin = 'standard' | 'wide' | 'narrow';
export type StoryPdfColorTheme = 'amber' | 'slate' | 'burgundy' | 'emerald' | 'monochrome';

export interface GenerateStoryPdfOptions {
  storyTitle: string;
  storyContent: string;
  topicTitle?: string;
  authorName?: string;
  authorLocation?: string;
  publishedDate?: string;
  status?: string;
  wordCount?: number;

  // Formatting & Customization Options
  pageSize?: StoryPdfPageSize;
  orientation?: StoryPdfOrientation;
  fontFamily?: StoryPdfFontFamily;
  fontSize?: StoryPdfFontSize;
  margins?: StoryPdfMargin;
  colorTheme?: StoryPdfColorTheme;

  // Layout & Embellishment Toggles
  includeDropCap?: boolean;
  includeOrnamentalDivider?: boolean;
  includeHeader?: boolean;
  includePageNumbers?: boolean;
  includeColophon?: boolean;
  includeAuthor?: boolean;
  includeDateLocation?: boolean;
}

const PAGE_DIMENSIONS: Record<StoryPdfPageSize, [number, number]> = {
  'trade-paperback': [432, 648], // 6" x 9"
  'letter': [612, 792],          // 8.5" x 11"
  'a4': [595.28, 841.89],        // 210mm x 297mm
  'digest': [396, 612],          // 5.5" x 8.5"
  'executive': [522, 756],       // 7.25" x 10.5"
};

const FONT_MAP: Record<StoryPdfFontFamily, string> = {
  serif: 'times',
  sans: 'helvetica',
  mono: 'courier',
};

const THEME_COLORS: Record<
  StoryPdfColorTheme,
  {
    accent: [number, number, number];
    divider: [number, number, number];
    title: [number, number, number];
    body: [number, number, number];
    meta: [number, number, number];
    border: [number, number, number];
  }
> = {
  amber: {
    accent: [180, 83, 9],     // Warm Amber #B45309
    divider: [217, 119, 6],   // Amber-600 #D97706
    title: [17, 24, 39],      // Rich Ink #111827
    body: [31, 41, 55],       // Slate/Charcoal #1F2937
    meta: [100, 116, 139],    // Slate-500
    border: [226, 232, 240],  // Slate-200
  },
  slate: {
    accent: [51, 65, 85],     // Slate-700
    divider: [71, 85, 105],   // Slate-600
    title: [15, 23, 42],      // Slate-900
    body: [30, 41, 59],       // Slate-800
    meta: [100, 116, 139],    // Slate-500
    border: [226, 232, 240],  // Slate-200
  },
  burgundy: {
    accent: [136, 19, 55],    // Burgundy #881337
    divider: [159, 18, 57],   // Rose-800 #9F1239
    title: [24, 24, 27],      // Zinc-900
    body: [39, 39, 42],       // Zinc-800
    meta: [113, 113, 122],    // Zinc-500
    border: [228, 228, 231],  // Zinc-200
  },
  emerald: {
    accent: [6, 78, 59],      // Emerald-900
    divider: [5, 150, 105],   // Emerald-600
    title: [17, 24, 39],      // Charcoal
    body: [31, 41, 55],       // Slate-800
    meta: [100, 116, 139],    // Slate-500
    border: [209, 250, 229],  // Emerald-100
  },
  monochrome: {
    accent: [0, 0, 0],        // Pure Black
    divider: [90, 90, 90],    // Neutral Gray
    title: [0, 0, 0],         // Black
    body: [24, 24, 27],       // Dark Neutral
    meta: [115, 115, 115],    // Neutral-500
    border: [212, 212, 212],  // Neutral-300
  },
};

/**
 * Generates a beautifully formatted PDF styled with customizable page size, typography,
 * orientation, and book-publishing flourishes.
 */
export function generateStoryPdf({
  storyTitle,
  storyContent,
  topicTitle = 'Story',
  authorName = 'Storybook Author',
  authorLocation,
  publishedDate,
  status = 'Draft',
  wordCount,
  pageSize = 'trade-paperback',
  orientation = 'portrait',
  fontFamily = 'serif',
  fontSize = 'regular',
  margins = 'standard',
  colorTheme = 'amber',
  includeDropCap = true,
  includeOrnamentalDivider = true,
  includeHeader = true,
  includePageNumbers = true,
  includeColophon = true,
  includeAuthor = true,
  includeDateLocation = true,
}: GenerateStoryPdfOptions): void {
  // 1. Resolve Dimensions
  const baseDim = PAGE_DIMENSIONS[pageSize] || PAGE_DIMENSIONS['trade-paperback'];
  const [dimW, dimH] = baseDim;
  const pageWidth = orientation === 'landscape' ? Math.max(dimW, dimH) : Math.min(dimW, dimH);
  const pageHeight = orientation === 'landscape' ? Math.min(dimW, dimH) : Math.max(dimW, dimH);

  const doc = new jsPDF({
    orientation,
    unit: 'pt',
    format: [pageWidth, pageHeight],
  });

  // 2. Resolve Margins
  let marginX = 48;
  let topMarginFirstPage = 95;
  let topMarginSubsequent = 65;
  let bottomMargin = 55;

  if (margins === 'narrow') {
    marginX = 36;
    topMarginFirstPage = 70;
    topMarginSubsequent = 48;
    bottomMargin = 42;
  } else if (margins === 'wide') {
    marginX = 64;
    topMarginFirstPage = 110;
    topMarginSubsequent = 78;
    bottomMargin = 65;
  }

  // Scale margins slightly for smaller digest vs large Letter
  if (pageSize === 'letter' || pageSize === 'a4') {
    if (margins === 'standard') {
      marginX = 54;
      topMarginFirstPage = 105;
      topMarginSubsequent = 70;
    }
  } else if (pageSize === 'digest') {
    if (margins === 'standard') {
      marginX = 40;
      topMarginFirstPage = 80;
      topMarginSubsequent = 55;
    }
  }

  const contentWidth = pageWidth - marginX * 2;
  const pageBottomLimit = pageHeight - bottomMargin;

  // 3. Resolve Typography & Sizing
  const fontName = FONT_MAP[fontFamily] || 'times';

  let bodyFontSize = 10.5;
  let bodyLineHeight = 15;
  let dropCapFontSize = 30;
  let titleFontSize = 19;
  let titleLineHeight = 22;
  let paragraphIndent = 16;

  if (fontSize === 'compact') {
    bodyFontSize = 9.5;
    bodyLineHeight = 13.5;
    dropCapFontSize = 26;
    titleFontSize = 17;
    titleLineHeight = 20;
    paragraphIndent = 14;
  } else if (fontSize === 'large') {
    bodyFontSize = 12.5;
    bodyLineHeight = 18;
    dropCapFontSize = 36;
    titleFontSize = 22;
    titleLineHeight = 26;
    paragraphIndent = 20;
  }

  // Adjust for sans / mono metrics
  if (fontFamily === 'sans') {
    bodyFontSize *= 0.96;
  } else if (fontFamily === 'mono') {
    bodyFontSize *= 0.92;
    paragraphIndent = 24;
  }

  // 4. Resolve Theme Colors
  const theme = THEME_COLORS[colorTheme] || THEME_COLORS.amber;

  // 5. Metadata Preparation
  const cleanTitle = (storyTitle || 'Untitled Story').trim();
  const cleanTopic = (topicTitle || 'Memoir Chapter').toUpperCase();
  const cleanAuthor = (authorName || 'Storybook Author').trim();
  const displayDate = publishedDate
    ? new Date(publishedDate).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const resolvedWordCount =
    wordCount !== undefined
      ? wordCount
      : storyContent
      ? storyContent.trim().split(/\s+/).filter(Boolean).length
      : 0;

  // --- Helper to draw page headers & footers ---
  const drawPageFurniture = (pageNum: number, totalPages: number) => {
    // 1. Running Header (Page 2+ only, omitted on Chapter Opening Page)
    if (includeHeader && pageNum > 1) {
      doc.setFont(fontName, 'italic');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);

      const maxHeaderLen = Math.floor(contentWidth / 10);
      const truncatedTitle =
        cleanTitle.length > maxHeaderLen ? cleanTitle.substring(0, maxHeaderLen) + '...' : cleanTitle;

      if (includeAuthor) {
        doc.text(cleanAuthor, marginX, topMarginSubsequent - 28);
      }
      doc.text(truncatedTitle, pageWidth - marginX, topMarginSubsequent - 28, { align: 'right' });

      // Hairline divider rule below header
      doc.setDrawColor(theme.border[0], theme.border[1], theme.border[2]);
      doc.setLineWidth(0.5);
      doc.line(marginX, topMarginSubsequent - 22, pageWidth - marginX, topMarginSubsequent - 22);
    }

    // 2. Running Footer (Page Numbers)
    if (includePageNumbers) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(9);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);
      doc.text(`— ${pageNum} —`, pageWidth / 2, pageHeight - (bottomMargin - 22), { align: 'center' });
    }
  };

  // ----------------------------------------------------
  // --- PAGE 1: CHAPTER OPENING & HEADER ---
  // ----------------------------------------------------
  let cursorY = topMarginFirstPage;

  // Collection / Sub-header Label (small caps style)
  doc.setFont(fontName, 'bold');
  doc.setFontSize(8);
  doc.setTextColor(theme.accent[0], theme.accent[1], theme.accent[2]);
  doc.text(`S T O R Y B O O K   •   ${cleanTopic}`, pageWidth / 2, cursorY, { align: 'center' });

  cursorY += 24;

  // Story / Chapter Title (Large bold serif/sans)
  doc.setFont(fontName, 'bold');
  doc.setFontSize(titleFontSize);
  doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);

  const titleLines = doc.splitTextToSize(cleanTitle, contentWidth - 20);
  for (const line of titleLines) {
    doc.text(line, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += titleLineHeight;
  }

  cursorY += 4;

  // Author Byline
  if (includeAuthor) {
    doc.setFont(fontName, 'italic');
    doc.setFontSize(11);
    doc.setTextColor(theme.body[0], theme.body[1], theme.body[2]);
    doc.text(`by ${cleanAuthor}`, pageWidth / 2, cursorY, { align: 'center' });
    cursorY += 16;
  }

  // Optional Location & Date subtitle
  if (includeDateLocation) {
    const metaParts: string[] = [];
    if (authorLocation) metaParts.push(authorLocation);
    if (displayDate) metaParts.push(displayDate);

    if (metaParts.length > 0) {
      doc.setFont(fontName, 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);
      doc.text(metaParts.join('  •  '), pageWidth / 2, cursorY, { align: 'center' });
      cursorY += 16;
    }
  }

  // Chapter Ornamental Divider Rule
  if (includeOrnamentalDivider) {
    doc.setDrawColor(theme.divider[0], theme.divider[1], theme.divider[2]);
    doc.setLineWidth(0.75);
    const dividerHalfWidth = Math.min(50, contentWidth / 6);
    const centerX = pageWidth / 2;
    doc.line(centerX - dividerHalfWidth, cursorY, centerX - 12, cursorY);
    doc.line(centerX + 12, cursorY, centerX + dividerHalfWidth, cursorY);

    // Center diamond/flourish symbol
    doc.setFont(fontName, 'bold');
    doc.setFontSize(10);
    doc.setTextColor(theme.divider[0], theme.divider[1], theme.divider[2]);
    doc.text('❖', centerX, cursorY + 3.5, { align: 'center' });

    cursorY += 32;
  } else {
    cursorY += 16;
  }

  // ----------------------------------------------------
  // --- BODY TEXT RENDERING WITH BOOK PARAGRAPH FLOW ---
  // ----------------------------------------------------
  const rawParagraphs = (storyContent || '')
    .split(/\r?\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (rawParagraphs.length === 0) {
    // Empty story placeholder
    doc.setFont(fontName, 'italic');
    doc.setFontSize(10);
    doc.setTextColor(156, 163, 175);
    doc.text('This chapter has no recorded story text yet.', pageWidth / 2, cursorY + 20, {
      align: 'center',
    });
  } else {
    rawParagraphs.forEach((paragraph, pIdx) => {
      // Check if starting this paragraph requires a new page
      if (cursorY + bodyLineHeight * 2 > pageBottomLimit) {
        doc.addPage();
        cursorY = topMarginSubsequent;
      }

      // First paragraph drop-cap option
      const isFirstParagraph = pIdx === 0;

      if (isFirstParagraph && includeDropCap) {
        // Drop-cap effect for the very first letter of the story
        const firstLetter = paragraph.charAt(0);
        const restOfFirstParagraph = paragraph.slice(1);

        doc.setFont(fontName, 'bold');
        doc.setFontSize(dropCapFontSize);
        doc.setTextColor(theme.title[0], theme.title[1], theme.title[2]);

        // Measure drop cap
        const dropCapWidth = doc.getTextWidth(firstLetter) + 4;
        const dropCapY = cursorY + dropCapFontSize * 0.7;
        doc.text(firstLetter, marginX, dropCapY);

        // Render first 2 lines indented around drop cap
        doc.setFont(fontName, 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(theme.body[0], theme.body[1], theme.body[2]);

        const dropCapLines = doc.splitTextToSize(restOfFirstParagraph, contentWidth - dropCapWidth);

        const dropCapLineCount = Math.min(2, dropCapLines.length);
        for (let i = 0; i < dropCapLineCount; i++) {
          doc.text(dropCapLines[i], marginX + dropCapWidth, cursorY + i * bodyLineHeight);
        }

        cursorY += dropCapLineCount * bodyLineHeight;

        // If there are remaining lines in the first paragraph, render across full width
        if (dropCapLines.length > dropCapLineCount) {
          const remainingText = restOfFirstParagraph
            .split(/\s+/)
            .slice(
              dropCapLines
                .slice(0, dropCapLineCount)
                .join(' ')
                .split(/\s+/).length
            )
            .join(' ');

          if (remainingText) {
            const fullWidthLines = doc.splitTextToSize(remainingText, contentWidth);
            for (const line of fullWidthLines) {
              if (cursorY + bodyLineHeight > pageBottomLimit) {
                doc.addPage();
                cursorY = topMarginSubsequent;
              }
              doc.text(line, marginX, cursorY);
              cursorY += bodyLineHeight;
            }
          }
        }

        cursorY += 8; // Paragraph break spacing
      } else {
        // Subsequent paragraphs (or first paragraph without drop-cap)
        doc.setFont(fontName, 'normal');
        doc.setFontSize(bodyFontSize);
        doc.setTextColor(theme.body[0], theme.body[1], theme.body[2]);

        const shouldIndent = isFirstParagraph ? false : true;
        const words = paragraph.split(/\s+/);
        let currentLine = '';
        let isFirstLineOfPara = true;

        for (let wIdx = 0; wIdx < words.length; wIdx++) {
          const word = words[wIdx];
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const allowedWidth =
            shouldIndent && isFirstLineOfPara ? contentWidth - paragraphIndent : contentWidth;

          if (doc.getTextWidth(testLine) > allowedWidth && currentLine) {
            // Check page boundary
            if (cursorY + bodyLineHeight > pageBottomLimit) {
              doc.addPage();
              cursorY = topMarginSubsequent;
            }

            const drawX = shouldIndent && isFirstLineOfPara ? marginX + paragraphIndent : marginX;
            doc.text(currentLine, drawX, cursorY);
            cursorY += bodyLineHeight;

            currentLine = word;
            isFirstLineOfPara = false;
          } else {
            currentLine = testLine;
          }
        }

        // Print final line of paragraph
        if (currentLine) {
          if (cursorY + bodyLineHeight > pageBottomLimit) {
            doc.addPage();
            cursorY = topMarginSubsequent;
          }
          const drawX = shouldIndent && isFirstLineOfPara ? marginX + paragraphIndent : marginX;
          doc.text(currentLine, drawX, cursorY);
          cursorY += bodyLineHeight;
        }

        cursorY += 6; // Paragraph spacing
      }
    });

    // ----------------------------------------------------
    // --- CHAPTER END VIGNETTE & COLOPHON ---
    // ----------------------------------------------------
    if (includeColophon) {
      if (cursorY + 50 > pageBottomLimit) {
        doc.addPage();
        cursorY = topMarginSubsequent + 15;
      } else {
        cursorY += 18;
      }

      // Classic end-of-chapter fleuron: *  *  *
      doc.setFont(fontName, 'normal');
      doc.setFontSize(11);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);
      doc.text('*   *   *', pageWidth / 2, cursorY, { align: 'center' });

      cursorY += 22;

      // Book publication note
      doc.setFont(fontName, 'italic');
      doc.setFontSize(8);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);
      doc.text(
        `Storybook Memoir  •  Chapter: ${cleanTopic}  •  ${resolvedWordCount} words`,
        pageWidth / 2,
        cursorY,
        { align: 'center' }
      );

      cursorY += 12;
      doc.setFont(fontName, 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(theme.meta[0], theme.meta[1], theme.meta[2]);
      doc.text('Live it. Write it. Share it.', pageWidth / 2, cursorY, { align: 'center' });
    }
  }

  // ----------------------------------------------------
  // --- DRAW PAGE FURNITURE ACROSS ALL PAGES ---
  // ----------------------------------------------------
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawPageFurniture(i, totalPages);
  }

  // ----------------------------------------------------
  // --- SAVE / DOWNLOAD PDF ---
  // ----------------------------------------------------
  const sanitizedTitle = cleanTitle
    .replace(/[^a-zA-Z0-9_\- ]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const filename = `${sanitizedTitle || 'Story'}_Chapter.pdf`;

  doc.save(filename);
}
