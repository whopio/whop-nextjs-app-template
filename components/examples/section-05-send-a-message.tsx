import { verifyUserToken, whopApi } from "@/lib/whop-api";
import { headers } from "next/headers";

export async function SectionSendAMessage({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	async function sendChatMessage(formData: FormData) {
		"use server";
		const chatExperienceId = "exp_svE6Mi5TAy3u4S";
		const message = formData.get("message");
		const requestHeaders = await headers();
		const userToken = await verifyUserToken(requestHeaders);

		if (!userToken) {
			throw new Error("User token is required");
		}

		const user = await whopApi.PublicUser({ userId: userToken.userId });

		if (!message || typeof message !== "string") {
			throw new Error("Chat message is required");
		}

		await whopApi.SendChatMessage({
			experienceId: chatExperienceId,
			message: `${user.publicUser.name ?? user.publicUser.username} just sent a message via the example app: '${message}'. Check it out here: https://whop.com/whop-devs/next-js-app-template-9Pk0xcYN09zkKU/app/`,
		});
	}

	async function sendDmMessage(formData: FormData) {
		"use server";
		const message = formData.get("message");
		const requestHeaders = await headers();
		const userToken = await verifyUserToken(requestHeaders);

		if (!userToken) {
			throw new Error("User token is required");
		}

		if (!message || typeof message !== "string") {
			throw new Error("Chat message is required");
		}

		await whopApi.SendDmMessage({
			toUserId: userToken.userId,
			message: `Hi, you just sent a message via the example app: '${message}'.`,
		});
	}

	return (
		<div>
			<form action={sendChatMessage} className="flex gap-2 items-center">
				<input
					className="w-full"
					type="text"
					name="message"
					placeholder="Message"
				/>
				<button className="shrink-0" type="submit">
					Send Chat Message
				</button>
			</form>
			<form action={sendDmMessage} className="flex gap-2 items-center">
				<input
					className="w-full"
					type="text"
					name="message"
					placeholder="Message"
				/>
				<button className="shrink-0" type="submit">
					Send DM Message
				</button>
			</form>
		</div>
	);
}

function notEmpty<T>(value: T | null | undefined): value is T {
	return value !== null && value !== undefined;
}
