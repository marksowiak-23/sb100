/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MapPin, Briefcase, Check } from 'lucide-react';
import { UnifiedGroupOption, MemberConnectionItem } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MemberConnectionCardProps {
  key?: React.Key;
  item: MemberConnectionItem;
  groups: UnifiedGroupOption[];
  onGroupSelect: (targetMbrId: string, grpId: string) => void;
}


export default function MemberConnectionCard({
  item,
  groups,
  onGroupSelect
}: MemberConnectionCardProps) {
  const m = item.member;
  const fullName = `${m.mbrFirstName || ''} ${m.mbrLastName || ''}`.trim() || 'Anonymous Member';
  const initials = `${(m.mbrFirstName?.[0] || 'M')}${(m.mbrLastName?.[0] || '')}`.toUpperCase();
  const isAssigned = item.selectedGrpId !== '';
  const isModified = item.selectedGrpId !== item.originalGrpId;
  const currentGroup = groups.find(g => g.grpId === item.selectedGrpId);

  return (
    <div
      className={`relative p-4 rounded-2xl border bg-white dark:bg-slate-900 transition-all flex flex-col justify-between gap-4 shadow-xs hover:shadow-md ${
        isModified
          ? 'border-blue-400 dark:border-blue-500 ring-1 ring-blue-400/30'
          : 'border-slate-200 dark:border-slate-800'
      }`}
    >
      <AdminComponentTag name="MemberConnectionCard.tsx" />

      {/* Member Header & Avatar */}
      <div className="flex items-start gap-3.5">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-200 shrink-0 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs">
          {m.mbrProfilePic ? (
            <img
              src={m.mbrProfilePic}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{initials}</span>
          )}
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate font-serif">
              {fullName}
            </h3>
            {isAssigned ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shrink-0">
                <Check className="w-2.5 h-2.5" />
                {currentGroup?.grpName || 'Assigned'}
              </span>
            ) : (
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                None
              </span>
            )}
          </div>

          {m.mbrLivesCityState && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{m.mbrLivesCityState}</span>
            </p>
          )}

          {m.mbrWorkAt && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 truncate">
              <Briefcase className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{m.mbrWorkAt}</span>
            </p>
          )}
        </div>
      </div>

      {/* Group Selector Control */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
          Assigned Group:
        </span>

        <div className="w-48 sm:w-56">
          <select
            value={item.selectedGrpId}
            onChange={(e) => onGroupSelect(m.mbrId, e.target.value)}
            className={`w-full text-xs py-1.5 px-3 rounded-xl border font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer ${
              item.selectedGrpId === ''
                ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                : 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 text-blue-900 dark:text-blue-200 font-bold'
            }`}
          >
            <option value="">None (No Group)</option>
            {groups.map(grp => (
              <option key={grp.grpId} value={grp.grpId}>
                {grp.grpName} {grp.isCustom ? '(Custom)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
