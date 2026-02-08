# GiveawayMaster — Strategic Plan

A Whop Marketplace app that enables creators to run viral giveaways with referral tracking, milestone rewards, and leaderboards to grow their email lists, Whop members, Discord communities, and social followings.

---

## The Opportunity

### Why This Wins on Whop

**Whop's existing giveaway tools are extremely basic:**
- The built-in **Giveaways app** is a simple "join and random draw" tool — no referral mechanics, no viral loops, no leaderboards, no analytics
- The **Whop Wheel** is a daily engagement spinner (Whop funds prizes) — not a growth tool
- **Neither has referral/viral mechanics** — the single most valuable feature for creator growth

**No external giveaway tool integrates with Whop:**
A Whop creator using Gleam or SweepWidget today must manage two dashboards, manually map users between systems, manually grant prizes, and cannot gate entries by Whop membership. GiveawayMaster eliminates all of that friction by being Whop-native.

### Competitive Moat

| Capability | Gleam/SweepWidget/etc. | GiveawayMaster |
|---|---|---|
| Gate entries by Whop membership | No | Yes |
| Auto-grant Whop access as prize | No | Yes |
| Pre-fill from Whop user profile | No | Yes |
| Manage from Whop dashboard | No | Yes |
| Trigger giveaways from Whop events | No | Yes |
| Send Whop push notifications | No | Yes |

These are structural advantages that external tools cannot replicate without building a Whop app themselves.

---

## Product Architecture

### How It Works Inside Whop

GiveawayMaster is a **hybrid app** — it uses both Whop app views:

**Dashboard View** (`/dashboard/[companyId]/...`) — For creators:
- Create and manage giveaways
- Configure referral mechanics, prizes, and entry actions
- View analytics (entries, referrals, conversion rates, leaderboard)
- Draw winners and fulfill prizes
- Manage app subscription/billing

**Experience View** (`/experiences/[experienceId]/...`) — For participants:
- Browse active giveaways
- Enter giveaways and complete bonus actions
- See personal referral link + stats
- View leaderboard position
- Track milestone reward progress

**Public Giveaway Page** (external shareable URL):
- Landing page for each giveaway (shared via referral links)
- Entry form for non-Whop users (collects email, creates lead)
- Social proof (participant count, countdown timer)
- Mobile-responsive

**Webhook Handler** (`/api/webhooks/`):
- Listen for `payment.succeeded`, `membership.activated`, `membership.deactivated`
- Auto-trigger giveaway events (e.g., new member = auto-enter giveaway)
- Track prize fulfillment

### Data Architecture

**Whop does not provide app storage — GiveawayMaster needs its own database.**

Recommended: **Neon Postgres** (serverless, generous free tier, works great with Vercel/Next.js) or **PlanetScale/Turso** for SQLite-based.

ORM: **Drizzle** (lightweight, type-safe, great DX with Next.js App Router)

**Core Tables:**

```
giveaways
  id, company_id, experience_id, title, description, prize_type, prize_value,
  start_date, end_date, max_entries, status, settings_json,
  created_at, updated_at

participants
  id, giveaway_id, user_id (whop), email, name, referral_code (unique),
  referred_by (participant_id), entry_count, created_at

entry_actions
  id, giveaway_id, participant_id, action_type, action_value,
  verified, points_awarded, created_at

milestone_rewards
  id, giveaway_id, referral_threshold, reward_type, reward_value,
  description

milestone_claims
  id, milestone_reward_id, participant_id, claimed_at, fulfilled

winners
  id, giveaway_id, participant_id, prize_description, drawn_at,
  fulfilled, fulfilled_at

app_subscriptions
  id, company_id, plan_tier, whop_membership_id, status,
  created_at, expires_at
```

### Tech Stack

- **Framework:** Next.js 16 (App Router) — already set up in template
- **SDK:** @whop/sdk + @whop/react — auth, API calls, UI components
- **Database:** Neon Postgres (serverless)
- **ORM:** Drizzle ORM
- **Styling:** Tailwind CSS v4 + Frosted UI (Whop's design system)
- **Deployment:** Vercel
- **Email:** Resend (for winner notifications, giveaway alerts)
- **Analytics:** PostHog or built-in (for giveaway performance tracking)

---

## Feature Roadmap

### V1 — MVP (Launch in 4-6 weeks)

The goal: Get on the Whop Marketplace with a working product that's better than the built-in giveaway tool and has the one killer feature nobody else on Whop offers — **viral referral links**.

**Creator Dashboard:**
1. Giveaway creation wizard (3 steps: details, prizes, duration)
2. Active/past giveaway management (edit, pause, delete)
3. Participant list with referral stats
4. Random winner draw (provably fair — seed + algorithm visible)
5. Basic analytics (total entries, referrals, daily growth chart)

**Participant Experience:**
6. Giveaway entry page with email collection
7. Unique referral link per participant (copy-to-clipboard)
8. Referral counter ("You've referred X people — Y bonus entries earned")
9. Public leaderboard (top 10 with anonymized lower positions)
10. Countdown timer + participant count (urgency/social proof)

**Whop-Native Features:**
11. Whop user auto-fill (name, email pre-populated for logged-in users)
12. Whop membership verification as entry gate ("Must be a member to enter")
13. Auto-grant Whop experience access as prize (via SDK `experiences.attach`)

**Infrastructure:**
14. Webhook handler for membership events
15. Fraud prevention: IP dedup, email verification, rate limiting
16. Mobile-responsive design
17. Light/dark mode support (required for Whop app store)

### V2 — Growth Features (Month 2-3)

18. **Milestone rewards** — Unlock prizes at referral thresholds (3/10/25/50 referrals)
19. **Social entry actions** — Bonus entries for Twitter/X follow, Discord join, YouTube subscribe, Instagram follow
20. **Social action verification** — Confirm follows actually happened via OAuth
21. **Whop push notifications** — Notify participants of giveaway updates, winners, milestones
22. **Email integrations** — Export participants to Mailchimp, ConvertKit, Beehiiv, Resend
23. **Custom branding** — Creator's logo/colors on giveaway pages (Pro tier)
24. **Giveaway templates** — Pre-built configurations for common use cases
25. **Advanced analytics** — Referral chain visualization, conversion funnel, viral coefficient (k-factor)

### V3 — Scale Features (Month 4-6)

26. **Webhook triggers** — Auto-enter members in giveaways on purchase/membership events
27. **Recurring giveaways** — Auto-create weekly/monthly giveaways on schedule
28. **A/B testing** — Test different prize configurations, entry requirements
29. **Public API** for creators who want programmatic control
30. **Cross-promotion network** — Whop creators promote each other's giveaways (SparkLoop model)
31. **Instant win / probability-based prizes** (similar to Whop Wheel but with referral mechanics)
32. **White-label** — Complete branding removal for enterprise creators

---

## Monetization Strategy

### Pricing Model: Freemium with Monthly Subscription

GiveawayMaster charges creators via Whop's built-in payment system (`inAppPurchase` or checkout links tied to plans).

**Free Tier** (drives installs, reviews, and marketplace ranking):
- 1 active giveaway at a time
- Up to 100 participants per giveaway
- Referral links + basic leaderboard
- GiveawayMaster branding on pages
- Basic analytics

**Pro — $29/month** (the core revenue driver):
- Unlimited active giveaways
- Up to 5,000 participants per giveaway
- Milestone rewards
- Social entry actions
- Remove GiveawayMaster branding
- Email export (CSV)
- Priority support

**Business — $79/month** (for high-volume creators):
- Unlimited participants
- Advanced analytics + viral coefficient tracking
- Email integrations (Mailchimp, ConvertKit, etc.)
- Custom branding (logo, colors)
- Giveaway templates
- Recurring giveaways
- API access
- White-label (giveaway pages)

### Revenue Projections

Conservative estimates based on Whop marketplace size:
- Month 1-3: 100 installs, 10 paid ($290-790/mo)
- Month 4-6: 500 installs, 50 paid ($1,450-3,950/mo)
- Month 7-12: 2,000 installs, 200 paid ($5,800-15,800/mo)
- Year 2: 5,000+ installs, 500+ paid ($14,500-39,500/mo)

**Note:** Whop charges standard payment processing fees (2.7% + $0.30 per transaction). Factor this into margin calculations.

### Pricing Anchoring

The value prop is clear: if a single giveaway brings in just 50 new members at $20/month, that's $1,000/month in new recurring revenue for the creator. A $29-79/month tool is trivially justified.

---

## Go-to-Market Strategy

### Phase 1: Launch (Weeks 1-2 post-build)

**Marketplace Listing Requirements (from Whop docs):**
- App icons + branding (polished, professional)
- 10-20 second demo video showing the full giveaway flow
- 2-3 screenshots (creator dashboard + participant view)
- Category: Tools / Marketing / Growth
- Both light and dark mode must work
- Must be end-to-end functional, no placeholders

**Launch Tactics:**
1. **Generous free tier** — maximize installs and reviews (marketplace ranking = installs x ratings)
2. **Launch giveaway** — use GiveawayMaster itself to run a launch giveaway (meta!) offering free Pro access
3. **Direct outreach** — message 20-30 active Whop creators offering free Pro for 3 months in exchange for feedback and a review
4. **Whop community** — post in Whop creator forums/Discord about the launch

### Phase 2: Growth (Months 2-6)

5. **Case studies** — document the first 5 successful giveaways with real numbers (entries, referrals, new members gained)
6. **Content marketing** — blog posts: "How to 10x Your Whop Members with Viral Giveaways"
7. **Affiliate program** — offer 20-30% recurring commission for creators who refer other creators
8. **Discover page optimization** — the `/discover` page should showcase real success stories with referral links
9. **Integration partnerships** — partner with popular email tools (Beehiiv, ConvertKit) for co-marketing

### Phase 3: Dominance (Month 6+)

10. **Cross-promotion network** — connect Whop creators to promote each other's giveaways
11. **Auto-giveaway templates** — one-click "New Member Giveaway" or "Anniversary Giveaway" setups
12. **Whop featured app** — work with Whop team to get featured placement

---

## Technical Implementation Plan

### Phase 0: Foundation (Week 1)

1. Set up database (Neon Postgres + Drizzle ORM)
2. Define schema and run migrations
3. Set up project structure:
   ```
   app/
     dashboard/[companyId]/        # Creator dashboard (existing, expand)
       page.tsx                     # Dashboard home — list giveaways
       create/page.tsx              # Create giveaway wizard
       [giveawayId]/page.tsx        # Manage single giveaway
       [giveawayId]/analytics/      # Analytics view
       settings/page.tsx            # App subscription management
     experiences/[experienceId]/    # Participant experience (existing, expand)
       page.tsx                     # List active giveaways
       [giveawayId]/page.tsx        # Enter giveaway + referral dashboard
     g/[referralCode]/page.tsx      # Public giveaway entry (shareable URL)
     api/
       webhooks/route.ts            # Whop webhooks (existing, expand)
       giveaways/route.ts           # CRUD API
       enter/route.ts               # Entry submission
       referral/route.ts            # Referral tracking
   lib/
     whop-sdk.ts                    # Existing SDK singleton
     db.ts                          # Drizzle client
     schema.ts                      # Drizzle schema definitions
     referral.ts                    # Referral link generation + tracking
     draw.ts                        # Winner selection algorithm
     fraud.ts                       # Anti-fraud utilities
   ```
4. Configure environment variables (add `DATABASE_URL`, `RESEND_API_KEY`)
5. Set up Whop app with both Dashboard and Experience views enabled

### Phase 1: Core Giveaway Engine (Weeks 2-3)

6. Giveaway CRUD (create, read, update, delete, list by company)
7. Participant entry flow (email collection, Whop user detection, dedup)
8. Referral link generation (short unique codes, e.g., `gm_a1b2c3`)
9. Referral tracking (attribute new entries to referrers, award bonus entries)
10. Winner drawing algorithm (cryptographically weighted random, verifiable seed)

### Phase 2: Creator Dashboard (Week 3-4)

11. Dashboard home — list active/past giveaways with stats
12. Create giveaway wizard — 3-step form (details, prizes, schedule)
13. Giveaway management — participant list, referral stats, draw winners
14. Analytics page — entries over time, referral chain, top referrers

### Phase 3: Participant Experience (Week 4-5)

15. Giveaway entry page — form + referral link display + stats
16. Leaderboard component — real-time ranking
17. Countdown timer + participant count
18. Public giveaway page (the `/g/[referralCode]` shareable URL)
19. Mobile-responsive + light/dark mode polish

### Phase 4: Whop Integration + Monetization (Week 5-6)

20. Whop membership gating (entry requires active membership)
21. Prize fulfillment via Whop SDK (auto-grant experience access to winners)
22. App subscription — create Whop plans for Free/Pro/Business tiers
23. In-app purchase flow for upgrading (via `inAppPurchase` iframe SDK method)
24. Webhook handling — membership events trigger auto-entries

### Phase 5: Polish + Launch (Week 6)

25. Fraud prevention (IP tracking, email dedup, rate limiting)
26. App store assets (icons, screenshots, demo video)
27. Discover page with marketing copy
28. Testing — end-to-end on real Whop with test memberships
29. Submit to Whop app store review

---

## Key Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Whop app review rejection | Delays launch | Follow requirements exactly: light/dark mode, no placeholders, polished UI, demo video |
| Low marketplace discovery | Slow adoption | Free tier for installs, direct creator outreach, use the app to run its own launch giveaway |
| Fraud/abuse (fake entries) | Creator trust loss | IP dedup, email verification, rate limiting from V1. Social verification in V2 |
| Whop builds this natively | Existential | Move fast, build moat with advanced features (milestones, analytics, cross-promo) that Whop won't prioritize |
| Database costs at scale | Margin erosion | Neon's free tier handles 500MB + 100 compute hours. Won't be an issue until significant traction |
| Referral link sharing on social platforms getting flagged | Reduced virality | Use clean URLs, avoid URL shorteners, provide share templates that look organic |

---

## Success Metrics

**V1 Launch (first 30 days):**
- 100+ app installs
- 10+ active giveaways created by different creators
- 1,000+ total giveaway participants
- 5+ marketplace reviews (target 4.5+ stars)
- 5+ paid subscribers

**V2 Growth (90 days):**
- 500+ installs
- 50+ paid subscribers ($1,500-4,000 MRR)
- Average viral coefficient > 1.2 (each participant brings 1.2 more)
- 3+ case studies with documented creator growth

**Year 1:**
- 2,000+ installs
- 200+ paid subscribers ($6,000-16,000 MRR)
- Recognized as the go-to giveaway tool on Whop
