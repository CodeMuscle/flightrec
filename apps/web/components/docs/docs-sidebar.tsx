"use client";

import { useEffect, useState } from "react";

export type DocSection = { id: string; label: string };

export function DocsSidebar({ sections }: { sections: DocSection[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? "");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-15% 0px -75% 0px" },
    );
    for (const s of sections) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside className="hidden lg:block">
      <nav className="sticky top-20 flex flex-col border-l border-line">
        <span className="mb-2 pl-4 font-mono text-[10px] uppercase tracking-widest text-fg-faint">
          On this page
        </span>
        {sections.map((s) => {
          const on = active === s.id;
          return (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="-ml-px border-l-2 py-1.5 pl-4 font-mono text-xs transition"
              style={{
                borderColor: on ? "var(--accent)" : "transparent",
                color: on ? "var(--fg)" : "var(--fg-faint)",
              }}
            >
              {s.label}
            </a>
          );
        })}
      </nav>
    </aside>
  );
}
