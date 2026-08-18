import { motion } from "motion/react";
import { GithubLogo, LinkedinLogo } from "@phosphor-icons/react";

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
    <main className="relative min-h-screen bg-black text-white">
      <nav className="fixed left-0 top-0 z-50 w-full border-b border-white/10 bg-black/40 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <a href="#home">
            <h1 className="text-sm font-bold tracking-wide sm:text-base md:text-xl">
              Caleb Standfield ・ CS ・ Computer Science
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
                className="text-gray-300 transition-transform duration-300 hover:scale-125 hover:text-white"
              >
                <Icon size={32} weight="fill" />
              </a>
            ))}
          </div>
        </div>
      </nav>

      <motion.section
        id="home"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="min-h-screen bg-black"
      />
    </main>
  );
}
