import { verifyUserToken, whopApi } from "@/lib/whop-api";
import { headers } from "next/headers";
import { SectionConnectToTheWebsocketClient } from "./section-08-connect-to-the-websocket.client";

export async function SectionConnectToTheWebsocket({
	params,
}: {
	params: Promise<{ experienceId: string }>;
}) {
	const { experienceId } = await params;
	const { userId } = await verifyUserToken(await headers(), {
		dontThrow: false,
	});

	const hasAccess = await whopApi.CheckIfUserHasAccessToExperience({
		experienceId,
		userId,
	});

	if (!hasAccess) {
		return <div>You do not have access to this experience</div>;
	}

	async function sendMessage(formData: FormData) {
		"use server";

		const message = formData.get("message");

		await whopApi.SendWebsocketMessage({
			message: message as string,
			target: { experience: experienceId },
		});
	}

	return (
		<div>
			<form action={sendMessage}>
				<input type="text" name="message" />
				<button type="submit">Send Websocket Message From Server</button>
			</form>
			<SectionConnectToTheWebsocketClient experienceId={experienceId} />
		</div>
	);
}
