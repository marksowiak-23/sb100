import React from 'react';
import { Layers, Users, Printer } from 'lucide-react';
import { ViewMode } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyViewToolbarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onPrintPdf?: () => void;
}

export default function PrivacyViewToolbar({
  viewMode,
  onViewModeChange,
  onPrintPdf
}: PrivacyViewToolbarProps) {
  return (
    <div className="relative flex items-center justify-between mb-6 bg-white dark:bg-slate-900/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
      <AdminComponentTag name="PrivacyViewToolbar.tsx" />

      {/* Layout Switcher */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        <button
          type="button"
          onClick={() => onViewModeChange('by-topic')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'by-topic'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>By Topic</span>
        </button>

        <button
          type="button"
          onClick={() => onViewModeChange('by-group')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            viewMode === 'by-group'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
              : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>By Group</span>
        </button>
      </div>

      {/* Right Side: Print PDF Button */}
      {onPrintPdf && (
        <button
          type="button"
          onClick={onPrintPdf}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
          title="Generate and download a PDF report of your topics, groups and privileges"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
          <span>Print PDF</span>
        </button>
      )}
    </div>
  );
}
