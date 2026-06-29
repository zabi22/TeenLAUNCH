import { db } from "../db/index.ts";
import { notifications } from "../db/schema.ts";

export async function sendNotification(userId: number, actorId: number, type: string, postId?: number, commentId?: number) {
  return await db.insert(notifications).values({
    userId,
    actorId,
    type,
    postId: postId || null,
    commentId: commentId || null,
    isRead: false
  }).returning();
}
