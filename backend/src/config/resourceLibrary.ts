export interface LibraryResource {
  id: string;
  title: string;
  url: string;
  type: 'video' | 'article' | 'book';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

// Language-specific DSA resources
const DSA_RESOURCES: Record<string, Record<'Java' | 'Python' | 'C++', LibraryResource[]>> = {
  DSA_ARRAYS: {
    Java: [
      { id: 'dsa-arr-java-1', title: 'Kunal Kushwaha: Arrays & ArrayList in Java', url: 'https://youtu.be/n6yDgOyHQQc', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-arr-java-2', title: 'Striver A2Z Java DSA Sheet: Arrays', url: 'https://takeuforward.org/data-structure/strivers-a2z-dsa-course-sheet-2/', type: 'article', difficulty: 'beginner' },
      { id: 'dsa-arr-java-3', title: 'LeetCode Explore: Arrays 101', url: 'https://leetcode.com/explore/learn/card/fun-with-arrays/', type: 'article', difficulty: 'beginner' }
    ],
    Python: [
      { id: 'dsa-arr-py-1', title: 'NeetCode Python: Dynamic Arrays & Static Arrays', url: 'https://neetcode.io/courses/dsa-for-beginners/1', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-arr-py-2', title: 'GeeksforGeeks: Python Arrays', url: 'https://www.geeksforgeeks.org/arrays-in-python/', type: 'article', difficulty: 'beginner' },
      { id: 'dsa-arr-py-3', title: 'LeetCode Explore: Arrays 101', url: 'https://leetcode.com/explore/learn/card/fun-with-arrays/', type: 'article', difficulty: 'beginner' }
    ],
    'C++': [
      { id: 'dsa-arr-cpp-1', title: 'Striver DSA Bootcamp C++: Arrays', url: 'https://youtu.be/37E9ckMDdTk', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-arr-cpp-2', title: 'Abdul Bari: Arrays Representations & Operations', url: 'https://www.youtube.com/playlist?list=PLDN4rrl48XKpZkf03iYFl-O29szjTrs_O', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-arr-cpp-3', title: 'LeetCode Explore: Arrays 101', url: 'https://leetcode.com/explore/learn/card/fun-with-arrays/', type: 'article', difficulty: 'beginner' }
    ]
  },
  DSA_STRINGS: {
    Java: [
      { id: 'dsa-str-java-1', title: 'Kunal Kushwaha: Strings & StringBuilder in Java', url: 'https://youtu.be/zL1DPZ0JVLo', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-str-java-2', title: 'Striver DSA Sheet: String Basics to Advanced', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', type: 'article', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-str-py-1', title: 'Corey Schafer: Python Strings Tutorial', url: 'https://youtu.be/k9TUPpGqYTo', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-str-py-2', title: 'GeeksforGeeks: Python String Methods', url: 'https://www.geeksforgeeks.org/python-string-methods/', type: 'article', difficulty: 'beginner' }
    ],
    'C++': [
      { id: 'dsa-str-cpp-1', title: 'Striver DSA: Introduction to Strings in C++', url: 'https://youtu.be/58a1U5-Z-vM', type: 'video', difficulty: 'beginner' },
      { id: 'dsa-str-cpp-2', title: 'Luv C++: Strings & String streams in C++', url: 'https://youtu.be/lVv1e3bL33k', type: 'video', difficulty: 'beginner' }
    ]
  },
  DSA_SORTING: {
    Java: [
      { id: 'dsa-sort-java-1', title: 'Kunal Kushwaha: Bubble, Selection, Insertion, Merge, Quick Sort', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7gFc1UMAxqv6t5P', type: 'video', difficulty: 'beginner' }
    ],
    Python: [
      { id: 'dsa-sort-py-1', title: 'NeetCode Python: Sorting Algorithms (Bubble, Insertion, Merge)', url: 'https://neetcode.io/courses/dsa-for-beginners/12', type: 'video', difficulty: 'beginner' }
    ],
    'C++': [
      { id: 'dsa-sort-cpp-1', title: 'Striver: Sorting I & II (Bubble, Selection, Insertion, Merge, Quick)', url: 'https://youtu.be/fBnsaEP4z74', type: 'video', difficulty: 'beginner' }
    ]
  },
  DSA_BINARY_SEARCH: {
    Java: [
      { id: 'dsa-bs-java-1', title: 'Kunal Kushwaha: Binary Search Playlist (Java)', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnq7M-ZlKcq1v4vj2Ua6_2T4', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-bs-py-1', title: 'NeetCode Python: Binary Search Theory & LeetCode problems', url: 'https://neetcode.io/courses/dsa-for-beginners/6', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-bs-cpp-1', title: 'Striver: Binary Search Complete Guide (C++)', url: 'https://youtu.be/M3uVJgIh9oM', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_HASHING: {
    Java: [
      { id: 'dsa-hash-java-1', title: 'Kunal Kushwaha: HashMaps & HashSets in Java', url: 'https://youtu.be/H62Jfv1DJlU', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-hash-py-1', title: 'NeetCode Python: HashMaps & HashSets in Python', url: 'https://neetcode.io/courses/dsa-for-beginners/4', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-hash-cpp-1', title: 'Striver: Hashing Basics & Maps in C++', url: 'https://youtu.be/KEs5uyxi33c', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_LINKED_LIST: {
    Java: [
      { id: 'dsa-ll-java-1', title: 'Kunal Kushwaha: Linked List Interview Questions (Java)', url: 'https://youtu.be/58YFWc5a9XA', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-ll-py-1', title: 'NeetCode Python: Singly, Doubly, & Circular Linked Lists', url: 'https://neetcode.io/courses/dsa-for-beginners/5', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-ll-cpp-1', title: 'Striver: Singly & Doubly Linked Lists in C++', url: 'https://youtu.be/q8gdBn9RPeI', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_STACK: {
    Java: [
      { id: 'dsa-stack-java-1', title: 'Kunal Kushwaha: Stacks & Queues in Java', url: 'https://youtu.be/rIQgssEAHwA', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-stack-py-1', title: 'NeetCode Python: Stacks and Queues implementation', url: 'https://neetcode.io/courses/dsa-for-beginners/8', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-stack-cpp-1', title: 'Striver: Stacks & Queues Basics & Advanced Sheets', url: 'https://takeuforward.org/data-structure/stacks-and-queues-strivers-a2z-dsa-course-sheet/', type: 'article', difficulty: 'intermediate' }
    ]
  },
  DSA_QUEUE: {
    Java: [
      { id: 'dsa-queue-java-1', title: 'Kunal Kushwaha: Stacks & Queues in Java', url: 'https://youtu.be/rIQgssEAHwA', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-queue-py-1', title: 'NeetCode Python: Stacks and Queues implementation', url: 'https://neetcode.io/courses/dsa-for-beginners/8', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-queue-cpp-1', title: 'Striver: Stacks & Queues Basics & Advanced Sheets', url: 'https://takeuforward.org/data-structure/stacks-and-queues-strivers-a2z-dsa-course-sheet/', type: 'article', difficulty: 'intermediate' }
    ]
  },
  DSA_TREES: {
    Java: [
      { id: 'dsa-tree-java-1', title: 'Kunal Kushwaha: Trees, Binary Trees, DFS, BFS (Java)', url: 'https://youtu.be/f5zZ4yO1B20', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-tree-py-1', title: 'NeetCode Python: Binary Tree DFS & BFS', url: 'https://neetcode.io/courses/dsa-for-beginners/17', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-tree-cpp-1', title: 'Striver: Binary Tree Playlist (C++)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0q8Hkd7bK2Bpryj2xVJk8Vk', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_BST: {
    Java: [
      { id: 'dsa-bst-java-1', title: 'Striver: Binary Search Trees Tutorial', url: 'https://youtu.be/pDKuiElg96Q', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-bst-py-1', title: 'NeetCode Python: Binary Search Tree operations', url: 'https://neetcode.io/courses/dsa-for-beginners/19', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-bst-cpp-1', title: 'Striver: BST Playlist (C++)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0t4uB50iaYZbMleldE1S69y', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_HEAP: {
    Java: [
      { id: 'dsa-heap-java-1', title: 'Kunal Kushwaha: Heaps & PriorityQueues in Java', url: 'https://youtu.be/3dyJhGPQ57M', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-heap-py-1', title: 'NeetCode Python: Heap Implementation & Operations', url: 'https://neetcode.io/courses/dsa-for-beginners/23', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-heap-cpp-1', title: 'Abdul Bari: Heap Sort & Heap Construction', url: 'https://youtu.be/H5kA3yIBBGQ', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_TRIE: {
    Java: [
      { id: 'dsa-trie-java-1', title: 'Striver: Trie Data Structure Playlist', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0pcIDCZnxhv0NZJK5KQN0Yl', type: 'video', difficulty: 'advanced' }
    ],
    Python: [
      { id: 'dsa-trie-py-1', title: 'NeetCode: Prefix Trees (Trie) Tutorial', url: 'https://youtu.be/oobqoRuObys', type: 'video', difficulty: 'advanced' }
    ],
    'C++': [
      { id: 'dsa-trie-cpp-1', title: 'Striver: Trie Implementation C++', url: 'https://youtu.be/dBGUmUQhJaM', type: 'video', difficulty: 'advanced' }
    ]
  },
  DSA_GRAPHS: {
    Java: [
      { id: 'dsa-graph-java-1', title: 'Striver: Graph Playlist (Java)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3g1t1gT0GsDYmF0gMC9g', type: 'video', difficulty: 'advanced' }
    ],
    Python: [
      { id: 'dsa-graph-py-1', title: 'NeetCode Python: Graphs DFS & BFS Algorithms', url: 'https://neetcode.io/courses/dsa-for-beginners/26', type: 'video', difficulty: 'advanced' }
    ],
    'C++': [
      { id: 'dsa-graph-cpp-1', title: 'Striver: Graph Playlist (C++)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0oE3g1t1gT0GsDYmF0gMC9g', type: 'video', difficulty: 'advanced' }
    ]
  },
  DSA_DP: {
    Java: [
      { id: 'dsa-dp-java-1', title: 'Striver: Dynamic Programming (Java)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5y6ysfCcnPxTP_GFLu', type: 'video', difficulty: 'advanced' }
    ],
    Python: [
      { id: 'dsa-dp-py-1', title: 'freeCodeCamp: Dynamic Programming Tutorial (Python)', url: 'https://youtu.be/oBt53YbR9Kk', type: 'video', difficulty: 'advanced' }
    ],
    'C++': [
      { id: 'dsa-dp-cpp-1', title: 'Striver: Dynamic Programming Playlist (C++)', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0qUlt5y6ysfCcnPxTP_GFLu', type: 'video', difficulty: 'advanced' }
    ]
  },
  DSA_GREEDY: {
    Java: [
      { id: 'dsa-greedy-java-1', title: 'Striver: Greedy Algorithms Playlist', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0pl5q_9n2L8fQ-QkGgq-zGq', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-greedy-py-1', title: 'NeetCode Python: Greedy Algorithms Strategy', url: 'https://neetcode.io/practice', type: 'article', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-greedy-cpp-1', title: 'Striver: Greedy Algorithms C++', url: 'https://youtu.be/F2oVlh584bA', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_BACKTRACKING: {
    Java: [
      { id: 'dsa-bt-java-1', title: 'Kunal Kushwaha: Recursion & Backtracking in Java', url: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnpFD6g2t2Wnmj1D6Uj1G2eP', type: 'video', difficulty: 'advanced' }
    ],
    Python: [
      { id: 'dsa-bt-py-1', title: 'NeetCode Python: Backtracking Algorithms (N-Queens, Sudoku)', url: 'https://youtu.be/Nn81Ipq-Aqo', type: 'video', difficulty: 'advanced' }
    ],
    'C++': [
      { id: 'dsa-bt-cpp-1', title: 'Abdul Bari: Backtracking Algorithms', url: 'https://youtu.be/DKCtRlh0ES8', type: 'video', difficulty: 'advanced' }
    ]
  },
  DSA_SLIDING_WINDOW: {
    Java: [
      { id: 'dsa-sw-java-1', title: 'Striver: Sliding Window & Two Pointer Playlist', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0q7ve7bK+/8sVyB1DX86Pry', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-sw-py-1', title: 'NeetCode Python: Sliding Window Strategy & LeetCode problems', url: 'https://youtu.be/UseZaYi80Ko', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-sw-cpp-1', title: 'Striver: Sliding Window Playlist', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0q7ve7bK+/8sVyB1DX86Pry', type: 'video', difficulty: 'intermediate' }
    ]
  },
  DSA_TWO_POINTERS: {
    Java: [
      { id: 'dsa-tp-java-1', title: 'Kunal Kushwaha: Two Pointers approach & Binary Search applications', url: 'https://youtu.be/n6yDgOyHQQc', type: 'video', difficulty: 'beginner' }
    ],
    Python: [
      { id: 'dsa-tp-py-1', title: 'NeetCode Python: Two Pointers Pattern', url: 'https://youtu.be/cQ1Oz4kDlh8', type: 'video', difficulty: 'beginner' }
    ],
    'C++': [
      { id: 'dsa-tp-cpp-1', title: 'Striver: Two Pointer Strategy and Array patterns', url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/', type: 'article', difficulty: 'beginner' }
    ]
  },
  DSA_BIT_MANIPULATION: {
    Java: [
      { id: 'dsa-bit-java-1', title: 'Kunal Kushwaha: Maths & Bit Manipulation in DSA (Java)', url: 'https://youtu.be/fzip9AfWRGE', type: 'video', difficulty: 'intermediate' }
    ],
    Python: [
      { id: 'dsa-bit-py-1', title: 'NeetCode Python: Bit Manipulation Tricks', url: 'https://youtu.be/5RTFGsGXpTE', type: 'video', difficulty: 'intermediate' }
    ],
    'C++': [
      { id: 'dsa-bit-cpp-1', title: 'Striver: Bit Manipulation Complete Playlist', url: 'https://www.youtube.com/playlist?list=PLgUwDviBIf0rnqnSPc_Wj1FuaQTRA8pKM', type: 'video', difficulty: 'intermediate' }
    ]
  }
};

// Non-DSA / General SDE curriculum resources
const GENERAL_RESOURCES: Record<string, LibraryResource[]> = {
  DEV_GIT: [
    { id: 'dev-git-1', title: 'Git & GitHub Official Documentation', url: 'https://git-scm.com/doc', type: 'article', difficulty: 'beginner' },
    { id: 'dev-git-2', title: 'freeCodeCamp: Git and GitHub for Beginners', url: 'https://youtu.be/RGOj5yH7evk', type: 'video', difficulty: 'beginner' }
  ],
  DEV_HTML: [
    { id: 'dev-html-1', title: 'MDN Web Docs: Learn HTML', url: 'https://developer.mozilla.org/en-US/docs/Learn/HTML', type: 'article', difficulty: 'beginner' }
  ],
  DEV_CSS: [
    { id: 'dev-css-1', title: 'MDN Web Docs: Learn CSS', url: 'https://developer.mozilla.org/en-US/docs/Learn/CSS', type: 'article', difficulty: 'beginner' }
  ],
  DEV_JAVASCRIPT: [
    { id: 'dev-js-1', title: 'MDN Web Docs: JavaScript Guide', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript', type: 'article', difficulty: 'beginner' },
    { id: 'dev-js-2', title: 'javascript.info: The Modern JavaScript Tutorial', url: 'https://javascript.info', type: 'book', difficulty: 'intermediate' }
  ],
  DEV_REACT: [
    { id: 'dev-react-1', title: 'Official React Documentation & Guides', url: 'https://react.dev', type: 'article', difficulty: 'intermediate' },
    { id: 'dev-react-2', title: 'Namaste React by Akshay Saini', url: 'https://www.youtube.com/playlist?list=PLlasXeu85E9cQ32gLCgSeGtxmFVCglaCx', type: 'video', difficulty: 'intermediate' }
  ],
  DEV_NEXTJS: [
    { id: 'dev-next-1', title: 'Official Next.js Documentation', url: 'https://nextjs.org/docs', type: 'article', difficulty: 'advanced' },
    { id: 'dev-next-2', title: 'Vercel Next.js Learn Course', url: 'https://nextjs.org/learn', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_NODE: [
    { id: 'dev-node-1', title: 'Official Node.js Documentation & APIs', url: 'https://nodejs.org/docs', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_EXPRESS: [
    { id: 'dev-express-1', title: 'Official Express.js Getting Started Guide', url: 'https://expressjs.com', type: 'article', difficulty: 'beginner' }
  ],
  DEV_MONGODB: [
    { id: 'dev-db-mongo', title: 'Official MongoDB Manual & Architecture Guides', url: 'https://www.mongodb.com/docs/manual/', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_SQL: [
    { id: 'dev-db-sql', title: 'SQLZoo Interactive SQL Tutorial', url: 'https://sqlzoo.net', type: 'article', difficulty: 'beginner' }
  ],
  DEV_DOCKER: [
    { id: 'dev-docker-1', title: 'Official Docker Documentation & Architecture', url: 'https://docs.docker.com', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_AWS: [
    { id: 'dev-aws-1', title: 'Official AWS Skill Builder Online Learning Platform', url: 'https://aws.amazon.com/training/skills-builder/', type: 'article', difficulty: 'beginner' }
  ],
  DEV_DEPLOYMENT: [
    { id: 'dev-dep-1', title: 'Vercel Deployment Guide', url: 'https://vercel.com/docs', type: 'article', difficulty: 'beginner' },
    { id: 'dev-dep-2', title: 'Render Deployment Documentation', url: 'https://render.com/docs', type: 'article', difficulty: 'beginner' }
  ],
  DEV_REST_APIS: [
    { id: 'dev-rest-1', title: 'MDN Web Docs: HTTP & REST API Design Basics', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_AUTHENTICATION: [
    { id: 'dev-auth-1', title: 'Auth0: Introduction to JSON Web Tokens (JWT)', url: 'https://jwt.io/introduction', type: 'article', difficulty: 'intermediate' }
  ],
  DEV_REDIS: [
    { id: 'dev-redis-1', title: 'Official Redis Documentation & Get Started Guide', url: 'https://redis.io/docs', type: 'article', difficulty: 'advanced' }
  ],
  CS_OS: [
    { id: 'cs-os-1', title: 'Gate Smashers: Operating Systems (OS) Playlist', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', type: 'video', difficulty: 'intermediate' }
  ],
  CS_CN: [
    { id: 'cs-cn-1', title: 'Gate Smashers: Computer Networks (CN) Playlist', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLgD2aNp2B', type: 'video', difficulty: 'intermediate' },
    { id: 'cs-cn-2', title: 'Computer Networking by Kurose & Ross Online Lectures', url: 'https://gaia.cs.umass.edu/kurose_ross/online_lectures.htm', type: 'video', difficulty: 'intermediate' }
  ],
  CS_DBMS: [
    { id: 'cs-dbms-1', title: 'GeeksforGeeks: DBMS Tutorials & Cheat Sheet', url: 'https://www.geeksforgeeks.org/dbms/', type: 'article', difficulty: 'intermediate' },
    { id: 'cs-dbms-2', title: 'Gate Smashers: DBMS Playlist', url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGGWpErHsJeU15Lfy1dFXX_', type: 'video', difficulty: 'intermediate' }
  ],
  CS_OOP: [
    { id: 'cs-oop-1', title: 'GeeksforGeeks: Object Oriented Programming Principles', url: 'https://www.geeksforgeeks.org/object-oriented-programming-in-cpp/', type: 'article', difficulty: 'beginner' }
  ],
  CS_SYSTEM_DESIGN: [
    { id: 'cs-sd-1', title: 'Gaurav Sen: System Design (HLD & LLD) Playlist', url: 'https://www.youtube.com/playlist?list=PLMCXHnjXnJeMhsRx1hF9mGZ7bjd50A1r7', type: 'video', difficulty: 'advanced' },
    { id: 'cs-sd-2', title: 'System Design Primer (GitHub) by Donne Martin', url: 'https://github.com/donnemartin/system-design-primer', type: 'article', difficulty: 'advanced' }
  ],
  APT_QUANT: [
    { id: 'apt-quant-1', title: 'IndiaBix: Quantitative Aptitude Questions & Exercises', url: 'https://www.indiabix.com/quantitative-aptitude/questions-and-answers/', type: 'article', difficulty: 'intermediate' }
  ],
  APT_LOGICAL: [
    { id: 'apt-log-1', title: 'IndiaBix: Logical Reasoning Questions & Solved Practice', url: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', type: 'article', difficulty: 'intermediate' }
  ],
  APT_VERBAL: [
    { id: 'apt-verb-1', title: 'IndiaBix: Verbal Ability Practice Exercises', url: 'https://www.indiabix.com/verbal-ability/questions-and-answers/', type: 'article', difficulty: 'intermediate' }
  ],
  INT_RESUME: [
    { id: 'prep-res-1', title: 'How to Build a Tech Resume (Google Recruiter Tips)', url: 'https://www.freecodecamp.org/news/how-to-write-a-tech-resume/', type: 'article', difficulty: 'beginner' },
    { id: 'prep-li-1', title: 'LinkedIn Profile Optimization Guide for Software Engineers', url: 'https://www.freecodecamp.org/news/linkedin-profile-optimization-for-developers/', type: 'article', difficulty: 'beginner' }
  ],
  INT_BEHAVIORAL: [
    { id: 'prep-beh-1', title: 'STAR Method for SDE Behavioral Interviews', url: 'https://youtu.be/8m1fFm1gXsc', type: 'video', difficulty: 'intermediate' },
    { id: 'prep-comm-1', title: 'Speak Like a Professional Developer (Soft Skills)', url: 'https://www.freecodecamp.org/news/developer-soft-skills-communication-tips/', type: 'article', difficulty: 'beginner' }
  ],
  INT_HR: [
    { id: 'prep-comm-1-dup', title: 'Speak Like a Professional Developer (Soft Skills)', url: 'https://www.freecodecamp.org/news/developer-soft-skills-communication-tips/', type: 'article', difficulty: 'beginner' }
  ],
  INT_MOCK: [
    { id: 'prep-mock-1', title: 'Pramp: Free Mock Interview Platform for Software Developers', url: 'https://www.pramp.com', type: 'article', difficulty: 'advanced' },
    { id: 'prep-mock-2', title: 'InterviewBit: SDE Interview Questions & Mock rounds', url: 'https://www.interviewbit.com', type: 'article', difficulty: 'advanced' }
  ]
};

/**
 * Resolves a curriculum key into high-quality resources, matching user's preferred DSA language if it is a DSA topic.
 *
 * @param curriculumKey Key indicating topic e.g., 'DSA_ARRAYS', 'DEV_REACT', 'CS_OS'
 * @param dsaLanguage Student's preferred DSA Language: 'Java' | 'Python' | 'C++'
 * @returns Curated LibraryResource[] array.
 */
export const resolveResources = (
  curriculumKey: string,
  dsaLanguage: 'Java' | 'Python' | 'C++' = 'Java'
): LibraryResource[] => {
  const normalizedKey = curriculumKey.trim().toUpperCase();

  // If it's a DSA resource
  if (DSA_RESOURCES[normalizedKey]) {
    const langSet = DSA_RESOURCES[normalizedKey];
    return langSet[dsaLanguage] || langSet['Java'];
  }

  // General SDE resource
  if (GENERAL_RESOURCES[normalizedKey]) {
    return GENERAL_RESOURCES[normalizedKey];
  }

  // Return empty list if key not found (resilient check)
  return [];
};
