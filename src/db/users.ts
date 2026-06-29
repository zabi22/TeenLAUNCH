import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string) {
  try {
    // 1. Check if user already exists
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }

    // 2. User is new! Generate a unique random username (adjective + noun + 4-digit number)
    const adjectives = ["swift", "clever", "brave", "bright", "bold", "eager", "kind", "calm", "noble", "sharp", "stellar", "epic", "vital", "grand", "lively", "prime", "astral", "zenith", "vibrant", "cosmic"];
    const nouns = ["pioneer", "innovator", "founder", "leader", "creator", "scout", "builder", "spark", "genius", "seeker", "visionary", "hero", "mentor", "champion", "spirit", "vanguard", "catalyst", "pathfinder", "dreamer", "maker"];
    
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const username = `${randomAdj}_${randomNoun}_${randomNum}`;

    // 3. Create the new user record in the database
    const result = await db.insert(users)
      .values({
        uid,
        email,
        name,
        username,
        onboardingComplete: false,
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error("Error in getOrCreateUser:", error);
    throw new Error("Failed to get or create user", { cause: error });
  }
}
