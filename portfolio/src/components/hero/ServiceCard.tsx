import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { highlightCode } from "./codeHighlight";
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

  return (
    <motion.div
      ref={registerRef}
      className={cn(
        flow
          ? "w-full"
          : "absolute w-[19rem] -translate-x-1/2 lg:w-[21rem]",
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
                  isCore ? "font-mono text-sm" : "font-heading text-[0.95rem]",
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

          {/* status dot / core badge */}
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
              className="mt-1.5 size-2 shrink-0 rounded-full"
              style={
                card.kind === "external"
                  ? { border: "1.5px solid #565B66" }
                  : { background: "#FF8F40", boxShadow: "0 0 6px #FF8F40" }
              }
            />
          )}
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

        {/* divider */}
        <div
          className="mt-3 h-px w-full"
          style={{ background: DIVIDER }}
        />

        {/* code */}
        <pre className="overflow-x-auto px-4 py-3.5 font-mono text-[0.72rem] leading-relaxed">
          <code>{highlightCode(card.code, card.lang)}</code>
        </pre>
      </div>
    </motion.div>
  );
}
