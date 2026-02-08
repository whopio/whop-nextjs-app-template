import { Text } from "@whop/react/components";
import { getDashboardAuthContext } from "@/lib/auth";
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

	const { company } = await getDashboardAuthContext(companyId);

	const [stats, giveaways, tierInfo] = await Promise.all([
		getDashboardStats(companyId),
		getCompanyGiveaways(companyId),
		getCompanyTierInfo(companyId),
	]);

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
						Manage your giveaway campaigns for {company.title}
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
}
