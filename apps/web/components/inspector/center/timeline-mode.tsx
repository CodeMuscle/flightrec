"use client";

import type { Session } from "@flightrec/trace-schema";
import { type Plane, paneBuckets } from "../lib/derive";
import { Pane } from "./pane";

const PANES: { plane: Plane; title: string; empty: string }[] = [
  { plane: "action", title: "Server Action", empty: "no action yet" },
  { plane: "cache", title: "Cache", empty: "no cache writes yet" },
  { plane: "net", title: "Navigation", empty: "no navigation yet" },
  { plane: "rsc", title: "RSC", empty: "no frames streamed" },
  { plane: "tree", title: "Client tree", empty: "no tree patches yet" },
];

export function TimelineMode({ session, tick }: { session: Session; tick: number }) {
  const buckets = paneBuckets(session, tick);
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
      {PANES.map(({ plane, title, empty }) => (
        <Pane
          key={plane}
          plane={plane}
          title={title}
          empty={empty}
          events={buckets[plane]}
          currentTick={tick}
        />
      ))}
    </div>
  );
}
