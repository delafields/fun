import GIF from "gif.js";
import type { LoopMode } from "./signature-engine";

export async function encodeGif(
  frames: ImageData[],
  width: number,
  height: number,
  delay: number = 50, // ms between frames
  loopMode: LoopMode = "once"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: "/gif.worker.js",
      transparent: 0x00000000,
      // 0 = loop forever, -1 = play once (no loop)
      repeat: loopMode === "once" ? -1 : 0,
    });

    for (const frame of frames) {
      gif.addFrame(frame, { delay, copy: true });
    }

    gif.on("finished", (blob: Blob) => {
      resolve(blob);
    });

    gif.on("error", (err: Error) => {
      reject(err);
    });

    gif.render();
  });
}
