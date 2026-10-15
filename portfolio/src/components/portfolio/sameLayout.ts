// Deep equality for plain measured layout data (numbers, strings, nested
// objects and arrays). Measure callbacks use it to keep the previous state
// object when a re-measure found nothing new, so React skips the render.
export function sameLayout(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== "object" || typeof b !== "object" || !a || !b) return false;

  const left = a as Record<string, unknown>;
  const right = b as Record<string, unknown>;
  const keys = Object.keys(left);
  if (keys.length !== Object.keys(right).length) return false;
  return keys.every((key) => sameLayout(left[key], right[key]));
}

// setState updater that only swaps in `next` when it differs from `prev`.
export function keepIfSame<T>(next: T): (prev: T) => T {
  return (prev) => (sameLayout(prev, next) ? prev : next);
}
