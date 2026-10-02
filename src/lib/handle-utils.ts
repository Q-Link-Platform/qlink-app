/**
 * Production-Grade Handle Normalization Utilities
 * Ensures consistent, deterministic comparison and formatting of handles across Q-Link V3.
 */

/**
 * Normalizes a user handle into a canonical format:
 * - Trims leading/trailing whitespace
 * - Removes leading '@' characters
 * - Converts to lowercase for case-insensitive operations
 * 
 * Example: "  @CholaChap8-3378 " -> "cholachap8-3378"
 */
export function cleanHandle(handle: string | null | undefined): string {
  if (!handle) return "";
  let cleaned = handle.trim();
  while (cleaned.startsWith("@")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned.toLowerCase();
}

/**
 * Null-safe, case-insensitive, @-insensitive comparison of two handles.
 * Example: areHandlesEqual("@cholachap8-3378", "CholaChap8-3378") -> true
 */
export function areHandlesEqual(
  h1: string | null | undefined,
  h2: string | null | undefined
): boolean {
  const clean1 = cleanHandle(h1);
  const clean2 = cleanHandle(h2);
  if (!clean1 || !clean2) return false;
  return clean1 === clean2;
}

/**
 * Formats a handle consistently for UI display.
 * Example: formatDisplayHandle("cholachap8-3378") -> "@cholachap8-3378"
 */
export function formatDisplayHandle(handle: string | null | undefined): string {
  const cleaned = cleanHandle(handle);
  if (!cleaned) return "";
  return `@${cleaned}`;
}
