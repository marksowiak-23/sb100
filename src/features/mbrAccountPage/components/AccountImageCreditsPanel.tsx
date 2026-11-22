/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Image as ImageIcon, Sparkles, ShieldCheck } from 'lucide-react';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { MbrAcct } from '@/src/services/api';
import { CreditPackage } from './AccountPurchaseModal';

interface AccountImageCreditsPanelProps {
  account: MbrAcct | null;
  onSelectPackage: (pkg: CreditPackage) => void;
}

interface ImageCreditPackage extends CreditPackage {
  estimateNote: string;
}

const IMAGE_CREDIT_PACKAGES: ImageCreditPackage[] = [
  {
    credits: 100,
    price: 15.0,
    creditType: 'image',
    estimateNote: 'Typically equates to around 12 AI-illustrated stories (6 high-resolution 2K photos per story, plus refinements & animations).'
  },
  {
    credits: 250,
    price: 30.0,
    popular: true,
    savings: 'Save $7.50',
    creditType: 'image',
    estimateNote: 'Typically allows for around 31 AI-illustrated stories with 2K photo generation, chat refinements, and living photo animations.'
  },
  {
    credits: 400,
    price: 45.0,
    savings: 'Best Value',
    creditType: 'image',
    estimateNote: 'Typically equates to 50 AI-illustrated stories—ideal for richly illustrated family memoirs and contemporary photo stories.'
  }
];

export default function AccountImageCreditsPanel({
  onSelectPackage
}: AccountImageCreditsPanelProps) {
  return (
    <div className="space-y-7 sm:space-y-8">
      {/* --- SECTION 1: HOW DO IMAGE CREDITS WORK? --- */}
      <section className="space-y-2.5">
        <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
          How do Image Credits work?
        </h2>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
          AI Photo Generation is a creative studio built right into the <strong>Story Editor (Photo Layout)</strong> that turns your written memories into crisp, 2K-resolution photographs—both contemporary and classic heirloom styles. You can generate 6 custom scenes per story, refine any picture through chat, and animate scenes into Living Photos. Image Credits are only charged when you save your selected AI images to a story (at most once per story per day).
        </p>
      </section>

      {/* --- SECTION 2: PURCHASE IMAGE CREDIT PACKAGES --- */}
      <section className="space-y-4">
        <div className="space-y-1.5">
          <h2 className="text-base sm:text-lg font-bold font-serif text-slate-900 dark:text-white tracking-tight">
            Purchase Image Credits
          </h2>
          <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-sans max-w-3xl">
            Choose an Image Credit package below to add credits to your Image Credit balance.
          </p>
        </div>

        <div className="border-t border-teal-700/25 dark:border-slate-700 pt-1">
          {IMAGE_CREDIT_PACKAGES.map((pkg) => (
            <div
              key={pkg.credits}
              className="flex items-center justify-between py-4 sm:py-5 border-b border-teal-700/25 dark:border-slate-700 transition-colors hover:bg-teal-50/40 dark:hover:bg-slate-800/40 px-2 sm:px-3 rounded-xl"
            >
              {/* Package Label */}
              <div className="flex items-start gap-3 min-w-0 pr-3">
                <div className="w-8 h-8 rounded-xl bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0 mt-0.5">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-sans text-sm sm:text-base font-medium text-slate-900 dark:text-white">
                      Purchase {pkg.credits.toLocaleString()} Image Credits
                    </span>
                    {pkg.popular && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-sans font-semibold bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200 border border-teal-300 dark:border-teal-700">
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
                  className="bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-6 sm:px-7 py-1.5 rounded-lg text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                >
                  Buy
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- SECTION 3: AI PHOTO STUDIO INFO --- */}
      <section className="pt-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>2K AI Photo &amp; Living Motion Studio</span>
              </span>
            </div>
            <p className="text-[11px] font-sans text-slate-500 dark:text-slate-400 leading-relaxed">
              Choose from contemporary DSLR, editorial, cinematic 8K, or classic heirloom styles—refine any photo via chat and animate scenes directly in the Story Editor.
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
              Your purchased Image Credits remain in your account until you use them—illustrate your stories at your own pace whenever inspiration strikes.
            </p>
          </div>
        </div>
      </section>

      <AdminComponentTag name="AccountImageCreditsPanel" />
    </div>
  );
}
