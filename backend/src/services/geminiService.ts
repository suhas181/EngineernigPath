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
    return generateIntelligentMockRoadmap(profile);
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

    logStage('SUCCESS', `Successfully compiled SDE roadmap: ${roadmapJSON.topics.length} months.`);
    return roadmapJSON;
  } catch (error) {
    console.error('Error generating SDE roadmap in multi-stage pipeline, fallback to mock:', error);
    return generateIntelligentMockRoadmap(profile);
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
    topics: topicsWithResources,
    summary
  };
}

function calculateCompletionDate(timeline: string): string {
  const now = new Date();
  const months = timeline === '3 Months' ? 3 : timeline === '6 Months' ? 6 : timeline === '8 Months' ? 8 : 12;
  const completion = new Date(now.getFullYear(), now.getMonth() + months, 1);
  return completion.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}
