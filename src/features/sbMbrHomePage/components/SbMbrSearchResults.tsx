/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef } from 'react';
import { Info, Loader2 } from 'lucide-react';
import SbMbrProfilePanel from '@/src/components/SbMbrProfilePanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbMbrSearchResultsProps {
  searchQuery: string;
  members: any[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  connectionsMap?: Map<string, { isConnected: boolean; grpName?: string }>;
  viewerMbrId?: string | null;
  onLoadMore?: () => void;
  onClickReadStory?: (memberId: string) => void;
}

export default function SbMbrSearchResults({
  searchQuery,
  members,
  loading = false,
  loadingMore = false,
  hasMore = false,
  connectionsMap,
  viewerMbrId,
  onLoadMore,
  onClickReadStory
}: SbMbrSearchResultsProps) {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // IntersectionObserver to detect when the bottom sentinel is reached
  useEffect(() => {
    if (!onLoadMore || loading || loadingMore || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          onLoadMore();
        }
      },
      {
        root: null,
        rootMargin: '250px',
        threshold: 0.1
      }
    );

    const currentSentinel = sentinelRef.current;
    if (currentSentinel) {
      observer.observe(currentSentinel);
    }

    return () => {
      if (currentSentinel) {
        observer.unobserve(currentSentinel);
      }
    };
  }, [onLoadMore, loading, loadingMore, hasMore, members.length]);

  // Window scroll event listener fallback for bottom scroll detection
  useEffect(() => {
    if (!onLoadMore || loading || loadingMore || !hasMore) return;

    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const clientHeight = window.innerHeight || document.documentElement.clientHeight;

      if (scrollTop + clientHeight >= scrollHeight - 300) {
        onLoadMore();
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [onLoadMore, loading, loadingMore, hasMore]);

  return (
    <div className="space-y-4 relative">
      <div className="flex items-center justify-between border-b border-[#EFECE7] pb-2">
        <h3 className="font-serif text-sm font-bold text-slate-850">
          {searchQuery.trim() ? 'Search Results' : 'Recent Members'}
        </h3>
        <span className="text-xs text-slate-400 font-medium">
          {loading ? 'Searching...' : `Showing ${members.length} member${members.length === 1 ? '' : 's'}`}
        </span>
      </div>

      {loading ? (
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-12 px-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-serif">Loading members...</span>
        </div>
      ) : members.length === 0 ? (
        /* Empty Search results placeholder */
        <div className="bg-[#FDFCFB] border border-[#EFECE7] border-dashed rounded-3xl py-12 px-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#EFECE7] text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-slate-800 font-serif font-bold mb-1">No members match your search</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
            Try searching for different names (e.g. Eleanor) or locations (e.g. Portland, OR).
          </p>
        </div>
      ) : (
        /* Render member profile cards using SbMbrProfilePanel */
        <div className="flex flex-col gap-6">
          {Array.from(new Map(members.map(m => [m.mbrId || m.id, m])).values()).map((member, idx) => {
            const targetId = member.mbrId || member.id;
            const connInfo = connectionsMap?.get(targetId);
            return (
              <SbMbrProfilePanel
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

          {/* Bottom Sentinel for Infinite Scroll */}
          <div ref={sentinelRef} className="h-6 w-full pointer-events-none" />

          {/* Loading More Spinner */}
          {loadingMore && (
            <div className="py-6 flex items-center justify-center gap-2 text-slate-500 font-serif text-xs bg-[#FDFCFB] border border-[#EFECE7] rounded-2xl shadow-2xs">
              <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
              <span>Loading 5 more members...</span>
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && members.length >= 5 && (
            <div className="py-4 text-center text-xs text-slate-400 font-serif border-t border-dashed border-[#EFECE7]">
              You've reached the end of the results.
            </div>
          )}
        </div>
      )}

      <AdminComponentTag name="SbMbrSearchResults" />
    </div>
  );
}
