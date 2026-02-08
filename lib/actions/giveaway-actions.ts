"use server";

import { z } from "zod";
import { headers } from "next/headers";
import { sql, generateReferralCode, selectWeightedRandomWinner } from "@/lib/db";
import { verifyUserToken } from "@/lib/whop";
import { getCompanyTier, TIER_LIMITS } from "@/lib/tiers";

// ============================================================================
// VALIDATION SCHEMAS
// ============================================================================

export const createGiveawaySchema = z.object({
	title: z
		.string()
		.min(1, "Title is required")
		.max(100, "Title must be less than 100 characters"),
	description: z
		.string()
		.max(500, "Description must be less than 500 characters")
		.optional(),
	end_date: z.string().refine((date) => {
		const endDate = new Date(date);
		const now = new Date();
		return endDate > now;
	}, "End date must be in the future"),
	prize_image_url: z
		.string()
		.url("Must be a valid URL")
		.optional()
		.or(z.literal("")),
	prize_title: z
		.string()
		.min(1, "Prize title is required")
		.max(100, "Prize title must be less than 100 characters"),
});

export type CreateGiveawayInput = z.infer<typeof createGiveawaySchema>;

// ============================================================================
// ACTION RESULTS
// ============================================================================

export interface ActionResult<T = void> {
	success: boolean;
	data?: T;
	error?: string;
}

// ============================================================================
// ENTER GIVEAWAY (User View)
// ============================================================================

/**
 * Enter a giveaway - inserts user's entry into the database
 */
export async function enterGiveaway(
	giveawayId: string,
): Promise<ActionResult<{ entryId: string; referralCode: string }>> {
	try {
		const headersList = await headers();
		const { userId } = await verifyUserToken(headersList);

		if (!userId) {
			return { success: false, error: "You must be logged in to enter" };
		}

		// Check if giveaway exists and is active
		const giveawayRows = await sql`
			SELECT id, status, start_date, end_date, company_id
			FROM giveaways WHERE id = ${giveawayId}
		`;

		if (giveawayRows.length === 0) {
			return { success: false, error: "Giveaway not found" };
		}

		const giveaway = giveawayRows[0];

		if (giveaway.status !== "active") {
			return {
				success: false,
				error: "This giveaway is not currently active",
			};
		}

		const now = new Date();
		const startDate = new Date(giveaway.start_date);
		const endDate = new Date(giveaway.end_date);

		if (now < startDate) {
			return {
				success: false,
				error: "This giveaway hasn't started yet",
			};
		}

		if (now > endDate) {
			return { success: false, error: "This giveaway has ended" };
		}

		// Check entry limit for company's tier
		const tier = await getCompanyTier(giveaway.company_id);
		const limits = TIER_LIMITS[tier];

		const entryCountResult = await sql`
			SELECT COUNT(*)::int AS count FROM entries
			WHERE giveaway_id = ${giveawayId}
		`;
		const entryCount = entryCountResult[0]?.count ?? 0;

		if (entryCount >= limits.maxEntriesPerGiveaway) {
			return {
				success: false,
				error: "This giveaway has reached the maximum number of entries",
			};
		}

		// Check if user already entered
		const existingRows = await sql`
			SELECT id, referral_code FROM entries
			WHERE giveaway_id = ${giveawayId} AND user_id = ${userId}
		`;

		if (existingRows.length > 0) {
			return {
				success: false,
				error: "You have already entered this giveaway",
			};
		}

		// Generate unique referral code
		let referralCode = generateReferralCode();
		let attempts = 0;
		const maxAttempts = 5;

		while (attempts < maxAttempts) {
			const existing = await sql`
				SELECT id FROM entries WHERE referral_code = ${referralCode}
			`;

			if (existing.length === 0) break;
			referralCode = generateReferralCode();
			attempts++;
		}

		// Create entry
		try {
			const inserted = await sql`
				INSERT INTO entries (giveaway_id, user_id, referral_code)
				VALUES (${giveawayId}, ${userId}, ${referralCode})
				RETURNING id, referral_code
			`;

			const entry = inserted[0];

			return {
				success: true,
				data: {
					entryId: entry.id,
					referralCode: entry.referral_code,
				},
			};
		} catch (insertError: any) {
			if (insertError?.code === "23505") {
				return {
					success: false,
					error: "You have already entered this giveaway",
				};
			}
			console.error("Failed to create entry:", insertError);
			return { success: false, error: "Failed to enter giveaway" };
		}
	} catch (error) {
		console.error("Enter giveaway error:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

// ============================================================================
// CREATE GIVEAWAY (Admin Dashboard)
// ============================================================================

/**
 * Create a new giveaway
 */
export async function createGiveaway(
	companyId: string,
	input: CreateGiveawayInput,
): Promise<ActionResult<{ giveawayId: string }>> {
	try {
		const validationResult = createGiveawaySchema.safeParse(input);

		if (!validationResult.success) {
			const firstError = validationResult.error.issues[0];
			return { success: false, error: firstError.message };
		}

		const { title, description, end_date, prize_image_url, prize_title } =
			validationResult.data;

		const headersList = await headers();
		const { userId } = await verifyUserToken(headersList);

		if (!userId) {
			return { success: false, error: "You must be logged in" };
		}

		// Check active giveaway limit for company's tier
		const tier = await getCompanyTier(companyId);
		const limits = TIER_LIMITS[tier];

		const activeCountResult = await sql`
			SELECT COUNT(*)::int AS count FROM giveaways
			WHERE company_id = ${companyId} AND status = 'active'
		`;
		const activeCount = activeCountResult[0]?.count ?? 0;

		if (activeCount >= limits.maxActiveGiveaways) {
			return {
				success: false,
				error: `You've reached the limit of ${limits.maxActiveGiveaways} active giveaway${limits.maxActiveGiveaways === 1 ? "" : "s"} on the ${tier} plan. Upgrade to create more.`,
			};
		}

		const prizeDetails = JSON.stringify({
			title: prize_title,
			image_url: prize_image_url || undefined,
		});

		const inserted = await sql`
			INSERT INTO giveaways (company_id, title, description, start_date, end_date, status, prize_details)
			VALUES (
				${companyId},
				${title},
				${description || null},
				${new Date().toISOString()},
				${new Date(end_date).toISOString()},
				'active',
				${prizeDetails}::jsonb
			)
			RETURNING id
		`;

		const newGiveaway = inserted[0];

		return {
			success: true,
			data: { giveawayId: newGiveaway.id },
		};
	} catch (error) {
		console.error("Create giveaway error:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

// ============================================================================
// PICK WINNER (Admin Dashboard)
// ============================================================================

/**
 * Randomly select a winner from giveaway entries
 */
export async function pickWinner(
	giveawayId: string,
	companyId: string,
): Promise<ActionResult<{ winnerId: string; userId: string }>> {
	try {
		const headersList = await headers();
		const { userId } = await verifyUserToken(headersList);

		if (!userId) {
			return { success: false, error: "You must be logged in" };
		}

		const giveawayRows = await sql`
			SELECT id, company_id, status, winner_count
			FROM giveaways WHERE id = ${giveawayId}
		`;

		if (giveawayRows.length === 0) {
			return { success: false, error: "Giveaway not found" };
		}

		const giveaway = giveawayRows[0];

		if (giveaway.company_id !== companyId) {
			return {
				success: false,
				error: "You don't have access to this giveaway",
			};
		}

		if (giveaway.status !== "ended") {
			return {
				success: false,
				error: "Giveaway must be ended before picking winners",
			};
		}

		const winnerCountResult = await sql`
			SELECT COUNT(*)::int AS count FROM winners WHERE giveaway_id = ${giveawayId}
		`;
		const existingWinners = winnerCountResult[0]?.count ?? 0;

		if (existingWinners >= giveaway.winner_count) {
			return {
				success: false,
				error: "All winners have already been selected",
			};
		}

		// Check winner limit for company's tier
		const tier = await getCompanyTier(giveaway.company_id);
		const limits = TIER_LIMITS[tier];

		if (existingWinners >= limits.maxWinnersPerGiveaway) {
			return {
				success: false,
				error: `You've reached the limit of ${limits.maxWinnersPerGiveaway} winner${limits.maxWinnersPerGiveaway === 1 ? "" : "s"} per giveaway on the ${tier} plan. Upgrade to pick more winners.`,
			};
		}

		const entries = await sql`
			SELECT id, user_id, entry_count FROM entries
			WHERE giveaway_id = ${giveawayId}
			AND id NOT IN (SELECT entry_id FROM winners WHERE giveaway_id = ${giveawayId})
		`;

		if (entries.length === 0) {
			return { success: false, error: "No eligible entries found" };
		}

		const winnerEntry = selectWeightedRandomWinner(
			entries as unknown as { id: string; user_id: string; entry_count: number }[],
		);

		if (!winnerEntry) {
			return { success: false, error: "Failed to select winner" };
		}

		const position = existingWinners + 1;

		const winnerResult = await sql`
			INSERT INTO winners (giveaway_id, entry_id, position)
			VALUES (${giveawayId}, ${winnerEntry.id}, ${position})
			RETURNING id
		`;

		const winner = winnerResult[0];

		return {
			success: true,
			data: {
				winnerId: winner.id,
				userId: winnerEntry.user_id,
			},
		};
	} catch (error) {
		console.error("Pick winner error:", error);
		return { success: false, error: "An unexpected error occurred" };
	}
}

// ============================================================================
// GET USER ENTRY (for checking entry status)
// ============================================================================

/**
 * Get user's entry for a giveaway (if exists)
 */
export async function getUserEntry(
	giveawayId: string,
): Promise<
	ActionResult<{
		hasEntered: boolean;
		entry?: {
			id: string;
			referralCode: string;
			entryCount: number;
			referralCount: number;
		};
	}>
> {
	try {
		const headersList = await headers();
		const { userId } = await verifyUserToken(headersList);

		if (!userId) {
			return { success: true, data: { hasEntered: false } };
		}

		const rows = await sql`
			SELECT id, referral_code, entry_count, referral_count
			FROM entries
			WHERE giveaway_id = ${giveawayId} AND user_id = ${userId}
		`;

		if (rows.length === 0) {
			return { success: true, data: { hasEntered: false } };
		}

		const entry = rows[0];

		return {
			success: true,
			data: {
				hasEntered: true,
				entry: {
					id: entry.id,
					referralCode: entry.referral_code,
					entryCount: entry.entry_count,
					referralCount: entry.referral_count,
				},
			},
		};
	} catch (error) {
		console.error("Get user entry error:", error);
		return { success: false, error: "Failed to check entry status" };
	}
}
