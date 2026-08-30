/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Compass, CheckCircle2, Circle } from 'lucide-react';
import { taskApi, mbrStatApi, MbrStat } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMyStorybookStatusCardProps {
  onClickAuthorPage?: () => void;
}

export default function SbMyStorybookStatusCard({ onClickAuthorPage }: SbMyStorybookStatusCardProps) {
  const [stat, setStat] = useState<MbrStat | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadStats = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Resolve logged-in member ID
      let resolvedMbrId: string | null = null;
      const storedMbr = sessionStorage.getItem('sb_current_mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed.mbrId) resolvedMbrId = parsed.mbrId;
        } catch {}
      }

      if (!resolvedMbrId) {
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            if (u.user_id) {
              const mbrProfile = await taskApi.getMemberByUserId(u.user_id);
              if (mbrProfile && mbrProfile.mbrId) {
                resolvedMbrId = mbrProfile.mbrId;
              }
            }
          } catch (e) {}
        }
      }

      if (!resolvedMbrId) {
        resolvedMbrId = 'e20986fa-0fb9-4081-ae5d-35bc8f504df0'; // Eleanor Hartwell fallback
      }

      // 2. Fetch member stat record
      try {
        const memberStat = await mbrStatApi.getMemberStatByMbrId(resolvedMbrId);
        if (memberStat) {
          setStat(memberStat);
        } else {
          setStat({
            statId: 'default-stat',
            mbrId: resolvedMbrId,
            statStoriesPublishedCnt: 0,
            statStoriesViewedCnt: 0,
            statFamilyStoryCnt: 0,
            statResidenceCnt: 0,
            statActivityCnt: 0,
            statAchievementsCnt: 0,
            statEducationCnt: 0,
            statEmploymentCnt: 0,
            statLastPublishedDt: null
          });
        }
      } catch (err: any) {
        setStat({
          statId: 'default-stat',
          mbrId: resolvedMbrId,
          statStoriesPublishedCnt: 0,
          statStoriesViewedCnt: 0,
          statFamilyStoryCnt: 0,
          statResidenceCnt: 0,
          statActivityCnt: 0,
          statAchievementsCnt: 0,
          statEducationCnt: 0,
          statEmploymentCnt: 0,
          statLastPublishedDt: null
        });
      }
    } catch (err) {
      console.error("Failed to load member stats in SbMyStorybookStatusCard:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();

    const handleUpdate = () => {
      loadStats();
    };

    window.addEventListener('stats-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener('stats-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [loadStats]);

  const statusItems = [
    { name: 'Achievements', count: stat?.statAchievementsCnt ?? 0 },
    { name: 'Activities and Hobbies', count: stat?.statActivityCnt ?? 0 },
    { name: 'Education and Training', count: stat?.statEducationCnt ?? 0 },
    { name: 'Employment and Career', count: stat?.statEmploymentCnt ?? 0 },
    { name: 'Family', count: stat?.statFamilyStoryCnt ?? 0 },
    { name: 'Residencies', count: stat?.statResidenceCnt ?? 0 }
  ];

  const completedCount = statusItems.filter((i) => i.count > 0).length;
  const progressPercent = Math.round((completedCount / statusItems.length) * 100);

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <Compass className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          My Storybook Status
        </h3>
      </div>

      {/* Completion Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-serif">
          <span>Progress Indicator</span>
          <span className="text-slate-800">{progressPercent}%</span>
        </div>
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-[#EFECE7]">
          <div
            className="h-full bg-gradient-to-r from-slate-700 to-slate-850 transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Categories checklist - single column in alphabetical order */}
      <div className="flex flex-col gap-2.5 pt-1">
        {statusItems.map((item) => {
          const count = item.count;
          const isCompleted = count > 0;
          return (
            <div key={item.name} className="flex items-center gap-2 text-xs text-slate-700 min-w-0" title={`${item.name} (${count})`}>
              {isCompleted ? (
                <CheckCircle2 className="w-4 h-4 text-slate-700 shrink-0" />
              ) : (
                <Circle className="w-4 h-4 text-slate-300 shrink-0" />
              )}
              <span className="font-serif leading-none truncate">
                {item.name} <span className="font-sans text-[11px] font-semibold text-slate-500">({count})</span>
              </span>
            </div>
          );
        })}
      </div>

      {/* Link button to sbMbrAuthorPage */}
      <button
        onClick={onClickAuthorPage}
        className="w-full mt-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold font-serif transition-colors cursor-pointer text-center shadow-sm"
      >
        Go to Author Workspace
      </button>

      <AdminComponentTag name="SbMyStorybookStatusCard" />
    </div>
  );
}
