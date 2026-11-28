/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';

interface OtpCodeInputProps {
  value: string;
  onChange: (val: string) => void;
  disabled?: boolean;
  autoFocus?: boolean;
}

export default function OtpCodeInput({
  value,
  onChange,
  disabled = false,
  autoFocus = true,
}: OtpCodeInputProps) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] || '');

  const handleDigitChange = (index: number, raw: string) => {
    const cleaned = raw.replace(/\D/g, '');
    if (!cleaned) {
      const next = [...digits];
      next[index] = '';
      onChange(next.join(''));
      return;
    }

    if (cleaned.length > 1) {
      const merged = (value.slice(0, index) + cleaned).replace(/\D/g, '').slice(0, 6);
      onChange(merged);
      const focusIdx = Math.min(5, merged.length);
      inputsRef.current[focusIdx]?.focus();
      return;
    }

    const next = [...digits];
    next[index] = cleaned[0];
    onChange(next.join(''));
    if (index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        onChange(next.join(''));
      } else if (index > 0) {
        inputsRef.current[index - 1]?.focus();
        const next = [...digits];
        next[index - 1] = '';
        onChange(next.join(''));
      }
      e.preventDefault();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      onChange(pasted);
      const focusIdx = Math.min(5, pasted.length);
      inputsRef.current[focusIdx]?.focus();
    }
  };

  return (
    <div className="flex items-center justify-center gap-2 sm:gap-2.5" role="group" aria-label="6-digit verification code">
      {digits.map((digit, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputsRef.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          autoFocus={autoFocus && idx === 0}
          disabled={disabled}
          value={digit}
          onChange={(e) => handleDigitChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          aria-label={`Digit ${idx + 1}`}
          className="w-10 h-12 sm:w-12 sm:h-14 text-center font-mono text-lg sm:text-xl font-bold rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-600 transition-all disabled:opacity-50"
        />
      ))}
    </div>
  );
}
