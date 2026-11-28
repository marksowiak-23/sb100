/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Coins,
  Mic,
  Image as ImageIcon,
  Sparkles,
  CheckCircle,
  Copy,
  Check
} from 'lucide-react';
import {
  taskApi,
  eventApi,
  MbrAcct,
  MbrAcctActivity
} from '@/src/services/api';
import { AdminComponentTag } from '@/src/components/AdminComponentTag';
import { setCachedCreditBalance } from '@/src/services/creditBalanceService';
import { playUiSound } from '@/src/services/soundService';
import AccountHeader from './AccountHeader';
import AccountPageHeaderPanel from './AccountPageHeaderPanel';
import AccountNavigationMenu, { AccountSubTab } from './AccountNavigationMenu';
import AccountOverviewPanel from './AccountOverviewPanel';
import AccountVoiceCreditsPanel from './AccountVoiceCreditsPanel';
import AccountImageCreditsPanel from './AccountImageCreditsPanel';
import AccountPromoOfferCard from './AccountPromoOfferCard';
import AccountPurchaseModal, { CreditPackage } from './AccountPurchaseModal';
import { useCoachMarks } from '@/src/features/coachMarks';

export interface MbrAccountFeatureProps {
  isSandbox?: boolean;
  onClickBack?: () => void;
  targetMemberId?: string;
  initialSubTab?: AccountSubTab;
}

export default function MbrAccountFeature({
  isSandbox = false,
  onClickBack,
  targetMemberId,
  initialSubTab = 'story-credits'
}: MbrAccountFeatureProps) {
  const [currentMbrId, setCurrentMbrId] = useState<string>(targetMemberId || '');
  const [memberName, setMemberName] = useState<string>('Valued Member');
  const [memberEmail, setMemberEmail] = useState<string>('');
  const [account, setAccount] = useState<MbrAcct | null>(null);
  const [activities, setActivities] = useState<MbrAcctActivity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const { requestAutoTour } = useCoachMarks();

  useEffect(() => {
    return requestAutoTour('account_tour', {
      delayMs: 900,
      blocked: loading
    });
  }, [requestAutoTour, loading]);

  // Active view tab: 'story-credits' | 'voice-credits' | 'image-credits'
  const [activeSubTab, setActiveSubTab] = useState<AccountSubTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const creditType = params.get('credit_type');
      if (creditType === 'voice') return 'voice-credits';
      if (creditType === 'image') return 'image-credits';
      if (creditType === 'story') return 'story-credits';
      const storedReturnTab = sessionStorage.getItem('sb_account_return_subtab');
      if (
        storedReturnTab === 'voice-credits' ||
        storedReturnTab === 'image-credits' ||
        storedReturnTab === 'story-credits'
      ) {
        return storedReturnTab;
      }
    }
    return initialSubTab;
  });

  useEffect(() => {
    if (initialSubTab) {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  // Always scroll to top when opening the Account page or switching tabs
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const rafId = requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    });
    return () => cancelAnimationFrame(rafId);
  }, [activeSubTab]);

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
    const creditTypeParam = params.get('credit_type');
    const storedReturnTab = sessionStorage.getItem('sb_account_return_subtab') as AccountSubTab | null;

    if (paymentStatus === 'success' && sessionId) {
      const activeMbrId = getResolvedMemberId();
      const resolveReturnTab = (ct?: string | null): AccountSubTab => {
        if (ct === 'voice' || (!ct && storedReturnTab === 'voice-credits')) return 'voice-credits';
        if (ct === 'image' || (!ct && storedReturnTab === 'image-credits')) return 'image-credits';
        return 'story-credits';
      };
      const initialReturnTab = resolveReturnTab(creditTypeParam);
      setActiveSubTab(initialReturnTab);
      sessionStorage.removeItem('sb_account_return_subtab');
      taskApi.verifyStripeSession(sessionId)
        .then((res: any) => {
          const addedCredits = res?.creditsAdded || res?.credits;
          const resolvedTab = resolveReturnTab(res?.creditType || creditTypeParam);
          setActiveSubTab(resolvedTab);
          const isVoice = resolvedTab === 'voice-credits';
          const isImage = resolvedTab === 'image-credits';
          const label = isVoice ? 'voice credits' : isImage ? 'image credits' : 'story credits';
          showToast(
            addedCredits
              ? `Payment successful! Your ${Number(addedCredits).toLocaleString()} ${label} have been deposited.`
              : `Payment successful! Your ${label} have been deposited.`
          );
          playUiSound('CREDIT_PURCHASE');
          eventApi.logEvent({
            eventSiteCd: 'SB',
            eventActorId: activeMbrId || undefined,
            eventActorTypeCd: 'MBR',
            eventCd: isVoice ? 'VOICE_CREDIT_PURCHASE' : isImage ? 'IMAGE_CREDIT_PURCHASE' : 'STORY_CREDIT_PURCHASE',
            eventDetail: `Member purchased ${addedCredits || ''} ${label} via Stripe checkout`.trim(),
            eventTagValue: {
              creditType: isVoice ? 'voice' : isImage ? 'image' : 'story',
              credits: addedCredits,
              stripeSessionId: sessionId,
              source: 'MbrAccountFeature'
            }
          }).catch((err) => console.warn('Could not log credit purchase event:', err));
          loadAccountData(activeMbrId);
        })
        .catch((err) => {
          console.warn('Session verification fallback notice:', err);
          loadAccountData(activeMbrId);
        });
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, '', cleanUrl);
    } else if (paymentStatus === 'cancelled') {
      const cancelTab: AccountSubTab =
        creditTypeParam === 'voice' || (!creditTypeParam && storedReturnTab === 'voice-credits')
          ? 'voice-credits'
          : creditTypeParam === 'image' || (!creditTypeParam && storedReturnTab === 'image-credits')
          ? 'image-credits'
          : 'story-credits';
      setActiveSubTab(cancelTab);
      sessionStorage.removeItem('sb_account_return_subtab');
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
    const isVoice = pkg.creditType === 'voice';
    const isImage = pkg.creditType === 'image';
    const poolLabel = isVoice ? 'voice' : isImage ? 'image' : 'story';

    if (isSandbox) {
      // --- SANDBOX SIMULATION MODE ---
      const curBal = isVoice
        ? (account?.mbrAcctVoiceCreditBalance ?? 0)
        : isImage
        ? (account?.mbrAcctImageCreditBalance ?? 0)
        : (account?.mbrAcctCreditBalance ?? 0);
      const newBalance = curBal + pkg.credits;
      const newEarned = isVoice
        ? (account?.mbrAcctLifetimeVoiceCreditsEarned ?? 0) + pkg.credits
        : isImage
        ? (account?.mbrImageLifetimeCreditsEarned ?? 0) + pkg.credits
        : (account?.mbrAcctLifetimeCreditsEarned ?? 0) + pkg.credits;

      const newActivity: MbrAcctActivity = {
        mbrAcctActivityId: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : `act-${Date.now()}`,
        mbrAcctId: account?.mbrAcctId || currentMbrId,
        mbrId: currentMbrId,
        mbrAcctActivityCreatedAt: new Date().toISOString(),
        mbrAcctActivityTypeCd: isVoice ? 'PURCHASE_VOICE_CREDIT' : isImage ? 'PURCHASE_IMAGE_CREDIT' : 'PURCHASE_CREDIT',
        mbrAcctActivityDirectionCd: 'ADD',
        creditAmount: pkg.credits,
        creditDelta: pkg.credits,
        balanceBefore: curBal,
        balanceAfter: newBalance,
        mbrAcctActivityDesc: `Purchased ${pkg.credits.toLocaleString()} ${poolLabel} credits ($${pkg.price.toFixed(2)})`
      };

      const baseAcct: MbrAcct = account || {
        mbrAcctId: currentMbrId,
        mbrId: currentMbrId,
        mbrAcctTypeCd: 'STANDARD',
        mbrAcctStatusCd: 'ACTIVE',
        mbrAcctCreditBalance: 0,
        mbrAcctLifetimeCreditsEarned: 0,
        mbrAcctLifetimeCreditsUsed: 0,
        mbrAcctVoiceCreditBalance: 0,
        mbrAcctLifetimeVoiceCreditsEarned: 0,
        mbrAcctVoiceLifetimeCreditsUsed: 0,
        mbrAcctImageCreditBalance: 0,
        mbrImageLifetimeCreditsEarned: 0,
        mbrImageLifetimeCreditsUse: 0,
        mbrAcctCreatedAt: new Date().toISOString()
      };

      const updatedAcct: MbrAcct = isVoice
        ? {
            ...baseAcct,
            mbrAcctVoiceCreditBalance: newBalance,
            mbrAcctLifetimeVoiceCreditsEarned: newEarned
          }
        : isImage
        ? {
            ...baseAcct,
            mbrAcctImageCreditBalance: newBalance,
            mbrImageLifetimeCreditsEarned: newEarned
          }
        : {
            ...baseAcct,
            mbrAcctCreditBalance: newBalance,
            mbrAcctLifetimeCreditsEarned: newEarned
          };

      sessionStorage.setItem(`sandbox_mbr_acct_${currentMbrId}`, JSON.stringify(updatedAcct));
      const updatedActivities = [newActivity, ...activities];
      sessionStorage.setItem(`sandbox_mbr_acct_activities_${currentMbrId}`, JSON.stringify(updatedActivities));
      setAccount(updatedAcct);
      setActivities(updatedActivities);
      if (!isVoice && !isImage) {
        setCachedCreditBalance(updatedAcct.mbrAcctCreditBalance, currentMbrId);
      }

      eventApi.logEvent({
        eventSiteCd: 'SB',
        eventActorId: currentMbrId || undefined,
        eventActorTypeCd: 'MBR',
        eventCd: isVoice ? 'VOICE_CREDIT_PURCHASE' : isImage ? 'IMAGE_CREDIT_PURCHASE' : 'STORY_CREDIT_PURCHASE',
        eventDetail: `Member purchased ${pkg.credits.toLocaleString()} ${poolLabel} credits ($${pkg.price.toFixed(2)})`,
        eventTagValue: {
          creditType: poolLabel,
          credits: pkg.credits,
          priceUsd: pkg.price,
          balanceBefore: curBal,
          balanceAfter: newBalance,
          isSandbox: true,
          source: 'MbrAccountFeature'
        }
      }).catch((err) => console.warn('Could not log credit purchase event:', err));

      showToast(`Sandbox Top-Up: Added ${pkg.credits.toLocaleString()} ${poolLabel} credits!`);
    } else {
      // --- LIVE STRIPE CHECKOUT MODE ---
      try {
        const session = await taskApi.createStripeCheckoutSession({
          mbr_id: currentMbrId,
          credits: pkg.credits,
          credit_type: pkg.creditType || 'story',
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
        currentBalance={
          selectedPackage?.creditType === 'voice'
            ? (account?.mbrAcctVoiceCreditBalance ?? 0)
            : selectedPackage?.creditType === 'image'
            ? (account?.mbrAcctImageCreditBalance ?? 0)
            : (account?.mbrAcctCreditBalance ?? 0)
        }
        isSandbox={isSandbox}
        memberId={currentMbrId}
        memberEmail={memberEmail}
        onClose={() => {
          const returnTab: AccountSubTab =
            selectedPackage?.creditType === 'voice'
              ? 'voice-credits'
              : selectedPackage?.creditType === 'image'
              ? 'image-credits'
              : 'story-credits';
          setActiveSubTab(returnTab);
          sessionStorage.removeItem('sb_account_return_subtab');
          setPurchaseModalOpen(false);
        }}
        onConfirmPurchase={handleExecutePurchase}
        onSuccess={async (pkg) => {
          const isVoice = pkg.creditType === 'voice';
          const isImage = pkg.creditType === 'image';
          const poolLabel = isVoice ? 'voice' : isImage ? 'image' : 'story';
          setActiveSubTab(isVoice ? 'voice-credits' : isImage ? 'image-credits' : 'story-credits');
          sessionStorage.removeItem('sb_account_return_subtab');
          eventApi.logEvent({
            eventSiteCd: 'SB',
            eventActorId: currentMbrId || undefined,
            eventActorTypeCd: 'MBR',
            eventCd: isVoice ? 'VOICE_CREDIT_PURCHASE' : isImage ? 'IMAGE_CREDIT_PURCHASE' : 'STORY_CREDIT_PURCHASE',
            eventDetail: `Member purchased ${pkg.credits.toLocaleString()} ${poolLabel} credits ($${pkg.price.toFixed(2)})`,
            eventTagValue: {
              creditType: poolLabel,
              credits: pkg.credits,
              priceUsd: pkg.price,
              isSandbox,
              source: 'MbrAccountFeature'
            }
          }).catch((err) => console.warn('Could not log credit purchase event:', err));

          await loadAccountData();
          showToast(`Successfully deposited ${pkg.credits.toLocaleString()} ${poolLabel} credits!`);
        }}
      />

      {/* --- TWO-COLUMN GRID LAYOUT (MATCHING MY PROFILE) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-8 max-w-7xl w-full mx-auto items-start">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: BRAND HEADER, NAVIGATION MENU, & ACTIVE TAB BALANCE CARD     */}
        {/* ========================================================================= */}
        <aside className="lg:col-span-4 xl:col-span-3 space-y-3 sm:space-y-4 lg:space-y-5">
          {/* 1. Account Brand Header Panel ("Account") */}
          <AccountPageHeaderPanel />

          {/* 2. Navigation Menu (My Story Credits, My Voice Credits) */}
          <div data-coach-mark="account-nav">
            <AccountNavigationMenu
              activeSubTab={activeSubTab}
              onSelectTab={setActiveSubTab}
            />
          </div>

          {/* 3. Dynamic Current Balance Hero Card (Matches Active Tab) */}
          <div data-coach-mark="account-balance-card">
          {activeSubTab === 'voice-credits' ? (
            <div className="bg-gradient-to-br from-purple-950 via-indigo-950 to-[#0F172A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-purple-700/60 space-y-2.5">
              <div className="absolute -right-3 -bottom-3 opacity-10 text-purple-300 pointer-events-none">
                <Mic className="w-24 h-24 sm:w-28 sm:h-28" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-purple-200 uppercase">
                  VOICE CREDITS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/25 text-purple-200 border border-purple-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {account?.mbrAcctStatusCd || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-purple-300 tracking-tight">
                  {(account?.mbrAcctVoiceCreditBalance ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-serif text-slate-300 font-medium">Credits</span>
              </div>
              <p className="text-[10px] font-sans text-purple-200/75 leading-normal relative z-10">
                Available for AI Voice Story Narration
              </p>
            </div>
          ) : activeSubTab === 'image-credits' ? (
            <div className="bg-gradient-to-br from-teal-950 via-emerald-950 to-[#0F172A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-teal-700/60 space-y-2.5">
              <div className="absolute -right-3 -bottom-3 opacity-10 text-teal-300 pointer-events-none">
                <ImageIcon className="w-24 h-24 sm:w-28 sm:h-28" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-teal-200 uppercase">
                  IMAGE CREDITS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/25 text-teal-200 border border-teal-400/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {account?.mbrAcctStatusCd || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-teal-300 tracking-tight">
                  {(account?.mbrAcctImageCreditBalance ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-serif text-slate-300 font-medium">Credits</span>
              </div>
              <p className="text-[10px] font-sans text-teal-200/75 leading-normal relative z-10">
                Available for 2K AI Story Photos &amp; Animations
              </p>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] rounded-2xl p-4 sm:p-5 text-white shadow-md relative overflow-hidden border border-slate-700/80 space-y-2.5">
              <div className="absolute -right-3 -bottom-3 opacity-10 text-amber-400 pointer-events-none">
                <Coins className="w-24 h-24 sm:w-28 sm:h-28" />
              </div>
              <div className="flex items-center justify-between relative z-10">
                <span className="text-[10px] sm:text-[11px] font-sans font-bold tracking-wider text-slate-300 uppercase">
                  STORY CREDITS
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  {account?.mbrAcctStatusCd || 'ACTIVE'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="font-serif text-3xl sm:text-4xl font-extrabold text-amber-400 tracking-tight">
                  {(account?.mbrAcctCreditBalance ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-serif text-slate-300 font-medium">Credits</span>
              </div>
              <p className="text-[10px] font-sans text-slate-400 leading-normal relative z-10">
                Available for AI Co-Writing, PDFs &amp; Books
              </p>
            </div>
          )}
          </div>

          {/* 4. Promotional Offers Redemption Card (Below Credits Panel) */}
          <AccountPromoOfferCard
            isSandbox={isSandbox}
            memberId={currentMbrId}
            onRedeemed={async (res) => {
              if (res.account) {
                setAccount(res.account);
                setCachedCreditBalance(res.account.mbrAcctCreditBalance ?? 0);
              } else if (isSandbox && account) {
                const nextAcct: MbrAcct = {
                  ...account,
                  mbrAcctCreditBalance: (account.mbrAcctCreditBalance ?? 0) + res.storyCreditsGranted,
                  mbrAcctVoiceCreditBalance: (account.mbrAcctVoiceCreditBalance ?? 0) + res.voiceCreditsGranted,
                  mbrAcctImageCreditBalance: (account.mbrAcctImageCreditBalance ?? 0) + res.imageCreditsGranted,
                };
                setAccount(nextAcct);
                setCachedCreditBalance(nextAcct.mbrAcctCreditBalance ?? 0);
              }
              if (!isSandbox) {
                await loadAccountData();
              }
              showToast(res.message);
            }}
          />
        </aside>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: MAIN CONTENT AREA & HEADER                                  */}
        {/* ========================================================================= */}
        <main className="lg:col-span-8 xl:col-span-9 min-w-0">
          <AccountHeader
            activeSubTab={activeSubTab}
            onClickBack={onClickBack}
            refreshing={refreshing}
            onRefresh={handleRefresh}
          />

          {loading ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="font-serif text-xs text-slate-500">Loading your member account details...</p>
            </div>
          ) : (
            <div data-coach-mark="account-packages">
              {activeSubTab === 'story-credits' && (
                <AccountOverviewPanel
                  onSelectPackage={(pkg) => {
                    sessionStorage.setItem('sb_account_return_subtab', 'story-credits');
                    setSelectedPackage({ ...pkg, creditType: 'story' });
                    setPurchaseModalOpen(true);
                  }}
                />
              )}

              {activeSubTab === 'voice-credits' && (
                <AccountVoiceCreditsPanel
                  account={account}
                  onSelectPackage={(pkg) => {
                    sessionStorage.setItem('sb_account_return_subtab', 'voice-credits');
                    setSelectedPackage({ ...pkg, creditType: 'voice' });
                    setPurchaseModalOpen(true);
                  }}
                  onOpenVoiceStudio={() =>
                    window.dispatchEvent(
                      new CustomEvent('open-member-profile', {
                        detail: { subTab: 'voice-translation' }
                      })
                    )
                  }
                />
              )}

              {activeSubTab === 'image-credits' && (
                <AccountImageCreditsPanel
                  account={account}
                  onSelectPackage={(pkg) => {
                    sessionStorage.setItem('sb_account_return_subtab', 'image-credits');
                    setSelectedPackage({ ...pkg, creditType: 'image' });
                    setPurchaseModalOpen(true);
                  }}
                />
              )}
            </div>
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
