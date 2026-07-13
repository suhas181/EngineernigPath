export interface UserProfile {
  college?: string;
  branch?: string;
  graduationYear?: number;
  currentSemester?: number;
  preferredCareer?: string;
  skills?: string[];
  interests?: string[];
  linkedinUrl?: string;
  githubUrl?: string;
  dreamCompany?: string;
  dailyStudyHours?: number;
  careerGoal?: string;
  placementTimeline?: string;
  dsaLevel?: string;
  leetcodeEasyCount?: number;
  leetcodeMediumCount?: number;
  leetcodeHardCount?: number;
  programmingLanguages?: string[];
  frameworks?: string[];
}

export function calculateAiAccuracy(user: UserProfile | null | undefined): number {
  if (!user) return 0;
  
  let score = 0;
  
  // Required fields from initial onboarding steps (total 70%):
  // Step 1: Academic (40% total)
  if (user.college && user.college.trim().length > 0) score += 10;
  if (user.branch && user.branch.trim().length > 0) score += 10;
  if (user.graduationYear && user.graduationYear > 0) score += 10;
  if (user.currentSemester && user.currentSemester > 0) score += 10;
  
  // Step 2: Career & Skills (20% total)
  if (user.preferredCareer && user.preferredCareer.trim().length > 0) score += 10;
  if (user.skills && user.skills.length > 0) score += 10;
  
  // Step 3: Links & Socials (10% total)
  if (user.linkedinUrl && user.linkedinUrl.trim().length > 0) score += 5;
  if (user.githubUrl && user.githubUrl.trim().length > 0) score += 5;
  
  // Optional / Advanced Profile fields (total 30%):
  // Collapsible sections (Dream Company, study hours, coding stats, languages/frameworks, career details)
  if (user.dreamCompany && user.dreamCompany.trim().length > 0) score += 5;
  if (user.dailyStudyHours && user.dailyStudyHours > 0) score += 5;
  if (user.careerGoal && user.careerGoal.trim().length > 0) score += 5;
  if (user.placementTimeline && user.placementTimeline.trim().length > 0) score += 5;
  if (user.dsaLevel && user.dsaLevel.trim().length > 0) score += 5;
  
  const hasLeetcode = (user.leetcodeEasyCount || 0) + (user.leetcodeMediumCount || 0) + (user.leetcodeHardCount || 0) > 0;
  const hasCodingLangs = (user.programmingLanguages && user.programmingLanguages.length > 0) || (user.frameworks && user.frameworks.length > 0);
  if (hasLeetcode || hasCodingLangs) score += 5;

  return Math.min(100, score);
}
