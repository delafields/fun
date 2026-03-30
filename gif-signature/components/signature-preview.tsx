"use client";

import { useEffect, useRef } from "react";
import { renderFrame, type SignatureConfig } from "@/lib/signature-engine";
import { hasExtras } from "@/lib/extras";

interface SignaturePreviewProps {
  config: SignatureConfig;
  className?: string;
}

export default function SignaturePreview({
  config,
  className = "",
}: SignaturePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    cancelledRef.current = false;
    const startTime = performance.now();

    const drawDuration = config.speed * 50;
    const extrasDuration = hasExtras(config.extras) ? 500 : 0;
    const holdDuration = 1500;
    const totalDuration = drawDuration + extrasDuration + holdDuration;

    async function loop() {
      while (!cancelledRef.current && canvasRef.current) {
        const elapsed = performance.now() - startTime;
        const cycleTime = elapsed % totalDuration;

        let progress: number;
        if (cycleTime <= drawDuration) {
          const t = cycleTime / drawDuration;
          progress =
            t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        } else if (cycleTime <= drawDuration + extrasDuration) {
          const t = (cycleTime - drawDuration) / extrasDuration;
          progress = 1 + t * 0.25;
        } else {
          progress = 1.25;
        }

        await renderFrame(canvasRef.current, config, progress);

        // Yield to the browser (roughly 60fps)
        await new Promise((r) => requestAnimationFrame(r));
      }
    }

    loop();

    return () => {
      cancelledRef.current = true;
    };
  }, [config]);

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
