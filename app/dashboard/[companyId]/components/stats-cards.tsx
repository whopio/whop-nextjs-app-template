import { Text } from "@whop/react/components";
import type { DashboardStats } from "@/lib/data";
import { formatNumber } from "@/lib/data";
import type { CompanyTierInfo } from "@/lib/tiers";

interface StatsCardsProps {
	stats: DashboardStats;
	tierInfo: CompanyTierInfo;
}

interface StatCardProps {
	label: string;
	value: number;
	icon: React.ReactNode;
}

function StatCard({ label, value, icon }: StatCardProps) {
	return (
		<div className="bg-gray-a2 border border-gray-a4 rounded-2xl p-7 flex flex-col gap-4 shadow-sm">
			<div className="flex items-center justify-between">
				<Text size="1" className="text-gray-10 uppercase tracking-wide">
					{label}
				</Text>
				<div className="w-10 h-10 rounded-full bg-gray-a3 flex items-center justify-center text-gray-11">
					{icon}
				</div>
			</div>
			<Text size="7" weight="bold" className="text-gray-12 tracking-tight">
				{formatNumber(value)}
			</Text>
		</div>
	);
}

function PlanCard({ tierInfo }: { tierInfo: CompanyTierInfo }) {
	return (
		<div className="bg-gray-a2 border border-gray-a4 rounded-2xl p-7 flex flex-col gap-4 shadow-sm">
			<div className="flex items-center justify-between">
				<Text size="1" className="text-gray-10 uppercase tracking-wide">
					Current Plan
				</Text>
				<div className="w-10 h-10 rounded-full bg-blue-a3 flex items-center justify-center text-blue-11">
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
							d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
						/>
					</svg>
				</div>
			</div>
			<div className="space-y-1">
				<Text size="6" weight="bold" className="text-gray-12 tracking-tight">
					{tierInfo.display.label}
				</Text>
				<Text size="2" className="text-gray-10">
					{tierInfo.display.price}
				</Text>
			</div>
		</div>
	);
}

function ActiveCampaignsCard({ tierInfo }: { tierInfo: CompanyTierInfo }) {
	const isUnlimited =
		tierInfo.limits.maxActiveGiveaways === Number.MAX_SAFE_INTEGER;
	const usage = isUnlimited
		? 0
		: tierInfo.activeGiveaways / tierInfo.limits.maxActiveGiveaways;

	let barColor = "bg-blue-9";
	if (usage >= 1) barColor = "bg-red-9";
	else if (usage >= 0.8) barColor = "bg-orange-9";

	return (
		<div className="bg-gray-a2 border border-gray-a4 rounded-2xl p-7 flex flex-col gap-4 shadow-sm">
			<div className="flex items-center justify-between">
				<Text size="1" className="text-gray-10 uppercase tracking-wide">
					Active Campaigns
				</Text>
				<div className="w-10 h-10 rounded-full bg-gray-a3 flex items-center justify-center text-gray-11">
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
							d="M13 10V3L4 14h7v7l9-11h-7z"
						/>
					</svg>
				</div>
			</div>
			<Text size="7" weight="bold" className="text-gray-12 tracking-tight">
				{formatNumber(tierInfo.activeGiveaways)}
			</Text>
			{!isUnlimited && (
				<div className="space-y-2">
					<div className="w-full h-1.5 bg-gray-a3 rounded-full overflow-hidden">
						<div
							className={`h-full rounded-full transition-all ${barColor}`}
							style={{
								width: `${Math.min(usage * 100, 100)}%`,
							}}
						/>
					</div>
					<Text size="1" className="text-gray-10">
						{tierInfo.activeGiveaways} / {tierInfo.limits.maxActiveGiveaways}
					</Text>
				</div>
			)}
		</div>
	);
}

export function StatsCards({ stats, tierInfo }: StatsCardsProps) {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
			<PlanCard tierInfo={tierInfo} />
			<StatCard
				label="Total Giveaways"
				value={stats.totalGiveaways}
				icon={
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
							d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
						/>
					</svg>
				}
			/>
			<ActiveCampaignsCard tierInfo={tierInfo} />
			<StatCard
				label="Total Entries"
				value={stats.totalEntries}
				icon={
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
				}
			/>
			<StatCard
				label="Total Winners"
				value={stats.totalWinners}
				icon={
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
							d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
						/>
					</svg>
				}
			/>
		</div>
	);
}
