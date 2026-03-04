# Queueple

A turn-taking app for couples. Build shared lists of things you want to do together — restaurants, movies, date nights, activities — and take turns picking from each other's queues.

## How It Works

1. One person creates a couple session and gets a 6-digit code
2. Partner joins with that code
3. Both add items to category queues (restaurants, movies, etc.)
4. Take turns picking from each other's lists
5. Tracks pick history and streaks

No accounts, no passwords — just a code you share.

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS 4 + Framer Motion
- **Data**: Upstash Redis (1-year sliding TTL)
- **Session**: localStorage (couple code + role)
- **PWA**: Service worker + manifest for installability

## Project Structure

```
src/
├── app/
│   ├── api/couple/         # All API routes (create, join, pick, reorder, etc.)
│   ├── create/             # Create couple flow
│   ├── join/               # Join couple flow
│   ├── share/              # Share code screen
│   └── dashboard/          # Main app (categories, settings)
│       └── category/[id]/  # Individual category view (queue + history)
├── components/             # EmojiPicker, ServiceWorkerRegistrar
├── context/CoupleContext   # Global couple data provider
├── hooks/                  # useSession, useCoupleData
└── lib/
    ├── types.ts            # Core data types
    ├── constants.ts        # Default categories, emoji options
    ├── utils.ts            # cn(), generateCode(), timeAgo()
    └── redis.ts            # Upstash Redis client
```

## Running Locally

```
npm install
npm run dev
```

Requires `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`.
