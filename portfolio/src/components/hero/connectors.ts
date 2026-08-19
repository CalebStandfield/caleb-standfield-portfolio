// Pure geometry for the connector traces. Operates in pixel space relative to
// the diagram container. No React, no DOM.

import type { Side } from "./system.config";

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

/**
 * One rail branch from a shared source (profile bottom): straight down to the
 * split Y, out to a side rail X (near the wall), down the rail, then in to the
 * target's side. Left and right cards share their rail run, so drawn together
 * they read as one trunk that splits into two wall rails feeding the cards.
 * Returns just the path `d`.
 */
export function railBranch(
  source: Point,
  splitY: number,
  railX: number,
  target: Point,
  radius = 12,
): string {
  const pts = dedupe([
    source,
    { x: source.x, y: splitY },
    { x: railX, y: splitY },
    { x: railX, y: target.y },
    { x: target.x, y: target.y },
  ]);
  return roundedPath(pts, radius);
}

/** Full trace path string plus the two port endpoints. */
export function trace(
  a: Point,
  sideA: Side,
  b: Point,
  sideB: Side,
  opts: { stub?: number; radius?: number } = {},
): { d: string; a: Point; b: Point } {
  const stub = opts.stub ?? 22;
  const radius = opts.radius ?? 10;
  const pts = dedupe(waypoints(a, sideA, b, sideB, stub));
  return { d: roundedPath(pts, radius), a, b };
}
