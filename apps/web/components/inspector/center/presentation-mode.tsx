"use client";

import type { Session } from "@flightrec/trace-schema";
import {
  eventAtTick,
  eventDetail,
  narrate,
  planeColor,
  planeForPhase,
  tickBounds,
} from "../lib/derive";

export function PresentationMode({ session, tick }: { session: Session; tick: number }) {
  const { min, max } = tickBounds(session);
  const event = eventAtTick(session, tick);
  const total = max - min + 1;
  const step = tick - min + 1;
  const color = event ? planeColor(planeForPhase(event.phase)) : "var(--fg-faint)";

  return (
    <div className="flex min-h-80 flex-col items-center justify-center gap-6 p-8 text-center">
      <span className="font-mono text-[11px] uppercase tracking-widest text-fg-faint">
        Step {step} of {total}
      </span>

      {event ? (
        <>
          <span
            className="pill px-3 py-1 font-mono text-xs uppercase tracking-wider"
            style={{
              color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
            }}
          >
            {planeForPhase(event.phase)}
          </span>
          <p className="max-w-xl text-balance text-2xl font-medium leading-snug text-fg sm:text-3xl">
            {narrate(event)}
          </p>
          <p className="font-mono text-xs text-fg-muted">{eventDetail(event)}</p>
        </>
      ) : (
        <p className="text-xl text-fg-faint">—</p>
      )}

      <div className="mt-2 flex w-full max-w-xs items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-bg-inset">
          <div
            className="h-full rounded-full bg-accent transition-all"
            style={{ width: `${(step / total) * 100}%` }}
          />
        </div>
        <span className="font-mono text-[11px] text-fg-faint">
          {String(tick).padStart(2, "0")}/{String(max).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
