import { GoogleGenerativeAI } from '@google/generative-ai';

// ─── Initialize Gemini API ───────────────────────────────────────────────────
const apiKey = process.env.GEMINI_API_KEY;
const isApiKeyConfigured = apiKey && apiKey !== 'your-gemini-api-key' && apiKey.trim() !== '';
const genAI = isApiKeyConfigured ? new GoogleGenerativeAI(apiKey) : null;

// ─── Types ───────────────────────────────────────────────────────────────────
interface ProjectInput {
  title: string;
  description: string;
  technologies: string[];
  githubLink?: string;
  liveLink?: string;
  difficulty?: string;
  isCompleted?: boolean;
}

export interface EnrichedProfileInput {
  // Core identity
  name: string;
  preferredCareer: string;
  currentSemester: number;
  branch: string;
  cgpa: number;

  // Skills & interests
  skills: string[];
  interests: string[];
  programmingLanguages: string[];
  frameworks: string[];

  // Skill levels
  dsaLevel: string;
  frontendLevel: string;
  backendLevel: string;
  databaseLevel: string;
  csFundamentalsLevel: string;
  aptitudeLevel: string;
  communicationLevel: string;

  // LeetCode granular
  leetcodeEasyCount: number;
  leetcodeMediumCount: number;
  leetcodeHardCount: number;

  // Career & timeline
  careerGoal: string;
  placementTimeline: string;
  dreamCompany: string;
  dailyStudyHours: number;

  // Subjects
  strongSubjects: string[];
  weakSubjects: string[];

  // Projects
  projects: ProjectInput[];

  // Resume
  resumeScore: number; // atsScore from latest resume, 0 if none

  // Dynamic regeneration context
  completedMonths: string[]; // titles of already-completed topics to preserve
}

// ─── Logging Helper ──────────────────────────────────────────────────────────
function logPipeline(stage: string, detail: string, data?: any) {
  const timestamp = new Date().toISOString();
  console.log(`[ROADMAP-AI ${timestamp}] ── Stage: ${stage} ── ${detail}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Stage 1: Student Profile Analysis ───────────────────────────────────────
function buildProfileAnalysisPrompt(profile: EnrichedProfileInput): string {
  const totalLeetcode = profile.leetcodeEasyCount + profile.leetcodeMediumCount + profile.leetcodeHardCount;
  const projectSummary = profile.projects.length > 0
    ? profile.projects.map((p, i) =>
        `  ${i + 1}. "${p.title}" — ${p.description} [Tech: ${p.technologies.join(', ')}] [Difficulty: ${p.difficulty || 'N/A'}] [Completed: ${p.isCompleted ? 'Yes' : 'No'}]${p.githubLink ? ` [GitHub: ${p.githubLink}]` : ''}${p.liveLink ? ` [Live: ${p.liveLink}]` : ''}`
      ).join('\n')
    : '  No projects declared.';

  return `
═══════════════════════════════════════════════════════════════
STAGE 1: STUDENT PROFILE ANALYSIS
═══════════════════════════════════════════════════════════════

Analyze the following engineering student's complete profile:

ACADEMIC PROFILE:
  Name: ${profile.name}
  Branch: ${profile.branch || 'Not specified'}
  Semester: ${profile.currentSemester}/8
  CGPA: ${profile.cgpa}/10
  Graduation Year: Based on semester ${profile.currentSemester}

CAREER GOALS:
  Target Role: ${profile.preferredCareer || 'Not specified'}
  Career Goal: ${profile.careerGoal}
  Dream Company: ${profile.dreamCompany || 'Not specified'}
  Placement Timeline: ${profile.placementTimeline}
  Daily Study Hours Available: ${profile.dailyStudyHours || 'Not specified'}

CURRENT SKILL LEVELS (Self-assessed):
  DSA: ${profile.dsaLevel}
  Frontend: ${profile.frontendLevel}
  Backend: ${profile.backendLevel}
  Database: ${profile.databaseLevel}
  CS Fundamentals: ${profile.csFundamentalsLevel}
  Aptitude: ${profile.aptitudeLevel}
  Communication: ${profile.communicationLevel}

CODING PROGRESS:
  LeetCode Easy Solved: ${profile.leetcodeEasyCount}
  LeetCode Medium Solved: ${profile.leetcodeMediumCount}
  LeetCode Hard Solved: ${profile.leetcodeHardCount}
  Total LeetCode: ${totalLeetcode}
  Programming Languages: ${profile.programmingLanguages.join(', ') || 'None'}
  Frameworks: ${profile.frameworks.join(', ') || 'None'}

DECLARED SKILLS & INTERESTS:
  Skills: ${profile.skills.join(', ') || 'None'}
  Interests: ${profile.interests.join(', ') || 'None'}
  Strong Subjects: ${profile.strongSubjects.join(', ') || 'None'}
  Weak Subjects: ${profile.weakSubjects.join(', ') || 'None'}

PROJECTS:
${projectSummary}

RESUME SCORE (ATS): ${profile.resumeScore > 0 ? `${profile.resumeScore}/100` : 'No resume uploaded'}
`;
}

// ─── Stage 2: Skill Gap Analysis Prompt ──────────────────────────────────────
function buildSkillGapPrompt(): string {
  return `
═══════════════════════════════════════════════════════════════
STAGE 2: SKILL GAP ANALYSIS
═══════════════════════════════════════════════════════════════

Based on the student profile above, perform a thorough skill gap analysis.

Identify and categorize:

A) EXISTING STRENGTHS — Skills/areas where the student is already competent.
   For each strength, note the evidence from their profile.

B) MISSING SKILLS — Critical skills they have NOT demonstrated at all.
   For each, explain WHY this skill matters for their career goal.

C) HIGH-PRIORITY GAPS — Skills they have started but need significant improvement.
   These are the most impactful areas to focus on first.
   For each, explain the urgency relative to their placement timeline.

D) LOW-PRIORITY GAPS — Nice-to-have improvements that can be addressed later.

CRITICAL RULES:
- Do NOT recommend topics the student has already mastered (e.g., if DSA is "Advanced" and they have 100+ LeetCode mediums, do NOT include basic DSA).
- If a skill level is "Advanced", treat it as mastered unless the career goal requires an exceptionally higher bar.
- Consider the student's placement timeline — a 3-month timeline means ONLY high-priority gaps should be addressed.
- Consider daily study hours to judge what is realistic.
`;
}

// ─── Stage 3: Roadmap Planning Prompt ────────────────────────────────────────
function buildRoadmapPlanningPrompt(profile: EnrichedProfileInput): string {
  const timelineMonths = parseTimelineToMonths(profile.placementTimeline);
  const topicCount = Math.min(Math.max(timelineMonths, 6), 8);

  const completedMonthSection = profile.completedMonths.length > 0
    ? `
ALREADY COMPLETED MONTHS (DO NOT REGENERATE THESE):
${profile.completedMonths.map((t, i) => `  Month ${i + 1}: "${t}" — COMPLETED, SKIP`).join('\n')}

Generate ONLY the remaining ${topicCount - profile.completedMonths.length} months (Month ${profile.completedMonths.length + 1} onwards).
`
    : `Generate exactly ${topicCount} months (Month 1 through Month ${topicCount}).`;

  return `
═══════════════════════════════════════════════════════════════
STAGE 3: ROADMAP PLANNING
═══════════════════════════════════════════════════════════════

Based on the profile analysis (Stage 1) and skill gap analysis (Stage 2), generate a highly personalized ${topicCount}-month placement preparation roadmap.

${completedMonthSection}

For EACH month, you MUST provide:

1. "title" — A clear month title (e.g., "Month 3: Advanced DSA & Problem Solving")
2. "description" — A STRUCTURED description containing ALL of the following sections, formatted as readable text with section headers:

   📌 WHY THIS MONTH: Explain why this topic is recommended based on the student's specific skill gaps. Reference their profile data.
   
   ⏱️ ESTIMATED STUDY HOURS: Total hours for this month (must respect daily ${profile.dailyStudyHours || 2} hrs × 30 days = ${(profile.dailyStudyHours || 2) * 30} hrs/month max).
   
   📊 DIFFICULTY: Beginner / Intermediate / Advanced
   
   🛠️ MINI PROJECT: A specific, buildable project that reinforces this month's learning. Include a one-line description of what to build.
   
   🎯 INTERVIEW PREPARATION: 2-3 specific interview topics or question types to practice this month.
   
   ✅ MONTHLY MILESTONE: A measurable, verifiable milestone (e.g., "Solve 40 medium LeetCode problems" or "Build and deploy a REST API with auth").
   
   📈 EXPECTED OUTCOME: What the student should be able to do after completing this month.
   
   🚀 PLACEMENT READINESS IMPROVEMENT: Estimate the percentage improvement in placement readiness after completing this month (e.g., "+12% readiness"). Start from a baseline and increment realistically.

3. "resources" — An array of 2-3 high-quality learning resources. Each resource must have:
   - "id": unique string (e.g., "res-3-1")
   - "title": descriptive title of the resource
   - "url": a REAL, working URL (use freeCodeCamp, MDN, LeetCode, YouTube, official docs, GeeksforGeeks, NeetCode, etc.)
   - "type": "video" | "article" | "book"
   - "difficulty": "beginner" | "intermediate" | "advanced"
`;
}

// ─── Stage 4: Validation Rules ───────────────────────────────────────────────
function buildValidationPrompt(profile: EnrichedProfileInput): string {
  return `
═══════════════════════════════════════════════════════════════
STAGE 4: VALIDATION CHECKLIST
═══════════════════════════════════════════════════════════════

Before finalizing the roadmap, verify ALL of the following:

✓ MASTERY CHECK: No month recommends a topic the student has already mastered.
  - If dsaLevel is "Advanced" → Do NOT include basic/intermediate DSA months.
  - If frontendLevel is "Advanced" → Do NOT include HTML/CSS/JS basics.
  - If they have ${profile.leetcodeEasyCount} easy + ${profile.leetcodeMediumCount} medium + ${profile.leetcodeHardCount} hard LeetCode solved → Adjust DSA difficulty accordingly.

✓ TIMELINE RESPECT: The roadmap fits within "${profile.placementTimeline}".
  - Do NOT generate 8 months of content for a student with a 3-month timeline.

✓ WORKLOAD REALISM: Each month's workload must be achievable with ${profile.dailyStudyHours || 2} hours/day.
  - If daily hours = 2, a month has ~60 study hours. Do NOT assign 120 hours of content.

✓ COMPLETED MONTHS: If completed months were listed, they must NOT appear in the output.

✓ PROGRESSION: Topics must flow logically — fundamentals before advanced, theory before projects.

✓ CAREER ALIGNMENT: Every month must contribute directly to the student's goal of "${profile.careerGoal}" as a "${profile.preferredCareer}" at "${profile.dreamCompany || 'a top company'}".
`;
}

// ─── Stage 5: Final Summary Prompt ───────────────────────────────────────────
function buildFinalSummaryPrompt(profile: EnrichedProfileInput): string {
  return `
═══════════════════════════════════════════════════════════════
STAGE 5: FINAL SUMMARY
═══════════════════════════════════════════════════════════════

After generating the roadmap, include a "summary" object with:

{
  "currentPlacementReadiness": <number 0-100>,
  "estimatedFinalReadiness": <number 0-100>,
  "biggestStrengths": ["strength1", "strength2", ...],
  "biggestWeaknesses": ["weakness1", "weakness2", ...],
  "topThreePriorities": ["priority1", "priority2", "priority3"],
  "estimatedCompletionDate": "<Month Year, e.g., January 2027>"
}

Base these estimates on the student's ACTUAL profile data, not generic values.
`;
}

// ─── Full Pipeline Prompt Assembly ───────────────────────────────────────────
function buildFullPipelinePrompt(profile: EnrichedProfileInput): string {
  const timelineMonths = parseTimelineToMonths(profile.placementTimeline);
  const topicCount = Math.min(Math.max(timelineMonths, 6), 8);
  const newTopicCount = topicCount - profile.completedMonths.length;

  return `
You are an expert AI Career Mentor and Placement Preparation Strategist for Indian engineering students.
You will follow a structured 5-stage decision pipeline to generate a deeply personalized roadmap.

${buildProfileAnalysisPrompt(profile)}
${buildSkillGapPrompt()}
${buildRoadmapPlanningPrompt(profile)}
${buildValidationPrompt(profile)}
${buildFinalSummaryPrompt(profile)}

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Return ONLY a valid JSON object (no markdown, no code fences) matching this exact schema:

{
  "title": "Personalized <Career Goal> Roadmap for <Name>",
  "description": "A brief 1-2 sentence description of this roadmap tailored to the student.",
  "topics": [
    {
      "id": "topic-<N>",
      "title": "Month <N>: <Topic Title>",
      "description": "<STRUCTURED description with all sections from Stage 3>",
      "resources": [
        {
          "id": "res-<N>-<M>",
          "title": "<Resource title>",
          "url": "<Real URL>",
          "type": "video" | "article" | "book",
          "difficulty": "beginner" | "intermediate" | "advanced"
        }
      ]
    }
  ],
  "summary": {
    "currentPlacementReadiness": <number>,
    "estimatedFinalReadiness": <number>,
    "biggestStrengths": [<strings>],
    "biggestWeaknesses": [<strings>],
    "topThreePriorities": [<strings>],
    "estimatedCompletionDate": "<string>"
  }
}

IMPORTANT:
- Generate exactly ${newTopicCount} topics (months).
- Each topic MUST have 2-3 resources with REAL URLs.
- Output ONLY the JSON object. No explanations, no markdown.
`;
}

// ─── Helper: Parse placement timeline to months ──────────────────────────────
function parseTimelineToMonths(timeline: string): number {
  switch (timeline) {
    case '3 Months': return 6;   // minimum 6 topics even for short timelines
    case '6 Months': return 6;
    case '8 Months': return 8;
    case '1 Year': return 8;     // cap at 8 topics
    default: return 6;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: generateRoadmapWithAI
// ═══════════════════════════════════════════════════════════════════════════════
export const generateRoadmapWithAI = async (profile: EnrichedProfileInput): Promise<any> => {
  logPipeline('INIT', `Starting roadmap generation for "${profile.name}"`, {
    careerGoal: profile.careerGoal,
    preferredCareer: profile.preferredCareer,
    placementTimeline: profile.placementTimeline,
    completedMonths: profile.completedMonths.length,
    dailyStudyHours: profile.dailyStudyHours,
  });

  if (!genAI) {
    logPipeline('MOCK', 'API Key is not set or placeholder. Using intelligent mock generator.');
    return generateIntelligentMockRoadmap(profile);
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = buildFullPipelinePrompt(profile);

    logPipeline('PROMPT', `Sending ${prompt.length} character prompt to Gemini API`);

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const responseText = result.response.text();
    if (!responseText) {
      throw new Error('Gemini returned an empty response');
    }

    logPipeline('RESPONSE', `Received ${responseText.length} character response from Gemini`);

    const roadmapData = JSON.parse(responseText.trim());

    // Validate structure
    if (!roadmapData.topics || !Array.isArray(roadmapData.topics) || roadmapData.topics.length === 0) {
      throw new Error('Gemini response missing topics array');
    }

    logPipeline('PARSED', `Parsed ${roadmapData.topics.length} topics from Gemini response`, {
      title: roadmapData.title,
      topicCount: roadmapData.topics.length,
      hasSummary: !!roadmapData.summary,
    });

    return roadmapData;
  } catch (error) {
    logPipeline('ERROR', `Gemini API failed, falling back to intelligent mock`, { error: (error as Error).message });
    console.error('Error generating roadmap with Gemini:', error);
    return generateIntelligentMockRoadmap(profile);
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENT MOCK GENERATOR (structured, profile-aware fallback)
// ═══════════════════════════════════════════════════════════════════════════════
function generateIntelligentMockRoadmap(profile: EnrichedProfileInput) {
  logPipeline('MOCK-STAGE-1', 'Analyzing student profile for mock generation');

  const career = (profile.preferredCareer || profile.careerGoal || 'Software Developer').toLowerCase();
  const timelineMonths = parseTimelineToMonths(profile.placementTimeline);
  const topicCount = Math.min(Math.max(timelineMonths, 6), 8);
  const skipCount = profile.completedMonths.length;
  const newTopicCount = topicCount - skipCount;
  const dailyHours = profile.dailyStudyHours || 2;
  const monthlyHours = dailyHours * 30;

  // Stage 2: Determine skill levels and gaps
  const skillLevels: Record<string, string> = {
    DSA: profile.dsaLevel,
    Frontend: profile.frontendLevel,
    Backend: profile.backendLevel,
    Database: profile.databaseLevel,
    'CS Fundamentals': profile.csFundamentalsLevel,
    Aptitude: profile.aptitudeLevel,
    Communication: profile.communicationLevel,
  };

  const mastered = Object.entries(skillLevels).filter(([, v]) => v === 'Advanced').map(([k]) => k);
  const intermediate = Object.entries(skillLevels).filter(([, v]) => v === 'Intermediate').map(([k]) => k);
  const beginner = Object.entries(skillLevels).filter(([, v]) => v === 'Beginner').map(([k]) => k);

  logPipeline('MOCK-STAGE-2', 'Skill gap analysis', { mastered, intermediate, beginner });

  // Stage 3: Build topic pool based on career + gaps
  const topicPool = buildTopicPool(profile, career, mastered, intermediate, beginner, monthlyHours);

  // Take only the topics we need, skipping completed months
  const selectedTopics = topicPool.slice(0, newTopicCount);

  // Assign readiness progression
  const baseReadiness = calculateBaseReadiness(profile);
  const readinessPerMonth = Math.round((95 - baseReadiness) / topicCount);

  const topics = selectedTopics.map((topic, i) => {
    const monthNum = skipCount + i + 1;
    const readinessGain = readinessPerMonth;
    const cumulativeReadiness = Math.min(baseReadiness + readinessPerMonth * monthNum, 95);

    return {
      id: `topic-${monthNum}`,
      title: `Month ${monthNum}: ${topic.title}`,
      description: buildMockDescription({
        why: topic.why,
        hours: Math.min(topic.estimatedHours, monthlyHours),
        difficulty: topic.difficulty,
        miniProject: topic.miniProject,
        interviewPrep: topic.interviewPrep,
        milestone: topic.milestone,
        expectedOutcome: topic.expectedOutcome,
        readinessGain: `+${readinessGain}%`,
      }),
      resources: topic.resources,
    };
  });

  // Stage 5: Summary
  const summary = {
    currentPlacementReadiness: baseReadiness,
    estimatedFinalReadiness: Math.min(baseReadiness + readinessPerMonth * topicCount, 95),
    biggestStrengths: mastered.length > 0 ? mastered : (intermediate.length > 0 ? intermediate.slice(0, 2) : ['Self-motivation']),
    biggestWeaknesses: beginner.slice(0, 3),
    topThreePriorities: selectedTopics.slice(0, 3).map(t => t.title),
    estimatedCompletionDate: calculateCompletionDate(profile.placementTimeline),
  };

  logPipeline('MOCK-STAGE-5', 'Final summary', summary);

  return {
    title: `Personalized ${profile.careerGoal} Roadmap for ${profile.name}`,
    description: `A ${topicCount}-month structured preparation plan tailored for ${profile.name}, targeting ${profile.preferredCareer || profile.careerGoal} at ${profile.dreamCompany || 'top companies'}. Based on your profile analysis: ${beginner.length} skill gaps identified, ${mastered.length} strengths leveraged.`,
    topics,
    summary,
  };
}

// ─── Helper: Calculate base readiness from profile ───────────────────────────
function calculateBaseReadiness(profile: EnrichedProfileInput): number {
  let score = 10; // everyone starts with some baseline

  // Skill levels contribute
  const levelScore: Record<string, number> = { Beginner: 0, Intermediate: 4, Advanced: 8 };
  score += levelScore[profile.dsaLevel] || 0;
  score += levelScore[profile.frontendLevel] || 0;
  score += levelScore[profile.backendLevel] || 0;
  score += levelScore[profile.databaseLevel] || 0;
  score += levelScore[profile.csFundamentalsLevel] || 0;
  score += (levelScore[profile.aptitudeLevel] || 0) * 0.5;
  score += (levelScore[profile.communicationLevel] || 0) * 0.5;

  // LeetCode progress
  const totalLC = profile.leetcodeEasyCount + profile.leetcodeMediumCount + profile.leetcodeHardCount;
  if (totalLC > 200) score += 10;
  else if (totalLC > 100) score += 7;
  else if (totalLC > 50) score += 4;
  else if (totalLC > 20) score += 2;

  // Projects
  const completedProjects = profile.projects.filter(p => p.isCompleted).length;
  score += Math.min(completedProjects * 3, 10);

  // Resume
  if (profile.resumeScore > 80) score += 5;
  else if (profile.resumeScore > 60) score += 3;
  else if (profile.resumeScore > 0) score += 1;

  // CGPA
  if (profile.cgpa >= 8) score += 3;
  else if (profile.cgpa >= 7) score += 2;

  return Math.min(Math.round(score), 70); // cap mock base at 70
}

// ─── Helper: Build structured description ────────────────────────────────────
function buildMockDescription(params: {
  why: string;
  hours: number;
  difficulty: string;
  miniProject: string;
  interviewPrep: string[];
  milestone: string;
  expectedOutcome: string;
  readinessGain: string;
}): string {
  return `📌 WHY THIS MONTH: ${params.why}

⏱️ ESTIMATED STUDY HOURS: ${params.hours} hours this month

📊 DIFFICULTY: ${params.difficulty}

🛠️ MINI PROJECT: ${params.miniProject}

🎯 INTERVIEW PREPARATION:
${params.interviewPrep.map(p => `  • ${p}`).join('\n')}

✅ MONTHLY MILESTONE: ${params.milestone}

📈 EXPECTED OUTCOME: ${params.expectedOutcome}

🚀 PLACEMENT READINESS IMPROVEMENT: ${params.readinessGain}`;
}

// ─── Helper: Build topic pool based on career & skill gaps ───────────────────
interface TopicTemplate {
  title: string;
  why: string;
  estimatedHours: number;
  difficulty: string;
  miniProject: string;
  interviewPrep: string[];
  milestone: string;
  expectedOutcome: string;
  resources: Array<{ id: string; title: string; url: string; type: string; difficulty: string }>;
}

function buildTopicPool(
  profile: EnrichedProfileInput,
  career: string,
  mastered: string[],
  intermediate: string[],
  beginner: string[],
  monthlyHours: number,
): TopicTemplate[] {
  const pool: TopicTemplate[] = [];
  const totalLC = profile.leetcodeEasyCount + profile.leetcodeMediumCount + profile.leetcodeHardCount;
  let resCounter = 0;
  const rid = () => { resCounter++; return `res-mock-${resCounter}`; };

  // ─── DSA Topics (skip if mastered) ─────────────────────────────────────
  if (!mastered.includes('DSA')) {
    if (profile.dsaLevel === 'Beginner') {
      pool.push({
        title: 'DSA Foundations & Problem-Solving Basics',
        why: `Your DSA level is Beginner and you've solved only ${totalLC} LeetCode problems. For ${profile.careerGoal} at ${profile.dreamCompany || 'top companies'}, strong DSA is non-negotiable. This month builds your foundation.`,
        estimatedHours: Math.min(80, monthlyHours),
        difficulty: 'Beginner',
        miniProject: 'Build a CLI-based data structure visualizer that demonstrates Arrays, Stacks, and Queues operations.',
        interviewPrep: ['Array manipulation patterns (two-pointer, sliding window)', 'Time & space complexity analysis', 'Basic sorting algorithms comparison'],
        milestone: `Solve ${Math.min(30, totalLC + 30)} easy LeetCode problems and understand Big-O for all basic operations.`,
        expectedOutcome: 'Confident with arrays, strings, stacks, queues, and basic sorting/searching algorithms.',
        resources: [
          { id: rid(), title: 'Kunal Kushwaha - DSA Bootcamp (Java)', url: 'https://github.com/kunal-kushwaha/DSA-Bootcamp-Java', type: 'video', difficulty: 'beginner' },
          { id: rid(), title: 'LeetCode Explore - Arrays 101', url: 'https://leetcode.com/explore/learn/card/fun-with-arrays/', type: 'article', difficulty: 'beginner' },
          { id: rid(), title: 'NeetCode Roadmap - Beginner', url: 'https://neetcode.io/roadmap', type: 'article', difficulty: 'beginner' },
        ],
      });
    }

    if (profile.dsaLevel === 'Beginner' || profile.dsaLevel === 'Intermediate') {
      pool.push({
        title: 'Advanced DSA: Trees, Graphs & Dynamic Programming',
        why: `Your DSA level is ${profile.dsaLevel} with ${profile.leetcodeMediumCount} medium problems solved. ${profile.dreamCompany || 'Top companies'} interviews heavily test trees, graphs, and DP. This is a high-priority gap.`,
        estimatedHours: Math.min(90, monthlyHours),
        difficulty: 'Intermediate',
        miniProject: 'Build a shortest-path visualizer using BFS/DFS algorithms with a web-based UI.',
        interviewPrep: ['Binary tree traversals and BST operations', 'Graph BFS/DFS and shortest path algorithms', 'Top 10 DP patterns (knapsack, LIS, matrix chain)'],
        milestone: `Solve ${Math.min(40, profile.leetcodeMediumCount + 40)} medium and ${Math.min(5, profile.leetcodeHardCount + 5)} hard LeetCode problems.`,
        expectedOutcome: 'Able to solve medium-difficulty interview problems within 30 minutes consistently.',
        resources: [
          { id: rid(), title: 'Striver A2Z DSA Sheet', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', type: 'article', difficulty: 'intermediate' },
          { id: rid(), title: 'NeetCode 150 - Trees & Graphs', url: 'https://neetcode.io/practice', type: 'article', difficulty: 'intermediate' },
          { id: rid(), title: 'Abdul Bari - Algorithms Playlist', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', type: 'video', difficulty: 'intermediate' },
        ],
      });
    }
  }

  // ─── CS Fundamentals (OS, CN, DBMS) ────────────────────────────────────
  if (!mastered.includes('CS Fundamentals')) {
    pool.push({
      title: 'CS Fundamentals: OS, CN & DBMS',
      why: `Your CS Fundamentals level is ${profile.csFundamentalsLevel}. ${profile.weakSubjects.length > 0 ? `You listed ${profile.weakSubjects.join(', ')} as weak subjects.` : ''} These are core interview topics for ${profile.careerGoal} roles. Most companies ask 1-2 CS fundamental questions in every round.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: profile.csFundamentalsLevel === 'Beginner' ? 'Intermediate' : 'Advanced',
      miniProject: 'Create a comprehensive CS fundamentals cheat sheet with diagrams covering OS scheduling, network layers, and SQL query optimization.',
      interviewPrep: ['OS: Process vs Thread, deadlocks, memory management, paging', 'CN: TCP/IP model, HTTP/HTTPS, DNS resolution, REST vs WebSocket', 'DBMS: Normalization, ACID properties, indexing, SQL vs NoSQL trade-offs'],
      milestone: 'Complete Gate Smashers OS + CN + DBMS playlists and solve 50 GFG practice questions on these topics.',
      expectedOutcome: 'Confidently answer CS fundamental interview questions without preparation.',
      resources: [
        { id: rid(), title: 'Gate Smashers - OS Playlist', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'GeeksforGeeks - DBMS Tutorial', url: 'https://www.geeksforgeeks.org/dbms/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'Computer Networking by Kurose & Ross (Free Chapters)', url: 'https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm', type: 'book', difficulty: 'intermediate' },
      ],
    });
  }

  // ─── Frontend (skip if mastered) ───────────────────────────────────────
  if (!mastered.includes('Frontend') && (career.includes('front') || career.includes('web') || career.includes('full'))) {
    pool.push({
      title: 'Frontend Development: React & Modern UI',
      why: `Your Frontend level is ${profile.frontendLevel}. As a ${profile.preferredCareer || 'developer'}, frontend skills are essential. ${profile.frameworks.includes('React') ? 'You know React basics — this month takes you to production-grade React.' : 'This month introduces React from scratch.'}`,
      estimatedHours: Math.min(70, monthlyHours),
      difficulty: profile.frontendLevel === 'Beginner' ? 'Beginner' : 'Intermediate',
      miniProject: 'Build a fully responsive portfolio website with React, including dark mode, animations, and a contact form.',
      interviewPrep: ['React component lifecycle and hooks (useState, useEffect, useMemo, useCallback)', 'State management patterns (Context API, Zustand, Redux)', 'CSS-in-JS vs Tailwind vs vanilla CSS trade-offs'],
      milestone: 'Deploy a production-quality React project on Vercel with responsive design and 90+ Lighthouse score.',
      expectedOutcome: 'Can build and deploy production-grade React applications independently.',
      resources: [
        { id: rid(), title: 'Official React Documentation', url: 'https://react.dev/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'freeCodeCamp - Front End Libraries', url: 'https://www.freecodecamp.org/learn/front-end-development-libraries/', type: 'article', difficulty: 'beginner' },
        { id: rid(), title: 'Namaste React by Akshay Saini', url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCgSeGtxmFVCglaCx', type: 'video', difficulty: 'intermediate' },
      ],
    });
  }

  // ─── Backend (skip if mastered) ────────────────────────────────────────
  if (!mastered.includes('Backend') && (career.includes('back') || career.includes('full') || career.includes('sde') || career.includes('software'))) {
    pool.push({
      title: 'Backend Engineering: APIs, Auth & Databases',
      why: `Your Backend level is ${profile.backendLevel}. ${profile.careerGoal} roles at ${profile.dreamCompany || 'product companies'} require strong backend fundamentals. ${profile.frameworks.length > 0 ? `You know ${profile.frameworks.join(', ')} — this month deepens your architecture skills.` : 'This month teaches you backend from the ground up.'}`,
      estimatedHours: Math.min(70, monthlyHours),
      difficulty: profile.backendLevel === 'Beginner' ? 'Beginner' : 'Intermediate',
      miniProject: 'Build a RESTful API for a blog platform with JWT authentication, role-based access control, and MongoDB integration.',
      interviewPrep: ['REST API design principles and status codes', 'Authentication: JWT vs OAuth vs session-based', 'Database design: Schema normalization, indexing strategies'],
      milestone: 'Deploy a fully functional REST API with 10+ endpoints, auth, and error handling to a cloud platform.',
      expectedOutcome: 'Can design and build production-grade backend APIs with authentication and database integration.',
      resources: [
        { id: rid(), title: 'Express.js Official Guide', url: 'https://expressjs.com/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'freeCodeCamp - Back End & APIs', url: 'https://www.freecodecamp.org/learn/back-end-development-and-apis/', type: 'article', difficulty: 'beginner' },
        { id: rid(), title: 'Traversy Media - Node.js Crash Course', url: 'https://youtu.be/fBNz5xF-Kx4', type: 'video', difficulty: 'beginner' },
      ],
    });
  }

  // ─── Database (skip if mastered) ───────────────────────────────────────
  if (!mastered.includes('Database') && profile.databaseLevel !== 'Advanced') {
    pool.push({
      title: 'Database Mastery: SQL, NoSQL & System Design',
      why: `Your Database level is ${profile.databaseLevel}. Understanding database internals is critical for system design interviews at ${profile.dreamCompany || 'top companies'}. This is ${beginner.includes('Database') ? 'a high-priority gap' : 'an area to strengthen'}.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Design and implement a database schema for an e-commerce platform with SQL joins, indexes, and NoSQL document modeling.',
      interviewPrep: ['SQL joins, subqueries, window functions', 'MongoDB aggregation pipeline', 'Database scaling: sharding, replication, CAP theorem'],
      milestone: 'Complete HackerRank SQL certification and design 3 database schemas for real-world applications.',
      expectedOutcome: 'Can design efficient database schemas and write complex queries for production applications.',
      resources: [
        { id: rid(), title: 'SQLZoo Interactive Tutorial', url: 'https://sqlzoo.net/', type: 'article', difficulty: 'beginner' },
        { id: rid(), title: 'MongoDB University - Free Courses', url: 'https://university.mongodb.com/', type: 'video', difficulty: 'intermediate' },
      ],
    });
  }

  // ─── System Design ─────────────────────────────────────────────────────
  if (career.includes('sde') || career.includes('software') || career.includes('full') || career.includes('back')) {
    pool.push({
      title: 'System Design & Scalable Architecture',
      why: `System design is a critical interview round at ${profile.dreamCompany || 'FAANG/product companies'}. With your ${profile.backendLevel} backend and ${profile.databaseLevel} database skills, this month connects your technical knowledge into large-scale thinking.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Design the high-level architecture for a URL shortener (like bit.ly) with caching, rate limiting, and analytics.',
      interviewPrep: ['High-level design: Load balancers, CDNs, message queues', 'Low-level design: Class diagrams, API contracts, database schema', 'Case studies: Design Twitter, WhatsApp, Netflix'],
      milestone: 'Complete 10 system design case studies and practice whiteboard explanations for each.',
      expectedOutcome: 'Can discuss trade-offs in system design interviews and sketch architecture diagrams under time pressure.',
      resources: [
        { id: rid(), title: 'Gaurav Sen - System Design Playlist', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnJeMhsRx1hF9mGZ7bjd50A1r7', type: 'video', difficulty: 'advanced' },
        { id: rid(), title: 'System Design Primer (GitHub)', url: 'https://github.com/donnemartin/system-design-primer', type: 'article', difficulty: 'advanced' },
      ],
    });
  }

  // ─── Aptitude & Communication ──────────────────────────────────────────
  if (!mastered.includes('Aptitude') || !mastered.includes('Communication')) {
    pool.push({
      title: 'Aptitude, Soft Skills & Communication',
      why: `Your Aptitude level is ${profile.aptitudeLevel} and Communication is ${profile.communicationLevel}. Many companies have aptitude screening rounds and HR interviews. ${profile.weakSubjects.includes('Aptitude') ? 'You flagged Aptitude as a weak area.' : ''} This month ensures you clear non-technical rounds.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Record 3 mock interview videos answering behavioral questions (Tell me about yourself, Why this company, Conflict resolution) and self-critique them.',
      interviewPrep: ['Quantitative aptitude: Percentages, profit/loss, time & work, probability', 'Logical reasoning: Puzzles, pattern recognition, syllogisms', 'HR round: STAR method for behavioral questions, salary negotiation'],
      milestone: 'Score 80%+ on 5 mock aptitude tests and complete 3 recorded mock HR interviews.',
      expectedOutcome: 'Clear aptitude screening rounds and present yourself confidently in HR interviews.',
      resources: [
        { id: rid(), title: 'IndiaBix - Aptitude Questions', url: 'https://www.indiabix.com/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'Placement Preparation - GFG', url: 'https://www.geeksforgeeks.org/placements-gq/', type: 'article', difficulty: 'intermediate' },
      ],
    });
  }

  // ─── Projects & Portfolio ──────────────────────────────────────────────
  pool.push({
    title: 'Portfolio Building & Project Showcase',
    why: `You have ${profile.projects.length} project(s) listed (${profile.projects.filter(p => p.isCompleted).length} completed). ${profile.resumeScore > 0 ? `Your resume ATS score is ${profile.resumeScore}/100.` : 'You haven\'t uploaded a resume yet.'} A strong portfolio with deployed projects and a polished resume is what separates selected candidates from rejected ones.`,
    estimatedHours: Math.min(50, monthlyHours),
    difficulty: 'Intermediate',
    miniProject: 'Build a personal developer portfolio website showcasing all your projects with live demos, GitHub links, and a downloadable resume.',
    interviewPrep: ['Project deep-dive: Be ready to explain architecture decisions for each project', 'Code walkthrough: Practice explaining your code to someone else', 'Resume optimization: ATS-friendly formatting, quantified achievements'],
    milestone: `Have ${Math.max(3, profile.projects.length + 1)} completed projects with GitHub repos, live demos, and an ATS resume score above 80.`,
    expectedOutcome: 'A portfolio that impresses recruiters and a resume that clears ATS screening.',
    resources: [
      { id: rid(), title: 'GitHub Student Developer Pack', url: 'https://education.github.com/pack', type: 'article', difficulty: 'beginner' },
      { id: rid(), title: 'How to Build a Developer Portfolio', url: 'https://www.freecodecamp.org/news/how-to-build-a-developer-portfolio-website/', type: 'article', difficulty: 'intermediate' },
    ],
  });

  // ─── Mock Interview & Final Preparation ────────────────────────────────
  pool.push({
    title: 'Mock Interviews & Placement Sprint',
    why: `With your ${profile.placementTimeline} timeline and goal of ${profile.careerGoal} at ${profile.dreamCompany || 'target companies'}, this final month is dedicated to intensive interview practice. No new learning — pure application and confidence building.`,
    estimatedHours: Math.min(60, monthlyHours),
    difficulty: 'Advanced',
    miniProject: 'Complete 10 full mock interviews (5 DSA + 3 system design + 2 HR) and document learnings from each.',
    interviewPrep: ['Timed coding challenges (45 min per problem)', 'System design mock rounds with peer feedback', 'Behavioral interview practice with STAR method'],
    milestone: 'Complete 10 mock interviews with peers/mentors and achieve 70%+ success rate in timed coding challenges.',
    expectedOutcome: 'Walk into placement interviews with confidence, strategy, and proven performance under pressure.',
    resources: [
      { id: rid(), title: 'Pramp - Free Mock Interviews', url: 'https://www.pramp.com/', type: 'article', difficulty: 'advanced' },
      { id: rid(), title: 'InterviewBit - Practice & Mock', url: 'https://www.interviewbit.com/', type: 'article', difficulty: 'advanced' },
      { id: rid(), title: 'LeetCode Contest - Weekly Practice', url: 'https://leetcode.com/contest/', type: 'article', difficulty: 'advanced' },
    ],
  });

  return pool;
}

// ─── Helper: Calculate estimated completion date ─────────────────────────────
function calculateCompletionDate(timeline: string): string {
  const now = new Date();
  const months = timeline === '3 Months' ? 6 : timeline === '6 Months' ? 6 : timeline === '8 Months' ? 8 : 12;
  const completion = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return completion.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
