"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import SignaturePreview from "@/components/signature-preview";
import UploadPreview from "@/components/upload-preview";
import StylePicker from "@/components/style-picker";
import FineTunePanel from "@/components/fine-tune-panel";
import { PRESETS, type SignaturePreset } from "@/lib/presets";
import type { SignatureConfig, LoopMode } from "@/lib/signature-engine";
import type { UploadConfig } from "@/lib/upload-engine";
import EmailPreviewMock from "@/components/email-preview-mock";
import Link from "next/link";

const SIZE_MAP = {
  small: { width: 300, height: 100 },
  medium: { width: 500, height: 150 },
  large: { width: 700, height: 200 },
};

type Mode = "type" | "upload" | "ai";

export default function CreatePage() {
  const [mode, setMode] = useState<Mode>("type");

  // Type mode state
  const [name, setName] = useState("");
  const [preset, setPreset] = useState<SignaturePreset>(PRESETS[0]);
  const [color, setColor] = useState(PRESETS[0].color);
  const [subtitle, setSubtitle] = useState("");
  const [speed, setSpeed] = useState(PRESETS[0].speed);
  const [bgColor, setBgColor] = useState<string | null>(null);
  const [size, setSize] = useState<"small" | "medium" | "large">("medium");
  const [loopMode, setLoopMode] = useState<LoopMode>("once");

  // Upload mode state
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [uploadImg, setUploadImg] = useState<HTMLImageElement | null>(null);
  const [uploadSpeed, setUploadSpeed] = useState(50);
  const [uploadBg, setUploadBg] = useState<string | null>(null);
  const [uploadSize, setUploadSize] = useState<"small" | "medium" | "large">("medium");
  const [uploadLoopMode, setUploadLoopMode] = useState<LoopMode>("once");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI mode state
  const [aiName, setAiName] = useState("");
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiRefImage, setAiRefImage] = useState<string | null>(null);
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null); // Step 1 result
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null); // Step 2 result
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiAnimating, setAiAnimating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const aiFileInputRef = useRef<HTMLInputElement>(null);

  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePresetSelect = (p: SignaturePreset) => {
    setPreset(p);
    setColor(p.color);
    setSpeed(p.speed);
  };

  const config: SignatureConfig = useMemo(
    () => ({
      name,
      subtitle: subtitle || undefined,
      fontFile: preset.fontFile,
      color,
      strokeWidth: preset.strokeWidth,
      speed,
      fontSize: preset.fontSize,
      bgColor,
      loopMode,
      ...SIZE_MAP[size],
    }),
    [name, subtitle, preset, color, speed, bgColor, size, loopMode]
  );

  const uploadConfig: UploadConfig = useMemo(
    () => ({
      imageData: uploadedImage || "",
      speed: uploadSpeed,
      bgColor: uploadBg,
      loopMode: uploadLoopMode,
      ...SIZE_MAP[uploadSize],
    }),
    [uploadedImage, uploadSpeed, uploadBg, uploadSize, uploadLoopMode]
  );

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setUploadedImage(dataUrl);

      const img = new Image();
      img.onload = () => setUploadImg(img);
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAiRefUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAiRefImage(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Step 1: Generate static image preview
  const handleAiGenerate = async () => {
    if (!aiName.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    setAiImageUrl(null);
    setAiVideoUrl(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: aiName,
          prompt: aiPrompt,
          imageUrl: aiRefImage || undefined,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
      } else if (data.imageUrl) {
        setAiImageUrl(data.imageUrl);
      }
    } catch {
      setAiError("Failed to generate. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Step 2: Animate the approved image (triggered by "Get My Signature")
  const handleAiAnimate = async () => {
    if (!aiImageUrl) return;
    setAiAnimating(true);
    setAiError(null);

    try {
      const res = await fetch("/api/animate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: aiName,
          imageUrl: aiImageUrl,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setAiError(data.error);
      } else if (data.videoUrl) {
        setAiVideoUrl(data.videoUrl);
      }
    } catch {
      setAiError("Failed to animate. Please try again.");
    } finally {
      setAiAnimating(false);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    try {
      let checkoutConfig: Record<string, unknown>;

      if (mode === "type") {
        if (!name.trim()) return;
        checkoutConfig = { mode: "type", ...config };
      } else if (mode === "upload") {
        if (!uploadedImage) return;
        // Store image in localStorage (too large for Stripe metadata)
        localStorage.setItem("gif-sig-upload-image", uploadedImage);
        checkoutConfig = { mode: "upload", ...uploadConfig };
      } else {
        if (!aiVideoUrl) return;
        checkoutConfig = { mode: "ai", videoUrl: aiVideoUrl, prompt: aiPrompt };
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ config: checkoutConfig }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const canCheckout =
    (mode === "type" && name.trim()) ||
    (mode === "upload" && uploadedImage) ||
    (mode === "ai" && aiVideoUrl && aiName.trim());

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold tracking-tight">
            GIF Signature
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          Create your signature
        </h1>
        <p className="text-gray-500 mb-8">
          Choose how you want to create your animated email signature.
        </p>

        {/* Mode Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 max-w-lg">
          {([
            { id: "type", label: "Type it", icon: "T" },
            { id: "upload", label: "Upload it", icon: "\u2191" },
            { id: "ai", label: "AI Generate", icon: "\u2728" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-lg text-sm font-medium transition cursor-pointer ${
                mode === tab.id
                  ? "bg-white text-black shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span className="mr-1.5">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        <div className="space-y-8">
          {/* ============ TYPE MODE ============ */}
          {mode === "type" && (
            <>
              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  1. Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition"
                  autoFocus
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  2. Pick a style
                </label>
                <StylePicker
                  selected={preset.id}
                  onSelect={handlePresetSelect}
                />
              </section>

              {name.trim() && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Preview
                    </label>
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
                    <EmailPreviewMock senderName={name.split(" ")[0]}>
                      <SignaturePreview config={config} />
                    </EmailPreviewMock>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/50">
                      <SignaturePreview config={config} />
                    </div>
                  )}
                </section>
              )}

              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  3. Fine-tune{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <FineTunePanel
                  color={color}
                  onColorChange={setColor}
                  subtitle={subtitle}
                  onSubtitleChange={setSubtitle}
                  speed={speed}
                  onSpeedChange={setSpeed}
                  bgColor={bgColor}
                  onBgColorChange={setBgColor}
                  size={size}
                  onSizeChange={setSize}
                  loopMode={loopMode}
                  onLoopModeChange={setLoopMode}
                />
              </section>
            </>
          )}

          {/* ============ UPLOAD MODE ============ */}
          {mode === "upload" && (
            <>
              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  1. Upload your signature
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a photo or scan of your handwritten signature. We&apos;ll
                  animate it with a writing effect.
                </p>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {!uploadedImage ? (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition cursor-pointer"
                  >
                    <div className="text-3xl mb-2 text-gray-400">{"\u2191"}</div>
                    <div className="font-medium text-gray-700">
                      Click to upload
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      PNG, JPG, or SVG
                    </div>
                  </button>
                ) : (
                  <div className="max-w-md">
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4">
                      <img
                        src={uploadedImage}
                        alt="Uploaded signature"
                        className="h-16 object-contain"
                      />
                      <button
                        onClick={() => {
                          setUploadedImage(null);
                          setUploadImg(null);
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="ml-auto text-sm text-gray-500 hover:text-red-600 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {/* Preview */}
              {uploadImg && (
                <section>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-900 uppercase tracking-wide">
                      Preview
                    </label>
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
                    <EmailPreviewMock>
                      <UploadPreview config={uploadConfig} img={uploadImg} />
                    </EmailPreviewMock>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/50">
                      <UploadPreview config={uploadConfig} img={uploadImg} />
                    </div>
                  )}
                </section>
              )}

              {/* Fine-tune for upload */}
              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                  2. Fine-tune{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <div className="border border-gray-200 rounded-xl p-5 space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Speed
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-500">Fast</span>
                      <input
                        type="range"
                        min={25}
                        max={80}
                        value={uploadSpeed}
                        onChange={(e) => setUploadSpeed(Number(e.target.value))}
                        className="flex-1 accent-black"
                      />
                      <span className="text-xs text-gray-500">Slow</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUploadBg(null)}
                        className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                          uploadBg === null ? "border-black bg-gray-50" : "border-gray-200"
                        }`}
                      >
                        Transparent
                      </button>
                      <button
                        onClick={() => setUploadBg("#ffffff")}
                        className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                          uploadBg === "#ffffff" ? "border-black bg-gray-50" : "border-gray-200"
                        }`}
                      >
                        White
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setUploadSize(s)}
                          className={`px-3 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                            uploadSize === s ? "border-black bg-gray-50" : "border-gray-200"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Animation Behavior
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {([
                        { id: "once" as const, label: "Play once" },
                        { id: "loop" as const, label: "Loop" },
                        { id: "fade" as const, label: "Fade & repeat" },
                      ]).map((opt) => (
                        <button
                          key={opt.id}
                          onClick={() => setUploadLoopMode(opt.id)}
                          className={`px-3 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                            uploadLoopMode === opt.id ? "border-black bg-gray-50" : "border-gray-200"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </>
          )}

          {/* ============ AI MODE ============ */}
          {mode === "ai" && (
            <>
              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  1. Your name
                </label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  placeholder="Jeremy"
                  className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  2. Describe the style
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Be creative — describe the font, effects, colors, animations.
                  Your name will be automatically included.
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`e.g. "Playful bubble font with a star that traces around the letters" or "Bold graffiti style with spray paint effect, letter by letter reveal"`}
                  rows={3}
                  className="w-full max-w-lg px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition resize-none"
                />
              </section>

              <section>
                <label className="block text-sm font-semibold text-gray-900 mb-2 uppercase tracking-wide">
                  3. Reference image{" "}
                  <span className="text-gray-400 font-normal normal-case">
                    (optional)
                  </span>
                </label>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a style reference — a font you like, a logo, an example of
                  the look you want.
                </p>

                <input
                  ref={aiFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAiRefUpload}
                  className="hidden"
                />

                {!aiRefImage ? (
                  <button
                    onClick={() => aiFileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-300 rounded-xl px-6 py-4 text-center hover:border-gray-400 transition cursor-pointer"
                  >
                    <span className="text-sm font-medium text-gray-700">
                      Upload reference image
                    </span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-3 border border-gray-200 rounded-xl p-3">
                    <img
                      src={aiRefImage}
                      alt="Reference"
                      className="h-16 object-contain rounded"
                    />
                    <button
                      onClick={() => {
                        setAiRefImage(null);
                        if (aiFileInputRef.current) aiFileInputRef.current.value = "";
                      }}
                      className="text-sm text-gray-500 hover:text-red-600 transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </section>

              <section>
                <button
                  onClick={handleAiGenerate}
                  disabled={!aiName.trim() || aiGenerating}
                  className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {aiGenerating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Generating preview...
                    </span>
                  ) : aiImageUrl ? (
                    "Regenerate Preview"
                  ) : (
                    "Generate Preview"
                  )}
                </button>
                {aiError && (
                  <p className="text-red-500 text-sm mt-2">{aiError}</p>
                )}
              </section>

              {/* AI Image Preview (Step 1 result) */}
              {aiImageUrl && !aiVideoUrl && (
                <section>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/50">
                    <img
                      src={aiImageUrl}
                      alt={`Signature preview for ${aiName}`}
                      className="max-w-full h-auto max-h-48 rounded"
                    />
                  </div>
                  <p className="text-sm text-gray-500 mt-3">
                    Happy with this? Click below to animate it. Not quite right? Adjust your prompt and regenerate.
                  </p>
                </section>
              )}

              {/* AI Video Preview (Step 2 result) */}
              {aiVideoUrl && (
                <section>
                  <label className="block text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                    Animated Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-gray-50/50">
                    <video
                      src={aiVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-w-full h-auto max-h-48 rounded"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    This will be converted to an optimized GIF after checkout.
                  </p>
                </section>
              )}
            </>
          )}

          {/* CTA */}
          <section className="pt-4">
            {mode === "ai" && aiImageUrl && !aiVideoUrl ? (
              <>
                <button
                  onClick={handleAiAnimate}
                  disabled={aiAnimating}
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {aiAnimating ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                      Animating (~1-2 min)...
                    </span>
                  ) : (
                    "Get My Signature \u2014 $7"
                  )}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  This will animate your signature. One-time payment after animation.
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout || loading}
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white text-lg font-semibold rounded-xl hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  {loading ? "Redirecting..." : "Get My Signature \u2014 $7"}
                </button>
                <p className="text-xs text-gray-400 mt-2">
                  One-time payment. Download immediately after checkout.
                </p>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
