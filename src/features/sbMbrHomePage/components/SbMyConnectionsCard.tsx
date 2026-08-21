/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Users } from 'lucide-react';
import { MY_CONNECTIONS } from '../constants/memberConnections';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

export default function SbMyConnectionsCard() {
  return (
    <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4 relative">
      <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
        <Users className="w-4 h-4 text-slate-650 shrink-0" />
        <h3 className="font-serif text-sm font-bold text-slate-800">
          My Connections
        </h3>
      </div>

      {/* Scrollable list */}
      <div className="overflow-y-auto max-h-[190px] pr-1 space-y-3 scrollbar-thin">
        {MY_CONNECTIONS.map((conn) => {
          const initials = conn.name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
          
          return (
            <div
              key={conn.id}
              className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors duration-150 border border-transparent hover:border-[#EFECE7]"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Avatar */}
                <div className="relative w-8 h-8 shrink-0">
                  {conn.avatarUrl ? (
                    <img
                      src={conn.avatarUrl}
                      alt={conn.name}
                      className="w-full h-full rounded-xl object-cover border border-[#EFECE7]"
                    />
                  ) : (
                    <div className="w-full h-full rounded-xl bg-slate-100 flex items-center justify-center font-serif text-[10px] text-slate-700 font-bold">
                      {initials}
                    </div>
                  )}
                </div>
                {/* Info details */}
                <div className="min-w-0">
                  <span className="block text-xs font-serif font-bold text-slate-800 truncate">
                    {conn.name}
                  </span>
                  <span className="block text-[10px] text-slate-400 font-medium truncate">
                    {conn.location}
                  </span>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                  conn.relationship === 'Family'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                    : conn.relationship === 'Friend'
                    ? 'bg-blue-50 text-blue-700 border-blue-100'
                    : 'bg-slate-100 text-slate-600 border-[#EFECE7]'
                }`}>
                  {conn.relationship}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <AdminComponentTag name="SbMyConnectionsCard" />
    </div>
  );
}
