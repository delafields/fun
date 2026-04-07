"use client";

import { useState, useRef } from "react";
import type { SignatureExtras } from "@/lib/extras";

interface ExtrasPanelProps {
  extras: SignatureExtras;
  onExtrasChange: (extras: SignatureExtras) => void;
}

export default function ExtrasPanel({
  extras,
  onExtrasChange,
}: ExtrasPanelProps) {
  const [open, setOpen] = useState(false);
  const headshotInputRef = useRef<HTMLInputElement>(null);

  const update = (partial: Partial<SignatureExtras>) => {
    onExtrasChange({ ...extras, ...partial });
  };

  const updateSocial = (
    platform: keyof NonNullable<SignatureExtras["socials"]>,
    value: string
  ) => {
    update({
      socials: { ...extras.socials, [platform]: value || undefined },
    });
  };

  const updateCta = (field: "text" | "url", value: string) => {
    const current = extras.cta || { text: "", url: "" };
    update({ cta: { ...current, [field]: value } });
  };

  const handleHeadshotUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update({ headshot: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 text-sm font-medium text-[#1C1917] hover:bg-[#F8F6F4] transition cursor-pointer"
      >
        <span>
          Stand-out extras{" "}
          <span className="text-[#A8A29E] font-normal">(optional)</span>
        </span>
        <svg
          className={`w-4 h-4 text-[#A8A29E] transition-transform ${open ? "rotate-180" : ""}`}
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
        <div className="px-5 pb-5 space-y-6 border-t border-gray-100 pt-4">
          {/* Headshot / Logo */}
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1">
              Headshot / Logo
            </label>
            <p className="text-xs text-[#A8A29E] mb-2">
              Add a photo or company logo next to your signature
            </p>
            <input
              ref={headshotInputRef}
              type="file"
              accept="image/*"
              onChange={handleHeadshotUpload}
              className="hidden"
            />
            {!extras.headshot ? (
              <button
                onClick={() => headshotInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-xl px-4 py-3 text-center hover:border-[#1F5CF7] hover:bg-[#EEF5FF]/30 transition cursor-pointer text-sm text-[#79716B] w-full"
              >
                Upload image
              </button>
            ) : (
              <div className="flex items-center gap-3 border border-gray-200 rounded-xl p-2 bg-[#F8F6F4]">
                <img
                  src={extras.headshot}
                  alt="Headshot"
                  className="w-10 h-10 rounded-full object-cover"
                />
                <button
                  onClick={() => {
                    update({ headshot: undefined });
                    if (headshotInputRef.current)
                      headshotInputRef.current.value = "";
                  }}
                  className="ml-auto text-xs text-[#79716B] hover:text-red-600 transition cursor-pointer"
                >
                  Remove
                </button>
              </div>
            )}
          </div>

          {/* Social Links */}
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1">
              Social Links
            </label>
            <p className="text-xs text-[#A8A29E] mb-2">
              Add icon badges for your profiles
            </p>
            <div className="space-y-2">
              {(
                [
                  {
                    key: "linkedin" as const,
                    label: "LinkedIn",
                    placeholder: "linkedin.com/in/yourname",
                    color: "#0A66C2",
                  },
                  {
                    key: "twitter" as const,
                    label: "X / Twitter",
                    placeholder: "x.com/yourname",
                    color: "#000",
                  },
                  {
                    key: "github" as const,
                    label: "GitHub",
                    placeholder: "github.com/yourname",
                    color: "#24292e",
                  },
                  {
                    key: "website" as const,
                    label: "Website",
                    placeholder: "yoursite.com",
                    color: "#059669",
                  },
                ] as const
              ).map((social) => (
                <div key={social.key} className="flex items-center gap-2">
                  <span
                    className="w-5 h-5 rounded text-[9px] font-bold text-white flex items-center justify-center shrink-0"
                    style={{ backgroundColor: social.color }}
                  >
                    {social.key === "linkedin"
                      ? "in"
                      : social.key === "twitter"
                        ? "\ud835\udd4f"
                        : social.key === "github"
                          ? "GH"
                          : "\u2295"}
                  </span>
                  <input
                    type="text"
                    value={extras.socials?.[social.key] || ""}
                    onChange={(e) => updateSocial(social.key, e.target.value)}
                    placeholder={social.placeholder}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F5CF7]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Banner */}
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1">
              Call to Action
            </label>
            <p className="text-xs text-[#A8A29E] mb-2">
              Add a button-style banner below your signature
            </p>
            <div className="space-y-2">
              <input
                type="text"
                value={extras.cta?.text || ""}
                onChange={(e) => updateCta("text", e.target.value)}
                placeholder='e.g. "Book a call" or "View my portfolio"'
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F5CF7]"
              />
              <input
                type="text"
                value={extras.cta?.url || ""}
                onChange={(e) => updateCta("url", e.target.value)}
                placeholder="https://calendly.com/you"
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F5CF7] font-mono text-xs"
              />
            </div>
          </div>

          {/* QR Code */}
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-1">
              QR Code
            </label>
            <p className="text-xs text-[#A8A29E] mb-2">
              Scannable link to your Calendly, LinkedIn, portfolio, etc.
            </p>
            <input
              type="text"
              value={extras.qrUrl || ""}
              onChange={(e) => update({ qrUrl: e.target.value || undefined })}
              placeholder="https://calendly.com/you"
              className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#1F5CF7] font-mono text-xs"
            />
          </div>
        </div>
      )}
    </div>
  );
}
