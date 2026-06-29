# TeenLaunch Phase 2: Ecosystem Expansion (Technical Architecture)

This document outlines the architectural blueprints for the 'World-Class' ecosystem features, prioritized by their Impact vs. Complexity ratio.

---

## 1. Multi-Tenant 'Counselor/Parent' Portal (High Impact, Low-Medium Complexity)

**Impact:** Extremely high. Connecting students with their support networks (parents/counselors) drives engagement and accountability.
**Complexity:** Low-Medium. Requires RBAC (Role-Based Access Control) middleware and a simple relationship table.

### Database Schema Adjustments (Drizzle)
```typescript
import { pgTable, text, uuid, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { users } from './schema'; // Existing users table

export const roleEnum = pgEnum('role', ['student', 'parent', 'counselor', 'admin']);

// Add role to existing users table
// role: roleEnum("role").default("student")

export const userRelations = pgTable("user_relations", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: text("student_id").notNull(), // References Firebase UID
  observerId: text("observer_id").notNull(), // References Firebase UID (Parent/Counselor)
  relationType: text("relation_type").notNull(), // 'parent', 'counselor'
  status: text("status").default("pending"), // 'pending', 'active', 'rejected'
  createdAt: timestamp("created_at").defaultNow(),
});
```

### RBAC Middleware Implementation
Create a middleware to enforce read-only access for observers.

```typescript
// src/middleware/rbac.ts
export const requireStudentOrObserver = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const targetStudentId = req.params.studentId;
  const requestorId = req.user.uid;

  if (targetStudentId === requestorId) return next(); // User accessing their own data

  // Check if requestor is an active observer
  const relation = await db.select().from(userRelations).where(
    and(
      eq(userRelations.studentId, targetStudentId),
      eq(userRelations.observerId, requestorId),
      eq(userRelations.status, 'active')
    )
  ).limit(1);

  if (relation.length > 0 && req.method === 'GET') {
    return next(); // Allow read-only access
  }

  return res.status(403).json({ error: "Forbidden: Read-only access or no relation established." });
};
```

---

## 2. The 'Proof-of-Work' Social Graph (High Impact, High Complexity)

**Impact:** Very High. A robust verification and reputation system builds network effects and a strong moat against generic platforms.
**Complexity:** High. Requires complex database queries (recursive CTEs) and reputation algorithms.

### Database Schema Adjustments
```typescript
export const verifications = pgTable("verifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  entityType: text("entity_type").notNull(), // 'opportunity', 'milestone', 'project'
  entityId: text("entity_id").notNull(),
  proofUrl: text("proof_url"), // Link to GitHub, Certificate PDF, etc.
  status: text("status").default("pending"), // 'pending', 'verified', 'rejected'
  reputationPointsAwarded: integer("reputation_points_awarded").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const peerEndorsements = pgTable("peer_endorsements", {
  id: uuid("id").primaryKey().defaultRandom(),
  endorserId: text("endorser_id").notNull(),
  endorsedUserId: text("endorsed_user_id").notNull(),
  skillId: text("skill_id").notNull(),
  weight: integer("weight").default(1), // Scaled based on endorser's own reputation
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Graph Database Approach (Recursive CTEs)
To calculate 'Degrees of Separation', use Drizzle's `sql` template literal for a recursive CTE in PostgreSQL.

```typescript
// Example SQL structure for finding a connection path
const query = sql`
  WITH RECURSIVE connection_graph AS (
    SELECT endorser_id, endorsed_user_id, 1 as depth
    FROM peer_endorsements
    WHERE endorser_id = ${startingUserId}
    
    UNION ALL
    
    SELECT pe.endorser_id, pe.endorsed_user_id, cg.depth + 1
    FROM peer_endorsements pe
    INNER JOIN connection_graph cg ON pe.endorser_id = cg.endorsed_user_id
    WHERE cg.depth < 3
  )
  SELECT * FROM connection_graph WHERE endorsed_user_id = ${targetUserId};
`;
```

---

## 3. Adaptive UX & 'Flow State' Analytics (Medium Impact, Medium Complexity)

**Impact:** Medium-High. Improves retention by constantly refining the 'Smart Match' engine based on implicit signals.
**Complexity:** Medium. Involves high-throughput event ingestion and batch processing.

### Database Schema Adjustments
```typescript
export const telemetryEvents = pgTable("telemetry_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  eventType: text("event_type").notNull(), // 'opportunity_hover', 'opportunity_skip', 'roadmap_expand'
  entityId: text("entity_id"),
  metadata: jsonb("metadata"), // e.g., { durationMs: 4500 }
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Batch Processing Method
Instead of writing to the DB on every hover:
1. **Client-Side:** Batch events locally in memory or `localStorage`.
2. **Transport:** Send a chunk of events every 10 seconds via a background `fetch` or `navigator.sendBeacon`.
3. **Server-Side:** Use a lightweight message queue or an optimized bulk insert in Drizzle (`db.insert(telemetryEvents).values(eventBatch)`).
4. **Feedback Loop:** A nightly CRON job analyzes the telemetry, adjusts the user's `academicProfile.embedding` slightly closer to the embeddings of the opportunities they interact with most.

---

## 4. Agentic Lifecycle Orchestration (High Impact, Very High Complexity)

**Impact:** High. True autonomous capabilities differentiate the platform significantly.
**Complexity:** Very High. Demands resilient background workers, OAuth integrations, and robust error handling.

### Database Schema Adjustments
```typescript
export const agentTasks = pgTable("agent_tasks", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull(),
  taskType: text("task_type").notNull(), // 'draft_cover_letter', 'schedule_reminder'
  payload: jsonb("payload").notNull(), // Input data for the AI agent
  status: text("status").default("queued"), // 'queued', 'processing', 'completed', 'failed'
  resultUrl: text("result_url"), // Link to generated draft
  createdAt: timestamp("created_at").defaultNow(),
});
```

### Task Execution Queue Architecture
Do NOT run these long tasks on the main Express event loop.

1. **Queue Setup:** Implement **BullMQ** backed by **Redis**.
2. **Worker Process:** Create a separate Node.js worker process (`worker.ts`) that listens to the BullMQ queue.
3. **Execution:** 
   - Worker picks up a `draft_cover_letter` task.
   - Worker queries the user's saved 'Portfolio' from the DB.
   - Worker calls `generateContentManager` with Gemini in `ThinkingLevel.HIGH` to draft the content.
   - Worker updates the `agent_tasks` table with the result.
4. **Calendar Integration:** 
   - Integrate Google Calendar API via OAuth.
   - Store OAuth refresh tokens securely.
   - The worker uses the token to insert events/reminders directly into the user's calendar based on opportunity deadlines.
