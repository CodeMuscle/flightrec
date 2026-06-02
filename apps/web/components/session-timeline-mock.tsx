"use client";

import { AnimatePresence, motion } from "motion/react";

/* ---- step data (blog-post-creator narrative, real-looking code) ---- */
type LineType = "normal" | "highlight" | "add" | "sub" | "success" | "empty";
type Line = { t: LineType; text: string };
type Step = {
  id: string;
  name: string;
  file: string;
  time: string;
  plane: string; // css var
  icon: "action" | "rsc" | "client";
  code: Line[];
};

const STEPS: Step[] = [
  {
    id: "server-action",
    name: "Server Action",
    file: "actions.ts",
    time: "0ms – 42ms",
    plane: "var(--plane-action)",
    icon: "action",
    code: [
      { t: "normal", text: "export async function createPost(form: FormData) {" },
      { t: "normal", text: "  const title = form.get('title')" },
      { t: "highlight", text: "  const post = await db.post.create({ title })" },
      { t: "normal", text: "  updateTag('posts')" },
      { t: "normal", text: "  redirect(`/posts/${post.id}`)" },
      { t: "normal", text: "}" },
      { t: "empty", text: "" },
      { t: "success", text: "→ created post #42" },
      { t: "success", text: "→ invalidated 'posts' tag" },
    ],
  },
  {
    id: "rsc-payload",
    name: "RSC Payload",
    file: "network.log",
    time: "42ms – 115ms",
    plane: "var(--plane-rsc)",
    icon: "rsc",
    code: [
      { t: "normal", text: '0:["$@1",["posts/[id]",null]]' },
      { t: "normal", text: '1:I[423,[],"PostView"]' },
      { t: "add", text: '2:{"id":42,"title":"Shipping Flightrec"}' },
      { t: "sub", text: '2:{"id":null,"title":""}' },
      { t: "normal", text: '3:T[1,"h1",{"className":"post-title"}]' },
      { t: "empty", text: "" },
      { t: "success", text: "→ streaming Flight frames to client" },
    ],
  },
  {
    id: "client-patch",
    name: "Client Patch",
    file: "react-tree.tsx",
    time: "115ms – 148ms",
    plane: "var(--plane-net)",
    icon: "client",
    code: [
      { t: "normal", text: "function PostView({ id }: { id: number }) {" },
      { t: "normal", text: "  const post = use(getPost(id))" },
      { t: "highlight", text: "  // UI patches seamlessly from the new payload" },
      { t: "add", text: "  return <article><h1>{post.title}</h1></article>" },
      { t: "normal", text: "}" },
      { t: "empty", text: "" },
      { t: "success", text: "→ React tree reconciled · DOM patched" },
    ],
  },
];

export const STEP_COUNT = STEPS.length;

/** Presentational IDE-style inspector. `step` is driven externally (scroll progress). */
export function SessionTimelineMock({ step }: { step: number }) {
  const s = Math.max(0, Math.min(STEP_COUNT - 1, Math.round(step)));
  const active = STEPS[s];

  return (
    <div
      className="card mx-auto w-full max-w-6xl overflow-hidden"
      style={{ boxShadow: "var(--shadow-float)" }}
    >
      {/* window chrome */}
      <div className="flex h-11 items-center justify-between border-b border-line bg-bg-inset px-4">
        <div className="flex gap-1.5">
          <span className="size-3 rounded-full bg-[#ff5f57]" />
          <span className="size-3 rounded-full bg-[#febc2e]" />
          <span className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="pill flex items-center gap-1.5 border border-line bg-bg-raised px-3 py-1 font-mono text-[11px] text-fg-muted">
          <LockIcon /> localhost:3000 / session-9281
        </span>
        <span className="w-12" />
      </div>

      <div className="flex h-110 flex-col sm:h-135 sm:flex-row">
        {/* left: timeline rail */}
        <div className="flex w-full shrink-0 flex-col border-b border-line bg-bg-inset/60 sm:w-60 sm:border-b-0 sm:border-r">
          <div className="border-b border-line px-4 py-3 font-mono text-[11px] uppercase tracking-wider text-fg-faint">
            Session Timeline
          </div>
          <div className="flex gap-2 overflow-x-auto p-2 sm:flex-col sm:gap-1 sm:overflow-visible">
            {STEPS.map((st, i) => {
              const on = i === s;
              return (
                <div
                  key={st.id}
                  className="flex min-w-max items-start gap-3 rounded-xl border p-3 transition-colors sm:min-w-0"
                  style={{
                    background: on ? "var(--accent-soft)" : "transparent",
                    borderColor: on ? "color-mix(in srgb, var(--accent) 35%, transparent)" : "transparent",
                  }}
                >
                  <span style={{ color: on ? st.plane : "var(--fg-faint)" }} className="mt-0.5">
                    <StepIcon kind={st.icon} />
                  </span>
                  <div>
                    <div
                      className="text-sm font-medium"
                      style={{ color: on ? "var(--fg)" : "var(--fg-muted)" }}
                    >
                      {st.name}
                    </div>
                    <div className="mt-0.5 font-mono text-[11px] text-fg-faint">{st.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* right: tabbed code inspector */}
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex border-b border-line bg-bg-inset/40">
            {STEPS.map((st, i) => {
              const on = i === s;
              return (
                <div
                  key={st.file}
                  className="flex items-center gap-2 border-r border-line px-4 py-2 font-mono text-xs"
                  style={{
                    color: on ? "var(--accent)" : "var(--fg-faint)",
                    background: on ? "var(--bg-raised)" : "transparent",
                    boxShadow: on ? "inset 0 2px 0 var(--accent)" : "none",
                  }}
                >
                  <FileIcon />
                  {st.file}
                </div>
              );
            })}
          </div>

          <div className="pane-scroll relative flex-1 overflow-auto bg-bg-raised p-4 font-mono text-[12.5px] leading-[1.7]">
            <AnimatePresence mode="wait">
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22 }}
              >
                {active.code.map((line, idx) => (
                  <CodeLine key={idx} line={line} n={idx + 1} />
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* footer: the cache-semantics differentiator, always visible */}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 border-t border-line bg-bg-inset px-4 py-2.5 font-mono text-[11px]">
        <span className="text-fg-faint">
          cache{" "}
          <span className="text-fg-muted">updateTag(&apos;posts&apos;)</span> →{" "}
          <span className="text-plane-cache">immediate-freshness ✓</span>
        </span>
        <span className="text-fg-faint">
          route <span className="text-fg-muted">/posts/42</span>
        </span>
        <span className="ml-auto text-fg-faint">total 148ms</span>
      </div>
    </div>
  );
}

function CodeLine({ line, n }: { line: Line; n: number }) {
  if (line.t === "empty") return <div className="h-5" />;

  const styles: Record<Exclude<LineType, "empty">, { row: string; num: string; text: React.CSSProperties; prefix?: string; strike?: boolean }> = {
    normal: { row: "hover:bg-fg/[0.03]", num: "text-fg-faint/60", text: { color: "var(--fg-muted)" } },
    highlight: {
      row: "-mx-4 border-l-2 border-accent bg-accent-soft px-4",
      num: "text-fg-faint",
      text: { color: "var(--fg)" },
    },
    add: {
      row: "-mx-4 px-4",
      num: "text-emerald-600/60",
      text: { color: "#15803d", background: "rgba(34,197,94,0.10)" },
      prefix: "+ ",
    },
    sub: {
      row: "-mx-4 px-4",
      num: "text-red-500/50",
      text: { color: "#b91c1c", background: "rgba(239,68,68,0.08)" },
      prefix: "− ",
      strike: true,
    },
    success: { row: "", num: "text-fg-faint/60", text: { color: "var(--plane-cache)", fontStyle: "italic" } },
  };

  const st = styles[line.t];
  return (
    <div className={`flex ${st.row}`}>
      <span className={`w-8 shrink-0 select-none pr-3 text-right ${st.num}`}>{n}</span>
      <span
        className={`flex-1 whitespace-pre rounded-sm ${st.strike ? "line-through opacity-80" : ""}`}
        style={st.text}
      >
        {st.prefix}
        {line.text}
      </span>
    </div>
  );
}

/* ---- icons ---- */
function StepIcon({ kind }: { kind: Step["icon"] }) {
  if (kind === "action")
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <ellipse cx="8" cy="4" rx="5" ry="2" />
        <path d="M3 4v8c0 1.1 2.24 2 5 2s5-.9 5-2V4M3 8c0 1.1 2.24 2 5 2s5-.9 5-2" />
      </svg>
    );
  if (kind === "rsc")
    return (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
        <path d="M4.5 11a3 3 0 0 1-.5-5.96A4 4 0 0 1 12 5.5a2.75 2.75 0 0 1-.5 5.5" strokeLinecap="round" />
        <path d="M8 7v5m0 0L6 10m2 2 2-2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <rect x="2" y="2.5" width="12" height="8" rx="1.2" />
      <path d="M6 13.5h4M8 10.5v3" strokeLinecap="round" />
    </svg>
  );
}
function LockIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="7" width="9" height="6.5" rx="1.2" />
      <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
    </svg>
  );
}
function FileIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.4">
      <path d="M4 1.5h5L13 5.5v9H4z" />
      <path d="M9 1.5v4h4" />
    </svg>
  );
}
