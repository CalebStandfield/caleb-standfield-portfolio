"use client";

import SpinningYinYang from "../components/YinYang";

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden text-white bg-linear-to-br from-[#0b0b0b] via-[#1a1a1a] to-[#2b2b2b]">
      {/* Subtle vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.07)_0%,rgba(0,0,0,0.9)_100%)] pointer-events-none" />

      {/* === NAVBAR === */}
      <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-md bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-wide text-white">
            Caleb Standfield ・ CS ・ Computer Science
          </h1>

          <ul className="flex gap-8 text-sm uppercase tracking-widest text-gray-300">
            <li className="hover:text-white transition-colors duration-300 cursor-pointer">
              About
            </li>
            <li className="hover:text-white transition-colors duration-300 cursor-pointer">
              Projects
            </li>
            <li className="hover:text-white transition-colors duration-300 cursor-pointer">
              Resume Download
            </li>
            <li className="hover:text-white transition-colors duration-300 cursor-pointer">
              Contact
            </li>
          </ul>
        </div>
      </nav>

      {/* === MAIN CONTENT === */}
      <div className="grid grid-cols-1 lg:grid-cols-2 h-screen">
        {/* LEFT SIDE — Text */}
        <div className="flex flex-col justify-center pl-16 pr-8">
          <div className="mt-24">
            {" "}
            {/* margin to clear navbar */}
            <h1 className="text-7xl font-extrabold leading-tight tracking-tight text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.15)]">
              Caleb
              <br />
              Standfield
            </h1>
            <div className="mt-4 h-[3px] w-24 bg-linear-to-r from-white to-gray-400 rounded-full" />
            <p className="mt-6 text-lg text-white relative isolate">
              University of Utah
            </p>
            <p className="mt-4 text-gray-300 max-w-lg">
              Passionate about crafting elegant code and innovative solutions
              that drive progress in technology.
            </p>
            <div className="mt-12 text-xs uppercase tracking-[0.4em] text-gray-400">
              Scroll Down
            </div>
          </div>
        </div>

        {/* RIGHT SIDE — Glowing Orb with Yin-Yang */}
        <div className="relative flex items-center justify-center">
          <div className="relative w-[440px] h-[440px] rounded-full bg-linear-to-b from-white to-[#f4f4f4] shadow-[0_0_100px_40px_rgba(255,255,255,0.5)] flex items-center justify-center animate-orb-pulse overflow-hidden">
            {/* halo */}
            <div className="absolute -inset-20 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.45)_0%,rgba(255,255,255,0)_70%)]" />

            {/* Yin-Yang */}
            <div className="spin-wrapper relative flex items-center justify-center">
              <SpinningYinYang />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
