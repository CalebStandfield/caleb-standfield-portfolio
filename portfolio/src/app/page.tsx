"use client";
import { useRef } from "react";
import GalaxyBackground from "@/components/GalaxyBackground";
import OrbitRings from "@/components/OrbitRings";

export default function Home() {
  const csRef = useRef<HTMLDivElement>(null);

  return (
    <main className="relative min-h-[200vh] overflow-x-hidden text-white bg-linear-to-br from-black via-[#0a0a0a] to-gray-900">
      {/* Galaxy across entire screen */}
      <GalaxyBackground />

      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-screen relative z-10">
        <div />

        <div className="relative flex flex-col justify-center items-start px-16">
          {/* Orbiting rings (tied to CS) */}
          <OrbitRings targetRef={csRef} />

          {/* CS logo container */}
          <div ref={csRef} className="relative z-20 flex flex-col items-center">
            <h1 className="text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">
              CS
            </h1>
            <p className="mt-6 text-gray-400 text-base uppercase tracking-[0.4em] backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl">
              Caleb Standfield • Computer Science
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
