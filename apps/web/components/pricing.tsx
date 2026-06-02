import { SectionHeader } from "./section";

const TIERS = [
  {
    name: "Free",
    price: "$0",
    cadence: "forever",
    blurb: "For solo debugging, fully local.",
    cta: "Start free",
    featured: false,
    features: [
      "Local capture, all six planes",
      ".frec export / import",
      "Inspector PWA",
      "Cache-semantics classifier",
      "Community support",
    ],
  },
  {
    name: "Growth",
    price: "$299",
    cadence: "/ month",
    blurb: "For teams shipping fast.",
    cta: "Try Flightrec for free",
    featured: true,
    features: [
      "Everything in Free",
      "Cloud sync + shared trace links",
      "90-day retention",
      "Flightrec MCP server",
      "AI session summaries & bug reports",
      "Priority support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    cadence: "",
    blurb: "For orgs at scale.",
    cta: "Contact us",
    featured: false,
    features: [
      "SSO / SAML + audit logs",
      "Self-host / BYO storage",
      "Data residency",
      "SLA + dedicated support",
      "Security review & DPA",
    ],
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="page scroll-mt-20 py-24 sm:py-28">
      <SectionHeader
        center
        eyebrow="Pricing"
        title="Start free. Scale when your team does."
        intro="The core SDK, inspector, and trace format are open source and free forever. Pay only for cloud collaboration."
      />

      <div className="relative mt-12">
        {/* blurred preview of the tiers */}
        <div className="pointer-events-none select-none opacity-70 blur-md">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-5 md:grid-cols-3">
            {TIERS.map((t) => (
              <div
                key={t.name}
                className="card flex flex-col p-7"
                style={t.featured ? { boxShadow: "var(--shadow-float)" } : undefined}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.name}</span>
                  {t.featured && (
                    <span className="pill bg-accent-soft px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-accent">
                      Popular
                    </span>
                  )}
                </div>
                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="display text-4xl">{t.price}</span>
                  {t.cadence && <span className="text-sm text-fg-faint">{t.cadence}</span>}
                </div>
                <p className="mt-2 text-sm text-fg-muted">{t.blurb}</p>
                <div
                  className={`pill mt-6 py-2.5 text-center text-sm font-medium ${
                    t.featured ? "bg-fg text-bg" : "border border-line bg-bg-raised text-fg"
                  }`}
                >
                  {t.cta}
                </div>
                <ul className="mt-7 space-y-2.5 text-sm text-fg-muted">
                  {t.features.map((f) => (
                    <li key={f} className="flex gap-2.5">
                      <CheckIcon />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <p className="mt-6 text-center font-mono text-xs text-fg-faint">
            Start free. No credit card required.
          </p>
        </div>

        {/* coming-soon overlay */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="pill flex items-center gap-2.5 border border-line bg-bg-raised/85 px-7 py-3.5 shadow-(--shadow-card) backdrop-blur">
            <span className="size-2 animate-pulse rounded-full bg-accent" />
            <span className="text-lg font-semibold">
              <span className="grad-text">Coming soon</span>
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" fill="none" className="mt-0.5 shrink-0">
      <circle cx="8" cy="8" r="8" fill="var(--accent-soft)" />
      <path
        d="m5 8 2 2 4-4.5"
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
