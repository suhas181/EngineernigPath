# 🚀 EngineerPath — AI Career Learning Platform

**EngineerPath** is a modern, premium **AI Career Learning Platform** built specifically for engineering students and fresh graduates. Moving beyond basic productivity planners or habit trackers, EngineerPath answers one fundamental question for aspiring engineers:

> *"What should I learn next to become my dream engineer?"*

By combining 8 structured role-based career curriculums, an 8-step guided topic learning flow, strict programming language isolation (`Java` | `Python` | `C++`), a SaaS collapsible navigation system, an audited library of 291+ curated free resources, and verified direct links to industry-trusted courses, EngineerPath serves as a digital mentor guiding users from beginner to job-ready engineer.

---

## 🏗️ Tech Stack

Built on a robust, type-safe **MERN Stack (MongoDB, Express, React, Node.js)** architecture:

### Frontend
- **Framework**: React 18 with TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS (custom Stripe/Vercel/Linear-inspired light canvas `#F8FAFC` & crisp white card design system)
- **State Management**: Zustand (with token and sidebar collapse state persistence in `localStorage`)
- **Routing**: React Router DOM (enforcing protected/public route guards)
- **Icons**: Lucide React icons
- **HTTP Client**: Axios with interceptor-based authorization & refresh token rotation

### Backend
- **Framework**: Express with TypeScript (running via Node.js)
- **Database**: MongoDB (mapped via Mongoose ODM)
- **Curriculum & AI Engine**: Dedicated 8-Role Blueprint Service (`curriculumService.ts`) & Google Gemini API (`@google/generative-ai`)
- **Automation & Scheduling**: `node-cron` automated weekly resource link health verifiers
- **Validation**: Zod (for payload and schema integrity verification)

---

## 📂 Project Architecture

```text
EngineerPath/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & configuration
│   │   ├── constants/        # Single source of truth (careerPaths, resourceTypes)
│   │   ├── controllers/      # Route controllers (auth, user, roadmaps, dashboard, etc.)
│   │   ├── middlewares/      # JWT guards & error boundaries
│   │   ├── models/           # Mongoose schemas (User, Roadmap, LearningResource, etc.)
│   │   ├── resources/        # Modular Resource Library (291+ Curated Free Resources)
│   │   │   ├── languages/    # Java, Python, C++, JS, TS resources
│   │   │   ├── dsa/          # 20+ DSA topic modules (Arrays, Trees, Graphs, DP, etc.)
│   │   │   ├── web/          # Frontend & Backend Web Development
│   │   │   ├── cs/           # CS Fundamentals (OOP, DBMS, OS, CN)
│   │   │   ├── interview/    # Resume, STAR Behavioral, Mock Interviews
│   │   │   ├── tools/        # Git, Docker, Linux, AWS
│   │   │   └── projects/     # Full-Stack Capstone Projects
│   │   ├── routes/           # Router endpoints
│   │   ├── scripts/          # Audit scripts (verifyResourceLibrary.ts, testLanguageFiltering.ts)
│   │   ├── services/         # Dynamic Curriculum Service (curriculumService.ts), Gemini AI & LeetCode GraphQL
│   │   └── server.ts         # Express server entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       
│   │   │   ├── learning/     # TopicLearningView.tsx (8-step guided flow) & CategoryCard.tsx
│   │   │   └── mosaic/       # SaaS Sidebar.tsx & MosaicShell.tsx (Light Canvas #F8FAFC)
│   │   ├── pages/            # Views (Dashboard, Roadmap, LearningHub, Projects, Resume, Settings)
│   │   ├── store/            # Zustand authentication store
│   │   ├── services/         # Axios API connection endpoints
│   │   └── main.tsx          # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                     # Specifications and architectural blueprints
```

---

## 🌟 Key Features & Highlights

### 1. 🎨 Modern SaaS Visual Hierarchy & Collapsible Navigation
- **Light SaaS Canvas (`#F8FAFC`)**: Crisp white cards (`#FFFFFF`), subtle borders (`border-slate-200`), and dark text typography (`text-slate-900`).
- **Collapsible Desktop Sidebar**: Icons-only default state (~76px) expanding smoothly to 256px on toggle. Remembers state via `localStorage` with hover tooltips.
- **Responsive Mobile Drawer**: Topbar with hamburger menu opening a slide-over backdrop-blurred navigation drawer.

### 2. 🎡 5-Second Auto-Rotating Hero Carousel
- Highlights 8 core engineering roles: **Software Engineer**, **Frontend Engineer**, **Backend Engineer**, **AI/ML Engineer**, **Flutter Developer**, **DevOps Engineer**, **Cybersecurity Engineer**, and **Data Analyst**.
- Features rich dark gradient card (`from-slate-950 via-slate-900 to-slate-950`), soft radial glows, 3D visual icons, skills tags, preparation durations, and average compensation benchmarks. Pause on hover enabled.

### 3. 🎯 8-Step Guided Topic Learning Flow (`TopicLearningView.tsx`)
Clicking any topic opens a dedicated, step-by-step guided view:
- **Step 1 — Primary Playlist**: ONE language-specific, 100% verified playlist (*Kunal Kushwaha Java*, *Corey Schafer Python*, *Striver C++*, *TechWorld with Nana DevOps*, *3Blue1Brown AI/ML*).
- **Step 2 — Official Documentation**: Direct official docs (*React.dev*, *Python.org*, *PyTorch.org*, *Docker Docs*, *Nodejs.org*).
- **Step 3 — Recommended Practice Sheet**: Language-specific DSA sheet (*⭐ Striver A2Z* for Java/C++, *⭐ NeetCode 150* for Python).
- **Step 4 — Curated Practice Problems**: Direct problem links with completion checkboxes.
- **Step 5 — Capstone Mini-Projects**: Real-world application challenges.
- **Step 6 — Interview Questions**: Curated top interview questions & answers.
- **Step 7 — Revision Notes & Cheat Sheets**: Quick reference sheets.
- **Step 8 — Complete Topic**: Marks progress and unlocks next topic.

### 4. 🔒 Strict Language-Aware Resource Isolation
The backend curriculum service enforces strict language boundaries matching the user's preferred language (`Java` | `Python` | `C++`). Python learners receive Python playlists, Python practice sheets, and Python interview questions without cross-language leaks.

### 5. 🛠️ Gap-Filler Tech Additions
- **Mobile Track**: Added Native Android (Google Android Developers + Philipp Lackner) & Native iOS (Sean Allen + CodeWithChris SwiftUI) alongside Flutter with platform choice guidance.
- **SDE Track**: Added NeetCode 150 & NeetCode Roadmap as video-walkthrough complement for DSA.
- **AI/ML Track**: Added Andrew Ng Machine Learning Specialization (Coursera / DeepLearning.AI Free Audit) as foundational entry point.
- **Data Analyst Track**: Added Kaggle Learn Interactive Micro-Courses.
- **DevOps Track**: Added KodeKloud Free Interactive Terminal Labs.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a remote MongoDB Atlas URI)
- Google Gemini API Key (optional; backend includes dynamic curriculum fallbacks)

---

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables in `backend/.env`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/engineerpath
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Audit the resource library and verify 0 broken links:
   ```bash
   npm run build
   npx ts-node src/scripts/verifyResourceLibrary.ts
   ```

5. Start the backend dev server:
   ```bash
   npm run dev
   ```

---

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📈 Platform Audit & Verification

- **Resource Library Health**: `verifyResourceLibrary.ts` verifies 291 audited resources, 0 unwhitelisted duplicate URLs, and 100% active 200 OK links across all 8 career tracks.
- **Language Isolation Audit**: Verifies 100% language boundary isolation with zero cross-language leaks.
- **Build Integrity**: Both frontend and backend compile cleanly with zero TypeScript errors.
