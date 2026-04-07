"use client";

import { useState, useMemo, useRef, useCallback } from "react";
import SignaturePreview from "@/components/signature-preview";
import UploadPreview from "@/components/upload-preview";
import StylePicker from "@/components/style-picker";
import FineTunePanel from "@/components/fine-tune-panel";
import ExtrasPanel from "@/components/extras-panel";
import { PRESETS, type SignaturePreset } from "@/lib/presets";
import type { SignatureConfig, LoopMode } from "@/lib/signature-engine";
import type { UploadConfig } from "@/lib/upload-engine";
import type { SignatureExtras } from "@/lib/extras";
import { calculateExtrasHeight, hasExtras } from "@/lib/extras";
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

  // Extras state (shared between type and upload modes)
  const [extras, setExtras] = useState<SignatureExtras>({});

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
  const [aiImageUrl, setAiImageUrl] = useState<string | null>(null);
  const [aiVideoUrl, setAiVideoUrl] = useState<string | null>(null);
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

  const activeExtras = hasExtras(extras) ? extras : undefined;

  const config: SignatureConfig = useMemo(
    () => {
      const base = SIZE_MAP[size];
      const extrasH = calculateExtrasHeight(activeExtras);
      return {
        name,
        subtitle: subtitle || undefined,
        fontFile: preset.fontFile,
        color,
        strokeWidth: preset.strokeWidth,
        speed,
        fontSize: preset.fontSize,
        bgColor,
        loopMode,
        width: base.width,
        height: base.height + extrasH,
        extras: activeExtras,
      };
    },
    [name, subtitle, preset, color, speed, bgColor, size, loopMode, activeExtras]
  );

  const uploadConfig: UploadConfig = useMemo(
    () => {
      const base = SIZE_MAP[uploadSize];
      const extrasH = calculateExtrasHeight(activeExtras);
      return {
        imageData: uploadedImage || "",
        speed: uploadSpeed,
        bgColor: uploadBg,
        loopMode: uploadLoopMode,
        width: base.width,
        height: base.height + extrasH,
        extras: activeExtras,
      };
    },
    [uploadedImage, uploadSpeed, uploadBg, uploadSize, uploadLoopMode, activeExtras]
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

      if (extras.headshot) {
        localStorage.setItem("gif-sig-headshot", extras.headshot);
      }

      if (mode === "type") {
        if (!name.trim()) return;
        checkoutConfig = { mode: "type", ...config };
        if (checkoutConfig.extras) {
          const { headshot, ...restExtras } = checkoutConfig.extras as SignatureExtras;
          checkoutConfig.extras = restExtras;
        }
      } else if (mode === "upload") {
        if (!uploadedImage) return;
        localStorage.setItem("gif-sig-upload-image", uploadedImage);
        checkoutConfig = { mode: "upload", ...uploadConfig };
        if (checkoutConfig.extras) {
          const { headshot, ...restExtras } = checkoutConfig.extras as SignatureExtras;
          checkoutConfig.extras = restExtras;
        }
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
    <div className="min-h-screen bg-[#F8F6F4]">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <svg
              className="w-7 h-7 text-[#1F5CF7]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.042 21.672L13.684 16.6m0 0l-2.51 2.225.569-9.47 5.227 7.917-3.286-.672zm-7.518-.267A8.25 8.25 0 1120.25 10.5M8.288 14.212A5.25 5.25 0 1117.25 10.5"
              />
            </svg>
            <span className="text-lg font-bold tracking-tight text-[#1C1917]">
              GIF Signature
            </span>
          </Link>
          <Link
            href="/"
            className="text-sm text-[#79716B] hover:text-[#1F5CF7] transition-colors"
          >
            &larr; Back
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 md:py-14">
        {/* Page heading */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-5xl font-bold tracking-[-0.03em] text-[#1C1917] mb-3">
            Create your signature
          </h1>
          <p className="text-[#79716B] text-lg">
            Choose how you want to create your animated email signature.
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 bg-white rounded-2xl p-1.5 mb-10 max-w-lg shadow-sm border border-gray-100">
          {([
            { id: "type", label: "Type it", icon: "T" },
            { id: "upload", label: "Upload it", icon: "\u2191" },
            { id: "ai", label: "AI Generate", icon: "\u2728" },
          ] as const).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                mode === tab.id
                  ? "bg-[#1F5CF7] text-white shadow-md shadow-blue-500/20"
                  : "text-[#79716B] hover:text-[#1C1917]"
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
              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 1
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-4">
                  Your name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Smith"
                  className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1F5CF7] transition bg-white"
                  autoFocus
                />
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 2
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-4">
                  Pick a style
                </label>
                <StylePicker
                  selected={preset.id}
                  onSelect={handlePresetSelect}
                />
              </section>

              {name.trim() && (
                <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-bold text-[#1C1917]">
                      Preview
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${!showEmailPreview ? "text-[#1C1917] font-medium" : "text-[#A8A29E]"}`}>Signature</span>
                      <button
                        onClick={() => setShowEmailPreview(!showEmailPreview)}
                        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showEmailPreview ? "bg-[#1F5CF7]" : "bg-gray-300"}`}
                        role="switch"
                        aria-checked={showEmailPreview}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showEmailPreview ? "translate-x-4" : ""}`} />
                      </button>
                      <span className={`text-xs ${showEmailPreview ? "text-[#1C1917] font-medium" : "text-[#A8A29E]"}`}>In email</span>
                    </div>
                  </div>
                  {showEmailPreview ? (
                    <EmailPreviewMock senderName={name.split(" ")[0]}>
                      <SignaturePreview config={config} />
                    </EmailPreviewMock>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-[#F8F6F4]">
                      <SignaturePreview config={config} />
                    </div>
                  )}
                </section>
              )}

              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 3
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-1">
                  Fine-tune{" "}
                  <span className="text-[#A8A29E] font-normal text-base">
                    (optional)
                  </span>
                </label>
                <p className="text-sm text-[#79716B] mb-4">Customize colors, speed, size, and add extras.</p>
                <div className="space-y-3">
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
                  <ExtrasPanel
                    extras={extras}
                    onExtrasChange={setExtras}
                  />
                </div>
              </section>
            </>
          )}

          {/* ============ UPLOAD MODE ============ */}
          {mode === "upload" && (
            <>
              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 1
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-2">
                  Upload your signature
                </label>
                <p className="text-sm text-[#79716B] mb-5">
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
                    className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#1F5CF7] hover:bg-[#EEF5FF]/30 transition cursor-pointer"
                  >
                    <div className="w-12 h-12 bg-[#EEF5FF] text-[#1F5CF7] rounded-xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <div className="font-semibold text-[#1C1917]">
                      Click to upload
                    </div>
                    <div className="text-sm text-[#A8A29E] mt-1">
                      PNG, JPG, or SVG
                    </div>
                  </button>
                ) : (
                  <div className="max-w-md">
                    <div className="border border-gray-200 rounded-xl p-4 flex items-center gap-4 bg-[#F8F6F4]">
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
                        className="ml-auto text-sm text-[#79716B] hover:text-red-600 transition cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                )}
              </section>

              {uploadImg && (
                <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <label className="block text-lg font-bold text-[#1C1917]">
                      Preview
                    </label>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs ${!showEmailPreview ? "text-[#1C1917] font-medium" : "text-[#A8A29E]"}`}>Signature</span>
                      <button
                        onClick={() => setShowEmailPreview(!showEmailPreview)}
                        className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${showEmailPreview ? "bg-[#1F5CF7]" : "bg-gray-300"}`}
                        role="switch"
                        aria-checked={showEmailPreview}
                      >
                        <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${showEmailPreview ? "translate-x-4" : ""}`} />
                      </button>
                      <span className={`text-xs ${showEmailPreview ? "text-[#1C1917] font-medium" : "text-[#A8A29E]"}`}>In email</span>
                    </div>
                  </div>
                  {showEmailPreview ? (
                    <EmailPreviewMock>
                      <UploadPreview config={uploadConfig} img={uploadImg} />
                    </EmailPreviewMock>
                  ) : (
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-[#F8F6F4]">
                      <UploadPreview config={uploadConfig} img={uploadImg} />
                    </div>
                  )}
                </section>
              )}

              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 2
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-1">
                  Fine-tune{" "}
                  <span className="text-[#A8A29E] font-normal text-base">
                    (optional)
                  </span>
                </label>
                <p className="text-sm text-[#79716B] mb-4">Adjust speed, background, size, and add extras.</p>
                <div className="space-y-3">
                <div className="border border-gray-200 rounded-xl p-5 space-y-5 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">
                      Animation Speed
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-[#A8A29E]">Fast</span>
                      <input
                        type="range"
                        min={25}
                        max={80}
                        value={uploadSpeed}
                        onChange={(e) => setUploadSpeed(Number(e.target.value))}
                        className="flex-1 accent-[#1F5CF7]"
                      />
                      <span className="text-xs text-[#A8A29E]">Slow</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">
                      Background
                    </label>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setUploadBg(null)}
                        className={`px-4 py-2 rounded-xl text-sm border-2 transition cursor-pointer ${
                          uploadBg === null ? "border-[#1F5CF7] bg-[#EEF5FF] text-[#1F5CF7]" : "border-gray-200 text-[#79716B]"
                        }`}
                      >
                        Transparent
                      </button>
                      <button
                        onClick={() => setUploadBg("#ffffff")}
                        className={`px-4 py-2 rounded-xl text-sm border-2 transition cursor-pointer ${
                          uploadBg === "#ffffff" ? "border-[#1F5CF7] bg-[#EEF5FF] text-[#1F5CF7]" : "border-gray-200 text-[#79716B]"
                        }`}
                      >
                        White
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">
                      Size
                    </label>
                    <div className="flex gap-2">
                      {(["small", "medium", "large"] as const).map((s) => (
                        <button
                          key={s}
                          onClick={() => setUploadSize(s)}
                          className={`px-3 py-2 rounded-xl text-sm border-2 transition cursor-pointer ${
                            uploadSize === s ? "border-[#1F5CF7] bg-[#EEF5FF] text-[#1F5CF7]" : "border-gray-200 text-[#79716B]"
                          }`}
                        >
                          {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#1C1917] mb-2">
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
                          className={`px-3 py-2 rounded-xl text-sm border-2 transition cursor-pointer ${
                            uploadLoopMode === opt.id ? "border-[#1F5CF7] bg-[#EEF5FF] text-[#1F5CF7]" : "border-gray-200 text-[#79716B]"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <ExtrasPanel
                  extras={extras}
                  onExtrasChange={setExtras}
                />
                </div>
              </section>
            </>
          )}

          {/* ============ AI MODE ============ */}
          {mode === "ai" && (
            <>
              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 1
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-4">
                  Your name
                </label>
                <input
                  type="text"
                  value={aiName}
                  onChange={(e) => setAiName(e.target.value)}
                  placeholder="Jeremy"
                  className="w-full max-w-md px-4 py-3 text-lg border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1F5CF7] transition bg-white"
                />
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 2
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-2">
                  Describe the style
                </label>
                <p className="text-sm text-[#79716B] mb-4">
                  Be creative — describe the font, effects, colors, animations.
                  Your name will be automatically included.
                </p>
                <textarea
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder={`e.g. "Playful bubble font with a star that traces around the letters" or "Bold graffiti style with spray paint effect, letter by letter reveal"`}
                  rows={3}
                  className="w-full max-w-lg px-4 py-3 text-base border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#1F5CF7] transition resize-none bg-white"
                />
              </section>

              <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                <label className="block text-xs font-semibold text-[#1F5CF7] mb-2 uppercase tracking-wider">
                  Step 3
                </label>
                <label className="block text-lg font-bold text-[#1C1917] mb-2">
                  Reference image{" "}
                  <span className="text-[#A8A29E] font-normal text-base">
                    (optional)
                  </span>
                </label>
                <p className="text-sm text-[#79716B] mb-4">
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
                    className="border-2 border-dashed border-gray-300 rounded-xl px-6 py-4 text-center hover:border-[#1F5CF7] hover:bg-[#EEF5FF]/30 transition cursor-pointer"
                  >
                    <span className="text-sm font-medium text-[#79716B]">
                      Upload reference image
                    </span>
                  </button>
                ) : (
                  <div className="inline-flex items-center gap-3 border border-gray-200 rounded-xl p-3 bg-[#F8F6F4]">
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
                      className="text-sm text-[#79716B] hover:text-red-600 transition cursor-pointer"
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
                  className="px-6 py-3 bg-[#1F5CF7] text-white font-semibold rounded-xl hover:bg-[#1a4fd4] disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-blue-500/20"
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

              {aiImageUrl && !aiVideoUrl && (
                <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                  <label className="block text-lg font-bold text-[#1C1917] mb-4">
                    Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-[#F8F6F4]">
                    <img
                      src={aiImageUrl}
                      alt={`Signature preview for ${aiName}`}
                      className="max-w-full h-auto max-h-48 rounded"
                    />
                  </div>
                  <p className="text-sm text-[#79716B] mt-3">
                    Happy with this? Click below to animate it. Not quite right? Adjust your prompt and regenerate.
                  </p>
                </section>
              )}

              {aiVideoUrl && (
                <section className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
                  <label className="block text-lg font-bold text-[#1C1917] mb-4">
                    Animated Preview
                  </label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 flex items-center justify-center bg-[#F8F6F4]">
                    <video
                      src={aiVideoUrl}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="max-w-full h-auto max-h-48 rounded"
                    />
                  </div>
                  <p className="text-xs text-[#A8A29E] mt-2">
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
                  className="w-full sm:w-auto px-8 py-4 bg-[#1F5CF7] text-white text-lg font-semibold rounded-xl hover:bg-[#1a4fd4] disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-blue-500/20"
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
                <p className="text-xs text-[#A8A29E] mt-2">
                  This will animate your signature. One-time payment after animation.
                </p>
              </>
            ) : (
              <>
                <button
                  onClick={handleCheckout}
                  disabled={!canCheckout || loading}
                  className="w-full sm:w-auto px-8 py-4 bg-[#1F5CF7] text-white text-lg font-semibold rounded-xl hover:bg-[#1a4fd4] disabled:bg-gray-300 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-blue-500/20"
                >
                  {loading ? "Redirecting..." : "Get My Signature \u2014 $7"}
                </button>
                <p className="text-xs text-[#A8A29E] mt-2">
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
