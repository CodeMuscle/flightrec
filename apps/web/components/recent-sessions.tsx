import Link from "next/link";
import { listSessions } from "@/lib/session-store";

/** Server component: lists recently stored traces as links into the inspector. */
export function RecentSessions({ activeId }: { activeId?: string }) {
  const sessions = listSessions().slice(0, 6);
  if (sessions.length === 0) return null;

  return (
    <div className="mb-6 flex flex-wrap items-center justify-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
        recent traces
      </span>
      {sessions.map((s) => {
        const on = s.id === activeId;
        return (
          <Link
            key={s.id}
            href={`/inspector?session=${s.id}`}
            className="pill border px-2.5 py-1 font-mono text-[11px] transition"
            style={{
              borderColor: on ? "var(--accent)" : "var(--line)",
              color: on ? "var(--accent)" : "var(--fg-muted)",
            }}
          >
            {s.id} · {s.events.length}ev
          </Link>
        );
      })}
    </div>
  );
}
