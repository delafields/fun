"use client";

import { useState } from "react";
import type { LoopMode } from "@/lib/signature-engine";

interface FineTuneProps {
  color: string;
  onColorChange: (color: string) => void;
  subtitle: string;
  onSubtitleChange: (subtitle: string) => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  bgColor: string | null;
  onBgColorChange: (bg: string | null) => void;
  size: "small" | "medium" | "large";
  onSizeChange: (size: "small" | "medium" | "large") => void;
  loopMode: LoopMode;
  onLoopModeChange: (mode: LoopMode) => void;
}

const SIZE_LABELS = {
  small: "Small (200px)",
  medium: "Medium (400px)",
  large: "Large (600px)",
};

const LOOP_OPTIONS: { id: LoopMode; label: string; desc: string }[] = [
  { id: "once", label: "Play once", desc: "Write then hold" },
  { id: "loop", label: "Loop", desc: "Repeat forever" },
  { id: "fade", label: "Fade & repeat", desc: "Write, fade out, repeat" },
];

export default function FineTunePanel({
  color,
  onColorChange,
  subtitle,
  onSubtitleChange,
  speed,
  onSpeedChange,
  bgColor,
  onBgColorChange,
  size,
  onSizeChange,
  loopMode,
  onLoopModeChange,
}: FineTuneProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition cursor-pointer"
      >
        <span>Fine-tune options</span>
        <svg
          className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {open && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-100 pt-4">
          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ink Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-10 h-10 rounded-lg border border-gray-300 cursor-pointer"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => onColorChange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-28 font-mono"
              />
            </div>
          </div>

          {/* Subtitle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title / Company{" "}
              <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => onSubtitleChange(e.target.value)}
              placeholder="e.g. CEO, Acme Corp"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
            />
          </div>

          {/* Speed */}
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
                value={speed}
                onChange={(e) => onSpeedChange(Number(e.target.value))}
                className="flex-1 accent-black"
              />
              <span className="text-xs text-gray-500">Slow</span>
            </div>
          </div>

          {/* Background */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Background
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onBgColorChange(null)}
                className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                  bgColor === null
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <span className="inline-block w-4 h-4 rounded border border-gray-300 mr-2 align-middle bg-[repeating-conic-gradient(#d1d5db_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]" />
                Transparent
              </button>
              <button
                onClick={() => onBgColorChange("#ffffff")}
                className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                  bgColor === "#ffffff"
                    ? "border-black bg-gray-50"
                    : "border-gray-200"
                }`}
              >
                <span className="inline-block w-4 h-4 rounded border border-gray-300 mr-2 align-middle bg-white" />
                White
              </button>
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Size
            </label>
            <div className="flex gap-2">
              {(["small", "medium", "large"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => onSizeChange(s)}
                  className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                    size === s
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {SIZE_LABELS[s]}
                </button>
              ))}
            </div>
          </div>

          {/* Loop Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Animation Behavior
            </label>
            <div className="flex gap-2 flex-wrap">
              {LOOP_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => onLoopModeChange(opt.id)}
                  className={`px-4 py-2 rounded-lg text-sm border-2 transition cursor-pointer ${
                    loopMode === opt.id
                      ? "border-black bg-gray-50"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium">{opt.label}</div>
                  <div className="text-xs text-gray-400">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
