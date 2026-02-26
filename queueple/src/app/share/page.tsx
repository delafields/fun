"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useCoupleData } from "@/hooks/useCoupleData";

function ShareContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get("code") || "";
  const { data } = useCoupleData(code);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (data?.members.partner) {
      router.replace("/dashboard");
    }
  }, [data, router]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement("input");
      input.value = code;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Queueple!",
          text: `Join me on Queueple! Use code: ${code}`,
        });
      } catch {
        // User cancelled share
      }
    } else {
      handleCopy();
    }
  }

  const digits = code.split("");

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2
          className="text-3xl font-bold text-slate-900 mb-2"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Share your code
        </h2>
        <p className="text-slate-500 mb-8">
          Give this to your partner to join
        </p>

        <div className="flex gap-2 justify-center mb-8">
          {digits.map((digit, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="w-13 h-16 bg-white rounded-xl flex items-center justify-center text-2xl font-bold text-slate-900 shadow-sm border border-slate-200"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {digit}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleCopy}
            className="w-full py-3 bg-indigo-500 text-white font-semibold rounded-2xl shadow-md hover:bg-indigo-600 transition-colors"
          >
            {copied ? "Copied!" : "Copy Code"}
          </motion.button>

          {"share" in navigator && (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={handleShare}
              className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-2xl hover:border-indigo-300 transition-colors"
            >
              Share
            </motion.button>
          )}
        </div>

        <motion.div
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="mt-12 text-slate-400 text-sm flex items-center justify-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          Waiting for your partner to join...
        </motion.div>

        <button
          onClick={() => router.push("/dashboard")}
          className="mt-6 text-indigo-500 font-medium text-sm hover:text-indigo-600 transition-colors"
        >
          Start adding ideas &rarr;
        </button>
      </motion.div>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-dvh bg-cream flex items-center justify-center">
          <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
