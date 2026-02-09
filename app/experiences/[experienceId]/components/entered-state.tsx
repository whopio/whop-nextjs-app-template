"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@whop/react/components";
import { Countdown } from "./countdown";

interface EnteredStateProps {
	giveaway: {
		title: string;
		end_date: string;
		prize_details: {
			title?: string;
			image_url?: string;
		};
	};
	entry: {
		referralCode: string;
		entryCount: number;
		referralCount: number;
	};
}

export function EnteredState({ giveaway, entry }: EnteredStateProps) {
	const [copied, setCopied] = useState(false);

	const referralUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/enter/${entry.referralCode}`;

	const copyReferralLink = async () => {
		try {
			await navigator.clipboard.writeText(referralUrl);
			setCopied(true);
			toast.success("Link copied!");
			setTimeout(() => setCopied(false), 2000);
		} catch {
			toast.error("Failed to copy link");
		}
	};

	return (
		<div className="min-h-screen bg-gray-1 flex items-center justify-center p-6">
			<div className="max-w-lg w-full space-y-8">
				{/* Success Badge */}
				<div className="flex justify-center">
					<div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-green-a3 border border-green-a6">
						<svg
							className="w-6 h-6 text-green-11"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						<span className="text-lg font-bold text-green-11">
							YOU ARE IN
						</span>
					</div>
				</div>

				{/* Prize Image */}
				{giveaway.prize_details.image_url && (
					<div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden border border-gray-a6">
						<img
							src={giveaway.prize_details.image_url}
							alt={
								giveaway.prize_details.title || giveaway.title
							}
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-gray-1/50 to-transparent" />
					</div>
				)}

				{/* Title */}
				<div className="text-center space-y-2 overflow-hidden">
					<h1 className="text-3xl sm:text-4xl font-bold text-gray-12 break-words">
						{giveaway.title}
					</h1>
					{giveaway.prize_details.title && (
						<p className="text-gray-10 text-lg break-words">
							Prize: {giveaway.prize_details.title}
						</p>
					)}
				</div>

				{/* Countdown */}
				<div>
					<p className="text-center text-gray-10 text-sm mb-4 uppercase tracking-wider">
						Drawing in
					</p>
					<Countdown endDate={giveaway.end_date} />
				</div>

				{/* Entry Stats */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 space-y-4">
					<div className="flex justify-between items-center">
						<span className="text-gray-10">Your Entries</span>
						<span className="text-2xl font-bold text-gray-12">
							{entry.entryCount}
						</span>
					</div>
					<div className="flex justify-between items-center">
						<span className="text-gray-10">Referrals</span>
						<span className="text-2xl font-bold text-purple-11">
							{entry.referralCount}
						</span>
					</div>
				</div>

				{/* Referral Section */}
				<div className="bg-gray-a2 border border-gray-a4 rounded-xl p-6 space-y-4">
					<div className="text-center">
						<h3 className="text-lg font-semibold text-gray-12 mb-2">
							Get More Entries!
						</h3>
						<p className="text-gray-10 text-sm">
							Share your unique link to earn bonus entries for
							each referral
						</p>
					</div>

					{/* Referral Link */}
					<div className="flex gap-2 min-w-0">
						<input
							type="text"
							readOnly
							value={referralUrl}
							className="flex-1 min-w-0 bg-gray-a3 border border-gray-a6 rounded-lg px-4 py-3 text-gray-12 text-sm truncate"
						/>
						<Button
							variant={copied ? "classic" : "classic"}
							onClick={copyReferralLink}
							className="px-4"
						>
							{copied ? (
								<svg
									className="w-5 h-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 13l4 4L19 7"
									/>
								</svg>
							) : (
								<svg
									className="w-5 h-5"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
									/>
								</svg>
							)}
						</Button>
					</div>

					{/* Share Buttons */}
					<div className="flex gap-2">
						<a
							href={`https://twitter.com/intent/tweet?text=I just entered to win ${encodeURIComponent(giveaway.prize_details.title || giveaway.title)}! Enter here: ${encodeURIComponent(referralUrl)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex-1 flex items-center justify-center gap-2 bg-gray-a3 border border-gray-a6 hover:border-gray-a8 rounded-lg px-4 py-3 text-gray-12 transition-colors"
						>
							<svg
								className="w-5 h-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
							</svg>
							Share
						</a>
						<a
							href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex-1 flex items-center justify-center gap-2 bg-gray-a3 border border-gray-a6 hover:border-gray-a8 rounded-lg px-4 py-3 text-gray-12 transition-colors"
						>
							<svg
								className="w-5 h-5"
								fill="currentColor"
								viewBox="0 0 24 24"
							>
								<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
							</svg>
							Share
						</a>
					</div>
				</div>

				{/* Good luck message */}
				<p className="text-center text-gray-8 text-sm">
					Winners will be announced when the giveaway ends. Good luck!
				</p>
			</div>
		</div>
	);
}
