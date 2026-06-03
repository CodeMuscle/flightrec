"use client";

import type { Session } from "@flightrec/trace-schema";
import {
  eventDetail,
  eventLabel,
  eventsAtTick,
  planeColor,
  planeForPhase,
  previousOnPlane,
} from "../lib/derive";

export function DiffMode({ session, tick }: { session: Session; tick: number }) {
  const changed = eventsAtTick(session, tick);

  return (
    <div className="flex flex-col gap-3 p-4">
      <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
        Δ change at tick {String(tick).padStart(2, "0")}
      </span>

      {changed.length === 0 ? (
        <p className="font-mono text-[11px] text-fg-faint">no change on this tick</p>
      ) : (
        changed.map((e) => {
          const plane = planeForPhase(e.phase);
          const color = planeColor(plane);
          const before = previousOnPlane(session, plane, tick);
          return (
            <div key={e.id} className="rounded-xl border border-line bg-bg-raised p-3">
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full" style={{ background: color }} />
                <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color }}>
                  {plane}
                </span>
                <span className="ml-auto font-mono text-[11px] text-fg-faint">
                  {eventLabel(e)} · +{e.ts}ms
                </span>
              </div>

              <div className="mt-2 grid gap-1.5">
                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="w-12 shrink-0 text-fg-faint">before</span>
                  <span className="truncate text-fg-muted">
                    {before ? eventDetail(before) : "—"}
                  </span>
                </div>
                <div
                  className="flex items-center gap-2 rounded-lg px-2 py-1 font-mono text-[11px]"
                  style={{
                    background: `color-mix(in srgb, ${color} 12%, transparent)`,
                  }}
                >
                  <span className="w-12 shrink-0 text-fg-faint">after</span>
                  <span className="truncate" style={{ color }}>
                    {eventDetail(e)}
                  </span>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
