/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2, ShieldAlert } from 'lucide-react';
import { authSecurityApi } from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SecurityPasswordPanelProps {
  isSandbox?: boolean;
  onDevicesRevoked?: () => Promise<void> | void;
  onNotify?: (msg: string) => void;
}

export default function SecurityPasswordPanel({
  isSandbox = false,
  onDevicesRevoked,
  onNotify,
}: SecurityPasswordPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [revokeDevices, setRevokeDevices] = useState(false);

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const passwordStrength = (() => {
    if (!newPassword) return { label: '', color: 'bg-slate-200', width: 'w-0' };
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (newPassword.length >= 12) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/\d/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    if (score <= 2) return { label: 'Weak', color: 'bg-rose-500', width: 'w-1/3' };
    if (score <= 3) return { label: 'Good', color: 'bg-amber-500', width: 'w-2/3' };
    return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
  })();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }
    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setSubmitting(true);
    try {
      if (isSandbox) {
        await new Promise((r) => setTimeout(r, 400));
        const msg = 'Password updated successfully (Sandbox).';
        setSuccessMsg(msg);
        onNotify?.(msg);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        return;
      }

      const res = await authSecurityApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        revoke_trusted_devices: revokeDevices,
      });

      const msg =
        res.revokedTrustedDevices > 0
          ? `${res.message} (${res.revokedTrustedDevices} trusted device${res.revokedTrustedDevices > 1 ? 's' : ''} revoked).`
          : res.message;
      setSuccessMsg(msg);
      onNotify?.(msg);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setRevokeDevices(false);
      if (res.revokedTrustedDevices > 0) {
        await onDevicesRevoked?.();
      }
    } catch (err: any) {
      setError(err?.message || 'Could not update your password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
      <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
          <KeyRound className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Change Your Password
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose a strong password of at least 8 characters combining letters, numbers, and symbols.
          </p>
        </div>
      </div>

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

      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
        {/* Current Password */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Current Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Enter current password"
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showCurrent ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              minLength={8}
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="At least 8 characters"
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          {newPassword && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-200 ${passwordStrength.color} ${passwordStrength.width}`} />
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-500">{passwordStrength.label}</span>
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <div>
          <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-1.5">
            Confirm New Password <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (error) setError(null);
              }}
              placeholder="Re-enter new password"
              className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500"
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirm ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Optional Revoke Trusted Devices */}
        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 cursor-pointer">
          <input
            type="checkbox"
            checked={revokeDevices}
            onChange={(e) => setRevokeDevices(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <div className="text-xs leading-snug">
            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              <span>Revoke all trusted devices after changing password</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Recommended if you suspect unauthorized access. Every browser will require Email MFA again.
            </p>
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting || !currentPassword || !newPassword || !confirmPassword}
          className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white text-xs font-bold shadow-sm transition-all cursor-pointer inline-flex items-center gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating Password...</span>
            </>
          ) : (
            <>
              <KeyRound className="w-4 h-4" />
              <span>Update Password</span>
            </>
          )}
        </button>
      </form>

      <AdminComponentTag name="SecurityPasswordPanel" />
    </div>
  );
}
