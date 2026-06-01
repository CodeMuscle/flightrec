"use client";

/** Anchor that smooth-scrolls to an in-page id without writing #hash to the URL. */
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
    const el = document.getElementById(href.slice(1));
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", location.pathname + location.search);
    }
  };

  return (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  );
}
