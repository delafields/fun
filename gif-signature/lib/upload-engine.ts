/**
 * Upload Engine: Takes a signature image and animates it
 * with a left-to-right reveal effect (simulating writing).
 */

import type { LoopMode } from "./signature-engine";

export interface UploadConfig {
  imageData: string; // base64 data URL
  speed: number; // total frames for the animation
  bgColor: string | null;
  width: number;
  height: number;
  loopMode?: LoopMode;
}

/**
 * Renders a single frame of the upload animation.
 * Uses a left-to-right wipe reveal with soft edge to simulate writing.
 */
export function renderUploadFrame(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: UploadConfig,
  progress: number // 0 to 1
): void {
  const ctx = canvas.getContext("2d")!;
  canvas.width = config.width;
  canvas.height = config.height;

  // Clear
  if (config.bgColor) {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, config.width, config.height);
  } else {
    ctx.clearRect(0, 0, config.width, config.height);
  }

  if (progress <= 0) return;

  // Draw the image scaled to fit
  const scale = Math.min(
    (config.width * 0.9) / img.naturalWidth,
    (config.height * 0.8) / img.naturalHeight
  );
  const drawW = img.naturalWidth * scale;
  const drawH = img.naturalHeight * scale;
  const drawX = (config.width - drawW) / 2;
  const drawY = (config.height - drawH) / 2;

  // Create a clipping mask for the left-to-right reveal
  // The reveal position + soft feather edge
  const revealX = drawX + drawW * Math.min(progress * 1.1, 1);
  const featherWidth = drawW * 0.08; // soft edge width

  ctx.save();

  // Create gradient mask for soft reveal edge
  const gradient = ctx.createLinearGradient(
    revealX - featherWidth,
    0,
    revealX,
    0
  );
  gradient.addColorStop(0, "rgba(0,0,0,1)");
  gradient.addColorStop(1, "rgba(0,0,0,0)");

  // Draw image with hard clip up to the feather zone
  ctx.beginPath();
  ctx.rect(0, 0, revealX - featherWidth, config.height);
  ctx.clip();
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();

  // Draw the feathered edge
  if (progress < 1) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(revealX - featherWidth, 0, featherWidth, config.height);
    ctx.clip();

    // Draw image
    ctx.drawImage(img, drawX, drawY, drawW, drawH);

    // Apply fade with gradient
    ctx.globalCompositeOperation = "destination-in";
    ctx.fillStyle = gradient;
    ctx.fillRect(revealX - featherWidth, 0, featherWidth, config.height);

    ctx.restore();
  } else {
    // Fully revealed
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  }
}

export function generateUploadFrames(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  config: UploadConfig
): ImageData[] {
  const frames: ImageData[] = [];
  const totalFrames = config.speed;
  const loopMode = config.loopMode || "once";
  const holdFrames = 15;
  const fadeFrames = 12;

  for (let i = 0; i <= totalFrames; i++) {
    const progress = i / totalFrames;
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    renderUploadFrame(canvas, img, config, eased);
    const ctx = canvas.getContext("2d")!;
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  const ctx = canvas.getContext("2d")!;
  const lastFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < holdFrames; i++) {
    frames.push(lastFrame);
  }

  if (loopMode === "fade") {
    for (let i = 1; i <= fadeFrames; i++) {
      const alpha = 1 - i / fadeFrames;
      if (config.bgColor) {
        ctx.fillStyle = config.bgColor;
        ctx.fillRect(0, 0, config.width, config.height);
      } else {
        ctx.clearRect(0, 0, config.width, config.height);
      }
      ctx.globalAlpha = alpha;
      ctx.putImageData(lastFrame, 0, 0);
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = config.bgColor || "rgba(255,255,255,1)";
      ctx.fillRect(0, 0, config.width, config.height);
      ctx.globalAlpha = 1;
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    if (config.bgColor) {
      ctx.fillStyle = config.bgColor;
      ctx.fillRect(0, 0, config.width, config.height);
    } else {
      ctx.clearRect(0, 0, config.width, config.height);
    }
    const emptyFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 8; i++) {
      frames.push(emptyFrame);
    }
  }

  return frames;
}
