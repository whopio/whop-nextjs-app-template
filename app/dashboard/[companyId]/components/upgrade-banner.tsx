"use client";

import { Text } from "@whop/react/components";
import type { TierName } from "@/lib/tiers";

interface UpgradeBannerProps {
	currentTier: TierName;
}

export function UpgradeBanner({ currentTier }: UpgradeBannerProps) {
	const nextTier = currentTier === "free" ? "Pro" : "Business";
	const nextPrice = currentTier === "free" ? "$14.99/mo" : "$39.99/mo";

	return (
		<div className="relative overflow-hidden rounded-xl border border-blue-a6 bg-gradient-to-r from-blue-a3 to-purple-a3 p-6">
			<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
				<div className="space-y-2">
					<Text size="4" weight="bold" className="text-gray-12">
						You've hit your plan limit
					</Text>
					<Text size="2" className="text-gray-11">
						Upgrade to {nextTier} ({nextPrice}) to unlock more
						giveaways and features.
					</Text>
				</div>
				<a
					href="https://whop.com/marketplace"
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-9 text-white text-sm font-medium hover:bg-blue-10 transition-colors shrink-0"
				>
					Upgrade to {nextTier}
				</a>
			</div>
		</div>
	);
}
