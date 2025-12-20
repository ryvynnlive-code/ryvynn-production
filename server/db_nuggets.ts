import { eq, desc } from "drizzle-orm";
import { truthNuggets, users } from "../drizzle/schema";
import { getDb } from "./db";

/**
 * Create a new Truth Nugget
 */
export async function createTruthNugget(data: {
  userId: number;
  content: string;
  category?: string;
  journalEntryId?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(truthNuggets).values({
    userId: data.userId,
    content: data.content,
    category: data.category,
    journalEntryId: data.journalEntryId,
    savedToVault: false,
  });

  return result[0].insertId;
}

/**
 * Get user's Truth Nuggets
 */
export async function getUserTruthNuggets(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(truthNuggets)
    .where(eq(truthNuggets.userId, userId))
    .orderBy(desc(truthNuggets.createdAt))
    .limit(limit);
}

/**
 * Save nugget to vault
 */
export async function saveNuggetToVault(nuggetId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(truthNuggets)
    .set({
      savedToVault: true,
      savedAt: new Date(),
    })
    .where(eq(truthNuggets.id, nuggetId));
}

/**
 * Add XP to user's avatar
 */
export async function addAvatarXP(userId: number, xpAmount: number, reason: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // For now, we'll track XP via Soul Tokens
  // In future, could add separate avatarXP and avatarLevel fields
  await db.execute(
    `UPDATE users SET soulTokenBalance = soulTokenBalance + ${xpAmount} WHERE id = ${userId}`
  );

  return { xpAdded: xpAmount, reason };
}
