/**
 * RYVYNN SACRED GEOMETRY
 * 
 * Using Golden Ratio (φ = 1.618) and Dual Flame symbolism
 * for spacing, sizing, and visual harmony.
 * 
 * "From our darkest hours to our brightest days" - encoded in the ratios
 */

// Golden Ratio (φ)
export const PHI = 1.618033988749895;
export const PHI_INVERSE = 0.618033988749895;

// Sacred Dual Flame Scale (based on φ)
export const FLAME = {
  // Darkness to Light progression (φ multipliers)
  shadow: 8,           // Base darkness
  ember: 13,           // 8 * φ ≈ 13
  flame: 21,           // 13 * φ ≈ 21
  blaze: 34,           // 21 * φ ≈ 34
  inferno: 55,         // 34 * φ ≈ 55 (Fibonacci)
  radiance: 89,        // 55 * φ ≈ 89 (Fibonacci)
  transcendence: 144,  // 89 * φ ≈ 144 (Fibonacci)
};

// Dual Flame Spacing System (px values)
export const SPACE = {
  xs: FLAME.shadow,           // 8px
  sm: FLAME.ember,            // 13px
  md: FLAME.flame,            // 21px
  lg: FLAME.blaze,            // 34px
  xl: FLAME.inferno,          // 55px
  '2xl': FLAME.radiance,      // 89px
  '3xl': FLAME.transcendence, // 144px
};

// Sacred Typography Scale (based on 16px base * φ powers)
export const TYPE = {
  xs: Math.round(16 * Math.pow(PHI_INVERSE, 2)),   // ~10px
  sm: Math.round(16 * PHI_INVERSE),                 // ~10px
  base: 16,                                          // 16px
  md: Math.round(16 * PHI),                         // ~26px
  lg: Math.round(16 * Math.pow(PHI, 2)),            // ~42px
  xl: Math.round(16 * Math.pow(PHI, 3)),            // ~68px
  '2xl': Math.round(16 * Math.pow(PHI, 4)),         // ~110px
  '3xl': Math.round(16 * Math.pow(PHI, 5)),         // ~178px
};

// Impact Metrics (for visualization)
export const IMPACT = {
  livesSaved: 10_000_000,        // 10 Million Lives by 2030
  revenueGenerated: 1_000_000_000, // $1B+ for greater good
  globalReach: 195,              // Countries
  freeAccessUsers: 7_000_000,    // 70% free forever
};

// Dual Flame Brand Colors (exact)
export const COLORS = {
  cyan: '#00D9FF',
  purple: '#8B5CF6',
  black: '#000000',
  darkGray: '#1a1a1a',
  mediumGray: '#2d2d2d',
};

// Golden Ratio Border Radii
export const RADIUS = {
  sm: Math.round(8 * PHI_INVERSE),   // ~5px
  md: 8,                             // 8px
  lg: Math.round(8 * PHI),           // ~13px
  xl: Math.round(8 * Math.pow(PHI, 2)), // ~21px
};
