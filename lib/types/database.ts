/**
 * Database types for Giveaway Master
 * Auto-generated from Supabase schema
 */

// ============================================================================
// ENUMS
// ============================================================================

export type GiveawayStatus = "draft" | "active" | "ended";

export type WinnerSelectionMethod = "random_weighted" | "manual" | "milestone";

export type ActionType =
	| "follow_twitter"
	| "join_discord"
	| "subscribe_youtube"
	| "follow_instagram"
	| "follow_tiktok"
	| "subscribe_product"
	| "join_email_list"
	| "refer_friend"
	| "custom";

// ============================================================================
// JSON TYPES
// ============================================================================

export interface PrizeDetails {
	title: string;
	description?: string;
	value?: number;
	currency?: string;
	image_url?: string;
	quantity?: number;
}

export interface EntryAction {
	type: ActionType;
	required: boolean;
	bonus_entries?: number;
	config?: {
		// Twitter
		twitter_username?: string;
		tweet_id?: string;
		// Discord
		discord_invite_url?: string;
		discord_server_id?: string;
		// YouTube
		youtube_channel_id?: string;
		// Instagram
		instagram_username?: string;
		// TikTok
		tiktok_username?: string;
		// Whop Product
		whop_product_id?: string;
		// Custom
		custom_label?: string;
		custom_url?: string;
		custom_verification?: "none" | "click" | "manual";
	};
}

export interface EntryMetadata {
	source?: string;
	utm_source?: string;
	utm_medium?: string;
	utm_campaign?: string;
	browser?: string;
	device?: string;
	country?: string;
	[key: string]: unknown;
}

export interface VerificationData {
	verified_by?: "auto" | "manual" | "api";
	verified_at?: string;
	proof?: string;
	external_id?: string;
	[key: string]: unknown;
}

export interface ClaimDetails {
	method?: "email" | "discord" | "whop" | "manual";
	shipping_address?: {
		name: string;
		address_line1: string;
		address_line2?: string;
		city: string;
		state?: string;
		postal_code: string;
		country: string;
	};
	contact_info?: string;
	notes?: string;
	[key: string]: unknown;
}

// ============================================================================
// TABLE TYPES
// ============================================================================

export interface Giveaway {
	id: string;
	company_id: string;
	experience_id: string | null;
	whop_product_id: string | null;

	// Basic info
	title: string;
	description: string | null;
	prize_details: PrizeDetails;

	// Timing
	start_date: string;
	end_date: string;
	status: GiveawayStatus;

	// Entry configuration
	entry_actions: EntryAction[];
	bonus_entries_per_referral: number;
	max_entries_per_user: number | null;
	allow_duplicate_prevention: boolean;

	// Winner selection
	winner_selection_method: WinnerSelectionMethod;
	winner_count: number;

	// Timestamps
	created_at: string;
	updated_at: string;
}

export interface Entry {
	id: string;
	giveaway_id: string;

	// User identification
	user_id: string;
	email: string | null;
	whop_membership_id: string | null;

	// Entry tracking
	entry_count: number;

	// Referral system
	referral_code: string;
	referred_by: string | null;
	referral_count: number;

	// Additional data
	metadata: EntryMetadata;
	ip_address: string | null;
	user_agent: string | null;

	// Timestamps
	created_at: string;
}

export interface ActionCompleted {
	id: string;
	entry_id: string;

	action_type: ActionType;
	action_config: Record<string, unknown>;

	verified: boolean;
	verification_data: VerificationData;

	completed_at: string;
}

export interface Winner {
	id: string;
	giveaway_id: string;
	entry_id: string;

	// Winner status
	position: number;
	selected_at: string;

	// Notification & claiming
	notified: boolean;
	notified_at: string | null;
	notification_method: string | null;

	prize_claimed: boolean;
	claimed_at: string | null;
	claim_details: ClaimDetails;

	// Notes
	notes: string | null;
}

// ============================================================================
// INSERT TYPES (for creating new records)
// ============================================================================

export interface GiveawayInsert {
	company_id: string;
	experience_id?: string | null;
	whop_product_id?: string | null;
	title: string;
	description?: string | null;
	prize_details?: PrizeDetails;
	start_date: string;
	end_date: string;
	status?: GiveawayStatus;
	entry_actions?: EntryAction[];
	bonus_entries_per_referral?: number;
	max_entries_per_user?: number | null;
	allow_duplicate_prevention?: boolean;
	winner_selection_method?: WinnerSelectionMethod;
	winner_count?: number;
}

export interface EntryInsert {
	giveaway_id: string;
	user_id: string;
	email?: string | null;
	whop_membership_id?: string | null;
	referral_code: string;
	referred_by?: string | null;
	metadata?: EntryMetadata;
	ip_address?: string | null;
	user_agent?: string | null;
}

export interface ActionCompletedInsert {
	entry_id: string;
	action_type: ActionType;
	action_config?: Record<string, unknown>;
	verified?: boolean;
	verification_data?: VerificationData;
}

export interface WinnerInsert {
	giveaway_id: string;
	entry_id: string;
	position?: number;
	notified?: boolean;
	notification_method?: string | null;
	notes?: string | null;
}

// ============================================================================
// UPDATE TYPES (for updating records)
// ============================================================================

export interface GiveawayUpdate {
	whop_product_id?: string | null;
	title?: string;
	description?: string | null;
	prize_details?: PrizeDetails;
	start_date?: string;
	end_date?: string;
	status?: GiveawayStatus;
	entry_actions?: EntryAction[];
	bonus_entries_per_referral?: number;
	max_entries_per_user?: number | null;
	allow_duplicate_prevention?: boolean;
	winner_selection_method?: WinnerSelectionMethod;
	winner_count?: number;
}

export interface EntryUpdate {
	email?: string | null;
	entry_count?: number;
	metadata?: EntryMetadata;
}

export interface ActionCompletedUpdate {
	verified?: boolean;
	verification_data?: VerificationData;
}

export interface WinnerUpdate {
	notified?: boolean;
	notified_at?: string | null;
	notification_method?: string | null;
	prize_claimed?: boolean;
	claimed_at?: string | null;
	claim_details?: ClaimDetails;
	notes?: string | null;
}

// ============================================================================
// JOINED TYPES (with relations)
// ============================================================================

export interface EntryWithActions extends Entry {
	actions_completed: ActionCompleted[];
}

export interface EntryWithGiveaway extends Entry {
	giveaway: Giveaway;
}

export interface GiveawayWithEntries extends Giveaway {
	entries: Entry[];
	entry_count: number;
}

export interface GiveawayWithWinners extends Giveaway {
	winners: (Winner & { entry: Entry })[];
}

export interface WinnerWithDetails extends Winner {
	entry: Entry;
	giveaway: Giveaway;
}

