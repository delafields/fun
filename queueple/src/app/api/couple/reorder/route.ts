import { redis } from "@/lib/redis";
import { CoupleData } from "@/lib/types";

export async function PUT(req: Request) {
  const { code, categoryId, role, itemIds } = await req.json();

  if (!code || !categoryId || !role || !Array.isArray(itemIds)) {
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

  // Split items into mine (reorderable) and partner's (untouched)
  const myItems = category.items.filter((i) => i.addedBy === role);
  const partnerItems = category.items.filter((i) => i.addedBy !== role);

  // Verify all itemIds belong to this user
  const myItemIds = new Set(myItems.map((i) => i.id));
  if (!itemIds.every((id: string) => myItemIds.has(id)) || itemIds.length !== myItems.length) {
    return Response.json({ error: "Invalid item IDs" }, { status: 400 });
  }

  // Reorder my items according to the new order
  const reorderedMyItems = itemIds.map((id: string) => myItems.find((i) => i.id === id)!);

  // Rebuild the items array: interleave partner items at their original positions
  // Simple approach: partner items first in their original order, then my reordered items
  // Actually, let's preserve the interleaved order but with my items reordered
  const reorderedQueue = [...reorderedMyItems];
  let myIdx = 0;
  const newItems = category.items.map((item) => {
    if (item.addedBy === role) {
      return reorderedQueue[myIdx++];
    }
    return item;
  });

  category.items = newItems;
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}
