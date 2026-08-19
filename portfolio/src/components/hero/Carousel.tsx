import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CaretLeft, CaretRight } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";

interface CarouselProps {
  images: string[];
  title: string;
}

// Auto-advance interval in ms. Paused while the pointer is over the card.
const AUTO_MS = 3500;

// Image carousel body for a ProjectCard: crossfading images with prev/next
// arrows and dot indicators. Empty images -> a "coming soon" tile.
export function Carousel({ images, title }: CarouselProps) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = images.length;

  // Auto-advance. Runs even under reduced motion (a slow, low-motion crossfade),
  // matching the diagram's other ambient animation; pauses on hover/focus.
  useEffect(() => {
    if (count < 2 || paused) return;
    const id = setInterval(() => setI((p) => (p + 1) % count), AUTO_MS);
    return () => clearInterval(id);
  }, [count, paused]);

  if (count === 0) {
    return (
      <div className="flex h-40 items-center justify-center px-4 py-3.5">
        <span className="font-mono text-xs tracking-widest text-muted-line">
          // coming soon
        </span>
      </div>
    );
  }

  const go = (next: number) => setI(((next % count) + count) % count);

  return (
    <div
      className="px-4 py-3.5"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div
        className="relative aspect-video w-full overflow-hidden rounded-md border"
        style={{ borderColor: "rgba(120, 96, 74, 0.22)", background: "#080A0D" }}
      >
        <AnimatePresence initial={false} mode="popLayout">
          <motion.img
            key={images[i]}
            src={images[i]}
            alt={`${title} screenshot ${i + 1}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        </AnimatePresence>

        {count > 1 && (
          <>
            <CarouselArrow side="left" onClick={() => go(i - 1)} />
            <CarouselArrow side="right" onClick={() => go(i + 1)} />
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-2.5 flex items-center justify-center gap-1.5">
          {images.map((img, di) => (
            <button
              key={img}
              type="button"
              aria-label={`Show image ${di + 1}`}
              aria-current={di === i}
              onClick={() => setI(di)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                di === i
                  ? "w-4 bg-orange"
                  : "w-1.5 bg-muted-line/40 hover:bg-muted-line",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CarouselArrow({
  side,
  onClick,
}: {
  side: "left" | "right";
  onClick: () => void;
}) {
  const Icon = side === "left" ? CaretLeft : CaretRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === "left" ? "Previous image" : "Next image"}
      className={cn(
        "absolute top-1/2 -translate-y-1/2 flex size-7 items-center justify-center rounded-full text-ink-text transition-colors hover:text-orange",
        side === "left" ? "left-2" : "right-2",
      )}
      style={{ background: "rgba(8, 10, 13, 0.6)" }}
    >
      <Icon size={15} weight="bold" />
    </button>
  );
}
