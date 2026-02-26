import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { CoupleData } from "@/lib/types";

export async function POST(req: Request) {
  const { code, categoryId, itemId, pickedBy } = await req.json();

  if (!code || !categoryId || !itemId || !pickedBy) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;
  const category = data.categories.find((c) => c.id === categoryId);

  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  if (category.currentTurn !== pickedBy) {
    return Response.json({ error: "Not your turn!" }, { status: 403 });
  }

  const itemIndex = category.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  const [item] = category.items.splice(itemIndex, 1);

  category.history.unshift({
    id: nanoid(8),
    itemText: item.text,
    pickedBy,
    pickedAt: new Date().toISOString(),
  });

  // Update streak: track whose items keep getting picked
  const itemOwner = item.addedBy;
  if (!category.streak) {
    category.streak = { by: itemOwner, count: 1 };
  } else if (category.streak.by === itemOwner) {
    category.streak.count++;
  } else {
    category.streak = { by: itemOwner, count: 1 };
  }

  // Flip the turn
  category.currentTurn = pickedBy === "creator" ? "partner" : "creator";
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true, newTurn: category.currentTurn });
}
