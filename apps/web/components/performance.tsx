import { SectionHeader } from "./section";

/*
  Illustrative capture-overhead comparison. Numbers are TARGETS / representative estimates to be
  validated by the Phase-4 benchmark harness (OTel-style: warm-up, repetitions, out-of-process
  exporters) — labelled honestly. Apples-to-oranges across tools is noted.
*/
const BARS = [
  { tool: "Vercel Observability", note: "sampled, platform", x: 1.05 },
  { tool: "Flightrec · minimal", note: "local capture", x: 1.04, us: true },
  { tool: "Flightrec · normal", note: "realistic dev", x: 1.09, us: true },
  { tool: "OpenTelemetry", note: "tracing baseline", x: 1.12 },
  { tool: "Sentry Replay", note: "DOM recording", x: 1.18 },
  { tool: "React DevTools", note: "profiler on", x: 1.3 },
  { tool: "Replay.io", note: "full recording", x: 1.62 },
];
const MAX = 1.75;

const ESSENTIALS = [
  ["Capture modes", "minimal · normal · verbose"],
  ["Prod cost", "no-op import"],
  ["SDK size", "~18 KB gzipped"],
  ["Bundle / session", "diffed snapshots"],
];

export function Performance() {
  return (
    <section id="metrics" className="page scroll-mt-20 py-24 sm:py-28">
      <SectionHeader
        eyebrow="Performance"
        title="Light enough to run always-on."
        intro="A debugger you can't afford to run is a demo, not a tool. Flightrec's normal mode targets a bounded, dev-only overhead envelope — benchmarked the way OpenTelemetry recommends."
      />

      <div className="card mt-12 p-6 sm:p-8">
        <div className="mb-6 flex items-baseline justify-between">
          <span className="font-mono text-xs uppercase tracking-wider text-fg-faint">
            Capture overhead · p95 latency vs baseline
          </span>
          <span className="font-mono text-[11px] text-fg-faint">illustrative · 100 RPS</span>
        </div>

        <div className="space-y-2.5">
          {[...BARS]
            .sort((a, b) => a.x - b.x)
            .map((b) => {
              const width = ((b.x - 1) / (MAX - 1)) * 100;
              return (
                <div key={b.tool} className="flex items-center gap-4">
                  <div className="w-40 shrink-0 text-right">
                    <div className={`text-sm ${b.us ? "font-semibold text-fg" : "text-fg-muted"}`}>
                      {b.tool}
                    </div>
                    <div className="font-mono text-[10px] text-fg-faint">{b.note}</div>
                  </div>
                  <div className="relative h-7 flex-1 overflow-hidden rounded-lg bg-bg-inset">
                    <div
                      className="absolute inset-y-0 left-0 rounded-lg"
                      style={{
                        width: `${Math.max(width, 4)}%`,
                        background: b.us
                          ? "var(--grad)"
                          : "color-mix(in srgb, var(--fg-muted) 22%, transparent)",
                      }}
                    />
                    <span className="absolute inset-y-0 right-3 flex items-center font-mono text-[11px] text-fg-muted">
                      {b.x.toFixed(2)}×{" "}
                      <span className="ml-1 text-fg-faint">(+{Math.round((b.x - 1) * 100)}%)</span>
                    </span>
                  </div>
                </div>
              );
            })}
        </div>

        <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {ESSENTIALS.map(([k, v]) => (
            <div key={k} className="rounded-xl border border-line bg-bg-inset/60 px-4 py-3">
              <div className="font-mono text-[10px] uppercase tracking-wider text-fg-faint">
                {k}
              </div>
              <div className="mt-1 font-mono text-xs text-fg">{v}</div>
            </div>
          ))}
        </div>

        <p className="mt-5 font-mono text-[11px] leading-relaxed text-fg-faint">
          Representative targets, not measured results — validated by the Phase-4 benchmark harness.
          Cross-tool numbers are directional; each tool records a different surface.
        </p>
      </div>
    </section>
  );
}
