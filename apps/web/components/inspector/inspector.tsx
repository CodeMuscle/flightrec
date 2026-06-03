"use client";

import type { Session } from "@flightrec/trace-schema";
import { useReducedMotion } from "motion/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TimelineMode } from "./center/timeline-mode";
import { EventIndex } from "./event-index";
import { PLANES, type Plane, clampTick, tickBounds } from "./lib/derive";
import { ScrubTimeline } from "./scrub-timeline";
import { DiffMode } from "./center/diff-mode";
import { type Mode, ModeSwitcher } from "./center/mode-switcher";

const PLAY_MS = 650; // dwell per tick during playback

export function Inspector({ session }: { session: Session }) {
  const { min, max } = useMemo(() => tickBounds(session), [session]);
  const [tick, setTick] = useState(min);
  const [playing, setPlaying] = useState(false);
  const [activePlanes, setActivePlanes] = useState<Set<Plane>>(() => new Set(PLANES));
  const [mode, setMode] = useState<Mode>("timeline");
  const reduce = useReducedMotion();

  const setClamped = useCallback((next: number) => setTick(clampTick(session, next)), [session]);
  const step = useCallback(
    (delta: number) => {
      setPlaying(false);
      setTick((t) => clampTick(session, t + delta));
    },
    [session],
  );

  const togglePlane = useCallback((plane: Plane) => {
    setActivePlanes((prev) => {
      const next = new Set(prev);
      if (next.has(plane)) next.delete(plane);
      else next.add(plane);
      return next;
    });
  }, []);

  useEffect(() => {
    if (!playing || reduce || tick >= max) return;
    const id = setTimeout(() => {
      const nextTick = clampTick(session, tick + 1);
      setTick(nextTick);
      if (nextTick >= max) setPlaying(false);
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
        <div className="mx-auto">
          <ModeSwitcher mode={mode} onMode={setMode} />
        </div>
        <span className="font-mono text-[11px] text-fg-faint">
          tick {String(tick).padStart(2, "0")} / {String(max).padStart(2, "0")}
        </span>
      </div>

      {/* ② scrub timeline — the spine */}
      <ScrubTimeline
        session={session}
        tick={tick}
        activePlanes={activePlanes}
        onScrub={setClamped}
      />

      {/* transport */}
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
        <span className="ml-auto hidden font-mono text-[11px] text-fg-faint sm:inline">
          ← → step · space play · click a row to jump
        </span>
      </div>

      {/* ③ event index + ④ center timeline mode */}
      <div className="grid border-t border-line lg:grid-cols-[minmax(0,18rem)_1fr]">
        <div className="border-b border-line lg:border-b-0 lg:border-r">
          <EventIndex
            session={session}
            tick={tick}
            activePlanes={activePlanes}
            onToggle={togglePlane}
            onSelect={setClamped}
          />
        </div>
        {mode === "timeline" ? (
          <TimelineMode session={session} tick={tick} />
        ) : (
          <DiffMode session={session} tick={tick} />
        )}
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
