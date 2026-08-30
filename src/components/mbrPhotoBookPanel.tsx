/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Camera } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export interface MbrPhotoBookPanelProps {
  onOpenPhotoBook?: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
}

export type SbPhotoBookPanelProps = MbrPhotoBookPanelProps;
export type mbrPhotoBookPanelProps = MbrPhotoBookPanelProps;

export default function MbrPhotoBookPanel({
  onOpenPhotoBook,
  title = 'Photo Book',
  description = 'Collect and arrange photos that bring your story to life.',
  buttonText = 'Open Photo Book'
}: MbrPhotoBookPanelProps) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <Camera className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          {title}
        </h3>
      </div>

      <p className="text-[11px] text-slate-550 leading-relaxed font-serif">
        {description}
      </p>

      <button
        type="button"
        onClick={onOpenPhotoBook || (() => alert('Opening your Photo Book collection...'))}
        className="w-full py-2 bg-transparent hover:bg-slate-50 text-slate-700 hover:text-slate-800 border border-slate-300 hover:border-slate-400 rounded-xl text-xs font-bold transition-all cursor-pointer text-center"
      >
        {buttonText}
      </button>

      <AdminComponentTag name="mbrPhotoBookPanel" />
    </div>
  );
}

export { MbrPhotoBookPanel, MbrPhotoBookPanel as mbrPhotoBookPanel, MbrPhotoBookPanel as SbPhotoBookPanel };

