import { MasterTopic, groupTopicsIntoTimeline } from '../services/roadmapArchitecture';

// Sample SDE Master Topics representing the 6 placement prep pillars
const sdeMasterTopicsSample: MasterTopic[] = [
  {
    id: 'dsa-arrays-sort',
    title: 'DSA: Arrays, Sorting & Binary Search',
    description: 'Two-pointer technique, sliding window, binary search boundaries, and basic sorting.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_ARRAYS', 'DSA_SORTING', 'DSA_BINARY_SEARCH'],
    defaultStudyHours: 35,
  },
  {
    id: 'dsa-strings-recursion',
    title: 'DSA: Strings & Recursion',
    description: 'String pattern matching, recursion trees, and basic backtracking.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_STRINGS', 'DSA_BACKTRACKING'],
    defaultStudyHours: 30,
  },
  {
    id: 'dsa-ll-stacks-queues',
    title: 'DSA: Linked Lists, Stacks & Queues',
    description: 'Linked list mutations, stack-based parsing, queue scheduling, and hashing.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_LINKED_LIST', 'DSA_STACK', 'DSA_QUEUE'],
    defaultStudyHours: 35,
  },
  {
    id: 'dsa-trees-heaps',
    title: 'DSA: Trees & Heaps',
    description: 'Binary Trees, BST traversals, Heap priority queues, and Tries.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_TREES', 'DSA_HEAP'],
    defaultStudyHours: 40,
  },
  {
    id: 'dsa-graphs-dp',
    title: 'DSA: Graphs & Dynamic Programming',
    description: 'BFS/DFS traversals, Dijkstra, memoization, and tabulation state transitions.',
    pillar: 'DSA',
    curriculumKeys: ['DSA_GRAPHS', 'DSA_DP'],
    defaultStudyHours: 45,
  },
  {
    id: 'dev-fullstack-projects',
    title: 'Development: 2-3 Real Full-Stack Projects',
    description: 'Building production-grade web applications with frontend, backend REST APIs, and database integration.',
    pillar: 'Development',
    curriculumKeys: ['DEV_REACT', 'DEV_NODE', 'DEV_EXPRESS', 'DEV_MONGODB', 'DEV_SQL'],
    defaultStudyHours: 50,
  },
  {
    id: 'theory-cs-core',
    title: 'Theory Fundamentals: OOPs, DBMS, OS & Computer Networks',
    description: 'Object-oriented design principles, SQL normalization, process scheduling, and TCP/IP networking.',
    pillar: 'Theory',
    curriculumKeys: ['CS_OOP', 'CS_DBMS', 'CS_OS', 'CS_CN'],
    defaultStudyHours: 35,
  },
  {
    id: 'aptitude-quant',
    title: 'Aptitude & Quantitative Reasoning',
    description: 'Company-specific placement paper practice, quantitative math, and logical reasoning.',
    pillar: 'Aptitude',
    curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
    defaultStudyHours: 25,
  },
  {
    id: 'resume-ats-prep',
    title: 'Resume Building & Interview Readiness',
    description: 'ATS-compliant resume optimization, STAR methodology behavioral prep, and mock screens.',
    pillar: 'Resume',
    curriculumKeys: ['INT_RESUME', 'INT_BEHAVIORAL', 'INT_MOCK'],
    defaultStudyHours: 20,
  },
  {
    id: 'bonus-cp-hackathons',
    title: 'Bonus: Competitive Programming & Open Source',
    description: 'Codeforces contest prep, hackathon participation, and open-source GitHub pull requests.',
    pillar: 'Bonus',
    curriculumKeys: ['DSA_ADVANCED', 'DEV_OPENSOURCE'],
    defaultStudyHours: 40,
    bonusForLongTimelineOnly: true,
  },
];

console.log('=== PROOF OF CONCEPT: PART A ARCHITECTURE REFACTOR ===\n');

console.log('--- 3-MONTH TIMELINE GENERATION ---');
const blocks3M = groupTopicsIntoTimeline(sdeMasterTopicsSample, 3);
blocks3M.forEach((b) => {
  console.log(`\n[${b.title}] (Difficulty: ${b.difficulty}, Est. Hours: ${b.estimatedStudyHours}h)`);
  console.log(`  Topics Included (${b.topics.length}): ${b.topics.join(' | ')}`);
  console.log(`  Curriculum Keys: ${b.curriculumKeys.join(', ')}`);
});

console.log('\n--------------------------------------------------\n');

console.log('--- 8-MONTH TIMELINE GENERATION ---');
const blocks8M = groupTopicsIntoTimeline(sdeMasterTopicsSample, 8);
blocks8M.forEach((b) => {
  console.log(`\n[${b.title}] (Difficulty: ${b.difficulty}, Est. Hours: ${b.estimatedStudyHours}h)`);
  console.log(`  Topics Included (${b.topics.length}): ${b.topics.join(' | ')}`);
  console.log(`  Curriculum Keys: ${b.curriculumKeys.join(', ')}`);
});
