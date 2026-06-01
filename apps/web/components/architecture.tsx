import { SectionHeader } from "./section";

const FLOW = [
  { id: "01", label: "User interaction" },
  { id: "02", label: "Server + client capture" },
  { id: "03", label: "Trace normalizer" },
  { id: "04", label: "Reconciler + checkpoints" },
  { id: "05", label: "IndexedDB / .frec" },
  { id: "06", label: "Inspector replay" },
];

export function Architecture() {
  return (
    <section id="architecture" className="page scroll-mt-20 py-24 sm:py-28">
      <SectionHeader
        eyebrow="How it works"
        title="Capture both sides. Normalize. Replay deterministically."
        intro="Server- and client-side capture feed a normalizer, which persists locally and replays in the inspector. No shadow React runtime — a deterministic replay graph. MCP enriches; it's never the source of truth."
      />

      <div className="card mt-12 flex flex-col gap-3 p-6 lg:flex-row lg:items-stretch">
        {FLOW.map((n, i) => (
          <div key={n.id} className="flex items-center gap-3 lg:flex-1">
            <div className="flex-1 rounded-xl border border-line bg-bg-inset/60 px-4 py-3.5">
              <div className="font-mono text-[11px] text-accent">{n.id}</div>
              <div className="mt-1 text-sm font-medium">{n.label}</div>
            </div>
            {i < FLOW.length - 1 && (
              <span className="shrink-0 rotate-90 text-fg-faint lg:rotate-0">→</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <CodeCard
          title="instrumentation.ts"
          sub="one-line setup · dev only"
          lines={[
            ["k", "export"],
            ["", " function "],
            ["f", "register"],
            ["p", "() {"],
            ["c", "\n  // captures Server Actions, cache, RSC, headers"],
            ["", "\n  "],
            ["f", "registerFlightrec"],
            ["p", "({ mode: "],
            ["s", "'normal'"],
            ["p", " })"],
            ["", "\n}"],
          ]}
        />
        <CodeCard
          title="export a session"
          sub="produce a shareable .frec bundle"
          lines={[
            ["k", "const"],
            ["", " bundle = "],
            ["k", "await"],
            ["", " session."],
            ["f", "export"],
            ["p", "()"],
            ["c", "\n// → ses_8f31a0.frec  (zip + manifest + diffs)"],
            ["", "\n"],
            ["k", "await"],
            ["", " bundle."],
            ["f", "download"],
            ["p", "()"],
          ]}
        />
      </div>
    </section>
  );
}

const COLOR: Record<string, string> = {
  k: "var(--accent)",
  f: "var(--plane-rsc)",
  s: "var(--plane-cache)",
  p: "var(--fg-muted)",
  c: "var(--fg-faint)",
  "": "var(--fg)",
};

function CodeCard({ title, sub, lines }: { title: string; sub: string; lines: [string, string][] }) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <span className="font-mono text-xs text-fg">{title}</span>
        <span className="font-mono text-[11px] text-fg-faint">{sub}</span>
      </div>
      <pre className="overflow-x-auto bg-bg-inset/40 p-5 font-mono text-[13px] leading-relaxed">
        {lines.map(([tone, text], i) => (
          <span key={i} style={{ color: COLOR[tone] ?? "var(--fg)" }}>
            {text}
          </span>
        ))}
      </pre>
    </div>
  );
}
