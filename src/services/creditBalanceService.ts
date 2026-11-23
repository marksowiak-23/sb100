/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useCallback } from 'react';
import { taskApi } from './api';

const DEFAULT_MEMBER_ID = '9edb4311-a4bc-428a-8317-833f0f08fea1';
const DEFAULT_SANDBOX_BALANCE = 855;
const inFlightBalanceRequests = new Map<string, Promise<number>>();

/**
 * Resolves the logged-in member ID from explicit input or session storage,
 * returning null when no member session is active (e.g. unauthenticated Public Page).
 */
function resolveLoggedInMemberId(explicitMbrId?: string): string | null {
  if (explicitMbrId && explicitMbrId !== DEFAULT_MEMBER_ID) return explicitMbrId;

  // 1. Check sb_current_mbr
  const currentMbrStr = sessionStorage.getItem('sb_current_mbr');
  if (currentMbrStr) {
    try {
      const parsed = JSON.parse(currentMbrStr);
      if (parsed?.mbrId) return parsed.mbrId;
    } catch {}
  }

  // 2. Check selected member override
  const selectedMember = sessionStorage.getItem('selectedMember');
  if (selectedMember) {
    try {
      const parsed = JSON.parse(selectedMember);
      if (parsed?.mbrId) return parsed.mbrId;
    } catch {}
  }

  // 3. Check mbr object
  const mbrStr = sessionStorage.getItem('mbr');
  if (mbrStr) {
    try {
      const parsed = JSON.parse(mbrStr);
      if (parsed?.mbrId) return parsed.mbrId;
    } catch {}
  }

  // 4. Check current logged-in user
  const userStr = sessionStorage.getItem('user');
  if (userStr) {
    try {
      const u = JSON.parse(userStr);
      if (u.mbr_id || u.mbrId) return u.mbr_id || u.mbrId;
    } catch {}
  }

  // 5. Check sandbox member
  const sandboxMbr = sessionStorage.getItem('sandbox_mbr');
  if (sandboxMbr) {
    try {
      const parsed = JSON.parse(sandboxMbr);
      if (parsed?.mbrId) return parsed.mbrId;
    } catch {}
  }

  return null;
}

/**
 * Helper to resolve the currently active member ID from session storage.
 */
export function getActiveMemberId(explicitMbrId?: string): string {
  return resolveLoggedInMemberId(explicitMbrId) || explicitMbrId || DEFAULT_MEMBER_ID;
}

/**
 * Checks whether the application is running in Sandbox mode.
 */
export function isSandboxMode(): boolean {
  if (typeof window !== 'undefined' && (window as any).__SANDBOX_MODE__ === true) {
    return true;
  }
  return sessionStorage.getItem('isSandbox') === 'true';
}

/**
 * Synchronous check of the last cached credit balance for quick render gating.
 */
export function getCachedCreditBalance(mbrId?: string): number {
  const isSandbox = isSandboxMode();
  const targetId = getActiveMemberId(mbrId);

  // Direct global cached balance check
  const globalCached = sessionStorage.getItem('current_credit_balance');
  if (globalCached !== null) {
    const num = Number(globalCached);
    if (!isNaN(num)) return num;
  }

  if (isSandbox) {
    // 1. Direct key check
    const saved = sessionStorage.getItem(`sandbox_mbr_acct_${targetId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.mbrAcctCreditBalance === 'number') {
          return parsed.mbrAcctCreditBalance;
        }
      } catch {}
    }

    // 2. Fallback scan for any sandbox member account in storage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('sandbox_mbr_acct_') && !key.includes('activities')) {
          const raw = sessionStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (typeof parsed?.mbrAcctCreditBalance === 'number') {
              return parsed.mbrAcctCreditBalance;
            }
          }
        }
      }
    } catch {}

    return DEFAULT_SANDBOX_BALANCE;
  }

  const cachedStr = sessionStorage.getItem(`cached_credit_bal_${targetId}`);
  if (cachedStr !== null) {
    const num = Number(cachedStr);
    if (!isNaN(num)) return num;
  }

  return 1500; // default initial live grant fallback
}

/**
 * Updates the cached credit balance in session storage and dispatches a notification event.
 */
export function setCachedCreditBalance(balance: number, mbrId?: string): void {
  const targetId = getActiveMemberId(mbrId);
  sessionStorage.setItem('current_credit_balance', balance.toString());
  sessionStorage.setItem(`cached_credit_bal_${targetId}`, balance.toString());

  if (isSandboxMode()) {
    const saved = sessionStorage.getItem(`sandbox_mbr_acct_${targetId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        parsed.mbrAcctCreditBalance = balance;
        sessionStorage.setItem(`sandbox_mbr_acct_${targetId}`, JSON.stringify(parsed));
      } catch {}
    }

    // Also update any other sandbox account key in session storage
    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('sandbox_mbr_acct_') && !key.includes('activities')) {
          const raw = sessionStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            parsed.mbrAcctCreditBalance = balance;
            sessionStorage.setItem(key, JSON.stringify(parsed));
          }
        }
      }
    } catch {}
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('credits-updated', { 
      detail: { memberId: targetId, balance } 
    }));
  }
}

/**
 * Asynchronously retrieves the member's current credit balance from Live Cloud SQL or Sandbox.
 */
export async function getMemberCreditBalance(mbrId?: string): Promise<number> {
  const isSandbox = isSandboxMode();
  if (isSandbox) {
    return getCachedCreditBalance(getActiveMemberId(mbrId));
  }

  const targetId = resolveLoggedInMemberId(mbrId);
  if (!targetId) {
    // Unauthenticated visitor (e.g., Public Page) — skip live /mbr-accts lookup to avoid 404 bursts
    return getCachedCreditBalance(DEFAULT_MEMBER_ID);
  }

  const existingPromise = inFlightBalanceRequests.get(targetId);
  if (existingPromise) {
    return existingPromise;
  }

  const reqPromise = (async () => {
    try {
      const acct = await taskApi.getMemberAccount(targetId);
      if (acct && typeof acct.mbrAcctCreditBalance === 'number') {
        setCachedCreditBalance(acct.mbrAcctCreditBalance, targetId);
        return acct.mbrAcctCreditBalance;
      }
    } catch (err) {
      console.warn(`[creditBalanceService] Could not fetch live balance for ${targetId}:`, err);
    } finally {
      inFlightBalanceRequests.delete(targetId);
    }

    // Fallback to cached value
    return getCachedCreditBalance(targetId);
  })();

  inFlightBalanceRequests.set(targetId, reqPromise);
  return reqPromise;
}

/**
 * React hook to observe and evaluate the current member's credit balance.
 */
export function useMemberCredits(explicitMbrId?: string) {
  const [balance, setBalance] = useState<number>(() => getCachedCreditBalance(explicitMbrId));
  const [loading, setLoading] = useState<boolean>(true);

  const refreshCredits = useCallback(async () => {
    try {
      const curBal = await getMemberCreditBalance(explicitMbrId);
      setBalance(curBal);
    } catch {
      setBalance(getCachedCreditBalance(explicitMbrId));
    } finally {
      setLoading(false);
    }
  }, [explicitMbrId]);

  useEffect(() => {
    refreshCredits();

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{ memberId?: string; balance?: number }>;
      if (customEvent.detail && typeof customEvent.detail.balance === 'number') {
        setBalance(customEvent.detail.balance);
      } else {
        refreshCredits();
      }
    };

    window.addEventListener('credits-updated', handleUpdate);
    window.addEventListener('user-switched', refreshCredits);
    window.addEventListener('storage', refreshCredits);

    return () => {
      window.removeEventListener('credits-updated', handleUpdate);
      window.removeEventListener('user-switched', refreshCredits);
      window.removeEventListener('storage', refreshCredits);
    };
  }, [refreshCredits]);

  const isExhausted = balance <= 0;

  return {
    balance,
    isExhausted,
    loading,
    refreshCredits
  };
}
