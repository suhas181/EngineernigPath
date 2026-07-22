import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveResources, LibraryResource } from '../config/resourceLibrary';

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
  const projectSummary = profile.projects.length > 0
    ? profile.projects.map((p, i) =>
        `  ${i + 1}. "${p.title}" — ${p.description} [Tech: ${p.technologies.join(', ')}] [Difficulty: ${p.difficulty || 'N/A'}] [Completed: ${p.isCompleted ? 'Yes' : 'No'}]`
      ).join('\n')
    : '  No projects declared.';

  return `
You are an expert SDE Technical Interviewer and career strategist.
Analyze the following student profile for SDE placement preparation:

STUDENT PROFILE:
  Name: ${profile.name}
  Semester: ${profile.currentSemester}/8 (Branch: ${profile.branch}, CGPA: ${profile.cgpa})
  Career Preferences: Target Role: ${profile.preferredCareer}, Company Focus Type: ${profile.targetCompanyType || 'Product-Based'}
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
- Stage 2: Skill Gap Analysis (Analyze missing SDE skills based on target company focus).
  * Product-Based Focus: Prioritize strong DSA, system design (when appropriate), advanced development, and resume building.
  * Service-Based Focus: Prioritize basic/intermediate DSA, quantitative aptitude, verbal/logical reasoning, communication, and HR prep.
  * Mastered check: Never recommend SDE curriculum topics they have already mastered (e.g. if DSA is "Advanced", skip basics).

Provide your final analysis report as text. Make sure to identify:
- Mastered topics to skip.
- High priority SDE curriculum topics to focus on first.
- Placement readiness index.
`;
}

// ─── Stage 3, 4, 6 & 7: Month Planning Prompt ────────────────────────────────
function buildPlanningPrompt(analysis: string, profile: EnrichedProfileInput): string {
  const timeline = profile.placementTimeline || '6 Months';
  const totalMonths = timeline === '3 Months' ? 3 : timeline === '6 Months' ? 6 : timeline === '8 Months' ? 8 : 12;

  const completedMonthsSection = profile.completedMonths.length > 0
    ? `
COMPLETED MONTHS (LOCK AND DO NOT MODIFIED):
${profile.completedMonths.map((m, i) => `  Month ${i + 1}: "${m}" — LOCKED`).join('\n')}
Generate only the remaining ${totalMonths - profile.completedMonths.length} future months (from Month ${profile.completedMonths.length + 1} onwards).
`
    : `Generate exactly ${totalMonths} months (Month 1 through Month ${totalMonths}).`;

  return `
You are an expert AI Career Mentor for SDE roles.
Using the Profile & Skill Gap Analysis below, create a personalized SDE placement preparation roadmap for the remaining months.

---
PROFILE ANALYSIS REPORT:
${analysis}
---

---
ROADMAP TIMELINE SETTINGS:
Total Duration: ${totalMonths} Months
${completedMonthsSection}
---

SDE CURRICULUM LIBRARY KEYS (Stage 3 Selection):
You MUST select 1 to 3 keys for each month *ONLY* from this list:
- DSA: DSA_ARRAYS, DSA_STRINGS, DSA_BINARY_SEARCH, DSA_SORTING, DSA_LINKED_LIST, DSA_STACK, DSA_QUEUE, DSA_TREES, DSA_GRAPHS, DSA_DP, DSA_HASHING, DSA_HEAP, DSA_TRIE, DSA_GREEDY, DSA_BACKTRACKING, DSA_SLIDING_WINDOW, DSA_TWO_POINTERS, DSA_BIT_MANIPULATION
- DEV: DEV_GIT, DEV_HTML, DEV_CSS, DEV_JAVASCRIPT, DEV_REACT, DEV_NEXTJS, DEV_NODE, DEV_EXPRESS, DEV_MONGODB, DEV_SQL, DEV_DOCKER, DEV_AWS, DEV_REST_APIS, DEV_AUTHENTICATION, DEV_REDIS, DEV_DEPLOYMENT
- CS Fundamentals: CS_OS, CS_DBMS, CS_CN, CS_OOP, CS_SYSTEM_DESIGN
- Aptitude: APT_QUANT, APT_LOGICAL, APT_VERBAL
- Interview Prep: INT_HR, INT_BEHAVIORAL, INT_RESUME, INT_MOCK

Adapt Month Topics according to Target Company Type:
- Product-Based: Focus heavily on strong DSA keys, System Design, development tools, and mock interviews.
- Service-Based: Focus heavily on Aptitude keys, basic/intermediate DSA, communication/behavioral skills, and general HR prep.

OUTPUT SCHEMA SPECIFICATION:
Return ONLY a valid JSON object matching this schema. Do not write any markdown code fences (like \`\`\`json) or text before/after.

{
  "title": "Personalized SDE Career Path for ${profile.name}",
  "description": "Short explanation of the roadmap strategy (Product vs Service focus, coding progress, and timeline).",
  "version": "2.0.0",
  "topics": [
    {
      "id": "topic-N",
      "title": "Month N: [Month Title]",
      "whyThisMonth": "Explain why this curriculum is chosen based on the profile gap.",
      "learningObjectives": ["objective 1", "objective 2"],
      "weeklyStudyPlan": ["Week 1: ...", "Week 2: ...", "Week 3: ...", "Week 4: ..."],
      "estimatedStudyHours": 60,
      "topics": ["Subtopic 1", "Subtopic 2"],
      "curriculumKeys": ["DSA_ARRAYS", "DSA_STRINGS"],
      "practiceProblems": [
        { "id": "prob-N-1", "title": "Problem Title", "url": "https://leetcode.com/problems/...", "difficulty": "easy" }
      ],
      "project": {
        "title": "Project Title",
        "description": "Mini project description reinforcing this month's learning.",
        "technologies": ["Java"],
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

// ─── Stage 5: Backend Curated Resource Attachment ───────────────────────────
function attachCuratedResources(topics: any[], preferredDsaLanguage: 'Java' | 'Python' | 'C++') {
  logStage('STAGE-5', 'Attaching curated resources statically on the backend');
  
  return topics.map((month: any) => {
    // If the month contains resources already, keep them (for completed months preserved)
    if (month.resources && month.resources.length > 0 && month.isCompleted) {
      return month;
    }

    const resolved: LibraryResource[] = [];
    const keys = month.curriculumKeys || [];
    
    keys.forEach((key: string) => {
      const res = resolveResources(key, preferredDsaLanguage);
      resolved.push(...res);
    });

    // Remove duplicates by resource ID
    const uniqueMap = new Map<string, LibraryResource>();
    resolved.forEach(r => uniqueMap.set(r.id, r));
    const finalResources = Array.from(uniqueMap.values()).map(r => ({
      ...r,
      isCompleted: false
    }));

    return {
      ...month,
      resources: finalResources
    };
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// PUBLIC API: generateRoadmapWithAI
// ═══════════════════════════════════════════════════════════════════════════════
export const generateRoadmapWithAI = async (profile: EnrichedProfileInput): Promise<any> => {
  logStage('INIT', `Starting multi-stage SDE Roadmap Engine for "${profile.name}"`, {
    targetCompanyType: profile.targetCompanyType,
    preferredDsaLanguage: profile.preferredDsaLanguage,
    preferredProgrammingLanguage: profile.preferredProgrammingLanguage,
    timeline: profile.placementTimeline
  });

  if (!genAI) {
    logStage('MOCK', 'Gemini API Key is not set or placeholder. Invoking Mock pipeline.');
    const mockRoadmap = generateIntelligentMockRoadmap(profile);
    mockRoadmap.source = 'fallback';
    return mockRoadmap;
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // ───── STAGE 1 & 2: Profile & Skill Gap Analysis ─────────────────────────
    logStage('STAGE-1&2', 'Running Profile & Skill Gap Analysis...');
    const analysisPrompt = buildAnalysisPrompt(profile);
    const analysisResult = await model.generateContent(analysisPrompt);
    const analysisText = analysisResult.response.text();
    logStage('STAGE-1&2', `Analysis Report completed (${analysisText.length} chars)`);

    // ───── STAGE 3, 4, 6 & 7: Month Planning & Selection ─────────────────────
    logStage('STAGE-3&4', 'Running SDE Month Planning & Selection...');
    const planningPrompt = buildPlanningPrompt(analysisText, profile);
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

    // ───── STAGE 5: Curated Resource Attachment ──────────────────────────────
    roadmapJSON.topics = attachCuratedResources(
      roadmapJSON.topics || [],
      profile.preferredDsaLanguage || 'Java'
    );

    // Force stamp final JSON SDE version
    roadmapJSON.version = '2.0.0';
    roadmapJSON.source = 'gemini';

    logStage('SUCCESS', `Successfully compiled SDE roadmap: ${roadmapJSON.topics.length} months.`);
    return roadmapJSON;
  } catch (error) {
    console.error('Error generating SDE roadmap in multi-stage pipeline, fallback to mock:', error);
    const mockRoadmap = generateIntelligentMockRoadmap(profile);
    mockRoadmap.source = 'fallback';
    return mockRoadmap;
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENT MOCK GENERATOR (structured, profile-aware fallback)
// ═══════════════════════════════════════════════════════════════════════════════
function generateIntelligentMockRoadmap(profile: EnrichedProfileInput) {
  logStage('MOCK-INIT', 'Analyzing profile for SDE Fallback generator');

  const timeline = profile.placementTimeline || '6 Months';
  const totalMonths = timeline === '3 Months' ? 3 : timeline === '6 Months' ? 6 : timeline === '8 Months' ? 8 : 12;
  const skipCount = profile.completedMonths.length;
  const newTopicCount = totalMonths - skipCount;
  const dsaLang = profile.preferredDsaLanguage || 'Java';
  const progLang = profile.preferredProgrammingLanguage || 'Java';
  const isProduct = (profile.targetCompanyType || 'Product-Based') === 'Product-Based';
  const dailyHours = profile.dailyStudyHours || 2;
  const monthlyHours = dailyHours * 30;

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
      milestones: ['Complete 5 full service SDE placement practice rounds', 'Submit finalized resume'],
      goal: 'Confidently answer OS/DBMS questions and HR behavioral screens',
      outcome: 'Placement ready for service SDE hiring pipelines',
      readinessImprovement: 15
    }
  ];

  // Pick curriculum list based on company focus
  const templatePool = isProduct ? sdeProductCurriculum : sdeServiceCurriculum;
  
  // Filter out any templates if dsaLevel is Advanced (already mastered)
  // Let's filter out basic DSA templates if the user is already advanced
  let filteredTemplates = [...templatePool];
  if (profile.dsaLevel === 'Advanced' && isProduct) {
    filteredTemplates = filteredTemplates.filter(t => !t.title.includes('Foundations'));
  }

  // Adjust number of topics to match totalMonths
  const selectedTemplates = filteredTemplates.slice(0, newTopicCount);

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
      difficulty: topic.projectDifficulty,
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

  // Attach resources statically
  const topicsWithResources = attachCuratedResources(topics, dsaLang);

  const summary = {
    currentPlacementReadiness: currentReadiness,
    estimatedFinalReadiness: Math.min(currentReadiness + improvementPerMonth * totalMonths, 95),
    biggestStrengths: profile.skills.length > 0 ? profile.skills.slice(0, 2) : ['OOP Foundations'],
    biggestWeaknesses: profile.weakSubjects.length > 0 ? profile.weakSubjects.slice(0, 2) : ['Dynamic Programming'],
    topThreePriorities: selectedTemplates.slice(0, 3).map(t => t.title),
    estimatedCompletionDate: calculateCompletionDate(timeline)
  };

  return {
    title: `Personalized SDE Career Path for ${profile.name}`,
    description: `A SDE placement preparation path targeting ${profile.targetCompanyType || 'Product-Based'} companies, custom-fit for your ${timeline} timeline, using ${progLang} and ${dsaLang}.`,
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
