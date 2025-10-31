"use client";
import { useRef, useEffect, useState } from "react";
import Image from "next/image";

export default function SpinningYinYang() {
  const ref = useRef<HTMLDivElement>(null);
  const angleRef = useRef(0);
  const velocityRef = useRef(0.008);
  const targetVelocityRef = useRef(0.008);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    let raf: number;

    const animate = () => {
      velocityRef.current +=
        (targetVelocityRef.current - velocityRef.current) * 0.008;
      angleRef.current += velocityRef.current;

      if (ref.current) {
        ref.current.style.transform = `rotate(${angleRef.current}rad)`;
      }

      raf = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(raf);
  }, []);

  // Update target velocity when hovered
  useEffect(() => {
    targetVelocityRef.current = hovered ? -0.008 : 0.008;
  }, [hovered]);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      ref={ref}
      className="w-[440px] h-[440px] flex items-center justify-center drop-shadow-[0_0_10px_rgba(255,255,255,0.7)] transition-transform duration-500"
      style={{ transformOrigin: "center center" }}
    >
      <Image
        src="/yin-yang.png"
        alt="Yin Yang"
        width={4400}
        height={440}
        draggable={false}
        className="pointer-events-none select-none"
      />
    </div>
  );
}
