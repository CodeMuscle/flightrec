"use client";

// Sticky nav height (~56px) + breathing room, so a section lands a little below the top
// rather than flush at 0 (and clears the sticky navbar).
const SCROLL_OFFSET = 84;

/** Anchor that smooth-scrolls to an in-page id, offset below the nav, without writing #hash. */
export function SmoothLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();

    const stripHash = () =>
      history.replaceState(null, "", location.pathname + location.search);
    const id = href.slice(1);

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      stripHash();
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - SCROLL_OFFSET;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    stripHash();
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
