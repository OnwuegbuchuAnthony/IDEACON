import type { ReactNode } from "react";

/**
 * Standard content container. Enforces the single max content width
 * (1200px via --container-content) with a consistent horizontal gutter on
 * the 8px spacing scale. Every page and section should wrap its content in
 * this so widths line up across the whole site.
 */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8 ${className}`}>
      {children}
    </div>
  );
}

/** Vertical rhythm wrapper: consistent 8px-scale block spacing between blocks. */
export function Section({
  children,
  className = "",
  id,
  ariaLabel,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
}) {
  return (
    <section
      id={id}
      aria-label={ariaLabel}
      className={`w-full scroll-mt-20 py-14 sm:py-24 ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * Shared page intro: eyebrow, one H1, lede and optional actions. The narrow
 * measure lives on an inner element (not on <Container />) because the
 * container's own max-width utility would win over a `max-w-*` override.
 */
export function PageIntro({
  eyebrow,
  title,
  lede,
  actions,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  lede?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Section ariaLabel={title} className={className}>
      <Container>
        <div className="max-w-3xl">
          {eyebrow ? (
            <p className="text-sm font-bold text-primary-600">{eyebrow}</p>
          ) : null}
          <h1 className="mt-2 font-display text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
            {title}
          </h1>
          {lede ? <div className="mt-3 text-lg text-ink/80">{lede}</div> : null}
          {actions ? <div className="mt-5 flex flex-wrap gap-3">{actions}</div> : null}
        </div>
      </Container>
    </Section>
  );
}

/** Standard card used across marketing sections. */
export function InfoCard({
  title,
  children,
  className = "",
}: {
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[16px] border border-border bg-surface p-5 shadow transition-transform hover:-translate-y-[2px] hover:shadow-lg ${className}`}
    >
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <div className="mt-1 text-sm text-ink/70">{children}</div>
    </div>
  );
}
