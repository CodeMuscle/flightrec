import { blogPostSession } from "@flightrec/trace-fixtures";
import { Session } from "@flightrec/trace-schema";
import type { Metadata } from "next";
import Link from "next/link";
import { Inspector } from "@/components/inspector/inspector";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Inspector",
  description:
    "Scrub a recorded Next.js session on one timeline — Server Actions, cache, RSC, and the client tree, tick by tick.",
};

export default function InspectorPage() {
  // Load + validate at the route boundary. Today the source is the golden fixture;
  // when .frec import lands it slots in here behind the same Session.parse gate.
  const session = Session.parse(blogPostSession());

  return (
    <main className="relative flex min-h-screen flex-col px-6 py-20">
      <Link href="/" className="absolute left-6 top-6 flex items-center gap-2.5">
        <Logo className="size-6 text-accent" />
        <span className="font-mono text-sm font-medium">flightrec</span>
      </Link>
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-8 text-center">
          <span className="eyebrow">Inspector · preview</span>
          <h1 className="display mt-3 text-balance text-3xl sm:text-4xl">
            Rewind the <span className="grad-text">blog-post</span> session.
          </h1>
          <p className="mt-3 text-balance text-fg-muted">
            Drag the playhead or use ← / → and space. Every region reads one shared tick.
          </p>
        </div>

        <Inspector session={session} />
      </div>
    </main>
  );
}
