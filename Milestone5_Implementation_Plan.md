# Milestone 5 Implementation Plan: Interactive SDE Timeline UI (Revised)

## Goal
Transform the Roadmap page into a premium interactive SDE timeline mentor dashboard. It will feature:
1. **Today's Focus Section**: Dynamic dashboard header highlighting current goals, next tasks, remaining problems, and estimated study hours.
2. **Today's Learning Path Card**: Highlights the exact order of today's prioritized tasks (resources, problems, or projects).
3. **Study Streak Tracker**: Displays current streak, longest streak, and weekly consistency metrics.
4. **Schedule Lag Detector**: Warns users if they fall behind schedule and displays a friendly action recommendation.
5. **Interactive Month Timelines**: Comprehensive monthly expansion cards exposing:
   - Why This Month
   - Learning Objectives
   - Weekly Study Plan (Progressively unlocked: Week N is unlocked only when all items in Week N-1 are completed)
   - Estimated Study Hours & Difficulty
   - Curated Resource Cards (Platform, Type, Title, Link, checked states)
   - Practice Problems List (difficulty badges, checkable states)
   - Project Submissions (Not Started, In Progress, and Completed states; inputs for GitHub & Live Demo appear only when In Progress or Completed)
   - Placement Readiness Breakdown: Current, After this month, Remaining, and Target.
6. **Weekly Review Modal Dialog**: A custom modal (no browser alerts) that prompts users to submit LeetCode additions, struggled topics, and trigger AI/Mock roadmap adaptivity.

---

## Architecture
The frontend React architecture will rely on local state updates, optimistic UI states during patches, and standard REST requests mapped to the updated endpoints.

---

## Components to Build / Redesign

### 1. `TodayFocusHeader`
* **Today's Goal**: Displays the active (first uncompleted) month's primary goal.
* **Next Task**: Scans the active month's uncompleted resources, problems, or projects in order, and provides a direct action link/button.
* **Remaining Problems**: Displays count of uncompleted practice problems in the active month.
* **Estimated Study Time**: Estimates remaining study hours based on the ratio of uncompleted items in the active month.

### 2. `StreakTrackerWidget`
* Renders a layout showing current streak (days), longest streak, and a visual 7-day consistency calendar.

### 3. `ScheduleLagAlert`
* Evaluates the days elapsed since the roadmap creation or last activity. If progress is lagging behind schedule, displays a warning card with recommendations.

### 4. `TimelineMonthCard`
* **Layout**: Collapsible cards featuring responsive grid layouts, custom SVG progress gauges, and visual progress meters.
* **Curated Resource Grid**: Maps resources to cards with platform, type icon, difficulty, and inline completion toggles.
* **Practice Problems List**: Checkable LeetCode problem lists with difficulty color tags.
* **Project Status Panel**: Shows status (Not Started / In Progress / Completed). Submissions for GitHub & Live Demo only display once started.
* **Placement Readiness Breakdown**: Shows Current, After this month, Remaining, and Target.
* **Hiding Empty Sections**: Ensures that if a month lacks practice problems or projects, those sections are hidden completely.
* **Progressive Unlock**: Exposes Week N content only when Week N-1 items are fully completed.

---

## Files to Modify

### 1. Frontend
- [Roadmap.tsx](file:///Users/suhashs/Documents/ENGIEERING%20PATH/frontend/src/pages/Roadmap.tsx): Completely redesigned to house the new timeline UI components, focus widgets, and weekly review dialog.
