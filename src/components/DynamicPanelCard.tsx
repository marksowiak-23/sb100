import React from 'react';
import {
  Info,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Megaphone,
  ArrowRight,
  X,
} from 'lucide-react';
import type { Panel } from '@/src/services/api';

interface DynamicPanelCardProps {
  panel: Pick<
    Panel,
    | 'panelStyleCd'
    | 'panelTitle'
    | 'panelBodyText'
    | 'panelCtaLabel'
    | 'panelCtaTarget'
    | 'panelDismissibleFlag'
  >;
  compact?: boolean;
  onCtaClick?: () => void;
  onDismiss?: () => void;
}

const STYLE_MAP: Record<
  string,
  {
    wrapper: string;
    iconWrap: string;
    title: string;
    body: string;
    cta: string;
    closeBtn: string;
    Icon: React.FC<{ className?: string }>;
  }
> = {
  INFO: {
    wrapper: 'bg-blue-50/90 border-blue-200 text-slate-800',
    iconWrap: 'bg-blue-100 text-blue-700',
    title: 'text-blue-950',
    body: 'text-slate-700',
    cta: 'bg-blue-600 hover:bg-blue-700 text-white',
    closeBtn: 'text-blue-700/70 hover:text-blue-900 hover:bg-blue-100',
    Icon: Info,
  },
  SUCCESS: {
    wrapper: 'bg-emerald-50/90 border-emerald-200 text-emerald-950',
    iconWrap: 'bg-emerald-100 text-emerald-700',
    title: 'text-emerald-950',
    body: 'text-emerald-900/85',
    cta: 'bg-emerald-600 hover:bg-emerald-700 text-white',
    closeBtn: 'text-emerald-700/70 hover:text-emerald-950 hover:bg-emerald-100',
    Icon: CheckCircle2,
  },
  WARNING: {
    wrapper: 'bg-amber-50/95 border-amber-300 text-amber-950',
    iconWrap: 'bg-amber-100 text-amber-700',
    title: 'text-amber-950',
    body: 'text-amber-900/90',
    cta: 'bg-amber-600 hover:bg-amber-700 text-white',
    closeBtn: 'text-amber-800/70 hover:text-amber-950 hover:bg-amber-100',
    Icon: AlertTriangle,
  },
  PROMO: {
    wrapper:
      'bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 border-amber-300/60 text-white shadow-md',
    iconWrap: 'bg-amber-400/20 text-amber-300 border border-amber-300/40',
    title: 'text-white',
    body: 'text-blue-50/95',
    cta: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    closeBtn: 'text-blue-100/80 hover:text-white hover:bg-white/10',
    Icon: Sparkles,
  },
  ANNOUNCEMENT: {
    wrapper: 'bg-[#FDFCFB] border-[#E5DEC9] text-[#1C1917] shadow-xs',
    iconWrap: 'bg-amber-100/80 text-amber-800',
    title: 'text-[#1C1917]',
    body: 'text-stone-700',
    cta: 'bg-slate-900 hover:bg-slate-800 text-white',
    closeBtn: 'text-stone-500 hover:text-stone-800 hover:bg-stone-100',
    Icon: Megaphone,
  },
};

export const DynamicPanelCard: React.FC<DynamicPanelCardProps> = ({
  panel,
  compact = false,
  onCtaClick,
  onDismiss,
}) => {
  const styleKey = (panel.panelStyleCd || 'INFO').toUpperCase();
  const theme = STYLE_MAP[styleKey] || STYLE_MAP.INFO;
  const Icon = theme.Icon;

  return (
    <div
      role="region"
      aria-label={panel.panelTitle || 'Site announcement'}
      className={`w-full border ${
        compact ? 'rounded-xl px-4 py-2.5' : 'rounded-2xl px-4 sm:px-5 py-3.5'
      } transition-all ${theme.wrapper}`}
    >
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${theme.iconWrap}`}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1 space-y-0.5">
            {panel.panelTitle && (
              <p className={`text-sm font-serif font-bold leading-snug ${theme.title}`}>
                {panel.panelTitle}
              </p>
            )}
            <p className={`text-xs sm:text-sm font-serif leading-relaxed whitespace-pre-line ${theme.body}`}>
              {panel.panelBodyText}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {panel.panelCtaLabel && panel.panelCtaTarget && (
            <button
              type="button"
              onClick={onCtaClick}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold transition-colors cursor-pointer ${theme.cta}`}
            >
              <span>{panel.panelCtaLabel}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
          {panel.panelDismissibleFlag && onDismiss && (
            <button
              type="button"
              onClick={onDismiss}
              aria-label="Dismiss message"
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${theme.closeBtn}`}
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
