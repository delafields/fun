import QRCode from "qrcode";

export interface SignatureExtras {
  headshot?: string; // base64 data URL
  socials?: {
    linkedin?: string;
    twitter?: string;
    github?: string;
    website?: string;
  };
  cta?: {
    text: string;
    url: string;
  };
  qrUrl?: string;
}

// Caches
const imageCache = new Map<string, HTMLImageElement>();
const qrDataUrlCache = new Map<string, string>();

async function loadCachedImage(
  src: string,
  cacheKey?: string
): Promise<HTMLImageElement> {
  const key = cacheKey || src;
  if (imageCache.has(key)) return imageCache.get(key)!;
  const img = new Image();
  return new Promise((resolve, reject) => {
    img.onload = () => {
      imageCache.set(key, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

async function getCachedQrDataUrl(
  url: string,
  size: number
): Promise<string> {
  const key = `${url}:${size}`;
  if (qrDataUrlCache.has(key)) return qrDataUrlCache.get(key)!;
  const dataUrl = await QRCode.toDataURL(url, {
    width: size * 3,
    margin: 1,
    errorCorrectionLevel: "L",
    color: { dark: "#000000", light: "#ffffff00" },
  });
  qrDataUrlCache.set(key, dataUrl);
  return dataUrl;
}

export function hasExtras(extras?: SignatureExtras): boolean {
  if (!extras) return false;
  return !!(
    extras.headshot ||
    (extras.socials && Object.values(extras.socials).some((v) => v)) ||
    extras.cta?.text ||
    extras.qrUrl
  );
}

export function calculateExtrasHeight(extras?: SignatureExtras): number {
  if (!hasExtras(extras)) return 0;
  let height = 0;
  const hasSocials =
    extras!.socials && Object.values(extras!.socials).some((v) => v);
  const hasCta = extras!.cta?.text;
  const hasQr = extras!.qrUrl;

  if (hasSocials) height += 30;
  if (hasCta || hasQr) height += 40;
  if (height > 0) height += 8; // separator padding

  return height;
}

export function calculateHeadshotOffset(
  extras?: SignatureExtras,
  signatureHeight?: number
): number {
  if (!extras?.headshot) return 0;
  const headshotSize = Math.min((signatureHeight || 100) * 0.55, 48);
  return headshotSize + 12;
}

const SOCIAL_ICONS: Record<string, { bg: string; label: string }> = {
  linkedin: { bg: "#0A66C2", label: "in" },
  twitter: { bg: "#000000", label: "𝕏" },
  github: { bg: "#24292e", label: "GH" },
  website: { bg: "#059669", label: "⊕" },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

export async function renderExtras(
  ctx: CanvasRenderingContext2D,
  extras: SignatureExtras,
  canvasWidth: number,
  signatureAreaHeight: number,
  color: string,
  alpha: number
): Promise<void> {
  if (alpha <= 0 || !hasExtras(extras)) return;
  ctx.save();
  ctx.globalAlpha = alpha;

  let y = signatureAreaHeight + 8;
  const leftMargin = calculateHeadshotOffset(extras, signatureAreaHeight) || 10;

  // Headshot
  if (extras.headshot) {
    try {
      const headshotImg = await loadCachedImage(extras.headshot, "headshot");
      const size = Math.min(signatureAreaHeight * 0.55, 48);
      const hx = 8;
      const hy = (signatureAreaHeight - size) / 2;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(hx + size / 2, hy + size / 2, size / 2, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(headshotImg, hx, hy, size, size);
      ctx.restore();
      ctx.globalAlpha = alpha;
    } catch {
      // Skip headshot if loading fails
    }
  }

  // Social icons
  const socials = extras.socials;
  if (socials && Object.values(socials).some((v) => v)) {
    let x = leftMargin;
    const iconSize = 20;
    const iconGap = 6;

    for (const [platform, url] of Object.entries(socials)) {
      if (!url) continue;
      const icon = SOCIAL_ICONS[platform];
      if (!icon) continue;

      // Rounded rect background
      ctx.fillStyle = icon.bg;
      drawRoundedRect(ctx, x, y, iconSize, iconSize, 4);
      ctx.fill();

      // Label text
      ctx.fillStyle = "#ffffff";
      ctx.font = `bold ${icon.label.length > 1 ? 9 : 12}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(icon.label, x + iconSize / 2, y + iconSize / 2 + 1);

      x += iconSize + iconGap;
    }
    y += 28;
  }

  // CTA and QR row
  const hasCta = extras.cta?.text;
  const hasQr = extras.qrUrl;

  if (hasCta || hasQr) {
    // CTA pill
    if (hasCta && extras.cta) {
      const ctaText = extras.cta.text;
      ctx.font = "bold 11px sans-serif";
      const textWidth = ctx.measureText(ctaText + " →").width;
      const pillWidth = textWidth + 24;
      const pillHeight = 26;
      const pillX = leftMargin;
      const pillRadius = pillHeight / 2;

      ctx.fillStyle = color;
      drawRoundedRect(ctx, pillX, y, pillWidth, pillHeight, pillRadius);
      ctx.fill();

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "left";
      ctx.textBaseline = "middle";
      ctx.fillText(ctaText + " →", pillX + 12, y + pillHeight / 2 + 1);
    }

    // QR code
    if (hasQr && extras.qrUrl) {
      try {
        const qrSize = 36;
        const qrX = canvasWidth - qrSize - 8;
        const qrY = y - 4;

        const qrDataUrl = await getCachedQrDataUrl(extras.qrUrl, qrSize);
        const qrImg = await loadCachedImage(
          qrDataUrl,
          `qr:${extras.qrUrl}:${qrSize}`
        );
        ctx.drawImage(qrImg, qrX, qrY, qrSize, qrSize);
      } catch {
        // Skip QR if generation fails
      }
    }
  }

  ctx.restore();
}
