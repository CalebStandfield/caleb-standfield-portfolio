// Pure geometry for the connector traces. Operates in pixel space relative to
// the diagram container. No React, no DOM.

export type Side = "top" | "bottom" | "left" | "right";

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TraceOptions {
  stub?: number;
  radius?: number;
  points?: Point[];
  obstacles?: Rect[];
  reserved?: Rect[];
  labelSize?: { w: number; h: number };
  bounds?: Rect;
}

export interface TraceResult {
  d: string;
  a: Point;
  b: Point;
  points: Point[];
  labelAnchor?: Point;
}

const OUTWARD: Record<Side, Point> = {
  top: { x: 0, y: -1 },
  bottom: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

/** Point on the middle of one side of a card. */
export function anchor(rect: Rect, side: Side): Point {
  switch (side) {
    case "top":
      return { x: rect.x + rect.w / 2, y: rect.y };
    case "bottom":
      return { x: rect.x + rect.w / 2, y: rect.y + rect.h };
    case "left":
      return { x: rect.x, y: rect.y + rect.h / 2 };
    case "right":
      return { x: rect.x + rect.w, y: rect.y + rect.h / 2 };
  }
}

/** Waypoints for an orthogonal trace between two anchored sides. */
function waypoints(
  a: Point,
  sideA: Side,
  b: Point,
  sideB: Side,
  stub: number,
): Point[] {
  const oa = OUTWARD[sideA];
  const ob = OUTWARD[sideB];
  const aStub: Point = { x: a.x + oa.x * stub, y: a.y + oa.y * stub };
  const bStub: Point = { x: b.x + ob.x * stub, y: b.y + ob.y * stub };

  const horizontal = sideA === "left" || sideA === "right";

  if (horizontal) {
    const midX = (aStub.x + bStub.x) / 2;
    return [
      a,
      aStub,
      { x: midX, y: aStub.y },
      { x: midX, y: bStub.y },
      bStub,
      b,
    ];
  }
  const midY = (aStub.y + bStub.y) / 2;
  return [
    a,
    aStub,
    { x: aStub.x, y: midY },
    { x: bStub.x, y: midY },
    bStub,
    b,
  ];
}

/** Drop points that sit on a straight run so corners don't get spurious arcs. */
function dedupe(points: Point[]): Point[] {
  const out: Point[] = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && Math.abs(last.x - p.x) < 0.01 && Math.abs(last.y - p.y) < 0.01) {
      continue;
    }
    out.push(p);
  }
  // remove collinear middles
  const cleaned: Point[] = [];
  for (let i = 0; i < out.length; i++) {
    const prev = cleaned[cleaned.length - 1];
    const cur = out[i];
    const next = out[i + 1];
    if (prev && next) {
      const collinear =
        (Math.abs(prev.x - cur.x) < 0.01 && Math.abs(cur.x - next.x) < 0.01) ||
        (Math.abs(prev.y - cur.y) < 0.01 && Math.abs(cur.y - next.y) < 0.01);
      if (collinear) continue;
    }
    cleaned.push(cur);
  }
  return cleaned;
}

function overlaps(a: Rect, b: Rect): boolean {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function expand(rect: Rect, amount: number): Rect {
  return {
    x: rect.x - amount,
    y: rect.y - amount,
    w: rect.w + amount * 2,
    h: rect.h + amount * 2,
  };
}

interface StraightRun {
  start: number;
  end: number;
  fixed: number;
  horizontal: boolean;
}

function subtractBlockedRange(
  runs: Array<{ start: number; end: number }>,
  blockedStart: number,
  blockedEnd: number,
): Array<{ start: number; end: number }> {
  return runs.flatMap((run) => {
    if (blockedEnd <= run.start || blockedStart >= run.end) return [run];

    const next: Array<{ start: number; end: number }> = [];
    if (blockedStart > run.start) {
      next.push({ start: run.start, end: blockedStart });
    }
    if (blockedEnd < run.end) {
      next.push({ start: blockedEnd, end: run.end });
    }
    return next;
  });
}

function clearRuns(
  start: Point,
  end: Point,
  obstacles: Rect[],
): StraightRun[] {
  const horizontal = Math.abs(start.y - end.y) < 0.01;
  const rangeStart = horizontal
    ? Math.min(start.x, end.x)
    : Math.min(start.y, end.y);
  const rangeEnd = horizontal
    ? Math.max(start.x, end.x)
    : Math.max(start.y, end.y);
  const fixed = horizontal ? start.y : start.x;
  let runs = [{ start: rangeStart, end: rangeEnd }];

  for (const obstacle of obstacles) {
    if (horizontal) {
      if (fixed < obstacle.y || fixed > obstacle.y + obstacle.h) continue;
      runs = subtractBlockedRange(runs, obstacle.x, obstacle.x + obstacle.w);
    } else {
      if (fixed < obstacle.x || fixed > obstacle.x + obstacle.w) continue;
      runs = subtractBlockedRange(runs, obstacle.y, obstacle.y + obstacle.h);
    }
  }

  return runs.map((run) => ({ ...run, fixed, horizontal }));
}

/** Midpoint of the longest straight run that can hold a horizontal label. */
function longestClearSegmentMidpoint(
  points: Point[],
  obstacles: Rect[],
  reserved: Rect[],
  labelSize: { w: number; h: number },
  bounds?: Rect,
): Point | undefined {
  const paddedObstacles = obstacles.map((rect) => expand(rect, 6));
  const runs: StraightRun[] = [];

  for (let index = 0; index < points.length - 1; index += 1) {
    runs.push(...clearRuns(points[index], points[index + 1], paddedObstacles));
  }

  runs.sort((a, b) => b.end - b.start - (a.end - a.start));

  for (const run of runs) {
    const requiredLength = run.horizontal ? labelSize.w + 12 : labelSize.h + 12;
    if (run.end - run.start < requiredLength) continue;

    const midpoint = (run.start + run.end) / 2;
    const point = run.horizontal
      ? { x: midpoint, y: run.fixed }
      : { x: run.fixed, y: midpoint };
    const labelRect: Rect = {
      x: point.x - labelSize.w / 2,
      y: point.y - labelSize.h / 2,
      w: labelSize.w,
      h: labelSize.h,
    };

    if (
      (bounds && !contains(bounds, labelRect)) ||
      paddedObstacles.some((obstacle) => overlaps(labelRect, obstacle)) ||
      reserved.some((rect) => overlaps(labelRect, expand(rect, 4)))
    ) {
      continue;
    }

    return point;
  }

  return undefined;
}

function contains(outer: Rect, inner: Rect): boolean {
  return (
    inner.x >= outer.x &&
    inner.y >= outer.y &&
    inner.x + inner.w <= outer.x + outer.w &&
    inner.y + inner.h <= outer.y + outer.h
  );
}

/** Build an SVG path with rounded right-angle corners through the points. */
function roundedPath(points: Point[], radius: number): string {
  if (points.length < 2) return "";
  const parts: string[] = [`M ${points[0].x} ${points[0].y}`];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const cur = points[i];
    const next = points[i + 1];

    const inLen = Math.hypot(cur.x - prev.x, cur.y - prev.y);
    const outLen = Math.hypot(next.x - cur.x, next.y - cur.y);
    const r = Math.min(radius, inLen / 2, outLen / 2);

    const inDir = { x: (cur.x - prev.x) / (inLen || 1), y: (cur.y - prev.y) / (inLen || 1) };
    const outDir = { x: (next.x - cur.x) / (outLen || 1), y: (next.y - cur.y) / (outLen || 1) };

    const before = { x: cur.x - inDir.x * r, y: cur.y - inDir.y * r };
    const after = { x: cur.x + outDir.x * r, y: cur.y + outDir.y * r };

    parts.push(`L ${before.x} ${before.y}`);
    parts.push(`Q ${cur.x} ${cur.y} ${after.x} ${after.y}`);
  }

  const last = points[points.length - 1];
  parts.push(`L ${last.x} ${last.y}`);
  return parts.join(" ");
}

/** Full trace path string plus the two port endpoints. */
export function trace(
  a: Point,
  sideA: Side,
  b: Point,
  sideB: Side,
  opts: TraceOptions = {},
): TraceResult {
  const requestedStub = opts.stub ?? 22;
  const radius = opts.radius ?? 10;
  const horizontalFacing =
    (sideA === "right" && sideB === "left" && b.x > a.x) ||
    (sideA === "left" && sideB === "right" && a.x > b.x);
  const verticalFacing =
    (sideA === "bottom" && sideB === "top" && b.y > a.y) ||
    (sideA === "top" && sideB === "bottom" && a.y > b.y);
  const facingGap = horizontalFacing
    ? Math.abs(b.x - a.x)
    : verticalFacing
      ? Math.abs(b.y - a.y)
      : Number.POSITIVE_INFINITY;

  // Keep the outward stubs inside the available gap when two card faces sit
  // close together. Fixed stubs would cross, double back, and draw a loop.
  const stub = Math.min(requestedStub, facingGap / 3);
  const pts = dedupe(opts.points ?? waypoints(a, sideA, b, sideB, stub));
  const labelAnchor = opts.labelSize
    ? longestClearSegmentMidpoint(
        pts,
        opts.obstacles ?? [],
        opts.reserved ?? [],
        opts.labelSize,
        opts.bounds,
      )
    : undefined;

  return {
    d: roundedPath(pts, radius),
    a,
    b,
    points: pts,
    labelAnchor,
  };
}
