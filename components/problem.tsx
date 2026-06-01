import { PLANE_META, type Plane } from "@/lib/fixtures";

const PROBLEMS = [
  {
    k: "01",
    title: "State is split across the boundary",
    body: "Some state lives on the server, some on the client. Reasoning about a single interaction means jumping between two execution models.",
  },
  {
    k: "02",
    title: "Rendering is streamed",
    body: "RSC payloads arrive in chunks over time. The UI you see at tick 8 is not the UI at tick 11 — and nothing shows you the difference.",
  },
  {
    k: "03",
    title: "Cache behavior is invisible",
    body: "updateTag and revalidateTag imply different freshness. Whether the user actually saw fresh data is never surfaced — only that a tag was touched.",
  },
  {
    k: "04",
    title: "No tool unifies the layers",
    body: "Logs, traces, metrics, and firewall rules each see one slice. None replay the causal chain across actions, cache, RSC, and reconciliation.",
  },
];

export function Problem() {
  return (
    <section className="border-b border-line">
      <div className="page py-20">
        <SectionLabel>The problem</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          App Router apps are hard to debug because the story is scattered.
        </h2>
        <div className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <div key={p.k} className="bg-bg-raised p-6">
              <span className="font-mono text-xs text-accent-dim">{p.k}</span>
              <h3 className="mt-3 text-base font-medium">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function SixPlanes() {
  const planes = Object.keys(PLANE_META) as Plane[];
  return (
    <section id="planes" className="border-b border-line scroll-mt-16">
      <div className="page py-20">
        <SectionLabel>The wedge</SectionLabel>
        <h2 className="mt-3 max-w-2xl text-balance text-3xl font-semibold tracking-tight">
          One debugger, six planes, a single timeline.
        </h2>
        <p className="mt-3 max-w-2xl text-fg-muted">
          Observability shows you one slice. Runtime metadata shows you another. Rewindscope
          unifies all six planes against one scrubber — the key differentiator versus traces,
          metrics, or generic session replay.
        </p>

        <div className="mt-10 overflow-hidden rounded-xl border border-line">
          {planes.map((p, i) => (
            <div
              key={p}
              className="group flex items-center gap-4 border-b border-line bg-bg-raised px-5 py-4 transition last:border-b-0 hover:bg-bg-inset"
            >
              <span className="font-mono text-xs text-fg-faint tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span
                className="h-8 w-1 rounded-full"
                style={{ background: PLANE_META[p].varName }}
              />
              <span className="w-40 font-medium">{PLANE_META[p].label}</span>
              <span className="hidden font-mono text-sm text-fg-muted sm:block">
                {DESCRIPTIONS[p]}
              </span>
              <span
                className="ml-auto font-mono text-[10px] uppercase tracking-wider opacity-60"
                style={{ color: PLANE_META[p].varName }}
              >
                {PLANE_META[p].short}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const DESCRIPTIONS: Record<Plane, string> = {
  user: "clicks, inputs, navigations that start the chain",
  action: "which function ran, with what args, and its outcome",
  cache: "updateTag / revalidateTag and the freshness it produced",
  rsc: "ordered Flight frames as they streamed in",
  net: "cookie writes, header mutations, and redirects",
  tree: "the client-visible nodes that were created, patched, removed",
};

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-mono text-xs uppercase tracking-[0.2em] text-accent-dim">
      {children}
    </span>
  );
}
