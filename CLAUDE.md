# Sagevu — Codebase Reference Guide

## 1. Project Overview

Sagevu is a creator subscription platform where AI and human specialists publish content and offer paid subscriptions. Subscribers pay monthly to access locked posts and chat with specialists. Sagevu keeps a 15% platform fee; creators receive 85%. All content is SFW. Specialists are either `HUMAN` (creator replies manually) or `AI` (GPT-4o replies automatically using `systemPrompt`).

## 2. Tech Stack

- **Next.js 15** — App Router, TypeScript strict mode
- **Tailwind CSS** — MD3 dark design tokens, dark-only theme
- **Prisma 5** — ORM over PostgreSQL (Supabase, direct port 5432)
- **Supabase** — Postgres + Realtime on `Message` table
- **Clerk** — auth, unified `/auth` route, webhooks via svix
- **Stripe** — monthly subscriptions, direct charges, 15% platform fee in metadata
- **Cloudflare R2** — media storage (presigned PUT, public GET via `NEXT_PUBLIC_R2_PUBLIC_URL`)
- **OpenAI GPT-4o** — AI specialist chat, streaming responses
- **Radix UI + shadcn primitives** — headless UI components
- **React Hook Form + Zod** — form validation
- **GSAP + Lucide React** — animations and icons

## 3. Key File Map

### Lib
- `src/lib/prisma.ts` — singleton Prisma client
- `src/lib/stripe.ts` — Stripe client; `createStripeProduct`, `createStripePrice`, `updateStripePrice` (immutable prices: creates new + archives old), `createCheckoutSession` (15% fee in metadata)
- `src/lib/openai.ts` — OpenAI client; exports `openai` and `GPT_MODEL = 'gpt-4o'`
- `src/lib/r2.ts` — `getUploadUrl(key, contentType)` presigned PUT (5 min TTL); `deleteObject(key)`; `getPublicUrl(key)` returns `${NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`
- `src/lib/supabase.ts` — `supabaseAdmin` (service role, bypasses RLS); `createBrowserSupabaseClient()` (anon key, RLS applies)
- `src/lib/utils.ts` — `cn`, `generateSlug`, `formatCurrency(cents, currency)`, `formatRelativeTime(date)`, `hasActiveSubscription(userId, specialistId): Promise<bool>`

### Middleware
- `src/middleware.ts` — Clerk middleware; public routes: `/`, `/auth(.*)`, `/api/webhooks(.*)`, `/:slug`; all others require auth

### API Routes
- `POST /api/specialists` — auth; creates specialist + Stripe product/price if `subscriptionPrice > 0`; promotes user to CREATOR; lazy-creates User if Clerk webhook missed
- `GET /api/specialists` — public; returns published specialists (`?published=false` to include all)
- `GET /api/specialists/[id]` — auth + owner only; returns full specialist record
- `PATCH /api/specialists/[id]` — auth + owner only; updates profile fields + `subscriptionPrice` (syncs Stripe: creates new Price + archives old, or creates Product+Price if none exist)
- `POST /api/posts` — auth; creator-only (verified via `creatorId`); creates post with `visibility: PUBLIC | SUBSCRIBERS_ONLY`
- `POST /api/subscribe` — auth; validates `stripePriceId` exists; creates Stripe Checkout Session; returns `{ url }`
- `POST /api/chat` — auth; validates active subscription; upserts Conversation; if AI: streams GPT-4o (plain text chunks, `X-Conversation-Id` response header); if HUMAN: returns `{ conversationId }` for async reply
- `POST /api/upload` — auth; validates content type (jpeg/png/webp/gif/mp4); returns `{ uploadUrl, publicUrl, key }`; client PUTs directly to R2
- `POST /api/webhooks/stripe` — Stripe signature validation; handles `customer.subscription.created/updated` (upserts Subscription) and `customer.subscription.deleted` (sets CANCELED)
- `POST /api/webhooks/clerk` — svix signature validation; handles `user.created/updated` → upserts User row

## 4. Data Model Summary

| Model | Key Fields | Notes |
|---|---|---|
| `User` | `clerkId` (unique), `email`, `role: CREATOR\|SUBSCRIBER\|ADMIN` | Role promoted to CREATOR on first specialist creation |
| `Specialist` | `slug` (unique), `type: HUMAN\|AI`, `systemPrompt`, `isPublished`, `subscriptionPrice` (cents BRL), `stripePriceId`, `stripeProductId` | `systemPrompt` only meaningful when `type=AI` |
| `Post` | `specialistId`, `content`, `mediaUrls: String[]`, `visibility: PUBLIC\|SUBSCRIBERS_ONLY` | Authorship is via specialist, not user directly |
| `Subscription` | `subscriberId`, `specialistId`, `stripeSubscriptionId` (unique), `status: ACTIVE\|CANCELED\|PAST_DUE\|INCOMPLETE`, `currentPeriodEnd` | Active check: `status=ACTIVE AND currentPeriodEnd > now()` |
| `Project` | `specialistId`, `clientId`, `price` (cents), `status: OPEN\|IN_PROGRESS\|COMPLETED\|CANCELED`, `stripePaymentIntentId` | Future one-off payment feature, not yet wired |
| `Conversation` | `specialistId + subscriberId` (unique pair) | One conversation per subscriber/specialist pair enforced by DB constraint |
| `Message` | `conversationId`, `role: USER\|ASSISTANT`, `content` | Last 20 messages sent to OpenAI as context window |

## 5. Business Logic Rules

- **Platform fee:** 15% Sagevu / 85% creator — stored as `platform_fee_percent: '15'` in Stripe checkout + subscription metadata. Stripe Connect is NOT yet implemented; actual revenue split requires Connect onboarding.
- **Prices in cents (BRL):** `subscriptionPrice` stored in cents; `formatCurrency` divides by 100. Default currency is `brl` in `createStripePrice`.
- **Stripe prices are immutable:** `updateStripePrice` creates a new Price and archives the old one. `PATCH /api/specialists/[id]` calls this when `subscriptionPrice` changes.
- **Post paywall:** `/api/chat` enforces subscription server-side. `GET /api/posts` redacts `content` + `mediaUrls` for `SUBSCRIBERS_ONLY` posts when caller has no active subscription (returns `locked: true`). Owner always receives full content.
- **AI chat flow:** User message persisted to DB before calling OpenAI (survives stream errors). GPT-4o streams with `systemPrompt` as system message. Full assistant response persisted in `finally` block after stream ends.
- **HUMAN chat flow:** Message stored in DB; no real-time delivery yet. Supabase Realtime on `Message` table must be enabled and wired to `ChatWindow` for live updates.
- **Slug generation:** `generateSlug(name)` lowercases, strips non-alphanumeric, deduplicates with `-N` suffix loop.
- **User lazy-sync:** `POST /api/specialists` creates User on the fly via Clerk SDK if the webhook has not yet fired.
- **Subscription active check:** `hasActiveSubscription(userId, specialistId)` in `utils.ts` — always use this function, do not re-implement inline.

## 6. API Contract Summary

| Method | Path | Auth | Body / Params | Returns |
|---|---|---|---|---|
| `POST` | `/api/specialists` | Clerk | `{ name, bio?, specialty?, tagline?, type?, systemPrompt?, subscriptionPrice?, avatarUrl?, coverUrl?, isPublished? }` | Specialist (201) |
| `GET` | `/api/specialists` | None | `?published=false` to include unpublished | Specialist[] |
| `GET` | `/api/specialists/[id]` | Clerk + owner | — | Specialist |
| `PATCH` | `/api/specialists/[id]` | Clerk + owner | Partial specialist fields + optional `subscriptionPrice` (cents) | Specialist |
| `GET` | `/api/posts` | Optional Clerk | `?specialistId=&limit=&cursor=` | `{ posts, nextCursor }` (locked posts redacted) |
| `POST` | `/api/posts` | Clerk | `{ specialistId, content, mediaUrls?, visibility? }` | Post (201) |
| `POST` | `/api/subscribe` | Clerk | `{ specialistId }` | `{ url: string }` (Stripe Checkout URL) |
| `POST` | `/api/chat` | Clerk | `{ specialistId, content, conversationId? }` | Text stream (AI) or `{ conversationId }` (HUMAN) |
| `POST` | `/api/upload` | Clerk | `{ filename, contentType, folder? }` | `{ uploadUrl, publicUrl, key }` |
| `POST` | `/api/webhooks/stripe` | Stripe sig | Raw body | `{ received: true }` |
| `POST` | `/api/webhooks/clerk` | svix sig | JSON body | `{ success: true }` |

## 7. Design System Tokens

Dark-only theme. MD3-inspired color tokens as Tailwind extensions.

- **Background layers:** `bg-surface-container-lowest` (#0E0E11) → `bg-surface-container` (#1F1F22) for cards
- **Primary accent:** `text-primary` / `bg-primary` (#C4C0FF, lavender-indigo)
- **CTA gradient:** `bg-gradient-to-br from-primary to-primary-container`
- **Muted text:** `text-outline` (#918FA1)
- **Icons:** Material Symbols Outlined via Google Fonts CDN
- **Component lib:** Radix UI primitives wrapped as shadcn-style components in `src/components/ui/`
- **Animations:** GSAP for landing page; Tailwind transitions elsewhere

## 8. Remaining MVP Work

- [ ] **Stripe Connect** — implement actual revenue split (currently metadata-only); requires Connect account onboarding for creators
- [x] **Price update flow** — `PATCH /api/specialists/[id]` calls `updateStripePrice`, edit page has pricing section
- [x] **Post paywall enforcement** — `GET /api/posts` redacts locked posts for non-subscribers
- [ ] **Supabase Realtime** — enable on `Message` table; wire `ChatWindow` to subscribe for live HUMAN specialist chat
- [ ] **R2 env vars** — `CLOUDFLARE_R2_ACCOUNT_ID`, `CLOUDFLARE_R2_ACCESS_KEY_ID`, `CLOUDFLARE_R2_SECRET_ACCESS_KEY`, `CLOUDFLARE_R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL` required in production
- [ ] **Stripe webhook env** — `STRIPE_WEBHOOK_SECRET` must be set; register endpoint in Stripe dashboard pointing to `/api/webhooks/stripe`
- [ ] **Rate limiting on `/api/chat`** — no limit currently; add before launch to control OpenAI costs
- [ ] **systemPrompt sanitization** — validate/sanitize AI specialist system prompts to prevent prompt injection
- [ ] **Discovery grid seeding** — populate feed with real published specialists for new visitors
- [ ] **Mobile responsiveness audit** — ChatWindow and Dashboard Navbar need responsive QA
