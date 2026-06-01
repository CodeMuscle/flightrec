import { SectionLabel } from "./problem";

/*
  Honest positioning. Replay.io is a true time-travel debugger but for client JS — it has no
  notion of Server Actions, cache tags, or the RSC/Flight payload. Sentry replays the DOM, not
  server causality. Vercel Observability is traces/metrics. Next.js MCP is runtime metadata.
*/

type Val = boolean | "partial" | "meta";

const COLS = [
  { key: "rs", label: "Rewindscope", note: "this project", accent: true },
  { key: "replay", label: "Replay.io", note: "client JS time-travel", accent: false },
  { key: "sentry", label: "Sentry Replay", note: "DOM session replay", accent: false },
  { key: "vercel", label: "Vercel Obs.", note: "traces + metrics", accent: false },
  { key: "mcp", label: "Next.js MCP", note: "runtime metadata", accent: false },
  { key: "otel", label: "OpenTelemetry", note: "spans", accent: false },
] as const;

type RowKey = (typeof COLS)[number]["key"];
type Row = { cap: string } & Record<RowKey, Val>;

const ROWS: Row[] = [
  { cap: "Session-level time-travel replay", rs: true, replay: true, sentry: "partial", vercel: false, mcp: false, otel: false },
  { cap: "Server Action causality", rs: true, replay: false, sentry: false, vercel: false, mcp: "meta", otel: "partial" },
  { cap: "Cache invalidation semantics", rs: true, replay: false, sentry: false, vercel: false, mcp: false, otel: false },
  { cap: "RSC / Flight payload frames", rs: true, replay: false, sentry: false, vercel: false, mcp: false, otel: false },
  { cap: "Client tree reconciliation diff", rs: true, replay: "partial", sentry: "partial", vercel: false, mcp: false, otel: false },
  { cap: "Cookie / header mutation trail", rs: true, replay: false, sentry: false, vercel: "partial", mcp: false, otel: "partial" },
  { cap: "Source-mapped to your code", rs: true, replay: true, sentry: true, vercel: "partial", mcp: true, otel: false },
  { cap: "Works offline from a bundle", rs: true, replay: false, sentry: false, vercel: false, mcp: false, otel: true },
  { cap: "Agent-queryable (MCP) traces", rs: true, replay: false, sentry: false, vercel: false, mcp: true, otel: false },
];

export function Comparison() {
  return (
    <section id="compare" className="border-b border-line scroll-mt-16">
      <div className="page py-20">
        <SectionLabel>Positioning</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          Adjacent tools each see one slice. None replay the whole chain.
        </h2>
        <p className="mt-3 max-w-3xl text-fg-muted">
          Replay.io pioneered time-travel debugging — for client JavaScript. Sentry replays the DOM.
          Vercel ships traces and metrics; Next.js MCP exposes runtime metadata; OpenTelemetry
          captures spans. None provide a human-first replay of causality across Server Actions,
          cache, RSC payloads, and client reconciliation.
        </p>

        <div className="mt-10 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-inset">
                <th className="px-5 py-3 text-left font-mono text-xs font-normal uppercase tracking-wider text-fg-faint">
                  Capability
                </th>
                {COLS.map((c) => (
                  <th key={c.key} className="px-4 py-3 text-left">
                    <div className={`font-mono text-xs ${c.accent ? "text-accent" : "text-fg"}`}>
                      {c.label}
                    </div>
                    <div className="mt-0.5 font-mono text-[10px] font-normal text-fg-faint">
                      {c.note}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => (
                <tr
                  key={r.cap}
                  className={`border-b border-line last:border-b-0 ${i % 2 ? "bg-bg-raised" : "bg-bg"}`}
                >
                  <td className="px-5 py-3 text-fg-muted">{r.cap}</td>
                  {COLS.map((c) => (
                    <td key={c.key} className="px-4 py-3">
                      <Cell value={r[c.key]} accent={c.accent} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 font-mono text-[11px] text-fg-faint">
          ● full · ◐ partial · — none. Comparison reflects each tool&apos;s primary design intent, not
          a knock on its quality.
        </p>
      </div>
    </section>
  );
}

function Cell({ value, accent }: { value: Val; accent: boolean }) {
  if (value === true)
    return <span style={{ color: accent ? "var(--accent)" : "var(--plane-cache)" }}>●</span>;
  if (value === "partial") return <span className="text-fg-faint">◐</span>;
  if (value === "meta") return <span className="font-mono text-[11px] text-fg-faint">meta</span>;
  return <span className="text-line-strong">—</span>;
}
