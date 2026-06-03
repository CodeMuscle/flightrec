"use client";

import type { Session } from "@flightrec/trace-schema";
import { type CausalNode, causalChain, eventDetail, eventLabel, planeColor } from "../lib/derive";

export function CausalityMode({ session, tick }: { session: Session; tick: number }) {
  const chain = causalChain(session, tick);
  return (
    <div className="flex flex-col p-4">
      {chain.map((node, i) => (
        <Stage key={node.plane} node={node} tick={tick} last={i === chain.length - 1} />
      ))}
    </div>
  );
}

function Stage({ node, tick, last }: { node: CausalNode; tick: number; last: boolean }) {
  const color = planeColor(node.plane);
  const active = node.event?.tick === tick;
  const reached = node.reached;
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <span
          className="size-3 shrink-0 rounded-full border-2 transition"
          style={{
            borderColor: reached ? color : "var(--line)",
            background: reached ? color : "transparent",
            boxShadow: active ? `0 0 0 3px color-mix(in srgb, ${color} 25%, transparent)` : "none",
          }}
        />
        {!last && (
          <span
            className="w-px flex-1"
            style={{
              minHeight: 28,
              background: reached ? color : "var(--line)",
              opacity: reached ? 0.5 : 1,
            }}
          />
        )}
      </div>
      <div className="-mt-0.5 pb-4" style={{ opacity: reached ? 1 : 0.4 }}>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] uppercase tracking-wider" style={{ color }}>
            {node.plane}
          </span>
          {active && (
            <span
              className="pill px-1.5 py-0 font-mono text-[9px]"
              style={{
                color,
                background: `color-mix(in srgb, ${color} 14%, transparent)`,
              }}
            >
              now
            </span>
          )}
        </div>
        {node.event ? (
          <>
            <div className="font-mono text-xs text-fg">{eventLabel(node.event)}</div>
            <div className="font-mono text-[11px] text-fg-muted">{eventDetail(node.event)}</div>
          </>
        ) : (
          <div className="font-mono text-[11px] text-fg-faint">pending</div>
        )}
      </div>
    </div>
  );
}
