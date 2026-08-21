import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CaretDown } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { highlightLines } from "@/components/hero/codeHighlight";
import {
  anchor,
  trace,
  type Point,
  type Rect,
  type Side,
} from "@/components/hero/connectors";
import { cn } from "@/lib/utils";
import {
  edgeColors,
  stageScene,
  systemClusters,
  systemEdges,
  systemNodes,
  systemStandalones,
  trafficScenarios,
} from "./portfolio.config";
import type {
  PortfolioStage,
  SystemAlignment,
  SystemClusterData,
  SystemEdgeData,
  SystemNodeData,
  SystemScene,
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
  projects: 1380,
  resume: 2700,
  contact: 3700,
};

const PULSE_SPEED = 270;
const MAX_PULSES = 48;
const PULSE_HOLD_MS = 120;
const PULSE_FADE_MS = 260;
const LABEL_HEIGHT = 18;
const CARD_CLEARANCE = 5;
// How far apart to push the shared mid-lane of parallel edges so their straight
// runs don't stack on the same pixels. Driven by each edge's port offset, which
// is already distinct for sibling edges leaving the same node.
const LANE_SPREAD = 60;
// The two ingress edges that cross the center (Web SPA -> CDN and Mobile App ->
// WAF) sit on mirror-image nodes, so the position-aware ports hand them the same
// vertical lanes and their middle segments overlap into one unreadable line.
// Nudge Mobile -> WAF onto its own lanes so the crossing reads as two lines.
// Purely a drawing hint: it changes where a line attaches, not what connects.
const PORT_OVERRIDES: Record<string, { from?: number; to?: number }> = {
  "mobile-waf": { from: 0.5, to: 0.5 },
};

const nodeById = new Map(systemNodes.map((node) => [node.id, node]));
const incidentEdges = new Map<string, SystemEdgeData[]>();
for (const edge of systemEdges) {
  incidentEdges.set(edge.from, [...(incidentEdges.get(edge.from) ?? []), edge]);
  incidentEdges.set(edge.to, [...(incidentEdges.get(edge.to) ?? []), edge]);
}

// Assign each node's ports by where the connected node actually sits, so an
// edge heading left leaves from a left-ish port and one heading right leaves
// from a right-ish port. Ordering by the other end's center-x this way stops
// sibling edges from crossing right at the card, which is what tangled them.
// Positions are only known once measured, so this runs per layout, not at load.
function computePortOffsets(nodeRects: Record<string, Rect>): Map<string, number> {
  const map = new Map<string, number>();
  for (const [nodeId, edges] of incidentEdges) {
    const self = nodeRects[nodeId];
    const ordered = edges
      .map((edge) => {
        const otherId = edge.from === nodeId ? edge.to : edge.from;
        const other = nodeRects[otherId];
        const anchorX = other
          ? other.x + other.w / 2
          : self
            ? self.x + self.w / 2
            : 0;
        return { edge, anchorX };
      })
      .sort((a, b) => a.anchorX - b.anchorX);
    ordered.forEach(({ edge }, index) => {
      const offset =
        ordered.length === 1 ? 0.5 : 0.3 + (index / (ordered.length - 1)) * 0.4;
      map.set(`${edge.id}:${nodeId}`, offset);
    });
  }
  return map;
}

function labelWidth(label: string): number {
  return Math.max(42, label.length * 5.8 + 18);
}

function sceneColor(scene: SystemScene): string {
  switch (scene) {
    case "ingress":
      return edgeColors.request;
    case "application":
      return edgeColors.data;
    case "operations":
      return edgeColors.delivery;
  }
}

function nodeBorder(kind: SystemNodeData["kind"]): string {
  switch (kind) {
    case "data":
      return "rgba(89, 194, 255, 0.38)";
    case "async":
      return "rgba(230, 180, 80, 0.38)";
    case "delivery":
      return "rgba(183, 156, 255, 0.38)";
    case "ops":
      return "rgba(149, 230, 203, 0.36)";
    case "security":
      return "rgba(170, 217, 76, 0.36)";
    default:
      return "rgba(255, 143, 64, 0.34)";
  }
}

function alignedStyle(width: number, align: SystemAlignment) {
  const edgeInset = 5;
  const left =
    align === "center"
      ? (100 - width) / 2
      : align === "start"
        ? edgeInset
        : 100 - width - edgeInset;
  return { left: `${left}%`, width: `${width}%` };
}

function sideAnchor(rect: Rect, side: Side, offset = 0.5): Point {
  if (side === "left") return { x: rect.x, y: rect.y + rect.h * offset };
  if (side === "right") return { x: rect.x + rect.w, y: rect.y + rect.h * offset };
  if (side === "top") return { x: rect.x + rect.w * offset, y: rect.y };
  return { x: rect.x + rect.w * offset, y: rect.y + rect.h };
}

function expandRect(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2,
  };
}

function segmentHitsRect(start: Point, end: Point, rect: Rect): boolean {
  if (Math.abs(start.x - end.x) < 0.01) {
    const minY = Math.min(start.y, end.y);
    const maxY = Math.max(start.y, end.y);
    return start.x > rect.x && start.x < rect.x + rect.w && maxY > rect.y && minY < rect.y + rect.h;
  }

  const minX = Math.min(start.x, end.x);
  const maxX = Math.max(start.x, end.x);
  return start.y > rect.y && start.y < rect.y + rect.h && maxX > rect.x && minX < rect.x + rect.w;
}

function pathIsClear(points: Point[], obstacles: Rect[]): boolean {
  return points.slice(0, -1).every((point, index) =>
    obstacles.every(
      (obstacle) =>
        !segmentHitsRect(point, points[index + 1], expandRect(obstacle, CARD_CLEARANCE)),
    ),
  );
}

function pathLength(points: Point[]): number {
  return points.slice(0, -1).reduce(
    (total, point, index) =>
      total +
      Math.abs(points[index + 1].x - point.x) +
      Math.abs(points[index + 1].y - point.y),
    0,
  );
}

function automaticRoute(
  from: Rect,
  to: Rect,
  fromOffset: number,
  toOffset: number,
  obstacles: Rect[],
  railWidth: number,
): { start: Point; startSide: Side; end: Point; endSide: Side; points: Point[] } {
  const below = to.y >= from.y + from.h;
  const above = from.y >= to.y + to.h;

  if (below || above) {
    const startSide: Side = below ? "bottom" : "top";
    const endSide: Side = below ? "top" : "bottom";
    const start = sideAnchor(from, startSide, fromOffset);
    const end = sideAnchor(to, endSide, toOffset);
    const laneShift = (fromOffset - 0.5) * LANE_SPREAD;
    const midY = (start.y + end.y) / 2 + laneShift;
    const points = [start, { x: start.x, y: midY }, { x: end.x, y: midY }, end];
    if (pathIsClear(points, obstacles)) {
      return { start, startSide, end, endSide, points };
    }

    const direction = below ? 1 : -1;
    const startGapY = start.y + direction * 10;
    const endGapY = end.y - direction * 10;
    const laneCandidates = new Set<number>([14, railWidth - 14]);
    for (const rect of [...obstacles, from, to]) {
      laneCandidates.add(rect.x - CARD_CLEARANCE - 2);
      laneCandidates.add(rect.x + rect.w + CARD_CLEARANCE + 2);
    }

    const verticalCandidates = [...laneCandidates]
      .filter((laneX) => laneX > 4 && laneX < railWidth - 4)
      .flatMap((laneX) => {
        const points = [
          start,
          { x: start.x, y: startGapY },
          { x: laneX, y: startGapY },
          { x: laneX, y: endGapY },
          { x: end.x, y: endGapY },
          end,
        ];
        return pathIsClear(points, obstacles)
          ? [{ start, startSide, end, endSide, points, score: pathLength(points) }]
          : [];
      })
      .sort((a, b) => a.score - b.score);

    if (verticalCandidates[0]) return verticalCandidates[0];
  }

  const toRight = to.x >= from.x + from.w;
  const toLeft = from.x >= to.x + to.w;
  if (toRight || toLeft) {
    const startSide: Side = toRight ? "right" : "left";
    const endSide: Side = toRight ? "left" : "right";
    const start = sideAnchor(from, startSide, fromOffset);
    const end = sideAnchor(to, endSide, toOffset);
    const laneShift = (fromOffset - 0.5) * LANE_SPREAD;
    const midX = (start.x + end.x) / 2 + laneShift;
    const points = [start, { x: midX, y: start.y }, { x: midX, y: end.y }, end];
    if (pathIsClear(points, obstacles)) {
      return { start, startSide, end, endSide, points };
    }
  }

  const laneCandidates = new Set<number>([14, railWidth - 14]);
  for (const rect of [...obstacles, from, to]) {
    laneCandidates.add(rect.x - CARD_CLEARANCE - 2);
    laneCandidates.add(rect.x + rect.w + CARD_CLEARANCE + 2);
  }

  const candidates = [...laneCandidates]
    .filter((laneX) => laneX > 4 && laneX < railWidth - 4)
    .flatMap((laneX) => {
      const startSide: Side = laneX < from.x + from.w / 2 ? "left" : "right";
      const endSide: Side = laneX < to.x + to.w / 2 ? "left" : "right";
      const start = sideAnchor(from, startSide, fromOffset);
      const end = sideAnchor(to, endSide, toOffset);
      const points = [start, { x: laneX, y: start.y }, { x: laneX, y: end.y }, end];
      return pathIsClear(points, obstacles)
        ? [{ start, startSide, end, endSide, points, score: pathLength(points) }]
        : [];
    })
    .sort((a, b) => a.score - b.score);

  if (candidates[0]) return candidates[0];

  const startSide: Side = below ? "bottom" : above ? "top" : "right";
  const endSide: Side = below ? "top" : above ? "bottom" : "left";
  const start = anchor(from, startSide);
  const end = anchor(to, endSide);
  const mid =
    startSide === "bottom" || startSide === "top"
      ? [
          { x: start.x, y: (start.y + end.y) / 2 },
          { x: end.x, y: (start.y + end.y) / 2 },
        ]
      : [
          { x: (start.x + end.x) / 2, y: start.y },
          { x: (start.x + end.x) / 2, y: end.y },
        ];
  return { start, startSide, end, endSide, points: [start, ...mid, end] };
}

function routedEdge(
  edge: SystemEdgeData,
  from: Rect,
  to: Rect,
  obstacles: Rect[],
  railWidth: number,
  portOffsets: Map<string, number>,
) {
  const override = PORT_OVERRIDES[edge.id];
  const fromOffset =
    override?.from ?? portOffsets.get(`${edge.id}:${edge.from}`) ?? 0.5;
  const toOffset =
    override?.to ?? portOffsets.get(`${edge.id}:${edge.to}`) ?? 0.5;

  if (edge.trunk === "origin" || edge.trunk === "recovery") {
    // Both the origin (CDN -> object store) and recovery trunks hug the right
    // wall so the long vertical runs sit at the far edge of the screen instead
    // of down the middle where the pulses are distracting.
    const trunkX = railWidth - 14;
    const startSide: Side = "right";
    const endSide: Side = startSide;
    const start = sideAnchor(from, startSide, fromOffset);
    const end = sideAnchor(to, endSide, toOffset);
    return {
      start,
      startSide,
      end,
      endSide,
      points: [start, { x: trunkX, y: start.y }, { x: trunkX, y: end.y }, end],
    };
  }

  if (edge.trunk === "gateway") {
    const startSide: Side = "bottom";
    const endSide: Side = "top";
    const start = sideAnchor(from, startSide, 0.5);
    const end = sideAnchor(to, endSide, toOffset);
    const fanY = end.y - 8;
    return {
      start,
      startSide,
      end,
      endSide,
      points: [start, { x: start.x, y: fanY }, { x: end.x, y: fanY }, end],
    };
  }

  return automaticRoute(from, to, fromOffset, toOffset, obstacles, railWidth);
}

function chooseScenario(
  scene: SystemScene,
  previousId?: string,
): TrafficScenario | undefined {
  const matching = trafficScenarios.filter(
    (scenario) => scenario.scene === scene && scenario.id !== previousId,
  );
  const fallback = trafficScenarios.filter((scenario) => scenario.scene === scene);
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

export function SystemRail({ stage }: { stage: PortfolioStage }) {
  const reduceMotion = useReducedMotion();
  const animate = !reduceMotion;
  const activeScene = stageScene[stage];

  const railRef = useRef<HTMLElement>(null);
  const nodeEls = useRef<Map<string, HTMLDivElement>>(new Map());
  const [nodeRects, setNodeRects] = useState<Record<string, Rect>>({});
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

    const nextNodeRects: Record<string, Rect> = {};
    nodeEls.current.forEach((element, id) => {
      const box = element.getBoundingClientRect();
      nextNodeRects[id] = {
        x: box.left - railBox.left,
        y: box.top - railBox.top,
        w: box.width,
        h: box.height,
      };
    });

    setStagePositions(nextPositions);
    setNodeRects(nextNodeRects);
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
    const portOffsets = computePortOffsets(nodeRects);

    return systemEdges.flatMap((edge) => {
      const from = nodeRects[edge.from];
      const to = nodeRects[edge.to];
      if (!from || !to) return [];

      const obstacles = Object.entries(nodeRects)
        .filter(([id]) => id !== edge.from && id !== edge.to)
        .map(([, rect]) => rect);
      const route = routedEdge(edge, from, to, obstacles, size.width, portOffsets);
      const width = edge.label ? labelWidth(edge.label) : undefined;
      const result = trace(
        route.start,
        route.startSide,
        route.end,
        route.endSide,
        {
          points: route.points,
          radius: 7,
          obstacles,
          reserved,
          labelSize: width ? { w: width, h: LABEL_HEIGHT } : undefined,
          bounds: { x: 0, y: 0, w: size.width, h: size.height },
        },
      );

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
  }, [nodeRects, size.height, size.width]);

  const segmentsRef = useRef(segments);
  useEffect(() => {
    segmentsRef.current = segments;
  }, [segments]);

  const pathEls = useRef<(SVGPathElement | null)[]>([]);
  const pulseEls = useRef<Map<number, SVGCircleElement>>(new Map());
  const nextPulseId = useRef(0);
  const [pulses, setPulses] = useState<Pulse[]>([]);

  const spawn = useCallback((segmentIndex: number, direction: 1 | -1 = 1) => {
    setPulses((current) => {
      const trimmed = current.length >= MAX_PULSES ? current.slice(1) : current;
      return [
        ...trimmed,
        {
          id: nextPulseId.current++,
          segmentIndex,
          born: performance.now(),
          direction,
        },
      ];
    });
  }, []);

  const emitNodeTraffic = useCallback(
    (nodeId: string, opening: boolean) => {
      if (!opening) return;
      segmentsRef.current.forEach((segment, segmentIndex) => {
        if (segment.edge.from === nodeId) spawn(segmentIndex, 1);
        if (segment.edge.to === nodeId) spawn(segmentIndex, -1);
      });
    },
    [spawn],
  );

  useEffect(() => {
    if (!size.width || !segments.length) return;

    let cancelled = false;
    let previousScenarioId: string | undefined;
    const timers = new Set<number>();

    const schedule = (callback: () => void, delayMs: number) => {
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        if (!cancelled) callback();
      }, delayMs);
      timers.add(timer);
    };

    const runScenario = (scenario: TrafficScenario, stepIndex = 0) => {
      const step = scenario.steps[stepIndex];
      if (!step || cancelled || document.hidden) return;

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

      schedule(
        () => runScenario(scenario, stepIndex + 1),
        travelMs * 0.62 + (step.pauseMs ?? 90),
      );
    };

    const launch = () => {
      if (document.hidden) {
        schedule(launch, 1000);
        return;
      }
      const scenario = chooseScenario(activeScene, previousScenarioId);
      if (scenario) {
        previousScenarioId = scenario.id;
        runScenario(scenario);
      }
      schedule(launch, 1450 + Math.random() * 1050);
    };

    schedule(launch, 480);
    return () => {
      cancelled = true;
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [activeScene, segments.length, size.width, spawn]);

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
        const travelMs = Math.max(100, (length / PULSE_SPEED) * 1000);
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
          String(0.88 * (progress < 0.1 ? progress / 0.1 : Math.max(0, 1 - fade))),
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
      aria-label="Interactive profile-platform reference architecture"
      className="relative min-w-0 self-stretch border-x border-muted-line/[0.06] bg-surface/[0.035]"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,143,64,0.045),transparent_18%),radial-gradient(circle_at_50%_46%,rgba(89,194,255,0.035),transparent_22%),radial-gradient(circle_at_50%_76%,rgba(183,156,255,0.04),transparent_22%)]" />

      <svg
        className="pointer-events-none absolute inset-0 z-[3] size-full overflow-visible"
        viewBox={`0 0 ${size.width || 1} ${size.height || 1}`}
        preserveAspectRatio="none"
      >
        <defs>
          {Object.entries(edgeColors).map(([kind, color]) => (
            <marker
              key={kind}
              id={`rail-arrow-${kind}`}
              markerWidth="7"
              markerHeight="7"
              refX="6"
              refY="3.5"
              orient="auto-start-reverse"
              markerUnits="userSpaceOnUse"
            >
              <path d="M 0 1 L 6 3.5 L 0 6 Z" fill={color} />
            </marker>
          ))}
        </defs>

        {segments.map((segment, index) => {
          const active = segment.edge.scene === activeScene;
          return (
            <motion.path
              key={segment.edge.id}
              data-system-edge={segment.edge.id}
              data-system-from={segment.edge.from}
              data-system-to={segment.edge.to}
              data-system-trunk={segment.edge.trunk}
              ref={(element: SVGPathElement | null) => {
                pathEls.current[index] = element;
              }}
              d={segment.d}
              fill="none"
              stroke={segment.color}
              strokeWidth={active ? 1.35 : 0.9}
              strokeDasharray={
                segment.edge.kind === "async"
                  ? "6 6"
                  : segment.edge.kind === "delivery"
                    ? "3 6"
                    : segment.edge.kind === "telemetry"
                      ? "2 6"
                      : segment.edge.kind === "control"
                        ? "2 7"
                        : undefined
              }
              strokeLinecap="round"
              strokeLinejoin="round"
              markerStart={
                segment.edge.bidirectional
                  ? `url(#rail-arrow-${segment.edge.kind})`
                  : undefined
              }
              markerEnd={`url(#rail-arrow-${segment.edge.kind})`}
              animate={{ strokeOpacity: active ? 0.58 : 0.16 }}
              transition={{ duration: animate ? 0.45 : 0 }}
            />
          );
        })}

        {segments.map((segment) => {
          const active = segment.edge.scene === activeScene;
          if (!segment.edge.label || !segment.labelAnchor || !segment.labelWidth) {
            return null;
          }

          return (
            <motion.g
              key={`label-${segment.edge.id}`}
              transform={`translate(${segment.labelAnchor.x} ${segment.labelAnchor.y})`}
              animate={{ opacity: active ? 0.82 : 0.25 }}
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
                strokeOpacity="0.34"
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

        {pulses.map((pulse) => {
          const segment = segments[pulse.segmentIndex];
          const color = segment?.color ?? edgeColors.request;
          return (
            <circle
              key={pulse.id}
              ref={(element) => {
                if (element) pulseEls.current.set(pulse.id, element);
                else pulseEls.current.delete(pulse.id);
              }}
              r={3.4}
              fill={color}
              stroke={color}
              strokeOpacity={0.2}
              strokeWidth={6}
              opacity={0}
              style={{ filter: `drop-shadow(0 0 7px ${color})` }}
            />
          );
        })}
      </svg>

      {systemClusters
        .filter((cluster) => cluster.id === "ingress")
        .map((cluster) => (
          <div
            key={`${cluster.id}-mock-label`}
            className="absolute z-[4] text-center font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-line/65"
            style={{
              ...alignedStyle(cluster.width, cluster.align),
              top: stagePositions[cluster.stage] + cluster.offset - 48,
            }}
          >
            <p>Conceptual system // real architecture patterns.</p>
            <p className="mt-1">A little systems theater while you get to know me.</p>
          </div>
        ))}

      {systemClusters.map((cluster) => (
        <SystemCluster
          key={cluster.id}
          cluster={cluster}
          top={stagePositions[cluster.stage] + cluster.offset}
          active={cluster.scene === activeScene}
          reduceMotion={Boolean(reduceMotion)}
          registerNode={registerNode}
          onToggle={emitNodeTraffic}
        />
      ))}

      {systemStandalones.map((standalone) => {
        const node = nodeById.get(standalone.nodeId);
        if (!node) return null;
        const active = standalone.scene === activeScene;
        return (
          <motion.div
            key={standalone.nodeId}
            data-system-standalone={standalone.nodeId}
            className="absolute z-[4]"
            style={{
              ...alignedStyle(standalone.width, standalone.align),
              top: stagePositions[standalone.stage] + standalone.offset,
            }}
            initial={false}
            animate={{ opacity: active ? 1 : 0.66 }}
            transition={{ duration: reduceMotion ? 0 : 0.4 }}
          >
            <p
              className="mb-2 font-mono text-[0.5rem] uppercase tracking-[0.16em]"
              style={{ color: sceneColor(standalone.scene) }}
            >
              {standalone.eyebrow}
            </p>
            <SystemNode
              node={node}
              active={active}
              reduceMotion={Boolean(reduceMotion)}
              registerRef={registerNode(node.id)}
              onToggle={(opening) => emitNodeTraffic(node.id, opening)}
            />
          </motion.div>
        );
      })}
    </aside>
  );
}

function SystemCluster({
  cluster,
  top,
  active,
  reduceMotion,
  registerNode,
  onToggle,
}: {
  cluster: SystemClusterData;
  top: number;
  active: boolean;
  reduceMotion: boolean;
  registerNode: (id: string) => (element: HTMLDivElement | null) => void;
  onToggle: (nodeId: string, opening: boolean) => void;
}) {
  return (
    <motion.section
      data-system-cluster={cluster.id}
      aria-label={cluster.title}
      className="absolute z-[2] rounded-[1.2rem] border border-muted-line/14 bg-[#0B0E12]/60 p-3 shadow-[0_24px_70px_-52px_#000] backdrop-blur-[2px] xl:p-4"
      style={{
        ...alignedStyle(cluster.width, cluster.align),
        top,
        borderColor: active ? `${sceneColor(cluster.scene)}3D` : undefined,
      }}
      initial={false}
      animate={{ opacity: active ? 1 : 0.72 }}
      transition={{ duration: reduceMotion ? 0 : 0.4 }}
    >
      <header className="relative z-[4] mb-4 flex min-w-0 items-center gap-2 border-b border-muted-line/12 pb-3 font-mono">
        <span
          className="text-[0.56rem] tracking-[0.16em]"
          style={{ color: sceneColor(cluster.scene) }}
        >
          {cluster.order}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-ink-text">
            {cluster.title}
          </h2>
          <p className="mt-0.5 truncate text-[0.48rem] tracking-[0.08em] text-muted-line/65">
            {cluster.subtitle}
          </p>
        </div>
        <span className="ml-auto h-px min-w-5 flex-1 bg-gradient-to-r from-muted-line/20 to-transparent" />
      </header>

      <div
        className="grid grid-cols-6 items-start gap-x-2.5 xl:gap-x-3"
        style={{ rowGap: cluster.rowGap }}
      >
        {cluster.placements.map((placement) => {
          const node = nodeById.get(placement.nodeId);
          if (!node) return null;
          return (
            <div
              key={node.id}
              className="relative z-[4] min-w-0"
              style={{
                gridColumn: `${placement.column} / span ${placement.span}`,
                gridRow: placement.row,
              }}
            >
              <SystemNode
                node={node}
                active={active}
                reduceMotion={reduceMotion}
                registerRef={registerNode(node.id)}
                onToggle={(opening) => onToggle(node.id, opening)}
              />
            </div>
          );
        })}
      </div>
    </motion.section>
  );
}

function SystemNode({
  node,
  active,
  reduceMotion,
  registerRef,
  onToggle,
}: {
  node: SystemNodeData;
  active: boolean;
  reduceMotion: boolean;
  registerRef: (element: HTMLDivElement | null) => void;
  onToggle: (opening: boolean) => void;
}) {
  const Icon = node.icon;
  const codeId = `system-code-${node.id}`;
  const { open, expanded, lineEls, caretEls, toggle } = useTypedCode(
    node.code,
    node.initiallyExpanded ?? true,
    () => onToggle(true),
  );
  const lines = highlightLines(node.code, node.language);

  return (
    <div
      ref={registerRef}
      data-system-node={node.id}
      className="relative min-w-0 overflow-hidden rounded-[0.7rem] border bg-[#0E1116] shadow-[0_14px_34px_-28px_#000]"
      style={{
        borderColor: active ? nodeBorder(node.kind) : "rgba(150, 124, 96, 0.16)",
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={codeId}
        onClick={toggle}
        className="flex w-full min-w-0 items-center gap-1.5 px-2 py-2 text-left focus-visible:outline-2 focus-visible:outline-inset focus-visible:outline-orange xl:gap-2 xl:px-2.5 xl:py-2.5"
      >
        <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-orange/10 text-orange xl:size-7">
          <Icon size={14} weight="bold" />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate font-heading text-[clamp(0.62rem,0.7vw,0.72rem)] font-semibold text-ink-text">
            {node.title}
          </span>
          <span className="mt-0.5 block truncate text-[clamp(0.5rem,0.54vw,0.57rem)] leading-3 text-muted-line">
            {node.subtitle}
          </span>
        </span>
        <motion.span
          animate={{ rotate: open ? 0 : -90 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: "easeOut" }}
          className="flex shrink-0"
        >
          <CaretDown
            size={11}
            weight="bold"
            className={cn("text-muted-line", open && "text-orange")}
          />
        </motion.span>
      </button>

      <div
        id={codeId}
        className="grid transition-[grid-template-rows] duration-300 ease-out"
        style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
      >
        <div className="min-h-0 overflow-hidden border-t border-muted-line/12 bg-ink/22">
          <div className="flex items-center justify-between px-2 pt-1.5 xl:px-2.5">
            <span className="font-mono text-[0.47rem] uppercase tracking-[0.13em] text-muted-line/70">
              {node.language}
            </span>
            <span className="size-1 rounded-full bg-green shadow-[0_0_6px_#AAD94C]" />
          </div>
          <pre className="overflow-hidden px-2 pt-1 pb-2 font-mono text-[clamp(0.5rem,0.56vw,0.6rem)] leading-[1.45] xl:px-2.5">
            <code>
              {lines.map((spans, index) => (
                <span
                  key={index}
                  className="relative block min-h-[0.75rem] w-fit whitespace-pre"
                >
                  <span
                    ref={(element) => {
                      lineEls.current[index] = element;
                    }}
                    className="block"
                  >
                    {spans.length ? spans : " "}
                  </span>
                  <span
                    ref={(element) => {
                      caretEls.current[index] = element;
                    }}
                    aria-hidden
                    className="pointer-events-none absolute top-[0.12em] left-0"
                    style={{ opacity: 0 }}
                  >
                    <span className="caret-blink block h-[0.95em] w-[2px] bg-orange" />
                  </span>
                </span>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
