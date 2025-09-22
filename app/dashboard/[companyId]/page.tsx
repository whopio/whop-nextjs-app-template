import { whopSdk } from "@/lib/whop-sdk";
import { headers } from "next/headers";

export default async function DashboardPage({
	params,
}: {
	params: Promise<{ companyId: string }>;
}) {
	// The headers contains the user token
	const headersList = await headers();

	// The companyId is a path param
	const { companyId } = await params;

	// The user token is in the headers
	const { userId } = await whopSdk.verifyUserToken(headersList);

	const result = await whopSdk.access.checkIfUserHasAccessToCompany({
		userId,
		companyId,
	});

	const user = await whopSdk.users.getUser({ userId });
	const company = await whopSdk.companies.getCompany({ companyId });

	// Either: 'admin' | 'no_access';
	// 'admin' means the user is an admin of the company, such as an owner or moderator
	// 'no_access' means the user is not an authorized member of the company
	const { accessLevel } = result;

	return (
		<div className="flex justify-center items-center h-screen px-8">
			<h1 className="text-xl">
				Hi <strong>{user.name}</strong>, you{" "}
				<strong>{result.hasAccess ? "have" : "do not have"} access</strong> to
				this company. Your access level to this company is:{" "}
				<strong>{accessLevel}</strong>. <br />
				<br />
				Your user ID is <strong>{userId}</strong> and your username is{" "}
				<strong>@{user.username}</strong>.<br />
				<br />
				You are viewing the company: <strong>{company.title}</strong>
			</h1>
		</div>
	);
}
