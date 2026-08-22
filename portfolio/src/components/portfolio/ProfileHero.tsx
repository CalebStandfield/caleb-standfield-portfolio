import { ArrowDown, CaretDown, FilePdf } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { highlightLines } from "@/components/hero/codeHighlight";
import { cn } from "@/lib/utils";
import { Highlight } from "./Highlight";
import { useTypedCode } from "./useTypedCode";

const code = `struct Profile {
    name: "Caleb Standfield",
    degree: "B.S. Computer Science",
    minor: "Japanese",
    school: "University of Utah",
    graduating: "Dec 2026",
    recent_work: "Adobe 2026 internship",
}`;

export function ProfileHero() {
  const reduceMotion = useReducedMotion();
  const { open, expanded, lineEls, caretEls, toggle } = useTypedCode(
    code,
    true,
  );
  const lines = highlightLines(code, "rust");

  return (
    <section
      id="home"
      data-stage="hero"
      className="flex min-h-screen scroll-mt-24 flex-col justify-center py-28 lg:min-h-[960px] lg:py-32 xl:min-h-screen"
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: "easeOut" }}
      >
        <p
          className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange"
          data-system-anchor="hero"
        >
          // learning to create, and creating to learn
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-3xl font-semibold leading-[1.08] tracking-[-0.04em] text-ink-text sm:text-4xl lg:text-[2.6rem] xl:text-5xl">
          Curiosity into creation.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-line sm:text-base sm:leading-7">
          I'm Caleb Standfield, a University of Utah student graduating in
          December 2026. I have worked across backend, full-stack, systems, and
          data-focused projects, using languages and tools that fit the problem.
          I recently completed an internship at{" "}
          <Highlight>Adobe</Highlight>.
        </p>

        <div className="mt-7 flex flex-wrap gap-3">
          <a
            href="#projects"
            className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange px-5 font-mono text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            View projects
            <ArrowDown size={17} weight="bold" />
          </a>
          <a
            href="#resume"
            className="inline-flex h-11 items-center gap-2 rounded-lg border border-muted-line/35 bg-surface/70 px-5 font-mono text-sm font-semibold text-ink-text transition-colors hover:border-orange/60 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
          >
            Resume
            <FilePdf size={17} weight="bold" />
          </a>
        </div>
      </motion.div>

      <div
        className="mt-10 max-w-[46rem]"
        data-profile-project-source
        data-profile-project-expanded={expanded}
      >
        <motion.article
          className="overflow-hidden rounded-2xl border border-orange/45 bg-[#0E1116] shadow-[0_30px_80px_-44px_#000]"
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: reduceMotion ? 0 : 0.16 }}
        >
          <header className="flex items-center justify-between gap-4 border-b border-muted-line/20 px-4 py-3.5 sm:px-5">
            <div>
              <p className="font-mono text-sm font-semibold text-ink-text">
                profile.rs
              </p>
              <p className="mt-0.5 text-xs text-muted-line">
                Profile domain service
              </p>
            </div>
            <button
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls="profile-struct"
              aria-label={
                open ? "Collapse profile struct" : "Expand profile struct"
              }
              className="flex size-7 shrink-0 items-center justify-center rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
            >
              <motion.span
                animate={{ rotate: open ? 0 : -90 }}
                transition={{
                  duration: reduceMotion ? 0 : 0.25,
                  ease: "easeOut",
                }}
                className="flex"
              >
                <CaretDown
                  size={14}
                  weight="bold"
                  className={cn("text-muted-line", open && "text-orange")}
                />
              </motion.span>
            </button>
          </header>

          <div className="p-4 sm:p-5">
            <div className="relative h-[250px] overflow-hidden rounded-xl border border-orange/35 sm:h-[300px] lg:h-[280px] xl:h-[330px]">
              <img
                src="/pfp.jpg"
                alt="Caleb Standfield"
                className="h-full w-full object-cover object-[50%_43%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
            </div>
          </div>

          <div
            id="profile-struct"
            className="grid transition-[grid-template-rows] duration-300 ease-out"
            style={{ gridTemplateRows: expanded ? "1fr" : "0fr" }}
          >
            <div className="min-h-0 overflow-hidden">
              <pre className="overflow-x-auto border-t border-muted-line/20 px-4 py-4 font-mono text-[0.7rem] leading-relaxed sm:px-5 sm:text-xs">
                <code>
                  {lines.map((spans, index) => (
                    <span
                      key={index}
                      className="relative block min-h-[1em] w-fit whitespace-pre"
                    >
                      <span
                        ref={(element) => {
                          lineEls.current[index] = element;
                        }}
                        className="block"
                      >
                        {spans.length ? spans : " "}
                      </span>
                      <span
                        ref={(element) => {
                          caretEls.current[index] = element;
                        }}
                        aria-hidden
                        className="pointer-events-none absolute top-[0.12em] left-0"
                        style={{ opacity: 0 }}
                      >
                        <span className="caret-blink block h-[0.95em] w-[2px] bg-orange" />
                      </span>
                    </span>
                  ))}
                </code>
              </pre>
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
