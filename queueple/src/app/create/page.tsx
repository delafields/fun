"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EmojiPicker } from "@/components/EmojiPicker";
import { useSession } from "@/hooks/useSession";

export default function CreatePage() {
  const router = useRouter();
  const { saveSession } = useSession();
  const [name, setName] = useState("");
  const [pin, setPin] = useState(["", "", "", ""]);
  const [emoji, setEmoji] = useState("😊");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  function handlePinChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value && index < 3) pinRefs.current[index + 1]?.focus();
  }

  function handlePinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  }

  async function handleCreate() {
    if (!name.trim()) {
      setError("What should we call you?");
      return;
    }

    const pinCode = pin.join("");
    if (pinCode.length !== 4) {
      setError("Set a 4-digit PIN for your couple");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/couple", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), emoji, pin: pinCode }),
      });

      if (!res.ok) throw new Error("Failed to create");

      const { code } = await res.json();
      saveSession({ coupleCode: code, role: "creator" });
      router.push(`/share?code=${code}`);
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center px-6 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm mt-16"
      >
        <button
          onClick={() => router.back()}
          className="text-slate-400 mb-8 text-sm flex items-center gap-1"
        >
          <span>&#8592;</span> Back
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <h2
            className="text-2xl font-bold text-slate-900 mb-1"
            style={{ fontFamily: "var(--font-outfit)" }}
          >
            Create your couple
          </h2>
          <p className="text-slate-500 text-sm mb-6">
            Your partner will join with a code
          </p>

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            maxLength={20}
            className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-slate-900 transition-colors mb-6"
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />

          <label className="block text-sm font-medium text-slate-700 mb-2">
            Set a couple PIN
          </label>
          <p className="text-slate-400 text-xs mb-3">
            Used to reconnect on a new device
          </p>
          <div className="flex gap-2 justify-center mb-6">
            {pin.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { pinRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handlePinChange(i, e.target.value)}
                onKeyDown={(e) => handlePinKeyDown(i, e)}
                className="digit-box"
              />
            ))}
          </div>

          <label className="block text-sm font-medium text-slate-700 mb-3">
            Pick your avatar
          </label>
          <EmojiPicker selected={emoji} onSelect={setEmoji} />

          {error && (
            <p className="text-rose-500 text-sm mt-4 text-center">{error}</p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCreate}
            disabled={loading}
            className="w-full mt-6 py-4 bg-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-md hover:bg-indigo-600 disabled:opacity-60 transition-all"
          >
            {loading ? "Creating..." : "Create"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
