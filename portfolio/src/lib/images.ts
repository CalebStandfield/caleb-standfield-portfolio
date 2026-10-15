import { imageManifest, type ImageEntry } from "@/content/images.generated";

// Lookups over the generated image manifest (scripts/optimize-images.mjs).
// Every helper returns undefined for paths that were never optimized.

export function imageEntry(src: string): ImageEntry | undefined {
  return imageManifest[src];
}

export function srcSetFor(src: string): string | undefined {
  return imageManifest[src]?.variants
    .map((v) => `${v.url} ${v.width}w`)
    .join(", ");
}

export function aspectRatioOf(src: string): number | undefined {
  const entry = imageManifest[src];
  return entry ? entry.width / entry.height : undefined;
}

// Warms the cache for images about to be shown, using the same srcset/sizes
// as the real <img> so the browser picks the same file.
export function preloadImages(srcs: string[], sizes: string) {
  for (const src of srcs) {
    const img = new Image();
    img.sizes = sizes;
    img.srcset = srcSetFor(src) ?? "";
    if (!img.srcset) img.src = src;
  }
}
