export interface PythonBackendMonth {
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

export const pythonBackendRoadmap: PythonBackendMonth[] = [
  {
    number: 1,
    title: "Python Fundamentals, OOP, Git & SQL",
    focus: "Python logic, object-oriented programming, version control, and relational database SQL queries",
    topics: [
      "Python syntax: variables, data types, control flow, functions, and list/dict/set comprehensions",
      "OOP principles: classes, inheritance, polymorphism, and magic methods (__init__, __str__)",
      "Advanced syntax: decorators, generators, context managers (with statement), and try/except logic",
      "Environments & Git: venv, poetry dependency management, branches, merges, and PR workflows",
      "SQL fundamentals: SELECT, JOIN, GROUP BY, subqueries, database schemas, and indexing",
      "PostgreSQL: local database installation, psql CLI queries, and tables configuration"
    ],
    tools: ["Python 3.12+", "venv / poetry", "Git & GitHub", "PostgreSQL", "DBeaver"],
    youtube: [
      {
        channel: "Corey Schafer",
        bestFor: "Widely regarded as the best free resource for Python, OOP, decorators, and Git workflows",
        searchUrl: "https://www.youtube.com/@coreyms"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Full-length free courses on Python fundamentals and SQL/PostgreSQL databases",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Python"
      },
      {
        channel: "Hussein Nasser",
        bestFor: "Backend-focused explanation of database engines, transaction states, and ACID properties",
        searchUrl: "https://www.youtube.com/@hnasr"
      }
    ],
    project: {
      title: "CLI Library or Expense Tracker with Raw SQL",
      description: "Build a command-line expense or library manager using Python classes, persisting records to a local Postgres database using raw queries or SQLAlchemy Core (no ORM)."
    }
  },
  {
    number: 2,
    title: "Django & FastAPI + REST API Design",
    focus: "Django/FastAPI framework setups, models migrations, validation schemas, and REST principles",
    topics: [
      "Django framework: model schemas, tables migration lifecycle, URL routing, and view models",
      "Django REST Framework (DRF): serializer classes, ViewSets, API routers, and permission classes",
      "FastAPI: path operations, Pydantic data validation schemas, async handlers, and Swagger documentation",
      "REST API design: HTTP methods, response status codes, filtering, sorting, pagination, and error shapes",
      "ORM migrations: Django migrations system vs. Alembic migrations database sync for FastAPI"
    ],
    tools: ["Django + DRF", "FastAPI + Uvicorn", "SQLAlchemy + Alembic", "Postman", "DBeaver"],
    youtube: [
      {
        channel: "Traversy Media",
        bestFor: "Excellent web crash courses covering Django, Flask, and FastAPI setups",
        searchUrl: "https://www.youtube.com/@TraversyMedia"
      },
      {
        channel: "freeCodeCamp.org",
        bestFor: "Comprehensive full-stack Django and dedicated async FastAPI bootcamps",
        searchUrl: "https://www.youtube.com/results?search_query=freeCodeCamp+Django+FastAPI"
      },
      {
        channel: "CodingEntrepreneurs",
        bestFor: "The most popular project-based Django tutorials (Try Django series)",
        searchUrl: "https://www.youtube.com/results?search_query=CodingEntrepreneurs+Django"
      }
    ],
    project: {
      title: "REST API Book Store or Task Manager API",
      description: "Build a fully documented REST API for a job board or bookstore using Django REST Framework. Rebuild the core resource endpoints in FastAPI to compare structures."
    }
  },
  {
    number: 3,
    title: "Authentication, Testing, Caching & Background Jobs",
    focus: "JWT tokens user authorization, unit/integration testing, Redis caching, and Celery tasks",
    topics: [
      "Authentication: password hashing (bcrypt, argon2), OAuth2 configurations, and JSON Web Token (JWT) auth",
      "Authorization: role-based access control (RBAC) and security permission classes",
      "Testing: Pytest framework setup, mock configurations, testing DB transactions, and coverage metrics",
      "Redis caching: key-value storage strategies, TTL expiration parameters, and basic rate limiting",
      "Celery: background task queues, scheduled jobs via Celery Beat, and worker setup with Redis brokers"
    ],
    tools: ["pytest", "Redis", "Celery", "Flower", "PyJWT / python-jose"],
    youtube: [
      {
        channel: "ArjanCodes",
        bestFor: "Excellent guides on code quality, architecture patterns, and clean Python design",
        searchUrl: "https://www.youtube.com/@ArjanCodes"
      },
      {
        channel: "Real Python",
        bestFor: "In-depth testing, pytest configurations, mock files, and Python best practices",
        searchUrl: "https://www.youtube.com/@realpython"
      },
      {
        channel: "Tech With Tim",
        bestFor: "Practical step-by-step guides for JWT security setup, Redis caching, and Celery queues",
        searchUrl: "https://www.youtube.com/results?search_query=Tech+With+Tim+Celery"
      }
    ],
    project: {
      title: "Tested Secure API with Caching and Task Workers",
      description: "Add JWT token auth, cache analytical lists in Redis, compile a Celery background task worker for email tasks, and cover the codebase with 70%+ pytest coverage."
    }
  },
  {
    number: 4,
    title: "Docker, CI/CD & Cloud Deployment",
    focus: "Docker multi-container configurations, GitHub Actions pipelines, Gunicorn serving, and cloud hosting",
    topics: [
      "Docker: writing clean Dockerfiles, caching packages layer, and multi-stage container optimization",
      "Docker Compose: orchestrating API, PostgreSQL, Redis, and Celery workers altogether in local envs",
      "CI/CD: GitHub Actions pipelines executing code lint checkers, testing suites, and image builds on push",
      "Nginx reverse proxy, Gunicorn/Uvicorn server workers orchestration, and public endpoint SSL configurations",
      "Production secrets: environment variables injection, secure storage values, and AWS EC2/Render hosting"
    ],
    tools: ["Docker & Compose", "GitHub Actions", "Nginx", "Gunicorn / Uvicorn", "AWS / Render"],
    youtube: [
      {
        channel: "TechWorld with Nana",
        bestFor: "Unmatched tutorials explaining Docker configs, AWS infrastructure, and GitHub Actions",
        searchUrl: "https://www.youtube.com/@TechWorldwithNana"
      },
      {
        channel: "NetworkChuck",
        bestFor: "High-energy tutorials mapping out Docker container fundamentals and networking hooks",
        searchUrl: "https://www.youtube.com/results?search_query=NetworkChuck+Docker"
      },
      {
        channel: "DevOps Directive",
        bestFor: "Deploying multi-tier cloud applications and configuring production CI/CD servers",
        searchUrl: "https://www.youtube.com/@DevOpsDirective"
      }
    ],
    project: {
      title: "Dockerized Auto-Deployed Production Server",
      description: "Containerize the API, Database, Cache, and Worker via docker-compose. Configure GitHub Actions to test code on push and auto-deploy to an EC2 instance or PaaS behind Nginx."
    }
  },
  {
    number: 5,
    title: "System Design, Microservices, Security & Job Readiness",
    focus: "Scalability, service messaging queues, system monitoring, and interview preparation",
    topics: [
      "System Design: horizontal vs. vertical scaling, database sharding, read replicas, load balancer algorithms",
      "Microservices: API gateways, service directory registry, REST vs. gRPC, and message brokers (Kafka/RabbitMQ)",
      "Security: OWASP Top 10 vulnerabilities, SQL injection prevention, rate-limit policies, and TLS handshakes",
      "Monitoring: error capture automation using Sentry, Prometheus scrapers, and Grafana dashboard charts",
      "Interview prep: portfolio polish, resume descriptions, SDE-1 backend questions, and DSA practice drills"
    ],
    tools: ["Sentry SDK", "Prometheus", "Grafana", "gRPC (optional)", "Excalidraw"],
    youtube: [
      {
        channel: "ByteByteGo",
        bestFor: "The leading channel explaining system design architectures with clear visual animations",
        searchUrl: "https://www.youtube.com/@ByteByteGo"
      },
      {
        channel: "Gaurav Sen",
        bestFor: "Building system design intuition from first principles using relatable system examples",
        searchUrl: "https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design"
      },
      {
        channel: "Hussein Nasser",
        bestFor: "Deep java/python backend fundamentals, load proxies, database locks, and networking protocols",
        searchUrl: "https://www.youtube.com/@hnasr"
      }
    ],
    project: {
      title: "Microservices Capstone Case-Study with Sentry",
      description: "Decouple a resource feature into a separate service talking via RabbitMQ/Kafka, plug in Sentry error captures and Grafana monitoring, and write a system architecture design case-study README."
    }
  }
];
