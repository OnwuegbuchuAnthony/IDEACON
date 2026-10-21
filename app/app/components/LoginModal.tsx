"use client";
import { useEffect, useRef, useState, type RefObject } from "react";
import "./login-modal.css";

type Mode = "login" | "register";
type Props = {
  open: boolean;
  onClose: () => void;
  /** Fires after the dialog has fully closed by any path (Esc, backdrop, X, success). */
  onClosed?: () => void;
  onGoogle: () => Promise<void>;
  onEmailLogin: (email: string, password: string) => Promise<void>;
  onRegister: (input: { name: string; email: string; password: string }) => Promise<void>;
  onForgot: () => void;
  /** Starting tab. Defaults to "login". */
  initialMode?: Mode;
  /** Element to refocus when the modal closes (the trigger). */
  triggerRef?: RefObject<HTMLElement | null>;
};

export function LoginModal({
  open,
  onClose,
  onClosed,
  onGoogle,
  onEmailLogin,
  onRegister,
  onForgot,
  initialMode = "login",
  triggerRef,
}: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [mode, setMode] = useState<Mode>(initialMode);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [wasOpen, setWasOpen] = useState(open);

  // Reset the tab and clear errors each time the modal transitions to open.
  // Adjusting state during render (instead of in an effect) avoids the
  // cascading-render warning from react-hooks/set-state-in-effect.
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMode(initialMode);
      setError("");
    }
  }

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) { d.showModal(); document.body.style.overflow = "hidden"; }
    if (!open && d.open) { d.close(); }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true); setError("");
    try { await fn(); } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong. Try again."); }
    finally { setBusy(false); }
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get("name") || "").trim();
    const email = String(f.get("email") || "").trim();
    const password = String(f.get("password") || "");
    if (mode === "register" && !name) { setError("Enter your full name."); return; }
    if (!email || !password) { setError("Enter your email and password."); return; }
    run(() => (mode === "login" ? onEmailLogin(email, password) : onRegister({ name, email, password })));
  };

  const restoreFocus = () => {
    const el = triggerRef?.current;
    if (el && typeof el.focus === "function") el.focus();
  };

  return (
    <dialog
      ref={ref}
      className="ic-login"
      aria-labelledby="ic-login-title"
      onClose={() => { document.body.style.overflow = ""; onClose(); onClosed?.(); restoreFocus(); }}
      onClick={(e) => { if (e.target === ref.current) onClose(); }}
    >
      <button className="ic-close" type="button" aria-label="Close" onClick={onClose}>
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 3l12 12M15 3L3 15" /></svg>
      </button>

      <h2 id="ic-login-title" className="ic-title">{mode === "login" ? "Login" : "Register"}</h2>
      <p className="ic-sub">Continue with Google or use your email address.</p>

      <button className="ic-google" type="button" disabled={busy} onClick={() => run(onGoogle)}>
        <svg viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
        </svg>
        Continue with Google
      </button>

      <p className="ic-terms">
        By continuing, you accept the <a href="/terms">Terms and Conditions</a> and confirm that you have read the{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <div className="ic-divider">or use email</div>

      <form className="ic-form" onSubmit={submit} noValidate>
        {mode === "register" && (
          <input name="name" placeholder="Full name" aria-label="Full name" autoComplete="name" enterKeyHint="next" />
        )}
        <input name="email" type="email" placeholder="Email" aria-label="Email" autoComplete="email" inputMode="email" enterKeyHint="next" />
        <input name="password" type="password" placeholder="Password" aria-label="Password" autoComplete={mode === "login" ? "current-password" : "new-password"} enterKeyHint="go" />
        {error && <p className="ic-error" role="alert">{error}</p>}
        <button className="ic-submit" type="submit" disabled={busy}>
          {busy ? "Please wait…" : mode === "login" ? "Login" : "Create account"}
        </button>
      </form>

      <div className="ic-links">
        <button type="button" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
          {mode === "login" ? "Don't have an account? Register" : "Have an account? Login"}
        </button>
        <button type="button" onClick={onForgot}>Forgot password</button>
      </div>
    </dialog>
  );
}
