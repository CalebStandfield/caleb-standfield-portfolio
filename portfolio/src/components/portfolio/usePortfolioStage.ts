import { useEffect, useState } from "react";

import { stageForPath } from "./portfolio.routes";
import type { PortfolioStage } from "./portfolio.types";

const stages: PortfolioStage[] = ["hero", "projects", "resume", "contact"];

export function usePortfolioStage(): PortfolioStage {
  // Seed from the URL so a deep link starts on the right stage before the
  // observer's first reading arrives.
  const [activeStage, setActiveStage] = useState<PortfolioStage>(() =>
    stageForPath(window.location.pathname),
  );

  useEffect(() => {
    const sections = stages
      .map((stage) => document.querySelector<HTMLElement>(`[data-stage="${stage}"]`))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) return;

    // Pick the section whose top sits closest to the 30% line, measuring all
    // sections live. We recompute from current positions (not from the
    // callback's changed entries) because a section can already be intersecting
    // when a neighbor leaves; reading only the changed entries would skip it.
    const pickActive = () => {
      const vh = window.innerHeight;
      const bandTop = vh * 0.2;
      const bandBottom = vh * 0.42;
      const center = vh * 0.3;

      let best: HTMLElement | null = null;
      let bestDist = Infinity;
      for (const section of sections) {
        const rect = section.getBoundingClientRect();
        if (rect.bottom <= bandTop || rect.top >= bandBottom) continue;
        const dist = Math.abs(rect.top - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = section;
        }
      }

      const next = best?.getAttribute("data-stage") as PortfolioStage | null;
      if (next) setActiveStage(next);
    };

    const observer = new IntersectionObserver(pickActive, {
      rootMargin: "-20% 0px -58% 0px",
      threshold: 0,
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return activeStage;
}

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window === "undefined" ? false : window.matchMedia(query).matches,
  );

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}
