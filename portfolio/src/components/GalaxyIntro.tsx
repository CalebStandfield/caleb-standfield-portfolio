// components/GalaxyIntro.tsx
"use client";
import React, { useEffect, useState } from "react";
import GalaxyCanvas from "./GalaxyBackground";

const GalaxyIntro: React.FC = () => {
  const [slideUp, setSlideUp] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setSlideUp(true), 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative overflow-hidden min-h-screen bg-black text-white">
      <div
        className={`transition-transform duration-2000 ease-in-out ${
          slideUp ? "-translate-y-full" : "translate-y-0"
        }`}
      >
        <GalaxyCanvas />
      </div>

      {/* Content below galaxy */}
      <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center">
        <div
          className={`transition-opacity duration-1000 ${
            slideUp ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="text-5xl mb-6 font-bold tracking-wide">My Projects</h1>
          <p className="text-lg max-w-xl text-gray-300 text-center">
            Explore the software I’ve built — from simulations to backend
            systems, all crafted with precision and creativity.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GalaxyIntro;
