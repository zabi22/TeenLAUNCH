# TeenLaunch Project Summary

TeenLaunch is a high-intelligence, full-stack college readiness and career-building platform designed for ambitious high school and university students. The application streamlines student profiles, aggregates prestigious global and national opportunities, serves as an intelligent AI-driven strategic advisor, and tracks application pipelines with state-of-the-art interactive modules.

---

## 🌟 Executive Overview
TeenLaunch transforms how students plan, prepare, and apply for high-impact opportunities (scholarships, internships, competitions, research roles, and volunteer programs). By translating student achievements and academic profiles into a structured **Strategic Roadmap**, the platform calculates dynamic **AI Match Scores**, connects students with their **Digital Twin AI Coach**, and motivates continuous progress via a strictly authentic, real-user **National & Global Leaderboard**.

---

## 💻 Tech Stack & Engineering Architecture

The platform is designed with a full-stack architecture running inside sandboxed Cloud Run containers behind an Nginx reverse proxy routing to port `3000`.

### 1. Frontend
*   **Framework**: React (v19.0) with Vite (v6.2) for fast build times and compilation.
*   **Styling**: Tailwind CSS (v4.1) using `@import "tailwindcss"` for modern, modular styles.
*   **Routing**: Robust Single-Page Application (SPA) client-side routing via `react-router-dom` (v7.18).
*   **Animations**: Visually elegant transitions and micro-interactions powered by `motion/react` (v12.23).
*   **Icons**: Consistent vector assets from `lucide-react` (v0.546).

### 2. Backend Server
*   **Server Core**: Express (v4.21) running TypeScript natively in development using `tsx`.
*   **Production Bundler**: Bundled into a optimized CommonJS (`.cjs`) application using `esbuild` for rapid, container-friendly cold starts.
*   **Security & Controls**: Protected via `helmet` and standard Express rate limiters.

### 3. Database & Storage
*   **ORM**: Drizzle ORM (v0.45) for clean, type-safe SQL query generation.
*   **Relational Database**: PostgreSQL (configured via Drizzle and node-postgres `pg`).
*   **User Identity**: Firebase Authentication backed by `firebase-admin` (v14.1) on the server to verify user tokens securely.

### 4. Background Job & Automation Engine
*   **Message Broker**: BullMQ (v5.79) backed by `ioredis` (v5.11) managing background worker queues.
*   **Automated Intelligence**: `puppeteer` (v25.2) integrated for automated web research, pdf compilations, or document scanning.

### 5. Advanced AI Framework
*   **SDK**: Native `@google/genai` (v2.10.0) SDK to interface with Gemini models server-side.
*   **API Security**: All Gemini requests are proxied securely through `/api/*` routes, keeping the `GEMINI_API_KEY` entirely hidden from the browser console.

---

## 🎯 Core Application Modules

### 🗺️ Dashboard & AI Mentor
*   **Dynamic Landing**: Aggregates roadmap targets, pending applications, saved bookmarks, and matching opportunities.
*   **Digital Twin AI Coach (`AICoachChat`)**: A persistent chat companion powered by Gemini that reviews academic profiles and roadmaps, analyzes weaknesses, and suggests concrete leadership opportunities.
*   **Generative UI Core**: Dynamically renders rich interactive elements from AI responses.

### 🔍 Opportunity Discovery & Matching
*   **Tailored Discovery**: Dynamic searches across scholarships, hackathons, competitions, and research fellowships.
*   **Advanced Filtering**: Filter by country, eligibility criteria, remote/in-person status, program length, and compensation (paid vs. unpaid).
*   **AI Match Scoring**: Analyzes compatibility between the student's profile (skills, country, GPA, grade) and the program guidelines to output a percentage Match Score.

### 🏆 Authenticity-First Leaderboard
*   **Anti-NPC Safeguards**: Displays real user XP points earned via completed milestones, roadmap steps, and verified accomplishments. Fully removes simulated players or static fake entries.
*   **Interactive Toggles**: Filter by **National Rank** (regional country matching) and **Global Network**.
*   **Dynamic Podium**: Visualizes the crown holder (#1) and top competitors with fluid, custom enter animations.
*   **Weekly Quests**: Provides dynamic challenges to incentivize portfolio building.

### 📋 Portfolio Builder & Activity Tracker
*   **Milestone Logging**: Track and categorize extracurricular activities, athletic achievements, and AP exams.
*   **Strategic Roadmapping**: Map achievements across leadership, academic rigor, community impact, and creative innovation.

### ✍️ Advanced Application Modules
*   **Essay Assistant**: Draft, analyze, and refine college admissions essays.
*   **Interview Prep**: Conducts mock-interview cycles with standard/hard dynamic questions.
*   **Application Tracker**: Monitor deadlines and pipeline steps for submitted opportunities.
*   **Career Simulator**: Simulates roles to assist student direction mapping.

### 👥 Specialized Stakeholder Views
*   **Counselor Dashboard**: Multi-student tracking console displaying GPA metrics, target colleges, and warning alerts.
*   **Parent Dashboard**: Offers visibility into student application metrics, goals accomplished, and counselor communications.

---

## 🛠️ Folder & Directory Structure

```bash
├── server.ts                       # Full-stack entry point (Express, API routes, Vite middleware)
├── run_migration.ts                # Database migration initiator
├── metadata.json                   # App capabilities and permissions
├── package.json                    # Project scripts & dependency manifests
├── src/
│   ├── App.tsx                     # Core Client Router & Layout Integrations
│   ├── main.tsx                    # Client Bootstrapper
│   ├── index.css                   # Global styling importing Tailwind CSS
│   ├── worker.ts                   # BullMQ background tasks processor
│   ├── db/
│   │   ├── schema.ts               # Drizzle database schemas (users, opportunities, logs)
│   │   └── drizzle.config.ts       # Database migrations layout configuration
│   ├── lib/
│   │   └── utils.ts                # Tailwind merge and utility helper class definitions
│   ├── components/                 # Reusable layout UI components
│   │   ├── AuthContext.tsx         # Firebase auth provider state
│   │   ├── OpportunityCard.tsx     # Performance-memoized Opportunity card element
│   │   └── Dashboard/
│   │       └── AICoachChat.tsx     # Extracted and optimized AI Mentor chat interface
│   └── pages/                      # Unique page routing views (Dashboard, Leaderboard, etc.)
```

---

## ⚡ Performance Optimization Achievements

To ensure the interface responds instantly, even with complex data sets, the application utilizes strict React performance patterns:

1.  **React Memoization Primitives (`React.memo`)**:
    *   `OpportunityCard` is wrapped in `memo`, avoiding expensive re-renders when parent states change unless its direct props (such as bookmarks) are mutated.
    *   `AICoachChat` and dashboard sub-items are memoized to preserve component lifecycle scopes.
2.  **Referential Stability Helpers (`useCallback` / `useMemo`)**:
    *   **Filtering & Sorting**: Heavy operations in `/src/pages/Opportunities.tsx` and `/src/pages/Dashboard.tsx` are wrapped in `useMemo` hooks, keeping the computed lists cached until their dependencies (e.g., specific search filters, user profiles) change.
    *   **Event Handling**: Functions like `toggleBookmark` and `getMatchScore` are stabilized with `useCallback` to prevent child component re-renders caused by function instantiations.
