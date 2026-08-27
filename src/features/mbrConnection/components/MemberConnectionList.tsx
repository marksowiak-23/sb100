/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Loader2, Users } from 'lucide-react';
import { UnifiedGroupOption, MemberConnectionItem } from '../types';
import MemberConnectionCard from './MemberConnectionCard';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MemberConnectionListProps {
  loading: boolean;
  memberList: MemberConnectionItem[];
  groups: UnifiedGroupOption[];
  onGroupSelect: (targetMbrId: string, grpId: string) => void;
}

export default function MemberConnectionList({
  loading,
  memberList,
  groups,
  onGroupSelect
}: MemberConnectionListProps) {
  return (
    <div className="relative">
      <AdminComponentTag name="MemberConnectionList.tsx" />

      {loading ? (
        <div className="w-full h-72 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 font-serif">
            Loading your member connections...
          </span>
        </div>
      ) : memberList.length === 0 ? (
        <div className="w-full p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-1 font-serif">
            No matching connections found
          </h3>
          <p className="text-xs text-slate-400 font-serif">
            Try adjusting your search criteria or group filter options.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memberList.map(item => (
            <MemberConnectionCard
              key={item.member.mbrId}
              item={item}
              groups={groups}
              onGroupSelect={onGroupSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
