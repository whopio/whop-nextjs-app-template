"use client";

import { type WebsocketStatus, WhopWebsocketClient } from "@whop/api";
import { useEffect, useState } from "react";

export function SectionConnectToTheWebsocketClient({
	experienceId,
}: {
	experienceId: string;
}) {
	const [message, setMessage] = useState("");
	const [isTrusted, setIsTrusted] = useState(false);
	const [senderUserId, setSenderUserId] = useState<string | undefined>(
		undefined,
	);
	const [status, setStatus] = useState<WebsocketStatus>("disconnected");

	useEffect(() => {
		const ws = new WhopWebsocketClient({
			onMessage: (message) => {
				const obj = message.appMessage;
				if (!obj) return;
				setMessage(obj.json);
				setIsTrusted(obj.isTrusted);
				setSenderUserId(obj.fromUserId);
			},
			onStatusChange: (status) => {
				setStatus(status);
			},
		});

		return ws.connect();
	}, []);

	return (
		<div>
			<div>Status: {status}</div>
			<div>
				Latest Message: <pre>{message}</pre>
				<br />
				Is Trusted: {isTrusted ? "Yes" : "No"}
				<br />
				Sender User ID: {senderUserId}
			</div>
		</div>
	);
}
