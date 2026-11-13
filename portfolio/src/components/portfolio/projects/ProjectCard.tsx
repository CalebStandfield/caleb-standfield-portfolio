import { ArrowUpRight, GithubLogo, Globe } from "@phosphor-icons/react";

import { cn } from "@/lib/utils";
import type { ProjectData } from "../portfolio.types";
import { MediaCarousel } from "./MediaCarousel";
import { TagCarousel } from "./TagCarousel";

// Shown when a project has no real tags yet, so every card keeps the same
// layout. Replace by filling `tags` in profile.content.
const PLACEHOLDER_TAGS = ["Tag one", "Tag two", "Tag three"];

// Big front-of-wheel card: title and status, full-width media, tag strip,
// summary plus optional detail paragraphs, links pinned to the bottom.
// `active` is false while the card sits on the side of the wheel.
export function ProjectCard({
  project,
  active,
}: {
  project: ProjectData;
  active: boolean;
}) {
  const inProgress = project.status === "in_progress";
  const statusLabel = inProgress ? "Currently working on" : "Complete";
  const statusClass = inProgress ? "text-amber" : "text-emerald";
  const tags = project.tags.length > 0 ? project.tags : PLACEHOLDER_TAGS;

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-muted-line/25 bg-surface shadow-[0_30px_80px_-44px_#000]">
      <header className="flex items-center justify-between gap-4 border-b border-muted-line/20 px-5 py-3.5 sm:px-6">
        <h3 className="min-w-0 truncate font-mono text-xl font-bold text-ink-text sm:text-2xl">
          {project.title}
        </h3>
        <span
          className={cn(
            "flex shrink-0 items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.2em]",
            statusClass,
          )}
        >
          <span className="size-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
          <span className="hidden sm:inline">{statusLabel}</span>
        </span>
      </header>

      <div className="border-b border-muted-line/20 p-4 [--media-h:13rem] sm:[--media-h:16rem] xl:[--media-h:18rem]">
        <MediaCarousel
          media={project.media}
          title={project.title}
          active={active}
        />
      </div>

      <TagCarousel tags={tags} />

      <div className="@container flex flex-1 flex-col px-5 py-5 sm:px-6">
        <div className="space-y-3 font-mono text-[0.8rem] leading-6 text-muted-line">
          <p>
            {project.summary ||
              "Add a concise problem, contribution, and result."}
          </p>
          {project.details?.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        {(project.repositoryUrl || project.demoUrl) && (
          <div className="mt-auto flex flex-col gap-3 pt-5 sm:flex-row">
            {project.repositoryUrl && (
              <a
                href={project.repositoryUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Github repository"
                className="project-link flex-1 justify-between @max-[300px]:justify-center"
              >
                <span className="flex items-center gap-2.5">
                  <GithubLogo size={18} weight="fill" />
                  <span className="uppercase tracking-[0.16em] @max-[300px]:hidden">
                    Github
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="@max-[300px]:hidden"
                />
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Visit demo"
                className={cn(
                  "project-link flex-1 justify-between @max-[300px]:justify-center",
                  inProgress ? "project-link--amber" : "project-link--emerald",
                )}
              >
                <span className="flex items-center gap-2.5">
                  <Globe size={18} weight="bold" />
                  <span className="uppercase tracking-[0.16em] @max-[300px]:hidden">
                    Visit
                  </span>
                </span>
                <ArrowUpRight
                  size={16}
                  weight="bold"
                  className="@max-[300px]:hidden"
                />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}
