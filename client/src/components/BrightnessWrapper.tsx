import { useLocation } from "wouter";
import { getPageBrightness, type BrightnessLevel } from "@/lib/brightness";
import { ReactNode } from "react";

interface BrightnessWrapperProps {
  children: ReactNode;
}

/**
 * BrightnessWrapper
 * 
 * Applies brightness-level styling based on current route
 * Creates the "darkness → light" visual hierarchy across the app
 */
export default function BrightnessWrapper({ children }: BrightnessWrapperProps) {
  const [location] = useLocation();
  
  // Get brightness level for current page
  const brightness = getPageBrightness(location);
  
  // Map brightness level to Tailwind classes
  const brightnessClasses: Record<BrightnessLevel, string> = {
    1: "bg-black text-slate-100", // Darkest - pure void
    2: "bg-[#0a0a0b] text-slate-200", // Slightly lifted from void
    3: "bg-[#111113] text-slate-300", // Mid-range, comfortable reading
    4: "bg-[#1a1a1c] text-slate-100", // Brightest - maximum clarity
  };
  
  return (
    <div className={`min-h-screen ${brightnessClasses[brightness]} transition-colors duration-500`}>
      {children}
    </div>
  );
}
