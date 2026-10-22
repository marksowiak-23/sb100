/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Info, Loader2, ChevronDown } from 'lucide-react';
import MbrProfilePanel from '@/src/components/mbrProfilePanel';
import SbStorybookAdPanel from './SbStorybookAdPanel';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { UserLocation } from '@/src/utils/userLocation';

interface SbMemberSearchResultsProps {
  members: any[];
  loading?: boolean;
  loadingMore?: boolean;
  hasMore?: boolean;
  onLoadMore?: () => void;
  onClickReadStory?: (memberId: string) => void;
  userLocation?: UserLocation | null;
  searchQuery?: string;
  setActiveTab?: (tab: any) => void;
  onSelectLogonType?: (type: 'Google' | 'Apple') => void;
}

/**
 * Returns the ad sequence index if an advertising panel should be displayed
 * after member index `idx` (0-indexed).
 * 
 * Spacing cadence alternates in between every 2 or 3 member profile panels:
 * - After idx = 1 (2nd member): Ad #0 (StoryBook Vision Collage)
 * - After idx = 4 (5th member, +3): Ad #1 (Hardcover Book Keepsake)
 * - After idx = 6 (7th member, +2): Ad #2 (Sharing Stories Across Generations)
 * - After idx = 9 (10th member, +3): Ad #3 (StoryMate AI Co-Writer)
 * - After idx = 11 (12th member, +2): Ad #4 (Friends & Connections "What's Your Story?")
 * - Cycles: idx = 14 (+3), 16 (+2), 19 (+3), 21 (+2), 24 (+3)...
 */
function getAdIndexForMember(idx: number): number | null {
  const rem = idx % 5;
  if (rem === 1) {
    return Math.floor(idx / 5) * 2;
  }
  if (rem === 4) {
    return Math.floor(idx / 5) * 2 + 1;
  }
  return null;
}

export default function SbMemberSearchResults({
  members,
  loading = false,
  loadingMore = false,
  hasMore = true,
  onLoadMore,
  onClickReadStory,
  userLocation,
  searchQuery,
  setActiveTab,
  onSelectLogonType
}: SbMemberSearchResultsProps) {
  const uniqueMembers = Array.from(new Map(members.map(m => [m.mbrId || m.id, m])).values())
    .filter(m => {
      if (m.mbrSettings) return m.mbrSettings.mbrSettingsAllowPublicFlag === true;
      if (m.mbrSettingsAllowPublicFlag !== undefined) return m.mbrSettingsAllowPublicFlag === true;
      return true;
    });

  const handleAdAction = (adIndex: number) => {
    if (setActiveTab) {
      setActiveTab('mbrRegistrationPage');
    }
  };

  const handleAdSecondary = (adIndex: number) => {
    if (setActiveTab) {
      if (adIndex % 4 === 3) {
        // StoryMate AI card secondary action tries author studio
        setActiveTab('mbrAuthorPage');
      } else {
        setActiveTab('mbrRegistrationPage');
      }
    }
  };

  return (
    <div className="space-y-5 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-2 gap-1">
        <div>
          <h3 className="font-serif text-base font-bold text-slate-800 flex items-center gap-2">
            <span>Community Members</span>
          </h3>
          <p className="text-[11px] text-slate-400 font-serif">
            {userLocation && !searchQuery
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
        <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl py-12 px-6 text-center shadow-xs flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
          <span className="text-xs text-slate-400 font-serif">Searching members...</span>
        </div>
      ) : uniqueMembers.length === 0 ? (
        /* Empty Search results placeholder */
        <div className="bg-[#FDFCFB] border border-[#EFECE7] border-dashed rounded-3xl py-16 px-6 text-center shadow-xs">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100 text-slate-400">
            <Info className="w-6 h-6" />
          </div>
          <h4 className="text-slate-800 font-serif font-bold mb-1">No members match your search</h4>
          <p className="text-slate-400 text-xs max-w-xs mx-auto leading-relaxed font-serif">
            Try searching for different names (e.g. Eleanor) or locations (e.g. Portland, OR).
          </p>
        </div>
      ) : (
        /* Render member cards and intercalated advertising panels */
        <div className="flex flex-col gap-6">
          {uniqueMembers.map((member, idx) => {
            const adIndexToRender = getAdIndexForMember(idx);

            return (
              <React.Fragment key={`${member.mbrId || member.id}-${idx}`}>
                <MbrProfilePanel
                  profile={member}
                  isSandbox={false}
                  showConnectButton={false}
                  onClickReadStory={onClickReadStory}
                  clampIntroduction={true}
                  maxIntroLines={8}
                />

                {/* Render StoryBook advertising panel between every 2 or 3 member cards */}
                {adIndexToRender !== null && (
                  <SbStorybookAdPanel
                    adIndex={adIndexToRender}
                    onActionClick={() => handleAdAction(adIndexToRender)}
                    onSecondaryClick={() => handleAdSecondary(adIndexToRender)}
                  />
                )}
              </React.Fragment>
            );
          })}

          {/* Fallback advertising panel if only 1 member is returned in results */}
          {uniqueMembers.length === 1 && (
            <SbStorybookAdPanel
              adIndex={0}
              onActionClick={() => handleAdAction(0)}
              onSecondaryClick={() => handleAdSecondary(0)}
            />
          )}

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
      <AdminComponentTag name="SbMemberSearchResults" />
    </div>
  );
}
