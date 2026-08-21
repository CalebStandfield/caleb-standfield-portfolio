import type { PortfolioStage } from "./portfolio.types";

// URL path shown for each stage. Hero is the bare root, no /home.
export const stagePaths: Record<PortfolioStage, string> = {
  hero: "/",
  projects: "/projects",
  resume: "/resume",
  contact: "/contact",
};

// DOM id of the section element that each stage scrolls to.
export const stageSectionId: Record<PortfolioStage, string> = {
  hero: "home",
  projects: "projects",
  resume: "resume",
  contact: "contact",
};

// Reverse lookup: which stage owns a given path. Unknown paths fall back to hero.
export function stageForPath(path: string): PortfolioStage {
  const match = (Object.entries(stagePaths) as [PortfolioStage, string][]).find(
    ([, p]) => p === path,
  );
  return match ? match[0] : "hero";
}
