# 🚀 EngineerPath — AI Career Learning Platform

**EngineerPath** is a modern, premium **AI Career Learning & Opportunity Discovery Platform** built specifically for engineering students and fresh graduates. Moving beyond basic productivity planners or habit trackers, EngineerPath answers two fundamental questions for aspiring engineers:

> *"What should I learn next to become my dream engineer, and where can I apply for verified, active engineering internships today?"*

By combining 8 structured role-based career curriculums, an 8-step guided topic learning flow, strict programming language isolation (`Java` | `Python` | `C++`), a SaaS collapsible navigation system, an audited library of 291+ curated free resources, and a **Live Adzuna-Powered Internship Discovery Platform**, EngineerPath serves as a digital mentor guiding users from beginner to job-ready engineer.

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
- **Job & Internship Engine**: Extensible `JobSource` Architecture with live Adzuna Job Search API integration & compound deduplication (`source + externalId`)
- **Curriculum & AI Engine**: Dedicated 8-Role Blueprint Service (`curriculumService.ts`) & Google Gemini API (`@google/generative-ai`)
- **Automation & Scheduling**: `node-cron` automated 12-hour internship listing sync and weekly resource link health verifiers
- **Validation**: Zod (for payload and schema integrity verification)

---

## 📂 Project Architecture

```text
EngineerPath/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & configuration
│   │   ├── constants/        # Single source of truth (careerPaths, resourceTypes)
│   │   ├── controllers/      # Route controllers (auth, user, roadmaps, internships, dashboard, etc.)
│   │   ├── middlewares/      # JWT guards & error boundaries
│   │   ├── models/           # Mongoose schemas (User, Internship, Roadmap, LearningResource, etc.)
│   │   ├── resources/        # Modular Resource Library (291+ Curated Free Resources)
│   │   ├── routes/           # Router endpoints (/api/auth, /api/internships, /api/roadmaps, etc.)
│   │   ├── scripts/          # Audit & seed scripts (seedAdmin.ts, seedResources.ts, verifyResourceLibrary.ts)
│   │   ├── services/         # Internship Service (internshipService.ts), Curriculum Service, Gemini AI & LeetCode GraphQL
│   │   └── server.ts         # Express server entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       
│   │   │   ├── internships/  # InternshipCard.tsx & InternshipDetailModal.tsx
│   │   │   ├── learning/     # TopicLearningView.tsx (8-step guided flow) & CategoryCard.tsx
│   │   │   └── mosaic/       # SaaS Sidebar.tsx & MosaicShell.tsx (Light Canvas #F8FAFC)
│   │   ├── pages/            # Views (Dashboard, Internships, Roadmap, LearningHub, Resume, Settings)
│   │   ├── store/            # Zustand authentication store
│   │   ├── services/         # Axios API connection endpoints (internshipService.ts, api.ts)
│   │   └── main.tsx          # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                     # Specifications and architectural blueprints
```

---

## 🌟 Key Features & Highlights

### 1. 💼 Live Internship Discovery Platform (`/internships`)
- **Real Job Data**: Fetches verified engineering internships directly via the **Adzuna Job Search API**.
- **Search & Multi-Filter Engine**: Filter opportunities by Role (`Software Engineer`, `Frontend`, `Backend`, `AI/ML`, `Data Analyst`, `DevOps`, `Mobile`, `Cybersecurity`), Location (`Bangalore`, `Hyderabad`, `Pune`, `Mumbai`, `Delhi`, `Remote`), Work Mode (`Remote` vs `On-site/Hybrid`), Skills, and Keywords.
- **Rule-Based Profile Match (`🎯 Recommended Internships`)**: Dynamically prioritizes listings matched to the student's saved target role, preferred programming language, and core skill set with explanation tags (`✓ Matches your target role (Software Engineer)`).
- **Verified Status Tracking**: Displays verified listing timestamps (`lastCheckedAt`) and enforces status rules (`OPEN`, `CLOSED`, `UNKNOWN`).
- **Direct Application CTA**: **View & Apply →** links directly to official recruiter/company application pages (`target="_blank" rel="noopener noreferrer"`).
- **Bookmarking System**: Save interesting internships to user bookmarks for easy tracking across sessions.

### 2. 🎨 Modern SaaS Visual Hierarchy & Collapsible Navigation
- **Light SaaS Canvas (`#F8FAFC`)**: Crisp white cards (`#FFFFFF`), subtle borders (`border-slate-200`), and dark text typography (`text-slate-900`).
- **Collapsible Desktop Sidebar**: Icons-only default state (~76px) expanding smoothly to 256px on toggle. Remembers state via `localStorage` with hover tooltips.
- **Responsive Mobile Drawer**: Topbar with hamburger menu opening a slide-over backdrop-blurred navigation drawer.

### 3. 🎡 5-Second Auto-Rotating Hero Carousel
- Highlights 8 core engineering roles: **Software Engineer**, **Frontend Engineer**, **Backend Engineer**, **AI/ML Engineer**, **Flutter Developer**, **DevOps Engineer**, **Cybersecurity Engineer**, and **Data Analyst**.
- Features rich dark gradient card (`from-slate-950 via-slate-900 to-slate-950`), soft radial glows, 3D visual icons, skills tags, preparation durations, and average compensation benchmarks.

### 4. 🎯 8-Step Guided Topic Learning Flow (`TopicLearningView.tsx`)
Clicking any topic opens a dedicated, step-by-step guided view:
- **Step 1 — Primary Playlist**: ONE language-specific, 100% verified playlist (*Kunal Kushwaha Java*, *Corey Schafer Python*, *Striver C++*, *TechWorld with Nana DevOps*, *3Blue1Brown AI/ML*).
- **Step 2 — Official Documentation**: Direct official docs (*React.dev*, *Python.org*, *PyTorch.org*, *Docker Docs*, *Nodejs.org*).
- **Step 3 — Recommended Practice Sheet**: Language-specific DSA sheet (*⭐ Striver A2Z* for Java/C++, *⭐ NeetCode 150* for Python).
- **Step 4 — Curated Practice Problems**: Direct problem links with completion checkboxes.
- **Step 5 — Capstone Mini-Projects**: Real-world application challenges.
- **Step 6 — Interview Questions**: Curated top interview questions & answers.
- **Step 7 — Revision Notes & Cheat Sheets**: Quick reference sheets.
- **Step 8 — Complete Topic**: Marks progress and unlocks next topic.

### 5. 🔒 Strict Language-Aware Resource Isolation
The backend curriculum service enforces strict language boundaries matching the user's preferred language (`Java` | `Python` | `C++`). Python learners receive Python playlists, Python practice sheets, and Python interview questions without cross-language leaks.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a remote MongoDB Atlas URI)
- Adzuna Developer API Credentials (`ADZUNA_APP_ID`, `ADZUNA_APP_KEY`)
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

   # Adzuna Job Search API Config
   ADZUNA_APP_ID=your_adzuna_app_id
   ADZUNA_APP_KEY=your_adzuna_app_key
   ADZUNA_COUNTRY=in
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

- **Internship Discovery Engine**: Verified live Adzuna API integration, full search and pagination, compound deduplication (`source + externalId`), and direct external application URL links.
- **Resource Library Health**: `verifyResourceLibrary.ts` verifies 291 audited resources, 0 unwhitelisted duplicate URLs, and 100% active 200 OK links across all 8 career tracks.
- **Language Isolation Audit**: Verifies 100% language boundary isolation with zero cross-language leaks.
- **Build Integrity**: Both frontend and backend compile cleanly with zero TypeScript errors.
