/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Check, Copy, Mail, Clock } from 'lucide-react';
import { UserAccount } from '@/src/services/api';

interface UserCardProps {
  user: UserAccount;
}

export default function UserCard({ user }: UserCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(user.user_id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
    >
      <div className="space-y-4">
        {/* User Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold">
              {user.username.substring(0, 2).toUpperCase()}
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">{user.username}</h4>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mt-1 ${
                  user.is_active
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                    : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}
              >
                {user.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
          
          {/* Copy UUID button */}
          <button
            onClick={handleCopy}
            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
            title="Copy user UUID"
          >
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Email info */}
        <div className="flex items-center gap-2.5 text-slate-600 text-sm">
          <Mail className="w-4 h-4 text-slate-400" />
          <span className="truncate">{user.email}</span>
        </div>

        {/* UUID info */}
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            User UUID
          </span>
          <span className="font-mono text-xs text-slate-600 select-all block break-all">
            {user.user_id}
          </span>
        </div>
      </div>

      {/* Dates info footer */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-mono">
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
}
