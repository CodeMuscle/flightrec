"use client";

import type { RscOp, Session } from "@flightrec/trace-schema";
import { frameOps, rscFramesUpTo } from "../lib/derive";

const OP_TONE: Record<RscOp["type"], string> = {
  "node-create": "var(--plane-cache)",
  "node-replace": "var(--plane-action)",
  "prop-patch": "var(--accent)",
  suspend: "var(--plane-net)",
  resolve: "var(--plane-cache)",
  remove: "var(--plane-tree)",
};

function opDetail(op: RscOp): string {
  switch (op.type) {
    case "node-create":
      return op.parentId ? `${op.label} → ${op.parentId}` : op.label;
    case "node-replace":
      return `${op.nodeId} → ${op.nextLabel}`;
    case "prop-patch":
      return `${op.nodeId}.${op.key} = ${JSON.stringify(op.nextValue)}`;
    default:
      return op.nodeId;
  }
}

export function PayloadMode({ session, tick }: { session: Session; tick: number }) {
  const frames = rscFramesUpTo(session, tick);

  return (
    <div className="flex flex-col gap-3 p-4">
      <span className="font-mono text-[11px] uppercase tracking-wider text-fg-faint">
        RSC payload · {frames.length} frame{frames.length === 1 ? "" : "s"}
      </span>

      {frames.length === 0 ? (
        <p className="font-mono text-[11px] text-fg-faint">no frames streamed yet</p>
      ) : (
        frames.map((frame) => {
          const current = frame.tick === tick;
          return (
            <div
              key={frame.id}
              className="rounded-xl border bg-bg-raised"
              style={{
                borderColor: current ? "var(--plane-rsc)" : "var(--line)",
              }}
            >
              <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                <span className="size-2 rounded-full" style={{ background: "var(--plane-rsc)" }} />
                <span className="font-mono text-[11px] text-fg">
                  frame #{String(frame.meta?.frameIndex ?? "?")}
                </span>
                <span className="font-mono text-[11px] text-fg-faint">
                  {String(frame.meta?.segment ?? "?")}
                </span>
                <span className="ml-auto font-mono text-[11px] text-fg-faint">+{frame.ts}ms</span>
              </div>
              <ul className="flex flex-col gap-0.5 p-2">
                {frameOps(frame).map((op, i) => (
                  <li
                    key={`${frame.id}-${i}`}
                    className="flex items-center gap-2 font-mono text-[11px]"
                  >
                    <span className="w-24 shrink-0 text-[10px]" style={{ color: OP_TONE[op.type] }}>
                      {op.type}
                    </span>
                    <span className="truncate text-fg-muted">{opDetail(op)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })
      )}
    </div>
  );
}
