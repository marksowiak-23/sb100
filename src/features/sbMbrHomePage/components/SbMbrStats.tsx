/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { BarChart3, BookOpen, Eye, Calendar, Loader2 } from 'lucide-react';
import { taskApi, mbrStatApi, MbrStat } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

const formatPublishedDate = (dateStr?: string | null) => {
  if (!dateStr) return 'No stories yet';
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length === 3) {
    const year = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1;
    const day = parseInt(parts[2], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    }
  }
  return dateStr;
};

export default function SbMbrStats() {
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
            statLastPublishedDt: null
          });
        }
      } catch (err: any) {
        // Fallback default state
        setStat({
          statId: 'default-stat',
          mbrId: resolvedMbrId,
          statStoriesPublishedCnt: 0,
          statStoriesViewedCnt: 0,
          statLastPublishedDt: null
        });
      }
    } catch (err) {
      console.error("Failed to load member stats in SbMbrStats:", err);
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

  const publishedCount = stat?.statStoriesPublishedCnt ?? 0;
  const viewedCount = stat?.statStoriesViewedCnt ?? 0;
  const lastPublishedFormatted = formatPublishedDate(stat?.statLastPublishedDt);

  return (
    <div id="sb-mbr-stats-panel" className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      {/* Header bar */}
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <BarChart3 className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          My Storybook Statistics
        </h3>
      </div>


      {loading ? (
        <div className="flex flex-col items-center justify-center py-6 text-slate-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-slate-500" />
          <span className="text-[11px] font-medium">Loading statistics...</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* 2-Column KPI grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* KPI 1: Stories Published */}
            <div className="bg-slate-50/80 border border-[#EFECE7] rounded-2xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Published
                </span>
                <div className="p-1.5 rounded-lg bg-blue-50 text-blue-700">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-slate-800 leading-tight">
                {publishedCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {publishedCount === 1 ? 'Story' : 'Stories'}
              </span>
            </div>

            {/* KPI 2: Stories Viewed */}
            <div className="bg-slate-50/80 border border-[#EFECE7] rounded-2xl p-3 flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Views
                </span>
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                  <Eye className="w-3.5 h-3.5" />
                </div>
              </div>
              <span className="font-mono text-lg font-bold text-slate-800 leading-tight">
                {viewedCount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {viewedCount === 1 ? 'Total View' : 'Total Views'}
              </span>
            </div>
          </div>

          {/* Last Published Date Banner */}
          <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-50/60 border border-[#EFECE7] rounded-2xl">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1 rounded-md bg-amber-50 text-amber-700 shrink-0">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <div className="min-w-0">
                <span className="block text-[9.5px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Last Published
                </span>
                <span className="block text-xs font-serif font-bold text-slate-800 truncate">
                  {lastPublishedFormatted}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <AdminComponentTag name="sbMbrStats" />
    </div>
  );
}
