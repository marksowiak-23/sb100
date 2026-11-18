/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MbrStory, MbrMedia } from '@/src/services/api';

interface CacheEntry<T> {
  ts: number;
  data: T;
}

const storyCacheMap = new Map<string, CacheEntry<any>>();
const memberProfileCacheMap = new Map<string, CacheEntry<any>>();
const memberMediaCacheMap = new Map<string, CacheEntry<MbrMedia[]>>();
let topicsCache: CacheEntry<any[]> = { ts: 0, data: [] };
let globalGroupsCache: CacheEntry<any[]> = { ts: 0, data: [] };

const STORY_TTL_MS = 180_000; // 3 minutes
const PROFILE_TTL_MS = 300_000; // 5 minutes
const MEDIA_TTL_MS = 60_000; // 1 minute
const TAXONOMY_TTL_MS = 600_000; // 10 minutes

export const storyCache = {
  /**
   * Stores a story record in memory and sessionStorage for instant retrieval.
   */
  set(storyId: string, data: any) {
    if (!storyId || !data) return;
    storyCacheMap.set(storyId, { ts: Date.now(), data });
    try {
      sessionStorage.setItem(`sb_cache_story_${storyId}`, JSON.stringify(data));
    } catch {}
  },

  /**
   * Retrieves a story record from memory or sessionStorage if not expired.
   */
  get(storyId: string): any | null {
    if (!storyId) return null;
    const item = storyCacheMap.get(storyId);
    if (item && Date.now() - item.ts < STORY_TTL_MS) {
      return item.data;
    }
    try {
      const stored = sessionStorage.getItem(`sb_cache_story_${storyId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        storyCacheMap.set(storyId, { ts: Date.now(), data: parsed });
        return parsed;
      }
    } catch {}
    return null;
  },

  /**
   * Caches an author profile.
   */
  setAuthorProfile(mbrId: string, profile: any) {
    if (!mbrId || !profile) return;
    memberProfileCacheMap.set(mbrId, { ts: Date.now(), data: profile });
  },

  /**
   * Retrieves a cached author profile.
   */
  getAuthorProfile(mbrId: string): any | null {
    if (!mbrId) return null;
    const item = memberProfileCacheMap.get(mbrId);
    if (item && Date.now() - item.ts < PROFILE_TTL_MS) {
      return item.data;
    }
    return null;
  },

  /**
   * Caches member media list.
   */
  setMemberMedia(mbrId: string, media: MbrMedia[]) {
    if (!mbrId || !media) return;
    memberMediaCacheMap.set(mbrId, { ts: Date.now(), data: media });
  },

  /**
   * Retrieves cached member media.
   */
  getMemberMedia(mbrId: string): MbrMedia[] | null {
    if (!mbrId) return null;
    const item = memberMediaCacheMap.get(mbrId);
    if (item && Date.now() - item.ts < MEDIA_TTL_MS) {
      return item.data;
    }
    return null;
  },

  /**
   * Caches topics taxonomy.
   */
  setTopics(topics: any[]) {
    topicsCache = { ts: Date.now(), data: topics };
  },

  /**
   * Retrieves cached topics.
   */
  getTopics(): any[] | null {
    if (topicsCache.data.length > 0 && Date.now() - topicsCache.ts < TAXONOMY_TTL_MS) {
      return topicsCache.data;
    }
    return null;
  },

  /**
   * Caches global groups.
   */
  setGlobalGroups(groups: any[]) {
    globalGroupsCache = { ts: Date.now(), data: groups };
  },

  /**
   * Retrieves cached global groups.
   */
  getGlobalGroups(): any[] | null {
    if (globalGroupsCache.data.length > 0 && Date.now() - globalGroupsCache.ts < TAXONOMY_TTL_MS) {
      return globalGroupsCache.data;
    }
    return null;
  }
};
