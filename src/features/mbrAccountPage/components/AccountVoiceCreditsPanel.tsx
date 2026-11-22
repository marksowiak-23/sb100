/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Mic, Volume2, ShieldCheck, ArrowRight } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { MbrAcct } from '@/src/services/api';
import { CreditPackage } from './AccountPurchaseModal';

interface AccountVoiceCreditsPanelProps {
  account: MbrAcct | null;
  onSelectPackage: (pkg: CreditPackage) => void;
  onOpenVoiceStudio?: () => void;
}

interface VoiceCreditPackage extends CreditPackage {
  estimateNote: string;
}

const VOICE_CREDIT_PACKAGES: VoiceCreditPackage[] = [
  {
    credits: 100,
    price: 15.0,
    creditType: 'voice',
    estimateNote: 'This typically equates to 8 to 11 voice story narrations. Varies based upon the length of your stories.'
  },
  {
    credits: 250,
    price: 30.0,
    popular: true,
    savings: 'Save $7.50',
    creditType: 'voice',
    estimateNote: 'Typically allows for 20 to 28 voice story narrations. Varies based upon the length of your stories.'
  },
  {
    credits: 400,
    price: 45.0,
    savings: 'Best Value',
    creditType: 'voice',
    estimateNote: 'Typically equates to 32 to 44 voice story narrations. Varies based upon the length of your stories.'
  }
];

export default function AccountVoiceCreditsPanel({
  onSelectPackage,
  onOpenVoiceStudio
}: AccountVoiceCreditsPanelProps) {
  return (
    <div className="space-y-7 sm:space-y-8">
      {/* --- SECTION 1: HOW DO VOICE CREDITS WORK? --- */}
      <section className="space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
          How do Voice Credits work?
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
          AI Voice Narration is a premium service that lets you bring your published stories to life in your own personal cloned AI voice or any of 6 studio AI voices. You can build and test your personal voice model at any time in <strong>My Profile &rarr; My Voice Translation</strong>; Voice Credits are used whenever you generate a keepsake audio narration for a published story.
        </p>
      </section>

      {/* --- SECTION 2: PURCHASE VOICE CREDIT PACKAGES --- */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Purchase Voice Credits
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
            Choose a Voice Credit package below to add credits to your Voice Credit balance.
          </p>
        </div>

        <div className="border-t border-purple-700/25 dark:border-slate-700 pt-1">
          {VOICE_CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className="flex items-center justify-between py-4 sm:py-5 border-b border-purple-700/25 dark:border-slate-700 transition-colors hover:bg-purple-50/40 dark:hover:bg-slate-800/40 px-2 sm:px-3 rounded-xl"
            >
              {/* Package Label */}
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Mic className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-sans text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Purchase {pkg.credits.toLocaleString()} Voice Credits
                    </span>
                    {pkg.popular && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-300 dark:border-purple-700">
                        Popular
                      </span>
                    )}
                    {pkg.savings && !pkg.popular && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700">
                        {pkg.savings}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-snug">
                    {pkg.estimateNote}
                  </p>
                </div>
              </div>

              {/* Price & Buy Button */}
              <div className="flex items-center gap-6 sm:gap-12 shrink-0">
                <span className="font-sans text-sm sm:text-base font-semibold text-slate-900 dark:text-white min-w-[65px] text-right">
                  ${pkg.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className="bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 text-white px-6 sm:px-7 py-1.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 3: QUICK LINKS & VOICE STUDIO INFO --- */}
      <section className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Personal AI Voice Studio</span>
              </span>
              {onOpenVoiceStudio && (
                <button
                  type="button"
                  onClick={onOpenVoiceStudio}
                  className="text-[11px] font-serif font-bold text-purple-700 dark:text-purple-400 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Open Studio</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Record a short calibration script to clone your voice and leave cherished stories narrated in your own voice for family and friends.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Credits Never Expire</span>
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Your purchased Voice Credits stay in your account until you use them—narrate stories at your own pace whenever you publish new memories.
            </p>
          </div>
        </div>
      </section>

      <AdminComponentTag name="AccountVoiceCreditsPanel" />
    </div>
  );
}
