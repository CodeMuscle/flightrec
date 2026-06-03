"use client";

import type { Session } from "@flightrec/trace-schema";
import { useMemo, useRef, useState } from "react";
import { type Plane, eventLabel, planeColor, planeLanes, tickBounds } from "./lib/derive";

const PAD = 10; // px inset so first/last dots clear the track edges
const ROW_H = 28; // px per lane row — labels + track share this so they align

/**
 * Region ② — the spine. One lane per plane, a dot per event positioned by `tick`,
 * and a draggable playhead. Reports a fractional tick up to the parent, which
 * rounds + clamps it (derive.clampTick); this stays purely presentational.
 */
export function ScrubTimeline({
  session,
  tick,
  activePlanes,
  onScrub,
}: {
  session: Session;
  tick: number;
  activePlanes: ReadonlySet<Plane>;
  onScrub: (tick: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);

  const { min, max } = useMemo(() => tickBounds(session), [session]);
  const lanes = useMemo(() => planeLanes(session, tick), [session, tick]);
  const span = max - min || 1;

  const left = (t: number) => `calc(${PAD}px + ${(t - min) / span} * (100% - ${2 * PAD}px))`;

  const tickFromClientX = (clientX: number) => {
    const el = trackRef.current;
    if (!el) return tick;
    const r = el.getBoundingClientRect();
    const ratio = (clientX - r.left - PAD) / (r.width - 2 * PAD);
    return min + Math.max(0, Math.min(1, ratio)) * span;
  };

  return (
    <div className="bg-bg-raised px-4 py-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
          Session timeline
        </span>
        <span className="font-mono text-[11px] text-fg-faint">
          {session.events.length} events · {max - min + 1} ticks
        </span>
      </div>

      <div className="flex gap-3">
        {/* lane labels — share ROW_H with the track so rows line up */}
        <div className="shrink-0">
          {lanes.map((lane) => (
            <div
              key={lane.plane}
              className="flex items-center justify-end font-mono text-[11px]"
              style={{
                height: ROW_H,
                color: planeColor(lane.plane),
                opacity: activePlanes.has(lane.plane) ? 1 : 0.3,
              }}
            >
              {lane.plane}
            </div>
          ))}
        </div>

        {/* track — single positioning context so one playhead spans all lanes */}
        <div
          ref={trackRef}
          role="slider"
          aria-label="Session playhead"
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={tick}
          tabIndex={0}
          className="relative flex-1 cursor-pointer touch-none select-none"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            setDragging(true);
            onScrub(tickFromClientX(e.clientX));
          }}
          onPointerMove={(e) => {
            if (dragging) onScrub(tickFromClientX(e.clientX));
          }}
          onPointerUp={(e) => {
            setDragging(false);
            e.currentTarget.releasePointerCapture(e.pointerId);
          }}
        >
          {/* playhead */}
          <div
            className="pointer-events-none absolute top-0 bottom-0 z-20 w-px"
            style={{ left: left(tick), background: "var(--accent)" }}
          >
            <div
              className="absolute -top-1 -translate-x-1/2 size-2 rotate-45 rounded-xs"
              style={{ background: "var(--accent)" }}
            />
          </div>

          {lanes.map((lane) => (
            <div
              key={lane.plane}
              className="relative"
              style={{ height: ROW_H, opacity: activePlanes.has(lane.plane) ? 1 : 0.18 }}
            >
              {/* rail */}
              <div
                className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2"
                style={{ background: "var(--line)" }}
              />
              {lane.dots.map((dot) => {
                const color = planeColor(lane.plane);
                const onTick = dot.event.tick === tick;
                return (
                  <span
                    key={dot.event.id}
                    title={`${eventLabel(dot.event)} · tick ${dot.event.tick} · +${dot.event.ts}ms`}
                    className="pointer-events-none absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full transition-transform"
                    style={{
                      left: left(dot.event.tick),
                      background: dot.isPast ? color : "var(--bg-raised)",
                      border: `1.5px solid ${color}`,
                      opacity: dot.isPast ? 1 : 0.55,
                      // centering is handled by the -translate classes (CSS `translate`
                      // property in Tailwind v4); this only scales the active dot.
                      transform: onTick ? "scale(1.5)" : undefined,
                      boxShadow: onTick
                        ? `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)`
                        : "none",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
