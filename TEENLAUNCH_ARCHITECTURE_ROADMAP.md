# TeenLaunch World-Class Architecture Roadmap

This document outlines the three architectural pillars for transitioning TeenLaunch to a production-grade, highly intelligent platform.

---

## Pillar 1: Predictive Opportunity Engine (Vector-Based Intelligence)

Transitioning from basic keyword matches to **Semantic Search and Embeddings**.

### 1. Drizzle Schema Updates (pgvector integration)
Add `pgvector` to the PostgreSQL database to enable semantic similarity queries.

```typescript
// src/db/schema.ts updates
import { customType } from 'drizzle-orm/pg-core';

export const vector = customType<{ data: number[]; driverData: string }>({
  dataType() {
    return 'vector(768)'; // Matches text-embedding-004 dimensions
  },
  toDriver(value: number[]) {
    return JSON.stringify(value);
  },
});

export const opportunities = pgTable("opportunities", {
  // ... existing fields ...
  embedding: vector("embedding"), // Stores the opportunity embedding
});

export const academicProfiles = pgTable("academic_profiles", {
  // ... existing fields ...
  embedding: vector("embedding"), // Stores the student's profile embedding
});
```

### 2. Logic and Data Flow
- **Generation:** On `Opportunity` creation, we'll invoke the `text-embedding-004` model to generate a 768-dimensional vector based on the description, category, and eligibility criteria.
- **Search (Drizzle):** When a user requests opportunities, we use their `academicProfile.embedding` to perform a Cosine Similarity search.
  
```typescript
import { sql } from 'drizzle-orm';

// Example vector search logic
const results = await db
  .select()
  .from(opportunities)
  .orderBy(sql`${opportunities.embedding} <=> ${userProfile.embedding}`)
  .limit(5);
```

---

## Pillar 2: The 'Founder Mode' Goal Architecture

A completely new Career Milestones Engine, visualizing the user's progress toward high-level ambitions.

### 1. Database Schema Additions
```typescript
// src/db/schema.ts additions
export const careerGoals = pgTable("career_goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(), // e.g., 'Accepted to Ivy League'
  description: text("description"),
  targetDate: timestamp("target_date"),
  status: text("status").default("active"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: uuid("id").primaryKey().defaultRandom(),
  goalId: uuid("goal_id").references(() => careerGoals.id),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("pending"), // pending, in_progress, completed
  order: integer("order").notNull(),
  aiGenerated: boolean("ai_generated").default(true),
});
```

### 2. Implementation Flow & API Responses
- **`POST /api/goals`**: User submits a high-level goal. The AI Chain-of-Thought agent receives the goal, processes it through Gemini `ThinkingLevel.HIGH`, and breaks it down into 'Atomic Micro-Milestones'.
- **`GET /api/goals/topology`**: Returns the goal and related milestones as a graph-compatible JSON structure.
  
```json
{
  "goal": "Accepted to Ivy League CS Program",
  "nodes": [
    { "id": "m1", "title": "Maintain 4.0 GPA", "status": "in_progress" },
    { "id": "m2", "title": "Build Open Source Project", "status": "pending" },
    { "id": "m3", "title": "Win Regional Hackathon", "status": "completed" }
  ],
  "edges": [
    { "source": "m2", "target": "m3" }
  ]
}
```

---

## Pillar 3: High-Scale Infrastructure Resilience

Enhancements that protect the underlying compute, database, and AI resources.

### 1. TTL Caching (Implemented)
- Added `node-cache` (in-memory standard cache).
- Wrapped heavy aggregation endpoints (e.g., `/api/opportunities/stats`) in a 5-minute TTL to drastically reduce DB load.

### 2. Rate Limiting (Implemented)
- Configured `express-rate-limit` middleware on `/api/*` endpoints.
- Current setting limits each IP address to 200 requests per 15-minute window. This prevents scraping and protects API quota limits.

### 3. AI Circuit Breaker (Implemented)
- `AIProviderManager` tracks sequential failures (e.g. from rate limits or Gemini server downtime).
- Modified logic to bypass the `throw new Error()` when all endpoints are exhausted. The system will now gracefully degrade to return a `fallback: true` string representation, keeping the UI intact instead of breaking with a 500 status code.
