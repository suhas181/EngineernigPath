import { Internship, IInternship, InternshipRole, InternshipStatus } from '../models/Internship';
import { InternshipSyncLog } from '../models/InternshipSyncLog';
import { User } from '../models/User';
import mongoose from 'mongoose';

export interface RawInternship {
  externalId: string;
  source: string;
  title: string;
  company: string;
  description?: string;
  location?: string;
  country?: string;
  remote?: boolean;
  employmentType?: string;
  skills: string[];
  applicationUrl: string;
  companyUrl?: string;
  sourceUrl?: string;
  salary?: string;
  publishedAt?: Date;
  expiresAt?: Date;
  status: InternshipStatus;
  role: InternshipRole;
}

export interface FetchResult {
  listings: RawInternship[];
  totalFetched: number;
  rejectedCount: number;
}

export interface JobSource {
  name: string;
  fetchInternships(query: string): Promise<FetchResult>;
}

// In-process synchronization lock to prevent concurrent sync executions
let isSyncInProgress = false;

/**
 * Validates whether an external job opportunity is genuinely an internship, trainee, or co-op role.
 * Conservative validator that rejects senior, lead, staff, management, and standard full-time positions.
 */
export function isValidInternshipOpportunity(item: {
  title: string;
  description?: string;
  contract_type?: string;
  contract_time?: string;
  category?: { tag?: string; label?: string } | string;
}): boolean {
  const title = (item.title || '').trim().toLowerCase();
  const description = (item.description || '').trim().toLowerCase();
  const contractType = (item.contract_type || '').toLowerCase();
  const contractTime = (item.contract_time || '').toLowerCase();

  // 1. Definite negative title exclusions (Senior/Lead/Manager/Principal/Staff/Architect/Director/etc.)
  const seniorExclusionPattern =
    /\b(senior|sr\.?|lead|principal|staff|architect|manager|director|vp|head of|associate director|partner|specialist|expert|experienced|consultant|se-2|se-3|sde-2|sde-3|sde-ii|sde-iii|sde 2|sde 3|level 2|level 3|l2|l3|l4|l5|l6)\b/i;

  // Explicit positive internship keywords in title
  const internshipTitlePattern =
    /\b(intern|interns|internship|trainee|trainees|co-op|coop|apprentice|apprenticeship|graduate trainee|student intern)\b/i;

  if (seniorExclusionPattern.test(title) && !internshipTitlePattern.test(title)) {
    return false;
  }

  // 2. Direct positive match in title (Highest confidence)
  if (internshipTitlePattern.test(title)) {
    return true;
  }

  // 3. Contract type / time explicitly mentions internship
  if (contractType.includes('intern') || contractTime.includes('intern')) {
    return true;
  }

  // 4. Description checks (conservative to prevent false positives from "mentoring interns")
  const falsePositiveDescPatterns = [
    /mentor(ing)?\s+(the\s+)?interns?/gi,
    /guide\s+(the\s+)?interns?/gi,
    /lead(ing)?\s+(the\s+)?interns?/gi,
    /manage\s+(the\s+)?interns?/gi,
    /supervis(e|ing)\s+(the\s+)?interns?/gi,
    /training\s+interns?/gi,
    /direct(ing)?\s+(the\s+)?interns?/gi,
  ];

  let cleanDesc = description;
  for (const fp of falsePositiveDescPatterns) {
    cleanDesc = cleanDesc.replace(fp, '');
  }

  const strongInternshipDescPatterns = [
    /\b(internship duration|duration of internship|stipend\s*:\s*|months?\s+internship|summer internship|winter internship|fall internship|spring internship)\b/i,
    /\b(we are looking for an? (engineering|software|developer|frontend|backend|data|ai|ml|qa|ui|web)?\s*intern)\b/i,
    /\b(internship opportunity|internship role|intern role|intern position|internship position)\b/i,
    /\b(graduate engineer trainee|graduate apprentice|engineering trainee|student trainee)\b/i,
    /\b(certificate of internship|letter of recommendation upon completion of internship)\b/i,
    /\b(currently enrolled in|pre-final year|final year students?|freshers? (can apply|eligible))\b/i,
  ];

  const hasStrongDescIndicator = strongInternshipDescPatterns.some((pattern) => pattern.test(cleanDesc));

  if (hasStrongDescIndicator) {
    return true;
  }

  return false;
}

/**
 * Determines employment type from source data without blindly hard-coding "Internship"
 */
function determineEmploymentType(item: any, title: string, description: string): string {
  const combined = `${title} ${description} ${item.contract_type || ''} ${item.contract_time || ''}`.toLowerCase();
  if (/\b(co-op|coop)\b/i.test(combined)) {
    return 'Co-op';
  }
  if (/\b(trainee|apprentice|apprenticeship)\b/i.test(combined)) {
    return 'Trainee';
  }
  return 'Internship';
}

/**
 * Known skill keywords for normalization extraction
 */
const KNOWN_SKILL_KEYWORDS = [
  'Java',
  'Python',
  'C++',
  'C#',
  'JavaScript',
  'TypeScript',
  'React',
  'React Native',
  'Node.js',
  'Express',
  'Next.js',
  'Vue',
  'Angular',
  'HTML',
  'CSS',
  'Tailwind',
  'SQL',
  'MySQL',
  'PostgreSQL',
  'MongoDB',
  'Redis',
  'AWS',
  'Docker',
  'Kubernetes',
  'Git',
  'GitHub',
  'Linux',
  'REST API',
  'GraphQL',
  'Machine Learning',
  'Deep Learning',
  'PyTorch',
  'TensorFlow',
  'Data Analysis',
  'Pandas',
  'NumPy',
  'Flutter',
  'Spring Boot',
  'Django',
  'Flask',
  'Cybersecurity',
  'DevOps',
];

/**
 * Classifies a job title and description into one of our predefined InternshipRole enums.
 */
function classifyRole(title: string, description: string): InternshipRole {
  const combined = `${title} ${description}`.toLowerCase();

  if (combined.includes('frontend') || combined.includes('react') || combined.includes('ui/ux') || combined.includes('web developer')) {
    return 'Frontend Engineer';
  }
  if (combined.includes('backend') || combined.includes('node') || combined.includes('express') || combined.includes('django') || combined.includes('spring')) {
    return 'Backend Engineer';
  }
  if (combined.includes('ai') || combined.includes('machine learning') || combined.includes('deep learning') || combined.includes('nlp') || combined.includes('computer vision')) {
    return 'AI/ML Engineer';
  }
  if (combined.includes('data science') || combined.includes('data analyst') || combined.includes('data engineer') || combined.includes('analytics')) {
    return 'Data Analyst';
  }
  if (combined.includes('devops') || combined.includes('cloud') || combined.includes('aws') || combined.includes('docker') || combined.includes('kubernetes')) {
    return 'DevOps Engineer';
  }
  if (combined.includes('mobile') || combined.includes('android') || combined.includes('ios') || combined.includes('flutter') || combined.includes('react native')) {
    return 'Mobile Developer';
  }
  if (combined.includes('cyber') || combined.includes('security') || combined.includes('infosec') || combined.includes('penetration')) {
    return 'Cybersecurity Engineer';
  }
  return 'Software Engineer';
}

/**
 * Extracts matching technical skills from job title and description text.
 */
function extractSkills(title: string, description: string): string[] {
  const text = `${title} ${description}`;
  const matched = new Set<string>();

  KNOWN_SKILL_KEYWORDS.forEach((skill) => {
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      matched.add(skill);
    }
  });

  if (matched.size === 0) {
    matched.add('Software Engineering');
    matched.add('Problem Solving');
  }

  return Array.from(matched);
}

/**
 * Clean text snippets by stripping HTML tags and excess whitespace
 */
function cleanSnippet(str: string): string {
  if (!str) return '';
  return str
    .replace(/<[^>]*>?/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Adzuna Job Search API Source Implementation
 */
export class AdzunaSource implements JobSource {
  name = 'Adzuna';

  async fetchInternships(query: string): Promise<FetchResult> {
    const appId = (process.env.ADZUNA_APP_ID || '').trim();
    const appKey = (process.env.ADZUNA_APP_KEY || '').trim();
    const country = (process.env.ADZUNA_COUNTRY || 'in').trim();

    if (!appId || !appKey) {
      console.warn('[ADZUNA-SOURCE] ADZUNA_APP_ID or ADZUNA_APP_KEY not set in environment. Skipping external API fetch.');
      return { listings: [], totalFetched: 0, rejectedCount: 0 };
    }

    try {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(query)}&content-type=application/json`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[ADZUNA-SOURCE] API error: ${response.status} ${response.statusText} for query "${query}"`);
        return { listings: [], totalFetched: 0, rejectedCount: 0 };
      }

      const data: any = await response.json();
      if (!data || !Array.isArray(data.results)) {
        return { listings: [], totalFetched: 0, rejectedCount: 0 };
      }

      const validListings: RawInternship[] = [];
      let rejectedCount = 0;

      for (const item of data.results) {
        const title = cleanSnippet(item.title || '');
        const company = cleanSnippet(item.company?.display_name || 'Technology Company');
        const description = cleanSnippet(item.description || '');

        // Validate that item is genuinely an internship
        const isValid = isValidInternshipOpportunity({
          title,
          description,
          contract_type: item.contract_type,
          contract_time: item.contract_time,
          category: item.category,
        });

        if (!isValid) {
          rejectedCount++;
          continue;
        }

        let location = 'India';
        if (item.location?.display_name) {
          location = cleanSnippet(item.location.display_name);
        } else if (Array.isArray(item.location?.area) && item.location.area.length > 0) {
          location = item.location.area.join(', ');
        }

        const isRemote = /remote|wfh|work from home|home-based/i.test(`${title} ${description} ${location}`);
        const role = classifyRole(title, description);
        const skills = extractSkills(title, description);
        const employmentType = determineEmploymentType(item, title, description);

        let salary = '';
        if (item.salary_min || item.salary_max) {
          const min = item.salary_min ? Math.round(item.salary_min) : null;
          const max = item.salary_max ? Math.round(item.salary_max) : null;
          if (min && max) {
            salary = `₹${min.toLocaleString('en-IN')} - ₹${max.toLocaleString('en-IN')} / year`;
          } else if (min) {
            salary = `₹${min.toLocaleString('en-IN')} / year`;
          } else if (max) {
            salary = `Up to ₹${max.toLocaleString('en-IN')} / year`;
          }
        }

        const publishedAt = item.created ? new Date(item.created) : new Date();
        const applicationUrl = item.redirect_url || `https://www.adzuna.in/details/${item.id}`;

        validListings.push({
          externalId: String(item.id),
          source: 'Adzuna',
          title,
          company,
          description,
          location,
          country,
          remote: isRemote,
          employmentType,
          skills,
          applicationUrl,
          companyUrl: '',
          sourceUrl: applicationUrl,
          salary,
          publishedAt,
          status: 'OPEN',
          role,
        });
      }

      return {
        listings: validListings,
        totalFetched: data.results.length,
        rejectedCount,
      };
    } catch (error: any) {
      console.error(`[ADZUNA-SOURCE] Exception fetching query "${query}":`, error.message || error);
      return { listings: [], totalFetched: 0, rejectedCount: 0 };
    }
  }
}

const SEARCH_QUERIES = [
  'Software Engineer Intern',
  'Software Developer Intern',
  'SDE Intern',
  'Frontend Developer Intern',
  'Backend Developer Intern',
  'Full Stack Developer Intern',
  'Java Developer Intern',
  'Python Developer Intern',
  'C++ Developer Intern',
  'React Developer Intern',
  'Node.js Developer Intern',
  'AI/ML Intern',
  'Data Science Intern',
  'DevOps Intern',
  'Mobile Developer Intern',
  'Cybersecurity Intern',
];

export interface RefreshResult {
  added: number;
  updated: number;
  rejected: number;
  totalFetched: number;
  status: 'SUCCESS' | 'FAILED' | 'ALREADY_RUNNING';
  errorMessage?: string;
}

/**
 * Service to execute backend refresh & sync of internships
 * Fully automated, idempotent, resilient, tracked in MongoDB
 */
export async function refreshInternships(
  triggerType: 'SCHEDULED_CRON' | 'BOOTSTRAP' | 'MANUAL_TRIGGER' | 'WEBHOOK' = 'SCHEDULED_CRON',
  triggeredBy: string = 'SYSTEM_SCHEDULER',
  customSource?: JobSource,
  customQueries?: string[]
): Promise<RefreshResult> {
  // Prevent duplicate concurrent executions
  if (isSyncInProgress) {
    console.log('[Internship Sync] Synchronization is already running. Skipping concurrent invocation.');
    return {
      added: 0,
      updated: 0,
      rejected: 0,
      totalFetched: 0,
      status: 'ALREADY_RUNNING',
    };
  }

  isSyncInProgress = true;
  const startedAt = new Date();
  console.log('[Internship Sync] Started');

  let syncLog: any = null;
  try {
    syncLog = await InternshipSyncLog.create({
      syncType: triggerType,
      status: 'RUNNING',
      startedAt,
      triggeredBy,
    });
  } catch (logErr: any) {
    console.error('[Internship Sync] Could not record initial sync log:', logErr.message);
  }

  const source = customSource || new AdzunaSource();
  const queries = customQueries || SEARCH_QUERIES;
  let addedCount = 0;
  let updatedCount = 0;
  let totalFetchedCount = 0;
  let totalRejectedCount = 0;

  try {
    for (const query of queries) {
      const fetchResult = await source.fetchInternships(query);
      totalFetchedCount += fetchResult.totalFetched;
      totalRejectedCount += fetchResult.rejectedCount;

      for (const raw of fetchResult.listings) {
        try {
          const now = new Date();
          const existing = await Internship.findOne({ source: raw.source, externalId: raw.externalId });

          if (!existing) {
            await Internship.create({
              ...raw,
              lastCheckedAt: now,
            });
            addedCount++;
          } else {
            existing.title = raw.title;
            existing.company = raw.company;
            existing.description = raw.description || existing.description;
            existing.location = raw.location;
            existing.remote = raw.remote;
            existing.skills = raw.skills;
            existing.applicationUrl = raw.applicationUrl;
            existing.employmentType = raw.employmentType;
            if (raw.salary) existing.salary = raw.salary;
            existing.status = 'OPEN';
            existing.lastCheckedAt = now;
            await existing.save();
            updatedCount++;
          }
        } catch (err: any) {
          if (err.code !== 11000) {
            console.error(`[Internship Sync] Error saving listing ${raw.externalId}:`, err.message);
          }
        }
      }
    }

    // Record success in log
    if (syncLog) {
      syncLog.status = 'SUCCESS';
      syncLog.completedAt = new Date();
      syncLog.fetchedCount = totalFetchedCount;
      syncLog.insertedCount = addedCount;
      syncLog.updatedCount = updatedCount;
      syncLog.rejectedCount = totalRejectedCount;
      await syncLog.save();
    }

    console.log(`[Internship Sync] Fetched: ${totalFetchedCount}`);
    console.log(`[Internship Sync] Inserted: ${addedCount}`);
    console.log(`[Internship Sync] Updated: ${updatedCount}`);
    console.log(`[Internship Sync] Rejected: ${totalRejectedCount}`);
    console.log('[Internship Sync] Completed successfully');

    return {
      added: addedCount,
      updated: updatedCount,
      rejected: totalRejectedCount,
      totalFetched: totalFetchedCount,
      status: 'SUCCESS',
    };
  } catch (error: any) {
    const errorMsg = error.message || 'Unknown synchronization error';
    console.error(`[Internship Sync] FAILED: ${errorMsg}`);

    if (syncLog) {
      syncLog.status = 'FAILED';
      syncLog.completedAt = new Date();
      syncLog.errorMessage = errorMsg;
      await syncLog.save();
    }

    return {
      added: addedCount,
      updated: updatedCount,
      rejected: totalRejectedCount,
      totalFetched: totalFetchedCount,
      status: 'FAILED',
      errorMessage: errorMsg,
    };
  } finally {
    isSyncInProgress = false;
  }
}

/**
 * Returns latest synchronization health status from database
 */
export async function getSyncHealthStatus() {
  const latestLog = await InternshipSyncLog.findOne().sort({ startedAt: -1 }).lean();
  const lastSuccessLog = await InternshipSyncLog.findOne({ status: 'SUCCESS' }).sort({ startedAt: -1 }).lean();
  const [totalListings, openListings] = await Promise.all([
    Internship.countDocuments(),
    Internship.countDocuments({ status: 'OPEN' }),
  ]);

  return {
    latestSync: latestLog || null,
    lastSuccessfulSync: lastSuccessLog || null,
    isRunning: isSyncInProgress,
    totalListings,
    openListings,
  };
}

/**
 * Safely re-evaluates existing internship records against isValidInternshipOpportunity.
 * Marks validated active listings as OPEN and preserves UNKNOWN/CLOSED for non-matching records.
 * Idempotent, non-destructive.
 */
export async function reEvaluateInternshipStatuses(): Promise<{
  total: number;
  openCount: number;
  unknownCount: number;
  closedCount: number;
}> {
  const allListings = await Internship.find().lean();
  const now = new Date();
  const bulkOps: any[] = [];

  for (const item of allListings) {
    if (item.status === 'CLOSED') {
      // Preserve CLOSED status
      continue;
    }

    const isValid = isValidInternshipOpportunity({
      title: item.title,
      description: item.description,
      contract_type: item.employmentType,
    });

    if (isValid) {
      if (item.status !== 'OPEN') {
        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { status: 'OPEN', lastCheckedAt: now } },
          },
        });
      }
    } else {
      if (item.status !== 'UNKNOWN') {
        bulkOps.push({
          updateOne: {
            filter: { _id: item._id },
            update: { $set: { status: 'UNKNOWN' } },
          },
        });
      }
    }
  }

  if (bulkOps.length > 0) {
    await Internship.bulkWrite(bulkOps);
  }

  const [openCount, unknownCount, closedCount, total] = await Promise.all([
    Internship.countDocuments({ status: 'OPEN' }),
    Internship.countDocuments({ status: 'UNKNOWN' }),
    Internship.countDocuments({ status: 'CLOSED' }),
    Internship.countDocuments(),
  ]);

  return { total, openCount, unknownCount, closedCount };
}

export interface GetInternshipsParams {
  role?: string;
  location?: string;
  remote?: boolean | string;
  skills?: string;
  search?: string;
  source?: string;
  status?: string;
  page?: number | string;
  limit?: number | string;
  sort?: string;
  bookmarkedOnly?: boolean | string;
}

/**
 * Queries MongoDB for filtered internship listings and computes summary stats
 */
export async function getInternshipsList(params: GetInternshipsParams, userId?: string) {
  const query: any = {};

  // 1. Filter by Role
  if (params.role && params.role !== 'All') {
    query.role = params.role;
  }

  // 2. Filter by Remote / Work Mode
  if (params.remote === true || params.remote === 'true') {
    query.remote = true;
  }

  // 3. Filter by Location
  if (params.location && params.location !== 'All') {
    if (params.location.toLowerCase() === 'remote') {
      query.remote = true;
    } else {
      query.location = { $regex: new RegExp(params.location, 'i') };
    }
  }

  // 4. Filter by Skills
  if (params.skills) {
    const skillList = params.skills.split(',').map((s) => s.trim()).filter(Boolean);
    if (skillList.length > 0) {
      query.skills = { $in: skillList.map((s) => new RegExp(s, 'i')) };
    }
  }

  // 5. Search Across Title, Company, Description, Skills, Location
  if (params.search && params.search.trim()) {
    const cleanSearch = params.search.trim();
    query.$or = [
      { title: { $regex: new RegExp(cleanSearch, 'i') } },
      { company: { $regex: new RegExp(cleanSearch, 'i') } },
      { description: { $regex: new RegExp(cleanSearch, 'i') } },
      { skills: { $in: [new RegExp(cleanSearch, 'i')] } },
      { location: { $regex: new RegExp(cleanSearch, 'i') } },
    ];
  }

  // 6. Filter by Source
  if (params.source) {
    query.source = params.source;
  }

  // 7. Filter by Status if requested
  if (params.status) {
    query.status = params.status;
  }

  // 8. Filter by User Saved Bookmarks
  let savedInternshipIds: string[] = [];
  if (userId) {
    const currentUser = await User.findById(userId).select('savedInternships').lean();
    if (currentUser && currentUser.savedInternships) {
      savedInternshipIds = currentUser.savedInternships.map((id: any) => id.toString());
    }
  }

  if ((params.bookmarkedOnly === true || params.bookmarkedOnly === 'true') && userId) {
    query._id = { $in: savedInternshipIds.map((id) => new mongoose.Types.ObjectId(id)) };
  }

  // Pagination & Sorting setup
  const page = Math.max(1, parseInt(String(params.page || '1'), 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(String(params.limit || '12'), 10) || 12));
  const skip = (page - 1) * limit;

  let sortOption: any = { publishedAt: -1, createdAt: -1 };
  if (params.sort === 'oldest') {
    sortOption = { publishedAt: 1, createdAt: 1 };
  } else if (params.sort === 'company') {
    sortOption = { company: 1 };
  }

  const [internships, totalCount] = await Promise.all([
    Internship.find(query).sort(sortOption).skip(skip).limit(limit).lean(),
    Internship.countDocuments(query),
  ]);

  // Global aggregate stats: "Open Now" ONLY counts status: "OPEN"
  const [openCount, softwareCount, remoteCount, distinctCompanies, lastSuccessLog] = await Promise.all([
    Internship.countDocuments({ status: 'OPEN' }),
    Internship.countDocuments({ role: { $in: ['Software Engineer', 'Frontend Engineer', 'Backend Engineer'] } }),
    Internship.countDocuments({ remote: true }),
    Internship.distinct('company'),
    InternshipSyncLog.findOne({ status: 'SUCCESS' }).sort({ completedAt: -1 }).lean(),
  ]);

  return {
    success: true,
    count: internships.length,
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit) || 1,
    stats: {
      openCount,
      softwareCount,
      remoteCount,
      companyCount: distinctCompanies.length,
      lastCheckedAt: lastSuccessLog?.completedAt || null,
    },
    savedInternshipIds,
    internships,
  };
}

/**
 * Fetch detailed info for a single internship
 */
export async function getInternshipById(id: string, userId?: string) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return null;
  }

  const internship = await Internship.findById(id).lean();
  if (!internship) return null;

  let isBookmarked = false;
  if (userId) {
    const user = await User.findById(userId).select('savedInternships').lean();
    if (user && user.savedInternships) {
      isBookmarked = user.savedInternships.some((savedId: any) => savedId.toString() === id);
    }
  }

  return {
    ...internship,
    isBookmarked,
  };
}

/**
 * Computes deterministic, explainable internship recommendations for a student based on their profile.
 * Only recommends status = OPEN opportunities across the entire database.
 */
export async function getRecommendedInternships(userId: string, limit: number = 3) {
  const user = await User.findById(userId).select('preferredCareer preferredProgrammingLanguage skills').lean();
  if (!user) {
    return [];
  }

  const preferredCareer = (user.preferredCareer || '').trim().toLowerCase();
  const preferredLang = (user.preferredProgrammingLanguage || '').trim().toLowerCase();
  const userSkills = (user.skills || []).map((s: string) => s.trim().toLowerCase()).filter(Boolean);

  // Query up to 100 OPEN opportunities to score from the database
  let candidatePool = await Internship.find({ status: 'OPEN' })
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(100)
    .lean();

  // If no OPEN listings exist in current DB, fallback to any available listings
  if (candidatePool.length === 0) {
    candidatePool = await Internship.find()
      .sort({ publishedAt: -1, createdAt: -1 })
      .limit(100)
      .lean();
  }

  const scored = candidatePool
    .map((item) => {
      let score = 0;
      let reason = '✓ Recommended for your engineering profile';

      const roleLower = (item.role || '').toLowerCase();
      const titleLower = (item.title || '').toLowerCase();
      const skillsLower = (item.skills || []).map((s) => s.toLowerCase());

      if (preferredCareer && (roleLower.includes(preferredCareer) || titleLower.includes(preferredCareer))) {
        score += 5;
        reason = `✓ Matches your target role (${user.preferredCareer})`;
      } else if (preferredLang && skillsLower.includes(preferredLang)) {
        score += 4;
        reason = `✓ Matches your language (${user.preferredProgrammingLanguage})`;
      } else if (userSkills.some((s) => skillsLower.includes(s))) {
        score += 3;
        reason = '✓ Matches your core skill set';
      }

      return { item, score, reason };
    })
    .filter((rec) => rec.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  return scored;
}

/**
 * Toggle bookmark status for a user
 */
export async function toggleUserBookmark(userId: string, internshipId: string) {
  if (!mongoose.Types.ObjectId.isValid(internshipId)) {
    throw new Error('Invalid internship ID');
  }

  const user = await User.findById(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (!user.savedInternships) {
    user.savedInternships = [];
  }

  const existingIndex = user.savedInternships.findIndex(
    (savedId: any) => savedId.toString() === internshipId
  );

  let isBookmarked = false;
  if (existingIndex > -1) {
    user.savedInternships.splice(existingIndex, 1);
    isBookmarked = false;
  } else {
    user.savedInternships.push(new mongoose.Types.ObjectId(internshipId) as any);
    isBookmarked = true;
  }

  await user.save();

  return {
    success: true,
    isBookmarked,
    savedInternshipIds: user.savedInternships.map((id: any) => id.toString()),
  };
}
