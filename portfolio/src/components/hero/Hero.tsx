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
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(rgba(150,124,96,0.5) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 60%, transparent 100%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 90% 80% at 50% 40%, #000 60%, transparent 100%)",
        }}
      />

      <div className="relative z-10">
        <SystemDiagram />
      </div>
    </motion.section>
  );
}
