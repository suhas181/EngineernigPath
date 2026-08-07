import { LibraryResource, ResourceLanguage, ResourceStage } from './types';

// Import Language Resources
import { javaResources } from './languages/java';
import { pythonResources } from './languages/python';
import { cppResources, javascriptResources, typescriptResources } from './languages/cpp';

// Import DSA Resources
import { dsaArraysResources } from './dsa/arrays';
import { dsaStringsResources } from './dsa/strings';
import { dsaSortingResources, dsaBinarySearchResources } from './dsa/sorting';
import { dsaLinkedListResources } from './dsa/linkedList';
import { dsaStacksQueuesResources, dsaTreesBstResources } from './dsa/stacksQueues';
import { dsaHeapTrieResources } from './dsa/heapTrie';
import { dsaGraphsResources, dsaDpResources } from './dsa/graphs';
import { dsaGreedyBacktrackingResources, dsaSlidingWindowPointersResources } from './dsa/greedyBacktracking';
import { dsaBitManipulationResources, dsaAdvancedResources } from './dsa/bitManipulation';

// Import Web Resources
import { webFrontendResources } from './web/frontend';
import { webBackendResources, webDatabasesResources, webDevopsResources } from './web/backend';

// Import CS Core Resources
import { csCoreResources } from './cs/csCore';

// Import Aptitude Resources
import { aptitudeResources } from './aptitude/aptitude';

// Import Interview Resources
import { interviewResources } from './interview/interview';

// Import Tools Resources
import { toolsResources } from './tools/tools';

// Import Project Resources
import { projectResources } from './projects/projects';

/**
 * Master Collection of all curated FREE resources across the application.
 */
export const ALL_RESOURCES: LibraryResource[] = [
  ...javaResources,
  ...pythonResources,
  ...cppResources,
  ...javascriptResources,
  ...typescriptResources,

  ...dsaArraysResources,
  ...dsaStringsResources,
  ...dsaSortingResources,
  ...dsaBinarySearchResources,
  ...dsaLinkedListResources,
  ...dsaStacksQueuesResources,
  ...dsaTreesBstResources,
  ...dsaHeapTrieResources,
  ...dsaGraphsResources,
  ...dsaDpResources,
  ...dsaGreedyBacktrackingResources,
  ...dsaSlidingWindowPointersResources,
  ...dsaBitManipulationResources,
  ...dsaAdvancedResources,

  ...webFrontendResources,
  ...webBackendResources,
  ...webDatabasesResources,
  ...webDevopsResources,

  ...csCoreResources,
  ...aptitudeResources,
  ...interviewResources,
  ...toolsResources,
  ...projectResources,
];

/**
 * Maps stage to numeric rank for strict learning flow ordering:
 * Learn (1) -> Notes/Revision (2) -> Practice (3) -> Interview (4) -> Project (5) -> Revision (6)
 */
const STAGE_ORDER: Record<ResourceStage, number> = {
  learn: 1,
  notes: 2,
  practice: 3,
  interview: 4,
  project: 5,
  revision: 6,
};

/**
 * Resolves curriculum keys into resources with smart fallback.
 * Guarantees domain-specific topics (e.g. Python for AI, React for Frontend, Docker for DevOps) return curated resources even if user header is set to Java.
 */
export const resolveResources = (
  curriculumKey: string,
  dsaLanguage: ResourceLanguage = 'Java'
): LibraryResource[] => {
  if (!curriculumKey) return [];

  const key = curriculumKey.trim().toUpperCase();

  // Try 1: Exact key + preferred language or 'All'
  let matches = ALL_RESOURCES.filter((res) => {
    const keyMatches = res.curriculumKey.toUpperCase() === key;
    if (!keyMatches) return false;

    return res.language === 'All' || res.language === dsaLanguage;
  });

  // Try 2: Fallback to all resources matching curriculum key regardless of language tag
  if (matches.length === 0) {
    matches = ALL_RESOURCES.filter((res) => res.curriculumKey.toUpperCase() === key);
  }

  // Sort by stage learning flow order then by resource order field
  return matches.sort((a, b) => {
    const stageDiff = (STAGE_ORDER[a.stage] || 99) - (STAGE_ORDER[b.stage] || 99);
    if (stageDiff !== 0) return stageDiff;
    return a.order - b.order;
  });
};

export interface MentorStructuredResources {
  primaryVideo?: LibraryResource;
  alternativeVideos: LibraryResource[];
  primaryNote?: LibraryResource;
  alternativeNotes: LibraryResource[];
  practiceProblems: LibraryResource[];
  primaryDsaSheet: { name: string; url: string; badge: string };
  alternativeDsaSheets: Array<{ name: string; url: string }>;
}

/**
 * Mentor-Guided Structured Resource Resolver.
 * Selects ONE primary video playlist, ONE primary note, curated practice problems,
 * and 1 recommended DSA sheet based on preferredDsaLanguage.
 */
export const resolveMentorResources = (
  curriculumKeys: string[],
  dsaLanguage: ResourceLanguage = 'Java'
): MentorStructuredResources => {
  const allResolved: LibraryResource[] = [];

  curriculumKeys.forEach((key) => {
    allResolved.push(...resolveResources(key, dsaLanguage));
  });

  // Deduplicate by ID
  const uniqueMap = new Map<string, LibraryResource>();
  allResolved.forEach((r) => uniqueMap.set(r.id, r));
  const unique = Array.from(uniqueMap.values());

  const videos = unique.filter((r) => r.stage === 'learn' || r.type === 'video');
  const notes = unique.filter((r) => r.stage === 'notes' || r.type === 'article' || r.type === 'book');
  const practice = unique.filter((r) => r.stage === 'practice' || r.type === 'practice');

  // Select Primary Video
  let primaryVideo = videos[0];
  let alternativeVideos = videos.slice(1);

  if (dsaLanguage === 'Python') {
    const pyVid = videos.find((v) => v.title.toLowerCase().includes('neetcode') || v.provider.toLowerCase().includes('neetcode') || v.language === 'Python');
    if (pyVid) {
      primaryVideo = pyVid;
      alternativeVideos = videos.filter((v) => v.id !== pyVid.id);
    }
  } else if (dsaLanguage === 'C++') {
    const cppVid = videos.find((v) => v.title.toLowerCase().includes('striver') || v.provider.toLowerCase().includes('takeuforward') || v.language === 'C++');
    if (cppVid) {
      primaryVideo = cppVid;
      alternativeVideos = videos.filter((v) => v.id !== cppVid.id);
    }
  } else {
    const javaVid = videos.find((v) => v.title.toLowerCase().includes('kunal') || v.title.toLowerCase().includes('java') || v.language === 'Java');
    if (javaVid) {
      primaryVideo = javaVid;
      alternativeVideos = videos.filter((v) => v.id !== javaVid.id);
    }
  }

  // Select Primary Note
  const primaryNote = notes[0];
  const alternativeNotes = notes.slice(1);

  // Cap Practice Problems
  const practiceProblems = practice.slice(0, 8);

  // Select Recommended Practice Sheet
  const primaryDsaSheet = dsaLanguage === 'Python'
    ? { name: '⭐ NeetCode 150', url: 'https://neetcode.io/practice', badge: 'Recommended for Python' }
    : { name: '⭐ Striver A2Z Sheet', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', badge: `Recommended for ${dsaLanguage}` };

  const alternativeDsaSheets = [
    { name: 'Blind 75', url: 'https://leetcode.com/discuss/general-discussion/460599/blind-75-leetcode-questions' },
    { name: 'LeetCode Explore', url: 'https://leetcode.com/explore/' },
    { name: 'GFG Practice', url: 'https://www.geeksforgeeks.org/explore' }
  ];

  return {
    primaryVideo,
    alternativeVideos,
    primaryNote,
    alternativeNotes,
    practiceProblems,
    primaryDsaSheet,
    alternativeDsaSheets,
  };
};

export * from './types';
