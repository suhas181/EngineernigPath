export interface BackendMonth {
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

export const backendRoadmap: BackendMonth[] = [
  {
    number: 1,
    title: 'Server Architecture, Node.js Runtimes & RESTful API Design',
    focus: 'Node.js Event Loop, Express Architecture, REST Standards & Input Validation',
    topics: [
      'Node.js asynchronous runtime, event loop execution & thread pool',
      'REST API architectural principles, HTTP methods & status codes',
      'Express routing, middleware composition, request parsing & error handlers',
      'Data validation pipelines using Zod / Joi schemas'
    ],
    tools: ['Node.js', 'Express', 'TypeScript', 'Zod', 'Postman'],
    youtube: [
      {
        channel: 'Hussein Nasser',
        bestFor: 'Node.js Internals, Network Protocols & API Design',
        searchUrl: 'https://www.youtube.com/@HusseinNasser-official'
      },
      {
        channel: 'Dave Gray',
        bestFor: 'Express & Node.js REST API Masterclasses',
        searchUrl: 'https://www.youtube.com/@DaveGrayTeachesCode'
      }
    ],
    project: {
      title: 'Production RESTful API Microservice',
      description: 'Build a modular, fully validated Express REST API with global error handling, logging, and TypeScript interfaces.'
    }
  },
  {
    number: 2,
    title: 'Relational Databases, PostgreSQL Schemas & Indexing Optimization',
    focus: 'SQL Querying, PostgreSQL, Database Indexing, Transactions & ORMs',
    topics: [
      'Relational database modeling, ER diagrams, foreign keys & normalization (3NF)',
      'Advanced SQL: Inner/Outer joins, subqueries, group aggregations & window functions',
      'Database indexing (B-Tree, Hash), query EXPLAIN execution plans & performance tuning',
      'ACID transaction isolation levels & Prisma / TypeORM integration'
    ],
    tools: ['PostgreSQL', 'SQL', 'Prisma', 'pgAdmin', 'Docker'],
    youtube: [
      {
        channel: 'CMU Database Group',
        bestFor: 'Database Systems & Storage Engine Architecture',
        searchUrl: 'https://www.youtube.com/@CMUDatabaseGroup'
      },
      {
        channel: 'techTFQ',
        bestFor: 'Advanced SQL Querying & Joins Masterclass',
        searchUrl: 'https://www.youtube.com/@techTFQ'
      }
    ],
    project: {
      title: 'Scalable E-Commerce Relational Database Engine',
      description: 'Design a normalized PostgreSQL schema for e-commerce orders, write complex SQL aggregations, and optimize query indexing.'
    }
  },
  {
    number: 3,
    title: 'NoSQL Databases, MongoDB & Redis In-Memory Caching',
    focus: 'MongoDB Document Schemas, Aggregation Framework & Redis In-Memory Caching',
    topics: [
      'Document database modeling, embedding vs referencing in MongoDB',
      'MongoDB Aggregation Pipelines ($match, $group, $lookup, $unwind)',
      'In-memory caching architectures with Redis (LRU cache, key expiration, pub/sub)',
      'Database connection pooling & distributed data consistency'
    ],
    tools: ['MongoDB', 'Mongoose', 'Redis', 'Docker Compose'],
    youtube: [
      {
        channel: 'Traversy Media',
        bestFor: 'MongoDB & Redis Crash Courses',
        searchUrl: 'https://www.youtube.com/@TraversyMedia'
      },
      {
        channel: 'Fireship',
        bestFor: 'Redis Data Structures & In-Memory Patterns',
        searchUrl: 'https://www.youtube.com/@Fireship'
      }
    ],
    project: {
      title: 'High-Throughput Analytics API with Redis Cache Layer',
      description: 'Construct a MongoDB API endpoint cached with Redis to achieve under-10ms response times for high-volume analytics queries.'
    }
  },
  {
    number: 4,
    title: 'Event-Driven Architecture & Message Queues (RabbitMQ/Kafka)',
    focus: 'Asynchronous Workflows, Message Brokers, RabbitMQ & Distributed Tasks',
    topics: [
      'Event-driven architecture: Publisher/Subscriber & Producer/Consumer patterns',
      'Message brokers (RabbitMQ / Apache Kafka) vs synchronous HTTP requests',
      'Background task queues (BullMQ/Celery) for email processing & PDF generation',
      'Idempotency, message retry strategies, and dead letter queues (DLQ)'
    ],
    tools: ['RabbitMQ', 'Apache Kafka', 'BullMQ', 'Redis', 'Docker'],
    youtube: [
      {
        channel: 'Hussein Nasser',
        bestFor: 'RabbitMQ vs Kafka & Message Queue Architecture',
        searchUrl: 'https://www.youtube.com/@HusseinNasser-official'
      },
      {
        channel: 'ByteByteGo',
        bestFor: 'Message Queues & Event-Driven System Diagrams',
        searchUrl: 'https://www.youtube.com/@ByteByteGo'
      }
    ],
    project: {
      title: 'Asynchronous Job Processing Pipeline',
      description: 'Build a background job worker queue using RabbitMQ / BullMQ that processes media encoding and email notification tasks asynchronously.'
    }
  },
  {
    number: 5,
    title: 'Microservices, Docker Containerization & System Design',
    focus: 'Microservice Architectures, Docker Compose, API Gateway & Rate Limiting',
    topics: [
      'Monolith to Microservices decomposition strategy & domain-driven design',
      'Containerizing backend services with Docker & multi-stage builds',
      'API Gateway pattern (Kong/Nginx), JWT token verification & rate limiting',
      'Service discovery, gRPC inter-service communication & protocol buffers'
    ],
    tools: ['Docker', 'Microservices', 'gRPC', 'Nginx', 'System Design'],
    youtube: [
      {
        channel: 'TechWorld with Nana',
        bestFor: 'Docker, Microservices & Architecture',
        searchUrl: 'https://www.youtube.com/@TechWorldwithNana'
      },
      {
        channel: 'Gaurav Sen',
        bestFor: 'System Design & Distributed Microservices',
        searchUrl: 'https://www.youtube.com/results?search_query=Gaurav+Sen+Microservices'
      }
    ],
    project: {
      title: 'Dockerized Microservices Suite with API Gateway',
      description: 'Architect a 3-service microservice application connected via gRPC and Nginx API Gateway with rate limiting.'
    }
  },
  {
    number: 6,
    title: 'High Availability, Backend Security & Placement Interview Sprint',
    focus: 'Database Replication, Sharding, Security Hardening & Mock Interviews',
    topics: [
      'Database replication (Primary-Replica), failover & horizontal sharding',
      'Backend security: OWASP Top 10, SQL injection prevention, CORS, CSRF, rate limits',
      'Observability: Distributed tracing (Jaeger), Prometheus metrics & Grafana dashboards',
      'Senior backend system design mock interviews & portfolio code reviews'
    ],
    tools: ['Prometheus', 'Grafana', 'Security', 'System Design', 'PostgreSQL'],
    youtube: [
      {
        channel: 'ByteByteGo',
        bestFor: 'System Design Interview Preparation',
        searchUrl: 'https://www.youtube.com/@ByteByteGo'
      },
      {
        channel: 'ArjanCodes',
        bestFor: 'Backend Software Architecture & Clean Code Principles',
        searchUrl: 'https://www.youtube.com/@ArjanCodes'
      }
    ],
    project: {
      title: 'Enterprise Backend System Capstone',
      description: 'Architect a high-availability backend cluster complete with database replication, Prometheus monitoring, and security hardening.'
    }
  }
];
