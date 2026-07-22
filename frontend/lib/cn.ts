type ClassValue = string | false | null | undefined;

/** Lightweight className merger (no external deps). */
export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
