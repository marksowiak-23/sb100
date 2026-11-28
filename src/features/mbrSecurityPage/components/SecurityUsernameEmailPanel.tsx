/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MailCheck, ShieldCheck, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import { authSecurityApi, SecurityStatusResponse } from '@/src/services/api';
import OtpCodeInput from '@/src/components/OtpCodeInput';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SecurityUsernameEmailPanelProps {
  status: SecurityStatusResponse | null;
  isSandbox?: boolean;
  onStatusUpdated: (updated?: SecurityStatusResponse) => Promise<void> | void;
  onNotify?: (msg: string) => void;
}

export default function SecurityUsernameEmailPanel({
  status,
  isSandbox = false,
  onStatusUpdated,
  onNotify,
}: SecurityUsernameEmailPanelProps) {
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [verifyingEmailMode, setVerifyingEmailMode] = useState(false);
  const [verifyCode, setVerifyCode] = useState('');
  const [submittingVerify, setSubmittingVerify] = useState(false);

  const [pendingMfaState, setPendingMfaState] = useState<boolean | null>(null);
  const [confirmPassword, setConfirmPassword] = useState('');
  const [togglingMfa, setTogglingMfa] = useState(false);

  const flashSuccess = (msg: string) => {
    setSuccessMsg(msg);
    onNotify?.(msg);
    setTimeout(() => setSuccessMsg(null), 4000);
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
        const updated: SecurityStatusResponse = {
          ...status,
          email_verified: true,
          email_verified_at: new Date().toISOString(),
        };
        await onStatusUpdated(updated);
        setVerifyingEmailMode(false);
        setVerifyCode('');
        flashSuccess('Email verified (Sandbox).');
      } else {
        await authSecurityApi.verifyEmail({ code: verifyCode });
        setVerifyingEmailMode(false);
        setVerifyCode('');
        flashSuccess('Your email address is now verified!');
        await onStatusUpdated();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code.');
    } finally {
      setSubmittingVerify(false);
    }
  };

  const handleConfirmMfaToggle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pendingMfaState === null) return;
    setError(null);
    setTogglingMfa(true);
    try {
      if (isSandbox && status) {
        const updated: SecurityStatusResponse = { ...status, mfa_enabled: pendingMfaState };
        await onStatusUpdated(updated);
        flashSuccess(`Email MFA ${pendingMfaState ? 'enabled' : 'disabled'} (Sandbox).`);
      } else {
        const res = await authSecurityApi.toggleMfa({
          enabled: pendingMfaState,
          password: confirmPassword,
        });
        flashSuccess(res?.message || `Email MFA ${pendingMfaState ? 'enabled' : 'disabled'}.`);
        await onStatusUpdated();
      }
      setPendingMfaState(null);
      setConfirmPassword('');
    } catch (err: any) {
      setError(err?.message || 'Could not update MFA setting.');
    } finally {
      setTogglingMfa(false);
    }
  };

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

      {/* Email Verification Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <MailCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                Username &amp; Email Verification
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Sign-in email:{' '}
                <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">
                  {status?.email || '—'}
                </span>
              </p>
              {status?.email_verified && status.email_verified_at && (
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Verified on {new Date(status.email_verified_at).toLocaleDateString()}
                </p>
              )}
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

      {/* Two-Factor Authentication (Email MFA) Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
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
                Automatically enabled for all BackStory members. A 6-digit security code is emailed whenever you sign in from an unrecognized browser.
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Tip: Check &ldquo;Trust this device for 30 days&rdquo; during sign-in to skip codes on your personal browser, and manage remembered browsers under <strong>My Trusted Devices</strong>.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold self-start sm:self-auto shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Always Active
          </span>
        </div>
      </div>

      <AdminComponentTag name="SecurityUsernameEmailPanel" />
    </div>
  );
}
