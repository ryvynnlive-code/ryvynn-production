import { int, mysqlTable, text, timestamp, boolean } from "drizzle-orm/mysql-core";

/**
 * TRUTH NUGGETS - Extracted wisdom from journal entries
 * AI-generated insights that users can save to their Nugget Vault
 */
export const truthNuggets = mysqlTable("truth_nuggets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  journalEntryId: int("journalEntryId"), // Optional - may be from confession or standalone
  
  // The nugget content (<100 words of wisdom)
  content: text("content").notNull(),
  
  // Nugget category for organization
  category: text("category"), // e.g., "self-compassion", "boundaries", "growth", "grief"
  
  // User actions
  savedToVault: boolean("savedToVault").default(false),
  markedAsFavorite: boolean("markedAsFavorite").default(false),
  
  // Metadata
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  savedAt: timestamp("savedAt"), // When user explicitly saved it
});

export type TruthNugget = typeof truthNuggets.$inferSelect;
export type InsertTruthNugget = typeof truthNuggets.$inferInsert;
