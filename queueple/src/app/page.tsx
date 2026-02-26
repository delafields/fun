"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useSession } from "@/hooks/useSession";

export default function LandingPage() {
  const router = useRouter();
  const { session, loaded } = useSession();

  useEffect(() => {
    if (loaded && session?.coupleCode) {
      router.replace("/dashboard");
    }
  }, [loaded, session, router]);

  if (!loaded || session?.coupleCode) {
    return (
      <div className="min-h-dvh bg-cream flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-cream flex flex-col items-center justify-center px-6 safe-top safe-bottom">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center w-full max-w-xs"
      >
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: "spring" }}
          className="text-7xl mb-4"
        >
          💕
        </motion.div>

        <h1
          className="text-5xl font-bold text-slate-900 mb-3 tracking-tight"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Queueple
        </h1>

        <p className="text-slate-500 text-lg mb-12">
          Take turns, make memories
        </p>

        <div className="flex flex-col gap-4 w-full">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/create")}
            className="w-full py-4 bg-indigo-500 text-white font-semibold text-lg rounded-2xl shadow-md hover:bg-indigo-600 transition-colors"
          >
            Start a Couple
          </motion.button>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => router.push("/join")}
            className="w-full py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold text-lg rounded-2xl hover:border-indigo-300 transition-colors"
          >
            Join Your Partner
          </motion.button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="mt-16 text-slate-400 text-sm"
      >
        No emails. No passwords. Just a code.
      </motion.div>
    </div>
  );
}
