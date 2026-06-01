import { SectionLabel } from "./problem";

const FLOW = [
  { id: "U", label: "User interaction" },
  { id: "C", label: "Next.js app" },
  { id: "SR/CR", label: "Server + client instrumentation" },
  { id: "N", label: "Trace normalizer" },
  { id: "LS", label: "IndexedDB / OPFS" },
  { id: "I", label: "Inspector PWA" },
];

export function Architecture() {
  return (
    <section id="architecture" className="border-b border-line scroll-mt-16">
      <div className="page py-20">
        <SectionLabel>How it works</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          Capture on both sides. Normalize. Replay deterministically.
        </h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Server- and client-side capture feed a trace normalizer, which persists locally and
          renders in the inspector. No shadow React runtime — a deterministic replay graph that
          explains how the UI changed over time. MCP enriches; it is never the source of truth.
        </p>

        {/* flow */}
        <div className="mt-10 flex flex-col gap-2 overflow-x-auto rounded-xl border border-line bg-bg-inset p-6 lg:flex-row lg:items-center">
          {FLOW.map((n, i) => (
            <div key={n.id} className="flex items-center gap-2 lg:flex-1">
              <div className="flex-1 rounded-lg border border-line bg-bg-raised px-4 py-3">
                <div className="font-mono text-[11px] text-accent-dim">{n.id}</div>
                <div className="mt-0.5 text-sm">{n.label}</div>
              </div>
              {i < FLOW.length - 1 && (
                <span className="shrink-0 rotate-90 text-fg-faint lg:rotate-0">→</span>
              )}
            </div>
          ))}
        </div>

        {/* code cards */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <CodeCard
            title="instrumentation.ts"
            sub="one-line setup — dev only"
            lines={[
              ["k", "export"],
              [" ", " function "],
              ["f", "register"],
              ["p", "() {"],
              ["", "\n  "],
              ["c", "// captures Server Actions, cache, RSC, headers"],
              ["", "\n  "],
              ["f", "registerRewindscope"],
              ["p", "({ mode: "],
              ["s", "'normal'"],
              ["p", " })"],
              ["", "\n}"],
            ]}
          />
          <CodeCard
            title="export a session"
            sub="produce a shareable .rwd bundle"
            lines={[
              ["k", "const"],
              [" ", " bundle = "],
              ["k", "await"],
              [" ", " session."],
              ["f", "export"],
              ["p", "()"],
              ["", "\n"],
              ["c", "// → ses_8f31a0.rwd  (zip + manifest + diffs)"],
              ["", "\n"],
              ["k", "await"],
              [" ", " bundle."],
              ["f", "download"],
              ["p", "()"],
            ]}
          />
        </div>
      </div>
    </section>
  );
}

const COLOR: Record<string, string> = {
  k: "var(--plane-rsc)", // keyword
  f: "var(--accent)", // function
  s: "var(--plane-cache)", // string
  p: "var(--fg-muted)", // punctuation
  c: "var(--fg-faint)", // comment
  "": "var(--fg)",
  " ": "var(--fg)",
};

function CodeCard({
  title,
  sub,
  lines,
}: {
  title: string;
  sub: string;
  lines: [string, string][];
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-line bg-bg-raised">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs text-fg">{title}</span>
        <span className="font-mono text-[11px] text-fg-faint">{sub}</span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
        {lines.map(([tone, text], i) => (
          <span key={i} style={{ color: COLOR[tone] ?? "var(--fg)" }}>
            {text}
          </span>
        ))}
      </pre>
    </div>
  );
}
