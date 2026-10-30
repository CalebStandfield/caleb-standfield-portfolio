import { ArrowDown, CaretDown, FilePdf } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { highlightLines } from "@/components/hero/codeHighlight";
import { cn } from "@/lib/utils";
import { Highlight } from "./Highlight";
import { ResponsiveImage } from "./ResponsiveImage";
import { useTypedCode } from "./useTypedCode";

const code = `struct Profile {
    name: "Caleb Standfield",
    degree: "B.S. Computer Science",
    minor: "Japanese",
    certificate: "Data Science",
    school: "University of Utah",
    graduating: "Dec 2026",
    recent_work: "Adobe LLM pipeline",
}`;

// the snippet is fixed, so tokenize once at load instead of every render
const lines = highlightLines(code, "rust");

// portrait source, cropped to a circle
const PORTRAIT_SRC = "/pfp.jpg";

// circular housing: a tick-mark dial, an orange ring, a dark gap, then the photo
function ProfilePortrait() {
  return (
    <div className="relative size-56 shrink-0 sm:size-60 lg:size-64 xl:size-80">
      <div
        aria-hidden
        className="absolute -inset-3 rounded-full bg-[repeating-conic-gradient(var(--color-orange)_0_1deg,transparent_1deg_6deg)] opacity-40 [mask:radial-gradient(closest-side,transparent_calc(100%-7px),#000_calc(100%-6px))]"
      />
      <div className="size-full rounded-full border border-orange/50 p-2 shadow-[0_0_60px_-14px_var(--color-orange)]">
        <div className="size-full overflow-hidden rounded-full border border-muted-line/30 bg-surface">
          <ResponsiveImage
            src={PORTRAIT_SRC}
            alt="Caleb Standfield"
            sizes="(min-width: 1280px) 20rem, 16rem"
            fetchPriority="high"
            className="size-full object-cover object-[50%_30%]"
          />
        </div>
      </div>
    </div>
  );
}

export function ProfileHero() {
  const reduceMotion = useReducedMotion();
  const { open, expanded, lineEls, caretEls, toggle } = useTypedCode(
    code,
    true,
  );

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

        <div className="mt-8 flex flex-wrap gap-3">
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
        className="mt-12"
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
              aria-label={open ? "Collapse profile struct" : "Expand profile struct"}
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

          {/* portrait and the about column sit side by side on sm+. only the
              struct folds; as it closes the row shrinks toward the about text
              and items-center keeps the photo level with it. */}
          <div className="flex flex-col sm:grid sm:grid-cols-[auto_1fr] sm:items-center">
            <div className="flex items-center justify-center p-8 lg:p-10">
              <ProfilePortrait />
            </div>

            <div className="flex min-w-0 flex-col justify-center border-t border-muted-line/20 p-6 sm:self-stretch sm:border-t-0 sm:border-l sm:p-8 lg:p-10">
              <p className="font-mono text-[0.68rem] uppercase tracking-[0.22em] text-orange">
                // about
              </p>
              <p className="mt-3 max-w-xl text-sm leading-7 text-ink-text/80 sm:text-[0.95rem]">
                I'm Caleb Standfield, a new grad software engineer finishing CS
                at the University of Utah in December 2026, with a Japanese
                minor and a Data Science Certificate. I work full stack, from
                the database to the UI. As an intern at{" "}
                <Highlight>Adobe</Highlight> I built an LLM code migration
                pipeline and the review UI around it.
              </p>

              <div
                id="profile-struct"
                data-expanded={expanded}
                className="grid grid-rows-[0fr] transition-[grid-template-rows] duration-300 ease-out data-[expanded=true]:grid-rows-[1fr] sm:duration-500 sm:ease-[cubic-bezier(.2,.7,.2,1)]"
              >
                <div
                  className={cn(
                    "min-h-0 min-w-0 overflow-hidden transition-opacity duration-200",
                    expanded ? "opacity-100 delay-300" : "opacity-0 duration-150",
                  )}
                >
                  <pre className="mt-6 overflow-x-auto rounded-xl border border-muted-line/20 bg-ink/60 px-4 py-4 font-mono text-[0.7rem] leading-relaxed sm:text-xs">
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
            </div>
          </div>
        </motion.article>
      </div>
    </section>
  );
}
