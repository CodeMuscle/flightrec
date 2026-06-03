"use client";

import type { CacheOutcome, Session } from "@flightrec/trace-schema";
import {
  activeCacheTags,
  cacheOutcome,
  eventAtTick,
  mutations,
  parseSourceRef,
} from "../lib/derive";

const OUTCOME_TONE: Record<CacheOutcome, string> = {
  "immediate-freshness": "var(--plane-cache)",
  "stale-then-refresh": "var(--plane-net)",
  "no-visible-effect": "var(--fg-faint)",
  "orphaned-invalidation": "var(--plane-action)",
};

export function ContextPanel({ session, tick }: { session: Session; tick: number }) {
  const event = eventAtTick(session, tick);
  const source = parseSourceRef(event?.sourceRef);
  const tags = activeCacheTags(session, tick);
  const outcome = cacheOutcome(session, tick);
  const muts = mutations(session, tick);

  return (
    <div className="flex flex-col gap-4 p-4">
      <Section title="Source">
        {source ? <Row label="file" value={source.file} /> : <Empty>no source ref</Empty>}
        {source?.symbol && <Row label="symbol" value={source.symbol} accent />}
        {event?.actionId && <Row label="action" value={event.actionId} />}
        {event?.route && <Row label="route" value={event.route} />}
      </Section>

      <Section title="Cache">
        {tags.length === 0 ? (
          <Empty>no cache tags yet</Empty>
        ) : (
          <div className="flex flex-wrap gap-1">
            {tags.map((t) => (
              <span
                key={t}
                className="pill border border-line px-2 py-0.5 font-mono text-[10px] text-plane-cache"
              >
                {t}
              </span>
            ))}
          </div>
        )}
        {outcome && (
          <div className="mt-2 flex items-center gap-2 font-mono text-[11px]">
            <span className="text-fg-faint">outcome</span>
            <span
              className="pill px-2 py-0.5 text-[10px]"
              style={{
                color: OUTCOME_TONE[outcome],
                background: `color-mix(in srgb, ${OUTCOME_TONE[outcome]} 12%, transparent)`,
              }}
            >
              {outcome}
            </span>
          </div>
        )}
      </Section>

      <Section title="Mutations">
        {muts.length === 0 ? (
          <Empty>none yet</Empty>
        ) : (
          muts.map((m, i) => (
            <Row key={`${m.kind}-${m.key}-${i}`} label={m.kind} value={`${m.key} = ${m.value}`} />
          ))
        )}
      </Section>

      <Section title="AI summary">
        <div className="rounded-lg border border-dashed border-line px-3 py-3 text-center font-mono text-[11px] text-fg-faint">
          coming soon
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-1.5 font-mono text-[11px] uppercase tracking-wider text-fg-faint">
        {title}
      </div>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="grid grid-cols-[3.5rem_1fr] items-center gap-2 font-mono text-[11px]">
      <span className="text-fg-faint">{label}</span>
      <span className="truncate" style={{ color: accent ? "var(--accent)" : "var(--fg-muted)" }}>
        {value}
      </span>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-[11px] text-fg-faint">{children}</p>;
}
