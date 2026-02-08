# GiveawayMaster - Whop App Setup Guide

Complete guide to configuring GiveawayMaster in the Whop Developer Dashboard.

---

## 1. App Settings (General)

Go to **https://dash.whop.com/developer** and select your app.

### Basic Info

| Field | Value |
|-------|-------|
| **App Name** | Giveaway Master |
| **Tagline** | Create viral giveaways with built-in referral tracking |
| **Description** | (see Section 8 below) |
| **App Icon** | Upload a 512x512 icon (gift box / giveaway themed) |

### Hosting

| Field | Value |
|-------|-------|
| **Base URL** | `https://whop-nextjs-app-template.vercel.app/` |

### Paths

| Path | Value |
|------|-------|
| **Experience Path** | `/experiences/$experienceId` |
| **Dashboard Path** | `/dashboard/$companyId` |
| **Discover Path** | `/discover` |

> **Note:** Whop uses `$experienceId` and `$companyId` (with `$` prefix, no brackets) as the placeholder format in the developer dashboard. The Next.js `[experienceId]` folder routing handles the rest.

---

## 2. Permissions

Go to the **Permissions** tab. Enable these:

| Permission | Why |
|------------|-----|
| **Read company info** | Dashboard needs to display company name/title |
| **Read user info** | To identify users entering giveaways |
| **Read experiences** | To link giveaways to specific experiences |
| **Read memberships** | Webhook handler processes membership events |

If you see granular permission options, enable read access for:
- Companies
- Users
- Experiences
- Memberships

You do NOT need write permissions for any Whop resources — the app only reads from Whop and writes to its own database.

---

## 3. OAuth

Leave OAuth settings **empty/disabled**. This app uses Whop's built-in iframe authentication (`x-whop-user-token` header), not OAuth.

---

## 4. Webhooks

Go to the **Webhooks** tab.

### Create Webhook

| Field | Value |
|-------|-------|
| **Webhook URL** | `https://whop-nextjs-app-template.vercel.app/api/webhooks` |

### Events to Subscribe

Enable these three events:

- `payment.succeeded`
- `membership.activated`
- `membership.deactivated`

### Webhook Secret

After creating the webhook, Whop will show you a **webhook signing secret**. Copy it and:

1. Add it to your **`.env.local`** file:
   ```
   WHOP_WEBHOOK_SECRET="your_webhook_secret_here"
   ```

2. Add it to your **Vercel environment variables**:
   - Go to your Vercel project > Settings > Environment Variables
   - Add `WHOP_WEBHOOK_SECRET` with the secret value
   - Apply to Production, Preview, and Development

3. **Redeploy** on Vercel after adding the env var (or it won't take effect).

---

## 5. Products / Experiences

GiveawayMaster works by attaching giveaways to **Whop experiences**. Here's how:

### Create a Product (if you don't have one)

1. Go to your **Whop company dashboard** (not the developer dashboard)
2. Create a product (free or paid — this is the product users access to see giveaways)
3. Go to the product's settings and **add the GiveawayMaster app** as an experience

### How It Works

- When you add GiveawayMaster to a product, Whop creates an **experience** with a unique `experienceId`
- Users who have access to that product will see the giveaway page at `/experiences/[experienceId]`
- In the creator dashboard, you create giveaways and they're linked to the company
- The experience page shows the active giveaway for that experience

### Linking Giveaways to Experiences

Currently, giveaways are created via the dashboard at `/dashboard/[companyId]`. To link a giveaway to a specific experience, you'll need to set the `experience_id` in the database. The create form currently creates giveaways at the company level.

---

## 6. Pricing Plans

GiveawayMaster uses three pricing tiers: Free, Pro ($14.99/mo), and Business ($39.99/mo). To enable paid tiers:

### Create Plans in Whop

1. Go to your **Whop company dashboard**
2. Create two paid products/plans:
   - **Pro** — $14.99/month
   - **Business** — $39.99/month
3. Note the **plan ID** for each (visible in the URL or plan details, e.g., `plan_XXXXXXXXX`)

### Set Environment Variables

Add the plan IDs to your `.env.local` and Vercel environment variables:

```
WHOP_PRO_PLAN_ID=plan_YOUR_PRO_PLAN_ID
WHOP_BUSINESS_PLAN_ID=plan_YOUR_BUSINESS_PLAN_ID
```

### How It Works

- When a user purchases a Pro or Business plan, the `membership.activated` webhook fires
- The webhook handler maps the plan ID to a tier and stores it in the `company_subscriptions` table
- When a membership is deactivated, the company is downgraded back to Free
- Tier limits are enforced on giveaway creation, entry, and winner selection

### Tier Limits

| Feature | Free | Pro | Business |
|---------|------|-----|----------|
| Active Giveaways | 1 | 5 | Unlimited |
| Entries per Giveaway | 100 | Unlimited | Unlimited |
| Winners per Giveaway | 1 | 10 | Unlimited |

---

## 7. Environment Variables Checklist

Make sure ALL of these are set in both `.env.local` (local dev) and Vercel (production):

| Variable | Where to Find It |
|----------|-----------------|
| `WHOP_API_KEY` | Whop Developer Dashboard > Your App > API Key |
| `WHOP_WEBHOOK_SECRET` | Whop Developer Dashboard > Your App > Webhooks > Secret |
| `NEXT_PUBLIC_WHOP_APP_ID` | Whop Developer Dashboard > Your App > App ID |
| `DATABASE_URL` | Neon Dashboard > Your Project > Connection Details (set automatically by Neon-Vercel integration) |
| `WHOP_PRO_PLAN_ID` | Whop Dashboard > Your Pro pricing plan > Plan ID |
| `WHOP_BUSINESS_PLAN_ID` | Whop Dashboard > Your Business pricing plan > Plan ID |

### Verify in Vercel

Go to Vercel project > Settings > Environment Variables and confirm:
- `WHOP_API_KEY` is set
- `WHOP_WEBHOOK_SECRET` is set
- `NEXT_PUBLIC_WHOP_APP_ID` is set
- `DATABASE_URL` is set (should already be there from Neon integration)

---

## 8. Testing the App

### Test the Dashboard

1. Go to your Whop company page
2. Open the app from the seller/admin side
3. You should see the dashboard at `/dashboard/[companyId]` with stats cards and a "Create Giveaway" button
4. If you see "Access Denied", your user doesn't have admin/owner access to that company

### Test the Experience (User View)

1. Add GiveawayMaster as an experience to one of your products
2. As a user with access to that product, open the experience
3. You should see the giveaway page (or an empty state if no active giveaway is linked)

### Test Webhooks

1. In the Whop Developer Dashboard, go to the Webhooks tab
2. Use the "Send Test" button to fire a test `payment.succeeded` event
3. Check your Vercel function logs to see if it was received

---

## 9. App Store Listing (Discover Page)

When you're ready to list on the Whop App Store, fill in these fields in the developer dashboard:

### Suggested Description

```
Giveaway Master - Create Viral Giveaways with Referral Tracking

Grow your audience exponentially with giveaways that spread themselves.
Each participant gets a unique referral link — more referrals mean more
entries and a higher chance of winning, creating a viral growth loop.

Features:
- Viral Referral System: Unique referral links for every participant. More referrals = more entries = higher odds of winning
- Dashboard Analytics: Track entries, referrals, and growth in real-time
- Fair Winner Selection: Weighted random selection that rewards active participants
- Easy Setup: Create a giveaway in seconds with prize details and dates

How It Works:
1. Create — Set up a giveaway with prize details and entry rules
2. Share — Participants enter and get unique referral links
3. Grow — Referrals earn bonus entries, creating viral loops
4. Pick — Select winners with fair weighted random selection

Perfect for creators, communities, and businesses looking to grow
their audience through incentivized sharing.
```

### Categories

Select: **Marketing**, **Community**, or **Engagement** (whichever are available)

### Screenshots

Take screenshots of:
1. The creator dashboard with stats cards and giveaway list
2. The user-facing giveaway entry page
3. The "entered" state showing referral code and entry count
4. The discover/marketing page

---

## 10. Common Issues

### "Access Denied" on Dashboard
- Your user must be an **admin** or **owner** of the company
- The app checks access via `whop.users.checkAccess()`

### Giveaway Not Showing on Experience Page
- Make sure the giveaway has `status = 'active'` in the database
- Make sure the giveaway's `experience_id` matches the experience you're viewing
- Check that the giveaway dates are valid (start_date <= now <= end_date)

### Webhook Not Working
- Verify the webhook URL is exactly: `https://whop-nextjs-app-template.vercel.app/api/webhooks`
- Make sure `WHOP_WEBHOOK_SECRET` is set in Vercel env vars AND matches what Whop shows
- The secret is base64-encoded in the code (`btoa()`), so use the raw secret from Whop
- Check Vercel function logs for errors

### Build/Deploy Issues
- The `DATABASE_URL` must be set in Vercel env vars (should be automatic from Neon integration)
- `NEXT_PUBLIC_WHOP_APP_ID` must be prefixed with `NEXT_PUBLIC_` since it's used client-side
