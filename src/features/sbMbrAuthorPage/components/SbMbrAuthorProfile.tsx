/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MapPin, BookOpen, Calendar, Loader2 } from 'lucide-react';
import { taskApi } from '@/src/services/api';

interface SbMbrAuthorProfileProps {
  isSandbox: boolean;
}

export default function SbMbrAuthorProfile({ isSandbox }: SbMbrAuthorProfileProps) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [location, setLocation] = useState<string>('Portland, OR');

  useEffect(() => {
    loadAuthorProfile();
  }, [isSandbox]);

  const loadAuthorProfile = async () => {
    setLoading(true);
    const userStr = sessionStorage.getItem('user');
    if (!userStr) {
      setLoading(false);
      return;
    }

    try {
      const u = JSON.parse(userStr);

      if (isSandbox) {
        // --- SANDBOX MODE ---
        const savedMbr = sessionStorage.getItem('sandbox_mbr');
        if (savedMbr) {
          const mbr = JSON.parse(savedMbr);
          setProfile(mbr);
        } else {
          // Fallback Eleanor Hartwell template
          const defaultMbr = {
            mbrId: 'sandbox-id-eleanor',
            mbrFirstName: 'Eleanor',
            mbrLastName: 'Hartwell',
            mbrMiddleName: 'Ruth',
            mbrBirthDate: '1961-10-14',
            mbrGenderCd: 'Female',
            mbrBiography: 'The rain was different in those days — softer, somehow. We would run down to the docks without coats, our mother calling after us...',
            mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format',
            mbrCreatedAt: '2020-10-01T00:00:00Z'
          };
          setProfile(defaultMbr);
        }
        setLocation('Portland, OR');
      } else {
        // --- LIVE DATABASE MODE ---
        const mbr = await taskApi.getMemberByUserId(u.user_id);
        if (mbr) {
          // Resolve cached session avatar picture if present
          const cachedPic = sessionStorage.getItem(`session_pic_${mbr.mbrId}`);
          setProfile({
            ...mbr,
            mbrProfilePic: cachedPic || mbr.mbrProfilePic
          });

          // Fetch member residence for location
          try {
            const residences = await taskApi.getResidences(mbr.mbrId);
            if (residences && residences.length > 0) {
              const currentRes = residences.find((r) => r.mbrResidenceCurrentInd) || residences[0];
              setLocation(`${currentRes.mbrResidenceCity}, ${currentRes.mbrResidenceState}`);
            }
          } catch (resErr) {
            console.warn("Could not retrieve residences for author profile:", resErr);
          }
        }
      }
    } catch (err) {
      console.error("Error loading author profile for sidebar panel:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex items-center justify-center min-h-[120px]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
          <span className="text-[10px] text-slate-400 font-serif">Loading author card...</span>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] text-center text-xs text-slate-400 font-serif">
        Please complete your member profile settings to display your author card.
      </div>
    );
  }

  const fullName = `${profile.mbrFirstName} ${profile.mbrMiddleName ? profile.mbrMiddleName + ' ' : ''}${profile.mbrLastName}`;
  
  // Initials for avatar fallback
  const initials = (profile.mbrFirstName[0] || '') + (profile.mbrLastName[0] || '').toUpperCase();

  // Format joined date
  let joinedYear = 'Oct 2020';
  if (profile.mbrCreatedAt) {
    try {
      const date = new Date(profile.mbrCreatedAt);
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      joinedYear = `${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch (e) {
      // Use fallback
    }
  }

  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          {/* Avatar image */}
          <div className="relative w-14 h-14 shrink-0">
            {profile.mbrProfilePic ? (
              <img
                src={profile.mbrProfilePic}
                alt={fullName}
                className="w-full h-full rounded-2xl object-cover border border-[#EFECE7] shadow-sm"
              />
            ) : (
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center font-serif text-slate-700 font-bold text-xl">
                {initials}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-serif text-xl font-black text-slate-800 tracking-tight leading-tight">
              {fullName}
            </h2>
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{location}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats metadata */}
      <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-400 tracking-wider uppercase bg-slate-50/50 p-2.5 rounded-xl border border-slate-100/50 w-fit">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5 text-blue-500" />
          <span>18 chapters</span>
        </div>
        <div className="w-1.5 h-1.5 rounded-full bg-slate-250"></div>
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>Member since {joinedYear}</span>
        </div>
      </div>

      {/* Intro quote excerpt */}
      {profile.mbrBiography && (
        <p className="text-slate-500 font-serif leading-relaxed text-sm italic relative pl-4 border-l-2 border-slate-250">
          "{profile.mbrBiography.length > 150 ? profile.mbrBiography.substring(0, 150) + '...' : profile.mbrBiography}"
        </p>
      )}

    </div>
  );
}
