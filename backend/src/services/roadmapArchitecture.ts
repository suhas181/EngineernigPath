import { LibraryResource } from '../resources/types';

export interface MasterTopic {
  id: string;
  title: string;
  description: string;
  pillar: 'DSA' | 'Development' | 'Theory' | 'Aptitude' | 'Resume' | 'Bonus';
  curriculumKeys: string[];
  defaultStudyHours: number;
  practiceProblems?: Array<{ title: string; url: string; difficulty: 'easy' | 'medium' | 'hard' }>;
  project?: {
    title: string;
    description: string;
    technologies: string[];
  };
  interviewPrep?: string[];
  bonusForLongTimelineOnly?: boolean;
}

export interface LearningSprint {
  id: string;
  sprintNumber: number;
  sprintGoal: string;
  todaysFocus: string;
  estimatedHours: number;
  topics: string[];
  curriculumKeys: string[];
  resources?: LibraryResource[];
  learnResources?: LibraryResource[];
  notesResources?: LibraryResource[];
  practice: Array<{ id: string; title: string; url: string; difficulty: 'easy' | 'medium' | 'hard'; isCompleted: boolean }>;
  interviewQuestions: string[];
  miniProject?: {
    title: string;
    description: string;
    technologies: string[];
    url?: string;
    isCompleted?: boolean;
  };
  revision?: LibraryResource[];
  sprintProgress: number;
  expectedOutcomes: string;
}

export interface MonthlyMilestoneSummary {
  topicsCompleted: number;
  totalTopics: number;
  problemsSolved: number;
  totalProblems: number;
  projectStatus: 'not_started' | 'in_progress' | 'completed';
  readinessImprovement: {
    currentReadinessPercent: number;
    expectedReadinessPercent: number;
    improvementPercent: number;
  };
  recommendedNextSteps: string[];
}

export interface GeneratedMonthBlock {
  monthNumber: number;
  title: string;
  whyThisMonth: string;
  learningObjectives: string[];
  weeklyStudyPlan: string[];
  estimatedStudyHours: number;
  topics: string[];
  curriculumKeys: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  practiceProblems: Array<{ title: string; url: string; difficulty: 'easy' | 'medium' | 'hard' }>;
  project?: {
    title: string;
    description: string;
    technologies: string[];
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  };
  interviewPrep: string[];
  weeklyMilestones: string[];
  monthlyGoal: string;
  expectedOutcome: string;
  learningSprints: LearningSprint[];
  monthlyMilestoneSummary: MonthlyMilestoneSummary;
}

/**
 * Master Placement-Prep Topic List for Software Engineer (SDE)
 */
export const sdeMasterTopics: MasterTopic[] = [
  {
    id: 'sde-dsa-arrays-sorting',
    title: 'DSA: Arrays, Sorting & Binary Search',
    description: 'Array manipulations, two-pointer technique, sliding window, binary search boundaries, and space-time complexity analysis.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_ARRAYS', 'DSA_SORTING', 'DSA_BINARY_SEARCH', 'DSA_TWO_POINTERS', 'DSA_SLIDING_WINDOW'],
    defaultStudyHours: 35,
    practiceProblems: [
      { title: 'Two Sum', url: 'https://leetcode.com/problems/two-sum/', difficulty: 'easy' },
      { title: 'Binary Search', url: 'https://leetcode.com/problems/binary-search/', difficulty: 'easy' },
      { title: 'Search in Rotated Sorted Array', url: 'https://leetcode.com/problems/search-in-rotated-sorted-array/', difficulty: 'medium' }
    ],
    interviewPrep: [
      'Two-pointer vs hash map space-time trade-off',
      'Binary search edge-case boundary checks'
    ]
  },
  {
    id: 'sde-dsa-strings-recursion',
    title: 'DSA: Strings & Recursion',
    description: 'String pattern matching, palindromes, anagrams, recursive call stack mechanics, and introductory backtracking.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_STRINGS', 'DSA_BACKTRACKING'],
    defaultStudyHours: 30,
    practiceProblems: [
      { title: 'Valid Anagram', url: 'https://leetcode.com/problems/valid-anagram/', difficulty: 'easy' },
      { title: 'Valid Palindrome', url: 'https://leetcode.com/problems/valid-palindrome/', difficulty: 'easy' },
      { title: 'Subsets', url: 'https://leetcode.com/problems/subsets/', difficulty: 'medium' }
    ],
    interviewPrep: [
      'Recursion call stack memory overhead and stack overflow prevention',
      'String immutability and memory allocation'
    ]
  },
  {
    id: 'sde-dsa-lists-stacks-queues',
    title: 'DSA: Linked Lists, Stacks & Queues',
    description: 'Singly and doubly linked list mutations, fast/slow pointers, stack-based expression evaluation, queue scheduling, and hashing.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_LINKED_LIST', 'DSA_STACK', 'DSA_QUEUE', 'DSA_HASHING'],
    defaultStudyHours: 35,
    practiceProblems: [
      { title: 'Reverse Linked List', url: 'https://leetcode.com/problems/reverse-linked-list/', difficulty: 'easy' },
      { title: 'Valid Parentheses', url: 'https://leetcode.com/problems/valid-parentheses/', difficulty: 'easy' },
      { title: 'LRU Cache', url: 'https://leetcode.com/problems/lru-cache/', difficulty: 'hard' }
    ],
    interviewPrep: [
      'Floyd cycle detection algorithm proof',
      'Monotonic stack applications'
    ]
  },
  {
    id: 'sde-dsa-trees-heaps',
    title: 'DSA: Trees, Heaps & Tries',
    description: 'Binary Trees DFS/BFS traversals, Binary Search Tree invariants, Min/Max Heap priority queues, and Trie prefix trees.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_TREES', 'DSA_HEAP', 'DSA_TRIE'],
    defaultStudyHours: 40,
    practiceProblems: [
      { title: 'Maximum Depth of Binary Tree', url: 'https://leetcode.com/problems/maximum-depth-of-binary-tree/', difficulty: 'easy' },
      { title: 'Kth Largest Element in an Array', url: 'https://leetcode.com/problems/kth-largest-element-in-an-array/', difficulty: 'medium' },
      { title: 'Implement Trie (Prefix Tree)', url: 'https://leetcode.com/problems/implement-trie-prefix-tree/', difficulty: 'medium' }
    ],
    interviewPrep: [
      'BFS vs DFS memory overhead comparison',
      'Array representation of binary heaps and heapify runtime proof'
    ]
  },
  {
    id: 'sde-dsa-graphs-dp',
    title: 'DSA: Graphs & Dynamic Programming',
    description: 'Graph representations (adjacency list/matrix), BFS/DFS, Dijkstra shortest path, memoization vs tabulation, and classic 1D/2D DP.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_GRAPHS', 'DSA_DP', 'DSA_GREEDY'],
    defaultStudyHours: 45,
    practiceProblems: [
      { title: 'Clone Graph', url: 'https://leetcode.com/problems/clone-graph/', difficulty: 'medium' },
      { title: 'Climbing Stairs', url: 'https://leetcode.com/problems/climbing-stairs/', difficulty: 'easy' },
      { title: 'Longest Common Subsequence', url: 'https://leetcode.com/problems/longest-common-subsequence/', difficulty: 'medium' }
    ],
    interviewPrep: [
      'Topological sorting for build dependency resolution',
      'Overlapping subproblems vs optimal substructure in DP'
    ]
  },
  {
    id: 'sde-dev-fullstack-projects',
    title: 'Development: 2-3 Real Full-Stack Projects',
    description: 'Build 2-3 production-grade full-stack applications with frontend UI, backend REST APIs, authentication (JWT), and database integration (SQL/NoSQL).',
    pillar: 'Development',
    curriculumKeys: ['DEV_REACT', 'DEV_NODE', 'DEV_EXPRESS', 'DEV_MONGODB', 'DEV_SQL', 'DEV_REST_APIS', 'DEV_AUTHENTICATION'],
    defaultStudyHours: 50,
    project: {
      title: 'Full-Stack E-Commerce / Management Platform',
      description: 'Build a production-style full-stack application featuring role-based auth, dynamic catalog filtering, cart/checkout integration, REST API backend, and relational/document database integration.',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB / PostgreSQL', 'TailwindCSS']
    },
    interviewPrep: [
      'REST API design conventions & HTTP status codes',
      'Authentication session vs JWT token security best practices'
    ]
  },
  {
    id: 'sde-theory-cs-core',
    title: 'Theory Fundamentals: OOPs, DBMS, OS & Computer Networks',
    description: 'Object-Oriented Programming (encapsulation, polymorphism), DBMS (normalization 1NF-3NF, ACID, indexing), OS (processes, threads, scheduling, deadlocks), and Computer Networks (OSI/TCP-IP, HTTP/HTTPS).',
    pillar: 'Theory',
    curriculumKeys: ['CS_OOP', 'CS_DBMS', 'CS_OS', 'CS_CN'],
    defaultStudyHours: 35,
    practiceProblems: [
      { title: 'Combine Two Tables (SQL)', url: 'https://leetcode.com/problems/combine-two-tables/', difficulty: 'easy' },
      { title: 'Second Highest Salary (SQL)', url: 'https://leetcode.com/problems/second-highest-salary/', difficulty: 'medium' }
    ],
    interviewPrep: [
      'Primary key vs Foreign key & SQL Join algorithms',
      'CPU scheduling algorithms (Round Robin vs Shortest Remaining Time First)'
    ]
  },
  {
    id: 'sde-aptitude-quant',
    title: 'Aptitude & Quantitative Reasoning',
    description: 'Focused practice on Quantitative Aptitude (percentages, ratios, work & time), Logical Reasoning (puzzles, series, coding-decoding), and company placement papers.',
    pillar: 'Aptitude',
    curriculumKeys: ['APT_QUANT', 'APT_LOGICAL', 'APT_VERBAL'],
    defaultStudyHours: 25,
    interviewPrep: [
      'Speed-math techniques for campus placement screening tests',
      'Logical deduction and pattern recognition strategies'
    ]
  },
  {
    id: 'sde-resume-interview-prep',
    title: 'Resume Building & Interview Readiness',
    description: 'Construct ATS-compliant, achievement-focused resume bullet points, refine STAR methodology behavioral pitches, and complete mock technical interviews.',
    pillar: 'Resume',
    curriculumKeys: ['INT_RESUME', 'INT_BEHAVIORAL', 'INT_MOCK', 'INT_HR'],
    defaultStudyHours: 20,
    interviewPrep: [
      'STAR method for technical leadership & conflict resolution behavioral questions',
      'ATS keyword alignment and project impact metrics formatting'
    ]
  },
  {
    id: 'sde-bonus-cp-opensource',
    title: 'Bonus: Competitive Programming, Open Source & Internship Polish',
    description: 'Advanced problem solving on Codeforces/LeetCode contests, open-source GitHub pull requests, hackathon projects, and internship-ready code polish.',
    pillar: 'Bonus',
    curriculumKeys: ['DSA_ADVANCED', 'DEV_OPENSOURCE'],
    defaultStudyHours: 40,
    bonusForLongTimelineOnly: true,
    interviewPrep: [
      'Navigating open-source codebase contribution workflows',
      'Contest time-management strategies'
    ]
  }
];

/**
 * Dynamically group an ordered master topic list into N month blocks based on selected timeline.
 * Also dynamically generates 3-5 Learning Sprints per month based on timeline & study hours per day.
 */
export function groupTopicsIntoTimeline(
  masterTopics: MasterTopic[],
  timelineMonths: number,
  maxMonthlyCap: number = 90,
  dailyStudyHours: number = 3
): GeneratedMonthBlock[] {
  const activeTopics = masterTopics.filter(
    (t) => !t.bonusForLongTimelineOnly || timelineMonths >= 8
  );

  const totalTopics = activeTopics.length;
  if (totalTopics === 0) return [];

  const rawTotalWorkload = activeTopics.reduce((sum, t) => sum + t.defaultStudyHours, 0);
  const maxTotalAllowed = maxMonthlyCap * timelineMonths;
  const scaleFactor = rawTotalWorkload > maxTotalAllowed ? maxTotalAllowed / rawTotalWorkload : 1.0;
  const scaledTotalWorkload = Math.round(rawTotalWorkload * scaleFactor);
  const baseMonthlyHours = Math.round(scaledTotalWorkload / timelineMonths);

  const baseTopicsPerMonth = Math.floor(totalTopics / timelineMonths);
  let remainder = totalTopics % timelineMonths;

  const monthBlocks: GeneratedMonthBlock[] = [];
  let topicIndex = 0;

  for (let m = 1; m <= timelineMonths; m++) {
    const countForThisMonth = Math.max(1, baseTopicsPerMonth + (remainder > 0 ? 1 : 0));
    if (remainder > 0) remainder--;

    let currentTopics = activeTopics.slice(topicIndex, topicIndex + countForThisMonth);
    if (currentTopics.length === 0 && activeTopics.length > 0) {
      currentTopics = [activeTopics[(m - 1) % activeTopics.length]];
    }
    topicIndex += countForThisMonth;

    const midPointIndex = topicIndex - countForThisMonth / 2;
    const progressRatio = midPointIndex / totalTopics;
    let difficulty: 'Beginner' | 'Intermediate' | 'Advanced' = 'Beginner';
    if (progressRatio > 0.65) {
      difficulty = 'Advanced';
    } else if (progressRatio > 0.35) {
      difficulty = 'Intermediate';
    }

    let monthHourAdjustment = 0;
    if (timelineMonths > 1) {
      if (m === Math.ceil(timelineMonths / 2)) {
        monthHourAdjustment = 4;
      } else if (m === 1) {
        monthHourAdjustment = -3;
      } else if (m === timelineMonths) {
        monthHourAdjustment = -1;
      }
    }

    const estimatedStudyHours = Math.min(
      maxMonthlyCap,
      Math.max(25, baseMonthlyHours + monthHourAdjustment)
    );

    const topicTitles = currentTopics.map((t) => t.title);
    const curriculumKeys = Array.from(new Set(currentTopics.flatMap((t) => t.curriculumKeys)));
    const practiceProblems = currentTopics.flatMap((t) => t.practiceProblems || []);

    const projectTopic = currentTopics.find((t) => t.project);
    const project = projectTopic && projectTopic.project
      ? {
          title: projectTopic.project.title,
          description: projectTopic.project.description,
          technologies: projectTopic.project.technologies,
          difficulty: difficulty.toLowerCase() as 'beginner' | 'intermediate' | 'advanced',
        }
      : undefined;

    const interviewPrep = Array.from(new Set(currentTopics.flatMap((t) => t.interviewPrep || [])));

    // DYNAMIC SPRINT CALCULATION (3, 4, or 5 Sprints per Month)
    const targetHoursPerSprint = Math.max(10, dailyStudyHours * 7);
    const calculatedSprintCount = Math.round(estimatedStudyHours / targetHoursPerSprint);
    const sprintCount = Math.min(5, Math.max(3, calculatedSprintCount));

    const learningSprints: LearningSprint[] = [];
    const hoursPerSprint = Math.round(estimatedStudyHours / sprintCount);

    for (let s = 1; s <= sprintCount; s++) {
      const topicForSprint = currentTopics[(s - 1) % currentTopics.length] || currentTopics[0];
      const sprintKeys = topicForSprint.curriculumKeys || curriculumKeys;

      const sprintPractice = (topicForSprint.practiceProblems || practiceProblems)
        .slice(0, 3)
        .map((p, idx) => ({
          id: `prob-m${m}-s${s}-${idx}`,
          title: p.title,
          url: p.url,
          difficulty: p.difficulty,
          isCompleted: false,
        }));

      learningSprints.push({
        id: `sprint-m${m}-s${s}`,
        sprintNumber: s,
        sprintGoal: `Master core concepts and problem patterns for ${topicForSprint.title}`,
        todaysFocus: `Deep dive into ${topicForSprint.title}: ${topicForSprint.description.slice(0, 80)}...`,
        estimatedHours: hoursPerSprint,
        topics: [topicForSprint.title],
        curriculumKeys: sprintKeys,
        practice: sprintPractice,
        interviewQuestions: topicForSprint.interviewPrep || interviewPrep.slice(0, 2),
        miniProject: s === sprintCount && project ? { ...project, isCompleted: false } : undefined,
        sprintProgress: 0,
        expectedOutcomes: `Solid working proficiency in ${topicForSprint.title} with clean problem solving intuition.`,
      });
    }

    const weeklyStudyPlan: string[] = learningSprints.map(
      (s) => `Sprint ${s.sprintNumber}: ${s.sprintGoal} (${s.estimatedHours}h)`
    );

    const learningObjectives = currentTopics.map((t) => `Master ${t.title}: ${t.description}`);
    const monthTitleHeader = currentTopics.length > 1 
      ? `${currentTopics[0].title} & ${currentTopics[currentTopics.length - 1].title}`
      : currentTopics[0].title;

    const currentReadiness = Math.min(95, Math.round(15 + (m - 1) * (70 / timelineMonths)));
    const expectedReadiness = Math.min(95, Math.round(15 + m * (70 / timelineMonths)));
    const improvementPercent = expectedReadiness - currentReadiness;

    const monthlyMilestoneSummary: MonthlyMilestoneSummary = {
      topicsCompleted: 0,
      totalTopics: currentTopics.length,
      problemsSolved: 0,
      totalProblems: practiceProblems.length,
      projectStatus: project ? 'not_started' : 'completed',
      readinessImprovement: {
        currentReadinessPercent: currentReadiness,
        expectedReadinessPercent: expectedReadiness,
        improvementPercent,
      },
      recommendedNextSteps: [
        `Review weak topics in Month ${m} before proceeding to Month ${m + 1}`,
        `Complete all attached practice problems and mini project for ${monthTitleHeader}`,
        `Solve 5 additional medium problems on LeetCode / Striver Sheet`,
      ],
    };

    monthBlocks.push({
      monthNumber: m,
      title: `Month ${m}: ${monthTitleHeader}`,
      whyThisMonth: `Month ${m} focuses on ${topicTitles.join(', ')} to advance your placement preparation.`,
      learningObjectives,
      weeklyStudyPlan,
      estimatedStudyHours,
      topics: topicTitles,
      curriculumKeys,
      difficulty,
      practiceProblems,
      project,
      interviewPrep,
      weeklyMilestones: currentTopics.map((t) => `Complete exercises & checkpoints for ${t.title}`),
      monthlyGoal: `Build proficiency in ${topicTitles.join(', ')}`,
      expectedOutcome: `Solid mastery of ${topicTitles.join(', ')} with interview-level problem solving ability.`,
      learningSprints,
      monthlyMilestoneSummary,
    });
  }

  return monthBlocks;
}
