import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

// Typing speed for the reveal, in characters per second.
const CPS = 60;
// Wait for the box to finish opening before typing, so no lines are hidden
// behind the growing card edge.
const OPEN_DELAY_MS = 280;

export interface TypedCodeState {
  // `open` tracks intent (drives the caret rotation / aria).
  open: boolean;
  // `expanded` drives the box height. On open the box grows first, then text
  // types in; on close the text deletes, then the box collapses.
  expanded: boolean;
  // Per-line refs the component wires up; the paint loop clips each line and
  // parks the single caret at the reveal edge.
  lineEls: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  caretEls: React.MutableRefObject<(HTMLSpanElement | null)[]>;
  toggle: () => void;
}

// Drives a card's code reveal: constant-speed typing on open, deletion on
// close, and a single caret that follows the reveal edge across lines. Every
// toggle resumes from the current progress, so a fast close-then-open picks up
// where it left off instead of snapping back. `onOpenComplete` fires when the
// open sequence finishes typing (used to pulse light out to neighbors).
//
// The reveal runs on a raw rAF loop rather than motion's animate() on purpose:
// animate() honors the OS prefers-reduced-motion flag and instant-completes,
// which would kill the whole effect. This reveal is small, local, and
// non-looping, so it always plays.
export function useTypedCode(
  code: string,
  initiallyOpen: boolean,
  onOpenComplete?: () => void,
): TypedCodeState {
  const [open, setOpen] = useState(initiallyOpen);
  const [expanded, setExpanded] = useState(initiallyOpen);

  // Reveal geometry, in "typing seconds". Each line costs length/CPS seconds;
  // startIn[i] is the cumulative offset where line i begins. `total` is the full
  // cost. This is the single axis the whole reveal is derived from.
  const { durs, startIn, total } = useMemo(() => {
    const d = code.split("\n").map((l) => Math.max(0.05, l.length / CPS));
    const s: number[] = [];
    let acc = 0;
    for (let i = 0; i < d.length; i++) {
      s[i] = acc;
      acc += d[i];
    }
    return { durs: d, startIn: s, total: acc };
  }, [code]);

  // `progress` is how much of the code is typed, in the same seconds unit
  // (0 = empty, `total` = fully typed). A ref, not state, so the rAF loop can
  // write it every frame without re-rendering.
  const progress = useRef(initiallyOpen ? total : 0);
  const lineEls = useRef<(HTMLSpanElement | null)[]>([]);
  const caretEls = useRef<(HTMLSpanElement | null)[]>([]);

  // Derive every line's clip and the single caret straight from `progress`.
  const paint = useCallback(
    (c: number) => {
      for (let i = 0; i < durs.length; i++) {
        const f = (c - startIn[i]) / durs[i];
        const clamped = Math.min(1, Math.max(0, f));
        const line = lineEls.current[i];
        if (line) line.style.clipPath = `inset(0 ${(1 - clamped) * 101}% 0 0)`;
        const caret = caretEls.current[i];
        if (caret) {
          // The caret shows only on the line currently being typed/deleted, at
          // that line's reveal edge, so it reads as one moving cursor.
          caret.style.left = `${clamped * 100}%`;
          // Epsilon guards the line boundaries: at rest the frontier line lands
          // on f=1 (or 0) with float wobble, which would otherwise leave a caret
          // parked on every card's last line.
          caret.style.opacity = f > 1e-3 && f < 1 - 1e-3 ? "1" : "0";
        }
      }
    },
    [durs, startIn],
  );

  // Paint the resting state on mount and whenever geometry changes.
  useLayoutEffect(() => {
    paint(progress.current);
  }, [paint]);

  // Keep the latest callback without restarting anything.
  const onOpenRef = useRef(onOpenComplete);
  useEffect(() => {
    onOpenRef.current = onOpenComplete;
  }, [onOpenComplete]);

  const raf = useRef<number | undefined>(undefined);

  const animateTo = useCallback(
    (target: number, delayMs: number, onDone: () => void) => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current);
      const from = progress.current;
      // Constant typing speed: 1 progress unit == 1 second of typing, so the
      // duration scales with the distance left to cover.
      const durationMs = Math.abs(target - from) * 1000;
      const startAt = performance.now() + delayMs;

      const step = (now: number) => {
        if (now < startAt) {
          raf.current = requestAnimationFrame(step);
          return;
        }
        const t = durationMs === 0 ? 1 : Math.min(1, (now - startAt) / durationMs);
        progress.current = from + (target - from) * t;
        paint(progress.current);
        if (t < 1) {
          raf.current = requestAnimationFrame(step);
        } else {
          raf.current = undefined;
          onDone();
        }
      };

      raf.current = requestAnimationFrame(step);
    },
    [paint],
  );

  const toggle = () => {
    const next = !open;
    setOpen(next);
    // Only wait for the box to grow when starting from fully closed; a resume
    // (box already open) types immediately.
    const delayMs = next && progress.current === 0 ? OPEN_DELAY_MS : 0;
    if (next) setExpanded(true);
    animateTo(next ? total : 0, delayMs, () => {
      if (next) onOpenRef.current?.();
      else setExpanded(false);
    });
  };

  useEffect(
    () => () => {
      if (raf.current !== undefined) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return { open, expanded, lineEls, caretEls, toggle };
}
