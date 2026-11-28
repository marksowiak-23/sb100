/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Laptop, Trash2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { authSecurityApi, SecurityStatusResponse } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SecurityTrustedDevicesPanelProps {
  status: SecurityStatusResponse | null;
  isSandbox?: boolean;
  onStatusUpdated: (updated?: SecurityStatusResponse) => Promise<void> | void;
  onNotify?: (msg: string) => void;
}

export default function SecurityTrustedDevicesPanel({
  status,
  isSandbox = false,
  onStatusUpdated,
  onNotify,
}: SecurityTrustedDevicesPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    onNotify?.(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleRevokeDevice = async (deviceId: string) => {
    setError(null);
    setRevokingId(deviceId);
    try {
      if (isSandbox && status) {
        const updated: SecurityStatusResponse = {
          ...status,
          trusted_devices: status.trusted_devices.filter((d) => d.trustedDeviceId !== deviceId),
        };
        await onStatusUpdated(updated);
        flashSuccess('Trusted device revoked.');
      } else {
        await authSecurityApi.revokeTrustedDevice(deviceId);
        flashSuccess('Trusted device revoked.');
        await onStatusUpdated();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not revoke trusted device.');
    } finally {
      setRevokingId(null);
    }
  };

  const handleRevokeAll = async () => {
    setError(null);
    setRevokingAll(true);
    try {
      if (isSandbox && status) {
        const updated: SecurityStatusResponse = { ...status, trusted_devices: [] };
        await onStatusUpdated(updated);
        flashSuccess('All trusted devices revoked.');
      } else {
        await authSecurityApi.revokeAllTrustedDevices();
        flashSuccess('All trusted devices have been revoked.');
        await onStatusUpdated();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not revoke trusted devices.');
    } finally {
      setRevokingAll(false);
    }
  };

  return (
    <div className="relative space-y-4">
      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Active Trusted Devices ({status?.trusted_devices?.length || 0})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browsers remembered for up to {status?.trusted_device_ttl_days ?? 30} days that skip email MFA verification codes.
              </p>
            </div>
          </div>

          {(status?.trusted_devices?.length || 0) > 0 && (
            <button
              type="button"
              disabled={revokingAll}
              onClick={handleRevokeAll}
              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer self-start sm:self-auto disabled:opacity-50"
            >
              {revokingAll ? 'Revoking...' : 'Revoke All Devices'}
            </button>
          )}
        </div>

        {!status?.trusted_devices || status.trusted_devices.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 font-serif bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            No trusted devices yet. Check &ldquo;Trust this device&rdquo; during your next Email MFA sign-in to remember a browser.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden">
            {status.trusted_devices.map((dev) => (
              <div
                key={dev.trustedDeviceId}
                className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-white dark:bg-slate-900"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{dev.deviceLabel}</span>
                    {dev.isCurrentDevice && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-mono font-bold">
                        This device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5">
                    {dev.ipAddress && <span>IP: {dev.ipAddress}</span>}
                    <span>Last used: {new Date(dev.lastUsedAt).toLocaleDateString()}</span>
                    <span>Expires: {new Date(dev.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  disabled={revokingId === dev.trustedDeviceId}
                  onClick={() => handleRevokeDevice(dev.trustedDeviceId)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200/80 cursor-pointer self-start sm:self-auto disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{revokingId === dev.trustedDeviceId ? 'Revoking...' : 'Revoke'}</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <AdminComponentTag name="SecurityTrustedDevicesPanel" />
    </div>
  );
}
