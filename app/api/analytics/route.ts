import { whopSdk } from "@/lib/whop-sdk";
import { NextResponse } from "next/server";

// Helper function to calculate date ranges
const getDaysAgo = (days: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
};

// Helper function for exponential backoff retry
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  initialDelay = 1000,
): Promise<T> {
  let lastError: Error | undefined;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

export async function GET(): Promise<Response> {
  try {
    // Fetch data from Whop API with retry logic
    const [subscriptionsResponse, paymentsResponse, productsResponse] = await Promise.all([
      retryWithBackoff(() => whopSdk.subscriptions.list({ per: 1000 })),
      retryWithBackoff(() => whopSdk.payments.list({ per: 1000 })),
      retryWithBackoff(() => whopSdk.products.list({ per: 100 })),
    ]);

    const subscriptions = subscriptionsResponse.data || [];
    const payments = paymentsResponse.data || [];
    const products = productsResponse.data || [];

    // Date calculations
    const now = new Date();
    const thirtyDaysAgo = getDaysAgo(30);
    const sixtyDaysAgo = getDaysAgo(60);
    const ninetyDaysAgo = getDaysAgo(90);

    // Filter active subscriptions
    const activeSubscriptions = subscriptions.filter(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );

    // Calculate MRR (Monthly Recurring Revenue)
    // Sum of all active recurring subscription prices
    const mrr = activeSubscriptions.reduce((sum, sub) => {
      // Handle different billing periods
      const price = sub.plan?.renewal_price || 0;
      const interval = sub.plan?.billing_period || "month";

      // Normalize to monthly
      let monthlyPrice = price;
      if (interval === "year") {
        monthlyPrice = price / 12;
      } else if (interval === "week") {
        monthlyPrice = price * 4.33; // Average weeks per month
      } else if (interval === "day") {
        monthlyPrice = price * 30;
      }

      return sum + monthlyPrice;
    }, 0);

    // Calculate new subscriptions in last 30 days
    const newSubscriptions = subscriptions.filter((sub) => {
      const createdAt = new Date(sub.created_at);
      return createdAt >= thirtyDaysAgo && createdAt <= now;
    }).length;

    // Calculate churn rate
    // Churn = (Cancelled subscriptions in last 30 days / Total active 30 days ago) * 100
    const subscribersThirtyDaysAgo = subscriptions.filter((sub) => {
      const createdAt = new Date(sub.created_at);
      return createdAt <= thirtyDaysAgo;
    }).length;

    const cancelledInLast30Days = subscriptions.filter((sub) => {
      const cancelledAt = sub.cancel_at_period_end ? new Date(sub.cancel_at_period_end) : null;
      return (
        cancelledAt &&
        cancelledAt >= thirtyDaysAgo &&
        cancelledAt <= now &&
        (sub.status === "cancelled" || sub.status === "past_due")
      );
    }).length;

    const churnRate = subscribersThirtyDaysAgo > 0
      ? (cancelledInLast30Days / subscribersThirtyDaysAgo) * 100
      : 0;

    // Calculate revenue trend for last 90 days (grouped by day)
    const revenueTrend: { date: string; revenue: number }[] = [];

    for (let i = 89; i >= 0; i--) {
      const date = getDaysAgo(i);
      const dateStr = date.toISOString().split('T')[0];

      const dailyRevenue = payments
        .filter((payment) => {
          const paymentDate = new Date(payment.created_at);
          return paymentDate.toISOString().split('T')[0] === dateStr;
        })
        .reduce((sum, payment) => sum + (payment.final_amount || 0), 0);

      revenueTrend.push({
        date: dateStr,
        revenue: dailyRevenue / 100, // Convert cents to dollars
      });
    }

    // Calculate top 5 products by revenue (last 30 days)
    const productRevenueMap = new Map<string, { name: string; revenue: number }>();

    payments
      .filter((payment) => {
        const paymentDate = new Date(payment.created_at);
        return paymentDate >= thirtyDaysAgo && paymentDate <= now;
      })
      .forEach((payment) => {
        const productId = payment.product_id;
        if (productId) {
          const existing = productRevenueMap.get(productId);
          const revenue = (payment.final_amount || 0) / 100; // Convert cents to dollars

          if (existing) {
            existing.revenue += revenue;
          } else {
            const product = products.find((p) => p.id === productId);
            productRevenueMap.set(productId, {
              name: product?.title || `Product ${productId}`,
              revenue: revenue,
            });
          }
        }
      });

    // Sort and get top 5
    const topProducts = Array.from(productRevenueMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    // Return analytics data
    return NextResponse.json({
      metrics: {
        mrr: Math.round(mrr) / 100, // Convert cents to dollars
        churnRate: Math.round(churnRate * 100) / 100, // Round to 2 decimal places
        newSubscriptions,
        totalActiveSubscribers: activeSubscriptions.length,
      },
      revenueTrend,
      topProducts,
    });

  } catch (error) {
    console.error("Error fetching analytics data:", error);

    // Return appropriate error response
    return NextResponse.json(
      {
        error: "Failed to fetch analytics data",
        message: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
