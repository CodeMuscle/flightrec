"use client";

import type { Session } from "@flightrec/trace-schema";
import { useCallback } from "react";
import { FilterChips } from "./filter-chips";
import { type Plane, eventLabel, filterEvents, planeColor, planeForPhase } from "./lib/derive";

export function EventIndex({
  session,
  tick,
  activePlanes,
  onToggle,
  onSelect,
}: {
  session: Session;
  tick: number;
  activePlanes: ReadonlySet<Plane>;
  onToggle: (plane: Plane) => void;
  onSelect: (tick: number) => void;
}) {
  const events = filterEvents(session, activePlanes);

  // callback ref on the active row: React invokes it whenever that row changes
  // (i.e. as you scrub), scrolling the current event into view. No effect / dep
  // array needed — the ref naturally moves to the new active row.
  const scrollActiveIntoView = useCallback((node: HTMLButtonElement | null) => {
    node?.scrollIntoView({ block: "nearest" });
  }, []);

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b border-line px-3 py-2.5">
        <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">Events</span>
        <span className="font-mono text-[11px] text-fg-faint">{events.length}</span>
        <div className="ml-auto">
          <FilterChips active={activePlanes} onToggle={onToggle} />
        </div>
      </div>

      <div className="pane-scroll max-h-72 overflow-y-auto">
        {events.length === 0 ? (
          <p className="px-3 py-6 text-center font-mono text-[11px] text-fg-faint">
            no events match the active planes
          </p>
        ) : (
          events.map((e) => {
            const isActive = e.tick === tick;
            return (
              <button
                key={e.id}
                type="button"
                ref={isActive ? scrollActiveIntoView : undefined}
                onClick={() => onSelect(e.tick)}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-left transition-colors"
                style={{
                  background: isActive ? "var(--accent-soft)" : "transparent",
                  boxShadow: isActive ? "inset 2px 0 0 var(--accent)" : "none",
                }}
              >
                <span className="w-5 shrink-0 font-mono text-[11px] text-fg-faint">
                  {String(e.tick).padStart(2, "0")}
                </span>
                <span
                  className="size-2 shrink-0 rounded-full"
                  style={{ background: planeColor(planeForPhase(e.phase)) }}
                />
                <span className="min-w-0 flex-1 truncate font-mono text-xs text-fg">
                  {eventLabel(e)}
                </span>
                <span className="shrink-0 font-mono text-[11px] text-fg-faint">+{e.ts}ms</span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
