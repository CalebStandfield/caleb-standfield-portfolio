import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

import { ContactSection } from "@/components/portfolio/ContactSection";
import { ProfileHero } from "@/components/portfolio/ProfileHero";
import { ProfileProjectConnector } from "@/components/portfolio/ProfileProjectConnector";
import { ProjectSlots } from "@/components/portfolio/ProjectSlots";
import { ResumeSection } from "@/components/portfolio/ResumeSection";
import { SystemRail } from "@/components/portfolio/SystemRail";
import {
  useMediaQuery,
  usePortfolioStage,
} from "@/components/portfolio/usePortfolioStage";
import { useStageUrl } from "@/components/portfolio/useStageUrl";
import {
  smoothScrollToElement,
  smoothScrollToY,
} from "@/components/portfolio/scrollUtils";
import type { PortfolioStage } from "@/components/portfolio/portfolio.types";
import { cn } from "@/lib/utils";

const navigation = [
  { path: "/projects", sectionId: "projects", label: "Projects", stage: "projects" },
  { path: "/resume", sectionId: "resume", label: "Resume", stage: "resume" },
  { path: "/contact", sectionId: "contact", label: "Contact", stage: "contact" },
] as const;

const socials = [
  {
    href: "https://github.com/CalebStandfield",
    label: "GitHub",
    Icon: GithubLogo,
  },
  {
    href: "https://www.linkedin.com/in/caleb-standfield/",
    label: "LinkedIn",
    Icon: LinkedinLogo,
  },
];

export default function App() {
  const activeStage = usePortfolioStage();
  const showSystemRail = useMediaQuery("(min-width: 1024px)");
  useStageUrl(activeStage);

  return (
    <main className="relative min-h-screen overflow-clip bg-ink text-ink-text">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-55"
        style={{
          backgroundImage:
            "radial-gradient(rgba(150,124,96,0.42) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 45% 32%, #000 55%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 45% 32%, #000 55%, transparent 100%)",
        }}
      />

      <Navigation activeStage={activeStage} />

      <div className="relative z-10 mx-auto grid max-w-[1600px] px-4 sm:px-8 lg:grid-cols-[minmax(0,1.25fr)_minmax(26rem,1fr)] lg:gap-6 xl:grid-cols-[minmax(0,3fr)_minmax(22rem,2fr)] xl:gap-12 2xl:gap-16">
        <div className="relative min-w-0" data-portfolio-content>
          <ProfileProjectConnector />
          <ProfileHero />
          <ProjectSlots />
          <ResumeSection />
          <ContactSection />
        </div>

        {showSystemRail && <SystemRail stage={activeStage} />}
      </div>
    </main>
  );
}

function Navigation({ activeStage }: { activeStage: PortfolioStage }) {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-muted-line/15 bg-ink/78 backdrop-blur-xl">
      <div className="mx-auto flex h-[4.35rem] max-w-[1600px] items-center justify-between gap-5 px-4 sm:px-8">
        <a
          href="/"
          onClick={(event) => {
            event.preventDefault();
            smoothScrollToY(0);
            window.history.replaceState(null, "", "/");
          }}
          className="min-w-0 font-mono text-sm tracking-wide sm:text-base"
        >
          <span className="text-orange">caleb</span>
          <span className="text-muted-line">::</span>
          <span className="text-ink-text">standfield</span>
          <span className="hidden text-muted-line xl:inline"> // CS @ Utah</span>
        </a>

        <div className="flex items-center gap-5 lg:gap-7">
          <div className="hidden items-center gap-5 sm:flex lg:gap-7">
            {navigation.map((item) => (
              <a
                key={item.path}
                href={item.path}
                onClick={(event) => {
                  event.preventDefault();
                  smoothScrollToElement(item.sectionId);
                  window.history.replaceState(null, "", item.path);
                }}
                className={cn(
                  "font-mono text-xs transition-colors hover:text-orange",
                  activeStage === item.stage ? "text-orange" : "text-muted-line",
                )}
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="text-muted-line transition-colors hover:text-orange"
              >
                <Icon size={22} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
