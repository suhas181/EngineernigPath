import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveResources, LibraryResource } from '../config/resourceLibrary';
import { LearningResource } from '../models/LearningResource';
import { sdeMasterTopics, groupTopicsIntoTimeline } from './roadmapArchitecture';

export const normalizeDifficulty = (diff?: string): 'Beginner' | 'Intermediate' | 'Advanced' => {
  if (!diff) return 'Beginner';
  const lower = diff.toLowerCase();
  if (lower.includes('adv')) return 'Advanced';
  if (lower.includes('int') || lower.includes('med')) return 'Intermediate';
  return 'Beginner';
};

export const normalizeResourceType = (typeStr?: string): 'video' | 'article' | 'book' | 'documentation' | 'course' | 'practice' => {
  if (!typeStr) return 'article';
  const lower = typeStr.toLowerCase();
  if (['video', 'article', 'book', 'documentation', 'course', 'practice'].includes(lower)) {
    return lower as any;
  }
  if (lower.includes('doc')) return 'documentation';
  if (lower.includes('vid') || lower.includes('youtube')) return 'video';
  if (lower.includes('prac') || lower.includes('problem')) return 'practice';
  return 'article';
};

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
  name: string;
  preferredCareer: string;
  currentSemester: number;
  branch: string;
  cgpa: number;

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

  // LeetCode solved problems
  leetcodeEasyCount: number;
  leetcodeMediumCount: number;
  leetcodeHardCount: number;

  // SDE Custom preferences
  preferredProgrammingLanguage?: 'Java' | 'Python' | 'C++';
  preferredDsaLanguage?: 'Java' | 'Python' | 'C++';
  targetCompanyType?: 'Product-Based' | 'Service-Based';

  // Career & timeline
  careerGoal: string;
  placementTimeline: string;
  dreamCompany: string;
  dailyStudyHours: number;

  strongSubjects: string[];
  weakSubjects: string[];
  projects: ProjectInput[];
  resumeScore: number;

  // Regeneration context
  completedMonths: string[]; // Month titles/keys already completed to lock
}

// Helper logger
function logStage(stage: string, message: string, data?: any) {
  console.log(`[SDE-ROADMAP-ENGINE] Stage: ${stage} ── ${message}`);
  if (data !== undefined) {
    console.log(JSON.stringify(data, null, 2));
  }
}

// ─── Stage 1 & 2: Profile & Skill Gap Analysis Prompt ────────────────────────
function buildAnalysisPrompt(profile: EnrichedProfileInput): string {
  const totalLC = profile.leetcodeEasyCount + profile.leetcodeMediumCount + profile.leetcodeHardCount;
  const targetRole = profile.preferredCareer || 'Software Engineer (SDE)';
  const projectSummary = profile.projects.length > 0
    ? profile.projects.map((p, i) =>
        `  ${i + 1}. "${p.title}" — ${p.description} [Tech: ${p.technologies.join(', ')}] [Difficulty: ${p.difficulty || 'N/A'}] [Completed: ${p.isCompleted ? 'Yes' : 'No'}]`
      ).join('\n')
    : '  No projects declared.';

  return `
You are an expert ${targetRole} Technical Interviewer and career strategist.
Analyze the following student profile for ${targetRole} placement preparation:

STUDENT PROFILE:
  Name: ${profile.name}
  Semester: ${profile.currentSemester}/8 (Branch: ${profile.branch}, CGPA: ${profile.cgpa})
  Career Preferences: Target Role: ${targetRole}, Company Focus Type: ${profile.targetCompanyType || 'Product-Based'}
  Target Timeline: ${profile.placementTimeline} (Available study: ${profile.dailyStudyHours || 2} hours/day)
  
  Coding Experience:
    Preferred Program Language: ${profile.preferredProgrammingLanguage || 'Java'}
    Preferred DSA Language: ${profile.preferredDsaLanguage || 'Java'}
    LeetCode Solved: Easy: ${profile.leetcodeEasyCount}, Medium: ${profile.leetcodeMediumCount}, Hard: ${profile.leetcodeHardCount} (Total: ${totalLC})
    Self-Assessed Levels: DSA: ${profile.dsaLevel}, Frontend: ${profile.frontendLevel}, Backend: ${profile.backendLevel}, Database: ${profile.databaseLevel}, CS Fundamentals: ${profile.csFundamentalsLevel}, Aptitude: ${profile.aptitudeLevel}, Communication: ${profile.communicationLevel}

  declared skills: ${profile.skills.join(', ') || 'None'}
  strongSubjects: ${profile.strongSubjects.join(', ') || 'None'}
  weakSubjects: ${profile.weakSubjects.join(', ') || 'None'}
  declared projects:
${projectSummary}
  Resume Score (ATS): ${profile.resumeScore > 0 ? `${profile.resumeScore}/100` : 'No resume uploaded'}

Perform:
- Stage 1: Profile Analysis (Identify strengths, actual coding capability, and baseline readiness index out of 100).
- Stage 2: Skill Gap Analysis (Analyze missing ${targetRole} skills based on target company focus).
  * Product-Based Focus: Prioritize strong core architecture, system design (when appropriate), domain-specific frameworks, and resume building.
  * Service-Based Focus: Prioritize foundational domain concepts, quantitative aptitude, verbal/logical reasoning, communication, and HR prep.
  * Mastered check: Never recommend topics they have already mastered.

Provide your final analysis report as text. Make sure to identify:
- Mastered topics to skip.
- High priority ${targetRole} curriculum topics to focus on first.
- Placement readiness index.
`;
}

// ─── Stage 3, 4, 6 & 7: Month Planning Prompt ────────────────────────────────
function buildPlanningPrompt(analysis: string, profile: EnrichedProfileInput): string {
  const timeline = profile.placementTimeline || '6 Months';
  let totalMonths = 6;
  if (timeline === '3 Months') totalMonths = 3;
  else if (timeline === '4 Months') totalMonths = 4;
  else if (timeline === '5 Months') totalMonths = 5;
  else if (timeline === '6 Months') totalMonths = 6;
  else if (timeline === '8 Months') totalMonths = 8;

  const targetRole = profile.preferredCareer || 'Software Engineer (SDE)';

  const pacingGuideline = totalMonths === 3
    ? 'HIGH-INTENSITY FAST-TRACK PACING: Prioritize strictly the top-tier, highest-ROI interview topics. Assume 15-20+ study hours/week. Skip low-priority filler and low-yield breadth.'
    : totalMonths <= 5
    ? 'ACCELERATED BALANCED PACING: High-density weekly plans combining core frameworks, key DSA/system architecture, and high-impact mini-projects.'
    : totalMonths === 6
    ? 'STANDARD BALANCED PACING: Balanced depth and breadth, covering core fundamentals, algorithms, system design, and resume-ready portfolio projects.'
    : 'COMPREHENSIVE DEEP-DIVE PACING: Thorough end-to-end curriculum covering foundational computer science principles, advanced architecture, system design, multi-stage projects, and mock screens.';

  const completedMonthsSection = profile.completedMonths.length > 0
    ? `
COMPLETED MONTHS (LOCK AND DO NOT MODIFY):
${profile.completedMonths.map((m, i) => `  Month ${i + 1}: "${m}" — LOCKED`).join('\n')}
Generate only the remaining ${totalMonths - profile.completedMonths.length} future months (from Month ${profile.completedMonths.length + 1} onwards).
`
    : `Generate exactly ${totalMonths} months (Month 1 through Month ${totalMonths}).`;

  return `
You are an expert AI Career Mentor for ${targetRole} roles.
Using the Profile & Skill Gap Analysis below, create a personalized ${targetRole} preparation roadmap for the remaining months.

---
PROFILE ANALYSIS REPORT:
${analysis}
---

---
ROADMAP TIMELINE & PACING INSTRUCTIONS:
Target Role: ${targetRole}
Target Timeline: ${timeline} (${totalMonths} Total Month Blocks)
Pacing Strategy: ${pacingGuideline}
${completedMonthsSection}
IMPORTANT RULES:
1. You MUST generate EXACTLY ${totalMonths} topic blocks in the output array (Month 1 through Month ${totalMonths}).
2. Do NOT invent specific resource titles or external URLs in your output. Your job is ONLY to outline curriculum topics, weekly study plans, practice problem concepts, and project specifications. The backend automatically attaches verified learning resources from the database.
---

CURRICULUM LIBRARY KEYS (Stage 3 Selection):
You MUST select 1 to 3 keys for each month *ONLY* from this list:
- DSA: DSA_ARRAYS, DSA_STRINGS, DSA_BINARY_SEARCH, DSA_SORTING, DSA_LINKED_LIST, DSA_STACK, DSA_QUEUE, DSA_TREES, DSA_GRAPHS, DSA_DP, DSA_HASHING, DSA_HEAP, DSA_TRIE, DSA_GREEDY, DSA_BACKTRACKING, DSA_SLIDING_WINDOW, DSA_TWO_POINTERS, DSA_BIT_MANIPULATION
- DEV: DEV_GIT, DEV_HTML, DEV_CSS, DEV_JAVASCRIPT, DEV_REACT, DEV_NEXTJS, DEV_NODE, DEV_EXPRESS, DEV_MONGODB, DEV_SQL, DEV_DOCKER, DEV_AWS, DEV_REST_APIS, DEV_AUTHENTICATION, DEV_REDIS, DEV_DEPLOYMENT
- CS Fundamentals: CS_OS, CS_DBMS, CS_CN, CS_OOP, CS_SYSTEM_DESIGN
- Aptitude: APT_QUANT, APT_LOGICAL, APT_VERBAL
- Interview Prep: INT_HR, INT_BEHAVIORAL, INT_RESUME, INT_MOCK

Adapt Month Topics according to Target Role (${targetRole}) and Target Company Type:
- Product-Based: Focus heavily on core concepts, System Design, domain tools, and mock interviews.
- Service-Based: Focus heavily on Aptitude keys, core fundamentals, communication/behavioral skills, and HR prep.

OUTPUT SCHEMA SPECIFICATION:
Return ONLY a valid JSON object matching this schema. Do not write any markdown code fences (like \`\`\`json) or text before/after.

{
  "title": "Personalized ${targetRole} Career Path for ${profile.name}",
  "description": "Short explanation of the roadmap strategy tailored for ${targetRole} role.",
  "version": "2.0.0",
  "topics": [
    {
      "id": "topic-N",
      "title": "Month N: [Month Title]",
      "whyThisMonth": "Explain why this curriculum is chosen based on the profile gap for ${targetRole}.",
      "learningObjectives": ["objective 1", "objective 2"],
      "weeklyStudyPlan": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],
      "estimatedStudyHours": 60,
      "topics": ["Subtopic 1", "Subtopic 2"],
      "curriculumKeys": ["DEV_HTML", "DEV_JAVASCRIPT"],
      "practiceProblems": [
        { "id": "prob-N-1", "title": "Problem Title", "url": "https://leetcode.com/problems/...", "difficulty": "easy" }
      ],
      "project": {
        "title": "Project Title",
        "description": "Mini project description reinforcing this month's learning.",
        "technologies": ["JavaScript"],
        "difficulty": "beginner"
      },
      "interviewPrep": ["Interview preparation items..."],
      "weeklyMilestones": ["Milestone 1", "Milestone 2"],
      "monthlyGoal": "Target goal",
      "expectedOutcome": "Outcome details",
      "placementReadinessImprovement": 15
    }
  ],
  "summary": {
    "currentPlacementReadiness": 20,
    "estimatedFinalReadiness": 85,
    "biggestStrengths": ["Strength 1"],
    "biggestWeaknesses": ["Weakness 1"],
    "topThreePriorities": ["Priority 1"],
    "estimatedCompletionDate": "Month Year"
  }
}
`;
}

// ─── Stage 5: Backend Curated Resource Attachment from Database ─────────────
async function attachCuratedResourcesFromDB(
  monthBlocks: any[],
  preferredCareer: string,
  preferredDsaLanguage: 'Java' | 'Python' | 'C++'
) {
  logStage('STAGE-5', `Querying MongoDB LearningResource collection for career: "${preferredCareer}"`);

  const updatedTopics = [];

  for (const month of monthBlocks) {
    const keys = month.curriculumKeys || [];
    const resolved: LibraryResource[] = [];
    keys.forEach((key: string) => {
      const res = resolveResources(key, preferredDsaLanguage);
      resolved.push(...res);
    });

    const learnResources = resolved.filter((r) => r.stage === 'learn');
    const notesResources = resolved.filter((r) => r.stage === 'notes');
    const revisionResources = resolved.filter((r) => r.stage === 'revision');
    const interviewResources = resolved.filter((r) => r.stage === 'interview');
    const practiceResources = resolved.filter((r) => r.stage === 'practice');

    const formattedResources = resolved.map((r) => ({
      id: r.id,
      title: r.title,
      url: r.url,
      type: normalizeResourceType(r.type),
      difficulty: normalizeDifficulty(r.difficulty || r.level),
      level: r.level,
      provider: r.provider,
      estimatedHours: r.estimatedHours,
      tags: r.tags,
      stage: r.stage,
      free: r.free,
      verified: true,
      isCompleted: false,
    }));

    // Enrich individual Learning Sprints within this month
    const enrichedSprints = (month.learningSprints || []).map((sprint: any) => {
      const sprintKeys = sprint.curriculumKeys || keys;
      const sprintResolved: LibraryResource[] = [];
      sprintKeys.forEach((k: string) => {
        sprintResolved.push(...resolveResources(k, preferredDsaLanguage));
      });

      const sprintLearn = sprintResolved.filter((r) => r.stage === 'learn');
      const sprintNotes = sprintResolved.filter((r) => r.stage === 'notes');
      const sprintRevision = sprintResolved.filter((r) => r.stage === 'revision');
      const sprintInterview = sprintResolved.filter((r) => r.stage === 'interview');

      return {
        ...sprint,
        learnResources: sprintLearn.length > 0 ? sprintLearn : learnResources.slice(0, 2),
        notesResources: sprintNotes.length > 0 ? sprintNotes : notesResources.slice(0, 2),
        revision: sprintRevision.length > 0 ? sprintRevision : revisionResources.slice(0, 2),
        interviewQuestions: sprintInterview.length > 0
          ? sprintInterview.map((i) => i.title)
          : sprint.interviewQuestions,
        resources: sprintResolved,
      };
    });

    updatedTopics.push({
      ...month,
      resources: formattedResources.length > 0 ? formattedResources : [
        {
          id: `res-pending-${Date.now()}`,
          title: 'Curated resources resolution in progress for this topic',
          url: '#',
          type: 'article',
          difficulty: 'Beginner',
          verified: true,
          isCompleted: false,
        }
      ],
      learnResources,
      notesResources,
      revisionResources,
      interviewResources,
      practiceResources,
      learningSprints: enrichedSprints,
    });
  }

  return updatedTopics;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: generateRoadmapWithAI
// ═══════════════════════════════════════════════════════════════════════════════
export const generateRoadmapWithAI = async (profile: EnrichedProfileInput): Promise<any> => {
  console.log('--------------------------------------------------');
  console.log('[ROADMAP-ENGINE-AUDIT] Target Career Role:', profile.preferredCareer);
  console.log('[ROADMAP-ENGINE-AUDIT] Career Goal:', profile.careerGoal);
  console.log('[ROADMAP-ENGINE-AUDIT] API Key Configured:', isApiKeyConfigured);
  console.log('[ROADMAP-ENGINE-AUDIT] Request Execution Mode:', genAI ? 'API_GEMINI' : 'FALLBACK_TEMPLATE');
  console.log('--------------------------------------------------');

  logStage('INIT', `Starting multi-stage Roadmap Engine for "${profile.name}" (${profile.preferredCareer || 'Software Engineer'})`, {
    preferredCareer: profile.preferredCareer,
    targetCompanyType: profile.targetCompanyType,
    preferredDsaLanguage: profile.preferredDsaLanguage,
    preferredProgrammingLanguage: profile.preferredProgrammingLanguage,
    timeline: profile.placementTimeline
  });

  if (!genAI) {
    logStage('MOCK', `Gemini API Key is not set or placeholder. Invoking Mock pipeline for role: "${profile.preferredCareer || 'Software Engineer'}"`);
    const mockRoadmap = await generateIntelligentMockRoadmap(profile);
    mockRoadmap.source = 'fallback';
    return mockRoadmap;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // ───── STAGE 1 & 2: Profile & Skill Gap Analysis ─────────────────────────
    logStage('STAGE-1&2', 'Running Profile & Skill Gap Analysis...');
    const analysisPrompt = buildAnalysisPrompt(profile);
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();
    logStage('STAGE-1&2', `Analysis Report completed (${analysisText.length} chars)`);

    // ───── STAGE 3, 4, 6 & 7: Month Planning & Selection ─────────────────────
    logStage('STAGE-3&4', 'Running Month Planning & Selection...');
    const planningPrompt = buildPlanningPrompt(analysisText, profile);
    
    console.log('[ROADMAP-ENGINE-AUDIT] Full Interpolated Gemini Prompt:\n', planningPrompt);

    const planningResult = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: planningPrompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const planningText = planningResult.response.text();
    if (!planningText) {
      throw new Error('Gemini planning stage returned empty response');
    }

    logStage('STAGE-8', 'Parsing Gemini JSON output');
    const roadmapJSON = JSON.parse(planningText.trim());

    // ───── STAGE 5: Curated Resource Attachment from Database ─────────────────
    roadmapJSON.topics = await attachCuratedResourcesFromDB(
      roadmapJSON.topics || [],
      profile.preferredCareer || 'Software Engineer (SDE)',
      profile.preferredDsaLanguage || 'Java'
    );

    roadmapJSON.version = '2.0.0';
    roadmapJSON.source = 'gemini';

    logStage('SUCCESS', `Successfully compiled ${profile.preferredCareer || 'Career'} roadmap: ${roadmapJSON.topics.length} months.`);
    return roadmapJSON;
  } catch (error) {
    console.error('[ROADMAP-ENGINE-AUDIT] Gemini API Call Failed! Error details:', error);
    const mockRoadmap = await generateIntelligentMockRoadmap(profile);
    mockRoadmap.source = 'fallback';
    return mockRoadmap;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENT MOCK GENERATOR (structured, profile-aware fallback)
// ═══════════════════════════════════════════════════════════════════════════════
async function generateIntelligentMockRoadmap(profile: EnrichedProfileInput) {
  logStage('MOCK-INIT', 'Analyzing profile for Fallback generator');

  const timeline = profile.placementTimeline || '6 Months';
  let totalMonths = 6;
  if (timeline === '3 Months') totalMonths = 3;
  else if (timeline === '4 Months') totalMonths = 4;
  else if (timeline === '5 Months') totalMonths = 5;
  else if (timeline === '6 Months') totalMonths = 6;
  else if (timeline === '8 Months') totalMonths = 8;

  const skipCount = profile.completedMonths.length;
  const newTopicCount = Math.max(1, totalMonths - skipCount);
  const dsaLang = profile.preferredDsaLanguage || 'Java';
  const progLang = profile.preferredProgrammingLanguage || 'Java';
  const isProduct = (profile.targetCompanyType || 'Product-Based') === 'Product-Based';
  const dailyHours = profile.dailyStudyHours || 2;
  const baseMonthlyHours = totalMonths <= 3 ? 90 : totalMonths <= 5 ? 75 : totalMonths === 6 ? 60 : 45;
  const monthlyHours = Math.max(baseMonthlyHours, dailyHours * 30);

  // Predefined curriculum templates
  interface MockTemplate {
    title: string;
    why: string;
    objectives: string[];
    weeklyPlan: string[];
    topics: string[];
    keys: string[];
    problems: Array<{ title: string; url: string; difficulty: 'easy' | 'medium' | 'hard' }>;
    projectTitle: string;
    projectDesc: string;
    projectDifficulty: 'beginner' | 'intermediate' | 'advanced';
    interviewPrep: string[];
    milestones: string[];
    goal: string;
    outcome: string;
    readinessImprovement: number;
    estimatedHours?: number;
  }

  const sdeProductCurriculum: MockTemplate[] = [
    {
      title: 'DSA Foundations & Sorting Algorithms',
      why: `Your self-assessed DSA level is ${profile.dsaLevel}. Product SDE interviews require clean, bug-free implementations of arrays, sorting, and complexity analysis.`,
      objectives: ['Master array manipulations & pointers', 'Implement bubble, insertion, quick & merge sort', 'Analyze big-O complexity'],
      weeklyPlan: [
        'Week 1: Array memory representations & static vs dynamic arrays',
        'Week 2: Two-pointer and sliding window basic patterns',
        'Week 3: Core sorting algorithms implementations',
        'Week 4: Sorting questions & Space/Time complexity analysis'
      ],
      topics: ['Arrays', 'Strings', 'Sorting', 'Two Pointers'],
      keys: ['DSA_ARRAYS', 'DSA_STRINGS', 'DSA_SORTING', 'DSA_TWO_POINTERS'],
      problems: [
        { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'easy' },
        { title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'easy' },
        { title: 'Merge Sorted Array', url: 'https://leetcode.com/problems/merge-sorted-array/', difficulty: 'easy' }
      ],
      projectTitle: 'Command-Line Task Scheduler',
      projectDesc: `Build a CLI SDE scheduler in ${progLang} to manage tasks using custom sorting algorithms by deadline & priority.`,
      projectDifficulty: 'beginner',
      interviewPrep: ['Two sum optimization trade-offs', 'QuickSort vs MergeSort complexity & cache differences'],
      milestones: ['Solve 15 LeetCode Easy problems', 'Complete task scheduler CLI submission'],
      goal: 'Write basic array & sorting algorithms from scratch in under 15 minutes',
      outcome: 'Confident with arrays, strings, static pointers, and runtime complexity analysis',
      readinessImprovement: 10
    },
    {
      title: 'Advanced Linear Structures & Searches',
      why: 'You have solved some coding problems. This month covers Linked Lists, Stacks, Queues, and Binary Searches which form the core of structural questions.',
      objectives: ['Implement singly & doubly linked lists', 'Understand stack & queue pointer logic', 'Master Binary Search boundaries'],
      weeklyPlan: [
        'Week 1: Linked list reversals & cycles checking',
        'Week 2: Stack operations & bracket matching questions',
        'Week 3: Queue implementation & sliding window maximum',
        'Week 4: Binary search boundaries & search in rotated sorted arrays'
      ],
      topics: ['Linked List', 'Stack', 'Queue', 'Binary Search'],
      keys: ['DSA_LINKED_LIST', 'DSA_STACK', 'DSA_QUEUE', 'DSA_BINARY_SEARCH'],
      problems: [
        { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'easy' },
        { title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'easy' },
        { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'easy' },
        { title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'medium' }
      ],
      projectTitle: 'Browser History Navigation Simulator',
      projectDesc: 'Design a web tab simulator using doubly linked lists and browser history forward/back buttons using two stacks.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Linked list cycle detection (Floyd\'s algorithm)', 'Stack-based calculator parser explanation'],
      milestones: ['Solve 15 LeetCode Easy/Medium problems', 'Build history simulation visual UI'],
      goal: 'Solve linked list and stack problems using standard library structures',
      outcome: 'Understand dynamic memory chaining and search boundaries',
      readinessImprovement: 12
    },
    {
      title: 'Non-Linear Structures: Trees & Heaps',
      why: 'Product-based companies ask tree traversals and priority queue operations in SDE screening rounds.',
      objectives: ['Master Binary Tree DFS & BFS traversals', 'Understand BST insertions, deletions & search', 'Learn Heap adjustments & priority queues'],
      weeklyPlan: [
        'Week 1: Tree representations, BFS Level-Order, and DFS (Pre, In, Post) traversals',
        'Week 2: BST operations and tree height/balancing check',
        'Week 3: Min & Max Heap array storage and heapify operations',
        'Week 4: Priority queue applications & Top-K elements questions'
      ],
      topics: ['Trees', 'Binary Search Trees (BST)', 'Heap', 'Priority Queues'],
      keys: ['DSA_TREES', 'DSA_HEAP'],
      problems: [
        { title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'easy' },
        { title: 'Invert Binary Tree', url: 'https://leetcode.com/problems/invert-binary-tree/', difficulty: 'easy' },
        { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'medium' }
      ],
      projectTitle: 'Binary Search Tree Visualizer',
      projectDesc: 'Develop a tree drawing application showing node insertion, balancing, and animated traversals.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['BFS vs DFS memory complexity differences', 'Heapify algorithm runtime proof (O(N))'],
      milestones: ['Solve 10 LeetCode Medium tree problems', 'Submit working BST simulator'],
      goal: 'Confidently handle hierarchical logic and recursively parse tree nodes',
      outcome: 'Capable of writing recursion algorithms for tree checks',
      readinessImprovement: 15
    },
    {
      title: 'Advanced SDE Concepts: Graphs & Dynamic Programming',
      why: 'Product interview SDE benchmarks test dynamic programming and graph traversals (BFS/DFS/Dijkstra).',
      objectives: ['Master Graph representations (Adjacency list/matrix)', 'Write BFS & DFS for connected components', 'Learn Dynamic Programming memorization & tabulation'],
      weeklyPlan: [
        'Week 1: Graph representations & topological sorting',
        'Week 2: Shortest path routing algorithms (Dijkstra, Bellman-Ford)',
        'Week 3: Dynamic Programming basics (Fibonacci, grid pathways)',
        'Week 4: DP classic sheets (0/1 Knapsack, Longest Common Subsequence)'
      ],
      topics: ['Graphs', 'Dynamic Programming (DP)', 'Backtracking'],
      keys: ['DSA_GRAPHS', 'DSA_DP', 'DSA_BACKTRACKING'],
      problems: [
        { title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'medium' },
        { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'easy' },
        { title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'medium' }
      ],
      projectTitle: 'Network Route Visualizer',
      projectDesc: 'Create a mapping app showing the shortest path between intersection nodes using Dijkstra algorithm.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Topological sort dependencies', 'Memoization vs Tabulation space-time differences'],
      milestones: ['Solve 12 LeetCode Medium DP & Graph problems', 'Deploy Network visualizer'],
      goal: 'Trace and implement graph searches and recursive state transformations',
      outcome: 'Able to solve multi-stage decision trees and DP problem grids',
      readinessImprovement: 18
    },
    {
      title: 'Backend Engineering, Databases & APIs',
      why: 'SDE roles require web development architecture basics. This month covers REST services, schemas, and Express.',
      objectives: ['Build robust REST endpoints using Express & Node', 'Design database relations & SQL/NoSQL queries', 'Implement secure JWT authentication'],
      weeklyPlan: [
        'Week 1: Node.js runtime, Event loop, and basic HTTP server setup',
        'Week 2: Express routing, request validation, and middlewares',
        'Week 3: Relational databases SQL schema indexing vs MongoDB documents',
        'Week 4: Secure password hashing & JWT token validation flow'
      ],
      topics: ['Git', 'Node.js', 'Express', 'MongoDB', 'SQL', 'Authentication'],
      keys: ['DEV_GIT', 'DEV_NODE', 'DEV_EXPRESS', 'DEV_MONGODB', 'DEV_SQL', 'DEV_AUTHENTICATION'],
      problems: [
        { title: 'Design Twitter (API mockup)', url: 'https://leetcode.com/problems/design-twitter/', difficulty: 'medium' }
      ],
      projectTitle: 'REST API Student Onboarding Portal',
      projectDesc: 'Construct a backend API with role-based auth, email notifications, and database profile updates.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['SQL indexing mechanism & joins', 'Authentication session vs token differences'],
      milestones: ['Complete Git portfolio integration', 'Deploy REST API to Render with test coverage'],
      goal: 'Setup backend environments, handle SQL connections, and write secure JWT guards',
      outcome: 'Solid server-side engineering foundations',
      readinessImprovement: 15
    },
    {
      title: 'Production Development, System Design & Deployment',
      why: 'Finalizing preparation by understanding scalable systems, containerization, and cloud deployment.',
      objectives: ['Learn high-level system design (Load balancers, CDN)', 'Understand Docker containerization', 'Deploy applications to Vercel/AWS'],
      weeklyPlan: [
        'Week 1: Horizontal vs vertical scaling, CDNs, and proxy servers',
        'Week 2: Dockerfile writing, images building, and compose scaling',
        'Week 3: Basic AWS deployment (S3, EC2 instances setup)',
        'Week 4: Mock interviews sprints & Resume ATS final polishing'
      ],
      topics: ['System Design Basics', 'Docker', 'AWS Basics', 'Deployment', 'Interview Prep'],
      keys: ['CS_SYSTEM_DESIGN', 'DEV_DOCKER', 'DEV_AWS', 'DEV_DEPLOYMENT', 'INT_RESUME', 'INT_MOCK'],
      problems: [
        { title: 'Design TinyURL', url: 'https://leetcode.com/problems/encode-and-decode-tinyurl/', difficulty: 'medium' }
      ],
      projectTitle: 'Dockerized Personal SDE Portfolio Hub',
      projectDesc: 'Build and containerize a React front-end + Node back-end hub showing SDE stats. Deploy via Docker Compose.',
      projectDifficulty: 'advanced',
      interviewPrep: ['CDNs and database replication scaling', 'Vite/Vercel build pipelines'],
      milestones: ['ATS Resume review score > 80', 'Complete 3 peer mock interview evaluations'],
      goal: 'Explain scaling issues and Dockerize web stack architectures',
      outcome: 'Ready to walk into interviews and handle high-level architecture design',
      readinessImprovement: 15
    }
  ];

  const sdeServiceCurriculum: MockTemplate[] = [
    {
      title: 'Programming Core & Aptitude Foundations',
      why: 'Service-based SDE recruiters start with quantitative aptitude and programming core theory rounds.',
      objectives: ['Build programming language syntax foundations', 'Solve basic aptitude calculations', 'Understand core SDE resume outlines'],
      weeklyPlan: [
        'Week 1: Selected programming language loops, conditions, syntax',
        'Week 2: OOP classes, inheritance, polymorphism syntax',
        'Week 3: Quantitative Aptitude percentages, ratios, averages',
        'Week 4: Resume layout configurations & basic HR intro pitches'
      ],
      topics: ['C++ / Java / Python core', 'OOP Basics', 'Aptitude Quant', 'Resume'],
      keys: ['CS_OOP', 'APT_QUANT', 'INT_RESUME'],
      problems: [
        { title: 'Fizz Buzz', url: 'https://leetcode.com/problems/fizz-buzz/', difficulty: 'easy' }
      ],
      projectTitle: 'CLI Library Management System',
      projectDesc: 'Build a terminal catalog using OOP classes and inheritance patterns to manage books.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain OOP Pillars (Encapsulation vs Abstraction)', 'STAR method introductions'],
      milestones: ['Solve 5 programming exercises', 'Submit basic resume draft'],
      goal: 'Understand basic code object hierarchies and solve quantitative problems quickly',
      outcome: 'Solid foundation in core coding syntax & quantitative math',
      readinessImprovement: 15
    },
    {
      title: 'DSA Foundations & Logical Reasoning',
      why: 'Aptitude tests require logical deductions, puzzles, and basic linear searches.',
      objectives: ['Master basic array operations', 'Solve logical puzzles & series', 'Write clean string loops'],
      weeklyPlan: [
        'Week 1: Array elements traversing and searching algorithms',
        'Week 2: String characters search & loops manipulation',
        'Week 3: Logical Reasoning coding/decoding, directions, relations',
        'Week 4: Basic sorting algorithm code runs (bubble/selection)'
      ],
      topics: ['Arrays', 'Strings', 'Sorting', 'Logical Reasoning'],
      keys: ['DSA_ARRAYS', 'DSA_STRINGS', 'DSA_SORTING', 'APT_LOGICAL'],
      problems: [
        { title: 'Reverse String', url: 'https://leetcode.com/problems/reverse-string/', difficulty: 'easy' }
      ],
      projectTitle: 'CLI Contact Book Search',
      projectDesc: 'Build an app to search contacts by character arrays, implementing linear & binary searches.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Bubble sort swapping counts', 'Logical series deductions explanation'],
      milestones: ['Score 75% on 2 mock aptitude logical tests', 'Complete contact book script'],
      goal: 'Write loops to filter array values and solve logical series questions',
      outcome: 'Comfortable with basic DSA linear search & reasoning puzzles',
      readinessImprovement: 15
    },
    {
      title: 'Web Basics & CS Fundamentals',
      why: 'Service SDE interviews ask questions on DBMS databases and basic HTML layout structures.',
      objectives: ['Learn HTML & CSS layouts', 'Understand DBMS tables and SQL joins', 'Prepare verbal English communication'],
      weeklyPlan: [
        'Week 1: HTML tags, forms, and CSS basic grids layout',
        'Week 2: Relational database tables & primary key structures',
        'Week 3: SQL SELECT, WHERE, and simple JOIN commands',
        'Week 4: English verbal ability, grammar, and HR behavioral mocks'
      ],
      topics: ['HTML', 'CSS', 'DBMS Basics', 'SQL SELECT', 'Verbal Ability'],
      keys: ['DEV_HTML', 'DEV_CSS', 'CS_DBMS', 'DEV_SQL', 'APT_VERBAL', 'INT_BEHAVIORAL'],
      problems: [
        { title: 'Combine Two Tables (SQL)', url: 'https://leetcode.com/problems/combine-two-tables/', difficulty: 'easy' }
      ],
      projectTitle: 'Responsive Employee Database Directory UI',
      projectDesc: 'Build a frontend employee list page connected to SQL table structures via mockup.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Primary key vs Foreign key', 'Difference between inner join and outer join'],
      milestones: ['Complete SQLZoo SELECT practice section', 'Score 80%+ on verbal English grammar mocks'],
      goal: 'Query databases, design tables, and style landing pages',
      outcome: 'Understand web structure basics, db query designs, and verbal skills',
      readinessImprovement: 15
    },
    {
      title: 'Operating Systems & HR Interview Sprint',
      why: 'Final month focuses on operating systems theory, mock interview sheets, and soft skills.',
      objectives: ['Master OS fundamentals (scheduling, process vs thread)', 'Practice timed SDE logical aptitude mock rounds', 'Polishing HR interview pitches'],
      weeklyPlan: [
        'Week 1: OS process vs thread, scheduling, and CPU queues',
        'Week 2: DBMS normalizations & ACID transaction properties',
        'Week 3: Service-based company mock placements screening',
        'Week 4: HR mock interview question sprints (STAR pitches)'
      ],
      topics: ['Operating Systems', 'DBMS Advanced', 'Placement Mocks', 'HR Prep'],
      keys: ['CS_OS', 'CS_DBMS', 'INT_MOCK', 'INT_HR'],
      problems: [
        { title: 'Second Highest Salary (SQL)', url: 'https://leetcode.com/problems/second-highest-salary/', difficulty: 'medium' }
      ],
      projectTitle: 'Student Grade Tracker System with Database Mocks',
      projectDesc: 'Create a local school registration CLI tracking student scores with relational tables.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain CPU Scheduling FIFO vs Round-Robin', 'Why should we hire you? (STAR Pitch)'],
      milestones: ['Complete 5 full service placement practice rounds', 'Submit finalized resume'],
      goal: 'Confidently answer OS/DBMS questions and HR behavioral screens',
      outcome: 'Placement ready for service-based hiring pipelines',
      readinessImprovement: 15
    }
  ];

  const frontendCurriculum: MockTemplate[] = [
    {
      title: 'Modern Web Standards, Semantic HTML5 & CSS Layouts',
      why: 'Frontend Engineers must master responsive layouts, DOM semantics, accessibility, and CSS Grid/Flexbox architecture.',
      objectives: ['Master semantic HTML5 structures & ARIA accessibility', 'Implement responsive CSS Grid & Flexbox layouts', 'Understand DOM box model & CSS variables'],
      weeklyPlan: [
        'Week 1: HTML5 semantic tags, accessibility standards (a11y), and SEO metadata',
        'Week 2: Advanced CSS Flexbox positioning & responsive grid template areas',
        'Week 3: CSS custom properties (variables) & modern styling paradigms',
        'Week 4: Mobile-first responsive design & cross-browser compatibility'
      ],
      topics: ['HTML5', 'CSS3', 'Flexbox', 'CSS Grid', 'Accessibility'],
      keys: ['DEV_HTML', 'DEV_CSS'],
      problems: [
        { title: 'A Complete Guide to Flexbox (CSS)', url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/', difficulty: 'easy' }
      ],
      projectTitle: 'Responsive SaaS Landing Page',
      projectDesc: 'Design and code a pixel-perfect, fully responsive SaaS landing page with dark mode theme switching.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain CSS Box Model & margin collapsing', 'Difference between inline, block, and inline-block elements'],
      milestones: ['Build responsive SaaS landing page', 'Score 90%+ on Lighthouse Accessibility audit'],
      goal: 'Create responsive web pages without relying on CSS UI frameworks',
      outcome: 'Strong foundations in modern CSS layout techniques',
      readinessImprovement: 15
    },
    {
      title: 'JavaScript Deep Dive & Asynchronous Programming',
      why: 'Frontend mastery relies heavily on JavaScript closures, event loops, promises, and modern ES6+ features.',
      objectives: ['Understand closures, prototypes & scope chains', 'Master async/await & Promise execution order', 'Learn Event Loop, microtasks, and macro-task queues'],
      weeklyPlan: [
        'Week 1: Execution context, call stack, hoisting, and closures',
        'Week 2: Prototypes, inheritance, and ES6 class syntax',
        'Week 3: Promises, async/await, and error handling patterns',
        'Week 4: DOM manipulation, event delegation, and performance'
      ],
      topics: ['JavaScript ES6+', 'Async/Await', 'Promises', 'Event Loop', 'DOM'],
      keys: ['DEV_JAVASCRIPT'],
      problems: [
        { title: 'Debounce & Throttle Implementation', url: 'https://leetcode.com/problems/debounce/', difficulty: 'medium' }
      ],
      projectTitle: 'Interactive Kanban Task Board App',
      projectDesc: 'Build a vanilla JavaScript drag-and-drop Kanban task board with local storage persistence.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain Event Loop microtask vs macrotask execution', 'Implement custom Promise.all helper function'],
      milestones: ['Complete JS mini project', 'Solve 10 JS utility functions'],
      goal: 'Write clean, bug-free asynchronous JavaScript without UI libraries',
      outcome: 'Deep understanding of JS engine runtime behavior',
      readinessImprovement: 15
    },
    {
      title: 'React Core, Custom Hooks & State Management',
      why: 'React is the standard library for modern frontend development. You need proficiency in component lifecycles, hooks, and global state.',
      objectives: ['Master React component lifecycle & virtual DOM', 'Build custom hooks for data fetching & UI states', 'Implement global state management (Zustand/Redux)'],
      weeklyPlan: [
        'Week 1: JSX rendering, props, state, and component purity',
        'Week 2: useEffect, useMemo, useCallback optimization hooks',
        'Week 3: Custom hook composition and Context API design',
        'Week 4: Global state management with Zustand & Zustand middleware'
      ],
      topics: ['React', 'Hooks', 'State Management', 'Zustand', 'Virtual DOM'],
      keys: ['DEV_REACT'],
      problems: [
        { title: 'Build React Counter & Accordion Component', url: 'https://react.dev/learn', difficulty: 'easy' }
      ],
      projectTitle: 'E-Commerce Frontend with Shopping Cart',
      projectDesc: 'Construct a React e-commerce store with product filtering, cart drawer, and local storage state.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Why do we need React key prop?', 'How does React Virtual DOM reconciliation work?'],
      milestones: ['Deploy React app to Vercel', 'Pass React component state interview screen'],
      goal: 'Structure modular React frontend applications',
      outcome: 'Fluent in React functional components and custom hook patterns',
      readinessImprovement: 15
    },
    {
      title: 'Next.js SSR/SSG & Frontend Architecture',
      why: 'Modern frontend roles demand fullstack React frameworks like Next.js for server-side rendering, routing, and SEO.',
      objectives: ['Master Next.js App Router & Server Components', 'Implement SSR, SSG, and ISR rendering strategies', 'Optimize web vitals (LCP, CLS, INP)'],
      weeklyPlan: [
        'Week 1: App Router file structure, layouts, and server actions',
        'Week 2: Server-side rendering vs static site generation',
        'Week 3: Next.js API routes, middleware, and authentication',
        'Week 4: Image optimization, font loading, and Core Web Vitals'
      ],
      topics: ['Next.js', 'SSR', 'SSG', 'Web Vitals', 'App Router'],
      keys: ['DEV_NEXTJS', 'DEV_AUTHENTICATION'],
      problems: [
        { title: 'Optimize Next.js LCP & CLS metrics', url: 'https://nextjs.org/learn', difficulty: 'medium' }
      ],
      projectTitle: 'Dev.to Blog Clone with Next.js & Markdown',
      projectDesc: 'Develop a high-performance blog platform using Next.js App Router, Tailwind CSS, and Markdown parsing.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Server Components vs Client Components in Next.js', 'How to prevent layout shifts (CLS)?'],
      milestones: ['Achieve 95+ score on Google Lighthouse', 'Deploy Next.js application to Vercel'],
      goal: 'Build SEO-optimized, production-ready React web apps',
      outcome: 'Proficient with production React frameworks',
      readinessImprovement: 15
    },
    {
      title: 'Web Performance, Progressive Web Apps (PWA) & Micro-Animations',
      why: 'Senior Frontend Developers optimize web app performance, support offline PWA experiences, and build rich micro-interactions.',
      objectives: ['Master browser rendering pipeline & critical rendering path', 'Implement Service Workers & Web App Manifest for PWA', 'Create high-fps web animations with Framer Motion & CSS hardware acceleration'],
      weeklyPlan: [
        'Week 1: Critical rendering path, layout thrashing, and memory leak profiling',
        'Week 2: Service Workers, offline caching strategies, and PWA installation',
        'Week 3: Micro-interactions & animations with Framer Motion and Web Animations API',
        'Week 4: WebGL & Canvas 2D fundamentals for interactive visualizations'
      ],
      topics: ['Web Performance', 'PWA', 'Service Workers', 'Framer Motion', 'Animations'],
      keys: ['DEV_REACT', 'DEV_HTML'],
      problems: [
        { title: 'Profile Web Vitals & Memory Leaks', url: 'https://web.dev/vitals/', difficulty: 'medium' }
      ],
      projectTitle: 'Offline-First PWA Task & Note Studio',
      projectDesc: 'Build a installable progressive web application with offline caching, local sync, and smooth animations.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain layout thrashing and how to avoid it', 'How do Service Workers intercept HTTP requests?'],
      milestones: ['Pass PWA audit in Chrome Lighthouse', 'Profile app at 60fps animation budget'],
      goal: 'Deliver silky-smooth, offline-capable progressive web apps',
      outcome: 'Expert in frontend performance tuning and PWA architecture',
      readinessImprovement: 15
    },
    {
      title: 'End-to-End Testing, Micro-Frontends & Frontend Capstone',
      why: 'Finalizing Frontend mastery with comprehensive E2E testing (Playwright/Cypress), micro-frontend concepts, and capstone deployment.',
      objectives: ['Write robust E2E tests using Cypress or Playwright', 'Understand Module Federation & Micro-Frontend architecture', 'Complete production capstone portfolio website'],
      weeklyPlan: [
        'Week 1: Unit & Component testing using Vitest and React Testing Library',
        'Week 2: End-to-end user flow testing with Playwright & CI integration',
        'Week 3: Micro-Frontend concepts, Webpack Module Federation, and monorepos',
        'Week 4: Capstone portfolio deployment, lighthouse optimization & interview prep'
      ],
      topics: ['Playwright', 'Cypress', 'Micro-Frontends', 'Testing', 'Portfolio'],
      keys: ['DEV_DEPLOYMENT', 'DEV_REACT', 'INT_RESUME'],
      problems: [
        { title: 'Write E2E Test Suite with Playwright', url: 'https://playwright.dev/', difficulty: 'medium' }
      ],
      projectTitle: 'Enterprise Component Library & E2E Tested Portfolio',
      projectDesc: 'Design a reusable UI component design system published as an npm package, tested with Playwright E2E automation.',
      projectDifficulty: 'advanced',
      interviewPrep: ['E2E testing vs Integration testing trade-offs', 'Explain Module Federation in Micro-Frontends'],
      milestones: ['Achieve 80%+ test coverage', 'Publish custom component package to npm'],
      goal: 'Demonstrate enterprise-grade frontend architecture and testing',
      outcome: 'Frontend Engineer placement ready',
      readinessImprovement: 15
    }
  ];

  const backendCurriculum: MockTemplate[] = [
    {
      title: 'Server Systems, Node.js Runtimes & REST Architecture',
      why: 'Backend Engineers require strong server fundamentals, asynchronous I/O understanding, and RESTful API standards.',
      objectives: ['Understand Node.js event loop & non-blocking I/O', 'Design clean REST API contracts & HTTP status codes', 'Implement middleware pipelines & error handlers'],
      weeklyPlan: [
        'Week 1: Node.js runtime, V8 engine, and native HTTP module',
        'Week 2: Express server setup, routing, and custom middlewares',
        'Week 3: Request validation with Zod & global error handling',
        'Week 4: RESTful API design standards, status codes, and documentation'
      ],
      topics: ['Node.js', 'Express', 'REST APIs', 'Middleware', 'Zod Validation'],
      keys: ['DEV_NODE', 'DEV_EXPRESS', 'DEV_REST_APIS'],
      problems: [
        { title: 'Design RESTful Resource Endpoints', url: 'https://expressjs.com/', difficulty: 'easy' }
      ],
      projectTitle: 'Scalable REST API Service with Express',
      projectDesc: 'Build a production Express API server with centralized error logging, environment config, and Zod validation.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain Node.js event loop & thread pool (libuv)', 'HTTP status code groups (2xx, 4xx, 5xx)'],
      milestones: ['Build REST API backend server', 'Deploy Express service to Render'],
      goal: 'Construct structured REST API backends with robust error handling',
      outcome: 'Solid foundation in server-side JavaScript development',
      readinessImprovement: 15
    },
    {
      title: 'Relational Databases, SQL Schemas & Indexing',
      why: 'Backend systems rely heavily on relational database integrity, optimized SQL queries, transactions, and indexing.',
      objectives: ['Master SQL DDL, DML, and complex JOIN queries', 'Design normalized relational database schemas', 'Understand B-tree indexes & query performance'],
      weeklyPlan: [
        'Week 1: Relational database principles, tables, and foreign keys',
        'Week 2: SQL SELECT, GROUP BY, HAVING, and JOIN queries',
        'Week 3: Database transactions (ACID properties) & locking mechanisms',
        'Week 4: B-tree indexing strategies & EXPLAIN query analysis'
      ],
      topics: ['SQL', 'PostgreSQL', 'Database Schemas', 'Indexing', 'ACID'],
      keys: ['DEV_SQL', 'CS_DBMS'],
      problems: [
        { title: 'Nth Highest Salary (SQL)', url: 'https://leetcode.com/problems/nth-highest-salary/', difficulty: 'medium' }
      ],
      projectTitle: 'E-Commerce Database Schema & Query Engine',
      projectDesc: 'Design a 3NF normalized relational schema for orders/inventory in PostgreSQL with optimized index plans.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain ACID properties in database transactions', 'Difference between Clustered & Non-clustered Index'],
      milestones: ['Complete 20 SQL query exercises', 'Submit PostgreSQL schema design'],
      goal: 'Write complex SQL queries and design resilient database schemas',
      outcome: 'Proficient in relational database engineering',
      readinessImprovement: 15
    },
    {
      title: 'NoSQL Databases, MongoDB & Redis Caching',
      why: 'High-throughput backend applications utilize NoSQL document stores and fast in-memory key-value caching.',
      objectives: ['Master MongoDB document modeling & Mongoose ORM', 'Implement Redis caching to reduce database loads', 'Understand cache invalidation strategies'],
      weeklyPlan: [
        'Week 1: NoSQL vs SQL decision frameworks & MongoDB documents',
        'Week 2: Mongoose schemas, validation, and aggregation pipelines',
        'Week 3: Redis data structures (Strings, Hashes, Sorted Sets)',
        'Week 4: Cache-aside pattern & rate-limiting with Redis'
      ],
      topics: ['MongoDB', 'NoSQL', 'Redis', 'Caching', 'Mongoose'],
      keys: ['DEV_MONGODB', 'DEV_REDIS'],
      problems: [
        { title: 'Design In-Memory LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'medium' }
      ],
      projectTitle: 'High-Performance API with Redis Caching',
      projectDesc: 'Implement a Redis caching layer for heavy database queries with TTL invalidation and rate limiting.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Cache-aside vs Write-through caching strategy', 'MongoDB indexing vs SQL indexing differences'],
      milestones: ['Build Redis cache middleware', 'Benchmark API response times before/after caching'],
      goal: 'Optimize server performance using Redis in-memory storage',
      outcome: 'Capable of scaling backend read throughput using caching',
      readinessImprovement: 15
    },
    {
      title: 'Microservices, Docker & System Design Architecture',
      why: 'Senior backend roles require system design knowledge, containerization, message queues, and cloud deployment.',
      objectives: ['Learn high-level system design principles', 'Containerize Node/Python services using Docker', 'Implement asynchronous messaging queues (RabbitMQ/Kafka)'],
      weeklyPlan: [
        'Week 1: System design components: Load balancers, API Gateways, Reverse proxies',
        'Week 2: Docker containers, Dockerfile creation, and multi-container Docker Compose',
        'Week 3: Message queues & pub/sub architecture patterns',
        'Week 4: Microservice deployment, environment security & AWS Basics'
      ],
      topics: ['System Design', 'Docker', 'Microservices', 'Message Queues', 'AWS'],
      keys: ['CS_SYSTEM_DESIGN', 'DEV_DOCKER', 'DEV_AWS', 'DEV_DEPLOYMENT'],
      problems: [
        { title: 'Design Rate Limiter', url: 'https://leetcode.com/problems/encode-and-decode-tinyurl/', difficulty: 'medium' }
      ],
      projectTitle: 'Microservices-based Notification & Auth System',
      projectDesc: 'Build Dockerized backend microservices communicating via message queue pub/sub architecture.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain System Design for URL Shortener', 'How do Load Balancers handle health checks and routing?'],
      milestones: ['Complete 3 System Design mock interviews', 'Deploy Dockerized microservice cluster'],
      goal: 'Design resilient, scalable distributed backend systems',
      outcome: 'Backend Engineering placement ready',
      readinessImprovement: 15
    }
  ];

  const devopsCurriculum: MockTemplate[] = [
    {
      title: 'Linux Systems Administration & Shell Scripting',
      why: 'DevOps Engineers must have deep fluency in Linux server environments, Bash scripting, process management, and network troubleshooting.',
      objectives: ['Master Linux CLI, permissions, and process control', 'Write automated Bash scripts for system maintenance', 'Understand Linux networking tools (netstat, curl, iptables)'],
      weeklyPlan: [
        'Week 1: Linux directory hierarchy, file permissions (chmod/chown), and user management',
        'Week 2: Process management (ps, top, kill), systemctl services, and cron jobs',
        'Week 3: Advanced Bash shell scripting, loops, functions, and error handling',
        'Week 4: Linux networking commands, SSH security keys, and firewall configurations'
      ],
      topics: ['Linux', 'Bash Scripting', 'CLI', 'Networking', 'SSH'],
      keys: ['CS_OS', 'DEV_GIT', 'CS_CN'],
      problems: [
        { title: 'Write Bash Script for Log Rotation', url: 'https://www.shellcheck.net/', difficulty: 'easy' }
      ],
      projectTitle: 'Automated Linux Server Backup & Audit Script',
      projectDesc: 'Write a robust Bash utility script that audits server disk space, creates compressed backups, and sends alerts.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain Linux file permission bits (755 vs 644)', 'Difference between process and thread in Linux kernel'],
      milestones: ['Complete 5 Linux Bash automation scripts', 'Configure secure SSH key-based access'],
      goal: 'Operate and troubleshoot Linux server environments from terminal',
      outcome: 'Strong Linux systems engineering foundations',
      readinessImprovement: 15
    },
    {
      title: 'Containerization with Docker & Container Security',
      why: 'Containerization is the backbone of modern cloud deployments. DevOps engineers must package applications into light, secure Docker images.',
      objectives: ['Master multi-stage Dockerfile builds', 'Optimize Docker image size & security vulnerabilities', 'Manage multi-container stacks with Docker Compose'],
      weeklyPlan: [
        'Week 1: Docker engine architecture, images vs containers, and volume mounts',
        'Week 2: Writing multi-stage Dockerfiles for minimal production footprint',
        'Week 3: Docker networking bridges, environment isolation, and secret management',
        'Week 4: Multi-container orchestrations using Docker Compose'
      ],
      topics: ['Docker', 'Containers', 'Docker Compose', 'Multi-stage Builds'],
      keys: ['DEV_DOCKER', 'DEV_DEPLOYMENT'],
      problems: [
        { title: 'Containerize Fullstack Web Application', url: 'https://docs.docker.com/get-started/', difficulty: 'medium' }
      ],
      projectTitle: 'Multi-Container Microservice Environment',
      projectDesc: 'Containerize a React frontend, Node API, PostgreSQL DB, and Nginx reverse proxy using Docker Compose.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Difference between Docker image layer caching and no-cache build', 'ENTRYPOINT vs CMD in Dockerfile'],
      milestones: ['Build multi-stage Dockerfile under 100MB', 'Spin up multi-container environment via Compose'],
      goal: 'Package and run any software application inside isolated Docker containers',
      outcome: 'Fluent in Docker containerization and local orchestration',
      readinessImprovement: 15
    },
    {
      title: 'Kubernetes Cluster Orchestration & Management',
      why: 'Kubernetes (K8s) is the industry standard for managing containerized workloads at scale across cloud environments.',
      objectives: ['Understand K8s architecture (Control Plane & Worker Nodes)', 'Deploy Pods, Deployments, Services, and Ingress controllers', 'Manage ConfigMaps, Secrets, and Persistent Volumes'],
      weeklyPlan: [
        'Week 1: K8s architecture overview, Minikube/K3s setup, and kubectl CLI commands',
        'Week 2: Writing K8s Deployment & Service YAML manifests (ClusterIP, NodePort, LoadBalancer)',
        'Week 3: Ingress routing, SSL/TLS certificates, ConfigMaps, and Secrets',
        'Week 4: StatefulSets, PersistentVolume Claims, and rolling update strategies'
      ],
      topics: ['Kubernetes', 'K8s Deployments', 'Pods', 'Ingress', 'Services'],
      keys: ['DEV_DOCKER', 'DEV_AWS', 'DEV_DEPLOYMENT'],
      problems: [
        { title: 'Create K8s Deployment & Service Manifest', url: 'https://kubernetes.io/docs/tutorials/', difficulty: 'medium' }
      ],
      projectTitle: 'Production Kubernetes Cluster Deployment',
      projectDesc: 'Deploy a high-availability web app to a Kubernetes cluster with auto-scaling (HPA) and ingress routing.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain K8s Pod lifecycle & liveness/readiness probes', 'Deployment vs StatefulSet differences'],
      milestones: ['Deploy app on local Kubernetes cluster', 'Configure Horizontal Pod Autoscaler (HPA)'],
      goal: 'Orchestrate containerized services on Kubernetes clusters',
      outcome: 'Proficient in Kubernetes container orchestration',
      readinessImprovement: 15
    },
    {
      title: 'Infrastructure as Code (Terraform), CI/CD & Cloud',
      why: 'Modern DevOps mandates automated infrastructure provisioning using Terraform and continuous integration pipelines.',
      objectives: ['Provision AWS infrastructure using HashiCorp Terraform', 'Build automated CI/CD pipelines with GitHub Actions', 'Implement monitoring & alerting (Prometheus & Grafana)'],
      weeklyPlan: [
        'Week 1: AWS Core services (EC2, S3, VPC, IAM, EKS) provisioning',
        'Week 2: Infrastructure as Code (IaC) with Terraform syntax, state, and modules',
        'Week 3: Automated CI/CD build, test, and deploy pipelines with GitHub Actions',
        'Week 4: Metrics monitoring & log visualization using Prometheus & Grafana'
      ],
      topics: ['Terraform', 'IaC', 'AWS', 'GitHub Actions', 'CI/CD', 'Prometheus'],
      keys: ['DEV_AWS', 'DEV_DEPLOYMENT', 'DEV_GIT', 'CS_SYSTEM_DESIGN'],
      problems: [
        { title: 'Write Terraform Module for AWS EC2 & Security Group', url: 'https://developer.hashicorp.com/terraform/tutorials', difficulty: 'medium' }
      ],
      projectTitle: 'Automated GitOps CI/CD & IaC Deployment Pipeline',
      projectDesc: 'Build a end-to-end DevOps pipeline: Terraform provisions AWS EKS, GitHub Actions builds Docker images, and deploys to K8s.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain Terraform state lock & remote backends (S3/DynamoDB)', 'CI vs CD pipeline stages'],
      milestones: ['Provision AWS VPC with Terraform', 'Build automated GitHub Actions CI/CD deployment'],
      goal: 'Automate entire infrastructure and deployment lifecycle',
      outcome: 'DevOps Engineer placement ready',
      readinessImprovement: 15
    }
  ];

  const fullstackCurriculum: MockTemplate[] = [
    {
      title: 'Fullstack Web Foundations (HTML5, CSS3, JS & React)',
      why: 'Fullstack Developers require end-to-end fluency starting from client-side interfaces up to interactive UI components.',
      objectives: ['Master responsive frontend layouts', 'Write modern ES6+ JavaScript code', 'Build interactive user interfaces with React'],
      weeklyPlan: [
        'Week 1: HTML5 semantics, modern CSS Flexbox & Grid layouts',
        'Week 2: JavaScript ES6+ features, DOM events, and async fetch API',
        'Week 3: React components, state, props, and hook composition',
        'Week 4: Form validation, Tailwind CSS styling, and responsive UI'
      ],
      topics: ['HTML5', 'CSS3', 'JavaScript', 'React', 'Tailwind CSS'],
      keys: ['DEV_HTML', 'DEV_CSS', 'DEV_JAVASCRIPT', 'DEV_REACT'],
      problems: [
        { title: 'Build Fullstack UI Form Component', url: 'https://react.dev/learn', difficulty: 'easy' }
      ],
      projectTitle: 'Responsive Portfolio & Product Showcase',
      projectDesc: 'Construct a responsive React & Tailwind CSS web app consuming external REST APIs.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain how client-side rendering (CSR) works', 'Difference between state and props in React'],
      milestones: ['Build responsive frontend app', 'Deploy client UI to Vercel'],
      goal: 'Build interactive frontend user interfaces',
      outcome: 'Solid frontend foundations for fullstack development',
      readinessImprovement: 15
    },
    {
      title: 'Backend APIs, Express Server & Database Engineering',
      why: 'Fullstack development requires connecting React frontends to robust server APIs and persistent databases.',
      objectives: ['Build REST API services with Express & Node.js', 'Design MongoDB & PostgreSQL database schemas', 'Handle file uploads, CORS, and request validations'],
      weeklyPlan: [
        'Week 1: Node.js server architecture & Express routing setup',
        'Week 2: MongoDB document modelling & PostgreSQL relational tables',
        'Week 3: Integrating frontend React with backend API endpoints',
        'Week 4: File storage uploads (Cloudinary/S3) & API error handling'
      ],
      topics: ['Node.js', 'Express', 'MongoDB', 'PostgreSQL', 'REST APIs'],
      keys: ['DEV_NODE', 'DEV_EXPRESS', 'DEV_MONGODB', 'DEV_SQL', 'DEV_REST_APIS'],
      problems: [
        { title: 'Design RESTful API for Blog Engine', url: 'https://expressjs.com/', difficulty: 'medium' }
      ],
      projectTitle: 'Fullstack Blog & Resource Sharing Platform',
      projectDesc: 'Develop a Node/Express backend with MongoDB connected to a React frontend for full CRUD operations.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain CORS policy & preflight OPTIONS request', 'MongoDB vs PostgreSQL selection criteria'],
      milestones: ['Connect React client to Express REST API', 'Implement full CRUD database persistence'],
      goal: 'Connect frontend interfaces to database-backed server APIs',
      outcome: 'Capable of building complete fullstack web applications',
      readinessImprovement: 15
    },
    {
      title: 'Authentication, Security & Next.js Fullstack Framework',
      why: 'Production fullstack apps require secure user authentication (JWT/OAuth), session management, and SSR frameworks like Next.js.',
      objectives: ['Implement JWT & OAuth2 (Google) authentication', 'Build server-rendered pages using Next.js App Router', 'Protect private routes & manage session security'],
      weeklyPlan: [
        'Week 1: Password hashing (bcrypt) & JWT access/refresh token rotation',
        'Week 2: Passport.js OAuth integration & route authorization guards',
        'Week 3: Next.js App Router, Server Components, and Server Actions',
        'Week 4: Next.js API integration & fullstack state synchronization'
      ],
      topics: ['Next.js', 'JWT Auth', 'OAuth', 'Security', 'Server Components'],
      keys: ['DEV_NEXTJS', 'DEV_AUTHENTICATION', 'DEV_REST_APIS'],
      problems: [
        { title: 'Implement JWT Auth Flow in React/Next.js', url: 'https://nextjs.org/docs', difficulty: 'medium' }
      ],
      projectTitle: 'Fullstack E-Commerce Portal with Auth & Payments',
      projectDesc: 'Build a production Next.js fullstack portal with user auth, shopping cart, and database order processing.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain JWT stored in HTTP-only cookies vs LocalStorage', 'Next.js Server Actions vs traditional REST APIs'],
      milestones: ['Implement secure login/signup flow with JWT', 'Deploy fullstack Next.js app'],
      goal: 'Engineer secure, authenticated fullstack web applications',
      outcome: 'Fluent in fullstack React application architecture',
      readinessImprovement: 15
    },
    {
      title: 'Fullstack Deployment, Docker & Performance Optimization',
      why: 'Finalizing fullstack readiness by learning containerization, caching, deployment, and cloud pipelines.',
      objectives: ['Containerize fullstack apps with Docker Compose', 'Implement Redis caching & background queues', 'Deploy apps to cloud platforms (Vercel, Render, AWS)'],
      weeklyPlan: [
        'Week 1: Dockerizing frontend & backend with multi-stage builds',
        'Week 2: Docker Compose multi-container orchestrations',
        'Week 3: Redis caching for database speedups & session management',
        'Week 4: Automated CI/CD deployments & web performance tuning'
      ],
      topics: ['Docker', 'Docker Compose', 'Redis', 'Deployment', 'CI/CD'],
      keys: ['DEV_DOCKER', 'DEV_REDIS', 'DEV_DEPLOYMENT', 'DEV_AWS', 'CS_SYSTEM_DESIGN'],
      problems: [
        { title: 'Fullstack System Design Architecture', url: 'https://vercel.com/docs', difficulty: 'medium' }
      ],
      projectTitle: 'Dockerized Production Fullstack SaaS Product',
      projectDesc: 'Build and deploy a fullstack SaaS application with Docker Compose, Redis caching, and automated CI/CD pipeline.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain fullstack web application deployment pipeline', 'How to optimize web application initial load times?'],
      milestones: ['Containerize fullstack application with Docker', 'Deploy SaaS app to production cloud'],
      goal: 'Ship production-ready fullstack SaaS applications',
      outcome: 'Fullstack Developer placement ready',
      readinessImprovement: 15
    }
  ];

  const aiMlCurriculum: MockTemplate[] = [
    {
      title: 'Python for Data Science, Math & Statistics Foundations',
      why: 'AI/ML Engineers require strong Python fluency, linear algebra, calculus, probability, and numerical computing libraries.',
      objectives: ['Master Python data structures & OOP principles', 'Understand Linear Algebra (Vectors, Matrices, Eigenvalues)', 'Use NumPy & Pandas for high-speed numerical data manipulation'],
      weeklyPlan: [
        'Week 1: Advanced Python, data structures, list comprehensions, and generators',
        'Week 2: Linear Algebra for Machine Learning: Matrix multiplications, dot products, and transformations',
        'Week 3: Multivariable Calculus: Gradients, partial derivatives, and optimization principles',
        'Week 4: NumPy array operations & Pandas DataFrames wrangling'
      ],
      topics: ['Python', 'NumPy', 'Pandas', 'Linear Algebra', 'Calculus'],
      keys: ['DEV_JAVASCRIPT', 'APT_QUANT'],
      problems: [
        { title: 'Vector & Matrix Operations in Python', url: 'https://numpy.org/doc/stable/user/absolute_beginners.html', difficulty: 'easy' }
      ],
      projectTitle: 'Exploratory Data Analysis (EDA) Toolkit',
      projectDesc: 'Build a Python data analysis tool that cleans, transforms, and visualizes complex datasets with Pandas.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain Gradient Descent algorithm intuition', 'Difference between Matrix dot product and element-wise multiplication'],
      milestones: ['Complete Pandas data cleaning workflow', 'Build exploratory data analysis notebook'],
      goal: 'Manipulate large datasets and understand ML mathematical foundations',
      outcome: 'Strong Python & mathematical foundations for Machine Learning',
      readinessImprovement: 15
    },
    {
      title: 'Classical Machine Learning Algorithms & Scikit-Learn',
      why: 'Mastering supervised and unsupervised learning algorithms using Scikit-Learn is essential before moving to deep learning.',
      objectives: ['Implement Supervised Learning (Regression, Classification, Decision Trees)', 'Master Unsupervised Learning (K-Means, PCA dimensional reduction)', 'Evaluate model performance (Precision, Recall, ROC-AUC)'],
      weeklyPlan: [
        'Week 1: Linear & Logistic Regression math and Scikit-Learn implementations',
        'Week 2: Decision Trees, Random Forests, and Gradient Boosting (XGBoost)',
        'Week 3: K-Means Clustering and Principal Component Analysis (PCA)',
        'Week 4: Model evaluation metrics, cross-validation, and hyperparameter tuning'
      ],
      topics: ['Machine Learning', 'Scikit-Learn', 'Regression', 'Classification', 'Random Forest'],
      keys: ['APT_LOGICAL', 'APT_QUANT'],
      problems: [
        { title: 'Predict House Prices (Regression)', url: 'https://scikit-learn.org/stable/', difficulty: 'medium' }
      ],
      projectTitle: 'Customer Churn Prediction Engine',
      projectDesc: 'Build a complete ML model pipeline with feature engineering, Random Forest, and model validation metrics.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain Bias-Variance Tradeoff in ML models', 'Difference between Precision and Recall'],
      milestones: ['Train ML classification model with >85% accuracy', 'Evaluate model using ROC-AUC curves'],
      goal: 'Build and validate classical machine learning pipelines',
      outcome: 'Proficient in traditional ML modeling & feature engineering',
      readinessImprovement: 15
    },
    {
      title: 'Deep Learning Foundations, Neural Networks & PyTorch',
      why: 'AI Engineers must understand neural network architectures, backpropagation, and deep learning frameworks like PyTorch.',
      objectives: ['Understand Artificial Neural Networks (ANN) & backpropagation', 'Train deep learning models using PyTorch framework', 'Optimize neural networks with loss functions & Adam optimizer'],
      weeklyPlan: [
        'Week 1: Perceptrons, activation functions (ReLU, Sigmoid), and forward pass math',
        'Week 2: Backpropagation algorithm & PyTorch tensor autograd engine',
        'Week 3: Building multi-layer neural networks in PyTorch (nn.Module)',
        'Week 4: Overfitting prevention (Dropout, Batch Normalization) and training loops'
      ],
      topics: ['Deep Learning', 'PyTorch', 'Neural Networks', 'Backpropagation', 'Tensors'],
      keys: ['APT_QUANT', 'DEV_PYTHON'],
      problems: [
        { title: 'Train Image Classifier on MNIST with PyTorch', url: 'https://pytorch.org/tutorials/', difficulty: 'medium' }
      ],
      projectTitle: 'Digit & Image Classifier using PyTorch',
      projectDesc: 'Construct and train a deep neural network in PyTorch to classify handwritten digits with high precision.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain Backpropagation chain rule math', 'Why do we use ReLU over Sigmoid activation in deep networks?'],
      milestones: ['Implement PyTorch training loop from scratch', 'Achieve 98%+ accuracy on MNIST classifier'],
      goal: 'Design and train custom deep learning models in PyTorch',
      outcome: 'Fluent in deep learning principles & PyTorch coding',
      readinessImprovement: 15
    },
    {
      title: 'Computer Vision / NLP & Generative AI (LLMs)',
      why: 'Modern AI Engineering demands expertise in Natural Language Processing, Transformer architectures, and Large Language Models (LLMs).',
      objectives: ['Master Transformer architecture & Self-Attention mechanism', 'Fine-tune pre-trained models (Hugging Face Transformers)', 'Build GenAI RAG applications using LLMs & Vector Databases'],
      weeklyPlan: [
        'Week 1: Recurrent Neural Networks (RNNs) vs Transformer Attention mechanisms',
        'Week 2: Hugging Face library, BERT, and GPT model fine-tuning patterns',
        'Week 3: Vector Embeddings, Similarity Search, and Vector Databases (Pinecone/Chroma)',
        'Week 4: Building RAG (Retrieval-Augmented Generation) pipelines with LangChain'
      ],
      topics: ['Generative AI', 'LLMs', 'Transformers', 'Hugging Face', 'Vector DBs', 'RAG'],
      keys: ['CS_SYSTEM_DESIGN', 'DEV_PYTHON'],
      problems: [
        { title: 'Build RAG Pipeline with Vector Search', url: 'https://huggingface.co/docs', difficulty: 'hard' }
      ],
      projectTitle: 'AI Knowledge Assistant with RAG & Vector Search',
      projectDesc: 'Develop a Generative AI document assistant using OpenAI/Gemini APIs, LangChain, and Vector DB embedding search.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain Self-Attention mechanism in Transformers', 'What is Retrieval-Augmented Generation (RAG) and why is it useful?'],
      milestones: ['Fine-tune LLM / Transformer model', 'Deploy RAG GenAI app to production'],
      goal: 'Build cutting-edge Generative AI & LLM applications',
      outcome: 'AI / ML Engineer placement ready',
      readinessImprovement: 15
    }
  ];

  const dataScienceCurriculum: MockTemplate[] = [
    {
      title: 'Data Wrangling, Advanced SQL & Python Analytics',
      why: 'Data Scientists spend considerable time extracting, cleaning, and transforming raw data using SQL and Python.',
      objectives: ['Master complex SQL window functions & subqueries', 'Perform advanced data cleaning with Pandas', 'Understand statistical distributions & metrics'],
      weeklyPlan: [
        'Week 1: Advanced SQL window functions (RANK, DENSE_RANK, LEAD/LAG)',
        'Week 2: Pandas data cleaning, handling missing values, and data merges',
        'Week 3: Descriptive statistics: Mean, Median, Variance, Standard Deviation, IQRs',
        'Week 4: Data transformation pipelines and feature extraction'
      ],
      topics: ['SQL', 'Pandas', 'Python', 'Data Wrangling', 'Statistics'],
      keys: ['DEV_SQL', 'CS_DBMS'],
      problems: [
        { title: 'SQL Window Functions Practice', url: 'https://leetcode.com/problemset/database/', difficulty: 'medium' }
      ],
      projectTitle: 'Automated Data Cleaning & Reporting Pipeline',
      projectDesc: 'Write a Python script that ingests dirty CSV/SQL datasets, cleans anomalies, and generates summary stats.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain difference between DENSE_RANK and RANK in SQL', 'How to handle missing data (Imputation techniques)?'],
      milestones: ['Solve 15 advanced SQL query problems', 'Build data cleaning script'],
      goal: 'Clean and query large datasets using SQL and Python',
      outcome: 'Strong foundation in data manipulation and SQL querying',
      readinessImprovement: 15
    },
    {
      title: 'Exploratory Data Analysis (EDA) & Data Visualization',
      why: 'Communicating data insights requires visual analytics tools like Matplotlib, Seaborn, and interactive dashboards.',
      objectives: ['Create compelling data visualizations with Seaborn', 'Identify correlations, outliers, and trend patterns', 'Build executive dashboards (Tableau/PowerBI)'],
      weeklyPlan: [
        'Week 1: Data visualization principles, Matplotlib & Seaborn plots',
        'Week 2: Bivariate & Multivariate exploratory analysis techniques',
        'Week 3: Outlier detection algorithms & distribution normalization',
        'Week 4: Building interactive data dashboards in Tableau / Streamlit'
      ],
      topics: ['EDA', 'Data Visualization', 'Seaborn', 'Tableau', 'Streamlit'],
      keys: ['APT_QUANT', 'DEV_PYTHON'],
      problems: [
        { title: 'Create Interactive Data Dashboard', url: 'https://streamlit.io/', difficulty: 'medium' }
      ],
      projectTitle: 'Interactive Business Intelligence Dashboard',
      projectDesc: 'Build an interactive web dashboard using Streamlit & Plotly visualizing business sales trends and KPIs.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['When to use a box plot vs violin plot?', 'How do you detect and treat data outliers?'],
      milestones: ['Publish interactive EDA notebook', 'Deploy Streamlit dashboard app'],
      goal: 'Uncover actionable business insights from unstructured data',
      outcome: 'Proficient in visual data analytics and storytelling',
      readinessImprovement: 15
    },
    {
      title: 'Statistical Modeling, Probability & Hypothesis Testing',
      why: 'Data Science requires rigorous hypothesis testing, A/B experiment evaluation, and probability modeling.',
      objectives: ['Master Hypothesis Testing (t-test, ANOVA, Chi-Square)', 'Understand A/B Testing experiment design & p-values', 'Calculate sample sizes and confidence intervals'],
      weeklyPlan: [
        'Week 1: Probability distributions (Normal, Binomial, Poisson)',
        'Week 2: Hypothesis testing, Z-tests, T-tests, and p-value significance',
        'Week 3: A/B testing experiment design, sample size calculation, and confidence bounds',
        'Week 4: Bayesian statistics fundamentals and decision trees'
      ],
      topics: ['Statistics', 'Hypothesis Testing', 'A/B Testing', 'Probability', 'Bayesian'],
      keys: ['APT_QUANT', 'APT_LOGICAL'],
      problems: [
        { title: 'Analyze A/B Test Results Experiment', url: 'https://scikit-learn.org/stable/', difficulty: 'medium' }
      ],
      projectTitle: 'A/B Test Experimentation & Statistical Evaluation Suite',
      projectDesc: 'Analyze real-world web experiment data using hypothesis testing and statistical confidence bounds in Python.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Explain p-value and Type I vs Type II errors', 'How do you calculate sample size needed for an A/B test?'],
      milestones: ['Conduct hypothesis test evaluation', 'Publish A/B testing statistical report'],
      goal: 'Design experiments and make data-driven statistical decisions',
      outcome: 'Capable of statistical modeling and A/B test analysis',
      readinessImprovement: 15
    },
    {
      title: 'Applied Machine Learning & Predictive Modeling',
      why: 'Predictive analytics requires training, tuning, and evaluating supervised & unsupervised machine learning models.',
      objectives: ['Train regression and classification algorithms in Scikit-Learn', 'Perform hyperparameter tuning & cross-validation', 'Evaluate model metrics (ROC-AUC, Precision/Recall, F1-Score)'],
      weeklyPlan: [
        'Week 1: Linear & Logistic Regression, Decision Trees, and Random Forests',
        'Week 2: Gradient Boosting (XGBoost, LightGBM) & Ensemble techniques',
        'Week 3: Unsupervised clustering (K-Means, Hierarchical) & PCA dimensionality reduction',
        'Week 4: Hyperparameter optimization (GridSearchCV/Optuna) and model evaluation'
      ],
      topics: ['Machine Learning', 'Scikit-Learn', 'XGBoost', 'Clustering', 'Model Evaluation'],
      keys: ['DEV_PYTHON', 'APT_QUANT'],
      problems: [
        { title: 'Train Predictive ML Model in Python', url: 'https://scikit-learn.org/stable/', difficulty: 'medium' }
      ],
      projectTitle: 'Customer Churn & Price Prediction ML Pipeline',
      projectDesc: 'Build an end-to-end predictive machine learning model using XGBoost with cross-validation and feature importance analysis.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['Precision vs Recall: when to prioritize which metric?', 'How does Gradient Boosting differ from Random Forest?'],
      milestones: ['Achieve 85%+ ROC-AUC score on test set', 'Deploy Scikit-Learn model pipeline'],
      goal: 'Build accurate predictive machine learning models',
      outcome: 'Proficient in applied machine learning algorithms',
      readinessImprovement: 15
    },
    {
      title: 'Big Data Processing & Distributed Computing with PySpark',
      why: 'Enterprise Data Science handles multi-gigabyte/terabyte datasets requiring distributed frameworks like Apache Spark.',
      objectives: ['Process large-scale datasets using PySpark DataFrames', 'Build scalable ETL data pipelines in SQL & Python', 'Optimize Spark memory execution & partition strategies'],
      weeklyPlan: [
        'Week 1: Big Data architecture & PySpark DataFrame operations',
        'Week 2: Distributed data transformations, joins, and aggregations',
        'Week 3: PySpark MLlib for big data machine learning',
        'Week 4: Building scalable ETL pipelines in Python & SQL'
      ],
      topics: ['PySpark', 'Apache Spark', 'Big Data', 'Distributed Computing', 'ETL Pipelines'],
      keys: ['CS_SYSTEM_DESIGN', 'DEV_PYTHON', 'DEV_SQL'],
      problems: [
        { title: 'PySpark Big Data ETL Pipeline', url: 'https://spark.apache.org/docs/latest/api/python/', difficulty: 'medium' }
      ],
      projectTitle: 'Distributed Log & E-Commerce Big Data ETL Pipeline',
      projectDesc: 'Construct a PySpark pipeline processing multi-gigabyte server logs with automated aggregation and anomaly detection.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Spark RDD vs DataFrame memory execution', 'Explain Spark partition shuffling and how to optimize it'],
      milestones: ['Run PySpark pipeline on multi-node cluster mockup', 'Optimize Spark job execution speed by 40%'],
      goal: 'Scale data processing pipelines across distributed compute clusters',
      outcome: 'Capable of big data engineering and PySpark analytics',
      readinessImprovement: 15
    },
    {
      title: 'MLOps, Model Serving APIs, Capstone & Interview Preparation',
      why: 'Finalizing Data Science skills by serving models via REST APIs (FastAPI), monitoring model drift, and capstone presentation.',
      objectives: ['Deploy ML models as REST API microservices with FastAPI & Docker', 'Monitor model drift & performance metrics in production', 'Complete Data Science portfolio & technical interview prep'],
      weeklyPlan: [
        'Week 1: Model serialization (Joblib/ONNX) & FastAPI microservice creation',
        'Week 2: Docker containerization & cloud model deployment (AWS/GCP)',
        'Week 3: Model monitoring, data drift detection, and retraining triggers',
        'Week 4: Portfolio presentation, resume optimization, and mock technical interviews'
      ],
      topics: ['MLOps', 'FastAPI', 'Docker', 'Model Deployment', 'Portfolio'],
      keys: ['DEV_DEPLOYMENT', 'DEV_PYTHON', 'INT_RESUME'],
      problems: [
        { title: 'Deploy ML Model API with FastAPI', url: 'https://fastapi.tiangolo.com/', difficulty: 'medium' }
      ],
      projectTitle: 'Production Data Science Platform & FastAPI Deployment',
      projectDesc: 'Architect a complete Data Science platform: PySpark ETL, model training, FastAPI deployment, Streamlit UI, and Docker.',
      projectDifficulty: 'advanced',
      interviewPrep: ['How to monitor model drift in production?', 'Explain end-to-end Data Science project lifecycle'],
      milestones: ['Deploy live FastAPI ML prediction endpoint', 'Complete mock technical interview evaluation'],
      goal: 'Deploy Data Science models into cloud production',
      outcome: 'Data Scientist placement ready',
      readinessImprovement: 15
    }
  ];

  const mobileCurriculum: MockTemplate[] = [
    {
      title: 'Mobile UI Fundamentals, Layouts & Frameworks',
      why: 'Mobile Developers must master mobile design guidelines (iOS/Android), responsive component layouts, and cross-platform frameworks.',
      objectives: ['Learn mobile framework basics (React Native / Flutter / Swift)', 'Master mobile layouts, Flexbox, and touch components', 'Understand mobile app lifecycle & navigation routing'],
      weeklyPlan: [
        'Week 1: Mobile UI principles: iOS Human Interface & Android Material Design',
        'Week 2: Mobile layouts, viewports, touch controls, and styling',
        'Week 3: Mobile navigation: Stack, Tab, and Drawer navigators',
        'Week 4: Mobile form inputs, custom buttons, and list views (FlatList)'
      ],
      topics: ['Mobile UI', 'React Native', 'Flutter', 'Mobile Navigation', 'Material Design'],
      keys: ['DEV_REACT', 'DEV_JAVASCRIPT', 'DEV_HTML'],
      problems: [
        { title: 'Build Mobile ListView Component', url: 'https://reactnative.dev/docs/getting-started', difficulty: 'easy' }
      ],
      projectTitle: 'Cross-Platform Mobile Fitness App UI',
      projectDesc: 'Design and develop a multi-screen mobile app with tab navigation, custom workout cards, and responsive UI.',
      projectDifficulty: 'beginner',
      interviewPrep: ['Explain mobile app lifecycle states (Active, Inactive, Background)', 'React Native vs Native iOS/Android apps'],
      milestones: ['Run mobile app on iOS simulator / Android emulator', 'Complete 3-screen navigation flow'],
      goal: 'Build mobile application screens with smooth navigation',
      outcome: 'Solid foundation in mobile app development',
      readinessImprovement: 15
    },
    {
      title: 'Mobile State Management & API Integration',
      why: 'Mobile apps require asynchronous HTTP networking, local storage, and structured state management for smooth UX.',
      objectives: ['Integrate REST APIs using Axios / Fetch in mobile apps', 'Master mobile state management (Zustand/Redux)', 'Handle offline caching & local async storage'],
      weeklyPlan: [
        'Week 1: Asynchronous API data fetching & mobile loading/error states',
        'Week 2: Mobile state management with Zustand / Redux Toolkit',
        'Week 3: Async Storage / SQLite for local offline persistence',
        'Week 4: Image caching, performance tuning, and list re-render optimization'
      ],
      topics: ['Mobile State', 'AsyncStorage', 'REST APIs', 'Zustand', 'Performance'],
      keys: ['DEV_REACT', 'DEV_REST_APIS'],
      problems: [
        { title: 'Implement Mobile Infinite Scroll List', url: 'https://reactnative.dev/docs/flatlist', difficulty: 'medium' }
      ],
      projectTitle: 'Mobile Weather & News Application',
      projectDesc: 'Build a mobile app that fetches live weather & news data, saves favorite locations locally, and works offline.',
      projectDifficulty: 'intermediate',
      interviewPrep: ['How to optimize FlatList rendering performance in React Native?', 'AsyncStorage vs SQLite in mobile apps'],
      milestones: ['Connect mobile app to REST API', 'Implement offline data caching'],
      goal: 'Fetch and manage remote API data in mobile applications',
      outcome: 'Proficient in mobile networking and data persistence',
      readinessImprovement: 15
    },
    {
      title: 'Native Device Hardware APIs & Push Notifications',
      why: 'Mobile developers leverage hardware capabilities like camera, GPS location, push notifications, and biometrics.',
      objectives: ['Access device hardware (Camera, GPS Location, Gyroscope)', 'Implement Push Notifications (Firebase Cloud Messaging)', 'Add biometric authentication (FaceID / Fingerprint)'],
      weeklyPlan: [
        'Week 1: Requesting mobile runtime permissions (Camera, Location)',
        'Week 2: Accessing device hardware APIs (Camera capture, GPS mapping)',
        'Week 3: Setting up Firebase Cloud Messaging (FCM) push notifications',
        'Week 4: Biometric authentication (FaceID/TouchID) integration'
      ],
      topics: ['Device APIs', 'Camera API', 'GPS Mapping', 'Push Notifications', 'Firebase'],
      keys: ['DEV_AUTHENTICATION', 'DEV_REST_APIS'],
      problems: [
        { title: 'Integrate Mobile Map Location Marker', url: 'https://firebase.google.com/docs/cloud-messaging', difficulty: 'medium' }
      ],
      projectTitle: 'Location-based Mobile Photo Journal App',
      projectDesc: 'Create a mobile journal app that captures photos via camera, tags GPS location on a map, and triggers push alerts.',
      projectDifficulty: 'advanced',
      interviewPrep: ['How do Push Notifications work under the hood (APNs / FCM)?', 'Best practices for requesting mobile permissions'],
      milestones: ['Capture image via native camera API', 'Receive FCM push notification'],
      goal: 'Utilize native mobile device hardware in applications',
      outcome: 'Capable of building feature-rich native mobile applications',
      readinessImprovement: 15
    },
    {
      title: 'Mobile App Testing, Build Automation & App Store Publishing',
      why: 'Publishing mobile apps requires build signing, automated testing, CI/CD pipelines (Fastlane), and App Store submission.',
      objectives: ['Write unit & integration tests for mobile apps', 'Automate mobile builds using Fastlane & GitHub Actions', 'Publish mobile applications to Apple App Store & Google Play Store'],
      weeklyPlan: [
        'Week 1: Mobile unit testing with Jest & React Native Testing Library',
        'Week 2: Configuring Android keystores & Apple Developer provisioning profiles',
        'Week 3: Automating mobile builds & releases with Fastlane',
        'Week 4: App Store / Play Store guidelines, metadata, and submission'
      ],
      topics: ['Mobile Testing', 'Fastlane', 'App Store Publishing', 'Play Store', 'CI/CD'],
      keys: ['DEV_DEPLOYMENT', 'DEV_GIT'],
      problems: [
        { title: 'Automate Mobile App Build with Fastlane', url: 'https://fastlane.tools/', difficulty: 'medium' }
      ],
      projectTitle: 'Production Mobile App Release & CI/CD Pipeline',
      projectDesc: 'Prepare a production mobile app build signed with release certificates and automated Fastlane deployment pipeline.',
      projectDifficulty: 'advanced',
      interviewPrep: ['Explain App Store provisioning profiles & signing certificates', 'How to handle app store rejection troubleshooting?'],
      milestones: ['Generate release APK / IPA build bundle', 'Set up automated Fastlane deployment'],
      goal: 'Publish production mobile apps to App Store & Play Store',
      outcome: 'Mobile App Developer placement ready',
      readinessImprovement: 15
    }
  ];

  // Pick curriculum list based on specific target career role
  const preferred = (profile.preferredCareer || '').toLowerCase();

  // Dynamic Master Topic Engine for Software Engineer (SDE)
  if (preferred.includes('software engineer') || preferred.includes('sde') || (!preferred.includes('devops') && !preferred.includes('frontend') && !preferred.includes('backend') && !preferred.includes('fullstack') && !preferred.includes('ai') && !preferred.includes('data') && !preferred.includes('mobile'))) {
    logStage('MOCK-SELECTION', `Selected Dynamic Master Topic Engine for ${profile.preferredCareer || 'Software Engineer (SDE)'}`);
    const monthBlocks = groupTopicsIntoTimeline(sdeMasterTopics, totalMonths);
    const topicsWithResources = await attachCuratedResourcesFromDB(
      monthBlocks,
      profile.preferredCareer || 'Software Engineer (SDE)',
      profile.preferredDsaLanguage || profile.preferredProgrammingLanguage || 'Java'
    );

    return {
      title: `Personalized ${profile.preferredCareer || 'Software Engineer (SDE)'} Career Path for ${profile.name}`,
      description: `A custom-fit ${totalMonths}-month career preparation path targeting ${profile.targetCompanyType || 'Product-Based'} recruitment.`,
      version: '2.0.0',
      source: 'fallback',
      topics: topicsWithResources,
      summary: {
        currentPlacementReadiness: Math.min(60, profile.resumeScore || 30),
        estimatedFinalReadiness: 90,
        biggestStrengths: profile.skills.length > 0 ? profile.skills : ['Programming Core'],
        biggestWeaknesses: profile.weakSubjects.length > 0 ? profile.weakSubjects : ['Advanced DSA', 'System Design'],
        topThreePriorities: ['Data Structures & Algorithms', 'Full-Stack Projects', 'Theory Fundamentals'],
        estimatedCompletionDate: `${totalMonths} Months`,
      },
    };
  }

  let templatePool = sdeProductCurriculum;

  if (preferred.includes('devops')) {
    logStage('MOCK-SELECTION', 'Selected DevOps Engineer fallback curriculum template pool');
    templatePool = devopsCurriculum;
  } else if (preferred.includes('frontend')) {
    logStage('MOCK-SELECTION', 'Selected Frontend Engineer fallback curriculum template pool');
    templatePool = frontendCurriculum;
  } else if (preferred.includes('backend')) {
    logStage('MOCK-SELECTION', 'Selected Backend Engineer fallback curriculum template pool');
    templatePool = backendCurriculum;
  } else if (preferred.includes('fullstack') || preferred.includes('full stack') || preferred.includes('web')) {
    logStage('MOCK-SELECTION', 'Selected Fullstack Developer fallback curriculum template pool');
    templatePool = fullstackCurriculum;
  } else if (preferred.includes('ai') || preferred.includes('machine learning') || preferred.includes('ml')) {
    logStage('MOCK-SELECTION', 'Selected AI/ML Engineer fallback curriculum template pool');
    templatePool = aiMlCurriculum;
  } else if (preferred.includes('data science') || preferred.includes('data scientist') || preferred.includes('analyst')) {
    logStage('MOCK-SELECTION', 'Selected Data Scientist fallback curriculum template pool');
    templatePool = dataScienceCurriculum;
  } else if (preferred.includes('mobile') || preferred.includes('android') || preferred.includes('ios') || preferred.includes('flutter')) {
    logStage('MOCK-SELECTION', 'Selected Mobile App Developer fallback curriculum template pool');
    templatePool = mobileCurriculum;
  } else if (!isProduct) {
    logStage('MOCK-SELECTION', 'Selected Service-Based SDE fallback curriculum template pool');
    templatePool = sdeServiceCurriculum;
  } else {
    logStage('MOCK-SELECTION', 'Selected Product-Based SDE fallback curriculum template pool');
  }
  
  let filteredTemplates = [...templatePool];
  if (profile.dsaLevel === 'Advanced' && isProduct && templatePool === sdeProductCurriculum) {
    filteredTemplates = filteredTemplates.filter(t => !t.title.includes('Foundations'));
  }

  // Adjust number of topics to match totalMonths dynamically without duplication
  let selectedTemplates: MockTemplate[] = [];
  if (newTopicCount <= filteredTemplates.length) {
    selectedTemplates = filteredTemplates.slice(0, newTopicCount);
  } else {
    selectedTemplates = [...filteredTemplates];
    // Fill extra months with distinct advanced specialization topics rather than repeating earlier months
    for (let extraIdx = filteredTemplates.length; extraIdx < newTopicCount; extraIdx++) {
      const monthNum = skipCount + extraIdx + 1;
      const phaseNum = extraIdx - filteredTemplates.length + 1;
      selectedTemplates.push({
        title: `Advanced ${profile.preferredCareer || 'Engineering'} System Specialization & Capstone (Phase ${phaseNum})`,
        why: `Advanced practical specialization focused on real-world industry depth, architecture trade-offs, and enterprise scaling for Month ${monthNum}.`,
        objectives: [
          `Build real-world production-grade system features for Month ${monthNum}`,
          'Conduct comprehensive performance benchmarking & security auditing',
          'Prepare for senior-level technical interview rounds'
        ],
        weeklyPlan: [
          `Week 1: Month ${monthNum} System architecture & design specification`,
          `Week 2: Core feature implementation & unit test coverage`,
          `Week 3: Performance profiling, load testing & optimization`,
          `Week 4: Capstone demonstration, technical documentation & interview review`
        ],
        topics: ['System Design', 'Architecture', 'Interview Prep', 'Performance'],
        keys: ['CS_SYSTEM_DESIGN', 'INT_MOCK_INTERVIEW'],
        problems: [
          { title: 'System Design & Architecture Practice', url: 'https://leetcode.com/discuss/interview-question/system-design/', difficulty: 'hard' }
        ],
        projectTitle: `Production Capstone Project Phase ${phaseNum}`,
        projectDesc: `Architect and publish a production-ready capstone project demonstrating end-to-end industry mastery.`,
        projectDifficulty: 'advanced',
        interviewPrep: ['Explain high-level system trade-offs and scaling strategies', 'How do you structure production monitoring & alerts?'],
        milestones: [`Complete Month ${monthNum} capstone release`, 'Score 90%+ in mock interview evaluation'],
        goal: `Master advanced industry topics and achieve high placement readiness`,
        outcome: `Senior level preparation for ${profile.preferredCareer || 'Engineering'} roles`,
        readinessImprovement: 15
      });
    }
  }

  // Assign progress baselines
  let currentReadiness = 15;
  if (profile.dsaLevel === 'Intermediate') currentReadiness = 30;
  if (profile.dsaLevel === 'Advanced') currentReadiness = 50;
  const improvementPerMonth = Math.round((90 - currentReadiness) / totalMonths);

  const topics = selectedTemplates.map((topic, i) => {
    const monthNum = skipCount + i + 1;
    const gain = topic.readinessImprovement || improvementPerMonth;
    const finalReadiness = Math.min(currentReadiness + (i + 1) * gain, 95);

    // Build subdocument structures
    const practiceProblems = topic.problems.map((prob, idx) => ({
      id: `prob-${monthNum}-${idx + 1}`,
      title: prob.title,
      url: prob.url,
      difficulty: prob.difficulty,
      isCompleted: false
    }));

    const project = {
      title: topic.projectTitle,
      description: topic.projectDesc,
      technologies: topic.projectDesc.includes('Java') ? ['Java'] : (topic.projectDesc.includes('Python') ? ['Python'] : ['C++']),
      difficulty: normalizeDifficulty(topic.projectDifficulty),
      githubSubmission: '',
      liveDemoSubmission: '',
      isCompleted: false
    };

    const whyText = `📌 WHY THIS MONTH: ${topic.why}
    
⏱️ ESTIMATED STUDY HOURS: ${Math.min(topic.estimatedHours || 60, monthlyHours)} hours this month

📊 DIFFICULTY: ${monthNum === 1 ? 'Beginner' : (monthNum <= 3 ? 'Intermediate' : 'Advanced')}

🛠️ MINI PROJECT: ${topic.projectTitle} - ${topic.projectDesc}

🎯 INTERVIEW PREPARATION:
${topic.interviewPrep.map(p => `  • ${p}`).join('\n')}

✅ MONTHLY MILESTONE: ${topic.milestones.join(', ')}

📈 EXPECTED OUTCOME: ${topic.outcome}

🚀 PLACEMENT READINESS IMPROVEMENT: +${gain}%`;

    return {
      id: `topic-${monthNum}`,
      title: `Month ${monthNum}: ${topic.title}`,
      description: whyText,
      whyThisMonth: topic.why,
      learningObjectives: topic.objectives,
      weeklyStudyPlan: topic.weeklyPlan,
      estimatedStudyHours: Math.min(topic.estimatedHours || 60, monthlyHours),
      topics: topic.topics,
      curriculumKeys: topic.keys,
      practiceProblems,
      project,
      interviewPrep: topic.interviewPrep,
      weeklyMilestones: topic.milestones,
      monthlyGoal: topic.goal,
      expectedOutcome: topic.outcome,
      placementReadinessImprovement: gain,
      isCompleted: false
    };
  });

  // Attach resources from MongoDB LearningResource collection
  const topicsWithResources = await attachCuratedResourcesFromDB(
    topics,
    profile.preferredCareer || 'Software Engineer (SDE)',
    dsaLang
  );

  const summary = {
    currentPlacementReadiness: currentReadiness,
    estimatedFinalReadiness: Math.min(currentReadiness + improvementPerMonth * totalMonths, 95),
    biggestStrengths: profile.skills.length > 0 ? profile.skills.slice(0, 2) : ['OOP Foundations'],
    biggestWeaknesses: profile.weakSubjects.length > 0 ? profile.weakSubjects.slice(0, 2) : ['Dynamic Programming'],
    topThreePriorities: selectedTemplates.slice(0, 3).map(t => t.title),
    estimatedCompletionDate: calculateCompletionDate(timeline)
  };

  const careerRole = profile.preferredCareer || 'Software Engineer';
  const langText = profile.programmingLanguages?.length > 0 ? profile.programmingLanguages.join(', ') : (profile.preferredProgrammingLanguage || 'Java');

  return {
    title: `Personalized ${careerRole} Career Path for ${profile.name}`,
    description: `A ${careerRole} preparation path targeting ${profile.targetCompanyType || 'Product-Based'} companies, custom-fit for your ${timeline} timeline, utilizing ${langText}.`,
    version: '2.0.0',
    source: 'fallback',
    topics: topicsWithResources,
    summary
  };
}

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

  if (career.includes('java')) {
    // ─── Java Developer Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Core Java Foundations & Git',
      why: `Your career goal is ${profile.preferredCareer || 'Java Developer'}. Mastering core Java OOP design principles and version control is the essential starting point for backend engineering.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a Console-based Student Management System supporting CRUD operations on user lists, and push it to GitHub.',
      interviewPrep: ['JVM vs. JDK vs. JRE and compilation/execution lifecycle', 'Four pillars of Object-Oriented Programming (encapsulation, inheritance, polymorphism, abstraction)', 'Exception handling using try/catch/finally and custom exceptions'],
      milestone: 'Construct a terminal program in clean OOP Java and manage its revisions in GitHub.',
      expectedOutcome: 'Confident with Java OOP syntax, basic collection lists, and core Git commands.',
      resources: [
        { id: rid(), title: 'Telusko - Core Java Course', url: 'https://www.youtube.com/@Telusko', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Kunal Kushwaha - Java & Git Basics', url: 'https://www.youtube.com/results?search_query=Kunal+Kushwaha+Java', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Intermediate Java & DSA Foundations',
      why: `Intermediate features like Java Streams and Concurrency/Multithreading are required to build efficient backend APIs. Fundamental DSA is tested in interviews.`,
      estimatedHours: Math.min(45, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Create a multithreaded file processor or a Streams-based CSV parser, and solve 100 easy/medium DSA problems.',
      interviewPrep: ['Java Streams API operations (filter, map, reduce) and Lambdas', 'Creating threads, Runnable interfaces, and the ExecutorService', 'Basic search (Binary Search) and sort (Merge/Quick Sort) complexities'],
      milestone: 'Complete 100 coding problems on LeetCode/HackerRank using Java Collections.',
      expectedOutcome: 'Capable of writing functional-style Java code and solving standard data structure questions.',
      resources: [
        { id: rid(), title: 'Take U Forward - A2Z DSA Course', url: 'https://www.youtube.com/results?search_query=Take+U+Forward+DSA', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Abdul Bari - Algorithm Design', url: 'https://www.youtube.com/results?search_query=Abdul+Bari+Algorithms', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Databases, Spring Core & Spring Boot Basics',
      why: `Java backends heavily rely on relational databases and the Spring Boot ecosystem. This month connects your application to SQL.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Build a REST API bookstore service connected to MySQL/PostgreSQL using Spring Data JPA, tested in Postman.',
      interviewPrep: ['SQL Join statements, subqueries, group by, and indexing', 'Spring IoC Container and Dependency Injection concepts', 'Mapping entity associations (@OneToMany, @ManyToMany) in Hibernate'],
      milestone: 'Deliver a functional CRUD REST API connected to a SQL database with Spring Boot.',
      expectedOutcome: 'Understand how Spring Boot wires components together and how to structure REST API controllers and repositories.',
      resources: [
        { id: rid(), title: 'Java Brains - Spring Boot Internals', url: 'https://www.youtube.com/@JavaBrains', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'Amigoscode - Spring REST APIs', url: 'https://www.youtube.com/results?search_query=Amigoscode+Spring+Boot', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Advanced Spring Boot, Microservices & Docker',
      why: `Modern enterprise Java development expects you to secure your APIs, write tests, containerize your app, and understand service communication.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Add JWT security and Mockito unit tests to your Bookstore API, write a Dockerfile, and launch database + app via Docker Compose.',
      interviewPrep: ['Exception Handling (@ControllerAdvice) and validation (@Valid)', 'Writing unit tests using JUnit 5 and Mockito framework mocks', 'Microservices service discovery (Eureka) and Dockerfile syntax'],
      milestone: 'Launch a secured, tested Spring Boot microservice environment using Docker Compose.',
      expectedOutcome: 'Fluent in testing services/controllers and containerizing JVM architectures for cloud deployments.',
      resources: [
        { id: rid(), title: 'Java Techie - Spring Security & JWT', url: 'https://www.youtube.com/results?search_query=Java+Techie', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'TechWorld with Nana - Docker Tutorials', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Advanced DSA, System Design & Capstone Project',
      why: `Polishing a capstone microservice project and reviewing advanced system design concepts makes you ready for technical backend interviews.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Build an E-Commerce microservice backend with products, cart, order management, mock payments, and JWT login.',
      interviewPrep: ['Advanced DSA: Binary Trees, graphs (BFS/DFS), and Dynamic Programming', 'System Design: load balancing, caching (Redis), sharding, SQL vs NoSQL', 'Explaining microservice architectures using the STAR framework'],
      milestone: 'Polish and host a capstone backend project on GitHub with decent unit test coverage and clean documentation.',
      expectedOutcome: 'Interview-ready for Java backend developer roles with a polished public portfolio.',
      resources: [
        { id: rid(), title: 'Gaurav Sen - System Design Basics', url: 'https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design', type: 'video', difficulty: 'advanced' },
        { id: rid(), title: 'ByteByteGo - Architecture Walkthroughs', url: 'https://www.youtube.com/@ByteByteGo', type: 'video', difficulty: 'advanced' }
      ]
    });
  } else if (career.includes('cyber') || career.includes('security')) {
    // ─── Cybersecurity Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Computer & Networking Fundamentals',
      why: `Your career goal is ${profile.preferredCareer || 'Cybersecurity'}. Understanding computer architecture, the OSI/TCP models, and basic networking protocols is essential before learning security.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Install VirtualBox, stand up your first Ubuntu Linux VM, capture your network traffic in Wireshark, and identify a DNS lookup and an HTTP request.',
      interviewPrep: ['OSI 7-layer vs. TCP/IP model layers and purposes', 'IP addressing basics, DHCP, and DNS resolution', 'Core protocols and their default ports (HTTP, SSH, FTP, RDP, SMTP)'],
      milestone: 'Set up VirtualBox with an Ubuntu Linux VM and capture and analyze network packets in Wireshark.',
      expectedOutcome: 'Comfortable with basic networking, VM setup, and packet capture concepts.',
      resources: [
        { id: rid(), title: 'NetworkChuck - Free CCNA Course', url: 'https://www.youtube.com/@NetworkChuck', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Professor Messer - Network+ Course', url: 'https://www.youtube.com/results?search_query=Professor+Messer+Network%2B', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Linux, Security Concepts & Scripting Basics',
      why: `Security tools and environments run primarily on Linux. Additionally, basic scripting enables automation of minor tasks.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Complete the TryHackMe Pre Security learning path and write a Python script that maps port numbers to service names.',
      interviewPrep: ['Linux file permissions (chmod, chown) and basic CLI commands', 'The CIA Triad and AAA frameworks', 'Malware, social engineering, phishing, and DDoS definitions'],
      milestone: 'Complete Pre Security path rooms and write a functional Python port mapper script.',
      expectedOutcome: 'Comfortable in the Linux CLI, familiar with core security vocabulary, and able to write simple Python scripts.',
      resources: [
        { id: rid(), title: 'NetworkChuck - Linux for Hackers', url: 'https://www.youtube.com/results?search_query=NetworkChuck+Linux+for+Hackers', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'freeCodeCamp - Python Crash Course', url: 'https://www.youtube.com/results?search_query=freeCodeCamp+Python+tutorial', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Security+ Core Concepts & Active Tools',
      why: `Preparing for the CompTIA Security+ (SY0-701) exam requires understanding architecture, threats, and active tools like Nmap.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Perform Nmap scans against your own local VM lab, identify open ports/services, and analyze the traffic captures in Wireshark.',
      interviewPrep: ['Firewalls, IDS/IPS, VPNs, zero trust architecture, and cloud security basics', 'Nmap scan types (-sS, -sT, -sV) and service discovery', 'Threats, vulnerabilities, and mitigations in depth (Security+ Domain 2)'],
      milestone: 'Complete Security+ Domains 2-3 lessons and run nmap audits on your local network.',
      expectedOutcome: 'Capable of using scanning tools to map network topology and identify vulnerabilities.',
      resources: [
        { id: rid(), title: 'Professor Messer - Security+ SY0-701 Course', url: 'https://www.youtube.com/results?search_query=Professor+Messer+Security%2B', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'HackerSploit - Nmap Tutorials', url: 'https://www.youtube.com/results?search_query=HackerSploit+Nmap', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Security Operations & Blue Team Basics',
      why: `Security Operations (Security+ Domain 4) accounts for the largest chunk of the exam. Learning SIEM log analysis is vital for SOC analyst roles.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Set up Splunk Free or Security Onion locally, import a sample web server log, and write search queries to parse traffic.',
      interviewPrep: ['Incident response steps (preparation, detection, containment, eradication, recovery)', 'Centralized logging benefits and log parsing/SIEM basics', 'Windows security logs, Event Viewer, and endpoint hardening'],
      milestone: 'Complete TryHackMe SOC Level 1 introductory rooms and successfully query SIEM dashboards.',
      expectedOutcome: 'Understand incident response pipelines and capable of analyzing log files to trace attacks.',
      resources: [
        { id: rid(), title: '13Cubed - Log Analysis & Forensics', url: 'https://www.youtube.com/@13cubed', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'Simply Cyber - SOC Analyst Insights', url: 'https://www.youtube.com/@SimplyCyber', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Governance, GRC, Consolidation & Portfolio',
      why: `Governance, Risk, and Compliance (GRC) policies and practice exams prepare you for the Security+ certification and professional job applications.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Document 3 lab writeups in markdown and host them as a public portfolio repository on GitHub.',
      interviewPrep: ['Governance policies, standard security frameworks (NIST, ISO 27001)', 'Risk management concepts and vocabulary (ALE, SLE, ARO)', 'Explaining technical security findings to non-technical business stakeholders'],
      milestone: 'Score 85%+ on full-length Security+ practice exams and compile notes into a GitHub portfolio.',
      expectedOutcome: 'Exam-ready for Security+ and equipped with a public portfolio demonstrating hands-on labs.',
      resources: [
        { id: rid(), title: 'Professor Messer - Security+ Practice Tests', url: 'https://www.youtube.com/results?search_query=Professor+Messer+Security%2B+SY0-701', type: 'video', difficulty: 'advanced' },
        { id: rid(), title: 'Simply Cyber / Outpost Gray - Portfolio Guide', url: 'https://www.youtube.com/results?search_query=Simply+Cyber+or+Outpost+Gray', type: 'video', difficulty: 'advanced' }
      ]
    });
  } else if (career.includes('data') || career.includes('analyst')) {
    // ─── Data Analyst Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Excel & Data Foundations',
      why: `Your career goal is ${profile.preferredCareer || 'Data Analyst'}. Excel/Google Sheets proficiency is a fundamental requirement for cleaning and organizing business datasets.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Clean a messy sales/expenses dataset and build an interactive summary dashboard with pivot tables.',
      interviewPrep: ['VLOOKUP/XLOOKUP and INDEX-MATCH syntax', 'Logical formulas (IF, SUMIFS, COUNTIFS)', 'Data deduplication and conditional formatting rules'],
      milestone: 'Clean one messy dataset and build a multi-page Excel report with interactive slicers.',
      expectedOutcome: 'Comfortable cleaning messy business spreadsheets and summarizing key numbers with pivot tables.',
      resources: [
        { id: rid(), title: 'Chandoo - Excel for Beginners', url: 'https://chandoo.org/', type: 'article', difficulty: 'beginner' },
        { id: rid(), title: 'ExcelIsFun - Basics Playlist', url: 'https://www.youtube.com/user/ExcelIsFun', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'SQL Basics & Database Querying',
      why: `SQL is the single most important skill for a Data Analyst to extract insights from raw databases. This month gets you comfortable writing queries.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Set up MySQL or PostgreSQL locally, load a public dataset, and write analytical queries.',
      interviewPrep: ['SELECT, WHERE, GROUP BY, HAVING, ORDER BY clauses', 'Joins (INNER, LEFT, RIGHT, FULL)', 'Aggregation functions (COUNT, SUM, AVG)'],
      milestone: 'Solve 30-40 SQL practice problems on HackerRank or LeetCode.',
      expectedOutcome: 'Confident writing basic to intermediate SQL queries with joins and aggregations.',
      resources: [
        { id: rid(), title: 'SQLZoo Interactive Tutorial', url: 'https://sqlzoo.net/', type: 'article', difficulty: 'beginner' },
        { id: rid(), title: 'techTFQ - SQL Playlist', url: 'https://www.youtube.com/c/techTFQ', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Advanced SQL & Python Fundamentals',
      why: `Real interview questions test advanced SQL features like window functions and subqueries. In addition, python basics are introduced for advanced analytics.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Create a 10+ query SQL portfolio script answering complex business questions, and save it on GitHub.',
      interviewPrep: ['Subqueries and CTEs (WITH clauses)', 'Window functions (ROW_NUMBER, RANK, LAG/LEAD)', 'Python loops, functions, and list/dict comprehensions'],
      milestone: 'Write a complete SQL case study querying a complex dataset (e.g., Olympic or e-commerce data).',
      expectedOutcome: 'Able to optimize queries, use CTEs, and write simple Python data extraction scripts.',
      resources: [
        { id: rid(), title: 'Mode Analytics SQL Tutorial', url: 'https://mode.com/sql-tutorial/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'Kaggle Python Course', url: 'https://www.kaggle.com/learn/python', type: 'article', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Python for Analysis (pandas & NumPy)',
      why: `pandas and NumPy form the core Python data analysis stack. Exploratory Data Analysis (EDA) is how you find trends and clean data programmatically.`,
      estimatedHours: Math.min(70, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Perform a full exploratory data analysis (EDA) in Jupyter Notebook on a raw, messy dataset from Kaggle.',
      interviewPrep: ['pandas GroupBy, merge, concat, and pivot tables', 'Handling missing data, duplicates, and type casting', 'Visualization with Matplotlib & Seaborn'],
      milestone: 'Deploy a clean, well-commented EDA notebook to GitHub showing insights and charts.',
      expectedOutcome: 'Can load, clean, analyze, and visualize any tabular dataset using Python.',
      resources: [
        { id: rid(), title: 'pandas Official Documentation', url: 'https://pandas.pydata.org/docs/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'Keith Galli - pandas Tutorial', url: 'https://youtu.be/vmEHCJof1kU', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Business Intelligence & Visual Dashboards',
      why: `Business stakeholders interact with dashboards, not code. Power BI or Tableau is crucial to communicate data-driven insights.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Design and build an interactive Power BI or Tableau dashboard (e.g., retail sales or marketing funnel).',
      interviewPrep: ['Data modeling, relations, and star schema', 'DAX calculated columns vs measures', 'KPI selection and storytelling with data'],
      milestone: 'Build an interactive dashboard with slicers and publish it to Tableau Public or save as a Power BI report.',
      expectedOutcome: 'Able to connect multiple databases and design clear, interactive dashboard layouts.',
      resources: [
        { id: rid(), title: 'Guy in a Cube - Power BI Basics', url: 'https://guyinacube.com/', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Tableau Training Videos', url: 'https://www.tableau.com/learn/training/20202', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Statistics, A/B Testing & Portfolio Showcase',
      why: `Understanding hypothesis testing, p-values, and A/B testing is required for product analyst roles. This month wraps up with resume/portfolio prep.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Build your final Capstone Project (SQL query -> Python cleaning -> Power BI visual -> stakeholder writeup).',
      interviewPrep: ['Hypothesis testing, p-values, and confidence intervals', 'A/B testing design and sample size calculation', 'Explaining a technical finding to non-technical stakeholders using the STAR method'],
      milestone: 'Quantify achievements on your resume, publish 3-4 projects on GitHub/LinkedIn, and apply to job simulation platforms.',
      expectedOutcome: 'Interview-ready with a solid statistics foundation and a polished, multi-project data analyst portfolio.',
      resources: [
        { id: rid(), title: 'StatQuest - Statistics Fundamentals', url: 'https://statquest.org/', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'Alex The Analyst - Portfolio & Resume Guide', url: 'https://www.youtube.com/@AlexTheAnalyst', type: 'video', difficulty: 'intermediate' }
      ]
    });
  } else if (career.includes('devops') || career.includes('platform') || career.includes('ops')) {
    // ─── DevOps / Platform Engineer Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Linux, Networking, Git & Scripting Foundations',
      why: `Your career goal is ${profile.preferredCareer || 'DevOps / Platform Engineer'}. Terminal comfort, basic networking, Git version control, and scripting automation form the core base of all DevOps systems.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a Bash & Python automation toolkit to monitor disk space usage, rotate/clean logs, and trigger Slack webhook alerts.',
      interviewPrep: ['Linux file permissions (chmod, chown), process management (top, systemd)', 'SSH keys, ssh-agent, and SSH config files', 'Networking: TCP/IP stack, DNS lookup, HTTP vs HTTPS, and basic routing'],
      milestone: 'Construct a shell script toolkit and manage its revisions in GitHub.',
      expectedOutcome: 'Comfortable operating from a CLI, writing basic automation scripts, and executing Git team workflows.',
      resources: [
        { id: rid(), title: 'NetworkChuck - Linux for Beginners', url: 'https://www.youtube.com/@NetworkChuck', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'freeCodeCamp.org - Git & GitHub Course', url: 'https://www.youtube.com/@freecodecamp', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Cloud Fundamentals (AWS) & Docker Containerization',
      why: `AWS cloud infrastructure and Docker containerization are mandatory requirements for hosting and scaling modern applications.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Containerize a REST API using a multi-stage Dockerfile, push to Docker Hub/ECR, and deploy manually to an AWS EC2 instance behind an ALB.',
      interviewPrep: ['AWS IAM policies and role configurations', 'AWS VPC topology (public/private subnets, security groups, route tables)', 'Docker image optimization and multi-stage builds vs. single stage'],
      milestone: 'Manually run a containerized API in the AWS cloud with public load balancer routing.',
      expectedOutcome: 'Able to build secure Docker images, write docker-compose files, and deploy AWS servers with load balancing.',
      resources: [
        { id: rid(), title: 'TechWorld with Nana - Docker Crash Course', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'DevOps Directive - AWS Cloud Deployments', url: 'https://www.youtube.com/@DevOpsDirective', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'CI/CD Pipelines, Terraform Infrastructure as Code (IaC) & Configuration Management',
      why: `Automating the deployment pipeline and provisioning infrastructure dynamically as code is the core defining practice of DevOps teams.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Build a GitHub Actions pipeline that triggers on push: runs tests, compiles Docker images, provisions EC2/VPC infra with Terraform, and configures the host using Ansible.',
      interviewPrep: ['CI/CD deployment patterns (blue-green, rolling, canary)', 'Terraform state management, lock files, and backend configuration', 'Ansible playbooks, inventories, and idempotency concepts'],
      milestone: 'A fully automated pipeline from git push to cloud application provisioning and config.',
      expectedOutcome: 'Able to write GitHub Actions pipelines, configure Ansible scripts, and deploy AWS infra dynamically via Terraform.',
      resources: [
        { id: rid(), title: 'TechWorld with Nana - Terraform for Beginners', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Jeff Geerling - Ansible Playlists', url: 'https://www.youtube.com/@JeffGeerling', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Kubernetes Orchestration, GitOps Continuous Delivery & Observability',
      why: `Kubernetes has become the industry standard container orchestrator. GitOps and Grafana/Prometheus logging/monitoring are required to maintain cluster health at scale.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Deploy a multi-service app to local Kubernetes or EKS via ArgoCD and Helm. Add Prometheus and Grafana metrics dashboard monitoring.',
      interviewPrep: ['Kubernetes architecture: control plane, kubelet, Kube-API-server, etcd', 'K8s core resources: Pods, Deployments, Services, ConfigMaps, Secrets, Ingress', 'GitOps declarative loops and Helm template values override'],
      milestone: 'Deploy a Helm-packaged app to Kubernetes using ArgoCD Git-sync alongside active Grafana dashboards.',
      expectedOutcome: 'Capable of creating Helm charts, operating kubectl queries, configuring GitOps sync loops, and querying Prometheus metrics.',
      resources: [
        { id: rid(), title: 'TechWorld with Nana - Kubernetes Playlist', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Abhishek Veeramalla - GitOps & ArgoCD Masterclass', url: 'https://www.youtube.com/results?search_query=Abhishek+Veeramalla+ArgoCD', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Platform Engineering (Backstage), DevSecOps Guardrails & Job Simulation',
      why: `Platform Engineering focuses on developer self-service golden paths (Backstage catalogs) to reduce developer cognitive load, backed by secure image scanning and policy pipelines.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Stand up Backstage with a software catalog, create a template to auto-scaffold dockerized services, run Trivy image vulnerability checks, and enforce OPA gatekeeper policies.',
      interviewPrep: ['Internal Developer Platform (IDP) and developer self-service golden paths', 'DORA metrics: deployment frequency, lead time, MTTR, change failure rate', 'Policy-as-code (OPA) and secret store management (HashiCorp Vault)'],
      milestone: 'Complete your final IDP Capstone, quantify achievements on your resume, and conduct mock system design sessions.',
      expectedOutcome: 'Polished portfolio displaying platform catalogs, security filters, and Kubernetes-native infrastructure automation.',
      resources: [
        { id: rid(), title: 'DevOps Toolkit - Backstage & Platform Engineering', url: 'https://www.youtube.com/@DevOpsToolkit', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'KodeKloud - Vault, Trivy & Security', url: 'https://www.youtube.com/@KodeKloud', type: 'video', difficulty: 'intermediate' }
      ]
    });
  } else if (career.includes('flutter') || career.includes('mobile')) {
    // ─── Flutter Mobile Developer Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Programming Fundamentals & Dart Basics',
      why: `Your career goal is ${profile.preferredCareer || 'Mobile App Developer'}. Mastering Dart syntax, object-oriented concepts, and null safety forms the solid baseline for Flutter apps.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a console-based CLI To-Do List or interactive Calculator using OOP classes and collections, and push to GitHub.',
      interviewPrep: ['Dart null safety constraints and null-aware operators', 'Classes, constructors, and inheritance inheritance loops in Dart', 'List, Map, and Set operations'],
      milestone: 'Construct a terminal Dart application and manage its revisions in GitHub.',
      expectedOutcome: 'Comfortable with Dart OOP logic, lists, maps, and null safety concepts.',
      resources: [
        { id: rid(), title: 'freeCodeCamp.org - Dart Crash Course', url: 'https://www.youtube.com/@freecodecamp', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Flutter Devs - Hello Dart Tutorial', url: 'https://dart.dev/', type: 'article', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Flutter Fundamentals: Widgets & Layout Systems',
      why: `Flutter SDK layout builders and StatelessWidget vs. StatefulWidget distinctions are the foundation of mobile UI development.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a multi-screen task list UI containing form input fields to add items, using list navigation, without database storage.',
      interviewPrep: ['StatelessWidget vs. StatefulWidget lifecycles and rebuilds', 'Constraints go down, sizes go up, parent sets position rule', 'Navigator route pushes and screen data passing'],
      milestone: 'Run a multi-screen widget app on an Android emulator or physical device.',
      expectedOutcome: 'Capable of laying out nested widgets and designing multi-screen user flows.',
      resources: [
        { id: rid(), title: 'The Net Ninja - Flutter Widgets Playlist', url: 'https://www.youtube.com/@thenetninja', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'Flutter Devs - Widget of the Week', url: 'https://www.youtube.com/@flutterdev', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Global State Management (Provider) & Connecting REST APIs',
      why: `Managing global state values cleanly and fetching JSON data from server endpoints is essential for active mobile applications.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Build a weather or joke client app that fetches live JSON data from a public REST API and displays it inside ListViews.',
      interviewPrep: ['Provider ChangeNotifier, Consumer, and context.read/watch operations', 'Async/await futures, streams, and FutureBuilder widget states', 'Parsing raw JSON strings into Dart typed models'],
      milestone: 'Connect an app to a live third-party endpoint and handle loading and error states.',
      expectedOutcome: 'Confident with state providers, text input validation, and asynchronous http client queries.',
      resources: [
        { id: rid(), title: 'Code With Andrea - State Management Guide', url: 'https://codewithandrea.com/', type: 'article', difficulty: 'intermediate' },
        { id: rid(), title: 'The Net Ninja - Asynchronous Dart & HTTP', url: 'https://www.youtube.com/@thenetninja', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Local Storage Persistence & Firebase Cloud Integration',
      why: `Persisting settings locally and connecting cloud databases (Firebase Auth + Firestore) enables building fully featured syncable apps.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Build a secured Cloud Notes App where notes are saved to Cloud Firestore and bound to the authenticated user ID.',
      interviewPrep: ['Local key-value storage using shared_preferences', 'Firebase Authentication setup and email/password signup flow', 'Cloud Firestore rules and private collection data security'],
      milestone: 'Implement a login flow and store synced user data in the cloud database.',
      expectedOutcome: 'Able to wire up user authentication and synchronize collection tables in real-time.',
      resources: [
        { id: rid(), title: 'The Net Ninja - Flutter & Firebase Auth Playlist', url: 'https://www.youtube.com/@thenetninja', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'Code With Andrea - Firebase Architecture Patterns', url: 'https://codewithandrea.com/', type: 'article', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Capstone Polish, Widget Testing & release APK Builds',
      why: `Polishing visual layouts, setting custom launch graphics, writing unit/widget tests, and compiling release binaries prepares your app for publication.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Finalize your capstone notes app, compile splash screens, write widget tests, build a release APK, and publish to GitHub.',
      interviewPrep: ['Unit testing vs. Widget testing syntax and mocks', 'Compiling release build commands (flutter build apk)', 'Google Play Console and Apple App Store publishing prerequisites'],
      milestone: 'Build a release-ready APK binary and present the code repository with a detailed architectural README.',
      expectedOutcome: 'Polished portfolio displaying testing coverage, custom branding assets, and release build files.',
      resources: [
        { id: rid(), title: 'Code With Andrea - Flutter Testing Bootcamp', url: 'https://codewithandrea.com/', type: 'article', difficulty: 'advanced' },
        { id: rid(), title: 'Robert Brunhage - Portfolio and UI Polish', url: 'https://www.youtube.com/@RobertBrunhage', type: 'video', difficulty: 'advanced' }
      ]
    });
  } else if (career.includes('python') || career.includes('django') || career.includes('fastapi') || career.includes('backend')) {
    // ─── Python Backend Developer Topics ──────────────────────────────────────────────────
    pool.push({
      title: 'Python Fundamentals, OOP, Git & SQL',
      why: `Your career goal is ${profile.preferredCareer || 'Backend Developer'}. Building a solid understanding of object-oriented Python, decorators/generators, and PostgreSQL transactions is prerequisite to framework APIs.`,
      estimatedHours: Math.min(40, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a command-line expense or library manager using Python classes, persisting records to a local Postgres database using raw SQL or SQLAlchemy Core.',
      interviewPrep: ['Python memory structures, decorators, and try/except exceptions handling', 'SQL normalization, indices, primary/foreign key mappings, and table JOINS', 'Git branch merges, conflict resolutions, and pull requests'],
      milestone: 'Construct a command-line tool persisting relational records and commit it to GitHub.',
      expectedOutcome: 'Confident with advanced Python syntax features, raw relational queries, and Git workflows.',
      resources: [
        { id: rid(), title: 'Corey Schafer - Python OOP Playlist', url: 'https://www.youtube.com/@coreyms', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'freeCodeCamp.org - PostgreSQL Course', url: 'https://www.youtube.com/@freecodecamp', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Django & FastAPI + REST API Design',
      why: `Building and documenting robust, standards-compliant APIs with models serializers and validation schemas is a core backend skill.`,
      estimatedHours: Math.min(50, monthlyHours),
      difficulty: 'Beginner',
      miniProject: 'Build a bookstore or job board REST API in Django REST Framework. Rebuild the core resource endpoints in FastAPI to directly compare structures.',
      interviewPrep: ['Django model migrations system vs. Alembic migrations database sync for FastAPI', 'Pydantic validation schemas, dependency injection, and path handlers', 'REST standard codes (201 Created, 400 Bad Request, etc.) and pagination layouts'],
      milestone: 'Expose a fully documented REST API with Swagger docs and pagination wrappers.',
      expectedOutcome: 'Capable of configuring APIs, running schema migrations, and comparing sync vs. async patterns.',
      resources: [
        { id: rid(), title: 'Traversy Media - Django API Crash Course', url: 'https://www.youtube.com/@TraversyMedia', type: 'video', difficulty: 'beginner' },
        { id: rid(), title: 'CodingEntrepreneurs - Try Django Series', url: 'https://www.youtube.com/results?search_query=CodingEntrepreneurs+Django', type: 'video', difficulty: 'beginner' }
      ]
    });

    pool.push({
      title: 'Authentication, Testing, Caching & Background Jobs',
      why: `Production-grade web apps require securing endpoints with JWT auth, caching slow DB queries, running workers, and verifying logic with Pytest.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Extend your API: add JWT tokens login, cache lists in Redis, compile a Celery async background task, and write a pytest suite.',
      interviewPrep: ['JWT payload decryption, signature keys, and OAuth2 security guidelines', 'Redis key-value TTL parameters, caching strategies, and rate limiting rules', 'Pytest setup, mock fixtures, and testing async database transactions'],
      milestone: 'Implement secure login, asynchronous email workers, and cover your codebase with 70%+ test coverage.',
      expectedOutcome: 'Comfortable with token security, test assertions, cache expiration, and task workers.',
      resources: [
        { id: rid(), title: 'ArjanCodes - Python Clean Code Patterns', url: 'https://www.youtube.com/@ArjanCodes', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'Real Python - Pytest Testing Guide', url: 'https://www.youtube.com/@realpython', type: 'article', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'Docker, CI/CD & Cloud Deployment',
      why: `Orchestrating containers locally and deploying them through automated build pipelines is a standard industry expectation.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Intermediate',
      miniProject: 'Containerize your API, Postgres, Redis, and Celery worker. Set up a GitHub Actions pipeline to run tests and deploy behind Nginx.',
      interviewPrep: ['Multi-stage Dockerfiles and container layers caching optimization', 'Docker Compose networks, port exposures, and volumes sharing details', 'Reverse proxy configuration in Nginx, SSL handshakes, and Gunicorn/Uvicorn worker threads'],
      milestone: 'Deploy a multi-tier containerized stack to AWS/Render via automated CI/CD pipelines.',
      expectedOutcome: 'Capable of writing Dockerfiles, compose setups, build actions, and configuring production proxies.',
      resources: [
        { id: rid(), title: 'TechWorld with Nana - Docker & CI/CD Masterclass', url: 'https://www.youtube.com/@TechWorldwithNana', type: 'video', difficulty: 'intermediate' },
        { id: rid(), title: 'DevOps Directive - Deploying Modern Web Apps', url: 'https://www.youtube.com/@DevOpsDirective', type: 'video', difficulty: 'intermediate' }
      ]
    });

    pool.push({
      title: 'System Design, Microservices & Job Readiness',
      why: `To pass mid-level interviews, you must know how to scale applications, build services communication networks, and monitor errors.`,
      estimatedHours: Math.min(60, monthlyHours),
      difficulty: 'Advanced',
      miniProject: 'Decouple a feature into a microservice using RabbitMQ/Kafka message queues, integrate Sentry error tracking, and design a case-study architectural README.',
      interviewPrep: ['Horizontal/vertical scale strategies, database read replicas, and sharding details', 'Sentry SDK config, Prometheus scrapers, and Grafana dashboard visualization setup', 'gRPC vs. REST, CAP Theorem trade-offs, and service directory registry logic'],
      milestone: 'Publish a microservices portfolio capstone with a detailed system-design architecture case-study README.',
      expectedOutcome: 'Ready to clear SDE backend interviews and discuss production scaling choices.',
      resources: [
        { id: rid(), title: 'ByteByteGo - System Design Fundamentals', url: 'https://www.youtube.com/@ByteByteGo', type: 'video', difficulty: 'advanced' },
        { id: rid(), title: 'Gaurav Sen - System Design Interview Guide', url: 'https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design', type: 'video', difficulty: 'advanced' }
      ]
    });
  } else {
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
  }

  return pool;
}

function calculateCompletionDate(timeline: string): string {
  const now = new Date();
  const months = timeline === '3 Months' ? 3 : timeline === '6 Months' ? 6 : timeline === '8 Months' ? 8 : 12;
  const completion = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return completion.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
