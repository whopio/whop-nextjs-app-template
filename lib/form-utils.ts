import type { ActionType, WinnerSelectionMethod } from "./types/database";

/**
 * Entry action configuration for the form
 */
export interface EntryActionConfig {
	enabled: boolean;
	entries: number;
	config: {
		discord_invite_url?: string;
		twitter_handle?: string;
		instagram_handle?: string;
		youtube_channel_url?: string;
		tiktok_handle?: string;
		whop_product_id?: string;
		website_url?: string;
		video_url?: string;
		custom_label?: string;
		custom_url?: string;
	};
}

/**
 * Form data for creating a giveaway
 */
export interface GiveawayFormData {
	// Step 1: Basic Information
	title: string;
	description: string;
	prize_title: string;
	prize_description: string;
	prize_value: string;
	prize_image_url: string;
	start_date: string;
	end_date: string;
	whop_product_id: string;

	// Step 2: Entry Actions
	entry_actions: {
		join_discord: EntryActionConfig;
		follow_twitter: EntryActionConfig;
		follow_instagram: EntryActionConfig;
		subscribe_youtube: EntryActionConfig;
		follow_tiktok: EntryActionConfig;
		subscribe_product: EntryActionConfig;
		visit_website: EntryActionConfig;
		watch_video: EntryActionConfig;
	};

	// Step 3: Referral Settings
	bonus_entries_per_referral: number;
	enable_fraud_detection: boolean;
	max_entries_per_user: number | null;
	require_email_verification: boolean;

	// Step 4: Winner Selection
	winner_selection_method: WinnerSelectionMethod;
	winner_count: number;
	milestone_target: number | null;
}

/**
 * Default form values
 */
export const defaultFormData: GiveawayFormData = {
	title: "",
	description: "",
	prize_title: "",
	prize_description: "",
	prize_value: "",
	prize_image_url: "",
	start_date: "",
	end_date: "",
	whop_product_id: "",

	entry_actions: {
		join_discord: { enabled: false, entries: 1, config: {} },
		follow_twitter: { enabled: false, entries: 1, config: {} },
		follow_instagram: { enabled: false, entries: 1, config: {} },
		subscribe_youtube: { enabled: false, entries: 1, config: {} },
		follow_tiktok: { enabled: false, entries: 1, config: {} },
		subscribe_product: { enabled: false, entries: 1, config: {} },
		visit_website: { enabled: false, entries: 1, config: {} },
		watch_video: { enabled: false, entries: 1, config: {} },
	},

	bonus_entries_per_referral: 5,
	enable_fraud_detection: true,
	max_entries_per_user: null,
	require_email_verification: false,

	winner_selection_method: "random_weighted",
	winner_count: 1,
	milestone_target: null,
};

/**
 * Form validation errors
 */
export interface FormErrors {
	[key: string]: string | undefined;
}

/**
 * Validate Step 1: Basic Information
 */
export function validateStep1(data: GiveawayFormData): FormErrors {
	const errors: FormErrors = {};

	if (!data.title.trim()) {
		errors.title = "Title is required";
	} else if (data.title.length > 100) {
		errors.title = "Title must be 100 characters or less";
	}

	if (!data.prize_title.trim()) {
		errors.prize_title = "Prize title is required";
	}

	if (!data.start_date) {
		errors.start_date = "Start date is required";
	}

	if (!data.end_date) {
		errors.end_date = "End date is required";
	}

	if (data.start_date && data.end_date) {
		const start = new Date(data.start_date);
		const end = new Date(data.end_date);
		const now = new Date();

		if (start < now) {
			errors.start_date = "Start date must be in the future";
		}

		if (end <= start) {
			errors.end_date = "End date must be after start date";
		}
	}

	return errors;
}

/**
 * Validate Step 2: Entry Actions
 */
export function validateStep2(data: GiveawayFormData): FormErrors {
	const errors: FormErrors = {};
	const actions = data.entry_actions;

	if (
		actions.join_discord.enabled &&
		!actions.join_discord.config.discord_invite_url
	) {
		errors.discord_invite_url = "Discord invite link is required";
	}

	if (
		actions.follow_twitter.enabled &&
		!actions.follow_twitter.config.twitter_handle
	) {
		errors.twitter_handle = "Twitter handle is required";
	}

	if (
		actions.follow_instagram.enabled &&
		!actions.follow_instagram.config.instagram_handle
	) {
		errors.instagram_handle = "Instagram handle is required";
	}

	if (
		actions.subscribe_youtube.enabled &&
		!actions.subscribe_youtube.config.youtube_channel_url
	) {
		errors.youtube_channel_url = "YouTube channel URL is required";
	}

	if (
		actions.follow_tiktok.enabled &&
		!actions.follow_tiktok.config.tiktok_handle
	) {
		errors.tiktok_handle = "TikTok handle is required";
	}

	if (
		actions.subscribe_product.enabled &&
		!actions.subscribe_product.config.whop_product_id
	) {
		errors.whop_product_id_action = "Whop product is required";
	}

	if (
		actions.visit_website.enabled &&
		!actions.visit_website.config.website_url
	) {
		errors.website_url = "Website URL is required";
	}

	if (actions.watch_video.enabled && !actions.watch_video.config.video_url) {
		errors.video_url = "Video URL is required";
	}

	return errors;
}

/**
 * Validate Step 3: Referral Settings
 */
export function validateStep3(data: GiveawayFormData): FormErrors {
	const errors: FormErrors = {};

	if (
		data.bonus_entries_per_referral < 1 ||
		data.bonus_entries_per_referral > 50
	) {
		errors.bonus_entries_per_referral = "Must be between 1 and 50";
	}

	if (data.max_entries_per_user !== null && data.max_entries_per_user < 1) {
		errors.max_entries_per_user = "Must be at least 1";
	}

	return errors;
}

/**
 * Validate Step 4: Winner Selection
 */
export function validateStep4(data: GiveawayFormData): FormErrors {
	const errors: FormErrors = {};

	if (data.winner_count < 1) {
		errors.winner_count = "Must have at least 1 winner";
	}

	if (
		data.winner_selection_method === "milestone" &&
		!data.milestone_target
	) {
		errors.milestone_target = "Milestone target is required";
	}

	return errors;
}

/**
 * Validate all steps
 */
export function validateForm(data: GiveawayFormData): FormErrors {
	return {
		...validateStep1(data),
		...validateStep2(data),
		...validateStep3(data),
		...validateStep4(data),
	};
}

/**
 * Check if a step is valid
 */
export function isStepValid(step: number, data: GiveawayFormData): boolean {
	switch (step) {
		case 1:
			return Object.keys(validateStep1(data)).length === 0;
		case 2:
			return Object.keys(validateStep2(data)).length === 0;
		case 3:
			return Object.keys(validateStep3(data)).length === 0;
		case 4:
			return Object.keys(validateStep4(data)).length === 0;
		case 5:
			return Object.keys(validateForm(data)).length === 0;
		default:
			return false;
	}
}

/**
 * Convert form data to database format
 */
export function formDataToGiveaway(data: GiveawayFormData, companyId: string) {
	const entryActions = Object.entries(data.entry_actions)
		.filter(([_, config]) => config.enabled)
		.map(([type, config]) => ({
			type: type.replace(/_/g, "_") as ActionType,
			required: false,
			bonus_entries: config.entries,
			config: config.config,
		}));

	return {
		company_id: companyId,
		title: data.title,
		description: data.description || null,
		prize_details: {
			title: data.prize_title,
			description: data.prize_description || undefined,
			value: data.prize_value ? Number.parseFloat(data.prize_value) : undefined,
			image_url: data.prize_image_url || undefined,
		},
		start_date: data.start_date,
		end_date: data.end_date,
		whop_product_id: data.whop_product_id || null,
		entry_actions: entryActions,
		bonus_entries_per_referral: data.bonus_entries_per_referral,
		max_entries_per_user: data.max_entries_per_user,
		winner_selection_method: data.winner_selection_method,
		winner_count: data.winner_count,
		status: "draft" as "draft" | "active" | "ended",
	};
}
