export interface SoftwareEngineerMonth {
  number: number;
  title: string;
  focus: string;
  topics: string[];
  tools: string[];
  youtube: {
    channel: string;
    bestFor: string;
    searchUrl: string;
  }[];
  project: {
    title: string;
    description: string;
  };
}

export const softwareEngineerRoadmap: SoftwareEngineerMonth[] = [
  {
    number: 1,
    title: "Programming Fundamentals + OOP + Git",
    focus: "Syntax basics, Object-Oriented Programming (OOP) concepts, and Git workflow",
    topics: [
      "Language basics (Python, Java, or C++): variables, data types, operators, control flow (if/else, loops), and functions",
      "Object-Oriented Programming (OOP) — classes, objects, constructors, encapsulation, inheritance, polymorphism, abstraction, and interfaces",
      "Arrays, Strings, basic exception/error handling, and file handling basics",
      "Git & GitHub basics — init, add, commit, push, pull, branching, merging, resolving conflicts, and pull requests"
    ],
    tools: ["Python 3.12+ / JDK 21 / GCC", "VS Code / IntelliJ IDEA", "Git", "GitHub"],
    youtube: [
      {
        channel: "CodeWithHarry",
        bestFor: "Beginner-friendly, covers Python/Java/C++ fundamentals + Git",
        searchUrl: "https://www.youtube.com/@CodeWithHarry"
      },
      {
        channel: "Apna College",
        bestFor: "Structured programming + OOP course with practice sheets",
        searchUrl: "https://www.youtube.com/results?search_query=Apna+College+OOP"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-length free courses on Python/Java/C++ basics",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+programming"
      }
    ],
    project: {
      title: "CLI Contact Book or Inventory Manager",
      description: "Build a console application using OOP concepts to manage contacts or inventory (CRUD operations). Push it to GitHub with a README."
    }
  },
  {
    number: 2,
    title: "DSA Part 1 (Foundations) + Problem Solving Habit",
    focus: "Core linear data structures, search/sort algorithms, and recursive thinking",
    topics: [
      "Time & Space Complexity (Big-O), basic math & bit manipulation problems",
      "Searching (linear, binary) & Sorting (bubble, selection, insertion, merge, quicksort)",
      "Recursion & Backtracking basics, Strings problems",
      "Linked Lists (singly/doubly), Stacks, Queues, Hashing (HashMap/HashSet based problems)"
    ],
    tools: ["LeetCode", "GeeksforGeeks", "GitHub (DSA Journal)"],
    youtube: [
      {
        channel: "Take U Forward (Striver)",
        bestFor: "The 'A2Z DSA Sheet' — the most-followed structured DSA course",
        searchUrl: "https://www.youtube.com/results?search_query=Take+U+Forward+DSA"
      },
      {
        channel: "Abdul Bari",
        bestFor: "Best conceptual/algorithmic clarity, language-agnostic theory",
        searchUrl: "https://www.youtube.com/results?search_query=Abdul+Bari+Algorithms"
      },
      {
        channel: "NeetCode",
        bestFor: "Pattern-based problem walkthroughs, great for building intuition",
        searchUrl: "https://www.youtube.com/@NeetCode"
      }
    ],
    project: {
      title: "DSA Journal & 100 Solved Problems",
      description: "Solve 100 easy-to-medium LeetCode/GeeksforGeeks problems covering linear structures, search/sort, and recursion, logging your solutions on GitHub."
    }
  },
  {
    number: 3,
    title: "Core CS Subjects (DBMS + OS) + DSA Part 2 (Trees)",
    focus: "Relational database concepts, SQL queries, OS scheduling, and tree data structures",
    topics: [
      "DBMS: ER modeling, normalization (1NF–3NF), keys, ACID transactions, and indexing basics",
      "SQL practice: joins, group by, subqueries, and window functions",
      "Operating Systems: processes vs. threads, CPU scheduling, deadlocks, memory management (paging/segmentation), and virtual memory",
      "DSA: Trees (Binary Tree, BST, traversals — inorder/preorder/postorder/level-order), Heaps, and intro to Tries"
    ],
    tools: ["MySQL", "PostgreSQL", "DBeaver", "LeetCode"],
    youtube: [
      {
        channel: "Gate Smashers",
        bestFor: "Excellent structured DBMS + OS content, highly interview relevant",
        searchUrl: "https://www.youtube.com/results?search_query=Gate+Smashers+DBMS"
      },
      {
        channel: "Neso Academy",
        bestFor: "Very clear, animated explanations of OS and DBMS concepts",
        searchUrl: "https://www.youtube.com/results?search_query=Neso+Academy+DBMS"
      },
      {
        channel: "Jenny's Lectures CS/IT",
        bestFor: "Detailed DBMS & Data Structures lecture-style teaching",
        searchUrl: "https://www.youtube.com/results?search_query=Jenny%27s+Lectures+DBMS"
      }
    ],
    project: {
      title: "Relational DB Schema Design & Normalized Queries",
      description: "Design a normalized relational database schema (e.g. library or e-commerce schema) and write 15-20 analytical SQL queries against it."
    }
  },
  {
    number: 4,
    title: "Computer Networks + Web/Backend Development + Docker",
    focus: "Network protocols, full-stack REST API development, and app containerization",
    topics: [
      "Computer Networks: OSI/TCP-IP model, HTTP/HTTPS, DNS, TCP vs. UDP, and basics of REST",
      "Frontend basics: HTML, CSS, JavaScript DOM manipulation and API fetch calls",
      "Backend basics: pick Node.js/Express, Spring Boot, or Django/Flask; build REST APIs and connect database",
      "Docker: Dockerfile basics, Docker Compose (app + database together), and Git branching workflows"
    ],
    tools: ["Postman", "Docker Desktop", "Node.js/Express or Spring Boot or Django"],
    youtube: [
      {
        channel: "Gate Smashers",
        bestFor: "Computer Networks playlist — clear, exam & interview focused",
        searchUrl: "https://www.youtube.com/results?search_query=Gate+Smashers+Computer+Networks"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-stack web dev crash courses and framework tutorials",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Web+Development"
      },
      {
        channel: "TechWorld with Nana",
        bestFor: "The best channel for Docker containerization fundamentals",
        searchUrl: "https://www.youtube.com/@TechWorldwithNana"
      }
    ],
    project: {
      title: "Dockerized Full-Stack CRUD Application",
      description: "Build a complete CRUD application (Task Manager/Blog) connected to a relational database, dockerize it using Docker Compose, and document setup."
    }
  },
  {
    number: 5,
    title: "DSA Part 3 (Advanced) + System Design + AI Tools + Capstone",
    focus: "Graphs/DP, system design basics, AI-assisted development tools, and mock interviews",
    topics: [
      "Graphs (BFS/DFS, Dijkstra's shortest path), Dynamic Programming fundamentals (Fibonacci-style to knapsack-style), and Greedy algorithm basics",
      "System Design: scalability, load balancing, caching (Redis), SQL vs. NoSQL, database sharding/indexing, designing URL shortener or rate limiter",
      "AI-assisted development: using GitHub Copilot/Cursor/Claude Code effectively (prompting, reviewing, debugging with AI)",
      "Capstone project, resume + LinkedIn + GitHub profile polish, mock interviews, and final review"
    ],
    tools: ["LeetCode (200+ solved)", "Excalidraw", "GitHub Copilot / Cursor / Claude Code", "Render / Railway / Vercel"],
    youtube: [
      {
        channel: "Gaurav Sen",
        bestFor: "Beginner-friendly system design walkthroughs with real-world examples",
        searchUrl: "https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design"
      },
      {
        channel: "ByteByteGo",
        bestFor: "Visual, concise system design explainers and patterns",
        searchUrl: "https://www.youtube.com/@ByteByteGo"
      },
      {
        channel: "Fireship",
        bestFor: "Fast, sharp coverage of AI coding tools and modern dev trends",
        searchUrl: "https://www.youtube.com/results?search_query=Fireship+Cursor+AI"
      }
    ],
    project: {
      title: "Full-Stack Capstone Project with CI/CD",
      description: "Build a production-style full-stack app with authentication, database, basic GitHub Actions CI/CD pipeline, and deploy it live."
    }
  }
];
