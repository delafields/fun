import opentype from "opentype.js";

export type LoopMode = "loop" | "once" | "fade";

export interface SignatureConfig {
  name: string;
  subtitle?: string;
  fontFile: string;
  color: string;
  strokeWidth: number;
  speed: number;
  fontSize: number;
  bgColor: string | null; // null = transparent
  width: number;
  height: number;
  loopMode?: LoopMode; // "loop" = repeat forever, "once" = write + hold, "fade" = write + fade out + repeat
}

interface PathSegment {
  type: string;
  x?: number;
  y?: number;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}

// Cache loaded fonts
const fontCache = new Map<string, opentype.Font>();

async function loadFont(url: string): Promise<opentype.Font> {
  if (fontCache.has(url)) return fontCache.get(url)!;

  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  const font = opentype.parse(buffer);
  fontCache.set(url, font);
  return font;
}

function getPathLength(commands: PathSegment[]): number {
  let length = 0;
  let cx = 0,
    cy = 0;

  for (const cmd of commands) {
    if (cmd.type === "M") {
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "L") {
      const dx = cmd.x! - cx;
      const dy = cmd.y! - cy;
      length += Math.sqrt(dx * dx + dy * dy);
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "Q") {
      // Approximate quadratic bezier length
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t1 = 1 - t;
        const nx = t1 * t1 * cx + 2 * t1 * t * cmd.x1! + t * t * cmd.x!;
        const ny = t1 * t1 * cy + 2 * t1 * t * cmd.y1! + t * t * cmd.y!;
        const pt = (i - 1) / steps;
        const pt1 = 1 - pt;
        const px = pt1 * pt1 * cx + 2 * pt1 * pt * cmd.x1! + pt * pt * cmd.x!;
        const py = pt1 * pt1 * cy + 2 * pt1 * pt * cmd.y1! + pt * pt * cmd.y!;
        length += Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);
      }
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "C") {
      // Approximate cubic bezier length
      const steps = 10;
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t1 = 1 - t;
        const nx =
          t1 ** 3 * cx +
          3 * t1 * t1 * t * cmd.x1! +
          3 * t1 * t * t * cmd.x2! +
          t ** 3 * cmd.x!;
        const ny =
          t1 ** 3 * cy +
          3 * t1 * t1 * t * cmd.y1! +
          3 * t1 * t * t * cmd.y2! +
          t ** 3 * cmd.y!;
        const pt = (i - 1) / steps;
        const pt1 = 1 - pt;
        const px =
          pt1 ** 3 * cx +
          3 * pt1 * pt1 * pt * cmd.x1! +
          3 * pt1 * pt * pt * cmd.x2! +
          pt ** 3 * cmd.x!;
        const py =
          pt1 ** 3 * cy +
          3 * pt1 * pt1 * pt * cmd.y1! +
          3 * pt1 * pt * pt * cmd.y2! +
          pt ** 3 * cmd.y!;
        length += Math.sqrt((nx - px) ** 2 + (ny - py) ** 2);
      }
      cx = cmd.x!;
      cy = cmd.y!;
    }
  }
  return length;
}

function drawPartialPath(
  ctx: CanvasRenderingContext2D,
  commands: PathSegment[],
  totalLength: number,
  drawLength: number
) {
  let accumulated = 0;
  let cx = 0,
    cy = 0;

  ctx.beginPath();

  for (const cmd of commands) {
    if (accumulated >= drawLength) break;

    if (cmd.type === "M") {
      ctx.moveTo(cmd.x!, cmd.y!);
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "L") {
      const dx = cmd.x! - cx;
      const dy = cmd.y! - cy;
      const segLen = Math.sqrt(dx * dx + dy * dy);
      if (accumulated + segLen <= drawLength) {
        ctx.lineTo(cmd.x!, cmd.y!);
      } else {
        const frac = (drawLength - accumulated) / segLen;
        ctx.lineTo(cx + dx * frac, cy + dy * frac);
      }
      accumulated += segLen;
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "Q") {
      const steps = 10;
      const segPoints: [number, number][] = [[cx, cy]];
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t1 = 1 - t;
        segPoints.push([
          t1 * t1 * cx + 2 * t1 * t * cmd.x1! + t * t * cmd.x!,
          t1 * t1 * cy + 2 * t1 * t * cmd.y1! + t * t * cmd.y!,
        ]);
      }
      for (let i = 1; i < segPoints.length; i++) {
        const dl = Math.sqrt(
          (segPoints[i][0] - segPoints[i - 1][0]) ** 2 +
            (segPoints[i][1] - segPoints[i - 1][1]) ** 2
        );
        if (accumulated + dl > drawLength) {
          const frac = (drawLength - accumulated) / dl;
          ctx.lineTo(
            segPoints[i - 1][0] +
              (segPoints[i][0] - segPoints[i - 1][0]) * frac,
            segPoints[i - 1][1] +
              (segPoints[i][1] - segPoints[i - 1][1]) * frac
          );
          accumulated = drawLength;
          break;
        }
        ctx.lineTo(segPoints[i][0], segPoints[i][1]);
        accumulated += dl;
      }
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "C") {
      const steps = 10;
      const segPoints: [number, number][] = [[cx, cy]];
      for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const t1 = 1 - t;
        segPoints.push([
          t1 ** 3 * cx +
            3 * t1 * t1 * t * cmd.x1! +
            3 * t1 * t * t * cmd.x2! +
            t ** 3 * cmd.x!,
          t1 ** 3 * cy +
            3 * t1 * t1 * t * cmd.y1! +
            3 * t1 * t * t * cmd.y2! +
            t ** 3 * cmd.y!,
        ]);
      }
      for (let i = 1; i < segPoints.length; i++) {
        const dl = Math.sqrt(
          (segPoints[i][0] - segPoints[i - 1][0]) ** 2 +
            (segPoints[i][1] - segPoints[i - 1][1]) ** 2
        );
        if (accumulated + dl > drawLength) {
          const frac = (drawLength - accumulated) / dl;
          ctx.lineTo(
            segPoints[i - 1][0] +
              (segPoints[i][0] - segPoints[i - 1][0]) * frac,
            segPoints[i - 1][1] +
              (segPoints[i][1] - segPoints[i - 1][1]) * frac
          );
          accumulated = drawLength;
          break;
        }
        ctx.lineTo(segPoints[i][0], segPoints[i][1]);
        accumulated += dl;
      }
      cx = cmd.x!;
      cy = cmd.y!;
    } else if (cmd.type === "Z") {
      // close path - ignore for stroke animation
    }
  }

  ctx.stroke();
}

export async function renderFrame(
  canvas: HTMLCanvasElement,
  config: SignatureConfig,
  progress: number // 0 to 1
): Promise<void> {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = config;

  canvas.width = width;
  canvas.height = height;

  // Clear
  if (config.bgColor) {
    ctx.fillStyle = config.bgColor;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  if (!config.name.trim()) return;

  const font = await loadFont(config.fontFile);

  // Auto-scale font size to fit canvas with padding
  const maxTextWidth = width * 0.9;
  const maxTextHeight = height * 0.7;
  let fontSize = config.fontSize;

  // Measure at the preset font size first
  let testPath = font.getPath(config.name, 0, 0, fontSize);
  let bb = testPath.getBoundingBox();
  let textWidth = bb.x2 - bb.x1;
  let textHeight = bb.y2 - bb.y1;

  // Scale down if text overflows
  if (textWidth > maxTextWidth || textHeight > maxTextHeight) {
    const scaleX = maxTextWidth / textWidth;
    const scaleY = maxTextHeight / textHeight;
    fontSize = fontSize * Math.min(scaleX, scaleY);

    testPath = font.getPath(config.name, 0, 0, fontSize);
    bb = testPath.getBoundingBox();
    textWidth = bb.x2 - bb.x1;
    textHeight = bb.y2 - bb.y1;
  }

  // Account for subtitle space
  const subtitleHeight = config.subtitle ? 24 : 0;
  const totalContentHeight = textHeight + subtitleHeight;

  const offsetX = (width - textWidth) / 2 - bb.x1;
  const offsetY = (height - totalContentHeight) / 2 - bb.y1;

  // Get centered path
  const centeredPath = font.getPath(
    config.name,
    offsetX,
    offsetY,
    fontSize
  );
  const commands = centeredPath.commands as PathSegment[];

  // Calculate total path length
  const totalLength = getPathLength(commands);
  const drawLength = totalLength * Math.min(progress, 1);

  // Scale stroke width proportionally if font was scaled down
  const fontScale = fontSize / config.fontSize;

  // Draw the writing animation with strokes
  ctx.strokeStyle = config.color;
  ctx.lineWidth = config.strokeWidth * fontScale;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  drawPartialPath(ctx, commands, totalLength, drawLength);

  // Once fully written, overlay the solid filled letters so they
  // don't look hollow. Quick crossfade at the very end.
  if (progress >= 1) {
    centeredPath.fill = config.color;
    centeredPath.stroke = null;
    centeredPath.draw(ctx);
  }

  // Draw subtitle if present and animation is far enough along
  if (config.subtitle && progress > 0.85) {
    const subtitleProgress = (progress - 0.85) / 0.15;
    const subtitleFontSize = 16;
    ctx.font = `${subtitleFontSize}px sans-serif`;
    ctx.fillStyle = config.color;
    ctx.globalAlpha = Math.min(subtitleProgress, 1);
    ctx.textAlign = "center";
    ctx.fillText(
      config.subtitle,
      width / 2,
      offsetY + textHeight + bb.y1 + 28
    );
    ctx.globalAlpha = 1;
  }
}

export async function generateFrames(
  canvas: HTMLCanvasElement,
  config: SignatureConfig
): Promise<ImageData[]> {
  const frames: ImageData[] = [];
  const totalFrames = config.speed;
  const loopMode = config.loopMode || "once";
  const holdFrames = 15;
  const fadeFrames = 12;

  // Write-on animation
  for (let i = 0; i <= totalFrames; i++) {
    const progress = i / totalFrames;
    const eased =
      progress < 0.5
        ? 2 * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 2) / 2;

    await renderFrame(canvas, config, eased);
    const ctx = canvas.getContext("2d")!;
    frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  }

  // Hold the final frame
  const ctx = canvas.getContext("2d")!;
  const lastFrame = ctx.getImageData(0, 0, canvas.width, canvas.height);
  for (let i = 0; i < holdFrames; i++) {
    frames.push(lastFrame);
  }

  // Fade out for "fade" loop mode
  if (loopMode === "fade") {
    for (let i = 1; i <= fadeFrames; i++) {
      const alpha = 1 - i / fadeFrames;
      // Clear canvas
      if (config.bgColor) {
        ctx.fillStyle = config.bgColor;
        ctx.fillRect(0, 0, config.width, config.height);
      } else {
        ctx.clearRect(0, 0, config.width, config.height);
      }
      // Draw last frame with reduced alpha
      ctx.globalAlpha = alpha;
      ctx.putImageData(lastFrame, 0, 0);
      // Overlay with bg to simulate fade
      ctx.globalAlpha = 1 - alpha;
      ctx.fillStyle = config.bgColor || "rgba(255,255,255,1)";
      ctx.fillRect(0, 0, config.width, config.height);
      ctx.globalAlpha = 1;
      frames.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
    }
    // Add a brief pause at empty
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
