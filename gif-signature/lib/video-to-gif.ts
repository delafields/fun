import GIF from "gif.js";

/**
 * Converts a video URL to an optimized GIF blob.
 * Captures frames from the video and encodes them.
 */
export async function videoToGif(
  videoUrl: string,
  options: {
    width?: number;
    height?: number;
    fps?: number;
    maxDuration?: number; // seconds
  } = {}
): Promise<Blob> {
  const { width = 400, height = 150, fps = 12, maxDuration = 4 } = options;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.playsInline = true;

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    const gif = new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: "/gif.worker.js",
    });

    video.onloadedmetadata = () => {
      const duration = Math.min(video.duration, maxDuration);
      const totalFrames = Math.floor(duration * fps);
      const frameDelay = 1000 / fps;
      let frameIndex = 0;

      function captureFrame() {
        if (frameIndex >= totalFrames) {
          gif.on("finished", (blob: Blob) => resolve(blob));
          gif.on("error", (err: Error) => reject(err));
          gif.render();
          return;
        }

        const time = (frameIndex / totalFrames) * duration;
        video.currentTime = time;

        video.onseeked = () => {
          // Draw video frame scaled to fit
          const vw = video.videoWidth;
          const vh = video.videoHeight;
          const scale = Math.min(width / vw, height / vh);
          const dw = vw * scale;
          const dh = vh * scale;
          const dx = (width - dw) / 2;
          const dy = (height - dh) / 2;

          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(video, dx, dy, dw, dh);

          gif.addFrame(ctx.getImageData(0, 0, width, height), {
            delay: frameDelay,
            copy: true,
          });

          frameIndex++;
          captureFrame();
        };
      }

      captureFrame();
    };

    video.onerror = () => reject(new Error("Failed to load video"));
    video.src = videoUrl;
    video.load();
  });
}
