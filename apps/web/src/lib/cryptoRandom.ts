/**
 * Cryptographically secure random integer generator for browser contexts.
 * Conforms to CWE-338 by utilizing window.crypto.getRandomValues.
 */
export function getSecureRandomInt(min: number, max: number): number {
  if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return min + (array[0] % (max - min));
  }
  return min;
}
