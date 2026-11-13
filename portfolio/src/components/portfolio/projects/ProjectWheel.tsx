import type { CSSProperties, ReactNode } from "react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import { motion, useTransform, type MotionValue } from "motion/react";

import { cn } from "@/lib/utils";
import { useWheel, wrapOffset } from "./useWheel";

// Cards sit on a circle seen from the front. The front card faces you; each
// step around the circle turns a card STEP degrees and pushes it back, so a
// spin carries the next card around the rim toward you. Card width and the
// circle radius are CSS vars on the stage (see stage className), so they
// follow breakpoints without measuring.
const STEP = 40; // deg between neighboring cards on the circle
const RADIUS = 1; // circle radius, in front card widths
const SHADE = 0.55; // darkness on a neighbor, so the front card reads first
const VISIBLE = 1.6; // steps from the front before a card is fully gone
const PERSPECTIVE = 1400; // px
// one step of drag or scroll, as a share of stage width: roughly how far a
// neighbor's center sits from the middle at desktop card width (0.66)
const STEP_FRACTION = 0.66 * RADIUS * Math.sin((STEP * Math.PI) / 180);

const toRad = (deg: number) => (deg * Math.PI) / 180;

// Place a card `offset` steps around the circle. Front stays at z = 0.
function rimTransform(offset: number): string {
  const angle = offset * STEP;
  const sin = Math.sin(toRad(angle)).toFixed(4);
  const back = (Math.cos(toRad(angle)) - 1).toFixed(4);
  return `translateX(calc(var(--wheel-r) * ${sin})) translateZ(calc(var(--wheel-r) * ${back})) rotateY(${angle}deg)`;
}

// Whole-card opacity: neighbors stay solid (shade darkens them instead, so
// cards behind never show through), then fade out past one step.
function opacityAt(distance: number): number {
  if (distance <= 1) return 1;
  return Math.max(0, (VISIBLE - distance) / (VISIBLE - 1));
}

const pad = (n: number) => String(n).padStart(2, "0");

// Circular wheel: one item in front, neighbors visible on the rim at the
// sides, turned and pushed back. Spins with horizontal scroll, swipe, arrows, keys, or a
// click on a neighbor. Generic over the item; `renderItem` gets `active` so
// the front card can run media while the others idle.
export function ProjectWheel<T>({
  items,
  getKey,
  renderItem,
  label,
}: {
  items: T[];
  getKey: (item: T) => string;
  renderItem: (item: T, state: { active: boolean }) => ReactNode;
  label: string;
}) {
  const count = items.length;
  const { position, index, go, step, bind } = useWheel({
    count,
    stepFraction: STEP_FRACTION,
  });

  return (
    <div role="region" aria-roledescription="carousel" aria-label={label}>
      {count > 1 && (
        <div className="mb-4 flex items-center justify-center gap-5 font-mono text-sm">
          <button
            type="button"
            aria-label="Previous project"
            onClick={() => step(-1)}
            className="text-muted-line transition-colors hover:text-orange focus-visible:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <CaretLeft size={22} weight="bold" />
          </button>
          <p aria-live="polite" className="tabular-nums text-muted-line">
            <span className="text-ink-text">{pad(index + 1)}</span>
            <span className="mx-2 text-muted-line/60">/</span>
            {pad(count)}
          </p>
          <button
            type="button"
            aria-label="Next project"
            onClick={() => step(1)}
            className="text-muted-line transition-colors hover:text-orange focus-visible:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            <CaretRight size={22} weight="bold" />
          </button>
        </div>
      )}

      <motion.div
        {...bind}
        tabIndex={0}
        className="grid grid-cols-1 touch-pan-y overflow-x-clip py-2 @container [--card-w:0.86] [--wheel-r:calc(100cqw*var(--card-w)*var(--wheel-radius))] mask-[linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-orange sm:[--card-w:0.72] xl:[--card-w:0.66]"
        style={
          {
            perspective: PERSPECTIVE,
            "--wheel-radius": RADIUS,
          } as CSSProperties
        }
      >
        {items.map((item, i) => (
          <WheelSlot
            key={getKey(item)}
            index={i}
            count={count}
            position={position}
            active={i === index}
            onSelect={() => go(i)}
          >
            {renderItem(item, { active: i === index })}
          </WheelSlot>
        ))}
      </motion.div>
    </div>
  );
}

// One card on the wheel. Every slot shares the same grid cell, so the stage
// is as tall as the tallest card and spinning never changes page height.
// Only the front card is interactive; a neighbor is one big "spin to me".
function WheelSlot({
  index,
  count,
  position,
  active,
  onSelect,
  children,
}: {
  index: number;
  count: number;
  position: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
  children: ReactNode;
}) {
  const offset = useTransform(position, (p) => wrapOffset(index - p, count));
  const distance = useTransform(offset, Math.abs);
  const transform = useTransform(offset, rimTransform);
  const shade = useTransform(distance, (d) => Math.min(1, d) * SHADE);
  const opacity = useTransform(distance, opacityAt);
  const zIndex = useTransform(distance, (d) => Math.round(10 - d * 4));
  const visibility = useTransform(opacity, (o) =>
    o > 0.01 ? "visible" : "hidden",
  );

  return (
    <motion.div
      aria-roledescription="slide"
      aria-label={`${index + 1} of ${count}`}
      aria-hidden={!active}
      onClick={active ? undefined : onSelect}
      className={cn(
        "relative col-start-1 row-start-1 w-[calc(var(--card-w)*100%)] justify-self-center",
        !active && "cursor-pointer",
      )}
      style={{ transform, opacity, zIndex, visibility }}
    >
      <div inert={!active} className="h-full">
        {children}
      </div>
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl bg-ink"
        style={{ opacity: shade }}
      />
    </motion.div>
  );
}
