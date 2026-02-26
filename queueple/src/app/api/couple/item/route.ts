import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { CoupleData } from "@/lib/types";

// POST: Add item to a category
export async function POST(req: Request) {
  const { code, categoryId, text, note, addedBy } = await req.json();

  if (!code || !categoryId || !text?.trim() || !addedBy) {
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

  category.items.push({
    id: nanoid(8),
    text: text.trim(),
    addedBy,
    addedAt: new Date().toISOString(),
    ...(note?.trim() ? { note: note.trim() } : {}),
  });
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}

// DELETE: Remove item from a category
export async function DELETE(req: Request) {
  const { code, categoryId, itemId } = await req.json();

  if (!code || !categoryId || !itemId) {
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

  const itemIndex = category.items.findIndex((i) => i.id === itemId);
  if (itemIndex === -1) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  category.items.splice(itemIndex, 1);
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}
