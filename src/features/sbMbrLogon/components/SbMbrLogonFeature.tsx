/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Loader2, AlertCircle, ArrowLeft, ShieldCheck, LogIn } from 'lucide-react';
import { userManager } from '@/src/services/userManager';

interface SbMbrLogonProps {
  logonType: 'Google' | 'Apple';
  setActiveTab: (tab: any) => void;
}

/**
 * SbMbrLogon Feature Component
 * Authenticates user, stores user record in session storage, and navigates to the home page.
 */
export default function SbMbrLogonFeature({ logonType, setActiveTab }: SbMbrLogonProps) {
  const [statusState, setStatusState] = useState<'authenticating' | 'success' | 'failed'>('authenticating');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const performLogon = async () => {
      // Simulate a minor 1.2s delay for visual premium loading animations
      await new Promise((resolve) => setTimeout(resolve, 1200));

      if (!active) return;

      try {
        // Pass "msowiak" to get the user record as requested
        const result = await userManager.userLogon('msowiak');

        if (!active) return;

        if (result.success && result.user) {
          // Put the user record in local session storage
          sessionStorage.setItem('user', JSON.stringify(result.user));
          setStatusState('success');

          // Brief delay to display the success check animation before transition
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!active) return;

          // Navigate to the sbMbrHomePage
          setActiveTab('sbMbrHomePage');
        } else {
          setStatusState('failed');
          setErrorMessage(result.error || 'Logon Failed');
        }
      } catch (err: any) {
        if (!active) return;
        setStatusState('failed');
        setErrorMessage(err.message || 'Logon Failed');
      }
    };

    performLogon();

    return () => {
      active = false;
    };
  }, [logonType, setActiveTab]);

  return (
    <div className="w-full min-h-[70vh] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center flex flex-col items-center gap-6"
      >
        {/* --- BRAND HEADER ACCENT --- */}
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-50/50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold">
          <LogIn className="w-3.5 h-3.5" />
          <span>Storybook Secure Authentication</span>
        </div>

        {/* --- AUTHENTICATING STATE --- */}
        {statusState === 'authenticating' && (
          <div className="flex flex-col items-center gap-4 my-4">
            <div className="relative flex items-center justify-center">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              <div className="absolute font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">
                {logonType[0]}
              </div>
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-800">
                Connecting with {logonType}
              </h3>
              <p className="text-xs text-slate-450 mt-1.5 leading-relaxed font-serif">
                Verifying your credentials and establishing a secure connection to sbDB100...
              </p>
            </div>
          </div>
        )}

        {/* --- SUCCESS STATE --- */}
        {statusState === 'success' && (
          <div className="flex flex-col items-center gap-4 my-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 15 }}
              className="w-16 h-16 bg-emerald-50 border border-emerald-150 rounded-full flex items-center justify-center text-emerald-600"
            >
              <ShieldCheck className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-800">
                Logon Successful
              </h3>
              <p className="text-xs text-emerald-600 mt-1 font-semibold">
                Welcome back, msowiak!
              </p>
              <p className="text-xs text-slate-400 mt-1 font-serif">
                Loading your author workspace dashboard...
              </p>
            </div>
          </div>
        )}

        {/* --- FAILED STATE --- */}
        {statusState === 'failed' && (
          <div className="flex flex-col items-center gap-4 my-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-16 h-16 bg-rose-50 border border-rose-150 rounded-full flex items-center justify-center text-rose-600"
            >
              <AlertCircle className="w-8 h-8" />
            </motion.div>
            <div>
              <h3 className="font-serif text-lg font-bold text-slate-800">
                Logon Failed
              </h3>
              <p className="text-xs text-rose-600 mt-1.5 font-semibold">
                {errorMessage || 'Logon Failed'}
              </p>
              <p className="text-xs text-slate-400 mt-1 font-serif leading-relaxed">
                We couldn't retrieve your member profile record. Please check your network connection or try again.
              </p>
            </div>

            <button
              onClick={() => setActiveTab('sbPublicPage')}
              className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl transition-all duration-150 shadow-sm cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
