import { relative } from "node:path";

/** A parsed source location from a stack frame. */
export type Source = { file: string; symbol: string; line: number; col: number };

/** A frame is "app code" if it isn't node internals, a dependency, or the recorder package. */
function isAppFrame(path: string): boolean {
  if (path.startsWith("node:") || path.includes("node_modules")) return false;
  // Skip the recorder package's own frames so capture lands on the caller. Published copies live
  // under node_modules (already filtered); this catches the monorepo dev path. Matching the package
  // path — not any segment named "recorder" — keeps app files like app/recorder/page.tsx eligible.
  if (path.includes("@flightrec/recorder")) return false;
  return !path.split("\\").join("/").includes("/packages/recorder/");
}

/** Clean a raw stack frame name into a bare symbol: "async Object.signIn" → "signIn". */
function cleanSymbol(name: string): string {
  let n = name;
  if (n.startsWith("async ")) n = n.slice(6);
  if (n.startsWith("new ")) n = n.slice(4);
  const dot = n.lastIndexOf(".");
  return dot === -1 ? n : n.slice(dot + 1);
}

/**
 * Parse one V8 stack line into its parts, or null if it isn't a frame. Linear scan (no backtracking
 * regex) so it's safe on arbitrary consumer-supplied stacks. Handles both forms:
 *   "    at fn (/abs/path.ts:12:34)"   and   "    at /abs/path.ts:12:34"
 */
function parseFrame(raw: string): { name: string; path: string; line: number; col: number } | null {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("at ")) return null;
  let body = trimmed.slice(3).trim();
  let name = "";
  if (body.endsWith(")")) {
    const open = body.lastIndexOf("(");
    if (open === -1) return null;
    name = body.slice(0, open).trim();
    body = body.slice(open + 1, -1);
  }
  // body is "path:line:col" — peel col then line from the end (paths themselves can contain ':').
  const ci = body.lastIndexOf(":");
  if (ci === -1) return null;
  const li = body.lastIndexOf(":", ci - 1);
  if (li === -1) return null;
  const lineStr = body.slice(li + 1, ci);
  const colStr = body.slice(ci + 1);
  const line = Number(lineStr);
  const col = Number(colStr);
  if (lineStr === "" || colStr === "" || !Number.isInteger(line) || !Number.isInteger(col)) {
    return null;
  }
  return { name, path: body.slice(0, li), line, col };
}

/** Parse a V8 stack string and return the first app frame (relative to `root`), or null. */
export function parseStack(stack: string, opts: { root?: string } = {}): Source | null {
  const root = opts.root ?? process.cwd();
  for (const raw of stack.split("\n")) {
    const f = parseFrame(raw);
    if (!f || !isAppFrame(f.path)) continue;
    return { file: relative(root, f.path), symbol: cleanSymbol(f.name), line: f.line, col: f.col };
  }
  return null;
}

/** Capture the current call site as a Source. `stack` is injectable for deterministic tests. */
export function captureSource(opts: { stack?: string; root?: string } = {}): Source | null {
  const stack = opts.stack ?? new Error().stack;
  if (!stack) return null;
  try {
    return parseStack(stack, { root: opts.root });
  } catch {
    return null; // never let source capture throw into the recorded code path
  }
}

/** Format a Source as the "file:symbol" sourceRef (the inverse of derive's parseSourceRef). */
export function formatSourceRef(src: Pick<Source, "file" | "symbol">): string {
  return src.symbol ? `${src.file}:${src.symbol}` : src.file;
}
