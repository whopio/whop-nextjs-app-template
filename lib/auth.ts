import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { whop } from "./whop";

/**
 * Authentication result from verifying a user
 */
export interface AuthResult {
	userId: string;
	isAuthenticated: true;
}

/**
 * Access check result for company dashboard
 */
export interface AccessResult {
	hasAccess: boolean;
	isAdmin: boolean;
	isOwner: boolean;
	companyId: string;
	userId: string;
}

/**
 * Combined auth context for dashboard pages
 */
export interface DashboardAuthContext {
	userId: string;
	companyId: string;
	isAdmin: boolean;
	isOwner: boolean;
	user: Awaited<ReturnType<typeof whop.users.retrieve>>;
	company: Awaited<ReturnType<typeof whop.companies.retrieve>>;
}

/**
 * Error types for authentication failures
 */
export class AuthError extends Error {
	constructor(
		message: string,
		public code:
			| "UNAUTHENTICATED"
			| "UNAUTHORIZED"
			| "INVALID_TOKEN"
			| "ACCESS_DENIED",
	) {
		super(message);
		this.name = "AuthError";
	}
}

/**
 * Verify that the current request has a valid Whop user token
 */
export async function requireAuth(): Promise<AuthResult> {
	try {
		const headersList = await headers();
		const { userId } = await whop.verifyUserToken(headersList);

		if (!userId) {
			throw new AuthError("No user ID in token", "INVALID_TOKEN");
		}

		return {
			userId,
			isAuthenticated: true,
		};
	} catch (error) {
		if (error instanceof AuthError) {
			throw error;
		}
		throw new AuthError("User authentication failed", "UNAUTHENTICATED");
	}
}

/**
 * Check if the authenticated user has access to a company's dashboard
 */
export async function requireCompanyAccess(
	companyId: string,
): Promise<AccessResult> {
	const { userId } = await requireAuth();

	try {
		const access = await whop.users.checkAccess(companyId, { id: userId });

		const hasAccess = access.has_access === true;
		const accessLevel = access.access_level;
		const isAdmin = accessLevel === "admin";
		const isCustomer = accessLevel === "customer";

		if (!hasAccess || (!isAdmin && !isCustomer)) {
			// no_access or has_access is false
			throw new AuthError(
				"You don't have permission to access this dashboard",
				"ACCESS_DENIED",
			);
		}

		// Only admins (which includes owners) can access the dashboard
		if (!isAdmin) {
			throw new AuthError(
				"You need admin or owner access to this company",
				"ACCESS_DENIED",
			);
		}

		return {
			hasAccess: true,
			isAdmin: true,
			isOwner: isAdmin, // Whop SDK doesn't distinguish owner from admin — both get 'admin' access_level
			companyId,
			userId,
		};
	} catch (error) {
		if (error instanceof AuthError) {
			throw error;
		}
		throw new AuthError("Failed to verify company access", "UNAUTHORIZED");
	}
}

/**
 * Get full dashboard auth context including user and company data
 */
export async function getDashboardAuthContext(
	companyId: string,
): Promise<DashboardAuthContext> {
	const access = await requireCompanyAccess(companyId);

	const [user, company] = await Promise.all([
		whop.users.retrieve(access.userId),
		whop.companies.retrieve(companyId),
	]);

	return {
		userId: access.userId,
		companyId,
		isAdmin: access.isAdmin,
		isOwner: access.isOwner,
		user,
		company,
	};
}

/**
 * Wrapper for handling auth errors in pages
 */
export function handleAuthError(error: unknown): never {
	if (error instanceof AuthError) {
		switch (error.code) {
			case "UNAUTHENTICATED":
			case "INVALID_TOKEN":
				redirect("https://whop.com/login");
			case "UNAUTHORIZED":
			case "ACCESS_DENIED":
				redirect("/access-denied");
			default:
				redirect("/error");
		}
	}
	redirect("/error");
}

/**
 * Safe version of getDashboardAuthContext that returns null instead of throwing
 */
export async function tryGetDashboardAuthContext(
	companyId: string,
): Promise<DashboardAuthContext | null> {
	try {
		return await getDashboardAuthContext(companyId);
	} catch {
		return null;
	}
}

/**
 * Check if user is authenticated without throwing
 */
export async function getOptionalAuth(): Promise<AuthResult | null> {
	try {
		return await requireAuth();
	} catch {
		return null;
	}
}
