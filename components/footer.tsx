import { Logo } from "./logo";

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
            Flightrec is MIT-licensed and built in public. The demo above runs on synthetic
            data today — the recorder, inspector, and MCP server are landing phase by phase.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://github.com"
              className="rounded-md bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg transition hover:opacity-90"
            >
              Star on GitHub
            </a>
            <a
              href="https://x.com"
              className="rounded-md border border-line-strong bg-bg-inset px-4 py-2.5 text-sm text-fg-muted transition hover:text-fg"
            >
              Follow the build on X
            </a>
          </div>
        </div>
      </section>

      <footer className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <Logo className="size-4 text-accent" />
          <span className="font-mono text-xs text-fg-muted">flightrec</span>
          <span className="font-mono text-xs text-fg-faint">· MIT</span>
        </div>
        <div className="flex items-center gap-6 font-mono text-xs text-fg-faint">
          <a href="#demo" className="transition hover:text-fg">demo</a>
          <a href="#architecture" className="transition hover:text-fg">docs</a>
          <a href="https://github.com" className="transition hover:text-fg">github</a>
          <span>the missing replay debugger for the App Router era</span>
        </div>
      </footer>
    </>
  );
}
