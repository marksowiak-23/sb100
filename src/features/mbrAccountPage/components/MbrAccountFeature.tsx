/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Sparkles,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  taskApi,
  eventApi,
  MbrAcct,
  MbrAcctActivity,
  acctEventCreditApi
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { setCachedCreditBalance } from '@/src/services/creditBalanceService';
import { generateAccountStatementPdf } from '../utils/generateAccountStatementPdf';
import AccountHeader from './AccountHeader';
import AccountPageHeaderPanel from './AccountPageHeaderPanel';
import AccountNavigationMenu, { AccountSubTab } from './AccountNavigationMenu';
import AccountOverviewPanel from './AccountOverviewPanel';
import AccountPurchaseModal, { CreditPackage } from './AccountPurchaseModal';
import AccountLedgerPanel from './AccountLedgerPanel';
import AccountRatesPanel from './AccountRatesPanel';
import AccountPlanPanel from './AccountPlanPanel';

export interface MbrAccountFeatureProps {
  isSandbox?: boolean;
  onClickBack?: () => void;
  targetMemberId?: string;
}

export default function MbrAccountFeature({
  isSandbox = false,
  onClickBack,
  targetMemberId
}: MbrAccountFeatureProps) {
  const [currentMbrId, setCurrentMbrId] = useState<string>(targetMemberId || '');
  const [memberName, setMemberName] = useState<string>('Valued Member');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [account, setAccount] = useState<MbrAcct | null>(null);
  const [activities, setActivities] = useState<MbrAcctActivity[]>([]);
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active view tab: 'overview' | 'ledger' | 'rates' | 'plan'
  const [activeSubTab, setActiveSubTab] = useState<AccountSubTab>('overview');

  // Purchase modal state
  const [purchaseModalOpen, setPurchaseModalOpen] = useState<boolean>(false);
  const [selectedPackage, setSelectedPackage] = useState<CreditPackage | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- RESOLVE CURRENT MEMBER ID ---
  useEffect(() => {
    let resolvedId = targetMemberId;
    let resolvedName = '';
    let resolvedEmail = '';

    if (!resolvedId) {
      const currentMbrStr = sessionStorage.getItem('sb_current_mbr');
      if (currentMbrStr) {
        try {
          const parsed = JSON.parse(currentMbrStr);
          if (parsed?.mbrId) resolvedId = parsed.mbrId;
          if (parsed?.mbrFirstName) {
            resolvedName = `${parsed.mbrFirstName} ${parsed.mbrLastName || ''}`.trim();
          }
          if (parsed?.mbrEmail) resolvedEmail = parsed.mbrEmail;
        } catch {}
      }
    }

    if (!resolvedId) {
      const storedMbr = sessionStorage.getItem('selectedMember') || sessionStorage.getItem('mbr');
      if (storedMbr) {
        try {
          const parsed = JSON.parse(storedMbr);
          if (parsed?.mbrId) resolvedId = parsed.mbrId;
          if (parsed?.mbrFirstName) {
            resolvedName = `${parsed.mbrFirstName} ${parsed.mbrLastName || ''}`.trim();
          }
          if (parsed?.mbrEmail) resolvedEmail = parsed.mbrEmail;
        } catch {}
      }
    }

    if (!resolvedId) {
      const userStr = sessionStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          if (u.mbr_id) resolvedId = u.mbr_id;
          if (u.email) resolvedEmail = u.email;
          if (u.username && !resolvedName) resolvedName = u.username;
        } catch {}
      }
    }

    if (resolvedName) setMemberName(resolvedName);
    if (resolvedEmail) setMemberEmail(resolvedEmail);
    if (resolvedId) {
      setCurrentMbrId(resolvedId);
    }
  }, [targetMemberId]);

  const getResolvedMemberId = (): string => {
    if (currentMbrId) return currentMbrId;
    if (targetMemberId) return targetMemberId;
    const selected = sessionStorage.getItem('selectedMemberId');
    if (selected) return selected;
    const userStr = sessionStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.mbr_id) return u.mbr_id;
      } catch {}
    }
    return '';
  };

  // --- LOAD ACCOUNT DATA & LEDGER ---
  const loadAccountData = async (overrideMbrId?: string) => {
    const activeMbrId = overrideMbrId || getResolvedMemberId();
    if (!activeMbrId && !isSandbox) {
      setLoading(false);
      return;
    }

    try {
      if (isSandbox) {
        // --- SANDBOX MOCK MODE ---
        const savedAcct = sessionStorage.getItem(`sandbox_mbr_acct_${currentMbrId}`);
        if (savedAcct) {
          try {
            setAccount(JSON.parse(savedAcct));
          } catch {
            setAccount(null);
          }
        } else {
          const defaultAcct: MbrAcct = {
            mbrAcctId: 'mock-acct-001',
            mbrId: currentMbrId || 'mock-mbr-001',
            mbrAcctTypeCd: 'STANDARD',
            mbrAcctStatusCd: 'ACTIVE',
            mbrAcctCreditBalance: 855,
            mbrAcctLifetimeCreditsEarned: 1500,
            mbrAcctLifetimeCreditsUsed: 645,
            mbrAcctCreatedAt: new Date(Date.now() - 30 * 86400000).toISOString()
          };
          setAccount(defaultAcct);
          sessionStorage.setItem(`sandbox_mbr_acct_${currentMbrId}`, JSON.stringify(defaultAcct));
          setCachedCreditBalance(defaultAcct.mbrAcctCreditBalance, currentMbrId);
        }

        const savedActs = sessionStorage.getItem(`sandbox_mbr_acct_activities_${currentMbrId}`);
        if (savedActs) {
          try {
            setActivities(JSON.parse(savedActs));
          } catch {
            setActivities([]);
          }
        } else {
          const defaultActivities: MbrAcctActivity[] = [
            {
              mbrAcctActivityId: 'act-001',
              mbrAcctId: 'mock-acct-001',
              mbrId: currentMbrId || 'mock-mbr-001',
              mbrAcctActivityCreatedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
              mbrAcctActivityTypeCd: 'STORY_GENERATE',
              mbrAcctActivityDirectionCd: 'SUB',
              creditAmount: 50,
              creditDelta: -50,
              balanceBefore: 905,
              balanceAfter: 855,
              mbrAcctActivityDesc: 'Story Co-Author Generation (The Childhood Attic)'
            },
            {
              mbrAcctActivityId: 'act-002',
              mbrAcctId: 'mock-acct-001',
              mbrId: currentMbrId || 'mock-mbr-001',
              mbrAcctActivityCreatedAt: new Date(Date.now() - 24 * 3600000).toISOString(),
              mbrAcctActivityTypeCd: 'AUDIO_GENERATE',
              mbrAcctActivityDirectionCd: 'SUB',
              creditAmount: 25,
              creditDelta: -25,
              balanceBefore: 930,
              balanceAfter: 905,
              mbrAcctActivityDesc: 'ElevenLabs Voice Synthesis Narration'
            },
            {
              mbrAcctActivityId: 'act-003',
              mbrAcctId: 'mock-acct-001',
              mbrId: currentMbrId || 'mock-mbr-001',
              mbrAcctActivityCreatedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
              mbrAcctActivityTypeCd: 'STORY_PRINT_PDF',
              mbrAcctActivityDirectionCd: 'SUB',
              creditAmount: 15,
              creditDelta: -15,
              balanceBefore: 945,
              balanceAfter: 930,
              mbrAcctActivityDesc: 'Printable Story PDF Export'
            },
            {
              mbrAcctActivityId: 'act-004',
              mbrAcctId: 'mock-acct-001',
              mbrId: currentMbrId || 'mock-mbr-001',
              mbrAcctActivityCreatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
              mbrAcctActivityTypeCd: 'REGISTRATION_BONUS',
              mbrAcctActivityDirectionCd: 'ADD',
              creditAmount: 1500,
              creditDelta: 1500,
              balanceBefore: 0,
              balanceAfter: 1500,
              mbrAcctActivityDesc: 'Welcome New Member Registration Grant'
            }
          ];
          setActivities(defaultActivities);
          sessionStorage.setItem(`sandbox_mbr_acct_activities_${currentMbrId}`, JSON.stringify(defaultActivities));
        }

        setRates({
          STORY_GENERATE: -50,
          STORY_PRINT_PDF: -15,
          STORYBOOK_PDF_GENERATE: -100,
          AUDIO_GENERATE: -25,
          LOGON: -10
        });
      } else {
        // --- LIVE DB MODE ---
        let acctData = await taskApi.getMemberAccount(activeMbrId);
        if (!acctData) {
          acctData = await taskApi.createMemberAccount({
            mbrId: activeMbrId,
            mbrAcctTypeCd: 'STANDARD',
            mbrAcctStatusCd: 'ACTIVE',
            mbrAcctCreditBalance: 1500,
            mbrAcctLifetimeCreditsEarned: 1500,
            mbrAcctLifetimeCreditsUsed: 0
          });
        }
        setAccount(acctData);
        if (acctData && typeof acctData.mbrAcctCreditBalance === 'number') {
          setCachedCreditBalance(acctData.mbrAcctCreditBalance, activeMbrId);
        }

        if (acctData && acctData.mbrAcctId) {
          const acts = await taskApi.getMemberAccountActivities({ mbrAcctId: acctData.mbrAcctId });
          setActivities(acts || []);
        }

        try {
          const rateMap = await acctEventCreditApi.getAcctEventCreditRates();
          if (rateMap && typeof rateMap === 'object') {
            setRates(rateMap);
          } else {
            setRates({
              STORY_GENERATE: -50,
              STORY_PRINT_PDF: -15,
              STORYBOOK_PDF_GENERATE: -100,
              AUDIO_GENERATE: -25,
              LOGON: -10
            });
          }
        } catch {
          setRates({
            STORY_GENERATE: -50,
            STORY_PRINT_PDF: -15,
            STORYBOOK_PDF_GENERATE: -100,
            AUDIO_GENERATE: -25,
            LOGON: -10
          });
        }
      }
    } catch (err) {
      console.error('Failed to load member account data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentMbrId || isSandbox) {
      loadAccountData();
    }
  }, [currentMbrId, isSandbox]);

  // --- HANDLE STRIPE RETURN CALLBACKS ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      const activeMbrId = getResolvedMemberId();
      taskApi.verifyStripeSession(sessionId)
        .then(() => {
          showToast('Payment successful! Your 1,500 credits have been deposited.');
          loadAccountData(activeMbrId);
        })
        .catch((err) => {
          console.warn('Session verification fallback notice:', err);
          loadAccountData(activeMbrId);
        });
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    } else if (paymentStatus === 'cancelled') {
      showToast('Payment cancelled. No charges were made.');
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    }
  }, []);

  // --- REFRESH DATA ---
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAccountData();
    setTimeout(() => {
      setRefreshing(false);
      showToast('Account balance and ledger refreshed');
    }, 400);
  };

  // --- EXECUTE CREDIT PURCHASE ---
  const handleExecutePurchase = async (pkg: CreditPackage) => {
    if (isSandbox) {
      // --- SANDBOX SIMULATION MODE ---
      const curBal = account?.mbrAcctCreditBalance ?? 0;
      const newBalance = curBal + pkg.credits;
      const newEarned = (account?.mbrAcctLifetimeCreditsEarned ?? 0) + pkg.credits;

      const newActivity: MbrAcctActivity = {
        mbrAcctActivityId: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `act-${Date.now()}`,
        mbrAcctId: account?.mbrAcctId || currentMbrId,
        mbrId: currentMbrId,
        mbrAcctActivityCreatedAt: new Date().toISOString(),
        mbrAcctActivityTypeCd: 'PURCHASE_CREDIT',
        mbrAcctActivityDirectionCd: 'ADD',
        creditAmount: pkg.credits,
        creditDelta: pkg.credits,
        balanceBefore: curBal,
        balanceAfter: newBalance,
        mbrAcctActivityDesc: `Purchased ${pkg.credits.toLocaleString()} credits ($${pkg.price.toFixed(2)})`
      };

      const updatedAcct: MbrAcct = {
        ...(account || {
          mbrAcctId: currentMbrId,
          mbrId: currentMbrId,
          mbrAcctTypeCd: 'STANDARD',
          mbrAcctStatusCd: 'ACTIVE',
          mbrAcctCreditBalance: 0,
          mbrAcctLifetimeCreditsEarned: 0,
          mbrAcctLifetimeCreditsUsed: 0,
          mbrAcctCreatedAt: new Date().toISOString()
        }),
        mbrAcctCreditBalance: newBalance,
        mbrAcctLifetimeCreditsEarned: newEarned
      };
      sessionStorage.setItem(`sandbox_mbr_acct_${currentMbrId}`, JSON.stringify(updatedAcct));
      const updatedActivities = [newActivity, ...activities];
      sessionStorage.setItem(`sandbox_mbr_acct_activities_${currentMbrId}`, JSON.stringify(updatedActivities));
      setAccount(updatedAcct);
      setActivities(updatedActivities);
      setCachedCreditBalance(updatedAcct.mbrAcctCreditBalance, currentMbrId);
      showToast(`Sandbox Top-Up: Added ${pkg.credits.toLocaleString()} credits!`);
    } else {
      // --- LIVE STRIPE CHECKOUT MODE ---
      try {
        const session = await taskApi.createStripeCheckoutSession({
          mbr_id: currentMbrId,
          credits: pkg.credits,
          customer_email: memberEmail || undefined
        });

        if (session && session.checkoutUrl) {
          // Redirect browser directly to Stripe Hosted Checkout
          window.location.href = session.checkoutUrl;
        } else {
          throw new Error('No checkout URL returned from payment server');
        }
      } catch (err: any) {
        console.error('Stripe checkout error:', err);
        showToast(err.message || 'Could not initiate Stripe checkout');
      }
    }
  };

  // --- DOWNLOAD STATEMENT PDF ---
  const handleDownloadStatement = () => {
    if (!account) return;
    try {
      generateAccountStatementPdf({
        memberName,
        memberEmail,
        account,
        activities
      });
      showToast('Account statement PDF downloaded');
    } catch (err) {
      console.error('Error generating PDF:', err);
      showToast('Could not generate PDF statement');
    }
  };

  return (
    <div className="w-full relative">
      <AdminComponentTag name="MbrAccountFeature.tsx" />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-serif shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 border border-slate-700">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      <AccountPurchaseModal
        isOpen={purchaseModalOpen}
        pkg={selectedPackage}
        currentBalance={account?.mbrAcctCreditBalance ?? 0}
        isSandbox={isSandbox}
        memberId={currentMbrId}
        memberEmail={memberEmail}
        onClose={() => setPurchaseModalOpen(false)}
        onConfirmPurchase={handleExecutePurchase}
        onSuccess={async (pkg) => {
          await loadAccountData();
          showToast(`Successfully deposited ${pkg.credits.toLocaleString()} credits!`);
        }}
      />

      {/* --- TWO-COLUMN GRID LAYOUT (MATCHING MY PROFILE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 max-w-7xl w-full mx-auto items-start">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: BRAND HEADER, CURRENT BALANCE CARD, & NAVIGATION MENU        */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-5">
          {/* 1. Account Brand Header Panel ("Account") */}
          <AccountPageHeaderPanel />

          {/* 2. Current Balance Hero Card (from mockup) */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-slate-700/80">
            <div className="absolute -right-3 -bottom-3 opacity-10 text-amber-400">
              <Coins className="w-24 h-24 sm:w-28 sm:h-28" />
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-slate-300 uppercase">
                CURRENT BALANCE
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" />
                {account?.mbrAcctStatusCd || 'ACTIVE'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-2">
              <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                {(account?.mbrAcctCreditBalance ?? 0).toLocaleString()}
              </span>
              <span className="text-xs font-serif text-slate-300 font-medium">Credits</span>
            </div>
            <p className="text-[10px] font-sans text-slate-400 leading-normal">
              Available for AI Co-Writing, Voice Narration &amp; books
            </p>
          </div>

          {/* 3. Navigation Menu (Overview, Ledger, Rates, Plan) */}
          <AccountNavigationMenu
            activeSubTab={activeSubTab}
            onSelectTab={setActiveSubTab}
            activityCount={activities.length}
          />

          {/* 4. Lifetime Usage Summary Card */}
          <div className="hidden lg:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-2xs">
            <h4 className="text-xs font-bold font-serif text-slate-900 dark:text-white flex items-center justify-between">
              <span>Account Summary</span>
              <span className="font-mono text-[10px] text-slate-400">
                {account?.mbrAcctTypeCd || 'STANDARD'}
              </span>
            </h4>
            <div className="space-y-2 text-xs font-serif">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Lifetime Earned:</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {(account?.mbrAcctLifetimeCreditsEarned ?? 0).toLocaleString()} cr
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Lifetime Used:</span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-400">
                  {(account?.mbrAcctLifetimeCreditsUsed ?? 0).toLocaleString()} cr
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAIN CONTENT AREA & HEADER                                  */}
        {/* ========================================================================= */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          <AccountHeader
            onClickBack={onClickBack}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onDownloadStatement={handleDownloadStatement}
            disableDownload={!account || activities.length === 0}
          />

          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-serif text-xs text-slate-500">Loading your member account details...</p>
            </div>
          ) : (
            <>
              {activeSubTab === 'overview' && (
                <AccountOverviewPanel
                  onSelectPackage={(pkg) => {
                    setSelectedPackage(pkg);
                    setPurchaseModalOpen(true);
                  }}
                  onViewLedger={() => setActiveSubTab('ledger')}
                  onViewRates={() => setActiveSubTab('rates')}
                />
              )}

              {activeSubTab === 'ledger' && (
                <AccountLedgerPanel
                  activities={activities}
                  onDownloadStatement={handleDownloadStatement}
                />
              )}

              {activeSubTab === 'rates' && (
                <AccountRatesPanel rates={rates} />
              )}

              {activeSubTab === 'plan' && (
                <AccountPlanPanel account={account} memberId={currentMbrId} />
              )}
            </>
          )}

          {/* Administration Component Tag for Traceability */}
          <div className="pt-6 flex justify-center">
            <AdminComponentTag name="MbrAccountFeature" />
          </div>
        </main>
      </div>
    </div>
  );
}
