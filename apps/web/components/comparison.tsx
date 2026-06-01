import { SectionHeader } from "./section";

type Val = boolean | "partial" | "meta";

const COLS = [
  { key: "rs", label: "Flightrec", note: "this", accent: true },
  { key: "replay", label: "Replay.io", note: "client JS", accent: false },
  { key: "sentry", label: "Sentry", note: "DOM replay", accent: false },
  { key: "vercel", label: "Vercel Obs.", note: "traces", accent: false },
  { key: "mcp", label: "Next.js MCP", note: "metadata", accent: false },
  { key: "otel", label: "OTel", note: "spans", accent: false },
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
    <section id="compare" className="page scroll-mt-20 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Positioning"
        title="Adjacent tools each see one slice."
        intro="Replay.io pioneered time-travel debugging — for client JavaScript. Sentry replays the DOM; Vercel ships traces; Next.js MCP exposes metadata; OpenTelemetry captures spans. None replay causality across Server Actions, cache, RSC, and reconciliation."
      />

      <div className="card mt-12 overflow-x-auto p-0">
        <table className="w-full min-w-[820px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="px-5 py-4 text-left font-mono text-xs font-normal uppercase tracking-wider text-fg-faint">
                Capability
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="px-4 py-4 text-left"
                  style={c.accent ? { background: "var(--accent-soft)" } : undefined}
                >
                  <div className={`text-sm font-semibold ${c.accent ? "text-accent" : "text-fg"}`}>
                    {c.label}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] font-normal text-fg-faint">{c.note}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.cap} className="border-b border-line last:border-b-0">
                <td className="px-5 py-3 text-fg-muted">{r.cap}</td>
                {COLS.map((c) => (
                  <td
                    key={c.key}
                    className="px-4 py-3"
                    style={c.accent ? { background: "var(--accent-soft)" } : undefined}
                  >
                    <Cell value={r[c.key]} accent={c.accent} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 font-mono text-[11px] text-fg-faint">
        ● full · ◐ partial · — none. Reflects each tool&apos;s primary design intent.
      </p>
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
