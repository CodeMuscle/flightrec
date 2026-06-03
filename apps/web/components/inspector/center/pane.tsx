"use client";

import type { TraceEvent } from "@flightrec/trace-schema";
import { type Plane, eventDetail, eventLabel, planeColor } from "../lib/derive";

export function Pane({
  title,
  plane,
  events,
  empty,
  currentTick,
}: {
  title: string;
  plane: Plane;
  events: TraceEvent[];
  empty: string;
  currentTick: number;
}) {
  const color = planeColor(plane);
  return (
    <div className="flex flex-col rounded-xl border border-line bg-bg-raised">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <span className="size-2 rounded-full" style={{ background: color }} />
        <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color }}>
          {title}
        </span>
        <span className="ml-auto font-mono text-[11px] text-fg-faint">{events.length}</span>
      </div>
      {events.length === 0 ? (
        <p className="px-3 py-4 font-mono text-[11px] text-fg-faint">{empty}</p>
      ) : (
        <ul className="flex flex-col gap-1 p-2">
          {events.map((e) => {
            const isLatest = e.tick === currentTick;
            return (
              <li
                key={e.id}
                className="rounded-lg px-2 py-1.5"
                style={{
                  background: isLatest
                    ? `color-mix(in srgb, ${color} 12%, transparent)`
                    : "transparent",
                  boxShadow: isLatest ? `inset 2px 0 0 ${color}` : "none",
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-fg">{eventLabel(e)}</span>
                  <span className="ml-auto font-mono text-[10px] text-fg-faint">+{e.ts}ms</span>
                </div>
                <div className="font-mono text-[11px] text-fg-muted">{eventDetail(e)}</div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
