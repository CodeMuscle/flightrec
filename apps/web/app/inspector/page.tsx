import {
  authCookieSession,
  blogPostSession,
  staleDashboardSession,
} from "@flightrec/trace-fixtures";
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
  searchParams: Promise<{ session?: string; demo?: string }>;
}) {
  // ?session=<id> loads a recorded session (dev store); ?demo=<name> picks a golden fixture;
  // default is the blog-post demo. All pass through the same schema-validated boundary.
  const { session: sessionId, demo } = await searchParams;
  const DEMOS: Record<string, () => ReturnType<typeof blogPostSession>> = {
    blog: blogPostSession,
    dashboard: staleDashboardSession,
    auth: authCookieSession,
  };
  const recorded = sessionId ? getSession(sessionId) : undefined;
  const session = recorded ?? Session.parse((DEMOS[demo ?? "blog"] ?? blogPostSession)());

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
          <div className="mb-3 flex flex-wrap items-center justify-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-widest text-fg-faint">
              demos
            </span>
            {(["blog", "dashboard", "auth"] as const).map((d) => (
              <Link
                key={d}
                href={`/inspector?demo=${d}`}
                className="pill border px-2.5 py-1 font-mono text-[11px] transition"
                style={{
                  borderColor:
                    (demo ?? "blog") === d && !recorded ? "var(--accent)" : "var(--line)",
                  color: (demo ?? "blog") === d && !recorded ? "var(--accent)" : "var(--fg-muted)",
                }}
              >
                {d}
              </Link>
            ))}
          </div>
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
