import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, useReducedMotion } from "motion/react";

import { trace, type Point, type Rect } from "@/components/hero/connectors";
import { edgeColors } from "./portfolio.config";

interface ConnectorLayout {
  width: number;
  height: number;
  gutter: number;
  source: Rect;
  targets: Array<Rect & { id: string }>;
}

interface ConnectorRoute {
  id: string;
  d: string;
}

interface Pulse {
  id: number;
  routeIndex: number;
  born: number;
}

const SOURCE_SELECTOR = "[data-profile-project-source]";
const TARGET_SELECTOR = "[data-profile-project-target]";
const LINE_COLOR = edgeColors.request;
const VIEWPORT_EDGE_CLEARANCE = 2;
const DESIRED_NEAREST_LANE = 38;
const DESIRED_LANE_GAP = 6;
// Source ports are spread across a fixed band measured from the top of the
// profile card, not from its center. The band sits on the always-visible image
// region so collapsing the struct code never leaves a line attached to nothing.
const SOURCE_PORT_BAND_TOP = 104;
const SOURCE_PORT_BAND_HEIGHT = 184;
const TARGET_OVERLAP = 0;
const ROUTE_RADIUS = 7;
const FIRST_PULSE_DELAY_MS = 800;
const PULSE_INTERVAL_MS = 4_000;
const PULSE_SPEED = 270;
const MAX_PULSES = 8;

function relativeRect(element: Element, container: DOMRect): Rect {
  const box = element.getBoundingClientRect();
  return {
    x: box.left - container.left,
    y: box.top - container.top,
    w: box.width,
    h: box.height,
  };
}

function buildRoutes(layout: ConnectorLayout): ConnectorRoute[] {
  const { source, targets } = layout;
  if (!targets.length) return [];

  const availableDepth = Math.max(
    targets.length,
    layout.gutter + source.x - VIEWPORT_EDGE_CLEARANCE,
  );
  const desiredOuterDepth =
    DESIRED_NEAREST_LANE + (targets.length - 1) * DESIRED_LANE_GAP;
  const laneScale = Math.min(1, availableDepth / desiredOuterDepth);
  const bandTop = source.y + SOURCE_PORT_BAND_TOP;
  const bandStep =
    targets.length > 1 ? SOURCE_PORT_BAND_HEIGHT / (targets.length - 1) : 0;

  return targets.map((target, index) => {
    const start: Point = {
      x: source.x,
      y:
        targets.length > 1
          ? bandTop + index * bandStep
          : bandTop + SOURCE_PORT_BAND_HEIGHT / 2,
    };
    const end: Point = {
      x: target.x + TARGET_OVERLAP,
      y: target.y + target.h / 2,
    };
    const laneDepth =
      (DESIRED_NEAREST_LANE + index * DESIRED_LANE_GAP) * laneScale;
    const laneX = source.x - laneDepth;
    const points: Point[] = [
      start,
      { x: laneX, y: start.y },
      { x: laneX, y: end.y },
      end,
    ];

    return {
      id: target.id,
      d: trace(start, "left", end, "left", {
        points,
        radius: ROUTE_RADIUS,
      }).d,
    };
  });
}

export function ProfileProjectConnector() {
  const reduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const pathEls = useRef<Array<SVGPathElement | null>>([]);
  const pulseEls = useRef<Map<number, SVGCircleElement>>(new Map());
  const nextPulseId = useRef(0);
  const [layout, setLayout] = useState<ConnectorLayout | null>(null);
  const [pulses, setPulses] = useState<Pulse[]>([]);

  const measure = useCallback(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const sourceElement = container.querySelector<HTMLElement>(SOURCE_SELECTOR);
    const targetElements = Array.from(
      container.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
    );
    if (!sourceElement || !targetElements.length) return;

    const containerBox = container.getBoundingClientRect();
    const targets = targetElements
      .map((element) => ({
        ...relativeRect(element, containerBox),
        id: element.dataset.profileProjectTarget ?? "",
      }))
      .sort((a, b) => a.y - b.y);

    setLayout({
      width: containerBox.width,
      height: containerBox.height,
      gutter: containerBox.left,
      source: relativeRect(sourceElement, containerBox),
      targets,
    });
  }, []);

  useLayoutEffect(() => {
    const container = svgRef.current?.parentElement;
    if (!container) return;

    const sourceElement = container.querySelector<HTMLElement>(SOURCE_SELECTOR);
    const targetElements = Array.from(
      container.querySelectorAll<HTMLElement>(TARGET_SELECTOR),
    );
    const observer = new ResizeObserver(measure);

    observer.observe(container);
    if (sourceElement) observer.observe(sourceElement);
    targetElements.forEach((element) => observer.observe(element));
    window.addEventListener("resize", measure);
    measure();

    let cancelled = false;
    void document.fonts.ready.then(() => {
      if (!cancelled) measure();
    });

    return () => {
      cancelled = true;
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const routes = useMemo(
    () => (layout ? buildRoutes(layout) : []),
    [layout],
  );

  useEffect(() => {
    if (!routes.length) return;

    let previousRoute = -1;
    const spawn = () => {
      if (document.hidden) return;

      let routeIndex = Math.floor(Math.random() * routes.length);
      if (routes.length > 1 && routeIndex === previousRoute) {
        routeIndex =
          (routeIndex +
            1 +
            Math.floor(Math.random() * (routes.length - 1))) %
          routes.length;
      }
      previousRoute = routeIndex;

      setPulses((current) => [
        ...(current.length >= MAX_PULSES ? current.slice(1) : current),
        {
          id: nextPulseId.current++,
          routeIndex,
          born: performance.now(),
        },
      ]);
    };

    let interval: number | undefined;
    const kickoff = window.setTimeout(() => {
      spawn();
      interval = window.setInterval(spawn, PULSE_INTERVAL_MS);
    }, FIRST_PULSE_DELAY_MS);

    return () => {
      window.clearTimeout(kickoff);
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [routes.length]);

  useEffect(() => {
    if (!pulses.length) return;

    let frame = 0;
    const tick = (now: number) => {
      const finished: number[] = [];

      for (const pulse of pulses) {
        const circle = pulseEls.current.get(pulse.id);
        const path = pathEls.current[pulse.routeIndex];
        if (!circle || !path) {
          finished.push(pulse.id);
          continue;
        }

        const length = path.getTotalLength();
        const duration = (length / PULSE_SPEED) * 1_000;
        const progress = Math.min(1, (now - pulse.born) / duration);
        const point = path.getPointAtLength(progress * length);
        const fadeIn = Math.min(1, progress / 0.08);
        const fadeOut = Math.min(1, (1 - progress) / 0.12);

        circle.setAttribute("cx", String(point.x));
        circle.setAttribute("cy", String(point.y));
        circle.setAttribute("opacity", String(0.9 * Math.min(fadeIn, fadeOut)));

        if (progress >= 1) finished.push(pulse.id);
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
    <svg
      ref={svgRef}
      aria-hidden="true"
      viewBox={`0 0 ${layout?.width || 1} ${layout?.height || 1}`}
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 z-20 size-full overflow-visible"
    >
      <defs>
        <marker
          id="profile-project-arrow"
          viewBox="0 0 8 8"
          markerWidth="8"
          markerHeight="8"
          refX="7.5"
          refY="4"
          orient="auto"
          markerUnits="userSpaceOnUse"
        >
          <path d="M 0.5 0.75 L 7.5 4 L 0.5 7.25 Z" fill={LINE_COLOR} />
        </marker>
      </defs>

      {routes.map((route, index) => (
        <motion.path
          key={route.id}
          ref={(element: SVGPathElement | null) => {
            pathEls.current[index] = element;
          }}
          data-profile-project-route={route.id}
          d={route.d}
          fill="none"
          stroke={LINE_COLOR}
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeOpacity="0.74"
          markerEnd="url(#profile-project-arrow)"
          initial={reduceMotion ? false : { pathLength: 0, strokeOpacity: 0 }}
          animate={{ pathLength: 1, strokeOpacity: 0.74 }}
          transition={{ duration: reduceMotion ? 0 : 0.7, ease: "easeOut" }}
        />
      ))}

      {pulses.map((pulse) => (
        <circle
          key={pulse.id}
          ref={(element) => {
            if (element) pulseEls.current.set(pulse.id, element);
            else pulseEls.current.delete(pulse.id);
          }}
          data-profile-project-pulse={routes[pulse.routeIndex]?.id}
          r="3.2"
          fill={LINE_COLOR}
          stroke={LINE_COLOR}
          strokeOpacity="0.2"
          strokeWidth="6"
          opacity="0"
          style={{ filter: `drop-shadow(0 0 7px ${LINE_COLOR})` }}
        />
      ))}
    </svg>
  );
}
