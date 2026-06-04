import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { RecordPanel } from "./record-panel";

export const metadata: Metadata = {
  title: "Playground",
  description: "Record a real Next.js session with the Flightrec recorder, then inspect it.",
};

export default function PlaygroundPage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="absolute left-5 top-5 flex items-center gap-2.5">
        <Logo className="size-5 text-accent" />
        <span className="font-mono text-sm font-medium">flightrec</span>
      </Link>
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl text-center">
        <span className="eyebrow">Recorder · playground</span>
        <h1 className="display mt-3 text-balance text-3xl sm:text-4xl">
          Record a <span className="grad-text">real session</span>.
        </h1>
        <p className="mt-4 text-balance text-sm leading-relaxed text-fg-muted">
          This runs a createPost-style flow through a live Server Action. The Flightrec recorder
          captures it server-side (via AsyncLocalStorage), validates it against the schema, and
          hands you a <code>.frec</code> you can scrub in the inspector.
        </p>

        <div className="mt-8">
          <RecordPanel />
        </div>
      </div>
    </main>
  );
}
