import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { SmoothLink } from "./smooth-link";

const LINKS = [
  { href: "#planes", label: "How It Works" },
  { href: "#architecture", label: "Architecture" },
  { href: "#metrics", label: "Performance" },
  { href: "#compare", label: "Compare" },
  { href: "#pricing", label: "Pricing" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-bg/75 backdrop-blur-xl">
      <div className="page flex h-14 items-center justify-between">
        <SmoothLink href="#top" className="flex items-center gap-2.5">
          <Logo className="size-5 text-accent" />
          <span className="font-mono text-sm font-medium tracking-tight">flightrec</span>
          <span className="hidden rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-faint sm:inline">
            v0.1 · alpha
          </span>
        </SmoothLink>

        <nav className="hidden items-center gap-6 font-mono text-xs text-fg-muted lg:flex">
          {LINKS.map((l) => (
            <SmoothLink key={l.href} href={l.href} className="transition hover:text-fg">
              {l.label}
            </SmoothLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href="/docs"
            className="hidden font-mono text-xs text-fg-muted transition hover:text-fg sm:inline"
          >
            Docs
          </a>
          <a
            href="/inspector"
            className="flex items-center gap-1.5 rounded-md border border-accent/40 bg-accent-soft px-3 py-1.5 font-mono text-xs text-accent-dim transition hover:border-accent"
          >
            <span aria-hidden>▶</span>
            <span className="hidden sm:inline">Live demo</span>
          </a>
          <ThemeToggle />
          <a
            href="https://github.com/CodeMuscle/flightrec"
            className="flex items-center gap-1.5 rounded-md border border-line-strong bg-bg-inset px-3 py-1.5 font-mono text-xs transition hover:border-accent hover:text-accent"
          >
            <GitHubIcon /> <span className="hidden sm:inline">Star</span>
          </a>
        </div>
      </div>
    </header>
  );
}

function GitHubIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}
