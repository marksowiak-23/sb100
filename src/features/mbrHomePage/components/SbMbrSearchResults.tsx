import React from 'react';
import { Info, Loader2, ChevronDown } from 'lucide-react';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface SbMbrSearchResultsProps {
  searchQuery: string;
  connectionsOnly?: boolean;
  members: any[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  connectionsMap?: Map<string, { isConnected: boolean; grpName?: string }>;
  viewerMbrId?: string | null;
  onLoadMore?: () => void;
  onClickReadStory?: (memberId: string) => void;
  userLocation?: UserLocation | null;
}

export default function SbMbrSearchResults({
  searchQuery,
  connectionsOnly = false,
  members,
  loading = false,
  loadingMore = false,
  hasMore = false,
  connectionsMap,
  viewerMbrId,
  onLoadMore,
  onClickReadStory,
  userLocation
}: SbMbrSearchResultsProps) {
  const uniqueMembers = Array.from(new Map(members.map(m => [m.mbrId || m.id, m])).values())
    .filter(m => {
      const targetId = m.mbrId || m.id;
      // Do not show the logged-in member's profile
      if (viewerMbrId && targetId === viewerMbrId) {
        return false;
      }
      if (m.mbrSettings) return m.mbrSettings.mbrSettingsAllowPublicFlag === true;
      if (m.mbrSettingsAllowPublicFlag !== undefined) return m.mbrSettingsAllowPublicFlag === true;
      return true;
    });

  return (
    <div className="space-y-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2 gap-1">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            <span>
              {connectionsOnly
                ? searchQuery.trim() ? 'Connected Member Search Results' : 'My Connected Members'
                : searchQuery.trim() ? 'Search Results' : 'Community Members'}
            </span>
          </h3>
          <p className="text-[11px] text-slate-400 font-serif">
            {connectionsOnly
              ? 'Showing only members from your personal and group connections'
              : userLocation && !searchQuery
                ? `Nearby in ${userLocation.label} • Sorted by most recent published date`
                : 'Sorted by most recent published date'}
          </p>
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {loading 
            ? 'Searching...' 
            : `Showing ${uniqueMembers.length} member${uniqueMembers.length === 1 ? '' : 's'}`
          }
        </span>
      </div>

      {loading ? (
        <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 rounded-3xl py-12 px-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-serif">
            {connectionsOnly ? 'Filtering connected members...' : 'Searching members...'}
          </span>
        </div>
      ) : uniqueMembers.length === 0 ? (
        /* Empty Search results placeholder */
        <div className="bg-[#FDFCFB] dark:bg-slate-900 border border-[#EFECE7] dark:border-slate-800 border-dashed rounded-3xl py-16 px-6 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 dark:border-slate-700 text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-slate-800 dark:text-white font-serif font-bold mb-1">
            {connectionsOnly ? 'No connected members match your search' : 'No members match your search'}
          </h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
            {connectionsOnly
              ? 'You do not have any active connections matching this query. Try unchecking "My Connections Only" to search all community members.'
              : 'Try searching for different names (e.g. Eleanor) or locations (e.g. Portland, OR).'}
          </p>
        </div>
      ) : (

        /* Render member profile cards using mbrProfilePanel */
        <div className="flex flex-col gap-6">
          {uniqueMembers.map((member, idx) => {
            const targetId = member.mbrId || member.id;
            const connInfo = connectionsMap?.get(targetId);
            return (
              <MbrProfilePanel
                key={`${targetId}-${idx}`}
                profile={member}
                isSandbox={false}
                isConnected={connInfo?.isConnected}
                connectionGrpName={connInfo?.grpName}
                viewerMbrId={viewerMbrId}
                onClickReadStory={onClickReadStory}
              />
            );
          })}

          {/* Loading indicator while fetching more items */}
          {loadingMore && (
            <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl py-4 px-6 flex items-center justify-center gap-2.5 text-slate-600 font-serif text-xs shadow-xs">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Loading more members...</span>
            </div>
          )}

          {/* Load More Prompt once 20 or more members are loaded */}
          {!loadingMore && hasMore && uniqueMembers.length >= 20 && (
            <div className="pt-2 pb-2 text-center">
              <button
                type="button"
                onClick={onLoadMore}
                className="w-full py-3.5 px-6 bg-white hover:bg-slate-50 border border-[#EFECE7] hover:border-slate-300 rounded-2xl text-xs font-bold text-slate-800 font-serif shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Load More Members</span>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          {/* End of list footer */}
          {!loadingMore && !hasMore && uniqueMembers.length > 0 && (
            <div className="py-4 text-center text-xs font-serif text-slate-400 border-t border-slate-100">
              All matching members loaded ({uniqueMembers.length} members)
            </div>
          )}
        </div>
      )}

      <AdminComponentTag name="SbMbrSearchResults" />
    </div>
  );
}
