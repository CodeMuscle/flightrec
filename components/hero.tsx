import { ScrubDemo } from "./scrub-demo";
import { HeroBackdrop } from "./hero-backdrop";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden">
      <HeroBackdrop />
      <div className="page relative z-10 pb-16 pt-16 sm:pt-24">
        <a
          href="#demo"
          className="mb-7 inline-flex items-center gap-2 rounded-full border border-line bg-bg-raised/70 px-3 py-1 font-mono text-xs text-fg-muted shadow-[var(--shadow-sm)] backdrop-blur transition hover:border-accent/50"
        >
          <span className="size-1.5 animate-pulse rounded-full bg-accent" />
          The flight recorder for the App Router
        </a>

        <h1 className="display max-w-3xl text-balance text-5xl sm:text-7xl">
          Rewind any <em>Next.js</em> session.
        </h1>

        <p className="mt-6 max-w-2xl text-balance text-lg leading-relaxed text-fg-muted">
          A time-travel debugger that records your App Router session as a replayable trace. Scrub
          the timeline to see exactly which <Term>Server Action</Term> ran, which{" "}
          <Term>cache tags</Term> changed, what <Term>RSC payload</Term> streamed, what{" "}
          <Term>cookies / headers</Term> mutated, and how the <Term>client tree</Term> reacted —
          all in one view.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <a
            href="#demo"
            className="group flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-accent-fg shadow-[0_6px_20px_-8px_var(--accent-glow)] transition hover:opacity-90"
          >
            Open the live demo
            <span className="transition group-hover:translate-x-0.5">→</span>
          </a>
          <a
            href="#architecture"
            className="rounded-lg border border-line-strong bg-bg-raised px-5 py-2.5 text-sm text-fg-muted shadow-[var(--shadow-sm)] transition hover:text-fg"
          >
            Read the docs
          </a>
          <span className="font-mono text-xs text-fg-faint">MIT licensed · built in public</span>
        </div>

        <div id="demo" className="mt-16 scroll-mt-20">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="eyebrow">Live trace · blog post creator</span>
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
