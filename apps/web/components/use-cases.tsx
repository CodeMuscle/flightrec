import { SectionHeader } from "./section";

const CASES = [
  {
    tag: "Cache",
    color: "var(--plane-cache)",
    title: "The dashboard that stayed stale",
    body: "An edit flow used the wrong invalidation. Flightrec shows updateTag fired but no tracked node changed — an orphaned invalidation, not the read-your-own-writes you intended.",
  },
  {
    tag: "Auth",
    color: "var(--plane-net)",
    title: "The sign-in that lost the cookie",
    body: "A redirect through nested layouts left auth half-applied. The timeline lines up the cookie write, the 303, and the tree reconcile so the partial-stale state is obvious.",
  },
  {
    tag: "Actions",
    color: "var(--plane-action)",
    title: "The mutation that ran twice",
    body: "A double-submit fired the Server Action twice. Two invocations sit side by side on the timeline with their args and outcomes — no more guessing from logs.",
  },
];

export function UseCases() {
  return (
    <section className="page py-24 sm:py-28">
      <SectionHeader
        eyebrow="What you'll catch"
        title="The bugs that don't show up in logs."
        intro="App Router failures hide between layers. Flightrec puts the whole causal chain on one timeline, so the root cause is where you'd expect it."
      />
      <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
        {CASES.map((c) => (
          <div key={c.title} className="card card-hover flex flex-col p-6">
            <span
              className="pill w-fit px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider"
              style={{
                color: c.color,
                background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
              }}
            >
              {c.tag}
            </span>
            <h3 className="mt-4 text-lg font-semibold tracking-tight">{c.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-fg-muted">{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
