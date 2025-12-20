/**
 * Crisis Detection System
 * Detects crisis keywords and patterns in user input
 * Returns crisis level and recommended resources
 */

const CRISIS_KEYWORDS = {
  immediate: [
    "suicide", "kill myself", "end my life", "want to die", "better off dead",
    "no reason to live", "can't go on", "goodbye cruel world", "final goodbye",
    "overdose", "jump off", "hang myself", "cut myself deep", "end it all",
  ],
  high: [
    "self harm", "hurt myself", "cutting", "burning myself", "hate myself",
    "worthless", "burden", "everyone would be better", "can't take it",
    "give up", "no hope", "hopeless", "pointless", "nothing matters",
  ],
  moderate: [
    "depressed", "anxiety", "panic", "scared", "alone", "isolated",
    "can't sleep", "nightmares", "flashbacks", "trauma", "abuse",
  ],
};

export type CrisisLevel = "none" | "moderate" | "high" | "immediate";

export interface CrisisDetectionResult {
  level: CrisisLevel;
  detected: boolean;
  keywords: string[];
  message: string;
  resources: {
    title: string;
    action: string;
    url?: string;
    phone?: string;
  }[];
}

/**
 * Detect crisis level in text input
 */
export function detectCrisis(text: string): CrisisDetectionResult {
  const lowerText = text.toLowerCase();
  const detectedKeywords: string[] = [];
  let level: CrisisLevel = "none";

  // Check immediate crisis keywords
  for (const keyword of CRISIS_KEYWORDS.immediate) {
    if (lowerText.includes(keyword)) {
      detectedKeywords.push(keyword);
      level = "immediate";
    }
  }

  // Check high crisis keywords (only if not already immediate)
  if (level !== "immediate") {
    for (const keyword of CRISIS_KEYWORDS.high) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        level = "high";
      }
    }
  }

  // Check moderate keywords (only if not already high/immediate)
  if (level === "none") {
    for (const keyword of CRISIS_KEYWORDS.moderate) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);
        level = "moderate";
      }
    }
  }

  return {
    level,
    detected: level !== "none",
    keywords: detectedKeywords,
    message: getCrisisMessage(level),
    resources: getCrisisResources(level),
  };
}

function getCrisisMessage(level: CrisisLevel): string {
  switch (level) {
    case "immediate":
      return "I'm concerned about your safety. Please reach out to crisis support immediately.";
    case "high":
      return "It sounds like you're going through a really difficult time. Please consider reaching out for support.";
    case "moderate":
      return "I hear that you're struggling. Remember that support is available if you need it.";
    default:
      return "";
  }
}

function getCrisisResources(level: CrisisLevel) {
  const resources = [];

  if (level === "immediate" || level === "high") {
    resources.push({
      title: "988 Suicide & Crisis Lifeline",
      action: "Call or text 988 (US) - Free, confidential, 24/7",
      phone: "988",
      url: "/988",
    });
    resources.push({
      title: "Emergency Services",
      action: "Call 911 if you are in immediate danger",
      phone: "911",
      url: "/911",
    });
  }

  if (level === "moderate" || level === "high" || level === "immediate") {
    resources.push({
      title: "Crisis Resources",
      action: "View local and international crisis hotlines",
      url: "/crisis",
    });
  }

  return resources;
}

/**
 * Add crisis detection to AI system prompt
 */
export function getCrisisAwareSystemPrompt(basePrompt: string, ageTier?: string): string {
  const crisisGuidance = `
CRITICAL SAFETY PROTOCOL:
If the user expresses suicidal thoughts, self-harm intent, or immediate danger:
1. Acknowledge their pain with compassion
2. ALWAYS include: "Please reach out to 988 (call or text) or visit /crisis for immediate support"
3. Do not attempt to provide therapy or medical advice
4. Keep your response brief and focused on connecting them to professional help

${ageTier === "MINOR_13_17" ? "This user is a minor (13-17). Use age-appropriate language and be extra cautious about crisis situations." : ""}
`;

  return `${basePrompt}\n\n${crisisGuidance}`;
}
