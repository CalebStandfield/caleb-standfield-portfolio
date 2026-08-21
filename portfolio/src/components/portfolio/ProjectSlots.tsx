import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, GithubLogo, Globe, ImageSquare } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { cn } from "@/lib/utils";
import { projectSlots } from "./portfolio.config";
import { SectionHeading } from "./SectionHeading";
import type { ProjectData } from "./portfolio.types";

export function ProjectSlots() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="projects"
      data-stage="projects"
      className="scroll-mt-0 py-24 sm:py-28 lg:py-32"
    >
      <SectionHeading
        eyebrow="selected work"
        title="Projects"
        description="A framework for the work worth discussing. Finished projects lead; active work follows."
        systemAnchor="projects"
      />

      <div className="mt-10 space-y-6">
        {projectSlots.map((project, index) => (
          <div key={project.id} data-profile-project-target={project.id}>
            <ProjectSlot
              project={project}
              index={index}
              animate={!reduceMotion}
            />
          </div>
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
  const inProgress = project.status === "in_progress";
  const statusLabel = inProgress ? "Currently working on" : "Complete";
  const statusClass = inProgress ? "text-amber" : "text-emerald";
  const title = project.title || project.placeholderTitle;
  const tags = project.tags.length > 0 ? project.tags : PLACEHOLDER_TAGS;

  return (
    <motion.article
      className="overflow-hidden rounded-2xl border border-muted-line/25 bg-surface/55"
      initial={animate ? { opacity: 0, y: 12 } : false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.45, delay: animate ? index * 0.06 : 0 }}
    >
      <header className="flex items-center justify-between gap-4 border-b border-muted-line/20 px-5 py-4 sm:px-7 sm:py-5">
        <h3 className="min-w-0 truncate font-mono text-2xl font-bold text-ink-text sm:text-3xl">
          {title}
        </h3>
        <span
          className={cn(
            "flex shrink-0 items-center gap-2 font-mono text-[0.64rem] uppercase tracking-[0.2em]",
            statusClass,
          )}
        >
          <span className="size-2 rounded-full bg-current shadow-[0_0_8px_currentColor]" />
          {statusLabel}
        </span>
      </header>

      <div className="grid gap-0 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="flex min-h-[20rem] items-center justify-center border-b border-muted-line/20 p-5 lg:border-r lg:border-b-0">
          {project.images[0] ? (
            <img
              src={project.images[0]}
              alt={`${title} preview`}
              className="aspect-video w-full rounded-lg border border-muted-line/20 object-cover"
            />
          ) : (
            <div className="flex size-full min-h-[16rem] flex-col items-center justify-center rounded-xl border border-dashed border-muted-line/30 text-muted-line/65">
              <ImageSquare size={32} weight="thin" />
              <span className="mt-2 font-mono text-[0.68rem] uppercase tracking-[0.22em]">
                Project image
              </span>
            </div>
          )}
        </div>

        <div className="flex min-h-[20rem] min-w-0 flex-col">
          <TagCarousel tags={tags} />

          <div className="flex flex-1 flex-col px-6 py-6 sm:px-7">
            <p className="font-mono text-sm leading-7 text-muted-line">
              {project.summary ||
                "Add a concise problem, contribution, and result."}
            </p>

            {(project.repositoryUrl || project.demoUrl) && (
              <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
                {project.repositoryUrl && (
                  <a
                    href={project.repositoryUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="project-link flex-1 justify-between"
                  >
                    <span className="flex items-center gap-2.5">
                      <GithubLogo size={18} weight="fill" />
                      <span className="uppercase tracking-[0.16em]">Github</span>
                    </span>
                    <ArrowUpRight size={16} weight="bold" />
                  </a>
                )}
                {project.demoUrl && (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "project-link flex-1 justify-between",
                      inProgress ? "project-link--amber" : "project-link--emerald",
                    )}
                  >
                    <span className="flex items-center gap-2.5">
                      <Globe size={18} weight="bold" />
                      <span className="uppercase tracking-[0.16em]">Visit</span>
                    </span>
                    <ArrowUpRight size={16} weight="bold" />
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}

// Shown in the carousel when a project has no real tags yet, so every card
// keeps the same layout. Replace by filling `tags` in portfolio.config.
const PLACEHOLDER_TAGS = ["Tag one", "Tag two", "Tag three"];

const SPIN_SPEED = 32; // px/sec, gentle continuous drift
const HOLD_MS = 4000; // how long a focused pill stays centered
const FOCUS_EASE_MS = 650; // time to glide a pill to the middle

function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Squircle tag pills on an endless carousel. The strip is a seamless loop of
// repeated tag sets that drifts left forever. Clicking or hovering a pill eases
// that pill to the middle, holds it highlighted for a beat, then releases and
// resumes the drift. No start, no end, no arrows.
function TagCarousel({ tags }: { tags: string[] }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const posRef = useRef(0); // current translateX, always <= 0 after wrap
  const singleRef = useRef(0); // width of one tag set (incl. trailing gap)
  const focusRef = useRef<{ from: number; to: number; start: number } | null>(
    null,
  );
  const holdUntilRef = useRef(0);
  const [sets, setSets] = useState(3);
  const [focused, setFocused] = useState<number | null>(null); // rendered index

  useLayoutEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      const viewport = viewportRef.current;
      if (!track || !viewport) return;
      const secondSet = track.children[tags.length] as HTMLElement | undefined;
      const single = secondSet
        ? secondSet.offsetLeft
        : track.scrollWidth / sets;
      singleRef.current = single;
      if (single > 0) {
        // Grow-only so this converges; enough copies to cover the viewport
        // plus one set of headroom while wrapping.
        const needed = Math.min(
          12,
          Math.max(2, Math.ceil((viewport.clientWidth + single) / single) + 1),
        );
        if (needed > sets) setSets(needed);
      }
    };
    measure();
    const observer = new ResizeObserver(measure);
    if (viewportRef.current) observer.observe(viewportRef.current);
    void document.fonts.ready.then(measure);
    return () => observer.disconnect();
  }, [tags.length, sets]);

  useEffect(() => {
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const single = singleRef.current;
      if (single > 0) {
        const dt = last ? (now - last) / 1000 : 0;
        last = now;

        if (focusRef.current) {
          // easing a pill to center: use absolute pos, never wrap (wrapping
          // would slide the highlighted pill off-center onto another copy)
          const f = focusRef.current;
          const t = Math.min(1, (now - f.start) / FOCUS_EASE_MS);
          posRef.current = f.from + (f.to - f.from) * easeInOut(t);
          if (t >= 1) {
            focusRef.current = null;
            holdUntilRef.current = now + HOLD_MS;
          }
        } else if (holdUntilRef.current && now < holdUntilRef.current) {
          // holding the focused pill in place, still no wrap
        } else {
          if (holdUntilRef.current) {
            holdUntilRef.current = 0;
            setFocused(null);
          }
          posRef.current -= SPIN_SPEED * dt;
          // only wrap during the free spin, where every copy is identical
          while (posRef.current <= -single) posRef.current += single;
          while (posRef.current > 0) posRef.current -= single;
        }

        if (trackRef.current) {
          trackRef.current.style.transform = `translateX(${posRef.current}px)`;
        }
      } else {
        last = now;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const select = useCallback(
    (element: HTMLElement, renderedIndex: number) => {
      const viewport = viewportRef.current;
      if (!viewport || !singleRef.current) return;

      // clicking the selected pill again unselects it and resumes the spin,
      // exactly like the hold timing out on its own.
      if (focused === renderedIndex) {
        focusRef.current = null;
        holdUntilRef.current = 0;
        setFocused(null);
        return;
      }

      // otherwise select (or switch to) this pill: glide it to the middle.
      // on-screen center = offsetLeft + pos, so the pos that centers it is
      // (viewportCenter - pillCenter). A clicked pill is always visible, so the
      // travel stays short.
      const pillCenter = element.offsetLeft + element.offsetWidth / 2;
      focusRef.current = {
        from: posRef.current,
        to: viewport.clientWidth / 2 - pillCenter,
        start: performance.now(),
      };
      holdUntilRef.current = 0;
      setFocused(renderedIndex);
    },
    [focused],
  );

  const rendered = Array.from({ length: sets }, (_, copy) =>
    tags.map((tag, tagIndex) => ({
      tag,
      renderedIndex: copy * tags.length + tagIndex,
    })),
  ).flat();

  return (
    <div className="min-w-0 border-b border-muted-line/20 px-4 py-3.5 sm:px-5">
      <div
        ref={viewportRef}
        className="relative min-w-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_7%,#000_93%,transparent)]"
      >
        <div ref={trackRef} className="flex w-max gap-2">
          {rendered.map(({ tag, renderedIndex }) => {
            const isFocused = renderedIndex === focused;
            return (
              <button
                key={renderedIndex}
                type="button"
                aria-hidden={renderedIndex >= tags.length}
                onClick={(event) => select(event.currentTarget, renderedIndex)}
                className={cn(
                  "shrink-0 cursor-pointer rounded-[0.7rem] border px-3 py-1.5 font-mono text-[0.62rem] uppercase tracking-[0.16em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange",
                  isFocused
                    ? "border-orange/70 bg-orange/15 text-orange"
                    : "border-muted-line/25 bg-surface/40 text-muted-line hover:text-ink-text",
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
