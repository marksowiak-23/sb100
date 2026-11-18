/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  TrendingDown, 
  TrendingUp, 
  Calendar, 
  Clock, 
  Sparkles,
  Download
} from 'lucide-react';
import { MbrAcctActivity } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AccountLedgerPanelProps {
  activities: MbrAcctActivity[];
  onDownloadStatement?: () => void;
}

export default function AccountLedgerPanel({
  activities,
  onDownloadStatement
}: AccountLedgerPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'SUB' | 'ADD'>('all');

  const filteredActivities = activities.filter((act) => {
    if (filterType !== 'all') {
      const isSub = (act.creditDelta ?? act.creditAmount ?? 0) < 0 || act.mbrAcctActivityDirectionCd === 'SUB';
      if (filterType === 'SUB' && !isSub) return false;
      if (filterType === 'ADD' && isSub) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const code = (act.mbrAcctActivityTypeCd || '').toLowerCase();
      const desc = (act.mbrAcctActivityDesc || '').toLowerCase();
      return code.includes(q) || desc.includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-4 py-1">
      <AdminComponentTag name="AccountLedgerPanel.tsx" />

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All Activity ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('SUB')}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
              filterType === 'SUB'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Debits (Used)
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ADD')}
            className={`px-3 py-1 rounded-lg text-xs font-serif font-bold transition-all cursor-pointer ${
              filterType === 'ADD'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-2xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Credits (Earned / Bought)
          </button>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search transactions..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-serif rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-2xs">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-1">
            <p className="font-serif text-sm">No transaction activity found</p>
            <p className="text-[11px] font-sans">Activities will record here when you use or purchase credits</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 font-serif font-bold text-slate-600 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Date &amp; Time</th>
                  <th className="py-3 px-4">Event Type</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-serif text-slate-700 dark:text-slate-300">
                {filteredActivities.map((act) => {
                  const delta = act.creditDelta ?? (act.mbrAcctActivityDirectionCd === 'SUB' ? -Math.abs(act.creditAmount) : act.creditAmount);
                  const isDebit = delta < 0 || act.mbrAcctActivityDirectionCd === 'SUB';
                  const dateStr = act.mbrAcctActivityCreatedAt;
                  return (
                    <tr key={act.mbrAcctActivityId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {dateStr
                          ? new Date(dateStr).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            })
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {act.mbrAcctActivityTypeCd}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400 max-w-xs truncate">
                        {act.mbrAcctActivityDesc || 'Event execution'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold whitespace-nowrap">
                        <span className={isDebit ? 'text-amber-700 dark:text-amber-400' : 'text-emerald-700 dark:text-emerald-400'}>
                          {delta > 0 ? `+${delta.toLocaleString()}` : delta.toLocaleString()} cr
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap">
                        {(act.balanceAfter ?? 0).toLocaleString()} cr
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
