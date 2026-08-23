# 🚀 EngineerPath — AI Career Learning & Internship Platform

**EngineerPath** is a modern, production-grade **AI Career Learning & Opportunity Discovery Platform** built specifically for engineering students, fresh graduates, and transitioning software professionals. Moving beyond basic habit trackers and generic roadmaps, EngineerPath solves two fundamental challenges for aspiring engineers:

> *"What structured path and verified resources should I follow to become job-ready in my dream domain, and where can I apply for verified, active engineering internships today?"*

By combining **8 deeply curated career tracks**, an **8-step guided topic learning system**, **strict programming language isolation** (`Java` | `Python` | `C++`), deep-linked role routing (`/roadmap?role=...`), an audited library of **291+ curated free resources**, and a **Live Adzuna-Powered Internship Discovery Platform**, EngineerPath acts as an end-to-end digital mentor from Day 1 to job offer.

---

## 🏗️ Architecture & Tech Stack

EngineerPath is architected on a type-safe, resilient **MERN Stack (MongoDB, Express, React, Node.js)** with TypeScript across the entire repository:

### Frontend
- **Framework**: React 18 + TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS with a clean Stripe/Vercel/Linear-inspired light canvas (`#F8FAFC`), crisp white cards (`#FFFFFF`), and refined typography
- **State Management**: Zustand with persistent storage (`localStorage`) for auth sessions, collapse state, and user preferences
- **Routing & Deep Linking**: React Router DOM with intelligent query parameter synchronization (`/roadmap?role=...`), fuzzy alias matching, and public/protected route boundaries
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with request/response interceptors for seamless JWT authentication

### Backend
- **Framework**: Express with TypeScript on Node.js
- **Database**: MongoDB via Mongoose ODM
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
│   │   ├── resources/              # Modular Resource Library (291+ Curated Free Resources)
│   │   ├── routes/                 # REST endpoints (/api/auth, /api/internships, /api/roadmaps, etc.)
│   │   ├── scripts/                # Database seeders and audit scripts
│   │   ├── services/               # Internship Service, Curriculum Service, Gemini AI & LeetCode GraphQL
│   │   └── server.ts               # Express application entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                       # React UI Client
│   ├── src/
│   │   ├── components/       
│   │   │   ├── dashboard/          # DashboardHero.tsx (auto-rotating role carousel), Header, Metrics
│   │   │   ├── internships/        # InternshipCard.tsx, FilterBar.tsx, InternshipDetailModal.tsx
│   │   │   ├── learning/           # TopicLearningView.tsx (8-step guided flow), CategoryCard.tsx
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
1. **Software Engineer (SDE)** — Core CS fundamentals, DSA, System Design, Multithreading & Database Internals.
2. **Full Stack Developer (2026 Industry Standard)** — Complete 8-category / 16-topic path covering TypeScript strict mode, React 19 architecture, Next.js 15 App Router (RSC & Server Actions), Node.js & Express REST APIs, PostgreSQL & Prisma ORM (ACID & indexing), Dual-token JWT security & OWASP API Top 10, Redis Cache-Aside & BullMQ queues, Vitest/Supertest/Playwright testing, Pino structured observability, Multi-stage Docker Compose, GitHub Actions CI/CD, and the flagship *CloudPulse* multi-tenant SaaS capstone.
3. **Frontend Engineer** — Modern HTML5/CSS3, React, TypeScript, Core Web Vitals, Next.js, TanStack Query, and State Architecture.
4. **Backend Engineer** — Node.js/Java/Python backends, REST/GraphQL/gRPC APIs, PostgreSQL, Distributed Caching, Message Queues & SQL/NoSQL databases.
5. **AI / ML Engineer** — Python numerical stack, Deep Learning (PyTorch/TensorFlow), LLMs, RAG Architectures & MLOps pipelines.
6. **Data Scientist / Analyst** — SQL, Pandas, NumPy, Exploratory Data Analysis, BI Dashboards (Tableau/PowerBI) & Statistical Modeling.
7. **DevOps & Cloud Engineer** — Linux internals, Docker, Kubernetes, CI/CD with GitHub Actions, Terraform & AWS/GCP Cloud Architecture.
8. **Mobile App Developer** — React Native, Flutter, Native Swift/Kotlin modules, offline-first SQLite databases & App Store deployment with Fastlane.
9. **Cybersecurity Engineer** — Network security, cryptography, OWASP Top 10, penetration testing, SIEM logging & cloud defense.

### 3. 🎯 8-Step Guided Topic Learning Flow (`TopicLearningView.tsx`)
Selecting any topic opens a focused 8-step learning journey:
- **Step 1 — Verified Primary Playlist**: Curated playlist matching the selected language/track (*Kunal Kushwaha Java*, *Corey Schafer Python*, *Striver C++*, *TechWorld with Nana DevOps*, *3Blue1Brown AI/ML*).
- **Step 2 — Official Documentation**: Direct references to official docs (*React.dev*, *Python.org*, *PyTorch.org*, *Docker Docs*, *Nodejs.org*).
- **Step 3 — Recommended Practice Sheet**: Language-specific DSA & engineering sheets (*⭐ Striver A2Z Sheet*, *⭐ NeetCode 150*, *Blind 75*).
- **Step 4 — Curated Practice Problems**: Direct problem links with interactive completion tracking.
- **Step 5 — Real-World Capstone Projects**: Practical challenges to build and add to portfolios.
- **Step 6 — Interview Questions**: Curated top technical and behavioral interview questions with solutions.
- **Step 7 — Revision Notes & Cheat Sheets**: Concise summary sheets for rapid recall before exams or interviews.
- **Step 8 — Complete Topic**: Marks progress on the user's dashboard and unlocks successive milestones.

### 4. 🔒 Strict Language-Aware Resource Isolation
- Curriculums and practice sheets dynamically adapt to the user's target language (`Java`, `Python`, or `C++`).
- Python learners receive Python DSA problems, Python interview questions, and Python playlists with zero cross-language pollution.
- Specialized tracks (e.g. Data Science, AI/ML, Cybersecurity) automatically lock into their domain standard (Python) for maximum relevance.

### 5. ⚡ URL Deep-Linking & Smart Hero Navigation
- **Role Deep Linking**: Navigate to `/roadmap?role=Frontend+Engineer` or `/roadmap?role=DevOps` with fuzzy alias recognition (`cyber`, `devops`, `fullstack`, `ai/ml`, `mobile`).
- **5-Second Rotating Hero Carousel**: Interactive Dashboard showcase highlighting each role's key skills, preparation duration, compensation metrics, and direct "Explore Roadmap" CTA.

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

### 1. Clone & Setup Repository

```bash
git clone https://github.com/suhas181/EngineernigPath.git
cd EngineernigPath
```

---

### 2. Backend Configuration & Launch

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and configure your `.env` file:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/engineerpath
   JWT_SECRET=your_super_secret_jwt_signing_key_here

   # Adzuna Job Search API
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key
   ADZUNA_COUNTRY=in

   # Optional Gemini AI API Key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Build and start the backend development server:
   ```bash
   npm run build
   npm run dev
   ```
   *The backend REST API will be available at [http://localhost:5001](http://localhost:5001).*

---

### 3. Frontend Configuration & Launch

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React client will launch at [http://localhost:5173](http://localhost:5173).*

---

## 🧪 Testing & Verification Scripts

The repository includes audit and health-check scripts to guarantee resource reliability:

```bash
# Verify 291+ curated free resources and link health
npx ts-node src/scripts/verifyResourceLibrary.ts

# Compile check across both workspaces
npm --prefix backend run build
npm --prefix frontend run build
```

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.
