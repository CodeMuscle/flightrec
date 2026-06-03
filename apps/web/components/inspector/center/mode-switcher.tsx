"use client";

export const MODES = ["timeline", "diff", "causality", "payload", "presentation"] as const;
export type Mode = (typeof MODES)[number];

const ENABLED = new Set<Mode>(["timeline", "diff"]);

export function ModeSwitcher({ mode, onMode }: { mode: Mode; onMode: (m: Mode) => void }) {
  return (
    <div className="inline-flex items-center rounded-lg border border-line bg-bg-raised p-0.5">
      {MODES.map((m) => {
        const on = m === mode;
        const enabled = ENABLED.has(m);
        return (
          <button
            key={m}
            type="button"
            disabled={!enabled}
            aria-pressed={on}
            onClick={() => onMode(m)}
            title={enabled ? m : `${m} — soon`}
            className="rounded-md px-2.5 py-1 font-mono text-[11px] capitalize transition disabled:opacity-35"
            style={{
              background: on ? "var(--accent-soft)" : "transparent",
              color: on ? "var(--accent-dim)" : "var(--fg-muted)",
            }}
          >
            {m}
          </button>
        );
      })}
    </div>
  );
}
