"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const OPTIONS = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: SystemIcon },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div
      className="flex items-center gap-0.5 rounded-md border border-line bg-bg-inset p-0.5"
      role="radiogroup"
      aria-label="Color theme"
    >
      {OPTIONS.map((o) => {
        const active = mounted && theme === o.value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            onClick={() => setTheme(o.value)}
            role="radio"
            aria-checked={active}
            aria-label={o.label}
            title={o.label}
            className={`flex size-6 items-center justify-center rounded transition ${
              active ? "bg-bg-raised text-accent shadow-sm" : "text-fg-faint hover:text-fg"
            }`}
          >
            <Icon />
          </button>
        );
      })}
    </div>
  );
}

function SunIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <circle cx="8" cy="8" r="3" />
      <path
        strokeLinecap="round"
        d="M8 1v1.5M8 13.5V15M15 8h-1.5M2.5 8H1M12.9 3.1l-1 1M4.1 11.9l-1 1M12.9 12.9l-1-1M4.1 4.1l-1-1"
      />
    </svg>
  );
}
function MoonIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="currentColor">
      <path d="M13.3 9.3A5.5 5.5 0 016.7 2.7a5.5 5.5 0 106.6 6.6z" />
    </svg>
  );
}
function SystemIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
    >
      <rect x="1.5" y="2.5" width="13" height="9" rx="1.2" />
      <path strokeLinecap="round" d="M5.5 14h5M8 11.5V14" />
    </svg>
  );
}
