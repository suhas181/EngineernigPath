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
  DEV_REACT_NATIVE: [
    { title: 'React Native Architecture (Fabric & TurboModules)', text: 'Fabric is the concurrent C++ rendering engine communicating directly with native views via JSI without async JSON serialization. TurboModules provide lazy, direct C++ bindings to platform APIs.' },
    { title: 'FlatList Virtualization & 60 FPS Scrolling', text: 'Optimize FlatList by providing getItemLayout, windowSize={5}, maxToRenderPerBatch={10}, initialNumToRender={10}, removeClippedSubviews={true}, and React.memo on renderItem.' },
    { title: 'Offline-First & Local Data Architecture', text: 'Store sensitive auth tokens in SecureStore/Keychain. Cache structured records in SQLite/WatermelonDB, detect network with NetInfo, and queue mutations for automated background sync.' },
    { title: 'Hermes Engine & Bundle Optimization', text: 'Hermes compiles JavaScript ahead-of-time (AOT) into pre-parsed bytecode, drastically reducing app startup time (TTI), memory usage, and download size.' },
  ],
  LANG_TYPESCRIPT_CORE: [
    { title: 'TypeScript Discriminated Unions', text: 'Use literal type tags on interfaces to enforce exhaustive type narrowing in Redux reducers, state machines, and API handlers.' },
    { title: 'Generics in Mobile API Services', text: 'Wrap network responses in generic ApiResponse<T> interfaces to enforce compile-time type safety across all mobile REST endpoints.' },
  ],
  DEV_MOBILE_SECURITY: [
    { title: 'OWASP Mobile Top 10 Defenses', text: 'Enforce SSL/TLS Certificate Pinning against MITM proxies, store secrets in Android Keystore / iOS Keychain, enable biometrics, and obfuscate release builds with ProGuard/R8.' },
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
  DEV_REACT_NATIVE: [
    'Why is my React Native screen re-rendering unnecessarily, and how do you diagnose it with React DevTools Profiler?',
    'How would you optimize a FlatList with 10,000 items to guarantee 60 FPS scrolling without memory spikes?',
    'Explain how React Native New Architecture (Fabric, TurboModules, JSI) differs from the asynchronous JSON bridge.',
    'How would you design an offline-first mobile app that queues mutations locally and syncs with backend once online?',
    'How do you securely store JWT access and refresh tokens on Android and iOS devices using SecureStore/Keychain?',
    'How would you debug a production-only crash in a published React Native application using Sentry and symbolicated native stack traces?',
    'How do you implement background push notifications with Firebase Cloud Messaging (FCM) and Apple APNs?',
    'How would you reduce mobile application startup time (TTI) on low-end Android devices using Hermes and bytecode pre-compilation?',
    'How would you publish a React Native application to Google Play Store using Fastlane and GitHub Actions CI/CD?',
    'How would you handle poor network connectivity with optimistic UI updates and TanStack Query?',
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
        id: 'python-math-data-foundations',
        title: '1. Python, Mathematics & Data Foundations',
        description: 'Build the Python, mathematics, statistics, and data-handling foundations required for practical AI and machine learning.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-python-data-math',
            title: 'Python Programming, Data Wrangling & Applied Mathematics',
            description: 'Python syntax, OOP, modules, virtual environments, NumPy, Pandas, Data Cleaning, Data Visualization, SQL, Probability, Statistics, Linear Algebra, and Calculus.',
            topics: [
              {
                id: 'top-aiml-python-data-math',
                title: 'Python Fundamentals, Data Libraries (NumPy, Pandas) & Math Foundations',
                description: 'Python syntax, OOP, functions, modules, virtual environments, NumPy, Pandas, data cleaning, data visualization, SQL fundamentals, probability, descriptive statistics, distributions, hypothesis testing, linear algebra (vectors/matrices, operations, eigenvalues), calculus (gradients, optimization), and building an Exploratory Data Analysis (EDA) project.',
                difficulty: 'Beginner',
                estimatedTime: '25 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'LANG_PYTHON_OOPS', 'APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'machine-learning-fundamentals',
        title: '2. Machine Learning Fundamentals',
        description: 'Learn classical machine learning algorithms, model evaluation, feature engineering, and practical ML workflows.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-classical-ml',
            title: 'Supervised/Unsupervised Algorithms & Practical ML Pipelines',
            description: 'Scikit-learn, XGBoost, feature engineering, cross-validation, hyperparameter tuning, metrics (Precision, Recall, F1, ROC-AUC), and model explainability (SHAP).',
            topics: [
              {
                id: 'top-aiml-classical-ml',
                title: 'Classical Machine Learning Algorithms, Feature Engineering & Model Evaluation',
                description: 'Supervised vs Unsupervised ML, train/val/test splits, Linear/Logistic/Polynomial Regression, KNN, Naive Bayes, Decision Trees, Random Forest, Gradient Boosting, XGBoost, SVM, K-Means, Hierarchical Clustering, PCA, feature scaling, categorical encoding, handling missing/imbalanced data, cross-validation, hyperparameter tuning, overfitting/underfitting, bias vs variance, regularization, metrics (Precision/Recall/F1, ROC-AUC, Confusion Matrix), SHAP interpretation, and building an End-to-End Machine Learning Prediction System API.',
                difficulty: 'Intermediate',
                estimatedTime: '30 Hours',
                curriculumKeys: ['LANG_PYTHON_COLLECTIONS', 'DEV_PYTHON_BACKEND'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'deep-learning-pytorch',
        title: '3. Deep Learning & PyTorch',
        description: 'Learn neural networks and modern deep learning with PyTorch, including training, optimization, CNNs, transformers, and model evaluation.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-deep-learning-pytorch',
            title: 'Neural Networks, PyTorch Framework & Deep Learning Architectures',
            description: 'Perceptrons, activation functions, backpropagation, optimizers, PyTorch Tensors, DataLoader, training loops, GPU training, CNNs, computer vision, transfer learning, RNNs/LSTMs, attention mechanisms, and transformers.',
            topics: [
              {
                id: 'top-aiml-deep-learning-pytorch',
                title: 'Neural Networks, PyTorch & Deep Learning Architectures',
                description: 'Perceptrons, activation functions, forward/backpropagation, loss functions, optimizers (Adam/SGD), learning rates, regularization, dropout, batch normalization, PyTorch Tensors, Dataset & DataLoader, training/validation loops, model checkpoints, GPU acceleration, CNNs, computer vision, transfer learning, RNNs/LSTMs, attention mechanisms, transformer architecture, model evaluation, and building a PyTorch Deep Learning Application API.',
                difficulty: 'Intermediate',
                estimatedTime: '35 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'generative-ai-llms-nlp',
        title: '4. Generative AI, LLMs & NLP',
        description: 'Learn how modern LLM-powered applications work and build practical Generative AI systems.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-genai-llms',
            title: 'NLP, Transformers & LLM Application Engineering',
            description: 'NLP preprocessing, tokenization, embeddings, attention mechanisms, context windows, prompt engineering, structured outputs, function/tool calling, OpenAI-compatible APIs, Hugging Face Transformers, open-source LLMs, local LLM inference (Ollama, vLLM), and streaming responses.',
            topics: [
              {
                id: 'top-aiml-genai-llms',
                title: 'NLP Fundamentals, Transformers & LLM Application Engineering',
                description: 'NLP fundamentals, text preprocessing, tokenization, word embeddings, transformers, attention mechanisms, context windows, prompt engineering, system/user/assistant messaging, structured outputs, function/tool calling, OpenAI-compatible APIs, Hugging Face Transformers, open-source LLMs, temperature & sampling parameters, streaming responses, multimodal AI basics, local LLM inference (Ollama, vLLM), and building a Production LLM Application.',
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
        id: 'rag-agents-application-engineering',
        title: '5. RAG, Agents & AI Application Engineering',
        description: 'Build production-style AI applications using retrieval, embeddings, vector databases, tool calling, agents, and evaluation.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-rag-agents',
            title: 'Vector Search, RAG Pipelines & Autonomous AI Agents',
            description: 'Embeddings, vector databases (FAISS, pgvector, Pinecone), document chunking, hybrid retrieval, reranking, RAG evaluation, hallucination reduction, conversation memory, tool calling, agent loops, LangChain, LlamaIndex, LangGraph, MCP, AI guardrails, and AI security.',
            topics: [
              {
                id: 'top-aiml-rag-agents',
                title: 'Embeddings, Vector Databases, RAG Architecture & AI Agents',
                description: 'Embeddings, semantic search, vector similarity, vector DBs (FAISS, pgvector, Pinecone), document ingestion & chunking, metadata filtering, hybrid search, reranking, RAG architecture & evaluation, hallucination reduction, conversation memory, tool calling, agent loops, planning, multi-agent frameworks, LangChain, LlamaIndex, LangGraph, Model Context Protocol (MCP), AI guardrails, prompt injection mitigation, AI security, and building a Production RAG + Agent Application.',
                difficulty: 'Advanced',
                estimatedTime: '40 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_REST_APIS', 'CS_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mlops-serving-cloud',
        title: '6. MLOps, Model Serving & Cloud',
        description: 'Learn how to deploy, monitor, version, and operate machine learning and AI systems in production.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-mlops-serving',
            title: 'Model Serialization, Serving, Containers & Cloud Monitoring',
            description: 'ML lifecycle, experiment tracking (MLflow), data versioning (DVC), FastAPI model serving, Docker containerization, CI/CD (GitHub Actions), AWS fundamentals (S3/EC2), GPU inference optimization (quantization), model/data drift monitoring, latency, retries, and responsible AI.',
            topics: [
              {
                id: 'top-aiml-mlops-serving',
                title: 'MLOps Pipelines, Model Serving with FastAPI, Docker & Cloud',
                description: 'ML lifecycle, experiment tracking with MLflow, DVC data versioning, model serialization, FastAPI serving, batch vs real-time inference, Docker & Docker Compose, CI/CD pipelines (GitHub Actions), cloud hosting fundamentals (AWS S3/EC2), GPU basics, inference quantization, model & data drift monitoring, latency/throughput metrics, cost tracking, observability, retries, fallbacks, health checks, responsible AI, and building a Deployable ML/AI Service.',
                difficulty: 'Advanced',
                estimatedTime: '30 Hours',
                curriculumKeys: ['DEV_DOCKER', 'DEV_REST_APIS', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aiml-projects-portfolio',
        title: '7. AI/ML Projects & Portfolio',
        description: 'Build substantial end-to-end AI systems that demonstrate real engineering ability instead of only notebooks and tutorials.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-projects-portfolio',
            title: 'End-to-End AI Engineering Projects & Final Capstone',
            description: '5-tier project progression: Classical ML System, PyTorch Deep Learning App, Production RAG System, Agentic AI Application, and the Final "Production AI Platform" Capstone combining Python, FastAPI, PostgreSQL, Redis, LLM APIs, Vector DBs, Agents, Docker, CI/CD, and Cloud deployment.',
            topics: [
              {
                id: 'top-aiml-projects-portfolio',
                title: 'End-to-End AI Engineering Projects & Capstone Platform',
                description: 'Project 1 (Classical ML: Prediction Pipeline with FastAPI), Project 2 (Deep Learning: PyTorch Classification API), Project 3 (Production RAG: Embeddings & Vector DB Search), Project 4 (Agentic AI Application: Tool Calling & Guardrails), and Final Capstone ("Production AI Platform" combining Python, FastAPI, PostgreSQL, Redis, LLM APIs, RAG, Vector DB, AI Agents, Auth, Background Jobs, Docker, CI/CD, Cloud Deployment, Observability, and GitHub repository).',
                difficulty: 'Advanced',
                estimatedTime: '45 Hours',
                curriculumKeys: ['PROJ_BEGINNER', 'PROJ_INTERMEDIATE', 'PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'aiml-interviews-job-prep',
        title: '8. AI/ML Interviews & Job Preparation',
        description: 'Prepare for AI/ML engineering interviews with coding, machine learning, system design, GenAI, and project discussions.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-aiml-interviews-prep',
            title: 'AI/ML Coding, ML Theory, GenAI System Design & Project Defense',
            description: 'Python OOP & async code, interview DSA (Arrays, Strings, Hash Maps, Trees, Graphs, Binary Search, Two Pointers, Sliding Window), ML fundamentals & explainability, PyTorch deep learning, GenAI/RAG/Agent security questions, MLOps, AI System Design, and project architecture defense.',
            topics: [
              {
                id: 'top-aiml-interviews-prep',
                title: 'AI/ML Technical Interviews, Coding, System Design & Behavioral Sprint',
                description: 'Python OOP & async fundamentals, interview DSA (Arrays, Strings, Hash Maps, Stacks, Queues, Linked Lists, Trees, Graphs, Binary Search, Sorting, Two Pointers, Sliding Window, Recursion), ML fundamentals & model explainability, PyTorch deep learning, GenAI/RAG/Agents/Prompt Injection security, MLOps & model serving, AI System Design (RAG, Recommendation Systems, Feature Stores, Scaling, Vector Search Architecture), and project defense questions (architecture, trade-offs, latency, cost, scalability, deployment).',
                difficulty: 'Advanced',
                estimatedTime: '30 Hours',
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
        id: 'web-fundamentals',
        title: '1. Web Fundamentals — HTML & CSS',
        description: 'Build a strong foundation in semantic HTML, modern CSS, responsive layouts, accessibility, and browser fundamentals.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-html-access',
            title: 'Semantic HTML5, Forms & Web Accessibility',
            description: 'Semantic HTML5, forms & validation, accessibility fundamentals, ARIA roles, focus management, screen readers, and WCAG standards.',
            topics: [
              {
                id: 'top-fe-html-accessibility',
                title: 'Semantic HTML5, Forms & Accessibility Fundamentals',
                description: 'Master HTML5 semantic elements, form controls and validation, accessibility (a11y) fundamentals, ARIA attributes, keyboard navigation, and WCAG guidelines.',
                difficulty: 'Beginner',
                estimatedTime: '12 Hours',
                curriculumKeys: ['DEV_HTML'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-css-layouts',
            title: 'Modern CSS, Layout Systems & Responsive Design',
            description: 'CSS selectors, cascade, specificity, box model, Flexbox, CSS Grid, responsive design, media/container queries, positioning, typography, CSS variables, transitions, animations, modern CSS features, browser rendering basics.',
            topics: [
              {
                id: 'top-fe-css-layouts',
                title: 'CSS Selectors, Box Model, Flexbox, Grid & Animations',
                description: 'CSS selectors, cascade, specificity, box model, Flexbox, CSS Grid, responsive media/container queries, positioning, typography, CSS variables, transitions, animations, and browser rendering basics.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_CSS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'js-ts-mastery',
        title: '2. JavaScript & TypeScript',
        description: 'Master modern JavaScript and TypeScript for building reliable, maintainable frontend applications.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-js-core',
            title: 'Core JavaScript, ES6+ & Asynchronous Flow',
            description: 'Variables, scope, hoisting, functions, arrow functions, arrays, objects, destructuring, spread/rest, ES6+ modules, DOM manipulation, events, event delegation, closures, this, prototypes, classes, error handling, Promises, async/await, Fetch API, JSON, event loop, call stack, microtasks/macrotasks, debouncing, throttling, LocalStorage/SessionStorage.',
            topics: [
              {
                id: 'top-fe-js-core',
                title: 'JavaScript Scope, Closures, DOM & Asynchronous Patterns',
                description: 'Variables, scope, hoisting, closures, DOM manipulation, event delegation, "this", Promises, async/await, Fetch API, event loop, microtasks, debouncing, throttling, and Web Storage.',
                difficulty: 'Beginner',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-ts-core',
            title: 'TypeScript for Frontend Engineers',
            description: 'TypeScript fundamentals, interfaces, types, union/intersection types, generics, utility types, type narrowing, type-safe API responses.',
            topics: [
              {
                id: 'top-fe-ts-core',
                title: 'TypeScript Fundamentals, Generics & Type-Safe APIs',
                description: 'Interfaces, types, union/intersection types, generics, utility types, type narrowing, and type-safe API request/response structures.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_TYPESCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'react-development',
        title: '3. React & Modern Frontend Development',
        description: 'Build production-ready interfaces with React using component architecture, hooks, routing, forms, and modern rendering patterns.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-react-core',
            title: 'React Core Fundamentals & Component Architecture',
            description: 'React fundamentals, components, JSX, props, state, event handling, conditional rendering, lists and keys, component composition, reusable components, component architecture.',
            topics: [
              {
                id: 'top-fe-react-core',
                title: 'React JSX, Props, State & Component Composition',
                description: 'React fundamentals, JSX syntax, props, state, event handling, conditional rendering, list keys, component composition, and production component architecture.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-react-hooks',
            title: 'React Hooks, State Management & Routing',
            description: 'useState, useEffect, useRef, useMemo, useCallback, custom hooks, Context API, forms, form validation, React Router, error boundaries, loading and error states.',
            topics: [
              {
                id: 'top-fe-react-hooks',
                title: 'React Hooks, Form Handling & React Router',
                description: 'Master useState, useEffect, useRef, useMemo, useCallback, custom hooks, Context API, form validation, React Router DOM, error boundaries, and UI state management.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-react-perf',
            title: 'Modern React Rendering & Performance Basics',
            description: 'React performance basics, server/client rendering concepts, Suspense fundamentals.',
            topics: [
              {
                id: 'top-fe-react-perf',
                title: 'React Performance Optimization & Suspense Patterns',
                description: 'Component re-rendering optimization, memoization strategies, server/client rendering concepts, and React Suspense fundamentals.',
                difficulty: 'Advanced',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'nextjs-architecture',
        title: '4. Next.js & Frontend Architecture',
        description: 'Learn modern React application architecture with Next.js, routing, rendering strategies, data fetching, and scalable project structure.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-nextjs-core',
            title: 'Next.js App Router, Rendering & Data Fetching',
            description: 'Why Next.js, App Router, file-based routing, nested layouts, dynamic routes, route groups, Server Components, Client Components, server vs client rendering, data fetching, loading UI, error UI.',
            topics: [
              {
                id: 'top-fe-nextjs-core',
                title: 'Next.js App Router, Server Components & Rendering Strategies',
                description: 'App Router architecture, file-based routing, nested layouts, dynamic routes, route groups, Server vs Client Components, data fetching, and loading/error UI states.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_NEXTJS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-nextjs-arch',
            title: 'Next.js Optimization & Scalable Project Architecture',
            description: 'Metadata and SEO, image optimization, font optimization, caching concepts, revalidation, middleware basics, authentication integration, environment variables, production project structure, feature-based architecture, reusable UI architecture.',
            topics: [
              {
                id: 'top-fe-nextjs-arch',
                title: 'Next.js Metadata, SEO, Optimization & Feature-Based Architecture',
                description: 'Metadata, SEO optimization, next/image, next/font, caching, revalidation, middleware basics, auth integration, env vars, feature-based architecture, and reusable UI systems.',
                difficulty: 'Advanced',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_NEXTJS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'apis-state-data',
        title: '5. APIs, State Management & Frontend Data',
        description: 'Learn how frontend applications communicate with backend services and manage client and server state reliably.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-apis-http',
            title: 'REST APIs, HTTP & Async Frontend Data Fetching',
            description: 'REST APIs, HTTP methods, status codes, request/response lifecycle, Fetch and Axios, API error handling, authentication flows, JWT concepts, cookies vs localStorage, CORS basics, loading/error/empty states.',
            topics: [
              {
                id: 'top-fe-apis-http',
                title: 'REST APIs, Axios/Fetch & Client-Server Data Flows',
                description: 'RESTful endpoints, HTTP methods/status codes, Fetch vs Axios, API error handling, auth tokens/JWT, cookies vs localStorage, CORS, and UI state indicators.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['CS_CN', 'DEV_AUTHENTICATION'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-state-query',
            title: 'State Management & React Query Data Synchronization',
            description: 'Client state vs server state, Zustand, React Context, TanStack Query / React Query, optimistic UI, pagination, infinite scrolling, search and filtering, cache management, data synchronization, retry and error handling.',
            topics: [
              {
                id: 'top-fe-state-query',
                title: 'Zustand, React Query & Server State Synchronization',
                description: 'Client state vs server state, Zustand stores, React Context, TanStack Query (React Query), optimistic updates, pagination, infinite scrolling, search/filtering, cache management, and error retry strategies.',
                difficulty: 'Advanced',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'testing-debugging-tools',
        title: '6. Frontend Testing, Debugging & Developer Tools',
        description: 'Learn how professional frontend engineers test, debug, maintain, and collaborate on production applications.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-devtools-git',
            title: 'Frontend Debugging, Chrome DevTools & Git Workflows',
            description: 'Chrome DevTools, console debugging, Network tab, Performance tab, React DevTools, debugging rendering/API problems, Git fundamentals, GitHub workflows, branching, pull requests, code reviews, ESLint, Prettier, type checking, environment variables.',
            topics: [
              {
                id: 'top-fe-devtools-git',
                title: 'Chrome DevTools, Console Debugging & Git/GitHub Workflows',
                description: 'Chrome DevTools, Network/Performance inspection, React DevTools, Git branching, PR reviews, ESLint, Prettier, type checking, and environment variable management.',
                difficulty: 'Beginner',
                estimatedTime: '14 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-testing-vitest',
            title: 'Frontend Testing Frameworks & API Mocking',
            description: 'Unit testing, component testing, integration testing, React Testing Library, Vitest/Jest, Playwright/Cypress basics, mocking APIs.',
            topics: [
              {
                id: 'top-fe-testing-vitest',
                title: 'Unit, Component & E2E Testing with Vitest, RTL & Playwright',
                description: 'Unit & component testing using Vitest & React Testing Library (RTL), E2E basics with Playwright/Cypress, and API mocking for reliable test coverage.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'performance-a11y-security',
        title: '7. Performance, Accessibility, Security & Deployment',
        description: 'Learn the engineering practices required to ship fast, accessible, secure, and production-ready frontend applications.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-perf-vitals',
            title: 'Web Performance & Core Web Vitals Optimization',
            description: 'Browser rendering pipeline, critical rendering path, code splitting, lazy loading, dynamic imports, bundle optimization, tree shaking, image optimization, font optimization, caching, CDN concepts, performance profiling, Lighthouse, Core Web Vitals (LCP, INP, CLS).',
            topics: [
              {
                id: 'top-fe-perf-vitals',
                title: 'Browser Rendering Pipeline, Bundle Optimization & Core Web Vitals',
                description: 'Browser rendering pipeline, critical rendering path, code splitting, lazy loading, tree shaking, image/font optimization, CDN caching, Lighthouse audits, and Core Web Vitals (LCP, INP, CLS).',
                difficulty: 'Advanced',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_HTML', 'DEV_CSS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-a11y-security-deploy',
            title: 'Web Accessibility (a11y), Frontend Security & CI/CD Deployment',
            description: 'Keyboard navigation, focus management, ARIA, screen readers, color contrast, accessible forms, WCAG fundamentals, XSS, CSRF concepts, Content Security Policy basics, secure token handling, dependency vulnerabilities, input validation, safe rendering of user-generated content, production builds, environment variables, Vercel, Netlify, GitHub Actions basics, CI/CD fundamentals, monitoring, error tracking.',
            topics: [
              {
                id: 'top-fe-a11y-security-deploy',
                title: 'WCAG Accessibility, XSS/CSRF Security & Vercel Deployment',
                description: 'Keyboard navigation, ARIA, screen readers, WCAG compliance, XSS/CSRF security mitigations, Content Security Policy, Vercel/Netlify deployment, and GitHub Actions CI/CD.',
                difficulty: 'Advanced',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'DEV_AUTHENTICATION'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects-portfolio-interviews',
        title: '8. Frontend Projects, Portfolio & Interviews',
        description: 'Turn your frontend skills into job-ready projects and prepare for real frontend engineering interviews.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-fe-projects-portfolio',
            title: 'Job-Ready Frontend Projects & Technical Portfolio',
            description: 'Portfolio website, React application, Next.js application, API-driven application, authentication-based application, dashboard with complex state, performance optimization project, accessibility-focused project, GitHub profile, README writing, project documentation, live deployments, case studies, technical decisions.',
            topics: [
              {
                id: 'top-fe-projects-portfolio',
                title: 'Frontend Portfolio, Case Studies & Technical Documentation',
                description: 'Build a production-grade developer portfolio, write technical case studies, document architecture decisions, showcase live Vercel deployments, and format your GitHub profile.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['PROJ_BEGINNER', 'PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-fe-interviews-machine-coding',
            title: 'Frontend Interview Preparation & Machine Coding',
            description: 'HTML/CSS/JS/TS/React/Next.js interview questions, browser fundamentals, HTTP/API questions, auth questions, performance questions, accessibility questions, frontend system design, component design, state management decisions, machine coding rounds, DOM problems, async JS, frontend DSA fundamentals (Arrays, Strings, Hash Maps, Two Pointers, Sliding Window, Stack/Queue, Searching/Sorting, Recursion), STAR behavioral questions.',
            topics: [
              {
                id: 'top-fe-interviews-machine-coding',
                title: 'Frontend Technical Interview Preparation & Live Machine Coding',
                description: 'HTML/CSS/JS/TS/React interview questions, browser fundamentals, frontend system design, live machine coding widgets, DOM manipulation problems, async JS, frontend DSA, and STAR behavioral prep.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
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
        id: 'programming-backend-fundamentals',
        title: '1. Programming & Backend Fundamentals',
        description: 'Build strong programming and server-side fundamentals with TypeScript, Node.js, asynchronous programming, and backend architecture basics.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-ts-node-core',
            title: 'TypeScript & Node.js Core Fundamentals',
            description: 'TypeScript static typing, Node.js runtime, modules, package management, async execution, event loop, streams, and error handling.',
            topics: [
              {
                id: 'top-be-ts-core',
                title: 'TypeScript Fundamentals & Advanced Static Typing',
                description: 'TypeScript syntax, interfaces, types, union/intersection types, generics, utility types, type narrowing, strict type-safety, and type-safe backend structures.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_TYPESCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
              {
                id: 'top-be-node-core',
                title: 'Node.js Fundamentals, Modules & Asynchronous Flow',
                description: 'Node.js runtime, CommonJS vs ES Modules, npm package management, Promises, async/await, Event Loop, call stack, microtasks/macrotasks, non-blocking I/O, Event Emitters, Streams, Buffers, error handling, environment variables, clean code, modular project architecture, and logging fundamentals.',
                difficulty: 'Beginner',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_NODE', 'DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'http-networking-api',
        title: '2. HTTP, Networking & API Development',
        description: 'Learn how backend services communicate over the web and build production-quality REST APIs.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-networking-http',
            title: 'Internet Networking & HTTP Protocol',
            description: 'Internet fundamentals, DNS, TCP/IP basics, HTTP standards, methods, status codes, headers, cookies, CORS, and REST API principles.',
            topics: [
              {
                id: 'top-be-http-networking',
                title: 'Internet Fundamentals, DNS, TCP/IP & HTTP/HTTPS Standards',
                description: 'DNS resolution, TCP/IP three-way handshake, HTTP methods, status codes, request/response headers, cookies, CORS, API security basics, and REST API architectural principles.',
                difficulty: 'Beginner',
                estimatedTime: '16 Hours',
                curriculumKeys: ['CS_CN', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-express-apis',
            title: 'Express.js & Production REST API Architecture',
            description: 'Express.js fundamentals, routing, middleware, controllers, service layer, validation, error handling, pagination, filtering, search, OpenAPI/Swagger docs, API versioning, and rate limiting.',
            topics: [
              {
                id: 'top-be-express-apis',
                title: 'Express.js Routing, Middleware & Production REST API Features',
                description: 'Express.js routing, custom middleware pipelines, controllers & service layer, input validation, global error handling, pagination, filtering, sorting, searching, file uploads, OpenAPI/Swagger documentation, API versioning, rate limiting, and secure REST design.',
                difficulty: 'Intermediate',
                estimatedTime: '24 Hours',
                curriculumKeys: ['DEV_EXPRESS', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'databases-data-modeling',
        title: '3. Databases & Data Modeling',
        description: 'Master relational databases, SQL, data modeling, transactions, indexing, and query optimization.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-postgresql-sql',
            title: 'PostgreSQL Relational Storage, SQL & Data Modeling',
            description: 'Relational database concepts, PostgreSQL tables, keys, constraints, SQL queries, DML, JOINs, CTEs, Window Functions, normalization, relationships, ACID transactions, B-Tree indexes, EXPLAIN ANALYZE query optimization, connection pooling, migrations, and Prisma ORM.',
            topics: [
              {
                id: 'top-be-postgresql-sql',
                title: 'PostgreSQL Relational Schemas, SQL Queries & Index Optimization',
                description: 'Relational vs NoSQL, PostgreSQL tables, primary/foreign keys, constraints, SQL DML (SELECT, INSERT, UPDATE, DELETE), WHERE, GROUP BY, HAVING, ORDER BY, JOINs, Subqueries, CTEs, Window Functions, normalization, database relationships, ACID transactions, isolation levels, B-Tree indexing, query optimization with EXPLAIN ANALYZE, connection pooling, migrations, and ORMs (Prisma).',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_SQL', 'CS_DBMS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-mongodb-nosql',
            title: 'NoSQL Document Storage & Hybrid Data Modeling',
            description: 'MongoDB fundamentals, document data modeling, collections, BSON, embedded vs referenced documents, CRUD operations, indexing, and evaluating SQL vs NoSQL tradeoffs.',
            topics: [
              {
                id: 'top-be-mongodb-nosql',
                title: 'MongoDB Document Modeling & SQL vs NoSQL Tradeoffs',
                description: 'MongoDB document structure, collections, BSON, embedded vs referenced documents, CRUD operations, indexing, and evaluating when to use SQL vs NoSQL.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_MONGODB'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'authentication-security',
        title: '4. Authentication, Authorization & Backend Security',
        description: 'Build secure backend systems with authentication, authorization, validation, and common web security practices.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-auth-jwt',
            title: 'Backend Identity, JWT & Session Management',
            description: 'Authentication vs authorization, password hashing with bcrypt/Argon2, JWT access & refresh tokens, session storage, secure cookies, Role-Based Access Control (RBAC), OAuth 2.0, password reset, and email verification.',
            topics: [
              {
                id: 'top-be-auth-jwt',
                title: 'Authentication, JWT Tokens, Sessions & RBAC Authorization',
                description: 'Authentication vs authorization, password hashing with bcrypt/Argon2, JWT access tokens & refresh tokens, stateful sessions, secure cookies, Role-Based Access Control (RBAC), fine-grained permissions, OAuth 2.0 fundamentals, password reset, and email verification.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_AUTHENTICATION'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-security-owasp',
            title: 'API Security & Vulnerability Protection',
            description: 'Input validation, SQL Injection, XSS, CSRF, CORS security, rate limiting, brute force protection, secrets management, security headers, dependency security, and OWASP Top 10.',
            topics: [
              {
                id: 'top-be-security-owasp',
                title: 'Backend Security, Input Validation & OWASP Mitigation',
                description: 'Input sanitization/validation, SQL Injection prevention, XSS, CSRF, CORS security, rate limiting, brute-force protection, secrets management, environment variables, security headers (Helmet), dependency auditing, and OWASP Top 10 vulnerabilities.',
                difficulty: 'Advanced',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_AUTHENTICATION', 'DEV_EXPRESS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'caching-queues-systems',
        title: '5. Caching, Queues & Distributed Backend Systems',
        description: 'Learn how production backends improve performance and handle asynchronous workloads using caching, queues, and background jobs.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-redis-caching',
            title: 'Redis Caching & In-Memory Storage',
            description: 'Caching fundamentals, Redis data structures, Cache-Aside pattern, TTL, cache invalidation, session storage, rate limiting with Redis, and database caching.',
            topics: [
              {
                id: 'top-be-redis-caching',
                title: 'Redis Caching Patterns, Rate Limiting & Session Stores',
                description: 'Caching fundamentals, Redis data types, Cache-Aside pattern, TTL, cache invalidation, session storage, rate limiting with Redis, and database query caching.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_REDIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-queues-background',
            title: 'Message Queues, Background Processing & System Scalability',
            description: 'Background jobs, job queues, Producer/Consumer model, BullMQ, retry strategies, dead letter queues, idempotency, webhooks, Pub/Sub, horizontal scaling, load balancing, and stateless services.',
            topics: [
              {
                id: 'top-be-queues-background',
                title: 'Background Jobs, BullMQ, Webhooks & Stateless Architecture',
                description: 'Background job queues, Producer/Consumer model, BullMQ with Redis, retry strategies, dead letter queues, idempotency, webhooks, Pub/Sub event-driven basics, horizontal scaling, load balancing basics, and stateless backend services.',
                difficulty: 'Advanced',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REDIS', 'CS_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'testing-debugging-production',
        title: '6. Testing, Debugging & Production Engineering',
        description: 'Learn how professional backend engineers test, debug, monitor, and maintain reliable production services.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-testing-jest',
            title: 'Backend Testing Frameworks & API Automation',
            description: 'Unit testing, integration testing, API testing, Vitest/Jest, Supertest, test doubles (mocks/stubs), controller & service testing, and test database management.',
            topics: [
              {
                id: 'top-be-testing-jest',
                title: 'Unit, Integration & API Testing with Vitest, Jest & Supertest',
                description: 'Unit testing, integration testing, API testing with Vitest/Jest and Supertest, test doubles (mocks/stubs/spies), testing controllers and services, isolated test database setup, and code coverage.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_EXPRESS', 'DEV_NODE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-monitoring-debugging',
            title: 'Production Observability, Logging & Code Maintenance',
            description: 'Structured logging (Winston/Pino), Node.js debugger, health checks, graceful shutdown, metrics, APM monitoring, production troubleshooting, ESLint, Prettier, and Git PR workflows.',
            topics: [
              {
                id: 'top-be-monitoring-debugging',
                title: 'Structured Logging, Debugging, Health Checks & Git Code Reviews',
                description: 'Structured logging (Winston/Pino), Node.js debugger, health checks, graceful shutdown handling, request correlation IDs, metrics & APM monitoring fundamentals, production troubleshooting, ESLint, Prettier, Git branching, PRs, and code review practices.',
                difficulty: 'Advanced',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'docker-cicd-deployment',
        title: '7. Docker, CI/CD & Cloud Deployment',
        description: 'Learn how to containerize, deploy, and continuously deliver backend applications.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-docker-containers',
            title: 'Docker Containerization & Multi-Service Compose',
            description: 'Linux CLI basics, processes, ports, env vars, Docker images, containers, Dockerfiles, multi-stage builds, volumes, networks, and Docker Compose for Node.js, PostgreSQL, and Redis.',
            topics: [
              {
                id: 'top-be-docker-containers',
                title: 'Linux Basics, Docker Containerization & Docker Compose',
                description: 'Linux command line, processes, ports, env vars, Docker images, containers, Dockerfile creation, multi-stage builds, Docker volumes, Docker networks, and Docker Compose for orchestrating Node.js, PostgreSQL, and Redis.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_DOCKER'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-cicd-cloud-deploy',
            title: 'GitHub Actions CI/CD & Cloud Deployment',
            description: 'GitHub Actions CI pipelines, automated test & build workflows, cloud hosting fundamentals (AWS/Vercel/Render/Railway), deploying Node.js APIs, managed PostgreSQL/Redis, Nginx reverse proxies, HTTPS, and domain setup.',
            topics: [
              {
                id: 'top-be-cicd-cloud-deploy',
                title: 'GitHub Actions CI/CD Pipelines & Cloud Hosting Fundamentals',
                description: 'GitHub Actions CI pipelines, automated test & build workflows, cloud hosting fundamentals (AWS/Vercel/Render/Railway), deploying Node.js APIs, managed PostgreSQL/Redis databases, reverse proxies (Nginx), HTTPS SSL certificates, domain mapping, application logs, and health monitoring.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects-system-design-interviews',
        title: '8. Backend Projects, System Design & Interviews',
        description: 'Build production-quality backend projects and prepare for backend engineering interviews.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-be-system-design-arch',
            title: 'Backend System Architecture & Scalability Fundamentals',
            description: 'Scalability, vertical vs horizontal scaling, load balancing, caching, database replication, read replicas, database sharding, message queues, rate limiting, CDN, API Gateway, microservices, Event-Driven Architecture, and CAP theorem.',
            topics: [
              {
                id: 'top-be-system-design-arch',
                title: 'Backend System Design, Database Scaling & Event Architecture',
                description: 'Scalability, vertical vs horizontal scaling, load balancing, caching strategies, database replication, read replicas, database sharding, message queues, rate limiting, CDN basics, API Gateway, monolith vs microservices, Event-Driven Architecture, CAP theorem, and distributed systems fundamentals.',
                difficulty: 'Advanced',
                estimatedTime: '25 Hours',
                curriculumKeys: ['CS_SYSTEM_DESIGN', 'CS_DBMS', 'CS_CN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-be-interviews-capstone',
            title: 'Backend Interview Preparation, Machine Coding & Final Capstone',
            description: 'TypeScript/Node.js/Express interview questions, REST/HTTP/SQL/PostgreSQL/Redis/Auth/Docker interview questions, system design interview rounds, backend machine coding, API design rounds, interview DSA (Arrays, Strings, Hash Maps, Stack/Queue, Two Pointers, Sliding Window), STAR questions, and the "Job & Internship Discovery Platform API" Capstone.',
            topics: [
              {
                id: 'top-be-interviews-capstone',
                title: 'Backend Interview Sprint, Machine Coding & Production Capstone',
                description: 'TypeScript/Node.js/Express interview questions, REST/HTTP/SQL/PostgreSQL/Redis/Auth/Docker interview questions, system design interview rounds, backend machine coding, API design rounds, interview-relevant DSA (Arrays, Strings, Hash Maps, Stacks, Queues, Linked Lists, Binary Search, Two Pointers, Sliding Window, Recursion), STAR behavioral questions, and building the final "Job & Internship Discovery Platform API" Capstone.',
                difficulty: 'Advanced',
                estimatedTime: '30 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_MOCK', 'PROJ_ADVANCED'],
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
        id: 'excel-sql-foundations',
        title: '1. Excel, SQL & Data Foundations',
        description: 'Master the core tools used to extract, clean, validate, and analyze business data.',
        icon: 'Table',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-excel-core',
            title: 'Spreadsheet Analytics & Excel Mastery',
            description: 'Master Excel formulas, functions, lookup techniques, Power Query, pivot tables, and charts.',
            topics: [
              {
                id: 'top-ds-excel-core',
                title: 'Excel Fundamentals & Advanced Spreadsheet Analytics',
                description: 'XLOOKUP, INDEX/MATCH, IF/IFS/SUMIFS/COUNTIFS, Pivot Tables, Conditional Formatting, Data Validation, Charts, and Power Query Fundamentals.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-sql-core',
            title: 'Relational SQL & Database Querying',
            description: 'Extract, join, aggregate, and manipulate relational business data using SQL.',
            topics: [
              {
                id: 'top-ds-sql-core',
                title: 'SQL Fundamentals & Relational Data Extraction',
                description: 'SELECT, WHERE, ORDER BY, GROUP BY, HAVING, INNER/LEFT/RIGHT JOINs, Subqueries, CASE statements, PK/FK, and Normalization.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-sql-advanced',
            title: 'Advanced SQL Analytics & Optimization',
            description: 'Analytical window functions, CTEs, date/string manipulation, and query performance tuning.',
            topics: [
              {
                id: 'top-ds-sql-advanced',
                title: 'Advanced SQL, Window Functions & Query Optimization',
                description: 'CTEs, ROW_NUMBER, RANK, DENSE_RANK, LAG/LEAD, Date & Time Functions, String Functions, NULL handling, Aggregations, and Query Tuning.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'python-data-analysis',
        title: '2. Python for Data Analysis',
        description: 'Use Python to clean, transform, analyze, visualize, and automate data workflows.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-python-core',
            title: 'Python Programming Foundations',
            description: 'Master Python syntax, data structures, functions, OOP, and virtual environments.',
            topics: [
              {
                id: 'top-ds-python-core',
                title: 'Python Syntax, Collections & OOP for Data Work',
                description: 'Variables, Conditions, Loops, Functions, Lists/Tuples/Sets/Dicts, List Comprehensions, File Handling, Exceptions, Modules, OOP, Virtual Environments.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-pandas-wrangling',
            title: 'NumPy & Pandas Data Wrangling',
            description: 'Clean, filter, join, group, and transform large datasets with Pandas and NumPy.',
            topics: [
              {
                id: 'top-ds-pandas-wrangling',
                title: 'NumPy Arrays & Pandas Data Manipulation & Cleaning',
                description: 'NumPy Arrays, Vectorized Ops, Series/DataFrames, Filtering, GroupBy, Merge/Join, Pivot Tables, Missing Data, Duplicate Data, Outliers, Data Transformation.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-python-eda-automation',
            title: 'Data Visualization & Automation',
            description: 'Exploratory data analysis, charts, API data extraction, and automated workflows.',
            topics: [
              {
                id: 'top-ds-python-eda-automation',
                title: 'EDA, Data Visualization (Matplotlib, Seaborn, Plotly) & Automation',
                description: 'Matplotlib, Seaborn, Plotly, Exploratory Data Analysis, API Extraction, CSV/JSON processing, and Python workflow automation.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'statistics-experimentation',
        title: '3. Statistics, Probability & Experimentation',
        description: 'Build the statistical reasoning required to make reliable decisions from data.',
        icon: 'Calculator',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-stats-descriptive',
            title: 'Descriptive Statistics & Probability',
            description: 'Master summary metrics, Central Limit Theorem, and probability distributions.',
            topics: [
              {
                id: 'top-ds-stats-descriptive',
                title: 'Descriptive Statistics, Probability & Sampling Distributions',
                description: 'Mean, Median, Mode, Variance, Std Dev, Percentiles, Bayes Theorem, Normal/Binomial/Poisson Distributions, Sampling Bias, Central Limit Theorem.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-hypothesis-testing',
            title: 'Inferential Statistics & Hypothesis Testing',
            description: 'Confidence intervals, p-values, t-tests, Chi-square, ANOVA, and regression.',
            topics: [
              {
                id: 'top-ds-hypothesis-testing',
                title: 'Hypothesis Testing, Statistical Significance & Regression',
                description: 'Null/Alternative Hypothesis, p-values, Statistical Significance, Type I/II Errors, t-tests, Chi-square, ANOVA, Correlation, Covariance, Linear/Logistic Regression.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-ab-testing',
            title: 'A/B Testing & Controlled Experiments',
            description: 'Design A/B tests, measure conversion lift, calculate sample sizes and power.',
            topics: [
              {
                id: 'top-ds-ab-testing',
                title: 'A/B Testing, Experiment Design & Business Significance',
                description: 'A/B Testing, Experiment Design, Statistical Power, Effect Size, Confidence Intervals, Practical vs Statistical Significance, Product Recommendations.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['APT_QUANT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'data-viz-bi',
        title: '4. Data Visualization, BI & Business Analytics',
        description: 'Turn analysis into clear dashboards, business insights, KPIs, and decisions.',
        icon: 'BarChart3',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-powerbi-dax',
            title: 'Power BI & DAX Mastery (Primary BI Tool)',
            description: 'Build interactive Power BI dashboards, Power Query pipelines, star schemas, and DAX measures.',
            topics: [
              {
                id: 'top-ds-powerbi-dax',
                title: 'Power BI, Data Modeling, Star Schema & DAX Measures',
                description: 'Power BI, Power Query, Data Modeling, Relationships, Star Schema, DAX Measures, Calculated Columns, Time Intelligence, Filters, Slicers, Drill Down, Power BI Service.',
                difficulty: 'Intermediate',
                estimatedTime: '24 Hours',
                curriculumKeys: ['DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-tableau-core',
            title: 'Tableau Fundamentals & Dashboards',
            description: 'Create sheets, calculated fields, parameters, and interactive Tableau dashboards.',
            topics: [
              {
                id: 'top-ds-tableau-core',
                title: 'Tableau Dashboards, Calculated Fields & Publishing',
                description: 'Tableau Fundamentals, Dashboards, Calculated Fields, Parameters, Dashboard Actions, Publishing Dashboards.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-business-analytics',
            title: 'Business Metrics & Executive Reporting',
            description: 'KPI selection, metric definitions, data storytelling, and stakeholder presentation.',
            topics: [
              {
                id: 'top-ds-business-analytics',
                title: 'Business Metrics, KPI Design & Data Storytelling',
                description: 'Data Visualization Fundamentals, Chart Selection, Dashboard Design, KPI Design, Data Storytelling, Business Metrics, Executive Reporting, Stakeholder Communication.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_BEHAVIORAL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'machine-learning-predictive',
        title: '5. Machine Learning & Predictive Analytics',
        description: 'Learn practical machine learning to build predictive models and solve business problems.',
        icon: 'BrainCircuit',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-ml-algorithms',
            title: 'Supervised & Unsupervised Machine Learning',
            description: 'Train classification, regression, and clustering algorithms using Scikit-Learn & XGBoost.',
            topics: [
              {
                id: 'top-ds-ml-algorithms',
                title: 'Supervised & Unsupervised ML Algorithms (Scikit-Learn & XGBoost)',
                description: 'Train/Val/Test Split, Linear/Logistic Regression, Decision Trees, Random Forest, Gradient Boosting, XGBoost, KNN, Naive Bayes, SVM, K-Means, PCA.',
                difficulty: 'Intermediate',
                estimatedTime: '26 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-feature-engineering',
            title: 'Feature Engineering & Preprocessing',
            description: 'Transform features, encode categorical variables, and handle missing or imbalanced data.',
            topics: [
              {
                id: 'top-ds-feature-engineering',
                title: 'Feature Scaling, Encoding, Imbalance & Preprocessing',
                description: 'Feature Engineering, Scaling, One-Hot/Label Encoding, Missing Data Imputation, Imbalanced Data (SMOTE / Class Weighting).',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-model-evaluation',
            title: 'Model Evaluation, Hyperparameters & SHAP',
            description: 'Cross-validation, classification/regression metrics, hyperparameter tuning, and SHAP explainability.',
            topics: [
              {
                id: 'top-ds-model-evaluation',
                title: 'Model Evaluation Metrics, Grid Search & SHAP Interpretability',
                description: 'Overfitting/Underfitting, Bias/Variance, Regularization, Cross Validation, Grid/Random Search, Precision, Recall, F1, ROC-AUC, MAE, RMSE, SHAP Fundamentals.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'data-engineering-cloud',
        title: '6. Data Engineering, Big Data & Cloud Fundamentals',
        description: 'Understand how real organizations collect, transform, store, and process large-scale data.',
        icon: 'Cloud',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-data-warehousing',
            title: 'Data Warehousing & Dimensional Modeling',
            description: 'Understand OLTP vs OLAP, data lakes, star schemas, and fact/dimension tables.',
            topics: [
              {
                id: 'top-ds-data-warehousing',
                title: 'ETL/ELT Pipelines, OLAP Warehouses & Star Schemas',
                description: 'ETL/ELT Fundamentals, Data Pipelines, Batch/Streaming, Data Warehouses, Data Lakes, OLTP vs OLAP, Star Schema, Fact/Dimension Tables, Data Modeling.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['CS_DBMS', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-pyspark-bigdata',
            title: 'PySpark & Distributed Big Data Processing',
            description: 'Analyze large-scale distributed datasets using Apache Spark and PySpark DataFrames.',
            topics: [
              {
                id: 'top-ds-pyspark-bigdata',
                title: 'Apache Spark Fundamentals & PySpark DataFrames',
                description: 'Apache Spark Fundamentals, PySpark, Spark DataFrames, Spark SQL, Partitioning, Distributed Processing.',
                difficulty: 'Advanced',
                estimatedTime: '22 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-cloud-pipelines',
            title: 'Cloud Analytics (BigQuery, Snowflake) & Ingestion',
            description: 'Ingest data into cloud data warehouses, work with AWS/GCP, and manage version control.',
            topics: [
              {
                id: 'top-ds-cloud-pipelines',
                title: 'BigQuery, Snowflake, AWS S3 & Data Pipeline Architecture',
                description: 'BigQuery, Snowflake Fundamentals, AWS S3/EC2 Basics, Cloud Databases, Data Pipeline Architecture, APIs & Data Ingestion, Git/GitHub, basic CI/CD.',
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
        id: 'genai-advanced-analytics',
        title: '7. GenAI, AI-Assisted Analytics & Advanced Data Science',
        description: 'Learn how modern AI can accelerate analysis, automate workflows, and support data science applications.',
        icon: 'Sparkles',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-genai-llm',
            title: 'Generative AI & LLM Data Workflows',
            description: 'Leverage LLMs, structured outputs, and prompt engineering to accelerate data analysis.',
            topics: [
              {
                id: 'top-ds-genai-llm',
                title: 'LLM Fundamentals, Prompting & Structured Output Extraction',
                description: 'Generative AI Fundamentals, LLM Fundamentals, Prompt Engineering, Structured Outputs, LLM APIs, AI-Assisted Data Analysis.',
                difficulty: 'Beginner',
                estimatedTime: '16 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-rag-nl2sql',
            title: 'Embeddings, RAG & Natural-Language-to-SQL',
            description: 'Build semantic search systems, RAG workflows, and text-to-SQL data interfaces.',
            topics: [
              {
                id: 'top-ds-rag-nl2sql',
                title: 'Embeddings, RAG, Vector Databases & Text-to-SQL Analytics',
                description: 'Text Classification/Summarization, Information Extraction, Embeddings, Semantic Search, RAG Fundamentals, Vector DBs, Natural Language to SQL, AI-Powered BI.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'DEV_SQL'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-ai-ethics-agents',
            title: 'Responsible AI, Data Privacy & AI Agents',
            description: 'Evaluate LLMs, mitigate hallucinations, protect data privacy, and build automated report agents.',
            topics: [
              {
                id: 'top-ds-ai-ethics-agents',
                title: 'LLM Evaluation, Data Privacy & AI Agent Assistants',
                description: 'LLM Evaluation, Hallucination Awareness, AI Data Privacy, AI Security, Responsible AI, Automated Report Generation, AI Agents Fundamentals.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'projects-portfolio-interviews',
        title: '8. Projects, Portfolio & Data Interviews',
        description: 'Build a strong data portfolio and prepare for SQL, analytics, statistics, ML, case-study, and behavioral interviews.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-ds-portfolio-capstone',
            title: 'Real-World Data Portfolio & Capstone Platform',
            description: 'Build 5 core projects and a final end-to-end business intelligence & data science capstone platform.',
            topics: [
              {
                id: 'top-ds-portfolio-capstone',
                title: '5 Core Portfolio Projects & Final End-to-End Capstone',
                description: 'SQL Analytics, Python EDA, Power BI Dashboard, A/B Testing Case Study, Machine Learning Project, and Final Capstone Platform.',
                difficulty: 'Advanced',
                estimatedTime: '40 Hours',
                curriculumKeys: ['PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-technical-interviews',
            title: 'Technical Interview Prep (SQL, Python, Stats, ML)',
            description: 'Master live SQL coding screens, Python/Pandas data manipulation, and statistical QA.',
            topics: [
              {
                id: 'top-ds-technical-interviews',
                title: 'SQL, Python, Statistics & Machine Learning Technical QA',
                description: 'SQL JOINs/CTEs/Window Functions, Python data manipulation, Probability/A/B testing QA, ML model selection & metric trade-offs.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['INT_MOCK'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-ds-business-interviews',
            title: 'Business Case Studies & Behavioral Storytelling',
            description: 'Solve business metric case studies, root-cause analysis, and master STAR behavioral questions.',
            topics: [
              {
                id: 'top-ds-business-interviews',
                title: 'Business Case Studies, Analytics Metrics & STAR Behavioral Answers',
                description: 'KPI questions, dashboard interpretation, root-cause analysis, cohort retention, explaining ML/data findings to non-technical stakeholders.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL'],
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
        id: 'mobile-programming-foundations',
        title: '1. Mobile Programming & TypeScript Foundations',
        description: 'Build strong programming fundamentals with TypeScript and understand the core concepts required for modern mobile development.',
        icon: 'Code2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-ts-foundations',
            title: 'Modern JavaScript ES6+ & TypeScript Core',
            description: 'JavaScript syntax, ES6+ features, TypeScript type system, interfaces, generics, async/await, and error handling.',
            topics: [
              {
                id: 'top-mobile-ts-core',
                title: 'JavaScript ES6+, TypeScript Types, Interfaces & Async/Await',
                description: 'JavaScript fundamentals, ES6+ features (destructuring, arrow functions, spread/rest), TypeScript type annotations, interfaces, generics, async/await, promises, modules, and error handling.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['LANG_TYPESCRIPT_CORE', 'DEV_JAVASCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-core-concepts',
            title: 'HTTP/REST APIs, Git, Debugging & Practical DSA',
            description: 'Object-oriented and functional programming basics, JSON, HTTP/REST APIs, Git/GitHub, npm, debugging, and basic DSA.',
            topics: [
              {
                id: 'top-mobile-http-git-dsa',
                title: 'HTTP/REST APIs, Git, npm, Debugging & Practical DSA',
                description: 'HTTP methods, REST APIs, JSON parsing, Git version control, npm packages, mobile debugging tools, basic data structures (arrays, strings, hashmaps, stacks, queues), and basic search/sort algorithms with Big-O analysis.',
                difficulty: 'Beginner',
                estimatedTime: '15 Hours',
                curriculumKeys: ['DEV_REST_APIS', 'DEV_GIT', 'DSA_ARRAYS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'react-native-ui-development',
        title: '2. React Native & Mobile UI Development',
        description: 'Build production-style cross-platform mobile interfaces using React Native and TypeScript.',
        icon: 'Layout',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-rn-react-fundamentals',
            title: 'React Core & Hooks for Mobile',
            description: 'Functional components, props, state, useEffect, useMemo, useCallback, and Context API for mobile applications.',
            topics: [
              {
                id: 'top-mobile-rn-react-hooks',
                title: 'React Fundamentals, State & Essential Hooks (useEffect, useMemo, useCallback)',
                description: 'Master functional components, props, state management, useEffect lifecycle, memoization with useMemo/useCallback, custom hooks, and React Context in a mobile development environment.',
                difficulty: 'Beginner',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_REACT', 'DEV_TYPESCRIPT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-rn-mobile-ui',
            title: 'Core Components, Flexbox Layouts & React Navigation',
            description: 'Core components, Flexbox layouts, responsive design, safe areas, keyboard handling, FlatList/SectionList, forms, and React Navigation.',
            topics: [
              {
                id: 'top-mobile-rn-components-nav',
                title: 'Core Components, Flexbox, FlatList & React Navigation',
                description: 'Build with View, Text, Image, TextInput, ScrollView, FlatList, SectionList, Flexbox, responsive layouts, SafeAreaView, keyboard avoiding views, and Stack/Tab/Drawer React Navigation with deep linking.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REACT_NATIVE', 'DEV_REACT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-rn-animations-newarch',
            title: 'Animations, Gestures, Dark Mode & New Architecture',
            description: 'Animated API, React Native Reanimated, gesture handling, dark mode, accessibility, platform-specific code, and React Native New Architecture (Fabric, TurboModules, JSI).',
            topics: [
              {
                id: 'top-mobile-rn-animations-arch',
                title: 'Animations, Gestures, Dark Mode & New Architecture (Fabric, TurboModules, JSI)',
                description: 'Implement smooth micro-animations (Reanimated), touch gestures (Gesture Handler), accessibility props, system dark mode switching, Platform.OS branching, and understand Fabric renderer, TurboModules, and JSI.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_REACT_NATIVE', 'DEV_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mobile-state-apis-data',
        title: '3. Mobile State Management, APIs & Data',
        description: 'Build reliable mobile applications that communicate with backend services and manage local and remote state.',
        icon: 'Database',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-state-management',
            title: 'Client & Server State Management (Redux Toolkit & TanStack Query)',
            description: 'Global state with Redux Toolkit / Zustand and server state caching with TanStack Query.',
            topics: [
              {
                id: 'top-mobile-state-tanstack',
                title: 'Global State (Redux Toolkit/Zustand) & TanStack Query Caching',
                description: 'Manage client state using Redux Toolkit slices or Zustand stores. Handle server caching, loading states, error states, pagination, infinite scrolling, background refetching, and optimistic updates with TanStack Query.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_REACT_NATIVE', 'DEV_REST_APIS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-storage-offline',
            title: 'Local Persistence, Offline-First Architecture & Push Notifications',
            description: 'AsyncStorage, SecureStore, SQLite/WatermelonDB, network detection, offline sync, WebSockets, and push notifications.',
            topics: [
              {
                id: 'top-mobile-offline-push',
                title: 'Local Databases (SQLite/AsyncStorage), Offline-First Architecture & Push Notifications',
                description: 'Store tokens securely in Keychain/Keystore (SecureStore), cache structured records in local SQLite/WatermelonDB, detect network connectivity (NetInfo), build offline-first sync queues, handle WebSockets, and configure push notifications.',
                difficulty: 'Advanced',
                estimatedTime: '22 Hours',
                curriculumKeys: ['DEV_REST_APIS', 'CS_DBMS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mobile-architecture-native-security',
        title: '4. Mobile Architecture, Native APIs & Security',
        description: 'Understand mobile architecture, platform capabilities, security, and native Android/iOS integration.',
        icon: 'Cpu',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-arch-patterns',
            title: 'Mobile Architecture & Native Platform Integration',
            description: 'Clean Architecture, MVVM, Repository pattern, Dependency Injection, Android/iOS architecture basics, Kotlin & Swift basics for native modules.',
            topics: [
              {
                id: 'top-mobile-arch-native-modules',
                title: 'Clean Architecture, MVVM & Native Modules (Kotlin / Swift)',
                description: 'Implement Clean Architecture, MVVM separation, and Repository pattern in mobile apps. Learn native Android (Kotlin) and iOS (Swift) fundamentals to write custom Native Modules and bridge platform features.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_SYSTEM_DESIGN', 'CS_OS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-device-security',
            title: 'Device Hardware APIs, Biometrics & Mobile Security',
            description: 'Camera, GPS Location, Bluetooth, background tasks, app lifecycle, biometric authentication, and OWASP Mobile Security.',
            topics: [
              {
                id: 'top-mobile-hardware-owasp',
                title: 'Device Hardware APIs (Camera/GPS), Biometrics & OWASP Security',
                description: 'Access native Camera, Location/GPS, Sensors, file system, background tasks, runtime permissions, and biometric authentication (FaceID/Biometrics). Implement secure storage, token encryption, certificate pinning, and OWASP Mobile Top 10 defenses.',
                difficulty: 'Advanced',
                estimatedTime: '22 Hours',
                curriculumKeys: ['CS_OS', 'CS_CN', 'DEV_MOBILE_SECURITY'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'production-mobile-projects',
        title: '5. Production Mobile Projects',
        description: 'Build, test, deploy, and maintain real-world mobile applications that demonstrate production engineering skills.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-core-projects',
            title: 'Production Mobile Applications',
            description: 'Expense Tracker, Food Delivery / E-Commerce app, and Real-Time Chat app.',
            topics: [
              {
                id: 'top-mobile-proj-tracker-food',
                title: 'Expense Tracker & E-Commerce / Food Delivery App',
                description: 'Build: 1) Expense Tracker with offline SQLite storage, interactive chart analytics, and cloud sync. 2) Food Delivery / E-Commerce App with auth, product catalogue, search/filtering, cart, order tracking, and push notifications.',
                difficulty: 'Intermediate',
                estimatedTime: '30 Hours',
                curriculumKeys: ['PROJ_BEGINNER', 'PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-capstone-project',
            title: 'Real-Time Chat App & Production Capstone',
            description: 'Real-time chat with WebSockets and production-grade mobile capstone application.',
            topics: [
              {
                id: 'top-mobile-proj-chat-capstone',
                title: 'Real-Time Chat App & Production-Grade Capstone',
                description: 'Build: 1) Real-Time Chat App with WebSockets, presence status, offline persistence, and push alerts. 2) Production-Grade Capstone integrating React Native, TypeScript, auth, REST APIs, TanStack Query, SQLite offline sync, device APIs, testing, Sentry crash reporting, and CI/CD.',
                difficulty: 'Advanced',
                estimatedTime: '40 Hours',
                curriculumKeys: ['PROJ_ADVANCED', 'PROJ_INTERMEDIATE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mobile-testing-performance',
        title: '6. Mobile Testing, Performance & Reliability',
        description: 'Learn how to test, debug, profile, and optimize mobile applications for real users and devices.',
        icon: 'Zap',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-testing-suites',
            title: 'Unit, Component & End-to-End Testing',
            description: 'Jest, React Native Testing Library, Detox E2E testing, API mocking, and automated test runners.',
            topics: [
              {
                id: 'top-mobile-testing-detox',
                title: 'Unit & Component Testing (Jest / RNTL) & E2E Testing (Detox)',
                description: 'Write unit tests for business logic with Jest, component tests with React Native Testing Library (RNTL), mock REST APIs/native modules, and execute automated end-to-end user flows with Detox.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['DEV_TESTING', 'DEV_REACT_NATIVE'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-profiling-optimization',
            title: 'Performance Profiling, Memory Optimization & Crash Monitoring',
            description: 'Memory leak detection, CPU profiling, FlatList optimization, image caching, bundle size reduction, and Sentry crash reporting.',
            topics: [
              {
                id: 'top-mobile-profiling-sentry',
                title: 'Performance Profiling, Memory Optimization & Crash Monitoring',
                description: 'Use Android Studio Profiler, Flipper, and React DevTools to diagnose memory leaks, optimize FlatList virtualization, reduce JS bundle size with code splitting, eliminate re-renders, and integrate Sentry / Crashlytics for real-time error tracking.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_SYSTEM_DESIGN', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mobile-cicd-app-stores',
        title: '7. Mobile CI/CD, Release Engineering & App Stores',
        description: 'Learn how to build, sign, release, monitor, and continuously deliver mobile applications.',
        icon: 'FileText',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-build-signing',
            title: 'Android & iOS Build Systems & Code Signing',
            description: 'Gradle, Android build variants, Xcode build configurations, Android Keystore signing, iOS certificates, and provisioning profiles.',
            topics: [
              {
                id: 'top-mobile-build-signing-certs',
                title: 'Android & iOS Build Systems, Keystores & Code Signing',
                description: 'Master Android Studio Gradle builds, iOS Xcode schemes, debug vs release variants, environment configs (.env), Android Keystore generation, Apple certificates, provisioning profiles, and semantic versioning.',
                difficulty: 'Intermediate',
                estimatedTime: '16 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-cicd-publishing',
            title: 'Fastlane Automation, GitHub Actions CI/CD & Store Publishing',
            description: 'Automated release pipelines with GitHub Actions and Fastlane, TestFlight beta distribution, Google Play Console release, and app analytics.',
            topics: [
              {
                id: 'top-mobile-fastlane-store-deploy',
                title: 'Fastlane Automation, GitHub Actions CI/CD & Store Publishing',
                description: 'Set up automated CI/CD with GitHub Actions and Fastlane (Match, Gym, Supply, Pilot), manage TestFlight / Play Console internal tracks, publish release bundles (AAB / IPA), handle store review guidelines, rollbacks, and monitor app analytics.',
                difficulty: 'Advanced',
                estimatedTime: '20 Hours',
                curriculumKeys: ['DEV_DEPLOYMENT', 'DEV_GIT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'mobile-interviews-portfolio',
        title: '8. Mobile Engineering Interviews & Portfolio',
        description: 'Prepare for mobile engineering interviews and demonstrate production-level applications through a strong portfolio.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-mobile-tech-interviews',
            title: 'Technical & System Architecture Interview Preparation',
            description: 'Core JS/TS, React, React Native internals, offline architecture, security, performance trade-offs, and live coding scenarios.',
            topics: [
              {
                id: 'top-mobile-interview-scenarios',
                title: 'Mobile Technical Screens, Live Machine Coding & Architecture Scenarios',
                description: 'Master deep mobile interview topics: React reconciliation & re-renders, React Native New Architecture (Fabric/JSI), offline-first synchronization, FlatList 10K optimization, token security, push notifications, and production crash debugging.',
                difficulty: 'Intermediate',
                estimatedTime: '20 Hours',
                curriculumKeys: ['INT_MOCK', 'INT_BEHAVIORAL', 'INT_HR'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
          {
            id: 'mod-mobile-portfolio-branding',
            title: 'Mobile Engineering Portfolio, Published Apps & ATS Resume',
            description: 'Showcase published Play Store / GitHub apps, video walkthroughs, mobile developer ATS resume, and STAR behavioral answers.',
            topics: [
              {
                id: 'top-mobile-portfolio-resume',
                title: 'Mobile Engineering Portfolio, Published Apps & ATS Resume',
                description: 'Build a high-impact mobile developer ATS resume highlighting published store links, GitHub architecture repositories, video demos, performance metrics, and behavioral STAR stories for top mobile engineering roles.',
                difficulty: 'Beginner',
                estimatedTime: '10 Hours',
                curriculumKeys: ['INT_RESUME', 'INT_HR'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 8. CYBERSECURITY ENGINEER ====================
  else if (roleLower.includes('cyber') || roleLower.includes('security') || roleLower.includes('infosec') || roleLower.includes('pentest')) {
    categories = [
      {
        id: 'cyber-fundamentals',
        title: '1. Computer, Operating Systems & Networking Foundations',
        description: 'Understand CPU, memory, OS processes, TCP/IP & OSI network protocols, packet structure, and foundational security vocabulary.',
        icon: 'Binary',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-net-os',
            title: 'OS Architecture, TCP/IP & Network Protocols',
            description: 'OSI 7-layer model vs TCP/IP, IP addressing & subnetting, DNS/DHCP, core ports, and Wireshark capture analysis.',
            topics: [
              {
                id: 'top-cyber-net-basics',
                title: 'Computer Systems, OSI Model, TCP/IP & Wireshark Packet Inspection',
                description: 'OSI 7-layer model vs TCP/IP, IP addressing & subnetting, DNS/DHCP, core ports (HTTP/S, SSH, FTP, DNS), Wireshark capture analysis, and the CIA Triad.',
                difficulty: 'Beginner',
                estimatedTime: '18 Hours',
                curriculumKeys: ['CS_CN', 'CS_OS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-linux-scripting',
        title: '2. Linux Administration, Security Concepts & Python Scripting',
        description: 'Master Linux system administration, permissions, bash scripting, and Python automation for security.',
        icon: 'Terminal',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-linux-python',
            title: 'Linux Hardening & Security Scripting',
            description: 'Linux permissions (chmod/chown), process auditing, log analysis, systemd services, Bash scripting, and Python security scripts.',
            topics: [
              {
                id: 'top-cyber-linux-python',
                title: 'Linux Filesystem, Permissions, Bash & Security Python Scripting',
                description: 'Linux permissions (chmod/chown), process auditing, log analysis, systemd services, Bash scripting, and Python security scripts (port scanners, hash calculators).',
                difficulty: 'Beginner',
                estimatedTime: '20 Hours',
                curriculumKeys: ['LANG_PYTHON_CORE', 'CS_OS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-network-defense-tools',
        title: '3. Network Defense, Vulnerability Scanning & Tools',
        description: 'Deploy firewalls, IDS/IPS, VPNs, and conduct active vulnerability scans using Nmap, Wireshark, and Nessus.',
        icon: 'ShieldCheck',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-net-defense',
            title: 'Network Security Architecture & Active Scanning',
            description: 'Network segmentation, stateful firewalls, Suricata/Snort IDS/IPS, Nmap network discovery and OS fingerprinting.',
            topics: [
              {
                id: 'top-cyber-net-scan-tools',
                title: 'Firewalls, IDS/IPS, Nmap Scanning & Vulnerability Assessment',
                description: 'Network segmentation, stateful firewalls, Suricata/Snort IDS/IPS, Nmap network discovery and OS fingerprinting, and automated vulnerability scanning.',
                difficulty: 'Intermediate',
                estimatedTime: '22 Hours',
                curriculumKeys: ['CS_CN', 'DEV_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-web-security-owasp',
        title: '4. Web Application Security & OWASP Top 10',
        description: 'Identify, exploit, and remediate web application vulnerabilities including SQLi, XSS, CSRF, SSRF, and broken access control.',
        icon: 'Globe',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-web-owasp',
            title: 'Web App Pentesting & OWASP Defense',
            description: 'Hands-on web penetration testing with Burp Suite: SQL Injection, Cross-Site Scripting (XSS), CSRF, IDOR, SSRF, and auth bypass.',
            topics: [
              {
                id: 'top-cyber-web-owasp',
                title: 'OWASP Top 10 Exploitation & Remediation with Burp Suite',
                description: 'Hands-on web penetration testing with Burp Suite: SQL Injection, Cross-Site Scripting (XSS), CSRF, IDOR, SSRF, authentication bypass, and secure code remediation.',
                difficulty: 'Intermediate',
                estimatedTime: '25 Hours',
                curriculumKeys: ['DEV_REST_APIS', 'CS_DBMS'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-crypto-iam',
        title: '5. Applied Cryptography, PKI & Identity & Access Management',
        description: 'Symmetric & asymmetric encryption, hashing, digital certificates, TLS handshakes, OAuth 2.0, and Zero Trust IAM.',
        icon: 'Key',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-crypto-iam',
            title: 'Applied Cryptography & Zero Trust IAM',
            description: 'AES symmetric encryption, RSA public-key crypto, SHA-256 hashing, HMAC, TLS handshake certificates, and OAuth2 / OIDC.',
            topics: [
              {
                id: 'top-cyber-crypto-pki',
                title: 'AES, RSA, Hashing, TLS Handshake & Zero Trust Access Control',
                description: 'AES symmetric encryption, RSA public-key crypto, SHA-256 hashing, HMAC, SSL/TLS handshake certificates, OAuth2 / OIDC authentication, and Zero Trust IAM policies.',
                difficulty: 'Intermediate',
                estimatedTime: '18 Hours',
                curriculumKeys: ['CS_CN', 'DEV_DEPLOYMENT'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-soc-incident-response',
        title: '6. SOC Operations, SIEM & Incident Response',
        description: 'Security Operations Center workflows, SIEM log monitoring (Splunk / Elastic), threat intelligence, and digital forensics.',
        icon: 'Activity',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-soc-siem',
            title: 'SOC Monitoring, SIEM & Digital Forensics',
            description: 'SOC Tier 1/2 workflows, Splunk / Elastic SIEM query correlation, MITRE ATT&CK framework mapping, and malware triage.',
            topics: [
              {
                id: 'top-cyber-soc-splunk',
                title: 'SIEM Log Analysis (Splunk/ELK), Threat Hunting & Incident Response',
                description: 'SOC Tier 1/2 workflows, Splunk / Elastic SIEM query correlation, MITRE ATT&CK framework mapping, malware triage, and incident response playbooks.',
                difficulty: 'Advanced',
                estimatedTime: '22 Hours',
                curriculumKeys: ['CS_OS', 'DEV_SYSTEM_DESIGN'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-projects-labs',
        title: '7. Hands-on Security Projects & Penetration Testing Labs',
        description: 'Build virtual home labs, analyze real malware captures, configure SIEM pipelines, and complete TryHackMe / HackTheBox paths.',
        icon: 'FolderGit2',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-projects',
            title: 'Practical Security Projects & Cyber Range Labs',
            description: 'Virtual security lab, automated Splunk SIEM log ingestion pipeline, and full pentesting report capstone.',
            topics: [
              {
                id: 'top-cyber-projects-capstone',
                title: 'Virtual Security Lab, Splunk SIEM Pipeline & Pentesting Capstone',
                description: 'Build: 1) Home Active Directory / Linux Security Lab. 2) Automated Splunk SIEM Log Ingestion Pipeline. 3) Full Pentesting Report & Vulnerability Assessment Capstone.',
                difficulty: 'Advanced',
                estimatedTime: '35 Hours',
                curriculumKeys: ['PROJ_INTERMEDIATE', 'PROJ_ADVANCED'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
      {
        id: 'cyber-interviews-certifications',
        title: '8. Security Engineering Interviews & Certification Prep',
        description: 'Prepare for SOC Analyst, Pentester, and Security Engineer interviews and CompTIA Security+ / CEH / OSCP certifications.',
        icon: 'Briefcase',
        moduleCount: 0,
        topicCount: 0,
        modules: [
          {
            id: 'mod-cyber-interview-prep',
            title: 'Technical Security Screens & Scenarios',
            description: 'Incident response scenarios, web exploit defense walkthroughs, Security+ SY0-701 domain reviews, and technical security portfolio.',
            topics: [
              {
                id: 'top-cyber-interview-prep',
                title: 'Security Scenario Screens, CompTIA Security+ Questions & Portfolio',
                description: 'Master live incident response scenarios, networking/OS deep dives, web exploit defense walkthroughs, Security+ SY0-701 domain reviews, and technical security portfolio building.',
                difficulty: 'Intermediate',
                estimatedTime: '15 Hours',
                curriculumKeys: ['INT_HR', 'INT_BEHAVIORAL', 'INT_RESUME'],
                resourceCount: 0,
                guidedFlow: {} as any,
              },
            ],
          },
        ],
      },
    ];
  }
  // ==================== 9. DEFAULT / SOFTWARE ENGINEER (SDE) ====================
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
        const effectiveLanguage: ResourceLanguage = normRole.toLowerCase().includes('frontend') ? 'JavaScript' : normRole.toLowerCase().includes('backend') ? 'TypeScript' : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning')) ? 'Python' : normLanguage;
        const mentorRes = resolveMentorResources(top.curriculumKeys, effectiveLanguage);
        const allResolved = top.curriculumKeys.flatMap((key) => resolveResources(key, effectiveLanguage));

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
  'top-aiml-python-data-math': {
    videoTitle: 'freeCodeCamp: Python, Data Analysis (NumPy, Pandas) & Math for Machine Learning',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=LHBE6Q9XlzI',
    docTitle: 'Python, NumPy & Pandas Official Documentation',
    docProvider: 'Python Software Foundation / NumPy / Pandas',
    docUrl: 'https://numpy.org/doc/stable/',
    practiceSheetName: '⭐ Kaggle Python & Pandas Data Analysis Tutorials',
    practiceSheetUrl: 'https://www.kaggle.com/learn/python',
    practiceSheetBadge: 'Recommended for Python & Data',
  },
  'top-aiml-classical-ml': {
    videoTitle: 'freeCodeCamp & StatQuest: Machine Learning Course & Scikit-Learn Masterclass',
    videoProvider: 'freeCodeCamp / StatQuest',
    videoUrl: 'https://www.youtube.com/watch?v=i_LwzRVP7bg',
    docTitle: 'Scikit-Learn Official User Guide & Machine Learning Tutorials',
    docProvider: 'Scikit-Learn Core Team',
    docUrl: 'https://scikit-learn.org/stable/user_guide.html',
    practiceSheetName: '⭐ Scikit-Learn & XGBoost Hands-On ML Practice',
    practiceSheetUrl: 'https://scikit-learn.org/stable/tutorial/index.html',
    practiceSheetBadge: 'Recommended for Machine Learning',
  },
  'top-aiml-deep-learning-pytorch': {
    videoTitle: 'freeCodeCamp & Andrej Karpathy: PyTorch Deep Learning & Neural Networks Course',
    videoProvider: 'freeCodeCamp / Andrej Karpathy',
    videoUrl: 'https://www.youtube.com/watch?v=V_xro1bcAuA',
    docTitle: 'PyTorch Official Documentation & Deep Learning Tutorials',
    docProvider: 'PyTorch / Meta AI',
    docUrl: 'https://pytorch.org/tutorials/',
    practiceSheetName: '⭐ DeepLearning.AI & PyTorch Official Practice Exercises',
    practiceSheetUrl: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html',
    practiceSheetBadge: 'Recommended for PyTorch & Deep Learning',
  },
  'top-aiml-genai-llms': {
    videoTitle: 'Andrej Karpathy & DeepLearning.AI: Intro to Large Language Models & GenAI',
    videoProvider: 'Andrej Karpathy / DeepLearning.AI',
    videoUrl: 'https://www.youtube.com/watch?v=zjkBMFhNj_g',
    docTitle: 'Hugging Face Transformers & OpenAI API Documentation',
    docProvider: 'Hugging Face / OpenAI',
    docUrl: 'https://huggingface.co/docs/transformers/index',
    practiceSheetName: '⭐ Hugging Face NLP Course & LLM Application Exercises',
    practiceSheetUrl: 'https://huggingface.co/learn/nlp-course/chapter1/1',
    practiceSheetBadge: 'Recommended for Generative AI & LLMs',
  },
  'top-aiml-rag-agents': {
    videoTitle: 'DeepLearning.AI & freeCodeCamp: Building Production RAG & AI Agent Systems',
    videoProvider: 'DeepLearning.AI / freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=tcqEUSNCn8I',
    docTitle: 'LlamaIndex, LangChain & Vector DB (FAISS/pgvector) Docs',
    docProvider: 'LlamaIndex / LangChain / FAISS',
    docUrl: 'https://docs.llamaindex.ai/',
    practiceSheetName: '⭐ RAG Architecture & Vector Search Implementation Guide',
    practiceSheetUrl: 'https://python.langchain.com/docs/tutorials/rag/',
    practiceSheetBadge: 'Recommended for RAG & AI Agents',
  },
  'top-aiml-mlops-serving': {
    videoTitle: 'freeCodeCamp: MLOps, Model Serving with FastAPI & Docker Masterclass',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=06-AZXmwHjo',
    docTitle: 'FastAPI, MLflow & Docker Official Documentation',
    docProvider: 'FastAPI / MLflow / Docker',
    docUrl: 'https://fastapi.tiangolo.com/',
    practiceSheetName: '⭐ MLOps Architecture & FastAPI Model Serving Guide',
    practiceSheetUrl: 'https://mlflow.org/docs/latest/index.html',
    practiceSheetBadge: 'Recommended for MLOps & Model Serving',
  },
  'top-aiml-projects-portfolio': {
    videoTitle: 'freeCodeCamp & CampusX: End-to-End AI/ML Industry Projects & Capstone',
    videoProvider: 'freeCodeCamp / CampusX',
    videoUrl: 'https://www.youtube.com/watch?v=W5v_36u9h6E',
    docTitle: 'Full Stack Deep Learning & Production AI Engineering Guide',
    docProvider: 'Full Stack Deep Learning (UC Berkeley)',
    docUrl: 'https://fullstackdeeplearning.com/',
    practiceSheetName: '⭐ End-to-End AI System Architecture & Portfolio Blueprint',
    practiceSheetUrl: 'https://fullstackdeeplearning.com/course/2022/',
    practiceSheetBadge: 'Recommended for AI Portfolio',
  },
  'top-aiml-interviews-prep': {
    videoTitle: 'DeepLearning.AI & NeetCode: AI/ML Engineering Technical Interview Prep',
    videoProvider: 'DeepLearning.AI / NeetCode',
    videoUrl: 'https://www.youtube.com/watch?v=4b4MUYve_U8',
    docTitle: 'Machine Learning Interview Book & Tech Interview Handbook',
    docProvider: 'Chip Huyen / Tech Interview Handbook',
    docUrl: 'https://huyenchip.com/ml-interviews-book/',
    practiceSheetName: '⭐ Machine Learning Systems Design & Interview Question Sheet',
    practiceSheetUrl: 'https://github.com/chiphuyen/machine-learning-systems-design',
    practiceSheetBadge: 'Recommended for AI Interviews',
  },

  // ==================== 3. FRONTEND ENGINEER TOPICS ====================
  'top-fe-html-accessibility': {
    videoTitle: 'freeCodeCamp: HTML5 & Web Accessibility (a11y) Full Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=kUMe1FH4CHE',
    docTitle: 'MDN Web Docs: HTML5 Semantics & ARIA Accessibility Guide',
    docProvider: 'Mozilla Developer Network (MDN)',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Learn/Accessibility',
    practiceSheetName: '⭐ Frontend Mentor HTML & Accessibility Challenges',
    practiceSheetUrl: 'https://www.frontendmentor.io/challenges',
    practiceSheetBadge: 'Recommended for HTML & a11y',
  },
  'top-fe-css-layouts': {
    videoTitle: 'SuperSimpleDev: Modern CSS, Flexbox & CSS Grid Masterclass',
    videoProvider: 'SuperSimpleDev',
    videoUrl: 'https://www.youtube.com/watch?v=G3e-cpL7ofc',
    docTitle: 'web.dev: Learn CSS & Modern Responsive Layout Systems',
    docProvider: 'Google Chrome Core Team (web.dev)',
    docUrl: 'https://web.dev/learn/css',
    practiceSheetName: '⭐ CSS Grid & Flexbox Froggy / Defense Labs',
    practiceSheetUrl: 'https://flexboxfroggy.com/',
    practiceSheetBadge: 'Recommended for CSS Layouts',
  },
  'top-fe-js-core': {
    videoTitle: 'Traversy Media: Modern JavaScript ES6+ & Asynchronous Mastery',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=hdI2bkO-Flw',
    docTitle: 'JavaScript.info: The Modern JavaScript Tutorial',
    docProvider: 'JavaScript.info',
    docUrl: 'https://javascript.info/',
    practiceSheetName: '⭐ 30 Days of JavaScript (LeetCode)',
    practiceSheetUrl: 'https://leetcode.com/studyplan/30-days-of-javascript/',
    practiceSheetBadge: 'Recommended for JS',
  },
  'top-fe-ts-core': {
    videoTitle: 'freeCodeCamp: TypeScript Full Course for Beginners & React Developers',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
    docTitle: 'TypeScript Official Handbook & Type-Safe API Documentation',
    docProvider: 'Microsoft TypeScript Team',
    docUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    practiceSheetName: '⭐ Type Challenges & TypeScript Exercises',
    practiceSheetUrl: 'https://github.com/type-challenges/type-challenges',
    practiceSheetBadge: 'Recommended for TypeScript',
  },
  'top-fe-react-core': {
    videoTitle: 'freeCodeCamp: React 18 Core Fundamentals & Component Architecture',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    docTitle: 'React.dev: Official React Documentation & Interactive Tutorial',
    docProvider: 'Meta Open Source (React.dev)',
    docUrl: 'https://react.dev/learn',
    practiceSheetName: '⭐ React.dev Official Interactive Challenges',
    practiceSheetUrl: 'https://react.dev/learn/describing-the-ui',
    practiceSheetBadge: 'Recommended for React',
  },
  'top-fe-react-hooks': {
    videoTitle: 'Web Dev Simplified: React Hooks Deep Dive (useState, useEffect, useMemo, useCallback)',
    videoProvider: 'Web Dev Simplified',
    videoUrl: 'https://www.youtube.com/watch?v=TNhaISOUy68',
    docTitle: 'React.dev: Built-in React Hooks & Custom Hooks Reference',
    docProvider: 'Meta Open Source (React.dev)',
    docUrl: 'https://react.dev/reference/react',
    practiceSheetName: '⭐ GreatFrontEnd React Hooks & Widget Practice',
    practiceSheetUrl: 'https://www.greatfrontend.com/questions/quiz',
    practiceSheetBadge: 'Recommended for Hooks',
  },
  'top-fe-react-perf': {
    videoTitle: 'Jack Herrington: React Performance, Re-renders & Memoization Masterclass',
    videoProvider: 'Jack Herrington',
    videoUrl: 'https://www.youtube.com/watch?v=uojLJFt9SzY',
    docTitle: 'React.dev: Optimizing Performance & Suspense Reference',
    docProvider: 'Meta Open Source (React.dev)',
    docUrl: 'https://react.dev/reference/react/useMemo',
    practiceSheetName: '⭐ React Performance & Re-rendering Audit Guide',
    practiceSheetUrl: 'https://react.dev/learn/render-and-commit',
    practiceSheetBadge: 'Recommended for Performance',
  },
  'top-fe-nextjs-core': {
    videoTitle: 'Fireship & freeCodeCamp: Next.js App Router & Server Components Course',
    videoProvider: 'Fireship / freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=wm5gMKCOyIk',
    docTitle: 'Next.js Official Documentation & Learn App Router Course',
    docProvider: 'Vercel (Next.js Team)',
    docUrl: 'https://nextjs.org/learn',
    practiceSheetName: '⭐ Next.js App Router Official Practice Exercises',
    practiceSheetUrl: 'https://nextjs.org/learn',
    practiceSheetBadge: 'Recommended for Next.js',
  },
  'top-fe-nextjs-arch': {
    videoTitle: 'ByteGrad: Professional Next.js Feature-Based Architecture & SEO',
    videoProvider: 'ByteGrad',
    videoUrl: 'https://www.youtube.com/watch?v=vwSlYG7hFk0',
    docTitle: 'Next.js Official Guide: Metadata, Caching & Project Structure',
    docProvider: 'Vercel (Next.js Team)',
    docUrl: 'https://nextjs.org/docs/app/building-your-application/optimizing/metadata',
    practiceSheetName: '⭐ Next.js Production Architecture Blueprint',
    practiceSheetUrl: 'https://nextjs.org/docs/app/building-your-application/routing',
    practiceSheetBadge: 'Recommended for Next.js Architecture',
  },
  'top-fe-apis-http': {
    videoTitle: 'Traversy Media: REST APIs, Axios & Async JavaScript Masterclass',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=rJesac0_Ftw',
    docTitle: 'MDN Web Docs: Working with Fetch API & HTTP Status Codes',
    docProvider: 'Mozilla Developer Network (MDN)',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch',
    practiceSheetName: '⭐ Public APIs for Frontend Practice Projects',
    practiceSheetUrl: 'https://github.com/public-apis/public-apis',
    practiceSheetBadge: 'Recommended for APIs',
  },
  'top-fe-state-query': {
    videoTitle: 'Cosden Solutions: TanStack React Query v5 & Zustand Full Tutorial',
    videoProvider: 'Cosden Solutions',
    videoUrl: 'https://www.youtube.com/watch?v=r8Dg0KVnfMA',
    docTitle: 'TanStack Query Official Documentation & Zustand Guide',
    docProvider: 'TanStack & Zustand',
    docUrl: 'https://tanstack.com/query/latest/docs/framework/react/overview',
    practiceSheetName: '⭐ React Query & Server State Synchronization Guide',
    practiceSheetUrl: 'https://tanstack.com/query/latest/docs/framework/react/quick-start',
    practiceSheetBadge: 'Recommended for State & Query',
  },
  'top-fe-devtools-git': {
    videoTitle: 'Traversy Media: Chrome DevTools & Git/GitHub Team Workflows',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=x4q86IjJFag',
    docTitle: 'Chrome DevTools Official Documentation & Git Handbook',
    docProvider: 'Google Chrome Team / GitHub',
    docUrl: 'https://developer.chrome.com/docs/devtools',
    practiceSheetName: '⭐ GitHub Skills & Interactive Git Workflows',
    practiceSheetUrl: 'https://skills.github.com/',
    practiceSheetBadge: 'Recommended for DevTools & Git',
  },
  'top-fe-testing-vitest': {
    videoTitle: 'Web Dev Simplified: Vitest & React Testing Library (RTL) Tutorial',
    videoProvider: 'Web Dev Simplified',
    videoUrl: 'https://www.youtube.com/watch?v=8Xwq35itooU',
    docTitle: 'React Testing Library & Vitest Official Documentation',
    docProvider: 'Testing Library Core Team',
    docUrl: 'https://testing-library.com/docs/react-testing-library/intro/',
    practiceSheetName: '⭐ React Testing Library Practice Exercises',
    practiceSheetUrl: 'https://testing-library.com/docs/example-codesandbox',
    practiceSheetBadge: 'Recommended for Frontend Testing',
  },
  'top-fe-perf-vitals': {
    videoTitle: 'Fireship & web.dev: Web Performance & Core Web Vitals (LCP, INP, CLS)',
    videoProvider: 'Fireship / Google Chrome Team',
    videoUrl: 'https://www.youtube.com/watch?v=AQqFZ5oeSN4',
    docTitle: 'web.dev: Learn Web Performance & Optimization Guide',
    docProvider: 'Google Chrome Core Team (web.dev)',
    docUrl: 'https://web.dev/learn/performance',
    practiceSheetName: '⭐ Lighthouse & Core Web Vitals Optimization Checklist',
    practiceSheetUrl: 'https://web.dev/vitals/',
    practiceSheetBadge: 'Recommended for Performance',
  },
  'top-fe-a11y-security-deploy': {
    videoTitle: 'freeCodeCamp: Web Security (XSS, CSRF, CSP) & Vercel Deployment',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=F5v7_V1eQ9U',
    docTitle: 'OWASP Web Security Testing Guide & Vercel Documentation',
    docProvider: 'OWASP & Vercel',
    docUrl: 'https://owasp.org/www-project-top-ten/',
    practiceSheetName: '⭐ OWASP Frontend Security & Deployment Checklist',
    practiceSheetUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/DOM_based_XSS_Prevention_Cheat_Sheet.html',
    practiceSheetBadge: 'Recommended for Security & Deployment',
  },
  'top-fe-projects-portfolio': {
    videoTitle: 'Adrian Twarog: Build & Deploy a Developer Portfolio Website',
    videoProvider: 'Adrian Twarog',
    videoUrl: 'https://www.youtube.com/watch?v=0YFrGy_asUk',
    docTitle: 'Frontend Mentor: Real-World Frontend Project Specs & Designs',
    docProvider: 'Frontend Mentor',
    docUrl: 'https://www.frontendmentor.io/challenges',
    practiceSheetName: '⭐ Frontend Mentor Portfolio Project Specs',
    practiceSheetUrl: 'https://www.frontendmentor.io/challenges',
    practiceSheetBadge: 'Recommended for Portfolio',
  },
  'top-fe-interviews-machine-coding': {
    videoTitle: 'GreatFrontEnd & BFE.dev: Frontend Machine Coding & React Interview Problems',
    videoProvider: 'GreatFrontEnd / BFE.dev',
    videoUrl: 'https://www.youtube.com/watch?v=V37L_iHstfs',
    docTitle: 'GreatFrontEnd & BFE.dev: Front End Interview Handbook',
    docProvider: 'GreatFrontEnd & Yangshun Tay',
    docUrl: 'https://www.frontendmentor.io/',
    practiceSheetName: '⭐ GreatFrontEnd React & JS Interview Practice',
    practiceSheetUrl: 'https://www.greatfrontend.com/',
    practiceSheetBadge: 'Recommended for Frontend Interviews',
  },

  // ==================== 4. BACKEND ENGINEER TOPICS ====================
  'top-be-ts-core': {
    videoTitle: 'freeCodeCamp: TypeScript Full Course for Backend & Node.js Developers',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=BCg4U1FzODs',
    docTitle: 'TypeScript Official Handbook & Node.js Integration Guide',
    docProvider: 'Microsoft TypeScript Team',
    docUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    practiceSheetName: '⭐ Type Challenges & TypeScript Exercises',
    practiceSheetUrl: 'https://github.com/type-challenges/type-challenges',
    practiceSheetBadge: 'Recommended for TypeScript',
  },
  'top-be-node-core': {
    videoTitle: 'freeCodeCamp: Node.js, Event Loop, Streams & Async Masterclass',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
    docTitle: 'Node.js Official Documentation & Event Loop Guides',
    docProvider: 'OpenJS Foundation (Node.js)',
    docUrl: 'https://nodejs.org/en/docs/guides',
    practiceSheetName: '⭐ Node.js Core API & Event Loop Practice',
    practiceSheetUrl: 'https://nodejs.org/api/',
    practiceSheetBadge: 'Recommended for Node.js',
  },
  'top-be-http-networking': {
    videoTitle: 'Fireship & Husseini Nasser: Networking Protocols, HTTP/HTTPS & REST Principles',
    videoProvider: 'Fireship / Husseini Nasser',
    videoUrl: 'https://www.youtube.com/watch?v=WjTrfoiB0MQ',
    docTitle: 'MDN Web Docs: HTTP Headers, Status Codes & CORS Security',
    docProvider: 'Mozilla Developer Network (MDN)',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP',
    practiceSheetName: '⭐ REST API Architectural Guidelines & Specs',
    practiceSheetUrl: 'https://github.com/microsoft/api-guidelines',
    practiceSheetBadge: 'Recommended for Networking & HTTP',
  },
  'top-be-express-apis': {
    videoTitle: 'Traversy Media: Express.js REST API Masterclass (Routing, Middleware & Swagger)',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=l8WPWK9mS5M',
    docTitle: 'Express.js Official Documentation & OpenAPI/Swagger Specification',
    docProvider: 'OpenJS Foundation (Express.js)',
    docUrl: 'https://expressjs.com/en/starter/installing.html',
    practiceSheetName: '⭐ Express.js Middleware & Production Routing Guide',
    practiceSheetUrl: 'https://expressjs.com/en/guide/using-middleware.html',
    practiceSheetBadge: 'Recommended for Express.js',
  },
  'top-be-postgresql-sql': {
    videoTitle: 'freeCodeCamp & Husseini Nasser: PostgreSQL Database Masterclass & Indexing',
    videoProvider: 'freeCodeCamp / Husseini Nasser',
    videoUrl: 'https://www.youtube.com/watch?v=qw--VYLpxG4',
    docTitle: 'PostgreSQL Official Documentation & SQL Query Reference',
    docProvider: 'PostgreSQL Global Development Group',
    docUrl: 'https://www.postgresql.org/docs/current/',
    practiceSheetName: '⭐ SQLBolt & LeetCode SQL 50 Study Plan',
    practiceSheetUrl: 'https://sqlbolt.com/',
    practiceSheetBadge: 'Recommended for PostgreSQL & SQL',
  },
  'top-be-mongodb-nosql': {
    videoTitle: 'Traversy Media: MongoDB & Mongoose Document Modeling Crash Course',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=DZBGEExLXuM',
    docTitle: 'MongoDB Official Documentation & Data Modeling Guide',
    docProvider: 'MongoDB Inc',
    docUrl: 'https://www.mongodb.com/docs/manual/core/data-modeling-introduction/',
    practiceSheetName: '⭐ MongoDB University & Aggregation Pipeline Guide',
    practiceSheetUrl: 'https://www.mongodb.com/docs/manual/aggregation/',
    practiceSheetBadge: 'Recommended for NoSQL',
  },
  'top-be-auth-jwt': {
    videoTitle: 'Web Dev Simplified: Authentication & Authorization (JWT, Refresh Tokens & Cookies)',
    videoProvider: 'Web Dev Simplified',
    videoUrl: 'https://www.youtube.com/watch?v=mbsmsi7l3r4',
    docTitle: 'JWT.io & Auth0 Official Security & Token Best Practices',
    docProvider: 'Auth0 / Okta',
    docUrl: 'https://jwt.io/introduction',
    practiceSheetName: '⭐ OWASP Token Authentication & Session Management Cheat Sheet',
    practiceSheetUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
    practiceSheetBadge: 'Recommended for Auth & JWT',
  },
  'top-be-security-owasp': {
    videoTitle: 'freeCodeCamp: Web Backend Security (SQLi, XSS, CSRF & Helmet.js)',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=F5v7_V1eQ9U',
    docTitle: 'OWASP Top 10 Web Application Security Risks & Cheat Sheets',
    docProvider: 'OWASP Foundation',
    docUrl: 'https://owasp.org/www-project-top-ten/',
    practiceSheetName: '⭐ OWASP Node.js & REST API Security Checklist',
    practiceSheetUrl: 'https://cheatsheetseries.owasp.org/cheatsheets/Nodejs_Security_Cheat_Sheet.html',
    practiceSheetBadge: 'Recommended for Backend Security',
  },
  'top-be-redis-caching': {
    videoTitle: 'Fireship & Husseini Nasser: Redis Crash Course (Caching, TTL & Rate Limiting)',
    videoProvider: 'Fireship / Husseini Nasser',
    videoUrl: 'https://www.youtube.com/watch?v=G1rOthIU-uo',
    docTitle: 'Redis Official Documentation & Data Structures Reference',
    docProvider: 'Redis Ltd',
    docUrl: 'https://redis.io/docs/latest/',
    practiceSheetName: '⭐ Redis Commands & Cache-Aside Architecture Guide',
    practiceSheetUrl: 'https://redis.io/commands/',
    practiceSheetBadge: 'Recommended for Redis',
  },
  'top-be-queues-background': {
    videoTitle: 'Traversy Media & ByteGrad: Asynchronous Job Queues with BullMQ & Redis',
    videoProvider: 'Traversy Media / ByteGrad',
    videoUrl: 'https://www.youtube.com/watch?v=7h34xWqj8hM',
    docTitle: 'BullMQ Official Documentation & Guide',
    docProvider: 'Taskforce.sh (BullMQ Team)',
    docUrl: 'https://docs.bullmq.io/',
    practiceSheetName: '⭐ BullMQ Architecture & Message Queue Patterns',
    practiceSheetUrl: 'https://docs.bullmq.io/patterns/debounce',
    practiceSheetBadge: 'Recommended for Message Queues',
  },
  'top-be-testing-jest': {
    videoTitle: 'Web Dev Simplified: Testing Node.js & Express APIs with Jest & Supertest',
    videoProvider: 'Web Dev Simplified',
    videoUrl: 'https://www.youtube.com/watch?v=FKnzS_icp40',
    docTitle: 'Jest & Supertest Official Documentation',
    docProvider: 'Meta Open Source (Jest) / Visionmedia',
    docUrl: 'https://jestjs.io/docs/getting-started',
    practiceSheetName: '⭐ Supertest API Endpoint Testing Guide',
    practiceSheetUrl: 'https://github.com/ladjs/supertest',
    practiceSheetBadge: 'Recommended for Testing',
  },
  'top-be-monitoring-debugging': {
    videoTitle: 'Traversy Media: Winston/Pino Logging, Node.js Debugging & Health Checks',
    videoProvider: 'Traversy Media',
    videoUrl: 'https://www.youtube.com/watch?v=480F4D3C5cQ',
    docTitle: 'Node.js Debugging Guide & Pino Structured Logger Docs',
    docProvider: 'Node.js Org & Pino',
    docUrl: 'https://nodejs.org/en/docs/guides/debugging-getting-started/',
    practiceSheetName: '⭐ Node.js Production Observability & Logging Checklist',
    practiceSheetUrl: 'https://getpino.io/#/',
    practiceSheetBadge: 'Recommended for Production',
  },
  'top-be-docker-containers': {
    videoTitle: 'TechWorld with Nana: Docker & Docker Compose Full Course for Beginners',
    videoProvider: 'TechWorld with Nana',
    videoUrl: 'https://www.youtube.com/watch?v=3c-iBn73dDE',
    docTitle: 'Docker Official Getting Started Guide & Compose Reference',
    docProvider: 'Docker Inc',
    docUrl: 'https://docs.docker.com/get-started/',
    practiceSheetName: '⭐ Dockerfile & Docker Compose Multi-Container Guide',
    practiceSheetUrl: 'https://docs.docker.com/compose/',
    practiceSheetBadge: 'Recommended for Docker',
  },
  'top-be-cicd-cloud-deploy': {
    videoTitle: 'freeCodeCamp: GitHub Actions CI/CD & Deploying Node.js APIs to Cloud',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjU',
    docTitle: 'GitHub Actions Official Documentation & Deployment Guides',
    docProvider: 'GitHub / Microsoft',
    docUrl: 'https://docs.github.com/en/actions',
    practiceSheetName: '⭐ GitHub Actions CI/CD Workshop & Workflow Examples',
    practiceSheetUrl: 'https://lab.github.com/',
    practiceSheetBadge: 'Recommended for CI/CD & Cloud',
  },
  'top-be-system-design-arch': {
    videoTitle: 'ByteByteGo (Alex Xu): System Design Interview Fundamentals & Scalability',
    videoProvider: 'ByteByteGo / Alex Xu',
    videoUrl: 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
    docTitle: 'System Design Primer (Donne Martin) & Architecture Reference',
    docProvider: 'Donne Martin (GitHub)',
    docUrl: 'https://github.com/donnemartin/system-design-primer',
    practiceSheetName: '⭐ System Design Architecture Checklist & Mock Questions',
    practiceSheetUrl: 'https://github.com/donnemartin/system-design-primer#system-design-interview-questions-with-solutions',
    practiceSheetBadge: 'Recommended for System Design',
  },
  'top-be-interviews-capstone': {
    videoTitle: 'freeCodeCamp & NeetCode: Backend Machine Coding & Technical Interview Sprint',
    videoProvider: 'freeCodeCamp / NeetCode',
    videoUrl: 'https://www.youtube.com/watch?v=7CqJlxBYj-M',
    docTitle: 'Backend Engineering Interview Handbook & Machine Coding Specs',
    docProvider: 'GreatFrontEnd / Tech Interview Handbook',
    docUrl: 'https://www.techinterviewhandbook.org/',
    practiceSheetName: '⭐ LeetCode 75 & NeetCode Backend Interview Sheet',
    practiceSheetUrl: 'https://leetcode.com/studyplan/leetcode-75/',
    practiceSheetBadge: 'Recommended for Backend Interviews',
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
  'top-ds-excel-core': {
    videoTitle: 'freeCodeCamp: Microsoft Excel Tutorial for Beginners & Data Analysis',
    videoProvider: 'freeCodeCamp / Luke Barousse',
    videoUrl: 'https://www.youtube.com/watch?v=rwbho0CgEAE',
    docTitle: 'Microsoft Excel Official Training & Function Reference',
    docProvider: 'Microsoft Learn',
    docUrl: 'https://support.microsoft.com/en-us/excel',
    practiceSheetName: '⭐ Excel Data Analysis Practice Exercises & Power Query Labs',
    practiceSheetUrl: 'https://support.microsoft.com/en-us/office/excel-functions-by-category-5f91f4e9-7b42-46d2-9bd1-63f26a86c0eb',
    practiceSheetBadge: 'Recommended for Excel',
  },
  'top-ds-sql-core': {
    videoTitle: 'Alex The Analyst: SQL Full Course for Beginners',
    videoProvider: 'Alex The Analyst',
    videoUrl: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
    docTitle: 'PostgreSQL Official Documentation & SQL Syntax Guide',
    docProvider: 'PostgreSQL Global Development Group',
    docUrl: 'https://www.postgresql.org/docs/current/tutorial-sql.html',
    practiceSheetName: '⭐ LeetCode 50 SQL Study Plan & SQLBolt',
    practiceSheetUrl: 'https://leetcode.com/studyplan/top-sql-50/',
    practiceSheetBadge: 'Recommended for SQL',
  },
  'top-ds-sql-advanced': {
    videoTitle: 'Luke Barousse: Advanced SQL for Data Analytics & Window Functions',
    videoProvider: 'Luke Barousse',
    videoUrl: 'https://www.youtube.com/watch?v=7mz73uXD9DA',
    docTitle: 'PostgreSQL Window Functions & Query Optimization Guide',
    docProvider: 'PostgreSQL Docs',
    docUrl: 'https://www.postgresql.org/docs/current/tutorial-window.html',
    practiceSheetName: '⭐ HackerRank SQL Practice & Advanced Joins',
    practiceSheetUrl: 'https://www.hackerrank.com/domains/sql',
    practiceSheetBadge: 'Recommended for Advanced SQL',
  },
  'top-ds-python-core': {
    videoTitle: 'Corey Schafer: Python Programming Beginner to Advanced Masterclass',
    videoProvider: 'Corey Schafer',
    videoUrl: 'https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7',
    docTitle: 'Python 3 Official Documentation & Language Tutorial',
    docProvider: 'Python Software Foundation',
    docUrl: 'https://docs.python.org/3/tutorial/index.html',
    practiceSheetName: '⭐ Kaggle Learn: Python Micro-Course',
    practiceSheetUrl: 'https://www.kaggle.com/learn/python',
    practiceSheetBadge: 'Recommended for Python',
  },
  'top-ds-pandas-wrangling': {
    videoTitle: 'Keith Galli: Complete Pandas Data Analysis Tutorial',
    videoProvider: 'Keith Galli',
    videoUrl: 'https://www.youtube.com/watch?v=vmEHCJofslg',
    docTitle: 'Pandas Official User Guide & API Reference',
    docProvider: 'Pandas Core Team',
    docUrl: 'https://pandas.pydata.org/docs/user_guide/index.html',
    practiceSheetName: '⭐ Kaggle Learn: Pandas Data Manipulation',
    practiceSheetUrl: 'https://www.kaggle.com/learn/pandas',
    practiceSheetBadge: 'Recommended for Pandas',
  },
  'top-ds-python-eda-automation': {
    videoTitle: 'Luke Barousse: Python Data Visualization & EDA Tutorial',
    videoProvider: 'Luke Barousse',
    videoUrl: 'https://www.youtube.com/watch?v=3g6mlycK5L0',
    docTitle: 'Seaborn & Matplotlib Statistical Data Visualization Reference',
    docProvider: 'Seaborn Development Team',
    docUrl: 'https://seaborn.pydata.org/tutorial.html',
    practiceSheetName: '⭐ Kaggle Learn: Data Visualization Micro-Course',
    practiceSheetUrl: 'https://www.kaggle.com/learn/data-visualization',
    practiceSheetBadge: 'Recommended for EDA & Viz',
  },
  'top-ds-stats-descriptive': {
    videoTitle: 'StatQuest with Josh Starmer: Descriptive Statistics & Probability',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/playlist?list=PLblh5JKooLUK0FLuzwntyYI10UQFUhsY9',
    docTitle: 'Khan Academy: High School Statistics & Probability Course',
    docProvider: 'Khan Academy',
    docUrl: 'https://www.khanacademy.org/math/statistics-probability',
    practiceSheetName: '⭐ Khan Academy Statistics Exercises',
    practiceSheetUrl: 'https://www.khanacademy.org/math/ap-statistics',
    practiceSheetBadge: 'Recommended for Statistics',
  },
  'top-ds-hypothesis-testing': {
    videoTitle: 'StatQuest: Hypothesis Testing, p-values & t-tests Explained',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/watch?v=0oc49g30Fdo',
    docTitle: 'NIST/SEMATECH e-Handbook of Statistical Methods',
    docProvider: 'National Institute of Standards and Technology',
    docUrl: 'https://www.itl.nist.gov/div898/handbook/',
    practiceSheetName: '⭐ StatQuest Statistics & Hypothesis Testing Guide',
    practiceSheetUrl: 'https://statquest.org/',
    practiceSheetBadge: 'Recommended for Hypothesis Testing',
  },
  'top-ds-ab-testing': {
    videoTitle: 'Udacity / Google: A/B Testing & Experimentation Principles',
    videoProvider: 'Udacity & Google',
    videoUrl: 'https://www.youtube.com/watch?v=2fjhW0s0gno',
    docTitle: 'Exp-Platform: A/B Testing Practical Guide & Pitfalls',
    docProvider: 'Microsoft Research / Kohavi et al.',
    docUrl: 'https://www.exp-platform.com/',
    practiceSheetName: '⭐ Kaggle A/B Testing Case Study Datasets',
    practiceSheetUrl: 'https://www.kaggle.com/datasets?search=ab+testing',
    practiceSheetBadge: 'Recommended for A/B Testing',
  },
  'top-ds-powerbi-dax': {
    videoTitle: 'Guy in a Cube: Power BI Beginner to Pro Masterclass',
    videoProvider: 'Guy in a Cube',
    videoUrl: 'https://www.youtube.com/watch?v=TmhQC8D_g24',
    docTitle: 'Microsoft Power BI Official Documentation & DAX Reference',
    docProvider: 'Microsoft Learn',
    docUrl: 'https://learn.microsoft.com/en-us/power-bi/',
    practiceSheetName: '⭐ Microsoft Power BI Guided Learning & DAX Patterns',
    practiceSheetUrl: 'https://daxpatterns.com/',
    practiceSheetBadge: 'Recommended for Power BI',
  },
  'top-ds-tableau-core': {
    videoTitle: 'freeCodeCamp: Tableau Course for Beginners',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=TPPl8j-j6k4',
    docTitle: 'Tableau Official Learning Guides & Desktop Reference',
    docProvider: 'Salesforce / Tableau',
    docUrl: 'https://www.tableau.com/learn/training',
    practiceSheetName: '⭐ Tableau Public Sample Dashboards & Datasets',
    practiceSheetUrl: 'https://public.tableau.com/en-us/s/resources',
    practiceSheetBadge: 'Recommended for Tableau',
  },
  'top-ds-business-analytics': {
    videoTitle: 'Alex The Analyst: Business Analyst & Data Storytelling Guide',
    videoProvider: 'Alex The Analyst',
    videoUrl: 'https://www.youtube.com/watch?v=5Vz1yI3xM1k',
    docTitle: 'Harvard Business Review / Tableau: Data Storytelling Essentials',
    docProvider: 'Tableau Data Storytelling',
    docUrl: 'https://www.tableau.com/learn/articles/data-storytelling',
    practiceSheetName: '⭐ Business Case Study Analytics Frameworks',
    practiceSheetUrl: 'https://www.caseinterview.com/',
    practiceSheetBadge: 'Recommended for Business Analytics',
  },
  'top-ds-ml-algorithms': {
    videoTitle: 'Andrew Ng: Machine Learning Specialization (DeepLearning.AI)',
    videoProvider: 'Andrew Ng (YouTube / Coursera)',
    videoUrl: 'https://www.youtube.com/playlist?list=PLkD_b64UXVP8P4n3Z277tFj6K38rN44bE',
    docTitle: 'Scikit-Learn Official Supervised Learning User Guide',
    docProvider: 'Scikit-Learn Developers',
    docUrl: 'https://scikit-learn.org/stable/supervised_learning.html',
    practiceSheetName: '⭐ Kaggle Intro to Machine Learning Micro-Course',
    practiceSheetUrl: 'https://www.kaggle.com/learn/intro-to-machine-learning',
    practiceSheetBadge: 'Recommended for Machine Learning',
  },
  'top-ds-feature-engineering': {
    videoTitle: 'Kaggle: Feature Engineering Full Tutorial',
    videoProvider: 'Kaggle',
    videoUrl: 'https://www.youtube.com/watch?v=9g0H82qWvV8',
    docTitle: 'Scikit-Learn Preprocessing & Feature Extraction Reference',
    docProvider: 'Scikit-Learn Developers',
    docUrl: 'https://scikit-learn.org/stable/modules/preprocessing.html',
    practiceSheetName: '⭐ Kaggle Feature Engineering Micro-Course',
    practiceSheetUrl: 'https://www.kaggle.com/learn/feature-engineering',
    practiceSheetBadge: 'Recommended for Feature Engineering',
  },
  'top-ds-model-evaluation': {
    videoTitle: 'StatQuest: Machine Learning Evaluation Metrics & ROC Curves',
    videoProvider: 'StatQuest with Josh Starmer',
    videoUrl: 'https://www.youtube.com/watch?v=4jRBRDbJemM',
    docTitle: 'Scikit-Learn Model Evaluation & SHAP Documentation',
    docProvider: 'Scikit-Learn & SHAP Core Team',
    docUrl: 'https://scikit-learn.org/stable/modules/model_evaluation.html',
    practiceSheetName: '⭐ Model Evaluation & SHAP Explainability Exercises',
    practiceSheetUrl: 'https://shap.readthedocs.io/en/latest/',
    practiceSheetBadge: 'Recommended for Model Evaluation',
  },
  'top-ds-data-warehousing': {
    videoTitle: 'freeCodeCamp: Data Warehousing & Data Modeling Fundamentals',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=qWru-b6m030',
    docTitle: 'Snowflake & BigQuery Dimensional Modeling Reference',
    docProvider: 'Snowflake / Google Cloud',
    docUrl: 'https://docs.snowflake.com/en/user-guide/overview',
    practiceSheetName: '⭐ Snowflake Developer Quickstarts & Star Schema Practice',
    practiceSheetUrl: 'https://quickstarts.snowflake.com/',
    practiceSheetBadge: 'Recommended for Data Warehousing',
  },
  'top-ds-pyspark-bigdata': {
    videoTitle: 'freeCodeCamp: PySpark Big Data & Distributed Analytics',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=_C8kWso4XwM',
    docTitle: 'Apache Spark PySpark Official API Documentation',
    docProvider: 'Apache Software Foundation',
    docUrl: 'https://spark.apache.org/docs/latest/api/python/',
    practiceSheetName: '⭐ PySpark DataFrame Getting Started Exercises',
    practiceSheetUrl: 'https://spark.apache.org/docs/latest/sql-getting-started.html',
    practiceSheetBadge: 'Recommended for PySpark',
  },
  'top-ds-cloud-pipelines': {
    videoTitle: 'freeCodeCamp: AWS Cloud & Data Pipeline Engineering',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=S01Z2cT4J1s',
    docTitle: 'AWS S3 & BigQuery Cloud Storage Documentation',
    docProvider: 'Amazon Web Services / Google Cloud',
    docUrl: 'https://docs.aws.amazon.com/s3/',
    practiceSheetName: '⭐ AWS Skill Builder & Cloud Analytics Tutorials',
    practiceSheetUrl: 'https://explore.skillbuilder.aws/',
    practiceSheetBadge: 'Recommended for Cloud & Pipelines',
  },
  'top-ds-genai-llm': {
    videoTitle: 'DeepLearning.AI: ChatGPT Prompt Engineering for Developers',
    videoProvider: 'Andrew Ng / DeepLearning.AI',
    videoUrl: 'https://www.youtube.com/watch?v=jC4v5AS4RIM',
    docTitle: 'OpenAI API & Structured Outputs Documentation',
    docProvider: 'OpenAI Platform',
    docUrl: 'https://platform.openai.com/docs/guides/structured-outputs',
    practiceSheetName: '⭐ DeepLearning.AI Free Short Courses',
    practiceSheetUrl: 'https://www.deeplearning.ai/short-courses/',
    practiceSheetBadge: 'Recommended for GenAI',
  },
  'top-ds-rag-nl2sql': {
    videoTitle: 'LangChain: RAG & Natural-Language-to-SQL Masterclass',
    videoProvider: 'LangChain / freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=LhnCsL2lDkg',
    docTitle: 'LangChain SQL Agent & Vector Database Documentation',
    docProvider: 'LangChain Core Team',
    docUrl: 'https://python.langchain.com/docs/tutorials/sql_qa/',
    practiceSheetName: '⭐ LangChain SQL & RAG Codelabs',
    practiceSheetUrl: 'https://python.langchain.com/',
    practiceSheetBadge: 'Recommended for NL-to-SQL',
  },
  'top-ds-ai-ethics-agents': {
    videoTitle: 'Andrew Ng: AI Agents & Responsible AI Systems',
    videoProvider: 'Andrew Ng / DeepLearning.AI',
    videoUrl: 'https://www.youtube.com/watch?v=sal78ACtGTc',
    docTitle: 'NIST AI Risk Management Framework & Responsible AI',
    docProvider: 'National Institute of Standards and Technology',
    docUrl: 'https://www.nist.gov/itl/ai-risk-management-framework',
    practiceSheetName: '⭐ Responsible AI & LLM Evaluation Checklist',
    practiceSheetUrl: 'https://www.deeplearning.ai/',
    practiceSheetBadge: 'Recommended for Responsible AI',
  },
  'top-ds-portfolio-capstone': {
    videoTitle: 'Alex The Analyst: How to Build a Data Analyst Portfolio Project',
    videoProvider: 'Alex The Analyst',
    videoUrl: 'https://www.youtube.com/watch?v=qfyynHBFOsM',
    docTitle: 'GitHub Portfolio Guide & Data Project README Best Practices',
    docProvider: 'GitHub Documentation',
    docUrl: 'https://docs.github.com/en/get-started/writing-on-github',
    practiceSheetName: '⭐ Data Science Portfolio Projects & Capstone Specs',
    practiceSheetUrl: 'https://github.com/alexeygrigorev/data-science-interviews',
    practiceSheetBadge: 'Recommended for Capstone',
  },
  'top-ds-technical-interviews': {
    videoTitle: 'StrataScratch: Live SQL & Python Data Science Interview Questions',
    videoProvider: 'StrataScratch / Nate Rosidi',
    videoUrl: 'https://www.youtube.com/watch?v=680wL7f7iB4',
    docTitle: 'LeetCode SQL 50 & Ace the Data Science Interview Guide',
    docProvider: 'LeetCode & StrataScratch',
    docUrl: 'https://www.stratascratch.com/',
    practiceSheetName: '⭐ StrataScratch SQL & Data Science Interview Practice',
    practiceSheetUrl: 'https://www.stratascratch.com/',
    practiceSheetBadge: 'Recommended for Technical QA',
  },
  'top-ds-business-interviews': {
    videoTitle: 'Victor Cheng / CaseInterview: Product & Analytics Case Studies',
    videoProvider: 'CaseInterview',
    videoUrl: 'https://www.youtube.com/watch?v=1oW_2F2k4o0',
    docTitle: 'Tech Interview Handbook & Data Analyst Interview Guide',
    docProvider: 'Tech Interview Handbook',
    docUrl: 'https://www.techinterviewhandbook.org/',
    practiceSheetName: '⭐ Product Analytics & STAR Behavioral Question Bank',
    practiceSheetUrl: 'https://www.techinterviewhandbook.org/behavioral-interview-questions/',
    practiceSheetBadge: 'Recommended for Case Studies',
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
  'top-mobile-ts-core': {
    videoTitle: 'freeCodeCamp / Jack Herrington: Modern TypeScript & ES6+ Masterclass',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=gieEQFIfgYc',
    docTitle: 'TypeScript Official Documentation & Language Handbook',
    docProvider: 'TypeScript Team',
    docUrl: 'https://www.typescriptlang.org/docs/handbook/intro.html',
    practiceSheetName: '⭐ TypeScript Interactive Handbook & Playground Exercises',
    practiceSheetUrl: 'https://www.typescriptlang.org/play',
    practiceSheetBadge: 'Recommended for TypeScript',
  },
  'top-mobile-http-git-dsa': {
    videoTitle: 'freeCodeCamp: Git, GitHub, REST APIs & Practical Problem Solving',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
    docTitle: 'MDN Web Docs: HTTP & Working with REST APIs',
    docProvider: 'MDN Web Docs',
    docUrl: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview',
    practiceSheetName: '⭐ Git Immersion & REST API Practice Labs',
    practiceSheetUrl: 'https://gitimmersion.com/',
    practiceSheetBadge: 'Recommended for Foundations',
  },
  'top-mobile-rn-react-hooks': {
    videoTitle: 'freeCodeCamp: React Core, State Management & Essential Hooks',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
    docTitle: 'React Official Documentation: Managing State & Custom Hooks',
    docProvider: 'React Core Team',
    docUrl: 'https://react.dev/learn',
    practiceSheetName: '⭐ React.dev Interactive Challenges & Exercises',
    practiceSheetUrl: 'https://react.dev/learn/describing-the-ui',
    practiceSheetBadge: 'Recommended for React',
  },
  'top-mobile-rn-components-nav': {
    videoTitle: 'Programming with Mosh: React Native & React Navigation Full Course',
    videoProvider: 'Programming with Mosh',
    videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
    docTitle: 'React Native Official Documentation & Core Components',
    docProvider: 'Meta Open Source',
    docUrl: 'https://reactnative.dev/docs/getting-started',
    practiceSheetName: '⭐ React Navigation Official Guides & Interactive Examples',
    practiceSheetUrl: 'https://reactnavigation.org/docs/getting-started',
    practiceSheetBadge: 'Recommended for React Native UI',
  },
  'top-mobile-rn-animations-arch': {
    videoTitle: 'William Candillon: React Native Reanimated 3 & The New Architecture',
    videoProvider: 'William Candillon',
    videoUrl: 'https://www.youtube.com/watch?v=yz9E1045bYg',
    docTitle: 'React Native Official Guide: Fabric, TurboModules & JSI',
    docProvider: 'Meta Open Source',
    docUrl: 'https://reactnative.dev/docs/the-new-architecture/landing-page',
    practiceSheetName: '⭐ React Native Reanimated Interactive Tutorials',
    practiceSheetUrl: 'https://docs.swmansion.com/react-native-reanimated/',
    practiceSheetBadge: 'Recommended for Mobile Animations',
  },
  'top-mobile-state-tanstack': {
    videoTitle: 'Jack Herrington: Redux Toolkit & TanStack Query in React Native',
    videoProvider: 'Jack Herrington',
    videoUrl: 'https://www.youtube.com/watch?v=9jR4aX0xX7U',
    docTitle: 'Redux Toolkit & TanStack Query Official Documentation',
    docProvider: 'Redux & TanStack',
    docUrl: 'https://redux-toolkit.js.org/introduction/getting-started',
    practiceSheetName: '⭐ TanStack Query React Native Setup & Caching Guides',
    practiceSheetUrl: 'https://tanstack.com/query/latest/docs/framework/react/overview',
    practiceSheetBadge: 'Recommended for State Management',
  },
  'top-mobile-offline-push': {
    videoTitle: 'freeCodeCamp: React Native Offline-First (SQLite) & Push Notifications (FCM)',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=ANdSdIlgsEw',
    docTitle: 'Expo SQLite & Firebase Cloud Messaging (FCM) Official Docs',
    docProvider: 'Expo & Firebase',
    docUrl: 'https://docs.expo.dev/versions/latest/sdk/sqlite/',
    practiceSheetName: '⭐ Firebase Cloud Messaging & Offline Storage Codelab',
    practiceSheetUrl: 'https://firebase.google.com/docs/cloud-messaging',
    practiceSheetBadge: 'Recommended for Offline & Notifications',
  },
  'top-mobile-arch-native-modules': {
    videoTitle: 'Philipp Lackner & Sean Allen: Clean Architecture & Native Android/iOS Integration',
    videoProvider: 'Philipp Lackner',
    videoUrl: 'https://www.youtube.com/watch?v=F9UC9DY-vIU',
    docTitle: 'Android App Architecture & Apple Developer Guidelines',
    docProvider: 'Google Android & Apple',
    docUrl: 'https://developer.android.com/topic/architecture',
    practiceSheetName: '⭐ React Native Custom Native Modules Guide (Kotlin / Swift)',
    practiceSheetUrl: 'https://reactnative.dev/docs/native-modules-intro',
    practiceSheetBadge: 'Recommended for Native Architecture',
  },
  'top-mobile-hardware-owasp': {
    videoTitle: 'Android Developers: Mobile Hardware APIs, Permissions & App Security',
    videoProvider: 'Android Developers',
    videoUrl: 'https://www.youtube.com/watch?v=pPky6zYfEFE',
    docTitle: 'OWASP Mobile Application Security Verification Standard (MASVS)',
    docProvider: 'OWASP Foundation',
    docUrl: 'https://owasp.org/www-project-mobile-top-10/',
    practiceSheetName: '⭐ OWASP Mobile Application Security Checklist',
    practiceSheetUrl: 'https://mas.owasp.org/',
    practiceSheetBadge: 'Recommended for Mobile Security',
  },
  'top-mobile-proj-tracker-food': {
    videoTitle: 'freeCodeCamp: Fullstack React Native E-Commerce & Expense Tracker App',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=mJ3bGvy0WAY',
    docTitle: 'React Native Community Architecture Patterns & Production Best Practices',
    docProvider: 'React Native Community',
    docUrl: 'https://reactnative.dev/docs/tutorial',
    practiceSheetName: '⭐ Production Mobile Projects Specification & Architecture Blueprint',
    practiceSheetUrl: 'https://github.com/react-native-community',
    practiceSheetBadge: 'Recommended for Production Projects',
  },
  'top-mobile-proj-chat-capstone': {
    videoTitle: 'freeCodeCamp: Full Production React Native Capstone App with WebSockets',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=VPvVD8t02U8',
    docTitle: 'Expo & React Native Production Deployment Guide',
    docProvider: 'Expo & Meta',
    docUrl: 'https://docs.expo.dev/distribution/introduction/',
    practiceSheetName: '⭐ Production-Grade Mobile Capstone Project Checklist',
    practiceSheetUrl: 'https://reactnative.dev/docs/publishing-to-google-play-store',
    practiceSheetBadge: 'Recommended for Final Capstone',
  },
  'top-mobile-testing-detox': {
    videoTitle: 'React Native Testing Library & Detox End-to-End Automation Masterclass',
    videoProvider: 'Callstack',
    videoUrl: 'https://www.youtube.com/watch?v=vQtN2Q6_gR8',
    docTitle: 'React Native Testing Library & Detox Official Documentation',
    docProvider: 'Callstack & Wix',
    docUrl: 'https://callstack.github.io/react-native-testing-library/',
    practiceSheetName: '⭐ Detox E2E Testing Interactive Codelab',
    practiceSheetUrl: 'https://wix.github.io/Detox/docs/introduction/getting-started/',
    practiceSheetBadge: 'Recommended for Mobile Testing',
  },
  'top-mobile-profiling-sentry': {
    videoTitle: 'William Candillon / Sentry: React Native Performance Profiling & Crash Monitoring',
    videoProvider: 'Sentry',
    videoUrl: 'https://www.youtube.com/watch?v=vQtN2Q6_gR8',
    docTitle: 'React Native Performance Overview & Sentry for Mobile Docs',
    docProvider: 'Meta & Sentry',
    docUrl: 'https://reactnative.dev/docs/performance',
    practiceSheetName: '⭐ React Native Performance Profiling Checklist',
    practiceSheetUrl: 'https://docs.sentry.io/platforms/react-native/',
    practiceSheetBadge: 'Recommended for Profiling & Reliability',
  },
  'top-mobile-build-signing-certs': {
    videoTitle: 'Tech With Tim: Android Keystores, Gradle Builds & iOS Provisioning Profiles',
    videoProvider: 'Tech With Tim',
    videoUrl: 'https://www.youtube.com/watch?v=0-S5a0eXPoc',
    docTitle: 'Android Studio Build Variants & Apple Developer Provisioning Profiles',
    docProvider: 'Google Android & Apple',
    docUrl: 'https://developer.android.com/build',
    practiceSheetName: '⭐ Android Keystore & iOS Code Signing Step-by-Step Guide',
    practiceSheetUrl: 'https://developer.apple.com/documentation/xcode/signing-a-target-manually',
    practiceSheetBadge: 'Recommended for App Signing',
  },
  'top-mobile-fastlane-store-deploy': {
    videoTitle: 'Fastlane Tools: Automating Mobile App Builds, TestFlight & Google Play Releases',
    videoProvider: 'Fastlane Tools',
    videoUrl: 'https://www.youtube.com/watch?v=R8_veQiYBjU',
    docTitle: 'Fastlane Official Documentation & Google Play Console Guides',
    docProvider: 'Fastlane & Google',
    docUrl: 'https://docs.fastlane.tools/',
    practiceSheetName: '⭐ Fastlane Mobile CI/CD Pipeline Workshop',
    practiceSheetUrl: 'https://docs.fastlane.tools/getting-started/cross-platform/react-native/',
    practiceSheetBadge: 'Recommended for CI/CD & Publishing',
  },
  'top-mobile-interview-scenarios': {
    videoTitle: 'Exponent / Interviewing.io: React Native & Mobile System Design Mock Interviews',
    videoProvider: 'Exponent',
    videoUrl: 'https://www.youtube.com/watch?v=pPky6zYfEFE',
    docTitle: 'Mobile Engineering Interview Handbook & System Design Patterns',
    docProvider: 'React Native Community',
    docUrl: 'https://github.com/virtoolswebplayer/react-native-interview-questions',
    practiceSheetName: '⭐ Top 50 Mobile App Developer Interview Questions & Scenarios',
    practiceSheetUrl: 'https://github.com/react-native-community/discussions-and-proposals',
    practiceSheetBadge: 'Recommended for Technical Screens',
  },
  'top-mobile-portfolio-resume': {
    videoTitle: 'Mobile Developer Portfolio, Play Store Demos & Tech Resume Strategy',
    videoProvider: 'TechLead',
    videoUrl: 'https://www.youtube.com/watch?v=gieEQFIfgYc',
    docTitle: 'EngineerPath Mobile Developer ATS Resume & Portfolio Playbook',
    docProvider: 'EngineerPath Career Engine',
    docUrl: 'https://roadmap.sh/react-native',
    practiceSheetName: '⭐ Mobile Developer Portfolio & Store Demo Checklist',
    practiceSheetUrl: 'https://roadmap.sh/react-native',
    practiceSheetBadge: 'Recommended for Career Branding',
  },

  // ==================== 9. CYBERSECURITY ENGINEER TOPICS ====================
  'top-cyber-net-basics': {
    videoTitle: 'NetworkChuck: Networking Fundamentals & Wireshark Packet Analysis',
    videoProvider: 'NetworkChuck',
    videoUrl: 'https://www.youtube.com/watch?v=IPvYjXCsTg8',
    docTitle: 'Wireshark User Guide & TCP/IP Protocol Suite Reference',
    docProvider: 'Wireshark Foundation',
    docUrl: 'https://www.wireshark.org/docs/',
    practiceSheetName: '⭐ Cisco Packet Tracer & Wireshark Capture Labs',
    practiceSheetUrl: 'https://www.wireshark.org/',
    practiceSheetBadge: 'Recommended for Networking',
  },
  'top-cyber-linux-python': {
    videoTitle: 'NetworkChuck: Linux for Hackers & Python Security Scripting',
    videoProvider: 'NetworkChuck',
    videoUrl: 'https://www.youtube.com/watch?v=VbEx7B_PTOE',
    docTitle: 'Linux Journey: Complete Command Line & Permissions Guide',
    docProvider: 'Linux Journey',
    docUrl: 'https://linuxjourney.com/',
    practiceSheetName: '⭐ OverTheWire Bandit: Linux Security WarGames',
    practiceSheetUrl: 'https://overthewire.org/wargames/bandit/',
    practiceSheetBadge: 'Recommended for Linux',
  },
  'top-cyber-net-scan-tools': {
    videoTitle: 'David Bombal & NetworkChuck: Nmap Network Scanning Full Course',
    videoProvider: 'David Bombal',
    videoUrl: 'https://www.youtube.com/watch?v=4t4kBkMsDbY',
    docTitle: 'Nmap Official Reference Guide & Network Security Scanning',
    docProvider: 'Nmap.org',
    docUrl: 'https://nmap.org/book/man.html',
    practiceSheetName: '⭐ TryHackMe: Network Security & Nmap Room',
    practiceSheetUrl: 'https://tryhackme.com/module/network-security',
    practiceSheetBadge: 'Recommended for Scanning',
  },
  'top-cyber-web-owasp': {
    videoTitle: 'freeCodeCamp: Web Application Penetration Testing & Bug Bounty Full Course',
    videoProvider: 'freeCodeCamp',
    videoUrl: 'https://www.youtube.com/watch?v=2_lswM1S264',
    docTitle: 'PortSwigger Web Security Academy: OWASP Top 10 Learning Materials',
    docProvider: 'PortSwigger / Burp Suite',
    docUrl: 'https://portswigger.net/web-security',
    practiceSheetName: '⭐ PortSwigger Interactive Web Security Labs (Free)',
    practiceSheetUrl: 'https://portswigger.net/web-security/all-labs',
    practiceSheetBadge: 'Recommended for OWASP',
  },
  'top-cyber-crypto-pki': {
    videoTitle: 'Computerphile: Public Key Cryptography, AES, RSA & Diffie-Hellman',
    videoProvider: 'Computerphile',
    videoUrl: 'https://www.youtube.com/watch?v=GSIDS_lvRv4',
    docTitle: 'NIST Cryptographic Standards & Guidelines',
    docProvider: 'NIST / OWASP',
    docUrl: 'https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines',
    practiceSheetName: '⭐ Cryptohack: Interactive Cryptography Challenges',
    practiceSheetUrl: 'https://cryptohack.org/',
    practiceSheetBadge: 'Recommended for Cryptography',
  },
  'top-cyber-soc-splunk': {
    videoTitle: 'BlackPerl: SOC Analyst & Splunk SIEM Fundamentals Full Course',
    videoProvider: 'BlackPerl / YouTube',
    videoUrl: 'https://www.youtube.com/watch?v=XhI2m_F2tWw',
    docTitle: 'Splunk Documentation & MITRE ATT&CK Framework',
    docProvider: 'Splunk & MITRE',
    docUrl: 'https://attack.mitre.org/',
    practiceSheetName: '⭐ TryHackMe: SOC Level 1 Training Path',
    practiceSheetUrl: 'https://tryhackme.com/path/outline/soclevel1',
    practiceSheetBadge: 'Recommended for SOC & SIEM',
  },
  'top-cyber-projects-capstone': {
    videoTitle: 'NetworkChuck: Build a Virtual Hacking & Detection Lab from Scratch',
    videoProvider: 'NetworkChuck',
    videoUrl: 'https://www.youtube.com/watch?v=W_iXo_y_hUo',
    docTitle: 'TryHackMe & HackTheBox Penetration Testing Guidelines',
    docProvider: 'TryHackMe',
    docUrl: 'https://tryhackme.com/',
    practiceSheetName: '⭐ Hands-on Cybersecurity Lab Blueprint & Walkthrough',
    practiceSheetUrl: 'https://tryhackme.com/',
    practiceSheetBadge: 'Recommended for Projects',
  },
  'top-cyber-interview-prep': {
    videoTitle: 'Professor Messer: CompTIA Security+ SY0-701 Training Course & Scenarios',
    videoProvider: 'Professor Messer',
    videoUrl: 'https://www.youtube.com/watch?v=9L_L9_x_w8o',
    docTitle: 'CompTIA Security+ SY0-701 Exam Objectives & Cyber Interview Guide',
    docProvider: 'CompTIA / EngineerPath',
    docUrl: 'https://www.comptia.org/certifications/security',
    practiceSheetName: '⭐ Top 50 Cybersecurity Interview Scenarios & Questions',
    practiceSheetUrl: 'https://roadmap.sh/cyber-security',
    practiceSheetBadge: 'Recommended for Interviews',
  },
};

        const trustedRes = TRUSTED_DIRECT_RESOURCES[top.id];

        // Build primary video using direct trusted playlist URL or DB match
        const primaryVid = (trustedRes ? {
          id: `vid-${top.id}`,
          title: trustedRes.videoTitle,
          provider: trustedRes.videoProvider,
          url: trustedRes.videoUrl,
          type: 'video',
          difficulty: top.difficulty,
        } : mapResourceToStep(mentorRes.primaryVideo)) || {
          id: `vid-${top.id}`,
          title: `${top.title} — Official Course & Masterclass`,
          provider: normRole.toLowerCase().includes('frontend')
            ? 'SuperSimpleDev / Traversy Media / freeCodeCamp'
            : normRole.toLowerCase().includes('backend')
            ? 'freeCodeCamp / Traversy Media / Husseini Nasser'
            : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning'))
            ? 'freeCodeCamp / StatQuest / Andrej Karpathy'
            : top.title.toLowerCase().includes('python') || normLanguage === 'Python'
            ? 'Corey Schafer / freeCodeCamp'
            : top.title.toLowerCase().includes('c++') || normLanguage === 'C++'
            ? 'Striver (takeUforward) / Luv'
            : top.title.toLowerCase().includes('react')
            ? 'freeCodeCamp / Traversy Media'
            : 'Kunal Kushwaha / freeCodeCamp',
          url: 'https://www.youtube.com/@freecodecamp/playlists',
          type: 'video',
          difficulty: top.difficulty,
        };

        // Build primary documentation using direct trusted doc URL or DB match
        const primaryDoc = (trustedRes ? {
          id: `doc-${top.id}`,
          title: trustedRes.docTitle,
          provider: trustedRes.docProvider,
          url: trustedRes.docUrl,
          type: 'article',
        } : mapResourceToStep(mentorRes.primaryNote)) || {
          id: `doc-${top.id}`,
          title: `Official Documentation & Reference Notes for ${top.title}`,
          provider: normRole.toLowerCase().includes('frontend')
            ? 'MDN Web Docs / React.dev Docs'
            : normRole.toLowerCase().includes('backend')
            ? 'Node.js Docs / PostgreSQL Docs / Express Docs'
            : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning'))
            ? 'Python Docs / Scikit-Learn Docs / PyTorch Docs'
            : top.title.toLowerCase().includes('react')
            ? 'React.dev Docs'
            : top.title.toLowerCase().includes('python')
            ? 'Python.org Official Docs'
            : top.title.toLowerCase().includes('docker')
            ? 'Docker Docs'
            : 'GeeksforGeeks / MDN Web Docs',
          url: normRole.toLowerCase().includes('frontend')
            ? 'https://developer.mozilla.org/en-US/docs/Web'
            : normRole.toLowerCase().includes('backend')
            ? 'https://nodejs.org/en/docs/guides'
            : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning'))
            ? 'https://scikit-learn.org/stable/user_guide.html'
            : top.title.toLowerCase().includes('python')
            ? 'https://docs.python.org/3/'
            : top.title.toLowerCase().includes('react')
            ? 'https://react.dev/learn'
            : top.title.toLowerCase().includes('docker')
            ? 'https://docs.docker.com/get-started/'
            : 'https://developer.mozilla.org/en-US/docs/Web',
          type: 'article',
        };

        // Build practice sheet using direct trusted sheet or DB match
        const primarySheet = (trustedRes ? {
          title: trustedRes.practiceSheetName,
          provider: 'Curated Practice Sheet',
          url: trustedRes.practiceSheetUrl,
          badge: trustedRes.practiceSheetBadge,
        } : mentorRes.primaryDsaSheet ? {
          title: mentorRes.primaryDsaSheet.name,
          provider: 'Curated Practice Sheet',
          url: mentorRes.primaryDsaSheet.url,
          badge: mentorRes.primaryDsaSheet.badge,
        } : {
          title: `⭐ ${top.title} Practice Exercises`,
          provider: 'Curated Practice Sheet',
          url: normRole.toLowerCase().includes('frontend') ? 'https://www.frontendmentor.io/challenges' : normRole.toLowerCase().includes('backend') ? 'https://sqlbolt.com/' : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning')) ? 'https://www.kaggle.com/learn/python' : normLanguage === 'Python' ? 'https://neetcode.io/practice' : 'https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2/',
          badge: normRole.toLowerCase().includes('frontend') ? 'Recommended for Frontend' : normRole.toLowerCase().includes('backend') ? 'Recommended for Backend' : (normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning')) ? 'Recommended for AI / ML' : `Recommended for ${normLanguage}`,
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
        const isBackendRole = normRole.toLowerCase().includes('backend') && !normRole.toLowerCase().includes('full');
        const isAIRole = normRole.toLowerCase().includes('ai') || normRole.toLowerCase().includes('machine learning');
        const altVideos: GuidedStepResource[] = (normRole.toLowerCase().includes('frontend') || isBackendRole || isAIRole) ? [] : (mentorRes.alternativeVideos || []).map((v) => mapResourceToStep(v)!);
        const altNotes: GuidedStepResource[] = (normRole.toLowerCase().includes('frontend') || isBackendRole || isAIRole) ? [] : (mentorRes.alternativeNotes || []).map((n) => mapResourceToStep(n)!);
        const altSheets: Array<{ name: string; url: string }> = (normRole.toLowerCase().includes('frontend') || isBackendRole || isAIRole) ? [] : [...(mentorRes.alternativeDsaSheets || [])];

        // GAP-FILLER FRONTEND: Frontend Track — Add Frontend Mentor & GreatFrontEnd
        if (normRole.toLowerCase().includes('frontend') || top.id.startsWith('top-fe-')) {
          altSheets.unshift(
            {
              name: '⭐ Frontend Mentor Real-World UI Challenges',
              url: 'https://www.frontendmentor.io/challenges',
            },
            {
              name: '⭐ GreatFrontEnd React & JavaScript Practice',
              url: 'https://www.greatfrontend.com/',
            }
          );
          altVideos.push(
            {
              id: `vid-fe-alt-1-${top.id}`,
              title: 'freeCodeCamp: Modern Frontend Masterclass',
              provider: 'freeCodeCamp (YouTube)',
              url: 'https://www.youtube.com/@freecodecamp',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-fe-alt-2-${top.id}`,
              title: 'Web Dev Simplified: Frontend Engineering Tutorials',
              provider: 'Web Dev Simplified (YouTube)',
              url: 'https://www.youtube.com/@WebDevSimplified',
              type: 'video',
              difficulty: top.difficulty,
            }
          );
          altNotes.push(
            {
              id: `note-fe-alt-1-${top.id}`,
              title: 'MDN Web Docs: Developer Guides & Standard Reference',
              provider: 'Mozilla Developer Network (MDN)',
              url: 'https://developer.mozilla.org/en-US/docs/Web',
              type: 'article',
            },
            {
              id: `note-fe-alt-2-${top.id}`,
              title: 'web.dev: Modern Web Development Best Practices',
              provider: 'Google Chrome Core Team (web.dev)',
              url: 'https://web.dev/learn',
              type: 'article',
            }
          );
        }

        // GAP-FILLER BACKEND: Backend Track — Add Node.js, Express & System Architecture Guides
        if (isBackendRole || top.id.startsWith('top-be-')) {
          altSheets.unshift(
            {
              name: '⭐ Node.js & Express Production Architecture Guide',
              url: 'https://github.com/goldbergyoni/nodebestpractices',
            },
            {
              name: '⭐ System Design Primer (Donne Martin)',
              url: 'https://github.com/donnemartin/system-design-primer',
            }
          );
          altVideos.push(
            {
              id: `vid-be-alt-1-${top.id}`,
              title: 'Husseini Nasser: Backend Engineering & Network Protocols',
              provider: 'Husseini Nasser (YouTube)',
              url: 'https://www.youtube.com/@HousseinNasser',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-be-alt-2-${top.id}`,
              title: 'ByteByteGo: System Design & Backend Architecture',
              provider: 'ByteByteGo / Alex Xu (YouTube)',
              url: 'https://www.youtube.com/@ByteByteGo',
              type: 'video',
              difficulty: top.difficulty,
            }
          );
          altNotes.push(
            {
              id: `note-be-alt-1-${top.id}`,
              title: 'Node.js Official Production Best Practices & Security',
              provider: 'Node.js Core Team',
              url: 'https://nodejs.org/en/docs/guides/security/',
              type: 'article',
            },
            {
              id: `note-be-alt-2-${top.id}`,
              title: 'PostgreSQL Official Query Optimization & Indexing Guide',
              provider: 'PostgreSQL Global Development Group',
              url: 'https://www.postgresql.org/docs/current/performance-tips.html',
              type: 'article',
            }
          );
        }

        // GAP-FILLER AI/ML: AI Track — Add Kaggle, PyTorch & StatQuest Guides
        if (isAIRole || top.id.startsWith('top-aiml-')) {
          altSheets.unshift(
            {
              name: '⭐ Kaggle Machine Learning Datasets & Notebooks',
              url: 'https://www.kaggle.com/learn',
            },
            {
              name: '⭐ PyTorch Official Tutorials & Deep Learning Codelabs',
              url: 'https://pytorch.org/tutorials/',
            }
          );
          altVideos.push(
            {
              id: `vid-aiml-alt-1-${top.id}`,
              title: 'StatQuest with Josh Starmer: ML & Deep Learning Algorithms',
              provider: 'StatQuest with Josh Starmer (YouTube)',
              url: 'https://www.youtube.com/@statquest',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-aiml-alt-2-${top.id}`,
              title: 'Andrej Karpathy: Neural Networks & Zero-to-Hero LLM Series',
              provider: 'Andrej Karpathy (YouTube)',
              url: 'https://www.youtube.com/@AndrejKarpathy',
              type: 'video',
              difficulty: top.difficulty,
            }
          );
          altNotes.push(
            {
              id: `note-aiml-alt-1-${top.id}`,
              title: 'Scikit-Learn Official User Guide & API Documentation',
              provider: 'Scikit-Learn Core Team',
              url: 'https://scikit-learn.org/stable/user_guide.html',
              type: 'article',
            },
            {
              id: `note-aiml-alt-2-${top.id}`,
              title: 'Hugging Face Transformers Official Documentation',
              provider: 'Hugging Face Core Team',
              url: 'https://huggingface.co/docs/transformers/index',
              type: 'article',
            }
          );
        }

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

        // GAP-FILLER 5: Mobile App Developer Track — Add Cross-Platform & Native Ecosystem Awareness
        if (top.id.startsWith('top-mobile-')) {
          altNotes.unshift(
            {
              id: `note-mobile-stack-${top.id}`,
              title: '📱 Mobile Role Roadmap: Primary Cross-Platform (React Native + TypeScript) & Platform Ecosystems',
              provider: 'EngineerPath 2026 Mobile Architecture Guide',
              url: 'https://reactnative.dev/docs/getting-started',
              type: 'article',
            },
            {
              id: `note-flutter-official-${top.id}`,
              title: 'Secondary Cross-Platform: Flutter & Dart Official Documentation (Google)',
              provider: 'Google Flutter Team',
              url: 'https://docs.flutter.dev/',
              type: 'article',
            },
            {
              id: `note-android-compose-${top.id}`,
              title: 'Native Android: Jetpack Compose & Modern Kotlin Architecture (Google)',
              provider: 'Google Android Developers',
              url: 'https://developer.android.com/develop/ui/compose',
              type: 'article',
            },
            {
              id: `note-apple-swiftui-${top.id}`,
              title: 'Native iOS: SwiftUI & Modern Swift Architecture Tutorials (Apple)',
              provider: 'Apple Developer',
              url: 'https://developer.apple.com/xcode/swiftui/',
              type: 'article',
            }
          );

          altVideos.push(
            {
              id: `vid-flutter-official-${top.id}`,
              title: 'Secondary Cross-Platform: Flutter & Dart Complete Masterclass (Google)',
              provider: 'Flutter Official (YouTube)',
              url: 'https://www.youtube.com/@flutterdev',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-android-official-${top.id}`,
              title: 'Native Android: Kotlin & Jetpack Compose Fundamentals (Google Android)',
              provider: 'Google Android Developers (YouTube)',
              url: 'https://www.youtube.com/user/androiddevelopers',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-kotlin-${top.id}`,
              title: 'Native Android: Clean Architecture in Kotlin & Compose (Philipp Lackner)',
              provider: 'Philipp Lackner (YouTube)',
              url: 'https://www.youtube.com/@PhilippLackner',
              type: 'video',
              difficulty: top.difficulty,
            },
            {
              id: `vid-swiftui-allen-${top.id}`,
              title: 'Native iOS: SwiftUI & Swift Language Essentials (Sean Allen)',
              provider: 'Sean Allen (YouTube)',
              url: 'https://www.youtube.com/@seanallen',
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
