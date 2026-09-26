import api from './api';

export type ViewEntityType = 'resource' | 'roadmap';

/**
 * Formats a raw view count into clean YouTube-style readable string:
 * - 450 -> "450"
 * - 1200 -> "1.2k"
 * - 15000 -> "15k"
 * - 1500000 -> "1.5M"
 */
export function formatViewCount(views?: number): string {
  if (typeof views !== 'number' || isNaN(views) || views <= 0) {
    return '1';
  }
  if (views < 1000) {
    return `${views}`;
  }
  if (views < 1_000_000) {
    const k = (views / 1000).toFixed(1).replace(/\.0$/, '');
    return `${k}k`;
  }
  const m = (views / 1_000_000).toFixed(1).replace(/\.0$/, '');
  return `${m}M`;
}

/**
 * Records a view for a resource or roadmap.
 * Uses sessionStorage deduplication to avoid rapid spamming in the same session.
 */
export async function trackView(
  entityType: ViewEntityType,
  entityId: string
): Promise<number | null> {
  if (!entityId || typeof entityId !== 'string' || !entityId.trim()) {
    return null;
  }

  const cleanId = entityId.trim();
  const sessionKey = `ep_view_${entityType}_${cleanId}`;

  // Session-level deduplication
  try {
    if (sessionStorage.getItem(sessionKey)) {
      return null; // Already counted in this session
    }
    sessionStorage.setItem(sessionKey, '1');
  } catch (e) {
    // If sessionStorage is restricted (e.g. private mode quirks), proceed safely
  }

  try {
    const res = await api.post<{ success: boolean; views: number }>('/views/track', {
      entityType,
      entityId: cleanId,
    });
    return res.data?.views ?? null;
  } catch (error) {
    // Fail silently in background without disturbing user experience
    return null;
  }
}

/**
 * Fetches the dictionary of all roadmap role view counts
 */
export async function fetchRoadmapViews(): Promise<Record<string, number>> {
  try {
    const res = await api.get<{ success: boolean; views: Record<string, number> }>('/roadmaps/views');
    if (res.data && res.data.success && res.data.views) {
      return res.data.views;
    }
  } catch (e) {
    // Fallback gracefully
  }
  return {};
}

export default {
  trackView,
  formatViewCount,
  fetchRoadmapViews,
};
