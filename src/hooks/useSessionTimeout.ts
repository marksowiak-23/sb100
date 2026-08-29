/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { sysConfigApi } from '@/src/services/api';

interface UseSessionTimeoutOptions {
  isLoggedIn: boolean;
  onTimeout: () => void;
  defaultTimeoutMinutes?: number;
}

interface UseSessionTimeoutReturn {
  isWarningOpen: boolean;
  remainingSeconds: number;
  renewSession: () => void;
  timeoutMinutes: number;
}

const WARNING_DURATION_SECONDS = 60;

/**
 * useSessionTimeout Hook
 *
 * Monitors user inactivity while authenticated, retrieves the dynamic
 * `SESSION_TIMEOUT_MINUTES` property from the backend sysConfig, and manages
 * the 60-second warning popup dialog countdown before executing session termination.
 */
export function useSessionTimeout({
  isLoggedIn,
  onTimeout,
  defaultTimeoutMinutes = 30
}: UseSessionTimeoutOptions): UseSessionTimeoutReturn {
  const [timeoutMinutes, setTimeoutMinutes] = useState<number>(defaultTimeoutMinutes);
  const [isWarningOpen, setIsWarningOpen] = useState<boolean>(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(WARNING_DURATION_SECONDS);

  const lastActivityRef = useRef<number>(Date.now());
  const isWarningOpenRef = useRef<boolean>(false);
  isWarningOpenRef.current = isWarningOpen;

  // 1. Fetch configured SESSION_TIMEOUT_MINUTES from sysConfig
  useEffect(() => {
    let isMounted = true;
    const fetchTimeoutConfig = async () => {
      try {
        const config = await sysConfigApi.getSysConfigByTag('SESSION_TIMEOUT_MINUTES');
        if (isMounted && config && config.configValue) {
          const parsed = parseInt(config.configValue, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setTimeoutMinutes(parsed);
          }
        }
      } catch {
        // Maintain default timeout on offline / error
      }
    };

    if (isLoggedIn) {
      fetchTimeoutConfig();
    }
    return () => {
      isMounted = false;
    };
  }, [isLoggedIn]);

  // 2. Activity registration (reset activity timestamp on user interaction)
  const registerActivity = useCallback(() => {
    // Only reset automatically if the warning modal is not currently showing.
    // When the warning modal is active, the user must explicitly click "Stay Signed In".
    if (!isWarningOpenRef.current) {
      lastActivityRef.current = Date.now();
    }
  }, []);

  // 3. User interaction event listeners
  useEffect(() => {
    if (!isLoggedIn) return;

    // Reset last activity to current time upon login/mount
    lastActivityRef.current = Date.now();

    const events: Array<keyof WindowEventMap> = [
      'mousemove',
      'mousedown',
      'keydown',
      'scroll',
      'touchstart',
      'pointerdown'
    ];

    let lastThrottledTime = 0;
    const handleUserInteraction = () => {
      const now = Date.now();
      if (now - lastThrottledTime > 1000) {
        lastThrottledTime = now;
        registerActivity();
      }
    };

    events.forEach((event) => {
      window.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [isLoggedIn, registerActivity]);

  // 4. Timer interval tick (checks inactivity every second)
  useEffect(() => {
    if (!isLoggedIn) {
      setIsWarningOpen(false);
      setRemainingSeconds(WARNING_DURATION_SECONDS);
      return;
    }

    const interval = setInterval(() => {
      const now = Date.now();
      const elapsedSeconds = Math.floor((now - lastActivityRef.current) / 1000);
      const totalTimeoutSeconds = timeoutMinutes * 60;
      const warningThresholdSeconds = Math.max(0, totalTimeoutSeconds - WARNING_DURATION_SECONDS);

      if (elapsedSeconds >= totalTimeoutSeconds) {
        // Expiration reached
        setIsWarningOpen(false);
        onTimeout();
      } else if (elapsedSeconds >= warningThresholdSeconds) {
        // Warning threshold reached (inside the last 60 seconds)
        const remaining = Math.max(0, totalTimeoutSeconds - elapsedSeconds);
        setRemainingSeconds(remaining);
        setIsWarningOpen(true);
      } else {
        // User is active before warning threshold
        if (isWarningOpenRef.current) {
          setIsWarningOpen(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isLoggedIn, timeoutMinutes, onTimeout]);

  // 5. Explicit session renewal action
  const renewSession = useCallback(() => {
    lastActivityRef.current = Date.now();
    setIsWarningOpen(false);
    setRemainingSeconds(WARNING_DURATION_SECONDS);
  }, []);

  return {
    isWarningOpen,
    remainingSeconds,
    renewSession,
    timeoutMinutes
  };
}
