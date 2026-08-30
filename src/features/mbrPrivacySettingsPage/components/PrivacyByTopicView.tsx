/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ChevronRight } from 'lucide-react';
import { Topic, Cd } from '@/src/services/api';
import { UnifiedGroup, PrivilegeCell } from '../types';
import { CdSelect } from '@/src/components/CdSelect';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface PrivacyByTopicViewProps {
  topics: Topic[];
  groups: UnifiedGroup[];
  matrix: Record<string, PrivilegeCell>;
  selectedTopicId: string | null;
  privCodes: Cd[];
  onSelectTopic: (topicId: string) => void;
  onPrivilegeChange: (topicId: string, grpId: string, newValue: string) => void;
  onSetAllForTopic: (topicId: string, value: string) => void;
}

export default function PrivacyByTopicView({
  topics,
  groups,
  matrix,
  selectedTopicId,
  privCodes,
  onSelectTopic,
  onPrivilegeChange,
  onSetAllForTopic
}: PrivacyByTopicViewProps) {
  const selectedTopic = topics.find(t => t.topicId === selectedTopicId);

  return (
    <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
      <AdminComponentTag name="PrivacyByTopicView.tsx" />

      {/* Topic Selector Sidebar */}
      <div className="md:col-span-1 space-y-2">
        <h3 className="text-xs font-bold uppercase text-slate-400 px-2 tracking-wider mb-2">
          Select Topic
        </h3>
        {topics.map(topic => {
          const isSelected = selectedTopicId === topic.topicId;
          return (
            <button
              key={topic.topicId}
              type="button"
              onClick={() => onSelectTopic(topic.topicId)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                isSelected
                  ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                  : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{topic.topicFullName || topic.topicName}</span>
              <ChevronRight className={`w-3.5 h-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
            </button>
          );
        })}
      </div>

      {/* Topic Detail & Groups Configuration */}
      <div className="md:col-span-3">
        {selectedTopicId && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                  Topic Configuration
                </span>
                <h2 className="text-xl font-bold font-serif text-slate-900 dark:text-white">
                  {selectedTopic?.topicFullName || selectedTopic?.topicName}
                </h2>
              </div>

              {/* Quick Apply All for Topic */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Set all to:</span>
                <select
                  onChange={(e) => {
                    if (e.target.value) {
                      onSetAllForTopic(selectedTopicId, e.target.value);
                      e.target.value = '';
                    }
                  }}
                  defaultValue=""
                  className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200"
                >
                  <option value="" disabled>Choose Code...</option>
                  {privCodes.map(c => (
                    <option key={c.cdId || c.cdValue} value={c.cdValue}>
                      {c.cdLabel || c.cdValue}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Groups List */}
            <div className="space-y-3">
              {groups.map(grp => {
                const key = `${selectedTopicId}_${grp.grpId}`;
                const cell = matrix[key];
                const currentValue = cell?.privValueCd || 'NONE';

                return (
                  <div
                    key={grp.grpId}
                    className="p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-800 dark:text-slate-100">
                          {grp.grpName}
                        </span>
                        {grp.isCustom && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-300 border border-purple-200 font-medium">
                            Custom
                          </span>
                        )}
                      </div>
                      {grp.grpDescription && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {grp.grpDescription}
                        </p>
                      )}
                    </div>

                    <div className="w-full sm:w-48 shrink-0">
                      <CdSelect
                        tag="privValueCd"
                        value={currentValue}
                        onChange={(newVal) => onPrivilegeChange(selectedTopicId, grp.grpId, newVal)}
                        includeEmptyOption={false}
                        showDescriptionHelper={true}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
