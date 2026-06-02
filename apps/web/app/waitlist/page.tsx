import type { Metadata } from "next";
import { Logo } from "@/components/logo";
import { WaitlistForm } from "@/components/waitlist-form";
import { BrandVortex } from "@/components/visuals/brand-vortex";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "Early access",
  description:
    "Request early access to Flightrec — the time-travel debugger for the Next.js App Router. Onboarding the first 20.",
};

export default function Waitlist() {
  return (
    <main className="relative flex min-h-screen items-center justify-center px-6 py-20">
      <a href="/vision" className="absolute left-6 top-6 flex items-center gap-2.5">
        <Logo className="size-6 text-accent" />
        <span className="font-mono text-sm font-medium">flightrec</span>
      </a>
      <div className="absolute right-6 top-6">
        <ThemeToggle />
      </div>

      <div className="grid w-full max-w-6xl items-center gap-x-16 gap-y-12 lg:grid-cols-2 lg:gap-x-24">
        {/* left — copy + form */}
        <div className="max-w-md">
          <span className="eyebrow">Private alpha</span>
          <h1 className="display mt-4 text-balance text-4xl sm:text-5xl">
            Early access to the <span className="grad-text">flight recorder</span> for Next.js.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-fg-muted">
            Rewind a full App Router session — Server Actions, cache, RSC payloads, and the client
            tree — on one timeline. We&apos;re hand-onboarding the first 20.
          </p>
          <div className="mt-8">
            <WaitlistForm />
          </div>
        </div>

        {/* right — brand object */}
        <div className="flex items-center justify-center lg:justify-end">
          <BrandVortex />
        </div>
      </div>

      <p className="absolute bottom-6 left-6 font-mono text-xs text-fg-faint">
        built in public · @buildwithgg
      </p>
    </main>
  );
}
