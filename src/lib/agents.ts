import { db } from "../db/index.ts";
import { agentTasks, drafts } from "../db/schema.ts";
import { eq } from "drizzle-orm";

export async function executeAgentTask(userId: number, type: string, payload: any) {
  // 1. Log task
  const [task] = await db.insert(agentTasks).values({
    userId,
    type,
    status: 'processing',
    payload
  }).returning();

  // 2. Queue in BullMQ (Logic to call a BullMQ worker)
  // For now, return the task
  return task;
}

export async function saveDraft(userId: number, opportunityId: number, type: string, content: string) {
  return await db.insert(drafts).values({
    userId,
    opportunityId,
    type,
    content,
    aiModelUsed: 'gemini-3.1-pro'
  }).returning();
}
