/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { sysConfigApi } from '@/src/services/api';

interface AdminComponentTagProps {
  name: string;
  className?: string;
}

// Module-level shared singleton cache to avoid duplicate network calls
let cachedShowComponentName: boolean = true;
let isInitialized = false;
const listeners = new Set<(show: boolean) => void>();

function notifyListeners(show: boolean) {
  cachedShowComponentName = show;
  listeners.forEach((listener) => listener(show));
}

// Initialize dynamic listener and fetch configuration once on client load
if (typeof window !== 'undefined' && !isInitialized) {
  isInitialized = true;

  sysConfigApi
    .getSysConfigByTag('SHOW_COMPONENT_NAME')
    .then((cfg) => {
      if (cfg && cfg.configValue !== undefined) {
        const val = String(cfg.configValue).toLowerCase() === 'true' || cfg.configValue === '1';
        notifyListeners(val);
      }
    })
    .catch(() => {
      const envVal = import.meta.env.VITE_ADMIN_DISPLAY_COMPONENT_NAME;
      if (envVal !== undefined) {
        notifyListeners(envVal === 'true' || envVal === true || envVal === '1');
      }
    });

  window.addEventListener('sysconfig:changed', (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail?.configTag === 'SHOW_COMPONENT_NAME') {
      if (customEvent.detail.deleted) {
        notifyListeners(true);
      } else {
        const val =
          String(customEvent.detail.configValue).toLowerCase() === 'true' ||
          customEvent.detail.configValue === '1';
        notifyListeners(val);
      }
    }
  });
}

/**
 * Hook to read the dynamic SHOW_COMPONENT_NAME system property
 */
export function useShowComponentName(): boolean {
  const [show, setShow] = useState<boolean>(cachedShowComponentName);

  useEffect(() => {
    setShow(cachedShowComponentName);
    listeners.add(setShow);
    return () => {
      listeners.delete(setShow);
    };
  }, []);

  return show;
}

/**
 * AdminComponentTag
 * Displays the React code component name at the bottom-right of each component
 * in an in-flow container so wrapping/nested components naturally stack without
 * overlapping or colliding on the same spot.
 * Controlled dynamically via the SHOW_COMPONENT_NAME system configuration property.
 */
export function AdminComponentTag({ name, className = '' }: AdminComponentTagProps) {
  const isEnabled = useShowComponentName();

  if (!isEnabled) return null;

  return (
    <div
      className={`w-full flex justify-end items-center px-1 py-0 mt-0.5 pointer-events-none select-none z-10 ${className}`}
      title={`React Component: ${name}`}
    >
      <span className="text-[9px] font-mono font-medium leading-none text-slate-400 dark:text-slate-500 bg-slate-100/90 dark:bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-200/70 dark:border-slate-700/80 shadow-2xs">
        {name}
      </span>
    </div>
  );
}

export default AdminComponentTag;
