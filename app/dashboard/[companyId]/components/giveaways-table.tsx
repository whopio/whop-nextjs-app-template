"use client";

import { Text } from "@whop/react/components";
import type { GiveawayWithStats } from "@/lib/data";
import { formatDateRange, formatNumber } from "@/lib/data";
import type { GiveawayStatus } from "@/lib/types/database";
import { PickWinnerButton } from "./pick-winner-button";

interface GiveawaysTableProps {
	giveaways: GiveawayWithStats[];
	companyId: string;
}

function StatusBadge({ status }: { status: GiveawayStatus }) {
	const styles = {
		draft: "bg-gray-a3 text-gray-11 border-gray-a6",
		active: "bg-green-a3 text-green-11 border-green-a6",
		ended: "bg-blue-a3 text-blue-11 border-blue-a6",
	};

	const labels = {
		draft: "Draft",
		active: "Active",
		ended: "Ended",
	};

	return (
		<span
			className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${styles[status]}`}
		>
			{status === "active" && (
				<span className="w-1.5 h-1.5 rounded-full bg-green-9 mr-1.5 animate-pulse" />
			)}
			{labels[status]}
		</span>
	);
}

function GiveawayRow({
	giveaway,
	companyId,
}: {
	giveaway: GiveawayWithStats;
	companyId: string;
}) {
	return (
		<tr className="border-b border-gray-a4 hover:bg-gray-a2 transition-colors">
			<td className="px-6 py-4">
				<Text
					size="3"
					weight="semibold"
					className="text-gray-12"
				>
					{giveaway.title}
				</Text>
				{giveaway.description && (
					<Text size="2" className="text-gray-11 mt-0.5 line-clamp-1">
						{giveaway.description}
					</Text>
				)}
			</td>
			<td className="px-6 py-4">
				<StatusBadge status={giveaway.status} />
			</td>
			<td className="px-6 py-4">
				<Text size="2" className="text-gray-10">
					{formatDateRange(giveaway.start_date, giveaway.end_date)}
				</Text>
			</td>
			<td className="px-6 py-4 text-center">
				<Text size="3" weight="semibold" className="text-gray-12">
					{formatNumber(giveaway.entries_count)}
				</Text>
			</td>
			<td className="px-6 py-4 text-center">
				<Text size="3" weight="semibold" className="text-gray-12">
					{giveaway.winners_count} / {giveaway.winner_count}
				</Text>
			</td>
			<td className="px-6 py-4">
				<div className="flex items-center justify-end gap-2">
					{giveaway.status === "ended" && (
						<PickWinnerButton
							giveawayId={giveaway.id}
							companyId={companyId}
							giveawayTitle={giveaway.title}
							currentWinners={giveaway.winners_count}
							totalWinnerSlots={giveaway.winner_count}
							hasEntries={giveaway.entries_count > 0}
						/>
					)}
				</div>
			</td>
		</tr>
	);
}

export function GiveawaysTable({ giveaways, companyId }: GiveawaysTableProps) {
	return (
		<div className="bg-gray-1 border border-gray-a4 rounded-2xl overflow-hidden shadow-sm">
			<div className="px-6 py-5 border-b border-gray-a4 flex items-center justify-between">
				<Text size="5" weight="semibold" className="text-gray-12">
					Your Giveaways
				</Text>
				<Text size="1" className="text-gray-9 uppercase tracking-wide">
					{giveaways.length} total
				</Text>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-a4 bg-gray-a2">
							<th className="px-6 py-3 text-left">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Name
								</Text>
							</th>
							<th className="px-6 py-3 text-left">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Status
								</Text>
							</th>
							<th className="px-6 py-3 text-left">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Duration
								</Text>
							</th>
							<th className="px-6 py-3 text-center">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Entries
								</Text>
							</th>
							<th className="px-6 py-3 text-center">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Winners
								</Text>
							</th>
							<th className="px-6 py-3 text-right">
								<Text size="1" weight="medium" className="text-gray-9 uppercase tracking-wide">
									Actions
								</Text>
							</th>
						</tr>
					</thead>
					<tbody>
						{giveaways.map((giveaway) => (
							<GiveawayRow key={giveaway.id} giveaway={giveaway} companyId={companyId} />
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
