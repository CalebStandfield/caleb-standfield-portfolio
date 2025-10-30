"use client";
import { useEffect, useRef, useState } from "react";

class Particle {
      radiusX: number;
      radiusY: number;
      angle: number;
      speed: number;
      size: number;
      constructor(radiusX: number, radiusY: number) {
        this.radiusX = radiusX;
        this.radiusY = radiusY;
        this.angle = Math.random() * Math.PI * 2;
        this.speed = 0.002 + Math.random() * 0.002;
        this.size = Math.random() * 1.5 + 0.3;
      }
      update() {
        this.angle += this.speed;
      }
      getPosition(cx: number, cy: number) {
        return {
          x: cx + Math.cos(this.angle) * this.radiusX,
          y: cy + Math.sin(this.angle) * this.radiusY,
        };
      }
    }

export default function Home() {
  const [showIntro, setShowIntro] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4000); // fade after 4s
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);
    const centerX = w / 2;
    const centerY = h / 2;
    let animationId: number;

  

    // --- Setup particles ---
    const ringA: Particle[] = [];
    const ringB: Particle[] = [];
    const stars: { x: number; y: number; size: number; color: string }[] = [];

    const ringCount = 800;
    for (let i = 0; i < ringCount; i++) {
      ringA.push(new Particle(500 + Math.random() * 20, 150 + Math.random() * 20));
      ringB.push(new Particle(500 + Math.random() * 20, 150 + Math.random() * 20));
    }

    const starCount = 500;
    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.1,
        color: `hsla(${Math.random() * 360}, 80%, 80%, 0.5)`,
      });
    }

    const angle45 = Math.PI / 4;
    const cos45 = Math.cos(angle45);
    const sin45 = Math.sin(angle45);

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(0, 0, w, h);

      // draw stars
      for (const s of stars) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.fill();
      }

      // ring A (horizontal)
      for (const p of ringA) {
        p.update();
        const { x, y } = p.getPosition(centerX, centerY);
        ctx.beginPath();
        ctx.arc(x, y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      // ring B (rotated 45°)
      for (const p of ringB) {
        p.update();
        const { x, y } = p.getPosition(centerX, centerY);
        const dx = x - centerX;
        const dy = y - centerY;
        const rotatedX = centerX + dx * cos45 - dy * sin45;
        const rotatedY = centerY + dx * sin45 + dy * cos45;
        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
      }

      animationId = requestAnimationFrame(animate);
    };

    animate();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* --- Galaxy Intro --- */}
      <div
        className={`absolute inset-0 transition-opacity duration-2000 ${
          showIntro ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <h1 className="text-[10rem] font-extrabold tracking-tight text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.3)] select-none">
            CS
          </h1>
          <p className="mt-6 text-gray-400 text-base uppercase tracking-[0.4em] backdrop-blur-sm bg-white/5 px-4 py-2 rounded-xl">
            Caleb Standfield • Computer Science
          </p>
        </div>
      </div>

      {/* --- Portfolio Content --- */}
      <div
        className={`transition-opacity duration-2000 ${
          showIntro ? "opacity-0" : "opacity-100"
        }`}
      >
        <section className="flex flex-col items-center justify-center min-h-screen">
          <h2 className="text-5xl font-bold mb-6">Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-8">
            <div className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition">
              <h3 className="text-xl font-semibold">Blackjack Trainer</h3>
              <p className="text-gray-400 mt-2">Qt + C++ MVC Game</p>
            </div>
            <div className="bg-white/5 p-6 rounded-2xl hover:bg-white/10 transition">
              <h3 className="text-xl font-semibold">Rust Backend API</h3>
              <p className="text-gray-400 mt-2">High-performance API in Rust</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}