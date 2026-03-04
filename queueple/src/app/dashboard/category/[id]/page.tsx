"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useCouple } from "@/context/CoupleContext";
import { cn, timeAgo } from "@/lib/utils";
import { Item } from "@/lib/types";

export default function CategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { data, me, partner, myRole, session, refetch } = useCouple();

  const [showAddItem, setShowAddItem] = useState(false);
  const [itemText, setItemText] = useState("");
  const [itemNote, setItemNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [pickingItem, setPickingItem] = useState<Item | null>(null);
  const [picking, setPicking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [queueExpanded, setQueueExpanded] = useState(false);

  if (!data || !me || !session) return null;

  const category = data.categories.find((c) => c.id === categoryId);
  if (!category) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500">Category not found</p>
        <button onClick={() => router.back()} className="text-indigo-500 mt-2">
          Go back
        </button>
      </div>
    );
  }

  const isMyTurn = category.currentTurn === myRole;
  const turnMember =
    category.currentTurn === "creator"
      ? data.members.creator
      : data.members.partner;

  // Split items into my queue and partner's queue
  const myItems = category.items.filter((i) => i.addedBy === myRole);
  const partnerItems = category.items.filter((i) => i.addedBy !== myRole);

  const myNextPick = myItems[0] || null;
  const partnerNextPick = partnerItems[0] || null;
  const myQueueRest = myItems.slice(1);

  const streak = category.streak || { by: "creator", count: 0 };
  const streakMember =
    streak.by === "creator" ? data.members.creator : data.members.partner;

  const memberForId = (id: "creator" | "partner") =>
    id === "creator" ? data.members.creator : data.members.partner;

  async function handleAddItem() {
    if (!itemText.trim()) return;
    setAdding(true);
    try {
      await fetch("/api/couple/item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: session!.coupleCode,
          categoryId,
          text: itemText.trim(),
          note: itemNote.trim() || undefined,
          addedBy: myRole,
        }),
      });
      setItemText("");
      setItemNote("");
      setShowAddItem(false);
      await refetch();
    } finally {
      setAdding(false);
    }
  }

  async function handlePick() {
    if (!pickingItem) return;
    setPicking(true);
    try {
      const res = await fetch("/api/couple/pick", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: session!.coupleCode,
          categoryId,
          itemId: pickingItem.id,
          pickedBy: myRole,
        }),
      });
      if (res.ok) {
        setPickingItem(null);
        await refetch();
      }
    } finally {
      setPicking(false);
    }
  }

  async function handleDeleteItem(itemId: string) {
    await fetch("/api/couple/item", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: session!.coupleCode,
        categoryId,
        itemId,
      }),
    });
    await refetch();
  }

  async function handleMoveItem(itemId: string, direction: "up" | "down") {
    const idx = myItems.findIndex((i) => i.id === itemId);
    if (idx === -1) return;
    // Can't move first item up further (index 0 is the "next pick" card, queue starts at 1)
    if (direction === "up" && idx <= 1) return;
    if (direction === "down" && idx >= myItems.length - 1) return;

    const newOrder = [...myItems];
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];

    await fetch("/api/couple/reorder", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: session!.coupleCode,
        categoryId,
        role: myRole,
        itemIds: newOrder.map((i) => i.id),
      }),
    });
    await refetch();
  }

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/dashboard")}
            className="text-slate-400 text-lg"
          >
            &#8592;
          </button>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{category.icon}</span>
            <h1
              className="text-xl font-bold text-slate-900"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              {category.name}
            </h1>
          </div>
        </div>
        <button
          onClick={() => setShowHistory(!showHistory)}
          className={cn(
            "text-sm font-medium px-3 py-1.5 rounded-full transition-colors",
            showHistory
              ? "bg-indigo-500 text-white"
              : "bg-slate-100 text-slate-600"
          )}
        >
          {showHistory ? "Items" : "History"}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-4 pb-28 overflow-y-auto">
        {showHistory ? (
          /* ─── HISTORY VIEW ─── */
          category.history.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-4xl mb-3">📜</p>
              <p className="text-slate-400">Nothing picked yet!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {category.history.map((entry, i) => {
                const picker = memberForId(entry.pickedBy);
                return (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-slate-200"
                  >
                    <p className="font-medium text-slate-900">{entry.itemText}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-slate-400">
                        {picker?.emoji} {picker?.name} picked
                      </span>
                      <span className="text-xs text-slate-400">
                        {timeAgo(entry.pickedAt)}
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )
        ) : (
          /* ─── NEXT PICKS VIEW ─── */
          <div className="space-y-4">
            {/* Turn Banner */}
            {partner && (
              <div
                className={cn(
                  "p-3 rounded-2xl text-center text-sm font-medium",
                  isMyTurn
                    ? "bg-amber-100 text-amber-800"
                    : "bg-slate-100 text-slate-600"
                )}
              >
                {isMyTurn ? (
                  <span>Your turn to pick! {me.emoji}</span>
                ) : (
                  <span>
                    {turnMember?.emoji} {turnMember?.name}&apos;s turn to pick
                  </span>
                )}
              </div>
            )}

            {/* Your Suggestion Card */}
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                Your suggestion
              </p>
              {myNextPick ? (
                <motion.div
                  layout
                  className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
                >
                  <p className="font-semibold text-slate-900 text-lg">
                    {myNextPick.text}
                  </p>
                  {myNextPick.note && (
                    <p className="text-sm text-slate-400 mt-1">
                      {myNextPick.note}
                    </p>
                  )}
                  {isMyTurn && partner && (
                    <motion.button
                      whileTap={{ scale: 0.97 }}
                      onClick={() => setPickingItem(myNextPick)}
                      className="mt-3 w-full py-2.5 bg-indigo-500 text-white font-medium rounded-xl text-sm hover:bg-indigo-600 transition-colors"
                    >
                      Pick This
                    </motion.button>
                  )}
                </motion.div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 text-center">
                  <p className="text-slate-400 text-sm">
                    You haven&apos;t added anything yet
                  </p>
                </div>
              )}
            </div>

            {/* Partner's Suggestion Card */}
            {partner && (
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">
                  {partner.name}&apos;s suggestion
                </p>
                {partnerNextPick ? (
                  <motion.div
                    layout
                    className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200"
                  >
                    <p className="font-semibold text-slate-900 text-lg">
                      {partnerNextPick.text}
                    </p>
                    {partnerNextPick.note && (
                      <p className="text-sm text-slate-400 mt-1">
                        {partnerNextPick.note}
                      </p>
                    )}
                    {isMyTurn && (
                      <motion.button
                        whileTap={{ scale: 0.97 }}
                        onClick={() => setPickingItem(partnerNextPick)}
                        className="mt-3 w-full py-2.5 bg-indigo-500 text-white font-medium rounded-xl text-sm hover:bg-indigo-600 transition-colors"
                      >
                        Pick This
                      </motion.button>
                    )}
                  </motion.div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-4 border border-dashed border-slate-200 text-center">
                    <p className="text-slate-400 text-sm">
                      {partner.name} hasn&apos;t added anything yet
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Streak indicator */}
            {streak.count >= 2 && partner && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-2 text-sm font-medium text-amber-700"
              >
                🔥 {streakMember?.name}&apos;s picks: {streak.count} in a row!
              </motion.div>
            )}

            {/* Your Queue (expandable) */}
            {myQueueRest.length > 0 && (
              <div>
                <button
                  onClick={() => setQueueExpanded(!queueExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-slate-500 mb-2"
                >
                  <span
                    className={cn(
                      "transition-transform text-xs",
                      queueExpanded && "rotate-90"
                    )}
                  >
                    ▸
                  </span>
                  Your Queue ({myQueueRest.length} more)
                </button>

                <AnimatePresence>
                  {queueExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2">
                        {myQueueRest.map((item, idx) => (
                          <div
                            key={item.id}
                            className="bg-white rounded-xl p-3 shadow-sm border border-slate-200 flex items-center justify-between"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-slate-900 text-sm truncate">
                                {item.text}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <button
                                onClick={() => handleMoveItem(item.id, "up")}
                                disabled={idx === 0}
                                className="p-1 text-slate-300 hover:text-slate-500 disabled:opacity-30 text-xs"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveItem(item.id, "down")}
                                disabled={idx === myQueueRest.length - 1}
                                className="p-1 text-slate-300 hover:text-slate-500 disabled:opacity-30 text-xs"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item.id)}
                                className="p-1 text-slate-300 hover:text-rose-400 text-xs ml-1"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Partner queue count */}
            {partner && partnerItems.length > 1 && (
              <p className="text-xs text-slate-400 text-center">
                {partner.name} has {partnerItems.length - 1} more queued
              </p>
            )}

            {/* Empty state when nobody has items */}
            {!myNextPick && !partnerNextPick && (
              <div className="text-center py-8">
                <p className="text-4xl mb-3">✨</p>
                <p className="text-slate-400 mb-1">No items yet!</p>
                <p className="text-slate-300 text-sm">
                  Add something you&apos;d both enjoy
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Fixed Add Button */}
      {!showHistory && (
        <div
          className="fixed bottom-0 left-0 right-0 px-4 pt-6 z-40 bg-gradient-to-t from-[#FAFAF8] via-[#FAFAF8]/80 to-transparent"
          style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
        >
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddItem(true)}
            className="w-full py-4 bg-indigo-500 text-white font-semibold rounded-2xl shadow-md text-lg hover:bg-indigo-600 transition-colors"
          >
            + Add to Your Queue
          </motion.button>
        </div>
      )}

      {/* Add Item Modal */}
      <AnimatePresence>
        {showAddItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 sheet-backdrop z-50 flex items-center justify-center px-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowAddItem(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6"
            >
              <h3
                className="text-xl font-bold text-slate-900 mb-4"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Add to {category.name}
              </h3>

              <input
                type="text"
                value={itemText}
                onChange={(e) => setItemText(e.target.value)}
                placeholder={`What ${category.name.toLowerCase()} should you try?`}
                maxLength={100}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-slate-900 transition-colors mb-3"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleAddItem()}
              />

              <input
                type="text"
                value={itemNote}
                onChange={(e) => setItemNote(e.target.value)}
                placeholder="Add a note (optional)"
                maxLength={200}
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 focus:border-indigo-500 focus:ring-0 outline-none text-slate-900 text-sm transition-colors mb-4"
              />

              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddItem(false)}
                  className="flex-1 py-3 text-slate-500 font-medium rounded-2xl bg-slate-100"
                >
                  Cancel
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAddItem}
                  disabled={!itemText.trim() || adding}
                  className="flex-1 py-3 text-white font-semibold rounded-2xl bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 transition-colors"
                >
                  {adding ? "Adding..." : "Add"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pick Confirmation Modal */}
      <AnimatePresence>
        {pickingItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 sheet-backdrop z-50 flex items-center justify-center px-6"
            onClick={(e) => {
              if (e.target === e.currentTarget) setPickingItem(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-xl text-center"
            >
              <p className="text-4xl mb-3">{category.icon}</p>
              <h3
                className="text-xl font-bold text-slate-900 mb-2"
                style={{ fontFamily: "var(--font-outfit)" }}
              >
                Pick this one?
              </h3>
              <p className="text-lg text-slate-700 mb-6">{pickingItem.text}</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setPickingItem(null)}
                  className="flex-1 py-3 text-slate-500 font-medium rounded-2xl bg-slate-100"
                >
                  Nevermind
                </button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={handlePick}
                  disabled={picking}
                  className="flex-1 py-3 text-white font-semibold rounded-2xl bg-indigo-500 hover:bg-indigo-600 transition-colors"
                >
                  {picking ? "..." : "Let's do it!"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
