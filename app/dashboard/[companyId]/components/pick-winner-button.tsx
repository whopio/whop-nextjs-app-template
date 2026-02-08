"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button, Dialog, Text } from "@whop/react/components";
import { toast } from "sonner";
import { pickWinner } from "@/lib/actions/giveaway-actions";

interface PickWinnerButtonProps {
	giveawayId: string;
	companyId: string;
	giveawayTitle: string;
	currentWinners: number;
	totalWinnerSlots: number;
	hasEntries: boolean;
}

export function PickWinnerButton({
	giveawayId,
	companyId,
	giveawayTitle,
	currentWinners,
	totalWinnerSlots,
	hasEntries,
}: PickWinnerButtonProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [winner, setWinner] = useState<{ userId: string } | null>(null);

	const canPickMore = currentWinners < totalWinnerSlots;
	const remainingSlots = totalWinnerSlots - currentWinners;

	const handlePickWinner = () => {
		startTransition(async () => {
			const result = await pickWinner(giveawayId, companyId);
			if (result.success && result.data) {
				setWinner({ userId: result.data.userId });
				toast.success("Winner selected!", {
					description: `User ${result.data.userId} has been selected as a winner.`,
				});
			} else {
				toast.error(result.error || "Failed to pick winner");
			}
		});
	};

	const handleClose = () => {
		setOpen(false);
		setWinner(null);
		router.refresh();
	};

	if (!canPickMore) {
		return (
			<Button variant="soft" size="1" disabled>
				All Picked
			</Button>
		);
	}

	if (!hasEntries) {
		return (
			<Button variant="soft" size="1" disabled>
				No Entries
			</Button>
		);
	}

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>
				<Button variant="classic" size="1">
					Pick Winner
				</Button>
			</Dialog.Trigger>

			<Dialog.Content style={{ maxWidth: 400 }}>
				<Dialog.Title>{winner ? "Winner Selected!" : "Pick a Winner"}</Dialog.Title>

				{winner ? (
					<div className="space-y-6">
						<div className="text-center py-4">
							<div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-a3 flex items-center justify-center">
								<svg className="w-10 h-10 text-green-9" fill="none" viewBox="0 0 24 24" stroke="currentColor">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<Text size="4" weight="medium" className="text-gray-12 mb-2">Congratulations!</Text>
							<Text size="2" className="text-gray-10">The winner has been randomly selected from all entries.</Text>
						</div>
						<div className="bg-gray-a3 rounded-lg p-4">
							<Text size="1" className="text-gray-10 mb-1">Winner User ID</Text>
							<Text size="3" weight="medium" className="text-gray-12 font-mono">{winner.userId}</Text>
						</div>
						<div className="flex justify-end gap-3">
							{remainingSlots > 1 && (
								<Button variant="soft" onClick={() => setWinner(null)}>
									Pick Another ({remainingSlots - 1} left)
								</Button>
							)}
							<Button variant="classic" onClick={handleClose}>Done</Button>
						</div>
					</div>
				) : (
					<div className="space-y-6">
						<Text size="2" className="text-gray-10">
							You are about to randomly select a winner for{" "}
							<span className="text-gray-12 font-medium">{giveawayTitle}</span>.
						</Text>
						<div className="bg-gray-a3 rounded-lg p-4 space-y-2">
							<div className="flex justify-between">
								<Text size="2" className="text-gray-10">Winner slots</Text>
								<Text size="2" className="text-gray-12">{currentWinners} / {totalWinnerSlots} selected</Text>
							</div>
							<div className="flex justify-between">
								<Text size="2" className="text-gray-10">Remaining to pick</Text>
								<Text size="2" className="text-gray-12">{remainingSlots}</Text>
							</div>
						</div>
						<div className="bg-blue-a3 border border-blue-a6 rounded-lg p-4">
							<Text size="2" className="text-blue-11">
								<strong>Note:</strong> Winners are selected using weighted random selection. Users with more entries have a higher chance of winning.
							</Text>
						</div>
						<div className="flex justify-end gap-3">
							<Dialog.Close>
								<Button variant="soft">Cancel</Button>
							</Dialog.Close>
							<Button variant="classic" onClick={handlePickWinner} disabled={isPending}>
								{isPending ? "Selecting..." : "Pick Winner"}
							</Button>
						</div>
					</div>
				)}
			</Dialog.Content>
		</Dialog.Root>
	);
}
