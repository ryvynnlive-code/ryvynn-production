import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

/**
 * Mood Check-In router
 */
export const moodRouter = router({
  /**
   * Submit daily mood check-in
   */
  checkIn: protectedProcedure
    .input(z.object({
      mood: z.enum([
        "very_low", "low", "neutral", "good", "very_good",
        "anxious", "calm", "angry", "peaceful", "sad", "joyful"
      ]),
      note: z.string().max(1000).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Create journal entry for the mood check-in
      const entryId = await db.createJournalEntry({
        userId: ctx.user.id,
        content: input.note || `Mood: ${input.mood}`,
        moodTag: input.mood,
        wordCount: input.note ? input.note.split(/\s+/).length : 0,
      });

      // Award Soul Tokens for checking in
      await db.addSoulTokens(
        ctx.user.id,
        5,
        "earned",
        "mood_check_in",
        "Daily mood check-in"
      );

      return {
        success: true,
        entryId,
        tokensEarned: 5,
      };
    }),

  /**
   * Get mood history
   */
  history: protectedProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).default(30),
    }))
    .query(async ({ input, ctx }) => {
      const entries = await db.getUserJournalEntries(ctx.user.id, input.limit, 0);
      
      // Filter to only entries with mood tags
      const moodEntries = entries.filter(e => e.moodTag);
      
      return moodEntries.map(e => ({
        date: e.createdAt,
        mood: e.moodTag,
        note: e.content,
      }));
    }),
});
