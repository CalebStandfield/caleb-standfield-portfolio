import type { ReactNode } from "react";
import { motion } from "motion/react";
import { CaretDown, UserSquare } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import type { CardData } from "./system.config";

export const CARD_BG = "#0E1116";
const BORDER = "rgba(120, 96, 74, 0.35)";
const BORDER_CORE = "rgba(255, 143, 64, 0.55)";
const BORDER_PROJECT = "rgba(255, 143, 64, 0.6)";
const DIVIDER = "rgba(120, 96, 74, 0.22)";

// Border color per node kind. Core = orange, project = green, rest = warm brown.
function borderFor(card: CardData): string {
  if (card.kind === "core") return BORDER_CORE;
  if (card.kind === "project") return BORDER_PROJECT;
  return BORDER;
}

interface CardShellProps {
  card: CardData;
  index: number;
  animate: boolean;
  registerRef: (el: HTMLDivElement | null) => void;
  /** flow = static full-width (mobile); default = absolute positioned. */
  flow?: boolean;
  /** open drives the caret rotation + aria; expanded drives the body height. */
  open: boolean;
  expanded: boolean;
  onToggle: () => void;
  /** Body rendered inside the collapsible region (code <pre> or a carousel). */
  children: ReactNode;
}

// Shared visual frame for every diagram card: entrance motion, border/shadow,
// header (icon, title, subtitle, badge, code toggle) and the collapsible body.
export function CardShell({
  card,
  index,
  animate,
  registerRef,
  flow = false,
  open,
  expanded,
  onToggle,
  children,
}: CardShellProps) {
  const isCore = card.kind === "core";
  const isProject = card.kind === "project";
  const mono = isCore || isProject;
  const Icon = card.icon;

  // Core is the dominant card (holds the photo); projects are large feature
  // blocks; service cards are compact.
  const widthClass = isCore
    ? "w-[30rem] lg:w-[38rem]"
    : isProject
      ? "w-[28rem] lg:w-[36rem]"
      : "w-[19rem] lg:w-[21rem]";

  return (
    <motion.div
      ref={registerRef}
      className={cn(
        flow ? "w-full" : cn("absolute -translate-x-1/2", widthClass),
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
          borderColor: borderFor(card),
          boxShadow:
            isCore || isProject
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
                    mono ? "font-mono text-sm" : "font-heading text-[0.95rem]",
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

            {/* core badge + body toggle */}
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
                onClick={onToggle}
                aria-expanded={open}
                aria-label={open ? "Collapse card" : "Expand card"}
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

          {/* photo slot: framed placeholder sized so a real photo drops in
              large later. Always visible, independent of the code body. */}
          {card.photo && (
            <div className="px-4 pt-4">
              <div
                className="flex aspect-[4/3] w-full flex-col items-center justify-center gap-2 rounded-lg border"
                style={{
                  borderColor: BORDER_CORE,
                  background:
                    "radial-gradient(120% 100% at 50% 0%, rgba(255,143,64,0.06), transparent 70%)",
                }}
              >
                <UserSquare size={40} weight="thin" className="text-orange" />
                <span className="font-mono text-[0.65rem] tracking-widest text-muted-line">
                  photo
                </span>
              </div>
            </div>
          )}
        </div>

        {/* body: grid 0fr->1fr collapse */}
        <div
          className="grid transition-[grid-template-rows] duration-300 ease-out"
          style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
        >
          <div className="min-h-0 overflow-hidden">
            <div className="h-px w-full" style={{ background: DIVIDER }} />
            {children}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
