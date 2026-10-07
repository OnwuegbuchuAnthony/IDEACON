/** Gold = verified firm. Blue = verified affiliate/member. Token classes only. */
export function GoldBadge() {
  return (
    <span
      title="Verified firm"
      className="inline-flex items-center gap-0.5 rounded-full bg-sun-500 px-2 py-0.5 text-[11px] font-extrabold text-ink"
    >
      ★ Verified
    </span>
  );
}

export function BlueBadge() {
  return (
    <span
      title="Official affiliate"
      className="inline-flex items-center gap-0.5 rounded-full bg-primary-100 px-2 py-0.5 text-[11px] font-extrabold text-primary-800"
    >
      ✓ Affiliate
    </span>
  );
}
