import { SectionLabel } from "./problem";

const OUTCOMES = [
  {
    id: "immediate-freshness",
    label: "Immediate freshness",
    tone: "good",
    desc: "updateTag ran and the very next RSC payload changed the dependent tree. The user saw fresh data.",
  },
  {
    id: "stale-then-refresh",
    label: "Stale → refresh",
    tone: "warn",
    desc: "Invalidation happened, but the next render still showed old data before a later update arrived.",
  },
  {
    id: "no-visible-effect",
    label: "No visible effect",
    tone: "bad",
    desc: "A tag was invalidated but no tracked tree node changed for the affected route. Nothing moved.",
  },
  {
    id: "orphaned-invalidation",
    label: "Orphaned invalidation",
    tone: "bad",
    desc: "A tag was invalidated that no fetch or subtree actually depends on — a bug you didn't know you had.",
  },
] as const;

const toneColor = (t: string) =>
  t === "good" ? "var(--plane-cache)" : t === "warn" ? "var(--accent)" : "var(--plane-tree)";

export function CacheSemantics() {
  return (
    <section id="cache" className="border-b border-line scroll-mt-16">
      <div className="page py-20">
        <SectionLabel>The aha</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          Not &ldquo;tag invalidated.&rdquo; Whether the user saw fresh data.
        </h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Recording that an invalidation happened is easy. The hard part is explaining whether the
          semantics matched intent. Rewindscope correlates each invalidation with the RSC request
          that followed and classifies the real-world outcome.
        </p>

        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line md:grid-cols-2">
          {OUTCOMES.map((o) => (
            <div key={o.id} className="bg-bg-raised p-6">
              <div className="flex items-center gap-2.5">
                <span
                  className="size-2 rounded-full"
                  style={{ background: toneColor(o.tone) }}
                />
                <span className="font-medium">{o.label}</span>
                <code
                  className="ml-auto rounded border px-1.5 py-0.5 font-mono text-[10px]"
                  style={{ borderColor: toneColor(o.tone), color: toneColor(o.tone) }}
                >
                  {o.id}
                </code>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-fg-muted">{o.desc}</p>
            </div>
          ))}
        </div>

        <pre className="mt-6 overflow-x-auto rounded-xl border border-line bg-bg-inset p-5 font-mono text-xs leading-relaxed text-fg-muted">
{`type CacheOutcome =
  | `}<span className="text-[var(--plane-cache)]">{`'immediate-freshness'`}</span>{`
  | `}<span className="text-accent">{`'stale-then-refresh'`}</span>{`
  | `}<span className="text-[var(--plane-tree)]">{`'no-visible-effect'`}</span>{`
  | `}<span className="text-[var(--plane-tree)]">{`'orphaned-invalidation'`}</span>{``}
        </pre>
      </div>
    </section>
  );
}
