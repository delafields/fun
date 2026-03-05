import { redis } from "@/lib/redis";
import { generateCode } from "@/lib/utils";
import { DEFAULT_CATEGORIES } from "@/lib/constants";
import { nanoid } from "nanoid";
import { CoupleData } from "@/lib/types";

// POST: Create a new couple
export async function POST(req: Request) {
  const { name, emoji, pin } = await req.json();

  if (!name?.trim() || !emoji) {
    return Response.json({ error: "Name and emoji are required" }, { status: 400 });
  }

  if (!pin || !/^\d{4}$/.test(pin)) {
    return Response.json({ error: "A 4-digit PIN is required" }, { status: 400 });
  }

  // Generate unique 6-digit code
  let code = generateCode();
  let attempts = 0;
  while (await redis.exists(`couple:${code}`)) {
    code = generateCode();
    attempts++;
    if (attempts > 10) {
      return Response.json({ error: "Could not generate unique code" }, { status: 500 });
    }
  }

  const data: CoupleData = {
    code,
    pin,
    version: 1,
    createdAt: new Date().toISOString(),
    members: {
      creator: {
        id: "creator",
        name: name.trim(),
        emoji,
        joinedAt: new Date().toISOString(),
      },
      partner: null,
    },
    categories: DEFAULT_CATEGORIES.map((cat) => ({
      id: nanoid(8),
      name: cat.name,
      icon: cat.icon,
      isDefault: true,
      currentTurn: "creator" as const,
      streak: { by: "creator", count: 0 },
      items: [],
      history: [],
    })),
  };

  // Store with 1-year TTL (refreshed on access)
  await redis.set(`couple:${code}`, JSON.stringify(data), { ex: 60 * 60 * 24 * 365 });

  return Response.json({ code });
}

// GET: Fetch couple data
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

  // Refresh TTL on access
  await redis.expire(`couple:${code}`, 60 * 60 * 24 * 365);

  const data: CoupleData = typeof raw === "string" ? JSON.parse(raw) : raw;
  // Never expose PIN in the general GET response
  const { pin: _pin, ...safeData } = data;
  return Response.json(safeData);
}
