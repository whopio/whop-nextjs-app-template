"use client";

import { useTransition } from "react";
import { enterGiveaway } from "@/lib/actions/giveaway-actions";
import { toast } from "sonner";
import { Button } from "@whop/react/components";

interface EnterButtonProps {
	giveawayId: string;
	onSuccess?: (referralCode: string) => void;
}

export function EnterButton({ giveawayId, onSuccess }: EnterButtonProps) {
	const [isPending, startTransition] = useTransition();

	const handleEnter = () => {
		startTransition(async () => {
			const result = await enterGiveaway(giveawayId);

			if (result.success && result.data) {
				toast.success("You're in!", {
					description: "Share your referral link to earn more entries!",
				});
				onSuccess?.(result.data.referralCode);
			} else {
				toast.error(result.error || "Failed to enter giveaway");
			}
		});
	};

	return (
		<Button
			variant="classic"
			size="4"
			onClick={handleEnter}
			disabled={isPending}
			className="w-full py-5 text-lg font-bold"
		>
			{isPending ? (
				<>
					<svg
						className="animate-spin h-6 w-6 mr-3"
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
					>
						<circle
							className="opacity-25"
							cx="12"
							cy="12"
							r="10"
							stroke="currentColor"
							strokeWidth="4"
						/>
						<path
							className="opacity-75"
							fill="currentColor"
							d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
						/>
					</svg>
					ENTERING...
				</>
			) : (
				<>
					<svg
						className="w-6 h-6 mr-3"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
						/>
					</svg>
					ENTER GIVEAWAY
				</>
			)}
		</Button>
	);
}
