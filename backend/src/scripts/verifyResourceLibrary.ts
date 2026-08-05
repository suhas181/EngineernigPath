import { ALL_RESOURCES, resolveResources } from '../resources';

/**
 * Documented whitelist of URLs intentionally referenced across multiple stages/languages
 * (e.g. comprehensive multi-topic problem sheets, master playlists, interactive portals).
 */
export const ALLOWED_DUPLICATE_URLS: Record<string, string> = {
  'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/':
    'Striver A2Z Master DSA Sheet covers multiple Data Structure topics across Java, Python, and C++.',
  'https://neetcode.io/practice':
    'NeetCode 150 Master Practice Portal covers multiple topics across Python, Java, and C++.',
  'https://takeuforward.org/data-structure/stacks-and-queues-strivers-a2z-dsa-course-sheet/':
    'Master Stacks and Queues Sheet covers both Stack and Queue data structure categories.',
  'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7':
    'Corey Schafer Python Masterclass playlist covers both Python syntax and OOP fundamentals.',
  'https://www.youtube.com/playlist?list=PL9gnSGHSqcnpFD6g2t2Wnmj1D6Uj1G2eP':
    'Kunal Kushwaha Recursion & Backtracking playlist covers both Recursion and Backtracking topics.',
  'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7gFc1UMAxqv6t5P':
    'Kunal Kushwaha Java & DSA Master Playlist covers Java syntax, sorting algorithms, and binary search.',
  'https://www.youtube.com/playlist?list=PLlasXeu85E9c4idTXF4y24l22i08502gq':
    'Akshay Saini Namaste JavaScript Playlist covers core JS execution context, closures, and React foundations.',
  'https://youtu.be/n6yDgOyHQQc':
    'Kunal Kushwaha Arrays & Two Pointer video covers both Array representations and Two Pointer techniques.',
  'https://youtu.be/rIQgssEAHwA':
    'Kunal Kushwaha Stacks & Queues video covers both Stack and Queue data structures in Java.',
  'https://neetcode.io/courses/dsa-for-beginners/8':
    'NeetCode Stacks & Queues course module covers both Stacks and Queues in Python.',
  'https://www.youtube.com/playlist?list=PLgUwDviBIf0q7ve7bK+/8sVyB1DX86Pry':
    'Striver Sliding Window & Two Pointer playlist covers both Sliding Window and Two Pointer techniques.',
  'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3g1t1gT0GsDYmF0gMC9g':
    'Striver Graph Series playlist covers Java and C++ graph topics.',
  'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5y6ysfCcnPxTP_GFLu':
    'Striver Dynamic Programming Series playlist covers Java and C++ DP topics.',
  'https://www.indiabix.com/quantitative-aptitude/questions-and-answers/':
    'IndiaBix Quantitative Aptitude portal contains multiple practice sets.',
  'https://www.indiabix.com/logical-reasoning/questions-and-answers/':
    'IndiaBix Logical Reasoning portal contains multiple practice sets.',
  'https://www.indiabix.com/verbal-ability/questions-and-answers/':
    'IndiaBix Verbal Ability portal contains multiple practice sets.',
  'https://vercel.com/docs':
    'Vercel Official Documentation covers both web app deployment and platform edge tool configurations.',
};

export interface VerificationReport {
  totalResources: number;
  resourcesPerCategory: Record<string, number>;
  resourcesPerLanguage: Record<string, number>;
  unwhitelistedDuplicateUrls: string[];
  whitelistedDuplicateUrls: string[];
  duplicateIds: string[];
  missingMetadata: string[];
  missingProviders: string[];
  missingHours: string[];
  missingKeys: string[];
  nonFreeResources: string[];
  dsaLanguageCoverage: Record<string, { Java: number; Python: number; 'C++': number }>;
  allDsaCovered: boolean;
  success: boolean;
}

export const runResourceLibraryVerification = (): VerificationReport => {
  console.log('====================================================');
  console.log('  ENGINEERPATH RESOURCE LIBRARY AUDIT & VERIFIER V2 ');
  console.log('====================================================\n');

  const report: VerificationReport = {
    totalResources: ALL_RESOURCES.length,
    resourcesPerCategory: {},
    resourcesPerLanguage: {},
    unwhitelistedDuplicateUrls: [],
    whitelistedDuplicateUrls: [],
    duplicateIds: [],
    missingMetadata: [],
    missingProviders: [],
    missingHours: [],
    missingKeys: [],
    nonFreeResources: [],
    dsaLanguageCoverage: {},
    allDsaCovered: true,
    success: true,
  };

  const idSet = new Set<string>();
  const urlMap = new Map<string, string[]>();

  ALL_RESOURCES.forEach((res, index) => {
    // Category Breakdown
    const cat = res.curriculumKey.split('_')[0] || 'OTHER';
    report.resourcesPerCategory[cat] = (report.resourcesPerCategory[cat] || 0) + 1;

    // Language Breakdown
    report.resourcesPerLanguage[res.language] = (report.resourcesPerLanguage[res.language] || 0) + 1;

    // Duplicate ID check
    if (idSet.has(res.id)) {
      report.duplicateIds.push(res.id);
    } else {
      idSet.add(res.id);
    }

    // URL Tracking
    if (!urlMap.has(res.url)) {
      urlMap.set(res.url, []);
    }
    urlMap.get(res.url)!.push(res.id);

    // Required metadata fields
    if (!res.id || !res.title || !res.url || !res.stage || !res.level) {
      report.missingMetadata.push(`Resource #${index} [${res.id || 'NO-ID'}] missing core metadata`);
    }

    // Provider check
    if (!res.provider || res.provider.trim() === '') {
      report.missingProviders.push(res.id);
    }

    // Estimated Hours check
    if (!res.estimatedHours || res.estimatedHours <= 0) {
      report.missingHours.push(res.id);
    }

    // Curriculum Key check
    if (!res.curriculumKey || res.curriculumKey.trim() === '') {
      report.missingKeys.push(res.id);
    }

    // Free resource check
    if (res.free !== true) {
      report.nonFreeResources.push(res.id);
    }
  });

  // Evaluate URL Duplicates against Whitelist
  urlMap.forEach((ids, url) => {
    if (ids.length > 1) {
      if (ALLOWED_DUPLICATE_URLS[url]) {
        report.whitelistedDuplicateUrls.push(`${url} (Used in ${ids.length} resources)`);
      } else {
        report.unwhitelistedDuplicateUrls.push(`${url} (Used in: ${ids.join(', ')})`);
      }
    }
  });

  // Verify Language Coverage for all DSA Topics
  const dsaKeys = [
    'DSA_ARRAYS',
    'DSA_STRINGS',
    'DSA_SORTING',
    'DSA_BINARY_SEARCH',
    'DSA_LINKED_LIST',
    'DSA_STACK',
    'DSA_QUEUE',
    'DSA_TREES',
    'DSA_BST',
    'DSA_HEAP',
    'DSA_TRIE',
    'DSA_GRAPHS',
    'DSA_DP',
    'DSA_GREEDY',
    'DSA_BACKTRACKING',
    'DSA_SLIDING_WINDOW',
    'DSA_TWO_POINTERS',
    'DSA_BIT_MANIPULATION',
    'DSA_SEGMENT_TREE',
    'DSA_DSU',
  ];

  dsaKeys.forEach((key) => {
    const javaRes = resolveResources(key, 'Java');
    const pythonRes = resolveResources(key, 'Python');
    const cppRes = resolveResources(key, 'C++');

    report.dsaLanguageCoverage[key] = {
      Java: javaRes.length,
      Python: pythonRes.length,
      'C++': cppRes.length,
    };

    if (javaRes.length === 0 || pythonRes.length === 0 || cppRes.length === 0) {
      report.allDsaCovered = false;
    }
  });

  // Overall success determination
  if (
    report.duplicateIds.length > 0 ||
    report.unwhitelistedDuplicateUrls.length > 0 ||
    report.missingMetadata.length > 0 ||
    report.missingProviders.length > 0 ||
    report.missingHours.length > 0 ||
    report.missingKeys.length > 0 ||
    report.nonFreeResources.length > 0 ||
    !report.allDsaCovered
  ) {
    report.success = false;
  }

  // Print Summary & Matrix
  console.log(`✓ Total Curated Resources Audited: ${report.totalResources}`);
  console.log('✓ Category Breakdown:', report.resourcesPerCategory);
  console.log('✓ Language Breakdown:', report.resourcesPerLanguage);
  console.log(`✓ Whitelisted Duplicate URLs (Documented): ${report.whitelistedDuplicateUrls.length}`);
  console.log(`✓ Unwhitelisted Duplicate URLs: ${report.unwhitelistedDuplicateUrls.length}`);
  console.log(`✓ Duplicate IDs: ${report.duplicateIds.length}`);
  console.log(`✓ Missing Providers: ${report.missingProviders.length}`);
  console.log(`✓ Missing Hours: ${report.missingHours.length}`);
  console.log(`✓ Missing Curriculum Keys: ${report.missingKeys.length}`);
  console.log(`✓ Non-Free Resources: ${report.nonFreeResources.length}`);
  console.log(`✓ Complete Multi-Language DSA Matrix Coverage: ${report.allDsaCovered ? 'YES' : 'NO'}\n`);

  if (report.unwhitelistedDuplicateUrls.length > 0) {
    console.error('❌ UNWHITELISTED DUPLICATE URLS FOUND:');
    report.unwhitelistedDuplicateUrls.forEach((u) => console.error(`  - ${u}`));
  }

  return report;
};

// Execute if run directly
if (require.main === module) {
  const result = runResourceLibraryVerification();
  if (!result.success) {
    console.error('\n❌ Resource library verification FAILED.');
    process.exit(1);
  } else {
    console.log('\n✅ Resource library verification PASSED cleanly!');
    process.exit(0);
  }
}
