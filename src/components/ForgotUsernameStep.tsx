/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserSearch, User, Calendar, Loader2, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { AdminComponentTag } from './AdminComponentTag';
import { authSecurityApi } from '@/src/services/api';

interface ForgotUsernameStepProps {
  onBackToLogin: () => void;
  onGoToForgotPassword: () => void;
}

export default function ForgotUsernameStep({
  onBackToLogin,
  onGoToForgotPassword,
}: ForgotUsernameStepProps) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!firstName.trim() || !lastName.trim() || !birthDate) {
      setError('Please enter your first name, last name, and birth date.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await authSecurityApi.forgotUsername({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        birth_date: birthDate,
      });
      setSubmittedMessage(res.message);
    } catch (err: any) {
      setError(err?.message || 'Unable to process your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-5">
      {submittedMessage ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-7 h-7" />
          </div>
          <div className="space-y-1.5">
            <h3 className="font-serif text-xl font-black text-slate-800">Check Your Email</h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed">{submittedMessage}</p>
          </div>
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all shadow-md cursor-pointer"
            >
              Back to Sign In
            </button>
            <button
              type="button"
              onClick={onGoToForgotPassword}
              className="w-full py-2 text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              Need to reset your password too?
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
              <UserSearch className="w-6 h-6" />
            </div>
            <h3 className="font-serif text-xl font-black text-slate-800">Forgot Username (Email)</h3>
            <p className="text-xs text-slate-500 font-serif leading-relaxed">
              Enter your profile details below. If we find a matching account, we&rsquo;ll email your sign-in address directly to your inbox.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="First name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      if (error) setError(null);
                    }}
                    placeholder="Last name"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider font-mono mb-1">
                Birth Date <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="date"
                  required
                  value={birthDate}
                  onChange={(e) => {
                    setBirthDate(e.target.value);
                    if (error) setError(null);
                  }}
                  className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
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
                  <span>Looking Up Account...</span>
                </>
              ) : (
                <span>Send Username Reminder</span>
              )}
            </button>
          </form>

          <div className="pt-2 border-t border-slate-100 text-center">
            <button
              type="button"
              onClick={onBackToLogin}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </button>
          </div>
        </>
      )}

      <AdminComponentTag name="ForgotUsernameStep" />
    </div>
  );
}
