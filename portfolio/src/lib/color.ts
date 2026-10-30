// Theme colors are CSS variables, so alpha has to be mixed in by the browser
// rather than appended as hex. Works for any CSS color, var() included.
export function withAlpha(color: string, percent: number): string {
  return `color-mix(in srgb, ${color} ${percent}%, transparent)`;
}

export const themeColor = (name: string) => `var(--color-${name})`;
