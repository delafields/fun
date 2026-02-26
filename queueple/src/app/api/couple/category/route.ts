import { redis } from "@/lib/redis";
import { nanoid } from "nanoid";
import { CoupleData } from "@/lib/types";

// POST: Add a custom category
export async function POST(req: Request) {
  const { code, name, icon } = await req.json();

  if (!code || !name?.trim() || !icon) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;

  data.categories.push({
    id: nanoid(8),
    name: name.trim(),
    icon,
    isDefault: false,
    currentTurn: "creator",
    streak: { by: "creator", count: 0 },
    items: [],
    history: [],
  });
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}

// DELETE: Remove a custom category
export async function DELETE(req: Request) {
  const { code, categoryId } = await req.json();

  if (!code || !categoryId) {
    return Response.json({ error: "Missing required fields" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;
  const categoryIndex = data.categories.findIndex((c) => c.id === categoryId);

  if (categoryIndex === -1) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  if (data.categories[categoryIndex].isDefault) {
    return Response.json({ error: "Cannot delete default categories" }, { status: 400 });
  }

  data.categories.splice(categoryIndex, 1);
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}
