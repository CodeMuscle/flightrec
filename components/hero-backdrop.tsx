/** Hero backdrop — soft drifting aurora + graticule + scan sweep. CSS-only, reduced-motion aware. */
export function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden" aria-hidden>
      {/* warm aurora glow */}
      <div
        className="absolute -top-40 left-1/4 h-[520px] w-[640px] rounded-full blur-[120px]"
        style={{
          background: "radial-gradient(closest-side, var(--accent-glow), transparent 72%)",
          animation: "aurora 18s ease-in-out infinite",
        }}
      />
      {/* cool counterpoint */}
      <div
        className="absolute -top-24 right-1/4 h-[420px] w-[520px] rounded-full blur-[120px] opacity-60"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 72%)",
          animation: "aurora 22s ease-in-out infinite reverse",
        }}
      />
      {/* graticule grid, faded at edges */}
      <div
        className="absolute inset-0 opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(120% 80% at 50% 0%, black 0%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(120% 80% at 50% 0%, black 0%, transparent 70%)",
        }}
      />
      {/* scan sweep */}
      <div
        className="absolute inset-y-0 left-0 w-[26%]"
        style={{
          background: "linear-gradient(90deg, transparent, var(--accent-glow), transparent)",
          animation: "scan-sweep 10s linear infinite",
          maskImage: "linear-gradient(transparent, black 35%, black 65%, transparent)",
          WebkitMaskImage: "linear-gradient(transparent, black 35%, black 65%, transparent)",
        }}
      />
      {/* bottom fade into page */}
      <div
        className="absolute inset-x-0 bottom-0 h-40"
        style={{ background: "linear-gradient(transparent, var(--bg))" }}
      />
    </div>
  );
}
