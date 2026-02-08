"use client";

import { useState } from "react";
import { EnterButton } from "./enter-button";
import { Countdown } from "./countdown";

interface NotEnteredStateProps {
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
	entryCount: number;
	onEntered: (referralCode: string) => void;
}

export function NotEnteredState({
	giveaway,
	entryCount,
	onEntered,
}: NotEnteredStateProps) {
	const [isEntered, setIsEntered] = useState(false);

	const handleSuccess = (referralCode: string) => {
		setIsEntered(true);
		onEntered(referralCode);
	};

	return (
		<div className="min-h-screen bg-gray-1 flex items-center justify-center p-6">
			<div className="max-w-lg w-full space-y-8">
				{/* Prize Image */}
				{giveaway.prize_details.image_url ? (
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-b from-purple-a3 to-pink-a3 blur-3xl scale-110" />
						<div className="relative aspect-square w-full rounded-2xl overflow-hidden border border-gray-a6 shadow-2xl">
							<img
								src={giveaway.prize_details.image_url}
								alt={
									giveaway.prize_details.title ||
									giveaway.title
								}
								className="w-full h-full object-cover"
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-gray-1/60 via-transparent to-transparent" />
							{giveaway.prize_details.value && (
								<div className="absolute top-4 right-4 bg-gray-1/80 backdrop-blur-sm border border-gray-a6 rounded-lg px-3 py-1.5">
									<span className="text-green-11 font-bold">
										{giveaway.prize_details.currency ||
											"$"}
										{giveaway.prize_details.value.toLocaleString()}
									</span>
								</div>
							)}
						</div>
					</div>
				) : (
					<div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-purple-a3 to-pink-a3 border border-gray-a6 flex items-center justify-center">
						<svg
							className="w-24 h-24 text-gray-8"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1}
								d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
							/>
						</svg>
					</div>
				)}

				{/* Title and Description */}
				<div className="text-center space-y-3">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-12">
						{giveaway.title}
					</h1>
					{giveaway.prize_details.title && (
						<p className="text-purple-11 text-lg font-medium">
							Win: {giveaway.prize_details.title}
						</p>
					)}
					{giveaway.description && (
						<p className="text-gray-10 text-base">
							{giveaway.description}
						</p>
					)}
				</div>

				{/* Countdown */}
				<div>
					<p className="text-center text-gray-10 text-sm mb-4 uppercase tracking-wider">
						Ends in
					</p>
					<Countdown endDate={giveaway.end_date} />
				</div>

				{/* Enter Button */}
				<EnterButton
					giveawayId={giveaway.id}
					onSuccess={handleSuccess}
				/>

				{/* Entry count */}
				<div className="flex items-center justify-center gap-6 text-gray-10">
					<div className="flex items-center gap-2">
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
							/>
						</svg>
						<span>{entryCount.toLocaleString()} entries</span>
					</div>
					<div className="flex items-center gap-2">
						<svg
							className="w-5 h-5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={1.5}
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span>Free to enter</span>
					</div>
				</div>

				{/* Trust indicators */}
				<div className="text-center">
					<p className="text-gray-8 text-xs">
						Powered by Whop &bull; Fair & transparent winner
						selection
					</p>
				</div>
			</div>
		</div>
	);
}
