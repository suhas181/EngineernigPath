# 🚀 EngineerPath — AI Career Learning & Internship Platform

**EngineerPath** is a modern, production-grade **AI Career Learning & Opportunity Discovery Platform** built specifically for engineering students, fresh graduates, and transitioning software professionals. Moving beyond basic habit trackers and generic roadmaps, EngineerPath solves the fundamental challenges for aspiring engineers:

> *"What structured path and verified resources should I follow to become job-ready in my dream domain, and where can I apply for verified, active engineering internships today?"*

By combining **8 deeply curated career tracks**, a **7-step guided topic learning system**, **strict programming language isolation** (`Java` | `Python` | `C++`), an audited library of **curated free resources with verified working video links**, a **Live Adzuna-Powered Internship Discovery Engine**, an **ATS-Ready Resume Analyzer**, and a **Dynamic Recently Opened Resources Engine**, EngineerPath acts as an end-to-end digital mentor from Day 1 to job offer.

---

## 🏗️ Architecture & Tech Stack

EngineerPath is architected on a type-safe, resilient **MERN Stack (MongoDB, Express, React, Node.js)** with TypeScript across the entire repository:

### Frontend
- **Framework**: React 18 + TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS with a clean Mosaic Light Canvas (`#F8FAFC`), crisp cards (`#FFFFFF`), and refined typography (Inter, Outfit, Space Grotesk)
- **State Management**: Zustand with persistent storage (`localStorage`) for auth sessions, collapse state, and user preferences
- **Routing & Deep Linking**: React Router DOM with public student login (`/login`), separated admin route (`/admin/login`), query parameter synchronization (`/roadmaps?role=...`), and role-based route guards
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with interceptors for dual-token JWT authentication and error boundaries

### Backend
- **Framework**: Express with TypeScript on Node.js
- **Database**: MongoDB via Mongoose ODM (compatible with local MongoDB & MongoDB Atlas)
- **Job & Internship Engine**: Extensible `JobSource` architecture with live **Adzuna Job Search API** integration, automatic 12-hour cron scheduler, in-process mutex locking, and compound deduplication (`source + externalId`)
- **Activity & Resource Engine**: User-scoped `RecentResource` tracking with relative time computation and browser-scoped guest fallback
- **Resume Parser Engine**: In-memory multi-format extraction (`pdf-parse`, `mammoth`, `multer`) with keyword matching, quantifiable metric detection, and optional Google Gemini AI synthesis
- **Automation & Scheduling**: `node-cron` background task scheduler with singleton startup guards
- **Validation & Schemas**: Zod & Mongoose schemas ensuring strict payload integrity

---

## 📂 Project Structure

```text
EngineerPath/
├── backend/                        # Express REST API
│   ├── src/
│   │   ├── config/                 # DB connection & environment configuration
│   │   ├── constants/              # Central career paths, resource types & metadata
│   │   ├── controllers/            # Route handlers (auth, user, resources, internships, resume, admin)
│   │   ├── middlewares/            # JWT guards, upload handler, optional auth & error boundaries
│   │   ├── models/                 # Mongoose models (User, Internship, InternshipSyncLog, RecentResource, Resume)
│   │   ├── resources/              # Modular Resource Library (Curated Free Resources)
│   │   ├── routes/                 # REST endpoints (/api/auth, /api/internships, /api/resources, /api/resumes)
│   │   ├── scripts/                # Verification & automated test suites
│   │   ├── services/               # Internship Service, Cron Scheduler, Resume Pipeline, Gemini AI
│   │   └── server.ts               # Express application entry point & cron bootstrap
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # React UI Client
│   ├── src/
│   │   ├── components/       
│   │   │   ├── dashboard/          # DashboardHero.tsx, Metrics, Statistics
│   │   │   ├── internships/        # InternshipCard.tsx, FilterBar.tsx, InternshipDetailModal.tsx
│   │   │   ├── learning/           # TopicLearningView.tsx (7-step guided flow)
│   │   │   ├── mosaic/             # Responsive Sidebar.tsx & MosaicShell.tsx
│   │   │   └── roadmap/            # Roadmap cards, practice sheets, and timeline modules
│   │   ├── pages/                  # Views (Dashboard, Internships, Roadmaps, Resources, ResumeAnalyzer, Login, AdminLogin)
│   │   ├── store/                  # Zustand authentication & UI modal stores
│   │   ├── services/               # Axios API clients (internshipService, recentResourceService, api)
│   │   ├── utils/                  # Date & relative time formatters
│   │   └── main.tsx                # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── README.md
```

---

## 🌟 Core Features & Modules

### 1. 💼 Production Internship Discovery Engine (`/internships`)
- **Automated 12-Hour Backend Synchronization**: Uses `node-cron` (`0 */12 * * *`) with server startup bootstrap to keep opportunities refreshed automatically without human intervention.
- **Robust Failure Resilience**: External API timeouts or network outages preserve existing records intact and log status as `FAILED` in `InternshipSyncLog`.
- **Duplicate Protection**: Compound unique index `{ source: 1, externalId: 1 }` prevents duplicates and upserts listings idempotently.
- **Truthful Status Calculation**: Only authentic active postings are counted in "Open Now" statistics.
- **Student-Centric Interface**: Clean UI with freshness indicators (`Auto-synced • <Date>`) and zero administrative controls exposed to students.

### 2. ⚡ Dynamic Recently Opened Resources Engine
- **Activity-Driven History**: Resources are only recorded when a user actually clicks to study, solve, or open a resource.
- **User Privacy & Isolation**: Authenticated student history is stored strictly per user in MongoDB (`RecentResource`), preventing cross-user data leaks.
- **Browser-Scoped Guest Mode**: Logged-out guests have their recent activity safely isolated to browser `localStorage`.
- **Deduplication & Chronological Ordering**: Re-opening an existing resource updates its `lastOpenedAt` and moves it to the top (`DESC`).
- **Relative Time Badges**: Real timestamps formatted as `"Just now"`, `"5 minutes ago"`, `"2 hours ago"`, `"Yesterday"`, or `"3 days ago"`.
- **Clean Empty State**: If no resources have been accessed, displays an intuitive empty state with an *"Explore Learning Hub"* CTA.

### 3. 🔐 Secure Authentication & Role Separation
- **Public Student Portal (`/login`)**: Simple, clean student login and sign-up with no administrative tabs or buttons.
- **Dedicated Admin Portal (`/admin/login`)**: Separated administrative gateway with backend-enforced role verification.
- **Role Escalation Protection**: Public registration strictly assigns `role: 'student'` and ignores forged role overrides.

### 4. 📄 ATS Resume Analyzer (`/resume-analyzer`)
- **Real File Parsing**: In-memory text extraction for `.pdf` (via `pdf-parse`) and `.docx` (via `mammoth`).
- **Deterministic ATS Scoring**: Evaluates contact information, education, technical skills, quantifiable impact metrics, and project depth.
- **Gemini AI Synthesis**: Optional AI-powered section-by-section breakdown, keyword suggestions, and formatting recommendations.

### 5. 🗺️ 8 Comprehensive Career Roadmaps (`/roadmaps`)
Full end-to-end curriculum modules across 8 high-demand engineering specializations:
1. **Software Development Engineer (SDE)** — Core CS fundamentals (OS, DBMS, CN), DSA with language isolation (`Java`, `Python`, `C++`), System Design & Database Internals.
2. **Full Stack Developer** — TypeScript strict mode, React 19, Next.js 15 App Router, Node.js REST APIs, PostgreSQL & Prisma ORM, Dual-token JWT security, Redis & BullMQ, and Docker Compose.
3. **Frontend Engineer** — Modern HTML5/CSS3, React, TypeScript, Core Web Vitals, Next.js, TanStack Query, and State Architecture.
4. **Backend Engineer** — Node.js/Java/Python backends, REST/GraphQL/gRPC APIs, PostgreSQL, Distributed Caching & Message Queues.
5. **AI / ML Engineer** — Python numerical stack (NumPy/Pandas), Deep Learning (PyTorch/TensorFlow), LLMs, RAG Architectures & MLOps pipelines.
6. **Data Scientist / Analyst** — SQL, Pandas, NumPy, Exploratory Data Analysis, BI Dashboards & Statistical Modeling.
7. **DevOps & Cloud Engineer** — Linux internals, Docker, Kubernetes, CI/CD with GitHub Actions, Terraform & AWS/GCP Cloud Architecture.
8. **Mobile App Developer** — React Native, Flutter, Native Swift/Kotlin modules & App Store deployment with Fastlane.
9. **Cybersecurity Engineer** — Network security, cryptography, OWASP Top 10, penetration testing, SIEM logging & cloud defense.

### 6. 🎯 7-Step Guided Topic Learning Flow (`TopicLearningView.tsx`)
- **Step 1 — Verified Primary Playlist**: High-yield playlists curated for each track.
- **Step 2 — Official Documentation**: Authoritative references to official documentation.
- **Step 3 — Recommended Practice Sheet**: Structured DSA & engineering practice sheets.
- **Step 4 — Curated Practice Problems**: Direct coding exercises with status toggles.
- **Step 5 — Real-World Capstone Projects**: Practical portfolio projects.
- **Step 6 — High-Yield Interview Questions**: Top conceptual interview questions with solutions.
- **Step 7 — Revision Notes & Cheat Sheets**: Concise key takeaways and trap warnings.

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or later
- **npm**: v9.0.0 or later
- **MongoDB**: Local instance (`mongodb://127.0.0.1:27017`) or remote MongoDB Atlas connection string
- **Adzuna Developer API Credentials**: `ADZUNA_APP_ID` & `ADZUNA_APP_KEY` (Free tier from [Adzuna Developer Portal](https://developer.adzuna.com/))
- **Google Gemini API Key** *(Optional)*: For dynamic AI resume insights and topic synthesis

---

### 🚀 One-Command Local Development

You can run both the Frontend and Backend concurrently from the root directory:

```bash
# 1. Clone repository
git clone https://github.com/suhas181/EngineernigPath.git
cd EngineernigPath

# 2. Install dependencies
npm --prefix backend install
npm --prefix frontend install

# 3. Start development servers
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

## 🧪 Automated Test Suites

The repository contains comprehensive end-to-end automated test suites:

```bash
# 1. Authentication & Role Separation (10/10 Tests)
cd backend && npx ts-node src/scripts/testAuthSeparation.ts

# 2. Production Internship Auto-Sync (12/12 Tests)
cd backend && npx ts-node src/scripts/testInternshipAutoSync.ts

# 3. Dynamic Recently Opened Resources (15/15 Tests)
cd backend && npx ts-node src/scripts/testRecentResources.ts

# 4. Full Production Type & Build Verification
npm run build --prefix backend
npm run build --prefix frontend
```

---

## 📄 License

Distributed under the **MIT License**.
