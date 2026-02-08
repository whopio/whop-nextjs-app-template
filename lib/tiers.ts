import { sql } from "./db";

// ============================================================================
// TYPES & CONSTANTS
// ============================================================================

export type TierName = "free" | "pro" | "business";

export interface TierLimits {
	maxActiveGiveaways: number;
	maxEntriesPerGiveaway: number;
	maxWinnersPerGiveaway: number;
}

export const TIER_LIMITS: Record<TierName, TierLimits> = {
	free: {
		maxActiveGiveaways: 1,
		maxEntriesPerGiveaway: 100,
		maxWinnersPerGiveaway: 1,
	},
	pro: {
		maxActiveGiveaways: 5,
		maxEntriesPerGiveaway: Number.MAX_SAFE_INTEGER,
		maxWinnersPerGiveaway: 10,
	},
	business: {
		maxActiveGiveaways: Number.MAX_SAFE_INTEGER,
		maxEntriesPerGiveaway: Number.MAX_SAFE_INTEGER,
		maxWinnersPerGiveaway: Number.MAX_SAFE_INTEGER,
	},
};

export const TIER_DISPLAY: Record<
	TierName,
	{ label: string; price: string }
> = {
	free: { label: "Free", price: "$0/mo" },
	pro: { label: "Pro", price: "$14.99/mo" },
	business: { label: "Business", price: "$39.99/mo" },
};

export interface CompanyTierInfo {
	tier: TierName;
	limits: TierLimits;
	display: { label: string; price: string };
	activeGiveaways: number;
}

// ============================================================================
// PLAN ID MAPPING
// ============================================================================

export function getTierFromPlanId(planId: string): TierName | null {
	if (planId === process.env.WHOP_PRO_PLAN_ID) return "pro";
	if (planId === process.env.WHOP_BUSINESS_PLAN_ID) return "business";
	return null;
}

export function getTierFromPlanOrProductId(
	planId: string | undefined,
	productId: string | undefined,
): TierName | null {
	const proId = process.env.WHOP_PRO_PLAN_ID;
	const bizId = process.env.WHOP_BUSINESS_PLAN_ID;

	if (planId === proId || productId === proId) return "pro";
	if (planId === bizId || productId === bizId) return "business";
	return null;
}

// ============================================================================
// DATABASE QUERIES
// ============================================================================

export async function getCompanyTier(companyId: string): Promise<TierName> {
	const rows = await sql`
		SELECT tier FROM company_subscriptions
		WHERE company_id = ${companyId} AND status = 'active'
	`;
	if (rows.length === 0) return "free";
	return rows[0].tier as TierName;
}

export async function getCompanyTierInfo(
	companyId: string,
): Promise<CompanyTierInfo> {
	const [tierRows, activeRows] = await Promise.all([
		sql`
			SELECT tier FROM company_subscriptions
			WHERE company_id = ${companyId} AND status = 'active'
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM giveaways
			WHERE company_id = ${companyId} AND status = 'active'
		`,
	]);

	const tier: TierName =
		tierRows.length > 0 ? (tierRows[0].tier as TierName) : "free";

	return {
		tier,
		limits: TIER_LIMITS[tier],
		display: TIER_DISPLAY[tier],
		activeGiveaways: activeRows[0]?.count ?? 0,
	};
}

export async function upsertCompanySubscription(params: {
	companyId: string;
	tier: TierName;
	planId: string;
	membershipId: string;
	userId: string | null;
}): Promise<void> {
	await sql`
		INSERT INTO company_subscriptions (company_id, tier, plan_id, membership_id, user_id, status, activated_at, updated_at)
		VALUES (${params.companyId}, ${params.tier}, ${params.planId}, ${params.membershipId}, ${params.userId ?? null}, 'active', NOW(), NOW())
		ON CONFLICT (company_id) DO UPDATE SET
			tier = EXCLUDED.tier,
			plan_id = EXCLUDED.plan_id,
			membership_id = EXCLUDED.membership_id,
			user_id = EXCLUDED.user_id,
			status = 'active',
			activated_at = NOW(),
			deactivated_at = NULL,
			updated_at = NOW()
	`;
}

export async function deactivateCompanySubscription(
	membershipId: string,
): Promise<void> {
	await sql`
		UPDATE company_subscriptions
		SET tier = 'free', status = 'inactive', deactivated_at = NOW(), updated_at = NOW()
		WHERE membership_id = ${membershipId}
	`;
}
