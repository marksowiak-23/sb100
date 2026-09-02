/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, Search, Loader2, AlertCircle, RefreshCw, 
  Calendar, Users, DollarSign, Activity, Cpu, ArrowUpDown, 
  Download, CheckCircle, Clock, ShieldCheck, UserCheck, ChevronDown, BarChart3
} from 'lucide-react';
import { taskApi, mbrAiUsageLogApi, MbrAiUsageLog, resolveMediaUrl } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface MemberOption {
  mbrId: string;
  mbrFirstName: string;
  mbrLastName: string;
  mbrEmailAddress?: string;
  mbrProfilePic?: string;
}

interface PeriodAggregate {
  periodKey: string;
  periodLabel: string;
  startDate: Date;
  sessionCount: number;
  requestCount: number;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
  totalLatencyMs: number;
  successCount: number;
  errorCount: number;
}

export default function AdminUserAIUsageFeature({ isSandbox }: { isSandbox?: boolean }) {
  // Member Search & Selection State
  const [searchQuery, setSearchQuery] = useState('');
  const [membersList, setMembersList] = useState<MemberOption[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<MemberOption[]>([]);
  const [selectedMember, setSelectedMember] = useState<MemberOption | null>(null);
  const [isMemberDropdownOpen, setIsMemberDropdownOpen] = useState(false);
  const [membersLoading, setMembersLoading] = useState(false);

  // Usage Logs & Aggregations State
  const [usageLogs, setUsageLogs] = useState<MbrAiUsageLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'weekly' | 'monthly' | 'sessions'>('weekly');
  const [sortAsc, setSortAsc] = useState(false); // Newest first by default

  // Load initial members list
  useEffect(() => {
    let isMounted = true;
    const fetchMembers = async () => {
      setMembersLoading(true);
      try {
        const result = await taskApi.getMembers({ limit: 200 });
        if (isMounted && Array.isArray(result)) {
          const mapped: MemberOption[] = result.map((m: any) => ({
            mbrId: m.mbrId,
            mbrFirstName: m.mbrFirstName || 'Unnamed',
            mbrLastName: m.mbrLastName || 'Member',
            mbrEmailAddress: m.mbrEmailAddress || '',
            mbrProfilePic: m.mbrProfilePic || ''
          }));
          setMembersList(mapped);
          setFilteredMembers(mapped);
        }
      } catch (err: any) {
        console.warn("Failed to load members list for AI usage page:", err);
      } finally {
        if (isMounted) setMembersLoading(false);
      }
    };
    fetchMembers();
    return () => { isMounted = false; };
  }, []);

  // Filter members when search query changes
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredMembers(membersList);
      return;
    }
    const q = searchQuery.toLowerCase().trim();
    const matches = membersList.filter(m => 
      `${m.mbrFirstName} ${m.mbrLastName}`.toLowerCase().includes(q) ||
      (m.mbrEmailAddress && m.mbrEmailAddress.toLowerCase().includes(q)) ||
      m.mbrId.toLowerCase().includes(q)
    );
    setFilteredMembers(matches);
  }, [searchQuery, membersList]);

  // Fetch AI Usage Logs for selected member (or all members)
  const fetchUsageLogs = async () => {
    setLogsLoading(true);
    setErrorMessage(null);
    try {
      const logs = await mbrAiUsageLogApi.getUsageLogs({
        mbrId: selectedMember ? selectedMember.mbrId : undefined,
        limit: 1000
      });
      setUsageLogs(logs || []);
    } catch (err: any) {
      console.error("Failed to fetch AI usage logs:", err);
      setErrorMessage(`Failed to fetch AI usage logs: ${err.message || 'Unknown error'}`);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsageLogs();
  }, [selectedMember]);

  // Helper: Get ISO Week string & range label from date
  const getWeekInfo = (date: Date) => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    // Set to nearest Thursday: current date + 4 - current day number
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    const weekKey = `${d.getUTCFullYear()}-W${weekNo.toString().padStart(2, '0')}`;

    // Compute Monday start of week and Sunday end of week
    const mon = new Date(date);
    const day = mon.getDay();
    const diff = mon.getDate() - day + (day === 0 ? -6 : 1);
    mon.setDate(diff);
    const sun = new Date(mon);
    sun.setDate(mon.getDate() + 6);

    const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const label = `Week ${weekNo} (${mon.toLocaleDateString(undefined, formatOpts)} – ${sun.toLocaleDateString(undefined, formatOpts)}, ${mon.getFullYear()})`;
    return { weekKey, label, startDate: mon };
  };

  // Helper: Get Month string & label from date
  const getMonthInfo = (date: Date) => {
    const year = date.getFullYear();
    const monthIndex = date.getMonth();
    const monthKey = `${year}-${(monthIndex + 1).toString().padStart(2, '0')}`;
    const monthName = date.toLocaleString('default', { month: 'long' });
    const label = `${monthName} ${year}`;
    const startDate = new Date(year, monthIndex, 1);
    return { monthKey, label, startDate };
  };

  // Compute Weekly Aggregates
  const weeklyAggregates = useMemo<PeriodAggregate[]>(() => {
    const map = new Map<string, {
      periodLabel: string;
      startDate: Date;
      sessionIds: Set<string>;
      requestCount: number;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCostUsd: number;
      totalLatencyMs: number;
      successCount: number;
      errorCount: number;
    }>();

    usageLogs.forEach(log => {
      const dt = new Date(log.lastUsedAt || log.sessionDate || log.createdAt);
      if (isNaN(dt.getTime())) return;
      const { weekKey, label, startDate } = getWeekInfo(dt);

      if (!map.has(weekKey)) {
        map.set(weekKey, {
          periodLabel: label,
          startDate,
          sessionIds: new Set<string>(),
          requestCount: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
          totalLatencyMs: 0,
          successCount: 0,
          errorCount: 0
        });
      }

      const item = map.get(weekKey)!;
      if (log.sessionId) item.sessionIds.add(log.sessionId);
      item.requestCount += Number(log.requestCount || 0);
      item.promptTokens += Number(log.promptTokens || 0);
      item.completionTokens += Number(log.completionTokens || 0);
      item.totalTokens += Number(log.totalTokens || 0);
      item.estimatedCostUsd += Number(log.estimatedCostUsd || 0);
      item.totalLatencyMs += Number(log.totalLatencyMs || 0);
      item.successCount += Number(log.successCount || 0);
      item.errorCount += Number(log.errorCount || 0);
    });

    const result: PeriodAggregate[] = Array.from(map.entries()).map(([key, data]) => ({
      periodKey: key,
      periodLabel: data.periodLabel,
      startDate: data.startDate,
      sessionCount: data.sessionIds.size,
      requestCount: data.requestCount,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      estimatedCostUsd: data.estimatedCostUsd,
      totalLatencyMs: data.totalLatencyMs,
      successCount: data.successCount,
      errorCount: data.errorCount
    }));

    result.sort((a, b) => sortAsc 
      ? a.startDate.getTime() - b.startDate.getTime() 
      : b.startDate.getTime() - a.startDate.getTime()
    );

    return result;
  }, [usageLogs, sortAsc]);

  // Compute Monthly Aggregates
  const monthlyAggregates = useMemo<PeriodAggregate[]>(() => {
    const map = new Map<string, {
      periodLabel: string;
      startDate: Date;
      sessionIds: Set<string>;
      requestCount: number;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
      estimatedCostUsd: number;
      totalLatencyMs: number;
      successCount: number;
      errorCount: number;
    }>();

    usageLogs.forEach(log => {
      const dt = new Date(log.lastUsedAt || log.sessionDate || log.createdAt);
      if (isNaN(dt.getTime())) return;
      const { monthKey, label, startDate } = getMonthInfo(dt);

      if (!map.has(monthKey)) {
        map.set(monthKey, {
          periodLabel: label,
          startDate,
          sessionIds: new Set<string>(),
          requestCount: 0,
          promptTokens: 0,
          completionTokens: 0,
          totalTokens: 0,
          estimatedCostUsd: 0,
          totalLatencyMs: 0,
          successCount: 0,
          errorCount: 0
        });
      }

      const item = map.get(monthKey)!;
      if (log.sessionId) item.sessionIds.add(log.sessionId);
      item.requestCount += Number(log.requestCount || 0);
      item.promptTokens += Number(log.promptTokens || 0);
      item.completionTokens += Number(log.completionTokens || 0);
      item.totalTokens += Number(log.totalTokens || 0);
      item.estimatedCostUsd += Number(log.estimatedCostUsd || 0);
      item.totalLatencyMs += Number(log.totalLatencyMs || 0);
      item.successCount += Number(log.successCount || 0);
      item.errorCount += Number(log.errorCount || 0);
    });

    const result: PeriodAggregate[] = Array.from(map.entries()).map(([key, data]) => ({
      periodKey: key,
      periodLabel: data.periodLabel,
      startDate: data.startDate,
      sessionCount: data.sessionIds.size,
      requestCount: data.requestCount,
      promptTokens: data.promptTokens,
      completionTokens: data.completionTokens,
      totalTokens: data.totalTokens,
      estimatedCostUsd: data.estimatedCostUsd,
      totalLatencyMs: data.totalLatencyMs,
      successCount: data.successCount,
      errorCount: data.errorCount
    }));

    result.sort((a, b) => sortAsc 
      ? a.startDate.getTime() - b.startDate.getTime() 
      : b.startDate.getTime() - a.startDate.getTime()
    );

    return result;
  }, [usageLogs, sortAsc]);

  // Compute Grand Totals
  const grandTotals = useMemo(() => {
    const uniqueSessions = new Set<string>();
    let totalReq = 0;
    let promptTok = 0;
    let compTok = 0;
    let totalTok = 0;
    let totalCost = 0;
    let latencySum = 0;
    let success = 0;
    let errors = 0;

    usageLogs.forEach(l => {
      if (l.sessionId) uniqueSessions.add(l.sessionId);
      totalReq += Number(l.requestCount || 0);
      promptTok += Number(l.promptTokens || 0);
      compTok += Number(l.completionTokens || 0);
      totalTok += Number(l.totalTokens || 0);
      totalCost += Number(l.estimatedCostUsd || 0);
      latencySum += Number(l.totalLatencyMs || 0);
      success += Number(l.successCount || 0);
      errors += Number(l.errorCount || 0);
    });

    const avgLatency = totalReq > 0 ? Math.round(latencySum / totalReq) : 0;

    return {
      sessionCount: uniqueSessions.size,
      requestCount: totalReq,
      promptTokens: promptTok,
      completionTokens: compTok,
      totalTokens: totalTok,
      estimatedCostUsd: totalCost,
      avgLatencyMs: avgLatency,
      successCount: success,
      errorCount: errors
    };
  }, [usageLogs]);

  // CSV Export
  const exportToCsv = () => {
    const isWeekly = activeView === 'weekly';
    const data = isWeekly ? weeklyAggregates : monthlyAggregates;
    const headers = [isWeekly ? 'Week' : 'Month', 'Session Cnt', 'Request Count', 'Prompt Tokens', 'Completion Tokens', 'Total Tokens', 'Estimated Cost ($)'];
    
    const rows = data.map(d => [
      `"${d.periodLabel}"`,
      d.sessionCount,
      d.requestCount,
      d.promptTokens,
      d.completionTokens,
      d.totalTokens,
      d.estimatedCostUsd.toFixed(6)
    ]);

    // Grand total row
    rows.push([
      '"GRAND TOTAL"',
      grandTotals.sessionCount,
      grandTotals.requestCount,
      grandTotals.promptTokens,
      grandTotals.completionTokens,
      grandTotals.totalTokens,
      grandTotals.estimatedCostUsd.toFixed(6)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ai_usage_${selectedMember ? `${selectedMember.mbrLastName}_` : 'all_'}${activeView}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const activeData = activeView === 'weekly' ? weeklyAggregates : monthlyAggregates;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* Page Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-blue-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="p-3.5 bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-2xl shadow-sm">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-black text-slate-900 dark:text-white tracking-tight">
                AI Utilization & Token Analytics
              </h1>
              <span className="px-2.5 py-0.5 text-[10.5px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800/60 rounded-full">
                Administration
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-sans mt-1 max-w-2xl">
              Track, audit, and forecast StoryMate AI token usage, member session counts, and LLM compute costs aggregated by week and month.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 relative z-10 shrink-0">
          <button
            onClick={fetchUsageLogs}
            disabled={logsLoading}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl transition-all cursor-pointer disabled:opacity-50"
            title="Refresh AI Usage Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin text-amber-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportToCsv}
            disabled={activeData.length === 0}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs hover:shadow-sm transition-all cursor-pointer disabled:opacity-50"
            title="Export Grid to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Member Search & Selector Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs relative z-30">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* Member Search Input & Dropdown */}
          <div className="flex-1 relative">
            <label className="block text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">
              Member Filter
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsMemberDropdownOpen(true);
                }}
                onFocus={() => setIsMemberDropdownOpen(true)}
                placeholder="Search member by first name, last name, or email..."
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all font-sans"
              />
              <button
                type="button"
                onClick={() => setIsMemberDropdownOpen(!isMemberDropdownOpen)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </div>

            {/* Dropdown Menu */}
            {isMemberDropdownOpen && (
              <div 
                className="absolute top-full left-0 right-0 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl max-h-72 overflow-y-auto z-50 p-1.5 divide-y divide-slate-100 dark:divide-slate-700/60"
              >
                {/* Option: All Members */}
                <div
                  onClick={() => {
                    setSelectedMember(null);
                    setSearchQuery('');
                    setIsMemberDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                    selectedMember === null
                      ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">All Members (System Grand Aggregate)</div>
                      <div className="text-[10px] text-slate-400">View combined totals across all users</div>
                    </div>
                  </div>
                  {selectedMember === null && <CheckCircle className="w-4 h-4 text-amber-600" />}
                </div>

                {/* Member Results */}
                {filteredMembers.map(m => {
                  const isSelected = selectedMember?.mbrId === m.mbrId;
                  const profileUrl = m.mbrProfilePic ? resolveMediaUrl(m.mbrProfilePic) : null;
                  return (
                    <div
                      key={m.mbrId}
                      onClick={() => {
                        setSelectedMember(m);
                        setSearchQuery(`${m.mbrFirstName} ${m.mbrLastName}`);
                        setIsMemberDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 font-bold'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {profileUrl ? (
                          <img 
                            src={profileUrl} 
                            alt={m.mbrFirstName} 
                            className="w-7 h-7 rounded-full object-cover border border-slate-200 shrink-0" 
                          />
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {m.mbrFirstName.charAt(0)}
                          </div>
                        )}
                        <div className="truncate">
                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                            {m.mbrFirstName} {m.mbrLastName}
                          </div>
                          <div className="text-[10.5px] text-slate-400 truncate">
                            {m.mbrEmailAddress || `ID: ${m.mbrId.substring(0, 8)}...`}
                          </div>
                        </div>
                      </div>
                      {isSelected && <CheckCircle className="w-4 h-4 text-amber-600 shrink-0" />}
                    </div>
                  );
                })}

                {filteredMembers.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No matching members found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Active Selection Badge */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 rounded-xl px-4 py-2.5 shrink-0 self-end lg:self-auto">
            {selectedMember ? (
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-4 h-4 text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    {selectedMember.mbrFirstName} {selectedMember.mbrLastName}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {selectedMember.mbrId}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedMember(null);
                    setSearchQuery('');
                  }}
                  className="ml-2 text-xs text-slate-400 hover:text-rose-500 font-semibold underline cursor-pointer"
                >
                  Clear
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
                <Users className="w-4 h-4 text-amber-500" />
                <span>Showing All Active Member Sessions</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* KPI Metric Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Sessions */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Sessions</span>
            <Activity className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {grandTotals.sessionCount.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 font-sans">
            Logged-in member visits
          </div>
        </div>

        {/* Total Requests */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">AI Requests</span>
            <Cpu className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {grandTotals.requestCount.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-emerald-600 dark:text-emerald-400 mt-1 font-semibold">
            {grandTotals.successCount} successful ({grandTotals.requestCount > 0 ? Math.round((grandTotals.successCount / grandTotals.requestCount) * 100) : 100}%)
          </div>
        </div>

        {/* Total Tokens */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Tokens</span>
            <Sparkles className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {grandTotals.totalTokens.toLocaleString()}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 font-sans truncate">
            {grandTotals.promptTokens.toLocaleString()} in / {grandTotals.completionTokens.toLocaleString()} out
          </div>
        </div>

        {/* Estimated Cost */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Est. Cost (USD)</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-emerald-600 dark:text-emerald-400">
            ${grandTotals.estimatedCostUsd.toFixed(4)}
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 font-sans">
            Gemini 2.5 Flash rate
          </div>
        </div>

        {/* Avg Latency */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider">Avg Latency</span>
            <Clock className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="text-xl sm:text-2xl font-serif font-black text-slate-900 dark:text-white">
            {grandTotals.avgLatencyMs.toLocaleString()} <span className="text-xs font-sans font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[10.5px] text-slate-400 mt-1 font-sans">
            Per AI turn duration
          </div>
        </div>
      </div>

      {/* Main Aggregates Grid Section */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
        {/* Table Controls / View Tabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveView('weekly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'weekly'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Weekly Totals
              </button>
              <button
                type="button"
                onClick={() => setActiveView('monthly')}
                className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeView === 'monthly'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Monthly Totals
              </button>
            </div>
            <span className="text-xs text-slate-400 font-sans hidden md:inline">
              ({activeData.length} {activeView === 'weekly' ? 'weeks' : 'months'} recorded)
            </span>
          </div>

          {/* Sort Order Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 rounded-xl hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>{sortAsc ? 'Oldest First' : 'Newest First'}</span>
            </button>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="m-4 p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl flex items-center gap-3 text-rose-800 dark:text-rose-300 text-xs font-medium">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Grid Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-sans">
                <th className="py-3.5 px-5 min-w-[180px]">
                  {activeView === 'weekly' ? 'Week Period' : 'Month Period'}
                </th>
                <th className="py-3.5 px-4 text-right">Session Cnt</th>
                <th className="py-3.5 px-4 text-right">Request Count</th>
                <th className="py-3.5 px-4 text-right">Prompt Tokens</th>
                <th className="py-3.5 px-4 text-right">Completion Tokens</th>
                <th className="py-3.5 px-4 text-right font-bold text-slate-800 dark:text-slate-200">Total Tokens</th>
                <th className="py-3.5 px-5 text-right font-bold text-emerald-700 dark:text-emerald-400">Estimated Cost (USD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs font-sans">
              {logsLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    <span>Aggregating AI token usage metrics...</span>
                  </td>
                </tr>
              ) : activeData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-2 text-slate-300">
                      <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-semibold text-slate-700 dark:text-slate-300">No AI usage activity found</div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {selectedMember ? `No StoryMate AI sessions recorded for ${selectedMember.mbrFirstName}.` : 'No member AI sessions recorded yet.'}
                    </div>
                  </td>
                </tr>
              ) : (
                activeData.map((row, idx) => (
                  <tr 
                    key={row.periodKey} 
                    className="hover:bg-amber-50/30 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-medium text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{row.periodLabel}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {row.sessionCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                      {row.requestCount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {row.promptTokens.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-slate-500 dark:text-slate-400">
                      {row.completionTokens.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                      {row.totalTokens.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ${row.estimatedCostUsd.toFixed(6)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Sticky Grand Total Footer Row */}
            {activeData.length > 0 && (
              <tfoot>
                <tr className="bg-slate-100/90 dark:bg-slate-800 border-t-2 border-slate-300 dark:border-slate-700 text-xs font-bold font-sans">
                  <td className="py-4 px-5 text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-500" />
                    <span>Grand Total</span>
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-white">
                    {grandTotals.sessionCount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-900 dark:text-white">
                    {grandTotals.requestCount.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {grandTotals.promptTokens.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-slate-700 dark:text-slate-300">
                    {grandTotals.completionTokens.toLocaleString()}
                  </td>
                  <td className="py-4 px-4 text-right font-mono text-amber-700 dark:text-amber-300 text-sm">
                    {grandTotals.totalTokens.toLocaleString()}
                  </td>
                  <td className="py-4 px-5 text-right font-mono text-emerald-600 dark:text-emerald-300 text-sm">
                    ${grandTotals.estimatedCostUsd.toFixed(6)}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <AdminComponentTag name="AdminUserAIUsageFeature" />
    </div>
  );
}
