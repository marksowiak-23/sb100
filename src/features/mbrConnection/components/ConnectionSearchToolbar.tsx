import React from 'react';
import { Search, Filter, Printer } from 'lucide-react';
import { UnifiedGroupOption, ConnectionFilterType } from '../types';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface ConnectionSearchToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  groupFilter: ConnectionFilterType;
  onGroupFilterChange: (filter: ConnectionFilterType) => void;
  groups: UnifiedGroupOption[];
  totalMembers: number;
  assignedCount: number;
  onPrintPdf?: () => void;
}

export default function ConnectionSearchToolbar({
  searchQuery,
  onSearchChange,
  groupFilter,
  onGroupFilterChange,
  groups,
  totalMembers,
  assignedCount,
  onPrintPdf
}: ConnectionSearchToolbarProps) {
  const unassignedCount = totalMembers - assignedCount;

  return (
    <div className="relative bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-6 space-y-4">
      <AdminComponentTag name="ConnectionSearchToolbar.tsx" />

      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Box */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search members by name or location..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Counts overview and Print PDF */}
        <div className="flex items-center gap-4 flex-wrap justify-end">
          <div className="flex items-center gap-3 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <span>Connections: <strong className="text-slate-800 dark:text-slate-200">{totalMembers}</strong></span>
          </div>

          {onPrintPdf && (
            <button
              type="button"
              onClick={onPrintPdf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 shadow-2xs hover:shadow-xs transition-all cursor-pointer group shrink-0"
              title="Generate and download a PDF report based on current filter"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
              <span>Print PDF</span>
            </button>
          )}
        </div>
      </div>

      {/* Group Filter Chips */}
      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        <span className="text-slate-400 font-semibold mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Filter:
        </span>
        <button
          type="button"
          onClick={() => onGroupFilterChange('ALL')}
          className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
            groupFilter === 'ALL' || groupFilter === 'ASSIGNED'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          All Connections
        </button>

        {groups
          .filter(grp => grp.grpName.toLowerCase() !== 'public')
          .map(grp => (
            <button
              key={grp.grpId}
              type="button"
              onClick={() => onGroupFilterChange(grp.grpId)}
              className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
                groupFilter === grp.grpId
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {grp.grpName}
            </button>
          ))}
      </div>
    </div>
  );
}
