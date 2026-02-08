import { waitUntil } from "@vercel/functions";
import type { Payment, Membership } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whop } from "@/lib/whop";
import {
	getTierFromPlanId,
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
	const companyId = membership.company?.id;
	if (!planId || !companyId) return;

	const tier = getTierFromPlanId(planId);
	if (!tier) return;

	await upsertCompanySubscription({
		companyId,
		tier,
		planId,
		membershipId: membership.id,
		userId: membership.user?.id ?? null,
	});

	console.log(`[SUBSCRIPTION] ${companyId} upgraded to ${tier}`);
}

async function handleMembershipDeactivated(membership: Membership) {
	console.log("[MEMBERSHIP DEACTIVATED]", membership);

	const planId = membership.plan?.id;
	if (!planId) return;

	const tier = getTierFromPlanId(planId);
	if (!tier) return;

	await deactivateCompanySubscription(membership.id);

	console.log(`[SUBSCRIPTION] membership ${membership.id} deactivated, downgraded to free`);
}
