"use client";

import { useAuthModal } from "@/app/components/AuthModalProvider";

/**
 * Hero auth action — opens the shared auth modal. The hero's primary CTA is
 * the role chooser in <HeroCta />, so this stays a single secondary "Log in"
 * link (with a context prefix) rather than a second competing primary button.
 */
export function HomeAuthNav({
  waitlist,
  prefix,
}: {
  waitlist: boolean;
  prefix?: string;
}) {
  const authModal = useAuthModal();

  if (waitlist) {
    return (
      <p className="text-sm text-white/90">
        {prefix ? `${prefix} ` : ""}
        <a href="/waitlist" className="font-bold text-white underline underline-offset-4">
          Join the waitlist
        </a>
      </p>
    );
  }

  return (
    <p className="text-sm text-white/90">
      {prefix ? `${prefix} ` : ""}
      <button
        type="button"
        onClick={(e) => authModal.open("login", e.currentTarget)}
        className="font-bold text-white underline underline-offset-4"
      >
        Log in
      </button>
    </p>
  );
}
