import { Whop } from "@whop/sdk";

/**
 * Whop SDK instance - single source of truth for Whop Marketplace App auth and API
 */
export const whop = new Whop({
	appID: process.env.NEXT_PUBLIC_WHOP_APP_ID,
	apiKey: process.env.WHOP_API_KEY,
	webhookKey: btoa(process.env.WHOP_WEBHOOK_SECRET || ""),
});

/**
 * Verify user token from request headers (x-whop-user-token)
 */
export async function verifyUserToken(headers: Headers) {
	return whop.verifyUserToken(headers);
}

/**
 * Validate and parse a webhook request from Whop
 */
export function validateWebhook(
	requestBodyText: string,
	headers: Record<string, string>,
) {
	return whop.webhooks.unwrap(requestBodyText, { headers });
}

/**
 * Get company information by ID
 */
export async function getCompany(companyId: string) {
	return whop.companies.retrieve(companyId);
}

/**
 * Get user information by ID
 */
export async function getUser(userId: string) {
	return whop.users.retrieve(userId);
}

/**
 * Check if a user has access to a company's resources
 */
export async function checkUserAccess(companyId: string, userId: string) {
	return whop.users.checkAccess(companyId, { id: userId });
}

/**
 * Get experience information by ID
 */
export async function getExperience(experienceId: string) {
	return whop.experiences.retrieve(experienceId);
}

/**
 * Get the purchase URL for a plan
 */
export async function getPlanPurchaseUrl(planId: string) {
	try {
		const plan = await whop.plans.retrieve(planId);
		if (!plan?.purchase_url) {
			console.warn("[getPlanPurchaseUrl] Missing purchase_url for plan:", planId);
			return null;
		}
		return plan.purchase_url;
	} catch (error) {
		console.error("[getPlanPurchaseUrl] Failed to retrieve plan:", planId, error);
		return null;
	}
}
