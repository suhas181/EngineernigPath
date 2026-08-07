import {
  ALL_RESOURCES,
  resolveResources,
  resolveMentorResources,
  ResourceLanguage,
} from '../resources';

export interface GuidedStepResource {
  id?: string;
  title: string;
  provider: string;
  url: string;
  type?: string;
  difficulty?: string;
  level?: string;
  estimatedHours?: number;
  tags?: string[];
  badge?: string;
}

export interface TopicGuidedFlow {
  hasResources: boolean;
  step1PrimaryPlaylist?: GuidedStepResource;
  step2Documentation?: GuidedStepResource;
  step3PracticeSheet?: GuidedStepResource;
  step4PracticeProblems: GuidedStepResource[];
  step5Projects: GuidedStepResource[];
  step6InterviewQuestions: string[];
  step7RevisionNotes: Array<{ title: string; text: string }>;
  alternativeResources: {
    videos: GuidedStepResource[];
    notes: GuidedStepResource[];
    sheets: Array<{ name: string; url: string }>;
  };
}

export interface CurriculumTopic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  curriculumKeys: string[];
  resourceCount: number;
  guidedFlow: TopicGuidedFlow;
}

export interface CurriculumModule {
  id: string;
  title: string;
  description: string;
  topics: CurriculumTopic[];
}

export interface CurriculumCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  moduleCount: number;
  topicCount: number;
  modules: CurriculumModule[];
}

export interface CareerRoleCurriculum {
  role: string;
  language: ResourceLanguage;
  categories: CurriculumCategory[];
}

/**
 * Custom Revision Notes Map
 */
const REVISION_NOTES_MAP: Record<string, Array<{ title: string; text: string }>> = {
  LANG_JAVA_CORE: [
    { title: 'JVM Memory Architecture', text: 'Heap memory stores objects; Stack memory holds method execution frames and primitive local variables.' },
    { title: 'Pass by Value', text: 'Java is strictly pass-by-value. Object references are passed by value.' },
  ],
  LANG_PYTHON_CORE: [
    { title: 'GIL (Global Interpreter Lock)', text: 'Python CPython uses GIL preventing multi-threaded parallel execution of Python bytecode.' },
    { title: 'Mutable vs Immutable', text: 'Lists, Dicts, Sets are mutable. Strings, Tuples, Integers are immutable.' },
  ],
  LANG_CPP_CORE: [
    { title: 'Pointers vs References', text: 'Pointers can be null and reassigned; references are permanent aliases to existing objects.' },
    { title: 'RAII Pattern', text: 'Resource Acquisition Is Initialization ensures memory/files are reclaimed when scope exits.' },
  ],
  DSA_ARRAYS: [
    { title: 'Array Complexity', text: 'Random Access: O(1). Insertion/Deletion at arbitrary index: O(N).' },
    { title: 'Two-Pointer Technique', text: 'Reduces O(N²) nested loops to O(N) by moving pointers inward or outward based on condition.' },
  ],
  DSA_TREES: [
    { title: 'Tree Traversals', text: 'Inorder (Left-Root-Right) produces sorted order in BSTs. Preorder is useful for copying.' },
  ],
  DEV_REACT: [
    { title: 'React Virtual DOM', text: 'Lightweight JS object representation of DOM. Reconciliation compares diffs before updating real DOM.' },
    { title: 'Hook Rules', text: 'Only call hooks at the top level. Do not call hooks inside loops or conditional branches.' },
  ],
  DEV_NODE: [
    { title: 'Node.js Event Loop', text: 'Single-threaded event loop processes non-blocking I/O using libuv thread pool for filesystem ops.' },
  ],
  DEV_DOCKER: [
    { title: 'Docker Containers vs VMs', text: 'Containers share host OS kernel and isolation namespaces; VMs virtualize full OS hardware stacks.' },
  ],
  CS_OS: [
    { title: 'Process vs Thread', text: 'Process has independent memory space. Threads share process heap and memory.' },
    { title: 'Deadlock Conditions', text: 'Four conditions: Mutual Exclusion, Hold & Wait, No Preemption, Circular Wait.' },
  ],
  CS_DBMS: [
    { title: 'ACID Properties', text: 'Atomicity (All or nothing), Consistency (Valid state), Isolation (Concurrent isolation), Durability (Persisted).' },
  ],
  CS_CN: [
    { title: 'TCP vs UDP', text: 'TCP is connection-oriented, reliable, and ordered. UDP is connectionless, fast, and un-ordered.' },
  ],
};

/**
 * Custom Interview Questions Map
 */
const INTERVIEW_QUESTIONS_MAP: Record<string, string[]> = {
  LANG_JAVA_CORE: [
    'Why is String immutable in Java?',
    'What is the difference between final, finally, and finalize?',
    'How does HashMap handle collision under high load (Red-Black Trees in Java 8)?',
  ],
  LANG_PYTHON_CORE: [
    'How do decorators work in Python?',
    'Explain the difference between deepcopy and shallow copy.',
    'What are generators and how does yield differ from return?',
  ],
  LANG_CPP_CORE: [
    'What is virtual destructor and why is it necessary?',
    'Explain Smart Pointers (unique_ptr, shared_ptr, weak_ptr).',
    'What is the difference between vector push_back and emplace_back?',
  ],
  DSA_ARRAYS: [
    'How do you find the sub-array with maximum sum (Kadane’s Algorithm)?',
    'Explain how to detect and remove a cycle in a Linked List.',
    'What is the difference between QuickSelect and HeapSelect for Top K elements?',
  ],
  DEV_REACT: [
    'What is the difference between shadow DOM and virtual DOM?',
    'How do you optimize React component re-renders (useMemo, useCallback, React.memo)?',
    'Explain how custom hooks allow sharing stateful logic between components.',
  ],
  DEV_NODE: [
    'Explain the 6 phases of the Node.js Event Loop.',
    'What is the difference between process.nextTick() and setImmediate()?',
  ],
  DEV_DOCKER: [
    'What is the difference between Docker CMD and ENTRYPOINT?',
    'How do multi-stage Docker builds reduce container image sizes?',
  ],
  CS_OS: [
    'What is Thrashing in Operating Systems and how to prevent it?',
    'Explain CPU Scheduling algorithms (FCFS, SJF, Round Robin).',
    'What is Page Fault and how does Virtual Memory handle it?',
  ],
  CS_DBMS: [
    'What is Indexing in Databases and how do B+ Trees optimize range queries?',
    'Explain database normalization forms (1NF, 2NF, 3NF, BCNF).',
    'What are database deadlock handling strategies?',
  ],
  CS_CN: [
    'Describe the 3-Way Handshake process in TCP connection establishment.',
    'What happens when you type a URL into your browser address bar?',
    'What is the difference between HTTP/1.1, HTTP/2, and HTTP/3?',
  ],
};

/**
 * Returns DYNAMIC, INDIVIDUAL ROLE-SPECIFIC curriculum categories, modules, and topics for EVERY role.
 */
export const getCurriculumForRole = (
  roleName: string = 'Software Engineer',
  language: ResourceLanguage = 'Java'
): CareerRoleCurriculum => {
  const normLanguage: ResourceLanguage = (['Java', 'Python', 'C++'].includes(language) ? language : 'Java') as ResourceLanguage;
  const normRole = roleName || 'Software Engineer';
  const roleLower = normRole.toLowerCase();

  let categories: CurriculumCategory[] = [];

  // ==================== 1. AI / ML ENGINEER ====================
  if (roleLower.includes('ai') || roleLower.includes('machine learning')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Programming Languages & Math',
        description: 'Core Python for AI/ML, Linear Algebra, Calculus, and Data Science libraries.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-python-math',
            title: 'Python for AI & Mathematical Foundations',
            description: 'Python syntax, NumPy matrices, Pandas dataframes, and Calculus gradients.',
            topics: [
              {
                id: 'top-ai-python-core',
                title: 'Core Python & Object-Oriented AI Code',
                description: 'Data types, comprehensions, OOPs, virtual environments, and PyCharm/VSCode setup.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'LANG_PYTHON_OOPS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ai-math-stats',
                title: 'Linear Algebra, Calculus & Statistics for ML',
                description: 'Vectors, matrices, dot products, derivatives, gradient descent, and Bayes theorem.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Data Structures & Algorithmic Foundations',
        description: 'Arrays, Matrices, Trees, and Optimization Algorithms for Machine Learning.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-dsa',
            title: 'ML-Relevant Algorithms & Matrix Ops',
            description: 'Array manipulations, searching, trees, and dynamic optimization.',
            topics: [
              {
                id: 'top-ai-arrays-sorting',
                title: 'NumPy Arrays, Matrix Sorting & Vectorization',
                description: 'Vectorized array operations, two-pointer filtering, and complexity analysis.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_SORTING'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ai-decision-trees',
                title: 'Tree Data Structures & Decision Tree Algorithms',
                description: 'Binary trees, entropy calculation, information gain, and Gini impurity.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DSA_TREES'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Machine Learning & Deep Learning Domain',
        description: 'Scikit-Learn, PyTorch neural networks, HuggingFace Transformers, and RAG.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-ml-classic',
            title: 'Classic Machine Learning & Scikit-Learn',
            description: 'Supervised/unsupervised learning, XGBoost, feature engineering, and cross-validation.',
            topics: [
              {
                id: 'top-ai-scikit',
                title: 'Supervised & Unsupervised Learning (Scikit-Learn)',
                description: 'Regression, classification, K-Means clustering, PCA, and model evaluation metrics.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['LANG_PYTHON_COLLECTIONS', 'DEV_PYTHON_BACKEND'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ai-pytorch',
                title: 'Deep Learning & PyTorch Neural Networks',
                description: 'Forward/backward propagation, activation functions, SGD/Adam optimizers, and PyTorch.',
                difficulty: 'Advanced',
                estimatedTime: '30 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ai-llm-rag',
                title: 'LLMs, HuggingFace & RAG Vector Pipelines',
                description: 'Transformer architectures, prompt engineering, LangChain, and ChromaDB/Pinecone vector databases.',
                difficulty: 'Advanced',
                estimatedTime: '35 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. AI System Architecture & Model Deployment',
        description: 'FastAPI microservices, Docker containerization, and MLOps deployment pipelines.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-mlops',
            title: 'MLOps & Model Serving',
            description: 'Model serialization, FastAPI REST servers, Docker, and Cloud deployment.',
            topics: [
              {
                id: 'top-ai-fastapi-docker',
                title: 'FastAPI Microservices & Docker for ML Models',
                description: 'Exposing ML models over REST APIs, Docker container packaging, and Vercel/AWS hosting.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_DOCKER', 'DEV_REST_APIS', 'CS_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. AI Projects',
        description: 'Build production AI applications from Kaggle pipelines to RAG Chatbots.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-projects',
            title: 'Hands-on AI Portfolio Projects',
            description: 'Predictive modeling, NLP sentiment classifiers, and fullstack RAG document search engines.',
            topics: [
              {
                id: 'top-ai-proj-beginner',
                title: 'Beginner: Customer Churn & Price Predictor',
                description: 'Build a Scikit-Learn & XGBoost predictive pipeline on Kaggle dataset with Pandas.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['PROJ_BEGINNER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ai-proj-advanced',
                title: 'Advanced: Multi-Document RAG Knowledge Base',
                description: 'Fullstack AI Assistant using PyTorch/HuggingFace, LangChain, FastAPI, and Next.js UI.',
                difficulty: 'Advanced',
                estimatedTime: '45 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & Math Logic',
        description: 'Quantitative aptitude, probability distributions, and logic for AI screening tests.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-apt',
            title: 'Math & Screening Logic',
            description: 'Probability, statistics, matrices, and quantitative logic.',
            topics: [
              {
                id: 'top-ai-apt-quant',
                title: 'Quantitative Probability & Matrices',
                description: 'Bayesian probability, matrix rank, linear equations, and screening math questions.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. AI Resume & Kaggle Portfolio',
        description: 'ATS resume optimization for AI roles, Kaggle profile setup, and GitHub READMEs.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-resume',
            title: 'AI Resume & Technical Branding',
            description: 'Formatting ML projects, metrics (F1 score, BLEU), and Kaggle writeups.',
            topics: [
              {
                id: 'top-ai-res-ats',
                title: 'AI Engineer ATS Resume & Project Metrics',
                description: 'Structuring ML metrics, GitHub repo documentations, and passing ATS AI filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. AI Interview Preparation',
        description: 'Machine Learning technical screens, System Design for ML, and HR questions.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ai-interview',
            title: 'ML System Design & Interview Sprints',
            description: 'Explaining loss functions, trade-offs (Bias-Variance), and live coding interviews.',
            topics: [
              {
                id: 'top-ai-int-questions',
                title: 'AI/ML Technical Interview Questions & Trade-offs',
                description: 'Overfitting prevention, gradient explosion, model latency, and STAR behavioral answers.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 2. FRONTEND ENGINEER ====================
  else if (roleLower.includes('frontend')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Programming Languages & DOM',
        description: 'Modern JavaScript ES6+, TypeScript, and DOM manipulation APIs.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-js-ts',
            title: 'JavaScript ES6+ & TypeScript Mastery',
            description: 'Promises, closures, event loop, types, interfaces, and DOM manipulation.',
            topics: [
              {
                id: 'top-fe-js-core',
                title: 'JavaScript ES6+, Closures & Asynchronous Flow',
                description: 'Prototypes, execution context, async/await, event loop, microtasks, and DOM events.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Frontend DSA & UI Algorithms',
        description: 'Arrays, Strings, Object Trees (DOM), and UI State Structures.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-dsa',
            title: 'Data Structures for UI Development',
            description: 'Array methods (map/filter/reduce), tree traversal for DOM, and state caching.',
            topics: [
              {
                id: 'top-fe-dsa-arrays',
                title: 'Arrays, Object Trees & String Formatting',
                description: 'Immutable data transformations, deep cloning, and tree search traversals.',
                difficulty: 'Beginner',
                estimatedTime: '14 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_STRINGS', 'DSA_TREES'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Frontend Web Frameworks & Performance',
        description: 'Semantic HTML5, CSS Grid/Flexbox, React Core, Next.js, and Web Vitals.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-web',
            title: 'Modern Frontend Frameworks',
            description: 'HTML5 ARIA accessibility, TailwindCSS, React Hooks, and Next.js App Router.',
            topics: [
              {
                id: 'top-fe-html-css',
                title: 'Semantic HTML5, CSS Flexbox & Responsive Grid',
                description: 'Mobile-first layouts, custom properties, animations, and Lighthouse accessibility audits.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_HTML', 'DEV_CSS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-fe-react',
                title: 'React Core, Custom Hooks & State Management',
                description: 'Virtual DOM, custom hooks, context API, Zustand, and component re-render optimizations.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-fe-nextjs',
                title: 'Next.js SSR/SSG & Core Web Vitals Optimization',
                description: 'App Router, Server Components, hydration, LCP/CLS optimization, and SEO.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_NEXTJS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. Web Architecture & Networking',
        description: 'Browser internals, HTTP/HTTPS protocols, REST endpoints, and security.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-arch',
            title: 'Browser Internals & Web Security',
            description: 'CORS, XSS/CSRF prevention, service workers, and HTTP caching headers.',
            topics: [
              {
                id: 'top-fe-browser-net',
                title: 'Browser Rendering Engine, Networking & CORS',
                description: 'Critical rendering path, reflow/repaint, HTTP 1.1/2/3, CORS policies, and WebSockets.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['CS_CN', 'DEV_AUTHENTICATION'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Frontend Projects',
        description: 'Build SaaS dashboards, e-commerce stores, and collaborative web applications.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-proj',
            title: 'Portfolio Projects',
            description: 'Pixel-perfect UI projects deployed on Vercel.',
            topics: [
              {
                id: 'top-fe-proj-beg',
                title: 'Beginner: SaaS Responsive Dashboard UI',
                description: 'Build a responsive dark mode dashboard using TailwindCSS and React.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['PROJ_BEGINNER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-fe-proj-int',
                title: 'Intermediate: Fullstack Next.js E-Commerce Store',
                description: 'E-commerce platform with product filters, shopping cart, and API integration.',
                difficulty: 'Intermediate',
                estimatedTime: '30 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude',
        description: 'Quantitative logic and verbal reasoning for frontend screening rounds.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-apt',
            title: 'Screening Aptitude',
            description: 'Puzzles, quant, and verbal communication skills.',
            topics: [
              {
                id: 'top-fe-apt-quant',
                title: 'Quantitative & Logical Reasoning',
                description: 'Number series, percentages, and logical deduction questions.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. Frontend Resume & Vercel Portfolio',
        description: 'Live site deployments, GitHub repositories, and ATS resume formatting.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-res',
            title: 'Frontend Portfolio Branding',
            description: 'Showcasing Lighthouse scores, Vercel demos, and clean code repositories.',
            topics: [
              {
                id: 'top-fe-res-ats',
                title: 'Frontend Developer ATS Resume & Portfolio Deployment',
                description: 'Structuring project bullet points with impact metrics and deploying portfolio on Vercel.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. Frontend Interview Preparation',
        description: 'Machine Coding Rounds, React component coding, and JS output questions.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-interview',
            title: 'Machine Coding & React Live Screens',
            description: 'Building UI widgets (Accordion, Carousel, Autocomplete) live in 45 minutes.',
            topics: [
              {
                id: 'top-fe-int-questions',
                title: 'Frontend Machine Coding & React Interview Sprints',
                description: 'Debounce/Throttle implementations, custom hook design, and virtual DOM questions.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 3. BACKEND ENGINEER ====================
  else if (roleLower.includes('backend') && !roleLower.includes('full')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Backend Languages & Concurrency',
        description: `Server-side programming in ${normLanguage} / Node.js with multithreading & async flow.`,
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-lang',
            title: `Backend ${normLanguage} / Node.js Architecture`,
            description: 'Memory allocation, OOPs design, thread pools, and async I/O drivers.',
            topics: [
              {
                id: 'top-be-lang-core',
                title: `Server-side ${normLanguage} & Concurrency Model`,
                description: 'Asynchronous event loops, thread execution pools, garbage collection, and memory profiling.',
                difficulty: 'Beginner',
                estimatedTime: '16 Hours',
                curriculumKeys: normLanguage === 'Python' ? ['LANG_PYTHON_CORE', 'LANG_PYTHON_OOPS'] : normLanguage === 'C++' ? ['LANG_CPP_CORE', 'LANG_CPP_OOPS'] : ['LANG_JAVA_CORE', 'LANG_JAVA_OOPS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Backend DSA & Data Caching Patterns',
        description: 'HashMaps, Priority Queues, Graphs, and In-Memory Data Structures.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-dsa',
            title: 'High-Performance Backend Data Structures',
            description: 'Hash table collisions, B-Trees for database indexing, and queue buffers.',
            topics: [
              {
                id: 'top-be-dsa-hash-queue',
                title: 'Hash Tables, Priority Queues & Graph Traversals',
                description: 'O(1) lookups, LRU Cache eviction algorithms, priority task queues, and BFS/DFS graph networks.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DSA_HASHING', 'DSA_STACK', 'DSA_QUEUE', 'DSA_GRAPHS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Backend API Services & Database Systems',
        description: 'Express/Spring/FastAPI microservices, REST/GraphQL APIs, PostgreSQL SQL, MongoDB & Redis.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-apis-db',
            title: 'RESTful Microservices & Distributed Storage',
            description: 'API routing, request validation, PostgreSQL indexing, and Redis caching.',
            topics: [
              {
                id: 'top-be-rest-microservices',
                title: 'Node.js/Express REST APIs & Middleware Security',
                description: 'Express controllers, CORS, JWT tokens, RBAC permissions, and OpenAPI documentation.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_NODE', 'DEV_EXPRESS', 'DEV_REST_APIS', 'DEV_AUTHENTICATION'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-be-relational-nosql',
                title: 'PostgreSQL Relational SQL & MongoDB NoSQL Schemas',
                description: 'ACID transactions, B-Tree index optimization, MongoDB aggregations, and Redis cache invalidation.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_SQL', 'DEV_MONGODB', 'DEV_REDIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. System Architecture & High Availability',
        description: 'OS processes, TCP/IP networking, Load Balancing, and Distributed System Design.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-sysdesign',
            title: 'High-Level System Design & Microservices',
            description: 'Load balancers, database sharding, message queues (Kafka/RabbitMQ), and rate limiters.',
            topics: [
              {
                id: 'top-be-system-design',
                title: 'System Design: Scalability, Load Balancing & Sharding',
                description: 'Consistent hashing, database replication, CDN caching, rate limiting algorithms, and message brokers.',
                difficulty: 'Advanced',
                estimatedTime: '25 Hours',
                curriculumKeys: ['CS_SYSTEM_DESIGN', 'CS_OS', 'CS_DBMS', 'CS_CN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Backend Capstone Projects',
        description: 'Production backend systems with Docker, PostgreSQL, Redis, and deployment.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-projects',
            title: 'Production Backend Projects',
            description: 'Scalable backend engines with real-time web sockets and high-load caching.',
            topics: [
              {
                id: 'top-be-proj-chat',
                title: 'Intermediate: Real-Time Messaging & WebSockets Engine',
                description: 'Node.js Socket.io server with Redis pub/sub messaging and MongoDB conversation storage.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-be-proj-shortener',
                title: 'Advanced: Distributed URL Shortener & Analytics System',
                description: 'High-load system design project with Base62 encoding, Redis caching, Docker, and PostgreSQL.',
                difficulty: 'Advanced',
                estimatedTime: '40 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & Logical Reasoning',
        description: 'Quantitative aptitude and logical puzzles for backend engineering screens.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-apt',
            title: 'Backend Screening Aptitude',
            description: 'Combinatorics, probability, and logical problem-solving.',
            topics: [
              {
                id: 'top-be-apt-math',
                title: 'Quantitative Math & Bitwise Logic',
                description: 'Probability, work & time calculations, and bitwise logical screening questions.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. Backend ATS Resume & Production Metrics',
        description: 'Highlighting API latency reductions, database query speeds, and cloud deployments.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-res',
            title: 'Backend Engineering Resume Branding',
            description: 'Quantifying API throughput (RPS), database indexing gains, and GitHub repos.',
            topics: [
              {
                id: 'top-be-res-ats',
                title: 'Backend Engineer ATS Resume & Systems Metrics',
                description: 'Bullet points highlighting microservices, Redis caching RPS numbers, and passing ATS filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. Backend Technical & System Design Interviews',
        description: 'System Design interview mock rounds, database schema design, and concurrency screens.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-interview',
            title: 'System Design & API Live Screens',
            description: 'Live architecture whiteboarding, DB normalization, and STAR behavioral answers.',
            topics: [
              {
                id: 'top-be-int-questions',
                title: 'Backend System Design & Live API Coding Interviews',
                description: 'Designing Uber/Twitter backend schemas, handling DB locks, and STAR behavioral pitches.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 4. FULL STACK DEVELOPER ====================
  else if (roleLower.includes('full stack') || roleLower.includes('fullstack')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Full Stack Languages (JS / TS / Node)',
        description: 'Mastering JavaScript ES6+, TypeScript static typing, and Node.js execution.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-lang',
            title: 'Full Stack JavaScript & TypeScript',
            description: 'Unified language stack across browser DOM and server Node.js.',
            topics: [
              {
                id: 'top-fs-js-ts',
                title: 'Full Stack JavaScript ES6+ & TypeScript Interfaces',
                description: 'Shared types between React frontend and Express backend, async/await, and event loops.',
                difficulty: 'Beginner',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Full Stack Data Structures & Algorithms',
        description: 'Arrays, Hash Maps, Searching, Sorting, and State Data Structures.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-dsa',
            title: 'Algorithmic Problem Solving for Fullstack Apps',
            description: 'Efficient array transformations, hash table lookups, and graph traversals.',
            topics: [
              {
                id: 'top-fs-dsa-core',
                title: 'Arrays, HashMaps, Two Pointers & Binary Search',
                description: 'In-memory caching lookups, state management data structures, and search algorithms.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_HASHING', 'DSA_SORTING', 'DSA_BINARY_SEARCH'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Full Stack Architecture (Frontend + Backend + DB)',
        description: 'React, Next.js, Node.js, Express, PostgreSQL SQL, MongoDB, and REST/GraphQL APIs.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-frameworks',
            title: 'End-to-End MERN & Next.js Ecosystem',
            description: 'React UI components, Express API routing, MongoDB/PostgreSQL schemas, and Auth.',
            topics: [
              {
                id: 'top-fs-react-next',
                title: 'React Core, Next.js SSR/SSG & Component Architecture',
                description: 'Building interactive UIs with TailwindCSS, custom hooks, and Next.js App Router.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REACT', 'DEV_NEXTJS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-fs-node-express-db',
                title: 'Node.js Express REST APIs & Database Schemas',
                description: 'RESTful endpoints, JWT authentication, MongoDB Mongoose, and PostgreSQL Prisma ORM.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_NODE', 'DEV_EXPRESS', 'DEV_SQL', 'DEV_MONGODB'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. Full Stack Systems & Cloud Deployment',
        description: 'HTTP/HTTPS protocols, Docker containers, Redis caching, and Web Security.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-cloud',
            title: 'Web Infrastructure & Containerization',
            description: 'Docker container packaging, Vercel/Render deployments, and Redis speed.',
            topics: [
              {
                id: 'top-fs-docker-deployment',
                title: 'Docker Container Packaging & Vercel/AWS Deployment',
                description: 'Multi-stage Docker builds, environment config management, SSL/TLS, and Redis caching.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_DOCKER', 'DEV_REDIS', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Full Stack Capstone Projects',
        description: 'Complete fullstack SaaS applications with Auth, Payment processing, and Live DBs.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-projects',
            title: 'Production Fullstack Apps',
            description: 'Deploying end-to-end fullstack platforms.',
            topics: [
              {
                id: 'top-fs-proj-ecommerce',
                title: 'Intermediate: Fullstack MERN E-Commerce Platform',
                description: 'Fullstack app with JWT Auth, Product Catalogs, Cart state, and Stripe payment simulation.',
                difficulty: 'Intermediate',
                estimatedTime: '30 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-fs-proj-saas',
                title: 'Advanced: AI-Powered Career Platform Capstone',
                description: 'Next.js App Router, Express REST APIs, MongoDB, Redis caching, and Tailwind UI.',
                difficulty: 'Advanced',
                estimatedTime: '50 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & Quantitative Logic',
        description: 'Quantitative aptitude and logical reasoning for fullstack screening rounds.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-apt',
            title: 'Placement Screening Aptitude',
            description: 'Mathematical formulas, data interpretation, and logical puzzles.',
            topics: [
              {
                id: 'top-fs-apt-quant',
                title: 'Quantitative Math & Logical Deductions',
                description: 'Percentages, work/time, charts, and logical screening questions.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. Full Stack Resume & Live Demos',
        description: 'Live site deployment links, GitHub repository documentation, and ATS resumes.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-res',
            title: 'Full Stack Portfolio Branding',
            description: 'Highlighting deployed fullstack apps, database choices, and clean code.',
            topics: [
              {
                id: 'top-fs-res-ats',
                title: 'Full Stack Engineer ATS Resume & Live Portfolio Highlights',
                description: 'Structuring fullstack projects, live Vercel/Render links, and passing ATS filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. Full Stack Technical & Live Coding Interviews',
        description: 'System design whiteboarding, live coding screens, and STAR behavioral answers.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fs-interview',
            title: 'Fullstack Interview Sprints',
            description: 'Frontend machine coding + Backend API design in live technical interviews.',
            topics: [
              {
                id: 'top-fs-int-questions',
                title: 'Fullstack Live Coding & Architecture Technical Screens',
                description: 'Connecting React state to Express APIs, database queries, and behavioral HR answers.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 5. DATA SCIENTIST / ANALYST ====================
  else if (roleLower.includes('data') || roleLower.includes('analyst') || roleLower.includes('scientist')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Programming Languages & SQL Data Wrangling',
        description: 'Python for Data Science, Advanced SQL Queries, and Data Cleaning.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-python-sql',
            title: 'Python Data Stack & Relational SQL',
            description: 'Pandas DataFrames, NumPy vector math, SQL JOINs, aggregations, and window functions.',
            topics: [
              {
                id: 'top-ds-pandas-sql',
                title: 'Pandas Data Wrangling & Complex SQL Queries',
                description: 'Data cleaning, missing value imputation, group by aggregations, SQL window functions, and CTEs.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Data Science Algorithms & Statistics',
        description: 'Descriptive & Inferential Statistics, Probability, Matrices, and Searching.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-stats',
            title: 'Statistics & Mathematical Data Foundations',
            description: 'Hypothesis testing, A/B testing, normal distributions, and matrix math.',
            topics: [
              {
                id: 'top-ds-stats-prob',
                title: 'Inferential Statistics, A/B Testing & Linear Algebra',
                description: 'P-values, confidence intervals, t-tests, chi-square, covariance matrices, and Bayes theorem.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['APT_QUANT', 'DSA_ARRAYS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Machine Learning & Business Intelligence Domain',
        description: 'Exploratory Data Analysis, Scikit-Learn, PowerBI/Tableau dashboards, and PySpark.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-ml-bi',
            title: 'Predictive Modeling & Interactive Dashboards',
            description: 'Matplotlib/Seaborn charts, Regression/Classification models, and PowerBI dashboards.',
            topics: [
              {
                id: 'top-ds-eda-viz',
                title: 'Exploratory Data Analysis (EDA) & Data Visualization',
                description: 'Histograms, scatter plots, correlation heatmaps, Seaborn charts, and PowerBI/Tableau dashboards.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['LANG_PYTHON_COLLECTIONS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ds-scikit-pyspark',
                title: 'Machine Learning Algorithms & Big Data PySpark',
                description: 'Linear/Logistic regression, Decision Trees, Random Forests, XGBoost, and PySpark Big Data pipelines.',
                difficulty: 'Advanced',
                estimatedTime: '25 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. Data Warehousing & Cloud Databases',
        description: 'Snowflake, BigQuery, ETL pipelines, and Data Engineering fundamentals.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-etl',
            title: 'ETL Pipelines & Data Lakes',
            description: 'Extract-Transform-Load, dimensional modeling (Star schema), and Snowflake.',
            topics: [
              {
                id: 'top-ds-etl-cloud',
                title: 'ETL Pipeline Architecture & Cloud Data Warehouses',
                description: 'Building automated data ingestion pipelines, Star/Snowflake schemas, and SQL query tuning.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['CS_DBMS', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Data Science Projects',
        description: 'End-to-end data analytics and predictive modeling portfolio projects.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-projects',
            title: 'Analytics & Forecasting Projects',
            description: 'Real-world dataset analysis with Kaggle writeups and dashboard links.',
            topics: [
              {
                id: 'top-ds-proj-eda',
                title: 'Beginner: E-Commerce Sales Insights & EDA Dashboard',
                description: 'Clean sales dataset with Pandas, generate trend plots, and build an interactive Streamlit/PowerBI dashboard.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['PROJ_BEGINNER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-ds-proj-forecast',
                title: 'Advanced: Customer Retention & Revenue Predictive Pipeline',
                description: 'End-to-end XGBoost machine learning model with feature engineering and cross-validation metrics.',
                difficulty: 'Advanced',
                estimatedTime: '35 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & Data Interpretation',
        description: 'Charts interpretation, quantitative statistics, and analytical reasoning.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-apt',
            title: 'Data Interpretation Aptitude',
            description: 'Bar charts, pie charts, table data analysis, and mathematical logic.',
            topics: [
              {
                id: 'top-ds-apt-di',
                title: 'Data Interpretation (DI) & Quantitative Reasoning',
                description: 'Reading complex charts, growth rates, percentages, and logical deduction questions.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. Data Scientist ATS Resume & Portfolio',
        description: 'Showcasing Kaggle ranks, Tableau/PowerBI dashboard links, and ATS resume formatting.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-res',
            title: 'Data Portfolio Branding',
            description: 'Structuring statistical findings, GitHub READMEs, and passing ATS resume scanners.',
            topics: [
              {
                id: 'top-ds-res-ats',
                title: 'Data Scientist ATS Resume & Portfolio Dashboard Links',
                description: 'Highlighting business impact metrics ($ savings, % accuracy gains) and passing ATS filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. Data Science & Case Study Interviews',
        description: 'SQL live coding screens, A/B testing case studies, and behavioral HR answers.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-interview',
            title: 'Live SQL & Case Study Sprints',
            description: 'Solving complex SQL queries under time pressure and explaining statistical trade-offs.',
            topics: [
              {
                id: 'top-ds-int-prep',
                title: 'Data Science Live SQL Screens & Business Case Studies',
                description: 'Advanced SQL window function questions, metric definition case studies, and STAR behavioral answers.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 6. DEVOPS ENGINEER ====================
  else if (roleLower.includes('devops') || roleLower.includes('cloud') || roleLower.includes('infrastructure')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Scripting Languages & Automation',
        description: 'Bash Shell Scripting, Python Automation scripts, and Linux Administration.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-scripting',
            title: 'Linux Systems & Bash/Python Automation',
            description: 'Linux file permissions, process monitoring (systemd), SSH keys, and Python scripts.',
            topics: [
              {
                id: 'top-devops-linux-bash',
                title: 'Linux System Administration & Bash Shell Automation',
                description: 'Linux CLI commands, cron jobs, environment variables, system logs, and shell scripting.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'CS_OS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. DevOps Data Structures & File Systems',
        description: 'File Trees, Log Processing Algorithms, and Network Buffers.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-dsa',
            title: 'Systems & Network Data Structures',
            description: 'Log parsing algorithms, hash tables for config lookup, and queue buffers.',
            topics: [
              {
                id: 'top-devops-dsa-logs',
                title: 'Log Parsing Algorithms, Hash Maps & Queue Buffers',
                description: 'Regex log parsing, hash lookup tables, file directory tree traversals, and event queues.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_HASHING', 'DSA_QUEUE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Docker Containers, Kubernetes & IaC',
        description: 'Docker containerization, Kubernetes Orchestration, Terraform, and AWS Cloud.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-containers',
            title: 'Containerization & Infrastructure as Code (IaC)',
            description: 'Dockerfiles, Docker Compose, Kubernetes pods/deployments, Terraform, and AWS.',
            topics: [
              {
                id: 'top-devops-docker-k8s',
                title: 'Docker Containerization & Kubernetes Cluster Orchestration',
                description: 'Writing multi-stage Dockerfiles, Docker Compose stacks, K8s Pods, Services, Deployments, and Helm charts.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_DOCKER', 'CS_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-devops-terraform-aws',
                title: 'Terraform Infrastructure as Code (IaC) & AWS Cloud',
                description: 'Terraform HCL modules, AWS EC2, S3, VPC networking, IAM security, and EKS Kubernetes clusters.',
                difficulty: 'Advanced',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_AWS', 'DEV_DOCKER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. CI/CD Automation & Observability',
        description: 'GitHub Actions pipelines, Prometheus monitoring, Grafana dashboards, and Security.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-cicd',
            title: 'CI/CD Pipelines & Monitoring',
            description: 'Automated testing/deployment pipelines, Prometheus metrics, and Grafana alerts.',
            topics: [
              {
                id: 'top-devops-cicd-grafana',
                title: 'GitHub Actions CI/CD Pipelines & Prometheus/Grafana Monitoring',
                description: 'Automated build & test pipelines, Docker hub pushes, K8s deployment triggers, and Grafana dashboards.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'CS_CN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. DevOps Capstone Projects',
        description: 'End-to-end cloud infrastructure & automated CI/CD deployment projects.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-projects',
            title: 'Cloud Infrastructure Sprints',
            description: 'Automated infrastructure provisioning and container deployment on AWS.',
            topics: [
              {
                id: 'top-devops-proj-pipeline',
                title: 'Intermediate: Automated Docker & GitHub Actions Pipeline',
                description: 'Configure automated CI/CD workflow building multi-stage Docker images and deploying to AWS EC2.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-devops-proj-terraform',
                title: 'Advanced: Terraform Provisioned K8s Microservices Cluster',
                description: 'Provision AWS VPC, EKS cluster, RDS PostgreSQL database with Terraform HCL, and monitor with Grafana.',
                difficulty: 'Advanced',
                estimatedTime: '40 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & System Logic',
        description: 'Quantitative aptitude, network logic, and troubleshooting puzzles.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-apt',
            title: 'Screening Logic Aptitude',
            description: 'Binary logic, network subnetting math, and logical deduction.',
            topics: [
              {
                id: 'top-devops-apt-logic',
                title: 'Quantitative Logic & Network Math',
                description: 'Percentages, work/time, IP subnet calculations, and logical troubleshooting questions.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. DevOps ATS Resume & AWS Certifications',
        description: 'Formatting Terraform GitHub repos, cloud metrics, and AWS CKA/CPA badges.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-res',
            title: 'Cloud & DevOps Portfolio Branding',
            description: 'Quantifying deployment time reductions (e.g. 80% faster releases) and passing ATS scanners.',
            topics: [
              {
                id: 'top-devops-res-ats',
                title: 'DevOps ATS Resume & Cloud Certification Highlights',
                description: 'Structuring infrastructure projects, GitHub IaC repo links, and passing automated resume filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. DevOps Technical & Cloud Infrastructure Interviews',
        description: 'Live Linux troubleshooting screens, Kubernetes architecture whiteboarding, and HR questions.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-devops-interview',
            title: 'Infrastructure & Live Incident Screens',
            description: 'Explaining K8s pod crashes, ingress controllers, Terraform state locks, and STAR pitches.',
            topics: [
              {
                id: 'top-devops-int-prep',
                title: 'DevOps Live Troubleshooting & Cloud Infrastructure Interviews',
                description: 'Linux system debugging scenarios, K8s networking questions, and STAR behavioral answers.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 7. MOBILE APP DEVELOPER ====================
  else if (roleLower.includes('mobile') || roleLower.includes('flutter') || roleLower.includes('react native') || roleLower.includes('android') || roleLower.includes('ios')) {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Mobile Languages (Dart / Swift / Kotlin)',
        description: 'Core syntax, async streams, and mobile OOP paradigms.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-lang',
            title: 'Mobile Programming Syntax & OOPs',
            description: 'Dart / Kotlin / Swift null safety, classes, async futures, and streams.',
            topics: [
              {
                id: 'top-mobile-lang-syntax',
                title: 'Dart / Kotlin Core Syntax & Null Safety',
                description: 'Variables, null-safety checks, classes, mixins, futures, streams, and mobile app lifecycle.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Mobile DSA & Memory Optimization',
        description: 'Arrays, Lists, Cache Trees, and Mobile RAM Management.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-dsa',
            title: 'Mobile Performance Data Structures',
            description: 'Efficient list view rendering data structures, state tree traversals, and SQLite caching.',
            topics: [
              {
                id: 'top-mobile-dsa-lists',
                title: 'Arrays, HashMaps & List View Virtualization',
                description: 'Lazy loading data structures, memory leak prevention, and hash lookups.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_HASHING', 'DSA_LINKED_LIST'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Mobile App Frameworks & UI Architecture',
        description: 'Flutter / React Native UI widgets, Navigation, State Management & Native APIs.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-frameworks',
            title: 'Cross-Platform Mobile Engineering',
            description: 'Custom UI widgets, BLoC / Provider state management, REST fetching, and Push Notifications.',
            topics: [
              {
                id: 'top-mobile-ui-widgets',
                title: 'Flutter / React Native Widgets & State Management (BLoC/Redux)',
                description: 'Stateless vs Stateful widgets, layout trees, Provider, BLoC pattern, and local SQLite/Hive storage.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REACT', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-mobile-apis-native',
                title: 'REST API Integration, Camera/GPS & App Store Publishing',
                description: 'HTTP networking, JSON serialization, native device permissions (Camera, Geolocation), and App Store release pipelines.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_REST_APIS', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. Mobile OS Architecture & Security',
        description: 'Android/iOS OS lifecycles, memory management, and secure app storage.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-os',
            title: 'Mobile Architecture & Security',
            description: 'Activity/ViewController lifecycles, background threads, and Keychain/Keystore security.',
            topics: [
              {
                id: 'top-mobile-arch-security',
                title: 'Mobile App Lifecycle, Background Tasks & Security',
                description: 'App state transitions (Foreground/Background), push notification payloads, and SSL pinning.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['CS_OS', 'CS_CN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Mobile App Projects',
        description: 'Build production cross-platform mobile apps for iOS & Android.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-projects',
            title: 'Portfolio Mobile Apps',
            description: 'Feature-rich mobile applications with live API integration and smooth animations.',
            topics: [
              {
                id: 'top-mobile-proj-weather',
                title: 'Beginner: Weather & Location Companion App',
                description: 'Build a mobile app with GPS location detection, REST API weather fetching, and dynamic UI themes.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['PROJ_BEGINNER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-mobile-proj-ecommerce',
                title: 'Advanced: Cross-Platform E-Commerce Mobile App',
                description: 'Fullstack Flutter / React Native store with authentication, cart state, payment gateway, and push notifications.',
                difficulty: 'Advanced',
                estimatedTime: '35 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Aptitude & Screening Logic',
        description: 'Quantitative math and logical reasoning for mobile developer screening tests.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-apt',
            title: 'Screening Aptitude',
            description: 'Puzzles, quant formulas, and verbal reasoning skills.',
            topics: [
              {
                id: 'top-mobile-apt-quant',
                title: 'Quantitative Reasoning & Logical Deductions',
                description: 'Percentages, work/time, number series, and logical reasoning questions.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['APT_QUANT', 'APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. Mobile App ATS Resume & App Store Demos',
        description: 'Highlighting Play Store / App Store links, APK demos, and ATS resume formatting.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-res',
            title: 'Mobile Developer Portfolio Branding',
            description: 'Showcasing GitHub repos, Play Store download links, and app screenshots.',
            topics: [
              {
                id: 'top-mobile-res-ats',
                title: 'Mobile Developer ATS Resume & App Store Release Links',
                description: 'Structuring app features, state management choices, Play Store links, and passing ATS filters.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. Mobile App Machine Coding & Technical Interviews',
        description: 'Live mobile UI coding screens, state management whiteboarding, and HR questions.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-interview',
            title: 'Mobile Live UI Coding & Architecture',
            description: 'Building mobile widgets live in 45 minutes and answering native OS lifecycle questions.',
            topics: [
              {
                id: 'top-mobile-int-prep',
                title: 'Mobile App Machine Coding & Architecture Technical Screens',
                description: 'Live coding custom Flutter/React Native widgets, state management trade-offs, and STAR behavioral pitches.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 8. DEFAULT / SOFTWARE ENGINEER (SDE) ====================
  else {
    categories = [
      {
        id: 'programming-languages',
        title: '1. Programming Languages & Core Paradigms',
        description: `Master core syntax, OOP paradigms, memory management, and standard libraries in ${normLanguage}.`,
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-lang-core',
            title: 'Core Language Syntax & Fundamentals',
            description: 'Basic types, control structures, methods, and memory model.',
            topics: [
              {
                id: 'top-sde-lang-syntax',
                title: `${normLanguage} Fundamentals & Setup`,
                description: `Syntax, data types, control flow, and compilation/execution model in ${normLanguage}.`,
                difficulty: 'Beginner',
                estimatedTime: '8-10 Hours',
                curriculumKeys: normLanguage === 'Python' ? ['LANG_PYTHON_CORE'] : normLanguage === 'C++' ? ['LANG_CPP_CORE'] : ['LANG_JAVA_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-lang-oops',
                title: 'Object-Oriented Programming (OOPs)',
                description: 'Encapsulation, Abstraction, Inheritance, and Polymorphism in practice.',
                difficulty: 'Beginner',
                estimatedTime: '10-12 Hours',
                curriculumKeys: normLanguage === 'Python' ? ['LANG_PYTHON_OOPS'] : normLanguage === 'C++' ? ['LANG_CPP_OOPS'] : ['LANG_JAVA_OOPS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-lang-collections',
                title: 'Collections & Standard Library Data Structures',
                description: `List, Map, Set, Queue implementations and iterations in ${normLanguage}.`,
                difficulty: 'Intermediate',
                estimatedTime: '12-15 Hours',
                curriculumKeys: normLanguage === 'Python' ? ['LANG_PYTHON_COLLECTIONS'] : normLanguage === 'C++' ? ['LANG_CPP_STL'] : ['LANG_JAVA_COLLECTIONS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'dsa',
        title: '2. Data Structures & Algorithmic Patterns',
        description: 'Problem-solving patterns, algorithmic complexity, linear and non-linear data structures.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-dsa-linear',
            title: 'Linear Data Structures & Sorting',
            description: 'Arrays, Strings, Pointers, Linked Lists, Stacks, Queues, and Sorting Algorithms.',
            topics: [
              {
                id: 'top-sde-dsa-arrays',
                title: 'Arrays, Two Pointers & Sliding Window',
                description: 'Array manipulations, multi-dimensional arrays, two-pointer techniques, and sliding window.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DSA_ARRAYS', 'DSA_TWO_POINTERS', 'DSA_SLIDING_WINDOW'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-dsa-strings',
                title: 'String Algorithms & Pattern Matching',
                description: 'String manipulation, hashing, character matching, and palindromes.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['DSA_STRINGS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-dsa-sorting-search',
                title: 'Sorting & Binary Search Patterns',
                description: 'QuickSort, MergeSort, Binary search boundaries, and search space reduction.',
                difficulty: 'Intermediate',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DSA_SORTING', 'DSA_BINARY_SEARCH'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-dsa-linkedlists',
                title: 'Linked Lists, Stacks & Queues',
                description: 'Singly & doubly linked list traversals, stack parsers, and queue buffers.',
                difficulty: 'Intermediate',
                estimatedTime: '14 Hours',
                curriculumKeys: ['DSA_LINKED_LIST', 'DSA_STACK', 'DSA_QUEUE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-sde-dsa-nonlinear',
            title: 'Hierarchical & Advanced Algorithms',
            description: 'Trees, Graphs, Dynamic Programming, Heaps, and Tries.',
            topics: [
              {
                id: 'top-sde-dsa-trees',
                title: 'Binary Trees & Binary Search Trees',
                description: 'DFS & BFS traversals, tree construction, height balancing, and BST properties.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DSA_TREES'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-dsa-graphs',
                title: 'Graphs, BFS/DFS & Shortest Paths',
                description: 'Adjacency lists, topological sort, Dijkstra algorithm, and connected components.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DSA_GRAPHS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-dsa-dp',
                title: 'Dynamic Programming & Memoization',
                description: 'Recursion trees, state transitions, knapsack patterns, and grid DP.',
                difficulty: 'Advanced',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DSA_DP'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'web-development',
        title: '3. Web & Application Architecture',
        description: 'Frontend layouts, REST APIs, database schemas, and modern web frameworks.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-web-frontend',
            title: 'Frontend Engineering',
            description: 'HTML5, Modern CSS, JavaScript ES6+, React, and Next.js.',
            topics: [
              {
                id: 'top-sde-web-html-css',
                title: 'Semantic HTML5 & Modern CSS Layouts',
                description: 'Responsive Flexbox, CSS Grid, mobile-first styling, and ARIA standards.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DEV_HTML', 'DEV_CSS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-web-js',
                title: 'JavaScript ES6+ & Async Programming',
                description: 'Closures, promises, event loop, DOM manipulation, and modern syntax.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-web-react',
                title: 'React Core, Hooks & State Management',
                description: 'Component architecture, custom hooks, virtual DOM, and state management.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-sde-web-backend',
            title: 'Backend Services & Databases',
            description: 'Server architectures, REST APIs, SQL databases, and security.',
            topics: [
              {
                id: 'top-sde-web-node',
                title: 'Node.js, Express & RESTful APIs',
                description: 'HTTP servers, Express middleware, request validation, and routing.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_NODE', 'DEV_EXPRESS', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-web-databases',
                title: 'Relational SQL & NoSQL Databases',
                description: 'PostgreSQL schema indexing, MongoDB documents, and Redis caching.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_SQL', 'DEV_MONGODB', 'DEV_REDIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cs-fundamentals',
        title: '4. CS Fundamentals & System Design',
        description: 'Operating Systems, DBMS internals, Computer Networks, and System Design.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-cs-core',
            title: 'Core Computer Science Subjects',
            description: 'OS processes, database transactions, network layers, and system architecture.',
            topics: [
              {
                id: 'top-sde-cs-os',
                title: 'Operating Systems & Process Management',
                description: 'Processes vs threads, CPU scheduling, deadlocks, and virtual memory.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['CS_OS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-cs-dbms',
                title: 'DBMS Internals, SQL & ACID Properties',
                description: 'Relational algebra, normal forms, B-Trees indexing, and transaction isolation.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['CS_DBMS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-cs-cn',
                title: 'Computer Networks & Protocols',
                description: 'OSI 7-layer model, TCP/IP handshake, HTTP/HTTPS, DNS, and IP routing.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['CS_CN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-cs-system-design',
                title: 'System Design Principles & Scalability',
                description: 'Load balancing, caching strategies, rate limiters, database sharding, and CDNs.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['CS_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects',
        title: '5. Software Engineering Projects',
        description: 'Hands-on portfolio building across beginner, intermediate, and advanced levels.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-proj-levels',
            title: 'Practical Project Sprints',
            description: 'Real-world fullstack and backend project specifications with tech stacks and deployment instructions.',
            topics: [
              {
                id: 'top-sde-proj-beginner',
                title: 'Beginner Projects (Foundational)',
                description: 'CLI tools, task trackers, and simple DOM applications to solidify basics.',
                difficulty: 'Beginner',
                estimatedTime: '20 Hours',
                curriculumKeys: ['PROJ_BEGINNER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-proj-intermediate',
                title: 'Intermediate Projects (Fullstack)',
                description: 'REST API services, auth workflows, and interactive web dashboard applications.',
                difficulty: 'Intermediate',
                estimatedTime: '35 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-proj-advanced',
                title: 'Advanced Projects (Production Systems)',
                description: 'Dockerized microservices, real-time messaging, and high-load web systems.',
                difficulty: 'Advanced',
                estimatedTime: '50 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aptitude',
        title: '6. Placement Aptitude & Logic',
        description: 'Quantitative aptitude, logical reasoning, and verbal ability for screening rounds.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-apt-screening',
            title: 'Placement Screening Aptitude',
            description: 'Quantitative math formulas, logical puzzle patterns, and English reading comprehension.',
            topics: [
              {
                id: 'top-sde-apt-quant',
                title: 'Quantitative Aptitude & Mathematics',
                description: 'Percentages, profit & loss, work & time, probability, and speed distance calculations.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-apt-logical',
                title: 'Logical Reasoning & Data Interpretation',
                description: 'Coding-decoding, blood relations, seating arrangements, and charts analysis.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['APT_LOGICAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-apt-verbal',
                title: 'Verbal Ability & Grammar',
                description: 'Sentence corrections, vocabulary, synonyms/antonyms, and reading comprehension.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['APT_VERBAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'resume-preparation',
        title: '7. SDE Resume & GitHub Portfolio',
        description: 'ATS resume formatting, project presentation, and GitHub/LinkedIn profiling.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-res-building',
            title: 'Resume & Professional Branding',
            description: 'Crafting high-scoring ATS resumes and showcasing engineering impact.',
            topics: [
              {
                id: 'top-sde-res-ats',
                title: 'ATS Resume Building & Keyword Benchmarking',
                description: 'Formatting, action verbs, quantifying results, and passing automated resume scanners.',
                difficulty: 'Beginner',
                estimatedTime: '5 Hours',
                curriculumKeys: ['INT_RESUME'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-res-portfolio',
                title: 'GitHub Profile & Portfolio Presentation',
                description: 'Clean README structures, live demo deployments, and repository highlights.',
                difficulty: 'Beginner',
                estimatedTime: '8 Hours',
                curriculumKeys: ['INT_RESUME', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'interview-preparation',
        title: '8. SDE Technical & Behavioral Interviews',
        description: 'Behavioral HR questions, technical coding patterns, and mock interview checklists.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-sde-int-sprints',
            title: 'Technical & HR Interview Strategy',
            description: 'Mastering the STAR method, communication pitches, and technical problem explanation.',
            topics: [
              {
                id: 'top-sde-int-behavioral',
                title: 'Behavioral & HR Interview Pitches',
                description: 'STAR method story building, project trade-off discussions, and HR questions.',
                difficulty: 'Beginner',
                estimatedTime: '6 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-sde-int-mock',
                title: 'Technical Mock Screens & Coding Patterns',
                description: 'Communicating thought process aloud, handling edge cases, and code optimizations.',
                difficulty: 'Intermediate',
                estimatedTime: '12 Hours',
                curriculumKeys: ['INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }

  // Resolve resources for every topic using backend resource resolver
  categories.forEach((cat) => {
    let catTopicCount = 0;
    cat.modules.forEach((mod) => {
      catTopicCount += mod.topics.length;
      mod.topics.forEach((top) => {
        const mentorRes = resolveMentorResources(top.curriculumKeys, normLanguage);
        const allResolved = top.curriculumKeys.flatMap((key) => resolveResources(key, normLanguage));

        // Fetch projects matching keys
        const projectItems = allResolved
          .filter((r) => r.stage === 'project' || r.type === 'project')
          .map((r) => ({
            id: r.id,
            title: r.title,
            provider: r.provider,
            url: r.url,
            level: r.level || top.difficulty.toLowerCase(),
            estimatedHours: r.estimatedHours || 15,
            tags: r.tags || [],
          }));

        // Fetch revision notes
        const mainKey = top.curriculumKeys[0] || '';
        const revNotes = REVISION_NOTES_MAP[mainKey] || [
          { title: 'Core Concept Summary', text: `Key syntax patterns, algorithm constraints, and performance considerations for ${top.title}.` },
          { title: 'Best Practice Rule', text: 'Write modular, self-documenting code and analyze runtime and memory complexities before committing.' },
        ];

        // Fetch interview questions
        const intQuestions = INTERVIEW_QUESTIONS_MAP[mainKey] || [
          `How would you explain the core concepts of ${top.title} to a junior engineer?`,
          `What are common pitfalls and memory leaks associated with ${top.title}?`,
          `Compare different algorithm or architectural choices for ${top.title}.`,
        ];

        const mapResourceToStep = (r?: any): GuidedStepResource | undefined => {
          if (!r) return undefined;
          return {
            id: r.id,
            title: r.title,
            provider: r.provider || 'EngineerPath Library',
            url: r.url,
            type: r.type,
            difficulty: r.difficulty || r.level,
            estimatedHours: r.estimatedHours,
            tags: r.tags,
          };
        };

/**
 * Direct trusted YouTube playlists and official documentation links trusted by millions of engineers
 */
const TRUSTED_DIRECT_RESOURCES: Record<
  string,
  {
    videoTitle: string;
    videoProvider: string;
    videoUrl: string;
    docTitle: string;
    docProvider: string;
    docUrl: string;
    practiceSheetName: string;
    practiceSheetUrl: string;
    practiceSheetBadge: string;
  }
> = {
  // ==================== 1. SOFTWARE ENGINEER (SDE) TOPICS ====================
  'top-sde-lang-syntax': {
    videoTitle: 'Kunal Kushwaha: Java + Data Structures & Algorithms Complete Course',
    videoProvider: 'Kunal Kushwaha',
    videoUrl: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7gFc1UMAxqv6t5P',
    docTitle: 'Dev.java: Official Java Language Tutorial & Learning Path',
    docProvider: 'Oracle Java Core Team',
    docUrl: 'https://dev.java/learn/',
    practiceSheetName: '⭐ Striver A2Z DSA Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for Java SDE',
  },
  'top-sde-lang-oops': {
    videoTitle: 'Kunal Kushwaha: Object-Oriented Programming (OOPs) Masterclass',
    videoProvider: 'Kunal Kushwaha',
    videoUrl: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7gFc1UMAxqv6t5P',
    docTitle: 'Refactoring Guru: SOLID Principles & OOP Architecture',
    docProvider: 'Refactoring Guru',
    docUrl: 'https://refactoring.guru/design-patterns/solid-principles',
    practiceSheetName: '⭐ OOPs Design & Class Diagram Exercises',
    practiceSheetUrl: 'https://refactoring.guru/design-patterns/catalog',
    practiceSheetBadge: 'Recommended for OOPs',
  },
  'top-sde-lang-collections': {
    videoTitle: 'Kunal Kushwaha: Java Collections Framework & Memory Model',
    videoProvider: 'Kunal Kushwaha',
    videoUrl: 'https://www.youtube.com/playlist?list=PL9gnSGHSqcnr_DxHsP7gFc1UMAxqv6t5P',
    docTitle: 'Baeldung: Complete Guide to Java Collections Framework',
    docProvider: 'Baeldung',
    docUrl: 'https://www.baeldung.com/java-collections',
    practiceSheetName: '⭐ Java Collections Practice Sheet',
    practiceSheetUrl: 'https://www.geeksforgeeks.org/java-collection-framework/',
    practiceSheetBadge: 'Recommended for Collections',
  },
  'top-sde-dsa-arrays': {
    videoTitle: 'Striver (takeUforward): Arrays, Two Pointers & Sliding Window Series',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=37E9ckMDdTk&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'takeUforward: Striver A2Z Arrays & Sliding Window Tutorials',
    docProvider: 'takeUforward',
    docUrl: 'https://takeuforward.org/data-structure/striver-a2z-dsa-course-sheet-2/',
    practiceSheetName: '⭐ Striver A2Z Sheet (Arrays & Two Pointers)',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for DSA',
  },
  'top-sde-dsa-strings': {
    videoTitle: 'Striver (takeUforward): String Manipulation & Pattern Matching',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=WDJercqQqXs&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'GeeksforGeeks: String Data Structure & Algorithms Guide',
    docProvider: 'GeeksforGeeks',
    docUrl: 'https://www.geeksforgeeks.org/string-data-structure/',
    practiceSheetName: '⭐ Striver A2Z Strings Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for Strings',
  },
  'top-sde-dsa-sorting-search': {
    videoTitle: 'Striver (takeUforward): Sorting Algorithms & Binary Search Masterclass',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=13ocRGBDypg&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'takeUforward: Binary Search Boundary & Search Space Guide',
    docProvider: 'takeUforward',
    docUrl: 'https://takeuforward.org/binary-search/binary-search-explained/',
    practiceSheetName: '⭐ Binary Search Top 25 Problems',
    practiceSheetUrl: 'https://leetcode.com/tag/binary-search/',
    practiceSheetBadge: 'Recommended for Binary Search',
  },
  'top-sde-dsa-linkedlists': {
    videoTitle: 'Striver (takeUforward): Linked List, Stacks & Queues Complete Series',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=Nq7ok-OyEpg&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'GeeksforGeeks: Linked List Data Structures Reference',
    docProvider: 'GeeksforGeeks',
    docUrl: 'https://www.geeksforgeeks.org/data-structures/linked-list/',
    practiceSheetName: '⭐ Striver A2Z Linked List Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for Linked List',
  },
  'top-sde-dsa-trees': {
    videoTitle: 'Striver (takeUforward): Binary Trees & BST Traversal Series',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=_ANrF3FJm7I&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'takeUforward: Tree Traversals & BST Construction Tutorials',
    docProvider: 'takeUforward',
    docUrl: 'https://takeuforward.org/binary-tree/binary-tree-traversal-in-order-pre-order-post-order/',
    practiceSheetName: '⭐ Striver A2Z Binary Trees Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for Trees',
  },
  'top-sde-dsa-graphs': {
    videoTitle: 'Striver (takeUforward): Graph Data Structure, BFS/DFS & Shortest Paths',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=M3_pLsDdeuU&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'takeUforward: Graph BFS, DFS & Dijkstra Algorithm Guide',
    docProvider: 'takeUforward',
    docUrl: 'https://takeuforward.org/graph/graph-representation-in-c/',
    practiceSheetName: '⭐ Striver A2Z Graph Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for Graphs',
  },
  'top-sde-dsa-dp': {
    videoTitle: 'Striver (takeUforward): Dynamic Programming Masterclass (50+ Videos)',
    videoProvider: 'Striver (takeUforward)',
    videoUrl: 'https://www.youtube.com/watch?v=tyB0ztf08Y8&list=PLgUwDviBIf0oF6QL8m22w1hIDC1vJ_BHz',
    docTitle: 'takeUforward: Complete Dynamic Programming Tutorial Series',
    docProvider: 'takeUforward',
    docUrl: 'https://takeuforward.org/dynamic-programming/striver-dp-series-dynamic-programming-tutorial/',
    practiceSheetName: '⭐ Striver A2Z Dynamic Programming Sheet',
    practiceSheetUrl: 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
    practiceSheetBadge: 'Recommended for DP',
  },
  'top-sde-cs-os': {
    videoTitle: 'Gate Smashers: Operating Systems Full Course (Process, Threads, Memory)',
    videoProvider: 'Gate Smashers',
    videoUrl: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGz9donHRrE9I3Mwn6X58XM',
    docTitle: 'OSTEP: Operating Systems: Three Easy Pieces (Official Book Notes)',
    docProvider: 'Univ. of Wisconsin (Remzi H. Arpaci-Dusseau)',
    docUrl: 'https://pages.cs.wisc.edu/~remzi/OSTEP/',
    practiceSheetName: '⭐ Operating Systems Gate & SDE Interview Questions',
    practiceSheetUrl: 'https://www.geeksforgeeks.org/operating-systems-gq/',
    practiceSheetBadge: 'Recommended for OS',
  },
  'top-sde-cs-dbms': {
    videoTitle: 'Gate Smashers: DBMS & SQL Complete Series (ACID, Normalization, Indexing)',
    videoProvider: 'Gate Smashers',
    videoUrl: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y',
    docTitle: 'GeeksforGeeks: Database Management System Complete Tutorial',
    docProvider: 'GeeksforGeeks',
    docUrl: 'https://www.geeksforgeeks.org/dbms/',
    practiceSheetName: '⭐ SQL Zoo Interactive Queries Sheet',
    practiceSheetUrl: 'https://sqlzoo.net/',
    practiceSheetBadge: 'Recommended for DBMS',
  },
  'top-sde-cs-cn': {
    videoTitle: 'Gate Smashers: Computer Networks Complete Playlist (OSI, TCP/IP, HTTP)',
    videoProvider: 'Gate Smashers',
    videoUrl: 'https://www.youtube.com/playlist?list=PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_',
    docTitle: 'GeeksforGeeks: Computer Networks Tutorial & Protocol Notes',
    docProvider: 'GeeksforGeeks',
    docUrl: 'https://www.geeksforgeeks.org/computer-network-tutorials/',
    practiceSheetName: '⭐ Networking 101 SDE Interview Sheet',
    practiceSheetUrl: 'https://www.geeksforgeeks.org/computer-network-gq/',
    practiceSheetBadge: 'Recommended for Networking',
  },
  'top-sde-cs-system-design': {
    videoTitle: 'ByteByteGo (Alex Xu): System Design Interview Fundamentals',
    videoProvider: 'ByteByteGo / Alex Xu',
    videoUrl: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
    docTitle: 'System Design Primer (100k+ Stars on GitHub)',
    docProvider: 'Donne Martin',
    docUrl: 'https://github.com/donnemartin/system-design-primer',
    practiceSheetName: '⭐ System Design Architecture Checklist',
    practiceSheetUrl: 'https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions',
    practiceSheetBadge: 'Recommended for System Design',
  },

  // ==================== 2. AI / ML ENGINEER TOPICS ====================
  'top-ai-python-core': {
    videoTitle: 'Corey Schafer: Python Beginner & OOP Complete Course (Millions of Views)',
    videoProvider: 'Corey Schafer',
    videoUrl: 'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXvwh68gCdW0LVc',
    docTitle: 'Python.org Official Documentation & Tutorial',
    docProvider: 'Python Software Foundation',
    docUrl: 'https://docs.python.org/3/tutorial/index.html',
    practiceSheetName: '⭐ Python 30-Day Coding Challenge',
    practiceSheetUrl: 'https://www.hackerrank.com/domains/python',
    practiceSheetBadge: 'Recommended for Python',
  },
  'top-ai-math-stats': {
    videoTitle: '3Blue1Brown: Essence of Linear Algebra & Calculus Intuition',
    videoProvider: '3Blue1Brown',
    videoUrl: 'https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab',
    docTitle: 'Khan Academy: Linear Algebra & Probability Course Notes',
    docProvider: 'Khan Academy',
    docUrl: 'https://www.khanacademy.org/math/linear-algebra',
    practiceSheetName: '⭐ Math for Machine Learning Practice',
    practiceSheetUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    practiceSheetBadge: 'Recommended for AI/ML',
  },
  'top-ai-arrays-sorting': {
    videoTitle: 'Keith Galli: NumPy & Pandas Complete Data Analysis Course',
    videoProvider: 'Keith Galli',
    videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
    docTitle: 'NumPy Official User Guide & Matrix Documentation',
    docProvider: 'NumPy Core Team',
    docUrl: 'https://numpy.org/doc/stable/user/index.html',
    practiceSheetName: '⭐ NumPy 100 Exercises Sheet',
    practiceSheetUrl: 'https://github.com/rougier/numpy-100',
    practiceSheetBadge: 'Recommended for NumPy',
  },
  'top-ai-decision-trees': {
    videoTitle: 'StatQuest with Josh Starmer: Decision Trees & Random Forests Explained',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/watch?v=_L39rN6gz7Y',
    docTitle: 'Scikit-Learn Official Decision Trees Guide',
    docProvider: 'Scikit-Learn Core Team',
    docUrl: 'https://scikit-learn.org/stable/modules/tree.html',
    practiceSheetName: '⭐ Decision Tree Algorithm Practice',
    practiceSheetUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    practiceSheetBadge: 'Recommended for Decision Trees',
  },
  'top-ai-scikit': {
    videoTitle: 'StatQuest with Josh Starmer: Machine Learning Algorithms Explained',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/playlist?list=PLblh5JKooLUICTaGLRoHQDuF_7q2GfuJF',
    docTitle: 'Scikit-Learn Official User Guide & Tutorials',
    docProvider: 'Scikit-Learn Core Team',
    docUrl: 'https://scikit-learn.org/stable/user_guide.html',
    practiceSheetName: '⭐ Kaggle Intro to Machine Learning Sheet',
    practiceSheetUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    practiceSheetBadge: 'Recommended for ML',
  },
  'top-ai-pytorch': {
    videoTitle: 'Aladdin Persson: PyTorch Deep Learning Complete Tutorial Series',
    videoProvider: 'Aladdin Persson',
    videoUrl: 'https://www.youtube.com/playlist?list=PLhhyoLH6IjfxeoooqP9rhU3HJIAVAJ3Ag',
    docTitle: 'PyTorch Official Tutorials & Deep Learning Documentation',
    docProvider: 'PyTorch Foundation',
    docUrl: 'https://pytorch.org/tutorials/',
    practiceSheetName: '⭐ PyTorch Deep Learning Exercises',
    practiceSheetUrl: 'https://github.com/mrdbourke/pytorch-deep-learning',
    practiceSheetBadge: 'Recommended for PyTorch',
  },
  'top-ai-llm-rag': {
    videoTitle: 'Krish Naik: LangChain, LLMs & Vector Databases Masterclass',
    videoProvider: 'Krish Naik',
    videoUrl: 'https://www.youtube.com/playlist?list=PLkn0rU_Xw84aO8-7eRk3Xl7Aep-1ZtBw3',
    docTitle: 'LangChain & HuggingFace Transformers Documentation',
    docProvider: 'LangChain & HuggingFace',
    docUrl: 'https://python.langchain.com/docs/get_started/introduction',
    practiceSheetName: '⭐ RAG & Vector DB Hands-On Guide',
    practiceSheetUrl: 'https://www.pinecone.io/learn/',
    practiceSheetBadge: 'Recommended for GenAI',
  },
  'top-ai-fastapi-docker': {
    videoTitle: 'freeCodeCamp: FastAPI & Docker for Machine Learning Models',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=7t2alSnE2-I',
    docTitle: 'FastAPI Official Documentation & First Steps',
    docProvider: 'FastAPI (Sebastián Ramírez)',
    docUrl: 'https://fastapi.tiangolo.com/tutorial/',
    practiceSheetName: '⭐ MLOps Serving Guide',
    practiceSheetUrl: 'https://ml-ops.org/content/end-to-end-ml-workflow',
    practiceSheetBadge: 'Recommended for MLOps',
  },

  // ==================== 3. FRONTEND ENGINEER TOPICS ====================
  'top-fe-html-css': {
    videoTitle: 'SuperSimpleDev: HTML & CSS Full Course for Beginners',
    videoProvider: 'SuperSimpleDev',
    videoUrl: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
    docTitle: 'MDN Web Docs: Learn HTML5 & Modern CSS Layouts',
    docProvider: 'Mozilla Developer Network (MDN)',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Learn',
    practiceSheetName: '⭐ Frontend Mentor HTML/CSS Challenges',
    practiceSheetUrl: 'https://www.frontendmentor.io/challenges',
    practiceSheetBadge: 'Recommended for Frontend',
  },
  'top-fe-dsa-arrays': {
    videoTitle: 'JavaScript.info: Data Structures & Array Methods Tutorial',
    videoProvider: 'JavaScript.info',
    videoUrl: 'https://javascript.info/data-types',
    docTitle: 'MDN Web Docs: Array Methods (Map, Filter, Reduce)',
    docProvider: 'Mozilla Developer Network (MDN)',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array',
    practiceSheetName: '⭐ 30 Days of JavaScript (LeetCode)',
    practiceSheetUrl: 'https://leetcode.com/studyplan/30-days-of-javascript/',
    practiceSheetBadge: 'Recommended for JS',
  },
  'top-fe-js-core': {
    videoTitle: 'Traversy Media: Modern JavaScript ES6+ Full Course',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=hdI2bkO-Flw',
    docTitle: 'JavaScript.info: The Modern JavaScript Tutorial',
    docProvider: 'JavaScript.info',
    docUrl: 'https://javascript.info/',
    practiceSheetName: '⭐ 30 Days of JavaScript (LeetCode)',
    practiceSheetUrl: 'https://leetcode.com/studyplan/30-days-of-javascript/',
    practiceSheetBadge: 'Recommended for JS',
  },
  'top-fe-react': {
    videoTitle: 'freeCodeCamp: Full React Course with Projects',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    docTitle: 'React.dev: Official React Documentation & Interactive Tutorial',
    docProvider: 'Meta Open Source',
    docUrl: 'https://react.dev/learn',
    practiceSheetName: '⭐ GreatFrontEnd React Interview Questions',
    practiceSheetUrl: 'https://www.greatfrontend.com/questions/quiz',
    practiceSheetBadge: 'Recommended for React',
  },
  'top-fe-nextjs': {
    videoTitle: 'Fireship & freeCodeCamp: Next.js App Router Full Course',
    videoProvider: 'Fireship / freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=wm5gMKCOyIk',
    docTitle: 'Next.js Official Documentation & Learn Course',
    docProvider: 'Vercel',
    docUrl: 'https://nextjs.org/learn',
    practiceSheetName: '⭐ Web Vitals Optimization Guide',
    practiceSheetUrl: 'https://web.dev/learn/performance',
    practiceSheetBadge: 'Recommended for Next.js',
  },
  'top-fe-browser-net': {
    videoTitle: 'Fireship: How Browsers Work & Networking Protocols',
    videoProvider: 'Fireship',
    videoUrl: 'https://www.youtube.com/watch?v=WjTrfoiB0MQ',
    docTitle: 'web.dev: Learn Performance & Critical Rendering Path',
    docProvider: 'Google Chrome Core Team',
    docUrl: 'https://web.dev/learn/performance',
    practiceSheetName: '⭐ Browser Rendering Performance Checklist',
    practiceSheetUrl: 'https://web.dev/articles/critical-rendering-path',
    practiceSheetBadge: 'Recommended for Browser Architecture',
  },

  // ==================== 4. BACKEND ENGINEER TOPICS ====================
  'top-be-lang-core': {
    videoTitle: 'freeCodeCamp: Node.js & Server-side JavaScript Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    docTitle: 'Node.js Official Documentation & Guides',
    docProvider: 'OpenJS Foundation',
    docUrl: 'https://nodejs.org/en/docs/guides',
    practiceSheetName: '⭐ Node.js Core API Practice',
    practiceSheetUrl: 'https://nodejs.org/api/',
    practiceSheetBadge: 'Recommended for Backend',
  },
  'top-be-dsa-hash-queue': {
    videoTitle: 'Husseini Nasser: Database Indexing, Hashing & Queues',
    videoProvider: 'Husseini Nasser',
    videoUrl: 'https://www.youtube.com/@HousseinNasser',
    docTitle: 'GeeksforGeeks: Hashing Data Structure & Priority Queues',
    docProvider: 'GeeksforGeeks',
    docUrl: 'https://www.geeksforgeeks.org/hashing-data-structure/',
    practiceSheetName: '⭐ LeetCode Hash Table & Queue Sheet',
    practiceSheetUrl: 'https://leetcode.com/tag/hash-table/',
    practiceSheetBadge: 'Recommended for Backend DSA',
  },
  'top-be-rest-microservices': {
    videoTitle: 'freeCodeCamp: Node.js, Express & REST API Masterclass',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    docTitle: 'Express.js Official Guide & RESTful Routing Documentation',
    docProvider: 'OpenJS Foundation',
    docUrl: 'https://expressjs.com/en/starter/installing.html',
    practiceSheetName: '⭐ REST API Design Best Practices',
    practiceSheetUrl: 'https://github.com/microsoft/api-guidelines',
    practiceSheetBadge: 'Recommended for Node.js',
  },
  'top-be-relational-nosql': {
    videoTitle: 'Traversy Media: PostgreSQL & MongoDB Crash Courses',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
    docTitle: 'PostgreSQL & MongoDB Official Documentation',
    docProvider: 'PostgreSQL Global Development Group',
    docUrl: 'https://www.postgresql.org/docs/current/',
    practiceSheetName: '⭐ SQL Zoo & LeetCode Database Sheet',
    practiceSheetUrl: 'https://sqlzoo.net/',
    practiceSheetBadge: 'Recommended for SQL',
  },
  'top-be-system-design': {
    videoTitle: 'ByteByteGo (Alex Xu): System Design Interview Fundamentals',
    videoProvider: 'ByteByteGo / Alex Xu',
    videoUrl: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
    docTitle: 'System Design Primer (100k+ Stars on GitHub)',
    docProvider: 'Donne Martin',
    docUrl: 'https://github.com/donnemartin/system-design-primer',
    practiceSheetName: '⭐ System Design Architecture Checklist',
    practiceSheetUrl: 'https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions',
    practiceSheetBadge: 'Recommended for SDE II',
  },

  // ==================== 5. FULL STACK DEVELOPER TOPICS ====================
  'top-fs-js-ts': {
    videoTitle: 'Traversy Media: TypeScript & Modern Fullstack JavaScript',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
    docTitle: 'TypeScript Official Handbook & Documentation',
    docProvider: 'Microsoft TypeScript Team',
    docUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    practiceSheetName: '⭐ TypeScript Exercises & Type Challenges',
    practiceSheetUrl: 'https://github.com/type-challenges/type-challenges',
    practiceSheetBadge: 'Recommended for TypeScript',
  },
  'top-fs-dsa-core': {
    videoTitle: 'NeetCode: Data Structures & Algorithms Roadmap',
    videoProvider: 'NeetCode',
    videoUrl: 'https://www.youtube.com/watch?v=KLlXCFG5TnA',
    docTitle: 'NeetCode.io Interactive Algorithms Sheet',
    docProvider: 'NeetCode',
    docUrl: 'https://neetcode.io/practice',
    practiceSheetName: '⭐ NeetCode 150 Sheet',
    practiceSheetUrl: 'https://neetcode.io/practice',
    practiceSheetBadge: 'Recommended for Fullstack',
  },
  'top-fs-react-next': {
    videoTitle: 'freeCodeCamp: Full Stack Next.js & React Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=wm5gMKCOyIk',
    docTitle: 'Next.js Documentation & App Router Tutorial',
    docProvider: 'Vercel',
    docUrl: 'https://nextjs.org/docs',
    practiceSheetName: '⭐ Next.js Learn Practice Exercises',
    practiceSheetUrl: 'https://nextjs.org/learn',
    practiceSheetBadge: 'Recommended for Next.js',
  },
  'top-fs-node-express-db': {
    videoTitle: 'freeCodeCamp: Full Stack MERN App from Scratch',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    docTitle: 'MongoDB University & Manual Documentation',
    docProvider: 'MongoDB Inc',
    docUrl: 'https://www.mongodb.com/docs/',
    practiceSheetName: '⭐ Fullstack MERN Practice Project Spec',
    practiceSheetUrl: 'https://www.freecodecamp.org/news/tag/mern/',
    practiceSheetBadge: 'Recommended for Fullstack',
  },
  'top-fs-docker-deployment': {
    videoTitle: 'TechWorld with Nana: Docker Containerization for Fullstack Apps',
    videoProvider: 'TechWorld with Nana',
    videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    docTitle: 'Vercel & Render Deployment Guides',
    docProvider: 'Vercel & Render',
    docUrl: 'https://vercel.com/docs',
    practiceSheetName: '⭐ Docker Compose Multi-Container Guide',
    practiceSheetUrl: 'https://docs.docker.com/compose/',
    practiceSheetBadge: 'Recommended for Deployment',
  },

  // ==================== 6. DATA SCIENTIST / ANALYST TOPICS ====================
  'top-ds-pandas-sql': {
    videoTitle: 'Keith Galli: Complete Pandas Data Analysis Tutorial',
    videoProvider: 'Keith Galli',
    videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
    docTitle: 'Pandas User Guide & SQL Window Functions Reference',
    docProvider: 'Pandas & GeeksforGeeks',
    docUrl: 'https://pandas.pydata.org/docs/user_guide/index.html',
    practiceSheetName: '⭐ LeetCode 50 SQL Study Plan',
    practiceSheetUrl: 'https://leetcode.com/studyplan/top-sql-50/',
    practiceSheetBadge: 'Recommended for SQL',
  },
  'top-ds-stats-prob': {
    videoTitle: 'StatQuest with Josh Starmer: Statistics & Probability Fundamentals',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/playlist?list=PLblh5JKooLUK0FLuzwntyYI10UQFUhsY9',
    docTitle: 'Khan Academy: High School Statistics & Probability',
    docProvider: 'Khan Academy',
    docUrl: 'https://www.khanacademy.org/math/statistics-probability',
    practiceSheetName: '⭐ Probability & Statistics Practice',
    practiceSheetUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    practiceSheetBadge: 'Recommended for Stats',
  },
  'top-ds-eda-viz': {
    videoTitle: 'Luke Barousse: Python Data Visualization (Matplotlib & Seaborn)',
    videoProvider: 'Luke Barousse',
    videoUrl: 'https://www.youtube.com/watch?v=3g6mlycK5L0',
    docTitle: 'Seaborn Official Statistical Data Visualization Tutorial',
    docProvider: 'Seaborn Core Team',
    docUrl: 'https://seaborn.pydata.org/tutorial.html',
    practiceSheetName: '⭐ Kaggle Data Visualization Micro-Course',
    practiceSheetUrl: 'https://www.kaggle.com/learn/data-visualization',
    practiceSheetBadge: 'Recommended for Data Viz',
  },
  'top-ds-scikit-pyspark': {
    videoTitle: 'freeCodeCamp: PySpark Big Data & Machine Learning',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=_C8kWso4XwM',
    docTitle: 'Apache Spark Official PySpark API Documentation',
    docProvider: 'Apache Software Foundation',
    docUrl: 'https://spark.apache.org/docs/latest/api/python/',
    practiceSheetName: '⭐ PySpark DataFrame Exercises',
    practiceSheetUrl: 'https://spark.apache.org/docs/latest/sql-getting-started.html',
    practiceSheetBadge: 'Recommended for Big Data',
  },
  'top-ds-etl-cloud': {
    videoTitle: 'freeCodeCamp: Data Engineering & ETL Pipelines Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=qWru-b6m030',
    docTitle: 'Snowflake Documentation & Data Warehousing Guide',
    docProvider: 'Snowflake Inc',
    docUrl: 'https://docs.snowflake.com/',
    practiceSheetName: '⭐ Snowflake & SQL ETL Practice',
    practiceSheetUrl: 'https://quickstarts.snowflake.com/',
    practiceSheetBadge: 'Recommended for ETL',
  },

  // ==================== 7. DEVOPS ENGINEER TOPICS ====================
  'top-devops-linux-bash': {
    videoTitle: 'NetworkChuck: Linux for Beginners Full Course',
    videoProvider: 'NetworkChuck',
    videoUrl: 'https://www.youtube.com/playlist?list=PLIhvCqJhN881E_GE50ZTHY-i00Xy4d9-g',
    docTitle: 'Linux Journey: Interactive Linux Administration Guide',
    docProvider: 'Linux Journey',
    docUrl: 'https://linuxjourney.com/',
    practiceSheetName: '⭐ OverTheWire Bandit Linux Labs',
    practiceSheetUrl: 'https://overthewire.org/wargames/bandit/',
    practiceSheetBadge: 'Recommended for Linux',
  },
  'top-devops-dsa-logs': {
    videoTitle: 'Husseini Nasser: Log Parsing, Event Loops & Systems Buffers',
    videoProvider: 'Husseini Nasser',
    videoUrl: 'https://www.youtube.com/@HousseinNasser',
    docTitle: 'Regex101: Interactive Regular Expression Tester & Guide',
    docProvider: 'Regex101',
    docUrl: 'https://regex101.com/',
    practiceSheetName: '⭐ Regex & Log Parsing Exercises',
    practiceSheetUrl: 'https://regexone.com/',
    practiceSheetBadge: 'Recommended for Log Parsing',
  },
  'top-devops-docker-k8s': {
    videoTitle: 'TechWorld with Nana: Docker & Kubernetes Full Course',
    videoProvider: 'TechWorld with Nana',
    videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    docTitle: 'Docker & Kubernetes Official Getting Started Guides',
    docProvider: 'Docker Inc & CNCF',
    docUrl: 'https://docs.docker.com/get-started/',
    practiceSheetName: '⭐ Kubernetes Basics Interactive Labs',
    practiceSheetUrl: 'https://kubernetes.io/docs/tutorials/kubernetes-basics/',
    practiceSheetBadge: 'Recommended for K8s',
  },
  'top-devops-terraform-aws': {
    videoTitle: 'freeCodeCamp: Terraform Infrastructure as Code Full Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=7xngnjfIlK4',
    docTitle: 'HashiCorp Terraform Documentation & AWS Provider Guide',
    docProvider: 'HashiCorp',
    docUrl: 'https://developer.hashicorp.com/terraform/tutorials',
    practiceSheetName: '⭐ AWS Skill Builder Free Labs',
    practiceSheetUrl: 'https://explore.skillbuilder.aws/',
    practiceSheetBadge: 'Recommended for AWS',
  },
  'top-devops-cicd-grafana': {
    videoTitle: 'freeCodeCamp: GitHub Actions & Grafana Prometheus Monitoring',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjU',
    docTitle: 'Prometheus & Grafana Official Documentation',
    docProvider: 'Prometheus / Grafana',
    docUrl: 'https://prometheus.io/docs/introduction/overview/',
    practiceSheetName: '⭐ GitHub Actions CI/CD Workshop',
    practiceSheetUrl: 'https://lab.github.com/',
    practiceSheetBadge: 'Recommended for CI/CD',
  },

  // ==================== 8. MOBILE APP DEVELOPER TOPICS ====================
  'top-mobile-lang-syntax': {
    videoTitle: 'Vandad Nahavandipoor: Dart 3 & Flutter Syntax Masterclass',
    videoProvider: 'Vandad Nahavandipoor',
    videoUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
    docTitle: 'Dart.dev: Official Dart Language Tour & Null Safety',
    docProvider: 'Google Dart Team',
    docUrl: 'https://dart.dev/guides',
    practiceSheetName: '⭐ Dart Language Exercises',
    practiceSheetUrl: 'https://dart.dev/codelabs',
    practiceSheetBadge: 'Recommended for Dart',
  },
  'top-mobile-dsa-lists': {
    videoTitle: 'Flutter Official: Mobile UI Rendering & Memory Performance',
    videoProvider: 'Google Flutter Team',
    videoUrl: 'https://www.youtube.com/watch?v=vQtN2Q6_gR8',
    docTitle: 'Flutter Official UI Performance & Profiling Guide',
    docProvider: 'Google Flutter Team',
    docUrl: 'https://docs.flutter.dev/perf/ui-performance',
    practiceSheetName: '⭐ Flutter Performance Best Practices',
    practiceSheetUrl: 'https://docs.flutter.dev/perf',
    practiceSheetBadge: 'Recommended for Mobile DSA',
  },
  'top-mobile-ui-widgets': {
    videoTitle: 'Vandad Nahavandipoor: Flutter & Dart 3 Complete Course',
    videoProvider: 'Vandad Nahavandipoor',
    videoUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
    docTitle: 'Flutter Official Codelabs & Documentation',
    docProvider: 'Google Flutter Team',
    docUrl: 'https://docs.flutter.dev/get-started/codelabs',
    practiceSheetName: '⭐ Flutter Widget Catalog & Exercises',
    practiceSheetUrl: 'https://docs.flutter.dev/ui/widgets',
    practiceSheetBadge: 'Recommended for Flutter',
  },
  'top-mobile-apis-native': {
    videoTitle: 'freeCodeCamp: Flutter REST API Integration & State Management',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=mJ3bGvy0WAY',
    docTitle: 'Flutter Official Networking & HTTP Fetch Guide',
    docProvider: 'Google Flutter Team',
    docUrl: 'https://docs.flutter.dev/cookbook/networking/fetch-data',
    practiceSheetName: '⭐ Mobile REST API Practice Codelab',
    practiceSheetUrl: 'https://docs.flutter.dev/cookbook/networking',
    practiceSheetBadge: 'Recommended for Mobile APIs',
  },
  'top-mobile-arch-security': {
    videoTitle: 'Android Developers: Modern Mobile Architecture & State',
    videoProvider: 'Android Developers',
    videoUrl: 'https://www.youtube.com/watch?v=pPky6zYfEFE',
    docTitle: 'Android Developers Official Guide to App Architecture',
    docProvider: 'Google Android Core Team',
    docUrl: 'https://developer.android.com/topic/architecture',
    practiceSheetName: '⭐ Mobile App Security Checklist',
    practiceSheetUrl: 'https://owasp.org/www-project-mobile-top-10/',
    practiceSheetBadge: 'Recommended for Mobile Security',
  },
};

        const trustedRes = TRUSTED_DIRECT_RESOURCES[top.id];

        // Build primary video using DB match or direct trusted playlist URL
        const primaryVid = mapResourceToStep(mentorRes.primaryVideo) || (trustedRes ? {
          id: `vid-${top.id}`,
          title: trustedRes.videoTitle,
          provider: trustedRes.videoProvider,
          url: trustedRes.videoUrl,
          type: 'video',
          difficulty: top.difficulty,
        } : {
          id: `vid-${top.id}`,
          title: `${top.title} — Official Course & Masterclass`,
          provider: top.title.toLowerCase().includes('python') || normLanguage === 'Python'
            ? 'Corey Schafer / freeCodeCamp'
            : top.title.toLowerCase().includes('c++') || normLanguage === 'C++'
            ? 'Striver (takeUforward) / Luv'
            : top.title.toLowerCase().includes('react')
            ? 'freeCodeCamp / Traversy Media'
            : 'Kunal Kushwaha / freeCodeCamp',
          url: 'https://www.youtube.com/@freecodecamp/playlists',
          type: 'video',
          difficulty: top.difficulty,
        });

        // Build primary documentation using DB match or direct trusted doc URL
        const primaryDoc = mapResourceToStep(mentorRes.primaryNote) || (trustedRes ? {
          id: `doc-${top.id}`,
          title: trustedRes.docTitle,
          provider: trustedRes.docProvider,
          url: trustedRes.docUrl,
          type: 'article',
        } : {
          id: `doc-${top.id}`,
          title: `Official Documentation & Reference Notes for ${top.title}`,
          provider: top.title.toLowerCase().includes('react')
            ? 'React.dev Docs'
            : top.title.toLowerCase().includes('python')
            ? 'Python.org Official Docs'
            : top.title.toLowerCase().includes('docker')
            ? 'Docker Docs'
            : 'GeeksforGeeks / MDN Web Docs',
          url: top.title.toLowerCase().includes('python')
            ? 'https://docs.python.org/3/'
            : top.title.toLowerCase().includes('react')
            ? 'https://react.dev/learn'
            : top.title.toLowerCase().includes('docker')
            ? 'https://docs.docker.com/get-started/'
            : 'https://developer.mozilla.org/en-US/docs/Web',
          type: 'article',
        });

        // Build practice sheet using DB match or direct trusted sheet
        const primarySheet = mentorRes.primaryDsaSheet
          ? {
              title: mentorRes.primaryDsaSheet.name,
              provider: 'Curated Practice Sheet',
              url: mentorRes.primaryDsaSheet.url,
              badge: mentorRes.primaryDsaSheet.badge,
            }
          : (trustedRes ? {
              title: trustedRes.practiceSheetName,
              provider: 'Curated Practice Sheet',
              url: trustedRes.practiceSheetUrl,
              badge: trustedRes.practiceSheetBadge,
            } : {
              title: `⭐ ${top.title} Practice Exercises`,
              provider: 'Curated Practice Sheet',
              url: normLanguage === 'Python' ? 'https://neetcode.io/practice' : 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
              badge: `Recommended for ${normLanguage}`,
            });

        // Build practice problems
        const practiceProbs = (mentorRes.practiceProblems || []).length > 0
          ? (mentorRes.practiceProblems || []).map((p) => mapResourceToStep(p)!)
          : [
              {
                id: `prob-${top.id}-1`,
                title: `${top.title} — Foundational LeetCode Practice`,
                provider: 'LeetCode',
                url: 'https://leetcode.com/problemset/all/',
                difficulty: top.difficulty,
              },
              {
                id: `prob-${top.id}-2`,
                title: `${top.title} — GeeksforGeeks Coding Exercises`,
                provider: 'GeeksforGeeks',
                url: 'https://www.geeksforgeeks.org/explore?page=1&sortBy=submissions',
                difficulty: top.difficulty,
              },
            ];

        // Build projects
        const projItems = projectItems.length > 0
          ? projectItems
          : [
              {
                id: `proj-${top.id}-1`,
                title: `Portfolio Application Sprint for ${top.title}`,
                provider: 'EngineerPath Project Library',
                url: 'https://github.com/freeCodeCamp/freeCodeCamp',
                level: top.difficulty.toLowerCase(),
                estimatedHours: 15,
                tags: ['Project', top.difficulty, 'Hands-on'],
              },
            ];

        // Prepare alternative resources (purely additive gap-fillers)
        const altVideos: GuidedStepResource[] = (mentorRes.alternativeVideos || []).map((v) => mapResourceToStep(v)!);
        const altNotes: GuidedStepResource[] = (mentorRes.alternativeNotes || []).map((n) => mapResourceToStep(n)!);
        const altSheets: Array<{ name: string; url: string }> = [...(mentorRes.alternativeDsaSheets || [])];

        // GAP-FILLER 1: SDE Track (DSA section) — Add NeetCode 150 & NeetCode Roadmap
        if (top.id.startsWith('top-sde-dsa') || top.id === 'top-sde-lang-syntax' || top.id === 'top-fs-dsa-core') {
          altSheets.unshift({
            name: '⭐ NeetCode 150 & NeetCode Roadmap (Video Walkthroughs)',
            url: 'https://neetcode.io/practice',
          });
          altVideos.push({
            id: `vid-neetcode-${top.id}`,
            title: 'NeetCode 150: Algorithms & Problem Walkthroughs (Free)',
            provider: 'NeetCode (YouTube / neetcode.io)',
            url: 'https://www.youtube.com/c/NeetCode',
            type: 'video',
            difficulty: top.difficulty,
          });
          altNotes.push({
            id: `note-neetcode-${top.id}`,
            title: 'NeetCode 150 Practice Guide (Video-walkthrough complement to Striver A2Z)',
            provider: 'NeetCode.io (Free)',
            url: 'https://neetcode.io/roadmap',
            type: 'article',
          });
        }

        // GAP-FILLER 2: AI/ML Track — Add Andrew Ng Machine Learning Specialization
        if (top.id === 'top-ai-python-core' || top.id === 'top-ai-scikit' || top.id === 'top-ai-math-stats') {
          altVideos.unshift({
            id: `vid-andrew-ng-${top.id}`,
            title: 'Andrew Ng: Machine Learning Specialization (DeepLearning.AI)',
            provider: 'Andrew Ng / Coursera (Free Audit)',
            url: 'https://www.youtube.com/playlist?list=PLkD_b64UXVP8P4n3Z277tFj6K38rN44bE',
            type: 'video',
            difficulty: 'Beginner',
          });
          altNotes.unshift({
            id: `note-andrew-ng-${top.id}`,
            title: 'Andrew Ng ML Specialization (Standard entry point for ML fundamentals - Free Audit)',
            provider: 'Coursera / DeepLearning.AI (Free Audit)',
            url: 'https://www.coursera.org/specializations/machine-learning-introduction',
            type: 'article',
          });
        }

        // GAP-FILLER 3: Data Scientist Track — Add Kaggle Learn Micro-Courses
        if (top.id.startsWith('top-ds-') || top.id === 'top-ai-arrays-sorting') {
          altSheets.unshift({
            name: '⭐ Kaggle Learn: Interactive Micro-Courses (Free)',
            url: 'https://www.kaggle.com/learn',
          });
          altNotes.unshift({
            id: `note-kaggle-${top.id}`,
            title: 'Kaggle Learn: Hands-on practice with real datasets in interactive Jupyter environments (Free)',
            provider: 'Kaggle (Free)',
            url: 'https://www.kaggle.com/learn',
            type: 'article',
          });
        }

        // GAP-FILLER 4: DevOps Track — Add KodeKloud Free-Tier Labs
        if (top.id.startsWith('top-devops-')) {
          altSheets.unshift({
            name: '⭐ KodeKloud Free Interactive Terminal Labs (Free)',
            url: 'https://kodekloud.com/',
          });
          altNotes.unshift({
            id: `note-kodekloud-${top.id}`,
            title: 'KodeKloud: Hands-on terminal labs for Linux, Docker & Kubernetes (Free Tier)',
            provider: 'KodeKloud (Free Tier)',
            url: 'https://kodekloud.com/',
            type: 'article',
          });
        }

        // GAP-FILLER 5: Mobile App Developer Track — Add Native Android & Native iOS platform choices
        if (top.id.startsWith('top-mobile-')) {
          altNotes.unshift(
            {
              id: `note-platform-choice-${top.id}`,
              title: '💡 Choose Your Platform: Cross-Platform (Flutter) vs Native Android (Kotlin) vs Native iOS (Swift)',
              provider: 'EngineerPath Guidance Note (Free)',
              url: 'https://developer.android.com/courses',
              type: 'article',
            },
            {
              id: `note-android-official-${top.id}`,
              title: 'Native Android: Android Developer Fundamentals & Kotlin Training (Official)',
              provider: 'Google Android Developers (Free)',
              url: 'https://developer.android.com/courses',
              type: 'article',
            },
            {
              id: `note-apple-swiftui-${top.id}`,
              title: 'Native iOS: SwiftUI & Swift Language Official Tutorials (Apple)',
              provider: 'Apple Developer (Free)',
              url: 'https://developer.apple.com/tutorials/swiftui',
              type: 'article',
            }
          );

          altVideos.push(
            {
              id: `vid-android-official-${top.id}`,
              title: 'Native Android: Android Developer Fundamentals (Google Official)',
              provider: 'Google Android Developers (Free on YouTube)',
              url: 'https://www.youtube.com/user/androiddevelopers',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-kotlin-${top.id}`,
              title: 'Native Android: Kotlin Syntax & Android App Course (Philipp Lackner)',
              provider: 'Philipp Lackner (Free on YouTube)',
              url: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-swiftui-allen-${top.id}`,
              title: 'Native iOS: SwiftUI & Swift Language Essentials (Sean Allen)',
              provider: 'Sean Allen (Free on YouTube)',
              url: 'https://www.youtube.com/c/SeanAllen',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-codewithchris-${top.id}`,
              title: 'Native iOS: Swift & iOS App Development for Beginners (CodeWithChris)',
              provider: 'CodeWithChris (Free on YouTube)',
              url: 'https://www.youtube.com/c/CodeWithChris',
              type: 'video',
              difficulty: top.difficulty,
            }
          );
        }

        top.guidedFlow = {
          hasResources: true,
          step1PrimaryPlaylist: primaryVid,
          step2Documentation: primaryDoc,
          step3PracticeSheet: primarySheet,
          step4PracticeProblems: practiceProbs,
          step5Projects: projItems,
          step6InterviewQuestions: intQuestions,
          step7RevisionNotes: revNotes,
          alternativeResources: {
            videos: altVideos,
            notes: altNotes,
            sheets: altSheets,
          },
        };

        top.resourceCount = Math.max(allResolved.length, practiceProbs.length + 3);
      });
    });
    cat.moduleCount = cat.modules.length;
    cat.topicCount = catTopicCount;
  });

  return {
    role: normRole,
    language: normLanguage,
    categories,
  };
};
