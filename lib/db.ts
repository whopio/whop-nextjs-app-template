import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

let _sql: NeonQueryFunction<false, false> | null = null;

function getSql() {
	if (!_sql) {
		const databaseUrl = process.env.DATABASE_URL;
		if (!databaseUrl) {
			throw new Error(
				"Missing DATABASE_URL environment variable. Please set it to your Neon connection string.",
			);
		}
		_sql = neon(databaseUrl);
	}
	return _sql;
}

/**
 * Lazily-initialized Neon SQL tagged template function.
 * Usage: sql`SELECT * FROM giveaways WHERE id = ${id}`
 */
export const sql = new Proxy((() => {}) as unknown as NeonQueryFunction<false, false>, {
	apply(_target, _thisArg, args) {
		return getSql()(...(args as [TemplateStringsArray, ...unknown[]]));
	},
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate a unique referral code
 */
export function generateReferralCode(): string {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let result = "";
	for (let i = 0; i < 8; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

/**
 * Check if a giveaway is currently active
 */
export function isGiveawayActive(giveaway: {
	status: string;
	start_date: string;
	end_date: string;
}): boolean {
	if (giveaway.status !== "active") return false;

	const now = new Date();
	const start = new Date(giveaway.start_date);
	const end = new Date(giveaway.end_date);

	return now >= start && now <= end;
}

/**
 * Calculate weighted random selection for winner picking
 */
export function selectWeightedRandomWinner<T extends { entry_count: number }>(
	entries: T[],
): T | null {
	if (entries.length === 0) return null;

	const totalWeight = entries.reduce((sum, e) => sum + e.entry_count, 0);
	let random = Math.random() * totalWeight;

	for (const entry of entries) {
		random -= entry.entry_count;
		if (random <= 0) return entry;
	}

	return entries[entries.length - 1];
}
