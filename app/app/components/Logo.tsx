import Link from "next/link";

/**
 * The single source of truth for the IDEACON brand mark: a link to "/" with
 * an icon plus the wordmark. Below 400px the wordmark is hidden so only the
 * icon shows; the accessible name stays "IDEACON home" at every size.
 *
 * `bare` renders the mark without the wrapping link (for use inside an
 * existing link or a non-linked context such as the error page).
 */
export function Logo({
  className = "",
  iconOnlyBelow = true,
  bare = false,
}: {
  className?: string;
  iconOnlyBelow?: boolean;
  bare?: boolean;
}) {
  const inner = (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span aria-hidden="true" className="text-lg leading-none">
        ◈
      </span>
      <span
        className={`font-display text-base font-extrabold ${
          iconOnlyBelow ? "hidden min-[400px]:inline" : ""
        }`}
      >
        IDEACON
      </span>
    </span>
  );

  if (bare) return inner;

  return (
    <Link
      href="/"
      aria-label="IDEACON home"
      className="inline-flex items-center rounded-lg text-ink"
    >
      {inner}
    </Link>
  );
}
