interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export function SectionHeading({
  eyebrow,
  title,
  description,
}: SectionHeadingProps) {
  return (
    <div className="max-w-2xl">
      <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange">
        // {eyebrow}
      </p>
      <h2 className="mt-3 font-heading text-3xl font-semibold tracking-[-0.03em] text-ink-text sm:text-4xl">
        {title}
      </h2>
      {description && (
        <p className="mt-4 max-w-xl text-base leading-7 text-muted-line sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
