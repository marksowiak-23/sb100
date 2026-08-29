import React from 'react';
import { Search, HelpCircle, Users, MapPin, RotateCw } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface SbPublicSearchCardProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  userLocation?: UserLocation | null;
  onRefreshLocation?: () => void;
}

export default function SbPublicSearchCard({
  searchQuery,
  setSearchQuery,
  userLocation,
  onRefreshLocation
}: SbPublicSearchCardProps) {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] space-y-4 relative">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400 shrink-0" />
          <h3 className="text-xs font-mono font-bold text-slate-450 uppercase tracking-wider">
            Find a Member
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {userLocation && (
            <div className="flex items-center gap-1 text-[11px] font-sans font-medium text-slate-500 bg-slate-100/80 border border-slate-200/60 px-2.5 py-0.5 rounded-full">
              <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
              <span>{userLocation.label}</span>
              {onRefreshLocation && (
                <button
                  type="button"
                  onClick={onRefreshLocation}
                  title="Detect/Refresh current location"
                  className="ml-1 text-slate-400 hover:text-slate-700 cursor-pointer transition-colors"
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
            className="w-full bg-slate-50/70 hover:bg-slate-50 focus:bg-white text-slate-800 placeholder-slate-400 text-xs md:text-sm rounded-2xl border border-[#EFECE7] outline-none py-3.5 pl-11 pr-4 transition-all duration-150 shadow-sm focus:border-slate-800 focus:ring-1 focus:ring-slate-800"
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

      {userLocation && (
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-serif">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Proximity mode active: Prioritizing members near <strong>{userLocation.label}</strong>, ordered by newest published stories.</span>
        </div>
      )}

      <AdminComponentTag name="SbPublicSearchCard" />
    </div>
  );
}
