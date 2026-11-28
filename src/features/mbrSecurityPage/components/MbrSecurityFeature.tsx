/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { authSecurityApi, SecurityStatusResponse } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import SecurityPageHeaderPanel from './SecurityPageHeaderPanel';
import SecurityNavigationMenu, { SecuritySubTab } from './SecurityNavigationMenu';
import SecurityHeader from './SecurityHeader';
import SecurityUsernameEmailPanel from './SecurityUsernameEmailPanel';
import SecurityTrustedDevicesPanel from './SecurityTrustedDevicesPanel';
import SecurityPasswordPanel from './SecurityPasswordPanel';

export interface MbrSecurityFeatureProps {
  isSandbox?: boolean;
  initialSubTab?: SecuritySubTab;
}

const SANDBOX_SECURITY_KEY = 'sb_sandbox_security_status';

export default function MbrSecurityFeature({
  isSandbox = false,
  initialSubTab = 'username-email',
}: MbrSecurityFeatureProps) {
  const [activeSubTab, setActiveSubTab] = useState<SecuritySubTab>(initialSubTab);
  const [status, setStatus] = useState<SecurityStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const loadStatus = async (isManualRefresh = false) => {
    if (isManualRefresh) setRefreshing(true);
    else setLoading(true);
    try {
      if (isSandbox) {
        const saved = sessionStorage.getItem(SANDBOX_SECURITY_KEY);
        if (saved) {
          setStatus(JSON.parse(saved));
        } else {
          const mock: SecurityStatusResponse = {
            email: 'member@example.com',
            email_verified: true,
            email_verified_at: new Date(Date.now() - 10 * 86400000).toISOString(),
            mfa_enabled: true,
            mfa_method_cd: 'EMAIL',
            trusted_device_ttl_days: 30,
            trusted_devices: [
              {
                trustedDeviceId: 'sandbox-device-1',
                deviceLabel: 'Chrome on Windows',
                ipAddress: '127.0.0.1',
                lastUsedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 29 * 86400000).toISOString(),
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                isCurrentDevice: true,
              },
            ],
          };
          sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(mock));
          setStatus(mock);
        }
      } else {
        const res = await authSecurityApi.getSecurityStatus();
        setStatus(res);
      }
    } catch (err) {
      console.warn('Could not load security status:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, [isSandbox]);

  const handleStatusUpdated = async (updated?: SecurityStatusResponse) => {
    if (isSandbox && updated) {
      sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(updated));
      setStatus(updated);
      return;
    }
    await loadStatus(true);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 py-4 sm:py-6 relative">
      {/* Floating Toast */}
      {toastMessage && (
        <div className="fixed bottom-20 lg:bottom-6 right-4 sm:right-6 z-50 px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-xl flex items-center gap-2 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start">
        {/* LEFT COLUMN */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-5">
          <SecurityPageHeaderPanel />

          <SecurityNavigationMenu
            activeSubTab={activeSubTab}
            onSelectTab={setActiveSubTab}
          />

          {/* Security Status Hero Card */}
          <div className="bg-gradient-to-br from-[#1E293B] via-indigo-950 to-[#0F172A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-indigo-700/50 space-y-2.5">
            <div className="absolute -right-3 -bottom-3 opacity-10 text-indigo-300 pointer-events-none">
              <ShieldCheck className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <div className="flex items-center justify-between relative z-10">
              <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-indigo-200 uppercase">
                ACCOUNT PROTECTION
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  status?.mfa_enabled
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/30'
                }`}
              >
                {status?.mfa_enabled ? 'MFA ON' : 'MFA OFF'}
              </span>
            </div>
            <div className="space-y-1 relative z-10 text-xs">
              <div className="flex items-center gap-1.5 text-slate-200">
                {status?.email_verified ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span>{status?.email_verified ? 'Email Verified' : 'Email Unverified'}</span>
              </div>
              <div className="text-[11px] text-indigo-200/80">
                {status?.trusted_devices?.length || 0} trusted browser{(status?.trusted_devices?.length || 0) === 1 ? '' : 's'}
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT COLUMN */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          <SecurityHeader
            activeSubTab={activeSubTab}
            refreshing={refreshing}
            onRefresh={() => void loadStatus(true)}
          />

          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-serif text-xs text-slate-500">Loading your security settings...</p>
            </div>
          ) : (
            <>
              {activeSubTab === 'username-email' && (
                <SecurityUsernameEmailPanel
                  status={status}
                  isSandbox={isSandbox}
                  onStatusUpdated={handleStatusUpdated}
                  onNotify={showToast}
                />
              )}

              {activeSubTab === 'trusted-devices' && (
                <SecurityTrustedDevicesPanel
                  status={status}
                  isSandbox={isSandbox}
                  onStatusUpdated={handleStatusUpdated}
                  onNotify={showToast}
                />
              )}

              {activeSubTab === 'password' && (
                <SecurityPasswordPanel
                  isSandbox={isSandbox}
                  onDevicesRevoked={() => handleStatusUpdated()}
                  onNotify={showToast}
                />
              )}
            </>
          )}

          <div className="pt-6 flex justify-center">
            <AdminComponentTag name="MbrSecurityFeature" />
          </div>
        </main>
      </div>
    </div>
  );
}
