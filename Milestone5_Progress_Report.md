# Milestone 5 Progress Report: Interactive SDE Timeline UI Redesign & Tab Integration

I have successfully resolved the merge conflicts, modularized the roadmap interface into 12 separate React components, extracted the API queries into a dedicated service layer, and successfully integrated the Static Career Tracks from the `main` branch. 

Both the frontend and backend compile cleanly with zero errors.

---

## 1. Architectural Improvements Added
- **Roadmap Service**: Created [roadmapService.ts](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/services/roadmapService.ts) to decouple Axios queries (`getRoadmap`, `generateRoadmap`, `toggleRoadmapItem`, `submitWeeklyReview`, `submitProjectLinks`) from the components.
- **Shared Types File**: Added [roadmap.types.ts](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/roadmap.types.ts) to house model interfaces.
- **Categorized Folders**: Structured sub-components inside `components/roadmap/` under four folders (`cards/`, `timeline/`, `modals/`, `tracks/`).

---

## 2. Components Created

### Global Controls
- **RoadmapHeader**: [RoadmapHeader.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/RoadmapHeader.tsx) — Displays descriptions, versions, tags, and the regenerate button.
- **RoadmapTabs**: [RoadmapTabs.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/RoadmapTabs.tsx) — Handles tab navigation switching between tabs.

### Cards Subfolder (`components/roadmap/cards/`)
- **TodayFocusCard**: [TodayFocusCard.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/TodayFocusCard.tsx) — Shows goals, next tasks, remaining problems, and hours left.
- **LearningPathCard**: [LearningPathCard.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/LearningPathCard.tsx) — Renders the priority task queue list.
- **StreakTracker**: [StreakTracker.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/StreakTracker.tsx) — Flame visual calendar.
- **ProgressSummary**: [ProgressSummary.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/ProgressSummary.tsx) — Overall/Lessons/Practice/Builds percentage grid.
- **ResourceCard**: [ResourceCard.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/ResourceCard.tsx) — Platform icon details and study links.
- **PracticeProblems**: [PracticeProblems.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/PracticeProblems.tsx) — Checkable Leetcode sheets.
- **MiniProjectCard**: [MiniProjectCard.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/cards/MiniProjectCard.tsx) — Capstone build submissions and URLs.

### Timeline Subfolder (`components/roadmap/timeline/`)
- **TimelineMonthCard**: [TimelineMonthCard.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/timeline/TimelineMonthCard.tsx) — Collapsible months with progressive locks.

### Modals Subfolder (`components/roadmap/modals/`)
- **WeeklyReviewModal**: [WeeklyReviewModal.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/modals/WeeklyReviewModal.tsx) — Log Leetcode additions and adapt schedule.

### Tracks Subfolder (`components/roadmap/tracks/`)
- **StaticTrackViewer**: [StaticTrackViewer.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/components/roadmap/tracks/StaticTrackViewer.tsx) — Standard curricula for AI Engineer and Data Scientist tracks (using localStorage persistence).

---

## 3. Files Modified
- **Frontend Orchestrator**:
  - [Roadmap.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/pages/Roadmap.tsx): Decoupled from direct API requests and refactored into a stateless orchestrator.
- **Static Data Copies**:
  - Checked out the [aiEngineerData.ts](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/utils/aiEngineerData.ts) and [dataScientistData.ts](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/utils/dataScientistData.ts) datasets from `main` to support the tabs locally.

---

## 4. Verification Performed
- **Typescript Compilation Sprints**:
  - Ran `npm run build` in `/backend` (Exit code: 0).
  - Ran `npm run build` in `/frontend` (Exit code: 0).
- All TypeScript compiler errors resolved.
