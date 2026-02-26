"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { EmojiPicker } from "@/components/EmojiPicker";
import { useSession } from "@/hooks/useSession";

export default function JoinPage() {
  const router = useRouter();
  const { saveSession } = useSession();
  const [digits, setDigits] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState<"code" | "profile">("code");
  const [creatorName, setCreatorName] = useState("");
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("🦊");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const code = digits.join("");

  function handleDigitChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;

    const newDigits = [...digits];
    newDigits[index] = value;
    setDigits(newDigits);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handlePaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  }

  async function handleVerifyCode() {
    if (code.length !== 6) {
      setError("Enter all 6 digits");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch(`/api/couple?code=${code}`);
      if (!res.ok) {
        setError("Invalid code. Check with your partner!");
        return;
      }

      const data = await res.json();
      if (data.members.partner) {
        setError("This couple already has two members");
        return;
      }

      setCreatorName(data.members.creator.name);
      setStep("profile");
    } catch {
      setError("Something went wrong. Try again!");
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin() {
    if (!name.trim()) {
      setError("What should we call you?");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/couple/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, name: name.trim(), emoji }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to join");
        return;
      }

      saveSession({ coupleCode: code, role: "partner" });
      router.push("/dashboard");
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
          onClick={() => (step === "profile" ? setStep("code") : router.back())}
          className="text-slate-400 mb-8 text-sm flex items-center gap-1"
        >
          <span>&#8592;</span> Back
        </button>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          {step === "code" ? (
            <>
              <h2
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Join your partner
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Enter the 6-digit code they shared
              </p>

              <div className="flex gap-2 justify-center mb-6">
                {digits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={i === 0 ? handlePaste : undefined}
                    className="digit-box"
                  />
                ))}
              </div>

              {error && (
                <p className="text-rose-500 text-sm mb-4 text-center">
                  {error}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleVerifyCode}
                disabled={loading || code.length !== 6}
                className="w-full py-4 bg-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-md hover:bg-indigo-600 disabled:opacity-60 transition-all"
              >
                {loading ? "Checking..." : "Next"}
              </motion.button>
            </>
          ) : (
            <>
              <h2
                className="text-2xl font-bold text-slate-900 mb-1"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Join {creatorName}?
              </h2>
              <p className="text-slate-500 text-sm mb-6">
                Set up your profile
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
                onKeyDown={(e) => e.key === "Enter" && handleJoin()}
              />

              <label className="block text-sm font-medium text-slate-700 mb-3">
                Pick your avatar
              </label>
              <EmojiPicker selected={emoji} onSelect={setEmoji} />

              {error && (
                <p className="text-rose-500 text-sm mt-4 text-center">
                  {error}
                </p>
              )}

              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleJoin}
                disabled={loading}
                className="w-full mt-6 py-4 bg-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-md hover:bg-indigo-600 disabled:opacity-60 transition-all"
              >
                {loading ? "Joining..." : "Join"}
              </motion.button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
