import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CaretDown } from "@phosphor-icons/react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

import { highlightLines } from "@/components/hero/codeHighlight";
import { anchor, trace, type Point, type Rect } from "@/components/hero/connectors";
import { cn } from "@/lib/utils";
import {
  edgeColors,
  stageBand,
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
import { useTypedCode } from "./useTypedCode";

interface RailSize {
  width: number;
  height: number;
}

interface Segment {
  edge: SystemEdgeData;
  d: string;
  color: string;
  labelAnchor?: Point;
  labelWidth?: number;
}

interface Pulse {
  id: number;
  segmentIndex: number;
  born: number;
  direction: 1 | -1;
}

const DEFAULT_STAGE_POSITIONS: Record<PortfolioStage, number> = {
  hero: 128,
  projects: 1080,
  resume: 2320,
  contact: 3220,
};

const PULSE_SPEED = 270;
const PULSE_HOLD_MS = 120;
const PULSE_FADE_MS = 260;
const LABEL_HEIGHT = 18;

const bandLabels: Array<{
  band: SystemBand;
  stage: PortfolioStage;
  order: string;
  label: string;
}> = [
  { band: "request", stage: "hero", order: "01", label: "request + response" },
  { band: "data", stage: "projects", order: "02", label: "data + async" },
  { band: "ops", stage: "resume", order: "03", label: "delivery + operations" },
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
      return "rgba(255, 143, 64, 0.72)";
    case "data":
      return "rgba(89, 194, 255, 0.52)";
    case "ops":
      return "rgba(183, 156, 255, 0.5)";
    default:
      return "rgba(150, 124, 96, 0.48)";
  }
}

export function SystemRail({ stage }: { stage: PortfolioStage }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const activeBand = stageBand[stage];

  const railRef = useRef<HTMLElement>(null);
  const nodeEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [rects, setRects] = useState<Record<string, Rect>>({});
  const [size, setSize] = useState<RailSize>({ width: 0, height: 0 });
  const [stagePositions, setStagePositions] = useState(DEFAULT_STAGE_POSITIONS);

  const measure = useCallback(() => {
    const rail = railRef.current;
    if (!rail) return;

    const railBox = rail.getBoundingClientRect();
    const nextPositions = { ...DEFAULT_STAGE_POSITIONS };
    for (const currentStage of Object.keys(nextPositions) as PortfolioStage[]) {
      const stageAnchor = document.querySelector<HTMLElement>(
        `[data-system-anchor="${currentStage}"]`,
      );
      if (stageAnchor) {
        nextPositions[currentStage] =
          stageAnchor.getBoundingClientRect().top - railBox.top;
      }
    }

    const nextRects: Record<string, Rect> = {};
    nodeEls.current.forEach((element, id) => {
      const box = element.getBoundingClientRect();
      nextRects[id] = {
        x: box.left - railBox.left,
        y: box.top - railBox.top,
        w: box.width,
        h: box.height,
      };
    });

    setStagePositions(nextPositions);
    setRects(nextRects);
    setSize({ width: railBox.width, height: railBox.height });
  }, []);

  useLayoutEffect(() => {
    measure();
    const observer = new ResizeObserver(measure);
    const content = document.querySelector<HTMLElement>("[data-portfolio-content]");
    if (railRef.current) observer.observe(railRef.current);
    if (content) observer.observe(content);
    nodeEls.current.forEach((element) => observer.observe(element));
    window.addEventListener("resize", measure);
    void document.fonts.ready.then(measure);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
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
        stub: 18,
        radius: 8,
        obstacles,
        reserved,
        labelSize: width ? { w: width, h: LABEL_HEIGHT } : undefined,
        bounds: { x: 0, y: 0, w: size.width, h: size.height },
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
          labelAnchor: result.labelAnchor,
          labelWidth: width,
        },
      ];
    });
  }, [rects, size.height, size.width]);

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

  const emitNodeTraffic = useCallback(
    (nodeId: string, opening: boolean) => {
      if (!animate || !opening) return;
      segmentsRef.current.forEach((segment, segmentIndex) => {
        if (segment.edge.from === nodeId) spawn(segmentIndex, 1);
        if (segment.edge.to === nodeId) spawn(segmentIndex, -1);
      });
    },
    [animate, spawn],
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
            schedule(1800 + Math.random() * 2400);
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
            travelMs + (step.pauseMs ?? 90),
          );
        };

        runStep(0);
      }, delayMs);
    };

    schedule(420);
    return () => {
      cancelled = true;
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [activeBand, animate, segments.length, size.width, spawn]);

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
          String(progress < 0.1 ? progress / 0.1 : Math.max(0, 1 - fade)),
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

  return (
    <aside
      ref={railRef}
      aria-label="Interactive system architecture"
      className="relative min-w-0 self-stretch border-x border-muted-line/10 bg-surface/10"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_12%,rgba(255,143,64,0.05),transparent_24%),radial-gradient(circle_at_50%_48%,rgba(89,194,255,0.035),transparent_26%),radial-gradient(circle_at_50%_78%,rgba(183,156,255,0.04),transparent_25%)]" />

      <svg
        className="pointer-events-none absolute inset-0 z-[1] size-full overflow-visible"
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
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
              <path d="M 0 1 L 7 4 L 0 7 Z" fill={color} fillOpacity="0.9" />
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
              strokeWidth={active ? 1.8 : 1.35}
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
              animate={{ opacity: active ? 0.86 : 0.4 }}
              transition={{ duration: animate ? 0.45 : 0 }}
            />
          );
        })}

        {segments.map((segment) => {
          const active = segment.edge.band === activeBand;
          if (
            !segment.edge.label ||
            !segment.labelAnchor ||
            !segment.labelWidth
          ) {
            return null;
          }

          return (
            <motion.g
              key={`label-${segment.edge.id}`}
              transform={`translate(${segment.labelAnchor.x} ${segment.labelAnchor.y})`}
              animate={{ opacity: active ? 0.95 : 0.48 }}
              transition={{ duration: animate ? 0.4 : 0 }}
            >
              <rect
                x={-segment.labelWidth / 2}
                y={-LABEL_HEIGHT / 2}
                width={segment.labelWidth}
                height={LABEL_HEIGHT}
                rx={LABEL_HEIGHT / 2}
                fill="#0A0A0C"
                fillOpacity="0.96"
                stroke={segment.color}
                strokeOpacity="0.48"
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
            </motion.g>
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
                r={4.2}
                fill={color}
                stroke={color}
                strokeOpacity={0.28}
                strokeWidth={8}
                opacity={0}
                style={{ filter: `drop-shadow(0 0 9px ${color})` }}
              />
            );
          })}
      </svg>

      {bandLabels.map((band) => {
        const active = band.band === activeBand;
        return (
          <motion.div
            key={band.band}
            className="absolute inset-x-5 z-[3] flex items-center gap-2 font-mono text-[0.58rem] uppercase tracking-[0.18em]"
            style={{ top: stagePositions[band.stage] }}
            animate={{ opacity: active ? 0.95 : 0.58 }}
            transition={{ duration: animate ? 0.4 : 0 }}
          >
            <span className="text-orange">{band.order}</span>
            <span className="whitespace-nowrap text-muted-line">{band.label}</span>
            <span className="h-px flex-1 bg-gradient-to-r from-muted-line/35 to-transparent" />
          </motion.div>
        );
      })}

      {systemNodes.map((node) => (
        <SystemNode
          key={node.id}
          node={node}
          top={stagePositions[node.stage] + node.y}
          active={node.band === activeBand}
          reduceMotion={Boolean(reduceMotion)}
          registerRef={registerNode(node.id)}
          onToggle={(opening) => emitNodeTraffic(node.id, opening)}
        />
      ))}
    </aside>
  );
}

function SystemNode({
  node,
  top,
  active,
  reduceMotion,
  registerRef,
  onToggle,
}: {
  node: SystemNodeData;
  top: number;
  active: boolean;
  reduceMotion: boolean;
  registerRef: (element: HTMLDivElement | null) => void;
  onToggle: (opening: boolean) => void;
}) {
  const Icon = node.icon;
  const codeId = `system-code-${node.id}`;
  const { expanded, bodyMounted, visibleCode, typing, toggle } = useTypedCode(
    node.code,
    node.initiallyExpanded ?? true,
    reduceMotion,
  );
  const lines = highlightLines(visibleCode, node.language);

  const handleToggle = () => {
    const opening = toggle();
    onToggle(opening);
  };

  return (
    <motion.div
      ref={registerRef}
      className="absolute z-[2] w-[9.5rem] -translate-x-1/2 xl:w-[12rem] 2xl:w-[13rem]"
      style={{ left: `${node.x}%`, top }}
      initial={false}
      animate={{ opacity: active ? 0.98 : 0.72, scale: active ? 1 : 0.992 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
    >
      <div
        className={cn(
          "overflow-hidden rounded-xl border bg-[#0E1116] shadow-[0_18px_42px_-28px_#000]",
          active && "shadow-[0_22px_48px_-28px_rgba(255,143,64,0.48)]",
        )}
        style={{ borderColor: nodeBorder(node.kind) }}
      >
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={codeId}
          onClick={handleToggle}
          className="flex w-full items-center gap-2 px-2.5 py-2.5 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-orange xl:gap-2.5 xl:px-3"
        >
          <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-orange/12 text-orange">
            <Icon size={15} weight="bold" />
          </span>
          <span className="min-w-0 flex-1 leading-tight">
            <span className="block font-heading text-[0.7rem] font-semibold text-ink-text xl:text-[0.75rem]">
              {node.title}
            </span>
            <span className="mt-0.5 block text-[0.56rem] leading-3 text-muted-line xl:text-[0.6rem]">
              {node.subtitle}
            </span>
          </span>
          <CaretDown
            size={12}
            weight="bold"
            className={cn(
              "shrink-0 text-muted-line transition-transform",
              expanded && "rotate-180 text-orange",
            )}
          />
        </button>

        <AnimatePresence initial={false}>
          {bodyMounted && (
            <motion.div
              id={codeId}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.22, ease: "easeOut" }}
              className="overflow-hidden border-t border-muted-line/16"
            >
              <div className="flex items-center justify-between px-2.5 pt-2 xl:px-3">
                <span className="font-mono text-[0.5rem] uppercase tracking-[0.15em] text-muted-line/80">
                  {node.language}
                </span>
                <span className="size-1 rounded-full bg-green shadow-[0_0_7px_#AAD94C]" />
              </div>
              <pre className="min-h-[4.7rem] overflow-x-auto px-2.5 pt-1.5 pb-2.5 font-mono text-[0.54rem] leading-[1.45] xl:px-3 xl:text-[0.58rem]">
                <code>
                  {lines.map((spans, index) => (
                    <span key={index} className="block min-h-[0.8rem] whitespace-pre">
                      {spans.length ? spans : " "}
                      {typing && index === lines.length - 1 && (
                        <span className="caret-blink ml-px text-orange">_</span>
                      )}
                    </span>
                  ))}
                </code>
              </pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
