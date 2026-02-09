import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { sql } from "@/lib/db";
import type { Giveaway, Entry } from "@/lib/types/database";
import { verifyUserToken } from "@/lib/whop";
import { ExperienceClient } from "./experience-client";
import { EmptyExperienceState } from "./components/empty-experience-state";

export default async function ExperiencePage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;

	const headersList = await headers();
	let userId: string | undefined;

	try {
		const result = await verifyUserToken(headersList);
		userId = result.userId;
	} catch {
		redirect("/error?message=Authentication required");
	}

	if (!userId) {
		redirect("/error?message=Authentication required");
	}

	// Fetch active giveaway for this experience
	const giveawayRows = await sql`
		SELECT * FROM giveaways
		WHERE experience_id = ${experienceId} AND status = 'active'
		LIMIT 1
	`;

	if (giveawayRows.length === 0) {
		return <EmptyExperienceState />;
	}

	const giveaway = giveawayRows[0] as unknown as Giveaway;

	// Check if user has already entered
	const userEntryRows = await sql`
		SELECT id, referral_code, entry_count, referral_count
		FROM entries
		WHERE giveaway_id = ${giveaway.id} AND user_id = ${userId}
	`;

	const userEntry = userEntryRows.length > 0
		? (userEntryRows[0] as unknown as Pick<Entry, "id" | "referral_code" | "entry_count" | "referral_count">)
		: null;

	// Get total entry count
	const countResult = await sql`
		SELECT COUNT(*)::int AS count FROM entries WHERE giveaway_id = ${giveaway.id}
	`;
	const entryCount = countResult[0]?.count ?? 0;

	return (
		<ExperienceClient
			giveaway={{
				id: giveaway.id,
				title: giveaway.title,
				description: giveaway.description,
				end_date: giveaway.end_date,
				prize_details: giveaway.prize_details,
			}}
			userEntry={
				userEntry
					? {
							id: userEntry.id,
							referralCode: userEntry.referral_code,
							entryCount: userEntry.entry_count,
							referralCount: userEntry.referral_count,
						}
					: null
			}
			totalEntries={entryCount}
		/>
	);
}
