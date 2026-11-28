/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MailCheck, Laptop, KeyRound, RefreshCw } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { SecuritySubTab } from './SecurityNavigationMenu';

interface SecurityHeaderProps {
  activeSubTab: SecuritySubTab;
  refreshing?: boolean;
  onRefresh?: () => void;
}

export default function SecurityHeader({
  activeSubTab,
  refreshing = false,
  onRefresh,
}: SecurityHeaderProps) {
  const isDevices = activeSubTab === 'trusted-devices';
  const isPassword = activeSubTab === 'password';

  return (
    <div className="relative mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-200 dark:border-slate-800">
      <AdminComponentTag name="SecurityHeader" />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="flex items-center gap-2.5 sm:gap-3">
          <div
            className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shadow-md text-white shrink-0 ${
              isPassword
                ? 'bg-gradient-to-tr from-indigo-600 to-blue-600 shadow-indigo-600/20'
                : isDevices
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-600 shadow-emerald-600/20'
                : 'bg-gradient-to-tr from-[#13547A] to-blue-600 shadow-blue-600/20'
            }`}
          >
            {isPassword ? (
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : isDevices ? (
              <Laptop className="w-4 h-4 sm:w-5 sm:h-5" />
            ) : (
              <MailCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </div>

          <div>
            <h1 className="text-xl sm:text-2xl font-bold font-serif text-slate-900 dark:text-white tracking-tight">
              {isPassword ? 'My Password' : isDevices ? 'My Trusted Devices' : 'My Username (Email)'}
            </h1>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 leading-tight sm:leading-normal">
              {isPassword
                ? 'Update your BackStory account password and optionally sign out trusted browsers.'
                : isDevices
                ? 'Review browsers remembered to skip Email MFA and revoke access anytime.'
                : 'Manage your sign-in email verification status and two-factor authentication (Email MFA).'}
            </p>
          </div>
        </div>

        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer self-start sm:self-auto disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>
    </div>
  );
}
