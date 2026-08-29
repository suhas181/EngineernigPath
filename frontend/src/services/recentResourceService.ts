import api from './api';
import { useAuthStore } from '../store/useAuthStore';

export interface RecentResourceItem {
  id: string;
  resourceId: string;
  title: string;
  provider: string;
  type: string;
  url: string;
  thumbnail?: string;
  lastOpenedAt: string | Date;
}

export interface ResourceOpenPayload {
  id?: string;
  resourceId?: string;
  title: string;
  provider?: string;
  type?: string;
  url: string;
  thumbnail?: string;
}

const GUEST_STORAGE_KEY = 'engineerpath_guest_recent_resources';
const AUTH_CACHE_KEY = 'engineerpath_user_recent_resources_cache';

/**
 * Derives a clean provider name from URL if missing
 */
export function deriveProviderFromUrl(url: string, defaultProvider: string = 'EngineerPath'): string {
  try {
    const hostname = new URL(url).hostname.replace('www.', '');
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('takeuforward.org')) return 'takeUforward';
    if (hostname.includes('neetcode.io')) return 'NeetCode';
    if (hostname.includes('leetcode.com')) return 'LeetCode';
    if (hostname.includes('geeksforgeeks.org')) return 'GeeksforGeeks';
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('react.dev')) return 'Meta Open Source';
    if (hostname.includes('mozilla.org')) return 'MDN Web Docs';
    if (hostname.includes('coursera.org')) return 'Coursera';
    if (hostname.includes('udemy.com')) return 'Udemy';
    return hostname.split('.')[0] || defaultProvider;
  } catch (e) {
    return defaultProvider;
  }
}

/**
 * Single reusable entry point called whenever a student or guest opens any resource across the platform.
 * Gracefully records activity without throwing errors if the history backend is unreachable.
 */
export async function recordResourceOpened(resource: ResourceOpenPayload): Promise<void> {
  if (!resource || !resource.url || typeof resource.url !== 'string' || !resource.url.trim()) {
    return;
  }

  const cleanUrl = resource.url.trim();
  const stableId = (resource.id || resource.resourceId || cleanUrl).trim();
  const cleanTitle = (resource.title || 'Learning Resource').trim();
  const cleanProvider = (resource.provider || deriveProviderFromUrl(cleanUrl)).trim();
  const cleanType = (resource.type || 'article').toLowerCase().trim();
  const nowIso = new Date().toISOString();

  const item: RecentResourceItem = {
    id: stableId,
    resourceId: stableId,
    title: cleanTitle,
    provider: cleanProvider,
    type: cleanType,
    url: cleanUrl,
    thumbnail: resource.thumbnail || '',
    lastOpenedAt: nowIso,
  };

  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  // 1. Authenticated User Flow: Post to Backend API & maintain local cache
  if (isAuthenticated) {
    try {
      // Optimistically update local user cache
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      let list: RecentResourceItem[] = cached ? JSON.parse(cached) : [];
      list = [item, ...list.filter((r) => r.id !== stableId && r.url !== cleanUrl)].slice(0, 10);
      localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(list));

      // Asynchronously record on server
      await api.post('/resources/recent', {
        resourceId: stableId,
        title: cleanTitle,
        provider: cleanProvider,
        type: cleanType,
        url: cleanUrl,
        thumbnail: resource.thumbnail || '',
      });
    } catch (err) {
      // Non-blocking failure: resource still opened normally
      console.warn('[RecentResourceService] Background history recording failed silently:', err);
    }
    return;
  }

  // 2. Guest / Logged-out User Flow: Purely browser-scoped localStorage (Never leaks across users)
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    let guestList: RecentResourceItem[] = raw ? JSON.parse(raw) : [];
    // Deduplicate: move the existing record to top if reopened, update lastOpenedAt
    guestList = [item, ...guestList.filter((r) => r.id !== stableId && r.url !== cleanUrl)].slice(0, 10);
    localStorage.setItem(GUEST_STORAGE_KEY, JSON.stringify(guestList));
  } catch (err) {
    console.warn('[RecentResourceService] Failed to save guest recent resource in localStorage:', err);
  }
}

/**
 * Fetches the user's recently opened resources sorted by lastOpenedAt DESC.
 * Authenticated: Fetches from backend API (with local cache fallback).
 * Guest: Fetches from guest localStorage.
 */
export async function getRecentResources(limit: number = 6): Promise<RecentResourceItem[]> {
  const isAuthenticated = useAuthStore.getState().isAuthenticated;

  if (isAuthenticated) {
    try {
      const response = await api.get<{ success: boolean; count: number; resources: RecentResourceItem[] }>(
        '/resources/recent',
        { params: { limit } }
      );
      if (response.data && response.data.success && Array.isArray(response.data.resources)) {
        localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify(response.data.resources));
        return response.data.resources;
      }
    } catch (err) {
      console.warn('[RecentResourceService] Failed to load server recent resources, reading cache:', err);
      const cached = localStorage.getItem(AUTH_CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached).slice(0, limit);
        } catch (e) {
          return [];
        }
      }
    }
    return [];
  }

  // Guest mode
  try {
    const raw = localStorage.getItem(GUEST_STORAGE_KEY);
    if (!raw) return [];
    const guestList: RecentResourceItem[] = JSON.parse(raw);
    return Array.isArray(guestList)
      ? guestList
          .sort((a, b) => new Date(b.lastOpenedAt).getTime() - new Date(a.lastOpenedAt).getTime())
          .slice(0, limit)
      : [];
  } catch (err) {
    return [];
  }
}

export default {
  recordResourceOpened,
  getRecentResources,
  deriveProviderFromUrl,
};
