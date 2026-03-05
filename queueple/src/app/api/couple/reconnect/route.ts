import { redis } from "@/lib/redis";
import { CoupleData } from "@/lib/types";

export async function POST(req: Request) {
  const { code, pin, role } = await req.json();

  if (!code || !pin || !role) {
    return Response.json({ error: "Code, PIN, and role are required" }, { status: 400 });
  }

  if (!["creator", "partner"].includes(role)) {
    return Response.json({ error: "Invalid role" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;

  if (!data.pin) {
    return Response.json({ error: "No PIN set. Set one from settings first." }, { status: 400 });
  }

  if (data.pin !== pin) {
    return Response.json({ error: "Incorrect PIN" }, { status: 403 });
  }

  // Verify the role has a member
  const member = role === "creator" ? data.members.creator : data.members.partner;
  if (!member) {
    return Response.json({ error: "No member found for that role" }, { status: 400 });
  }

  return Response.json({ success: true, name: member.name, emoji: member.emoji });
}
