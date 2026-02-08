"use client";

import { useState } from "react";
import { NotEnteredState } from "./components/not-entered-state";
import { EnteredState } from "./components/entered-state";

interface ExperienceClientProps {
	giveaway: {
		id: string;
		title: string;
		description: string | null;
		end_date: string;
		prize_details: {
			title?: string;
			image_url?: string;
			value?: number;
			currency?: string;
		};
	};
	userEntry: {
		id: string;
		referralCode: string;
		entryCount: number;
		referralCount: number;
	} | null;
	totalEntries: number;
}

export function ExperienceClient({
	giveaway,
	userEntry: initialUserEntry,
	totalEntries,
}: ExperienceClientProps) {
	const [userEntry, setUserEntry] = useState(initialUserEntry);

	const handleEntered = (referralCode: string) => {
		setUserEntry({
			id: "pending",
			referralCode,
			entryCount: 1,
			referralCount: 0,
		});
	};

	if (userEntry) {
		return (
			<EnteredState
				giveaway={giveaway}
				entry={{
					referralCode: userEntry.referralCode,
					entryCount: userEntry.entryCount,
					referralCount: userEntry.referralCount,
				}}
			/>
		);
	}

	return (
		<NotEnteredState
			giveaway={giveaway}
			entryCount={totalEntries}
			onEntered={handleEntered}
		/>
	);
}
