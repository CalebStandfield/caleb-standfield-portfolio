import { motion } from "motion/react";

import { SystemDiagram } from "./SystemDiagram";

// Hero: the resume compiled as a Rust service architecture.
export function Hero() {
  return (
    <motion.section
      id="home"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden bg-ink px-4 pt-24 pb-20 sm:px-8"
      style={{ background: "#0A0A0C" }}
    >
      {/* faint dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            "radial-gradient(rgba(120,96,74,0.35) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 60%, transparent 100%)",
        }}
      />

      {/* header row: terminal line + legend */}
      <div className="relative z-10 mx-auto mb-6 flex max-w-[1360px] items-center justify-between gap-4 px-1 font-mono text-xs md:mb-2">
        <div className="flex items-center gap-2 text-muted-line">
          <span className="text-orange">&gt;_</span>
          <span>
            <span className="text-muted-line">$ </span>
            <span className="text-ink-text">cat architecture.rs</span>
            <span className="text-muted-line"> // resume, compiled as a system</span>
          </span>
        </div>
        <div className="hidden items-center gap-4 text-muted-line sm:flex">
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ background: "#FF8F40", boxShadow: "0 0 6px #FF8F40" }}
            />
            RUST SERVICE
          </span>
          <span className="flex items-center gap-1.5">
            <span
              className="size-2 rounded-full"
              style={{ border: "1.5px solid #565B66" }}
            />
            EXTERNAL
          </span>
        </div>
      </div>

      <div className="relative z-10">
        <SystemDiagram />
      </div>
    </motion.section>
  );
}
