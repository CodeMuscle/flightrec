"use client";

/** Anchor that smooth-scrolls to an in-page id, centering the section in the viewport, without writing #hash. */
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

    const stripHash = () => history.replaceState(null, "", location.pathname + location.search);
    const id = href.slice(1);

    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      stripHash();
      return;
    }

    const el = document.getElementById(id);
    if (!el) return;
    // center the section's content in the viewport
    const elTop = el.getBoundingClientRect().top + window.scrollY;
    const top = elTop + el.offsetHeight / 2 - window.innerHeight / 2;
    window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    stripHash();
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
