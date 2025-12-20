import { eq, and, desc, gte, lte, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  scribeResponses,
  InsertScribeResponse,
  journalEntries,
  InsertJournalEntry,
  dailyRituals,
  InsertDailyRitual,
  soulTokenTransactions,
  InsertSoulTokenTransaction,
  impactPool,
  crisisResources,
  waitlist,
  InsertWaitlist,
  referrals,
  InsertReferral,
  milestones,
  therapistSharedData,
  InsertTherapistSharedData,
  organizations,
  familyCircles,
  familyCircleMembers,
  waitlistSignups,
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER MANAGEMENT
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return null;

  await db.update(users).set(updates).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function updateUserLastActive(userId: number) {
  const db = await getDb();
  if (!db) return;

  await db.update(users).set({ lastActiveAt: new Date() }).where(eq(users.id, userId));
}

// ============================================================================
// SCRIBE RESPONSES & MIRACLE FEED
// ============================================================================

export async function createScribeResponse(response: InsertScribeResponse) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(scribeResponses).values(response);
  return true;
}

export async function getMiracleFeed(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(scribeResponses)
    .where(eq(scribeResponses.publishedToFeed, true))
    .orderBy(desc(scribeResponses.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getScribeResponseById(id: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(scribeResponses).where(eq(scribeResponses.id, id)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getPublicFeedItems(limit: number = 12) {
  const db = await getDb();
  if (!db) return [];

  // Get items that have both valence and userVoice populated
  return db
    .select()
    .from(scribeResponses)
    .where(
      and(
        eq(scribeResponses.publishedToFeed, true),
        sql`${scribeResponses.valence} IS NOT NULL`,
        sql`${scribeResponses.userVoice} IS NOT NULL`
      )
    )
    .orderBy(desc(scribeResponses.createdAt))
    .limit(limit * 2); // Get more items to ensure we can balance valence
}

// ============================================================================
// JOURNAL ENTRIES
// ============================================================================

export async function createJournalEntry(entry: InsertJournalEntry) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(journalEntries).values(entry);
  return Number(result[0].insertId);
}

export async function getUserJournalEntries(userId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.createdAt))
    .limit(limit)
    .offset(offset);
}

export async function getJournalEntryById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(journalEntries)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function updateJournalEntry(id: number, userId: number, updates: Partial<InsertJournalEntry>) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(journalEntries)
    .set(updates)
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  
  return getJournalEntryById(id, userId);
}

export async function deleteJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
  return true;
}

// ============================================================================
// DAILY RITUALS
// ============================================================================

export async function getDailyRitual(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(dailyRituals)
    .where(and(eq(dailyRituals.userId, userId), eq(dailyRituals.date, date)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function upsertDailyRitual(userId: number, date: string, updates: Partial<InsertDailyRitual>) {
  const db = await getDb();
  if (!db) return null;

  const existing = await getDailyRitual(userId, date);
  
  if (existing) {
    await db
      .update(dailyRituals)
      .set(updates)
      .where(and(eq(dailyRituals.userId, userId), eq(dailyRituals.date, date)));
  } else {
    await db.insert(dailyRituals).values({
      userId,
      date,
      ...updates,
    });
  }
  
  return getDailyRitual(userId, date);
}

export async function getUserStreak(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const result = await db
    .select()
    .from(dailyRituals)
    .where(eq(dailyRituals.userId, userId))
    .orderBy(desc(dailyRituals.date))
    .limit(1);
  
  return result.length > 0 ? result[0].streakCount : 0;
}

// ============================================================================
// SOUL TOKENS
// ============================================================================

export async function addSoulTokens(
  userId: number,
  amount: number,
  type: "earned" | "donated" | "bonus" | "referral",
  source: string,
  description?: string
) {
  const db = await getDb();
  if (!db) return null;

  // Get current balance
  const user = await getUserById(userId);
  if (!user) return null;

  const newBalance = user.soulTokenBalance + amount;

  // Update user balance
  await db.update(users).set({ soulTokenBalance: newBalance }).where(eq(users.id, userId));

  // Record transaction
  await db.insert(soulTokenTransactions).values({
    userId,
    type,
    amount,
    source,
    description,
    balanceAfter: newBalance,
  });

  return true;
}

export async function getUserSoulTokenBalance(userId: number) {
  const db = await getDb();
  if (!db) return 0;

  const user = await getUserById(userId);
  return user?.soulTokenBalance ?? 0;
}

export async function getUserSoulTokenHistory(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(soulTokenTransactions)
    .where(eq(soulTokenTransactions.userId, userId))
    .orderBy(desc(soulTokenTransactions.createdAt))
    .limit(limit);
}

export async function donateSoulTokens(userId: number, amount: number) {
  const db = await getDb();
  if (!db) return null;

  const user = await getUserById(userId);
  if (!user || user.soulTokenBalance < amount) {
    throw new Error("Insufficient Soul Token balance");
  }

  // Deduct from user
  await addSoulTokens(userId, -amount, "donated", "impact_pool_donation", `Donated ${amount} tokens to impact pool`);

  // Add to impact pool (get current period or create new one)
  const currentPeriod = await getCurrentImpactPeriod();
  if (currentPeriod) {
    await db
      .update(impactPool)
      .set({
        totalTokensDonated: sql`${impactPool.totalTokensDonated} + ${amount}`,
      })
      .where(eq(impactPool.id, currentPeriod.id));
  }

  return true;
}

async function getCurrentImpactPeriod() {
  const db = await getDb();
  if (!db) return null;

  const now = new Date();
  const result = await db
    .select()
    .from(impactPool)
    .where(and(lte(impactPool.periodStart, now), gte(impactPool.periodEnd, now)))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export async function getCrisisResourcesByCountry(country: string) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(crisisResources)
    .where(and(eq(crisisResources.country, country), eq(crisisResources.isActive, true)))
    .orderBy(crisisResources.type);
}

export async function getAllCrisisResources() {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(crisisResources)
    .where(eq(crisisResources.isActive, true))
    .orderBy(crisisResources.country, crisisResources.type);
}

// ============================================================================
// WAITLIST
// ============================================================================

export async function addToWaitlist(data: InsertWaitlist) {
  const db = await getDb();
  if (!db) return null;

  try {
    await db.insert(waitlist).values(data);
    return true;
  } catch (error) {
    // Handle duplicate email
    console.error("[Database] Waitlist error:", error);
    return null;
  }
}

export async function getWaitlistCount() {
  const db = await getDb();
  if (!db) return 0;

  const result = await db.select({ count: sql<number>`count(*)` }).from(waitlist);
  return result[0]?.count ?? 0;
}

// ============================================================================
// REFERRALS
// ============================================================================

export async function createReferral(referrerId: number, referralCode: string) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(referrals).values({
    referrerId,
    referralCode,
    status: "pending",
  });
  
  return true;
}

export async function getReferralByCode(code: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select().from(referrals).where(eq(referrals.referralCode, code)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function completeReferral(referralId: number, referredUserId: number) {
  const db = await getDb();
  if (!db) return null;

  await db
    .update(referrals)
    .set({
      referredUserId,
      status: "completed",
      completedAt: new Date(),
    })
    .where(eq(referrals.id, referralId));
  
  return true;
}

// ============================================================================
// MILESTONES
// ============================================================================

export async function checkAndAchieveMilestones() {
  const db = await getDb();
  if (!db) return [];

  // Get total user count
  const userCountResult = await db.select({ count: sql<number>`count(*)` }).from(users);
  const totalUsers = userCountResult[0]?.count ?? 0;

  // Get unachieved milestones that should be achieved
  const achievableMilestones = await db
    .select()
    .from(milestones)
    .where(and(eq(milestones.achieved, false), lte(milestones.userCount, totalUsers)));

  // Mark them as achieved
  for (const milestone of achievableMilestones) {
    await db
      .update(milestones)
      .set({
        achieved: true,
        achievedAt: new Date(),
      })
      .where(eq(milestones.id, milestone.id));
  }

  return achievableMilestones;
}

// ============================================================================
// THERAPIST SHARED DATA (Opt-in only)
// ============================================================================

export async function updateTherapistSharedData(
  userId: number,
  therapistId: number,
  weekStartDate: string,
  data: Partial<InsertTherapistSharedData>
) {
  const db = await getDb();
  if (!db) return null;

  // Check if user has opted in to sharing
  const user = await getUserById(userId);
  if (!user?.therapistDataSharingEnabled) {
    return null;
  }

  const existing = await db
    .select()
    .from(therapistSharedData)
    .where(
      and(
        eq(therapistSharedData.userId, userId),
        eq(therapistSharedData.therapistId, therapistId),
        eq(therapistSharedData.weekStartDate, weekStartDate)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(therapistSharedData)
      .set(data)
      .where(eq(therapistSharedData.id, existing[0].id));
  } else {
    await db.insert(therapistSharedData).values({
      userId,
      therapistId,
      weekStartDate,
      ...data,
    });
  }

  return true;
}

// ============================================================================
// FAMILY CIRCLES
// ============================================================================

export async function createFamilyCircle(ownerUserId: number, name?: string) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(familyCircles).values({
    ownerUserId,
    name,
    subscriptionTier: "nine",
    maxMembers: 5,
    sharedTokenPool: 0,
  });

  return true;
}

export async function addFamilyCircleMember(circleId: number, userId: number, anonymousToOthers: boolean = true) {
  const db = await getDb();
  if (!db) return null;

  await db.insert(familyCircleMembers).values({
    circleId,
    userId,
    anonymousToOthers,
  });

  return true;
}

export async function getFamilyCircleMembers(circleId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(familyCircleMembers)
    .where(eq(familyCircleMembers.circleId, circleId));
}


// ============================================================================
// WAITLIST
// ============================================================================

export async function addWaitlistSignup(data: {
  email: string;
  name?: string;
  referralSource?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(waitlistSignups).values({
    email: data.email,
    name: data.name,
    referralSource: data.referralSource,
  });

  return true;
}

export async function getWaitlistSignup(email: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(waitlistSignups)
    .where(eq(waitlistSignups.email, email))
    .limit(1);

  return result[0] || null;
}

export async function markWaitlistTokensAwarded(email: string, userId: number) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(waitlistSignups)
    .set({ soulTokensAwarded: true, userId })
    .where(eq(waitlistSignups.email, email));

  return true;
}

export async function getAllWaitlistSignups() {
  const db = await getDb();
  if (!db) return [];

  const result = await db
    .select()
    .from(waitlistSignups)
    .orderBy(desc(waitlistSignups.createdAt));

  return result;
}


// ============================================================================
// SUBSCRIPTIONS
// ============================================================================

export async function updateUserSubscription(
  userId: number,
  data: {
    subscriptionTier?: "zero" | "three" | "six" | "nine" | "twelve" | "guardian";
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    subscriptionStatus?: "active" | "canceled" | "past_due" | "trialing";
    subscriptionEndsAt?: Date | null;
  }
) {
  const db = await getDb();
  if (!db) return false;

  await db
    .update(users)
    .set(data)
    .where(eq(users.id, userId));

  return true;
}
