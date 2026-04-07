"use client";

import { useState } from "react";
import { AI_PRESETS, type AiPreset } from "@/lib/ai-presets";

interface AiInspirationGalleryProps {
  onSelect: (preset: AiPreset) => void;
  selectedId?: string | null;
}

export default function AiInspirationGallery({
  onSelect,
  selectedId,
}: AiInspirationGalleryProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
      {AI_PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset)}
          className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 cursor-pointer ${
            selectedId === preset.id
              ? "border-[#1F5CF7] bg-[#EEF5FF] shadow-md shadow-blue-500/10"
              : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
          }`}
        >
          {/* Example image or placeholder */}
          {preset.referenceImage ? (
            <div className="aspect-[2/1] rounded-lg overflow-hidden mb-3 bg-gray-100">
              <img
                src={preset.referenceImage}
                alt={preset.name}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="aspect-[2/1] rounded-lg mb-3 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
              <span className="text-xs font-medium text-[#A8A29E] uppercase tracking-wider">
                {preset.name}
              </span>
            </div>
          )}

          <div className="font-semibold text-sm text-[#1C1917] mb-0.5">
            {preset.name}
          </div>
          <div className="text-xs text-[#79716B] leading-snug line-clamp-2">
            {preset.description}
          </div>

          {selectedId === preset.id && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-[#1F5CF7] rounded-full flex items-center justify-center">
              <svg
                className="w-3 h-3 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={3}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
