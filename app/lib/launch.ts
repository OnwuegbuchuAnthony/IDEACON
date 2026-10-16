/**
 * Launch mode gate. NEXT_PUBLIC_LAUNCH_MODE=waitlist funnels visitors to
 * the waitlist; anything else (or unset) is full live mode.
 * Public by design — safe to expose.
 */
export function isWaitlistMode(): boolean {
  return process.env.NEXT_PUBLIC_LAUNCH_MODE === "waitlist";
}
