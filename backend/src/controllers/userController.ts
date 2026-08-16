import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { User } from '../models/User';
import { AuthenticatedRequest } from '../types';
import { uploadToCloudinary } from '../services/uploadService';
import { syncUserLeetCodeStats } from '../services/leetcodeService';

// ─── Constants ────────────────────────────────────────────────────────────────
const SKILL_LEVELS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const CAREER_GOALS = ['Placement', 'Internship', 'Higher Studies', 'Freelancing', 'Startup'] as const;
const PLACEMENT_TIMELINES = ['3 Months', '4 Months', '5 Months', '6 Months', '8 Months'] as const;

// ─── Reusable Zod sub-schemas ─────────────────────────────────────────────────
const trimmedString = z.string().transform((s) => s.trim());

const optionalUrl = z
  .string()
  .transform((s) => s.trim())
  .pipe(z.string().url('Must be a valid URL').or(z.literal('')))
  .optional();

const uniqueStringArray = z
  .array(z.string().transform((s) => s.trim()).pipe(z.string().min(1)))
  .transform((arr) => [...new Set(arr)])
  .optional();

const projectSchema = z.object({
  title: trimmedString.pipe(z.string().min(1, 'Project title is required')),
  description: trimmedString.pipe(z.string().min(1, 'Project description is required')),
  technologies: z
    .array(z.string().transform((s) => s.trim()).pipe(z.string().min(1)))
    .transform((arr) => [...new Set(arr)]),
  githubLink: optionalUrl.default(''),
  liveLink: optionalUrl.default(''),
  difficulty: z.enum(SKILL_LEVELS).default('Beginner'),
  isCompleted: z.boolean().default(false),
});

// ─── Main Update Schema ──────────────────────────────────────────────────────
const updateProfileSchema = z.object({
  // Existing fields (unchanged validation)
  name: trimmedString.pipe(z.string().min(1, 'Name is required')).optional(),
  college: trimmedString.optional(),
  branch: trimmedString.optional(),
  cgpa: z
    .number()
    .min(0, 'CGPA must be between 0 and 10')
    .max(10, 'CGPA must be between 0 and 10')
    .optional(),
  graduationYear: z.number().int().min(2000).max(2100).optional(),
  currentSemester: z.number().int().min(1).max(8).optional(),
  preferredCareer: trimmedString.optional(),
  skills: uniqueStringArray,
  interests: uniqueStringArray,
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  profileImage: z.string().optional(),

  // ── New Enriched Roadmap Fields ──────────────────────────────────────────
  dreamCompany: trimmedString.optional(),
  dailyStudyHours: z
    .number()
    .min(1, 'Daily study hours must be between 1 and 12')
    .max(12, 'Daily study hours must be between 1 and 12')
    .optional(),
  programmingLanguages: uniqueStringArray,
  frameworks: uniqueStringArray,
  leetcodeUsername: trimmedString.optional(),

  // LeetCode (granular)
  leetcodeEasyCount: z
    .number()
    .int('LeetCode Easy count must be a whole number')
    .min(0, 'LeetCode Easy count cannot be negative')
    .optional(),
  leetcodeMediumCount: z
    .number()
    .int('LeetCode Medium count must be a whole number')
    .min(0, 'LeetCode Medium count cannot be negative')
    .optional(),
  leetcodeHardCount: z
    .number()
    .int('LeetCode Hard count must be a whole number')
    .min(0, 'LeetCode Hard count cannot be negative')
    .optional(),

  // Skill levels
  dsaLevel: z.enum(SKILL_LEVELS).optional(),
  frontendLevel: z.enum(SKILL_LEVELS).optional(),
  backendLevel: z.enum(SKILL_LEVELS).optional(),
  databaseLevel: z.enum(SKILL_LEVELS).optional(),
  csFundamentalsLevel: z.enum(SKILL_LEVELS).optional(),
  aptitudeLevel: z.enum(SKILL_LEVELS).optional(),
  communicationLevel: z.enum(SKILL_LEVELS).optional(),

  // Career goal & timeline
  careerGoal: z.enum(CAREER_GOALS).optional(),
  placementTimeline: z.enum(PLACEMENT_TIMELINES).optional(),
  preferredProgrammingLanguage: z.enum(['Java', 'Python', 'C++']).optional(),
  preferredDsaLanguage: z.enum(['Java', 'Python', 'C++']).optional(),
  targetCompanyType: z.enum(['Product-Based', 'Service-Based']).optional(),

  // Subjects
  strongSubjects: uniqueStringArray,
  weakSubjects: uniqueStringArray,

  // Projects (extended)
  projects: z.array(projectSchema).optional(),
});

// ─── All updatable field names ────────────────────────────────────────────────
const UPDATABLE_FIELDS = [
  // existing
  'name',
  'college',
  'branch',
  'cgpa',
  'graduationYear',
  'currentSemester',
  'preferredCareer',
  'skills',
  'interests',
  'linkedinUrl',
  'githubUrl',
  'profileImage',
  // new
  'dreamCompany',
  'dailyStudyHours',
  'programmingLanguages',
  'frameworks',
  'leetcodeUsername',
  'leetcodeEasyCount',
  'leetcodeMediumCount',
  'leetcodeHardCount',
  'dsaLevel',
  'frontendLevel',
  'backendLevel',
  'databaseLevel',
  'csFundamentalsLevel',
  'aptitudeLevel',
  'communicationLevel',
  'careerGoal',
  'placementTimeline',
  'preferredProgrammingLanguage',
  'preferredDsaLanguage',
  'targetCompanyType',
  'strongSubjects',
  'weakSubjects',
  'projects',
] as const;

// ─── Serializer (single source of truth for API response shape) ──────────────
function serializeUser(user: any) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    college: user.college,
    branch: user.branch,
    cgpa: user.cgpa,
    graduationYear: user.graduationYear,
    currentSemester: user.currentSemester,
    preferredCareer: user.preferredCareer,
    skills: user.skills,
    interests: user.interests,
    linkedinUrl: user.linkedinUrl,
    githubUrl: user.githubUrl,
    profileImage: user.profileImage,
    // enriched fields
    dreamCompany: user.dreamCompany,
    dailyStudyHours: user.dailyStudyHours,
    programmingLanguages: user.programmingLanguages,
    frameworks: user.frameworks,
    leetcodeUsername: user.leetcodeUsername || '',
    leetcodeRanking: user.leetcodeRanking || 0,
    leetcodeStatsLastFetchedAt: user.leetcodeStatsLastFetchedAt || null,
    leetcodeEasyCount: user.leetcodeEasyCount || 0,
    leetcodeMediumCount: user.leetcodeMediumCount || 0,
    leetcodeHardCount: user.leetcodeHardCount || 0,
    dsaLevel: user.dsaLevel,
    frontendLevel: user.frontendLevel,
    backendLevel: user.backendLevel,
    databaseLevel: user.databaseLevel,
    csFundamentalsLevel: user.csFundamentalsLevel,
    aptitudeLevel: user.aptitudeLevel,
    communicationLevel: user.communicationLevel,
    careerGoal: user.careerGoal,
    placementTimeline: user.placementTimeline,
    preferredProgrammingLanguage: user.preferredProgrammingLanguage,
    preferredDsaLanguage: user.preferredDsaLanguage,
    targetCompanyType: user.targetCompanyType,
    strongSubjects: user.strongSubjects,
    weakSubjects: user.weakSubjects,
    projects: user.projects,
    createdAt: user.createdAt,
  };
}

// ─── GET /users/profile ──────────────────────────────────────────────────────
export const getProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let user = req.user;
    if (!user) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const defaultGuestUser = {
        _id: 'guest',
        name: 'Guest Explorer',
        email: 'guest@engineerpath.com',
        role: 'student',
        isVerified: true,
        college: 'Engineering University',
        branch: 'Computer Science & Engineering',
        cgpa: 8.5,
        graduationYear: 2026,
        currentSemester: 5,
        preferredCareer: 'Software Engineer',
        skills: ['React', 'TypeScript', 'Node.js', 'Python'],
        interests: ['Software Architecture', 'AI & Machine Learning'],
        linkedinUrl: '',
        githubUrl: '',
        profileImage: '',
        dreamCompany: 'Tier-1 Product Companies',
        dailyStudyHours: 4,
        programmingLanguages: ['Java', 'Python', 'JavaScript'],
        frameworks: ['React', 'Express.js', 'Node.js'],
        leetcodeUsername: '',
        leetcodeRanking: 0,
        leetcodeStatsLastFetchedAt: null,
        leetcodeEasyCount: 0,
        leetcodeMediumCount: 0,
        leetcodeHardCount: 0,
        dsaLevel: 'Intermediate',
        frontendLevel: 'Intermediate',
        backendLevel: 'Intermediate',
        databaseLevel: 'Intermediate',
        csFundamentalsLevel: 'Intermediate',
        aptitudeLevel: 'Intermediate',
        communicationLevel: 'Intermediate',
        careerGoal: 'Placement',
        placementTimeline: '6 Months',
        preferredProgrammingLanguage: 'Java',
        preferredDsaLanguage: 'Java',
        targetCompanyType: 'Product-Based',
        strongSubjects: ['Data Structures & Algorithms', 'Database Systems'],
        weakSubjects: ['Computer Networks'],
        projects: [],
        createdAt: new Date(),
      };
      res.status(200).json({ user: serializeUser(defaultGuestUser) });
      return;
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

    if (user.leetcodeUsername) {
      user = await syncUserLeetCodeStats(user, false);
    }

    res.status(200).json({ user: serializeUser(user) });
  } catch (error) {
    next(error);
  }
};

// ─── PATCH /users/profile ────────────────────────────────────────────────────
export const updateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let user = req.user;
    const parseResult = updateProfileSchema.safeParse(req.body);
    if (!parseResult.success) {
      res.status(400).json({
        message: 'Validation failed',
        errors: parseResult.error.flatten().fieldErrors,
      });
      return;
    }

    const data = parseResult.data;

    if (!user) {
      const guestResponse = {
        _id: 'guest',
        name: data.name || 'Guest Explorer',
        email: 'guest@engineerpath.com',
        role: 'student',
        isVerified: true,
        college: data.college || 'Engineering University',
        branch: data.branch || 'Computer Science & Engineering',
        cgpa: data.cgpa || 8.5,
        graduationYear: data.graduationYear || 2026,
        currentSemester: data.currentSemester || 5,
        preferredCareer: data.preferredCareer || 'Software Engineer',
        skills: data.skills || ['React', 'TypeScript', 'Node.js'],
        interests: data.interests || ['Software Architecture'],
        linkedinUrl: data.linkedinUrl || '',
        githubUrl: data.githubUrl || '',
        profileImage: data.profileImage || '',
        dreamCompany: data.dreamCompany || '',
        dailyStudyHours: data.dailyStudyHours || 4,
        programmingLanguages: data.programmingLanguages || ['Java', 'Python'],
        frameworks: data.frameworks || ['React'],
        leetcodeUsername: data.leetcodeUsername || '',
        leetcodeRanking: 0,
        leetcodeStatsLastFetchedAt: null,
        leetcodeEasyCount: data.leetcodeEasyCount || 0,
        leetcodeMediumCount: data.leetcodeMediumCount || 0,
        leetcodeHardCount: data.leetcodeHardCount || 0,
        dsaLevel: data.dsaLevel || 'Intermediate',
        frontendLevel: data.frontendLevel || 'Intermediate',
        backendLevel: data.backendLevel || 'Intermediate',
        databaseLevel: data.databaseLevel || 'Intermediate',
        csFundamentalsLevel: data.csFundamentalsLevel || 'Intermediate',
        aptitudeLevel: data.aptitudeLevel || 'Intermediate',
        communicationLevel: data.communicationLevel || 'Intermediate',
        careerGoal: data.careerGoal || 'Placement',
        placementTimeline: data.placementTimeline || '6 Months',
        preferredProgrammingLanguage: data.preferredProgrammingLanguage || 'Java',
        preferredDsaLanguage: data.preferredDsaLanguage || 'Java',
        targetCompanyType: data.targetCompanyType || 'Product-Based',
        strongSubjects: data.strongSubjects || [],
        weakSubjects: data.weakSubjects || [],
        projects: data.projects || [],
        createdAt: new Date(),
      };

      res.status(200).json({
        message: 'Profile updated successfully',
        user: serializeUser(guestResponse),
      });
      return;
    }

    const previousUsername = user.leetcodeUsername;

    // Apply only provided (non-undefined) fields
    UPDATABLE_FIELDS.forEach((field) => {
      if ((data as any)[field] !== undefined) {
        (user as any)[field] = (data as any)[field];
      }
    });

    const usernameChanged = user.leetcodeUsername && user.leetcodeUsername !== previousUsername;
    const missingStats = user.leetcodeUsername && (!user.leetcodeStatsLastFetchedAt || (user.leetcodeEasyCount === 0 && user.leetcodeMediumCount === 0 && user.leetcodeHardCount === 0));

    if (usernameChanged || missingStats) {
      user = await syncUserLeetCodeStats(user, true);
    } else {
      await user.save();
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /users/avatar ─────────────────────────────────────────────────────
export const uploadAvatar = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!req.file) {
      res.status(400).json({ message: 'Please upload an image file' });
      return;
    }

    // Upload buffer to Cloudinary
    const imageUrl = await uploadToCloudinary(req.file.buffer, 'profiles');

    // Save image url to user profile
    user.profileImage = imageUrl;
    await user.save();

    res.status(200).json({
      message: 'Profile image uploaded successfully',
      profileImage: imageUrl,
      user: serializeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// ─── POST /users/leetcode/refresh ───────────────────────────────────────────
export const refreshLeetCodeStatsController = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(404).json({ message: 'User profile not found' });
      return;
    }

    if (!user.leetcodeUsername) {
      res.status(400).json({ message: 'No LeetCode username linked to profile' });
      return;
    }

    const updatedUser = await syncUserLeetCodeStats(user, true);
    res.status(200).json({
      message: 'LeetCode stats refreshed successfully',
      user: serializeUser(updatedUser),
    });
  } catch (error) {
    next(error);
  }
};
