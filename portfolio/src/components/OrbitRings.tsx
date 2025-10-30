"use client";
import { useEffect, useRef } from "react";

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

  update(reverse = false) {
    this.angle += reverse ? -this.speed : this.speed;
  }

  getPosition(cx: number, cy: number) {
    return {
      x: cx + Math.cos(this.angle) * this.radiusX,
      y: cy + Math.sin(this.angle) * this.radiusY,
    };
  }
}

interface OrbitRingsProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

const OrbitRings: React.FC<OrbitRingsProps> = ({ targetRef }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = canvas.offsetWidth);
    let h = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      w = canvas.width = canvas.offsetWidth;
      h = canvas.height = canvas.offsetHeight;
    };

    const ringA: Particle[] = [];
    const ringB: Particle[] = [];
    const ringCount = 800;

    for (let i = 0; i < ringCount; i++) {
      ringA.push(
        new Particle(500 + Math.random() * 20, 150 + Math.random() * 20)
      );
      ringB.push(
        new Particle(500 + Math.random() * 20, 150 + Math.random() * 20)
      );
    }

    const degUp = 25;
    const degDown = -25;
    const cosUp = Math.cos((degUp * Math.PI) / 180);
    const sinUp = Math.sin((degUp * Math.PI) / 180);
    const cosDown = Math.cos((degDown * Math.PI) / 180);
    const sinDown = Math.sin((degDown * Math.PI) / 180);

    window.addEventListener("resize", handleResize);

    const animate = () => {
      // Fade previous frame slightly instead of fully clearing
      ctx.fillStyle = "rgba(0, 0, 0, 0.15)";
      ctx.fillRect(0, 0, w, h);

      const target = targetRef.current;
      if (!target) {
        requestAnimationFrame(animate);
        return;
      }

      const rect = target.getBoundingClientRect();
      const canvasRect = canvas.getBoundingClientRect();

      const cx = rect.left - canvasRect.left + rect.width / 2;
      const cy = rect.top - canvasRect.top + rect.height / 2;

      // Add a subtle luminous gradient behind the logo
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 700);
      gradient.addColorStop(0, "rgba(255,255,255,0.12)");
      gradient.addColorStop(0.4, "rgba(150,180,255,0.05)");
      gradient.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Set soft glow for stars/particles
      ctx.shadowBlur = 15;
      ctx.shadowColor = "rgba(255,255,255,0.8)";
      ctx.globalAlpha = 0.7;

      // Rings rotation tilt
      const degUp = 25;
      const degDown = -25;
      const cosUp = Math.cos((degUp * Math.PI) / 180);
      const sinUp = Math.sin((degUp * Math.PI) / 180);
      const cosDown = Math.cos((degDown * Math.PI) / 180);
      const sinDown = Math.sin((degDown * Math.PI) / 180);

      // --- RING A ---
      for (const p of ringA) {
        p.update(); // normal rotation speed
        const { x, y } = p.getPosition(cx, cy);
        const dx = x - cx;
        const dy = y - cy;
        const rotatedX = cx + dx * cosUp - dy * sinUp;
        const rotatedY = cy + dx * sinUp + dy * cosUp;

        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fill();
      }

      // --- RING B ---
      for (const p of ringB) {
        p.update(false); // counter-rotate
        const { x, y } = p.getPosition(cx, cy);
        const dx = x - cx;
        const dy = y - cy;
        const rotatedX = cx + dx * cosDown - dy * sinDown;
        const rotatedY = cy + dx * sinDown + dy * cosDown;

        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, p.size * 0.8, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180,200,255,0.7)";
        ctx.fill();
      }

      // --- DENSE INNER DISK ---
      // Add faint translucent arcs for a soft disk band
      ctx.globalAlpha = 0.1;
      for (let i = 0; i < 40; i++) {
        const angleStart = Math.random() * Math.PI * 2;
        const angleEnd = angleStart + 0.05;
        const radius = 140 + Math.random() * 60;
        ctx.beginPath();
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = 0.3;
        ctx.arc(cx, cy, radius, angleStart, angleEnd);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };

    animate();
    return () => window.removeEventListener("resize", handleResize);
  }, [targetRef]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none"
    />
  );
};

export default OrbitRings;
