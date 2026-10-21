"use client";

import { useAuthModal } from "@/app/components/AuthModalProvider";

/** Homepage hero auth actions — opens the shared auth modal. */
export function HomeAuthNav({ waitlist }: { waitlist: boolean }) {
  const authModal = useAuthModal();

  if (waitlist) {
    return (
      <>
        <a
          href="/waitlist"
          className="rounded-full bg-white px-4 py-2 text-primary-800 hover:bg-primary-100"
        >
          Join waitlist
        </a>
        <button
          type="button"
          onClick={(e) => authModal.open("login", e.currentTarget)}
          className="rounded-full bg-white/15 px-4 py-2 hover:bg-white/25"
        >
          Member log in
        </button>
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={(e) => authModal.open("login", e.currentTarget)}
        className="rounded-full bg-white/15 px-4 py-2 hover:bg-white/25"
      >
        Log in
      </button>
      <button
        type="button"
        onClick={(e) => authModal.open("register", e.currentTarget)}
        className="rounded-full bg-white px-4 py-2 text-primary-800 hover:bg-primary-100"
      >
        Get started
      </button>
    </>
  );
}
