import { Session } from "@flightrec/trace-schema";
import { type NextRequest, NextResponse } from "next/server";
import { listSessions, saveSession } from "@/lib/session-store";

/** Ingest a recorded session (schema-validated) from an external recorder. */
export async function POST(req: NextRequest) {
  const parsed = Session.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid .frec session" }, { status: 400 });
  }
  return NextResponse.json({ id: saveSession(parsed.data) }, { status: 201 });
}

/** List stored sessions (newest first) — id + a little metadata. */
export function GET() {
  return NextResponse.json(
    listSessions().map((s) => ({
      id: s.id,
      route: s.route,
      events: s.events.length,
      startedAt: s.startedAt,
    })),
  );
}
