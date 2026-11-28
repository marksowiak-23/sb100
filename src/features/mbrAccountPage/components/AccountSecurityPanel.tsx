/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  MailCheck,
  Laptop,
  Trash2,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { authSecurityApi, SecurityStatusResponse } from '@/src/services/api';
import OtpCodeInput from '@/src/components/OtpCodeInput';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AccountSecurityPanelProps {
  isSandbox?: boolean;
  onNotify?: (msg: string) => void;
}

const SANDBOX_SECURITY_KEY = 'sb_sandbox_security_status';

export default function AccountSecurityPanel({ isSandbox = false, onNotify }: AccountSecurityPanelProps) {
  const [status, setStatus] = useState<SecurityStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // MFA Toggle confirmation
  const [pendingMfaState, setPendingMfaState] = useState<boolean | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [togglingMfa, setTogglingMfa] = useState(false);

  // Inline email verification
  const [verifyingEmailMode, setVerifyingEmailMode] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  // Device revocation
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [revokingAll, setRevokingAll] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    setError(null);
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
            mfa_enabled: false,
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
    } catch (err: any) {
      setError(err?.message || 'Unable to load security settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, [isSandbox]);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    onNotify?.(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
  };

  const handleConfirmMfaToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingMfaState === null) return;
    setError(null);
    setTogglingMfa(true);
    try {
      if (isSandbox && status) {
        const updated = { ...status, mfa_enabled: pendingMfaState };
        sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(updated));
        setStatus(updated);
        flashSuccess(`Email MFA ${pendingMfaState ? 'enabled' : 'disabled'} (Sandbox).`);
      } else {
        const res = await authSecurityApi.toggleMfa({
          enabled: pendingMfaState,
          password: confirmPassword,
        });
        flashSuccess(res?.message || `Email MFA ${pendingMfaState ? 'enabled' : 'disabled'}.`);
        await loadStatus();
      }
      setPendingMfaState(null);
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Could not update MFA setting.');
    } finally {
      setTogglingMfa(false);
    }
  };

  const handleSendVerifyEmail = async () => {
    setError(null);
    try {
      if (isSandbox) {
        setVerifyingEmailMode(true);
        flashSuccess('Sandbox verification code: 123456');
        return;
      }
      const res = await authSecurityApi.requestEmailVerification();
      setVerifyingEmailMode(true);
      flashSuccess(res?.message || 'Verification code sent to your email.');
    } catch (err: any) {
      setError(err?.message || 'Could not send verification email.');
    }
  };

  const handleSubmitEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmittingVerify(true);
    try {
      if (isSandbox && status) {
        const updated = { ...status, email_verified: true, email_verified_at: new Date().toISOString() };
        sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(updated));
        setStatus(updated);
        setVerifyingEmailMode(false);
        setVerifyCode('');
        flashSuccess('Email verified (Sandbox).');
      } else {
        await authSecurityApi.verifyEmail({ code: verifyCode });
        setVerifyingEmailMode(false);
        setVerifyCode('');
        flashSuccess('Your email address is now verified!');
        await loadStatus();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code.');
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleRevokeDevice = async (deviceId: string) => {
    setError(null);
    setRevokingId(deviceId);
    try {
      if (isSandbox && status) {
        const updated = {
          ...status,
          trusted_devices: status.trusted_devices.filter((d) => d.trustedDeviceId !== deviceId),
        };
        sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(updated));
        setStatus(updated);
        flashSuccess('Trusted device revoked.');
      } else {
        await authSecurityApi.revokeTrustedDevice(deviceId);
        flashSuccess('Trusted device revoked.');
        await loadStatus();
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
        const updated = { ...status, trusted_devices: [] };
        sessionStorage.setItem(SANDBOX_SECURITY_KEY, JSON.stringify(updated));
        setStatus(updated);
        flashSuccess('All trusted devices revoked.');
      } else {
        await authSecurityApi.revokeAllTrustedDevices();
        flashSuccess('All trusted devices have been revoked.');
        await loadStatus();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not revoke trusted devices.');
    } finally {
      setRevokingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center">
        <Loader2 className="w-7 h-7 animate-spin text-blue-600 mx-auto mb-2" />
        <p className="text-xs font-serif text-slate-500">Loading security settings...</p>
        <AdminComponentTag name="AccountSecurityPanel" />
      </div>
    );
  }

  return (
    <div className="relative space-y-5">
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

      {/* 1. Email Verification Status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MailCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Email Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Primary email: <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{status?.email}</span>
              </p>
            </div>
          </div>

          {status?.email_verified ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <button
              type="button"
              onClick={handleSendVerifyEmail}
              className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold cursor-pointer self-start sm:self-auto"
            >
              Send Verification Code
            </button>
          )}
        </div>

        {verifyingEmailMode && !status?.email_verified && (
          <form onSubmit={handleSubmitEmailCode} className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Enter the 6-digit code sent to <strong>{status?.email}</strong>:
            </p>
            <OtpCodeInput value={verifyCode} onChange={setVerifyCode} disabled={submittingVerify} />
            <div className="flex items-center gap-2 justify-center">
              <button
                type="submit"
                disabled={submittingVerify || verifyCode.length !== 6}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold cursor-pointer"
              >
                {submittingVerify ? 'Verifying...' : 'Confirm Code'}
              </button>
              <button
                type="button"
                onClick={() => setVerifyingEmailMode(false)}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 2. Two-Factor Authentication (Email MFA) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Two-Factor Authentication (Email Code)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Require a 6-digit security code emailed to you when signing in from an unrecognized device.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={!status?.email_verified && !status?.mfa_enabled}
            onClick={() => {
              setPendingMfaState(!status?.mfa_enabled);
              setConfirmPassword('');
              setError(null);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed ${
              status?.mfa_enabled
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
            }`}
          >
            {status?.mfa_enabled ? 'Disable MFA' : 'Enable Email MFA'}
          </button>
        </div>

        {pendingMfaState !== null && (
          <form
            onSubmit={handleConfirmMfaToggle}
            className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
          >
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-100">
              <Lock className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                Confirm your password to {pendingMfaState ? 'enable' : 'disable'} Email MFA
              </span>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Enter your current password"
                className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
              <button
                type="submit"
                disabled={togglingMfa || !confirmPassword}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-semibold cursor-pointer"
              >
                {togglingMfa ? 'Saving...' : 'Confirm'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingMfaState(null);
                  setConfirmPassword('');
                }}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 3. Trusted Devices */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Trusted Devices
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Browsers remembered for up to {status?.trusted_device_ttl_days ?? 30} days that skip email MFA prompts.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => void loadStatus()}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-800 hover:bg-slate-50 cursor-pointer"
              title="Refresh devices"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {(status?.trusted_devices?.length || 0) > 0 && (
              <button
                type="button"
                disabled={revokingAll}
                onClick={handleRevokeAll}
                className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold cursor-pointer disabled:opacity-50"
              >
                {revokingAll ? 'Revoking...' : 'Revoke All Devices'}
              </button>
            )}
          </div>
        </div>

        {!status?.trusted_devices || status.trusted_devices.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400 font-serif bg-slate-50/60 dark:bg-slate-800/30 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
            No trusted devices yet. Check &ldquo;Trust this device&rdquo; during your next MFA sign-in to remember a browser.
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

      <AdminComponentTag name="AccountSecurityPanel" />
    </div>
  );
}
