import { redis } from "@/lib/redis";
import { CoupleData } from "@/lib/types";

// GET: Retrieve PIN for an authenticated session
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return Response.json({ error: "Code is required" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;

  return Response.json({ pin: data.pin || null });
}

// PUT: Set or update PIN
export async function PUT(req: Request) {
  const { code, pin } = await req.json();

  if (!code || !pin || !/^\d{4}$/.test(pin)) {
    return Response.json({ error: "Code and a 4-digit PIN are required" }, { status: 400 });
  }

  const raw = await redis.get(`couple:${code}`);
  if (!raw) {
    return Response.json({ error: "Couple not found" }, { status: 404 });
  }

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;
  data.pin = pin;
  data.version++;

  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 365 });

  return Response.json({ success: true });
}
