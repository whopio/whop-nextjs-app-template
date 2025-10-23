This is a template for a whop app built in NextJS. Fork it and keep the parts you need for your app.

# Whop NextJS App Template with Revenue Analytics Dashboard

To run this project:

1. Install dependencies with: `pnpm i`

2. Create a Whop App on your [whop developer dashboard](https://whop.com/dashboard/developer/), then go to the "Hosting" section and:
	- Ensure the "Base URL" is set to the domain you intend to deploy the site on.
	- Ensure the "App path" is set to `/experiences/[experienceId]`
	- Ensure the "Dashboard path" is set to `/dashboard/[companyId]`
	- Ensure the "Discover path" is set to `/discover`

3. Copy the environment variables from the `.env.development` into a `.env.local`. Ensure to use real values from the whop dashboard.

4. Go to a whop created in the same org as the app you created. Navigate to the tools section and add your app.

5. Run `pnpm dev` to start the dev server. Then in the top right of the window find a translucent settings icon. Select "localhost". The default port 3000 should work.

## Deploying

1. Upload your fork / copy of this template to github.

2. Go to [Vercel](https://vercel.com/new) and link the repository. Deploy your application with the environment variables from your `.env.local`

3. If necessary update you "Base Domain" and webhook callback urls on the app settings page on the whop dashboard.

## Troubleshooting

**App not loading properly?** Make sure to set the "App path" in your Whop developer dashboard. The placeholder text in the UI does not mean it's set - you must explicitly enter `/experiences/[experienceId]` (or your chosen path name)
a

**Make sure to add env.local** Make sure to get the real app environment vairables from your whop dashboard and set them in .env.local

## Analytics Dashboard

This template now includes a comprehensive revenue analytics dashboard at `/analytics`. The dashboard provides real-time insights into your subscription business.

### Features

The analytics dashboard displays:

- **Monthly Recurring Revenue (MRR)**: Total monthly revenue from all active subscriptions
- **Churn Rate**: Percentage of subscribers who cancelled in the last 30 days
- **New Subscriptions**: Number of new subscriptions acquired in the last 30 days
- **Active Subscribers**: Total count of currently active subscribers
- **Revenue Trend Chart**: Line chart showing daily revenue over the last 90 days
- **Top Products**: Bar chart showing the top 5 products by revenue (last 30 days)

### How to Access

1. Navigate to `/analytics` in your browser, or
2. Click the "Analytics" link in the navigation bar

### Required Environment Variables

The analytics dashboard requires the same environment variables as the base template:

- `WHOP_API_KEY` - Your Whop API key (server-side only)
- `NEXT_PUBLIC_WHOP_APP_ID` - Your Whop App ID
- `NEXT_PUBLIC_WHOP_AGENT_USER_ID` - Agent user ID for SDK operations
- `NEXT_PUBLIC_WHOP_COMPANY_ID` - Your company ID

### Technical Details

**API Route**: `/app/api/analytics/route.ts`
- Fetches subscription, payment, and product data from Whop API
- Implements exponential backoff retry logic for resilience
- Calculates all metrics server-side
- Returns JSON response with structured analytics data

**Frontend Page**: `/app/analytics/page.tsx`
- Client-side rendered with loading and error states
- Responsive design for mobile and desktop
- Real-time data fetching on page load

**Visualization**:
- Uses Chart.js (v4) and react-chartjs-2 for interactive charts
- Customizable chart colors and styling
- Responsive charts that adapt to screen size

### Extending the Dashboard

You can easily extend the dashboard by:

1. **Adding new metrics**: Modify `/app/api/analytics/route.ts` to calculate additional metrics
2. **Customizing time ranges**: Update the date range calculations in the API route
3. **Adding filters**: Implement date range pickers or product filters in the frontend
4. **Real-time updates**: Add polling or WebSocket connections for live data

For more info, see our docs at https://dev.whop.com/introduction
