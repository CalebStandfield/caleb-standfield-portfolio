"use client";
import { useEffect, useRef} from "react";

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

    const starCount = 500;
    const tinyStars: {
    x: number;
    y: number;
    baseSize: number;
    twinkleSpeed: number;
    hue: number;
    }[] = [];

    for (let i = 0; i < starCount; i++) {
    tinyStars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        baseSize: Math.random() * 1.05 + 0.3, // base radius
        twinkleSpeed: Math.random() * 0.025 + 0.01, // different speeds
        hue: 40 + Math.random() * 20, // gold range (40-60° hue)
    });
    }

    // --- Setup particles ---
    const ringA: Particle[] = [];
    const ringB: Particle[] = [];

    const ringCount = 800;
    for (let i = 0; i < ringCount; i++) {
      ringA.push(new Particle(500 + Math.random() * 20, 150 + Math.random() * 20));
      ringB.push(new Particle(500 + Math.random() * 20, 150 + Math.random() * 20));
    }


    const degUp = 25;
    const degDown = -25;

    const radUp = (degUp * Math.PI) / 180;
    const radDown = (degDown * Math.PI) / 180;

    const cosUp = Math.cos(radUp);
    const sinUp = Math.sin(radUp);

    const cosDown = Math.cos(radDown);
    const sinDown = Math.sin(radDown);

    const handleResize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);

    const animate = () => {
        ctx.fillStyle = "rgba(0,0,0,0.15)";
        ctx.fillRect(0, 0, w, h);

    // draw stars
    tinyStars.forEach((s, idx) => {
        // oscillate size for twinkle effect
        const twinkle = Math.sin(Date.now() * 0.002 * s.twinkleSpeed * 50 + idx) * 0.5 + 0.5;
        const radius = s.baseSize * (0.5 + twinkle); // scale size
        
        ctx.beginPath();
        ctx.arc(s.x, s.y, radius, 0, Math.PI * 2);
        
        // Soft golden color with variable brightness
        ctx.fillStyle = `hsla(${s.hue}, 80%, ${40 + twinkle * 60}%, 0.8)`; 
        ctx.fill();
    });

    // ring A (25° up)
    for (const p of ringA) {
        p.update();
        const { x, y } = p.getPosition(centerX, centerY);
        const dx = x - centerX;
        const dy = y - centerY;

        const rotatedX = centerX + dx * cosUp - dy * sinUp;
        const rotatedY = centerY + dx * sinUp + dy * cosUp;

        ctx.beginPath();
        ctx.arc(rotatedX, rotatedY, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#fff";
        ctx.fill();
    }

    // ring B (25° down)
    for (const p of ringB) {
        p.update(false);
        const { x, y } = p.getPosition(centerX, centerY);
        const dx = x - centerX;
        const dy = y - centerY;

        const rotatedX = centerX + dx * cosDown - dy * sinDown;
        const rotatedY = centerY + dx * sinDown + dy * cosDown;

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