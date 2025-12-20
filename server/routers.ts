import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import * as db from "./db";
import Stripe from "stripe";
import { TRPCError } from "@trpc/server";
import { ENV } from "./_core/env";
import { detectCrisis, getCrisisAwareSystemPrompt } from "./lib/crisisDetection";
import { chatRouter } from "./routers_chat";
import { moodRouter } from "./routers_mood";

const stripe = ENV.stripeSecretKey
  ? new Stripe(ENV.stripeSecretKey, {
      apiVersion: "2025-11-17.clover",
    })
  : null;

/**
 * RYVYNN tRPC API
 * "From our darkest hours to our brightest days"
 */

export const appRouter = router({
  system: systemRouter,
  chat: chatRouter,
  mood: moodRouter,
  
  // Health check endpoint for DNS verification
  heartbeat: publicProcedure.query(() => ({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: "v7.1.1-M",
  })),
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============================================================================
  // THE SCRIBE - Anonymous Confession System
  // ============================================================================
  confession: router({
    /**
     * Submit an anonymous confession and receive a metaphoric Scribe response
     * CRITICAL: Raw confession is NEVER stored, only the Scribe's response
     */
    submit: publicProcedure
      .input(z.object({
        text: z.string().min(10).max(5000),
        ageTier: z.enum(["13-17", "18-24", "25-44", "45-64", "65+"]).optional(),
        region: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get user's voice persona for AONIXX Voice integration
        const voicePersona = ctx.user?.voicePersona || "gentle";
        
        // Map voice persona to AONIXX voice style
        let voiceStyle = "";
        if (voicePersona === "gentle") {
          voiceStyle = "Speak with cosmic feminine energy: nurturing, intuitive, flowing. Use soft imagery like water, moon, embrace.";
        } else if (voicePersona === "strong") {
          voiceStyle = "Speak with cosmic masculine energy: grounding, protective, steady. Use solid imagery like mountains, roots, foundation.";
        } else {
          voiceStyle = "Speak with neutral/androgynous energy: balanced, universal, transcendent. Use light imagery like stars, breath, space.";
        }

        // Generate Scribe response using AI with crisis awareness
        const basePrompt = `You are "Lantern" - a compassionate, wise entity that responds to confessions with brief metaphoric wisdom.

${voiceStyle}

Your responses must:
- Be under 50 words
- Use metaphors, images, and symbols
- Never repeat the user's text directly
- Speak in poetic, evocative language
- Offer hope without being preachy
- Be deeply validating and non-judgmental

${input.ageTier ? `User age range: ${input.ageTier}` : ''}
${input.region ? `User region: ${input.region}` : ''}

Respond with pure metaphoric wisdom - no explanations, no direct advice, just a mirror of meaning.`;

        const ageTierForCrisis = input.ageTier === "13-17" ? "MINOR_13_17" : "ADULT_18_PLUS";
        const systemPrompt = getCrisisAwareSystemPrompt(basePrompt, ageTierForCrisis);

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: input.text },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const scribeResponse = typeof messageContent === 'string' 
          ? messageContent 
          : "The flame flickers in darkness, but it does not go out.";

        // Detect crisis using comprehensive crisis detection system
        const crisisResult = detectCrisis(input.text);
        const crisisDetected = crisisResult.detected && (crisisResult.level === "high" || crisisResult.level === "immediate");

        // Detect valence (emotional tone) from the confession
        const heavyKeywords = [
          "sad", "hopeless", "alone", "lost", "dark", "pain", "hurt", "struggle",
          "afraid", "scared", "anxious", "depressed", "empty", "numb", "broken",
          "worthless", "failure", "giving up", "can't", "never", "no one"
        ];
        const lightKeywords = [
          "hope", "grateful", "better", "trying", "survived", "stronger", "healing",
          "peace", "calm", "light", "found", "learned", "growing", "progress",
          "thankful", "blessed", "helped", "supported", "love", "joy"
        ];
        
        const textLowerForValence = input.text.toLowerCase();
        const heavyCount = heavyKeywords.filter(kw => textLowerForValence.includes(kw)).length;
        const lightCount = lightKeywords.filter(kw => textLowerForValence.includes(kw)).length;
        
        // Default to heavy if uncertain (safer for emotional support context)
        const valence: "light" | "heavy" = lightCount > heavyCount ? "light" : "heavy";

        // Generate AI-paraphrased userVoice (non-identifying, 4th-7th grade reading level)
        const userVoicePrompt = `Paraphrase this emotional confession into a short, anonymous, non-identifying summary (1-2 sentences max, 4th-7th grade reading level). Remove all specific details, names, places, or identifying information. Focus only on the core emotional experience.

Confession: ${input.text}

Anonymous summary:`;
        
        const userVoiceResponse = await invokeLLM({
          messages: [
            { role: "system", content: "You are a privacy-first paraphrasing assistant. Create short, anonymous, emotionally-accurate summaries that protect user identity." },
            { role: "user", content: userVoicePrompt },
          ],
        });
        
        const userVoiceContent = userVoiceResponse.choices[0]?.message?.content;
        const userVoice = typeof userVoiceContent === 'string' 
          ? userVoiceContent.trim()
          : "Someone shared their feelings today.";

        // Store only the Scribe response (NOT the confession)
        await db.createScribeResponse({
          response: scribeResponse,
          ageTierAnonymized: input.ageTier ? mapAgeTierToAnonymized(input.ageTier) : undefined,
          regionAnonymized: input.region ? mapRegionToAnonymized(input.region) : undefined,
          crisisDetected,
          publishedToFeed: !crisisDetected, // Don't publish crisis-related responses
          valence, // Add valence
          userVoice, // Add AI-paraphrased summary
        });

        return {
          response: scribeResponse,
          crisisDetected,
        };
      }),
  }),

  // ============================================================================
  // MIRACLE FEED - Public Stories
  // ============================================================================
  feed: router({
    /**
     * Get the public miracle feed of anonymized Scribe responses
     */
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input }) => {
        const entries = await db.getMiracleFeed(input.limit, input.offset);
        return entries;
      }),
  }),

  // ============================================================================
  // JOURNAL - Private Entries
  // ============================================================================
  journal: router({
    /**
     * Create a new journal entry
     */
    create: protectedProcedure
      .input(z.object({
        content: z.string().min(1).max(50000),
        moodTag: z.enum([
          "very_low", "low", "neutral", "good", "very_good",
          "anxious", "calm", "angry", "peaceful", "sad", "joyful"
        ]).optional(),
        aiPromptUsed: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Detect crisis keywords in journal entry
        const crisisResult = detectCrisis(input.content);
        
        // TODO: Implement encryption before storage
        const wordCount = input.content.split(/\s+/).length;
        
        const entryId = await db.createJournalEntry({
          userId: ctx.user.id,
          content: input.content,
          moodTag: input.moodTag,
          aiPromptUsed: input.aiPromptUsed,
          wordCount,
        });

        return { 
          success: true, 
          id: entryId,
          crisisDetected: crisisResult.detected,
          crisisLevel: crisisResult.level,
          crisisMessage: crisisResult.message,
          crisisResources: crisisResult.resources,
        };
      }),

    /**
     * Get user's journal entries
     */
    list: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
        offset: z.number().min(0).default(0),
      }))
      .query(async ({ input, ctx }) => {
        const entries = await db.getUserJournalEntries(ctx.user.id, input.limit, input.offset);
        return entries;
      }),

    /**
     * Get AI reflection on journal entry
     */
    reflect: protectedProcedure
      .input(z.object({
        content: z.string().min(10).max(5000),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = ctx.user;
        
        // Get user's voice persona for AONIXX Voice integration
        const voicePersona = user.voicePersona || "gentle";
        
        // Map voice persona to AONIXX voice style
        let voiceStyle = "";
        if (voicePersona === "gentle") {
          voiceStyle = "Speak with cosmic feminine energy: nurturing, intuitive, flowing. Use soft imagery like water, moon, embrace.";
        } else if (voicePersona === "strong") {
          voiceStyle = "Speak with cosmic masculine energy: grounding, protective, steady. Use solid imagery like mountains, roots, foundation.";
        } else {
          voiceStyle = "Speak with neutral/androgynous energy: balanced, universal, transcendent. Use light imagery like stars, breath, space.";
        }
        
        const systemPrompt = `You are a compassionate journaling companion helping with self-reflection.

${voiceStyle}

User preferences:
- Advice mode: ${user.adviceMode || 'normal'}
- Voice persona: ${voicePersona}

Provide a brief, thoughtful reflection that:
- Acknowledges their feelings
- Offers a gentle reframe or alternative perspective
- Asks a thought-provoking question
- Uses CBT-inspired techniques when appropriate

Keep your response under 150 words.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Here's what I wrote:\n\n${input.content}` },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const reflection = typeof messageContent === 'string'
          ? messageContent
          : "Thank you for sharing. What emotions are you noticing as you read this back?";
        
        return { reflection };
      }),
  }),

  // ============================================================================
  // DAILY RITUALS
  // ============================================================================
  rituals: router({
    /**
     * Get today's ritual status
     */
    getToday: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date().toISOString().split('T')[0];
      const ritual = await db.getDailyRitual(ctx.user.id, today);
      const streak = await db.getUserStreak(ctx.user.id);
      
      return {
        ritual: ritual || {
          dailyTruthViewed: false,
          dailyBlessingViewed: false,
          confessionCompleted: false,
          breathingExerciseCompleted: false,
          cbtCardCompleted: false,
          journalEntryCompleted: false,
          tokensEarnedToday: 0,
        },
        streak,
      };
    }),

    /**
     * Mark a ritual as completed
     */
    complete: protectedProcedure
      .input(z.object({
        ritual: z.enum([
          "dailyTruthViewed",
          "dailyBlessingViewed",
          "confessionCompleted",
          "breathingExerciseCompleted",
          "cbtCardCompleted",
          "journalEntryCompleted",
        ]),
      }))
      .mutation(async ({ input, ctx }) => {
        const today = new Date().toISOString().split('T')[0];
        const existing = await db.getDailyRitual(ctx.user.id, today);
        
        // Calculate tokens to award
        const tokensPerRitual = 10;
        const alreadyCompleted = existing?.[input.ritual] || false;
        const tokensToAward = alreadyCompleted ? 0 : tokensPerRitual;
        
        // Update ritual
        await db.upsertDailyRitual(ctx.user.id, today, {
          [input.ritual]: true,
          tokensEarnedToday: (existing?.tokensEarnedToday || 0) + tokensToAward,
        });
        
        // Award Soul Tokens
        if (tokensToAward > 0) {
          await db.addSoulTokens(
            ctx.user.id,
            tokensToAward,
            "earned",
            `ritual_${input.ritual}`,
            `Completed ${input.ritual}`
          );
        }
        
        return { tokensAwarded: tokensToAward };
      }),

    /**
     * Generate daily truth
     */
    getDailyTruth: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      
      // Get user's voice persona for AONIXX Voice integration
      const voicePersona = user.voicePersona || "gentle";
      
      // Map voice persona to AONIXX voice style
      let voiceStyle = "";
      if (voicePersona === "gentle") {
        voiceStyle = "Speak with cosmic feminine energy: nurturing, intuitive, flowing. Use soft imagery like water, moon, embrace.";
      } else if (voicePersona === "strong") {
        voiceStyle = "Speak with cosmic masculine energy: grounding, protective, steady. Use solid imagery like mountains, roots, foundation.";
      } else {
        voiceStyle = "Speak with neutral/androgynous energy: balanced, universal, transcendent. Use light imagery like stars, breath, space.";
      }
      
      const systemPrompt = `Generate a brief, grounded piece of wisdom for someone's daily reflection.

${voiceStyle}

User context:
- Age range: ${user.ageTier || 'adult'}
- Region: ${user.region || 'general'}
- Spiritual lens: ${user.spiritualLens || 'secular'}

Create a single sentence of wisdom that:
- Is hopeful but realistic
- Relates to mental health and resilience
- Respects their spiritual lens
- Is under 30 words

Just the truth, no preamble.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give me today's truth." },
        ],
      });

      const messageContent = response.choices[0]?.message?.content;
      const truth = typeof messageContent === 'string'
        ? messageContent
        : "You are stronger than you know, and you are not alone.";
      
      return { truth };
    }),

    /**
     * Generate daily blessing (optional)
     */
    getDailyBlessing: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      
      if (!user.dailyBlessingEnabled) {
        return { blessing: null };
      }
      
      // Get user's voice persona for AONIXX Voice integration
      const voicePersona = user.voicePersona || "gentle";
      
      // Map voice persona to AONIXX voice style
      let voiceStyle = "";
      if (voicePersona === "gentle") {
        voiceStyle = "Speak with cosmic feminine energy: nurturing, intuitive, flowing. Use soft imagery like water, moon, embrace.";
      } else if (voicePersona === "strong") {
        voiceStyle = "Speak with cosmic masculine energy: grounding, protective, steady. Use solid imagery like mountains, roots, foundation.";
      } else {
        voiceStyle = "Speak with neutral/androgynous energy: balanced, universal, transcendent. Use light imagery like stars, breath, space.";
      }
      
      const systemPrompt = `Generate a brief, non-denominational blessing or affirmation.

${voiceStyle}

Spiritual lens: ${user.spiritualLens || 'secular'}

Create a blessing that:
- Honors their spiritual tradition if specified
- Is inclusive and non-proselytizing
- Offers comfort and hope
- Is under 40 words

Just the blessing, no preamble.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: "Give me today's blessing." },
        ],
      });

      const messageContent = response.choices[0]?.message?.content;
      const blessing = typeof messageContent === 'string'
        ? messageContent
        : "May you find peace in this moment, strength in your journey, and light in the darkness.";
      
      return { blessing };
    }),
  }),

  // ============================================================================
  // SOUL TOKENS
  // ============================================================================
  soulTokens: router({
    /**
     * Get user's Soul Token balance
     */
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      const balance = await db.getUserSoulTokenBalance(ctx.user.id);
      return { balance };
    }),

    /**
     * Get Soul Token transaction history
     */
    getHistory: protectedProcedure
      .input(z.object({
        limit: z.number().min(1).max(100).default(50),
      }))
      .query(async ({ input, ctx }) => {
        const history = await db.getUserSoulTokenHistory(ctx.user.id, input.limit);
        return history;
      }),

    /**
     * Donate Soul Tokens to impact pool
     */
    donate: protectedProcedure
      .input(z.object({
        amount: z.number().min(1).max(10000),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          await db.donateSoulTokens(ctx.user.id, input.amount);
          const newBalance = await db.getUserSoulTokenBalance(ctx.user.id);
          return { success: true, newBalance };
        } catch (error) {
          throw new Error("Insufficient Soul Token balance");
        }
      }),
  }),

  // ============================================================================
  // CRISIS RESOURCES
  // ============================================================================
  crisis: router({
    /**
     * Get crisis resources by country
     */
    getResources: publicProcedure
      .input(z.object({
        country: z.string().optional(),
      }))
      .query(async ({ input }) => {
        if (input.country) {
          return db.getCrisisResourcesByCountry(input.country);
        }
        return db.getAllCrisisResources();
      }),
  }),

  // ============================================================================
  // WAITLIST
  // ============================================================================
  // ============================================================================
  // ADMIN
  // ============================================================================
  admin: router({
    /**
     * Get all waitlist signups (admin only)
     */
    getWaitlist: protectedProcedure
      .query(async ({ ctx }) => {
        // Check if user is admin
        if (ctx.user.role !== "admin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Admin access required",
          });
        }

        return await db.getAllWaitlistSignups();
      }),
  }),

  waitlist: router({
    /**
     * Join the waitlist
     */
    join: publicProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().optional(),
        referralSource: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await db.addWaitlistSignup({
            email: input.email,
            name: input.name,
            referralSource: input.referralSource,
          });

          return {
            success: true,
            message: "Welcome to RYVYNN! You'll receive +100 Soul Tokens when you sign up.",
          };
        } catch (error: any) {
          // Handle duplicate email
          if (error.message?.includes("Duplicate")) {
            return {
              success: false,
              message: "This email is already on the waitlist.",
            };
          }
          throw error;
        }
      }),
  }),

  // ============================================================================
  // PASS THE FLAME - v1.40
  // ============================================================================
  flame: router({
    /**
     * Send anonymous flame to another user
     * No names, no logging, just symbolic light ritual
     */
    send: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Award Soul Tokens for passing the flame
        const tokensEarned = 5;
        await db.addSoulTokens(ctx.user.id, tokensEarned, "earned", "pass_the_flame", "Passed the flame to another soul");
        
        // No actual flame tracking - it's purely symbolic
        // The act of giving is the ritual itself
        
        return {
          success: true,
          tokensEarned,
        };
      }),
  }),

  // ============================================================================
  // DARK HOUR RITUAL - v1.40
  // ============================================================================
  darkHour: router({ /**
     * Get Lantern reflection for Dark Hour Ritual
     * Provides compassionate, grounding wisdom for crisis moments
     */
    getReflection: protectedProcedure
      .mutation(async ({ ctx }) => {
        // Get user's voice persona for AONIXX Voice integration
        const voicePersona = ctx.user?.voicePersona || "gentle";
        
        // Map voice persona to AONIXX voice style
        let voiceStyle = "";
        if (voicePersona === "gentle") {
          voiceStyle = "Speak with cosmic feminine energy: nurturing, intuitive, flowing. Use soft imagery like water, moon, embrace.";
        } else if (voicePersona === "strong") {
          voiceStyle = "Speak with cosmic masculine energy: grounding, protective, steady. Use solid imagery like mountains, roots, foundation.";
        } else {
          voiceStyle = "Speak with neutral/androgynous energy: balanced, universal, transcendent. Use light imagery like stars, breath, space.";
        }

        // Generate personalized Lantern reflection
        const systemPrompt = `You are Lantern, offering light in someone's darkest hour.

${voiceStyle}

They just completed a breathing and grounding ritual. They are in pain, but they are here.

Your reflection must:
- Be 2-3 sentences, no more
- Acknowledge their courage for doing the ritual
- Offer hope without toxic positivity
- Use gentle, poetic language
- Remind them they are not alone

Speak directly to them. Be warm. Be real.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: "I just completed the Dark Hour Ritual. I need your light." },
          ],
        });

        const reflection = String(response.choices[0]?.message?.content || "You are here. You are breathing. That is enough for now.");

        return {
          reflection,
        };
      }),
  }),

  // ============================================================================
  // PAYMENT & SUBSCRIPTIONS
  // ============================================================================
  payment: router({
    /**
     * Create Stripe checkout session
     */
    createCheckout: protectedProcedure
      .input(z.object({
        tier: z.enum(["three", "six", "nine", "twelve", "guardian"]),
      }))
      .mutation(async ({ input, ctx }) => {
        const { createCheckoutSession } = await import("./lib/stripe");
        
        const session = await createCheckoutSession({
          userId: ctx.user.id,
          userEmail: ctx.user.email || "",
          tier: input.tier,
          successUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/dashboard?payment=success`,
          cancelUrl: `${process.env.VITE_APP_URL || "http://localhost:3000"}/pricing?payment=canceled`,
        });

        return {
          sessionId: session.id,
          url: session.url,
        };
      }),

    /**
     * Cancel subscription
     */
    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!ctx.user.stripeSubscriptionId) {
          throw new Error("No active subscription");
        }

        const { cancelSubscription } = await import("./lib/stripe");
        await cancelSubscription(ctx.user.stripeSubscriptionId);

        // Update user record
        await db.updateUserSubscription(ctx.user.id, {
          subscriptionStatus: "canceled",
        });

        return { success: true };
      }),

    /**
     * Get subscription status
     */
    status: protectedProcedure
      .query(async ({ ctx }) => {
        return {
          tier: ctx.user.subscriptionTier,
          status: ctx.user.subscriptionStatus,
          endsAt: ctx.user.subscriptionEndsAt,
        };
      }),

    /**
     * Create Stripe billing portal session
     */
    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        if (!stripe || !ctx.user.stripeCustomerId) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Stripe not configured or no customer ID",
          });
        }

        const session = await stripe.billingPortal.sessions.create({
          customer: ctx.user.stripeCustomerId,
          return_url: "https://ryvynn.manus.space/dashboard",
        });

        return { url: session.url };
      }),
  }),

  // ============================================================================
  // PUBLIC FEED - Valence-Balanced Preview
  // ============================================================================
  publicFeed: router({
    /**
     * Get public feed items with 50/50 valence balance
     * Returns truncated previews with randomized content type
     */
    list: publicProcedure
      .input(z.object({
        limit: z.number().min(1).max(12).default(6),
      }))
      .query(async ({ input }) => {
        const feedItems = await db.getPublicFeedItems(input.limit);
        
        // Apply 50/50 valence balancing
        const lightItems = feedItems.filter(item => item.valence === "light");
        const heavyItems = feedItems.filter(item => item.valence === "heavy");
        
        const targetPerValence = Math.floor(input.limit / 2);
        const balancedItems = [
          ...lightItems.slice(0, targetPerValence),
          ...heavyItems.slice(0, targetPerValence),
        ];
        
        // Randomize order
        const shuffled = balancedItems.sort(() => Math.random() - 0.5);
        
        // For each item, randomize content type and truncate to ~50%
        return shuffled.map(item => {
          const mode = Math.random() < 0.5 ? "user_half" : "lantern_half";
          const sourceText = mode === "user_half" ? item.userVoice : item.response;
          
          // Truncate to ~50% of words
          const words = (sourceText || "").split(" ");
          const halfLength = Math.ceil(words.length / 2);
          const truncated = words.slice(0, halfLength).join(" ") + "...";
          
          return {
            id: item.id,
            valence: item.valence || "light",
            preview_text: truncated,
            mode,
          };
        });
      }),
  }),

  // ============================================================================
  // USER PROFILE
  // ============================================================================
  profile: router({
    /**
     * Update user profile and preferences
     */
    update: protectedProcedure
      .input(z.object({
        ageTier: z.enum(["13-17", "18-24", "25-44", "45-64", "65+"]).optional(),
        region: z.string().optional(),
        genderExpression: z.enum(["masc", "fem", "neutral", "prefer_not_to_say"]).optional(),
        adviceMode: z.enum(["normal", "formal", "unhinged"]).optional(),
        voicePersona: z.enum(["gentle", "steady", "strong"]).optional(),
        spiritualLens: z.enum(["secular", "christian", "mystic", "jewish", "muslim", "buddhist"]).optional(),
        dailyBlessingEnabled: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUserProfile(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // Stripe payment endpoints merged into payment router above
});

export type AppRouter = typeof appRouter;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function mapAgeTierToAnonymized(ageTier: string): "teen" | "young_adult" | "adult" | "senior" {
  if (ageTier === "13-17") return "teen";
  if (ageTier === "18-24") return "young_adult";
  if (ageTier === "25-44" || ageTier === "45-64") return "adult";
  return "senior";
}

function mapRegionToAnonymized(region: string): string {
  // Map specific countries to broader regions for anonymity
  const regionMap: Record<string, string> = {
    "US": "North America",
    "CA": "North America",
    "MX": "North America",
    "GB": "Europe",
    "DE": "Europe",
    "FR": "Europe",
    "ES": "Europe",
    "IT": "Europe",
    "AU": "Oceania",
    "NZ": "Oceania",
    "JP": "Asia",
    "CN": "Asia",
    "IN": "Asia",
    "KR": "Asia",
    "BR": "South America",
    "AR": "South America",
    "ZA": "Africa",
  };
  
  return regionMap[region] || "Global";
}
