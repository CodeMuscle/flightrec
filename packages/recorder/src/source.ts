import { relative } from "node:path";

/** A parsed source location from a stack frame. */
export type Source = { file: string; symbol: string; line: number; col: number };

// V8 stack lines look like:  "    at fn (/abs/path.ts:12:34)"  or  "    at /abs/path.ts:12:34"
const WITH_FN = /^\s*at\s+(.+?)\s+\((.+):(\d+):(\d+)\)$/;
const NO_FN = /^\s*at\s+(.+):(\d+):(\d+)$/;

/** A frame is "app code" if it isn't node internals, a dependency, or the recorder itself. */
function isAppFrame(path: string): boolean {
  return (
    !path.startsWith("node:") && !path.includes("node_modules") && !/[/\\]recorder[/\\]/.test(path)
  );
}

/** Clean a raw stack frame name into a bare symbol: "async Object.signIn" → "signIn". */
function cleanSymbol(name: string): string {
  const bare = name.replace(/^async\s+/, "").replace(/^new\s+/, "");
  const dotted = bare.split(".");
  return dotted[dotted.length - 1] ?? "";
}

/** Parse a V8 stack string and return the first app frame (relative to `root`), or null. */
export function parseStack(stack: string, opts: { root?: string } = {}): Source | null {
  const root = opts.root ?? process.cwd();
  for (const raw of stack.split("\n")) {
    const fn = raw.match(WITH_FN);
    if (fn) {
      const [, name, path, line, col] = fn;
      if (!isAppFrame(path)) continue;
      return { file: relative(root, path), symbol: cleanSymbol(name), line: +line, col: +col };
    }
    const anon = raw.match(NO_FN);
    if (anon) {
      const [, path, line, col] = anon;
      if (!isAppFrame(path)) continue;
      return { file: relative(root, path), symbol: "", line: +line, col: +col };
    }
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
