"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import SignaturePreview from "@/components/signature-preview";
import EmailInstructions from "@/components/email-instructions";
import { generateFrames, type SignatureConfig } from "@/lib/signature-engine";
import {
  generateUploadFrames,
  type UploadConfig,
} from "@/lib/upload-engine";
import { encodeGif } from "@/lib/gif-encoder";
import { videoToGif } from "@/lib/video-to-gif";
import EmailPreviewMock from "@/components/email-preview-mock";
import Link from "next/link";

interface AnyConfig {
  mode?: string;
  videoUrl?: string;
  [key: string]: unknown;
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [rawConfig, setRawConfig] = useState<AnyConfig | null>(null);
  const [gifBlob, setGifBlob] = useState<Blob | null>(null);
  const [gifUrl, setGifUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verified, setVerified] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mode = rawConfig?.mode || "type";

  // Verify payment and get config
  useEffect(() => {
    if (!sessionId) {
      setError("No session ID found. Please complete checkout first.");
      return;
    }

    async function verifySession() {
      try {
        const res = await fetch(
          `/api/checkout?session_id=${encodeURIComponent(sessionId!)}`
        );
        const data = await res.json();
        if (data.error) {
          setError(data.error);
          return;
        }
        if (data.config) {
          setRawConfig(data.config);
          setVerified(true);
        }
      } catch {
        setError("Failed to verify payment. Please contact support.");
      }
    }

    verifySession();
  }, [sessionId]);

  const generateGif = useCallback(async () => {
    if (!rawConfig || !canvasRef.current) return;
    setGenerating(true);

    try {
      let blob: Blob;

      if (mode === "upload") {
        // Retrieve image from localStorage
        const imageData = localStorage.getItem("gif-sig-upload-image");
        if (!imageData) {
          setError("Upload image not found. Please try creating your signature again.");
          return;
        }

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
          img.src = imageData;
        });

        const uploadConfig: UploadConfig = {
          imageData,
          speed: (rawConfig.speed as number) || 50,
          bgColor: (rawConfig.bgColor as string | null) ?? null,
          width: (rawConfig.width as number) || 500,
          height: (rawConfig.height as number) || 150,
        };

        const frames = generateUploadFrames(
          canvasRef.current,
          img,
          uploadConfig
        );
        blob = await encodeGif(frames, uploadConfig.width, uploadConfig.height, 50, uploadConfig.loopMode || "once");

        // Clean up localStorage
        localStorage.removeItem("gif-sig-upload-image");
      } else if (mode === "ai") {
        // Convert video to GIF
        const videoUrl = rawConfig.videoUrl as string;
        if (!videoUrl) {
          setError("Video URL not found.");
          return;
        }
        blob = await videoToGif(videoUrl, {
          width: 500,
          height: 150,
          fps: 12,
          maxDuration: 4,
        });
      } else {
        // Type mode
        const typeConfig = rawConfig as unknown as SignatureConfig;
        const frames = await generateFrames(canvasRef.current, typeConfig);
        blob = await encodeGif(frames, typeConfig.width, typeConfig.height, 50, typeConfig.loopMode || "once");
      }

      setGifBlob(blob);
      setGifUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error("GIF generation error:", err);
      setError("Failed to generate GIF. Please try refreshing the page.");
    } finally {
      setGenerating(false);
    }
  }, [rawConfig, mode]);

  // Auto-generate once config is loaded
  useEffect(() => {
    if (rawConfig && verified && canvasRef.current) {
      generateGif();
    }
  }, [rawConfig, verified, generateGif]);

  const getFileName = (ext: string) => {
    const baseName =
      mode === "type"
        ? (rawConfig?.name as string) || "signature"
        : "signature";
    return `signature-${baseName.toLowerCase().replace(/\s+/g, "-")}.${ext}`;
  };

  const handleDownload = (format: "gif" | "mp4" | "apng" = "gif") => {
    if (!gifBlob) return;

    if (format === "gif") {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(gifBlob);
      a.download = getFileName("gif");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (format === "mp4") {
      // Re-render frames to canvas and use MediaRecorder for MP4
      handleMp4Download();
    } else if (format === "apng") {
      // Download as APNG (same visual, better quality)
      handleApngDownload();
    }
  };

  const handleMp4Download = async () => {
    if (!canvasRef.current || !rawConfig) return;

    try {
      const canvas = canvasRef.current;
      const width = (rawConfig.width as number) || 500;
      const height = (rawConfig.height as number) || 150;
      canvas.width = width;
      canvas.height = height;

      const stream = canvas.captureStream(30);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 2500000,
      });

      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const recordingDone = new Promise<Blob>((resolve) => {
        mediaRecorder.onstop = () => {
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      });

      mediaRecorder.start();

      // Re-render the animation
      if (mode === "type") {
        const { generateFrames: genFrames } = await import("@/lib/signature-engine");
        const typeConfig = rawConfig as unknown as import("@/lib/signature-engine").SignatureConfig;
        const totalFrames = typeConfig.speed || 50;
        for (let i = 0; i <= totalFrames; i++) {
          const progress = i / totalFrames;
          const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
          const { renderFrame } = await import("@/lib/signature-engine");
          await renderFrame(canvas, typeConfig, eased);
          await new Promise((r) => setTimeout(r, 50));
        }
        // Hold
        await new Promise((r) => setTimeout(r, 750));
      }

      mediaRecorder.stop();
      const webmBlob = await recordingDone;

      const a = document.createElement("a");
      a.href = URL.createObjectURL(webmBlob);
      a.download = getFileName("webm");
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("MP4 export error:", err);
    }
  };

  const handleApngDownload = () => {
    // APNG is complex to encode client-side; for now, provide the GIF
    // with a note. In the future we could use a library like upng-js.
    if (!gifBlob) return;
    const a = document.createElement("a");
    a.href = URL.createObjectURL(gifBlob);
    a.download = getFileName("gif");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">:(</div>
          <h1 className="text-xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-500 mb-6">{error}</p>
          <Link
            href="/create"
            className="inline-block px-6 py-3 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
          >
            Try again
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-gray-100">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            GIF Signature
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 md:py-12">
        {/* Hidden canvas for GIF generation */}
        <canvas ref={canvasRef} className="hidden" />

        {!verified ? (
          <div className="text-center py-20">
            <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-gray-500">Verifying your payment...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="text-4xl mb-3">&#10003;</div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Your signature is ready!
              </h1>
              <p className="text-gray-500">
                Download your animated GIF and add it to your email signature.
              </p>
            </div>

            {/* Preview */}
            <div className="mb-6">
              <div className="flex justify-end mb-2">
                <div className="flex items-center gap-2">
                  <span className={`text-xs ${!showEmailPreview ? "text-gray-700 font-medium" : "text-gray-400"}`}>Signature</span>
                  <button
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showEmailPreview ? "bg-black" : "bg-gray-300"}`}
                    role="switch"
                    aria-checked={showEmailPreview}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showEmailPreview ? "translate-x-4" : ""}`} />
                  </button>
                  <span className={`text-xs ${showEmailPreview ? "text-gray-700 font-medium" : "text-gray-400"}`}>In email</span>
                </div>
              </div>
              {showEmailPreview ? (
                <div className="flex justify-center">
                  <EmailPreviewMock
                    senderName={
                      mode === "type"
                        ? ((rawConfig?.name as string) || "You").split(" ")[0]
                        : "You"
                    }
                  >
                    {gifUrl ? (
                      <img
                        src={gifUrl}
                        alt="Animated signature"
                        className="max-w-full h-auto max-h-20"
                      />
                    ) : (
                      <div className="text-gray-400 text-sm">
                        Generating...
                      </div>
                    )}
                  </EmailPreviewMock>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center bg-gray-50/50">
                  {gifUrl ? (
                    <img
                      src={gifUrl}
                      alt="Animated signature"
                      className="max-w-full h-auto"
                    />
                  ) : mode === "type" && rawConfig ? (
                    <SignaturePreview
                      config={rawConfig as unknown as SignatureConfig}
                    />
                  ) : (
                    <div className="text-gray-400 text-sm">
                      Generating preview...
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Download */}
            <div className="mb-10">
              {generating ? (
                <div className="flex items-center justify-center gap-3 py-4">
                  <div className="animate-spin w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                  <span className="text-gray-600">
                    Generating your GIF...
                  </span>
                </div>
              ) : gifBlob ? (
                <div className="space-y-4">
                  {/* Primary download */}
                  <div className="text-center">
                    <button
                      onClick={() => handleDownload("gif")}
                      className="px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 transition cursor-pointer"
                    >
                      Download GIF
                    </button>
                    <p className="text-xs text-gray-400 mt-2">
                      {(gifBlob.size / 1024).toFixed(0)} KB — Best for email signatures
                    </p>
                  </div>

                  {/* Alternative formats */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <span className="text-xs text-gray-400">Also download as:</span>
                    <button
                      onClick={() => handleDownload("mp4")}
                      className="text-xs text-gray-500 hover:text-black underline transition cursor-pointer"
                    >
                      WebM video
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => handleDownload("apng")}
                      className="text-xs text-gray-500 hover:text-black underline transition cursor-pointer"
                    >
                      High-quality GIF
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Instructions */}
            <div>
              <h2 className="text-xl font-bold mb-4">
                How to add to your email
              </h2>
              <EmailInstructions />
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-black border-t-transparent rounded-full" />
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
