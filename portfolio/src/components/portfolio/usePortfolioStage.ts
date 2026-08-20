import { useEffect, useState } from "react";

import type { PortfolioStage } from "./portfolio.types";

const stages: PortfolioStage[] = ["hero", "projects", "resume", "contact"];

export function usePortfolioStage(): PortfolioStage {
  const [activeStage, setActiveStage] = useState<PortfolioStage>("hero");

  useEffect(() => {
    const sections = stages
      .map((stage) => document.querySelector<HTMLElement>(`[data-stage="${stage}"]`))
      .filter((section): section is HTMLElement => section !== null);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - window.innerHeight * 0.3) -
              Math.abs(b.boundingClientRect.top - window.innerHeight * 0.3),
          );

        const next = visible[0]?.target.getAttribute(
          "data-stage",
        ) as PortfolioStage | null;
        if (next) setActiveStage(next);
      },
      { rootMargin: "-20% 0px -58% 0px", threshold: 0 },
    );

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
