/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users } from 'lucide-react';
import { Topic, Cd } from '@/src/services/api';
import { UnifiedGroup, PrivilegeCell } from '../types';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByGroupViewProps {
  groups: UnifiedGroup[];
  topics: Topic[];
  matrix: Record<string, PrivilegeCell>;
  privCodes: Cd[];
  onPrivilegeChange: (topicId: string, grpId: string, newValue: string) => void;
  onSetAllForGroup: (grpId: string, value: string) => void;
}

export default function PrivacyByGroupView({
  groups,
  topics,
  matrix,
  privCodes,
  onPrivilegeChange,
  onSetAllForGroup
}: PrivacyByGroupViewProps) {
  return (
    <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6">
      <AdminComponentTag name="PrivacyByGroupView.tsx" />

      {groups.map(grp => (
        <div
          key={grp.grpId}
          className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm space-y-4"
        >
          <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-500" />
                <h3 className="text-base font-bold font-serif text-slate-900 dark:text-white">
                  {grp.grpName}
                </h3>
              </div>
              {grp.grpDescription && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {grp.grpDescription}
                </p>
              )}
            </div>

            <select
              onChange={(e) => {
                if (e.target.value) {
                  onSetAllForGroup(grp.grpId, e.target.value);
                  e.target.value = '';
                }
              }}
              defaultValue=""
              className="text-[11px] px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              <option value="" disabled>Set All...</option>
              {privCodes.map(c => (
                <option key={c.cdId || c.cdValue} value={c.cdValue}>
                  {c.cdLabel || c.cdValue}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2.5">
            {topics.map(topic => {
              const key = `${topic.topicId}_${grp.grpId}`;
              const cell = matrix[key];
              const currentValue = cell?.privValueCd || 'NONE';

              return (
                <div
                  key={topic.topicId}
                  className="flex items-center justify-between gap-3 text-xs"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {topic.topicFullName || topic.topicName}
                  </span>
                  <div className="w-36">
                    <CdSelect
                      tag="privValueCd"
                      value={currentValue}
                      onChange={(newVal) => onPrivilegeChange(topic.topicId, grp.grpId, newVal)}
                      includeEmptyOption={false}
                      className="text-xs py-1 px-2 rounded-lg"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
