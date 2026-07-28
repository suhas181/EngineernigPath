import { IUser } from '../models/User';

export interface LeetCodeStats {
  username: string;
  totalSolved: number;
  easySolved: number;
  mediumSolved: number;
  hardSolved: number;
  ranking: number;
}

const LEETCODE_GRAPHQL_ENDPOINT = 'https://leetcode.com/graphql';
const SIX_HOURS_MS = 6 * 60 * 60 * 1000;

const USER_PROFILE_QUERY = `
  query getUserProfile($username: String!) {
    matchedUser(username: $username) {
      username
      profile {
        ranking
      }
      submitStatsGlobal {
        acSubmissionNum {
          difficulty
          count
        }
      }
    }
  }
`;

/**
 * Fetches real public LeetCode statistics for a given username using LeetCode's GraphQL API.
 * Returns null if the user does not exist, API fails, or rate limited.
 */
export async function fetchLeetCodeStats(username: string): Promise<LeetCodeStats | null> {
  const cleanUsername = (username || '').trim();
  if (!cleanUsername) {
    return null;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(LEETCODE_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': `https://leetcode.com/${cleanUsername}/`,
      },
      body: JSON.stringify({
        query: USER_PROFILE_QUERY,
        variables: { username: cleanUsername },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[LEETCODE-SERVICE] HTTP Error ${response.status} fetching stats for "${cleanUsername}"`);
      return null;
    }

    const json: any = await response.json();

    if (json.errors || !json.data || !json.data.matchedUser) {
      console.warn(`[LEETCODE-SERVICE] LeetCode user "${cleanUsername}" not found or returned GraphQL error.`);
      return null;
    }

    const matchedUser = json.data.matchedUser;
    const ranking = matchedUser.profile?.ranking || 0;
    const submissionStats = matchedUser.submitStatsGlobal?.acSubmissionNum || [];

    let totalSolved = 0;
    let easySolved = 0;
    let mediumSolved = 0;
    let hardSolved = 0;

    submissionStats.forEach((stat: { difficulty: string; count: number }) => {
      const diff = (stat.difficulty || '').toLowerCase();
      if (diff === 'all') totalSolved = stat.count || 0;
      else if (diff === 'easy') easySolved = stat.count || 0;
      else if (diff === 'medium') mediumSolved = stat.count || 0;
      else if (diff === 'hard') hardSolved = stat.count || 0;
    });

    if (!totalSolved) {
      totalSolved = easySolved + mediumSolved + hardSolved;
    }

    console.log(`[LEETCODE-SERVICE] Successfully fetched live stats for "${cleanUsername}": Total: ${totalSolved} (E:${easySolved}, M:${mediumSolved}, H:${hardSolved}), Rank: ${ranking}`);

    return {
      username: cleanUsername,
      totalSolved,
      easySolved,
      mediumSolved,
      hardSolved,
      ranking,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    console.error(`[LEETCODE-SERVICE] Failed to fetch LeetCode stats for "${cleanUsername}":`, error.message || error);
    return null;
  }
}

/**
 * Checks if the user's LeetCode stats need refreshing (>= 6 hours old or forced),
 * fetches fresh stats from LeetCode GraphQL API, updates user document fields, and saves to MongoDB.
 * Retains existing cached data gracefully if LeetCode API fails.
 */
export async function syncUserLeetCodeStats(user: IUser, forceRefresh: boolean = false): Promise<IUser> {
  if (!user.leetcodeUsername || user.leetcodeUsername.trim() === '') {
    return user;
  }

  const now = new Date();
  const lastFetched = user.leetcodeStatsLastFetchedAt;
  const isExpired = !lastFetched || (now.getTime() - new Date(lastFetched).getTime() >= SIX_HOURS_MS);

  if (!forceRefresh && !isExpired) {
    const minsAgo = Math.round((now.getTime() - new Date(lastFetched!).getTime()) / 60000);
    console.log(`[LEETCODE-SERVICE] Serving cached LeetCode stats for "${user.leetcodeUsername}" (Last fetched ${minsAgo} mins ago)`);
    return user;
  }

  console.log(`[LEETCODE-SERVICE] ${forceRefresh ? 'Force refreshing' : '6-hour cache expired for'} LeetCode username "${user.leetcodeUsername}"...`);
  const freshStats = await fetchLeetCodeStats(user.leetcodeUsername);

  if (freshStats) {
    user.leetcodeEasyCount = freshStats.easySolved;
    user.leetcodeMediumCount = freshStats.mediumSolved;
    user.leetcodeHardCount = freshStats.hardSolved;
    user.leetcodeRanking = freshStats.ranking;
    user.leetcodeStatsLastFetchedAt = now;
    await user.save();
    console.log(`[LEETCODE-SERVICE] Updated and saved MongoDB LeetCode stats for "${user.leetcodeUsername}"`);
  } else {
    console.warn(`[LEETCODE-SERVICE] Could not refresh LeetCode stats for "${user.leetcodeUsername}". Retaining cached values.`);
  }

  return user;
}
