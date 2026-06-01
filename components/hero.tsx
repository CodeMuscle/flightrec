import { ScrubDemo } from "./scrub-demo";
import { HeroBackdrop } from "./hero-backdrop";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden border-b border-line">
      <HeroBackdrop />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, var(--accent-dim), transparent)" }}
      />
      <div className="page relative z-10 pb-14 pt-16 sm:pt-24">
        <a
          href="#demo"
          className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-bg-raised/80 px-3 py-1 font-mono text-xs text-fg-muted backdrop-blur transition hover:border-accent/50"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-accent" />
          App Router needs its Redux DevTools moment
        </a>

        <h1 className="max-w-3xl text-balance text-4xl font-semibold leading-[1.08] tracking-tight sm:text-6xl">
          Rewind any <span className="text-accent">Next.js</span> session.
        </h1>

        <p className="mt-5 max-w-2xl text-balance text-lg leading-relaxed text-fg-muted">
          A time-travel debugger for the App Router. Record a full session as a replayable
          execution trace, then scrub the timeline to see exactly which <Term>Server Action</Term>{" "}
          ran, which <Term>cache tags</Term> changed, what <Term>RSC payload</Term> streamed, what{" "}
          <Term>cookies / headers</Term> mutated, and how the <Term>client tree</Term> reacted — all
          in one view.
        </p>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href="#demo"
            className="group flex items-center gap-2 rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
          >
            Open the live demo
            <span className="transition group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#architecture"
            className="rounded-md border border-line-strong bg-bg-inset px-4 py-2.5 text-sm text-fg-muted transition hover:text-fg"
          >
            Read the docs
          </a>
          <span className="font-mono text-xs text-fg-faint">MIT licensed · built in public</span>
        </div>

        <div id="demo" className="mt-14 scroll-mt-20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="font-mono text-xs uppercase tracking-wider text-fg-faint">
              Live trace · blog post creator
            </span>
            <span className="hidden font-mono text-xs text-fg-faint sm:block">
              drag the timeline · ← → to scrub · space to play
            </span>
          </div>
          <ScrubDemo />
        </div>
      </div>
    </section>
  );
}

function Term({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-fg underline decoration-line-strong decoration-dotted underline-offset-4">
      {children}
    </span>
  );
}
