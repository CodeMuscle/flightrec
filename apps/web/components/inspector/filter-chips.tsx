"use client";

import { PLANES, type Plane, planeColor } from "./lib/derive";

export function FilterChips({
  active,
  onToggle,
}: {
  active: ReadonlySet<Plane>;
  onToggle: (plane: Plane) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {PLANES.map((plane) => {
        const on = active.has(plane);
        const color = planeColor(plane);
        return (
          <button
            key={plane}
            type="button"
            aria-pressed={on}
            onClick={() => onToggle(plane)}
            className="pill flex items-center gap-1.5 border px-2 py-0.5 font-mono text-[10px] transition"
            style={{
              borderColor: on ? color : "var(--line)",
              background: on ? `color-mix(in srgb, ${color} 14%, transparent)` : "transparent",
              color: on ? color : "var(--fg-faint)",
            }}
          >
            <span
              className="size-1.5 rounded-full"
              style={{ background: on ? color : "var(--fg-faint)", opacity: on ? 1 : 0.5 }}
            />
            {plane}
          </button>
        );
      })}
    </div>
  );
}
