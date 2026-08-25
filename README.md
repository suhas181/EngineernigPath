# 🚀 EngineerPath — AI Career Learning & Internship Platform

**EngineerPath** is a modern, production-grade **AI Career Learning & Opportunity Discovery Platform** built specifically for engineering students, fresh graduates, and transitioning software professionals. Moving beyond basic habit trackers and generic roadmaps, EngineerPath solves two fundamental challenges for aspiring engineers:

> *"What structured path and verified resources should I follow to become job-ready in my dream domain, and where can I apply for verified, active engineering internships today?"*

By combining **8 deeply curated career tracks**, a **7-step guided topic learning system**, **strict programming language isolation** (`Java` | `Python` | `C++`), deep-linked role routing (`/roadmap?role=...`), an audited library of **290+ curated free resources with verified working video links**, and a **Live Adzuna-Powered Internship Discovery Platform**, EngineerPath acts as an end-to-end digital mentor from Day 1 to job offer.

---

## 🏗️ Architecture & Tech Stack

EngineerPath is architected on a type-safe, resilient **MERN Stack (MongoDB, Express, React, Node.js)** with TypeScript across the entire repository:

### Frontend
- **Framework**: React 18 + TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS with a clean Stripe/Vercel/Linear-inspired light canvas (`#F8FAFC`), crisp white cards (`#FFFFFF`), and refined typography (Inter, Outfit, Space Grotesk)
- **State Management**: Zustand with persistent storage (`localStorage`) for auth sessions, collapse state, and user preferences
- **Routing & Deep Linking**: React Router DOM with intelligent query parameter synchronization (`/roadmap?role=...`), fuzzy alias matching, and public/protected route boundaries
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with request/response interceptors for seamless JWT authentication and auto-refresh

### Backend
- **Framework**: Express with TypeScript on Node.js
- **Database**: MongoDB via Mongoose ODM (compatible with local MongoDB & MongoDB Atlas)
- **Job & Internship Engine**: Extensible `JobSource` architecture with live **Adzuna Job Search API** integration, auto-sync crons, and compound deduplication (`source + externalId`)
- **Curriculum & AI Engine**: Dedicated 8-Role Blueprint Service (`curriculumService.ts`) with smart language isolation + Google Gemini API (`@google/generative-ai`)
- **Automation & Scheduling**: `node-cron` scheduled background workers for 12-hour internship listing synchronization and link health audits
- **Validation & Schemas**: Zod & Mongoose schemas ensuring strict payload integrity

---

## 📂 Project Structure

```text
EngineerPath/
├── backend/                        # Express REST API
│   ├── src/
│   │   ├── config/                 # DB connection & environment configuration
│   │   ├── constants/              # Central career paths, resource types & metadata
│   │   ├── controllers/            # Route handlers (auth, user, roadmaps, internships, dashboard, etc.)
│   │   ├── middlewares/            # JWT guards, optional auth & error boundaries
│   │   ├── models/                 # Mongoose models (User, Internship, Roadmap, LearningResource, etc.)
│   │   ├── resources/              # Modular Resource Library (290+ Curated Free Resources)
│   │   │   ├── cs/                 # CS Core (OS, DBMS, Computer Networks, System Design)
│   │   │   ├── dsa/                # DSA Sheets, Algorithms, Arrays, Trees, DP
│   │   │   ├── languages/          # Java, Python, C++, JavaScript
│   │   │   ├── web/                # Frontend, Backend, Full Stack
│   │   │   └── data/               # AI/ML, Data Science, DevOps, Mobile, Security
│   │   ├── routes/                 # REST endpoints (/api/auth, /api/internships, /api/roadmaps, etc.)
│   │   ├── scripts/                # Database seeders, link verifiers, and audit scripts
│   │   ├── services/               # Internship Service, Curriculum Service, Gemini AI & LeetCode GraphQL
│   │   └── server.ts               # Express application entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # React UI Client
│   ├── src/
│   │   ├── components/       
│   │   │   ├── dashboard/          # DashboardHero.tsx (auto-rotating role carousel), Header, Metrics
│   │   │   ├── internships/        # InternshipCard.tsx, FilterBar.tsx, InternshipDetailModal.tsx
│   │   │   ├── learning/           # TopicLearningView.tsx (7-step guided flow), CategoryCard.tsx
│   │   │   ├── mosaic/             # Responsive Sidebar.tsx & MosaicShell.tsx (Light Canvas #F8FAFC)
│   │   │   └── roadmap/            # Interactive roadmap modules & timeline visualizations
│   │   ├── pages/                  # Views (Dashboard, Internships, Roadmap, LearningHub, Resume, Settings)
│   │   ├── store/                  # Zustand authentication & UI state stores
│   │   ├── services/               # Axios API clients & service layers
│   │   └── main.tsx                # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                           # Architectural blueprints & implementation reports
```

---

## 🌟 Core Features & Modules

### 1. 💼 Live Internship Discovery Engine (`/internships`)
- **Live Adzuna Integration**: Real-time aggregation of active engineering internships across major tech hubs (*Bangalore*, *Hyderabad*, *Pune*, *Mumbai*, *Delhi NCR*, *Remote*).
- **Multi-Dimensional Filters**: Filter by role, location, remote/on-site work mode, company, and minimum stipend.
- **Personalized Rule-Based Recommendations**: Automatically ranks and surfaces listings matching the user's selected career target, preferred programming language, and key technical skills.
- **Direct Application CTA**: External deep links leading directly to authentic employer job listings.
- **Bookmarking & Tracking**: Save listings with persistent bookmark state to monitor application pipelines.

### 2. 🗺️ 8 Comprehensive Career Roadmaps (`/roadmap`)
Full end-to-end curriculum modules across 8 high-demand engineering specializations:
1. **Software Development Engineer (SDE)** — Core CS fundamentals (OS, DBMS, CN), DSA with language isolation (`Java`, `Python`, `C++`), System Design, Multithreading & Database Internals.
2. **Full Stack Developer (2026 Industry Standard)** — Complete 8-category / 16-topic path covering TypeScript strict mode, React 19 architecture, Next.js 15 App Router (RSC & Server Actions), Node.js & Express REST APIs, PostgreSQL & Prisma ORM (ACID & indexing), Dual-token JWT security & OWASP API Top 10, Redis Cache-Aside & BullMQ queues, Vitest/Supertest/Playwright testing, Pino structured observability, Multi-stage Docker Compose, GitHub Actions CI/CD, and the flagship *CloudPulse* multi-tenant SaaS capstone.
3. **Frontend Engineer** — Modern HTML5/CSS3, React, TypeScript, Core Web Vitals, Next.js, TanStack Query, and State Architecture.
4. **Backend Engineer** — Node.js/Java/Python backends, REST/GraphQL/gRPC APIs, PostgreSQL, Distributed Caching, Message Queues & SQL/NoSQL databases.
5. **AI / ML Engineer** — Python numerical stack (NumPy/Pandas), Deep Learning (PyTorch/TensorFlow), LLMs, RAG Architectures & MLOps pipelines.
6. **Data Scientist / Analyst** — SQL, Pandas, NumPy, Exploratory Data Analysis, BI Dashboards (Tableau/PowerBI) & Statistical Modeling.
7. **DevOps & Cloud Engineer** — Linux internals, Docker, Kubernetes, CI/CD with GitHub Actions, Terraform & AWS/GCP Cloud Architecture.
8. **Mobile App Developer** — React Native, Flutter, Native Swift/Kotlin modules, offline-first SQLite databases & App Store deployment with Fastlane.
9. **Cybersecurity Engineer** — Network security, cryptography, OWASP Top 10, penetration testing, SIEM logging & cloud defense.

### 3. 🎯 7-Step Guided Topic Learning Flow (`TopicLearningView.tsx`)
Selecting any topic opens a focused 7-step learning journey:
- **Step 1 — Verified Primary Playlist**: Audited high-yield playlists matching the selected language/track (*Kunal Kushwaha Java*, *Corey Schafer Python*, *Striver C++*, *TechWorld with Nana DevOps*, *3Blue1Brown AI/ML*, *Keith Galli Pandas*).
- **Step 2 — Official Documentation**: Direct references to official documentation (*React.dev*, *Python.org*, *PyTorch.org*, *Docker Docs*, *Nodejs.org*, *PostgreSQL Docs*).
- **Step 3 — Recommended Practice Sheet**: Language-specific DSA & engineering sheets (*⭐ Striver A2Z Sheet*, *⭐ NeetCode 150*, *Blind 75*).
- **Step 4 — Curated Practice Problems**: Direct problem links with interactive completion tracking.
- **Step 5 — Real-World Capstone Projects**: Practical engineering challenges to build and add to portfolios.
- **Step 6 — High-Yield Interview Questions**: Curated top technical and architectural interview questions with solutions.
- **Step 7 — Revision Notes & Cheat Sheets**: Concise key takeaways and trap warnings for rapid recall.

### 4. 🔒 Strict Language-Aware Resource Isolation
- Curriculums and practice sheets dynamically adapt to the user's target language (`Java`, `Python`, or `C++`).
- Python learners receive Python DSA problems, Python interview questions, and Python playlists with zero cross-language pollution.
- Specialized tracks (e.g. Data Science, AI/ML, Cybersecurity) automatically lock into their domain standard (Python) for maximum relevance.

### 5. ⚡ URL Deep-Linking & Smart Hero Navigation
- **Role Deep Linking**: Navigate directly to `/roadmap?role=Frontend+Engineer` or `/roadmap?role=DevOps` with fuzzy alias recognition (`cyber`, `devops`, `fullstack`, `ai/ml`, `mobile`).
- **Rotating Hero Carousel**: Interactive Dashboard showcase highlighting each role's key skills, preparation duration, compensation metrics, and direct "Explore Roadmap" CTA.

### 6. 🛠️ Direct Access Engineering Tools
- **AI Resume Analyzer**: Review resume fit against targeted engineering job descriptions with instant ATS scoring and gap analysis.
- **Profile & Settings**: Manage career track preferences, preferred programming language, target graduation year, and UI customization.

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

# 2. Install all dependencies
npm --prefix backend install
npm --prefix frontend install

# 3. Start both backend (port 5001) and frontend (port 5173)
npm run dev
```

- **Frontend Client**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5001/api](http://localhost:5001/api)
- **Health Check**: [http://localhost:5001/health](http://localhost:5001/health)

---

### Standalone Backend / Frontend Setup

#### Backend Setup
```bash
cd backend
npm install
npm run build
npm run dev
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Testing & Verification Scripts

The repository includes audit and health-check scripts to guarantee resource reliability:

```bash
# Verify curated free resources and link health
npx ts-node src/scripts/verifyResourceLibrary.ts

# Audit SDE Curriculum and verified playlists
npx ts-node src/scripts/auditSdeCurriculum.ts

# Compile check across both workspaces
npm run build
```

---

## 📄 License

Distributed under the **MIT License**.
