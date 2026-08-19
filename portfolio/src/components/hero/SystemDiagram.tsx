import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ServiceCard } from "./ServiceCard";
import { anchor, trace, type Rect } from "./connectors";
import { cards, edges } from "./system.config";

interface Size {
  w: number;
  h: number;
}

export function SystemDiagram() {
  const reduce = useReducedMotion();
  const animate = !reduce;

  const containerRef = useRef<HTMLDivElement>(null);
  const cardEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [size, setSize] = useState<Size>({ w: 0, h: 0 });

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const cbox = container.getBoundingClientRect();
    const next: Record<string, Rect> = {};
    cardEls.current.forEach((el, id) => {
      const r = el.getBoundingClientRect();
      next[id] = {
        x: r.left - cbox.left,
        y: r.top - cbox.top,
        w: r.width,
        h: r.height,
      };
    });
    setRects(next);
    setSize({ w: cbox.width, h: cbox.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (containerRef.current) ro.observe(containerRef.current);
    cardEls.current.forEach((el) => ro.observe(el));
    return () => ro.disconnect();
  }, [measure]);

  const registerRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) cardEls.current.set(id, el);
      else cardEls.current.delete(id);
    },
    [],
  );

  const traces = edges
    .map((e, i) => {
      const from = rects[e.from];
      const to = rects[e.to];
      if (!from || !to) return null;
      const a = anchor(from, e.fromSide);
      const b = anchor(to, e.toSide);
      return { i, ...trace(a, e.fromSide, b, e.toSide) };
    })
    .filter((t): t is NonNullable<typeof t> => t !== null);

  return (
    <>
      {/* Desktop: full architecture diagram */}
      <div
        ref={containerRef}
        className="relative mx-auto hidden h-[1000px] w-full max-w-[1360px] lg:h-[1040px] md:block"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {traces.map((t) => (
            <motion.path
              key={t.i}
              d={t.d}
              fill="none"
              stroke="#FF8F40"
              strokeOpacity={0.32}
              strokeWidth={1.25}
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={animate ? { pathLength: 0, opacity: 0 } : false}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{
                duration: 0.8,
                delay: animate ? 0.5 + t.i * 0.05 : 0,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* ports */}
          {traces.map((t) => (
            <g key={`p-${t.i}`}>
              <Port point={t.a} animate={animate} delay={0.5 + t.i * 0.05} />
              <Port point={t.b} animate={animate} delay={0.9 + t.i * 0.05} />
            </g>
          ))}
        </svg>

        {cards.map((card, i) => (
          <ServiceCard
            key={card.id}
            card={card}
            index={i}
            animate={animate}
            registerRef={registerRef(card.id)}
          />
        ))}
      </div>

      {/* Mobile: single scrollable column, no connectors */}
      <div className="mx-auto flex max-w-md flex-col items-stretch gap-4 md:hidden">
        {cards.map((card, i) => (
          <ServiceCard
            key={card.id}
            card={card}
            index={i}
            animate={animate}
            registerRef={() => {}}
            flow
          />
        ))}
      </div>
    </>
  );
}

function Port({
  point,
  animate,
  delay,
}: {
  point: { x: number; y: number };
  animate: boolean;
  delay: number;
}) {
  return (
    <motion.circle
      cx={point.x}
      cy={point.y}
      r={2.5}
      fill="#FF8F40"
      initial={animate ? { opacity: 0 } : false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: animate ? delay : 0 }}
    />
  );
}
