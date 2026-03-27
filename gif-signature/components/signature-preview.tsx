"use client";

import { useEffect, useRef, useCallback } from "react";
import { renderFrame, type SignatureConfig } from "@/lib/signature-engine";

interface SignaturePreviewProps {
  config: SignatureConfig;
  className?: string;
}

export default function SignaturePreview({
  config,
  className = "",
}: SignaturePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!canvasRef.current) return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      // Duration based on speed setting (frames * 50ms frame delay)
      const drawDuration = config.speed * 50;
      const holdDuration = 1500; // hold finished sig for 1.5s
      const totalDuration = drawDuration + holdDuration;

      const cycleTime = elapsed % totalDuration;
      const progress = Math.min(cycleTime / drawDuration, 1);

      // Ease-in-out
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      renderFrame(canvasRef.current, config, eased);

      animRef.current = requestAnimationFrame(animate);
    },
    [config]
  );

  useEffect(() => {
    startTimeRef.current = 0;
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      width={config.width}
      height={config.height}
      className={`max-w-full h-auto ${className}`}
      style={{
        backgroundColor: config.bgColor || "transparent",
        imageRendering: "auto",
      }}
    />
  );
}
