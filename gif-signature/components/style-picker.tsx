"use client";

import { useEffect, useState } from "react";
import { PRESETS, type SignaturePreset } from "@/lib/presets";

interface StylePickerProps {
  selected: string;
  onSelect: (preset: SignaturePreset) => void;
}

export default function StylePicker({ selected, onSelect }: StylePickerProps) {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      const loads = PRESETS.map(async (preset) => {
        const font = new FontFace(preset.fontFamily, `url(${preset.fontFile})`);
        await font.load();
        document.fonts.add(font);
      });
      await Promise.all(loads);
      setFontsLoaded(true);
    }
    loadFonts();
  }, []);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {PRESETS.map((preset) => (
        <button
          key={preset.id}
          onClick={() => onSelect(preset)}
          className={`group relative p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer ${
            selected === preset.id
              ? "border-black bg-gray-50 shadow-md"
              : "border-gray-200 hover:border-gray-400 hover:shadow-sm"
          }`}
        >
          <div
            className={`text-3xl mb-1 truncate transition-opacity ${fontsLoaded ? "opacity-100" : "opacity-0"}`}
            style={{
              color: preset.color,
              fontFamily: `"${preset.fontFamily}", cursive`,
            }}
          >
            Aa
          </div>
          <div className="font-semibold text-sm text-gray-900">
            {preset.name}
          </div>
          <div className="text-xs text-gray-500">{preset.description}</div>
          {selected === preset.id && (
            <div className="absolute top-2 right-2 w-5 h-5 bg-black rounded-full flex items-center justify-center">
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
