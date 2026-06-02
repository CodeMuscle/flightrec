import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { DownloadPdf } from "@/components/download-pdf";
import { PLANE_META, type Plane } from "@/lib/fixtures";

export const metadata: Metadata = {
  title: "Vision",
  description:
    "The vision, market, and plan behind Flightrec — the flight recorder for the Next.js App Router.",
};

const planes = Object.keys(PLANE_META) as Plane[];

export default function Vision() {
  return (
    <div className="relative">
      {/* top bar */}
      <div className="no-print sticky top-0 z-50 border-b border-line bg-bg/80 backdrop-blur-xl">
        <div className="page flex h-14 items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <Logo className="size-5 text-accent" />
            <span className="font-mono text-sm font-medium">flightrec</span>
            <span className="font-mono text-xs text-fg-faint">/ vision</span>
          </a>
          <DownloadPdf />
        </div>
      </div>

      <main className="page">
        {/* 01 — cover */}
        <Slide n="01" total="10">
          <div className="flex flex-col items-start">
            <Logo className="size-10 text-accent" />
            <h1 className="display mt-8 text-balance text-5xl sm:text-7xl">
              The flight recorder for the <span className="grad-text">App Router.</span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-fg-muted">
              Flightrec records a full Next.js session as a replayable trace — Server Actions, cache,
              RSC payloads, cookies/headers, and the client tree — and lets engineers rewind it on
              one timeline.
            </p>
            <div className="mt-8 flex gap-3 font-mono text-xs text-fg-faint">
              <span>v0.1 · alpha</span>
              <span>·</span>
              <span>MIT core + cloud</span>
              <span>·</span>
              <span>built in public · @buildwithgg</span>
            </div>
          </div>
        </Slide>

        {/* 02 — problem */}
        <Slide n="02" total="10" eyebrow="The problem">
          <Title>App Router apps are hard to debug because the story is scattered.</Title>
          <Grid cols={4}>
            {[
              ["State spans the boundary", "Server and client state split across two execution models."],
              ["Rendering is streamed", "RSC payloads arrive in chunks; the UI changes over time."],
              ["Cache is invisible", "updateTag vs revalidateTag — freshness is never surfaced."],
              ["No tool unifies it", "Logs, traces, metrics, firewall rules each see one slice."],
            ].map(([t, b]) => (
              <Card key={t}>
                <h3 className="text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-fg-muted">{b}</p>
              </Card>
            ))}
          </Grid>
        </Slide>

        {/* 03 — why now */}
        <Slide n="03" total="10" eyebrow="Why now">
          <Title>
            The ecosystem just admitted it needs a richer debugging surface.
          </Title>
          <Grid cols={3}>
            {[
              ["Server Actions are first-class", "Vercel exposes them as operational entities in firewall tooling."],
              ["Next.js ships MCP", "next-devtools-mcp exposes errors, logs, routes, get_server_action_by_id."],
              ["Observability ≠ replay", "Logs, traces, OTEL export — but no human-first time-travel over RSC."],
            ].map(([t, b]) => (
              <Card key={t}>
                <h3 className="text-base font-semibold">{t}</h3>
                <p className="mt-2 text-sm text-fg-muted">{b}</p>
              </Card>
            ))}
          </Grid>
          <p className="mt-6 max-w-3xl text-lg text-fg-muted">
            The signals are there — Flightrec is the missing human-first replay layer on top of them.
          </p>
        </Slide>

        {/* 04 — the product */}
        <Slide n="04" total="10" eyebrow="The product">
          <Title>
            One debugger, six planes, <span className="grad-text">one timeline.</span>
          </Title>
          <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {planes.map((p, i) => (
              <div key={p} className="card flex items-center gap-3 p-4">
                <span className="font-mono text-xs text-fg-faint">{String(i + 1).padStart(2, "0")}</span>
                <span className="h-7 w-1 rounded-full" style={{ background: PLANE_META[p].varName }} />
                <span className="font-medium">{PLANE_META[p].label}</span>
              </div>
            ))}
          </div>
          <p className="mt-8 max-w-3xl text-lg text-fg-muted">
            Unifying these six planes against a single scrubber is the wedge — versus observability,
            runtime metadata, or generic session replay.
          </p>
        </Slide>

        {/* 05 — how it feels */}
        <Slide n="05" total="10" eyebrow="The experience">
          <Title>Scroll the session. Watch the bug happen.</Title>
          <Grid cols={3}>
            {[
              ["Server Action", "Which function ran, with what args, and its outcome — mapped to your source."],
              ["RSC Payload", "Ordered Flight frames, parsed and diffed as they streamed in."],
              ["Client Patch", "The exact tree nodes created, patched, and removed on reconcile."],
            ].map(([t, b]) => (
              <Card key={t}>
                <span className="font-mono text-xs text-accent">{t}</span>
                <p className="mt-2 text-sm text-fg-muted">{b}</p>
              </Card>
            ))}
          </Grid>
          <p className="mt-6 max-w-3xl text-lg text-fg-muted">
            Cache outcomes are classified automatically — immediate-freshness, stale-then-refresh,
            no-visible-effect, or orphaned — so you see whether the user actually got fresh data.
          </p>
        </Slide>

        {/* 06 — market */}
        <Slide n="06" total="10" eyebrow="Market gap">
          <Title>Adjacent tools each see one slice. None replay the whole chain.</Title>
          <div className="mt-10 grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              ["Replay.io", "Time-travel — for client JS. No Server Actions, cache, or RSC."],
              ["Sentry Replay", "Records the DOM, not server causality."],
              ["Vercel Observability", "Logs, traces, metrics — not session replay."],
              ["Next.js MCP / OTel", "Runtime metadata and spans — diagnostics, not replay."],
            ].map(([t, b]) => (
              <Card key={t}>
                <h3 className="font-semibold">{t}</h3>
                <p className="mt-1 text-sm text-fg-muted">{b}</p>
              </Card>
            ))}
          </div>
        </Slide>

        {/* 07 — how it works */}
        <Slide n="07" total="10" eyebrow="How it works">
          <Title>Capture both sides. Normalize. Replay deterministically.</Title>
          <div className="mt-10 flex flex-col gap-3 lg:flex-row">
            {["User interaction", "Server + client capture", "Normalize → reconcile", "IndexedDB / .frec", "Inspector replay"].map(
              (s, i, a) => (
                <div key={s} className="flex items-center gap-3 lg:flex-1">
                  <div className="card flex-1 px-4 py-3.5">
                    <div className="font-mono text-[11px] text-accent">{String(i + 1).padStart(2, "0")}</div>
                    <div className="mt-1 text-sm font-medium">{s}</div>
                  </div>
                  {i < a.length - 1 && <span className="text-fg-faint">→</span>}
                </div>
              ),
            )}
          </div>
          <p className="mt-6 max-w-3xl text-lg text-fg-muted">
            No shadow React runtime — a deterministic replay graph with checkpoint snapshots. MCP
            enriches; it is never the source of truth. The <code className="font-mono text-accent">.frec</code> bundle is self-contained.
          </p>
        </Slide>

        {/* 08 — roadmap */}
        <Slide n="08" total="10" eyebrow="Roadmap">
          <Title>Traction first, depth in the open.</Title>
          <div className="mt-10 space-y-2.5">
            {[
              ["Phase 1", "Landing + interactive demo — live", true],
              ["Phase 2", "Inspector MVP — load & render .frec bundles", false],
              ["Phase 3", "Recorder MVP — real capture via instrumentation.ts", false],
              ["Phase 4", "Cache semantics + benchmarks", false],
              ["Phase 5", "VS Code ext, MCP server, AI insights", false],
              ["Phase 6", "Cloud sync, browser/desktop, Remix/SvelteKit", false],
            ].map(([p, t, done]) => (
              <div key={p as string} className="card flex items-center gap-4 px-5 py-3.5">
                <span className="w-20 shrink-0 font-mono text-sm text-accent">{p}</span>
                <span className="flex-1 text-fg-muted">{t}</span>
                <span className="font-mono text-xs text-fg-faint">{done ? "● live" : "○ planned"}</span>
              </div>
            ))}
          </div>
        </Slide>

        {/* 09 — business */}
        <Slide n="09" total="10" eyebrow="Business model">
          <Title>Open-core. Free to adopt, paid to collaborate.</Title>
          <Grid cols={3}>
            {[
              ["Free", "$0", "Local capture, all six planes, .frec, inspector. The adoption engine."],
              ["Growth", "$299/mo", "Cloud sync, shared trace links, retention, MCP server, AI insights."],
              ["Enterprise", "Custom", "SSO/SAML, self-host, audit, residency, SLA."],
            ].map(([t, price, b]) => (
              <Card key={t}>
                <div className="flex items-baseline justify-between">
                  <span className="font-semibold">{t}</span>
                  <span className="display text-2xl">{price}</span>
                </div>
                <p className="mt-2 text-sm text-fg-muted">{b}</p>
              </Card>
            ))}
          </Grid>
          <p className="mt-6 max-w-3xl text-lg text-fg-muted">
            The moat is the trace format, the reconciliation/semantics engine, and the ecosystem
            (MCP, editor, CI) — not the UI. Viral loop: shared trace links pull teammates in.
          </p>
        </Slide>

        {/* 10 — ask */}
        <Slide n="10" total="10" eyebrow="The ask">
          <Title>
            Help us give the App Router its <span className="grad-text">Redux DevTools moment.</span>
          </Title>
          <p className="mt-6 max-w-2xl text-xl text-fg-muted">
            We&apos;re building Flightrec in the open. Star the repo, try the demo, and follow the build.
          </p>
          <div className="no-print mt-8 flex flex-wrap gap-3">
            <a href="https://github.com/CodeMuscle/flightrec" className="pill bg-fg px-5 py-3 text-sm font-medium text-bg">
              GitHub
            </a>
            <a href="https://x.com/buildwithgg" className="pill border border-line bg-bg-raised px-5 py-3 text-sm font-medium text-fg">
              @buildwithgg
            </a>
            <a href="/" className="pill border border-line bg-bg-raised px-5 py-3 text-sm font-medium text-fg">
              Live demo
            </a>
          </div>
        </Slide>
      </main>
    </div>
  );
}

/* ---- deck primitives ---- */

function Slide({
  n,
  total,
  eyebrow,
  children,
}: {
  n: string;
  total: string;
  eyebrow?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="deck-slide relative border-b border-line">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <div className={eyebrow ? "mt-4" : ""}>{children}</div>
      <span className="absolute bottom-6 right-0 font-mono text-xs text-fg-faint">
        {n} / {total}
      </span>
    </section>
  );
}

function Title({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="display max-w-4xl text-balance text-4xl tracking-tight sm:text-5xl">{children}</h2>
  );
}

function Grid({ cols, children }: { cols: 3 | 4; children: React.ReactNode }) {
  return (
    <div className={`mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 ${cols === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
      {children}
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="card p-6">{children}</div>;
}
