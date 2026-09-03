import React from 'react';
import { Search, HelpCircle, Users, MapPin, RotateCw } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface SbMbrSearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  connectionsOnly?: boolean;
  setConnectionsOnly?: (val: boolean) => void;
  connectedCount?: number;
  userLocation?: UserLocation | null;
  onRefreshLocation?: () => void;
}

export default function SbMbrSearchCard({
  searchQuery,
  setSearchQuery,
  connectionsOnly = false,
  setConnectionsOnly,
  connectedCount,
  userLocation,
  onRefreshLocation
}: SbMbrSearchCardProps) {
  return (
    <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-xs font-mono font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">
            Find a Member
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {userLocation && (
            <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2.5 py-0.5 rounded-full">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{userLocation.label}</span>
              {onRefreshLocation && (
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  title="Detect/Refresh current location"
                  className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
          <HelpCircle
            className="w-4 h-4 text-slate-350 cursor-pointer hover:text-slate-400 transition-colors"
            title="Search by name, location, or tag (prioritizes proximity & recent published stories)"
          />
        </div>
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, tags..."
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/90 dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-xs md:text-sm rounded-2xl border border-[#EFECE7] dark:border-slate-700 outline-none py-3.5 pl-11 pr-4 transition-all duration-150 shadow-sm focus:border-slate-800 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-800 dark:focus:ring-slate-500"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        </div>
        <button
          type="submit"
          className="px-5 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs md:text-sm font-semibold rounded-2xl border border-blue-600 cursor-pointer shadow-sm transition-all duration-150 shrink-0"
        >
          Search
        </button>
      </form>

      {/* Connection Filter Option & Location Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-0.5">
        <label className="inline-flex items-center gap-2.5 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={connectionsOnly}
            onChange={(e) => setConnectionsOnly?.(e.target.checked)}
            className="w-4 h-4 rounded-md border-[#D8D4CE] dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 focus:ring-2 cursor-pointer transition-all accent-blue-600"
          />
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors" />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              My Connections Only
            </span>
            {typeof connectedCount === 'number' && connectedCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/80 rounded-full">
                {connectedCount}
              </span>
            )}
          </div>
        </label>

        {connectionsOnly && (
          <span className="text-[11px] font-sans font-semibold text-blue-600 dark:text-blue-400 bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            Showing connected members only
          </span>
        )}

      </div>

      {userLocation && !connectionsOnly && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-serif">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Proximity mode active: Prioritizing members near <strong>{userLocation.label}</strong>, ordered by newest published stories.</span>
        </div>
      )}

      <AdminComponentTag name="SbMbrSearchCard" />
    </div>
  );
}

