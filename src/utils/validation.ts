/**
 * Basic client-side email format check (used by CoffeeLoader before
 * accepting a notify-me address). Note `molecules/EmailInput` has its own
 * identical-but-separate copy of this regex rather than importing this —
 * keep both in sync if the rule changes.
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
