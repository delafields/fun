"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCouple } from "@/context/CoupleContext";
import { cn } from "@/lib/utils";
import { CATEGORY_ICON_OPTIONS } from "@/lib/constants";

export default function DashboardPage() {
  const router = useRouter();
  const { data, me, partner, myRole, refetch, session } = useCouple();
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatIcon, setNewCatIcon] = useState("🎯");
  const [addingCategory, setAddingCategory] = useState(false);

  if (!data || !me) return null;

  const waitingForPartner = !data.members.partner;

  async function handleAddCategory() {
    if (!newCatName.trim() || !session) return;
    setAddingCategory(true);
    try {
      await fetch("/api/couple/category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: session.coupleCode,
          name: newCatName.trim(),
          icon: newCatIcon,
        }),
      });
      setNewCatName("");
      setShowAddCategory(false);
      await refetch();
    } finally {
      setAddingCategory(false);
    }
  }

  return (
    <div className="px-4 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between py-4">
        <h1
          className="text-2xl font-bold text-slate-900"
          style={{ fontFamily: "var(--font-outfit)" }}
        >
          Queueple
        </h1>
        <button
          onClick={() => router.push("/dashboard/settings")}
          className="flex items-center gap-1"
        >
          <span className="text-xl">{me.emoji}</span>
          {partner && <span className="text-xl -ml-1">{partner.emoji}</span>}
        </button>
      </div>

      {/* Waiting for partner banner */}
      {waitingForPartner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-amber-50 rounded-2xl border border-amber-200"
        >
          <p className="text-sm text-slate-700">
            Waiting for your partner to join...
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Share code: <span className="font-mono font-bold text-indigo-600">{data.code}</span>
          </p>
        </motion.div>
      )}

      {/* Greeting */}
      <p className="text-slate-500 mb-4 text-sm">
        {partner
          ? `${me.name} & ${partner.name}'s picks`
          : `Hey ${me.name}! Add some ideas while you wait.`}
      </p>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.categories.map((category, index) => {
          const isMyTurn = category.currentTurn === myRole;
          const turnMember = category.currentTurn === "creator"
            ? data.members.creator
            : data.members.partner;

          return (
            <motion.button
              key={category.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => router.push(`/dashboard/category/${category.id}`)}
              className={cn(
                "bg-white rounded-2xl p-4 text-left shadow-sm border transition-all",
                isMyTurn && partner
                  ? "border-amber-300 your-turn-glow"
                  : "border-slate-100"
              )}
            >
              <span className="text-3xl block mb-2">{category.icon}</span>
              <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1">
                {category.name}
              </h3>
              <p className="text-xs text-slate-400">
                {category.items.length} option{category.items.length !== 1 ? "s" : ""}
              </p>
              {partner && (
                <div
                  className={cn(
                    "mt-2 text-xs font-medium px-2 py-0.5 rounded-full inline-block",
                    isMyTurn
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-100 text-slate-500"
                  )}
                >
                  {isMyTurn ? "Your turn" : `${turnMember?.emoji || ""} ${turnMember?.name || ""}`}
                </div>
              )}
            </motion.button>
          );
        })}

        {/* Add Category Card */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddCategory(true)}
          className="rounded-2xl p-4 text-left border-2 border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[140px] hover:border-indigo-300 transition-colors"
        >
          <span className="text-2xl text-slate-300 mb-1">+</span>
          <span className="text-xs text-slate-400 font-medium">Add Category</span>
        </motion.button>
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 sheet-backdrop z-50 flex items-end justify-center"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddCategory(false);
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-t-3xl w-full max-w-lg p-6 safe-bottom"
            >
              <h3
                className="text-xl font-bold text-slate-900 mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                New Category
              </h3>

              <input
                type="text"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name"
                maxLength={30}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-slate-900 transition-colors mb-4"
                autoFocus
              />

              <label className="block text-sm font-medium text-slate-700 mb-2">
                Pick an icon
              </label>
              <div className="flex flex-wrap gap-2 mb-6">
                {CATEGORY_ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setNewCatIcon(icon)}
                    className={cn(
                      "w-10 h-10 text-xl rounded-xl flex items-center justify-center transition-all",
                      newCatIcon === icon
                        ? "bg-indigo-50 ring-2 ring-indigo-500"
                        : "bg-slate-50 hover:bg-slate-100"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="flex-1 py-3 text-slate-500 font-medium rounded-2xl bg-slate-100"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddCategory}
                  disabled={!newCatName.trim() || addingCategory}
                  className="flex-1 py-3 text-white font-semibold rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  {addingCategory ? "Adding..." : "Add"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
