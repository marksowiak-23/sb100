/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  KeyRound,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  ArrowLeft,
} from 'lucide-react';
import OtpCodeInput from './OtpCodeInput';
import { AdminComponentTag } from './AdminComponentTag';
import { authSecurityApi } from '@/src/services/api';

interface ForgotPasswordStepProps {
  initialEmail?: string;
  onComplete: (emailUsed: string) => void;
  onCancel: () => void;
}

export default function ForgotPasswordStep({
  initialEmail = '',
  onComplete,
  onCancel,
}: ForgotPasswordStepProps) {
  const [stage, setStage] = useState<'request' | 'reset' | 'done'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authSecurityApi.forgotPassword(email.trim());
      setInfoMessage(res.message);
      setCooldown(60);
      setStage('reset');
    } catch (err: any) {
      setError(err?.message || 'Unable to send reset code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setError(null);
    setInfoMessage(null);
    setResending(true);
    try {
      const res = await authSecurityApi.forgotPassword(email.trim());
      setInfoMessage(res.message);
      setCooldown(60);
      setCode('');
    } catch (err: any) {
      setError(err?.message || 'Could not resend reset code.');
    } finally {
      setResending(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (code.length !== 6) {
      setError('Please enter the 6-digit reset code from your email.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authSecurityApi.resetPassword({
        email: email.trim(),
        code,
        new_password: newPassword,
        revoke_trusted_devices: true,
      });
      setInfoMessage(res.message);
      setStage('done');
    } catch (err: any) {
      setError(err?.message || 'Could not reset password. Please verify your code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-5">
      {stage === 'done' ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-black text-slate-800">Password Reset Complete</h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed">
              {infoMessage || 'Your password has been updated. You can now sign in with your new password.'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onComplete(email.trim())}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all shadow-md cursor-pointer"
          >
            Back to Sign In
          </button>
        </div>
      ) : stage === 'request' ? (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-black text-slate-800">Reset Your Password</h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed">
              Enter the email address associated with your account and we&rsquo;ll send you a 6-digit password reset code.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRequestCode} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError(null);
                  }}
                  placeholder="you@example.com"
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Code...</span>
                </>
              ) : (
                <span>Send 6-Digit Reset Code</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-black text-slate-800">Enter Reset Code</h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed">
              Enter the 6-digit code sent to <span className="font-mono font-bold text-slate-700">{email}</span> and choose your new password.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs text-center font-medium">
              {infoMessage}
            </div>
          )}

          <form onSubmit={handleResetSubmit} className="space-y-4">
            <OtpCodeInput
              value={code}
              onChange={(val) => {
                setCode(val);
                if (error) setError(null);
              }}
              disabled={submitting}
            />

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                New Password
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
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNew ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                Confirm New Password
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
                  className="w-full pl-9 pr-9 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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

            <button
              type="submit"
              disabled={submitting || code.length !== 6 || !newPassword || !confirmPassword}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Resetting Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
            <button
              type="button"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>{cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}</span>
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </>
      )}

      <AdminComponentTag name="ForgotPasswordStep" />
    </div>
  );
}
