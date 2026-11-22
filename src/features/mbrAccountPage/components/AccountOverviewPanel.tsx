/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BookOpen, Coins, ShieldCheck } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { CreditPackage } from './AccountPurchaseModal';

interface AccountOverviewPanelProps {
  onSelectPackage: (pkg: CreditPackage) => void;
}

interface StoryCreditPackage extends CreditPackage {
  estimateNote: string;
}

const CREDIT_PACKAGES: StoryCreditPackage[] = [
  {
    credits: 1500,
    price: 29.0,
    estimateNote: 'Typically allows for 8 to 12 published stories. Varies based upon individual use of the site and associated tools.'
  },
  {
    credits: 3500,
    price: 49.0,
    popular: true,
    savings: 'Save $18',
    estimateNote: 'Typically allows for 19 to 28 published stories. Varies based upon individual use of the site and associated tools.'
  },
  {
    credits: 6500,
    price: 69.0,
    savings: 'Best Value',
    estimateNote: 'Equates to an estimated 35 to 52 published stories. Varies based upon individual use of the site and associated tools.'
  }
];

export default function AccountOverviewPanel({
  onSelectPackage
}: AccountOverviewPanelProps) {
  return (
    <div className="space-y-7 sm:space-y-8">
      {/* --- SECTION 1: HOW DO CREDITS WORK? --- */}
      <section className="space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
          How do Story Credits work?
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
          Credits are used for AI features surrounding Story generation, formatting, and printing as well as voice narrative generation and other features. Upon registration, you were granted a starting set of credits that should support creating a handful of stories to be shared with family and friends. When credits run out, AI based features will be disabled.
        </p>
      </section>

      {/* --- SECTION 2: OUT OF CREDITS? & PURCHASE TIERS --- */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Out of credits?
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
            Purchase more credits to enable AI based features and continue to write your story.
          </p>
        </div>

        {/* --- PURCHASE TIERS LIST (EXACT MOCK-UP LAYOUT) --- */}
        <div className="border-t border-[#13547A]/30 dark:border-slate-700 pt-1">
          {CREDIT_PACKAGES.map((pkg, idx) => (
            <div
              key={pkg.credits}
              className="flex items-center justify-between py-4 sm:py-5 border-b border-[#13547A]/30 dark:border-slate-700 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 sm:px-3 rounded-xl"
            >
              {/* Package Label */}
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-[#13547A]/12 dark:bg-[#13547A]/30 text-[#13547A] dark:text-sky-300 border border-[#13547A]/20 flex items-center justify-center shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-sans text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Purchase {pkg.credits.toLocaleString()} Story Credits
                    </span>
                    {pkg.popular && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                        Popular
                      </span>
                    )}
                    {pkg.savings && !pkg.popular && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
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
              <div className="flex items-center gap-6 sm:gap-12">
                <span className="font-sans text-sm sm:text-base font-semibold text-slate-900 dark:text-white min-w-[65px] text-right">
                  ${pkg.price.toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className="bg-[#13547A] hover:bg-[#0E3E5B] text-white px-6 sm:px-7 py-1.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 3: QUICK ASSISTANCE / RATE SUMMARY CARDS --- */}
      <section className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span>Credit Usage Rates</span>
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Story Generation uses <strong>50 credits</strong>, High-Res PDF printing uses <strong>15 credits</strong>, and Voice Narration uses <strong>25 credits</strong>.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>Need Billing Support?</span>
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              If you experience an issue with credit deduction or need courtesy adjustments, contact our support team anytime.
            </p>
          </div>
        </div>
      </section>

      <AdminComponentTag name="AccountOverviewPanel" />
    </div>
  );
}
