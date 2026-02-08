"use client";

import Link from "next/link";
import { Text, Button, DropdownMenu } from "@whop/react/components";
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
			className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}
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
	const basePath = `/dashboard/${companyId}/giveaways/${giveaway.id}`;

	return (
		<tr className="border-b border-gray-a4 hover:bg-gray-a2 transition-colors">
			<td className="px-4 py-4">
				<Link href={basePath} className="block">
					<Text
						size="3"
						weight="medium"
						className="text-gray-12 hover:text-blue-9 transition-colors"
					>
						{giveaway.title}
					</Text>
					{giveaway.description && (
						<Text size="2" className="text-gray-10 mt-0.5 line-clamp-1">
							{giveaway.description}
						</Text>
					)}
				</Link>
			</td>
			<td className="px-4 py-4">
				<StatusBadge status={giveaway.status} />
			</td>
			<td className="px-4 py-4">
				<Text size="2" className="text-gray-11">
					{formatDateRange(giveaway.start_date, giveaway.end_date)}
				</Text>
			</td>
			<td className="px-4 py-4 text-center">
				<Text size="3" weight="medium" className="text-gray-12">
					{formatNumber(giveaway.entries_count)}
				</Text>
			</td>
			<td className="px-4 py-4 text-center">
				<Text size="3" weight="medium" className="text-gray-12">
					{giveaway.winners_count} / {giveaway.winner_count}
				</Text>
			</td>
			<td className="px-4 py-4">
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
					<Link href={`${basePath}/analytics`}>
						<Button variant="ghost" size="1">
							<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
							</svg>
						</Button>
					</Link>
					<DropdownMenu.Root>
						<DropdownMenu.Trigger>
							<Button variant="ghost" size="1">
								<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
								</svg>
							</Button>
						</DropdownMenu.Trigger>
						<DropdownMenu.Content align="end">
							<DropdownMenu.Item>
								<Link href={`${basePath}/edit`} className="flex items-center gap-2 w-full">
									Edit
								</Link>
							</DropdownMenu.Item>
							<DropdownMenu.Item>
								<button className="flex items-center gap-2 w-full">
									Duplicate
								</button>
							</DropdownMenu.Item>
							<DropdownMenu.Separator />
							<DropdownMenu.Item color="red">
								<button className="flex items-center gap-2 w-full text-red-9">
									Delete
								</button>
							</DropdownMenu.Item>
						</DropdownMenu.Content>
					</DropdownMenu.Root>
				</div>
			</td>
		</tr>
	);
}

export function GiveawaysTable({ giveaways, companyId }: GiveawaysTableProps) {
	return (
		<div className="bg-gray-1 border border-gray-a4 rounded-xl overflow-hidden">
			<div className="px-4 py-4 border-b border-gray-a4 flex items-center justify-between">
				<Text size="4" weight="medium" className="text-gray-12">
					Your Giveaways
				</Text>
				<Text size="2" className="text-gray-10">
					{giveaways.length} total
				</Text>
			</div>
			<div className="overflow-x-auto">
				<table className="w-full">
					<thead>
						<tr className="border-b border-gray-a4 bg-gray-a2">
							<th className="px-4 py-3 text-left">
								<Text size="2" weight="medium" className="text-gray-10">Name</Text>
							</th>
							<th className="px-4 py-3 text-left">
								<Text size="2" weight="medium" className="text-gray-10">Status</Text>
							</th>
							<th className="px-4 py-3 text-left">
								<Text size="2" weight="medium" className="text-gray-10">Duration</Text>
							</th>
							<th className="px-4 py-3 text-center">
								<Text size="2" weight="medium" className="text-gray-10">Entries</Text>
							</th>
							<th className="px-4 py-3 text-center">
								<Text size="2" weight="medium" className="text-gray-10">Winners</Text>
							</th>
							<th className="px-4 py-3 text-right">
								<Text size="2" weight="medium" className="text-gray-10">Actions</Text>
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
