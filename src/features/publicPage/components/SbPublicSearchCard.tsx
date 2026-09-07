import React from 'react';
import { Search, HelpCircle, Users, MapPin, RotateCw } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface SbPublicSearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userLocation?: UserLocation | null;
  proximityEnabled?: boolean;
  setProximityEnabled?: (val: boolean) => void;
  onRefreshLocation?: () => void;
}

export default function SbPublicSearchCard({
  searchQuery,
  setSearchQuery,
  userLocation,
  proximityEnabled = true,
  setProximityEnabled,
  onRefreshLocation
}: SbPublicSearchCardProps) {
  return (
    <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] space-y-3.5 sm:space-y-4 relative">
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Find a Member
          </h3>
        </div>

        <div className="flex items-center gap-2">
          {userLocation && (
            <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700 px-2.5 py-0.5 rounded-full max-w-[170px] sm:max-w-none">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span className="truncate">{userLocation.label}</span>
              {onRefreshLocation && (
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  title="Detect/Refresh current location"
                  className="ml-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition-colors shrink-0"
                >
                  <RotateCw className="w-2.5 h-2.5" />
                </button>
              )}
            </div>
          )}
          <HelpCircle
            className="w-4 h-4 text-slate-350 dark:text-slate-500 cursor-pointer hover:text-slate-400 dark:hover:text-slate-300 transition-colors shrink-0"
            title="Search by name, location, or tag (prioritizes proximity & recent published stories)"
          />
        </div>
      </div>

      {/* Search Input and Button Form */}
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2">
        <div className="relative flex-grow min-w-0">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, location, tags..."
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white dark:bg-slate-800 dark:hover:bg-slate-800/90 dark:focus:bg-slate-800 text-slate-800 dark:text-white placeholder-slate-400 text-xs sm:text-sm rounded-xl sm:rounded-2xl border border-[#EFECE7] dark:border-slate-700 outline-none py-3 sm:py-3.5 pl-10 sm:pl-11 pr-3 sm:pr-4 transition-all duration-150 shadow-sm focus:border-slate-800 dark:focus:border-slate-500 focus:ring-1 focus:ring-slate-800 dark:focus:ring-slate-500"
          />
          <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 shrink-0" />
        </div>
        <button
          type="submit"
          className="px-4 sm:px-5 py-3 sm:py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold rounded-xl sm:rounded-2xl border border-blue-600 cursor-pointer shadow-sm transition-all duration-150 shrink-0"
        >
          Search
        </button>
      </form>

      {/* Proximity Checkbox & Status Row (Mobile-Optimized) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-1 border-t border-slate-100 dark:border-slate-800/80">
        <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
          <input
            type="checkbox"
            checked={Boolean(userLocation && proximityEnabled)}
            disabled={!userLocation}
            onChange={(e) => {
              if (setProximityEnabled) {
                setProximityEnabled(e.target.checked);
              }
              if (!userLocation && onRefreshLocation) {
                onRefreshLocation();
              }
            }}
            className="w-4 h-4 rounded-md border-[#D8D4CE] dark:border-slate-700 text-blue-600 focus:ring-blue-500/20 focus:ring-2 cursor-pointer transition-all accent-blue-600 disabled:opacity-50"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            <MapPin className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 group-hover:text-rose-600 transition-colors shrink-0" />
            <span className="text-xs font-serif font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
              Prioritize Near Me
            </span>
            {userLocation?.label && (
              <span className="text-[11px] font-sans text-slate-500 dark:text-slate-400">
                ({userLocation.label})
              </span>
            )}
          </div>
        </label>

        {userLocation && proximityEnabled ? (
          <span className="text-[11px] font-sans font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span>Nearby members first</span>
          </span>
        ) : (
          <span className="text-[11px] font-sans text-slate-400 dark:text-slate-500 self-start sm:self-auto">
            {userLocation ? 'Showing all members globally' : 'Location not detected'}
          </span>
        )}
      </div>

      <AdminComponentTag name="SbPublicSearchCard" />
    </div>
  );
}
