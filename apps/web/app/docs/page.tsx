import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { type DocSection, DocsSidebar } from "@/components/docs/docs-sidebar";
import { Footer } from "@/components/footer";
import { Nav } from "@/components/nav";

export const metadata: Metadata = {
  title: "Docs",
  description:
    "Flightrec documentation — the trace model, the inspector, the .frec format, and the roadmap for the time-travel debugger for the Next.js App Router.",
};

const SECTIONS: DocSection[] = [
  { id: "introduction", label: "Introduction" },
  { id: "quickstart", label: "Quick start" },
  { id: "trace-model", label: "The trace model" },
  { id: "inspector", label: "The inspector" },
  { id: "frec", label: "The .frec format" },
  { id: "roadmap", label: "Roadmap" },
  { id: "faq", label: "FAQ" },
];

const PLANES: [string, string][] = [
  ["user", "user-input · client-navigation"],
  ["action", "server-action:start/end · cookies:mutate · headers:mutate"],
  ["cache", "cache:update-tag · cache:revalidate-tag"],
  ["net", "redirect"],
  ["rsc", "rsc:chunk"],
  ["tree", "tree:diff"],
];

export default function DocsPage() {
  return (
    <>
      <Nav />
      <main className="page py-12">
        <div className="grid gap-12 lg:grid-cols-[1fr_200px] xl:gap-16">
          <article className="max-w-3xl">
            <header className="mb-12">
              <span className="eyebrow">Documentation</span>
              <h1 className="display mt-3 text-balance text-4xl sm:text-5xl">
                The flight recorder for <span className="grad-text">Next.js</span>.
              </h1>
              <p className="mt-4 text-balance text-lg leading-relaxed text-fg-muted">
                Flightrec records a full server→client session as a replayable trace and lets you
                scrub it on one timeline. This is how it's put together.
              </p>
            </header>

            <Section id="introduction" title="Introduction">
              <P>
                Most debuggers show you logs after the fact — disconnected lines you have to
                correlate by hand. <strong>Flightrec</strong> shows you the whole causal chain of a
                request, step by step: the Server Action that ran, the cache tag it invalidated, the
                redirect, the RSC frames that streamed, and the client React tree they patched.
              </P>
              <P>
                It's built for the <strong>Next.js App Router</strong> and React Server Components —
                the parts of the stack that are hardest to reason about precisely. Open source,
                MIT-licensed.
              </P>
              <Callout>
                <strong>Pre-release.</strong> The inspector is live —{" "}
                <Link href="/inspector" className="text-accent underline-offset-4 hover:underline">
                  try the demo
                </Link>
                . The recorder that captures your own app is in active development.{" "}
                <Link href="/waitlist" className="text-accent underline-offset-4 hover:underline">
                  Join the waitlist
                </Link>{" "}
                for early access.
              </Callout>
            </Section>

            <Section id="quickstart" title="Quick start">
              <P>The package isn't published yet, but you can explore the inspector today.</P>
              <Code>{`# coming soon
npm i flightrec`}</Code>
              <P>Right now, the fastest way to get a feel for it:</P>
              <ol className="ml-5 list-decimal space-y-1.5 text-fg-muted">
                <li>
                  Open the{" "}
                  <Link
                    href="/inspector"
                    className="text-accent underline-offset-4 hover:underline"
                  >
                    live inspector
                  </Link>{" "}
                  — it boots with a recorded "create blog post" session.
                </li>
                <li>Scrub the timeline (drag, or ← / → / space) and switch modes in the header.</li>
                <li>
                  Hit <Kbd>export</Kbd>, then drag the <code>.frec</code> file back onto the card to
                  reload it.
                </li>
              </ol>
            </Section>

            <Section id="trace-model" title="The trace model">
              <P>
                A <strong>session</strong> is an ordered list of <strong>events</strong>. Each event
                carries a <strong>tick</strong> (a discrete step) and a <strong>phase</strong>. The
                whole inspector is derived from a single number — the current tick — so there's no
                state to keep in sync.
              </P>
              <P>
                The 12 phases group into 6 <strong>planes</strong>, the swim-lanes you see on the
                timeline:
              </P>
              <div className="overflow-hidden rounded-xl border border-line">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-bg-inset text-fg-faint">
                    <tr>
                      <th className="px-4 py-2 font-medium">Plane</th>
                      <th className="px-4 py-2 font-medium">Phases</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLANES.map(([plane, phases]) => (
                      <tr key={plane} className="border-t border-line">
                        <td className="px-4 py-2" style={{ color: `var(--plane-${plane})` }}>
                          {plane}
                        </td>
                        <td className="px-4 py-2 text-fg-muted">{phases}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Section>

            <Section id="inspector" title="The inspector">
              <P>The inspector lays the session out in five regions around a shared scrubber:</P>
              <ul className="ml-5 list-disc space-y-1.5 text-fg-muted">
                <li>
                  <strong>① Timeline</strong> — the spine; one lane per plane, a draggable playhead.
                </li>
                <li>
                  <strong>② Event index</strong> — every event as a list, with plane filters.
                </li>
                <li>
                  <strong>③ Center view</strong> — the selected mode (below).
                </li>
                <li>
                  <strong>④ Context panel</strong> — source map, cache tags + outcome, mutations.
                </li>
                <li>
                  <strong>⑤ Raw tray</strong> — the underlying <code>TraceEvent</code> JSON.
                </li>
              </ul>
              <P>The center view has five modes:</P>
              <ul className="ml-5 list-disc space-y-1.5 text-fg-muted">
                <li>
                  <strong>timeline</strong> — synchronized plane panes (what happened on each).
                </li>
                <li>
                  <strong>diff</strong> — only what changed on the current tick (before → after).
                </li>
                <li>
                  <strong>payload</strong> — parsed RSC/Flight frames, op by op.
                </li>
                <li>
                  <strong>causality</strong> — the cause → effect chain across planes.
                </li>
                <li>
                  <strong>presentation</strong> — a narrated, demo-friendly walkthrough.
                </li>
              </ul>
              <Callout>
                See it in action in the{" "}
                <Link href="/inspector" className="text-accent underline-offset-4 hover:underline">
                  live demo
                </Link>{" "}
                → switch modes in the top bar and press play.
              </Callout>
            </Section>

            <Section id="frec" title="The .frec format">
              <P>
                A <code>.frec</code> file is a session serialized to JSON, validated on the way in
                by a Zod schema — drop a malformed file and you get a clean error, never a crash.
                Export the current session to share a bug, or drag any <code>.frec</code> onto the
                inspector to replay it.
              </P>
              <Code>{`{
  "id": "ses_8f31a0",
  "schemaVersion": 1,
  "route": "/posts/new",
  "nextVersion": "16.2.6",
  "startedAt": 0,
  "events": [ /* TraceEvent[] */ ]
}`}</Code>
            </Section>

            <Section id="roadmap" title="Roadmap">
              <ul className="ml-5 list-disc space-y-1.5 text-fg-muted">
                <li>
                  <strong>Foundations</strong> — trace schema + golden fixtures. <Done />
                </li>
                <li>
                  <strong>Inspector MVP</strong> — 5 regions, 5 modes, <code>.frec</code> I/O.{" "}
                  <Done />
                </li>
                <li>
                  <strong>The recorder</strong> — App Router instrumentation that captures your real
                  app. <Wip />
                </li>
                <li>
                  <strong>Checkpoints &amp; AI</strong> — jump anywhere instantly; AI summaries via
                  MCP. <Soon />
                </li>
              </ul>
            </Section>

            <Section id="faq" title="FAQ">
              <Faq q="Is it open source?">
                Yes — MIT-licensed, built in public on{" "}
                <a
                  href="https://github.com/CodeMuscle/flightrec"
                  className="text-accent underline-offset-4 hover:underline"
                >
                  GitHub
                </a>
                .
              </Faq>
              <Faq q="Does it support the Pages Router?">
                The focus is the App Router and React Server Components, where time-travel adds the
                most clarity.
              </Faq>
              <Faq q="What's the runtime overhead?">
                Recording is opt-in and dev-first. The trace is a compact event log; heavy payloads
                are referenced lazily, not inlined.
              </Faq>
            </Section>
          </article>

          <DocsSidebar sections={SECTIONS} />
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      id={id}
      className="scroll-mt-24 border-t border-line py-10 first:border-t-0 first:pt-0"
    >
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 space-y-4 leading-relaxed">{children}</div>
    </section>
  );
}

function P({ children }: { children: ReactNode }) {
  return <p className="text-fg-muted">{children}</p>;
}

function Code({ children }: { children: string }) {
  return (
    <pre className="pane-scroll overflow-x-auto rounded-xl border border-line bg-bg-inset px-4 py-3 font-mono text-[13px] leading-relaxed text-fg">
      <code>{children}</code>
    </pre>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-line bg-accent-soft/40 px-4 py-3 text-sm text-fg-muted">
      {children}
    </div>
  );
}

function Kbd({ children }: { children: ReactNode }) {
  return (
    <span className="rounded border border-line bg-bg-inset px-1.5 py-0.5 font-mono text-[11px] text-fg">
      {children}
    </span>
  );
}

function Faq({ q, children }: { q: string; children: ReactNode }) {
  return (
    <div className="border-t border-line py-4 first:border-t-0 first:pt-0">
      <p className="font-medium text-fg">{q}</p>
      <p className="mt-1 text-sm text-fg-muted">{children}</p>
    </div>
  );
}

function Done() {
  return (
    <span className="pill border border-line px-1.5 py-0 font-mono text-[10px] text-plane-cache">
      shipped
    </span>
  );
}
function Wip() {
  return (
    <span className="pill border border-line px-1.5 py-0 font-mono text-[10px] text-accent">
      in progress
    </span>
  );
}
function Soon() {
  return (
    <span className="pill border border-line px-1.5 py-0 font-mono text-[10px] text-fg-faint">
      planned
    </span>
  );
}
