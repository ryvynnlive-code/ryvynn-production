'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, MessageCircle, Globe, ArrowLeft } from 'lucide-react';

const BREATHE_PHASES = [
  { label: 'Breathe In...', duration: 4000 },
  { label: 'Hold...', duration: 4000 },
  { label: 'Breathe Out...', duration: 4000 },
];

interface SafeModeProps {
  isActive: boolean;
  onExit: () => void;
}

export function SafeMode({ isActive, onExit }: SafeModeProps) {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (!isActive) return;
    const phase = BREATHE_PHASES[phaseIndex];
    const timeout = setTimeout(() => {
      setPhaseIndex((prev) => (prev + 1) % BREATHE_PHASES.length);
    }, phase.duration);
    return () => clearTimeout(timeout);
  }, [phaseIndex, isActive]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] bg-background flex flex-col items-center justify-center px-6"
        >
          {/* Status text */}
          <p className="absolute top-8 left-0 right-0 text-center text-sm text-muted-foreground">
            Safe Mode Active — You are not alone.
          </p>

          {/* Breathing circle */}
          <div className="flex flex-col items-center gap-8 mb-16">
            <div className="relative flex items-center justify-center" style={{ width: 200, height: 200 }}>
              <motion.div
                animate={{
                  scale: phaseIndex === 0 ? [0.6, 1] : phaseIndex === 1 ? 1 : [1, 0.6],
                  opacity: phaseIndex === 0 ? [0.3, 0.6] : phaseIndex === 1 ? 0.6 : [0.6, 0.3],
                }}
                transition={{
                  duration: BREATHE_PHASES[phaseIndex].duration / 1000,
                  ease: 'easeInOut',
                }}
                className="rounded-full"
                style={{
                  width: 180,
                  height: 180,
                  background: 'radial-gradient(circle, rgba(249,115,22,0.12), rgba(249,115,22,0.03))',
                  border: '1px solid rgba(249,115,22,0.15)',
                }}
              />
              {/* Inner circle */}
              <motion.div
                animate={{
                  scale: phaseIndex === 0 ? [0.5, 1] : phaseIndex === 1 ? 1 : [1, 0.5],
                }}
                transition={{
                  duration: BREATHE_PHASES[phaseIndex].duration / 1000,
                  ease: 'easeInOut',
                }}
                className="absolute rounded-full"
                style={{
                  width: 100,
                  height: 100,
                  background: 'radial-gradient(circle, rgba(249,115,22,0.2), rgba(249,115,22,0.05))',
                }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={phaseIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.5 }}
                className="text-xl text-foreground/80 font-light tracking-wide"
              >
                {BREATHE_PHASES[phaseIndex].label}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* Crisis hotline cards */}
          <div className="w-full max-w-sm flex flex-col gap-3">
            <a
              href="tel:988"
              className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <Phone className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">988 Suicide & Crisis Lifeline</p>
                <p className="text-xs text-muted-foreground">Call now</p>
              </div>
            </a>

            <a
              href="sms:741741"
              className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <MessageCircle className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Crisis Text Line</p>
                <p className="text-xs text-muted-foreground">Text 741741</p>
              </div>
            </a>

            <a
              href="https://988lifeline.org/chat"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                <Globe className="h-4 w-4 text-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Chat Online</p>
                <p className="text-xs text-muted-foreground">988lifeline.org</p>
              </div>
            </a>
          </div>

          {/* Exit button */}
          <button
            onClick={onExit}
            className="mt-10 inline-flex items-center gap-2 text-accent/70 hover:text-accent text-sm transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {"I'm okay, take me back"}
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
