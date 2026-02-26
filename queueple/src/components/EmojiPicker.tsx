"use client";

import { EMOJI_OPTIONS } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  selected: string;
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ selected, onSelect }: EmojiPickerProps) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {EMOJI_OPTIONS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          onClick={() => onSelect(emoji)}
          className={cn(
            "w-12 h-12 text-2xl rounded-xl flex items-center justify-center transition-all",
            selected === emoji
              ? "bg-indigo-50 ring-2 ring-indigo-500 scale-110"
              : "bg-white hover:bg-slate-50 active:scale-95"
          )}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}
