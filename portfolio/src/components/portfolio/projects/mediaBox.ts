import type { CSSProperties } from "react";

const MAX_MEDIA_H = 288; // px, matches the xl --media-h in ProjectCard
const IMAGE_GAP = 8; // px, matches gap-2 between side-by-side images
// rough share of the viewport the front card's media takes per breakpoint, so
// the browser picks a file for the real box and not the whole screen
const COLUMN_VW: [string, number][] = [
  ["(min-width: 1280px)", 40],
  ["(min-width: 1024px)", 40],
  ["", 86],
];

// Box for one item in a slide of `count` side by side, known before the file
// loads. Width is the smaller of "full frame height" and "fair share of the
// row", so nothing gets cropped and the frame never resizes.
export function mediaBox(
  ratio: number,
  count: number,
): { style: CSSProperties; sizes: string } {
  const gaps = (count - 1) * IMAGE_GAP;
  const fullHeightWidth = Math.round(MAX_MEDIA_H * ratio);
  return {
    style: {
      aspectRatio: ratio,
      width: `min(calc(var(--media-h) * ${ratio}), calc((100% - ${gaps}px) / ${count}))`,
    },
    sizes: COLUMN_VW.map(([query, vw]) =>
      `${query} min(${fullHeightWidth}px, ${Math.round(vw / count)}vw)`.trim(),
    ).join(", "),
  };
}
