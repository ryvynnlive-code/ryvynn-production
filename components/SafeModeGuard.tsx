/**
 * SafeModeGuard — wraps any component that must be disabled in crisis
 * Ethics > revenue. SafeMode = feed disabled, upsells disabled, hotline only.
 * Usage: <SafeModeGuard><BlurredWall /></SafeModeGuard>
 */
'use client';

import { useSelector } from "react-redux";
import type { RootState } from "@/store";
import { Flame, Phone } from "lucide-react";

interface Props {
  children: React.ReactNode;
  /** If true, shows full children in SafeMode (for crisis resources themselves) */
  alwaysShow?: boolean;
}

export function SafeModeGuard({ children, alwaysShow = false }: Props) {
  const { safeModeActive, fsmState } = useSelector((s: RootState) => s.crisis);

  if (!safeModeActive || alwaysShow) return <>{children}</>;

  // SafeMode active — ethics > revenue: show crisis resources, hide all else
  return (
    <div className="rounded-2xl border border-red-900/50 bg-red-950/20 p-8 text-center">
      <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800/50 flex items-center justify-center mx-auto mb-4">
        <Flame className="h-6 w-6 text-red-400" />
      </div>
      <p className="text-red-300 font-semibold mb-2">The flame is with you right now.</p>
      <p className="text-zinc-500 text-sm mb-6">
        Premium access is paused. Everything you need is free right now.
      </p>
      <div className="space-y-3">
        <a
          href="tel:988"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-red-900/40 border border-red-800/50 text-red-300 font-semibold text-sm hover:bg-red-900/60 transition-all"
        >
          <Phone className="h-4 w-4" /> Call 988 — Crisis Lifeline
        </a>
        <a
          href="sms:741741&body=HOME"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-zinc-300 text-sm hover:bg-zinc-900 transition-all"
        >
          Text HOME to 741741
        </a>
      </div>
    </div>
  );
}
