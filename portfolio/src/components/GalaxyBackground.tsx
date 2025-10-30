"use client";
import { useEffect, useRef } from "react";

const GalaxyBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const starCount = 500;
    const stars: {
      x: number;
      y: number;
      baseSize: number;
      twinkleSpeed: number;
      hue: number;
    }[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseSize: Math.random() * 1.05 + 0.3,
        twinkleSpeed: Math.random() * 0.025 + 0.01,
        hue: 40 + Math.random() * 20, // gold hue range
      });
    }

    const handleResize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      stars.forEach((s, idx) => {
        const twinkle =
          Math.sin(Date.now() * 0.002 * s.twinkleSpeed * 50 + idx) * 0.5 + 0.5;
        const radius = s.baseSize * (0.5 + twinkle);

        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${s.hue}, 80%, ${40 + twinkle * 60}%, 0.8)`;
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 z-0 pointer-events-none"
    />
  );
};

export default GalaxyBackground;
