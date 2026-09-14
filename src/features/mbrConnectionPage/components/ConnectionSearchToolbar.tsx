import React from 'react';
import { Search, Filter, Printer, ChevronDown } from 'lucide-react';
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

      {/* Group Filter Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5 flex-wrap">
          <label htmlFor="connection-group-filter" className="text-xs font-serif font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-500" />
            <span>Filter by Group:</span>
          </label>
          <div className="relative min-w-[200px] sm:min-w-[220px]">
            <select
              id="connection-group-filter"
              value={groupFilter}
              onChange={(e) => onGroupFilterChange(e.target.value as ConnectionFilterType)}
              className="w-full appearance-none pl-3.5 pr-9 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-serif font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all cursor-pointer shadow-2xs"
            >
              <option value="ALL">All Connections ({totalMembers})</option>
              {groups
                .filter(grp => grp.grpName.toLowerCase() !== 'public')
                .map(grp => (
                  <option key={grp.grpId} value={grp.grpId}>
                    {grp.grpName}
                  </option>
                ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {groupFilter !== 'ALL' && groupFilter !== 'ASSIGNED' && (
          <button
            type="button"
            onClick={() => onGroupFilterChange('ALL')}
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-serif font-medium self-start sm:self-auto cursor-pointer"
          >
            Clear filter
          </button>
        )}
      </div>
    </div>
  );
}

