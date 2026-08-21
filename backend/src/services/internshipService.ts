import { Internship, IInternship, InternshipRole, InternshipStatus } from '../models/Internship';
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

export interface JobSource {
  name: string;
  fetchInternships(query: string): Promise<RawInternship[]>;
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
    // Escaped regex search for exact skill matches
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(text)) {
      matched.add(skill);
    }
  });

  // Default fallback skills if none found
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

  async fetchInternships(query: string): Promise<RawInternship[]> {
    const appId = (process.env.ADZUNA_APP_ID || '').trim();
    const appKey = (process.env.ADZUNA_APP_KEY || '').trim();
    const country = (process.env.ADZUNA_COUNTRY || 'in').trim();

    if (!appId || !appKey) {
      console.warn('[ADZUNA-SOURCE] ADZUNA_APP_ID or ADZUNA_APP_KEY not set in environment. Skipping Adzuna API fetch.');
      return [];
    }

    try {
      const url = `https://api.adzuna.com/v1/api/jobs/${country}/search/1?app_id=${appId}&app_key=${appKey}&results_per_page=50&what=${encodeURIComponent(query)}&content-type=application/json`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`[ADZUNA-SOURCE] API error: ${response.status} ${response.statusText} for query "${query}"`);
        return [];
      }

      const data: any = await response.json();
      if (!data || !Array.isArray(data.results)) {
        return [];
      }

      return data.results.map((item: any) => {
        const title = cleanSnippet(item.title || 'Software Engineering Intern');
        const company = cleanSnippet(item.company?.display_name || 'Technology Company');
        const description = cleanSnippet(item.description || '');
        
        let location = 'India';
        if (item.location?.display_name) {
          location = cleanSnippet(item.location.display_name);
        } else if (Array.isArray(item.location?.area) && item.location.area.length > 0) {
          location = item.location.area.join(', ');
        }

        const isRemote = /remote|wfh|work from home|home-based/i.test(`${title} ${description} ${location}`);
        const role = classifyRole(title, description);
        const skills = extractSkills(title, description);

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

        return {
          externalId: String(item.id),
          source: 'Adzuna',
          title,
          company,
          description,
          location,
          country,
          remote: isRemote,
          employmentType: 'Internship',
          skills,
          applicationUrl,
          companyUrl: '',
          sourceUrl: applicationUrl,
          salary,
          publishedAt,
          status: 'UNKNOWN', // Status is UNKNOWN as Adzuna does not provide explicit expiry
          role,
        };
      });
    } catch (error: any) {
      console.error(`[ADZUNA-SOURCE] Exception fetching query "${query}":`, error.message || error);
      return [];
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

/**
 * Service to execute backend refresh & sync of internships
 */
export async function refreshInternships(): Promise<{ added: number; updated: number; totalFetched: number }> {
  const source = new AdzunaSource();
  let addedCount = 0;
  let updatedCount = 0;
  let totalFetched = 0;

  console.log('[INTERNSHIP-SERVICE] Starting internship database refresh cycle...');

  for (const query of SEARCH_QUERIES) {
    const rawListings = await source.fetchInternships(query);
    totalFetched += rawListings.length;

    for (const raw of rawListings) {
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
          if (raw.salary) existing.salary = raw.salary;
          existing.lastCheckedAt = now;
          await existing.save();
          updatedCount++;
        }
      } catch (err: any) {
        // Handle duplicate key edge cases gracefully
        if (err.code !== 11000) {
          console.error(`[INTERNSHIP-SERVICE] Error saving listing ${raw.externalId}:`, err.message);
        }
      }
    }
  }

  console.log(`[INTERNSHIP-SERVICE] Refresh completed: ${addedCount} new added, ${updatedCount} updated (${totalFetched} total processed).`);
  return { added: addedCount, updated: updatedCount, totalFetched };
}

export interface GetInternshipsParams {
  role?: string;
  location?: string;
  remote?: boolean | string;
  skills?: string;
  search?: string;
  source?: string;
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

  // 7. Filter by User Saved Bookmarks
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

  // Global aggregate stats across all available records in DB
  const [totalDbCount, softwareCount, remoteCount, distinctCompanies] = await Promise.all([
    Internship.countDocuments(),
    Internship.countDocuments({ role: { $in: ['Software Engineer', 'Frontend Engineer', 'Backend Engineer'] } }),
    Internship.countDocuments({ remote: true }),
    Internship.distinct('company'),
  ]);

  return {
    success: true,
    count: internships.length,
    total: totalCount,
    page,
    pages: Math.ceil(totalCount / limit) || 1,
    stats: {
      openCount: totalDbCount,
      softwareCount,
      remoteCount,
      companyCount: distinctCompanies.length,
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
