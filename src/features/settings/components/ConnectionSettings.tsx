/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Settings as SettingsIcon } from 'lucide-react';

interface ConnectionSettingsProps {
  isSandbox: boolean; // Indicates if the application is offline and using sandbox mocked data.
}

/**
 * ConnectionSettings Component
 * Displays system environment variables and the live vs sandboxed server modes.
 * This is a "Stateless / Presentational Component" because it takes data entirely as props
 * and outputs UI elements without managing its own internal states.
 */
export default function ConnectionSettings({ isSandbox }: ConnectionSettingsProps) {
  return (
    <div className="w-full max-w-2xl bg-[#FDFCFB] border border-[#EFECE7] rounded-3xl p-8 md:p-12 shadow-[0_12px_40px_rgba(0,0,0,0.02)]">
      
      {/* Header section with icon and labels */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#EFECE7] mb-6">
        <div className="p-2.5 bg-slate-50 border border-[#EFECE7] text-slate-700 rounded-xl">
          <SettingsIcon className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-xl font-serif font-bold text-slate-800">Connection Settings</h2>
          <p className="text-xs text-slate-455 font-serif">Configure connection details for the sb100 environment.</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* --- API ENDPOINT CONFIG --- */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            VITE_API_URL
          </h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-[#EFECE7] flex items-center justify-between">
            {/* Vite handles environment variables via `import.meta.env`. */}
            {/* The double-pipe `||` is a logical OR fallback. If the env variable is undefined, it defaults to 'http://localhost:8000'. */}
            <span className="font-mono text-xs md:text-sm text-slate-700">
              {import.meta.env.VITE_API_URL || 'http://localhost:8000'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 border border-[#EFECE7] text-slate-600 rounded font-mono">
              Configured
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2 leading-normal">
            This value is configured via <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-600">.env.local</span>. To point to a different port or remote API, edit that file and reload the Vite client.
          </p>
        </div>

        {/* --- CONNECTION STATUS GRID CARD --- */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 font-mono">
            Connection Mode
          </h3>
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-[#EFECE7] rounded-xl">
            <div>
              {/* Dynamic status title text via props check */}
              <span className="text-sm font-serif font-bold text-slate-800 block">
                {isSandbox ? 'Local Storage Sandbox' : 'FastAPI Connected'}
              </span>
              {/* Dynamic status explanation text */}
              <span className="text-xs text-slate-450 font-serif leading-relaxed block mt-0.5 max-w-md">
                {isSandbox
                  ? 'Running in sandboxed offline browser mode. Fastapi server was unreachable.'
                  : 'Successfully queried backend routes and connected to Cloud SQL database.'}
              </span>
            </div>
            {/* Dynamic CSS class application: */}
            {/* If isSandbox is true, apply amber indicator color. Otherwise, apply emerald green. */}
            <span
              className={`w-3 h-3 rounded-full shrink-0 ${
                isSandbox ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-ping'
              }`}
            ></span>
          </div>
        </div>
      </div>
    </div>
  );
}
