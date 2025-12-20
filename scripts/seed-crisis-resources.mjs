import { drizzle } from "drizzle-orm/mysql2";
import { crisisResources } from "../drizzle/schema.js";

const db = drizzle(process.env.DATABASE_URL);

const resources = [
  {
    name: "National Suicide Prevention Lifeline",
    country: "US",
    region: null,
    phone: "988",
    sms: null,
    website: "https://988lifeline.org",
    description: "24/7, free and confidential support for people in distress, prevention and crisis resources.",
    available24_7: true,
  },
  {
    name: "Crisis Text Line",
    country: "US",
    region: null,
    phone: null,
    sms: "741741",
    website: "https://www.crisistextline.org",
    description: "Text HOME to 741741 to connect with a Crisis Counselor. Free 24/7 support.",
    available24_7: true,
  },
  {
    name: "SAMHSA National Helpline",
    country: "US",
    region: null,
    phone: "1-800-662-4357",
    sms: null,
    website: "https://www.samhsa.gov/find-help/national-helpline",
    description: "Treatment referral and information service for mental health and substance abuse.",
    available24_7: true,
  },
  {
    name: "Veterans Crisis Line",
    country: "US",
    region: null,
    phone: "988",
    sms: "838255",
    website: "https://www.veteranscrisisline.net",
    description: "Press 1 after calling 988. Confidential support for Veterans and their families.",
    available24_7: true,
  },
  {
    name: "The Trevor Project",
    country: "US",
    region: null,
    phone: "1-866-488-7386",
    sms: "678678",
    website: "https://www.thetrevorproject.org",
    description: "Crisis intervention and suicide prevention for LGBTQ+ youth.",
    available24_7: true,
  },
  {
    name: "Samaritans",
    country: "UK",
    region: null,
    phone: "116 123",
    sms: null,
    website: "https://www.samaritans.org",
    description: "Whatever you're going through, a Samaritan will face it with you.",
    available24_7: true,
  },
  {
    name: "Lifeline Australia",
    country: "AU",
    region: null,
    phone: "13 11 14",
    sms: "0477 131 114",
    website: "https://www.lifeline.org.au",
    description: "24-hour crisis support and suicide prevention services.",
    available24_7: true,
  },
  {
    name: "Kids Help Phone",
    country: "CA",
    region: null,
    phone: "1-800-668-6868",
    sms: "686868",
    website: "https://kidshelpphone.ca",
    description: "Professional counseling, information and referrals for young people.",
    available24_7: true,
  },
];

async function seed() {
  console.log("Seeding crisis resources...");
  
  for (const resource of resources) {
    await db.insert(crisisResources).values(resource).onDuplicateKeyUpdate({
      set: { updatedAt: new Date() },
    });
  }
  
  console.log(`✓ Seeded ${resources.length} crisis resources`);
  process.exit(0);
}

seed().catch((error) => {
  console.error("Error seeding crisis resources:", error);
  process.exit(1);
});
