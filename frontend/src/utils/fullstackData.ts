export interface FullstackMonth {
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

export const fullstackRoadmap: FullstackMonth[] = [
  {
    number: 1,
    title: 'Fullstack Web Foundations (HTML5, CSS3, JS & React)',
    focus: 'Modern Web Architecture, DOM, ES6+ & React UI Components',
    topics: [
      'HTML5 semantic markup, CSS Grid/Flexbox layouts & responsive design',
      'JavaScript ES6+ fundamentals, async/await & fetch API',
      'React component composition, state management & hooks',
      'Git version control, GitHub workflows & Vercel deployment'
    ],
    tools: ['React', 'TypeScript', 'TailwindCSS', 'Git', 'Vercel'],
    youtube: [
      {
        channel: 'Traversy Media',
        bestFor: 'Fullstack Web Development & React Tutorials',
        searchUrl: 'https://www.youtube.com/@TraversyMedia'
      },
      {
        channel: 'Web Dev Simplified',
        bestFor: 'React & Modern Frontend Architecture',
        searchUrl: 'https://www.youtube.com/@WebDevSimplified'
      }
    ],
    project: {
      title: 'Fullstack SaaS Landing Page & Dashboard UI',
      description: 'Build a responsive SaaS web application frontend integrated with interactive state and mock API endpoints.'
    }
  },
  {
    number: 2,
    title: 'Backend API Engineering & Database Systems',
    focus: 'Node.js, Express REST APIs, MongoDB & PostgreSQL Schemas',
    topics: [
      'Node.js runtime, event loop, asynchronous IO & Express framework',
      'RESTful API architecture design, middleware & request validation (Zod)',
      'Relational (PostgreSQL) vs NoSQL (MongoDB) database modeling & ORMs (Prisma/Mongoose)',
      'API documentation (Postman/Swagger) & error handling standards'
    ],
    tools: ['Node.js', 'Express', 'PostgreSQL', 'MongoDB', 'Prisma', 'Zod'],
    youtube: [
      {
        channel: 'Hussein Nasser',
        bestFor: 'Backend Engineering, Databases & Networking',
        searchUrl: 'https://www.youtube.com/@HusseinNasser-official'
      },
      {
        channel: 'Dave Gray',
        bestFor: 'Node.js & Express REST API Crash Courses',
        searchUrl: 'https://www.youtube.com/@DaveGrayTeachesCode'
      }
    ],
    project: {
      title: 'RESTful E-Commerce Microservice API',
      description: 'Construct a multi-endpoint Express REST API connected to MongoDB/PostgreSQL with order processing and product cataloging.'
    }
  },
  {
    number: 3,
    title: 'Authentication, OAuth2, JWT Security & Next.js Fullstack',
    focus: 'JWT Auth, OAuth2 Social Login, Next.js App Router & Server Actions',
    topics: [
      'User authentication mechanisms: Sessions vs JWT token rotation',
      'OAuth2 social integration (Google/GitHub authentication)',
      'Next.js App Router fullstack architecture & Server Actions',
      'Web security fundamentals: CORS, Rate Limiting, Helmet & CSRF protection'
    ],
    tools: ['Next.js', 'NextAuth / Auth.js', 'JWT', 'TypeScript', 'TailwindCSS'],
    youtube: [
      {
        channel: 'Antonio Erdeljac',
        bestFor: 'Fullstack Next.js 14 Projects & Auth Solutions',
        searchUrl: 'https://www.youtube.com/@codewithantonio'
      },
      {
        channel: 'Fireship',
        bestFor: 'Authentication & Security Quick Overviews',
        searchUrl: 'https://www.youtube.com/@Fireship'
      }
    ],
    project: {
      title: 'Authenticated Project Management SaaS App',
      description: 'Architect a fullstack Next.js project management application with Google OAuth, JWT protection, and workspace sharing.'
    }
  },
  {
    number: 4,
    title: 'State Management, Real-Time WebSockets & GraphQL APIs',
    focus: 'Socket.io Real-Time Engine, GraphQL Schemas & TanStack Query',
    topics: [
      'Real-time bidirectional communication using WebSockets & Socket.io',
      'GraphQL schema design, queries, mutations & Apollo Client',
      'Server-state management with TanStack Query (React Query)',
      'Optimistic UI updates, caching strategies & data synchronization'
    ],
    tools: ['Socket.io', 'GraphQL', 'Apollo Server', 'TanStack Query', 'Redis'],
    youtube: [
      {
        channel: 'Ben Awad',
        bestFor: 'Fullstack React, GraphQL & Node.js Architecture',
        searchUrl: 'https://www.youtube.com/@benawad97'
      },
      {
        channel: 'Web Dev Simplified',
        bestFor: 'WebSockets & Socket.io Complete Guide',
        searchUrl: 'https://www.youtube.com/@WebDevSimplified'
      }
    ],
    project: {
      title: 'Real-Time Collaborative Workspace & Chat App',
      description: 'Build a multi-room real-time collaborative workspace featuring live typing status, WebSocket messaging, and optimistic UI.'
    }
  },
  {
    number: 5,
    title: 'Containerization, Cloud Deployment & CI/CD Automation',
    focus: 'Docker, Docker Compose, AWS EC2/S3, Nginx & GitHub Actions',
    topics: [
      'Containerizing Node.js, React, and database services with Docker Compose',
      'Nginx reverse proxy configuration, SSL certificates (Certbot) & load balancing',
      'Cloud deployments on AWS (EC2, S3, RDS) or DigitalOcean',
      'Automated CI/CD workflows using GitHub Actions for build testing & deployment'
    ],
    tools: ['Docker', 'Docker Compose', 'AWS', 'Nginx', 'GitHub Actions'],
    youtube: [
      {
        channel: 'TechWorld with Nana',
        bestFor: 'Docker, Nginx & CI/CD Pipelines',
        searchUrl: 'https://www.youtube.com/@TechWorldwithNana'
      },
      {
        channel: 'DevOps Directive',
        bestFor: 'Cloud Infrastructure & AWS Deployment',
        searchUrl: 'https://www.youtube.com/@DevOpsDirective'
      }
    ],
    project: {
      title: 'Production Dockerized Fullstack Application Deployment',
      description: 'Deploy a multi-container fullstack app to AWS EC2 behind an Nginx reverse proxy with automated GitHub Actions CI/CD.'
    }
  },
  {
    number: 6,
    title: 'System Design, Microservices & Fullstack Capstone Project',
    focus: 'System Architecture, Scalability, Caching & Senior Portfolio',
    topics: [
      'High-level System Design: Load balancing, CDN, DB sharding & Redis caching',
      'Microservice communication, event buses & message queues (RabbitMQ/Kafka)',
      'Fullstack performance profiling, indexing optimization & security audits',
      'Senior capstone portfolio showcase & technical interview preparation'
    ],
    tools: ['Redis', 'RabbitMQ', 'System Design', 'Playwright', 'AWS'],
    youtube: [
      {
        channel: 'ByteByteGo',
        bestFor: 'System Design Fundamentals & Visual Architecture',
        searchUrl: 'https://www.youtube.com/@ByteByteGo'
      },
      {
        channel: 'Gaurav Sen',
        bestFor: 'System Design Interviews & Scalability',
        searchUrl: 'https://www.youtube.com/results?search_query=Gaurav+Sen+System+Design'
      }
    ],
    project: {
      title: 'Production-Grade Distributed SaaS Platform Capstone',
      description: 'Design, build, and deploy an enterprise-grade fullstack SaaS platform featuring background queue workers, Redis caching, and real-time alerts.'
    }
  }
];
