import { sql } from "./db";
import type { Giveaway, Entry } from "./types/database";

/**
 * Dashboard statistics for a company
 */
export interface DashboardStats {
	totalGiveaways: number;
	activeGiveaways: number;
	totalEntries: number;
	totalWinners: number;
}

/**
 * Giveaway with computed entry count
 */
export interface GiveawayWithStats extends Giveaway {
	entries_count: number;
	winners_count: number;
}

/**
 * Fetch dashboard statistics for a company
 */
export async function getDashboardStats(
	companyId: string,
): Promise<DashboardStats> {
	try {
		const [giveawaysResult, activeResult, entriesResult, winnersResult] =
			await Promise.all([
				sql`SELECT COUNT(*)::int AS count FROM giveaways WHERE company_id = ${companyId}`,
				sql`SELECT COUNT(*)::int AS count FROM giveaways WHERE company_id = ${companyId} AND status = 'active'`,
				sql`SELECT COUNT(*)::int AS count FROM entries e INNER JOIN giveaways g ON g.id = e.giveaway_id WHERE g.company_id = ${companyId}`,
				sql`SELECT COUNT(*)::int AS count FROM winners w INNER JOIN giveaways g ON g.id = w.giveaway_id WHERE g.company_id = ${companyId}`,
			]);

		return {
			totalGiveaways: giveawaysResult[0]?.count ?? 0,
			activeGiveaways: activeResult[0]?.count ?? 0,
			totalEntries: entriesResult[0]?.count ?? 0,
			totalWinners: winnersResult[0]?.count ?? 0,
		};
	} catch (error) {
		console.error("[getDashboardStats] Database error for company:", companyId, error);
		return {
			totalGiveaways: 0,
			activeGiveaways: 0,
			totalEntries: 0,
			totalWinners: 0,
		};
	}
}

/**
 * Fetch all giveaways for a company with entry/winner counts
 */
export async function getCompanyGiveaways(
	companyId: string,
): Promise<GiveawayWithStats[]> {
	try {
		const rows = await sql`
			SELECT g.*,
				(SELECT COUNT(*)::int FROM entries e WHERE e.giveaway_id = g.id) AS entries_count,
				(SELECT COUNT(*)::int FROM winners w WHERE w.giveaway_id = g.id) AS winners_count
			FROM giveaways g
			WHERE g.company_id = ${companyId}
			ORDER BY g.created_at DESC
		`;

		return rows as unknown as GiveawayWithStats[];
	} catch (error) {
		console.error("Failed to fetch giveaways:", error);
		return [];
	}
}

/**
 * Fetch a single giveaway by ID
 */
export async function getGiveaway(
	giveawayId: string,
): Promise<Giveaway | null> {
	try {
		const rows = await sql`SELECT * FROM giveaways WHERE id = ${giveawayId}`;

		if (rows.length === 0) return null;
		return rows[0] as unknown as Giveaway;
	} catch (error) {
		console.error("Failed to fetch giveaway:", error);
		return null;
	}
}

/**
 * Fetch entries for a giveaway with pagination
 */
export async function getGiveawayEntries(
	giveawayId: string,
	options: { limit?: number; offset?: number } = {},
): Promise<{ entries: Entry[]; total: number }> {
	const { limit = 50, offset = 0 } = options;

	try {
		const [rows, countResult] = await Promise.all([
			sql`
				SELECT * FROM entries
				WHERE giveaway_id = ${giveawayId}
				ORDER BY entry_count DESC
				LIMIT ${limit} OFFSET ${offset}
			`,
			sql`SELECT COUNT(*)::int AS count FROM entries WHERE giveaway_id = ${giveawayId}`,
		]);

		return {
			entries: rows as unknown as Entry[],
			total: countResult[0]?.count ?? 0,
		};
	} catch (error) {
		console.error("Failed to fetch entries:", error);
		return { entries: [], total: 0 };
	}
}

/**
 * Fetch recent entries across all giveaways for a company
 */
export async function getRecentEntries(
	companyId: string,
	limit = 10,
): Promise<Entry[]> {
	try {
		const rows = await sql`
			SELECT e.*
			FROM entries e
			INNER JOIN giveaways g ON g.id = e.giveaway_id
			WHERE g.company_id = ${companyId}
			ORDER BY e.created_at DESC
			LIMIT ${limit}
		`;

		return rows as unknown as Entry[];
	} catch (error) {
		console.error("Failed to fetch recent entries:", error);
		return [];
	}
}

/**
 * Format a number with K/M suffix for large numbers
 */
export function formatNumber(num: number): string {
	if (num >= 1000000) {
		return `${(num / 1000000).toFixed(1).replace(/\.0$/, "")}M`;
	}
	if (num >= 1000) {
		return `${(num / 1000).toFixed(1).replace(/\.0$/, "")}K`;
	}
	return num.toString();
}

/**
 * Format a date for display
 */
export function formatDate(dateString: string): string {
	return new Date(dateString).toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});
}

/**
 * Format a date range
 */
export function formatDateRange(start: string, end: string): string {
	const startDate = new Date(start);
	const endDate = new Date(end);

	const startStr = startDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
	});

	const endStr = endDate.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		year: "numeric",
	});

	return `${startStr} - ${endStr}`;
}
