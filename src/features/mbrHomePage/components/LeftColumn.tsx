/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Award, Sparkles } from 'lucide-react';
import HomePageHeaderPanel from './HomePageHeaderPanel';
import SbMyConnectionsCard from './SbMyConnectionsCard';
import SbEasyStoryWritingCard from './SbEasyStoryWritingCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface LeftColumnProps {
  onClickAuthorPage?: () => void;
  onClickReadStory?: (memberId: string) => void;
  onOpenEarlyAdopter?: () => void;
}

export default function LeftColumn({ onClickAuthorPage, onClickReadStory, onOpenEarlyAdopter }: LeftColumnProps) {
  return (
    <div className="space-y-6 flex flex-col relative">
      <div className="space-y-3">
        <HomePageHeaderPanel />
        {onOpenEarlyAdopter && (
          <button
            type="button"
            data-coach-mark="home-early-adopter"
            onClick={onOpenEarlyAdopter}
            title="View your Founding Early Adopter benefits"
            className="w-full group flex items-center justify-between gap-2.5 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#1E1B4B] hover:from-slate-900 hover:to-indigo-950 border border-amber-400/45 hover:border-amber-300/80 shadow-md hover:shadow-lg transition-all cursor-pointer text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 text-slate-950 flex items-center justify-center shrink-0 shadow-sm group-hover:scale-105 transition-transform">
                <Award className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-xs font-serif font-bold text-amber-300 leading-tight flex items-center gap-1">
                  <span>Early Adopter</span>
                  <Sparkles className="w-3 h-3 text-amber-200 shrink-0" />
                </div>
                <div className="text-[10px] font-sans text-slate-300 truncate leading-tight mt-0.5">
                  Free Lifetime Member · View Perks
                </div>
              </div>
            </div>
          </button>
        )}
      </div>
      <SbEasyStoryWritingCard onClickAuthorPage={onClickAuthorPage} />
      <SbMyConnectionsCard onClickMember={onClickReadStory} />
      <AdminComponentTag name="LeftColumn" />
    </div>
  );
}

