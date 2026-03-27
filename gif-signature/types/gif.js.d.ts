declare module "gif.js" {
  interface GIFOptions {
    workers?: number;
    quality?: number;
    width?: number;
    height?: number;
    workerScript?: string;
    transparent?: number;
    repeat?: number;
    background?: string;
    dither?: boolean | string;
  }

  interface AddFrameOptions {
    delay?: number;
    copy?: boolean;
    dispose?: number;
  }

  class GIF {
    constructor(options?: GIFOptions);
    addFrame(
      image: ImageData | HTMLCanvasElement | CanvasRenderingContext2D,
      options?: AddFrameOptions
    ): void;
    on(event: "finished", callback: (blob: Blob) => void): void;
    on(event: "error", callback: (error: Error) => void): void;
    on(event: "progress", callback: (progress: number) => void): void;
    render(): void;
    abort(): void;
  }

  export default GIF;
}
