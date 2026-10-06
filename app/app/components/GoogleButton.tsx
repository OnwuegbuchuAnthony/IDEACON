"use client";

import { authClient } from "@/lib/auth-client";

/** Shared Google OAuth button. Server enables it when GOOGLE_CLIENT_ID is set. */
export function GoogleButton({ callbackURL, label }: { callbackURL: string; label?: string }) {
  async function go() {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  }
  return (
    <button
      onClick={go}
      className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border-2 border-primary-100 bg-white px-6 py-3 text-sm font-bold hover:border-primary-400"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
        <path fill="#4285F4" d="M23.5 12.3c0-.9-.1-1.5-.3-2.3H12v4.3h6.5c-.1 1.1-.8 2.7-2.4 3.8l-.1.7 3.5 2.7.2.1c2.2-2 3.6-5 3.6-9.3Z" />
        <path fill="#34A853" d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.8-2.9c-1 .7-2.4 1.2-4.1 1.2-3.1 0-5.8-2.1-6.8-5l-.7.1-2.9 2.2v.7C3.6 21.3 7.5 24 12 24Z" />
        <path fill="#FBBC05" d="M5.2 14.4c-.2-.7-.4-1.5-.4-2.4s.1-1.7.4-2.4l-.1-.7-2.9-2.2-.7.3C.6 8.6 0 10.2 0 12s.6 3.4 1.5 4.9l3.7-2.5Z" />
        <path fill="#EA4335" d="M12 4.7c1.8 0 3 .8 3.7 1.4l3.3-3.2C17.9 1.1 15.2 0 12 0 7.5 0 3.6 2.7 1.5 6.6l3.7 2.9c1-2.9 3.7-4.8 6.8-4.8Z" />
      </svg>
      {label ?? "Continue with Google"}
    </button>
  );
}
