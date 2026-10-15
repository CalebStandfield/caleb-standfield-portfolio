import type { ComponentProps } from "react";

import { imageEntry, srcSetFor } from "@/lib/images";

type ResponsiveImageProps = Omit<ComponentProps<"img">, "src" | "srcSet"> & {
  src: string;
};

// <img> that swaps a public path for its generated WebP srcset and sets
// intrinsic width/height, so the browser reserves the box before the file
// lands and picks the smallest file that is still sharp at the current DPR.
// Paths missing from the manifest render as-is.
export function ResponsiveImage({ src, ...rest }: ResponsiveImageProps) {
  const entry = imageEntry(src);
  if (!entry) return <img src={src} {...rest} />;

  return (
    <img
      src={entry.variants[entry.variants.length - 1].url}
      srcSet={srcSetFor(src)}
      width={entry.width}
      height={entry.height}
      decoding="async"
      {...rest}
    />
  );
}
