"use client";

import { useEffect, useRef, useCallback } from "react";
import { renderUploadFrame, type UploadConfig } from "@/lib/upload-engine";

interface UploadPreviewProps {
  config: UploadConfig;
  img: HTMLImageElement;
  className?: string;
}

export default function UploadPreview({
  config,
  img,
  className = "",
}: UploadPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const animate = useCallback(
    (timestamp: number) => {
      if (!canvasRef.current) return;
      if (!startTimeRef.current) startTimeRef.current = timestamp;

      const elapsed = timestamp - startTimeRef.current;
      const drawDuration = config.speed * 50;
      const holdDuration = 1500;
      const totalDuration = drawDuration + holdDuration;

      const cycleTime = elapsed % totalDuration;
      const progress = Math.min(cycleTime / drawDuration, 1);

      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

      renderUploadFrame(canvasRef.current, img, config, eased);

      animRef.current = requestAnimationFrame(animate);
    },
    [config, img]
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
      }}
    />
  );
}
