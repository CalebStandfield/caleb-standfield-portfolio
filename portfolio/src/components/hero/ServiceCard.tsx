import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { CaretDown } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import { highlightLines } from "./codeHighlight";
import type { CardData } from "./system.config";

interface ServiceCardProps {
  card: CardData;
  index: number;
  animate: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
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
  flow = false,
}: ServiceCardProps) {
  const isCore = card.kind === "core";
  const Icon = card.icon;
  // `open` drives the typing; `expanded` drives the box height. On open the box
  // opens first, then text types in. On close the text deletes, then the box
  // collapses (so the delete stays visible instead of getting clipped shut).
  const [open, setOpen] = useState(true);
  const [expanded, setExpanded] = useState(true);
  // Carets only exist after the first toggle, so the page loads instant (no
  // caret writing over already-shown code).
  const [touched, setTouched] = useState(false);

  const rawLines = card.code.split("\n");
  const lines = highlightLines(card.code, card.lang);
  // Per-line duration proportional to length so typing speed stays even, plus
  // cumulative start offsets: type top-down, delete bottom-up.
  const durs = rawLines.map((l) => Math.max(0.05, l.length / CPS));
  const startIn: number[] = [];
  const startOut: number[] = [];
  let accIn = 0;
  for (let i = 0; i < durs.length; i++) {
    startIn[i] = accIn;
    accIn += durs[i];
  }
  let accOut = 0;
  for (let i = durs.length - 1; i >= 0; i--) {
    startOut[i] = accOut;
    accOut += durs[i];
  }
  const total = accIn;
  const totalMs = total * 1000;
  // Full timeline length for the single-caret animation. Opening waits OPEN_DELAY
  // for the box to grow; closing starts immediately.
  const lenOpen = OPEN_DELAY + total;
  const lenClose = total;

  // Toggle handler owns both states so we never setState inside an effect. On
  // open the box grows first; on close the text deletes, then after totalMs the
  // box collapses (so the delete stays visible instead of getting clipped shut).
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const toggle = () => {
    clearTimeout(timer.current);
    setTouched(true);
    const next = !open;
    setOpen(next);
    if (next) setExpanded(true);
    else timer.current = setTimeout(() => setExpanded(false), totalMs);
  };
  useEffect(() => () => clearTimeout(timer.current), []);

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

            {/* status dot / core badge + code toggle */}
            <div className="flex shrink-0 items-center gap-2">
              {card.badge ? (
                <span
                  className="rounded border px-1.5 py-0.5 font-mono text-[0.6rem] tracking-widest text-orange"
                  style={{ borderColor: BORDER_CORE }}
                >
                  {card.badge}
                </span>
              ) : (
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={
                    card.kind === "external"
                      ? { border: "1.5px solid #565B66" }
                      : { background: "#FF8F40", boxShadow: "0 0 6px #FF8F40" }
                  }
                />
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
                {lines.map((spans, li) => {
                  const delay = open ? OPEN_DELAY + startIn[li] : startOut[li];
                  // This line's active window as a fraction of the whole reveal
                  // timeline. The caret animates across the entire timeline but is
                  // only lit (opacity 1) during [s, e], so a single cursor appears
                  // to travel line to line.
                  const timeline = open ? lenOpen : lenClose;
                  // Clamp the window into (0,1) and build a trapezoid with tiny
                  // epsilon ramps. Motion silently drops a keyframe track that has
                  // duplicate adjacent `times`, so the edges must be distinct.
                  const s = Math.max(delay / timeline, 0.0006);
                  const e = Math.min(
                    Math.max((delay + durs[li]) / timeline, s + 0.01),
                    0.999,
                  );
                  const eps = 0.005;
                  let up = s + eps;
                  let dn = e - eps;
                  if (up >= dn) {
                    const m = (s + e) / 2;
                    up = m - 0.001;
                    dn = m + 0.001;
                  }
                  return (
                    <span key={li} className="relative block w-fit">
                      {/* the line text, wiped in/out from the caret edge */}
                      <motion.span
                        className="block"
                        initial={false}
                        animate={{
                          clipPath: open
                            ? "inset(0 0 0 0)"
                            : "inset(0 101% 0 0)",
                        }}
                        transition={{
                          duration: durs[li],
                          ease: "linear",
                          delay,
                        }}
                      >
                        {spans.length ? spans : " "}
                      </motion.span>

                      {/* one caret rides the reveal edge; lit only during this
                          line's window so it reads as a single blinking cursor.
                          Keyed on `open` so it remounts and re-runs each toggle
                          (Motion would otherwise skip the identical opacity keys).
                          Runs even under reduced-motion (user-initiated). */}
                      {touched && (
                        <motion.span
                          key={open ? "o" : "c"}
                          aria-hidden
                          className="pointer-events-none absolute top-[0.18em]"
                          initial={{
                            opacity: 0,
                            left: open ? "0%" : "100%",
                          }}
                          animate={{
                            left: open
                              ? ["0%", "0%", "100%", "100%"]
                              : ["100%", "100%", "0%", "0%"],
                            opacity: [0, 0, 1, 1, 0, 0],
                          }}
                          transition={{
                            left: {
                              duration: timeline,
                              ease: "linear",
                              times: [0, s, e, 1],
                            },
                            opacity: {
                              duration: timeline,
                              ease: "linear",
                              times: [0, s, up, dn, e, 1],
                            },
                          }}
                        >
                          <span className="caret-blink block h-[1.05em] w-[2px] bg-orange" />
                        </motion.span>
                      )}
                    </span>
                  );
                })}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
