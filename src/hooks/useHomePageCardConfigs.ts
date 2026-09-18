/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { sysConfigApi, SysConfig } from '@/src/services/api';

export interface HomePageCardConfigs {
  isGettingStartedCardEnabled: boolean;
  isPersonalTriviaCardEnabled: boolean;
  isRememberWhenCardEnabled: boolean;
  isLoading: boolean;
}

// Module-level singleton cache for instantaneous access
let cachedGettingStartedCard: boolean = true;
let cachedPersonalTriviaCard: boolean = true;
let cachedRememberWhenCard: boolean = true;
let isInitialized = false;

const listeners = new Set<(state: { gettingStarted: boolean; personalTrivia: boolean; rememberWhen: boolean }) => void>();

function notifyAllListeners() {
  const state = {
    gettingStarted: cachedGettingStartedCard,
    personalTrivia: cachedPersonalTriviaCard,
    rememberWhen: cachedRememberWhenCard
  };
  listeners.forEach((listener) => listener(state));
}

function parseBooleanValue(val: any, defaultVal: boolean = true): boolean {
  if (val === undefined || val === null) return defaultVal;
  const str = String(val).trim().toLowerCase();
  return str === 'true' || str === '1' || str === 'yes' || str === 'on' || str === 't';
}

// Initialize dynamic listener and fetch configuration once on client load
if (typeof window !== 'undefined' && !isInitialized) {
  isInitialized = true;

  sysConfigApi
    .getSysConfigs('UI')
    .then((configs: SysConfig[]) => {
      if (Array.isArray(configs)) {
        configs.forEach((cfg) => {
          if (cfg.configTag === 'HOME_PAGE_GETTING_STARTED_CARD_ENABLED') {
            cachedGettingStartedCard = parseBooleanValue(cfg.configValue, true);
          } else if (cfg.configTag === 'HOME_PAGE_PERSONAL_TRIVIA_CARD_ENABLED') {
            cachedPersonalTriviaCard = parseBooleanValue(cfg.configValue, true);
          } else if (cfg.configTag === 'HOME_PAGE_REMEMBER_WHEN_CARD_ENABLED') {
            cachedRememberWhenCard = parseBooleanValue(cfg.configValue, true);
          }
        });
        notifyAllListeners();
      }
    })
    .catch(() => {
      // Keep defaults on failure
    });

  window.addEventListener('sysconfig:changed', (e: Event) => {
    const customEvent = e as CustomEvent;
    const detail = customEvent.detail;
    if (!detail?.configTag) return;

    let changed = false;

    if (detail.configTag === 'HOME_PAGE_GETTING_STARTED_CARD_ENABLED') {
      cachedGettingStartedCard = detail.deleted ? true : parseBooleanValue(detail.configValue, true);
      changed = true;
    } else if (detail.configTag === 'HOME_PAGE_PERSONAL_TRIVIA_CARD_ENABLED') {
      cachedPersonalTriviaCard = detail.deleted ? true : parseBooleanValue(detail.configValue, true);
      changed = true;
    } else if (detail.configTag === 'HOME_PAGE_REMEMBER_WHEN_CARD_ENABLED') {
      cachedRememberWhenCard = detail.deleted ? true : parseBooleanValue(detail.configValue, true);
      changed = true;
    }

    if (changed) {
      notifyAllListeners();
    }
  });
}

/**
 * Custom hook to dynamically monitor enablement/disablement of Home Page cards.
 * Subscribes to the runtime `sysConfig` properties with reactive updates.
 */
export function useHomePageCardConfigs(): HomePageCardConfigs {
  const [flags, setFlags] = useState({
    gettingStarted: cachedGettingStartedCard,
    personalTrivia: cachedPersonalTriviaCard,
    rememberWhen: cachedRememberWhenCard
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setFlags({
      gettingStarted: cachedGettingStartedCard,
      personalTrivia: cachedPersonalTriviaCard,
      rememberWhen: cachedRememberWhenCard
    });

    const handler = (nextState: { gettingStarted: boolean; personalTrivia: boolean; rememberWhen: boolean }) => {
      setFlags(nextState);
    };

    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    isGettingStartedCardEnabled: flags.gettingStarted,
    isPersonalTriviaCardEnabled: flags.personalTrivia,
    isRememberWhenCardEnabled: flags.rememberWhen,
    isLoading
  };
}

export default useHomePageCardConfigs;
