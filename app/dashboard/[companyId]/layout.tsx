import { Suspense } from "react";
import { getDashboardAuthContext, handleAuthError } from "@/lib/auth";
import { DashboardNav } from "./components/dashboard-nav";
import { DashboardLoading } from "./components/dashboard-loading";

interface DashboardLayoutProps {
	children: React.ReactNode;
	params: Promise<{ companyId: string }>;
}

export default async function DashboardLayout({
	children,
	params,
}: DashboardLayoutProps) {
	const { companyId } = await params;

	let authContext;
	try {
		authContext = await getDashboardAuthContext(companyId);
	} catch (error) {
		console.error("[Dashboard Layout] Auth error for company:", companyId, error);
		handleAuthError(error);
	}

	const { user, company, isOwner } = authContext;
	const displayName = user.name || `@${user.username}`;

	return (
		<div className="min-h-screen bg-gray-a1 flex flex-col">
			{/* Dashboard Header */}
			<header className="border-b border-gray-a4 bg-gray-a2 px-6 py-3 flex-shrink-0">
				<div className="flex items-center justify-between gap-4">
					<div className="flex items-center gap-4 min-w-0">
						<h1 className="text-5 font-bold text-gray-12 shrink-0">
							Giveaway Master
						</h1>
						<span className="text-2 text-gray-8 shrink-0">|</span>
						<span className="text-3 text-gray-10 truncate">
							{company.title}
						</span>
					</div>
					<div className="flex items-center gap-4 shrink-0">
						<div className="text-right">
							<p className="text-3 text-gray-12 truncate max-w-[200px]">{displayName}</p>
							<p className="text-2 text-gray-10">
								{isOwner ? "Owner" : "Admin"}
							</p>
						</div>
					</div>
				</div>
			</header>

			{/* Dashboard Navigation */}
			<DashboardNav companyId={companyId} />

			{/* Main Content */}
			<main className="flex-1 p-6">
				<Suspense fallback={<DashboardLoading />}>{children}</Suspense>
			</main>
		</div>
	);
}
