/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { Cd, taskApi } from '../services/api.ts';

export interface CodeContextType {
  codes: Cd[];
  loading: boolean;
  error: string | null;
  refreshCodes: () => Promise<void>;
  getCodesByTag: (cdTag: string) => Cd[];
  getCode: (cdTag: string, cdValue: string) => Cd | undefined;
  getCodeLabel: (cdTag: string, cdValue: string, fallback?: string) => string;
  getCodeDesc: (cdTag: string, cdValue: string) => string | undefined;
}

const CodeContext = createContext<CodeContextType | undefined>(undefined);

export interface CodeProviderProps {
  children: React.ReactNode;
}

export const CodeProvider: React.FC<CodeProviderProps> = ({ children }) => {
  const [codes, setCodes] = useState<Cd[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch up to 500 code records for universal in-memory caching
      const data = await taskApi.getCds(undefined, 500, 0);
      setCodes(data || []);
    } catch (err: any) {
      console.error('Failed to initialize CodeContext codes:', err);
      setError(err?.message || 'Failed to load code lookups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCodes();
  }, [fetchCodes]);

  // Pre-indexed map by cdTag (lowercased) for O(1) tag lookup and sorting
  const codesByTagMap = useMemo(() => {
    const map = new Map<string, Cd[]>();
    for (const item of codes) {
      if (!item.cdTag) continue;
      const tagKey = item.cdTag.trim().toLowerCase();
      const existing = map.get(tagKey) || [];
      existing.push(item);
      map.set(tagKey, existing);
    }

    // Sort each tag's codes by cdSortOrder ascending (nulls last), then cdLabel/cdValue
    for (const [tagKey, list] of map.entries()) {
      list.sort((a, b) => {
        const orderA = a.cdSortOrder ?? 999999;
        const orderB = b.cdSortOrder ?? 999999;
        if (orderA !== orderB) return orderA - orderB;
        const labelA = (a.cdLabel || a.cdValue || '').toLowerCase();
        const labelB = (b.cdLabel || b.cdValue || '').toLowerCase();
        return labelA.localeCompare(labelB);
      });
    }
    return map;
  }, [codes]);

  const getCodesByTag = useCallback((cdTag: string): Cd[] => {
    if (!cdTag) return [];
    const tagKey = cdTag.trim().toLowerCase();
    return codesByTagMap.get(tagKey) || [];
  }, [codesByTagMap]);

  const getCode = useCallback((cdTag: string, cdValue: string): Cd | undefined => {
    if (!cdTag || !cdValue) return undefined;
    const tagList = getCodesByTag(cdTag);
    const valueKey = cdValue.trim().toLowerCase();
    return tagList.find(c => (c.cdValue || '').trim().toLowerCase() === valueKey);
  }, [getCodesByTag]);

  const getCodeLabel = useCallback((cdTag: string, cdValue: string, fallback?: string): string => {
    if (!cdValue) return fallback ?? '';
    const item = getCode(cdTag, cdValue);
    if (item && item.cdLabel && item.cdLabel.trim() !== '') {
      return item.cdLabel;
    }
    if (item && item.cdValue) {
      return item.cdValue;
    }
    return fallback ?? cdValue;
  }, [getCode]);

  const getCodeDesc = useCallback((cdTag: string, cdValue: string): string | undefined => {
    if (!cdValue) return undefined;
    const item = getCode(cdTag, cdValue);
    return item?.cdDesc ?? undefined;
  }, [getCode]);

  const contextValue = useMemo<CodeContextType>(() => ({
    codes,
    loading,
    error,
    refreshCodes: fetchCodes,
    getCodesByTag,
    getCode,
    getCodeLabel,
    getCodeDesc,
  }), [codes, loading, error, fetchCodes, getCodesByTag, getCode, getCodeLabel, getCodeDesc]);

  return (
    <CodeContext.Provider value={contextValue}>
      {children}
    </CodeContext.Provider>
  );
};

/**
 * Custom hook to consume the CodeContext lookup methods and code list.
 */
export const useCodes = (): CodeContextType => {
  const context = useContext(CodeContext);
  if (!context) {
    throw new Error('useCodes must be used within a CodeProvider');
  }
  return context;
};
