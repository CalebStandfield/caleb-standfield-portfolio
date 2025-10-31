"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

interface ProjectCarouselProps {
  images: string[];
  interval?: number; // defaults to 4000ms
}

export default function ProjectCarousel({
  images,
  interval = 4000,
}: ProjectCarouselProps) {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [paused, setPaused] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-scroll logic
  useEffect(() => {
    if (paused) return;

    const container = scrollRef.current;
    if (!container) return;

    let index = 0;
    const count = images.length;

    const id = setInterval(() => {
      index = (index + 1) % count;
      const scrollWidth = container.clientWidth;
      container.scrollTo({
        left: index * scrollWidth,
        behavior: "smooth",
      });
      setActiveIndex(index);
    }, interval);

    return () => clearInterval(id);
  }, [paused, images.length, interval]);

  // Manual scroll detection (for dot updates)
  const handleScroll = () => {
    const container = scrollRef.current;
    if (!container) return;
    const scrollLeft = container.scrollLeft;
    const width = container.clientWidth;
    const index = Math.round(scrollLeft / width);
    setActiveIndex(index);
  };

  return (
    <div className="relative w-full">
      {/* Image scroll area */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={() => setPaused(true)}
        onTouchEnd={() => setPaused(false)}
        className="
          flex overflow-x-auto snap-x snap-mandatory scroll-smooth rounded-3xl 
          shadow-[0_0_40px_rgba(255,255,255,0.15)] cursor-grab active:cursor-grabbing
          hide-scrollbar
        "
      >
        {images.map((src, i) => (
          <div
            key={i}
            className="w-full shrink-0 snap-center relative aspect-video"
          >
            <Image
              src={src}
              alt={`Project image ${i + 1}`}
              width={1920}
              height={1080}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              draggable={false}
              priority={i === 0}
            />
          </div>
        ))}
      </div>

      {/* Dot indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => {
              const container = scrollRef.current;
              if (!container) return;
              container.scrollTo({
                left: i * container.clientWidth,
                behavior: "smooth",
              });
              setActiveIndex(i);
            }}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              activeIndex === i
                ? "bg-white scale-125 shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                : "bg-gray-500/50 hover:bg-gray-300/80"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
