import { waitUntil } from "@vercel/functions";
import type { Payment } from "@whop/sdk/resources.js";
import { whopsdk } from "@/lib/whop-sdk";
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest): Promise<Response> {
	// Validate the webhook to ensure it's from Whop
	const requestBodyText = await request.text();
	const headers = Object.fromEntries(request.headers);
	const webhookData = whopsdk.webhooks.unwrap(requestBodyText, { headers });

	// Handle the webhook event
	if (webhookData.type === "payment.succeeded") {
		waitUntil(handlePaymentSucceeded(webhookData.data));
	}

	// Make sure to return a 2xx status code quickly. Otherwise the webhook will be retried.
	return new Response("OK", { status: 200 });
}

async function handlePaymentSucceeded(payment: Payment) {
	// This is a placeholder for a potentially long running operation
	// In a real scenario, you might need to fetch user data, update a database, etc.
	console.log("[PAYMENT SUCCEEDED]", payment);
}

export async function GET(request: NextRequest) {
	try {
	  const headersList = await headers();
	  const { userId } = await whopsdk.verifyUserToken(headersList);
	  
	  if (!userId) {
		 return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	  }
	  
	  return NextResponse.json({ userId });
	} catch (error) {
	  console.error('Auth error:', error);
	  return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
	}
 }