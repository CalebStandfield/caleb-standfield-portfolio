import { useEffect, useRef } from "react";

import { aspectRatioOf, imageEntry } from "@/lib/images";
import { mediaBox } from "./mediaBox";

// Muted looping demo video. Plays only while `playing` (front card, on
// screen) and pauses otherwise. The poster
// goes through the image manifest, so its ratio sizes the box before the
// video loads.
export function MediaVideo({
  src,
  poster,
  title,
  playing,
}: {
  src: string;
  poster?: string;
  title: string;
  playing: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    // play() rejects if the browser blocks it; the poster and controls stay
    if (playing) video.play().catch(() => {});
    else video.pause();
  }, [playing]);

  const ratio = (poster && aspectRatioOf(poster)) || 16 / 9;
  const posterEntry = poster ? imageEntry(poster) : undefined;
  const posterUrl = posterEntry?.variants.at(-1)?.url ?? poster;

  return (
    <video
      ref={ref}
      src={src}
      poster={posterUrl}
      aria-label={title}
      muted
      loop
      playsInline
      controls
      preload="metadata"
      style={mediaBox(ratio, 1).style}
      className="h-auto min-w-0 rounded-lg border border-muted-line/20 bg-surface"
    />
  );
}
