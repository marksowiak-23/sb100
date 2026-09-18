/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Home, Compass, BookOpen, Clock, Users, UserPlus, User, Loader2 } from 'lucide-react';
import { taskApi, mbrStatApi, mbrSettingsApi, resolveMediaUrl, MbrStat, MbrSettings } from '@/src/services/api';
import { MEMBER_STORIES } from '@/src/features/publicPage/constants/memberData';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import MbrConnectPanel from '@/src/components/mbrConnectPanel';

export interface MbrProfileBriefPanelProps {
  key?: React.Key;
  isSandbox?: boolean;
  profile?: any;
  memberId?: string;
  readOnly?: boolean;
  isConnected?: boolean;
  connectionGrpName?: string;
  viewerMbrId?: string | null;
  showConnectButton?: boolean;
  onConnectSuccess?: () => void;
  onClickAuthorProfile?: () => void;
}

export type SbMbrProfileBriefPanelProps = MbrProfileBriefPanelProps;
export type mbrProfileBriefPanelProps = MbrProfileBriefPanelProps;

export default function MbrProfileBriefPanel({
  isSandbox = false,
  profile: propProfile,
  memberId,
  readOnly = false,
  isConnected: propIsConnected,
  connectionGrpName: propConnectionGrpName,
  viewerMbrId: propViewerMbrId,
  showConnectButton = true,
  onConnectSuccess,
  onClickAuthorProfile
}: MbrProfileBriefPanelProps) {

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(propProfile || null);
  const [settings, setSettings] = useState<MbrSettings | null>(() => {
    if (propProfile?.mbrSettings) return propProfile.mbrSettings;
    return null;
  });
  const [settingsLoaded, setSettingsLoaded] = useState<boolean>(Boolean(propProfile?.mbrSettings));
  const [mbrStat, setMbrStat] = useState<MbrStat | null>(null);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);
  const [requestSent, setRequestSent] = useState(false);

  // Resolved viewer member ID
  const [resolvedViewerId, setResolvedViewerId] = useState<string | null>(propViewerMbrId || null);

  useEffect(() => {
    if (propViewerMbrId) {
      setResolvedViewerId(propViewerMbrId);
      return;
    }
    const storedMbr = sessionStorage.getItem('sb_current_mbr');
    if (storedMbr) {
      try {
        const parsed = JSON.parse(storedMbr);
        if (parsed.mbrId) {
          setResolvedViewerId(parsed.mbrId);
          return;
        }
      } catch {}
    }
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.user_id) {
          taskApi.getMemberByUserId(u.user_id).then((mbrProfile) => {
            if (mbrProfile && mbrProfile.mbrId) {
              setResolvedViewerId(mbrProfile.mbrId);
            }
          }).catch(() => {});
        }
      } catch {}
    }
  }, [propViewerMbrId]);

  const [resolvedConnectionGrpName, setResolvedConnectionGrpName] = useState<string>(propConnectionGrpName || '');
  const [resolvedIsConnected, setResolvedIsConnected] = useState<boolean>(propIsConnected ?? false);

  useEffect(() => {
    if (propConnectionGrpName !== undefined) {
      setResolvedConnectionGrpName(propConnectionGrpName);
    }
  }, [propConnectionGrpName]);

  useEffect(() => {
    if (propIsConnected !== undefined) {
      setResolvedIsConnected(propIsConnected);
    }
  }, [propIsConnected]);

  // Direct connection lookup fallback between viewer and profile member
  useEffect(() => {
    const fetchDirectConnection = async () => {
      const targetMbrId = profile?.mbrId || memberId;
      if (!targetMbrId || !resolvedViewerId || targetMbrId === resolvedViewerId) return;
      if (propConnectionGrpName !== undefined && propIsConnected !== undefined) return;

      try {
        let conns = await taskApi.getMemberConnections({
          mbrId: resolvedViewerId,
          connectedMbrId: targetMbrId
        }).catch(() => []);

        if (!conns || conns.length === 0) {
          conns = await taskApi.getMemberConnections({
            mbrId: targetMbrId,
            connectedMbrId: resolvedViewerId
          }).catch(() => []);
        }

        if (conns && conns.length > 0) {
          setResolvedIsConnected(true);
          const conn = conns[0];
          const connGrps = await taskApi.getMemberConnectionGrps({
            connectionId: conn.mbrConnectionId
          }).catch(() => []);

          if (connGrps && connGrps.length > 0 && connGrps[0].grpId) {
            const grpId = connGrps[0].grpId;
            const [globals, customs] = await Promise.all([
              taskApi.getGroupsGlobal().catch(() => []),
              taskApi.getGroupsCustom(conn.mbrId).catch(() => [])
            ]);
            const matched = [...globals, ...customs].find(g => g.grpId === grpId);
            if (matched?.grpName) {
              setResolvedConnectionGrpName(matched.grpName);
            }
          }
        }
      } catch (err) {
        console.warn("Direct connection check failed in brief panel:", err);
      }
    };

    fetchDirectConnection();
  }, [profile?.mbrId, memberId, resolvedViewerId, propConnectionGrpName, propIsConnected]);

  // Sync prop changes into state
  useEffect(() => {
    if (propProfile) {
      setProfile(propProfile);
      if (propProfile.mbrSettings) {
        setSettings(propProfile.mbrSettings);
        setSettingsLoaded(true);
      }
      setLoading(false);
    }
  }, [propProfile]);

  // Fetch missing member data
  useEffect(() => {
    let isCancelled = false;

    const fetchMember = async () => {
      if (propProfile) {
        setLoading(false);
        return;
      }

      setLoading(true);

      const targetId = memberId || 'm1';

      if (isSandbox) {
        const mock = MEMBER_STORIES.find((m) => m.id === targetId) || MEMBER_STORIES[0];
        if (!isCancelled) {
          setProfile({
            ...mock,
            mbrId: mock.id,
            mbrFirstName: mock.name.split(' ')[0],
            mbrLastName: mock.name.split(' ')[1] || '',
            mbrLivesCityState: mock.location,
            mbrFromCityState: 'Coos Bay, OR',
            mbrProfilePic: mock.avatarUrl,
            statStoriesPublishedCnt: mock.chaptersCount || 5,
            statLastPublishedDt: '2026-08-15T14:30:00Z'
          });
          setLoading(false);
        }
        return;
      }

      try {
        const data = await taskApi.getMemberById(targetId);
        if (data && !isCancelled) {
          const avatarUrl = resolveMediaUrl(data.mbrProfilePic);
          setProfile({
            ...data,
            mbrProfilePic: avatarUrl || data.mbrProfilePic
          });

          // Fetch member statistics
          try {
            const stats = await mbrStatApi.getMemberStatByMbrId(targetId);
            if (stats && !isCancelled) {
              setMbrStat(stats);
            }
          } catch (statErr) {
            console.warn("Could not fetch member stats:", statErr);
          }

          // Fetch member settings if not provided
          try {
            const userSettings = await mbrSettingsApi.getMemberSettings(targetId);
            if (userSettings && !isCancelled) {
              setSettings(userSettings);
              setSettingsLoaded(true);
            }
          } catch (settingsErr) {
            console.warn("Could not fetch member settings:", settingsErr);
            if (!isCancelled) setSettingsLoaded(true);
          }
        }
      } catch (err) {
        console.error("Failed to load member profile:", err);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    fetchMember();

    return () => {
      isCancelled = true;
    };
  }, [memberId, isSandbox, propProfile]);

  if (loading) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 flex items-center justify-center min-h-[140px] shadow-xs">
        <div className="flex items-center gap-2 text-slate-600 font-serif text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
          <span>Loading member profile...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 text-center shadow-xs">
        <p className="text-xs font-serif text-slate-500">Member profile unavailable.</p>
      </div>
    );
  }

  const fullName = profile.name || `${profile.mbrFirstName || ''} ${profile.mbrLastName || ''}`.trim() || 'Member';
  const initials = profile.avatarInitials || (fullName ? fullName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'MB');
  const isSelf = resolvedViewerId && (profile.mbrId === resolvedViewerId || profile.id === resolvedViewerId);

  const livesIn = profile.mbrLivesCityState || profile.location || (isSandbox ? 'Portland, OR' : null);
  const fromLocation = profile.mbrFromCityState || (isSandbox ? 'Coos Bay, OR' : null);

  const formatPublishedDate = (dateStr?: string | null): string | null => {
    if (!dateStr) return null;
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return null;
      return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };

  const publishedCount = mbrStat?.statStoriesPublishedCnt ?? profile?.statStoriesPublishedCnt ?? profile?.chaptersCount ?? (isSandbox ? 5 : 0);
  const rawLastPublishedDt = mbrStat?.statLastPublishedDt ?? profile?.statLastPublishedDt ?? profile?.statStoriesPublishedDt ?? (isSandbox ? '2026-08-15T14:30:00Z' : null);
  const lastPublishedFormatted = formatPublishedDate(rawLastPublishedDt);

  const isConnected = resolvedIsConnected;
  const connectionGrpName = resolvedConnectionGrpName;

  // Privacy checks
  if (!isSelf && propProfile?.mbrSettingsAllowPublicFlag === false) {
    return null;
  }
  if (!isSelf && propProfile?.mbrSettings && propProfile.mbrSettings.mbrSettingsAllowPublicFlag === false) {
    return null;
  }
  if (!isSelf && settingsLoaded && settings && settings.mbrSettingsAllowPublicFlag === false) {
    return null;
  }

  const showTown = settings ? settings.mbrSettingsShowTown !== false : true;
  const avatarUrl = profile.mbrProfilePic || profile.avatarUrl;

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-3 relative overflow-hidden group">
      {/* Top Accent Line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500 opacity-60 group-hover:opacity-100 transition-opacity" />

      {/* Top Header & Metadata Block */}
      <div className="flex items-start gap-3 sm:gap-4">
        {/* Avatar image */}
        <div className="relative w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 shrink-0 mt-0.5">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={fullName}
              className="w-full h-full rounded-2xl object-cover border border-[#EFECE7] shadow-xs"
            />
          ) : (
            <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-serif text-slate-700 font-bold text-lg sm:text-xl">
              {initials}
            </div>
          )}
        </div>

        {/* Name & Metadata Rows Column */}
        <div className="flex-1 min-w-0 space-y-2">
          {/* Header Row: Full Name & Connection Badge */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
            <h2 className="font-serif text-lg sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight leading-tight break-words">
              {fullName}
            </h2>

            {/* Connection Badge / Action Button in Top Right */}
            <div className="flex items-center shrink-0 self-start sm:self-auto">
              {isSelf ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (onClickAuthorProfile) {
                      onClickAuthorProfile();
                    } else {
                      window.dispatchEvent(new CustomEvent('open-member-profile'));
                    }
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm active:scale-95 border border-blue-600 font-sans whitespace-nowrap"
                  title="View and edit your profile settings"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              ) : isConnected ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200/90 rounded-xl text-[11px] sm:text-xs font-serif shadow-2xs transition-all hover:bg-emerald-100/90 whitespace-nowrap"
                  title={connectionGrpName ? `Connection Group: ${connectionGrpName}` : 'Connected Member'}
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold tracking-tight">
                    {connectionGrpName ? connectionGrpName : 'Connected'}
                  </span>
                </div>
              ) : showConnectButton && !requestSent && !readOnly ? (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConnectModalOpen(true);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 rounded-xl text-[11px] sm:text-xs font-serif font-semibold shadow-2xs hover:shadow-xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
                  title="Connect with this member"
                >
                  <UserPlus className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Connect</span>
                </button>
              ) : requestSent ? (
                <div
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-amber-50 text-amber-800 border border-amber-200/80 rounded-xl text-[11px] sm:text-xs font-serif shadow-2xs whitespace-nowrap"
                  title="Connection request sent"
                >
                  <Users className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-semibold tracking-tight">Request Sent</span>
                </div>
              ) : null}
            </div>
          </div>

          {/* Metadata Rows */}
          <div className="space-y-1.5 text-xs">
            {/* Lives In */}
            {showTown && livesIn && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Home className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">LIVES IN:</span>
                <span className="font-semibold text-slate-800">{livesIn}</span>
              </div>
            )}

            {/* From Location */}
            {showTown && fromLocation && (
              <div className="flex items-center gap-1.5 text-slate-700">
                <Compass className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">FROM:</span>
                <span className="font-semibold text-slate-800">{fromLocation}</span>
              </div>
            )}

            {/* Story Publication Stats */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-700 pt-0.5">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">STORIES PUBLISHED:</span>
                <span className="font-semibold text-slate-800">{publishedCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">LAST PUBLISHED:</span>
                <span className="font-semibold text-slate-800">{lastPublishedFormatted || 'Recent'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Connect Modal Dialog */}
      {profile?.mbrId && (
        <MbrConnectPanel
          isOpen={isConnectModalOpen}
          onClose={() => setIsConnectModalOpen(false)}
          targetMember={profile}
          viewerMbrId={resolvedViewerId}
          onSuccess={() => {
            setRequestSent(true);
            if (onConnectSuccess) {
              onConnectSuccess();
            }
          }}
        />
      )}

      <AdminComponentTag name="mbrProfileBriefPanel" />
    </div>
  );
}

export { MbrProfileBriefPanel, MbrProfileBriefPanel as mbrProfileBriefPanel, MbrProfileBriefPanel as SbMbrProfileBriefPanel };
