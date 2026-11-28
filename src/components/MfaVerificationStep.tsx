/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ShieldCheck, Loader2, AlertCircle, RefreshCw, ArrowLeft, Laptop } from 'lucide-react';
import OtpCodeInput from './OtpCodeInput';
import { AdminComponentTag } from './AdminComponentTag';
import { authSecurityApi } from '@/src/services/api';

interface MfaVerificationStepProps {
  challengeToken: string;
  maskedEmail: string;
  onVerified: (response: any) => void;
  onCancel?: () => void;
}

export default function MfaVerificationStep({
  challengeToken,
  maskedEmail,
  onVerified,
  onCancel,
}: MfaVerificationStepProps) {
  const [code, setCode] = useState('');
  const [trustDevice, setTrustDevice] = useState(true);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);
    if (code.length !== 6) {
      setError('Please enter the 6-digit security code from your email.');
      return;
    }

    setIsVerifying(true);
    try {
      const res = await authSecurityApi.verifyMfa({
        challenge_token: challengeToken,
        code,
        trust_device: trustDevice,
      });
      onVerified(res);
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || isResending) return;
    setError(null);
    setInfoMessage(null);
    setIsResending(true);
    try {
      const res = await authSecurityApi.resendMfa({ challenge_token: challengeToken });
      setInfoMessage(res?.message || `A new security code was sent to ${maskedEmail}.`);
      setCooldown(60);
      setCode('');
    } catch (err: any) {
      setError(err?.message || 'Could not resend security code.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="relative space-y-5">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h3 className="font-serif text-xl font-black text-slate-800">
          Two-Factor Verification
        </h3>
        <p className="text-xs text-slate-500 font-serif leading-relaxed">
          Enter the 6-digit security code sent to{' '}
          <span className="font-mono font-bold text-slate-700">{maskedEmail}</span>{' '}
          to complete your sign-in.
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <OtpCodeInput value={code} onChange={(val) => { setCode(val); if (error) setError(null); }} disabled={isVerifying} />

        <label className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:bg-slate-100/70 transition-colors">
          <input
            type="checkbox"
            checked={trustDevice}
            onChange={(e) => setTrustDevice(e.target.checked)}
            className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
          />
          <div className="text-xs leading-snug">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Laptop className="w-3.5 h-3.5 text-blue-600" />
              <span>Trust this device for 30 days</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Skip email verification codes on this browser. You can revoke trusted devices anytime in Account Security.
            </p>
          </div>
        </label>

        <button
          type="submit"
          disabled={isVerifying || code.length !== 6}
          className="w-full py-3 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white font-semibold text-xs rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
        >
          {isVerifying ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <span>Verify &amp; Sign In</span>
          )}
        </button>
      </form>

      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <button
          type="button"
          onClick={handleResend}
          disabled={cooldown > 0 || isResending}
          className="inline-flex items-center gap-1.5 font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 cursor-pointer disabled:cursor-not-allowed"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isResending ? 'animate-spin' : ''}`} />
          <span>{cooldown > 0 ? `Resend code (${cooldown}s)` : 'Resend code'}</span>
        </button>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Use another account</span>
          </button>
        )}
      </div>

      <AdminComponentTag name="MfaVerificationStep" />
    </div>
  );
}
