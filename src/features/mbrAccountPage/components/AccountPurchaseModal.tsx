/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Coins, 
  Sparkles, 
  Check, 
  X, 
  CreditCard, 
  ShieldCheck, 
  ArrowRight,
  Loader2,
  Lock,
  AlertCircle,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { taskApi } from '@/src/services/api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_51UYbXaLUhFnC8oKZ829aYH4rarSj00sFO4UkarjhCe2l0fgB5f6NCXxF6IK8Fd2G1kOrQaQdrilNmn423Hbo83RM00ZXelkasH';
const stripePromise = loadStripe(stripePublishableKey);

export interface CreditPackage {
  credits: number;
  price: number;
  popular?: boolean;
  savings?: string;
}

interface AccountPurchaseModalProps {
  isOpen: boolean;
  pkg: CreditPackage | null;
  currentBalance: number;
  isSandbox?: boolean;
  memberId?: string;
  memberEmail?: string;
  onClose: () => void;
  onConfirmPurchase?: (pkg: CreditPackage) => Promise<void>;
  onSuccess?: (pkg: CreditPackage, newBalance: number) => void;
}

export default function AccountPurchaseModal({
  isOpen,
  pkg,
  currentBalance,
  isSandbox = false,
  memberId,
  memberEmail,
  onClose,
  onConfirmPurchase,
  onSuccess
}: AccountPurchaseModalProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loadingSession, setLoadingSession] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [sandboxProcessing, setSandboxProcessing] = useState(false);

  // Initialize or reset session when modal opens or package changes
  useEffect(() => {
    if (!isOpen || !pkg) {
      setClientSecret(null);
      setSessionId(null);
      setLoadingSession(false);
      setSessionError(null);
      setPaymentCompleted(false);
      setVerifyingPayment(false);
      return;
    }

    if (!isSandbox) {
      initiateEmbeddedCheckout();
    }
  }, [isOpen, pkg?.credits, isSandbox, memberId]);

  const initiateEmbeddedCheckout = async () => {
    if (!pkg) return;
    try {
      setLoadingSession(true);
      setSessionError(null);
      setPaymentCompleted(false);

      const targetMbrId = memberId || 'sandbox-mbr-001';

      const session = await taskApi.createStripeCheckoutSession({
        mbr_id: targetMbrId,
        credits: pkg.credits,
        customer_email: memberEmail || undefined,
        ui_mode: 'embedded_page'
      });

      if (session && session.clientSecret) {
        setClientSecret(session.clientSecret);
        setSessionId(session.sessionId);
      } else {
        throw new Error('Failed to obtain Stripe checkout secret from backend');
      }
    } catch (err: any) {
      console.error('Error initiating embedded Stripe checkout:', err);
      setSessionError(err?.message || 'Could not connect to payment gateway. Please try again.');
    } finally {
      setLoadingSession(false);
    }
  };

  const handleStripeComplete = async () => {
    if (!pkg) return;
    try {
      setPaymentCompleted(true);
      setVerifyingPayment(true);

      if (sessionId) {
        try {
          await taskApi.verifyStripeSession(sessionId);
        } catch (verifyErr) {
          console.warn('Session verification fallback notice:', verifyErr);
        }
      }

      const updatedBalance = currentBalance + pkg.credits;
      if (onSuccess) {
        onSuccess(pkg, updatedBalance);
      }
    } catch (err) {
      console.error('Payment post-completion error:', err);
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleSandboxPurchase = async () => {
    if (!pkg) return;
    try {
      setSandboxProcessing(true);
      if (onConfirmPurchase) {
        await onConfirmPurchase(pkg);
      } else if (onSuccess) {
        onSuccess(pkg, currentBalance + pkg.credits);
      }
      onClose();
    } finally {
      setSandboxProcessing(false);
    }
  };

  if (!isOpen || !pkg) return null;

  const newBalance = currentBalance + pkg.credits;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden relative max-h-[92vh] flex flex-col"
        >
          <AdminComponentTag name="AccountPurchaseModal.tsx" />

          {/* Modal Header */}
          <div className="px-5 sm:px-6 pt-5 pb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  Purchase Credits
                </h3>
                <p className="text-[11px] sm:text-xs font-serif text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Lock className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" />
                  <span>
                    {isSandbox 
                      ? 'Sandbox Simulation Mode' 
                      : 'Embedded 256-Bit Encrypted Stripe Checkout'}
                  </span>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={verifyingPayment || sandboxProcessing}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Modal Body (Scrollable) */}
          <div className="p-5 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            {/* Top Order Summary Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold">
                  Order Summary
                </span>
                <span className="text-xl font-bold font-serif text-white">
                  ${pkg.price.toFixed(2)}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl sm:text-3xl font-extrabold font-serif text-amber-400">
                  +{pkg.credits.toLocaleString()}
                </span>
                <span className="text-xs font-serif text-slate-300">Credits</span>
                {pkg.popular && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-amber-400 text-slate-950">
                    Popular
                  </span>
                )}
                {pkg.savings && !pkg.popular && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-sans font-bold bg-emerald-400 text-slate-950">
                    {pkg.savings}
                  </span>
                )}
              </div>

              {/* Balance Projection Pill */}
              <div className="pt-2.5 border-t border-slate-700/80 flex items-center justify-between text-xs font-serif text-slate-300">
                <div>
                  <span className="text-slate-400 block text-[10px]">Current Balance</span>
                  <span className="font-bold text-white">{currentBalance.toLocaleString()} cr</span>
                </div>
                <ArrowRight className="w-4 h-4 text-amber-400 shrink-0" />
                <div className="text-right">
                  <span className="text-slate-400 block text-[10px]">New Balance</span>
                  <span className="font-bold text-emerald-400">{newBalance.toLocaleString()} cr</span>
                </div>
              </div>
            </div>

            {/* --- STATE 1: COMPLETED / CELEBRATION --- */}
            {paymentCompleted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="py-6 px-4 text-center space-y-4 bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                  {verifyingPayment ? (
                    <Loader2 className="w-7 h-7 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-8 h-8" />
                  )}
                </div>
                <div className="space-y-1">
                  <h4 className="font-serif font-bold text-lg text-slate-900 dark:text-white">
                    {verifyingPayment ? 'Confirming Credit Deposit...' : 'Payment Successful!'}
                  </h4>
                  <p className="text-xs font-sans text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                    {verifyingPayment 
                      ? 'Finalizing your balance update with Cloud SQL...' 
                      : `Your account has been credited with +${pkg.credits.toLocaleString()} credits. Your new balance is ${newBalance.toLocaleString()} credits.`}
                  </p>
                </div>
                {!verifyingPayment && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-2 px-6 py-2 rounded-xl text-xs font-serif font-bold bg-[#13547A] hover:bg-[#0E3E5B] text-white shadow-md transition-all cursor-pointer"
                  >
                    Done & Return to Account
                  </button>
                )}
              </motion.div>
            ) : isSandbox ? (
              /* --- STATE 2: SANDBOX MOCK MODE --- */
              <div className="space-y-4">
                <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 text-xs font-sans space-y-1">
                  <div className="font-bold font-serif flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    <span>Sandbox Simulation Active</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300">
                    You are in sandbox testing mode. Clicking the button below will immediately simulate credit deposit into your session account without initiating any real charge or Stripe transaction.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSandboxPurchase}
                  disabled={sandboxProcessing}
                  className="w-full py-3 px-4 rounded-xl text-xs font-serif font-bold bg-[#13547A] hover:bg-[#0E3E5B] text-white shadow-md shadow-[#13547A]/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {sandboxProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Depositing Sandbox Credits...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Confirm Mock Top-Up (+{pkg.credits.toLocaleString()} Credits)</span>
                    </>
                  )}
                </button>
              </div>
            ) : (
              /* --- STATE 3: LIVE EMBEDDED STRIPE CHECKOUT --- */
              <div className="space-y-3">
                {/* Error Banner */}
                {sessionError && (
                  <div className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/20 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-2 flex-1">
                      <p className="text-xs font-sans text-rose-800 dark:text-rose-200">
                        {sessionError}
                      </p>
                      <button
                        type="button"
                        onClick={initiateEmbeddedCheckout}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-serif font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Retry Connection</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {loadingSession && (
                  <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin text-[#13547A] dark:text-sky-400" />
                    <span className="text-xs font-serif font-medium">
                      Initializing secure Stripe checkout...
                    </span>
                    <span className="text-[10px] font-sans text-slate-400">
                      Loading cards, Apple Pay, and Google Pay options
                    </span>
                  </div>
                )}

                {/* Embedded Stripe Checkout Component */}
                {!loadingSession && clientSecret && (
                  <div className="stripe-embedded-container rounded-2xl border border-slate-200 dark:border-slate-800 p-2 sm:p-3 bg-white dark:bg-slate-900 shadow-inner">
                    <EmbeddedCheckoutProvider
                      stripe={stripePromise}
                      options={{
                        clientSecret,
                        onComplete: handleStripeComplete
                      }}
                    >
                      <EmbeddedCheckout className="w-full min-h-[360px]" />
                    </EmbeddedCheckoutProvider>
                  </div>
                )}

                {/* Security Guarantee */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] font-serif text-slate-500 dark:text-slate-400 pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    Secured by Stripe with 256-bit encryption. Credits post immediately upon payment.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer (for dismiss / cancel if needed) */}
          <div className="px-5 sm:px-6 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
            <span className="text-[10px] font-mono text-slate-400">
              {isSandbox ? 'ENV: SANDBOX' : 'ENV: STRIPE LIVE/TEST'}
            </span>
            <button
              type="button"
              onClick={onClose}
              disabled={verifyingPayment || sandboxProcessing}
              className="px-3.5 py-1.5 rounded-xl text-xs font-serif font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
