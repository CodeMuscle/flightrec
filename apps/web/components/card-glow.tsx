"use client";

import { useEffect } from "react";

/**
 * Tracks the pointer over any `.card` and writes its local position into `--mx`/`--my`,
 * which globals.css uses to draw a reflective border glow that follows the cursor.
 * One delegated listener, rAF-throttled so getBoundingClientRect runs at most per frame.
 */
export function CardGlow() {
  useEffect(() => {
    let raf = 0;
    let last: PointerEvent | null = null;

    const apply = () => {
      raf = 0;
      const e = last;
      const card = (e?.target as HTMLElement | null)?.closest?.(".card") as HTMLElement | null;
      if (!e || !card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", `${e.clientX - r.left}px`);
      card.style.setProperty("--my", `${e.clientY - r.top}px`);
    };

    const onMove = (e: PointerEvent) => {
      last = e;
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return null;
}
