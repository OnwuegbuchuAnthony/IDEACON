"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthModal } from "@/app/components/AuthModalProvider";

/**
 * /login keeps working as a URL: the site chrome renders behind, and the shared
 * auth modal opens automatically. Closing it returns to the previous page, or
 * "/" when there is no history to go back to.
 */
export default function LoginPage() {
  const router = useRouter();
  const authModal = useAuthModal();

  useEffect(() => {
    // Navigate away once the modal closes (Esc, backdrop, X, or success).
    authModal.onNextClose(() => {
      if (window.history.length > 1) router.back();
      else router.push("/");
    });
    authModal.open("login");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <h1 className="font-display text-3xl font-extrabold">Log in to IDEACON</h1>
      <p className="mt-3 text-sm text-ink/60">Use the dialog to continue with Google or your email address.</p>
      <button
        type="button"
        onClick={() => authModal.open("login")}
        className="mt-6 rounded-full bg-gradient-to-r from-primary-600 to-primary-400 px-6 py-3 text-sm font-bold text-white"
      >
        Open login
      </button>
    </main>
  );
}
