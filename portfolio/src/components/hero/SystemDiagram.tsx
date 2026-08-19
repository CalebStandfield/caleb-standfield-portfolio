import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";
import { CaretDoubleDown } from "@phosphor-icons/react";

import { ServiceCard } from "./ServiceCard";
import { ProjectCard } from "./ProjectCard";
import { anchor, trace, railBranch, type Rect } from "./connectors";
import { cards, edges, projectIds, type CardData } from "./system.config";

interface Size {
  w: number;
  h: number;
}

// A single light traveling along one connector segment.
interface Pulse {
  id: number;
  seg: number; // index into the flattened `segments` list
  reverse: boolean; // true = travel from `to` back toward `from`
  born: number; // performance.now() at spawn
}

// One drawable connector: its path plus the two node ids it joins (for pulses).
interface Segment {
  from: string;
  to: string;
  d: string;
  a: { x: number; y: number };
  b: { x: number; y: number };
}

// How long a light takes to cross a connector, in ms.
const PULSE_MS = 1600;
// The profile fires one pulse in a random direction this often.
const AUTO_MS = 4000;

function isProject(card: CardData): boolean {
  return card.kind === "project";
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

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 768px)");
    const updateHash = () => {
      if (!desktopQuery.matches) return;
      const projects = document.getElementById("projects");
      if (!projects) return;

      const nextHash =
        window.innerHeight / 2 >= projects.getBoundingClientRect().top
          ? "#projects"
          : "#home";

      if (window.location.hash !== nextHash) {
        window.history.replaceState(null, "", nextHash);
      }
    };

    updateHash();
    window.addEventListener("scroll", updateHash, { passive: true });
    desktopQuery.addEventListener("change", updateHash);
    return () => {
      window.removeEventListener("scroll", updateHash);
      desktopQuery.removeEventListener("change", updateHash);
    };
  }, []);

  const registerRef = useCallback(
    (id: string) => (el: HTMLDivElement | null) => {
      if (el) cardEls.current.set(id, el);
      else cardEls.current.delete(id);
    },
    [],
  );

  // --- connector segments: top graph edges + the trunk down to the projects --
  const topSegments: Segment[] = edges
    .map((e) => {
      const from = rects[e.from];
      const to = rects[e.to];
      if (!from || !to) return null;
      const a = anchor(from, e.fromSide);
      const b = anchor(to, e.toSide);
      const { d } = trace(a, e.fromSide, b, e.toSide);
      return { from: e.from, to: e.to, a, b, d };
    })
    .filter((s): s is Segment => s !== null);

  // The profile trunk stays shared until the scroll CTA, then forks around it
  // and closes into two lines before branching to the matching wall rails.
  const trunkSegments: Segment[] = (() => {
    const prof = rects["profile"];
    const projRects = projectIds.map((id) => rects[id]);
    if (!prof || projRects.some((r) => !r) || !size.w) return [];
    const source = anchor(prof, "bottom");
    // Split below the hero's bottom row so the rails clear those cards.
    const splitY = size.h * 0.383;
    const ctaY = size.h * 0.23;
    const ctaTop = ctaY - 10;
    const ctaBottom = ctaY + 72;
    const channelOffset = Math.min(22, size.w * 0.03);
    const ctaOffset = Math.min(54, size.w * 0.07);
    const leftRailX = size.w * 0.005;
    const rightRailX = size.w * 0.995;
    return projectIds.map((id) => {
      const r = rects[id];
      const isLeft = r.x + r.w / 2 < size.w / 2;
      const side = isLeft ? "left" : "right";
      const target = anchor(r, side);
      const railX = isLeft ? leftRailX : rightRailX;
      const trunkX = source.x + (isLeft ? -channelOffset : channelOffset);
      const ctaEdgeX = source.x + (isLeft ? -ctaOffset : ctaOffset);
      return {
        from: "profile",
        to: id,
        a: source,
        b: target,
        d: railBranch(
          source,
          trunkX,
          ctaTop,
          ctaBottom,
          ctaEdgeX,
          splitY,
          railX,
          target,
        ),
      };
    });
  })();

  const segments = [...topSegments, ...trunkSegments];
  // Kept in a ref so the pulse callbacks (interval / onOpen) always read the
  // current geometry without re-subscribing. Synced after each commit.
  const segmentsRef = useRef(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  });

  // --- light pulses along the connectors -----------------------------------
  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const pulseEls = useRef<Map<number, SVGCircleElement>>(new Map());
  const [pulses, setPulses] = useState<Pulse[]>([]);
  const nextPulseId = useRef(0);

  const spawn = useCallback((seg: number, reverse: boolean) => {
    setPulses((p) => [
      ...p,
      { id: nextPulseId.current++, seg, reverse, born: performance.now() },
    ]);
  }, []);

  // Emit outward from a card along every segment it touches. A pulse runs
  // from->to; if the card is the `to` end we reverse so light leaves the card.
  const emitFrom = useCallback(
    (cardId: string) => {
      segmentsRef.current.forEach((s, i) => {
        if (s.from === cardId) spawn(i, false);
        else if (s.to === cardId) spawn(i, true);
      });
    },
    [spawn],
  );

  // The profile fires a single random-direction pulse on an interval.
  useEffect(() => {
    const id = setInterval(() => {
      const opts = segmentsRef.current
        .map((s, i) => ({ s, i }))
        .filter(({ s }) => s.from === "profile" || s.to === "profile");
      if (!opts.length) return;
      const pick = opts[Math.floor(Math.random() * opts.length)];
      spawn(pick.i, pick.s.to === "profile");
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
        const path = pathEls.current[pu.seg];
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

  const renderCard = (card: CardData, i: number, flow: boolean) => {
    const common = {
      card,
      index: i,
      animate,
      registerRef: flow ? () => {} : registerRef(card.id),
      onOpen: flow ? undefined : () => emitFrom(card.id),
      flow,
    };
    return isProject(card) ? (
      <ProjectCard key={card.id} {...common} />
    ) : (
      <ServiceCard key={card.id} {...common} />
    );
  };

  return (
    <>
      {/* Desktop: full architecture diagram */}
      <div
        ref={containerRef}
        className="relative mx-auto hidden h-[2900px] w-full max-w-[1560px] lg:h-[3000px] md:block"
      >
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={`0 0 ${size.w || 1} ${size.h || 1}`}
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {segments.map((s, i) => (
            <motion.path
              key={`${s.from}-${s.to}`}
              ref={(el: SVGPathElement | null) => {
                pathEls.current[i] = el;
              }}
              d={s.d}
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
                delay: animate ? 0.5 + i * 0.05 : 0,
                ease: "easeInOut",
              }}
            />
          ))}
          {/* ports at both ends of each segment */}
          {segments.map((s, i) => (
            <g key={`p-${s.from}-${s.to}`}>
              <Port point={s.a} animate={animate} delay={0.5 + i * 0.05} />
              <Port point={s.b} animate={animate} delay={0.9 + i * 0.05} />
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

        {/* scroll-down call to action, tightly framed by the profile trunks */}
        <a
          href="#projects"
          aria-label="Scroll to projects"
          className="group absolute left-1/2 top-[23.5%] z-10 flex -translate-x-1/2 flex-col items-center gap-1"
        >
          <span className="font-mono text-xs tracking-[0.22em] text-orange">
            SCROLL
          </span>
          <motion.span
            className="text-orange"
            animate={animate ? { y: [0, 6, 0] } : undefined}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <CaretDoubleDown size={18} weight="bold" />
          </motion.span>
        </a>
        {/* scroll anchor for the CTA, sitting just above the project row */}
        <div
          id="projects"
          className="absolute left-0 top-[37.0%] h-px w-full"
        />

        {cards.map((card, i) => renderCard(card, i, false))}
      </div>

      {/* Mobile: single scrollable column, no connectors */}
      <div className="mx-auto flex max-w-md flex-col items-stretch gap-4 md:hidden">
        {cards.map((card, i) => renderCard(card, i, true))}
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
