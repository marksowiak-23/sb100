/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';

export interface SessionTimeoutPanelProps {
  isOpen: boolean;
  remainingSeconds: number;
  onRenew: () => void;
  onLogout: () => void;
}

export type SessionTimeoutModalProps = SessionTimeoutPanelProps;

/**
 * SessionTimeoutPanel Component
 *
 * Displays a non-intrusive, high-contrast modal dialog when a user's session
 * is approaching expiration due to inactivity. Provides a 60-second live
 * countdown and options to renew the session or sign out immediately.
 */
export const SessionTimeoutPanel: React.FC<SessionTimeoutPanelProps> = ({
  isOpen,
  remainingSeconds,
  onRenew,
  onLogout,
}) => {
  if (!isOpen) return null;

  // Percentage for countdown progress bar (from 60s down to 0s)
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / 60) * 100));
  const isUrgent = remainingSeconds <= 15;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-timeout-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/75 backdrop-blur-md transition-opacity duration-300 p-4 animate-in fade-in"
    >
      <div className="relative w-full max-w-md bg-[#1E1C1A] border border-[#3E3C3A] rounded-2xl shadow-2xl p-6 sm:p-8 text-slate-100 overflow-hidden">
        {/* Ambient Top Glow Accent */}
        <div
          className={`absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-32 blur-3xl rounded-full pointer-events-none transition-colors duration-500 ${
            isUrgent ? 'bg-rose-500/20' : 'bg-amber-500/20'
          }`}
        />

        {/* Icon Badge */}
        <div className="flex justify-center mb-4">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center border shadow-inner transition-colors duration-300 ${
              isUrgent
                ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            }`}
          >
            {isUrgent ? (
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            ) : (
              <Clock className="w-8 h-8 animate-bounce" />
            )}
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-2">
          <h3
            id="session-timeout-title"
            className="text-xl font-bold font-serif text-white tracking-wide"
          >
            Session Timeout Warning
          </h3>
          <p className="text-xs sm:text-sm text-slate-350 leading-relaxed max-w-sm mx-auto">
            You have been inactive. For your account security, your StoryBook session
            will automatically expire in:
          </p>
        </div>

        {/* Countdown Visual Display */}
        <div className="my-6 text-center">
          <div
            className={`inline-flex items-baseline gap-1 font-mono font-black text-4xl sm:text-5xl tracking-tight transition-colors duration-300 ${
              isUrgent ? 'text-rose-400 animate-pulse' : 'text-amber-400'
            }`}
          >
            <span>00:{remainingSeconds.toString().padStart(2, '0')}</span>
            <span className="text-xs font-sans font-medium text-slate-400">sec</span>
          </div>

          {/* Linear Progress Bar */}
          <div className="w-full bg-slate-800/80 rounded-full h-2 mt-4 overflow-hidden border border-slate-700/50">
            <div
              className={`h-full transition-all duration-1000 ease-linear rounded-full ${
                isUrgent ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-gradient-to-r from-amber-500 to-emerald-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:border-slate-600"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Now</span>
          </button>
          <button
            type="button"
            onClick={onRenew}
            className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-900/30 hover:scale-[1.02]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Stay Signed In</span>
          </button>
        </div>

        {/* Security Note Footer */}
        <div className="mt-5 text-center text-[10px] text-slate-500">
          Auto-logout ensures your personal stories and records remain secure.
        </div>

        <AdminComponentTag name="sessionTimeoutPanel" />
      </div>
    </div>
  );
};

export default SessionTimeoutPanel;
export { SessionTimeoutPanel as sessionTimeoutPanel, SessionTimeoutPanel as SessionTimeoutModal };
