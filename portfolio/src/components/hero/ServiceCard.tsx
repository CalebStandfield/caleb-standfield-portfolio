import { useEffect, useMemo, useRef, useState } from "react";
import { animate as animateValue, motion, useMotionValue } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { highlightLines } from "./codeHighlight";
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

const CARD_BG = "#0E1116";
const BORDER = "rgba(120, 96, 74, 0.35)";
const BORDER_CORE = "rgba(255, 143, 64, 0.55)";
const DIVIDER = "rgba(120, 96, 74, 0.22)";

// Typing speed for the reveal, in characters per second.
const CPS = 60;
// Wait for the box to finish opening before typing, so no lines are hidden
// behind the growing card edge.
const OPEN_DELAY = 0.28;

// One service in the architecture diagram: header, tags, and a code snippet.
export function ServiceCard({
  card,
  index,
  animate,
  registerRef,
  onOpen,
  flow = false,
}: ServiceCardProps) {
  const isCore = card.kind === "core";
  const Icon = card.icon;
  // `open` tracks intent (drives the caret rotation / aria); `expanded` drives
  // the box height. On open the box grows first, then text types in; on close
  // the text deletes, then the box collapses.
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);

  const lines = useMemo(
    () => highlightLines(card.code, card.lang),
    [card.code, card.lang],
  );
  // Reveal geometry, in "typing seconds". Each line costs length/CPS seconds;
  // startIn[i] is the cumulative offset where line i begins. `total` is the full
  // cost. This is the single axis the whole reveal is derived from.
  const { durs, startIn, total } = useMemo(() => {
    const d = card.code.split("\n").map((l) => Math.max(0.05, l.length / CPS));
    const s: number[] = [];
    let acc = 0;
    for (let i = 0; i < d.length; i++) {
      s[i] = acc;
      acc += d[i];
    }
    return { durs: d, startIn: s, total: acc };
  }, [card.code]);

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
          if (blink) blink.style.animationPlayState = active ? "running" : "paused";
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
    <motion.div
      ref={registerRef}
      className={cn(
        flow ? "w-full" : "absolute w-[19rem] -translate-x-1/2 lg:w-[21rem]",
      )}
      style={flow ? undefined : { left: `${card.x}%`, top: `${card.y}%` }}
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: animate ? 0.15 + index * 0.06 : 0,
        ease: "easeOut",
      }}
    >
      <div
        className="overflow-hidden rounded-xl border"
        style={{
          background: CARD_BG,
          borderColor: isCore ? BORDER_CORE : BORDER,
          boxShadow: isCore
            ? "0 0 0 1px rgba(255,143,64,0.12), 0 28px 70px -30px #000, inset 0 0 60px -40px #FF8F40"
            : "0 20px 50px -30px #000",
        }}
      >
        {/* always-visible region: header + tags, with a consistent bottom pad */}
        <div className="pb-4">
          {/* header */}
          <div className="flex items-start justify-between gap-3 px-4 pt-3.5">
            <div className="flex items-center gap-2.5">
              {Icon && (
                <span
                  className="flex size-7 items-center justify-center rounded-md"
                  style={{
                    background: "rgba(255,143,64,0.10)",
                    color: "#FF8F40",
                  }}
                >
                  <Icon size={16} weight="bold" />
                </span>
              )}
              <div className="leading-tight">
                <div
                  className={cn(
                    "font-semibold text-ink-text",
                    isCore
                      ? "font-mono text-sm"
                      : "font-heading text-[0.95rem]",
                  )}
                >
                  {card.title}
                </div>
                {card.subtitle && (
                  <div className="font-sans text-xs text-muted-line">
                    {card.subtitle}
                  </div>
                )}
              </div>
            </div>

            {/* core badge + code toggle */}
            <div className="flex shrink-0 items-center gap-2">
              {card.badge && (
                <span
                  className="rounded border px-1.5 py-0.5 font-mono text-[0.6rem] tracking-widest text-orange"
                  style={{ borderColor: BORDER_CORE }}
                >
                  {card.badge}
                </span>
              )}
              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-label={open ? "Hide code" : "Show code"}
                className="flex size-5 items-center justify-center rounded text-muted-line transition-colors hover:text-orange"
              >
                <motion.span
                  animate={{ rotate: open ? 0 : -90 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="flex"
                >
                  <CaretDown size={14} weight="bold" />
                </motion.span>
              </button>
            </div>
          </div>

          {/* tags */}
          {card.tags && card.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 pt-3">
              {card.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded border px-1.5 py-0.5 font-mono text-[0.6rem] tracking-wider text-muted-line"
                  style={{ borderColor: DIVIDER }}
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* code: grid 0fr->1fr collapse; lines wipe in like fast typing */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            {/* divider */}
            <div className="h-px w-full" style={{ background: DIVIDER }} />

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
          </div>
        </div>
      </div>
    </motion.div>
  );
}
