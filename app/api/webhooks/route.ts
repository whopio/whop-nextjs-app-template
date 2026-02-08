import { waitUntil } from "@vercel/functions";
import type { Payment, Membership } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whop } from "@/lib/whop";
import {
	getTierFromPlanOrProductId,
	upsertCompanySubscription,
	deactivateCompanySubscription,
} from "@/lib/tiers";

export async function POST(request: NextRequest): Promise<Response> {
	const requestBodyText = await request.text();
	const headers = Object.fromEntries(request.headers);
	const webhookData = whop.webhooks.unwrap(requestBodyText, { headers });

	if (webhookData.type === "payment.succeeded") {
		waitUntil(handlePaymentSucceeded(webhookData.data));
	}

	if (webhookData.type === "membership.activated") {
		waitUntil(handleMembershipActivated(webhookData.data));
	}

	if (webhookData.type === "membership.deactivated") {
		waitUntil(handleMembershipDeactivated(webhookData.data));
	}

	return new Response("OK", { status: 200 });
}

async function handlePaymentSucceeded(payment: Payment) {
	console.log("[PAYMENT SUCCEEDED]", payment);
}

async function handleMembershipActivated(membership: Membership) {
	console.log("[MEMBERSHIP ACTIVATED]", membership);

	const planId = membership.plan?.id;
	const productId = membership.product?.id;
	const companyId = membership.company?.id;

	console.log("[SUBSCRIPTION] IDs extracted:", { planId, productId, companyId });

	if (!companyId) {
		console.log("[SUBSCRIPTION] No company ID found, skipping");
		return;
	}

	const tier = getTierFromPlanOrProductId(planId, productId);

	console.log(`[SUBSCRIPTION] Tier mapped: plan=${planId} product=${productId} → ${tier}`);

	if (!tier) {
		console.log("[SUBSCRIPTION] No matching tier for these IDs, skipping");
		return;
	}

	await upsertCompanySubscription({
		companyId,
		tier,
		planId: planId ?? productId ?? "unknown",
		membershipId: membership.id,
		userId: membership.user?.id ?? null,
	});

	console.log(`[SUBSCRIPTION] ${companyId} upgraded to ${tier}`);
}

async function handleMembershipDeactivated(membership: Membership) {
	console.log("[MEMBERSHIP DEACTIVATED]", membership);

	const planId = membership.plan?.id;
	const productId = membership.product?.id;

	console.log("[SUBSCRIPTION] Deactivation IDs:", { planId, productId });

	const tier = getTierFromPlanOrProductId(planId, productId);
	if (!tier) {
		console.log("[SUBSCRIPTION] Not our pricing plan, skipping deactivation");
		return;
	}

	await deactivateCompanySubscription(membership.id);

	console.log(`[SUBSCRIPTION] membership ${membership.id} deactivated, downgraded to free`);
}
