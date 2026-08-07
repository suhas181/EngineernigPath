import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { LearningResource } from '../models/LearningResource';
import { CANONICAL_CAREER_PATHS } from '../constants/careerPaths';

dotenv.config({ path: path.join(__dirname, '../../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/engineerpath';

// Exact enum options from User Profile schema:
// 1. "Software Engineer (SDE)"
// 2. "Frontend Engineer"
// 3. "Backend Engineer"
// 4. "Full Stack Developer"
// 5. "AI / ML Engineer"
// 6. "Data Scientist / Analyst"
// 7. "DevOps Engineer"
// 8. "Mobile App Developer"

export const curatedResources = [
  // ─── 1. SOFTWARE ENGINEER / SDE & CORE DSA ─────────────────────────────────────
  {
    topic: 'DSA: Arrays, Sorting & Binary Search',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'Full Stack Developer'],
    title: "Striver's A2Z DSA Course & Sheet (TakeUForward)",
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    type: 'course',
    difficulty: 'Beginner',
  },
  {
    topic: 'DSA: Arrays, Sorting & Binary Search',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'Full Stack Developer'],
    title: 'Kunal Kushwaha Complete Java + DSA Bootcamp',
    url: 'https://www.youtube.com/@kunalkushwaha',
    type: 'video',
    difficulty: 'Beginner',
  },
  {
    topic: 'DSA: Strings & Recursion',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'Full Stack Developer'],
    title: "Striver's Recursion & Backtracking Series",
    url: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    type: 'course',
    difficulty: 'Beginner',
  },
  {
    topic: 'DSA: Linked Lists, Stacks & Queues',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'Full Stack Developer'],
    title: 'LeetCode Problem Study Plans & Explore',
    url: 'https://leetcode.com/explore/',
    type: 'practice',
    difficulty: 'Intermediate',
  },
  {
    topic: 'DSA: Trees, Heaps & Tries',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer'],
    title: 'NeetCode 150 & Algorithms Practice',
    url: 'https://neetcode.io/',
    type: 'practice',
    difficulty: 'Intermediate',
  },
  {
    topic: 'DSA: Graphs & Dynamic Programming',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer'],
    title: 'MIT OCW 6.006 Introduction to Algorithms (Python)',
    url: 'https://ocw.mit.edu/courses/6-006-introduction-to-algorithms-fall-2011/',
    type: 'course',
    difficulty: 'Advanced',
  },
  {
    topic: 'Theory Fundamentals: OOPs, DBMS, OS & Computer Networks',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'Full Stack Developer'],
    title: 'GeeksforGeeks Skill-Up CS Core Subjects',
    url: 'https://www.geeksforgeeks.org/batch/skill-up-cs-core-subject?tab=Resources',
    type: 'course',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Theory Fundamentals: OOPs, DBMS, OS & Computer Networks',
    careerPaths: ['Software Engineer (SDE)', 'Backend Engineer', 'DevOps Engineer'],
    title: 'Gate Smashers Operating System & DBMS Series',
    url: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6X58XM',
    type: 'video',
    difficulty: 'Beginner',
  },
  {
    topic: 'Aptitude & Quantitative Reasoning',
    careerPaths: ['Software Engineer (SDE)', 'Frontend Engineer', 'Backend Engineer', 'Full Stack Developer'],
    title: 'IndiaBIX Quantitative Aptitude & Placement Papers',
    url: 'https://www.indiabix.com/',
    type: 'practice',
    difficulty: 'Beginner',
  },

  // ─── 2. FRONTEND ENGINEER ───────────────────────────────────────────────────
  {
    topic: 'Semantic HTML5 & Modern CSS Layouts',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer'],
    title: 'A Complete Guide to Flexbox (CSS-Tricks)',
    url: 'https://css-tricks.com/snippets/css/a-guide-to-flexbox/',
    type: 'article',
    difficulty: 'Beginner',
  },
  {
    topic: 'Semantic HTML5 & Modern CSS Layouts',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer'],
    title: 'MDN Web Docs: CSS Grid Layout',
    url: 'https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_grid_layout',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'JavaScript Deep Dive & Asynchronous Programming',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer', 'Backend Engineer'],
    title: 'JavaScript.info: Modern JS Tutorial',
    url: 'https://javascript.info/',
    type: 'article',
    difficulty: 'Intermediate',
  },
  {
    topic: 'React Core, Custom Hooks & State Management',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer'],
    title: 'Official React Documentation (react.dev)',
    url: 'https://react.dev/learn',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Next.js SSR/SSG & Frontend Architecture',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer'],
    title: 'Next.js Official Learn Course (App Router)',
    url: 'https://nextjs.org/learn',
    type: 'course',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Semantic HTML5 & Modern CSS Layouts',
    careerPaths: ['Frontend Engineer'],
    title: 'Web.dev Learn Accessibility Course',
    url: 'https://web.dev/learn/accessibility',
    type: 'course',
    difficulty: 'Beginner',
  },
  {
    topic: 'React Core, Custom Hooks & State Management',
    careerPaths: ['Frontend Engineer', 'Full Stack Developer'],
    title: 'Tailwind CSS Documentation & Utility Reference',
    url: 'https://tailwindcss.com/docs',
    type: 'documentation',
    difficulty: 'Beginner',
  },

  // ─── 3. BACKEND ENGINEER ───────────────────────────────────────────────────
  {
    topic: 'Server Systems, Node.js Runtimes & REST Architecture',
    careerPaths: ['Backend Engineer', 'Full Stack Developer'],
    title: 'Express.js Official Guide & API Reference',
    url: 'https://expressjs.com/en/starter/installing.html',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Server Systems, Node.js Runtimes & REST Architecture',
    careerPaths: ['Backend Engineer'],
    title: 'Node.js Official Event Loop Architecture Guide',
    url: 'https://nodejs.org/en/learnevent-loop-timers-and-nexttick',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Relational Databases, SQL Schemas & Indexing',
    careerPaths: ['Backend Engineer', 'Full Stack Developer', 'Data Scientist / Analyst'],
    title: 'PostgreSQL Tutorial: Learn PostgreSQL Database',
    url: 'https://www.postgresqltutorial.com/',
    type: 'article',
    difficulty: 'Beginner',
  },
  {
    topic: 'NoSQL Databases, MongoDB & Redis Caching',
    careerPaths: ['Backend Engineer', 'Full Stack Developer'],
    title: 'MongoDB Manual & Aggregation Pipeline Docs',
    url: 'https://www.mongodb.com/docs/manual/',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'NoSQL Databases, MongoDB & Redis Caching',
    careerPaths: ['Backend Engineer', 'Full Stack Developer', 'DevOps Engineer'],
    title: 'Redis University & Commands Reference',
    url: 'https://redis.io/docs/',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Microservices, Docker & System Design Architecture',
    careerPaths: ['Backend Engineer', 'DevOps Engineer', 'Software Engineer (SDE)'],
    title: 'The System Design Primer (donnemartin)',
    url: 'https://github.com/donnemartin/system-design-primer',
    type: 'article',
    difficulty: 'Advanced',
  },

  // ─── 4. FULL STACK DEVELOPER ────────────────────────────────────────────────
  {
    topic: 'Fullstack Web Foundations (HTML5, CSS3, JS & React)',
    careerPaths: ['Full Stack Developer'],
    title: 'freeCodeCamp Full Stack MERN Application Guide',
    url: 'https://www.freecodecamp.org/news/tag/mern/',
    type: 'article',
    difficulty: 'Beginner',
  },
  {
    topic: 'Authentication, Security & Next.js Fullstack Framework',
    careerPaths: ['Full Stack Developer', 'Backend Engineer'],
    title: 'Auth0 JSON Web Token (JWT) Security Handbook',
    url: 'https://auth0.com/docs/secure/tokens/json-web-tokens',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Backend APIs, Express Server & Database Engineering',
    careerPaths: ['Full Stack Developer', 'Backend Engineer'],
    title: 'Prisma ORM Documentation & Quickstart',
    url: 'https://www.prisma.io/docs',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Fullstack Deployment, Docker & Performance Optimization',
    careerPaths: ['Full Stack Developer'],
    title: 'Vercel Deployment Documentation',
    url: 'https://vercel.com/docs',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Backend APIs, Express Server & Database Engineering',
    careerPaths: ['Full Stack Developer', 'Backend Engineer'],
    title: 'Zod TypeScript First Schema Validation',
    url: 'https://zod.dev/',
    type: 'documentation',
    difficulty: 'Beginner',
  },

  // ─── 5. DEVOPS ENGINEER ─────────────────────────────────────────────────────
  {
    topic: 'Linux Systems Administration & Shell Scripting',
    careerPaths: ['DevOps Engineer', 'Backend Engineer'],
    title: 'Linux Command Line Basics for Beginners (freeCodeCamp)',
    url: 'https://www.freecodecamp.org/news/the-linux-commands-handbook/',
    type: 'article',
    difficulty: 'Beginner',
  },
  {
    topic: 'Containerization with Docker & Container Security',
    careerPaths: ['DevOps Engineer', 'Backend Engineer', 'Full Stack Developer'],
    title: 'Docker Official Getting Started Guide',
    url: 'https://docs.docker.com/get-started/',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Kubernetes Cluster Orchestration & Management',
    careerPaths: ['DevOps Engineer'],
    title: 'Kubernetes Official Basics Tutorial',
    url: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Infrastructure as Code (Terraform), CI/CD & Cloud',
    careerPaths: ['DevOps Engineer'],
    title: 'HashiCorp Terraform Tutorials (AWS)',
    url: 'https://developer.hashicorp.com/terraform/tutorials',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Infrastructure as Code (Terraform), CI/CD & Cloud',
    careerPaths: ['DevOps Engineer'],
    title: 'GitHub Actions Documentation',
    url: 'https://docs.github.com/en/actions',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Infrastructure as Code (Terraform), CI/CD & Cloud',
    careerPaths: ['DevOps Engineer'],
    title: 'Prometheus & Grafana Monitoring Documentation',
    url: 'https://prometheus.io/docs/introduction/overview/',
    type: 'documentation',
    difficulty: 'Intermediate',
  },

  // ─── 6. AI / ML ENGINEER ────────────────────────────────────────────────────
  {
    topic: 'Python for Data Science, Math & Statistics Foundations',
    careerPaths: ['AI / ML Engineer', 'Data Scientist / Analyst'],
    title: 'NumPy Absolute Beginner Guide',
    url: 'https://numpy.org/doc/stable/user/absolute_beginners.html',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Python for Data Science, Math & Statistics Foundations',
    careerPaths: ['AI / ML Engineer', 'Data Scientist / Analyst'],
    title: 'Pandas Official User Guide & Tutorials',
    url: 'https://pandas.pydata.org/docs/user_guide/index.html',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Classical Machine Learning Algorithms & Scikit-Learn',
    careerPaths: ['AI / ML Engineer', 'Data Scientist / Analyst'],
    title: 'Scikit-Learn Official User Guide',
    url: 'https://scikit-learn.org/stable/user_guide.html',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Deep Learning Foundations, Neural Networks & PyTorch',
    careerPaths: ['AI / ML Engineer'],
    title: 'PyTorch Deep Learning 60 Minute Blitz',
    url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    type: 'course',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Computer Vision / NLP & Generative AI (LLMs)',
    careerPaths: ['AI / ML Engineer'],
    title: 'Hugging Face NLP & Transformers Course',
    url: 'https://huggingface.co/learn/nlp-course/chapter1/1',
    type: 'course',
    difficulty: 'Advanced',
  },
  {
    topic: 'Classical Machine Learning Algorithms & Scikit-Learn',
    careerPaths: ['AI / ML Engineer', 'Data Scientist / Analyst'],
    title: 'Andrew Ng Machine Learning Specialization',
    url: 'https://www.coursera.org/specializations/machine-learning-introduction',
    type: 'course',
    difficulty: 'Beginner',
  },

  // ─── 7. DATA SCIENTIST / ANALYST ───────────────────────────────────────────
  {
    topic: 'Data Wrangling, Advanced SQL & Python Analytics',
    careerPaths: ['Data Scientist / Analyst', 'Backend Engineer'],
    title: 'LeetCode Database Problem Set (SQL)',
    url: 'https://leetcode.com/problemset/all/',
    type: 'practice',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Exploratory Data Analysis (EDA) & Data Visualization',
    careerPaths: ['Data Scientist / Analyst'],
    title: 'Seaborn Data Visualization Tutorial',
    url: 'https://seaborn.pydata.org/tutorial.html',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Statistical Modeling, Hypothesis Testing & Machine Learning',
    careerPaths: ['Data Scientist / Analyst'],
    title: 'StatQuest with Josh Starmer (Statistics & ML Videos)',
    url: 'https://www.youtube.com/c/joshstarmer',
    type: 'video',
    difficulty: 'Beginner',
  },
  {
    topic: 'Data Wrangling, Advanced SQL & Python Analytics',
    careerPaths: ['Data Scientist / Analyst'],
    title: 'Mode Analytics SQL Tutorial for Data Analysis',
    url: 'https://mode.com/sql-tutorial/',
    type: 'article',
    difficulty: 'Beginner',
  },
  {
    topic: 'Big Data Processing, Model Deployment & MLOps',
    careerPaths: ['Data Scientist / Analyst', 'AI / ML Engineer'],
    title: 'PySpark Official Documentation & Quick Start',
    url: 'https://spark.apache.org/docs/latest/api/python/getting_started/index.html',
    type: 'documentation',
    difficulty: 'Intermediate',
  },

  // ─── 8. MOBILE APP DEVELOPER ───────────────────────────────────────────────
  {
    topic: 'Mobile UI Fundamentals, Layouts & Frameworks',
    careerPaths: ['Mobile App Developer'],
    title: 'React Native Official Getting Started Guide',
    url: 'https://reactnative.dev/docs/getting-started',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Mobile UI Fundamentals, Layouts & Frameworks',
    careerPaths: ['Mobile App Developer'],
    title: 'Flutter Official Documentation & Tutorials',
    url: 'https://docs.flutter.dev/get-started/codelab',
    type: 'documentation',
    difficulty: 'Beginner',
  },
  {
    topic: 'Mobile UI Fundamentals, Layouts & Frameworks',
    careerPaths: ['Mobile App Developer'],
    title: 'Android Developer Kotlin & Jetpack Basics',
    url: 'https://developer.android.com/courses',
    type: 'course',
    difficulty: 'Beginner',
  },
  {
    topic: 'Mobile UI Fundamentals, Layouts & Frameworks',
    careerPaths: ['Mobile App Developer'],
    title: 'Apple Developer SwiftUI Official Tutorials',
    url: 'https://developer.apple.com/tutorials/swiftui/',
    type: 'course',
    difficulty: 'Beginner',
  },
  {
    topic: 'Mobile App Testing, Build Automation & App Store Publishing',
    careerPaths: ['Mobile App Developer', 'DevOps Engineer'],
    title: 'Fastlane Official Mobile Automation Docs',
    url: 'https://docs.fastlane.tools/',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
  {
    topic: 'Native Device Hardware APIs & Push Notifications',
    careerPaths: ['Mobile App Developer'],
    title: 'Firebase Cloud Messaging (FCM) Push Alerts Guide',
    url: 'https://firebase.google.com/docs/cloud-messaging',
    type: 'documentation',
    difficulty: 'Intermediate',
  },
];

async function seed() {
  try {
    console.log('[SEED] Connecting to MongoDB:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('[SEED] Connected successfully. Clearing existing LearningResource documents...');
    
    await LearningResource.deleteMany({});
    console.log('[SEED] Cleared collection. Inserting curated resources (verified: false until health checked)...');

    const inserted = await LearningResource.insertMany(
      curatedResources.map(r => ({
        ...r,
        verified: false,
        lastCheckedAt: new Date(),
      }))
    );

    console.log(`[SEED] Successfully seeded ${inserted.length} resources into MongoDB!`);
    process.exit(0);
  } catch (error) {
    console.error('[SEED] Error seeding resources:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seed();
}
