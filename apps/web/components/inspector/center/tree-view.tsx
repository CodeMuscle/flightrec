"use client";

import type { Session } from "@flightrec/trace-schema";
import { type TreeNode, reconcileTree } from "../lib/derive";

/** The React tree materialized from the RSC ops up to the current tick (reconcileTree). */
export function TreeView({ session, tick }: { session: Session; tick: number }) {
  const tree = reconcileTree(session, tick);
  if (tree.length === 0) {
    return <p className="font-mono text-[11px] text-fg-faint">no tree yet</p>;
  }
  return (
    <ul className="font-mono text-[11px]">
      {tree.map((n) => (
        <Node key={n.id} node={n} depth={0} />
      ))}
    </ul>
  );
}

function Node({ node, depth }: { node: TreeNode; depth: number }) {
  return (
    <li>
      <div className="flex items-center gap-1.5 py-0.5" style={{ paddingLeft: depth * 12 }}>
        <span style={{ color: "var(--plane-rsc)" }}>{node.label}</span>
        {node.suspended && <span className="text-fg-faint">⏳</span>}
        {Object.entries(node.props).map(([k, v]) => (
          <span key={k} className="truncate text-fg-faint">
            {k}={JSON.stringify(v)}
          </span>
        ))}
      </div>
      {node.children.length > 0 && (
        <ul>
          {node.children.map((c) => (
            <Node key={c.id} node={c} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}
