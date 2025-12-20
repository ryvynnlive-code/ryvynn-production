/**
 * RYVYNN Trillion-Dollar Brightness System
 * 
 * Visual hierarchy: darkness → pillar → light
 * Homepage is darkest, deeper pages get progressively brighter
 */

export type BrightnessLevel = 1 | 2 | 3 | 4;

export interface BrightnessConfig {
  bg: string;
  text: string;
  accent: string;
  glow: string;
}

/**
 * Brightness level definitions
 * 
 * Level 1 (Darkest): Homepage - Pure void, maximum contrast
 * Level 2: Waitlist, Manifesto - Slightly lifted from void
 * Level 3: Journal, Feed, Rituals - Mid-range, comfortable reading
 * Level 4 (Brightest): Pricing, Account, Settings - Maximum clarity
 */
export const brightness: Record<BrightnessLevel, BrightnessConfig> = {
  1: {
    bg: "bg-black",
    text: "text-slate-300",
    accent: "text-blue-400",
    glow: "shadow-[0_0_20px_rgba(140,180,255,0.3)]",
  },
  2: {
    bg: "bg-[#020203]",
    text: "text-slate-200",
    accent: "text-blue-300",
    glow: "shadow-[0_0_15px_rgba(140,180,255,0.25)]",
  },
  3: {
    bg: "bg-[#0a0a0b]",
    text: "text-slate-100",
    accent: "text-blue-200",
    glow: "shadow-[0_0_10px_rgba(140,180,255,0.2)]",
  },
  4: {
    bg: "bg-[#121214]",
    text: "text-white",
    accent: "text-blue-100",
    glow: "shadow-[0_0_8px_rgba(140,180,255,0.15)]",
  },
};

/**
 * Get brightness config for a specific level
 */
export function getBrightness(level: BrightnessLevel): BrightnessConfig {
  return brightness[level];
}

/**
 * Page-to-brightness mapping
 */
export const pageBrightness: Record<string, BrightnessLevel> = {
  "/": 1,
  "/waitlist": 2,
  "/manifesto": 2,
  "/about": 2,
  "/trust": 2,
  "/journal": 3,
  "/feed": 3,
  "/rituals": 3,
  "/confess": 3,
  "/dark-hour": 3,
  "/pricing": 4,
  "/account": 4,
  "/settings": 4,
  "/dashboard": 4,
};

/**
 * Get brightness level for current page
 */
export function getPageBrightness(pathname: string): BrightnessLevel {
  return pageBrightness[pathname] || 3; // Default to level 3
}
