import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

import { ServiceCard } from "./ServiceCard";
import { anchor, trace, type Rect } from "./connectors";
import { cards, edges } from "./system.config";

interface Size {
  w: number;
  h: number;
}

// A single light traveling along one connector.
interface Pulse {
  id: number;
  edge: number; // index into `edges` / `traces`
  reverse: boolean; // true = travel from `to` back toward `from`
  born: number; // performance.now() at spawn
}

// How long a light takes to cross a connector, in ms.
const PULSE_MS = 1600;
// Center profile fires one pulse in a random N/S/E/W direction this often.
const AUTO_MS = 4000;

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

  // --- light pulses along the connectors -----------------------------------
  // Live path elements (indexed by edge) and pulse circles, both read directly
  // by the RAF loop. Sampling the live path each frame means a pulse follows
  // whatever the line looks like right now, even after a card collapses.
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const pulseEls = useRef<Map<number, SVGCircleElement>>(new Map());
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const nextPulseId = useRef(0);

  const spawn = useCallback((edge: number, reverse: boolean) => {
    setPulses((p) => [
      ...p,
      { id: nextPulseId.current++, edge, reverse, born: performance.now() },
    ]);
  }, []);

  // Emit outward from a card to every neighbor it connects to. A pulse travels
  // from->to; if the card is the `to` end we reverse so light leaves the card.
  const emitFrom = useCallback(
    (cardId: string) => {
      edges.forEach((e, i) => {
        if (e.from === cardId) spawn(i, false);
        else if (e.to === cardId) spawn(i, true);
      });
    },
    [spawn],
  );

  // Center profile fires a single random-direction pulse on an interval.
  useEffect(() => {
    const fromCenter = edges
      .map((e, i) => ({ e, i }))
      .filter(({ e }) => e.from === "profile" || e.to === "profile");
    if (!fromCenter.length) return;
    const id = setInterval(() => {
      const pick = fromCenter[Math.floor(Math.random() * fromCenter.length)];
      spawn(pick.i, pick.e.to === "profile");
    }, AUTO_MS);
    return () => clearInterval(id);
  }, [spawn]);

  // Drive every active pulse from one RAF loop; drop finished ones by id.
  useEffect(() => {
    if (!pulses.length) return;
    let raf = 0;
    const tick = (now: number) => {
      const done: number[] = [];
      for (const pu of pulses) {
        const el = pulseEls.current.get(pu.id);
        const path = pathEls.current[pu.edge];
        const t = (now - pu.born) / PULSE_MS;
        if (!el || !path || t >= 1) {
          done.push(pu.id);
          continue;
        }
        const len = path.getTotalLength();
        const pt = path.getPointAtLength((pu.reverse ? 1 - t : t) * len);
        el.setAttribute("cx", String(pt.x));
        el.setAttribute("cy", String(pt.y));
        // Quick fade-in, hold full brightness across the run, then fade out only
        // once it reaches the destination (last stretch of the path).
        const o = t < 0.12 ? t / 0.12 : t > 0.82 ? (1 - t) / 0.18 : 1;
        el.setAttribute("opacity", String(o));
      }
      if (done.length) {
        setPulses((p) => p.filter((x) => !done.includes(x.id)));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [pulses]);

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
              ref={(el: SVGPathElement | null) => {
                pathEls.current[t.i] = el;
              }}
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
          {/* traveling light pulses; positioned each frame by the RAF loop */}
          {pulses.map((pu) => (
            <circle
              key={pu.id}
              ref={(el) => {
                if (el) pulseEls.current.set(pu.id, el);
                else pulseEls.current.delete(pu.id);
              }}
              r={3.5}
              fill="#FF8F40"
              opacity={0}
              style={{ filter: "drop-shadow(0 0 6px #FF8F40)" }}
            />
          ))}
        </svg>

        {cards.map((card, i) => (
          <ServiceCard
            key={card.id}
            card={card}
            index={i}
            animate={animate}
            registerRef={registerRef(card.id)}
            onOpen={() => emitFrom(card.id)}
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
