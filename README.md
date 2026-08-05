# 🚀 EngineerPath

**EngineerPath** is an AI-powered career guidance and roadmap execution platform built specifically for engineering students and fresh graduates. By combining profile personalization, interactive roadmaps generated on-demand by AI, a modular resource library of 291+ verified free learning resources, live LeetCode problem tracking, and mentor-guided study plans, the platform serves as a complete digital mentor to prepare users for modern SDE internships and placement roles.

---

## 🏗️ Tech Stack

This project is built using the **MERN Stack (MongoDB, Express, React, Node.js)**, completely modernized with end-to-end **TypeScript**.

### Frontend
- **Framework**: React 18 with TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS (custom modern glassmorphic and minimal white design systems)
- **State Management**: Zustand (with token persistence in `localStorage`)
- **Routing**: React Router DOM (enforcing protected/public route guards)
- **Icons & Animation**: Lucide React, Framer Motion, and Tailwind keyframes
- **HTTP Client**: Axios with interceptor-based authorization headers & token rotation

### Backend
- **Framework**: Express with TypeScript (running via Node.js)
- **Database**: MongoDB (mapped via Mongoose ODM)
- **AI Engine**: Google Gemini API (`gemini-2.0-flash` / `gemini-1.5-flash`) via the `@google/generative-ai` SDK
- **Automation & Scheduling**: `node-cron` weekly automated link health verifiers
- **Validation**: Zod (for payload and schema integrity verification)

---

## 📂 Project Architecture

```text
EngineerPath/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & resource library configuration
│   │   ├── constants/        # Single source of truth (careerPaths, resourceTypes)
│   │   ├── controllers/      # Route controllers (auth, user, roadmaps, dashboard, etc.)
│   │   ├── middlewares/      # JWT guards & error boundaries
│   │   ├── models/           # Mongoose schemas (User, Roadmap, LearningResource, etc.)
│   │   ├── resources/        # Modular Resource Library (291+ Curated Free Resources)
│   │   │   ├── languages/    # Java, Python, C++, JS, TS resources
│   │   │   ├── dsa/          # 20+ DSA topic modules (Arrays, Trees, Graphs, DP, etc.)
│   │   │   ├── web/          # Frontend & Backend Web Development
│   │   │   ├── cs/           # CS Fundamentals (OOP, DBMS, OS, CN)
│   │   │   ├── aptitude/     # Quant, Logical & Verbal Aptitude
│   │   │   ├── interview/    # Resume, STAR Behavioral, Mock Interviews
│   │   │   ├── tools/        # Git, Docker, Linux, AWS
│   │   │   └── projects/     # Full-Stack Capstone Projects
│   │   ├── routes/           # Router endpoints
│   │   ├── scripts/          # Audit scripts (verifyResourceLibrary.ts, testLanguageFiltering.ts)
│   │   ├── services/         # Roadmap Engine, Gemini AI & LeetCode GraphQL services
│   │   └── server.ts         # Express server entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Reusable UI components & clean white timeline accordion cards
│   │   ├── constants/        # Single source of truth (colleges, branches, careerPaths)
│   │   ├── pages/            # Views (Dashboard, ProfileSetup, Roadmap, Planner, etc.)
│   │   ├── store/            # Zustand authentication store
│   │   ├── services/         # Axios API connection endpoints
│   │   └── main.tsx          # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                     # Specifications and architectural blueprints
```

---

## 🌟 Key Features

1. **Redesigned Premium Onboarding (Profile Setup)**  
   Features searchable college autocomplete (100+ NIRF universities with live search filtering), engineering branch selection (20+ disciplines), target career path, semester, placement timeline, daily study hours pacing, and preferred DSA programming language (`Java`, `Python`, `C++`).

2. **Modular & Curated Free Resource Library (291+ Resources)**  
   Includes 291 audited, 100% FREE high-quality learning resources organized into modular domain files across Java, Python, C++, DSA (all 20+ major topics), Full-Stack Web Development, CS Core Fundamentals (OOP, DBMS, OS, CN), Aptitude, Tools, and Capstone Projects.

3. **Strict Language-Aware Resource Isolation**  
   The backend resource resolver enforces strict language boundaries matching `preferredDsaLanguage`. A Python learner is guaranteed to receive Python playlists, Python notes, and Python interview questions, with 0 conflicting language leaks (Java or C++).

4. **Mentor-Guided Learning Experience**  
   Presents ONE recommended primary video playlist (*Kunal Kushwaha Java*, *NeetCode Python*, or *Striver C++*), ONE primary documentation link, 5–10 capped practice problems, and 1 language-aware recommended DSA sheet (*⭐ Striver A2Z* for Java/C++, *⭐ NeetCode 150* for Python), while alternative playlists and secondary notes stay collapsed by default.

5. **Classic Minimal Timeline UI (Roadmap.sh & NeetCode Style)**  
   Presents a clean, content-first vertical timeline accordion layout (`bg-white border border-slate-200 shadow-sm rounded-2xl`) featuring short bullet learning objectives, study resources, practice problems, attached DSA sheets, interview questions, mini projects, revision guides, and a monthly checklist.

6. **Live LeetCode Profile Integration**  
   Fetches problem-solving statistics (`totalSolved`, `easySolved`, `mediumSolved`, `hardSolved`, `ranking`) directly from LeetCode's public GraphQL endpoint.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a remote MongoDB Atlas URI)
- Google Gemini API Key (optional; falls back gracefully to template engine if unset)

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

3. Configure your environment variables in `backend/.env`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/engineerpath
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Build backend and audit the resource library:
   ```bash
   npm run build
   npx ts-node src/scripts/verifyResourceLibrary.ts
   npx ts-node src/scripts/testLanguageFiltering.ts
   ```

5. Start the backend server:
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

---

## 📈 Platform Audit & Verification

- **Resource Library Audit**: `verifyResourceLibrary.ts` verifies 291 audited resources, 0 unwhitelisted duplicate URLs, and 100% multi-language coverage across Java, Python, and C++.
- **Language Isolation Audit**: `testLanguageFiltering.ts` verifies 100% language boundary isolation with 0 cross-language leaks.
- **Timeline Pacing Verifier**: `testTimelineSprints.ts` verifies dynamic sprint calculations across 3, 5, 6, 8, and 12-month roadmaps.
