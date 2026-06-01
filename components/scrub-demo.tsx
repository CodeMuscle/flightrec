"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  TICKS,
  PLANE_META,
  CACHE_OUTCOME_META,
  SESSION,
  type Tick,
  type Plane,
} from "@/lib/fixtures";

const LAST = TICKS.length - 1;
const PLANES: Plane[] = ["user", "action", "cache", "net", "rsc", "tree"];

const CHAIN: { label: string; plane: Plane; at: number }[] = [
  { label: "submit", plane: "user", at: 2 },
  { label: "createPost()", plane: "action", at: 3 },
  { label: "updateTag", plane: "cache", at: 4 },
  { label: "redirect", plane: "net", at: 7 },
  { label: "RSC stream", plane: "rsc", at: 8 },
  { label: "reconcile", plane: "tree", at: 10 },
];

export function ScrubDemo() {
  const [tick, setTick] = useState(0);
  const [playing, setPlaying] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setTick((t) => {
        if (t >= LAST) {
          setPlaying(false);
          return t;
        }
        return t + 1;
      });
    }, 900);
    return () => clearInterval(id);
  }, [playing]);

  const onKey = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      setTick((t) => Math.min(LAST, t + 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setTick((t) => Math.max(0, t - 1));
    } else if (e.key === " ") {
      e.preventDefault();
      setPlaying((p) => !p);
    }
  }, []);

  const seekFromX = useCallback((clientX: number) => {
    const rect = trackRef.current!.getBoundingClientRect();
    const r = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    setTick(Math.round(r * LAST));
  }, []);

  const current = TICKS[tick];
  const upto = TICKS.slice(0, tick + 1);
  const cookies = upto.filter((t) => t.net?.kind === "cookie");
  const redirect = upto.find((t) => t.net?.kind === "redirect");

  return (
    <div
      className="surface overflow-hidden"
      tabIndex={0}
      onKeyDown={onKey}
      role="application"
      aria-label="Interactive Flightrec timeline demo"
    >
      {/* title bar */}
      <div className="flex items-center justify-between gap-4 border-b border-line px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-[#ff5f57]" />
            <span className="size-2.5 rounded-full bg-[#febc2e]" />
            <span className="size-2.5 rounded-full bg-[#28c840]" />
          </div>
          <span className="truncate font-mono text-xs text-fg-faint">
            flightrec · session {SESSION.id}
          </span>
        </div>
        <span className="hidden font-mono text-[11px] text-fg-faint sm:block">
          next {SESSION.nextVersion}
        </span>
      </div>

      {/* transport */}
      <div className="flex flex-col gap-3 px-4 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (tick >= LAST) setTick(0);
              setPlaying((p) => !p);
            }}
            className="flex size-9 items-center justify-center rounded-md border border-line-strong bg-bg-inset text-fg transition hover:border-accent hover:text-accent"
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <PauseIcon /> : <PlayIcon />}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setTick(0);
            }}
            className="flex size-9 items-center justify-center rounded-md border border-line bg-bg-inset text-fg-muted transition hover:text-fg"
            aria-label="Restart"
          >
            <RewindIcon />
          </button>
          <div className="ml-1 font-mono text-xs text-fg-faint">
            tick{" "}
            <span className="tabular-nums text-fg">{String(tick).padStart(2, "0")}</span>
            <span className="text-fg-faint">/{LAST}</span>
            <span className="mx-2 text-line-strong">·</span>
            <span className="tabular-nums text-accent">+{current.ts}ms</span>
          </div>
        </div>
        <CausalityChain tick={tick} />
      </div>

      {/* swimlane timeline */}
      <div className="px-4 pb-3 pt-4">
        <div
          ref={trackRef}
          className="relative select-none"
          onPointerDown={(e) => {
            setPlaying(false);
            seekFromX(e.clientX);
            const move = (ev: PointerEvent) => seekFromX(ev.clientX);
            const up = () => {
              window.removeEventListener("pointermove", move);
              window.removeEventListener("pointerup", up);
            };
            window.addEventListener("pointermove", move);
            window.addEventListener("pointerup", up);
          }}
        >
          {PLANES.map((p) => {
            const events = TICKS.filter((t) => t.plane === p);
            return (
              <div key={p} className="flex items-center gap-3 py-[3px]">
                <span className="flex w-16 shrink-0 items-center gap-1.5">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ background: PLANE_META[p].varName }}
                  />
                  <span className="font-mono text-[10px] uppercase tracking-wider text-fg-faint">
                    {PLANE_META[p].short}
                  </span>
                </span>
                <div className="relative h-5 flex-1">
                  <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-line" />
                  {events.map((t) => {
                    const left = (t.tick / LAST) * 100;
                    const active = t.tick === tick;
                    const past = t.tick <= tick;
                    return (
                      <button
                        key={t.tick}
                        onClick={(e) => {
                          e.stopPropagation();
                          setPlaying(false);
                          setTick(t.tick);
                        }}
                        className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 p-1"
                        style={{ left: `${left}%` }}
                        aria-label={`Tick ${t.tick}: ${t.title}`}
                      >
                        <span
                          className="block rounded-full transition-all"
                          style={{
                            width: active ? 12 : 8,
                            height: active ? 12 : 8,
                            background: past ? PLANE_META[p].varName : "var(--bg-inset)",
                            border: `1.5px solid ${past ? PLANE_META[p].varName : "var(--line-strong)"}`,
                            boxShadow: active ? "0 0 0 4px var(--accent-glow)" : "none",
                          }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {/* scrub head spanning all lanes */}
          <motion.div
            className="pointer-events-none absolute bottom-0 top-0 w-px bg-accent"
            style={{
              left: `calc(76px + (100% - 76px) * ${tick / LAST})`,
              animation: "pulse-head 1.6s ease-in-out infinite",
            }}
            animate={{ left: `calc(76px + (100% - 76px) * ${tick / LAST})` }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <span className="absolute -top-1 left-1/2 size-2 -translate-x-1/2 rotate-45 bg-accent" />
          </motion.div>
        </div>

        {/* current event readout */}
        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-3 font-mono text-xs">
          <PlaneTag plane={current.plane} />
          <span className="text-fg">{current.title}</span>
          <span className="text-fg-faint">— {current.detail}</span>
          {current.source && <span className="text-accent-dim">{current.source}</span>}
        </div>
      </div>

      {/* synchronized panes */}
      <div className="grid grid-cols-1 gap-px border-t border-line bg-line md:grid-cols-2">
        <Pane title="Server Action" plane="action" active={current.plane === "action"}>
          <ActionPane upto={upto} />
        </Pane>
        <Pane title="Cache invalidation" plane="cache" active={current.plane === "cache"}>
          <CachePane upto={upto} />
        </Pane>
        <Pane title="RSC payload frames" plane="rsc" active={current.plane === "rsc"}>
          <RscPane upto={upto} />
        </Pane>
        <Pane title="Client tree diff" plane="tree" active={current.plane === "tree"}>
          <TreePane upto={upto} activeTick={tick} />
        </Pane>
      </div>

      {/* live session-state strip */}
      <div className="grid grid-cols-2 gap-px border-t border-line bg-line font-mono text-xs sm:grid-cols-4">
        <State label="route">
          <span className={redirect ? "text-accent" : "text-fg"}>{current.route}</span>
        </State>
        <State label="cookies">
          {cookies.length ? (
            <span className="text-fg">
              {cookies[cookies.length - 1].net!.key}=
              <span className="text-[color:var(--plane-net)]">
                {cookies[cookies.length - 1].net!.value}
              </span>
            </span>
          ) : (
            <span className="text-fg-faint">none</span>
          )}
        </State>
        <State label="redirect">
          {redirect ? (
            <span className="text-accent">303 → {redirect.net!.value}</span>
          ) : (
            <span className="text-fg-faint">—</span>
          )}
        </State>
        <State label="cache tag">
          {upto.some((t) => t.cache) ? (
            <span className="text-[color:var(--plane-cache)]">posts · fresh</span>
          ) : (
            <span className="text-fg-faint">—</span>
          )}
        </State>
      </div>
    </div>
  );
}

/* ---------- causality ---------- */

function CausalityChain({ tick }: { tick: number }) {
  return (
    <div className="flex flex-wrap items-center gap-1">
      {CHAIN.map((c, i) => {
        const on = tick >= c.at;
        return (
          <span key={c.label} className="flex items-center gap-1">
            {i > 0 && (
              <span className={on ? "text-fg-faint" : "text-line-strong"}>→</span>
            )}
            <span
              className="rounded px-1.5 py-0.5 font-mono text-[10px] transition-colors"
              style={{
                color: on ? PLANE_META[c.plane].varName : "var(--fg-faint)",
                background: on
                  ? `color-mix(in srgb, ${PLANE_META[c.plane].varName} 12%, transparent)`
                  : "transparent",
                opacity: on ? 1 : 0.5,
              }}
            >
              {c.label}
            </span>
          </span>
        );
      })}
    </div>
  );
}

/* ---------- panes ---------- */

function Pane({
  title,
  plane,
  active,
  children,
}: {
  title: string;
  plane: Plane;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="relative bg-bg-raised">
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300"
        style={{
          opacity: active ? 1 : 0,
          boxShadow: `inset 0 0 0 1px ${PLANE_META[plane].varName}`,
        }}
      />
      <div className="flex items-center justify-between border-b border-line px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full" style={{ background: PLANE_META[plane].varName }} />
          <span className="font-mono text-[11px] uppercase tracking-wider text-fg-muted">
            {title}
          </span>
        </div>
        {active && (
          <span className="font-mono text-[10px] uppercase tracking-wider text-accent">active</span>
        )}
      </div>
      <div className="pane-scroll h-[148px] overflow-y-auto p-3">{children}</div>
    </div>
  );
}

function ActionPane({ upto }: { upto: Tick[] }) {
  const actions = upto.filter((t) => t.action);
  if (actions.length === 0) return <Empty>waiting for a Server Action…</Empty>;
  const latest = actions[actions.length - 1];
  const a = latest.action!;
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <StatusDot status={a.status} />
        <span className="font-mono text-sm text-fg">{a.name}()</span>
      </div>
      <div className="font-mono text-xs text-fg-faint">{a.argsPreview}</div>
      <div className="font-mono text-[11px] text-fg-faint">{latest.source}</div>
      {a.status === "ok" && (
        <div className="font-mono text-[11px] text-[color:var(--plane-cache)]">resolved · 330ms</div>
      )}
    </div>
  );
}

function CachePane({ upto }: { upto: Tick[] }) {
  const events = upto.filter((t) => t.cache);
  if (events.length === 0) return <Empty>no cache activity yet…</Empty>;
  return (
    <div className="space-y-2">
      {events.map((t) => {
        const c = t.cache!;
        const meta = c.outcome ? CACHE_OUTCOME_META[c.outcome] : null;
        const tone =
          meta?.tone === "good"
            ? "var(--plane-cache)"
            : meta?.tone === "warn"
              ? "var(--accent)"
              : "var(--plane-tree)";
        return (
          <div key={t.tick} className="space-y-1">
            <div className="font-mono text-sm text-fg">
              {c.api}(<span className="text-[color:var(--plane-cache)]">&apos;{c.tag}&apos;</span>)
            </div>
            {meta && (
              <span
                className="inline-flex items-center gap-1.5 rounded border px-1.5 py-0.5 font-mono text-[10px]"
                style={{ borderColor: tone, color: tone }}
              >
                {meta.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function RscPane({ upto }: { upto: Tick[] }) {
  const frames = upto.filter((t) => t.rsc);
  if (frames.length === 0) return <Empty>no frames streamed yet…</Empty>;
  return (
    <div className="space-y-1.5">
      <AnimatePresence initial={false}>
        {frames.map((t) => {
          const f = t.rsc!;
          return (
            <motion.div
              key={t.tick}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between rounded border border-line bg-bg-inset px-2 py-1.5 font-mono text-xs"
            >
              <span className="text-fg">
                <span className="text-[color:var(--plane-rsc)]">
                  {f.rawKind}
                  {f.frameIndex}
                </span>{" "}
                {f.segment}
              </span>
              <span className="text-fg-faint">{f.bytes}B</span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function TreePane({ upto, activeTick }: { upto: Tick[]; activeTick: number }) {
  const ops = upto.filter((t) => t.tree);
  if (ops.length === 0) return <Empty>client tree unchanged…</Empty>;
  return (
    <div className="space-y-0.5 font-mono text-xs">
      <AnimatePresence initial={false}>
        {ops.map((t) => {
          const op = t.tree!;
          const isNew = t.tick === activeTick;
          return (
            <motion.div
              key={t.tick}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="flex items-center gap-2"
              style={{ paddingLeft: op.depth * 14 }}
            >
              <span
                className="text-[10px]"
                style={{ color: op.kind === "remove" ? "#ef4444" : "var(--plane-tree)" }}
              >
                {op.kind === "create" ? "+" : op.kind === "remove" ? "−" : "~"}
              </span>
              <span className={isNew ? "text-fg" : "text-fg-muted"}>{op.label}</span>
              {isNew && (
                <span className="rounded bg-[color:var(--accent-glow)] px-1 text-[9px] text-accent">
                  {op.kind}
                </span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/* ---------- bits ---------- */

function State({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-bg-raised px-4 py-2.5">
      <div className="text-[10px] uppercase tracking-wider text-fg-faint">{label}</div>
      <div className="mt-0.5 truncate">{children}</div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full items-center justify-center font-mono text-xs text-fg-faint">
      {children}
    </div>
  );
}

function PlaneTag({ plane }: { plane: Plane }) {
  return (
    <span
      className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider"
      style={{
        color: PLANE_META[plane].varName,
        background: `color-mix(in srgb, ${PLANE_META[plane].varName} 14%, transparent)`,
      }}
    >
      {PLANE_META[plane].short}
    </span>
  );
}

function StatusDot({ status }: { status: "running" | "ok" | "error" }) {
  const color =
    status === "ok" ? "var(--plane-cache)" : status === "error" ? "#ef4444" : "var(--accent)";
  return (
    <span className="relative flex size-2.5">
      {status === "running" && (
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: color }}
        />
      )}
      <span className="relative inline-flex size-2.5 rounded-full" style={{ background: color }} />
    </span>
  );
}

function PlayIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M4 2.5v11l9-5.5z" />
    </svg>
  );
}
function PauseIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <rect x="3.5" y="2.5" width="3" height="11" rx="1" />
      <rect x="9.5" y="2.5" width="3" height="11" rx="1" />
    </svg>
  );
}
function RewindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
      <path d="M7.5 8 14 3.5v9zM1 8l6.5-4.5v9z" />
    </svg>
  );
}
