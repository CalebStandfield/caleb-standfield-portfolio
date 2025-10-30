"use client";

import { useState, useEffect } from "react";
import GalaxyCanvas from "@/components/GalaxyCanvas";

export default function Home() {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <main className="relative min-h-[200vh] bg-black text-white overflow-x-hidden">
      {/* Hero + Galaxy */}
      <div
        className="relative min-h-screen"
        style={{
          transform: `translateY(${Math.min(scrollY * -0.2, -100)}px)`,
          transition: "transform 0.1s linear",
        }}
      >
        {/* Galaxy Canvas */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <GalaxyCanvas />
        </div>

        {/* Glow behind CS */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[500px] h-[500px] bg-white/10 blur-[150px] rounded-full animate-pulse" />
        </div>

        {/* CS logo */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">
            CS
          </h1>
          <p className="mt-6 text-gray-400 text-base uppercase tracking-[0.4em] backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl">
            Caleb Standfield • Computer Science
          </p>
        </div>
      </div>

      {/* Projects Section */}
      <section className="flex flex-col items-center justify-start min-h-screen pt-32">
        <h2 className="text-5xl font-bold mb-12">Projects</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
          <div className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-xl font-semibold">Blackjack Trainer</h3>
            <p className="text-gray-400 mt-2">Qt + C++ MVC Game</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-xl font-semibold">Rust Backend API</h3>
            <p className="text-gray-400 mt-2">High-performance API in Rust</p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition">
            <h3 className="text-xl font-semibold">Other Project</h3>
            <p className="text-gray-400 mt-2">Description here</p>
          </div>
        </div>
      </section>
    </main>
  );
}