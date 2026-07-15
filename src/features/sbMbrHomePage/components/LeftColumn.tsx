/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserCheck, CheckCircle2, Circle, Compass, Users } from 'lucide-react';
import { NEW_CONNECTIONS, MY_CONNECTIONS } from '../constants/memberConnections';

interface LeftColumnProps {
  onClickAuthorPage?: () => void;
}

export default function LeftColumn({ onClickAuthorPage }: LeftColumnProps) {
  const statusItems = [
    { name: 'Demographics', completed: true },
    { name: 'Family', completed: true },
    { name: 'Residencies', completed: true },
    { name: 'Achievements', completed: false },
    { name: 'Health', completed: false },
    { name: 'Hobbies', completed: false },
    { name: 'Stories', completed: true },
    { name: 'Biography', completed: true }
  ];

  const completedCount = statusItems.filter((i) => i.completed).length;
  const progressPercent = Math.round((completedCount / statusItems.length) * 100);

  return (
    <div className="space-y-6 flex flex-col">
      
      {/* --- BRAND HEADER --- */}
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-black text-slate-800 tracking-tight leading-none">
          Storybook
        </h1>
        <p className="font-serif text-xs italic text-slate-500">
          Where every life becomes literature
        </p>
      </div>

      {/* --- MY NEW CONNECTIONS --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
          <UserCheck className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            My New Connections
          </h3>
        </div>

        {/* Scrollable listing box */}
        <div className="overflow-y-auto max-h-[190px] pr-1 space-y-3 scrollbar-thin">
          {NEW_CONNECTIONS.map((conn) => {
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
                  <span className="block text-[8px] font-mono text-slate-400 mt-1">
                    {conn.connectedTime}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- MY STORYBOOK STATUS --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
        <div className="flex items-center gap-2 pb-1 border-b border-[#EFECE7]">
          <Compass className="w-4 h-4 text-slate-650 shrink-0" />
          <h3 className="font-serif text-sm font-bold text-slate-800">
            My Storybook Status
          </h3>
        </div>

        {/* Completion Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 font-serif">
            <span>Progress Indicator</span>
            <span className="text-slate-800">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden border border-[#EFECE7]">
            <div
              className="h-full bg-gradient-to-r from-slate-700 to-slate-850 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Categories checklist grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-1">
          {statusItems.map((item) => (
            <div key={item.name} className="flex items-center gap-1.5 text-xs text-slate-650">
              {item.completed ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
              ) : (
                <Circle className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              )}
              <span className="font-serif leading-none truncate">{item.name}</span>
            </div>
          ))}
        </div>

        {/* Link button to sbMbrAuthorPage */}
        <button
          onClick={onClickAuthorPage}
          className="w-full mt-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-bold font-serif transition-colors cursor-pointer text-center shadow-sm"
        >
          Go to Author Workspace
        </button>
      </div>

      {/* --- MY CONNECTIONS --- */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-5 shadow-[0_8px_20px_rgba(0,0,0,0.01)] flex flex-col gap-4">
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
      </div>

    </div>
  );
}
