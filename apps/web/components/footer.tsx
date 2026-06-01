import { Logo } from "./logo";
import { SmoothLink } from "./smooth-link";

const REPO = "https://github.com/CodeMuscle/flightrec";
const X = "https://x.com/buildwithgg";

export function Footer() {
  return (
    <>
      {/* build in public CTA */}
      <section className="border-b border-line">
        <div className="page py-20 text-center">
          <h2 className="display mx-auto max-w-2xl text-balance text-4xl tracking-tight sm:text-[2.7rem]">
            Built in the open. Watch it take shape.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-fg-muted">
            The demo above runs on synthetic data today — the recorder, inspector, and MCP server
            are landing phase by phase.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href={REPO}
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              Star on GitHub
            </a>
            <a
              href={X}
              className="rounded-md border border-line-strong bg-bg-inset px-4 py-2.5 text-sm text-fg-muted transition hover:text-fg"
            >
              Follow the build on X
            </a>
          </div>
        </div>
      </section>

      <footer className="page flex flex-col items-center justify-between gap-4 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo className="size-4 text-accent" />
          <span className="font-mono text-xs text-fg-muted">flightrec</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-fg-faint">
          <SmoothLink href="#architecture" className="transition hover:text-fg">Docs</SmoothLink>
          <a href="/vision" className="transition hover:text-fg">Vision</a>
          <a href={REPO} className="transition hover:text-fg">GitHub</a>
        </div>
        <span className="font-mono text-xs text-fg-faint">
          made, mostly at night, by{" "}
          <a href={X} className="text-fg-muted underline-offset-4 transition hover:text-accent hover:underline">
            @buildwithgg
          </a>
        </span>
      </footer>
    </>
  );
}
