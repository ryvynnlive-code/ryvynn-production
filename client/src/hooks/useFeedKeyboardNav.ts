import { useEffect, useState } from "react";

/**
 * useFeedKeyboardNav
 * 
 * Provides keyboard navigation for feed items:
 * - ArrowDown: Next item
 * - ArrowUp: Previous item
 * - Enter: Select/open item
 */
export function useFeedKeyboardNav(itemCount: number, onSelect?: (index: number) => void) {
  const [focusedIndex, setFocusedIndex] = useState(0);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle keyboard nav when not in an input/textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setFocusedIndex((prev) => Math.min(prev + 1, itemCount - 1));
          break;

        case "ArrowUp":
          e.preventDefault();
          setFocusedIndex((prev) => Math.max(prev - 1, 0));
          break;

        case "Enter":
          e.preventDefault();
          if (onSelect) {
            onSelect(focusedIndex);
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [focusedIndex, itemCount, onSelect]);

  return { focusedIndex, setFocusedIndex };
}
