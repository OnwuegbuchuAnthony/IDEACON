"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useAuthModal } from "@/app/components/AuthModalProvider";

export function MobileGetStartedBar() {
  const [show, setShow] = useState(false);
  const pathname = usePathname();
  const authModal = useAuthModal();
  const waitlist = process.env.NEXT_PUBLIC_LAUNCH_MODE === "waitlist";

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setShow(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  if (!show) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex gap-2 border-t border-border bg-white px-4 py-2 md:hidden">
      {waitlist ? (
        <Link
          href="/waitlist"
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-400 text-sm font-bold text-white"
        >
          Join waitlist
        </Link>
      ) : (
        <button
          type="button"
          onClick={(e) => authModal.open("register", e.currentTarget)}
          className="inline-flex h-12 w-full items-center justify-center rounded-full bg-gradient-to-r from-primary-600 to-primary-400 text-sm font-bold text-white"
        >
          Get started
        </button>
      )}
    </div>
  );
}
