import {
  ArrowUpRight,
  EnvelopeSimple,
  GithubLogo,
  LinkedinLogo,
} from "@phosphor-icons/react";

import { SectionHeading } from "./SectionHeading";

const links = [
  {
    label: "Email",
    value: "CalebJStandfield@gmail.com",
    href: "mailto:CalebJStandfield@gmail.com",
    Icon: EnvelopeSimple,
  },
  {
    label: "GitHub",
    value: "github.com/CalebStandfield",
    href: "https://github.com/CalebStandfield",
    Icon: GithubLogo,
  },
  {
    label: "LinkedIn",
    value: "linkedin.com/in/caleb-standfield",
    href: "https://www.linkedin.com/in/caleb-standfield/",
    Icon: LinkedinLogo,
  },
];

export function ContactSection() {
  return (
    <section
      id="contact"
      data-stage="contact"
      className="flex min-h-[70vh] scroll-mt-24 flex-col justify-center py-24 sm:py-28"
    >
      <SectionHeading
        eyebrow="contact"
        title="Let's build something useful."
        description="The fastest way to reach me is email. You can also find the code and the longer work history below."
        systemAnchor="contact"
      />

      <div className="mt-10 grid gap-3">
        {links.map(({ label, value, href, Icon }) => (
          <a
            key={label}
            href={href}
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
            className="group flex items-center gap-4 rounded-xl border border-muted-line/20 bg-surface/45 px-4 py-4 transition-colors hover:border-orange/45"
          >
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-orange/10 text-orange">
              <Icon size={20} weight="bold" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block font-mono text-[0.64rem] uppercase tracking-[0.16em] text-muted-line">
                {label}
              </span>
              <span className="mt-0.5 block truncate text-sm text-ink-text">
                {value}
              </span>
            </span>
            <ArrowUpRight
              size={18}
              className="shrink-0 text-muted-line transition-colors group-hover:text-orange"
            />
          </a>
        ))}
      </div>

      <p className="mt-16 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-muted-line/65">
        Built with React, TypeScript, and an unreasonable appreciation for Rust.
      </p>
    </section>
  );
}
