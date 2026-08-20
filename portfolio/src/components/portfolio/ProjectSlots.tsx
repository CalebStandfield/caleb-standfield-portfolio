import { ArrowUpRight, GithubLogo, ImageSquare } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { projectSlots } from "./portfolio.config";
import { SectionHeading } from "./SectionHeading";
import type { ProjectData } from "./portfolio.types";

export function ProjectSlots() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="projects"
      data-stage="projects"
      className="scroll-mt-24 py-24 sm:py-28 lg:py-32"
    >
      <SectionHeading
        eyebrow="selected work"
        title="Projects"
        description="A framework for the work worth discussing. Finished projects lead; active work follows."
        systemAnchor="projects"
      />

      <div className="mt-10 space-y-6">
        {projectSlots.map((project, index) => (
          <ProjectSlot
            key={project.id}
            project={project}
            index={index}
            animate={!reduceMotion}
          />
        ))}
      </div>
    </section>
  );
}

function ProjectSlot({
  project,
  index,
  animate,
}: {
  project: ProjectData;
  index: number;
  animate: boolean;
}) {
  const statusLabel =
    project.status === "in_progress" ? "Currently working on" : "Complete";
  const title = project.title || project.placeholderTitle;

  return (
    <motion.article
      className="overflow-hidden rounded-2xl border border-muted-line/25 bg-surface/55"
      initial={animate ? { opacity: 0, y: 12 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: animate ? index * 0.06 : 0 }}
    >
      <div className="grid gap-0 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="flex min-h-56 items-center justify-center border-b border-muted-line/20 bg-ink/45 p-5 xl:border-r xl:border-b-0">
          {project.images[0] ? (
            <img
              src={project.images[0]}
              alt={`${title} preview`}
              className="aspect-video w-full rounded-lg border border-muted-line/20 object-cover"
            />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center rounded-lg border border-dashed border-muted-line/30 text-muted-line/65">
              <ImageSquare size={28} weight="thin" />
              <span className="mt-2 font-mono text-[0.66rem] uppercase tracking-[0.18em]">
                Project image
              </span>
            </div>
          )}
        </div>

        <div className="flex min-h-56 flex-col p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <span
              className={
                project.status === "in_progress"
                  ? "font-mono text-[0.64rem] uppercase tracking-[0.18em] text-amber"
                  : "font-mono text-[0.64rem] uppercase tracking-[0.18em] text-cyan"
              }
            >
              {statusLabel}
            </span>
            <span className="font-mono text-[0.62rem] text-muted-line/60">
              0{index + 1}
            </span>
          </div>
          <h3 className="mt-4 font-mono text-xl font-semibold text-ink-text">
            {title}
          </h3>
          <p className="mt-3 text-sm leading-6 text-muted-line">
            {project.summary || "Add a concise problem, contribution, and result."}
          </p>

          {project.tags.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md border border-muted-line/25 px-2 py-1 font-mono text-[0.62rem] text-muted-line"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {(project.repositoryUrl || project.demoUrl) && (
            <div className="mt-auto flex gap-3 pt-6">
              {project.repositoryUrl && (
                <a href={project.repositoryUrl} className="project-link">
                  <GithubLogo size={16} weight="bold" /> Repository
                </a>
              )}
              {project.demoUrl && (
                <a href={project.demoUrl} className="project-link">
                  <ArrowUpRight size={16} weight="bold" /> Live demo
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.article>
  );
}
