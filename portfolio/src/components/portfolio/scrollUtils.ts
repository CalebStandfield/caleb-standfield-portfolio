// Manual smooth scroll. We animate with requestAnimationFrame and instant
// per-frame jumps instead of relying on CSS `scroll-behavior: smooth`, because
// the browser silently no-ops that under the OS reduced-motion setting. This
// path ignores the OS preference on purpose.

const DURATION_MS = 620;

// easeInOutCubic
function ease(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothScrollToY(targetY: number, duration = DURATION_MS): void {
  const startY = window.scrollY;
  const distance = targetY - startY;
  if (Math.abs(distance) < 1) return;

  let startTime: number | null = null;
  function step(now: number) {
    if (startTime === null) startTime = now;
    const t = Math.min((now - startTime) / duration, 1);
    window.scrollTo({
      top: startY + distance * ease(t),
      behavior: "instant" as ScrollBehavior,
    });
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

export function smoothScrollToElement(id: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  // Match scrollIntoView 'start', honoring the element's scroll-margin-top
  // (used to clear the fixed navbar) so the heading is not tucked under it.
  const marginTop = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
  smoothScrollToY(window.scrollY + el.getBoundingClientRect().top - marginTop);
}
