/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface StatsGridProps {
  name: string;
}

export default function StatsGrid({ name }: StatsGridProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedTime = time.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const formattedDate = time.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div id="stats-grid" className="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full max-w-4xl mt-12">
      {/* Card 1: Clock */}
      <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">System Clock</span>
        <span className="text-xl font-mono text-slate-800">{formattedTime}</span>
      </div>

      {/* Card 2: Calendar */}
      <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Date</span>
        <span className="text-lg font-mono text-slate-800">{formattedDate}</span>
      </div>

      {/* Card 3: Session Sync status */}
      <div className="bg-white/75 backdrop-blur-sm border border-slate-200/60 p-6 rounded-2xl flex flex-col gap-1.5 shadow-sm">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Input Bytes</span>
        <span className="text-xl font-mono text-slate-800">{name.trim().length} octets</span>
      </div>
    </div>
  );
}
