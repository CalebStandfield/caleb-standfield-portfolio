import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { anchor, trace, type Point, type Rect } from "@/components/hero/connectors";
import { cn } from "@/lib/utils";
import {
  edgeColors,
  stageAnchor,
  stageBand,
  SYSTEM_CANVAS_HEIGHT,
  systemEdges,
  systemNodes,
  trafficScenarios,
} from "./portfolio.config";
import type {
  PortfolioStage,
  SystemBand,
  SystemEdgeData,
  SystemNodeData,
  TrafficScenario,
} from "./portfolio.types";

interface RailSize {
  width: number;
  viewportHeight: number;
}

interface Segment {
  edge: SystemEdgeData;
  d: string;
  color: string;
  start: Point;
  labelAnchor?: Point;
  labelWidth?: number;
}

interface Pulse {
  id: number;
  segmentIndex: number;
  born: number;
  direction: 1 | -1;
}

const PULSE_SPEED = 245;
const PULSE_HOLD_MS = 140;
const PULSE_FADE_MS = 240;
const LABEL_HEIGHT = 18;

const bandLabels: Array<{ band: SystemBand; order: string; label: string; y: number }> = [
  { band: "request", order: "01", label: "request path", y: 28 },
  { band: "data", order: "02", label: "data + async", y: 606 },
  { band: "ops", order: "03", label: "delivery + operations", y: 1438 },
];

function labelWidth(label: string): number {
  return Math.max(42, label.length * 5.8 + 18);
}

function chooseScenario(
  band: SystemBand,
  previousId?: string,
): TrafficScenario | undefined {
  const matching = trafficScenarios.filter(
    (scenario) => scenario.band === band && scenario.id !== previousId,
  );
  const fallback = trafficScenarios.filter((scenario) => scenario.band === band);
  const pool = matching.length ? matching : fallback;
  if (!pool.length) return undefined;

  const total = pool.reduce((sum, scenario) => sum + scenario.weight, 0);
  let roll = Math.random() * total;
  for (const scenario of pool) {
    roll -= scenario.weight;
    if (roll <= 0) return scenario;
  }
  return pool[pool.length - 1];
}

function nodeBorder(kind: SystemNodeData["kind"]): string {
  switch (kind) {
    case "core":
      return "rgba(255, 143, 64, 0.55)";
    case "data":
      return "rgba(89, 194, 255, 0.4)";
    case "ops":
      return "rgba(183, 156, 255, 0.4)";
    default:
      return "rgba(120, 96, 74, 0.38)";
  }
}

export function SystemRail({ stage }: { stage: PortfolioStage }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const activeBand = stageBand[stage];

  const viewportRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [size, setSize] = useState<RailSize>({ width: 0, viewportHeight: 0 });

  const measure = useCallback(() => {
    const viewport = viewportRef.current;
    const canvas = canvasRef.current;
    if (!viewport || !canvas) return;

    const viewportBox = viewport.getBoundingClientRect();
    const canvasBox = canvas.getBoundingClientRect();
    const nextRects: Record<string, Rect> = {};
    nodeEls.current.forEach((element, id) => {
      const box = element.getBoundingClientRect();
      nextRects[id] = {
        x: box.left - canvasBox.left,
        y: box.top - canvasBox.top,
        w: box.width,
        h: box.height,
      };
    });

    setRects(nextRects);
    setSize({ width: canvasBox.width, viewportHeight: viewportBox.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    if (canvasRef.current) observer.observe(canvasRef.current);
    nodeEls.current.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [measure]);

  const registerNode = useCallback(
    (id: string) => (element: HTMLDivElement | null) => {
      if (element) nodeEls.current.set(id, element);
      else nodeEls.current.delete(id);
    },
    [],
  );

  const segments = useMemo<Segment[]>(() => {
    const reserved: Rect[] = [];
    const obstacles = Object.values(rects);

    return systemEdges.flatMap((edge) => {
      const from = rects[edge.from];
      const to = rects[edge.to];
      if (!from || !to) return [];

      const start = anchor(from, edge.fromSide);
      const end = anchor(to, edge.toSide);
      const width = edge.label ? labelWidth(edge.label) : undefined;
      const result = trace(start, edge.fromSide, end, edge.toSide, {
        stub: 15,
        radius: 8,
        obstacles,
        reserved,
        labelSize: width ? { w: width, h: LABEL_HEIGHT } : undefined,
        bounds: { x: 0, y: 0, w: size.width, h: SYSTEM_CANVAS_HEIGHT },
      });

      if (result.labelAnchor && width) {
        reserved.push({
          x: result.labelAnchor.x - width / 2,
          y: result.labelAnchor.y - LABEL_HEIGHT / 2,
          w: width,
          h: LABEL_HEIGHT,
        });
      }

      return [
        {
          edge,
          d: result.d,
          color: edgeColors[edge.kind],
          start,
          labelAnchor: result.labelAnchor,
          labelWidth: width,
        },
      ];
    });
  }, [rects, size.width]);

  const segmentsRef = useRef(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const pulseEls = useRef<Map<number, SVGCircleElement>>(new Map());
  const nextPulseId = useRef(0);
  const [pulses, setPulses] = useState<Pulse[]>([]);

  const spawn = useCallback(
    (segmentIndex: number, direction: 1 | -1 = 1) => {
      setPulses((current) => [
        ...current,
        {
          id: nextPulseId.current++,
          segmentIndex,
          born: performance.now(),
          direction,
        },
      ]);
    },
    [],
  );

  useEffect(() => {
    if (!animate || !size.width || !segments.length) return;

    let cancelled = false;
    let timer: number | undefined;
    let previousScenarioId: string | undefined;

    const schedule = (delayMs: number) => {
      timer = window.setTimeout(() => {
        if (cancelled) return;
        const scenario = chooseScenario(activeBand, previousScenarioId);
        if (!scenario) return;

        const runStep = (stepIndex: number) => {
          if (cancelled) return;
          const step = scenario.steps[stepIndex];
          if (!step) {
            previousScenarioId = scenario.id;
            schedule(4200 + Math.random() * 2800);
            return;
          }

          const packets = [
            ...step.edgeIds.map((edgeId) => ({ edgeId, direction: 1 as const })),
            ...(step.reverseEdgeIds ?? []).map((edgeId) => ({
              edgeId,
              direction: -1 as const,
            })),
          ]
            .map((packet) => ({
              ...packet,
              segmentIndex: segmentsRef.current.findIndex(
                (segment) => segment.edge.id === packet.edgeId,
              ),
            }))
            .filter((packet) => packet.segmentIndex >= 0);

          packets.forEach((packet) => spawn(packet.segmentIndex, packet.direction));
          const travelMs = packets.reduce((longest, packet) => {
            const path = pathEls.current[packet.segmentIndex];
            if (!path) return longest;
            return Math.max(longest, (path.getTotalLength() / PULSE_SPEED) * 1000);
          }, 180);

          timer = window.setTimeout(
            () => runStep(stepIndex + 1),
            travelMs + (step.pauseMs ?? 100),
          );
        };

        runStep(0);
      }, delayMs);
    };

    schedule(650);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [activeBand, animate, segments.length, size.width, spawn, stage]);

  useEffect(() => {
    if (!pulses.length) return;
    let frame = 0;

    const tick = (now: number) => {
      const finished: number[] = [];
      for (const pulse of pulses) {
        const circle = pulseEls.current.get(pulse.id);
        const path = pathEls.current[pulse.segmentIndex];
        if (!circle || !path) {
          finished.push(pulse.id);
          continue;
        }

        const length = path.getTotalLength();
        const travelMs = (length / PULSE_SPEED) * 1000;
        const elapsed = now - pulse.born;
        const progress = Math.min(elapsed / travelMs, 1);
        const targetElapsed = elapsed - travelMs;
        const fade =
          targetElapsed <= PULSE_HOLD_MS
            ? 0
            : (targetElapsed - PULSE_HOLD_MS) / PULSE_FADE_MS;

        if (fade >= 1) {
          finished.push(pulse.id);
          continue;
        }

        const directedProgress = pulse.direction === 1 ? progress : 1 - progress;
        const point = path.getPointAtLength(directedProgress * length);
        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute(
          "opacity",
          String(progress < 0.12 ? progress / 0.12 : Math.max(0, 1 - fade)),
        );
      }

      if (finished.length) {
        setPulses((current) =>
          current.filter((pulse) => !finished.includes(pulse.id)),
        );
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [pulses]);

  const rawOffset = size.viewportHeight * 0.44 - stageAnchor[stage];
  const minOffset = size.viewportHeight - SYSTEM_CANVAS_HEIGHT;
  const offsetY = Math.max(minOffset, Math.min(0, rawOffset));

  return (
    <aside
      aria-hidden="true"
      className="sticky top-[5.4rem] h-[calc(100vh-6.8rem)] min-h-[34rem] self-start"
    >
      <div
        ref={viewportRef}
        className="relative h-full overflow-hidden rounded-3xl border border-muted-line/15 bg-surface/20"
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(255,143,64,0.045),transparent_62%)]" />
        <motion.div
          ref={canvasRef}
          className="absolute inset-x-0 top-0"
          style={{ height: SYSTEM_CANVAS_HEIGHT }}
          animate={{ y: offsetY }}
          transition={
            animate
              ? { duration: 0.75, ease: [0.22, 1, 0.36, 1] }
              : { duration: 0 }
          }
        >
          <svg
            className="absolute inset-0 z-[1] h-full w-full overflow-visible"
            viewBox={`0 0 ${size.width || 1} ${SYSTEM_CANVAS_HEIGHT}`}
            preserveAspectRatio="none"
          >
            <defs>
              {Object.entries(edgeColors).map(([kind, color]) => (
                <marker
                  key={kind}
                  id={`rail-arrow-${kind}`}
                  markerWidth="8"
                  markerHeight="8"
                  refX="7"
                  refY="4"
                  orient="auto"
                  markerUnits="userSpaceOnUse"
                >
                  <path d="M 0 1 L 7 4 L 0 7 Z" fill={color} fillOpacity="0.8" />
                </marker>
              ))}
            </defs>

            {segments.map((segment, index) => {
              const active = segment.edge.band === activeBand;
              return (
                <motion.path
                  key={segment.edge.id}
                  ref={(element: SVGPathElement | null) => {
                    pathEls.current[index] = element;
                  }}
                  d={segment.d}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={active ? 1.55 : 1.1}
                  strokeDasharray={
                    segment.edge.kind === "async"
                      ? "6 5"
                      : segment.edge.kind === "ops"
                        ? "2 6"
                        : undefined
                  }
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  markerEnd={`url(#rail-arrow-${segment.edge.kind})`}
                  animate={{ opacity: active ? 0.72 : 0.13 }}
                  transition={{ duration: animate ? 0.45 : 0 }}
                />
              );
            })}

            {segments.map((segment) => {
              const active = segment.edge.band === activeBand;
              if (!active || !segment.edge.label || !segment.labelAnchor || !segment.labelWidth) {
                return null;
              }

              return (
                <g
                  key={`label-${segment.edge.id}`}
                  transform={`translate(${segment.labelAnchor.x} ${segment.labelAnchor.y})`}
                >
                  <rect
                    x={-segment.labelWidth / 2}
                    y={-LABEL_HEIGHT / 2}
                    width={segment.labelWidth}
                    height={LABEL_HEIGHT}
                    rx={LABEL_HEIGHT / 2}
                    fill="#0A0A0C"
                    fillOpacity="0.95"
                    stroke={segment.color}
                    strokeOpacity="0.38"
                  />
                  <text
                    x="0"
                    y="3"
                    fill={segment.color}
                    className="font-mono text-[8px] tracking-[0.05em]"
                    textAnchor="middle"
                  >
                    {segment.edge.label}
                  </text>
                </g>
              );
            })}

            {animate &&
              pulses.map((pulse) => {
                const segment = segments[pulse.segmentIndex];
                const color = segment?.color ?? edgeColors.request;
                return (
                  <circle
                    key={pulse.id}
                    ref={(element) => {
                      if (element) pulseEls.current.set(pulse.id, element);
                      else pulseEls.current.delete(pulse.id);
                    }}
                    r={3.6}
                    fill={color}
                    stroke={color}
                    strokeOpacity={0.22}
                    strokeWidth={5}
                    opacity={0}
                    style={{ filter: `drop-shadow(0 0 7px ${color})` }}
                  />
                );
              })}
          </svg>

          {bandLabels.map((band) => {
            const active = band.band === activeBand;
            return (
              <motion.div
                key={band.band}
                className="absolute left-5 z-[3] flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.18em]"
                style={{ top: band.y }}
                animate={{ opacity: active ? 0.9 : 0.18 }}
                transition={{ duration: animate ? 0.4 : 0 }}
              >
                <span className="text-orange">{band.order}</span>
                <span className="text-muted-line">{band.label}</span>
              </motion.div>
            );
          })}

          {systemNodes.map((node, index) => (
            <SystemNode
              key={node.id}
              node={node}
              index={index}
              active={node.band === activeBand}
              animate={animate}
              registerRef={registerNode(node.id)}
            />
          ))}
        </motion.div>
      </div>
    </aside>
  );
}

function SystemNode({
  node,
  index,
  active,
  animate,
  registerRef,
}: {
  node: SystemNodeData;
  index: number;
  active: boolean;
  animate: boolean;
  registerRef: (element: HTMLDivElement | null) => void;
}) {
  const Icon = node.icon;

  return (
    <motion.div
      ref={registerRef}
      className="absolute z-[2] w-[8.75rem] -translate-x-1/2 xl:w-[9.5rem]"
      style={{ left: `${node.x}%`, top: node.y }}
      initial={animate ? { opacity: 0, y: 6 } : false}
      animate={{ opacity: active ? 0.82 : 0.24, y: 0, scale: active ? 1 : 0.985 }}
      transition={{
        duration: animate ? 0.42 : 0,
        delay: active && animate ? Math.min(index * 0.025, 0.16) : 0,
      }}
    >
      <div
        className={cn(
          "flex items-center gap-2.5 rounded-xl border bg-[#0E1116] px-3 py-3 shadow-[0_18px_40px_-28px_#000]",
          active && "shadow-[0_20px_45px_-28px_rgba(255,143,64,0.45)]",
        )}
        style={{ borderColor: nodeBorder(node.kind) }}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange">
          <Icon size={15} weight="bold" />
        </span>
        <span className="min-w-0 leading-tight">
          <span className="block truncate font-heading text-[0.75rem] font-semibold text-ink-text">
            {node.title}
          </span>
          <span className="mt-0.5 block truncate text-[0.6rem] text-muted-line">
            {node.subtitle}
          </span>
        </span>
      </div>
    </motion.div>
  );
}
