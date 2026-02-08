# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Install deps:** `pnpm i`
- **Dev server:** `pnpm dev` (runs `whop-proxy --command 'next dev --turbopack'`)
- **Build:** `pnpm build`
- **Lint:** `pnpm lint` (uses Biome)
- **Start prod:** `pnpm start`

## Architecture

**GiveawayMaster** is a Whop Marketplace app for creating viral giveaways with referral tracking. Built with Next.js 16 (App Router), React 19, Whop SDK, and Neon (serverless PostgreSQL). It runs inside the Whop platform as an embedded app.

### Key Libraries

- **@whop/sdk** — Server-side SDK for Whop API (auth, users, companies, experiences, webhooks)
- **@whop/react** — React components (`WhopApp`, `Button`, `Dialog`, `DropdownMenu`, `Text`), Next.js config wrapper, Frosted UI theme plugin, CSS layer
- **@neondatabase/serverless** — Neon serverless PostgreSQL driver (SQL tagged template literals)
- **@whop-apps/dev-proxy** — Dev proxy that wraps `next dev` to simulate the Whop iframe environment locally
- **Tailwind CSS v4** with PostCSS — uses CSS layers and Frosted UI theme; styles in `app/globals.css`
- **Biome** — Linter and formatter (tabs, double quotes, recommended rules)
- **sonner** — Toast notifications
- **zod** — Schema validation for server actions

### App Structure

All pages use the Next.js App Router (`app/` directory):

- **`app/layout.tsx`** — Root layout wraps everything in `<WhopApp>` provider, includes Sonner `<Toaster>`
- **`app/page.tsx`** — Redirects to whop.com (shown outside Whop context)
- **`app/experiences/[experienceId]/page.tsx`** — User-facing giveaway page. Server component that verifies user token, fetches active giveaway for the experience, shows enter/entered state
- **`app/dashboard/[companyId]/page.tsx`** — Creator dashboard. Server component with stats cards, giveaways table, create/pick-winner dialogs
- **`app/discover/page.tsx`** — Public marketing page for app marketplace listing
- **`app/access-denied/page.tsx`** — Shown when user lacks dashboard permissions
- **`app/error/page.tsx`** — Generic error page with go-back action
- **`app/api/webhooks/route.ts`** — Webhook handler for payment and membership events

### Database (Neon PostgreSQL)

Schema in `supabase/migrations/20231231000000_initial_schema.sql` (standard PostgreSQL, works on Neon):

- **`giveaways`** — Giveaway definitions with `experience_id` linking to Whop experiences, status enum (draft/active/ended/cancelled), prize info, dates, entry limits
- **`entries`** — Participant entries with referral tracking (`referral_code`, `referred_by`), entry count (incremented by referrals)
- **`winners`** — Selected winners linked to giveaway and entry
- **`entry_actions`** — Social actions completed by participants (twitter_follow, discord_join, etc.)

Key features:
- Database trigger auto-increments referrer's entry count when someone uses their referral code
- `generate_referral_code()` function for unique codes
- `select_weighted_random_winner()` function for fair winner selection
- All access is server-side with app-level auth validation (no RLS needed)

### Database Client

`lib/db.ts` exports a lazy-initialized `sql` tagged template function from `@neondatabase/serverless`, plus helper functions (`generateReferralCode`, `isGiveawayActive`, `selectWeightedRandomWinner`). Uses a Proxy pattern so the Neon client is only created when first accessed at runtime (prevents build-time crashes with placeholder env vars).

### SDK Singleton

`lib/whop.ts` exports a `whop` instance of `Whop` initialized with env vars, plus helper functions (`verifyUserToken`, `getCompany`, `getUser`, `checkUserAccess`, `getExperience`).

### Auth Pattern

- **Dashboard:** `lib/auth.ts` provides `getDashboardAuthContext()` which verifies the user token and checks company access. Redirects to `/access-denied` on failure.
- **Experience:** Server components call `whop.verifyUserToken(await headers())` directly.

### Server Actions

All mutations use Next.js Server Actions in `lib/actions/giveaway-actions.ts`:
- `enterGiveaway(giveawayId, userId, referralCode?)` — Enter a giveaway, generates referral code
- `createGiveaway(formData)` — Create new giveaway with Zod validation
- `pickWinner(giveawayId)` — Weighted random winner selection
- `getUserEntry(giveawayId, userId)` — Check if user has entered

### Environment Variables

Defined in `.env.development`, real values in `.env.local`:

- `WHOP_API_KEY` — App API key from Whop dashboard
- `WHOP_WEBHOOK_SECRET` — Webhook signing secret
- `NEXT_PUBLIC_WHOP_APP_ID` — Public app identifier
- `DATABASE_URL` — Neon PostgreSQL connection string

### Whop Dashboard Configuration

The app requires these paths configured in the Whop developer dashboard:
- App path: `/experiences/[experienceId]`
- Dashboard path: `/dashboard/[companyId]`
- Discover path: `/discover`

### Code Style

Biome enforces: tabs for indentation, double quotes, recommended lint rules, auto-organized imports. Path alias `@/*` maps to project root.

### Theming

Uses Frosted UI (from `@whop/react`) which provides auto light/dark mode. Key color tokens:
- Backgrounds: `bg-gray-1`, `bg-gray-a2`, `bg-gray-a3`
- Text: `text-gray-12` (primary), `text-gray-10` (secondary), `text-gray-8` (muted)
- Borders: `border-gray-a4`, `border-gray-a6`
- Accent colors: `bg-blue-a3`, `text-blue-11`, `bg-green-a3`, `text-green-11`, `bg-orange-a3`, `bg-red-a3`
