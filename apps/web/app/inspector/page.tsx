import { blogPostSession } from "@flightrec/trace-fixtures";
import { Session } from "@flightrec/trace-schema";
import type { Metadata } from "next";
import Link from "next/link";
import { Inspector } from "@/components/inspector/inspector";
import { Logo } from "@/components/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { getSession } from "@/lib/session-store";
import { RecentSessions } from "@/components/recent-sessions";

export const metadata: Metadata = {
  title: "Inspector",
  description:
    "Scrub a recorded Next.js session on one timeline — Server Actions, cache, RSC, and the client tree, tick by tick.",
};

export default async function InspectorPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string }>;
}) {
  // ?session=<id> loads a session recorded in the playground (dev store); otherwise we
  // fall back to the golden fixture. Both pass through the same schema-validated boundary.
  const { session: sessionId } = await searchParams;
  const recorded = sessionId ? getSession(sessionId) : undefined;
  const session = recorded ?? Session.parse(blogPostSession());

  return (
    <main className="relative flex min-h-screen flex-col px-4 py-10 sm:px-6">
      <Link href="/" className="absolute left-5 top-5 flex items-center gap-2.5">
        <Logo className="size-5 text-accent" />
        <span className="font-mono text-sm font-medium">flightrec</span>
      </Link>
      <div className="absolute right-5 top-5">
        <ThemeToggle />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-6 text-center">
          <RecentSessions activeId={sessionId} />
          <span className="eyebrow">
            Inspector · {recorded ? "recorded session" : "live preview"}
          </span>
          <h1 className="display mt-3 text-balance text-3xl sm:text-4xl">
            {recorded ? (
              <>
                Your <span className="grad-text">recorded</span> session.
              </>
            ) : (
              <>
                Rewind the <span className="grad-text">blog-post</span> session.
              </>
            )}
          </h1>
          <p className="mt-3 text-balance text-sm leading-relaxed text-fg-muted">
            {recorded
              ? "Captured live in the playground. Drag the playhead or use ← / → and space."
              : "Drag the playhead or use ← / → and space. Switch modes in the header — every region reads one shared tick."}
          </p>
        </div>

        <Inspector session={session} />
      </div>
    </main>
  );
}
