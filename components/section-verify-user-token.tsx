import { verifyUserToken } from "@/lib/whop-api";
import { headers } from "next/headers";

export async function SectionVerifyUserToken() {
	const requestHeaders = await headers();
	const userTokenData = await verifyUserToken(requestHeaders);

	if (!userTokenData) {
		return <div className="text-red-500">Invalid or missing user token</div>;
	}

	return (
		<div>
			Validated user id is: <code>{userTokenData?.userId}</code>
		</div>
	);
}
