"use client";

import { useCallback } from "react";
import { useIframeSdk } from "@whop/react";

interface UpgradeButtonProps {
	upgradeUrl: string;
	label: string;
}

export function UpgradeButton({ upgradeUrl, label }: UpgradeButtonProps) {
	const iframeSdk = useIframeSdk();

	const handleClick = useCallback(() => {
		if (iframeSdk?.openExternalUrl) {
			iframeSdk.openExternalUrl({ url: upgradeUrl });
			return;
		}

		window.open(upgradeUrl, "_blank", "noopener,noreferrer");
	}, [iframeSdk, upgradeUrl]);

	return (
		<button
			type="button"
			onClick={handleClick}
			className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-blue-9 text-white text-sm font-semibold hover:bg-blue-10 transition-colors shadow-sm shrink-0"
		>
			{label}
		</button>
	);
}
