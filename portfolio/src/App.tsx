import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

import { Hero } from "@/components/hero/Hero";

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
  return (
    <main className="relative min-h-screen bg-ink text-ink-text">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-muted-line/20 bg-ink/60 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <a href="#home">
            <h1 className="font-mono text-sm tracking-wide sm:text-base md:text-lg">
              <span className="text-orange">caleb</span>
              <span className="text-muted-line">::</span>
              <span className="text-ink-text">standfield</span>
              <span className="text-muted-line"> // CS @ Utah</span>
            </h1>
          </a>

          <div className="flex items-center gap-6">
            {socials.map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                title={label}
                aria-label={label}
                className="text-muted-line transition-all duration-300 hover:scale-110 hover:text-orange"
              >
                <Icon size={28} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </nav>

      <Hero />
    </main>
  );
}
