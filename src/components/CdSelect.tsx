/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
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
  const options = getCodesByTag(tag);
  const selectedCd = getCode(tag, value);

  const shouldIncludeEmpty = includeEmptyOption ?? (!required || Boolean(placeholder));

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedValue = e.target.value;
    const cd = getCode(tag, selectedValue);
    if (onChange) {
      onChange(selectedValue, cd);
    }
  };

  return (
    <div className="relative w-full flex flex-col gap-1">
      <div className="relative">
        <select
          value={value}
          onChange={handleChange}
          disabled={disabled || loading}
          required={required}
          className={`w-full appearance-none rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-4 py-2.5 pr-10 text-sm text-slate-800 dark:text-slate-200 shadow-sm transition-all focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
          {...restProps}
        >
          {shouldIncludeEmpty && (
            <option value="" disabled={required}>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.cdId || `${opt.cdTag}-${opt.cdValue}`} value={opt.cdValue}>
              {opt.cdLabel && opt.cdLabel.trim() !== '' ? opt.cdLabel : opt.cdValue}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>

      {showDescriptionHelper && selectedCd?.cdDesc && (
        <div className="flex items-start gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5 px-1">
          <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500/80" />
          <span>{selectedCd.cdDesc}</span>
        </div>
      )}
    </div>
  );
};

export default CdSelect;
