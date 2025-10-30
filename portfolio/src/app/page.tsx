// app/page.tsx
"use client";

import { useState, useEffect } from "react";
import GalaxyCanvas from "@/components/GalaxyCanvas";

export default function Home() {
  const [liftUp, setLiftUp] = useState(false);

  useEffect(() => {
    // Delay the upward motion slightly so it feels natural
    const timer = setTimeout(() => setLiftUp(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="relative min-h-screen bg-black text-white overflow-x-hidden">
    {/* Wrap everything that should lift together */}
    <div
      className={`transition-transform duration-2000 ease-out ${
        liftUp ? "-translate-y-24" : "translate-y-0"
      }`}
    >
      {/* Galaxy Canvas */}
      <GalaxyCanvas />

      {/* Glow behind CS */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-[500px] h-[500px] bg-white/10 blur-[150px] rounded-full animate-pulse" />
      </div>

      {/* CS text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <h1 className="text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">
          CS
        </h1>
        <p className="mt-6 text-gray-400 text-base uppercase tracking-[0.4em] backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl">
          Caleb Standfield • Computer Science
        </p>
      </div>
    </div>

    {/* Projects section below */}
      <section
        className={`flex flex-col items-center justify-center min-h-screen transition-opacity duration-2000 ${
          liftUp ? "opacity-100" : "opacity-0"
        }`}
      >
        <h2 className="text-5xl font-bold mb-6">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
          {/* Project cards */}
        </div>
      </section>
    </main>
  );
}