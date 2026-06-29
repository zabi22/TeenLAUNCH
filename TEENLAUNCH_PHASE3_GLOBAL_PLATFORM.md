# TeenLaunch Phase 3: Autonomous Global Platform (Architecture Plan)

This document outlines the technical architecture for transitioning TeenLaunch into an autonomous, intelligence-driven hub, prioritized by **Market Scalability** and competitive advantage for the next 6 months.

---

## 1. Employer & Mentor Connectivity (B2B Bridge) 
**Priority: 1 (Highest Market Scalability)**
*Why:* Creating a two-sided marketplace (students and recruiters) generates immediate revenue opportunities and establishes the platform as a direct pipeline to talent, forming a massive competitive moat against passive job boards.

### Action: Recruiter Portal & Digital Resume

#### Technical Implementation
**1. Schema: Verified Skills & Public Profiles**
```typescript
// src/db/schema.ts
export const publicProfiles = pgTable("public_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id").notNull().unique(), // Link to internal user
  slug: text("slug").notNull().unique(), // e.g., 'teenlaunch.com/p/jane-doe'
  headline: text("headline"),
  isDiscoverable: boolean("is_discoverable").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const verifiedSkills = pgTable("verified_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  profileId: uuid("profile_id").references(() => publicProfiles.id),
  skillName: text("skill_name").notNull(),
  verificationSource: text("verification_source"), // e.g., 'System Auth', 'Peer Review', 'Hackathon API'
  confidenceScore: integer("confidence_score").default(100), // AI/System determined
});
```

**2. Secure Token Exchange (Granular Access)**
To allow temporary access to private 'Proof-of-Work' without public exposure:
- When a student shares their portfolio with a recruiter, generate a short-lived JWT.
- Embed claims specifying access scope: `{ "portfolio_id": "123", "scopes": ["read:projects", "read:transcripts"] }`.
- Create a middleware `verifyShareToken` for the public-facing API routes that validates this JWT signature instead of standard Firebase Auth.

---

## 2. Autonomous Intelligence Data Pipeline
**Priority: 2 (High Market Scalability)**
*Why:* A self-updating, high-quality opportunity database is the core value proposition for students. If the platform has the best data automatically, it wins.

### Action: Automated Opportunity Sourcing

#### Technical Implementation
**1. Architecture: Scraper Workers & Validation**
- **Scraping Layer:** Deploy headless browsers (Playwright) orchestrated by BullMQ workers running on separate Node.js compute instances (e.g., Render Background Workers).
- **Ingestion Queue:** Scrapers push raw HTML/JSON into a Redis queue `raw_opportunities`.
- **AI Validation Layer:** A secondary BullMQ worker picks up raw data and passes it to Gemini 3.1 Pro (with `ThinkingLevel.HIGH`) to extract structured JSON (Title, Deadline, Eligibility, Categories).
- **Deduplication:** Generate an embedding of the extracted text using `text-embedding-004`. Perform a cosine similarity check against existing PostgreSQL `opportunities.embedding` (from Phase 1). If similarity > 0.95, it's a duplicate; otherwise, insert.

```typescript
// Example: Deduplication Logic in Worker
const isDuplicate = await db.execute(sql`
  SELECT id FROM opportunities 
  WHERE embedding <=> ${newEmbedding} < 0.05 
  LIMIT 1
`);
if (!isDuplicate.rows.length) {
  await db.insert(opportunities).values(newOpportunity);
}
```

---

## 3. Enterprise-Grade Security & Compliance
**Priority: 3 (Medium-High Market Scalability)**
*Why:* Essential for institutional adoption (schools, districts). Without FERPA/COPPA compliance and PII protection, B2B sales to educational institutions will stall.

### Action: PII Redaction & Data Sovereignty

#### Technical Implementation
**1. Middleware Layer: PII Scrubbing**
Before any user input is sent to external LLMs or logged, it must pass through a redaction service.
- Use a library like `pii-filter` or a local, lightweight NLP model (e.g., Microsoft Presidio via a microservice) to identify and mask names, emails, phone numbers, and locations.

```typescript
// src/middleware/piiRedactor.ts
export const redactPII = (text: string): string => {
  // Regex/NLP logic to replace "John Doe" with "[PERSON_NAME]"
  // Replace "john@email.com" with "[EMAIL]"
  return scrubbedText;
};

// In AIProviderManager.ts
const safePrompt = redactPII(userOriginalPrompt);
const aiResponse = await generateContent(safePrompt);
```

**2. Audit Logging:** Maintain an immutable append-only log of when PII was accessed and by which internal service, meeting compliance requirements.

---

## 4. The 'Generative UI' Engine
**Priority: 4 (Medium Market Scalability)**
*Why:* A magical UX, but complex to implement reliably. It's a retention driver rather than an acquisition driver.

### Action: Context-Aware Dashboard

#### Technical Implementation
**1. AI UI Output (JSON Config)**
Shift the dashboard from a static React template to a dynamic renderer. The AI evaluates the user's `careerGoals` and `milestones` state and outputs a JSON layout.

```json
// AI Output Example (Application Week)
{
  "layout": "urgent_focus",
  "components": [
    { "type": "DeadlineCountdown", "props": { "target": "2026-11-01", "label": "Early Action" } },
    { "type": "EssayReviewModule", "props": { "draftId": "d_123" } },
    { "type": "MetricCard", "hidden": true } // Hide general metrics
  ]
}
```

**2. Frontend Renderer**
In React, use a component mapping dictionary to render the AI's configuration dynamically:
```tsx
const ComponentMap = {
  DeadlineCountdown: DeadlineCountdownComponent,
  EssayReviewModule: EssayReviewComponent,
};

// Map over the AI's JSON array to render
{config.components.map(cmp => {
  const Component = ComponentMap[cmp.type];
  return !cmp.hidden && <Component key={cmp.type} {...cmp.props} />;
})}
```
