/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Gift,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Ticket
} from 'lucide-react';
import {
  promoOfferApi,
  PromoOfferRedemption,
  MbrAcct
} from '@/src/services/api';
import { playUiSound } from '@/src/services/soundService';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';

interface AccountPromoOfferCardProps {
  isSandbox?: boolean;
  memberId?: string;
  onRedeemed?: (result: {
    message: string;
    storyCreditsGranted: number;
    voiceCreditsGranted: number;
    imageCreditsGranted: number;
    account?: MbrAcct;
  }) => void | Promise<void>;
}

const SANDBOX_REDEMPTIONS_KEY = 'sb_sandbox_promo_redemptions';

const SANDBOX_OFFERS: Record<
  string,
  { offerName: string; storyCredits: number; voiceCredits: number; imageCredits: number }
> = {
  WELCOME2026: { offerName: 'Welcome BackStory Bonus', storyCredits: 25, voiceCredits: 10, imageCredits: 10 },
  STORYBOOST: { offerName: 'Story Author Boost', storyCredits: 50, voiceCredits: 0, imageCredits: 5 },
};

export default function AccountPromoOfferCard({
  isSandbox = false,
  memberId = '',
  onRedeemed,
}: AccountPromoOfferCardProps) {
  const [promoCode, setPromoCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [redemptions, setRedemptions] = useState<PromoOfferRedemption[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  const loadRedemptions = async () => {
    if (isSandbox) {
      try {
        const raw = sessionStorage.getItem(SANDBOX_REDEMPTIONS_KEY);
        setRedemptions(raw ? JSON.parse(raw) : []);
      } catch {
        setRedemptions([]);
      }
      return;
    }
    try {
      const list = await promoOfferApi.getMyRedemptions();
      setRedemptions(list || []);
    } catch {
      // Non-blocking
    }
  };

  useEffect(() => {
    loadRedemptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSandbox, memberId]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoCode.trim().toUpperCase();
    if (!cleaned) {
      setErrorMsg('Enter a promo code to redeem.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      if (isSandbox) {
        const offer = SANDBOX_OFFERS[cleaned];
        if (!offer) {
          setErrorMsg('Invalid promo code. Try WELCOME2026 or STORYBOOST in Sandbox mode.');
          return;
        }
        if (redemptions.some((r) => (r.promoCode || '').toUpperCase() === cleaned)) {
          setErrorMsg('You have already redeemed this promotional offer.');
          return;
        }
        const entry: PromoOfferRedemption = {
          promoOfferRedemptionId: `sb-redemp-${Date.now()}`,
          promoOfferId: `sb-offer-${cleaned}`,
          promoCode: cleaned,
          offerName: offer.offerName,
          mbrId: memberId || 'sandbox-mbr',
          storyCreditsGranted: offer.storyCredits,
          voiceCreditsGranted: offer.voiceCredits,
          imageCreditsGranted: offer.imageCredits,
          redeemedAt: new Date().toISOString(),
        };
        const updated = [entry, ...redemptions];
        setRedemptions(updated);
        sessionStorage.setItem(SANDBOX_REDEMPTIONS_KEY, JSON.stringify(updated));

        const parts: string[] = [];
        if (offer.storyCredits > 0) parts.push(`+${offer.storyCredits} Story`);
        if (offer.voiceCredits > 0) parts.push(`+${offer.voiceCredits} Voice`);
        if (offer.imageCredits > 0) parts.push(`+${offer.imageCredits} Image`);
        const msg = `${parts.join(', ')} credits added!`;
        setSuccessMsg(msg);
        setPromoCode('');
        playUiSound('STORY_SAVED');
        await onRedeemed?.({
          message: msg,
          storyCreditsGranted: offer.storyCredits,
          voiceCreditsGranted: offer.voiceCredits,
          imageCreditsGranted: offer.imageCredits,
        });
        return;
      }

      const res = await promoOfferApi.redeem(cleaned);
      setSuccessMsg(res.message);
      setPromoCode('');
      setRedemptions((prev) => [res.redemption, ...prev]);
      playUiSound('STORY_SAVED');
      await onRedeemed?.({
        message: res.message,
        storyCreditsGranted: res.storyCreditsGranted,
        voiceCreditsGranted: res.voiceCreditsGranted,
        imageCreditsGranted: res.imageCreditsGranted,
        account: res.account,
      });
    } catch (err: any) {
      setErrorMsg(err?.message || 'Unable to redeem promotional code.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200/80 dark:border-amber-800/70 flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Gift className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-serif font-bold text-slate-900 dark:text-white leading-tight">
              Promo Offers
            </h3>
            <p className="text-[10px] font-sans text-slate-500 dark:text-slate-400 leading-tight">
              Redeem a code for bonus credits
            </p>
          </div>
        </div>
        <Sparkles className="w-3.5 h-3.5 text-amber-500/80 shrink-0" />
      </div>

      <form onSubmit={handleRedeem} className="space-y-2">
        <input
          type="text"
          value={promoCode}
          onChange={(e) => {
            setPromoCode(e.target.value.toUpperCase());
            if (errorMsg) setErrorMsg(null);
            if (successMsg) setSuccessMsg(null);
          }}
          placeholder="ENTER PROMO CODE"
          maxLength={60}
          disabled={submitting}
          className="w-full px-3 py-2 text-xs font-mono font-semibold tracking-wider uppercase rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
        />
        <button
          type="submit"
          disabled={submitting || !promoCode.trim()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-serif font-bold bg-[#13547A] hover:bg-[#0e405e] disabled:opacity-50 text-white transition-colors cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Redeeming...</span>
            </>
          ) : (
            <>
              <Ticket className="w-3.5 h-3.5" />
              <span>Redeem Offer</span>
            </>
          )}
        </button>
      </form>

      {errorMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-[11px] text-rose-700 dark:text-rose-300 font-sans">
          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="flex items-start gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] text-emerald-700 dark:text-emerald-300 font-sans">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {redemptions.length > 0 && (
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setHistoryOpen((v) => !v)}
            className="w-full flex items-center justify-between text-[11px] font-sans font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            <span>Redeemed Offers ({redemptions.length})</span>
            {historyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {historyOpen && (
            <div className="mt-2 space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
              {redemptions.map((r) => (
                <div
                  key={r.promoOfferRedemptionId}
                  className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/70 space-y-1"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-mono font-bold text-slate-800 dark:text-slate-100 truncate">
                      {r.promoCode || 'PROMO'}
                    </span>
                    <span className="text-[10px] font-sans text-slate-400 shrink-0">
                      {new Date(r.redeemedAt).toLocaleDateString()}
                    </span>
                  </div>
                  {r.offerName && (
                    <div className="text-[10px] font-sans text-slate-500 dark:text-slate-400 truncate">
                      {r.offerName}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {r.storyCreditsGranted > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                        +{r.storyCreditsGranted} Story
                      </span>
                    )}
                    {r.voiceCreditsGranted > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300">
                        +{r.voiceCreditsGranted} Voice
                      </span>
                    )}
                    {r.imageCreditsGranted > 0 && (
                      <span className="px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-900/40 text-teal-800 dark:text-teal-300">
                        +{r.imageCreditsGranted} Image
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="pt-1 flex justify-center">
        <AdminComponentTag name="AccountPromoOfferCard" />
      </div>
    </div>
  );
}
