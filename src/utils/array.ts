/** Replace the first element matching `predicate` with `next` (immutable). */
export function replaceWhere<T>(
  items: readonly T[],
  predicate: (item: T) => boolean,
  next: (item: T) => T,
): T[] {
  return items.map((item) => (predicate(item) ? next(item) : item));
}

/** Type guard that removes `null`/`undefined` while narrowing the type. */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
