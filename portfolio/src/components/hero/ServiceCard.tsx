import { useEffect, useMemo, useRef, useState } from "react";
import { animate as animateValue, useMotionValue } from "motion/react";

import { highlightLines } from "./codeHighlight";
import { CardShell } from "./CardShell";
import type { CardData } from "./system.config";

interface ServiceCardProps {
  card: CardData;
  index: number;
  animate: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  /** Called when the card transitions to open, so the diagram can pulse light
   *  out to this card's connected neighbors. */
  onOpen?: () => void;
  /** flow = static full-width (mobile); default = absolute positioned. */
  flow?: boolean;
}

// Typing speed for the reveal, in characters per second.
const CPS = 60;
// Wait for the box to finish opening before typing, so no lines are hidden
// behind the growing card edge.
const OPEN_DELAY = 0.28;

// A design-only service card: header, tags, and a code snippet that types in.
export function ServiceCard({
  card,
  index,
  animate,
  registerRef,
  onOpen,
  flow = false,
}: ServiceCardProps) {
  const code = card.code ?? "";
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const lines = useMemo(
    () => highlightLines(code, card.lang ?? "rust"),
    [code, card.lang],
  );
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
  // (0 = empty, `total` = fully typed). Every toggle animates it from its
  // CURRENT value, so a fast close-then-open resumes from where it was instead
  // of snapping back to the start.
  const progress = useMotionValue(total);
  const lineEls = useRef<(HTMLSpanElement | null)[]>([]);
  const caretEls = useRef<(HTMLSpanElement | null)[]>([]);

  // Derive every line's clip and the single caret straight from `progress`.
  useEffect(() => {
    const paint = (c: number) => {
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
          const active = f > 1e-3 && f < 1 - 1e-3;
          caret.style.opacity = active ? "1" : "0";
          // Pause the blink on hidden carets so we don't run one infinite
          // animation per line; only the active caret ticks.
          const blink = caret.firstElementChild as HTMLElement | null;
          if (blink)
            blink.style.animationPlayState = active ? "running" : "paused";
        }
      }
    };
    paint(progress.get());
    return progress.on("change", paint);
  }, [progress, durs, startIn]);

  const anim = useRef<ReturnType<typeof animateValue> | null>(null);
  const toggle = () => {
    anim.current?.stop();
    const next = !open;
    setOpen(next);
    const from = progress.get();
    const target = next ? total : 0;
    // Constant typing speed: duration scales with the distance left to cover.
    const duration = Math.abs(target - from);
    // Only wait for the box to grow when starting from fully closed; a resume
    // (box already open) types immediately.
    const delay = next && from === 0 ? OPEN_DELAY : 0;
    if (next) setExpanded(true);
    anim.current = animateValue(progress, target, {
      duration,
      delay,
      ease: "linear",
      onComplete: () => {
        if (next) onOpen?.();
        else setExpanded(false);
      },
    });
  };
  useEffect(() => () => anim.current?.stop(), []);

  return (
    <CardShell
      card={card}
      index={index}
      animate={animate}
      registerRef={registerRef}
      flow={flow}
      open={open}
      expanded={expanded}
      onToggle={toggle}
    >
      <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.72rem] leading-relaxed">
        <code>
          {lines.map((spans, li) => (
            <span key={li} className="relative block w-fit">
              {/* line text, clipped from the right by `progress` */}
              <span
                ref={(el) => {
                  lineEls.current[li] = el;
                }}
                className="block"
              >
                {spans.length ? spans : " "}
              </span>

              {/* the single blinking caret; the paint loop parks it on the
                  line being typed and hides it everywhere else */}
              <span
                ref={(el) => {
                  caretEls.current[li] = el;
                }}
                aria-hidden
                className="pointer-events-none absolute top-[0.18em] left-0"
                style={{ opacity: 0 }}
              >
                <span className="caret-blink block h-[1.05em] w-[2px] bg-orange" />
              </span>
            </span>
          ))}
        </code>
      </pre>
    </CardShell>
  );
}
