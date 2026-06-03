"use client";

import type { Session } from "@flightrec/trace-schema";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  clampTick,
  eventAtTick,
  eventLabel,
  planeColor,
  planeForPhase,
  tickBounds,
} from "./lib/derive";
import { ScrubTimeline } from "./scrub-timeline";

const PLAY_MS = 650; // dwell per tick during playback

export function Inspector({ session }: { session: Session }) {
  const { min, max } = useMemo(() => tickBounds(session), [session]);
  const [tick, setTick] = useState(min);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  const setClamped = useCallback(
    (next: number) => setTick((t) => clampTick(session, typeof next === "number" ? next : t)),
    [session],
  );
  const step = useCallback(
    (delta: number) => {
      setPlaying(false);
      setTick((t) => clampTick(session, t + delta));
    },
    [session],
  );

  // playback loop — disabled under reduced-motion (no auto-advancing motion).
  // The advance + auto-stop happen inside the timeout (async), never synchronously
  // in the effect body, so we don't trigger cascading renders.
  useEffect(() => {
    if (!playing || reduce || tick >= max) return;
    const id = setTimeout(() => {
      const next = clampTick(session, tick + 1);
      setTick(next);
      if (next >= max) setPlaying(false);
    }, PLAY_MS);
    return () => clearTimeout(id);
  }, [playing, reduce, tick, max, session]);

  const togglePlay = useCallback(() => {
    if (reduce) return;
    if (tick >= max) {
      setClamped(min);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  }, [reduce, tick, max, min, setClamped]);

  // keyboard transport — the timeline is the single source of "current tick".
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          step(-1);
          break;
        case "ArrowRight":
          e.preventDefault();
          step(1);
          break;
        case "Home":
          e.preventDefault();
          setPlaying(false);
          setClamped(min);
          break;
        case "End":
          e.preventDefault();
          setPlaying(false);
          setClamped(max);
          break;
        case " ":
          e.preventDefault();
          togglePlay();
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [step, setClamped, min, max, togglePlay]);

  const current = eventAtTick(session, tick);

  return (
    <div
      className="card mx-auto w-full max-w-6xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-float)" }}
    >
      {/* ① top bar — session header */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line bg-bg-inset px-4 py-2.5">
        <span className="flex items-center gap-2 font-mono text-xs text-fg">
          <span className="size-1.5 rounded-full bg-accent" />
          {session.id}
        </span>
        {session.route && <span className="font-mono text-xs text-fg-muted">{session.route}</span>}
        {session.nextVersion && (
          <span className="font-mono text-[11px] text-fg-faint">next {session.nextVersion}</span>
        )}
        <span className="ml-auto font-mono text-[11px] text-fg-faint">
          tick {String(tick).padStart(2, "0")} / {String(max).padStart(2, "0")}
        </span>
      </div>

      {/* ② scrub timeline — the spine */}
      <ScrubTimeline session={session} tick={tick} onScrub={setClamped} />

      {/* transport + current-event readout (slim; full panes land in later modules) */}
      <div className="flex flex-wrap items-center gap-3 border-t border-line bg-bg-raised px-4 py-3">
        <Transport
          onFirst={() => {
            setPlaying(false);
            setClamped(min);
          }}
          onPrev={() => step(-1)}
          onPlay={togglePlay}
          onNext={() => step(1)}
          onLast={() => {
            setPlaying(false);
            setClamped(max);
          }}
          playing={playing}
          canPlay={!reduce}
        />

        <div className="mx-1 h-5 w-px bg-line" />

        {current ? (
          <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
            <span
              className="pill px-2 py-0.5 font-mono text-[11px]"
              style={{
                color: planeColor(planeForPhase(current.phase)),
                background: "color-mix(in srgb, currentColor 12%, transparent)",
              }}
            >
              {planeForPhase(current.phase)}
            </span>
            <span className="font-mono text-xs text-fg">{eventLabel(current)}</span>
            <span className="font-mono text-[11px] text-fg-faint">+{current.ts}ms</span>
            {current.sourceRef && (
              <span className="truncate font-mono text-[11px] text-fg-muted">
                {current.sourceRef}
              </span>
            )}
          </div>
        ) : (
          <span className="font-mono text-[11px] text-fg-faint">— no event on this tick —</span>
        )}

        <span className="ml-auto hidden font-mono text-[11px] text-fg-faint sm:inline">
          ← → step · space play
        </span>
      </div>
    </div>
  );
}

function Transport({
  onFirst,
  onPrev,
  onPlay,
  onNext,
  onLast,
  playing,
  canPlay,
}: {
  onFirst: () => void;
  onPrev: () => void;
  onPlay: () => void;
  onNext: () => void;
  onLast: () => void;
  playing: boolean;
  canPlay: boolean;
}) {
  return (
    <div className="flex items-center gap-1">
      <TransportButton label="First tick" onClick={onFirst}>
        ⏮
      </TransportButton>
      <TransportButton label="Previous tick" onClick={onPrev}>
        ◀
      </TransportButton>
      <TransportButton
        label={playing ? "Pause" : "Play"}
        onClick={onPlay}
        disabled={!canPlay}
        primary
      >
        {playing ? "⏸" : "▶"}
      </TransportButton>
      <TransportButton label="Next tick" onClick={onNext}>
        ▶
      </TransportButton>
      <TransportButton label="Last tick" onClick={onLast}>
        ⏭
      </TransportButton>
    </div>
  );
}

function TransportButton({
  children,
  label,
  onClick,
  disabled,
  primary,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  primary?: boolean;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className="flex size-8 items-center justify-center rounded-lg border text-xs transition disabled:opacity-40"
      style={{
        borderColor: "var(--line)",
        background: primary ? "var(--accent-soft)" : "var(--bg-inset)",
        color: primary ? "var(--accent-dim)" : "var(--fg-muted)",
      }}
    >
      {children}
    </button>
  );
}
