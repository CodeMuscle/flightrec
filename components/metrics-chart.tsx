import { SectionLabel } from "./problem";

/*
  Illustrative capture-overhead envelope, modeled on the PRD benchmark matrix (scenarios A–F)
  and OTel benchmarking guidance. These are TARGETS to validate, not measured numbers — the
  recorder/benchmark harness lands in Phase 4. Honesty here is a credibility signal.
*/
const BARS = [
  { id: "A", label: "No instrumentation", x: 1.0, tone: "base" },
  { id: "C", label: "Rewindscope · minimal", x: 1.04, tone: "good" },
  { id: "D", label: "Rewindscope · normal", x: 1.09, tone: "accent" },
  { id: "B", label: "OpenTelemetry baseline", x: 1.12, tone: "muted" },
  { id: "F", label: "OTel + Rewindscope", x: 1.22, tone: "muted" },
  { id: "E", label: "Rewindscope · verbose", x: 1.31, tone: "warn" },
] as const;

const MAX = 1.4;

const toneColor = (t: string) =>
  t === "accent"
    ? "var(--accent)"
    : t === "good"
      ? "var(--plane-cache)"
      : t === "warn"
        ? "var(--plane-tree)"
        : t === "base"
          ? "var(--fg-muted)"
          : "var(--line-strong)";

export function MetricsChart() {
  return (
    <section id="metrics" className="border-b border-line scroll-mt-16">
      <div className="page py-20">
        <SectionLabel>Benchmarks</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          Dev-only overhead, measured against an OpenTelemetry baseline.
        </h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          A debugger you can&apos;t afford to run is a demo, not a tool. Rewindscope&apos;s normal
          mode targets a bounded dev-only envelope, with a documented path to minimal mode for large
          apps. We benchmark like OTel recommends — warm-up, repetitions, out-of-process exporters.
        </p>

        <div className="mt-10 rounded-xl border border-line bg-bg-raised p-6 sm:p-8">
          <div className="mb-5 flex items-baseline justify-between">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-faint">
              p95 request latency · relative to baseline
            </span>
            <span className="font-mono text-[11px] text-fg-faint">illustrative target · 100 RPS</span>
          </div>

          <div className="space-y-3">
            {BARS.map((b) => {
              const pct = ((b.x - 1) / (MAX - 1)) * 100;
              const width = (b.x / MAX) * 100;
              return (
                <div key={b.id} className="flex items-center gap-3">
                  <span className="w-44 shrink-0 font-mono text-[11px] text-fg-muted">
                    <span className="text-fg-faint">{b.id}</span> {b.label}
                  </span>
                  <div className="relative h-6 flex-1 overflow-hidden rounded bg-bg-inset">
                    <div
                      className="absolute inset-y-0 left-0 rounded transition-all"
                      style={{
                        width: `${width}%`,
                        background: `color-mix(in srgb, ${toneColor(b.tone)} 22%, transparent)`,
                        borderRight: `2px solid ${toneColor(b.tone)}`,
                      }}
                    />
                    <span className="absolute inset-y-0 right-2 flex items-center font-mono text-[11px] text-fg-muted">
                      {b.x.toFixed(2)}× {b.x > 1 && <span className="ml-1 text-fg-faint">(+{Math.round(pct === 0 ? 0 : (b.x - 1) * 100)}%)</span>}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
            {[
              ["Capture modes", "minimal / normal / verbose"],
              ["Prod cost", "no-op import"],
              ["Metrics", "throughput · p50/95/99 · CPU · mem"],
              ["Bundle size", "diffed snapshots"],
            ].map(([k, v]) => (
              <div key={k} className="bg-bg-raised px-4 py-3">
                <div className="font-mono text-[10px] uppercase tracking-wider text-fg-faint">{k}</div>
                <div className="mt-1 font-mono text-xs text-fg">{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
