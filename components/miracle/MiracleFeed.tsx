'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MiracleCard } from './MiracleCard';

const SAMPLE_MIRACLES = [
  "I carried a storm inside me for years.\nToday, for the first time,\nI felt the sun break through.",
  "They said I was too broken to be loved.\nBut the cracks are where\nthe light learned to enter.",
  "I whispered my pain into the void.\nThe void whispered back:\n'You are not alone.'",
  "Three years of silence.\nOne moment of honesty.\nA lifetime of healing began.",
  "I thought the fire would consume me.\nInstead, it forged me\ninto something unbreakable.",
  "The weight I carried\nwasn't mine to hold.\nI finally set it down today.",
  "In my darkest hour,\na stranger's words found me.\nNow I carry their light forward.",
  "I stopped waiting for rescue\nand became my own miracle.\nThe flame was inside me all along.",
];

export function MiracleFeed() {
  const [visibleMiracles, setVisibleMiracles] = useState<string[]>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    // Start with first 3 miracles
    const initial = SAMPLE_MIRACLES.slice(0, 3);
    setVisibleMiracles(initial);
    indexRef.current = 3;

    const interval = setInterval(() => {
      if (indexRef.current < SAMPLE_MIRACLES.length) {
        setVisibleMiracles((prev) => [
          SAMPLE_MIRACLES[indexRef.current],
          ...prev,
        ]);
        indexRef.current++;
      } else {
        // Loop back
        indexRef.current = 0;
        setVisibleMiracles((prev) => [
          SAMPLE_MIRACLES[indexRef.current],
          ...prev.slice(0, 5),
        ]);
        indexRef.current++;
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col gap-4 max-h-[520px] overflow-hidden relative">
      <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent z-10 pointer-events-none" />
      <AnimatePresence mode="popLayout">
        {visibleMiracles.map((text, i) => (
          <MiracleCard key={`${text.slice(0, 20)}-${i}`} text={text} index={0} />
        ))}
      </AnimatePresence>
    </div>
  );
}
