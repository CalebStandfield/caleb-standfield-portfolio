import { ArrowUpRight, DownloadSimple, FilePdf } from "@phosphor-icons/react";
import { motion, useReducedMotion } from "motion/react";

import { Highlight } from "./Highlight";
import { resume } from "./portfolio.config";
import { SectionHeading } from "./SectionHeading";

const RESUME_URL = "/Caleb_Standfield_Resume.pdf";

export function ResumeSection() {
  const reduceMotion = useReducedMotion();

  return (
    <section
      id="resume"
      data-stage="resume"
      className="scroll-mt-0 py-24 sm:py-28 lg:py-32"
    >
      <SectionHeading
        eyebrow="resume"
        title="Education and technical range"
        description="Key points from my resume, full resume viewable or downloadable below."
        systemAnchor="resume"
      />

      <motion.div
        className="mt-10 overflow-hidden rounded-2xl border border-muted-line/25 bg-surface/55"
        initial={reduceMotion ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.45 }}
      >
        <div className="border-b border-muted-line/20 p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="font-heading text-xl font-semibold text-ink-text">
                {resume.education.school}
              </p>
              <p className="font-bold text-1xl text-orange">
                {resume.education.degree}
              </p>
            </div>
            <p className="font-mono text-xs text-ink-text">
              {resume.education.location}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            {resume.education.details.map((detail) => (
              <span key={detail} className="resume-chip text-ink-text">
                {detail}
              </span>
            ))}
            <span className="resume-chip text-cyan">
              {resume.education.graduation}
            </span>
            <span className="resume-chip text-orange">
              {resume.education.gpa}
            </span>
          </div>
        </div>

        <div className="divide-y divide-muted-line/15">
          {resume.skills.map((group) => (
            <div
              key={group.label}
              className="grid gap-3 p-5 sm:grid-cols-[9rem_1fr] sm:p-6"
            >
              <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-orange">
                {group.label}
              </h3>
              <p className="text-sm leading-6 text-muted-line">
                {group.values.join(" / ")}
              </p>
            </div>
          ))}
          <div className="grid gap-3 p-5 sm:grid-cols-[9rem_1fr] sm:p-6">
            <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-orange">
              Work Experience
            </h3>
            <p className="text-sm leading-6 text-muted-line">
              <Highlight>{resume.work}</Highlight>
            </p>
          </div>
        </div>
      </motion.div>

      <div className="mt-6 flex flex-wrap gap-3">
        <a
          href={RESUME_URL}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-11 items-center gap-2 rounded-lg bg-orange px-5 font-mono text-sm font-semibold text-ink transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <FilePdf size={17} weight="bold" />
          View PDF
          <ArrowUpRight size={15} weight="bold" />
        </a>
        <a
          href={RESUME_URL}
          download
          className="inline-flex h-11 items-center gap-2 rounded-lg border border-muted-line/35 bg-surface/70 px-5 font-mono text-sm font-semibold text-ink-text transition-colors hover:border-orange/60 hover:text-orange focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange"
        >
          <DownloadSimple size={17} weight="bold" />
          Download resume
        </a>
      </div>
    </section>
  );
}
