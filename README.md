# 🚀 EngineerPath

**EngineerPath** is a comprehensive, AI-powered career guidance platform designed specifically for engineering students and fresh graduates. By combining profile personalization, interactive roadmaps generated on-demand by AI, learning resource curation, and smart progress metrics, the platform serves as a complete digital mentor to prepare users for modern internships and engineering roles.

---

## 🏗️ Tech Stack

This project is built using the **MERN Stack (MongoDB, Express, React, Node.js)**, completely modernised with end-to-end **TypeScript**.

### Frontend
- **Framework**: React with TypeScript (powered by Vite)
- **Styling**: Tailwind CSS
- **State Management**: Zustand (with token persistence in `localStorage`)
- **Routing**: React Router DOM (enforcing private/protected route logic)
- **HTTP Client**: Axios with interceptor-based authorization headers

### Backend
- **Framework**: Express with TypeScript (running via Node.js)
- **Database**: MongoDB (mapped via Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens) & Passport.js configuration
- **AI Engine**: Google Gemini API (`gemini-1.5-flash`) via the `@google/generative-ai` SDK
- **Validation**: Zod (for payload and schema integrity verification)

---

## 📂 Project Architecture

```text
EngineerPath/
├── backend/                  # Express REST API
│   ├── src/
│   │   ├── config/           # DB connection & Passport configuration
│   │   ├── controllers/      # Route controllers (auth, roadmaps, etc.)
│   │   ├── middlewares/      # JWT guards & error boundaries
│   │   ├── models/           # Mongoose schemas (User, Roadmap, etc.)
│   │   ├── routes/           # Router prefix definitions
│   │   ├── services/         # Mail, upload, and Gemini AI services
│   │   └── server.ts         # Server setup & entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React UI Client
│   ├── src/
│   │   ├── components/       # Reusable components (Navbar, Layout, etc.)
│   │   ├── pages/            # View pages (Login, Dashboard, Roadmap, etc.)
│   │   ├── store/            # Zustand authentication store
│   │   ├── services/         # Axios API connection endpoints
│   │   └── main.tsx          # Client entry point
│   ├── package.json
│   ├── tailwind.config.js
│   └── tsconfig.json
└── docs/                     # Specifications and architectural blueprints
```

---

## 🌟 Key Features (MVP)

1. **AI-Powered Roadmap Generation**  
   Dynamically compiles step-by-step career path guides structured around a user's current semester, target career path (e.g., Frontend Developer), current skills, and personal interests. Includes a template-based fallback system for resilient local testing if the Gemini API key is offline.

2. **Cost-Safety & Idempotence**  
   Implements backend verification to ensure new AI requests are processed *only* when the user explicitly clicks regenerate, immediately serving cached roadmaps for subsequent fetches to minimize API overhead.

3. **Active Progress Tracking**  
   Recalculates completion stats dynamically. Users can toggle individual study resource checklist items or complete whole topics. Optimistic UI toggling ensures instant frontend responsiveness.

4. **Shared Navigation Layout**  
   Enforces a responsive Navbar across protected layouts (`Dashboard` and `Roadmap`) with synchronised logout actions across the auth store.

---

## ⚙️ Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or a remote cluster URI)
- Google Gemini API Key

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

3. Configure your environmental variables. Create a `.env` file in the `backend` directory using `.env.example` as a template:
   ```env
   PORT=5001
   MONGODB_URI=mongodb://localhost:27017/engineerpath
   JWT_SECRET=your_jwt_signing_key
   GEMINI_API_KEY=your_gemini_api_credential_key
   ```

4. Start the backend developer server:
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

## 📈 Roadmap & Future Enhancements
- **Secure Cookie Authentication**: Migrate auth token storage from `localStorage` to secure, HttpOnly cookies.
- **ATS Resume Analyzer**: Automated analyzer to estimate resume performance.
- **Interactive AI Mentor Chat**: On-demand chat guidance based on active roadmap steps.
- **Multi-Path Support**: Enable students to switch and track progress across multiple active roadmaps concurrently.
