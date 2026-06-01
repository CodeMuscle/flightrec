export function Logo({ className }: { className?: string }) {
  // a rewind glyph: a clock arc with a backward play head
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" opacity="0.35" />
      <path
        d="M12 7v5l-3 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0"
      />
      <path
        d="M11 9.5 7.5 12 11 14.5zM15.5 9.5 12 12l3.5 2.5z"
        fill="currentColor"
      />
    </svg>
  );
}
