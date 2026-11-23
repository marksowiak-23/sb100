/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { CoachTourDefinition, CoachTourId, CoachMarkStep } from './types';
import { COACH_TOUR_CATALOG } from './coachTourCatalog';
import { taskApi, sysConfigApi, eventApi } from '@/src/services/api';
import { userManager } from '@/src/services/userManager';
import { playUiSound } from '@/src/services/soundService';

interface CoachMarkContextValue {
  /** Global sysConfig feature flag */
  isFeatureEnabled: boolean;
  /** Whether the member disabled automatic coach marks */
  coachMarksDisabled: boolean;
  /** Tours already completed or skipped by the active member */
  completedTours: CoachTourId[];
  /** Currently running tour (null if none active) */
  activeTour: CoachTourDefinition | null;
  /** Active filtered steps (only steps whose target element exists and is visible) */
  activeSteps: CoachMarkStep[];
  /** Current 0-based index into activeSteps */
  currentStepIndex: number;
  /** Manually launch a tour (ignores completedTours and coachMarksDisabled) */
  startTour: (tourId: CoachTourId) => void;
  /** Auto-start a tour if enabled, not disabled, not yet completed, and no blocking modal is open */
  requestAutoTour: (tourId: CoachTourId, options?: { delayMs?: number; blocked?: boolean }) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: (disableFuture?: boolean) => void;
  finishTour: () => void;
  resetAllTours: () => Promise<void>;
  setCoachMarksDisabledPref: (disabled: boolean) => Promise<void>;
}

const CoachMarkContext = createContext<CoachMarkContextValue | null>(null);

function isElementVisible(el: Element | null): el is HTMLElement {
  if (!el || !(el instanceof HTMLElement)) return false;
  const style = window.getComputedStyle(el);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
    return false;
  }
  const rect = el.getBoundingClientRect();
  return rect.width > 0 && rect.height > 0;
}

export function findVisibleCoachTarget(targetId: string): HTMLElement | null {
  const nodes = document.querySelectorAll(`[data-coach-mark="${targetId}"]`);
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];
    if (isElementVisible(node)) {
      return node;
    }
  }
  return null;
}

function resolveMemberId(): string | null {
  try {
    const stored = userManager.getStoredMember();
    if (stored?.mbrId) return stored.mbrId;
    const rawMbr = sessionStorage.getItem('sb_current_mbr') || sessionStorage.getItem('mbr') || sessionStorage.getItem('sandbox_mbr');
    if (rawMbr) {
      const parsed = JSON.parse(rawMbr);
      if (parsed?.mbrId) return parsed.mbrId;
    }
  } catch {}
  return null;
}

function isSandboxEnv(): boolean {
  try {
    return sessionStorage.getItem('isSandbox') === 'true' || !userManager.getToken();
  } catch {
    return false;
  }
}

export function CoachMarkProvider({ children }: { children: React.ReactNode }) {
  const [isFeatureEnabled, setIsFeatureEnabled] = useState<boolean>(true);
  const [prefsLoaded, setPrefsLoaded] = useState<boolean>(false);
  const [coachMarksDisabled, setCoachMarksDisabled] = useState<boolean>(false);
  const [completedTours, setCompletedTours] = useState<CoachTourId[]>([]);

  const [activeTour, setActiveTour] = useState<CoachTourDefinition | null>(null);
  const [activeSteps, setActiveSteps] = useState<CoachMarkStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const autoTimerRef = useRef<number | null>(null);
  const activeTourRef = useRef<CoachTourDefinition | null>(null);
  activeTourRef.current = activeTour;

  // 1. Check global FEATURE_COACH_MARKS sysConfig flag
  useEffect(() => {
    let mounted = true;
    sysConfigApi
      .getSysConfigByTag('FEATURE_COACH_MARKS')
      .then((cfg) => {
        if (!mounted || !cfg) return;
        const val = String(cfg.configValue ?? 'true').trim().toLowerCase();
        setIsFeatureEnabled(val !== 'false' && val !== '0' && val !== 'off');
      })
      .catch(() => {
        // Default enabled if config endpoint unreachable
      });
    return () => {
      mounted = false;
    };
  }, []);

  // 2. Load member preferences (mbrPrefJson.coachMarksDisabled & completedCoachTours)
  const loadMemberCoachPrefs = useCallback(async () => {
    const mbrId = resolveMemberId();
    if (!mbrId) {
      setPrefsLoaded(false);
      return;
    }

    // Immediate synchronous hydrate from sessionStorage
    try {
      const cachedJsonRaw = sessionStorage.getItem(`sb_pref_json_${mbrId}`);
      if (cachedJsonRaw) {
        const cached = JSON.parse(cachedJsonRaw);
        if (typeof cached?.coachMarksDisabled === 'boolean') {
          setCoachMarksDisabled(cached.coachMarksDisabled);
        }
        if (Array.isArray(cached?.completedCoachTours)) {
          setCompletedTours(cached.completedCoachTours);
        }
      }
    } catch {}

    // Live DB or Sandbox fetch
    try {
      let prefRecord: any = null;
      if (isSandboxEnv()) {
        const raw = sessionStorage.getItem('sandbox_mbr_preferences');
        if (raw) prefRecord = JSON.parse(raw);
      } else {
        try {
          prefRecord = await taskApi.getMemberPreferences(mbrId);
        } catch {}
      }

      let parsedJson: any = {};
      if (prefRecord?.mbrPrefJson) {
        parsedJson =
          typeof prefRecord.mbrPrefJson === 'string'
            ? JSON.parse(prefRecord.mbrPrefJson)
            : prefRecord.mbrPrefJson;
      } else {
        const cachedJsonRaw = sessionStorage.getItem(`sb_pref_json_${mbrId}`);
        if (cachedJsonRaw) {
          try {
            parsedJson = JSON.parse(cachedJsonRaw);
          } catch {}
        }
      }

      const disabled = Boolean(parsedJson?.coachMarksDisabled);
      const completed: CoachTourId[] = Array.isArray(parsedJson?.completedCoachTours)
        ? parsedJson.completedCoachTours
        : [];

      setCoachMarksDisabled(disabled);
      setCompletedTours(completed);
      try {
        sessionStorage.setItem(`sb_pref_json_${mbrId}`, JSON.stringify(parsedJson || {}));
      } catch {}
    } catch (err) {
      console.warn('[CoachMarks] Could not load coach mark preferences:', err);
    } finally {
      setPrefsLoaded(true);
    }
  }, []);

  useEffect(() => {
    loadMemberCoachPrefs();

    const handleUserSwitched = () => {
      setActiveTour(null);
      setActiveSteps([]);
      setCurrentStepIndex(0);
      loadMemberCoachPrefs();
    };

    const handlePrefsChanged = (e: Event) => {
      const detail = (e as CustomEvent)?.detail;
      if (!detail) return;
      if (detail.coachMarksDisabled !== undefined) {
        setCoachMarksDisabled(Boolean(detail.coachMarksDisabled));
      }
      if (Array.isArray(detail.completedCoachTours)) {
        setCompletedTours(detail.completedCoachTours);
      }
    };

    window.addEventListener('user-switched', handleUserSwitched);
    window.addEventListener('preferences-changed', handlePrefsChanged);
    return () => {
      window.removeEventListener('user-switched', handleUserSwitched);
      window.removeEventListener('preferences-changed', handlePrefsChanged);
    };
  }, [loadMemberCoachPrefs]);

  // Helper to persist coach mark fields into mbrPreferences.mbrPrefJson
  const persistCoachPrefs = useCallback(
    async (updates: { coachMarksDisabled?: boolean; completedCoachTours?: CoachTourId[] }) => {
      const mbrId = resolveMemberId();
      const nextDisabled =
        updates.coachMarksDisabled !== undefined ? updates.coachMarksDisabled : coachMarksDisabled;
      const nextCompleted =
        updates.completedCoachTours !== undefined ? updates.completedCoachTours : completedTours;

      setCoachMarksDisabled(nextDisabled);
      setCompletedTours(nextCompleted);

      if (!mbrId) return;

      try {
        let currentPref: any = null;
        const sandbox = isSandboxEnv();
        if (sandbox) {
          const raw = sessionStorage.getItem('sandbox_mbr_preferences');
          if (raw) {
            try {
              currentPref = JSON.parse(raw);
            } catch {}
          }
        } else {
          try {
            currentPref = await taskApi.getMemberPreferences(mbrId);
          } catch {}
        }

        let currentJsonObj: any = {};
        if (currentPref?.mbrPrefJson) {
          try {
            currentJsonObj =
              typeof currentPref.mbrPrefJson === 'string'
                ? JSON.parse(currentPref.mbrPrefJson)
                : currentPref.mbrPrefJson;
          } catch {}
        } else {
          const cachedRaw = sessionStorage.getItem(`sb_pref_json_${mbrId}`);
          if (cachedRaw) {
            try {
              currentJsonObj = JSON.parse(cachedRaw);
            } catch {}
          }
        }

        currentJsonObj.coachMarksDisabled = nextDisabled;
        currentJsonObj.completedCoachTours = nextCompleted;

        const payload = {
          mbrId,
          chWriterId: currentPref?.chWriterId || null,
          mbrPrefTheme: currentPref?.mbrPrefTheme || 'System',
          mbrPrefNotificationsInd: currentPref?.mbrPrefNotificationsInd ?? true,
          mbrPrefAutoSaveInd: currentPref?.mbrPrefAutoSaveInd ?? true,
          mbrPrefJson: JSON.stringify(currentJsonObj)
        };

        sessionStorage.setItem(`sb_pref_json_${mbrId}`, JSON.stringify(currentJsonObj));

        if (sandbox) {
          sessionStorage.setItem(
            'sandbox_mbr_preferences',
            JSON.stringify({ ...payload, mbrPrefId: currentPref?.mbrPrefId || 'sandbox-pref-id' })
          );
        } else {
          await taskApi.saveMemberPreferences(currentPref?.mbrPrefId || null, payload);
        }

        window.dispatchEvent(
          new CustomEvent('preferences-changed', {
            detail: {
              mbrId,
              coachMarksDisabled: nextDisabled,
              completedCoachTours: nextCompleted
            }
          })
        );
      } catch (err) {
        console.warn('[CoachMarks] Failed to persist coach mark preferences:', err);
      }
    },
    [coachMarksDisabled, completedTours]
  );

  const logCoachEvent = useCallback((eventCd: string, detail: string, tagValue: Record<string, any>) => {
    if (isSandboxEnv()) return;
    const mbrId = resolveMemberId();
    if (!mbrId) return;
    eventApi
      .logEvent({
        eventSiteCd: 'SB',
        eventActorId: mbrId,
        eventActorTypeCd: 'MBR',
        eventCd,
        eventDetail: detail,
        eventTagValue: tagValue
      })
      .catch(() => {});
  }, []);

  const launchTourInternal = useCallback(
    (tourId: CoachTourId, trigger: 'auto' | 'manual') => {
      const def = COACH_TOUR_CATALOG[tourId];
      if (!def) return;

      // Filter to steps whose target element is currently mounted & visible in this viewport
      const visibleSteps = def.steps.filter((s) => Boolean(findVisibleCoachTarget(s.targetId)));
      if (visibleSteps.length === 0) return;

      setActiveTour(def);
      setActiveSteps(visibleSteps);
      setCurrentStepIndex(0);

      logCoachEvent('COACH_TOUR_START', `Started coach mark tour '${tourId}' (${trigger})`, {
        tourId,
        trigger,
        stepCount: visibleSteps.length
      });
    },
    [logCoachEvent]
  );

  const startTour = useCallback(
    (tourId: CoachTourId) => {
      if (!isFeatureEnabled) return;
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      launchTourInternal(tourId, 'manual');
    },
    [isFeatureEnabled, launchTourInternal]
  );

  const requestAutoTour = useCallback(
    (tourId: CoachTourId, options?: { delayMs?: number; blocked?: boolean }) => {
      if (autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        autoTimerRef.current = null;
      }
      if (!isFeatureEnabled || !prefsLoaded || coachMarksDisabled) return;
      if (options?.blocked) return;
      if (activeTourRef.current) return;
      if (completedTours.includes(tourId)) return;
      if (!resolveMemberId()) return;

      const delay = options?.delayMs ?? 900;
      autoTimerRef.current = window.setTimeout(() => {
        autoTimerRef.current = null;
        if (activeTourRef.current) return;
        launchTourInternal(tourId, 'auto');
      }, delay);
    },
    [isFeatureEnabled, prefsLoaded, coachMarksDisabled, completedTours, launchTourInternal]
  );

  const markTourDone = useCallback(
    (tourId: CoachTourId, disableFuture = false) => {
      const nextCompleted = completedTours.includes(tourId)
        ? completedTours
        : [...completedTours, tourId];
      persistCoachPrefs({
        completedCoachTours: nextCompleted,
        ...(disableFuture ? { coachMarksDisabled: true } : {})
      });
    },
    [completedTours, persistCoachPrefs]
  );

  const finishTour = useCallback(() => {
    if (!activeTour) return;
    const tourId = activeTour.id;
    const total = activeSteps.length;
    setActiveTour(null);
    setActiveSteps([]);
    setCurrentStepIndex(0);
    markTourDone(tourId, false);
    playUiSound('SUCCESS');
    logCoachEvent('COACH_TOUR_COMPLETE', `Completed coach mark tour '${tourId}'`, {
      tourId,
      stepsViewed: total
    });
  }, [activeTour, activeSteps.length, markTourDone, logCoachEvent]);

  const skipTour = useCallback(
    (disableFuture = false) => {
      if (!activeTour) return;
      const tourId = activeTour.id;
      const stepNum = currentStepIndex + 1;
      setActiveTour(null);
      setActiveSteps([]);
      setCurrentStepIndex(0);
      markTourDone(tourId, disableFuture);
      logCoachEvent('COACH_TOUR_SKIP', `Skipped coach mark tour '${tourId}' at step ${stepNum}`, {
        tourId,
        skippedAtStep: stepNum,
        disableFuture
      });
    },
    [activeTour, currentStepIndex, markTourDone, logCoachEvent]
  );

  const nextStep = useCallback(() => {
    if (!activeTour) return;
    if (currentStepIndex + 1 >= activeSteps.length) {
      finishTour();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }, [activeTour, currentStepIndex, activeSteps.length, finishTour]);

  const prevStep = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(0, prev - 1));
  }, []);

  const resetAllTours = useCallback(async () => {
    await persistCoachPrefs({ completedCoachTours: [], coachMarksDisabled: false });
  }, [persistCoachPrefs]);

  const setCoachMarksDisabledPref = useCallback(
    async (disabled: boolean) => {
      await persistCoachPrefs({ coachMarksDisabled: disabled });
    },
    [persistCoachPrefs]
  );

  return (
    <CoachMarkContext.Provider
      value={{
        isFeatureEnabled,
        coachMarksDisabled,
        completedTours,
        activeTour,
        activeSteps,
        currentStepIndex,
        startTour,
        requestAutoTour,
        nextStep,
        prevStep,
        skipTour,
        finishTour,
        resetAllTours,
        setCoachMarksDisabledPref
      }}
    >
      {children}
    </CoachMarkContext.Provider>
  );
}

export function useCoachMarks() {
  const ctx = useContext(CoachMarkContext);
  if (!ctx) {
    throw new Error('useCoachMarks must be used within a CoachMarkProvider');
  }
  return ctx;
}
