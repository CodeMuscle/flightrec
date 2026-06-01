import { PLANE_META, type Plane } from "@/lib/fixtures";
import { SectionHeader } from "./section";

const PROBLEMS = [
  {
    k: "01",
    title: "State spans the boundary",
    body: "Some state lives on the server, some on the client. One interaction means reasoning across two execution models at once.",
  },
  {
    k: "02",
    title: "Rendering is streamed",
    body: "RSC payloads arrive in chunks over time. The UI at tick 8 isn't the UI at tick 11 — and nothing shows you the difference.",
  },
  {
    k: "03",
    title: "Cache behavior is invisible",
    body: "updateTag and revalidateTag imply different freshness. Whether the user actually saw fresh data is never surfaced.",
  },
  {
    k: "04",
    title: "No tool unifies the layers",
    body: "Logs, traces, metrics, and firewall rules each see one slice. None replay the causal chain end to end.",
  },
];

export function Problem() {
  return (
    <section className="page py-24 sm:py-28">
      <SectionHeader
        eyebrow="The problem"
        title="App Router apps are hard to debug because the story is scattered."
      />
      <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {PROBLEMS.map((p) => (
          <div key={p.k} className="card card-hover p-6">
            <span className="font-mono text-xs text-accent">{p.k}</span>
            <h3 className="mt-3 text-base font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

const DESCRIPTIONS: Record<Plane, string> = {
  user: "clicks, inputs, and navigations that start the chain",
  action: "which function ran, with what args, and its outcome",
  cache: "updateTag / revalidateTag — classified as immediate-freshness, stale-then-refresh, or orphaned",
  rsc: "ordered Flight frames as they streamed in",
  net: "cookie writes, header mutations, and redirects",
  tree: "the client-visible nodes created, patched, and removed",
};

export function SixPlanes() {
  const planes = Object.keys(PLANE_META) as Plane[];
  return (
    <section id="planes" className="page scroll-mt-20 py-24 sm:py-28">
      <SectionHeader
        eyebrow="The wedge"
        title={
          <>
            One debugger, six planes, <span className="grad-text">one timeline.</span>
          </>
        }
        intro="Observability shows one slice. Runtime metadata shows another. Flightrec unifies all six planes against a single scrubber — the difference versus traces, metrics, or generic session replay."
      />

      <div className="card mt-12 divide-y divide-line overflow-hidden p-0">
        {planes.map((p, i) => (
          <div
            key={p}
            className="group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-bg-inset/60"
          >
            <span className="w-6 font-mono text-xs tabular-nums text-fg-faint">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span
              className="h-9 w-1 rounded-full"
              style={{ background: PLANE_META[p].varName }}
            />
            <span className="w-40 shrink-0 font-medium">{PLANE_META[p].label}</span>
            <span className="hidden font-mono text-sm text-fg-muted md:block">
              {DESCRIPTIONS[p]}
            </span>
            <span
              className="ml-auto font-mono text-[10px] uppercase tracking-wider"
              style={{ color: PLANE_META[p].varName }}
            >
              {PLANE_META[p].short}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
