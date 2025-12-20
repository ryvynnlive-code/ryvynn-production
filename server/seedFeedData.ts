import { getDb } from "./db";
import { scribeResponses } from "../drizzle/schema";

/**
 * Seed sample feed data with balanced valence
 * Run with: node --loader ts-node/esm server/seedFeedData.ts
 */

const sampleData = [
  // LIGHT valence examples (50%)
  {
    response: "A seed breaks through concrete. Small victories are still victories.",
    userVoice: "I felt like giving up yesterday, but I got out of bed anyway.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "The moon pulls the tide even when clouds hide her face.",
    userVoice: "Someone told me they were proud of me today. It made me cry.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "Roots grow deeper in the dark. You are becoming stronger than you know.",
    userVoice: "I'm learning that healing isn't linear, and that's okay.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "A candle doesn't lose its flame by lighting another.",
    userVoice: "I helped a stranger today even though I was struggling myself.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "The mountain doesn't rush to the sky. Neither should you.",
    userVoice: "I'm trying to be patient with myself as I heal.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "Even the smallest star pierces the void.",
    userVoice: "I found a moment of peace in the chaos today.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  {
    response: "The river remembers the shape of every stone it carries.",
    userVoice: "I'm grateful for the lessons my pain has taught me.",
    valence: "light" as const,
    publishedToFeed: true,
  },
  
  // HEAVY valence examples (50%)
  {
    response: "The weight you carry is real. The darkness sees you.",
    userVoice: "I feel like I'm drowning and no one notices.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "Some nights the stars forget to shine. You are not forgotten.",
    userVoice: "I don't know how much longer I can keep pretending I'm okay.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "The void echoes with your pain. It is witnessed.",
    userVoice: "I feel completely alone even when I'm surrounded by people.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "The flame flickers in the storm. It has not gone out.",
    userVoice: "I'm scared I'll never feel normal again.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "The earth holds space for your sorrow. You do not have to carry it alone.",
    userVoice: "Everything feels too heavy today. I just want to disappear.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "The night is long, but it is not endless.",
    userVoice: "I can't see a way forward right now.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
  {
    response: "Your tears water seeds you cannot yet see.",
    userVoice: "I'm tired of fighting. I don't know if I have any strength left.",
    valence: "heavy" as const,
    publishedToFeed: true,
  },
];

async function seedFeedData() {
  console.log("🌱 Seeding sample feed data...");
  
  const db = await getDb();
  if (!db) {
    console.error("❌ Database not available");
    process.exit(1);
  }

  try {
    // Insert all sample data
    for (const item of sampleData) {
      await db.insert(scribeResponses).values({
        response: item.response,
        userVoice: item.userVoice,
        valence: item.valence,
        publishedToFeed: item.publishedToFeed,
        crisisDetected: false,
      });
    }

    console.log(`✅ Successfully seeded ${sampleData.length} feed items`);
    console.log(`   - ${sampleData.filter(d => d.valence === 'light').length} light valence`);
    console.log(`   - ${sampleData.filter(d => d.valence === 'heavy').length} heavy valence`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedFeedData();
