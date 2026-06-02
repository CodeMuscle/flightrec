"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/waitlist/actions";

export function WaitlistForm() {
  const [state, action, pending] = useActionState<WaitlistState, FormData>(joinWaitlist, null);

  if (state?.ok) {
    return (
      <div className="card flex items-start gap-3 p-5">
        <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent-soft">
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="1.8"
          >
            <path d="m3 8.5 3.5 3.5L13 4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="text-sm text-fg">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          name="email"
          required
          autoComplete="email"
          placeholder="you@company.com"
          className="pill flex-1 border border-line bg-bg-raised px-4 py-3 text-sm text-fg shadow-(--shadow-sm) outline-none transition placeholder:text-fg-faint focus:border-accent"
        />
        <button
          type="submit"
          disabled={pending}
          className="pill bg-fg px-5 py-3 text-sm font-medium text-bg shadow-(--shadow-sm) transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Joining…" : "Get access"}
        </button>
      </div>
      {state && !state.ok && <p className="px-1 text-sm text-[#c2410c]">{state.message}</p>}
    </form>
  );
}
