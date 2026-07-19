export interface JavaDeveloperMonth {
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

export const javaDeveloperRoadmap: JavaDeveloperMonth[] = [
  {
    number: 1,
    title: "Core Java Foundations + Git",
    focus: "OOP concepts, syntax, basic collections, and Git version control",
    topics: [
      "Java setup, JVM/JDK/JRE architecture, variables, data types, operators, and control flow",
      "Object-Oriented Programming (OOP) — classes, objects, constructors, encapsulation, inheritance, polymorphism, abstraction, and interfaces vs. abstract classes",
      "Arrays, Strings & StringBuilder, exception handling (try/catch/finally, custom exceptions), packages, and access modifiers",
      "Collections Framework basics (List, Set, Map, ArrayList, HashMap)",
      "Git & GitHub basics (init, add, commit, push, pull, branch, merge, pull requests)"
    ],
    tools: ["JDK 21 (LTS)", "IntelliJ IDEA Community", "Git", "GitHub"],
    youtube: [
      {
        channel: "Telusko (Navin Reddy)",
        bestFor: "Best all-round Java fundamentals + OOP explained simply",
        searchUrl: "https://www.youtube.com/@Telusko"
      },
      {
        channel: "Kunal Kushwaha",
        bestFor: "Structured Java + DSA course starting from zero, includes Git tutorials",
        searchUrl: "https://www.youtube.com/results?search_query=Kunal+Kushwaha+Java"
      },
      {
        channel: "Bro Code",
        bestFor: "Fast-paced single-video crash course, good for syntax revision",
        searchUrl: "https://www.youtube.com/results?search_query=Bro+Code+Java"
      }
    ],
    project: {
      title: "Console-based Student Management System",
      description: "Build a console application using Core Java and the Collections framework to manage students (add, update, delete, and search students in ArrayLists). Push to GitHub."
    }
  },
  {
    number: 2,
    title: "Intermediate Java + DSA Foundations",
    focus: "Functional Java (Streams/Lambdas), multithreading, and basic algorithms",
    topics: [
      "Generics, Collections deep-dive (LinkedList, TreeMap, HashSet, Comparator/Comparable)",
      "Java 8+ features: Lambda expressions, Functional Interfaces, Streams API, and Optional class",
      "Multithreading & Concurrency basics (Thread, Runnable, synchronized, ExecutorService)",
      "DSA foundations: Time/Space complexity (Big-O), searching (linear/binary), sorting (bubble/insertion/merge/quick), and recursion",
      "Solving basic coding challenges on LeetCode/GeeksforGeeks (linked lists, stacks, queues, strings)"
    ],
    tools: ["IntelliJ IDEA", "LeetCode", "GeeksforGeeks", "HackerRank"],
    youtube: [
      {
        channel: "Take U Forward (Striver)",
        bestFor: "The famous A2Z DSA Sheet — gold standard structured DSA course",
        searchUrl: "https://www.youtube.com/results?search_query=Take+U+Forward+DSA"
      },
      {
        channel: "Abdul Bari",
        bestFor: "Best deep conceptual explanations of sorting, searching, and algorithm theory",
        searchUrl: "https://www.youtube.com/results?search_query=Abdul+Bari+Algorithms"
      },
      {
        channel: "Telusko",
        bestFor: "Java 8 Streams & Lambda playlists and multithreading basics",
        searchUrl: "https://www.youtube.com/results?search_query=Telusko+Streams+Lambda"
      }
    ],
    project: {
      title: "Multithreaded File Processor / Streams Analyzer",
      description: "Build a Streams-based CSV parser that extracts statistics, or a multithreaded file processor that executes concurrent tasks. Solve 100 DSA problems."
    }
  },
  {
    number: 3,
    title: "Databases + Spring Core + Spring Boot Basics",
    focus: "Relational databases, SQL, Hibernate/JPA, and building your first REST API",
    topics: [
      "SQL fundamentals: DDL/DML, joins, group by, subqueries, indexing, and database normalization",
      "JDBC database connections, Hibernate ORM and JPA Entity mapping/relationships (OneToMany, ManyToMany)",
      "Spring Core: Inversion of Control (IoC), Dependency Injection (DI), component scanning, and Beans",
      "Spring Boot foundations: auto-configuration, starters, application properties, and REST controllers",
      "REST API endpoints (@GetMapping, @PostMapping), request/response models, Maven build system"
    ],
    tools: ["MySQL", "PostgreSQL", "DBeaver", "Postman", "Spring Initializr", "Maven"],
    youtube: [
      {
        channel: "Java Brains (Koushik Kothagal)",
        bestFor: "Excellent conceptual clarity on Spring IoC/DI and framework design",
        searchUrl: "https://www.youtube.com/@JavaBrains"
      },
      {
        channel: "Amigoscode",
        bestFor: "Modern, practical Spring Boot with REST and PostgreSQL database integrations",
        searchUrl: "https://www.youtube.com/results?search_query=Amigoscode+Spring+Boot"
      },
      {
        channel: "in28minutes (Ranga Karanam)",
        bestFor: "Excellent structured, 'learn by building' full courses on Spring Boot & REST",
        searchUrl: "https://www.youtube.com/results?search_query=in28minutes+Spring+Boot"
      }
    ],
    project: {
      title: "REST API Library Management System",
      description: "Build a bookstore or library REST API using Spring Boot, Spring Data JPA, and PostgreSQL. Test all CRUD endpoints using Postman and document with a README."
    }
  },
  {
    number: 4,
    title: "Advanced Spring Boot + Microservices + Testing + Docker",
    focus: "Spring Security, validation, unit testing, microservice communication, and Docker deployment",
    topics: [
      "Exception handling (@ControllerAdvice), bean validation (@Valid), Spring Security (JWT auth/authz)",
      "Unit and integration testing using JUnit 5 and Mockito mock services",
      "Microservices architecture: Eureka service discovery, API Gateways, REST inter-service queries, and message brokers (Kafka/RabbitMQ basics)",
      "Containerization: writing Dockerfiles, Docker Compose (app + database), and basic CI/CD (GitHub Actions)"
    ],
    tools: ["Docker Desktop", "JUnit 5", "Mockito", "Apache Kafka", "GitHub Actions"],
    youtube: [
      {
        channel: "Java Techie",
        bestFor: "Spring Security, JWT login, and microservice communication patterns",
        searchUrl: "https://www.youtube.com/results?search_query=Java+Techie"
      },
      {
        channel: "Amigoscode",
        bestFor: "Docker with Java, testing with JUnit/Mockito, full-stack project builds",
        searchUrl: "https://www.youtube.com/results?search_query=Amigoscode+Docker+Java"
      },
      {
        channel: "TechWorld with Nana",
        bestFor: "The gold-standard tutorials on Docker containers and Kubernetes basics",
        searchUrl: "https://www.youtube.com/@TechWorldwithNana"
      }
    ],
    project: {
      title: "Secured, Tested, Containerized Bookstore Service",
      description: "Extend Month 3 library API: add JWT security, write Mockito controller/service tests, containerize with a Dockerfile, and run database + app via Docker Compose."
    }
  },
  {
    number: 5,
    title: "Advanced DSA + System Design + Capstone Project + Interview Prep",
    focus: "Advanced data structures, system design fundamentals, portfolios, and mock interviews",
    topics: [
      "Advanced DSA: Trees (Binary, BST), Heaps, Tries, Backtracking, Graphs (BFS/DFS), and Dynamic Programming",
      "System Design basics: scalability, load balancing, caching (Redis), database indexing/sharding, SQL vs. NoSQL",
      "Mock interviews, resume polishing, portfolio setup, and core Java/Spring review sheets"
    ],
    tools: ["LeetCode (200+ solved)", "Excalidraw", "Notion", "GitHub Portfolio"],
    youtube: [
      {
        channel: "Gaurav Sen",
        bestFor: "Beginner-friendly system design walkthroughs with real-world examples",
        searchUrl: "https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design"
      },
      {
        channel: "ByteByteGo",
        bestFor: "Visual, concise system design explainers and architecture patterns",
        searchUrl: "https://www.youtube.com/@ByteByteGo"
      },
      {
        channel: "NeetCode",
        bestFor: "Pattern-based DSA problem walkthroughs and interview practice advice",
        searchUrl: "https://www.youtube.com/@NeetCode"
      }
    ],
    project: {
      title: "E-Commerce Backend Capstone / Job Portal Backend",
      description: "Build a production-grade e-commerce microservices backend with products, cart, order management, payment flows, JWT login, admin routes, and deploy it."
    }
  }
];
