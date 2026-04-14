# Sagevu Product Specification

Version: 1.0.0
Last updated: 2026-04-13
Status: MVP Beta

---

## Table of Contents

1. [Full System Overview](#1-full-system-overview)
2. [User Roles and Architecture](#2-user-roles-and-architecture)
3. [Dual Interface Design](#3-dual-interface-design)
4. [Authentication and Account System](#4-authentication-and-account-system)
5. [Profile System](#5-profile-system)
6. [Content and Monetization System](#6-content-and-monetization-system)
7. [Messaging / Chat System](#7-messaging--chat-system)
8. [Subscribers and CRM Layer](#8-subscribers-and-crm-layer)
9. [Payout and Financial System](#9-payout-and-financial-system)
10. [Notifications System](#10-notifications-system)
11. [Admin Panel](#11-admin-panel)
12. [System Behavior and Logic](#12-system-behavior-and-logic)
13. [Technical Architecture](#13-technical-architecture)
14. [Data Model](#14-data-model)

---

## 1. Full System Overview

### Platform Purpose

Sagevu is a SaaS subscription platform for professional expertise. Specialists (consultants, coaches, educators, agencies, service providers) publish exclusive content, interact with subscribers via 1:1 messaging, and monetize their knowledge through monthly subscriptions. The platform supports both human specialists and AI-powered specialist personas that respond automatically using configurable GPT-4o personalities.

### Positioning

| Attribute              | Fanvue / OnlyFans       | Sagevu                              |
|------------------------|-------------------------|--------------------------------------|
| Content type           | Adult / entertainment   | SFW professional expertise           |
| Target creators        | Influencers, models     | Consultants, coaches, educators      |
| Target consumers       | Fans                    | Clients, students, professionals     |
| AI integration         | None                    | AI specialists with custom personas  |
| Monetization           | Tips, PPV, subs         | Monthly subscriptions (MVP)          |
| Platform fee           | 20%                     | 15%                                  |
| Content moderation     | Reactive                | Proactive SFW enforcement            |

### Core Business Model

Specialists create profiles, publish gated content, and set a monthly subscription price. Consumers browse the public discover page, subscribe to specialists via Stripe Checkout, and unlock subscriber-only posts and 1:1 chat access. Sagevu retains 15% of every subscription payment; the specialist receives 85%.

### Key Differentiators

- **Dual specialist types**: Creators can publish as themselves (HUMAN) or configure an AI persona (AI) that auto-responds to subscribers using GPT-4o with a custom system prompt.
- **Professional focus**: Platform design, moderation policies, and discovery are optimized for SFW business expertise, not entertainment.
- **AI-first messaging**: AI specialists deliver instant, always-on engagement. Subscribers get immediate value without waiting for a human reply.
- **Low platform fee**: 15% take rate undercuts major creator platforms.

### Revenue Model

| Revenue Stream          | Fee Structure             | Status   |
|-------------------------|---------------------------|----------|
| Subscription commission | 15% of monthly recurring  | Built    |
| Subscription tiers      | Multiple price points     | Planned  |
| Pay-per-content         | Per-post unlock fee       | Planned  |
| Tips / donations        | Percentage of tip amount  | Planned  |
| Priority messaging      | Premium chat access fee   | Planned  |
| Projects (freelance)    | Commission on milestones  | Schema exists, logic planned |

---

## 2. User Roles and Architecture

### Role Definitions

The system has three roles defined in the `Role` enum: `CREATOR`, `SUBSCRIBER`, `ADMIN`.

### Specialist (Creator)

A specialist is not a user role -- it is an entity owned by a user with role `CREATOR`. A single creator can own multiple specialist profiles (e.g., one human profile and one AI persona). The specialist is the public-facing identity that consumers subscribe to.

**Capabilities:**
- Create and edit specialist profiles (name, slug, bio, avatar, cover image, subscription price, specialty, tagline)
- Configure AI specialist behavior via `systemPrompt` field (AI type only)
- Publish posts with PUBLIC or SUBSCRIBERS_ONLY visibility
- Attach media (images, video) to posts via Cloudflare R2 uploads
- View subscriber list with join dates and subscription status
- Reply to subscriber messages in 1:1 conversations
- Set and update subscription pricing (synced to Stripe Product/Price)
- View earnings, transaction history, and request payouts
- Toggle specialist profile published/unpublished state

**Access Boundaries:**
- Can only edit their own specialist profiles (`creatorId === user.id`)
- Cannot subscribe to their own specialists (enforced server-side)
- Cannot read other creators' subscriber lists or earnings
- Cannot access admin panel or moderation tools
- Cannot view private message conversations they are not a party to

### Consumer (Subscriber)

A user with role `SUBSCRIBER`. This is the default role assigned on account creation.

**Capabilities:**
- Browse the public discover page and specialist profiles
- View PUBLIC posts from any specialist
- Subscribe to specialists via Stripe Checkout
- View SUBSCRIBERS_ONLY posts for specialists they have active subscriptions to
- Send messages to specialists they are subscribed to
- Manage active subscriptions (view, cancel)
- Update their own profile (name, avatar)

**Access Boundaries:**
- Cannot create specialist profiles (must upgrade to CREATOR role)
- Cannot view subscriber-only content without an active, non-expired subscription
- Cannot send messages to specialists without an active subscription
- Cannot access dashboard, analytics, or payout features
- Chat rate-limited to 20 messages/hour per AI specialist, 60 messages/hour per human specialist

### Admin (Platform Owner)

A user with role `ADMIN`. Not exposed through public registration -- assigned directly in the database.

**Capabilities:**
- View and manage all users (suspend, modify roles)
- View and manage all specialist profiles (unpublish, remove)
- Access content moderation queue (reports, appeals)
- View platform-wide financial data (total revenue, per-specialist breakdowns)
- Approve or deny payout requests
- View platform analytics (DAU, MAU, conversion rates, churn)
- Manage refund and chargeback disputes

**Access Matrix:**

| Action                     | Subscriber | Creator | Admin |
|----------------------------|:----------:|:-------:|:-----:|
| Browse discover            | Yes        | Yes     | Yes   |
| View public posts          | Yes        | Yes     | Yes   |
| Subscribe to specialist    | Yes        | Yes*    | Yes   |
| View locked posts          | Sub only   | Sub only| Yes   |
| Send chat messages         | Sub only   | Sub only| Yes   |
| Create specialist profile  | No         | Yes     | Yes   |
| Publish posts              | No         | Yes     | Yes   |
| View own subscribers       | No         | Yes     | Yes   |
| View earnings/payouts      | No         | Yes     | Yes   |
| Moderate content           | No         | No      | Yes   |
| Manage users               | No         | No      | Yes   |
| View platform analytics    | No         | No      | Yes   |

*Creators cannot subscribe to their own specialists.

---

## 3. Dual Interface Design

### Specialist Dashboard (Creator View)

Accessible at `/dashboard`. Protected by Clerk middleware -- requires authenticated user with CREATOR role.

#### Navigation Sidebar

```
Dashboard Home
Content Manager
Subscribers
Messages
Analytics
Settings
Payout
```

#### Screen: Dashboard Home (`/dashboard`)

Primary landing screen after login for creators.

- **Key metrics row**: Total subscribers (active), Monthly revenue (gross), Total posts, Messages this week
- **Recent activity feed**: Latest subscriptions, messages, and post interactions
- **Quick actions**: "New Post" button, "View Profile" link, "Edit Settings" link
- **Specialist selector**: Dropdown if the creator owns multiple specialist profiles

#### Screen: Content Manager (`/dashboard/content`)

- **Post list**: Paginated table/grid of all posts for the selected specialist, sorted by `createdAt` desc
- **Columns**: Title/preview (first 80 chars), Visibility badge (PUBLIC / SUBSCRIBERS_ONLY), Media count, Date published
- **Actions per post**: Edit, Delete, Toggle visibility
- **"New Post" button**: Opens the post composer
- **Post Composer**: Full-width editor with text area (Markdown or plain text), media upload zone (drag-and-drop to R2), visibility toggle, publish button
- **Filters**: All / Public / Subscribers Only

#### Screen: Subscribers (`/dashboard/subscribers`)

- **Subscriber table**: Name, email, avatar, subscription start date, current status (ACTIVE / CANCELED / PAST_DUE), current period end
- **Search**: Filter by name or email
- **Sort**: By join date, status, alphabetical
- **Bulk actions** (future): Tag, export CSV
- **Per-subscriber actions**: View profile, view conversation

#### Screen: Messages (`/dashboard/messages`)

- **Conversation list** (left panel): List of all conversations for the selected specialist, sorted by last message timestamp
- **Each entry shows**: Subscriber name, avatar, last message preview, unread indicator, timestamp
- **Chat window** (right panel): Full conversation thread with the selected subscriber
- **Reply input**: Text area at the bottom for composing replies
- **AI specialists**: Messages are auto-replied. Dashboard shows the conversation history read-only unless the creator wants to override (future feature)

#### Screen: Analytics (`/dashboard/analytics`)

- **Time range selector**: 7d / 30d / 90d / All time
- **Charts**: Subscriber growth (line), Revenue over time (bar), Message volume (line), Post engagement (bar)
- **Key metrics**: Total revenue (gross), Platform fee (15%), Net earnings, Average revenue per subscriber, Churn rate
- **Top posts**: Ranked by view count or engagement (future)

#### Screen: Settings (`/dashboard/specialist/edit`)

- **Profile fields**: Name, slug, bio, specialty, tagline, avatar upload, cover image upload, subscription price, currency
- **AI Configuration** (visible only for type=AI): System prompt text area with character counter (max 4000), test chat preview
- **Publish toggle**: Published / Unpublished state
- **Danger zone**: Delete specialist profile (with confirmation)

#### Screen: Payout (`/dashboard/payout`)

- **Earnings summary**: Gross revenue, platform fee (15%), net earnings, available balance, pending payouts
- **Payout history table**: Date, amount, status (PENDING / PROCESSING / COMPLETED / FAILED), Stripe transfer ID
- **Request Payout button**: Initiates a payout to the creator's connected Stripe account
- **Stripe Connect onboarding**: If not yet connected, shows a CTA to connect their Stripe account for receiving payouts

#### UX Flow: Creator Onboarding

```
Sign Up (/auth)
  --> Role Selection (CREATOR)
    --> Create First Specialist (/dashboard/specialist/new)
      --> Fill: name, slug, bio, type (HUMAN/AI), subscription price
      --> Upload: avatar, cover image
      --> If AI: configure systemPrompt
      --> Stripe Product/Price auto-created on save
    --> Publish Profile
      --> Share profile link (/{slug})
    --> Create First Post
      --> Compose content, set visibility, attach media
      --> Publish
    --> First subscriber arrives via Stripe Checkout
```

### Consumer Interface (Subscriber View)

#### Navigation

```
Discover (/discover or /)
Feed (/feed)
Messages (/messages)
Subscriptions (profile section)
Profile (/profile)
```

#### Screen: Discover (`/discover`)

- **Search bar**: Search specialists by name, specialty, or tagline
- **Category filters**: Filter by specialty tags
- **Specialist grid**: Cards showing avatar, name, tagline, specialty, subscriber count, subscription price, AI ENHANCED badge (for AI type)
- **Card click**: Navigates to specialist public profile (`/{slug}`)
- **Sort**: Trending, Newest, Price (low-high, high-low)

#### Screen: Specialist Public Profile (`/{slug}`)

- **Header**: Cover image, avatar, name, tagline, specialty, subscriber count
- **Subscribe button**: Shows price, opens Stripe Checkout on click. Hidden if already subscribed; shows "Subscribed" badge instead
- **AI Enhanced badge**: Visible for AI-type specialists
- **Post feed**: Chronological list of posts. PUBLIC posts show full content. SUBSCRIBERS_ONLY posts show a locked state with redacted content and a subscribe CTA
- **Chat button**: Visible only to active subscribers. Opens `/messages` or `/{slug}/chat`
- **Bio section**: Full specialist bio text

#### Screen: Feed (`/feed`)

- **Aggregated feed**: Posts from all specialists the consumer is subscribed to, sorted by `createdAt` desc
- **Post cards**: Specialist avatar + name, post content, media, timestamp, visibility badge
- **Locked posts**: Should not appear in feed (only subscribed content shows)
- **Empty state**: "Subscribe to specialists to see their posts here"

#### Screen: Messages (`/messages`)

- **Conversation list**: All active conversations with specialists, sorted by last message
- **Chat window**: Full thread with selected specialist
- **Input**: Text area for composing messages
- **AI indicator**: Badge showing "AI-powered responses" for AI specialist conversations
- **Subscription guard**: If subscription expires, input is disabled with "Renew your subscription to continue chatting"

#### Screen: Profile / Subscriptions

- **Active subscriptions list**: Specialist name, avatar, price, renewal date, status
- **Cancel button**: Per-subscription cancel action (triggers Stripe cancellation, sets status to CANCELED at period end)
- **Billing history**: List of past payments with dates and amounts

#### UX Flow: Consumer Journey

```
Land on Discover or /{slug} (public, no auth required)
  --> Browse specialist profiles and public posts
  --> Click Subscribe
    --> Redirected to /auth if not logged in
    --> Sign Up / Sign In via Clerk
  --> Stripe Checkout opens
    --> Enter payment details
    --> Payment confirmed via webhook
    --> Redirected back to /{slug}?subscribed=true
  --> Subscriber-only posts now visible
  --> Chat button enabled
  --> Send first message to specialist
    --> If AI: instant streaming response
    --> If Human: async, notification sent to creator
```

---

## 4. Authentication and Account System

### Auth Provider

Clerk handles all authentication. The unified auth page at `/auth` supports both sign-in and sign-up in a single view.

### Sign-Up Flow

1. User navigates to `/auth` (or is redirected from a protected route)
2. Enters email + password, or uses social auth (Google, Apple, GitHub)
3. Clerk creates the user and fires a `user.created` webhook to `/api/webhooks/clerk`
4. Webhook handler creates a corresponding `User` record in the Sagevu database with `clerkId`, `email`, `name`, `avatarUrl`, and default role `SUBSCRIBER`
5. User is redirected to the discover page or their original destination

### Social Auth Providers

| Provider | Status  |
|----------|---------|
| Google   | Enabled |
| Apple    | Planned |
| GitHub   | Planned |

### Session Management

- Sessions are managed entirely by Clerk (JWT-based, httpOnly cookies)
- Session duration: configurable in Clerk dashboard (default 7 days)
- Multi-device support: users can be signed in on multiple devices simultaneously
- Token refresh: handled automatically by Clerk's middleware

### Security Measures

- **2FA**: Available through Clerk (TOTP, SMS). Not enforced by default; recommended for creators with active payouts
- **API protection**: All `/api/*` routes (except webhooks) are protected by Clerk middleware. Webhook routes validate signatures (Stripe: `stripe-signature` header; Clerk: Svix signature)
- **CSRF**: Handled by Clerk's session management and Next.js built-in protections
- **Rate limiting**: Applied at the chat API layer (20/hr AI, 60/hr human). Future: global rate limiting at edge

### Role Assignment

- Default role on sign-up: `SUBSCRIBER`
- Upgrade to `CREATOR`: Triggered when a user creates their first specialist profile. The system should update the user's role to CREATOR at that point
- `ADMIN` role: Assigned manually in the database. No public upgrade path

### Clerk Webhook Events Handled

| Event          | Handler Action                                    |
|----------------|---------------------------------------------------|
| `user.created` | Create `User` row in Postgres                     |
| `user.updated` | Sync name, email, avatar changes to `User` row    |

---

## 5. Profile System

### Specialist Public Profile

All fields stored on the `Specialist` model:

| Field               | Type           | Required | Editable | Public | Notes                                      |
|---------------------|----------------|----------|----------|--------|--------------------------------------------|
| `name`              | String         | Yes      | Yes      | Yes    | Display name                               |
| `slug`              | String         | Yes      | Yes*     | Yes    | URL path. Unique. *Changeable but warn user about link breakage |
| `bio`               | String         | No       | Yes      | Yes    | Long-form description                      |
| `avatarUrl`         | String         | No       | Yes      | Yes    | Uploaded to R2                             |
| `coverUrl`          | String         | No       | Yes      | Yes    | Uploaded to R2                             |
| `type`              | HUMAN / AI     | Yes      | No       | Yes    | Set at creation, immutable                 |
| `specialty`         | String         | No       | Yes      | Yes    | Category/expertise area                    |
| `tagline`           | String         | No       | Yes      | Yes    | Short pitch (one line)                     |
| `subscriptionPrice` | Int (cents)    | Yes      | Yes      | Yes    | Monthly price in cents. Updates sync to Stripe |
| `currency`          | String         | Yes      | Yes      | Yes    | Default "usd"                              |
| `systemPrompt`      | String         | No*      | Yes      | No     | *Required for AI type. Max 4000 chars. Sanitized server-side |
| `isPublished`       | Boolean        | Yes      | Yes      | N/A    | Controls visibility on discover page       |
| `stripePriceId`     | String         | Auto     | No       | No     | Set by Stripe sync on price save           |
| `stripeProductId`   | String         | Auto     | No       | No     | Set by Stripe sync on specialist creation  |

### Consumer Profile

Stored on the `User` model:

| Field       | Type   | Required | Editable | Public |
|-------------|--------|----------|----------|--------|
| `name`      | String | No       | Yes      | Yes    |
| `avatarUrl` | String | No       | Yes      | Yes    |
| `email`     | String | Yes      | Via Clerk| No     |

### Visibility Rules

| Data Point               | Non-authenticated | Authenticated (non-subscriber) | Active Subscriber | Creator (own profile) |
|--------------------------|:-----------------:|:------------------------------:|:-----------------:|:---------------------:|
| Specialist name/bio      | Visible           | Visible                        | Visible           | Visible + editable    |
| Avatar/cover             | Visible           | Visible                        | Visible           | Visible + editable    |
| Subscription price       | Visible           | Visible                        | Visible           | Visible + editable    |
| PUBLIC posts             | Visible           | Visible                        | Visible           | Visible + editable    |
| SUBSCRIBERS_ONLY posts   | Locked preview    | Locked preview                 | Full content      | Full content          |
| Subscriber count         | Visible           | Visible                        | Visible           | Visible + detailed    |
| Chat / message button    | Hidden            | Hidden                         | Visible           | N/A                   |
| systemPrompt             | Hidden            | Hidden                         | Hidden            | Editable              |
| Stripe IDs               | Hidden            | Hidden                         | Hidden            | Hidden                |

---

## 6. Content and Monetization System

### Post Structure

Each post belongs to exactly one specialist. Fields:

| Field          | Type       | Description                                           |
|----------------|------------|-------------------------------------------------------|
| `content`      | String     | Body text (plain text or Markdown)                    |
| `mediaUrls`    | String[]   | Array of Cloudflare R2 public URLs                    |
| `visibility`   | Enum       | PUBLIC or SUBSCRIBERS_ONLY                             |
| `createdAt`    | DateTime   | Publication timestamp                                 |

### Visibility and Paywall Logic

**Server-side content redaction** is the enforcement mechanism. The API must never send subscriber-only content to unauthorized clients.

When a post with `visibility: SUBSCRIBERS_ONLY` is requested:

1. Server checks if the requesting user has an active subscription (`status: ACTIVE`, `currentPeriodEnd > now()`) to the post's specialist
2. **If subscribed**: Return full `content` and `mediaUrls`
3. **If not subscribed**: Return `locked: true`, `content: ""`, `mediaUrls: []`. The client renders a locked card with: "Subscribe to {specialist.name} to unlock this content"

This redaction happens at the API layer, never client-side. The `locked` boolean on the `Post` type is a computed field, not stored in the database.

### Subscription Pricing

- Monthly recurring billing via Stripe
- Price set by specialist in cents (e.g., 999 = $9.99/month)
- Minimum price: $1.00 (100 cents). Maximum: $999.00 (99900 cents)
- Currency: USD (default). Multi-currency support planned
- Price changes: Create a new Stripe Price, archive the old one. Existing subscribers stay on their current price until renewal

### Publishing Flow

```
Creator opens Content Manager
  --> Clicks "New Post"
  --> Composes content in text area
  --> (Optional) Attaches media files
    --> Client requests presigned upload URL from /api/upload
    --> Client uploads directly to R2 via presigned URL
    --> R2 public URL stored in mediaUrls array
  --> Selects visibility: PUBLIC or SUBSCRIBERS_ONLY
  --> Clicks Publish
  --> POST /api/posts creates the record
  --> Post appears on specialist profile and subscribers' feeds
```

### Future Monetization (Post-MVP)

| Feature              | Description                                         | Priority |
|----------------------|-----------------------------------------------------|----------|
| Subscription tiers   | Basic / Premium / VIP with different content gates   | High     |
| Pay-per-content      | One-time unlock fee for individual posts             | Medium   |
| Tips                 | Voluntary payments from subscribers to specialists   | Medium   |
| Projects             | Freelance-style paid engagements (schema exists)     | Low      |
| Bundles              | Discounted multi-specialist subscriptions            | Low      |

---

## 7. Messaging / Chat System

### Architecture

```
[Consumer Client] --> POST /api/chat --> [Verify Auth + Subscription]
                                              |
                                   +----------+-----------+
                                   |                      |
                              [AI Specialist]        [Human Specialist]
                                   |                      |
                          [OpenAI GPT-4o Stream]    [Persist to DB]
                                   |                      |
                          [Stream Response to Client]  [Notify Creator]
                                   |                      |
                          [Persist Full Response]    [Creator replies via Dashboard]
```

### Conversation Model

- One conversation per (specialist, subscriber) pair, enforced by the `@@unique([specialistId, subscriberId])` constraint
- Conversations are lazy-created on first message via upsert
- Messages have roles: `USER` (subscriber) or `ASSISTANT` (specialist/AI)

### AI Specialist Chat

1. Consumer sends message via POST `/api/chat` with `specialistId` and `content`
2. Server verifies Clerk auth, resolves internal user, checks active subscription
3. Rate limit check: 20 messages/hour per user per AI specialist
4. User message persisted to `Message` table immediately (before OpenAI call)
5. Last 20 messages loaded as conversation context
6. `systemPrompt` retrieved from specialist record, sanitized:
   - Prompt injection patterns stripped (e.g., "ignore previous instructions", "you are now")
   - Truncated to 4000 characters
   - Fallback to generic prompt if empty
7. OpenAI streaming response initiated with `gpt-4o`, `max_tokens: 1024`
8. Response streamed to client as chunked `text/plain`
9. Full response persisted to `Message` table in the stream's `finally` block
10. `X-Conversation-Id` header returned for client state management

### Human Specialist Chat

1. Steps 1-4 same as AI flow
2. Rate limit check: 60 messages/hour per user per human specialist
3. User message persisted to `Message` table
4. Response: `{ success: true, conversationId, message: "Message sent. The creator will respond soon." }`
5. Creator sees the message in their Dashboard messages view
6. Creator composes and sends a reply (stored as `ASSISTANT` role message)
7. Future: Supabase Realtime pushes new messages to the subscriber's client in real time

### Access Gating

Chat requires an active subscription. Enforced server-side:

```sql
WHERE subscriberId = :userId
  AND specialistId = :specialistId
  AND status = 'ACTIVE'
  AND currentPeriodEnd > NOW()
```

If no matching subscription exists, the API returns `403: No active subscription`.

### Rate Limiting

| Specialist Type | Limit         | Window | Scope                    |
|-----------------|---------------|--------|--------------------------|
| AI              | 20 requests   | 1 hour | Per user per specialist   |
| Human           | 60 requests   | 1 hour | Per user per specialist   |

Implementation: In-memory sliding window keyed on `${userId}:${ai|human}`. Resets when the window elapses. Note: in-memory state does not survive serverless cold starts. For production scale, migrate to Redis or Upstash.

### Message Constraints

- Maximum message length: 2000 characters (enforced server-side)
- Content: plain text only (no HTML, no Markdown rendering in chat)
- No file attachments in chat (MVP)

### Future Chat Features

| Feature            | Description                                              |
|--------------------|----------------------------------------------------------|
| Read receipts      | Track message read status per conversation               |
| Typing indicators  | Real-time typing state via Supabase Realtime             |
| Paid messages      | Non-subscribers can send paid one-off messages           |
| Priority messaging | Higher rate limits or guaranteed response time for a fee |
| Group chats        | Specialist broadcasts to all subscribers                 |
| Message reactions  | Emoji reactions on individual messages                   |

---

## 8. Subscribers and CRM Layer

### Subscriber List View

Each specialist has a subscriber management view in the dashboard showing:

| Column            | Source                          | Sortable | Filterable |
|-------------------|---------------------------------|----------|------------|
| Name              | `User.name`                     | Yes      | Yes (search) |
| Email             | `User.email`                    | No       | Yes (search) |
| Avatar            | `User.avatarUrl`                | No       | No         |
| Subscribed since  | `Subscription.createdAt`        | Yes      | Yes (date range) |
| Status            | `Subscription.status`           | Yes      | Yes (dropdown) |
| Renewal date      | `Subscription.currentPeriodEnd` | Yes      | No         |
| Messages sent     | Count of `Message` by user      | Yes      | No         |

### Engagement Metrics (Per Subscriber)

- Total messages sent
- Last message date
- Subscription duration (months active)
- Subscription value (total paid to date)

### Subscriber Lifecycle States

```
PROSPECT --> ACTIVE --> CANCELED
                  \--> PAST_DUE --> ACTIVE (retry success)
                                \--> CANCELED (retry exhausted)
```

### Future CRM Features

| Feature            | Description                                          | Priority |
|--------------------|------------------------------------------------------|----------|
| Tags / segments    | Label subscribers (e.g., "VIP", "New", "At Risk")   | Medium   |
| Automated messages | Welcome message on subscription, re-engagement       | Medium   |
| CSV export         | Download subscriber list with all fields             | High     |
| Churn prediction   | Flag subscribers likely to cancel based on activity  | Low      |
| Notes              | Creator-private notes per subscriber                 | Low      |

---

## 9. Payout and Financial System

### Revenue Split

All subscription revenue flows through Stripe. The platform fee is 15%.

```
Consumer pays $10/month
  --> Stripe processes payment
  --> Sagevu retains $1.50 (15%)
  --> Creator receives $8.50 (85%)
  --> (Stripe processing fees deducted from gross by Stripe)
```

Note: Stripe's own processing fee (~2.9% + 30c) is deducted from the gross amount before the 85/15 split, or from the creator's portion depending on Stripe Connect configuration. The recommended approach is to deduct Stripe fees from the platform's 15% share to maximize creator earnings.

### Stripe Connect Integration

Creators must onboard to Stripe Connect to receive payouts.

**Onboarding Flow:**

```
Creator opens Payout settings
  --> "Connect Stripe Account" CTA
  --> Redirected to Stripe Connect onboarding (hosted)
  --> Creator completes identity verification, bank details
  --> Redirected back to Sagevu
  --> stripeConnectAccountId stored on User record
  --> Payouts enabled
```

**Connect Account Type:** Express (Stripe manages the onboarding UI and dashboard for the connected account).

### Payout Schedule

| Method              | Description                                         |
|---------------------|-----------------------------------------------------|
| Automatic (default) | Stripe pays out to creator's bank on a rolling basis (configurable: daily, weekly, monthly) |
| Manual request      | Creator initiates a payout of available balance      |

### Earnings Dashboard

Visible at `/dashboard/payout`:

- **Gross revenue**: Total subscription payments received
- **Platform fee**: 15% deducted
- **Net earnings**: Gross minus platform fee
- **Available balance**: Funds available for payout (cleared by Stripe)
- **Pending**: Funds in Stripe's holding period (typically 2-7 days)

### Transaction History

| Column          | Description                          |
|-----------------|--------------------------------------|
| Date            | Payment or payout date               |
| Type            | SUBSCRIPTION_PAYMENT, PAYOUT, REFUND |
| Subscriber      | Name (for payments)                  |
| Gross amount    | Total payment amount                 |
| Platform fee    | 15% deducted                         |
| Net amount      | Creator's share                      |
| Status          | SUCCEEDED, PENDING, FAILED, REFUNDED |
| Stripe ID       | Stripe payment/transfer ID           |

### Refund Policy

- **Subscriber-initiated cancellation**: Subscription remains active until `currentPeriodEnd`. No pro-rata refund by default
- **Dispute/chargeback**: Handled through Stripe's dispute resolution. Platform assists with evidence submission
- **Platform-initiated refund**: Admin can issue full or partial refunds. Refund amount deducted from creator's available balance

### Tax Reporting

| Creator Location | Form       | Threshold           |
|------------------|------------|---------------------|
| United States    | 1099-K     | $600/year (per IRS) |
| International    | W-8BEN     | Required before first payout |

Tax form collection is handled by Stripe Connect onboarding. Sagevu does not need to build custom tax form UIs.

### Proposed Payout Data Model

See Section 14 for the `Payout` model definition.

---

## 10. Notifications System

### In-App Notifications

Displayed as a bell icon with unread count in the navigation bar. Clicking opens a dropdown or dedicated `/notifications` page.

| Event                    | Recipient  | Title                                       | Body                                              |
|--------------------------|------------|---------------------------------------------|----------------------------------------------------|
| New subscriber           | Creator    | "New subscriber"                            | "{name} subscribed to {specialist}"                |
| New message              | Creator    | "New message"                               | "{name}: {preview}" (first 80 chars)               |
| Subscription expiring    | Subscriber | "Subscription expiring"                     | "Your subscription to {specialist} renews on {date}"|
| Subscription canceled    | Creator    | "Subscriber lost"                           | "{name} canceled their subscription"               |
| Payout processed         | Creator    | "Payout sent"                               | "${amount} has been sent to your bank account"     |
| Payout failed            | Creator    | "Payout failed"                             | "Your payout of ${amount} failed. Check your bank details" |
| New post published       | Subscriber | "New post from {specialist}"                | "{content preview}" (first 80 chars)               |
| Content reported         | Admin      | "Content report"                            | "{reporter} reported a {type} by {specialist}"     |

### Email Notifications

| Trigger                    | Recipient  | Email Subject                          |
|----------------------------|------------|----------------------------------------|
| Account created            | User       | "Welcome to Sagevu"                    |
| Subscription confirmed     | Subscriber | "You're subscribed to {specialist}"    |
| Payment receipt            | Subscriber | "Payment receipt - {specialist}"       |
| Subscription canceled      | Subscriber | "Subscription canceled"                |
| Subscription expiring (3d) | Subscriber | "Your subscription renews soon"        |
| New subscriber             | Creator    | "You have a new subscriber"            |
| Payout processed           | Creator    | "Payout of ${amount} sent"             |
| Payout failed              | Creator    | "Action required: payout failed"       |

### Implementation Approach

- In-app: `Notification` model in Postgres (see Section 14). Polled on page load or via Supabase Realtime subscription
- Email: Triggered by API route handlers and webhook handlers. Use a transactional email service (Resend, Postmark, or AWS SES). Template-based with the Sagevu branding
- Push notifications: Deferred to post-MVP. Web Push API with service worker registration

### Notification Preferences (Future)

Per-user settings to toggle email and in-app notifications for each event category.

---

## 11. Admin Panel

### Access

Route: `/admin`. Protected by middleware check for `role === 'ADMIN'`. Not linked in public navigation.

### Screen: User Management (`/admin/users`)

- **User table**: ID, name, email, role, created date, last active, status (active/suspended)
- **Actions**: View profile, change role, suspend account, delete account (soft delete)
- **Search**: By name, email, or Clerk ID
- **Filters**: By role (SUBSCRIBER, CREATOR, ADMIN), status, date range

### Screen: Specialist Management (`/admin/specialists`)

- **Specialist table**: Name, slug, type (HUMAN/AI), creator, subscriber count, published status, created date
- **Actions**: View profile, unpublish, delete, edit (override)
- **Filters**: By type, published status, subscriber count range

### Screen: Content Moderation (`/admin/moderation`)

- **Report queue**: List of reported content, sorted by report date
- **Per report**: Reporter, target (post or specialist), reason, status (PENDING / REVIEWED / RESOLVED / DISMISSED)
- **Actions**: View content, remove content, warn creator, suspend specialist, dismiss report
- **Appeal handling**: If a creator appeals a content removal, admin reviews and either upholds or reverses

### Screen: Financial Overview (`/admin/finance`)

- **Platform metrics**: Total gross revenue, total platform fees collected, total creator payouts, pending payouts
- **Revenue chart**: Daily/weekly/monthly platform revenue over time
- **Per-specialist breakdown**: Top earners, revenue distribution
- **Refund queue**: Pending refund requests with approve/deny actions
- **Chargeback tracker**: Active disputes with Stripe dispute IDs and status

### Screen: Analytics (`/admin/analytics`)

| Metric                    | Description                                    |
|---------------------------|------------------------------------------------|
| DAU / MAU                 | Daily and monthly active users                 |
| Signup rate               | New accounts per day/week/month                |
| Conversion rate           | Visitors to subscribers                        |
| Subscriber churn          | Monthly cancellation rate                      |
| Revenue per specialist    | Average and median monthly revenue             |
| ARPU                      | Average revenue per user                       |
| LTV                       | Estimated subscriber lifetime value            |
| Top specialists           | Ranked by subscribers, revenue, messages       |
| Content volume            | Posts per day/week, media uploads              |
| AI vs Human split         | Ratio of AI to human specialist engagement     |

---

## 12. System Behavior and Logic

### Flow: Subscription Purchase

```
1. Consumer visits /{slug} and clicks "Subscribe - $X/month"
2. Client sends POST /api/subscribe with { specialistId }
3. Server authenticates via Clerk, resolves internal userId
4. Server validates:
   a. Specialist exists and isPublished === true
   b. stripePriceId is set (Stripe product configured)
   c. Consumer is not the specialist's creator (self-subscribe blocked)
5. Server calls createCheckoutSession() with:
   - priceId: specialist.stripePriceId
   - metadata: { specialistId, subscriberId, platform_fee_percent: "15" }
   - successUrl: /{slug}?subscribed=true
   - cancelUrl: /{slug}
6. Server returns { url: checkoutSession.url }
7. Client redirects consumer to Stripe Checkout
8. Consumer enters payment details on Stripe-hosted page
9. Stripe processes payment and fires customer.subscription.created webhook
10. POST /api/webhooks/stripe receives event:
    a. Validates stripe-signature
    b. Extracts subscription metadata (specialistId, subscriberId)
    c. Upserts Subscription record:
       - stripeSubscriptionId, stripeCustomerId
       - status: ACTIVE
       - currentPeriodEnd: from Stripe timestamp
11. Consumer is redirected to /{slug}?subscribed=true
12. Page loads with active subscription -> locked content now visible
```

### Flow: Content Unlock Check

```
1. Client requests specialist's posts (GET /api/posts?specialistId=X or page load)
2. Server fetches all posts for specialist, ordered by createdAt desc
3. For each post:
   a. If visibility === PUBLIC: return full content and mediaUrls
   b. If visibility === SUBSCRIBERS_ONLY:
      i. Check if requesting user has active subscription (status=ACTIVE, currentPeriodEnd > now)
      ii. If YES: return full content and mediaUrls, locked=false
      iii. If NO: return content="", mediaUrls=[], locked=true
4. Client renders posts. Locked posts show paywall card
```

### Flow: Messaging (AI Specialist)

```
1. Subscriber opens chat with AI specialist (/{slug}/chat or /messages)
2. Client sends POST /api/chat { specialistId, content, conversationId? }
3. Server: auth check -> user lookup -> subscription check -> rate limit check
4. Server upserts Conversation (one per specialist+subscriber pair)
5. Server persists USER message to Message table
6. Server loads last 20 messages for context
7. Server sanitizes specialist.systemPrompt (injection patterns, length)
8. Server initiates OpenAI streaming completion:
   - system: sanitized systemPrompt
   - messages: conversation history + new user message
   - model: gpt-4o, max_tokens: 1024
9. Server streams response chunks to client as text/plain
10. Client renders chunks incrementally in chat UI
11. On stream completion: full response persisted as ASSISTANT message
12. X-Conversation-Id header allows client to track conversation state
```

### Flow: Payout Request

```
1. Creator opens /dashboard/payout
2. Dashboard fetches earnings summary via API
3. Creator clicks "Request Payout"
4. Server validates:
   a. Creator has a connected Stripe Connect account
   b. Available balance > minimum payout threshold ($10)
5. Server creates Stripe Transfer to connected account
6. Server creates Payout record (status: PROCESSING)
7. Stripe processes transfer (typically 2-7 business days)
8. Stripe fires transfer.paid or transfer.failed webhook
9. Server updates Payout record status (COMPLETED or FAILED)
10. Notification sent to creator
```

### Edge Cases

| Scenario                                  | Behavior                                                                  |
|-------------------------------------------|---------------------------------------------------------------------------|
| Subscription expires while browsing       | Next API request returns locked content. Client should handle gracefully: show re-subscribe CTA |
| Double payment (duplicate webhook)        | Subscription upsert uses `stripeSubscriptionId` as unique key. Second webhook is a no-op update |
| Webhook delivery failure                  | Stripe retries with exponential backoff (up to 3 days). Upsert is idempotent |
| Stripe customer ID mismatch              | Metadata on subscription contains `subscriberId` (Sagevu internal ID). Customer ID is secondary |
| OpenAI API timeout or error               | Stream errors are caught. Partial response (if any) is still persisted. Client shows error state |
| Serverless cold start resets rate limiter  | In-memory rate limiter resets. Acceptable for MVP; migrate to distributed store for production |
| Creator deletes specialist with active subs| Block deletion if active subscriptions exist. Require canceling all subs first |
| User signs up via social auth then email   | Clerk handles account linking. Webhook fires `user.updated` to sync changes |
| Slug collision on specialist creation      | Slug has `@unique` constraint. Return validation error, suggest alternative |
| Price change with active subscribers       | Old Stripe Price is archived. Existing subscribers keep their rate. New subscribers get new price |

---

## 13. Technical Architecture

### System Diagram

```
                          +------------------+
                          |   Cloudflare R2  |
                          |  (Media Storage) |
                          +--------+---------+
                                   ^
                                   | Presigned Upload
                                   |
+-------------+    HTTPS    +------+--------+    Prisma     +-----------+
|   Browser   +------------>+   Next.js 15  +-------------->+ Supabase  |
|  (React 19) |<------------+  (App Router) |<--------------+ Postgres  |
+-------------+  SSR + API  +---+------+----+   Direct URL  +-----+-----+
                                |      |                          |
                                |      |                    Realtime WS
                                |      |                    (Chat, future)
                           +----+  +---+----+
                           |       |        |
                    +------+--+ +--+-----+ ++--------+
                    |  Clerk  | | OpenAI | |  Stripe  |
                    |  (Auth) | | GPT-4o | | (Payments)|
                    +---------+ +--------+ +----------+
```

### Stack Details

| Layer        | Technology                     | Notes                                      |
|--------------|--------------------------------|---------------------------------------------|
| Framework    | Next.js 15 (App Router)        | TypeScript strict mode                      |
| Styling      | Tailwind CSS + MD3 dark tokens | Custom color extensions in tailwind.config   |
| Components   | shadcn/ui primitives           | Radix-based, Tailwind-styled                |
| ORM          | Prisma                         | PostgreSQL adapter, singleton client         |
| Database     | Supabase PostgreSQL            | Direct connection (5432), pooler (6543)      |
| Realtime     | Supabase Realtime              | WebSocket for Message table (planned)        |
| Auth         | Clerk                          | JWT sessions, webhooks, social auth          |
| Payments     | Stripe                         | Checkout Sessions, Webhooks, Connect         |
| AI           | OpenAI GPT-4o                  | Streaming completions, server-side only      |
| Storage      | Cloudflare R2                  | S3-compatible, presigned uploads, public CDN |
| Hosting      | Vercel                         | Serverless functions, edge network           |

### Database Connection Strategy

- **Application queries**: Use Supabase connection pooler (port 6543) via `DATABASE_URL` for serverless-safe pooled connections
- **Prisma migrations**: Use direct connection (port 5432) via `DIRECT_URL` for DDL operations
- **Connection limit**: Supabase free tier allows ~20 direct connections. Pooler handles multiplexing for serverless

### Key Indexes

Defined in Prisma schema:

| Table          | Index                                         | Purpose                              |
|----------------|-----------------------------------------------|--------------------------------------|
| `Specialist`   | `[isPublished, createdAt]`                    | Discover page queries                |
| `Post`         | `[specialistId, createdAt]`                   | Specialist profile post listing      |
| `Subscription` | `[subscriberId, specialistId, status]`        | Subscription check (paywall, chat)   |
| `Message`      | `[conversationId, createdAt]`                 | Chat history pagination              |

### Recommended Additional Indexes

| Table          | Index                          | Purpose                              |
|----------------|--------------------------------|--------------------------------------|
| `Specialist`   | `[creatorId]`                  | Dashboard: list creator's specialists|
| `Conversation` | `[subscriberId]`              | Messages page: list user's chats     |
| `Notification` | `[userId, read, createdAt]`   | Unread notification queries          |
| `Payout`       | `[creatorId, status]`         | Payout dashboard queries             |

### Security Architecture

| Concern              | Solution                                                |
|----------------------|---------------------------------------------------------|
| Authentication       | Clerk JWT (httpOnly cookie, middleware-enforced)         |
| Authorization        | Role check in API routes; subscription check for gated content |
| Webhook validation   | Stripe: signature verification. Clerk: Svix signature   |
| Input sanitization   | systemPrompt: injection pattern removal, length cap. Chat: length validation |
| File uploads         | Presigned URLs with 5-minute expiry, content-type restriction |
| API rate limiting    | In-memory sliding window (MVP). Upstash Redis (production) |
| Data isolation       | All queries scoped to authenticated user's ID           |
| Secrets              | Environment variables. Never exposed to client bundle   |

### Scalability Considerations

| Bottleneck              | Current State           | Scale Solution                          |
|-------------------------|-------------------------|-----------------------------------------|
| DB connections          | Direct (20 max)         | Supabase pooler (port 6543)             |
| OpenAI latency          | Streaming mitigates UX  | Queue + async for non-chat AI features  |
| Rate limiter state      | In-memory (resets)      | Redis / Upstash                         |
| Media delivery          | R2 public URL           | Cloudflare CDN (built-in with R2)       |
| Chat real-time          | Polling / page refresh  | Supabase Realtime WebSocket             |
| Search                  | Prisma LIKE queries     | PostgreSQL full-text search or Meilisearch |

---

## 14. Data Model

### Current Schema (Implemented)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")     // Supabase pooler (6543)
  directUrl = env("DIRECT_URL")       // Supabase direct (5432)
}

// --- Core user account, synced from Clerk via webhook ---
model User {
  id            String         @id @default(cuid())
  clerkId       String         @unique        // Clerk external ID
  email         String         @unique
  name          String?
  avatarUrl     String?
  role          Role           @default(SUBSCRIBER)
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  conversations Conversation[]
  specialists   Specialist[]                   // Specialists this user created
  projects      Project[]      @relation("ClientProjects")
  subscriptions Subscription[]                 // Subscriptions this user holds
}

// --- Public-facing specialist profile (Human or AI) ---
model Specialist {
  id                String         @id @default(cuid())
  creatorId         String                     // FK to User.id (the owner)
  name              String
  slug              String         @unique     // URL-safe identifier for /{slug}
  bio               String?
  avatarUrl         String?                    // R2 public URL
  coverUrl          String?                    // R2 public URL
  type              SpecialistType @default(HUMAN)
  specialty         String?                    // Category/expertise label
  tagline           String?                    // One-line pitch
  systemPrompt      String?                    // AI behavior instructions (AI type only)
  isPublished       Boolean        @default(false)
  subscriptionPrice Int            @default(0) // Monthly price in cents
  currency          String         @default("usd")
  stripePriceId     String?                    // Active Stripe Price ID
  stripeProductId   String?                    // Stripe Product ID
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  conversations     Conversation[]
  creator           User           @relation(fields: [creatorId], references: [id])
  posts             Post[]
  projects          Project[]
  subscriptions     Subscription[]

  @@index([isPublished, createdAt])            // Discover page listing
}

// --- Content published by a specialist ---
model Post {
  id           String     @id @default(cuid())
  specialistId String
  content      String                          // Body text (plain or Markdown)
  mediaUrls    String[]                        // Array of R2 public URLs
  visibility   Visibility @default(PUBLIC)
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  specialist   Specialist @relation(fields: [specialistId], references: [id])

  @@index([specialistId, createdAt])           // Profile post listing
}

// --- Subscriber<->Specialist relationship, backed by Stripe ---
model Subscription {
  id                   String             @id @default(cuid())
  subscriberId         String                  // FK to User.id
  specialistId         String                  // FK to Specialist.id
  stripeSubscriptionId String             @unique
  stripeCustomerId     String
  status               SubscriptionStatus @default(ACTIVE)
  currentPeriodEnd     DateTime                // Stripe billing period end
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
  specialist           Specialist         @relation(fields: [specialistId], references: [id])
  subscriber           User               @relation(fields: [subscriberId], references: [id])

  @@index([subscriberId, specialistId, status]) // Paywall + chat access check
}

// --- Freelance project (future feature) ---
model Project {
  id                    String        @id @default(cuid())
  specialistId          String
  clientId              String?
  title                 String
  description           String
  price                 Int                    // Price in cents
  status                ProjectStatus @default(OPEN)
  stripePaymentIntentId String?
  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt
  client                User?         @relation("ClientProjects", fields: [clientId], references: [id])
  specialist            Specialist    @relation(fields: [specialistId], references: [id])
}

// --- 1:1 chat thread between subscriber and specialist ---
model Conversation {
  id           String     @id @default(cuid())
  specialistId String
  subscriberId String
  createdAt    DateTime   @default(now())
  specialist   Specialist @relation(fields: [specialistId], references: [id])
  subscriber   User       @relation(fields: [subscriberId], references: [id])
  messages     Message[]

  @@unique([specialistId, subscriberId])       // One conversation per pair
}

// --- Individual message within a conversation ---
model Message {
  id             String       @id @default(cuid())
  conversationId String
  role           MessageRole                   // USER (subscriber) or ASSISTANT (specialist/AI)
  content        String
  createdAt      DateTime     @default(now())
  conversation   Conversation @relation(fields: [conversationId], references: [id])

  @@index([conversationId, createdAt])         // Chat history pagination
}

enum Role {
  CREATOR
  SUBSCRIBER
  ADMIN
}

enum SpecialistType {
  HUMAN
  AI
}

enum Visibility {
  PUBLIC
  SUBSCRIBERS_ONLY
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  INCOMPLETE
}

enum ProjectStatus {
  OPEN
  IN_PROGRESS
  COMPLETED
  CANCELED
}

enum MessageRole {
  USER
  ASSISTANT
}
```

### Proposed New Models

#### Payout

Tracks creator withdrawal requests and Stripe Connect transfers.

```prisma
model Payout {
  id               String       @id @default(cuid())
  creatorId        String                          // FK to User.id
  specialistId     String?                         // Optional: payout for a specific specialist
  amount           Int                             // Amount in cents (net, after 15% fee)
  grossAmount      Int                             // Gross amount before platform fee
  platformFee      Int                             // Platform fee amount (15%)
  currency         String       @default("usd")
  stripeTransferId String?      @unique            // Stripe Transfer ID
  status           PayoutStatus @default(PENDING)
  periodStart      DateTime                        // Earnings period start
  periodEnd        DateTime                        // Earnings period end
  failureReason    String?                         // Reason if payout failed
  createdAt        DateTime     @default(now())
  updatedAt        DateTime     @updatedAt
  creator          User         @relation(fields: [creatorId], references: [id])

  @@index([creatorId, status])
  @@index([createdAt])
}

enum PayoutStatus {
  PENDING        // Requested, not yet processed
  PROCESSING     // Stripe Transfer initiated
  COMPLETED      // Funds delivered to creator's bank
  FAILED         // Transfer failed (insufficient balance, bank rejection)
  CANCELED       // Canceled by admin or creator before processing
}
```

#### Notification

In-app notification system for all user-facing events.

```prisma
model Notification {
  id        String           @id @default(cuid())
  userId    String                                 // FK to User.id (recipient)
  type      NotificationType
  title     String                                 // Short display title
  body      String                                 // Notification body text
  link      String?                                // Deep link URL (e.g., /messages, /{slug})
  read      Boolean          @default(false)
  createdAt DateTime         @default(now())
  user      User             @relation(fields: [userId], references: [id])

  @@index([userId, read, createdAt])               // Unread notifications query
}

enum NotificationType {
  NEW_SUBSCRIBER
  SUBSCRIBER_CANCELED
  NEW_MESSAGE
  POST_PUBLISHED
  SUBSCRIPTION_EXPIRING
  PAYOUT_PROCESSED
  PAYOUT_FAILED
  CONTENT_REPORTED
  CONTENT_REMOVED
  SYSTEM                                           // Platform announcements
}
```

#### Report

Content moderation and user reporting system.

```prisma
model Report {
  id           String       @id @default(cuid())
  reporterId   String                              // FK to User.id (who filed the report)
  targetType   ReportTarget                        // What is being reported
  targetId     String                              // ID of the reported entity (Post.id, Specialist.id, etc.)
  reason       ReportReason
  description  String?                             // Optional free-text explanation
  status       ReportStatus @default(PENDING)
  reviewedBy   String?                             // Admin User.id who reviewed
  reviewNote   String?                             // Admin's internal note
  resolvedAt   DateTime?
  createdAt    DateTime     @default(now())
  updatedAt    DateTime     @updatedAt
  reporter     User         @relation("ReportsFiled", fields: [reporterId], references: [id])

  @@index([status, createdAt])                     // Moderation queue
  @@index([targetType, targetId])                  // Reports per target
}

enum ReportTarget {
  POST
  SPECIALIST
  MESSAGE
  USER
}

enum ReportReason {
  SPAM
  HARASSMENT
  INAPPROPRIATE_CONTENT
  MISINFORMATION
  IMPERSONATION
  COPYRIGHT
  OTHER
}

enum ReportStatus {
  PENDING                                          // Awaiting review
  REVIEWING                                        // Admin is investigating
  RESOLVED                                         // Action taken (removal, warning, etc.)
  DISMISSED                                        // Report found invalid
  APPEALED                                         // Creator appealed a resolved report
}
```

### Required User Model Updates

To support the new models, the `User` model needs additional relations:

```prisma
model User {
  // ... existing fields ...
  payouts       Payout[]
  notifications Notification[]
  reportsFiled  Report[]       @relation("ReportsFiled")

  // For Stripe Connect payouts:
  stripeConnectAccountId String?    @unique        // Stripe Connected Account ID
  stripeConnectOnboarded Boolean    @default(false) // Whether onboarding is complete
}
```

### Migration Strategy

New models should be added incrementally:

1. **Phase 1** (MVP): Add `Notification` model. Low risk, no existing data dependencies
2. **Phase 2** (Post-MVP): Add `Report` model. Requires admin panel UI
3. **Phase 3** (Monetization): Add `Payout` model + `User.stripeConnectAccountId`. Requires Stripe Connect integration

Each phase uses `prisma db push` for schema sync during development, and `prisma migrate` for production deployments with explicit migration files.

---

## Appendix: Environment Variables

| Variable                              | Service          | Required |
|---------------------------------------|------------------|----------|
| `DATABASE_URL`                        | Supabase pooler  | Yes      |
| `DIRECT_URL`                          | Supabase direct  | Yes      |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`   | Clerk            | Yes      |
| `CLERK_SECRET_KEY`                    | Clerk            | Yes      |
| `CLERK_WEBHOOK_SECRET`               | Clerk            | Yes      |
| `STRIPE_SECRET_KEY`                   | Stripe           | Yes      |
| `STRIPE_WEBHOOK_SECRET`              | Stripe           | Yes      |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe           | Yes      |
| `OPENAI_API_KEY`                      | OpenAI           | Yes      |
| `CLOUDFLARE_R2_ACCOUNT_ID`           | Cloudflare R2    | Yes      |
| `CLOUDFLARE_R2_ACCESS_KEY_ID`        | Cloudflare R2    | Yes      |
| `CLOUDFLARE_R2_SECRET_ACCESS_KEY`    | Cloudflare R2    | Yes      |
| `CLOUDFLARE_R2_BUCKET_NAME`          | Cloudflare R2    | Yes      |
| `NEXT_PUBLIC_R2_PUBLIC_URL`          | Cloudflare R2    | Yes      |
| `NEXT_PUBLIC_APP_URL`                | App              | Yes      |
| `NEXT_PUBLIC_SUPABASE_URL`           | Supabase         | Yes      |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`      | Supabase         | Yes      |
| `SUPABASE_SERVICE_ROLE_KEY`          | Supabase         | Server only |
