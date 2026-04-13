# Sagevu Frontend Engineer Memory

## Project Structure
- Framework: Next.js 15, React 19, TypeScript strict mode
- Styling: Tailwind CSS v3 with custom MD3 dark theme (tailwind.config.ts — no CDN)
- Path alias: `@/` maps to `./src/` (NOT project root)
- Components: `src/components/{ui,layout,persona,chat}/`
- Types: `src/types/index.ts`
- Utils: `src/lib/utils.ts` (cn, formatCurrency, formatRelativeTime, generateSlug)
- Supabase client: `src/lib/supabase.ts` — server: `supabaseAdmin`, browser: `createBrowserSupabaseClient()`

## Design Token Quick Reference
- Backgrounds: `bg-surface-container-lowest` (#0E0E11), `bg-surface-container` (#1F1F22), `bg-surface-container-high` (#2A2A2D), `bg-surface-container-low` (#1B1B1E)
- Text: `text-on-surface` (#E5E1E6), `text-on-surface-variant` (#C7C4D8), `text-outline` (#918FA1)
- Primary: `text-primary` / `bg-primary` (#C4C0FF), `bg-primary-container` (#8781FF)
- Border: `border-outline-variant/10` or `/20`
- Gradient CTA: `bg-gradient-to-br from-primary to-primary-container text-on-primary`
- Purple shadow: `shadow-[0_10px_20px_-10px_rgba(108,99,255,0.4)]`

## Card Pattern
```tsx
<div className="bg-surface-container border border-outline-variant/10 rounded-xl ...">
```

## Active Nav Pattern (Sidebar)
```tsx
isActive ? 'bg-gradient-to-r from-primary/20 to-transparent text-white border-l-4 border-primary'
         : 'text-outline hover:bg-surface-container-high hover:text-white border-l-4 border-transparent'
```

## Material Icons Usage
```tsx
<span className="material-symbols-outlined" aria-hidden="true">icon_name</span>
// Filled variant:
style={{ fontVariationSettings: "'FILL' 1" }}
```

## Persona Business Rules
- PersonaType: 'HUMAN' | 'AI'
- PostVisibility: 'PUBLIC' | 'SUBSCRIBERS_ONLY'
- subscriptionPrice is in cents (use formatCurrency from utils)
- isLocked = post.visibility === 'SUBSCRIBERS_ONLY' && !isSubscribed

## Chat Patterns
- ChatWindow uses Supabase Realtime for live messages
- AI personas: stream response via ReadableStream from /api/chat
- Optimistic user message added before fetch, removed on error
- `X-Conversation-Id` response header carries new conversation ID

## UI Patterns
- No inline styles except `fontVariationSettings` for filled icons
- `no-scrollbar` utility class defined in globals.css
- `typing-dot` animation class in globals.css (for chat typing indicator)
- `gradient-text` utility in globals.css
- `prose-dark` class for rich text content

## Accessibility Standards
- `aria-current="page"` on active nav links
- `role="list"` + `role="listitem"` on chat messages
- `aria-live="polite"` on chat messages container
- `aria-label` on icon-only buttons
- `<time dateTime={iso}>` for timestamps
- `<header>` / `<footer>` / `<article>` semantic tags in PostCard

## App Route Map (confirmed structure)
```
src/app/
  layout.tsx                                              — root layout, ClerkProvider
  page.tsx                                                — discover (server, force-dynamic)
  (auth)/sign-in/[[...sign-in]]/page.tsx                  — Clerk SignIn
  (auth)/sign-up/[[...sign-up]]/page.tsx                  — Clerk SignUp
  (dashboard)/layout.tsx                                  — dashboard shell, auth-gated (server)
  (dashboard)/dashboard/page.tsx                          — creator overview (server)
  (dashboard)/dashboard/persona/new/page.tsx              — create persona (client)
  (dashboard)/dashboard/persona/[personaId]/edit/page.tsx — edit persona (client)
  (dashboard)/dashboard/persona/[personaId]/posts/new/    — new post (client)
  [slug]/page.tsx                                         — public profile (server)
  [slug]/chat/page.tsx                                    — subscriber chat (server shell)
  api/personas/[id]/route.ts                              — GET (owner) + PATCH
```

## Next.js 15 Gotchas
- `params` is a Promise: always `const { slug } = await params`
- `generateMetadata` also receives `params` as a Promise
- `force-dynamic` needed on every page that reads auth or DB per request
- `notFound()` / `redirect()` are from `next/navigation` and work in server components

## Form Best Practices (Client pages)
- Add `noValidate` when doing JS validation
- Error banners: `role="alert"`, success: `role="status"`
- Radio-style toggle groups: `role="radiogroup"` + `role="radio" aria-checked`
- Avoid unused `@ts-expect-error` — use explicit type assertions instead
- `void asyncFn()` pattern when calling async inside `useEffect` without returning the promise

## API Conventions
- All mutating routes: auth() → resolve user → check ownership → proceed
- 401 = no session, 403 = unauthorized, 404 = not found
- Persona.subscriptionPrice stored in cents; UI form shows dollars, converts on submit
- `systemPrompt` is on the Prisma model but intentionally absent from the TS `Persona` interface

## Files: See patterns.md for extended patterns
