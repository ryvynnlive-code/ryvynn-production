import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean, decimal } from "drizzle-orm/mysql-core";

/**
 * RYVYNN Database Schema
 * Privacy-first, zero-surveillance architecture
 * "From our darkest hours to our brightest days"
 */

// ============================================================================
// USERS & AUTHENTICATION
// ============================================================================

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin", "org_admin", "therapist"]).default("user").notNull(),
  
  // RYVYNN-specific personalization
  ageTier: mysqlEnum("ageTier", ["13-17", "18-24", "25-44", "45-64", "65+"]),
  region: varchar("region", { length: 10 }), // ISO country code
  genderExpression: mysqlEnum("genderExpression", ["masc", "fem", "neutral", "prefer_not_to_say"]),
  adviceMode: mysqlEnum("adviceMode", ["normal", "formal", "unhinged"]).default("normal"),
  voicePersona: mysqlEnum("voicePersona", ["gentle", "steady", "strong"]).default("gentle"),
  spiritualLens: mysqlEnum("spiritualLens", ["secular", "christian", "mystic", "jewish", "muslim", "buddhist"]).default("secular"),
  dailyBlessingEnabled: boolean("dailyBlessingEnabled").default(false),
  
  // Soul Tokens
  soulTokenBalance: int("soulTokenBalance").default(0).notNull(),
  
  // Subscription
  subscriptionTier: mysqlEnum("subscriptionTier", ["zero", "three", "six", "nine", "twelve", "guardian"]).default("zero").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 255 }),
  subscriptionStatus: mysqlEnum("subscriptionStatus", ["active", "canceled", "past_due", "trialing"]),
  subscriptionEndsAt: timestamp("subscriptionEndsAt"),
  
  // Therapist linking (opt-in only)
  linkedTherapistId: int("linkedTherapistId"),
  therapistDataSharingEnabled: boolean("therapistDataSharingEnabled").default(false),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  lastActiveAt: timestamp("lastActiveAt").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================================================
// CONFESSIONS & THE SCRIBE (Minimal Storage - Privacy First)
// ============================================================================

/**
 * CRITICAL: Raw confessions are NEVER stored.
 * Only Scribe responses (metaphoric, anonymized) are saved for the Miracle Feed.
 */
export const scribeResponses = mysqlTable("scribe_responses", {
  id: int("id").autoincrement().primaryKey(),
  
  // Scribe's metaphoric response (<50 words)
  response: text("response").notNull(),
  
  // Valence tracking for feed balancing ("light" = hopeful, "heavy" = difficult)
  valence: mysqlEnum("valence", ["light", "heavy"]),
  
  // AI-paraphrased user voice (non-identifying, short summary for feed preview)
  userVoice: text("userVoice"),
  
  // Minimal metadata for feed display (NO user identification)
  ageTierAnonymized: mysqlEnum("ageTierAnonymized", ["teen", "young_adult", "adult", "senior"]),
  regionAnonymized: varchar("regionAnonymized", { length: 50 }), // e.g., "North America", "Europe"
  
  // Crisis flag (for internal monitoring, never shown publicly)
  crisisDetected: boolean("crisisDetected").default(false),
  
  // Feed visibility
  publishedToFeed: boolean("publishedToFeed").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ScribeResponse = typeof scribeResponses.$inferSelect;
export type InsertScribeResponse = typeof scribeResponses.$inferInsert;

// ============================================================================
// PRIVATE JOURNAL (Encrypted, User-Scoped)
// ============================================================================

export const journalEntries = mysqlTable("journal_entries", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  // Journal content (to be encrypted at application level before storage)
  content: text("content").notNull(),
  
  // Optional AI assistance metadata
  aiPromptUsed: varchar("aiPromptUsed", { length: 255 }),
  aiReflectionGenerated: boolean("aiReflectionGenerated").default(false),
  
  // Mood tagging
  moodTag: mysqlEnum("moodTag", [
    "very_low", "low", "neutral", "good", "very_good",
    "anxious", "calm", "angry", "peaceful", "sad", "joyful"
  ]),
  
  // Metadata
  wordCount: int("wordCount"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type JournalEntry = typeof journalEntries.$inferSelect;
export type InsertJournalEntry = typeof journalEntries.$inferInsert;

// ============================================================================
// DAILY RITUALS
// ============================================================================

export const dailyRituals = mysqlTable("daily_rituals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  date: varchar("date", { length: 10 }).notNull(), // YYYY-MM-DD
  
  // Ritual completions
  dailyTruthViewed: boolean("dailyTruthViewed").default(false),
  dailyBlessingViewed: boolean("dailyBlessingViewed").default(false),
  confessionCompleted: boolean("confessionCompleted").default(false),
  breathingExerciseCompleted: boolean("breathingExerciseCompleted").default(false),
  cbtCardCompleted: boolean("cbtCardCompleted").default(false),
  journalEntryCompleted: boolean("journalEntryCompleted").default(false),
  
  // Streak tracking
  streakCount: int("streakCount").default(0),
  
  // Soul Tokens earned this day
  tokensEarnedToday: int("tokensEarnedToday").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type DailyRitual = typeof dailyRituals.$inferSelect;
export type InsertDailyRitual = typeof dailyRituals.$inferInsert;

// ============================================================================
// TRUTH NUGGETS - Extracted Wisdom
// ============================================================================

/**
 * AI-extracted insights from journal entries
 * Users can save these to their Nugget Vault for future reference
 */
export const truthNuggets = mysqlTable("truth_nuggets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  journalEntryId: int("journalEntryId"), // Optional - may be from confession or standalone
  
  // The nugget content (<100 words of wisdom)
  content: text("content").notNull(),
  
  // Nugget category for organization
  category: varchar("category", { length: 50 }), // e.g., "self-compassion", "boundaries", "growth"
  
  // User actions
  savedToVault: boolean("savedToVault").default(false),
  markedAsFavorite: boolean("markedAsFavorite").default(false),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  savedAt: timestamp("savedAt"), // When user explicitly saved it
});

export type TruthNugget = typeof truthNuggets.$inferSelect;
export type InsertTruthNugget = typeof truthNuggets.$inferInsert;

// ============================================================================
// SOUL TOKENS & IMPACT
// ============================================================================

export const soulTokenTransactions = mysqlTable("soul_token_transactions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  
  type: mysqlEnum("type", ["earned", "donated", "bonus", "referral"]).notNull(),
  amount: int("amount").notNull(),
  
  // Context
  source: varchar("source", { length: 255 }), // e.g., "daily_visit", "ritual_completion", "referral"
  description: text("description"),
  
  // Balance after transaction
  balanceAfter: int("balanceAfter").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SoulTokenTransaction = typeof soulTokenTransactions.$inferSelect;
export type InsertSoulTokenTransaction = typeof soulTokenTransactions.$inferInsert;

export const impactPool = mysqlTable("impact_pool", {
  id: int("id").autoincrement().primaryKey(),
  
  // Aggregated donations
  totalTokensDonated: int("totalTokensDonated").default(0).notNull(),
  totalMoneyAllocated: decimal("totalMoneyAllocated", { precision: 10, scale: 2 }).default("0.00").notNull(),
  
  // Impact tracking
  impactDescription: text("impactDescription"),
  recipientCount: int("recipientCount").default(0),
  
  // Period tracking
  periodStart: timestamp("periodStart").notNull(),
  periodEnd: timestamp("periodEnd").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ImpactPool = typeof impactPool.$inferSelect;
export type InsertImpactPool = typeof impactPool.$inferInsert;

// ============================================================================
// CRISIS RESOURCES
// ============================================================================

export const crisisResources = mysqlTable("crisis_resources", {
  id: int("id").autoincrement().primaryKey(),
  
  country: varchar("country", { length: 10 }).notNull(), // ISO country code
  region: varchar("region", { length: 100 }),
  
  // Resource details
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }),
  sms: varchar("sms", { length: 50 }),
  website: varchar("website", { length: 500 }),
  description: text("description"),
  
  // Resource type
  type: mysqlEnum("type", ["suicide_prevention", "crisis_hotline", "mental_health", "addiction", "domestic_violence", "general"]).notNull(),
  
  // Availability
  available24_7: boolean("available24_7").default(true),
  languages: text("languages"), // JSON array of language codes
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CrisisResource = typeof crisisResources.$inferSelect;
export type InsertCrisisResource = typeof crisisResources.$inferInsert;

// ============================================================================
// WAITLIST & EARLY ACCESS
// ============================================================================

export const waitlist = mysqlTable("waitlist", {
  id: int("id").autoincrement().primaryKey(),
  
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  
  // Interest tracking
  interestedInTherapistTier: boolean("interestedInTherapistTier").default(false),
  referralSource: varchar("referralSource", { length: 255 }),
  
  // Status
  inviteSent: boolean("inviteSent").default(false),
  inviteSentAt: timestamp("inviteSentAt"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Waitlist = typeof waitlist.$inferSelect;
export type InsertWaitlist = typeof waitlist.$inferInsert;

// ============================================================================
// REFERRALS & MILESTONES
// ============================================================================

export const referrals = mysqlTable("referrals", {
  id: int("id").autoincrement().primaryKey(),
  
  referrerId: int("referrerId").notNull(),
  referredUserId: int("referredUserId"),
  
  // Referral code
  referralCode: varchar("referralCode", { length: 50 }).notNull().unique(),
  
  // Status
  status: mysqlEnum("status", ["pending", "completed", "rewarded"]).default("pending").notNull(),
  
  // Rewards
  tokensAwarded: int("tokensAwarded").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  completedAt: timestamp("completedAt"),
});

export type Referral = typeof referrals.$inferSelect;
export type InsertReferral = typeof referrals.$inferInsert;

export const milestones = mysqlTable("milestones", {
  id: int("id").autoincrement().primaryKey(),
  
  userCount: int("userCount").notNull().unique(), // 10000, 20000, 50000, etc.
  
  // Commitment
  commitmentDescription: text("commitmentDescription").notNull(),
  commitmentAmount: decimal("commitmentAmount", { precision: 10, scale: 2 }),
  
  // Status
  achieved: boolean("achieved").default(false),
  achievedAt: timestamp("achievedAt"),
  
  // Impact
  impactDescription: text("impactDescription"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = typeof milestones.$inferInsert;

// ============================================================================
// THERAPIST DASHBOARD DATA (Opt-in Only)
// ============================================================================

/**
 * Minimal aggregated data shared with therapists (only if user opts in)
 * NO raw content, NO PHI
 */
export const therapistSharedData = mysqlTable("therapist_shared_data", {
  id: int("id").autoincrement().primaryKey(),
  
  userId: int("userId").notNull(),
  therapistId: int("therapistId").notNull(),
  
  // Aggregated metrics only
  weeklyEngagementDays: int("weeklyEngagementDays").default(0),
  moodTrend: mysqlEnum("moodTrend", ["improving", "stable", "declining", "unknown"]).default("unknown"),
  
  // Flags (user self-reported)
  slippingFlagCount: int("slippingFlagCount").default(0),
  crisisResourceAccessCount: int("crisisResourceAccessCount").default(0),
  
  // Period
  weekStartDate: varchar("weekStartDate", { length: 10 }).notNull(), // YYYY-MM-DD
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TherapistSharedData = typeof therapistSharedData.$inferSelect;
export type InsertTherapistSharedData = typeof therapistSharedData.$inferInsert;

// ============================================================================
// ORGANIZATION MANAGEMENT
// ============================================================================

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }).notNull(),
  type: mysqlEnum("type", ["therapy_practice", "clinic", "nonprofit", "corporate"]).notNull(),
  
  // Subscription
  subscriptionTier: mysqlEnum("subscriptionTier", ["guardian"]).notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 255 }),
  
  // Limits
  maxLicenses: int("maxLicenses").default(5).notNull(),
  activeLicenses: int("activeLicenses").default(0).notNull(),
  
  // Admin
  adminUserId: int("adminUserId").notNull(),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ============================================================================
// FAMILY / CIRCLE SUBSCRIPTIONS
// ============================================================================

export const familyCircles = mysqlTable("family_circles", {
  id: int("id").autoincrement().primaryKey(),
  
  name: varchar("name", { length: 255 }),
  ownerUserId: int("ownerUserId").notNull(),
  
  // Subscription
  subscriptionTier: mysqlEnum("subscriptionTier", ["nine"]).notNull(),
  maxMembers: int("maxMembers").default(5).notNull(),
  
  // Shared Soul Token pool
  sharedTokenPool: int("sharedTokenPool").default(0).notNull(),
  
  isActive: boolean("isActive").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FamilyCircle = typeof familyCircles.$inferSelect;
export type InsertFamilyCircle = typeof familyCircles.$inferInsert;

export const familyCircleMembers = mysqlTable("family_circle_members", {
  id: int("id").autoincrement().primaryKey(),
  
  circleId: int("circleId").notNull(),
  userId: int("userId").notNull(),
  
  // Privacy - members can be anonymous to each other
  anonymousToOthers: boolean("anonymousToOthers").default(true),
  
  joinedAt: timestamp("joinedAt").defaultNow().notNull(),
});

export type FamilyCircleMember = typeof familyCircleMembers.$inferSelect;
export type InsertFamilyCircleMember = typeof familyCircleMembers.$inferInsert;

// ============================================================================
// WAITLIST
// ============================================================================

export const waitlistSignups = mysqlTable("waitlist_signups", {
  id: int("id").autoincrement().primaryKey(),
  
  email: varchar("email", { length: 320 }).notNull().unique(),
  
  // Optional user info
  name: varchar("name", { length: 255 }),
  referralSource: varchar("referralSource", { length: 255 }),
  
  // Reward tracking
  soulTokensAwarded: boolean("soulTokensAwarded").default(false),
  userId: int("userId"), // Set when they sign up
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WaitlistSignup = typeof waitlistSignups.$inferSelect;
export type InsertWaitlistSignup = typeof waitlistSignups.$inferInsert;
