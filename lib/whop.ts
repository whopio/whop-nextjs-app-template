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
 * List all experiences for a company
 */
export async function listCompanyExperiences(companyId: string) {
	try {
		const experiences: { id: string; name: string }[] = [];
		for await (const experience of whop.experiences.list({
			company_id: companyId,
		})) {
			experiences.push({
				id: experience.id,
				name: experience.name ?? experience.id,
			});
		}
		return experiences;
	} catch (error) {
		console.error(
			"[listCompanyExperiences] Failed to list experiences for company:",
			companyId,
			error,
		);
		return [];
	}
}

/**
 * Get the purchase URL for a plan (plan_xxx)
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

/**
 * Get the purchase URL for a product (prod_xxx) by listing its plans and using the first plan's checkout link.
 * Use this when WHOP_PRO_PLAN_ID / WHOP_BUSINESS_PLAN_ID are product IDs.
 */
export async function getPurchaseUrlForProduct(
	productId: string,
	companyId: string,
): Promise<string | null> {
	try {
		const page = await whop.plans.list({
			company_id: companyId,
			product_ids: [productId],
			first: 10,
		});
		const plans = page.data ?? [];
		const planWithUrl = plans.find((p) => p.purchase_url);
		if (planWithUrl?.purchase_url) {
			return planWithUrl.purchase_url;
		}
		console.warn(
			"[getPurchaseUrlForProduct] No plan with purchase_url for product:",
			productId,
		);
		return null;
	} catch (error) {
		console.error(
			"[getPurchaseUrlForProduct] Failed to list plans for product:",
			productId,
			error,
		);
		return null;
	}
}
