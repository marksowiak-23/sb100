/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';

interface StatsGridProps {
  name: string;
}

/**
 * StatsGrid Component
 * Renders the dashboard metrics showing: the system clock, date calendar, and length of user input.
 * Crucially, it manages its own local timer. By managing the clock state here instead of App.tsx,
 * we prevent typing name inputs from recalculating clock ticks, and vice-versa, enhancing performance.
 */
export default function StatsGrid({ name }: StatsGridProps) {
  // Define local state to track the active clock time.
  const [time, setTime] = useState(new Date());

  // useEffect manages the component lifecycle hooks.
  useEffect(() => {
    // Set up a browser timer that runs every 1000 milliseconds (1 second).
    const timer = setInterval(() => {
      setTime(new Date()); // Triggers a re-render of StatsGrid to update the displayed clock.
    }, 1000);

    // CLEANUP FUNCTION:
    // If this component is unmounted (removed from screen), React will run this return callback.
    // Clearing the interval is critical to prevent memory leaks (timers running in the background forever).
    return () => clearInterval(timer);
  }, []); // Run only once when mounting.

  // Format helper functions to display the raw Date object as human-readable strings.
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
      {/* Card 1: System Clock */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] p-6 rounded-2xl flex flex-col gap-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
        <span className="text-xs font-bold text-slate-450 uppercase tracking-wider font-mono">System Clock</span>
        <span className="text-xl font-mono text-slate-800">{formattedTime}</span>
      </div>

      {/* Card 2: Current Date Calendar */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] p-6 rounded-2xl flex flex-col gap-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
        <span className="text-xs font-bold text-slate-450 uppercase tracking-wider font-mono">Current Date</span>
        <span className="text-lg font-serif text-slate-800">{formattedDate}</span>
      </div>

      {/* Card 3: Session Input length */}
      {/* Dynamically computes name byte length directly in the rendering markup tree. */}
      <div className="bg-[#FDFCFB] border border-[#EFECE7] p-6 rounded-2xl flex flex-col gap-1.5 shadow-[0_8px_20px_rgba(0,0,0,0.01)]">
        <span className="text-xs font-bold text-slate-455 uppercase tracking-wider font-mono">Input Bytes</span>
        <span className="text-xl font-mono text-slate-800">{name.trim().length} octets</span>
      </div>
    </div>
  );
}
