import { Text } from "@whop/react/components";
import { getDashboardStats, getCompanyGiveaways } from "@/lib/data";
import { getCompanyTierInfo } from "@/lib/tiers";
import { StatsCards } from "./components/stats-cards";
import { GiveawaysTable } from "./components/giveaways-table";
import { EmptyState } from "./components/empty-state";
import { CreateGiveawayDialog } from "./components/create-giveaway-dialog";
import { UpgradeBanner } from "./components/upgrade-banner";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	const { companyId } = await params;

	try {
		console.log("[Dashboard Page] Starting render for company:", companyId);

		const [stats, giveaways, tierInfo] = await Promise.all([
			getDashboardStats(companyId),
			getCompanyGiveaways(companyId),
			getCompanyTierInfo(companyId),
		]);

		console.log("[Dashboard Page] Data loaded:", {
			stats,
			giveawayCount: giveaways.length,
			tier: tierInfo.tier,
		});

		const hasGiveaways = giveaways.length > 0;

		return (
			<div className="space-y-6">
				{/* Page Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div>
						<Text size="6" weight="bold" className="text-gray-12">
							Dashboard
						</Text>
						<Text size="3" className="text-gray-10 mt-1">
							Manage your giveaway campaigns
						</Text>
					</div>
					<CreateGiveawayDialog companyId={companyId} tierInfo={tierInfo} />
				</div>

				{/* Upgrade Banner */}
				{tierInfo.tier !== "business" &&
					tierInfo.activeGiveaways >= tierInfo.limits.maxActiveGiveaways && (
						<UpgradeBanner currentTier={tierInfo.tier} />
					)}

				{/* Stats Cards */}
				<StatsCards stats={stats} tierInfo={tierInfo} />

				{/* Giveaways List or Empty State */}
				{hasGiveaways ? (
					<GiveawaysTable giveaways={giveaways} companyId={companyId} />
				) : (
					<EmptyState companyId={companyId} tierInfo={tierInfo} />
				)}

				{/* Quick Tips */}
				{hasGiveaways && (
					<div className="bg-gray-1 border border-gray-a4 rounded-xl p-6">
						<div className="flex items-start gap-4">
							<div className="flex-shrink-0 w-10 h-10 rounded-lg bg-blue-a3 flex items-center justify-center text-blue-9">
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
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div>
								<Text
									size="3"
									weight="medium"
									className="text-gray-12 mb-1"
								>
									Pro Tip: Maximize Your Reach
								</Text>
								<Text size="2" className="text-gray-10">
									Giveaways with 5+ bonus entries per referral
									typically see 3x more viral sharing. Consider
									increasing referral rewards on your active
									campaigns.
								</Text>
							</div>
						</div>
					</div>
				)}
			</div>
		);
	} catch (error) {
		// Surface the error so we can diagnose in Vercel function logs
		const message = error instanceof Error ? error.message : String(error);
		const stack = error instanceof Error ? error.stack : undefined;
		console.error("[Dashboard Page] FATAL render error:", message, stack);

		// Show a diagnostic message instead of crashing
		return (
			<div className="p-6 space-y-4">
				<div className="bg-red-a2 border border-red-a6 rounded-xl p-6">
					<Text size="5" weight="bold" className="text-gray-12 mb-2">
						Dashboard Error
					</Text>
					<Text size="3" className="text-gray-10 mb-4">
						The dashboard encountered an error while loading. This has been logged for debugging.
					</Text>
					<div className="bg-gray-a2 rounded-lg p-4 font-mono text-sm text-gray-11 break-all">
						{message}
					</div>
				</div>
			</div>
		);
	}
}
