export function SectionHeader({
  eyebrow,
  title,
  intro,
  center = false,
}: {
  eyebrow: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  center?: boolean;
}) {
  return (
    <div className={center ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="eyebrow">{eyebrow}</span>
      <h2 className="display mt-4 text-balance text-4xl tracking-tight sm:text-[2.75rem]">
        {title}
      </h2>
      {intro && <p className="mt-4 text-lg leading-relaxed text-fg-muted">{intro}</p>}
    </div>
  );
}
