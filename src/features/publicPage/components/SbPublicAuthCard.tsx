/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mail } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface SbPublicAuthCardProps {
  setActiveTab: (tab: any) => void;
  onSelectLogonType?: (type: 'Google' | 'Apple') => void;
}

export default function SbPublicAuthCard({ setActiveTab, onSelectLogonType }: SbPublicAuthCardProps) {
  const handleSocialLogin = (provider: 'Google' | 'Apple') => {
    if (onSelectLogonType) {
      onSelectLogonType(provider);
    } else {
      if (provider === 'Google') {
        setActiveTab('mbrHomePage');
      } else {
        alert(`Initiating simulated ${provider} OAuth sign-in flow...`);
      }
    }
  };

  return (
    <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col gap-5 relative">
      <div>
        <h3 className="font-serif text-lg font-bold text-slate-800">
          Welcome Back
        </h3>
        <p className="text-xs text-slate-400 mt-1 font-medium">
          Sign in to continue your story
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {/* Google Sign In */}
        <button
          onClick={() => handleSocialLogin('Google')}
          className="w-full flex items-center justify-center gap-2.5 py-3 border border-slate-150 hover:bg-slate-50 text-slate-650 hover:text-slate-800 font-semibold text-xs rounded-2xl transition-all duration-150 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Apple Sign In */}
        <button
          onClick={() => handleSocialLogin('Apple')}
          className="w-full flex items-center justify-center gap-2.5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-2xl transition-all duration-150 shadow-sm cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" xmlns="http://www.w3.org/2000/svg">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-.96.04-2.13.64-2.82 1.45-.6.69-1.12 1.84-.98 2.94.12 0 2.15-.52 2.81-1.33z" />
          </svg>
          <span>Continue with Apple</span>
        </button>

        {/* Email & Password Sign In Option */}
        <button
          onClick={() => setActiveTab('mbrLogonPage')}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs rounded-2xl transition-all duration-150 cursor-pointer mt-0.5"
        >
          <Mail className="w-3.5 h-3.5 text-slate-500" />
          <span>Sign In with Email</span>
        </button>
      </div>

      <div className="text-center pt-2 border-t border-slate-50">
        <span className="text-[10px] text-slate-400 font-semibold">
          Don't have an account?{' '}
          <button
            onClick={() => setActiveTab('mbrRegistrationPage')}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Sign up
          </button>
        </span>
      </div>

      <AdminComponentTag name="SbPublicAuthCard" />
    </div>
  );
}
