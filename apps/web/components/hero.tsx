"use client";

import { memo, useRef, useState } from "react";
import { useMotionValueEvent, useScroll } from "motion/react";
import { SessionTimelineMock, STEP_COUNT } from "./session-timeline-mock";
import { ClickToCopy } from "./click-to-copy";

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const MockMemo = memo(SessionTimelineMock);

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const [p, setP] = useState(0);

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => setP(v));

  // text: full opacity at rest, fades as the mockup rises over it
  const textOpacity = p <= 0.1 ? 1 : clamp(1 - (p - 0.1) / 0.18, 0, 1);
  const textY = -26 * clamp(p / 0.28, 0, 1);
  const textBlur = 7 * clamp((p - 0.12) / 0.18, 0, 1);

  // mockup: starts low (only ~half visible) → zooms up to fill the text area
  const rise = clamp(p / 0.36, 0, 1);
  const mockYvh = lerp(70, 0, rise);
  const mockScale = lerp(0.8, 1, rise);
  const mockOpacity = lerp(0.85, 1, clamp(p / 0.18, 0, 1));

  // steps play once the mockup is in place
  const step = clamp(
    Math.round(lerp(0, STEP_COUNT - 1, clamp((p - 0.38) / 0.56, 0, 1))),
    0,
    STEP_COUNT - 1,
  );

  return (
    <section ref={ref} className="relative h-[240vh]">
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* scroll progress hairline */}
        <div
          className="absolute left-0 top-0 z-40 h-0.5 bg-accent"
          style={{ width: `${p * 100}%` }}
        />

        {/* headline layer */}
        <div
          className="absolute inset-x-0 top-0 z-10 flex flex-col items-center px-5 pt-[12vh] text-center"
          style={{
            opacity: textOpacity,
            transform: `translateY(${textY}px)`,
            filter: `blur(${textBlur}px)`,
            pointerEvents: textOpacity < 0.05 ? "none" : "auto",
          }}
        >
          <div className="pill inline-flex items-center gap-2 border border-line bg-bg-raised/80 px-3.5 py-1.5 text-sm text-fg-muted shadow-(--shadow-sm) backdrop-blur">
            <span className="size-1.5 rounded-full bg-accent" />
            Introducing Flightrec
          </div>

          <h1 className="display mt-7 text-balance text-6xl sm:text-[5.75rem]">
            Debugging,
            <br />
            <span className="grad-text">rewound.</span>
          </h1>

          <div className="mt-7">
            <ClickToCopy text="npm i flightrec" />
          </div>

          <p className="mt-6 max-w-xl text-balance text-lg leading-relaxed text-fg-muted">
            Stop guessing what went wrong. Rewind your Next.js session and inspect every state
            change — with absolute clarity.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="/waitlist"
              className="pill bg-fg px-5 py-3 text-sm font-medium text-bg shadow-(--shadow-card) transition hover:opacity-90"
            >
              Try Flightrec for free
            </a>
            <a
              href="#architecture"
              className="pill border border-line bg-bg-raised px-5 py-3 text-sm font-medium text-fg shadow-(--shadow-sm) transition hover:border-line-strong"
            >
              Read the docs <span className="text-fg-faint">›</span>
            </a>
          </div>
        </div>

        {/* product mockup — starts low + half-visible, rises & zooms to center */}
        <div
          className="absolute inset-0 z-30 flex items-center justify-center px-5"
          style={{
            transform: `translateY(${mockYvh}vh) scale(${mockScale})`,
            transformOrigin: "center",
            opacity: mockOpacity,
          }}
        >
          <MockMemo step={step} />
        </div>

        <span
          className="absolute bottom-5 left-1/2 z-40 -translate-x-1/2 font-mono text-[11px] uppercase tracking-widest text-fg-faint"
          style={{ opacity: clamp(1 - p / 0.1, 0, 1) }}
        >
          scroll to replay ↓
        </span>
      </div>
    </section>
  );
}
