# 🚀 EngineerPath

**EngineerPath** is a comprehensive, AI-powered career guidance platform designed specifically for engineering students and fresh graduates. By combining profile personalization, interactive roadmaps generated on-demand by AI, curated verified resource databases, live LeetCode problem tracking, and smart progress metrics, the platform serves as a complete digital mentor to prepare users for modern internships and engineering roles.

---

## 🏗️ Tech Stack

This project is built using the **MERN Stack (MongoDB, Express, React, Node.js)**, completely modernized with end-to-end **TypeScript**.

### Frontend
- **Framework**: React 18 with TypeScript (powered by Vite)
- **Styling**: Vanilla CSS & Tailwind CSS (custom dark glassmorphic design system)
- **State Management**: Zustand (with token persistence in `localStorage`)
- **Routing**: React Router DOM (enforcing protected/public route guards)
- **Icons & Animation**: Lucide React, Framer Motion, and Tailwind keyframes
- **HTTP Client**: Axios with interceptor-based authorization headers & token rotation

### Backend
- **Framework**: Express with TypeScript (running via Node.js)
- **Database**: MongoDB (mapped via Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & OAuth Google integration
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
│   │   ├── routes/           # Router endpoints
│   │   ├── scripts/          # Database seeding (seedResources.ts) & link health checkers
│   │   ├── services/         # LeetCode GraphQL fetcher, Gemini AI & scheduler services
│   │   └── server.ts         # Express server entry point & cron setup
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Footer, RadialProgress, etc.)
│   │   ├── constants/        # Single source of truth (careerPaths, resourceTypes)
│   │   ├── pages/            # View pages (Login, Dashboard, ProfileSettings, Roadmap, etc.)
│   │   ├── store/            # Zustand authentication store
│   │   ├── services/         # Axios API connection endpoints
│   │   ├── utils/            # Static track curricula & profile helpers
│   │   └── main.tsx          # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                     # Specifications and architectural blueprints
```

---

## 🌟 Key Features

1. **AI-Powered & Resilient Roadmap Engine**  
   Dynamically compiles step-by-step 6-month career path guides structured around a user's current semester, target career path, skills, and interests. Uses a non-duplicating 6-month fallback curriculum engine for 100% unique monthly topics if API key limits are reached.

2. **Live LeetCode Profile Integration**  
   Fetches real problem-solving stats (`totalSolved`, `easySolved`, `mediumSolved`, `hardSolved`, `ranking`) directly from LeetCode's public GraphQL endpoint. Features a 6-hour per-user cache to prevent API rate limits, with manual force-sync buttons in Profile Settings.

3. **Curated & Verified Learning Resource Database**  
   Contains a seeded database of curated video, article, course, documentation, and practice resources for all 8 career paths. Integrates an automated HTTP link health checker and weekly `node-cron` job (`0 0 * * 0`) to mark broken links as unverified.

4. **Single Source of Truth System (`CANONICAL_CAREER_PATHS`)**  
   Centralized career path definitions across Onboarding (`ProfileSetup.tsx`), Profile Editor (`CompleteProfile.tsx`), Settings (`ProfileSettings.tsx`), Preset Roadmap Exploration Tabs (`RoadmapTabs.tsx`), Database Seed Data, and the Gemini Engine.

5. **Interactive Profile Settings & Suggestion Pills**  
   Interactive suggestion pills for Popular Skills and Popular Domains with active selection state (`✓`). Users can toggle pills or freely type custom comma-separated items.

6. **Dynamic Dashboard & Practical Mastery Score**  
   Calculates live Mastery Scores based on verified LeetCode solved problems and completed projects. Features interactive CTAs to link LeetCode handles if not yet connected.

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

3. Configure your environment variables. Create a `.env` file in `backend/`:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://127.0.0.1:27017/engineerpath
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. Build and seed the database:
   ```bash
   npm run build
   npx ts-node src/scripts/seedResources.ts
   ```

5. Start the backend server:
   ```bash
   npm run start
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

4. Open your browser at **http://localhost:5173**.

---

## 📈 Platform Capabilities
- **LeetCode Sync**: Real-time problem tracking driving user Mastery Scores.
- **Automated Resource Health Scheduler**: Background cron verifying external learning links weekly.
- **Unified Canonical Architecture**: 1-to-1 matching across career choices, Gemini prompts, and database queries.
