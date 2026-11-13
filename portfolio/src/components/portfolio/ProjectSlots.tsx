import { projectSlots } from "@/content/profile.content";
import { SectionHeading } from "./SectionHeading";
import { ProjectCard } from "./projects/ProjectCard";
import { ProjectWheel } from "./projects/ProjectWheel";

export function ProjectSlots() {
  return (
    <section
      id="projects"
      data-stage="projects"
      className="scroll-mt-0 py-24 sm:py-28 lg:pt-32 lg:pb-48"
    >
      <SectionHeading
        eyebrow="selected work"
        title="Projects"
        description="My highlighted projects. Scroll left or right to move to the next project; use arrows to advance to the next picture per project. "
        systemAnchor="projects"
      />

      <div className="mt-10">
        <ProjectWheel
          items={projectSlots}
          getKey={(project) => project.id}
          label="Projects"
          renderItem={(project, { active }) => (
            <ProjectCard project={project} active={active} />
          )}
        />
      </div>
    </section>
  );
}
