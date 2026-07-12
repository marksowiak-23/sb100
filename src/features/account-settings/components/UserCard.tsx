/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Mail, Clock } from 'lucide-react';
import { UserAccount } from '@/src/services/api';

interface UserCardProps {
  user: UserAccount; // Expects a single user record object.
}

/**
 * UserCard Component
 * Displays specific user account records (emails, ids, registration dates).
 * Highlights: State Isolation. Each UserCard handles its own 'copied' visual success tick state.
 * Clicking copy on one card does not affect any other cards or trigger parent re-renders.
 */
const UserCard: React.FC<UserCardProps> = ({ user }) => {
  // Local state to track whether the user has clicked copy in the last 2 seconds.
  const [copied, setCopied] = useState(false);

  // Fired when the copy icon is clicked.
  const handleCopy = () => {
    // navigator.clipboard is a web API to write strings to the system clipboard.
    navigator.clipboard.writeText(user.user_id);
    
    setCopied(true); // Flip status to true, changing copy icon to green checkmark.
    
    // Set a timer to revert checkmark back to normal copy icon after 2000ms.
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-[#FDFCFB] border border-[#EFECE7] hover:border-slate-300 rounded-2xl p-6 shadow-[0_8px_20px_rgba(0,0,0,0.01)] hover:shadow-[0_12px_30px_rgba(0,0,0,0.02)] transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* --- USER PROFILE HEADER --- */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {/* Grab first two characters of username for avatar representation */}
            <div className="w-10 h-10 bg-slate-50 border border-[#EFECE7] rounded-xl flex items-center justify-center text-slate-655 font-serif font-bold text-sm">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-serif font-bold text-slate-800 text-base">{user.username}</h4>
              {/* Dynamic status chip formatting */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 border ${
                  user.is_active
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-[#EFECE7]'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {/* --- COPY ID BUTTON --- */}
          {/* Listens for the onClick handler. Toggles copy icons dynamically based on `copied` state. */}
          <button
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
      </div>

      {/* --- FOOTER LOG INFORMATION --- */}
      {/* Takes ISO date strings and transforms them into localized string views using native JS Date interfaces. */}
      <div className="mt-4 pt-4 border-t border-[#EFECE7] flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Created: {new Date(user.created_at).toLocaleDateString()}</span>
        </div>
        <div>
          <span>Updated: {new Date(user.updated_at).toLocaleDateString()}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default UserCard;
