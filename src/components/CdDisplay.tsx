/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCodes } from '../context/CodeContext.tsx';
import { HelpCircle } from 'lucide-react';

export interface CdDisplayProps {
  /** The code tag identifying which lookup list (e.g. 'privValueCd', 'GENDER') */
  tag: string;
  /** Stored code value (e.g. 'READ_ONLY', 'ADMIN') */
  value?: string | null;
  /** Fallback string if value is empty or not found in code lookup */
  fallback?: string;
  /** Visual presentation variant */
  variant?: 'text' | 'badge' | 'subtle' | 'pill';
  /** Whether to render a tooltip/icon when a description exists */
  showDescTooltip?: boolean;
  /** Custom extra classes */
  className?: string;
}

export const CdDisplay: React.FC<CdDisplayProps> = ({
  tag,
  value,
  fallback = '—',
  variant = 'text',
  showDescTooltip = false,
  className = '',
}) => {
  const { getCode, getCodeLabel } = useCodes();
  const [tooltipVisible, setTooltipVisible] = useState(false);

  if (!value) {
    return <span className={`text-slate-400 dark:text-slate-500 text-sm ${className}`}>{fallback}</span>;
  }

  const label = getCodeLabel(tag, value, fallback);
  const cd = getCode(tag, value);
  const desc = cd?.cdDesc;

  let content: React.ReactNode = null;

  switch (variant) {
    case 'badge':
      content = (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60 shadow-xs ${className}`}
        >
          {label}
        </span>
      );
      break;
    case 'pill':
      content = (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs ${className}`}
        >
          {label}
        </span>
      );
      break;
    case 'subtle':
      content = (
        <span className={`text-sm font-medium text-slate-600 dark:text-slate-300 ${className}`}>
          {label}
        </span>
      );
      break;
    case 'text':
    default:
      content = <span className={`text-sm text-slate-800 dark:text-slate-100 ${className}`}>{label}</span>;
      break;
  }

  if (showDescTooltip && desc) {
    return (
      <div
        className="relative inline-flex items-center gap-1 cursor-help group"
        onMouseEnter={() => setTooltipVisible(true)}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        {content}
        <HelpCircle className="h-3.5 w-3.5 text-slate-400 hover:text-amber-500 transition-colors shrink-0" />
        
        {tooltipVisible && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-2 rounded-lg bg-slate-900 text-slate-100 text-xs shadow-xl border border-slate-800 z-50 pointer-events-none transition-opacity">
            <div className="font-semibold text-amber-400 mb-0.5">{label}</div>
            <div className="text-slate-300 leading-snug">{desc}</div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-slate-900" />
          </div>
        )}
      </div>
    );
  }

  return <>{content}</>;
};

export default CdDisplay;
