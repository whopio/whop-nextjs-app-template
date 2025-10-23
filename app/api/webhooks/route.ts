import { waitUntil } from "@vercel/functions";
import type { Invoice } from "@whop/sdk/resources.js";
import type { NextRequest } from "next/server";
import { whopsdk } from "@/lib/whop-sdk";

export async function POST(request: NextRequest): Promise<Response> {
	// Validate the webhook to ensure it's from Whop
	const requestBodyText = await request.text();
	const headers = Object.fromEntries(request.headers);
	const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

	// Handle the webhook event
	if (webhookData.type === "invoice.paid") {
		waitUntil(handleInvoicePaid(webhookData.data));
	}

	if (webhookData.type === "invoice.created") {
		waitUntil(handleInvoiceCreated(webhookData.data));
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
}

async function handleInvoicePaid(invoice: Invoice) {
	// This is a placeholder for a potentially long running operation
	// In a real scenario, you might need to fetch user data, update a database, etc.
	console.log("[INVOICE PAID]", invoice);
}

async function handleInvoiceCreated(invoice: Invoice) {
	// This is a placeholder for a potentially long running operation
	// In a real scenario, you might need to fetch user data, update a database, etc.
	console.log("[INVOICE CREATED]", invoice);
}
