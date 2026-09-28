/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Printer,
  X,
  FileText,
  Sliders,
  Type,
  Palette,
  Check,
  Download,
  BookOpen,
  LayoutTemplate,
  Maximize2,
  Sparkles,
  Layers,
  CheckSquare,
  Square,
  User,
  MapPin,
  Calendar,
} from 'lucide-react';
import {
  generateStoryPdf,
  StoryPdfPageSize,
  StoryPdfOrientation,
  StoryPdfFontFamily,
  StoryPdfFontSize,
  StoryPdfMargin,
  StoryPdfColorTheme,
} from '../utils/generateStoryPdf';

interface StoryPdfPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  storyTitle: string;
  storyContent: string;
  topicTitle?: string;
  authorName?: string;
  authorLocation?: string;
  publishedDate?: string;
  status?: string;
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

export default function StoryPdfPrintModal({
  isOpen,
  onClose,
  storyTitle,
  storyContent,
  topicTitle = 'Story',
  authorName = 'Storybook Author',
  authorLocation = '',
  publishedDate,
  status = 'Draft',
  onSuccess,
  onError,
}: StoryPdfPrintModalProps) {
  // Config state
  const [pageSize, setPageSize] = useState<StoryPdfPageSize>('trade-paperback');
  const [orientation, setOrientation] = useState<StoryPdfOrientation>('portrait');
  const [fontFamily, setFontFamily] = useState<StoryPdfFontFamily>('serif');
  const [fontSize, setFontSize] = useState<StoryPdfFontSize>('regular');
  const [margins, setMargins] = useState<StoryPdfMargin>('standard');
  const [colorTheme, setColorTheme] = useState<StoryPdfColorTheme>('amber');

  // Layout & embellishments
  const [includeDropCap, setIncludeDropCap] = useState(true);
  const [includeOrnamentalDivider, setIncludeOrnamentalDivider] = useState(true);
  const [includeHeader, setIncludeHeader] = useState(true);
  const [includePageNumbers, setIncludePageNumbers] = useState(true);
  const [includeColophon, setIncludeColophon] = useState(true);
  const [includeAuthor, setIncludeAuthor] = useState(true);
  const [includeDateLocation, setIncludeDateLocation] = useState(true);

  // Metadata overrides for print
  const [customTitle, setCustomTitle] = useState(storyTitle);
  const [customAuthor, setCustomAuthor] = useState(authorName);
  const [customLocation, setCustomLocation] = useState(authorLocation);
  const [customTopic, setCustomTopic] = useState(topicTitle);

  const [activeTab, setActiveTab] = useState<'page' | 'style' | 'layout' | 'meta'>('page');
  const [isGenerating, setIsGenerating] = useState(false);

  // Keep synced when storyTitle or author changes
  React.useEffect(() => {
    setCustomTitle(storyTitle);
    setCustomAuthor(authorName);
    setCustomLocation(authorLocation);
    setCustomTopic(topicTitle);
  }, [storyTitle, authorName, authorLocation, topicTitle, isOpen]);

  if (!isOpen) return null;

  const countOfWords = (storyContent || '').trim().split(/\s+/).filter(Boolean).length;

  // Apply Quick Presets
  const applyPreset = (preset: 'paperback' | 'letter' | 'largeprint' | 'minimal') => {
    switch (preset) {
      case 'paperback':
        setPageSize('trade-paperback');
        setOrientation('portrait');
        setFontFamily('serif');
        setFontSize('regular');
        setMargins('standard');
        setColorTheme('amber');
        setIncludeDropCap(true);
        setIncludeOrnamentalDivider(true);
        setIncludeHeader(true);
        setIncludePageNumbers(true);
        setIncludeColophon(true);
        break;
      case 'letter':
        setPageSize('letter');
        setOrientation('portrait');
        setFontFamily('serif');
        setFontSize('regular');
        setMargins('standard');
        setColorTheme('slate');
        setIncludeDropCap(true);
        setIncludeOrnamentalDivider(true);
        setIncludeHeader(true);
        setIncludePageNumbers(true);
        setIncludeColophon(true);
        break;
      case 'largeprint':
        setPageSize('letter');
        setOrientation('portrait');
        setFontFamily('serif');
        setFontSize('large');
        setMargins('wide');
        setColorTheme('slate');
        setIncludeDropCap(false);
        setIncludeOrnamentalDivider(true);
        setIncludeHeader(true);
        setIncludePageNumbers(true);
        setIncludeColophon(true);
        break;
      case 'minimal':
        setPageSize('a4');
        setOrientation('portrait');
        setFontFamily('sans');
        setFontSize('regular');
        setMargins('narrow');
        setColorTheme('monochrome');
        setIncludeDropCap(false);
        setIncludeOrnamentalDivider(false);
        setIncludeHeader(true);
        setIncludePageNumbers(true);
        setIncludeColophon(false);
        break;
    }
  };

  const handleGeneratePdf = () => {
    try {
      setIsGenerating(true);
      generateStoryPdf({
        storyTitle: customTitle || 'Untitled Story',
        storyContent,
        topicTitle: customTopic || 'Story',
        authorName: customAuthor || 'Storybook Author',
        authorLocation: customLocation,
        publishedDate,
        status,
        wordCount: countOfWords,
        pageSize,
        orientation,
        fontFamily,
        fontSize,
        margins,
        colorTheme,
        includeDropCap,
        includeOrnamentalDivider,
        includeHeader,
        includePageNumbers,
        includeColophon,
        includeAuthor,
        includeDateLocation,
      });

      onSuccess?.(`Story PDF generated successfully (${pageSize.toUpperCase()}, ${orientation})!`);
      onClose();
    } catch (err: any) {
      console.error('Error generating customized PDF:', err);
      onError?.(err?.message || 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper label formatting
  const pageSizeLabels: Record<StoryPdfPageSize, { title: string; desc: string; badge: string }> = {
    'trade-paperback': {
      title: 'Trade Paperback',
      desc: 'Standard 6" × 9" classic book chapter size',
      badge: '6" × 9"',
    },
    'letter': {
      title: 'US Letter',
      desc: 'Standard 8.5" × 11" office / home printer paper',
      badge: '8.5" × 11"',
    },
    'a4': {
      title: 'A4 Standard',
      desc: 'International standard 210mm × 297mm document size',
      badge: '210 × 297 mm',
    },
    'digest': {
      title: 'Pocket Digest',
      desc: 'Compact 5.5" × 8.5" literary booklet format',
      badge: '5.5" × 8.5"',
    },
    'executive': {
      title: 'Executive',
      desc: 'Refined 7.25" × 10.5" memoir journal format',
      badge: '7.25" × 10.5"',
    },
  };

  const themeLabels: Record<StoryPdfColorTheme, { name: string; bg: string; dot: string }> = {
    amber: { name: 'Warm Amber', bg: 'bg-amber-50 border-amber-300 text-amber-900', dot: 'bg-amber-600' },
    slate: { name: 'Midnight Slate', bg: 'bg-slate-50 border-slate-300 text-slate-900', dot: 'bg-slate-700' },
    burgundy: { name: 'Royal Burgundy', bg: 'bg-rose-50 border-rose-300 text-rose-900', dot: 'bg-rose-800' },
    emerald: { name: 'Forest Emerald', bg: 'bg-emerald-50 border-emerald-300 text-emerald-900', dot: 'bg-emerald-700' },
    monochrome: { name: 'Minimal Charcoal', bg: 'bg-neutral-50 border-neutral-300 text-neutral-900', dot: 'bg-neutral-800' },
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
        <div className="fixed inset-0 cursor-default" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.16 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-2xl w-full z-10 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* --- HEADER --- */}
          <div className="px-5 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg sm:text-xl font-bold text-slate-850 dark:text-slate-100 flex items-center gap-2">
                  <span>Print Story to PDF</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold uppercase">
                    Customizer
                  </span>
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Configure page size, typography, orientation, and layout before generating your PDF.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* --- PRESETS BAR --- */}
          <div className="px-5 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
            <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0 uppercase tracking-wider">
              Presets:
            </span>
            <button
              type="button"
              onClick={() => applyPreset('paperback')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                pageSize === 'trade-paperback' && fontFamily === 'serif' && fontSize === 'regular'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Classic Paperback (6×9)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('letter')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                pageSize === 'letter' && fontSize === 'regular'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Standard Letter (8.5×11)
            </button>
            <button
              type="button"
              onClick={() => applyPreset('largeprint')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                fontSize === 'large'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Large Print Edition
            </button>
            <button
              type="button"
              onClick={() => applyPreset('minimal')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                colorTheme === 'monochrome' && fontFamily === 'sans'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Clean A4 Document
            </button>
          </div>

          {/* --- TABS --- */}
          <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 sm:px-6 gap-2 pt-2 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={() => setActiveTab('page')}
              className={`pb-2.5 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'page'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <LayoutTemplate className="w-3.5 h-3.5" />
              <span>Page Setup</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('style')}
              className={`pb-2.5 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'style'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Type className="w-3.5 h-3.5" />
              <span>Typography & Theme</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('layout')}
              className={`pb-2.5 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'layout'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Elements & Flourishes</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('meta')}
              className={`pb-2.5 px-2 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'meta'
                  ? 'border-amber-600 text-amber-700 dark:text-amber-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Story Info</span>
            </button>
          </div>

          {/* --- TAB BODY --- */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1 max-h-[55vh]">
            {/* 1. PAGE SETUP TAB */}
            {activeTab === 'page' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                    Page Size Format
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {(Object.keys(pageSizeLabels) as StoryPdfPageSize[]).map((key) => {
                      const item = pageSizeLabels[key];
                      const isSelected = pageSize === key;
                      return (
                        <div
                          key={key}
                          onClick={() => setPageSize(key)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start justify-between gap-2 ${
                            isSelected
                              ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20 shadow-xs'
                              : 'bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-850 dark:text-slate-100">
                                {item.title}
                              </span>
                              <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                                {item.badge}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                              {item.desc}
                            </p>
                          </div>
                          <div
                            className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                              isSelected
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700'
                            }`}
                          >
                            {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                      Page Orientation
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setOrientation('portrait')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          orientation === 'portrait'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-3 h-4 border border-current rounded-xs" />
                        <span>Portrait</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setOrientation('landscape')}
                        className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                          orientation === 'landscape'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <span className="w-4 h-3 border border-current rounded-xs" />
                        <span>Landscape</span>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                      Page Margins
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {(['standard', 'wide', 'narrow'] as StoryPdfMargin[]).map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setMargins(m)}
                          className={`py-2 px-2 rounded-xl border text-xs font-semibold capitalize cursor-pointer transition-all ${
                            margins === m
                              ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. TYPOGRAPHY & THEME TAB */}
            {activeTab === 'style' && (
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                    Typography Font Family
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setFontFamily('serif')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        fontFamily === 'serif'
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-serif font-bold text-base text-slate-850 dark:text-slate-100">
                        Times Serif
                      </div>
                      <div className="text-[10px] text-slate-500">Classic Book Elegance</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('sans')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        fontFamily === 'sans'
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-sans font-bold text-base text-slate-850 dark:text-slate-100">
                        Helvetica
                      </div>
                      <div className="text-[10px] text-slate-500">Clean & Modern Sans</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFontFamily('mono')}
                      className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                        fontFamily === 'mono'
                          ? 'bg-amber-50/80 border-amber-400 ring-2 ring-amber-500/20'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <div className="font-mono font-bold text-base text-slate-850 dark:text-slate-100">
                        Courier
                      </div>
                      <div className="text-[10px] text-slate-500">Vintage Typewriter</div>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                      Reading Font Size
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      <button
                        type="button"
                        onClick={() => setFontSize('compact')}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          fontSize === 'compact'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Compact
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize('regular')}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          fontSize === 'regular'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Standard
                      </button>
                      <button
                        type="button"
                        onClick={() => setFontSize('large')}
                        className={`py-2 px-1 text-center rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          fontSize === 'large'
                            ? 'bg-amber-500 text-white border-amber-500 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Large Print
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-200 block mb-2">
                      Palette & Accent Color
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {(Object.keys(themeLabels) as StoryPdfColorTheme[]).map((thm) => {
                        const tInfo = themeLabels[thm];
                        const isSelected = colorTheme === thm;
                        return (
                          <button
                            key={thm}
                            type="button"
                            onClick={() => setColorTheme(thm)}
                            className={`py-1.5 px-2 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                              isSelected
                                ? `${tInfo.bg} ring-2 ring-amber-500/20 shadow-xs`
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                            }`}
                          >
                            <span className={`w-2.5 h-2.5 rounded-full ${tInfo.dot} shrink-0`} />
                            <span className="truncate">{tInfo.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 3. ELEMENTS & FLOURISHES TAB */}
            {activeTab === 'layout' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Toggle classical book publishing elements and ornamental headers/footers:
                </p>

                <div className="space-y-2">
                  <div
                    onClick={() => setIncludeDropCap(!includeDropCap)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-serif font-bold text-lg">
                        D
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Drop Cap Initial
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Large decorated initial letter on first paragraph
                        </p>
                      </div>
                    </div>
                    {includeDropCap ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div
                    onClick={() => setIncludeOrnamentalDivider(!includeOrnamentalDivider)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-sm">
                        ❖
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Ornamental Chapter Flourish & Divider
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Chapter header dividing rule with decorative fleuron
                        </p>
                      </div>
                    </div>
                    {includeOrnamentalDivider ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div
                    onClick={() => setIncludeHeader(!includeHeader)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs">
                        TOP
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Running Header
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Author name and story title on pages 2+
                        </p>
                      </div>
                    </div>
                    {includeHeader ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div
                    onClick={() => setIncludePageNumbers(!includePageNumbers)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-mono text-xs font-bold">
                        — 1 —
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          Page Numbers Footer
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Centered classic page numbers on all pages
                        </p>
                      </div>
                    </div>
                    {includePageNumbers ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>

                  <div
                    onClick={() => setIncludeColophon(!includeColophon)}
                    className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                        * * *
                      </div>
                      <div>
                        <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                          End-of-Chapter Colophon & Vignette
                        </h5>
                        <p className="text-[11px] text-slate-500">
                          Concluding fleuron, word count, and Storybook imprint
                        </p>
                      </div>
                    </div>
                    {includeColophon ? (
                      <CheckSquare className="w-5 h-5 text-amber-600" />
                    ) : (
                      <Square className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 4. STORY INFO & METADATA OVERRIDE TAB */}
            {activeTab === 'meta' && (
              <div className="space-y-3.5">
                <p className="text-xs text-slate-500">
                  Optionally tweak the printed headers, author byline, or location for this PDF printout:
                </p>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Story / Chapter Title
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    placeholder="e.g. My First Day in Chicago"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Author Byline</span>
                    </label>
                    <input
                      type="text"
                      value={customAuthor}
                      onChange={(e) => setCustomAuthor(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Topic / Chapter Label</span>
                    </label>
                    <input
                      type="text"
                      value={customTopic}
                      onChange={(e) => setCustomTopic(e.target.value)}
                      placeholder="e.g. Family & Roots"
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>Location Subtitle</span>
                  </label>
                  <input
                    type="text"
                    value={customLocation}
                    onChange={(e) => setCustomLocation(e.target.value)}
                    placeholder="e.g. Chicago, IL"
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-800 dark:text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* --- LIVE FORMAT SUMMARY BADGE --- */}
          <div className="px-5 sm:px-6 py-2.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {pageSizeLabels[pageSize]?.title} ({pageSizeLabels[pageSize]?.badge})
              </span>
              <span>•</span>
              <span className="capitalize">{orientation}</span>
              <span>•</span>
              <span className="capitalize">{fontFamily} font</span>
              <span>•</span>
              <span className="capitalize">{fontSize} size</span>
              <span>•</span>
              <span>{countOfWords} words</span>
            </div>
          </div>

          {/* --- MODAL FOOTER ACTIONS --- */}
          <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-white dark:bg-slate-900">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-600/20 transition-all cursor-pointer border border-amber-600 disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Generate & Download PDF</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
