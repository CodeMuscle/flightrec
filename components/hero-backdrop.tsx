/** Minimal oscilloscope backdrop for the hero — CSS-only, GPU-friendly, reduced-motion aware. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* graticule grid */}
      <div
        className="absolute inset-0 opacity-[0.5]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage:
            "radial-gradient(120% 90% at 50% 0%, black 0%, transparent 72%)",
          WebkitMaskImage:
            "radial-gradient(120% 90% at 50% 0%, black 0%, transparent 72%)",
        }}
      />
      {/* drifting accent glow */}
      <div
        className="absolute left-1/2 top-[-18%] h-[420px] w-[820px] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, var(--accent-glow), transparent 70%)",
          animation: "drift 16s ease-in-out infinite",
        }}
      />
      {/* horizontal scan sweep */}
      <div
        className="absolute inset-y-0 left-0 w-[28%]"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
          animation: "scan-sweep 9s linear infinite",
          maskImage: "linear-gradient(transparent, black 30%, black 70%, transparent)",
          WebkitMaskImage:
            "linear-gradient(transparent, black 30%, black 70%, transparent)",
        }}
      />
      {/* baseline trace line */}
      <div
        className="absolute left-0 right-0 top-[46%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent-dim), transparent)",
          opacity: 0.35,
        }}
      />
    </div>
  );
}
