/**
 * Asserts that a value is not null and not undefined.
 * @param value the value to be checked.
 * @throws Error if value is null or undefined.
 */
export function requireNotNull<T>(
  value: T | null | undefined,
  msg?: string,
): T {
  if (value === undefined) {
    throw new Error(msg ?? "Value cannot be undefined");
  }
  if (value == null) {
    throw new Error(msg ?? "Value cannot be null");
  }
  return value;
}
