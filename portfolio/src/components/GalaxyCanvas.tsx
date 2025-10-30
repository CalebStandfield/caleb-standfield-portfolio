"use client";
import { useEffect, useRef} from "react";

interface TinyStar {
  x: number;
  y: number;
  size: number;
  color: string;
}

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

const GalaxyCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const centerX = w / 2;
    const centerY = h / 2;

    // --- Setup particles ---
    const ringA: Particle[] = [];
    const ringB: Particle[] = [];
    const stars: TinyStar[] = [];

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

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="w-full h-screen block" />;
};

export default GalaxyCanvas;