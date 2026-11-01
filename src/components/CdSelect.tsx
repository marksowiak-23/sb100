/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useMemo } from 'react';
import { useCodes } from '../context/CodeContext.tsx';
import { Cd } from '../services/api.ts';
import { ChevronDown, Info } from 'lucide-react';

export interface CdSelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  /** The code tag identifying which lookup list to load (e.g. 'privValueCd', 'GENDER') */
  tag: string;
  /** Current selected cdValue */
  value?: string;
  /** Change event returning the selected cdValue and the corresponding Cd record */
  onChange?: (value: string, selectedCd?: Cd) => void;
  /** Custom label for placeholder / empty state option */
  placeholder?: string;
  /** Whether to show an empty/placeholder option (default: true if placeholder given or not required) */
  includeEmptyOption?: boolean;
  /** Helper flag to render description of the currently selected code below the select */
  showDescriptionHelper?: boolean;
}

const DEFAULT_FALLBACK_CODES: Record<string, { cdValue: string; cdLabel: string; cdDesc?: string }[]> = {
  privvaluecd: [
    { cdValue: 'READ', cdLabel: 'View Content (Read)', cdDesc: 'Allow group members to view content' },
    { cdValue: 'WRITE', cdLabel: 'Comment on Content (Write)', cdDesc: 'Allow group members to view and comment' },
    { cdValue: 'NONE', cdLabel: 'No Access (None)', cdDesc: 'Disallow access for this group' }
  ],
  booktrimsizecd: [
    { cdValue: 'TRADE_6X9', cdLabel: 'Trade Paperback (6"x9")', cdDesc: 'Standard 6" x 9" classic memoir paperback size (KDP/Lulu/Blurb)' },
    { cdValue: 'ROYAL_614X921', cdLabel: 'Royal Hardcover (6.14x9.21)', cdDesc: 'Classic 6.14" x 9.21" hardcover memoir trim size' },
    { cdValue: 'DIGEST_55X85', cdLabel: 'Pocket Digest (5.5"x8.5")', cdDesc: 'Compact 5.5" x 8.5" literary gift book format' },
    { cdValue: 'EXEC_725X105', cdLabel: 'Executive (7.25"x10.5")', cdDesc: 'Refined 7.25" x 10.5" family history journal format' },
    { cdValue: 'LETTER_85X11', cdLabel: 'US Letter (8.5"x11")', cdDesc: 'Standard 8.5" x 11" home and office edition' },
    { cdValue: 'A4', cdLabel: 'A4 International', cdDesc: 'International 210mm x 297mm document format' }
  ],
  bookcoverlayoutcd: [
    { cdValue: 'CLASSIC_FRAME', cdLabel: 'Classic Literary Frame', cdDesc: 'Double-ruled ornamental border with centered serif typography' },
    { cdValue: 'HERO_BLEED', cdLabel: 'Full-Bleed Hero Photo', cdDesc: 'Full-cover hero photograph with translucent title band' },
    { cdValue: 'PORTRAIT_MEDALLION', cdLabel: 'Portrait Medallion', cdDesc: 'Centered framed photograph with classic book typography' },
    { cdValue: 'MINIMAL_LINEN', cdLabel: 'Minimalist Linen', cdDesc: 'Clean modern heirloom cloth aesthetic' }
  ],
  bookcoverthemecd: [
    { cdValue: 'AMBER', cdLabel: 'Warm Amber & Cream', cdDesc: 'Warm parchment and amber gold accents' },
    { cdValue: 'NAVY_GOLD', cdLabel: 'Heirloom Navy & Gold', cdDesc: 'Deep Oxford navy with antique gold foil accents' },
    { cdValue: 'BURGUNDY', cdLabel: 'Royal Burgundy', cdDesc: 'Classic leather-bound burgundy and ivory' },
    { cdValue: 'EMERALD', cdLabel: 'Forest Emerald', cdDesc: 'Deep botanical green and warm cream' },
    { cdValue: 'SLATE', cdLabel: 'Midnight Slate', cdDesc: 'Sophisticated charcoal slate and silver' },
    { cdValue: 'MONOCHROME', cdLabel: 'Minimalist Ink', cdDesc: 'Crisp black and archival white' }
  ]
};

export const CdSelect: React.FC<CdSelectProps> = ({
  tag,
  value = '',
  onChange,
  placeholder = 'Select an option...',
  includeEmptyOption,
  showDescriptionHelper = false,
  className = '',
  disabled = false,
  required = false,
  ...restProps
}) => {
  const { getCodesByTag, getCode, loading } = useCodes();
  const rawCodes = getCodesByTag(tag);

  // Compute options with fallback support to guarantee non-empty dropdown on mobile
  const options = useMemo(() => {
    const list: { cdId?: string; cdValue: string; cdLabel?: string; cdTag?: string; cdDesc?: string }[] = [];
    const seenValues = new Set<string>();

    // 1. Add context codes if available
    if (rawCodes && rawCodes.length > 0) {
      for (const c of rawCodes) {
        if (c.cdValue && !seenValues.has(c.cdValue.trim().toLowerCase())) {
          seenValues.add(c.cdValue.trim().toLowerCase());
          list.push(c);
        }
      }
    }

    // 2. Add fallback codes if empty or missing common values
    const normalizedTag = (tag || '').trim().toLowerCase();
    const fallbacks = DEFAULT_FALLBACK_CODES[normalizedTag];
    if (fallbacks) {
      for (const fb of fallbacks) {
        if (!seenValues.has(fb.cdValue.trim().toLowerCase())) {
          seenValues.add(fb.cdValue.trim().toLowerCase());
          list.push(fb);
        }
      }
    }

    // 3. Ensure current value is included if present
    if (value && value.trim() !== '' && !seenValues.has(value.trim().toLowerCase())) {
      list.unshift({
        cdValue: value,
        cdLabel: value,
        cdTag: tag
      });
    }

    return list;
  }, [rawCodes, tag, value]);

  const selectedCd = useMemo(() => {
    const fromContext = getCode(tag, value);
    if (fromContext) return fromContext;
    const match = options.find((o) => o.cdValue.trim().toLowerCase() === value.trim().toLowerCase());
    return match ? (match as Cd) : undefined;
  }, [getCode, tag, value, options]);

  const shouldIncludeEmpty = includeEmptyOption ?? (!required || Boolean(placeholder));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const cd = getCode(tag, selectedValue) || (options.find((o) => o.cdValue === selectedValue) as Cd);
    if (onChange) {
      onChange(selectedValue, cd);
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-1 text-left">
      <div className="relative w-full">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || (loading && options.length === 0)}
          required={required}
          style={{ colorScheme: 'light dark' }}
          className={`w-full appearance-none rounded-xl border border-slate-250 dark:border-slate-750 bg-white dark:bg-slate-900 px-3.5 py-2 pr-9 text-xs sm:text-xs font-medium text-slate-900 dark:text-slate-100 shadow-xs transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer touch-manipulation min-h-[38px] ${className}`}
          {...restProps}
        >
          {shouldIncludeEmpty && (
            <option value="" disabled={required} className="bg-white text-slate-900 dark:bg-slate-850 dark:text-slate-100 font-sans py-1">
              {placeholder}
            </option>
          )}
          {options.map((opt, index) => {
            const labelText = opt.cdLabel && opt.cdLabel.trim() !== '' ? opt.cdLabel : opt.cdValue;
            return (
              <option 
                key={`${opt.cdId || opt.cdValue || opt.cdTag || 'opt'}-${index}`} 
                value={opt.cdValue}
                className="bg-white text-slate-900 dark:bg-slate-850 dark:text-slate-100 font-sans py-1 text-xs"
              >
                {labelText}
              </option>
            );
          })}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 dark:text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {showDescriptionHelper && selectedCd?.cdDesc && (
        <div className="flex items-start gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 px-0.5 leading-tight">
          <Info className="h-3 w-3 shrink-0 mt-0.5 text-indigo-500/80" />
          <span>{selectedCd.cdDesc}</span>
        </div>
      )}
    </div>
  );
};

export default CdSelect;
