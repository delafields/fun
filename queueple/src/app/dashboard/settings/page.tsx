"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useCouple } from "@/context/CoupleContext";

export default function SettingsPage() {
  const router = useRouter();
  const { data, me, partner, session, clearSession } = useCouple();
  const [copied, setCopied] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [pinRevealed, setPinRevealed] = useState(false);
  const [pinFetched, setPinFetched] = useState(false);
  const [pin, setPin] = useState<string | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [showSetPin, setShowSetPin] = useState(false);
  const [newPinDigits, setNewPinDigits] = useState(["", "", "", ""]);
  const [pinSaving, setPinSaving] = useState(false);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  if (!data || !me) return null;

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(data!.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  }

  async function handleRevealPin() {
    if (pinRevealed) {
      setPinRevealed(false);
      return;
    }
    if (pinFetched) {
      setPinRevealed(true);
      return;
    }
    setPinLoading(true);
    try {
      const res = await fetch(`/api/couple/pin?code=${session!.coupleCode}`);
      if (res.ok) {
        const { pin: fetchedPin } = await res.json();
        setPin(fetchedPin);
        setPinFetched(true);
        if (fetchedPin) {
          setPinRevealed(true);
        } else {
          setShowSetPin(true);
        }
      }
    } catch {
      // Silently fail
    } finally {
      setPinLoading(false);
    }
  }

  function handleNewPinChange(index: number, value: string) {
    if (value.length > 1) value = value.slice(-1);
    if (value && !/^\d$/.test(value)) return;
    const updated = [...newPinDigits];
    updated[index] = value;
    setNewPinDigits(updated);
    if (value && index < 3) pinInputRefs.current[index + 1]?.focus();
  }

  function handleNewPinKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === "Backspace" && !newPinDigits[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSavePin() {
    const newPin = newPinDigits.join("");
    if (newPin.length !== 4) return;
    setPinSaving(true);
    try {
      const res = await fetch("/api/couple/pin", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: session!.coupleCode, pin: newPin }),
      });
      if (res.ok) {
        setPin(newPin);
        setPinFetched(true);
        setShowSetPin(false);
        setPinRevealed(true);
      }
    } catch {
      // Silently fail
    } finally {
      setPinSaving(false);
    }
  }

  function handleLeave() {
    clearSession();
    router.replace("/");
  }

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 py-4">
        <button
          onClick={() => router.push("/dashboard")}
          className="text-slate-400 text-lg"
        >
          &#8592;
        </button>
        <h1
          className="text-xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Settings
        </h1>
      </div>

      <div className="space-y-4">
        {/* Profiles */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Your Couple</h3>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-3xl">{me.emoji}</span>
            <div>
              <p className="font-semibold text-slate-900">{me.name}</p>
              <p className="text-xs text-slate-400">You</p>
            </div>
          </div>
          {partner && (
            <div className="flex items-center gap-3">
              <span className="text-3xl">{partner.emoji}</span>
              <div>
                <p className="font-semibold text-slate-900">{partner.name}</p>
                <p className="text-xs text-slate-400">Your partner</p>
              </div>
            </div>
          )}
        </div>

        {/* Couple Code */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Couple Code
          </h3>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-slate-900 tracking-widest font-mono">
              {data.code}
            </span>
            <button
              onClick={handleCopyCode}
              className="text-sm text-indigo-500 font-medium"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Share this to reconnect on a new device
          </p>
        </div>

        {/* Couple PIN */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-2">
            Couple PIN
          </h3>
          {showSetPin ? (
            <>
              <p className="text-sm text-slate-600 mb-3">
                Set a 4-digit PIN to reconnect on new devices
              </p>
              <div className="flex gap-2 justify-center mb-4">
                {newPinDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { pinInputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleNewPinChange(i, e.target.value)}
                    onKeyDown={(e) => handleNewPinKeyDown(i, e)}
                    className="digit-box"
                  />
                ))}
              </div>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={handleSavePin}
                disabled={pinSaving || newPinDigits.join("").length !== 4}
                className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-2xl disabled:opacity-50 transition-colors"
              >
                {pinSaving ? "Saving..." : "Save PIN"}
              </motion.button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 tracking-widest font-mono">
                  {pinRevealed && pin ? pin : "****"}
                </span>
                <button
                  onClick={handleRevealPin}
                  disabled={pinLoading}
                  className="text-sm text-indigo-500 font-medium"
                >
                  {pinLoading ? "..." : pinRevealed ? "Hide" : "Reveal"}
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Needed to sign back in on a new device
              </p>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
          <h3 className="text-sm font-medium text-slate-500 mb-3">Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {data.categories.reduce((sum, c) => sum + c.items.length, 0)}
              </p>
              <p className="text-xs text-slate-400">Active items</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {data.categories.reduce((sum, c) => sum + c.history.length, 0)}
              </p>
              <p className="text-xs text-slate-400">Things done</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {data.categories.length}
              </p>
              <p className="text-xs text-slate-400">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">
                {Math.floor(
                  (Date.now() - new Date(data.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24)
                )}
              </p>
              <p className="text-xs text-slate-400">Days together</p>
            </div>
          </div>
        </div>

        {/* Leave */}
        <div className="pt-4">
          {!showLeaveConfirm ? (
            <button
              onClick={() => setShowLeaveConfirm(true)}
              className="w-full py-3 text-rose-500 text-sm font-medium"
            >
              Leave this couple
            </button>
          ) : (
            <div className="bg-rose-50 rounded-2xl p-4 text-center">
              <p className="text-sm text-slate-700 mb-3">
                This will sign you out. Your data will stay for your partner.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-2.5 bg-white text-slate-600 font-medium rounded-xl text-sm"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLeave}
                  className="flex-1 py-2.5 bg-rose-500 text-white font-medium rounded-xl text-sm"
                >
                  Leave
                </motion.button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
