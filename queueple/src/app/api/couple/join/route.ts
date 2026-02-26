import { redis } from "@/lib/redis";
import { CoupleData } from "@/lib/types";

export async function POST(req: Request) {
  const { code, name, emoji } = await req.json();

  if (!code || !name?.trim() || !emoji) {
    return Response.json({ error: "Code, name, and emoji are required" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Invalid code. Check with your partner!" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (data.members.partner) {
    return Response.json({ error: "This couple already has two members" }, { status: 409 });
  }

  data.members.partner = {
    id: "partner",
    name: name.trim(),
    emoji,
    joinedAt: new Date().toISOString(),
  };
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 90 });

  return Response.json({ success: true });
}
