"use client";

import { Text } from "@whop/react/components";
import type { TierName } from "@/lib/tiers";
import { UpgradeButton } from "./upgrade-button";

interface UpgradeBannerProps {
	currentTier: TierName;
	upgradeUrl?: string | null;
}

export function UpgradeBanner({ currentTier, upgradeUrl }: UpgradeBannerProps) {
	const nextTier = currentTier === "free" ? "Pro" : "Business";
	const nextPrice = currentTier === "free" ? "$14.99/mo" : "$39.99/mo";

	return (
		<div className="relative overflow-hidden rounded-2xl border border-blue-a6 bg-gradient-to-r from-blue-a3 to-purple-a3 p-8 shadow-sm">
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
				<div className="min-w-0 flex-1 space-y-2 pr-0 sm:pr-4">
					<Text size="1" className="text-blue-11 uppercase tracking-wide font-medium">
						Plan limit reached
					</Text>
					<Text size="4" weight="bold" className="text-gray-12 leading-snug block">
						You've hit your plan limit.
					</Text>
					<Text size="2" className="text-gray-11 leading-relaxed max-w-xl">
						Upgrade to {nextTier} ({nextPrice}) to unlock more giveaways and
						features.
					</Text>
				</div>
				<div className="flex-shrink-0">
					{upgradeUrl ? (
						<UpgradeButton
							upgradeUrl={upgradeUrl}
							label={`Upgrade to ${nextTier}`}
						/>
					) : (
						<span className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-gray-a6 text-gray-11 text-sm font-semibold shadow-sm cursor-not-allowed">
							Upgrade unavailable
						</span>
					)}
				</div>
			</div>
		</div>
	);
}
