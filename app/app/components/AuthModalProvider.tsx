"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { completeSignupAction } from "@/lib/actions-signup";
import { LoginModal } from "@/app/components/LoginModal";

type Mode = "login" | "register";

type AuthModalCtx = {
  /** Open the modal. Pass the element that triggered it so focus is restored on close. */
  open: (mode?: Mode, trigger?: HTMLElement | null) => void;
  close: () => void;
  /** Run once after the next close (used by /login to navigate away). */
  onNextClose: (fn: () => void) => void;
};

const Ctx = createContext<AuthModalCtx | null>(null);

/**
 * Single app-wide auth modal. Mounted once in the root layout so every trigger
 * (navbar, hero, protected routes, /login) shares one instance and one set of
 * handlers. Auth logic is the existing better-auth client — unchanged routes.
 */
export function AuthModalProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("login");
  const triggerRef = useRef<HTMLElement | null>(null);
  const afterCloseRef = useRef<(() => void) | null>(null);

  const openModal = useCallback((m: Mode = "login", trigger?: HTMLElement | null) => {
    setMode(m);
    triggerRef.current = trigger ?? (typeof document !== "undefined" ? (document.activeElement as HTMLElement) : null);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  const onNextClose = useCallback((fn: () => void) => {
    afterCloseRef.current = fn;
  }, []);

  const handleClosed = useCallback(() => {
    const fn = afterCloseRef.current;
    afterCloseRef.current = null;
    fn?.();
  }, []);

  async function onGoogle() {
    await authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" });
  }

  async function onEmailLogin(email: string, password: string) {
    const { error } = await authClient.signIn.email(
      { email, password },
      { onSuccess: () => { setOpen(false); router.push("/dashboard"); } },
    );
    if (error) throw new Error(error.message ?? "Log in failed");
  }

  async function onRegister(input: { name: string; email: string; password: string }) {
    const { error } = await authClient.signUp.email(
      { name: input.name, email: input.email, password: input.password },
      {
        onSuccess: async () => {
          try {
            await completeSignupAction({ kind: "creator" });
          } catch (err) {
            // Server-action redirect() throws a NEXT_REDIRECT signal — let it through.
            if (err instanceof Error && "digest" in err && String((err as { digest?: string }).digest).includes("NEXT_REDIRECT")) throw err;
            throw err instanceof Error ? err : new Error("Setup failed");
          }
        },
      },
    );
    if (error) throw new Error(error.message ?? "Sign up failed");
  }

  function onForgot() {
    setOpen(false);
    router.push("/forgot-password");
  }

  return (
    <Ctx.Provider value={{ open: openModal, close, onNextClose }}>
      {children}
      <LoginModal
        open={open}
        initialMode={mode}
        onClose={close}
        onClosed={handleClosed}
        triggerRef={triggerRef}
        onGoogle={onGoogle}
        onEmailLogin={onEmailLogin}
        onRegister={onRegister}
        onForgot={onForgot}
      />
    </Ctx.Provider>
  );
}

/** Access the shared auth modal. Safe no-op if the provider is absent (e.g. preview). */
export function useAuthModal(): AuthModalCtx {
  const ctx = useContext(Ctx);
  return (
    ctx ?? {
      open: () => {},
      close: () => {},
      onNextClose: () => {},
    }
  );
}
