import { useEffect, useLayoutEffect } from "react";

import { stageForPath, stagePaths, stageSectionId } from "./portfolio.routes";
import type { PortfolioStage } from "./portfolio.types";

// Keeps the URL path in sync with the section currently in view, and honors a
// deep-linked path on load by scrolling to the matching section.
export function useStageUrl(activeStage: PortfolioStage): void {
  // Jump to the deep-linked section before paint (layout effect) so it runs
  // before the scroll observer starts and the observer's first reading matches
  // the real position. Instant, not smooth: the global `scroll-behavior: smooth`
  // cancels programmatic scrolls, and a deep link should land there at once.
  useLayoutEffect(() => {
    const stage = stageForPath(window.location.pathname);
    if (stage !== "hero") {
      document
        .getElementById(stageSectionId[stage])
        ?.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
  }, []);

  // Mirror the active stage into the URL as the user scrolls. Safe to write on
  // every change: the initial stage is seeded from the URL, so a deep link is
  // never clobbered before the observer catches up.
  useEffect(() => {
    const path = stagePaths[activeStage];
    if (window.location.pathname !== path) {
      window.history.replaceState(null, "", path);
    }
  }, [activeStage]);
}
