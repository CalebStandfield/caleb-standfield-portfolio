import { useEffect, useRef, useState } from "react";
import { CaretLeft, CaretRight, ImageSquare } from "@phosphor-icons/react";
import {
  AnimatePresence,
  motion,
  useInView,
  type Variants,
} from "motion/react";

import type { ProjectMedia } from "@/content/profile.content";
import { aspectRatioOf, preloadImages } from "@/lib/images";
import { cn } from "@/lib/utils";
import { ResponsiveImage } from "../ResponsiveImage";
import { mediaBox } from "./mediaBox";
import { MediaVideo } from "./MediaVideo";

const AUTO_MS = 4000; // auto-advance interval
const SLIDE_S = 0.5; // slide transition length

// dir 1 = forward: new slide enters from the right, old one leaves left.
// dir -1 mirrors it for the back arrow and earlier dots.
const slideVariants: Variants = {
  enter: (dir: number) => ({ x: `${dir * 100}%` }),
  center: { x: "0%" },
  exit: (dir: number) => ({ x: `${dir * -100}%` }),
};

function slideImages(slide: ProjectMedia): string[] {
  if (slide.type === "image") return [slide.src];
  if (slide.type === "images") return slide.srcs;
  return slide.poster ? [slide.poster] : [];
}

function slideKey(slide: ProjectMedia): string {
  return slide.type === "images" ? slide.srcs.join("|") : slide.src;
}

// Cycles a project's media one slide at a time. Auto-advances every AUTO_MS
// while `active` and on screen, pauses on hover and never leaves a video slide
// on its own. Fixed-height frame (--media-h), items keep their natural ratio.
// Arrows on each side and clickable dots below; a single slide shows neither.
export function MediaCarousel({
  media,
  title,
  active,
}: {
  media: ProjectMedia[];
  title: string;
  active: boolean;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rootRef, { margin: "200px" });
  const [{ index, dir }, setSlide] = useState({ index: 0, dir: 1 });
  const [paused, setPaused] = useState(false);
  const count = media.length;
  const live = active && inView;
  const onVideo = media[index]?.type === "video";

  // fetch the next slide while this one shows, so the swap is instant
  useEffect(() => {
    if (!live || count <= 1) return;
    const next = slideImages(media[(index + 1) % count]);
    if (!next.length) return;
    const ratio = aspectRatioOf(next[0]) ?? 16 / 9;
    preloadImages(next, mediaBox(ratio, next.length).sizes);
  }, [live, count, media, index]);

  useEffect(() => {
    if (paused || !live || onVideo || count <= 1) return;
    const id = window.setInterval(
      () => setSlide((s) => ({ index: (s.index + 1) % count, dir: 1 })),
      AUTO_MS,
    );
    return () => window.clearInterval(id);
  }, [paused, live, onVideo, count]);

  const go = (next: number, dir: number) =>
    setSlide({ index: ((next % count) + count) % count, dir });

  if (!count) {
    return (
      <div className="flex h-(--media-h) w-full flex-col items-center justify-center rounded-xl border border-dashed border-muted-line/30 text-muted-line/65">
        <ImageSquare size={32} weight="thin" />
        <span className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.22em]">
          Project media
        </span>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="w-full"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative">
        {/* both slides share one grid cell during the swap, so the frame keeps
          its height and overflow-hidden clips anything outside it */}
        <div className="grid h-(--media-h) w-full overflow-hidden">
          <AnimatePresence initial={false} custom={dir}>
            <motion.div
              key={index}
              custom={dir}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: SLIDE_S, ease: [0.32, 0.72, 0, 1] }}
              className="col-start-1 row-start-1 flex w-full items-center justify-center gap-2"
            >
              <Slide
                slide={media[index]}
                number={index + 1}
                title={title}
                eager={inView}
                playing={live}
              />
            </motion.div>
          </AnimatePresence>
        </div>

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous media"
              onClick={() => go(index - 1, -1)}
              className="absolute inset-y-0 left-2 flex items-center text-muted-line transition-colors hover:text-orange focus-visible:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <CaretLeft size={28} weight="bold" />
            </button>
            <button
              type="button"
              aria-label="Next media"
              onClick={() => go(index + 1, 1)}
              className="absolute inset-y-0 right-2 flex items-center text-muted-line transition-colors hover:text-orange focus-visible:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <CaretRight size={28} weight="bold" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {media.map((slide, i) => (
            <button
              key={slideKey(slide)}
              type="button"
              aria-label={`Go to media ${i + 1}`}
              onClick={() => go(i, i < index ? -1 : 1)}
              className={cn(
                "rounded-full transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                i === index
                  ? "size-2.5 bg-orange"
                  : "size-2 bg-muted-line/60 hover:bg-muted-line",
              )}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function Slide({
  slide,
  number,
  title,
  eager,
  playing,
}: {
  slide: ProjectMedia;
  number: number;
  title: string;
  eager: boolean;
  playing: boolean;
}) {
  if (slide.type === "video") {
    return (
      <MediaVideo
        src={slide.src}
        poster={slide.poster}
        title={`${title} video`}
        playing={playing}
      />
    );
  }

  const srcs = slideImages(slide);
  return srcs.map((src, i) => {
    const box = mediaBox(aspectRatioOf(src) ?? 16 / 9, srcs.length);
    return (
      <ResponsiveImage
        key={src}
        src={src}
        alt={`${title} preview ${number}${srcs.length > 1 ? `.${i + 1}` : ""}`}
        sizes={box.sizes}
        style={box.style}
        loading={eager ? "eager" : "lazy"}
        className="h-auto min-w-0 rounded-lg border border-muted-line/20"
      />
    );
  });
}
