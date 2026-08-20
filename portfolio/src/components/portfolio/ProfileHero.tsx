import { ArrowDown, FilePdf } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { highlightLines } from "@/components/hero/codeHighlight";

const code = `struct Profile {
    name: "Caleb Standfield",
    degree: "B.S. Computer Science",
    school: "University of Utah",
    graduating: "Dec 2026",
}`;

export function ProfileHero() {
  const reduceMotion = useReducedMotion();
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
          // software engineer in progress
        </p>
        <h1 className="mt-4 max-w-3xl font-heading text-4xl font-semibold leading-[1.04] tracking-[-0.045em] text-ink-text sm:text-5xl lg:text-[3.2rem] xl:text-6xl">
          Computer science student building practical software in Rust, C++,
          and TypeScript.
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-muted-line sm:text-lg">
          I&apos;m Caleb Standfield, a University of Utah student graduating in
          December 2026. I enjoy systems work, developer tools, and making
          complicated software easier to use.
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

      <motion.article
        className="mt-10 max-w-[46rem] overflow-hidden rounded-2xl border border-orange/45 bg-[#0E1116] shadow-[0_30px_80px_-44px_#000]"
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
          <span className="rounded-md border border-orange/40 px-2 py-1 font-mono text-[0.62rem] tracking-[0.16em] text-orange">
            READ ONLY
          </span>
        </header>

        <div className="p-4 sm:p-5">
          <div className="relative h-[250px] overflow-hidden rounded-xl border border-orange/35 sm:h-[300px] lg:h-[280px] xl:h-[330px]">
            <img
              src="/pfp.jpg"
              alt="Caleb Standfield"
              className="h-full w-full object-cover object-[50%_43%]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 px-4 py-3">
              <span className="font-mono text-xs tracking-wide text-ink-text">
                Caleb Standfield
              </span>
              <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-orange">
                CS @ Utah
              </span>
            </div>
          </div>
        </div>

        <pre className="overflow-x-auto border-t border-muted-line/20 px-4 py-4 font-mono text-[0.7rem] leading-relaxed sm:px-5 sm:text-xs">
          <code>
            {lines.map((spans, index) => (
              <span key={index} className="block">
                {spans.length ? spans : " "}
              </span>
            ))}
          </code>
        </pre>
      </motion.article>
    </section>
  );
}
