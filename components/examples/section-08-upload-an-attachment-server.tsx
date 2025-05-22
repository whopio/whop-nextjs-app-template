"use client";

import type { AttachableRecords, AttachmentFragment } from "@whop/api";
import { useState } from "react";

export function SectionUploadAnAttachmentServer() {
	const [sourceUrl, setSourceUrl] = useState<string>();
	return (
		<>
			<button
				type="button"
				onClick={async () => {
					const res = await fetch("/api/upload-attachment", {
						method: "POST",
					});
					const data = (await res.json()) as {
						id: string;
						record: AttachableRecords;
						attachment: AttachmentFragment;
					};

					setSourceUrl(data.attachment.source.url);
				}}
			>
				Mock upload
			</button>
			{sourceUrl ? <img src={sourceUrl} alt="Mock uploaded file" /> : null}
		</>
	);
}
