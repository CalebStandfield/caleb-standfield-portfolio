import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

const SPIN_SPEED = 38; // px/sec, gentle continuous drift
const FOCUS_EASE_MS = 650; // time to glide a pill to the middle
const FOCUS_TOTAL_MS = 4000; // glide + hold, start of click to release
const HOLD_MS = FOCUS_TOTAL_MS - FOCUS_EASE_MS; // how long it stays centered

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Squircle tag pills on an endless carousel. The strip is a seamless loop of
// repeated tag sets that drifts left forever. Clicking or hovering a pill eases
// that pill to the middle, holds it highlighted for a beat, then releases and
// resumes the drift. No start, no end, no arrows.
export function TagCarousel({ tags }: { tags: string[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0); // current translateX, always <= 0 after wrap
  const singleRef = useRef(0); // width of one tag set (incl. trailing gap)
  const focusRef = useRef<{ from: number; to: number; start: number } | null>(
    null,
  );
  const holdUntilRef = useRef(0);
  const [sets, setSets] = useState(3);
  const [focused, setFocused] = useState<number | null>(null); // rendered index

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      const secondSet = track.children[tags.length] as HTMLElement | undefined;
      const single = secondSet
        ? secondSet.offsetLeft
        : track.scrollWidth / sets;
      singleRef.current = single;
      if (single > 0) {
        // Grow-only so this converges; enough copies to cover the viewport
        // plus one set of headroom while wrapping.
        const needed = Math.min(
          12,
          Math.max(2, Math.ceil((viewport.clientWidth + single) / single) + 1),
        );
        if (needed > sets) setSets(needed);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    void document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [tags.length, sets]);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const single = singleRef.current;
      if (single > 0) {
        const dt = last ? (now - last) / 1000 : 0;
        last = now;

        if (focusRef.current) {
          // easing a pill to center: use absolute pos, never wrap (wrapping
          // would slide the highlighted pill off-center onto another copy)
          const f = focusRef.current;
          const t = Math.min(1, (now - f.start) / FOCUS_EASE_MS);
          posRef.current = f.from + (f.to - f.from) * easeInOut(t);
          if (t >= 1) {
            focusRef.current = null;
            holdUntilRef.current = now + HOLD_MS;
          }
        } else if (holdUntilRef.current && now < holdUntilRef.current) {
          // holding the focused pill in place, still no wrap
        } else {
          if (holdUntilRef.current) {
            holdUntilRef.current = 0;
            setFocused(null);
          }
          posRef.current -= SPIN_SPEED * dt;
          // only wrap during the free spin, where every copy is identical
          while (posRef.current <= -single) posRef.current += single;
          while (posRef.current > 0) posRef.current -= single;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`;
        }
      } else {
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const select = useCallback(
    (element: HTMLElement, renderedIndex: number) => {
      const viewport = viewportRef.current;
      if (!viewport || !singleRef.current) return;

      // clicking the selected pill again unselects it and resumes the spin,
      // exactly like the hold timing out on its own.
      if (focused === renderedIndex) {
        focusRef.current = null;
        holdUntilRef.current = 0;
        setFocused(null);
        return;
      }

      // otherwise select (or switch to) this pill: glide it to the middle.
      // on-screen center = offsetLeft + pos, so the pos that centers it is
      // (viewportCenter - pillCenter). A clicked pill is always visible, so the
      // travel stays short.
      const pillCenter = element.offsetLeft + element.offsetWidth / 2;
      focusRef.current = {
        from: posRef.current,
        to: viewport.clientWidth / 2 - pillCenter,
        start: performance.now(),
      };
      holdUntilRef.current = 0;
      setFocused(renderedIndex);
    },
    [focused],
  );

  const rendered = Array.from({ length: sets }, (_, copy) =>
    tags.map((tag, tagIndex) => ({
      tag,
      renderedIndex: copy * tags.length + tagIndex,
    })),
  ).flat();

  return (
    <div className="min-w-0 border-b border-muted-line/20 px-4 py-3.5 sm:px-5">
      <div
        ref={viewportRef}
        className="relative min-w-0 overflow-hidden mask-[linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
      >
        <div ref={trackRef} className="flex w-max gap-2">
          {rendered.map(({ tag, renderedIndex }) => {
            const isFocused = renderedIndex === focused;
            return (
              <button
                key={renderedIndex}
                type="button"
                aria-hidden={renderedIndex >= tags.length}
                onClick={(event) => select(event.currentTarget, renderedIndex)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-[0.7rem] border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                  isFocused
                    ? "border-orange/70 bg-orange/15 text-orange"
                    : "border-muted-line/25 bg-surface/40 text-muted-line hover:text-ink-text",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
