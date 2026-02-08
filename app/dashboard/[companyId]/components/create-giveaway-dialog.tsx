"use client";

import { useState, useTransition } from "react";
import { Button, Text, Dialog } from "@whop/react/components";
import { toast } from "sonner";
import {
	createGiveaway,
	type CreateGiveawayInput,
} from "@/lib/actions/giveaway-actions";
import type { CompanyTierInfo } from "@/lib/tiers";

interface CreateGiveawayDialogProps {
	companyId: string;
	tierInfo: CompanyTierInfo;
}

interface FormErrors {
	title?: string;
	prize_title?: string;
	end_date?: string;
	prize_image_url?: string;
}

export function CreateGiveawayDialog({
	companyId,
	tierInfo,
}: CreateGiveawayDialogProps) {
	const isAtLimit =
		tierInfo.limits.maxActiveGiveaways !== Number.MAX_SAFE_INTEGER &&
		tierInfo.activeGiveaways >= tierInfo.limits.maxActiveGiveaways;
	const [open, setOpen] = useState(false);
	const [isPending, startTransition] = useTransition();
	const [errors, setErrors] = useState<FormErrors>({});

	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [prizeTitle, setPrizeTitle] = useState("");
	const [prizeImageUrl, setPrizeImageUrl] = useState("");
	const [endDate, setEndDate] = useState("");

	const resetForm = () => {
		setTitle("");
		setDescription("");
		setPrizeTitle("");
		setPrizeImageUrl("");
		setEndDate("");
		setErrors({});
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		if (!title.trim()) {
			newErrors.title = "Title is required";
		} else if (title.length > 100) {
			newErrors.title = "Title must be less than 100 characters";
		}

		if (!prizeTitle.trim()) {
			newErrors.prize_title = "Prize title is required";
		}

		if (!endDate) {
			newErrors.end_date = "End date is required";
		} else {
			const selectedDate = new Date(endDate);
			const now = new Date();
			if (selectedDate <= now) {
				newErrors.end_date = "End date must be in the future";
			}
		}

		if (prizeImageUrl && !isValidUrl(prizeImageUrl)) {
			newErrors.prize_image_url = "Must be a valid URL";
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const isValidUrl = (string: string): boolean => {
		try {
			new URL(string);
			return true;
		} catch {
			return false;
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (!validateForm()) return;

		startTransition(async () => {
			const input: CreateGiveawayInput = {
				title: title.trim(),
				description: description.trim() || undefined,
				prize_title: prizeTitle.trim(),
				prize_image_url: prizeImageUrl.trim() || undefined,
				end_date: endDate,
			};

			const result = await createGiveaway(companyId, input);

			if (result.success) {
				toast.success("Giveaway created!", {
					description: "Your giveaway is now live.",
				});
				resetForm();
				setOpen(false);
			} else {
				toast.error(result.error || "Failed to create giveaway");
			}
		});
	};

	const minDate = new Date(Date.now() + 60 * 60 * 1000)
		.toISOString()
		.slice(0, 16);

	return (
		<Dialog.Root open={open} onOpenChange={setOpen}>
			<Dialog.Trigger>
				<Button variant="classic" size="3">
					<svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
					</svg>
					Create Giveaway
				</Button>
			</Dialog.Trigger>

			<Dialog.Content style={{ maxWidth: 500 }}>
				<Dialog.Title>
					{isAtLimit ? "Upgrade Required" : "Create New Giveaway"}
				</Dialog.Title>

				{isAtLimit ? (
					<div className="space-y-4">
						<Dialog.Description className="text-gray-10">
							You've reached the limit of{" "}
							{tierInfo.limits.maxActiveGiveaways} active giveaway
							{tierInfo.limits.maxActiveGiveaways === 1 ? "" : "s"}{" "}
							on the {tierInfo.display.label} plan.
						</Dialog.Description>
						<div className="bg-blue-a3 border border-blue-a6 rounded-lg p-4">
							<Text size="2" weight="medium" className="text-blue-11">
								Upgrade to{" "}
								{tierInfo.tier === "free"
									? "Pro ($14.99/mo)"
									: "Business ($39.99/mo)"}{" "}
								for{" "}
								{tierInfo.tier === "free"
									? "up to 5 active giveaways"
									: "unlimited giveaways"}
								.
							</Text>
						</div>
						<div className="flex justify-end">
							<Dialog.Close>
								<Button variant="soft">Close</Button>
							</Dialog.Close>
						</div>
					</div>
				) : (
					<>
						<Dialog.Description className="text-gray-10 mb-6">
							Fill in the details below to launch your giveaway.
							{tierInfo.limits.maxEntriesPerGiveaway !==
								Number.MAX_SAFE_INTEGER && (
								<span className="block mt-1 text-gray-9">
									{tierInfo.display.label} plan: up to{" "}
									{tierInfo.limits.maxEntriesPerGiveaway} entries
									per giveaway
								</span>
							)}
						</Dialog.Description>

						<form onSubmit={handleSubmit} className="space-y-5">
							<div className="space-y-2">
								<label htmlFor="title" className="text-sm font-medium text-gray-12">
									Title <span className="text-red-9">*</span>
								</label>
								<input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Win a MacBook Pro!" className={`w-full px-4 py-2.5 rounded-lg bg-gray-a3 border ${errors.title ? "border-red-9" : "border-gray-a6"} text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-blue-9`} />
								{errors.title && <Text size="1" className="text-red-9">{errors.title}</Text>}
							</div>

							<div className="space-y-2">
								<label htmlFor="description" className="text-sm font-medium text-gray-12">Description</label>
								<textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Tell participants about the giveaway..." rows={3} className="w-full px-4 py-2.5 rounded-lg bg-gray-a3 border border-gray-a6 text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-blue-9 resize-none" />
							</div>

							<div className="space-y-2">
								<label htmlFor="prizeTitle" className="text-sm font-medium text-gray-12">
									Prize Title <span className="text-red-9">*</span>
								</label>
								<input id="prizeTitle" type="text" value={prizeTitle} onChange={(e) => setPrizeTitle(e.target.value)} placeholder="e.g., MacBook Pro 14-inch" className={`w-full px-4 py-2.5 rounded-lg bg-gray-a3 border ${errors.prize_title ? "border-red-9" : "border-gray-a6"} text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-blue-9`} />
								{errors.prize_title && <Text size="1" className="text-red-9">{errors.prize_title}</Text>}
							</div>

							<div className="space-y-2">
								<label htmlFor="prizeImageUrl" className="text-sm font-medium text-gray-12">Prize Image URL</label>
								<input id="prizeImageUrl" type="url" value={prizeImageUrl} onChange={(e) => setPrizeImageUrl(e.target.value)} placeholder="https://example.com/prize.jpg" className={`w-full px-4 py-2.5 rounded-lg bg-gray-a3 border ${errors.prize_image_url ? "border-red-9" : "border-gray-a6"} text-gray-12 placeholder:text-gray-9 focus:outline-none focus:ring-2 focus:ring-blue-9`} />
								{errors.prize_image_url && <Text size="1" className="text-red-9">{errors.prize_image_url}</Text>}
							</div>

							<div className="space-y-2">
								<label htmlFor="endDate" className="text-sm font-medium text-gray-12">
									End Date <span className="text-red-9">*</span>
								</label>
								<input id="endDate" type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={minDate} className={`w-full px-4 py-2.5 rounded-lg bg-gray-a3 border ${errors.end_date ? "border-red-9" : "border-gray-a6"} text-gray-12 focus:outline-none focus:ring-2 focus:ring-blue-9`} />
								{errors.end_date && <Text size="1" className="text-red-9">{errors.end_date}</Text>}
							</div>

							<div className="flex justify-end gap-3 pt-4">
								<Dialog.Close>
									<Button variant="soft" type="button">Cancel</Button>
								</Dialog.Close>
								<Button variant="classic" type="submit" disabled={isPending}>
									{isPending ? "Creating..." : "Create Giveaway"}
								</Button>
							</div>
						</form>
					</>
				)}
			</Dialog.Content>
		</Dialog.Root>
	);
}
