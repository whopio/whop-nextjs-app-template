import { Text } from "@whop/react/components";
import { CreateGiveawayDialog } from "./create-giveaway-dialog";
import type { CompanyTierInfo } from "@/lib/tiers";

interface EmptyStateProps {
	companyId: string;
	tierInfo: CompanyTierInfo;
}

export function EmptyState({ companyId, tierInfo }: EmptyStateProps) {
	return (
		<div className="bg-gray-1 border border-gray-a4 rounded-2xl overflow-hidden shadow-sm">
			<div className="px-10 py-14 text-center">
				<div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-blue-a3 to-purple-a3 flex items-center justify-center">
					<svg
						className="w-10 h-10 text-blue-9"
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
				</div>

				<Text size="6" weight="bold" className="text-gray-12 mb-3">
					Create your first viral giveaway
				</Text>
				<Text size="3" className="text-gray-10 max-w-lg mx-auto mb-8">
					Launch a giveaway campaign to grow your audience through referrals.
					Participants share to earn more entries, creating organic viral growth.
				</Text>

				<CreateGiveawayDialog companyId={companyId} tierInfo={tierInfo} />
			</div>

			<div className="border-t border-gray-a4 bg-gray-a2 px-8 py-7">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
					{[
						{
							title: "Grow Your Email List",
							description: "Collect verified emails from engaged participants",
						},
						{
							title: "Boost Social Following",
							description:
								"Require Twitter, Instagram, or TikTok follows for entries",
						},
						{
							title: "Viral Referral System",
							description:
								"Each referral earns bonus entries, creating exponential growth",
						},
						{
							title: "Real-Time Analytics",
							description:
								"Track conversions, referrals, and engagement metrics",
						},
					].map((benefit, index) => (
						<div
							key={index}
							className="rounded-xl border border-gray-a4 bg-gray-1 p-4"
						>
							<Text size="2" weight="medium" className="text-gray-12 mb-1">
								{benefit.title}
							</Text>
							<Text size="1" className="text-gray-10">
								{benefit.description}
							</Text>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
