/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Mail, Clock, ArrowRightLeft, Loader2 } from 'lucide-react';
import { User, taskApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface UserCardProps {
  user: User; // Expects a single user record object.
  isSandbox?: boolean;
  isCurrent?: boolean;
  onSwitchUser?: (user: User) => void;
  setActiveTab?: (tab: any) => void;
}

/**
 * UserCard Component
 * Displays specific user account records (emails, ids, registration dates).
 * Highlights: State Isolation. Each UserCard handles its own 'copied' visual success tick state.
 * Clicking copy on one card does not affect any other cards or trigger parent re-renders.
 */
const UserCard: React.FC<UserCardProps> = ({
  user,
  isSandbox = false,
  isCurrent = false,
  onSwitchUser,
  setActiveTab
}) => {
  // Local state to track whether the user has clicked copy in the last 2 seconds.
  const [copied, setCopied] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  // Fired when the copy icon is clicked.
  const handleCopy = () => {
    // navigator.clipboard is a web API to write strings to the system clipboard.
    navigator.clipboard.writeText(user.user_id);
    
    setCopied(true); // Flip status to true, changing copy icon to green checkmark.
    
    // Set a timer to revert checkmark back to normal copy icon after 2000ms.
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwitchUser = async () => {
    setIsSwitching(true);
    try {
      // 1. Set the user authentication record in session
      sessionStorage.setItem('user', JSON.stringify(user));

      // 2. Fetch or mock the member profile associated with this user
      if (isSandbox) {
        const mockMbr = {
          mbrId: user.user_id,
          mbrFirstName: user.email.split('@')[0].replace(/[^a-zA-Z]/g, ' ').trim() || 'StoryBook',
          mbrLastName: 'Member',
          mbrEmail: user.email,
          userId: user.user_id,
          mbrProfilePic: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&auto=format'
        };
        sessionStorage.setItem('sandbox_mbr', JSON.stringify(mockMbr));
        sessionStorage.setItem('sb_current_mbr', JSON.stringify(mockMbr));
      } else {
        try {
          const member = await taskApi.getMemberByUserId(user.user_id);
          if (member) {
            sessionStorage.setItem('sb_current_mbr', JSON.stringify(member));
            if (member.mbrProfilePic) {
              sessionStorage.setItem(`session_pic_${member.mbrId}`, member.mbrProfilePic);
            }
          } else {
            sessionStorage.removeItem('sb_current_mbr');
          }
        } catch (err) {
          console.warn("Could not load member record for switched user:", err);
        }
      }

      // 3. Dispatch session update event
      window.dispatchEvent(new CustomEvent('user-switched', { detail: { user } }));

      // 4. Navigate directly to Home Page as if logged in
      if (onSwitchUser) {
        onSwitchUser(user);
      } else if (setActiveTab) {
        setActiveTab('mbrHomePage');
      }
    } catch (error) {
      console.error("Error switching user:", error);
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="relative bg-[#FDFCFB] border border-[#EFECE7] hover:border-slate-300 rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)] transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* --- USER PROFILE HEADER --- */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Grab first two characters of email for avatar representation */}
            <div className="w-10 h-10 bg-slate-50 border border-[#EFECE7] rounded-xl flex items-center justify-center text-slate-655 font-serif font-bold text-sm">
              {user.email.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-800 text-base">{user.email}</h4>
              {/* Dynamic status chip formatting */}
              <div className="flex items-center gap-1.5 mt-1">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    user.is_active
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-slate-100 text-slate-500 border-[#EFECE7]'
                  }`}
                >
                  {user.is_active ? 'Active' : 'Inactive'}
                </span>
                {isCurrent && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-blue-50 text-blue-700 border-blue-200">
                    Current Session
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* --- COPY ID BUTTON --- */}
          {/* Listens for the onClick handler. Toggles copy icons dynamically based on `copied` state. */}
          <button
            type="button"
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-slate-850 hover:bg-slate-50 border border-transparent hover:border-[#EFECE7] rounded-lg transition-all cursor-pointer"
            title="Copy user UUID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* --- CONTACT EMAIL --- */}
        <div className="flex items-center gap-2.5 text-slate-600 text-sm">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* --- UNIQUE IDENTIFIER BOX --- */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-[#EFECE7] space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            User UUID
          </span>
          <span className="font-mono text-xs text-slate-600 select-all block break-all">
            {user.user_id}
          </span>
        </div>

        {/* --- SWITCH USER ACTION BUTTON --- */}
        <div className="pt-1">
          <button
            type="button"
            onClick={handleSwitchUser}
            disabled={isSwitching}
            className={`w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 cursor-pointer shadow-sm ${
              isCurrent
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white'
            } disabled:opacity-60 disabled:cursor-not-allowed`}
          >
            {isSwitching ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-300" />
                <span>Switching user...</span>
              </>
            ) : (
              <>
                <ArrowRightLeft className="w-3.5 h-3.5 text-slate-300" />
                <span>Switch User</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* --- FOOTER LOG INFORMATION --- */}
      {/* Takes ISO date strings and transforms them into localized string views using native JS Date interfaces. */}
      <div className="mt-4 pt-4 border-t border-[#EFECE7] flex items-center justify-between text-[10px] text-slate-400 font-mono pr-20">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
        <div>
          <span>Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
        </div>
      </div>

      <AdminComponentTag name="UserCard" />
    </motion.div>
  );
};

export default UserCard;
