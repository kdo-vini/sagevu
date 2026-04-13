# MVP Build Prompt — [PLATFORM NAME]

You are building **[PLATFORM NAME]** — a creator platform where AI and human expert personas publish content and offer subscriptions. Think Fanvue for professional expertise, without adult content. Personas can be real humans or declared AI characters. Subscribers pay for access to exclusive content and direct chat with the persona.

---

## Tech Stack

- **Framework**: Next.js 15 (App Router, TypeScript strict mode)
- **Styling**: Tailwind CSS + shadcn/ui (dark theme primary)
- **ORM**: Prisma
- **Database**: Supabase (PostgreSQL + Realtime)
- **Auth**: Clerk
- **Payments**: Stripe (subscriptions + one-time)
- **AI**: Anthropic Claude API (streaming)
- **Storage**: Cloudflare R2 (media uploads)
- **Deployment**: Vercel

---

## Database Schema (Prisma)

```prisma
model User {
  id          String   @id @default(cuid())
  clerkId     String   @unique
  email       String   @unique
  name        String?
  avatarUrl   String?
  role        Role     @default(SUBSCRIBER)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  personas      Persona[]
  subscriptions Subscription[]
  conversations Conversation[]
  projects      Project[]       @relation("ClientProjects")
}

enum Role {
  CREATOR
  SUBSCRIBER
  ADMIN
}

model Persona {
  id                String      @id @default(cuid())
  creatorId         String
  creator           User        @relation(fields: [creatorId], references: [id])
  name              String
  slug              String      @unique
  bio               String?
  avatarUrl         String?
  type              PersonaType @default(HUMAN)
  specialty         String?
  tagline           String?
  systemPrompt      String?     // AI personas only — never exposed to subscribers
  isPublished       Boolean     @default(false)
  subscriptionPrice Int         @default(0) // in cents
  currency          String      @default("usd")
  createdAt         DateTime    @default(now())
  updatedAt         DateTime    @updatedAt

  posts         Post[]
  subscriptions Subscription[]
  conversations Conversation[]
  projects      Project[]
}

enum PersonaType {
  HUMAN
  AI
}

model Post {
  id         String     @id @default(cuid())
  personaId  String
  persona    Persona    @relation(fields: [personaId], references: [id])
  content    String
  mediaUrls  String[]
  visibility Visibility @default(PUBLIC)
  createdAt  DateTime   @default(now())
  updatedAt  DateTime   @updatedAt
}

enum Visibility {
  PUBLIC
  SUBSCRIBERS_ONLY
}

model Subscription {
  id                   String             @id @default(cuid())
  subscriberId         String
  subscriber           User               @relation(fields: [subscriberId], references: [id])
  personaId            String
  persona              Persona            @relation(fields: [personaId], references: [id])
  stripeSubscriptionId String             @unique
  stripeCustomerId     String
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd     DateTime
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  INCOMPLETE
}

model Project {
  id                   String        @id @default(cuid())
  personaId            String
  persona              Persona       @relation(fields: [personaId], references: [id])
  clientId             String?
  client               User?         @relation("ClientProjects", fields: [clientId], references: [id])
  title                String
  description          String
  price                Int           // in cents
  status               ProjectStatus @default(OPEN)
  stripePaymentIntentId String?
  createdAt            DateTime      @default(now())
  updatedAt            DateTime      @updatedAt
}

enum ProjectStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELED
}

model Conversation {
  id           String    @id @default(cuid())
  personaId    String
  persona      Persona   @relation(fields: [personaId], references: [id])
  subscriberId String
  subscriber   User      @relation(fields: [subscriberId], references: [id])
  createdAt    DateTime  @default(now())

  messages Message[]

  @@unique([personaId, subscriberId])
}

model Message {
  id             String      @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           MessageRole
  content        String
  createdAt      DateTime    @default(now())
}

enum MessageRole {
  USER
  ASSISTANT
}
```

---

## File Structure

```
src/
  app/
    (auth)/
      sign-in/[[...sign-in]]/page.tsx
      sign-up/[[...sign-up]]/page.tsx
    (dashboard)/
      layout.tsx                        # Clerk auth guard, creator only
      dashboard/
        page.tsx                        # Creator overview
        persona/
          new/page.tsx                  # Create persona form
          [personaId]/
            edit/page.tsx
            posts/
              new/page.tsx
    [slug]/
      page.tsx                          # Public persona profile
      chat/
        page.tsx                        # Subscriber-only chat
    api/
      webhooks/
        clerk/route.ts                  # Sync user to DB
        stripe/route.ts                 # Handle subscription events
      chat/
        route.ts                        # Claude API streaming endpoint
      upload/
        route.ts                        # R2 signed upload URL
  components/
    persona/
      PersonaCard.tsx
      PersonaProfile.tsx
      PersonaBadge.tsx                  # AI / HUMAN badge
      PostCard.tsx
      PostFeed.tsx
      SubscribeButton.tsx
    chat/
      ChatWindow.tsx
      ChatMessage.tsx
      ChatInput.tsx
    ui/                                 # shadcn components
  lib/
    prisma.ts
    stripe.ts
    anthropic.ts
    supabase.ts
    r2.ts
    utils.ts
  middleware.ts                         # Clerk middleware
```

---

## MVP Features — Build in this order

### 1. Prisma schema + Supabase
- Run `prisma migrate dev`
- Enable Realtime on `messages` table in Supabase dashboard

### 2. Clerk webhook → sync user to DB
```ts
// POST /api/webhooks/clerk
// Events: user.created, user.updated
// Upsert User in DB using clerkId
```

### 3. Creator onboarding — create persona
- Form: name, slug (auto-generated, editable), bio, specialty, tagline
- Toggle: HUMAN vs AI
- If AI: textarea for system prompt (personality, expertise, rules, how to respond)
- Photo upload via R2 signed URL
- Set subscription price
- Publish toggle

### 4. Public persona profile page `/[slug]`
- Avatar, name, specialty, tagline
- AI badge if `type === 'AI'` (subtle, e.g. "AI Persona")
- Feed: PUBLIC posts visible to all, SUBSCRIBERS_ONLY posts show blurred overlay with lock icon + subscribe CTA
- Subscribe button → Stripe Checkout

### 5. Post creation
- Creator posts from dashboard
- Text content + optional image upload
- Visibility toggle: PUBLIC or SUBSCRIBERS ONLY

### 6. Stripe subscription flow
```ts
// Checkout session creation:
// - mode: 'subscription'
// - price: persona.subscriptionPrice (create Stripe Price on persona creation)
// - metadata: { personaId, subscriberId }

// Webhook handlers:
// customer.subscription.created → upsert Subscription (ACTIVE)
// customer.subscription.updated → update status + currentPeriodEnd
// customer.subscription.deleted → update status (CANCELED)
```

### 7. Chat — `/[slug]/chat`
- Guard: redirect to subscribe if no active subscription
- Load conversation (or create one)
- Subscribe to Supabase Realtime on conversation messages
- Send message → POST /api/chat
- Display typing indicator while streaming

### 8. Chat API route `/api/chat`
```ts
// 1. Verify active subscription (auth + DB check)
// 2. Load persona (systemPrompt if AI)
// 3. Load last 20 messages from conversation
// 4. If persona.type === 'AI':
//      Stream from Claude API using systemPrompt + message history
//      Save assistant response to DB on stream end
// 5. If persona.type === 'HUMAN':
//      Save user message, notify creator (future: push notification)
//      Return 202 — creator responds manually via dashboard
```

---

## Key Implementation Details

### Access control
```ts
// middleware.ts — protect dashboard routes
// Server Components — check subscription before rendering locked content
// Chat route — verify subscription server-side before Claude call

async function hasActiveSubscription(userId: string, personaId: string) {
  const sub = await prisma.subscription.findFirst({
    where: {
      subscriberId: userId,
      personaId,
      status: 'ACTIVE',
      currentPeriodEnd: { gt: new Date() }
    }
  })
  return !!sub
}
```

### Claude streaming
```ts
// /api/chat/route.ts
import Anthropic from '@anthropic-ai/sdk'

const stream = await anthropic.messages.stream({
  model: 'claude-sonnet-4-20250514',
  max_tokens: 1024,
  system: persona.systemPrompt,
  messages: conversationHistory // last 20 messages
})

// Return ReadableStream to client
// Save full response to DB on stream completion
```

### Slug generation
```ts
// Auto-generate from name, ensure uniqueness
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}
```

---

## Design System

- **Background**: `#0D0D10` (primary), `#161618` (surface), `#1E1E22` (card)
- **Accent**: `#6C63FF` (electric indigo) — CTAs, active states, badges
- **Text**: `#FFFFFF` (headlines), `#A0A0B0` (body), `#606070` (muted)
- **Font**: Inter
- **Radius**: 8px (components), 12px (cards)
- **Dark mode first** — no light mode in MVP

Use shadcn/ui with a custom dark theme. Override `globals.css` CSS variables to match this palette.

---

## Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
CLERK_WEBHOOK_SECRET=

# Database
DATABASE_URL=
DIRECT_URL=

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Stripe
STRIPE_SECRET_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_WEBHOOK_SECRET=

# Anthropic
ANTHROPIC_API_KEY=

# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=
CLOUDFLARE_R2_ACCESS_KEY_ID=
CLOUDFLARE_R2_SECRET_ACCESS_KEY=
CLOUDFLARE_R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Out of scope for MVP (next iterations)

- Discovery / search across personas
- Project (PPV) flow — Stripe Payment Intent one-time
- Creator analytics dashboard
- Push notifications for new messages
- Consistent AI image generation for AI personas
- Subscription tiers (multiple price points per persona)
- Mobile app
